import { KucoinTicker, KucoinKline, SignalData } from './kucoin-api';

export class SignalAnalyzer {
  // Simple signal analysis based on price movement and volume
  analyzeSignal(ticker: KucoinTicker, klines: KucoinKline[] = []): SignalData {
    const price = parseFloat(ticker.last);
    const changeRate = parseFloat(ticker.changeRate);
    const volume = parseFloat(ticker.vol);

    let signal: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
    let confidence = 0;
    let reason = 'Insufficient data for signal';

    // Basic signal logic based on price movement and volume
    if (klines.length >= 5) {
      const recentKlines = klines.slice(-5);
      const isUptrend = this.isUptrend(recentKlines);
      const isDowntrend = this.isDowntrend(recentKlines);
      const volumeSpike = this.hasVolumeSpike(recentKlines);

      if (isUptrend && volumeSpike) {
        signal = 'LONG';
        confidence = Math.min(90, 70 + Math.abs(changeRate * 100));
        reason = 'Uptrend with volume spike detected';
      } else if (isDowntrend && volumeSpike) {
        signal = 'SHORT';
        confidence = Math.min(90, 70 + Math.abs(changeRate * 100));
        reason = 'Downtrend with volume spike detected';
      } else if (isUptrend) {
        signal = 'LONG';
        confidence = Math.min(75, 50 + Math.abs(changeRate * 100));
        reason = 'Uptrend detected';
      } else if (isDowntrend) {
        signal = 'SHORT';
        confidence = Math.min(75, 50 + Math.abs(changeRate * 100));
        reason = 'Downtrend detected';
      }
    } else {
      // Simple signal based on 24h performance
      if (changeRate > 0.05) {
        signal = 'LONG';
        confidence = Math.min(60, 30 + changeRate * 100);
        reason = `Strong 24h gain: ${(changeRate * 100).toFixed(2)}%`;
      } else if (changeRate < -0.05) {
        signal = 'SHORT';
        confidence = Math.min(60, 30 + Math.abs(changeRate * 100));
        reason = `Strong 24h loss: ${(changeRate * 100).toFixed(2)}%`;
      } else if (changeRate > 0.02) {
        signal = 'LONG';
        confidence = Math.min(40, 20 + changeRate * 100);
        reason = `Moderate 24h gain: ${(changeRate * 100).toFixed(2)}%`;
      } else if (changeRate < -0.02) {
        signal = 'SHORT';
        confidence = Math.min(40, 20 + Math.abs(changeRate * 100));
        reason = `Moderate 24h loss: ${(changeRate * 100).toFixed(2)}%`;
      }
    }

    // Additional volume-based confidence adjustment
    const avgVolume = this.getAverageVolume(klines);
    if (volume > avgVolume * 1.5) {
      confidence = Math.min(100, confidence * 1.2);
      reason += ' with high volume';
    }

    return {
      symbol: ticker.symbol,
      signal,
      confidence: Math.round(confidence),
      price,
      changeRate,
      volume,
      reason,
      timestamp: new Date(),
    };
  }

  private isUptrend(klines: KucoinKline[]): boolean {
    if (klines.length < 3) return false;
    
    const closes = klines.map(k => parseFloat(k.close));
    let uptrendCount = 0;
    
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        uptrendCount++;
      }
    }
    
    return uptrendCount >= Math.ceil(closes.length * 0.6);
  }

  private isDowntrend(klines: KucoinKline[]): boolean {
    if (klines.length < 3) return false;
    
    const closes = klines.map(k => parseFloat(k.close));
    let downtrendCount = 0;
    
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] < closes[i - 1]) {
        downtrendCount++;
      }
    }
    
    return downtrendCount >= Math.ceil(closes.length * 0.6);
  }

  private hasVolumeSpike(klines: KucoinKline[]): boolean {
    if (klines.length < 3) return false;
    
    const volumes = klines.map(k => parseFloat(k.volume));
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const latestVolume = volumes[volumes.length - 1];
    
    return latestVolume > avgVolume * 1.5;
  }

  private getAverageVolume(klines: KucoinKline[]): number {
    if (klines.length === 0) return 0;
    
    const totalVolume = klines.reduce((sum, k) => sum + parseFloat(k.volume), 0);
    return totalVolume / klines.length;
  }

  // Filter signals based on criteria
  filterSignals(signals: SignalData[], minConfidence: number = 50, signalType?: 'LONG' | 'SHORT'): SignalData[] {
    return signals.filter(signal => {
      if (signal.confidence < minConfidence) return false;
      if (signalType && signal.signal !== signalType) return false;
      return signal.signal !== 'NEUTRAL';
    });
  }

  // Sort signals by confidence
  sortSignalsByConfidence(signals: SignalData[]): SignalData[] {
    return signals.sort((a, b) => b.confidence - a.confidence);
  }
}

export const signalAnalyzer = new SignalAnalyzer();