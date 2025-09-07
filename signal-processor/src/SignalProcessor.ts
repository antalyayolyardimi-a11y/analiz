import { TechnicalAnalyzer } from './TechnicalAnalyzer';

// 🎯 Gelişmiş Sinyal Tipi
export interface Signal {
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT' | 'HOLD';
    side: 'BUY' | 'SELL';
    confidence: number; // 0-100
    price: number;
    timestamp: Date;
    strategy: 'BREAKOUT' | 'REVERSAL' | 'TREND' | 'MOMENTUM' | 'SCALP';
    timeframe: '15m' | '1h' | '4h' | '1d';
    
    // 🎯 TP/SL Hedefleri
    targets: {
        takeProfit1: number;
        takeProfit2: number;
        takeProfit3: number;
        stopLoss: number;
    };
    
    riskReward: number;
    expectedDuration: number; // dakika cinsinden
    
    // 📊 Teknik İndikatörler
    indicators: {
        rsi: number;
        adx: number;
        aroon: number;
        bbBand: 'UPPER' | 'LOWER' | 'MIDDLE';
        macd: number;
        volume: number;
        volatility: number;
    };
    
    // 💰 Market Verileri
    volume24h: number;
    marketCap?: number;
    priceChange24h: number;
    
    // 🤖 AI Skorları
    aiScore: number;
    marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    
    // 📈 Performance Tracking
    status: 'ACTIVE' | 'COMPLETED' | 'STOPPED' | 'EXPIRED';
    pnl?: number;
    hitTargets?: ('TP1' | 'TP2' | 'TP3' | 'SL')[];
}

// 🧠 Strateji Tanımları
interface TradingStrategy {
    name: string;
    conditions: {
        rsiMin?: number;
        rsiMax?: number;
        adxMin?: number;
        volumeMultiplier?: number;
        priceChangeMin?: number;
        volatilityMax?: number;
    };
    tpSlRatio: number;
    confidence: number;
}

export class SignalProcessor {
    private analyzer: TechnicalAnalyzer;
    private activeSignals: Map<string, Signal> = new Map();
    
    // 🎯 Trading Stratejileri
    private strategies: TradingStrategy[] = [
        {
            name: 'BREAKOUT',
            conditions: {
                rsiMin: 60,
                rsiMax: 80,
                adxMin: 25,
                volumeMultiplier: 1.5,
                priceChangeMin: 3
            },
            tpSlRatio: 2.5,
            confidence: 75
        },
        {
            name: 'REVERSAL', 
            conditions: {
                rsiMin: 70,
                adxMin: 30,
                volatilityMax: 0.05
            },
            tpSlRatio: 3.0,
            confidence: 80
        },
        {
            name: 'TREND',
            conditions: {
                rsiMin: 45,
                rsiMax: 70,
                adxMin: 20,
                priceChangeMin: 1
            },
            tpSlRatio: 2.0,
            confidence: 70
        },
        {
            name: 'MOMENTUM',
            conditions: {
                rsiMin: 55,
                rsiMax: 75,
                volumeMultiplier: 2.0,
                priceChangeMin: 2
            },
            tpSlRatio: 2.2,
            confidence: 72
        }
    ];

    constructor() {
        this.analyzer = new TechnicalAnalyzer();
    }

    /**
     * 🔍 Market Verilerini Analiz Et ve Sinyal Üret
     */
    async processMarketData(marketData: any[]): Promise<Signal[]> {
        const signals: Signal[] = [];
        
        // BTC ve ETH'yi sabit tut, diğer coinleri analiz et
        const priorityCoins = ['BTC-USDT', 'ETH-USDT'];
        const analysisCoins = marketData.filter(coin => 
            coin.vol > 50000000 && // 50M$ üzeri hacim
            parseFloat(coin.changeRate) !== 0 &&
            !coin.symbol.includes('3S') && // Leveraged tokenları hariç tut
            !coin.symbol.includes('3L')
        );

        console.log(`🔍 ${analysisCoins.length} coin analiz ediliyor...`);

        for (const coin of analysisCoins) {
            try {
                const signal = await this.generateSignal(coin);
                if (signal) {
                    signals.push(signal);
                }
            } catch (error) {
                console.error(`❌ ${coin.symbol} analiz hatası:`, error.message);
            }
        }

        // Sinyalleri confidence'a göre sırala
        signals.sort((a, b) => b.confidence - a.confidence);
        
        console.log(`📊 ${signals.length} sinyal üretildi`);
        return signals.slice(0, 10); // En iyi 10 sinyal
    }

    /**
     * 🎯 Tek Coin için Sinyal Üret
     */
    private async generateSignal(coinData: any): Promise<Signal | null> {
        const symbol = coinData.symbol;
        const price = parseFloat(coinData.last);
        const volume24h = parseFloat(coinData.vol);
        const priceChange24h = parseFloat(coinData.changeRate) * 100;

        // Teknik analiz yap
        const analysis = await this.analyzer.analyzeSymbol(symbol);
        if (!analysis) return null;

        // Strateji belirle
        const strategy = this.determineStrategy(analysis, coinData);
        if (!strategy) return null;

        // Sinyal tipini belirle
        const signalType = this.determineSignalType(analysis, strategy);
        if (signalType === 'HOLD') return null;

        // TP/SL hesapla
        const targets = this.calculateTargets(price, signalType, strategy);
        
        // Risk/Reward hesapla
        const riskReward = this.calculateRiskReward(price, targets);
        if (riskReward < 1.5) return null; // Minimum R/R oranı

        // Confidence hesapla
        const confidence = this.calculateConfidence(analysis, strategy, coinData);
        if (confidence < 65) return null; // Minimum güven skoru

        // AI skorunu hesapla
        const aiScore = this.calculateAIScore(analysis, coinData);

        const signal: Signal = {
            id: `${symbol}_${Date.now()}`,
            symbol,
            type: signalType,
            side: signalType === 'LONG' ? 'BUY' : 'SELL',
            confidence,
            price,
            timestamp: new Date(),
            strategy: strategy.name as any,
            timeframe: '15m',
            targets,
            riskReward,
            expectedDuration: this.calculateExpectedDuration(strategy),
            indicators: {
                rsi: analysis.rsi,
                adx: analysis.adx,
                aroon: analysis.aroon,
                bbBand: analysis.bbPosition,
                macd: analysis.macd,
                volume: analysis.volumeRatio,
                volatility: analysis.volatility
            },
            volume24h,
            priceChange24h,
            aiScore,
            marketSentiment: this.determineMarketSentiment(analysis),
            status: 'ACTIVE'
        };

        // Aktif sinyaller listesine ekle
        this.activeSignals.set(signal.id, signal);
        
        return signal;
    }

    /**
     * 📈 Strateji Belirle
     */
    private determineStrategy(analysis: any, coinData: any): TradingStrategy | null {
        const volume = parseFloat(coinData.vol);
        const avgVolume = parseFloat(coinData.volValue) || volume;
        const volumeMultiplier = volume / avgVolume;
        const priceChange = Math.abs(parseFloat(coinData.changeRate) * 100);

        for (const strategy of this.strategies) {
            const conditions = strategy.conditions;
            let matches = 0;
            let totalConditions = 0;

            // RSI kontrolü
            if (conditions.rsiMin !== undefined && conditions.rsiMax !== undefined) {
                totalConditions++;
                if (analysis.rsi >= conditions.rsiMin && analysis.rsi <= conditions.rsiMax) {
                    matches++;
                }
            }

            // ADX kontrolü
            if (conditions.adxMin !== undefined) {
                totalConditions++;
                if (analysis.adx >= conditions.adxMin) {
                    matches++;
                }
            }

            // Volume kontrolü
            if (conditions.volumeMultiplier !== undefined) {
                totalConditions++;
                if (volumeMultiplier >= conditions.volumeMultiplier) {
                    matches++;
                }
            }

            // Fiyat değişimi kontrolü
            if (conditions.priceChangeMin !== undefined) {
                totalConditions++;
                if (priceChange >= conditions.priceChangeMin) {
                    matches++;
                }
            }

            // Volatilite kontrolü
            if (conditions.volatilityMax !== undefined) {
                totalConditions++;
                if (analysis.volatility <= conditions.volatilityMax) {
                    matches++;
                }
            }

            // Stratejinin %70'i karşılanıyorsa kabul et
            if (matches / totalConditions >= 0.7) {
                return strategy;
            }
        }

        return null;
    }

    /**
     * 🎯 Sinyal Tipini Belirle (LONG/SHORT)
     */
    private determineSignalType(analysis: any, strategy: TradingStrategy): 'LONG' | 'SHORT' | 'HOLD' {
        let longSignals = 0;
        let shortSignals = 0;

        // RSI sinyalleri
        if (analysis.rsi < 30) longSignals += 2;
        else if (analysis.rsi > 70) shortSignals += 2;
        else if (analysis.rsi > 50) longSignals += 1;
        else shortSignals += 1;

        // MACD sinyalleri
        if (analysis.macd > 0) longSignals += 1;
        else shortSignals += 1;

        // Aroon sinyalleri
        if (analysis.aroon > 70) longSignals += 1;
        else if (analysis.aroon < 30) shortSignals += 1;

        // Bollinger Bands sinyalleri
        if (analysis.bbPosition === 'LOWER') longSignals += 1;
        else if (analysis.bbPosition === 'UPPER') shortSignals += 1;

        // Trend sinyalleri (ADX)
        if (analysis.adx > 25) {
            if (longSignals > shortSignals) longSignals += 1;
            else shortSignals += 1;
        }

        // Sonuç
        if (longSignals > shortSignals + 1) return 'LONG';
        else if (shortSignals > longSignals + 1) return 'SHORT';
        else return 'HOLD';
    }

    /**
     * 🎯 TP/SL Hedefleri Hesapla
     */
    private calculateTargets(price: number, signalType: 'LONG' | 'SHORT', strategy: TradingStrategy) {
        const ratio = strategy.tpSlRatio;
        const riskPercent = 0.02; // %2 risk

        if (signalType === 'LONG') {
            const stopLoss = price * (1 - riskPercent);
            const profit = (price - stopLoss) * ratio;
            
            return {
                takeProfit1: price + profit * 0.5,
                takeProfit2: price + profit * 1.0,
                takeProfit3: price + profit * 1.5,
                stopLoss
            };
        } else {
            const stopLoss = price * (1 + riskPercent);
            const profit = (stopLoss - price) * ratio;
            
            return {
                takeProfit1: price - profit * 0.5,
                takeProfit2: price - profit * 1.0, 
                takeProfit3: price - profit * 1.5,
                stopLoss
            };
        }
    }

    /**
     * ⚖️ Risk/Reward Oranını Hesapla
     */
    private calculateRiskReward(price: number, targets: any): number {
        const risk = Math.abs(price - targets.stopLoss);
        const reward = Math.abs(price - targets.takeProfit2);
        return reward / risk;
    }

    /**
     * 🎯 Confidence Skorunu Hesapla
     */
    private calculateConfidence(analysis: any, strategy: TradingStrategy, coinData: any): number {
        let confidence = strategy.confidence;

        // Volume boost
        const volumeUSD = parseFloat(coinData.vol);
        if (volumeUSD > 100000000) confidence += 5; // 100M$ üzeri
        if (volumeUSD > 200000000) confidence += 5; // 200M$ üzeri

        // Volatilite penalty
        if (analysis.volatility > 0.1) confidence -= 10;
        if (analysis.volatility > 0.15) confidence -= 10;

        // Trend gücü boost
        if (analysis.adx > 30) confidence += 5;
        if (analysis.adx > 40) confidence += 5;

        return Math.min(Math.max(confidence, 0), 100);
    }

    /**
     * 🤖 AI Skorunu Hesapla
     */
    private calculateAIScore(analysis: any, coinData: any): number {
        // Bu kısım daha karmaşık ML algoritmaları içerebilir
        // Şimdilik basit bir hesaplama yapalım
        
        let score = 50; // Base score
        
        // Teknik indikatör kombinasyonu
        if (analysis.rsi > 30 && analysis.rsi < 70) score += 10;
        if (analysis.adx > 20) score += 10;
        if (analysis.volumeRatio > 1.5) score += 15;
        
        // Momentum
        if (Math.abs(parseFloat(coinData.changeRate)) > 0.03) score += 10;
        
        // Market cap (eğer varsa)
        const volume = parseFloat(coinData.vol);
        if (volume > 100000000) score += 5;
        
        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * 📊 Market Sentiment Belirle
     */
    private determineMarketSentiment(analysis: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
        let bullishSignals = 0;
        let bearishSignals = 0;

        if (analysis.rsi > 50) bullishSignals++;
        else bearishSignals++;

        if (analysis.macd > 0) bullishSignals++;
        else bearishSignals++;

        if (analysis.aroon > 50) bullishSignals++;
        else bearishSignals++;

        if (bullishSignals > bearishSignals) return 'BULLISH';
        else if (bearishSignals > bullishSignals) return 'BEARISH';
        else return 'NEUTRAL';
    }

    /**
     * ⏱️ Beklenen Süre Hesapla
     */
    private calculateExpectedDuration(strategy: TradingStrategy): number {
        const durations = {
            'BREAKOUT': 60,    // 1 saat
            'REVERSAL': 240,   // 4 saat  
            'TREND': 480,      // 8 saat
            'MOMENTUM': 120,   // 2 saat
            'SCALP': 30        // 30 dakika
        };
        
        return durations[strategy.name as keyof typeof durations] || 120;
    }

    /**
     * 📊 Aktif Sinyalleri Getir
     */
    getActiveSignals(): Signal[] {
        return Array.from(this.activeSignals.values())
            .filter(signal => signal.status === 'ACTIVE');
    }

    /**
     * 🎯 Sinyal Durumunu Güncelle
     */
    updateSignalStatus(signalId: string, status: Signal['status'], pnl?: number) {
        const signal = this.activeSignals.get(signalId);
        if (signal) {
            signal.status = status;
            if (pnl !== undefined) {
                signal.pnl = pnl;
            }
            this.activeSignals.set(signalId, signal);
        }
    }
}
