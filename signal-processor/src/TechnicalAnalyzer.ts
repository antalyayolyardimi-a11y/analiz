import axios from 'axios';

export interface TechnicalAnalysis {
    rsi: number;
    adx: number;
    aroon: number;
    macd: number;
    bbPosition: 'UPPER' | 'LOWER' | 'MIDDLE';
    volumeRatio: number;
    volatility: number;
    trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    strength: number;
}

export class TechnicalAnalyzer {
    private kucoinBaseUrl = 'https://api.kucoin.com';

    /**
     * 📊 Symbol için teknik analiz yap
     */
    async analyzeSymbol(symbol: string): Promise<TechnicalAnalysis | null> {
        try {
            // 15 dakikalık kline verileri al
            const klineData = await this.getKlineData(symbol, '15min', 100);
            if (!klineData || klineData.length < 50) {
                return null;
            }

            const closes = klineData.map(candle => parseFloat(candle[2])); // Close fiyatları
            const highs = klineData.map(candle => parseFloat(candle[3]));   // High fiyatları
            const lows = klineData.map(candle => parseFloat(candle[4]));    // Low fiyatları
            const volumes = klineData.map(candle => parseFloat(candle[5])); // Volume

            const analysis: TechnicalAnalysis = {
                rsi: this.calculateRSI(closes, 14),
                adx: this.calculateADX(highs, lows, closes, 14),
                aroon: this.calculateAroon(highs, lows, 14),
                macd: this.calculateMACD(closes),
                bbPosition: this.getBollingerPosition(closes, 20),
                volumeRatio: this.calculateVolumeRatio(volumes),
                volatility: this.calculateVolatility(closes, 20),
                trend: this.determineTrend(closes),
                strength: this.calculateTrendStrength(closes, highs, lows)
            };

            return analysis;
        } catch (error) {
            console.error(`❌ ${symbol} teknik analiz hatası:`, error.message);
            return null;
        }
    }

    /**
     * 📈 KuCoin'den kline verileri al
     */
    private async getKlineData(symbol: string, type: string, size: number): Promise<any[]> {
        try {
            const response = await axios.get(`${this.kucoinBaseUrl}/api/v1/market/candles`, {
                params: {
                    symbol: symbol,
                    type: type,
                    startAt: Math.floor(Date.now() / 1000) - (size * 15 * 60), // 15 dakika * size
                    endAt: Math.floor(Date.now() / 1000)
                },
                timeout: 5000
            });

            if (response.data && response.data.code === '200000') {
                return response.data.data.reverse(); // Eski tarihten yeniye sırala
            }
            
            return [];
        } catch (error) {
            console.error(`KuCoin kline data hatası (${symbol}):`, error.message);
            return [];
        }
    }

    /**
     * 📊 RSI Hesaplama (Relative Strength Index)
     */
    private calculateRSI(closes: number[], period: number = 14): number {
        if (closes.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        // İlk periyot için ortalama hesapla
        for (let i = 1; i <= period; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Smoothed moving average ile devam et
        for (let i = period + 1; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) {
                avgGain = (avgGain * (period - 1) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) - change) / period;
            }
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * 📊 ADX Hesaplama (Average Directional Index)
     */
    private calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
        if (highs.length < period + 1) return 0;

        const trueRanges: number[] = [];
        const plusDMs: number[] = [];
        const minusDMs: number[] = [];

        // True Range, +DM, -DM hesapla
        for (let i = 1; i < highs.length; i++) {
            const trueRange = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
            );
            trueRanges.push(trueRange);

            const plusDM = highs[i] - highs[i - 1] > lows[i - 1] - lows[i] 
                ? Math.max(highs[i] - highs[i - 1], 0) : 0;
            const minusDM = lows[i - 1] - lows[i] > highs[i] - highs[i - 1] 
                ? Math.max(lows[i - 1] - lows[i], 0) : 0;

            plusDMs.push(plusDM);
            minusDMs.push(minusDM);
        }

        // Smoothed averages hesapla
        let smoothedTR = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
        let smoothedPlusDM = plusDMs.slice(0, period).reduce((a, b) => a + b, 0);
        let smoothedMinusDM = minusDMs.slice(0, period).reduce((a, b) => a + b, 0);

        const dxValues: number[] = [];

        for (let i = period; i < trueRanges.length; i++) {
            smoothedTR = smoothedTR - (smoothedTR / period) + trueRanges[i];
            smoothedPlusDM = smoothedPlusDM - (smoothedPlusDM / period) + plusDMs[i];
            smoothedMinusDM = smoothedMinusDM - (smoothedMinusDM / period) + minusDMs[i];

            const plusDI = (smoothedPlusDM / smoothedTR) * 100;
            const minusDI = (smoothedMinusDM / smoothedTR) * 100;

            const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
            dxValues.push(dx);
        }

        if (dxValues.length < period) return 0;

        // ADX hesapla (DX değerlerinin moving average'ı)
        return dxValues.slice(-period).reduce((a, b) => a + b, 0) / period;
    }

    /**
     * 📊 Aroon Hesaplama
     */
    private calculateAroon(highs: number[], lows: number[], period: number = 14): number {
        if (highs.length < period) return 50;

        const recentHighs = highs.slice(-period);
        const recentLows = lows.slice(-period);

        const highestIndex = recentHighs.indexOf(Math.max(...recentHighs));
        const lowestIndex = recentLows.indexOf(Math.min(...recentLows));

        const aroonUp = ((period - highestIndex) / period) * 100;
        const aroonDown = ((period - lowestIndex) / period) * 100;

        return aroonUp - aroonDown; // Aroon Oscillator
    }

    /**
     * 📊 MACD Hesaplama
     */
    private calculateMACD(closes: number[]): number {
        if (closes.length < 26) return 0;

        const ema12 = this.calculateEMA(closes, 12);
        const ema26 = this.calculateEMA(closes, 26);

        return ema12 - ema26;
    }

    /**
     * 📊 EMA Hesaplama
     */
    private calculateEMA(values: number[], period: number): number {
        if (values.length < period) return values[values.length - 1] || 0;

        const multiplier = 2 / (period + 1);
        let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;

        for (let i = period; i < values.length; i++) {
            ema = (values[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    /**
     * 📊 Bollinger Bands Pozisyonu
     */
    private getBollingerPosition(closes: number[], period: number = 20): 'UPPER' | 'LOWER' | 'MIDDLE' {
        if (closes.length < period) return 'MIDDLE';

        const recentCloses = closes.slice(-period);
        const sma = recentCloses.reduce((a, b) => a + b, 0) / period;
        const variance = recentCloses.reduce((sum, close) => sum + Math.pow(close - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        const currentPrice = closes[closes.length - 1];
        const upperBand = sma + (2 * stdDev);
        const lowerBand = sma - (2 * stdDev);

        if (currentPrice >= upperBand) return 'UPPER';
        else if (currentPrice <= lowerBand) return 'LOWER';
        else return 'MIDDLE';
    }

    /**
     * 📊 Volume Ratio Hesaplama
     */
    private calculateVolumeRatio(volumes: number[]): number {
        if (volumes.length < 20) return 1;

        const currentVolume = volumes[volumes.length - 1];
        const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

        return currentVolume / avgVolume;
    }

    /**
     * 📊 Volatilite Hesaplama
     */
    private calculateVolatility(closes: number[], period: number = 20): number {
        if (closes.length < period) return 0;

        const recentCloses = closes.slice(-period);
        const returns = [];

        for (let i = 1; i < recentCloses.length; i++) {
            returns.push((recentCloses[i] - recentCloses[i - 1]) / recentCloses[i - 1]);
        }

        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;

        return Math.sqrt(variance);
    }

    /**
     * 📊 Trend Belirleme
     */
    private determineTrend(closes: number[]): 'UP' | 'DOWN' | 'SIDEWAYS' {
        if (closes.length < 20) return 'SIDEWAYS';

        const shortMA = this.calculateSMA(closes.slice(-10), 10);
        const longMA = this.calculateSMA(closes.slice(-20), 20);

        const difference = ((shortMA - longMA) / longMA) * 100;

        if (difference > 1) return 'UP';
        else if (difference < -1) return 'DOWN';
        else return 'SIDEWAYS';
    }

    /**
     * 📊 SMA Hesaplama
     */
    private calculateSMA(values: number[], period: number): number {
        if (values.length < period) return values[values.length - 1] || 0;
        return values.slice(-period).reduce((a, b) => a + b, 0) / period;
    }

    /**
     * 📊 Trend Gücü Hesaplama
     */
    private calculateTrendStrength(closes: number[], highs: number[], lows: number[]): number {
        if (closes.length < 14) return 0;

        // Son 14 periyottaki fiyat hareketi gücünü değerlendir
        const recentCloses = closes.slice(-14);
        const recentHighs = highs.slice(-14);
        const recentLows = lows.slice(-14);

        let upMoves = 0;
        let downMoves = 0;
        let totalRange = 0;

        for (let i = 1; i < recentCloses.length; i++) {
            const change = recentCloses[i] - recentCloses[i - 1];
            const range = recentHighs[i] - recentLows[i];
            
            if (change > 0) upMoves += Math.abs(change);
            else downMoves += Math.abs(change);
            
            totalRange += range;
        }

        const momentum = Math.abs(upMoves - downMoves) / (upMoves + downMoves + 0.0001);
        const volatilityRatio = totalRange / (recentCloses[recentCloses.length - 1] * recentCloses.length);

        return (momentum * 100) / (1 + volatilityRatio);
    }
}
