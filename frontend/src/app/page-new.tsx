'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  BarChart3, 
  Timer,
  Signal,
  AlertTriangle,
  Trophy,
  DollarSign
} from 'lucide-react';
import SignalCard from '@/components/SignalCard';
import CryptoPriceCard from '@/components/CryptoPriceCard';

// Mock data - gerçek uygulamada API'den gelecek
const mockBTCData = {
  symbol: 'BTC',
  name: 'Bitcoin',
  price: 111242.50,
  change24h: 0.96,
  volume24h: 89600000,
  high24h: 112500,
  low24h: 109800,
  marketCap: 2200000000000
};

const mockETHData = {
  symbol: 'ETH',
  name: 'Ethereum',
  price: 4292.27,
  change24h: 0.41,
  volume24h: 113200000,
  high24h: 4350,
  low24h: 4220,
  marketCap: 516000000000
};

const mockSignals = [
  {
    id: 'signal_1',
    symbol: 'DOGE-USDT',
    type: 'LONG' as const,
    side: 'BUY' as const,
    confidence: 85,
    price: 0.0825,
    currentPrice: 0.0834,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    strategy: 'BREAKOUT' as const,
    timeframe: '15m' as const,
    targets: {
      takeProfit1: 0.0865,
      takeProfit2: 0.0895,
      takeProfit3: 0.0925,
      stopLoss: 0.0795
    },
    riskReward: 2.8,
    expectedDuration: 120,
    indicators: {
      rsi: 72.5,
      adx: 35.2,
      aroon: 85.3,
      bbBand: 'UPPER' as const,
      macd: 0.0012,
      volume: 2.3,
      volatility: 0.045
    },
    volume24h: 245000000,
    priceChange24h: 4.8,
    aiScore: 88,
    marketSentiment: 'BULLISH' as const,
    status: 'ACTIVE' as const,
    hitTargets: ['TP1'],
    reason: 'Güçlü hacim artışı ile yukarı kırılım. RSI yüksek momentum, ADX trend gücünü destekliyor.'
  },
  {
    id: 'signal_2',
    symbol: 'ADA-USDT',
    type: 'SHORT' as const,
    side: 'SELL' as const,
    confidence: 78,
    price: 0.3456,
    currentPrice: 0.3421,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    strategy: 'REVERSAL' as const,
    timeframe: '15m' as const,
    targets: {
      takeProfit1: 0.3385,
      takeProfit2: 0.3325,
      takeProfit3: 0.3280,
      stopLoss: 0.3520
    },
    riskReward: 2.1,
    expectedDuration: 180,
    indicators: {
      rsi: 75.8,
      adx: 28.4,
      aroon: 25.7,
      bbBand: 'UPPER' as const,
      macd: -0.0008,
      volume: 1.8,
      volatility: 0.032
    },
    volume24h: 156000000,
    priceChange24h: -2.3,
    aiScore: 82,
    marketSentiment: 'BEARISH' as const,
    status: 'ACTIVE' as const,
    hitTargets: ['TP1'],
    reason: 'Aşırı alım bölgesinde direnç testi. MACD negatif divergence gösteriyor.'
  },
  {
    id: 'signal_3',
    symbol: 'SOL-USDT',
    type: 'LONG' as const,
    side: 'BUY' as const,
    confidence: 72,
    price: 145.50,
    currentPrice: 147.20,
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    strategy: 'MOMENTUM' as const,
    timeframe: '15m' as const,
    targets: {
      takeProfit1: 149.80,
      takeProfit2: 152.50,
      takeProfit3: 156.20,
      stopLoss: 142.10
    },
    riskReward: 2.5,
    expectedDuration: 90,
    indicators: {
      rsi: 58.3,
      adx: 24.1,
      aroon: 68.9,
      bbBand: 'MIDDLE' as const,
      macd: 0.0045,
      volume: 2.1,
      volatility: 0.058
    },
    volume24h: 890000000,
    priceChange24h: 1.8,
    aiScore: 75,
    marketSentiment: 'BULLISH' as const,
    status: 'ACTIVE' as const,
    reason: 'Momentum artışı ile orta bollinger bandından yukarı çıkış. Volume desteği mevcut.'
  }
];

export default function HomePage() {
  const [btcData, setBtcData] = useState(mockBTCData);
  const [ethData, setEthData] = useState(mockETHData);
  const [signals, setSignals] = useState(mockSignals);
  const [stats, setStats] = useState({
    totalSignals: 127,
    activeSignals: 8,
    winRate: 74.2,
    totalPnL: 156.8,
    avgPnL: 3.2,
    dailySignals: 15
  });

  // Simulated real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // BTC fiyat güncelleme
      setBtcData(prev => ({
        ...prev,
        price: prev.price * (1 + (Math.random() - 0.5) * 0.001),
        change24h: prev.change24h + (Math.random() - 0.5) * 0.1
      }));

      // ETH fiyat güncelleme
      setEthData(prev => ({
        ...prev,
        price: prev.price * (1 + (Math.random() - 0.5) * 0.001),
        change24h: prev.change24h + (Math.random() - 0.5) * 0.1
      }));

      // Signal fiyat güncellemeleri
      setSignals(prev => prev.map(signal => ({
        ...signal,
        currentPrice: signal.currentPrice! * (1 + (Math.random() - 0.5) * 0.002)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleTradeAction = (signalId: string, action: 'follow' | 'close' | 'ignore') => {
    console.log(`Trade action: ${action} for signal ${signalId}`);
    // Burada gerçek trade action logic'i olacak
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Signal className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Kripto Sinyal Bot
                </h1>
                <p className="text-sm text-gray-400">KuCoin Real-time Analiz</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Toplam P&L</div>
                <div className="text-xl font-bold text-green-400">+{stats.totalPnL}%</div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-xl font-bold text-blue-400">{stats.winRate}%</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-400">Canlı</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Aktif Sinyaller</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.activeSignals}</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Toplam Sinyal</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalSignals}</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.winRate}%</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Ortalama P&L</span>
            </div>
            <div className="text-2xl font-bold text-green-400">+{stats.avgPnL}%</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Günlük Sinyal</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.dailySignals}</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400">AI Aktif</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">98%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Panel - BTC ve ETH Sabit Kartları */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Ana Takip Coinleri</h2>
              </div>
              
              <div className="space-y-4">
                <CryptoPriceCard
                  {...btcData}
                  isFixed={true}
                />
                <CryptoPriceCard
                  {...ethData}
                  isFixed={true}
                />
              </div>
            </div>

            {/* AI Learning Panel */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">AI Öğrenme Sistemi</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Model Accuracy</span>
                  <span className="text-sm font-bold text-cyan-400">94.2%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Adaptasyon Sayısı</span>
                  <span className="text-sm font-bold text-white">1,247</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Son Güncelleme</span>
                  <span className="text-sm font-bold text-green-400">2 dk önce</span>
                </div>
                
                <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-600/20 rounded-lg">
                  <div className="text-sm text-cyan-300 font-medium mb-1">Öğrenme Durumu</div>
                  <p className="text-xs text-cyan-200/80">
                    Model DOGE breakout stratejisinden öğreniyor. RSI ağırlığı artırıldı.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orta ve Sağ Panel - Aktif Sinyaller */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Aktif Sinyaller</h2>
                <div className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full">
                  {signals.length} Aktif
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Real-time güncelleniyor</span>
              </div>
            </div>

            {/* Sinyal Kartları */}
            <div className="space-y-6">
              {signals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onTradeAction={handleTradeAction}
                />
              ))}
            </div>

            {/* Yeni Sinyal Bekleme Kartı */}
            <div className="mt-6 bg-gradient-to-br from-purple-900/10 to-pink-900/5 border border-purple-500/20 rounded-xl p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Yeni Sinyaller Aranıyor</h3>
              <p className="text-sm text-gray-400 mb-4">
                AI sistemi KuCoin'de 1,296 coini analiz ediyor...
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
