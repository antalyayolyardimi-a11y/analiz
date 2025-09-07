import { Signal } from './SignalProcessor';

// 📊 Sinyal Performans Metrikleri
export interface SignalPerformance {
    signalId: string;
    symbol: string;
    strategy: string;
    openPrice: number;
    currentPrice: number;
    highPrice: number;
    lowPrice: number;
    pnlPercent: number;
    pnlUSD: number;
    duration: number; // dakika
    hitTargets: ('TP1' | 'TP2' | 'TP3' | 'SL')[];
    status: 'RUNNING' | 'COMPLETED' | 'STOPPED';
    confidence: number;
    aiScore: number;
    timestamp: Date;
}

// 🎯 Strateji Performans İstatistikleri
export interface StrategyStats {
    strategy: string;
    totalSignals: number;
    winRate: number;
    avgPnL: number;
    avgDuration: number;
    bestTrade: number;
    worstTrade: number;
    totalPnL: number;
    sharpeRatio: number;
    maxDrawdown: number;
    accuracy: number;
}

// 🧠 AI Öğrenme Modeli
export interface LearningModel {
    strategy: string;
    weights: {
        rsiWeight: number;
        adxWeight: number;
        volumeWeight: number;
        volatilityWeight: number;
        momentumWeight: number;
    };
    successRate: number;
    adaptationCount: number;
    lastUpdate: Date;
}

export class SignalTracker {
    private activeTracking: Map<string, SignalPerformance> = new Map();
    private completedSignals: SignalPerformance[] = [];
    private learningModels: Map<string, LearningModel> = new Map();
    private priceUpdateInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeLearningModels();
        this.startPriceTracking();
    }

    /**
     * 🚀 Yeni Sinyal Takibini Başlat
     */
    startTracking(signal: Signal): void {
        const performance: SignalPerformance = {
            signalId: signal.id,
            symbol: signal.symbol,
            strategy: signal.strategy,
            openPrice: signal.price,
            currentPrice: signal.price,
            highPrice: signal.price,
            lowPrice: signal.price,
            pnlPercent: 0,
            pnlUSD: 0,
            duration: 0,
            hitTargets: [],
            status: 'RUNNING',
            confidence: signal.confidence,
            aiScore: signal.aiScore,
            timestamp: new Date()
        };

        this.activeTracking.set(signal.id, performance);
        console.log(`🎯 Sinyal takibi başlatıldı: ${signal.symbol} (${signal.type})`);
    }

    /**
     * 📈 Fiyat Güncellemesi
     */
    updatePrice(symbol: string, price: number): void {
        for (const [signalId, performance] of this.activeTracking) {
            if (performance.symbol === symbol) {
                const oldPrice = performance.currentPrice;
                performance.currentPrice = price;
                
                // High/Low güncelle
                if (price > performance.highPrice) {
                    performance.highPrice = price;
                }
                if (price < performance.lowPrice) {
                    performance.lowPrice = price;
                }

                // PnL hesapla
                const pnlPercent = ((price - performance.openPrice) / performance.openPrice) * 100;
                performance.pnlPercent = pnlPercent;
                performance.pnlUSD = pnlPercent; // Portfolio size'a göre hesaplanabilir

                // Duration güncelle
                performance.duration = Math.floor((Date.now() - performance.timestamp.getTime()) / 1000 / 60);

                // Target kontrolü (bu kısım genişletilecek)
                this.checkTargets(signalId, performance);

                this.activeTracking.set(signalId, performance);
            }
        }
    }

    /**
     * 🎯 Target Kontrolü ve Otomatik Kapanış
     */
    private checkTargets(signalId: string, performance: SignalPerformance): void {
        // Bu kısımda gerçek bir sinyalin target'larını kontrol etmek için
        // signal verisine erişmemiz gerekir
        // Şimdilik basit bir PnL kontrolü yapalım

        const pnl = performance.pnlPercent;

        // TP1 kontrolü (%2 kar)
        if (pnl >= 2 && !performance.hitTargets.includes('TP1')) {
            performance.hitTargets.push('TP1');
            console.log(`🎯 ${performance.symbol} TP1 vurdu! (+${pnl.toFixed(2)}%)`);
        }

        // TP2 kontrolü (%4 kar)
        if (pnl >= 4 && !performance.hitTargets.includes('TP2')) {
            performance.hitTargets.push('TP2');
            console.log(`🎯 ${performance.symbol} TP2 vurdu! (+${pnl.toFixed(2)}%)`);
        }

        // TP3 kontrolü (%6 kar)
        if (pnl >= 6 && !performance.hitTargets.includes('TP3')) {
            performance.hitTargets.push('TP3');
            console.log(`🎯 ${performance.symbol} TP3 vurdu! (+${pnl.toFixed(2)}%)`);
            this.closePosition(signalId, 'COMPLETED');
        }

        // SL kontrolü (%-2 zarar)
        if (pnl <= -2 && !performance.hitTargets.includes('SL')) {
            performance.hitTargets.push('SL');
            console.log(`🛑 ${performance.symbol} Stop Loss vurdu! (${pnl.toFixed(2)}%)`);
            this.closePosition(signalId, 'STOPPED');
        }

        // Zaman aşımı kontrolü (4 saat)
        if (performance.duration > 240) {
            console.log(`⏰ ${performance.symbol} zaman aşımı! (${performance.duration} dakika)`);
            this.closePosition(signalId, 'COMPLETED');
        }
    }

    /**
     * 🔚 Pozisyonu Kapat ve Öğren
     */
    private closePosition(signalId: string, status: 'COMPLETED' | 'STOPPED'): void {
        const performance = this.activeTracking.get(signalId);
        if (!performance) return;

        performance.status = status;
        
        // Aktif takipten çıkar
        this.activeTracking.delete(signalId);
        
        // Tamamlanan sinyaller listesine ekle
        this.completedSignals.push(performance);

        // AI modeline öğret
        this.learnFromSignal(performance);

        console.log(`✅ ${performance.symbol} pozisyonu kapatıldı: ${performance.pnlPercent.toFixed(2)}%`);
    }

    /**
     * 🧠 Sinyalden Öğren ve Modeli Güncelle
     */
    private learnFromSignal(performance: SignalPerformance): void {
        const model = this.learningModels.get(performance.strategy);
        if (!model) return;

        // Başarı oranını güncelle
        const isSuccess = performance.pnlPercent > 0;
        const totalCount = model.adaptationCount;
        const currentSuccessRate = model.successRate;
        
        // Yeni başarı oranını hesapla (exponential moving average)
        const alpha = 0.1; // Öğrenme oranı
        model.successRate = currentSuccessRate * (1 - alpha) + (isSuccess ? 1 : 0) * alpha;
        model.adaptationCount++;

        // Ağırlıkları güncelle (performansa göre)
        if (isSuccess) {
            // Başarılı sinyal - ağırlıkları artır
            model.weights.rsiWeight *= 1.05;
            model.weights.adxWeight *= 1.03;
            model.weights.volumeWeight *= 1.07;
            model.weights.volatilityWeight *= 1.02;
            model.weights.momentumWeight *= 1.04;
        } else {
            // Başarısız sinyal - ağırlıkları azalt
            model.weights.rsiWeight *= 0.95;
            model.weights.adxWeight *= 0.97;
            model.weights.volumeWeight *= 0.93;
            model.weights.volatilityWeight *= 0.98;
            model.weights.momentumWeight *= 0.96;
        }

        // Ağırlıkları normalize et
        this.normalizeWeights(model.weights);
        model.lastUpdate = new Date();

        this.learningModels.set(performance.strategy, model);

        console.log(`🧠 AI Modeli güncellendi: ${performance.strategy} (Başarı: ${(model.successRate * 100).toFixed(1)}%)`);
    }

    /**
     * ⚖️ Ağırlıkları Normalize Et
     */
    private normalizeWeights(weights: LearningModel['weights']): void {
        const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
        const factor = 5 / total; // Toplam ağırlık 5 olsun

        weights.rsiWeight *= factor;
        weights.adxWeight *= factor;
        weights.volumeWeight *= factor;
        weights.volatilityWeight *= factor;
        weights.momentumWeight *= factor;
    }

    /**
     * 🔄 Learning Model'leri Başlat
     */
    private initializeLearningModels(): void {
        const strategies = ['BREAKOUT', 'REVERSAL', 'TREND', 'MOMENTUM'];
        
        strategies.forEach(strategy => {
            const model: LearningModel = {
                strategy,
                weights: {
                    rsiWeight: 1.0,
                    adxWeight: 1.0,
                    volumeWeight: 1.0,
                    volatilityWeight: 1.0,
                    momentumWeight: 1.0
                },
                successRate: 0.5, // Başlangıç %50
                adaptationCount: 0,
                lastUpdate: new Date()
            };
            
            this.learningModels.set(strategy, model);
        });

        console.log('🧠 AI Learning Models başlatıldı');
    }

    /**
     * 📊 Fiyat Takibi Başlat
     */
    private startPriceTracking(): void {
        // Bu gerçek implementasyonda KuCoin WebSocket'ten gelecek
        // Şimdilik mock veri ile simule edelim
        this.priceUpdateInterval = setInterval(() => {
            // Mock price updates - gerçek uygulamada WebSocket kullanılacak
            this.simulatePriceUpdates();
        }, 5000); // 5 saniyede bir

        console.log('📈 Fiyat takibi başlatıldı');
    }

    /**
     * 💹 Price Update Simülasyonu
     */
    private simulatePriceUpdates(): void {
        for (const performance of this.activeTracking.values()) {
            // %±0.1 ile %±0.5 arası rastgele fiyat değişimi
            const changePercent = (Math.random() - 0.5) * 1.0; // %±0.5
            const newPrice = performance.currentPrice * (1 + changePercent / 100);
            
            this.updatePrice(performance.symbol, newPrice);
        }
    }

    /**
     * 📊 Strateji İstatistiklerini Getir
     */
    getStrategyStats(): StrategyStats[] {
        const strategyMap = new Map<string, SignalPerformance[]>();
        
        // Tamamlanan sinyalleri stratejiye göre grupla
        this.completedSignals.forEach(signal => {
            if (!strategyMap.has(signal.strategy)) {
                strategyMap.set(signal.strategy, []);
            }
            strategyMap.get(signal.strategy)!.push(signal);
        });

        const stats: StrategyStats[] = [];

        strategyMap.forEach((signals, strategy) => {
            const totalSignals = signals.length;
            const winningSignals = signals.filter(s => s.pnlPercent > 0);
            const winRate = (winningSignals.length / totalSignals) * 100;
            
            const pnls = signals.map(s => s.pnlPercent);
            const avgPnL = pnls.reduce((sum, pnl) => sum + pnl, 0) / totalSignals;
            const totalPnL = pnls.reduce((sum, pnl) => sum + pnl, 0);
            
            const durations = signals.map(s => s.duration);
            const avgDuration = durations.reduce((sum, d) => sum + d, 0) / totalSignals;
            
            const bestTrade = Math.max(...pnls);
            const worstTrade = Math.min(...pnls);
            
            // Sharpe Ratio ve Max Drawdown hesaplamaları
            const sharpeRatio = this.calculateSharpeRatio(pnls);
            const maxDrawdown = this.calculateMaxDrawdown(pnls);

            stats.push({
                strategy,
                totalSignals,
                winRate,
                avgPnL,
                avgDuration,
                bestTrade,
                worstTrade,
                totalPnL,
                sharpeRatio,
                maxDrawdown,
                accuracy: winRate
            });
        });

        return stats;
    }

    /**
     * 📈 Sharpe Ratio Hesapla
     */
    private calculateSharpeRatio(pnls: number[]): number {
        if (pnls.length === 0) return 0;
        
        const mean = pnls.reduce((sum, pnl) => sum + pnl, 0) / pnls.length;
        const variance = pnls.reduce((sum, pnl) => sum + Math.pow(pnl - mean, 2), 0) / pnls.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev === 0 ? 0 : mean / stdDev;
    }

    /**
     * 📉 Max Drawdown Hesapla
     */
    private calculateMaxDrawdown(pnls: number[]): number {
        if (pnls.length === 0) return 0;

        let peak = 0;
        let maxDrawdown = 0;
        let cumulative = 0;

        pnls.forEach(pnl => {
            cumulative += pnl;
            if (cumulative > peak) {
                peak = cumulative;
            }
            const drawdown = peak - cumulative;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        });

        return maxDrawdown;
    }

    /**
     * 📊 Dashboard Verilerini Getir
     */
    getDashboardData() {
        const activeCount = this.activeTracking.size;
        const completedCount = this.completedSignals.length;
        const totalPnL = this.completedSignals.reduce((sum, s) => sum + s.pnlPercent, 0);
        const avgPnL = completedCount > 0 ? totalPnL / completedCount : 0;
        
        const winningTrades = this.completedSignals.filter(s => s.pnlPercent > 0).length;
        const winRate = completedCount > 0 ? (winningTrades / completedCount) * 100 : 0;

        return {
            activeSignals: activeCount,
            completedSignals: completedCount,
            totalPnL: totalPnL.toFixed(2),
            avgPnL: avgPnL.toFixed(2),
            winRate: winRate.toFixed(1),
            activeTracking: Array.from(this.activeTracking.values()),
            recentCompletedSignals: this.completedSignals.slice(-10),
            learningModels: Array.from(this.learningModels.values())
        };
    }

    /**
     * 🎯 Aktif Takipleri Getir
     */
    getActiveTracking(): SignalPerformance[] {
        return Array.from(this.activeTracking.values());
    }

    /**
     * 🧠 Learning Model Getir
     */
    getLearningModel(strategy: string): LearningModel | undefined {
        return this.learningModels.get(strategy);
    }

    /**
     * 🔚 Tracker'ı Durdur
     */
    stop(): void {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }
        console.log('🛑 Signal Tracker durduruldu');
    }
}
