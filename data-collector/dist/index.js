"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KuCoinDataCollector = void 0;
const axios_1 = __importDefault(require("axios"));
const ws_1 = __importDefault(require("ws"));
const node_cron_1 = __importDefault(require("node-cron"));
const winston_1 = require("winston");
// Logger konfigürasyonu
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json()),
    transports: [
        new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.transports.File({ filename: 'logs/combined.log' }),
        new winston_1.transports.Console({ format: winston_1.format.simple() })
    ]
});
class KuCoinDataCollector {
    constructor() {
        this.baseUrl = 'https://api.kucoin.com';
        this.wsUrl = 'wss://ws-api.kucoin.com/endpoint';
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.initializeWebSocket();
        this.startPeriodicCollection();
    }
    /**
     * Market verilerini topla (50M$ üzeri market cap)
     */
    async getMarketData() {
        try {
            logger.info('🔄 KuCoin market verilerini çekiliyor...');
            const response = await axios_1.default.get(`${this.baseUrl}/api/v1/market/allTickers`);
            if (response.data.code !== '200000') {
                throw new Error(`KuCoin API Error: ${response.data.msg}`);
            }
            const tickers = response.data.data.ticker;
            logger.info(`📊 Toplam ${tickers.length} ticker verisi alındı`);
            // 50M$ üzeri volume filtreleme (USDT çiftleri)
            const filteredTickers = tickers
                .filter((ticker) => {
                const isUSDTPair = ticker.symbol.endsWith('-USDT');
                const volume24h = parseFloat(ticker.volValue || '0');
                const hasValidData = ticker.last && ticker.vol && ticker.changeRate;
                return isUSDTPair && volume24h >= 50000000 && hasValidData;
            })
                .map((ticker) => ({
                symbol: ticker.symbol,
                price: parseFloat(ticker.last),
                priceChange: parseFloat(ticker.change || '0'),
                priceChangePercent: parseFloat(ticker.changeRate || '0') * 100,
                volume: parseFloat(ticker.vol || '0'),
                high: parseFloat(ticker.high || ticker.last),
                low: parseFloat(ticker.low || ticker.last),
                marketCap: parseFloat(ticker.volValue || '0') // 24h volume as proxy
            }))
                .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)) // En yüksek volume'dan başla
                .slice(0, 50); // İlk 50'yi al
            logger.info(`✅ ${filteredTickers.length} yüksek hacimli coin filtrelendi`);
            // İlk 5'i logla
            filteredTickers.slice(0, 5).forEach((ticker, index) => {
                logger.info(`${index + 1}. ${ticker.symbol}: $${ticker.price.toFixed(4)} (${ticker.priceChangePercent.toFixed(2)}%) Vol: $${(ticker.marketCap / 1000000).toFixed(1)}M`);
            });
            return filteredTickers;
        }
        catch (error) {
            logger.error('❌ Market verileri alınırken hata:', error);
            throw error;
        }
    }
    /**
     * OHLCV verilerini topla (KuCoin gerçek API)
     */
    async getKlineData(symbol, interval = '15min', limit = 200) {
        try {
            logger.info(`📈 ${symbol} ${interval} OHLCV verileri çekiliyor... (${limit} mum)`);
            // KuCoin interval formatına çevir
            const kucoinInterval = this.convertToKuCoinInterval(interval);
            // Son X periyodun başlangıç ve bitiş zamanlarını hesapla
            const endTime = Math.floor(Date.now() / 1000);
            const intervalSeconds = this.getIntervalSeconds(interval);
            const startTime = endTime - (limit * intervalSeconds);
            const response = await axios_1.default.get(`${this.baseUrl}/api/v1/market/candles`, {
                params: {
                    symbol: symbol,
                    type: kucoinInterval,
                    startAt: startTime,
                    endAt: endTime
                }
            });
            if (response.data.code !== '200000') {
                throw new Error(`KuCoin API Error: ${response.data.msg}`);
            }
            const rawKlines = response.data.data;
            if (!rawKlines || rawKlines.length === 0) {
                logger.warn(`⚠️ ${symbol} için veri bulunamadı`);
                return [];
            }
            // KuCoin API format: [time, open, close, high, low, volume, turnover]
            const klines = rawKlines
                .map((kline) => {
                const timestamp = parseInt(kline[0]) * 1000; // milisaniye
                return {
                    symbol,
                    openTime: timestamp,
                    closeTime: timestamp + (intervalSeconds * 1000),
                    open: parseFloat(kline[1]),
                    close: parseFloat(kline[2]),
                    high: parseFloat(kline[3]),
                    low: parseFloat(kline[4]),
                    volume: parseFloat(kline[5]),
                    quoteVolume: parseFloat(kline[6]),
                    turnover: parseFloat(kline[6]),
                    interval: interval
                };
            })
                .sort((a, b) => a.openTime - b.openTime); // Zaman sırasına göre
            const firstCandle = new Date(klines[0].openTime).toISOString();
            const lastCandle = new Date(klines[klines.length - 1].openTime).toISOString();
            const priceChange = ((klines[klines.length - 1].close - klines[0].open) / klines[0].open * 100);
            logger.info(`✅ ${symbol} ${interval}: ${klines.length} mum | ${firstCandle} -> ${lastCandle} | Değişim: ${priceChange.toFixed(2)}%`);
            return klines;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                logger.error(`❌ ${symbol} OHLCV API hatası:`, {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }
            else {
                logger.error(`❌ ${symbol} OHLCV işlem hatası:`, error);
            }
            throw error;
        }
    }
    /**
     * Interval'ı KuCoin formatına çevir
     */
    convertToKuCoinInterval(interval) {
        const intervalMap = {
            '15min': '15min',
            '1hour': '1hour',
            '4hour': '4hour',
            '1day': '1day'
        };
        return intervalMap[interval] || '15min';
    }
    /**
     * WebSocket bağlantısı başlat (KuCoin gerçek API)
     */
    async initializeWebSocket() {
        try {
            logger.info('🔗 KuCoin WebSocket bağlantısı kuruluyor...');
            // KuCoin WebSocket token al
            const tokenResponse = await axios_1.default.post(`${this.baseUrl}/api/v1/bullet-public`);
            if (tokenResponse.data.code !== '200000') {
                throw new Error(`Token alma hatası: ${tokenResponse.data.msg}`);
            }
            const { token, instanceServers } = tokenResponse.data.data;
            if (!instanceServers || instanceServers.length === 0) {
                throw new Error('WebSocket sunucu bilgisi alınamadı');
            }
            // En iyi ping'e sahip sunucuyu seç
            const server = instanceServers.sort((a, b) => a.pingInterval - b.pingInterval)[0];
            const wsEndpoint = `${server.endpoint}?token=${token}&[connectId=${Date.now()}]`;
            logger.info(`🌐 WebSocket sunucusuna bağlanılıyor: ${server.endpoint}`);
            this.ws = new ws_1.default(wsEndpoint);
            this.ws.on('open', () => {
                logger.info('✅ WebSocket bağlantısı kuruldu');
                this.reconnectAttempts = 0;
                // Ping-pong mekanizması
                setInterval(() => {
                    if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
                        this.ws.ping();
                    }
                }, server.pingInterval || 18000);
                this.subscribeToTickerUpdates();
                this.subscribeToTradeUpdates();
            });
            this.ws.on('message', (data) => {
                this.handleWebSocketMessage(data.toString());
            });
            this.ws.on('close', (code, reason) => {
                logger.warn(`🔴 WebSocket bağlantısı kapandı - Kod: ${code}, Sebep: ${reason.toString()}`);
                this.reconnectWebSocket();
            });
            this.ws.on('error', (error) => {
                logger.error('❌ WebSocket hatası:', error);
                this.reconnectWebSocket();
            });
            this.ws.on('pong', () => {
                // Ping-pong başarılı
            });
        }
        catch (error) {
            logger.error('❌ WebSocket başlatılırken hata:', error);
            setTimeout(() => this.initializeWebSocket(), 5000);
        }
    }
    /**
     * Ticker güncellemelerine abone ol
     */
    subscribeToTickerUpdates() {
        const subscribeMessage = {
            id: Date.now(),
            type: 'subscribe',
            topic: '/market/ticker:all',
            response: true
        };
        this.ws?.send(JSON.stringify(subscribeMessage));
        logger.info('📊 Tüm ticker güncellemelerine abone olundu');
    }
    /**
     * Trade güncellemelerine abone ol (büyük hacimli işlemler için)
     */
    subscribeToTradeUpdates() {
        // Büyük coinler için trade stream'leri
        const majorPairs = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'SOL-USDT'];
        majorPairs.forEach(pair => {
            const subscribeMessage = {
                id: Date.now() + Math.random(),
                type: 'subscribe',
                topic: `/market/match:${pair}`,
                response: true
            };
            this.ws?.send(JSON.stringify(subscribeMessage));
        });
        logger.info(`📈 ${majorPairs.length} major coin trade güncellemelerine abone olundu`);
    }
    /**
     * WebSocket mesajlarını işle (Gerçek KuCoin verileri)
     */
    handleWebSocketMessage(message) {
        try {
            const data = JSON.parse(message);
            // Ping mesajlarını yanıtla
            if (data.type === 'ping') {
                const pongMessage = {
                    id: data.id,
                    type: 'pong'
                };
                this.ws?.send(JSON.stringify(pongMessage));
                return;
            }
            // Welcome mesajı
            if (data.type === 'welcome') {
                logger.info('🎉 KuCoin WebSocket welcome mesajı alındı');
                return;
            }
            // Ack mesajları (subscription confirmations)
            if (data.type === 'ack') {
                logger.info(`✅ Subscription onaylandı: ${data.id}`);
                return;
            }
            // Ticker data
            if (data.type === 'message' && data.topic?.includes('/market/ticker:')) {
                this.processTickerUpdate(data.data);
            }
            // Trade data (büyük işlemler için)
            if (data.type === 'message' && data.topic?.includes('/market/match:')) {
                this.processTradeUpdate(data.data);
            }
        }
        catch (error) {
            logger.error('❌ WebSocket mesajı işlenirken hata:', error);
        }
    }
    /**
     * Ticker güncellemesini işle (Fiyat hareketleri analizi)
     */
    processTickerUpdate(tickerData) {
        if (!tickerData || !tickerData.symbol)
            return;
        const symbol = tickerData.symbol;
        const changeRate = parseFloat(tickerData.changeRate || '0');
        const changePercent = changeRate * 100;
        const price = parseFloat(tickerData.price || '0');
        const volume = parseFloat(tickerData.volValue || '0');
        // Büyük fiyat hareketlerini yakala (≥3% değişim)
        if (Math.abs(changePercent) >= 3.0) {
            const alertType = changePercent > 0 ? '🚀 PUMP' : '🔻 DUMP';
            const volumeInfo = volume > 10000000 ? ` | Hacim: $${(volume / 1000000).toFixed(1)}M` : '';
            logger.info(`${alertType} DETECTED: ${symbol} ${changePercent.toFixed(2)}% -> $${price}${volumeInfo}`);
            // Pump/Dump sebebini analiz et
            this.analyzePumpDumpReason(symbol, changePercent, volume, price);
        }
        // Yüksek hacimli hareketler (>50M$ ve >5% değişim)
        if (volume > 50000000 && Math.abs(changePercent) >= 5.0) {
            logger.info(`🔥 HIGH VOLUME MOVEMENT: ${symbol} | ${changePercent.toFixed(2)}% | $${(volume / 1000000).toFixed(1)}M volume`);
        }
    }
    /**
     * Trade güncellemesini işle (Büyük alım-satımlar)
     */
    processTradeUpdate(tradeData) {
        if (!tradeData)
            return;
        const symbol = tradeData.symbol;
        const price = parseFloat(tradeData.price || '0');
        const size = parseFloat(tradeData.size || '0');
        const side = tradeData.side; // buy/sell
        const tradeValue = price * size;
        // Büyük işlemleri yakala (>100K$ değer)
        if (tradeValue > 100000) {
            const sideEmoji = side === 'buy' ? '🟢' : '🔴';
            logger.info(`${sideEmoji} BIG TRADE: ${symbol} | ${side.toUpperCase()} | $${tradeValue.toLocaleString()} | ${size} @ $${price}`);
        }
    }
    /**
     * Pump/Dump sebebini analiz et
     */
    async analyzePumpDumpReason(symbol, changePercent, volume, currentPrice) {
        try {
            // Son 1 saatlik verileri al
            const recentData = await this.getKlineData(symbol, '15min', 4); // 4x15min = 1 saat
            if (recentData.length < 2)
                return;
            const reasons = [];
            // Volume analizi
            const avgVolume = recentData.reduce((sum, candle) => sum + candle.volume, 0) / recentData.length;
            const currentVolumeRatio = (volume / 1000000) / (avgVolume / 1000000);
            if (currentVolumeRatio > 2) {
                reasons.push(`🔥 Hacim patlaması (${currentVolumeRatio.toFixed(1)}x normal)`);
            }
            // Direnç/Destek kırılımı analizi
            const highs = recentData.map(d => d.high);
            const lows = recentData.map(d => d.low);
            const maxHigh = Math.max(...highs);
            const minLow = Math.min(...lows);
            if (changePercent > 0 && currentPrice > maxHigh * 1.02) {
                reasons.push(`📈 Direnç kırılımı ($${maxHigh.toFixed(4)} seviyesi)`);
            }
            if (changePercent < 0 && currentPrice < minLow * 0.98) {
                reasons.push(`📉 Destek kırılımı ($${minLow.toFixed(4)} seviyesi)`);
            }
            // Momentum analizi
            const priceChange15m = ((recentData[recentData.length - 1].close - recentData[recentData.length - 2].close) / recentData[recentData.length - 2].close) * 100;
            if (Math.abs(priceChange15m) > 2) {
                reasons.push(`⚡ Güçlü momentum (15m: ${priceChange15m.toFixed(1)}%)`);
            }
            // Sonucu logla
            if (reasons.length > 0) {
                const alertType = changePercent > 0 ? 'PUMP' : 'DUMP';
                logger.info(`🎯 ${symbol} ${alertType} SEBEPLERİ: ${reasons.join(' | ')}`);
            }
        }
        catch (error) {
            logger.error(`${symbol} pump/dump analiz hatası:`, error);
        }
    }
    /**
     * WebSocket yeniden bağlan
     */
    reconnectWebSocket() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
            logger.info(`WebSocket yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts} - ${delay}ms sonra`);
            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        }
        else {
            logger.error('WebSocket maksimum yeniden bağlanma denemesi aşıldı');
        }
    }
    /**
     * Periyodik veri toplama başlat (Her 5 dakikada gerçek KuCoin verileri)
     */
    startPeriodicCollection() {
        logger.info('⏱️ Periyodik veri toplama sistemi başlatılıyor...');
        // Her 5 dakikada bir çalış (cron: dakika saat gün ay haftanıngünü)
        node_cron_1.default.schedule('*/5 * * * *', async () => {
            try {
                const startTime = Date.now();
                logger.info('🔄 === PERİYODİK VERİ TOPLAMA BAŞLADI ===');
                // 1. Market verilerini topla
                const marketData = await this.getMarketData();
                if (marketData.length === 0) {
                    logger.warn('⚠️ Market verisi bulunamadı, döngü atlanıyor');
                    return;
                }
                // 2. En yüksek hacimli 30 coin'i seç (50M$ üzeri)
                const topCoins = marketData
                    .filter(coin => (coin.marketCap || 0) >= 50000000) // 50M$ minimum
                    .slice(0, 30); // İlk 30 coin
                logger.info(`🎯 Analiz için seçilen coinler: ${topCoins.length} adet`);
                // 3. Her coin için OHLCV verilerini topla
                let successCount = 0;
                let errorCount = 0;
                for (const [index, coin] of topCoins.entries()) {
                    try {
                        logger.info(`📊 [${index + 1}/${topCoins.length}] ${coin.symbol} analiz ediliyor...`);
                        // 15 dakikalık veriler (ana analiz için)
                        const data15m = await this.getKlineData(coin.symbol, '15min', 100);
                        // 1 saatlik veriler (trend onayı için)  
                        const data1h = await this.getKlineData(coin.symbol, '1hour', 50);
                        // 4 saatlik veriler (büyük trend için)
                        const data4h = await this.getKlineData(coin.symbol, '4hour', 25);
                        // Veri kalitesi kontrolü
                        if (data15m.length >= 50 && data1h.length >= 20) {
                            successCount++;
                            // Burada signal processor'a veri gönderebiliriz
                            // await this.processSignalAnalysis(coin.symbol, { data15m, data1h, data4h });
                            logger.info(`✅ ${coin.symbol}: 15m(${data15m.length}) 1h(${data1h.length}) 4h(${data4h.length}) mum verisi toplandı`);
                        }
                        else {
                            logger.warn(`⚠️ ${coin.symbol}: Yetersiz veri - 15m(${data15m.length}) 1h(${data1h.length})`);
                        }
                        // Rate limit koruması (KuCoin: 20 req/sec)
                        await this.sleep(100); // 100ms bekle
                    }
                    catch (error) {
                        errorCount++;
                        logger.error(`❌ ${coin.symbol} veri toplama hatası:`, error);
                        // Ağır hatalar için biraz daha bekle
                        await this.sleep(500);
                    }
                }
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                const successRate = ((successCount / topCoins.length) * 100).toFixed(1);
                logger.info(`✨ === VERİ TOPLAMA TAMAMLANDI ===`);
                logger.info(`📈 Başarılı: ${successCount}/${topCoins.length} (${successRate}%)`);
                logger.info(`❌ Hatalı: ${errorCount}`);
                logger.info(`⏱️ Süre: ${duration} saniye`);
                // Performans istatistikleri
                if (successRate < '80') {
                    logger.warn('⚠️ Düşük başarı oranı! API limitlerini kontrol et');
                }
            }
            catch (error) {
                logger.error('❌ Periyodik veri toplama genel hatası:', error);
            }
        });
        // İlk çalıştırma için 30 saniye bekle (uygulama başlangıcında)
        setTimeout(async () => {
            try {
                logger.info('🚀 İlk veri toplama başlatılıyor...');
                const marketData = await this.getMarketData();
                logger.info(`📊 Sistem hazır - ${marketData.length} coin takip ediliyor`);
            }
            catch (error) {
                logger.error('❌ İlk veri toplama hatası:', error);
            }
        }, 30000);
        logger.info('📅 Periyodik veri toplama zamanlandı (her 5 dakika - */5 * * * *)');
    }
    /**
     * Sleep utility fonksiyonu
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * İnterval saniyelerini al
     */
    getIntervalSeconds(interval) {
        const intervalMap = {
            '15min': 15 * 60,
            '1hour': 60 * 60,
            '4hour': 4 * 60 * 60,
            '1day': 24 * 60 * 60
        };
        return intervalMap[interval] || 900;
    }
    /**
     * Bağlantıları kapat
     */
    close() {
        if (this.ws) {
            this.ws.close();
            logger.info('WebSocket bağlantısı kapatıldı');
        }
    }
}
exports.KuCoinDataCollector = KuCoinDataCollector;
// Export için
exports.default = KuCoinDataCollector;
//# sourceMappingURL=index.js.map