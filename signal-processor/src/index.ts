// Temel indikatör türleri
export interface IndicatorConfig {
  period?: number;
  multiplier?: number;
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
}

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface SignalResult {
  type: 'LONG' | 'SHORT' | 'NEUTRAL';
  strength: number; // 0-100 arası güven skoru
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  reason: string;
  indicators: {
    [key: string]: any;
  };
}

export interface SupportResistance {
  level: number;
  type: 'SUPPORT' | 'RESISTANCE';
  strength: number;
  touches: number;
  liquidityZone: boolean;
}

/**
 * Teknik analiz ve sinyal üretim motoru
 */
export class TechnicalAnalyzer {
  
  /**
   * ADX (Average Directional Index) hesapla
   */
  calculateADX(data: OHLCV[], period: number = 14): number[] {
    const result: number[] = [];
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);

    if (data.length < period + 1) return result;

    // True Range hesapla
    const tr: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const high_low = highs[i] - lows[i];
      const high_close = Math.abs(highs[i] - closes[i - 1]);
      const low_close = Math.abs(lows[i] - closes[i - 1]);
      tr.push(Math.max(high_low, high_close, low_close));
    }

    // +DM ve -DM hesapla
    const plusDM: number[] = [];
    const minusDM: number[] = [];
    
    for (let i = 1; i < highs.length; i++) {
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];
      
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }

    // Smoothed values hesapla
    const smoothTR = this.exponentialMovingAverage(tr, period);
    const smoothPlusDM = this.exponentialMovingAverage(plusDM, period);
    const smoothMinusDM = this.exponentialMovingAverage(minusDM, period);

    // +DI ve -DI hesapla
    const plusDI = smoothPlusDM.map((dm, i) => (dm / smoothTR[i]) * 100);
    const minusDI = smoothMinusDM.map((dm, i) => (dm / smoothTR[i]) * 100);

    // ADX hesapla
    const dx = plusDI.map((pdi, i) => {
      const sum = pdi + minusDI[i];
      const diff = Math.abs(pdi - minusDI[i]);
      return sum === 0 ? 0 : (diff / sum) * 100;
    });

    return this.exponentialMovingAverage(dx, period);
  }

  /**
   * Aroon Oscillator hesapla
   */
  calculateAroon(data: OHLCV[], period: number = 14): { aroonUp: number[], aroonDown: number[], oscillator: number[] } {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const aroonUp: number[] = [];
    const aroonDown: number[] = [];
    const oscillator: number[] = [];

    for (let i = period; i < data.length; i++) {
      const recentHighs = highs.slice(i - period, i + 1);
      const recentLows = lows.slice(i - period, i + 1);
      
      const highestIndex = recentHighs.indexOf(Math.max(...recentHighs));
      const lowestIndex = recentLows.indexOf(Math.min(...recentLows));
      
      const aroonUpValue = ((period - (period - highestIndex)) / period) * 100;
      const aroonDownValue = ((period - (period - lowestIndex)) / period) * 100;
      
      aroonUp.push(aroonUpValue);
      aroonDown.push(aroonDownValue);
      oscillator.push(aroonUpValue - aroonDownValue);
    }

    return { aroonUp, aroonDown, oscillator };
  }

  /**
   * Bollinger Bands hesapla
   */
  calculateBollingerBands(data: OHLCV[], period: number = 20, multiplier: number = 2) {
    const closes = data.map(d => d.close);
    const sma = this.simpleMovingAverage(closes, period);
    const result = [];

    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      result.push({
        upper: mean + (multiplier * stdDev),
        middle: mean,
        lower: mean - (multiplier * stdDev),
        bandwidth: (2 * multiplier * stdDev) / mean * 100,
        percentB: (closes[i] - (mean - multiplier * stdDev)) / (2 * multiplier * stdDev)
      });
    }

    return result;
  }

  /**
   * RSI hesapla
   */
  calculateRSI(data: OHLCV[], period: number = 14): number[] {
    const closes = data.map(d => d.close);
    const changes: number[] = [];
    
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }

    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

    const avgGains = this.exponentialMovingAverage(gains, period);
    const avgLosses = this.exponentialMovingAverage(losses, period);

    return avgGains.map((gain, i) => {
      const rs = avgLosses[i] === 0 ? 100 : gain / avgLosses[i];
      return 100 - (100 / (1 + rs));
    });
  }

  /**
   * MACD hesapla
   */
  calculateMACD(data: OHLCV[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const closes = data.map(d => d.close);
    const fastEMA = this.exponentialMovingAverage(closes, fastPeriod);
    const slowEMA = this.exponentialMovingAverage(closes, slowPeriod);
    
    // MACD line
    const macdLine: number[] = [];
    const startIndex = Math.max(fastEMA.length, slowEMA.length) - Math.min(fastEMA.length, slowEMA.length);
    
    for (let i = startIndex; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }

    // Signal line
    const signalLine = this.exponentialMovingAverage(macdLine, signalPeriod);
    
    // Histogram
    const histogram: number[] = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
    }

    return { macd: macdLine, signal: signalLine, histogram };
  }

  /**
   * Destek ve direnç seviyelerini bul
   */
  findSupportResistance(data: OHLCV[], sensitivity: number = 0.02): SupportResistance[] {
    const levels: SupportResistance[] = [];
    const pricePoints: number[] = [];
    
    // Pivot noktalarını bul
    for (let i = 2; i < data.length - 2; i++) {
      // Pivot High
      if (data[i].high > data[i-1].high && data[i].high > data[i+1].high &&
          data[i].high > data[i-2].high && data[i].high > data[i+2].high) {
        pricePoints.push(data[i].high);
      }
      
      // Pivot Low
      if (data[i].low < data[i-1].low && data[i].low < data[i+1].low &&
          data[i].low < data[i-2].low && data[i].low < data[i+2].low) {
        pricePoints.push(data[i].low);
      }
    }

    // Benzer seviyeleri gruplandır
    const groupedLevels = this.groupSimilarLevels(pricePoints, sensitivity);
    
    groupedLevels.forEach(level => {
      const touches = this.countTouches(data, level, sensitivity);
      const isSupport = this.isSupportLevel(data, level);
      const liquidityZone = this.isLiquidityZone(data, level, sensitivity);
      
      levels.push({
        level,
        type: isSupport ? 'SUPPORT' : 'RESISTANCE',
        strength: Math.min(touches * 20, 100), // Max 100
        touches,
        liquidityZone
      });
    });

    return levels.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Ana sinyal analizi
   */
  analyzeSignals(data: OHLCV[], timeframe: string = '15m'): SignalResult {
    if (data.length < 50) {
      throw new Error('Yetersiz veri: En az 50 mum gerekli');
    }

    // Teknik indikatörleri hesapla
    const adx = this.calculateADX(data);
    const aroon = this.calculateAroon(data);
    const bb = this.calculateBollingerBands(data);
    const rsi = this.calculateRSI(data);
    const macd = this.calculateMACD(data);
    const srLevels = this.findSupportResistance(data);

    const currentPrice = data[data.length - 1].close;
    const currentIndex = data.length - 1;

    // Sinyal skorlarını hesapla
    let longScore = 0;
    let shortScore = 0;
    const reasons: string[] = [];

    // ADX analizi (trend gücü)
    const currentADX = adx[adx.length - 1];
    if (currentADX > 25) {
      const aroonOsc = aroon.oscillator[aroon.oscillator.length - 1];
      if (aroonOsc > 20) {
        longScore += 20;
        reasons.push(`Güçlü yükseliş trendi (ADX: ${currentADX.toFixed(1)}, Aroon: ${aroonOsc.toFixed(1)})`);
      } else if (aroonOsc < -20) {
        shortScore += 20;
        reasons.push(`Güçlü düşüş trendi (ADX: ${currentADX.toFixed(1)}, Aroon: ${aroonOsc.toFixed(1)})`);
      }
    }

    // Bollinger Bands analizi
    const currentBB = bb[bb.length - 1];
    if (currentBB.percentB < 0.2) {
      longScore += 15;
      reasons.push(`Aşırı satım bölgesi (BB %B: ${(currentBB.percentB * 100).toFixed(1)}%)`);
    } else if (currentBB.percentB > 0.8) {
      shortScore += 15;
      reasons.push(`Aşırı alım bölgesi (BB %B: ${(currentBB.percentB * 100).toFixed(1)}%)`);
    }

    // Bollinger Bands sıkışması (volatilite patlaması beklentisi)
    if (currentBB.bandwidth < 10) {
      const priceDirection = data[currentIndex].close > data[currentIndex - 5].close;
      if (priceDirection) {
        longScore += 10;
        reasons.push(`BB sıkışması + yükseliş momentum`);
      } else {
        shortScore += 10;
        reasons.push(`BB sıkışması + düşüş momentum`);
      }
    }

    // Volume analizi
    const avgVolume = data.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20;
    const currentVolume = data[currentIndex].volume;
    if (currentVolume > avgVolume * 1.5) {
      const priceChange = (currentPrice - data[currentIndex - 1].close) / data[currentIndex - 1].close;
      if (priceChange > 0) {
        longScore += 15;
        reasons.push(`Yüksek hacim + fiyat artışı`);
      } else if (priceChange < 0) {
        shortScore += 15;
        reasons.push(`Yüksek hacim + fiyat düşüşü`);
      }
    }

    // Destek/Direnç analizi
    const nearestSupport = srLevels.find(level => 
      level.type === 'SUPPORT' && level.level < currentPrice && 
      ((currentPrice - level.level) / currentPrice) < 0.02
    );
    const nearestResistance = srLevels.find(level => 
      level.type === 'RESISTANCE' && level.level > currentPrice && 
      ((level.level - currentPrice) / currentPrice) < 0.02
    );

    // Kırılım analizleri
    if (nearestResistance && currentPrice > nearestResistance.level * 1.001) {
      longScore += 25;
      reasons.push(`Direnç kırılımı: ${nearestResistance.level.toFixed(2)}`);
    }
    if (nearestSupport && currentPrice < nearestSupport.level * 0.999) {
      shortScore += 25;
      reasons.push(`Destek kırılımı: ${nearestSupport.level.toFixed(2)}`);
    }

    // Sinyal yönünü belirle
    const totalScore = Math.max(longScore, shortScore);
    let signalType: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
    
    if (longScore > shortScore && longScore > 30) {
      signalType = 'LONG';
    } else if (shortScore > longScore && shortScore > 30) {
      signalType = 'SHORT';
    }

    // Risk yönetimi hesapla
    const atr = this.calculateATR(data);
    const currentATR = atr[atr.length - 1];
    
    let stopLoss: number;
    let takeProfit1: number;
    let takeProfit2: number;
    let takeProfit3: number;

    if (signalType === 'LONG') {
      stopLoss = nearestSupport ? nearestSupport.level * 0.995 : currentPrice - (currentATR * 1.5);
      takeProfit1 = currentPrice + (currentATR * 1);
      takeProfit2 = currentPrice + (currentATR * 2);
      takeProfit3 = nearestResistance ? nearestResistance.level * 1.005 : currentPrice + (currentATR * 3);
    } else {
      stopLoss = nearestResistance ? nearestResistance.level * 1.005 : currentPrice + (currentATR * 1.5);
      takeProfit1 = currentPrice - (currentATR * 1);
      takeProfit2 = currentPrice - (currentATR * 2);
      takeProfit3 = nearestSupport ? nearestSupport.level * 0.995 : currentPrice - (currentATR * 3);
    }

    return {
      type: signalType,
      strength: Math.min(totalScore, 100),
      entry: currentPrice,
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      reason: reasons.join(' | '),
      indicators: {
        adx: currentADX,
        aroon: aroon.oscillator[aroon.oscillator.length - 1],
        rsi: rsi[rsi.length - 1],
        macd: macd.macd[macd.macd.length - 1],
        bb_percentB: currentBB.percentB * 100,
        bb_bandwidth: currentBB.bandwidth,
        atr: currentATR,
        volume_ratio: currentVolume / avgVolume,
        support_resistance: {
          nearest_support: nearestSupport,
          nearest_resistance: nearestResistance
        }
      }
    };
  }

  // Yardımcı fonksiyonlar
  private simpleMovingAverage(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  private exponentialMovingAverage(data: number[], period: number): number[] {
    const result: number[] = [];
    const k = 2 / (period + 1);
    
    if (data.length === 0) return result;
    
    result[0] = data[0];
    for (let i = 1; i < data.length; i++) {
      result[i] = data[i] * k + result[i - 1] * (1 - k);
    }
    
    return result;
  }

  private calculateATR(data: OHLCV[], period: number = 14): number[] {
    const tr: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const high_low = data[i].high - data[i].low;
      const high_close = Math.abs(data[i].high - data[i - 1].close);
      const low_close = Math.abs(data[i].low - data[i - 1].close);
      tr.push(Math.max(high_low, high_close, low_close));
    }

    return this.exponentialMovingAverage(tr, period);
  }

  private groupSimilarLevels(levels: number[], tolerance: number): number[] {
    const grouped: number[] = [];
    const sorted = [...levels].sort((a, b) => a - b);
    
    let currentGroup = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const diff = Math.abs(sorted[i] - currentGroup[0]) / currentGroup[0];
      
      if (diff <= tolerance) {
        currentGroup.push(sorted[i]);
      } else {
        const avg = currentGroup.reduce((sum, val) => sum + val, 0) / currentGroup.length;
        grouped.push(avg);
        currentGroup = [sorted[i]];
      }
    }
    
    if (currentGroup.length > 0) {
      const avg = currentGroup.reduce((sum, val) => sum + val, 0) / currentGroup.length;
      grouped.push(avg);
    }
    
    return grouped;
  }

  private countTouches(data: OHLCV[], level: number, tolerance: number): number {
    let touches = 0;
    
    for (const candle of data) {
      const highDiff = Math.abs(candle.high - level) / level;
      const lowDiff = Math.abs(candle.low - level) / level;
      
      if (highDiff <= tolerance || lowDiff <= tolerance) {
        touches++;
      }
    }
    
    return touches;
  }

  private isSupportLevel(data: OHLCV[], level: number): boolean {
    const recentData = data.slice(-20);
    const pricesAbove = recentData.filter(d => d.close > level).length;
    return pricesAbove > recentData.length * 0.6;
  }

  private isLiquidityZone(data: OHLCV[], level: number, tolerance: number): boolean {
    const recentVolumes = data.slice(-20);
    let volumeAtLevel = 0;
    let totalVolume = 0;
    
    for (const candle of recentVolumes) {
      totalVolume += candle.volume;
      const priceDiff = Math.abs(candle.close - level) / level;
      if (priceDiff <= tolerance) {
        volumeAtLevel += candle.volume;
      }
    }
    
    return (volumeAtLevel / totalVolume) > 0.1; // %10'dan fazla hacim bu seviyede
  }
}

export default TechnicalAnalyzer;
