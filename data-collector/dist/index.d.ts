export interface KlineData {
    symbol: string;
    openTime: number;
    closeTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    quoteVolume: number;
    turnover: number;
    interval: string;
}
export interface MarketData {
    symbol: string;
    price: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
    high: number;
    low: number;
    marketCap?: number;
}
export declare class KuCoinDataCollector {
    private readonly baseUrl;
    private readonly wsUrl;
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor();
    /**
     * Market verilerini topla (50M$ üzeri market cap)
     */
    getMarketData(): Promise<MarketData[]>;
    /**
     * OHLCV verilerini topla (KuCoin gerçek API)
     */
    getKlineData(symbol: string, interval?: '15min' | '1hour' | '4hour' | '1day', limit?: number): Promise<KlineData[]>;
    /**
     * Interval'ı KuCoin formatına çevir
     */
    private convertToKuCoinInterval;
    /**
     * WebSocket bağlantısı başlat (KuCoin gerçek API)
     */
    private initializeWebSocket;
    /**
     * Ticker güncellemelerine abone ol
     */
    private subscribeToTickerUpdates;
    /**
     * Trade güncellemelerine abone ol (büyük hacimli işlemler için)
     */
    private subscribeToTradeUpdates;
    /**
     * WebSocket mesajlarını işle (Gerçek KuCoin verileri)
     */
    private handleWebSocketMessage;
    /**
     * Ticker güncellemesini işle (Fiyat hareketleri analizi)
     */
    private processTickerUpdate;
    /**
     * Trade güncellemesini işle (Büyük alım-satımlar)
     */
    private processTradeUpdate;
    /**
     * Pump/Dump sebebini analiz et
     */
    private analyzePumpDumpReason;
    /**
     * WebSocket yeniden bağlan
     */
    private reconnectWebSocket;
    /**
     * Periyodik veri toplama başlat (Her 5 dakikada gerçek KuCoin verileri)
     */
    private startPeriodicCollection;
    /**
     * Sleep utility fonksiyonu
     */
    private sleep;
    /**
     * İnterval saniyelerini al
     */
    private getIntervalSeconds;
    /**
     * Bağlantıları kapat
     */
    close(): void;
}
export default KuCoinDataCollector;
//# sourceMappingURL=index.d.ts.map