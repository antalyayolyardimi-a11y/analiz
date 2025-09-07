'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Bell, Settings, Zap, BarChart3, Eye } from 'lucide-react';

// Types
interface Signal {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT' | 'NEUTRAL';
  strength: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  reason: string;
  timestamp: Date;
  timeframe: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface MarketAlert {
  id: string;
  symbol: string;
  type: 'PUMP' | 'DUMP' | 'BREAKOUT' | 'BREAKDOWN';
  message: string;
  percentage: number;
  volume: number;
  timestamp: Date;
}

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'signals' | 'market' | 'analysis'>('signals');

  // Simulate connection and mock data
  useEffect(() => {
    setTimeout(() => setIsConnected(true), 1000);
    
    // Mock signals
    const mockSignals: Signal[] = [
      {
        id: '1',
        symbol: 'BTC-USDT',
        type: 'LONG',
        strength: 87,
        entry: 111242,
        stopLoss: 109850,
        takeProfit1: 112500,
        takeProfit2: 114000,
        takeProfit3: 116000,
        reason: 'Direnç kırılımı | Yüksek hacim | BB sıkışması',
        timestamp: new Date(),
        timeframe: '15m',
        status: 'ACTIVE'
      },
      {
        id: '2',
        symbol: 'ETH-USDT',
        type: 'SHORT',
        strength: 92,
        entry: 4292.27,
        stopLoss: 4350,
        takeProfit1: 4200,
        takeProfit2: 4150,
        takeProfit3: 4100,
        reason: 'Aşırı alım | RSI divergence | Momentum zayıflığı',
        timestamp: new Date(Date.now() - 300000),
        timeframe: '15m',
        status: 'ACTIVE'
      }
    ];

    setSignals(mockSignals);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="h-10 w-10 text-yellow-400" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                CryptoSignal Pro
              </h1>
              <p className="text-sm text-gray-400">
                {isConnected ? 'KuCoin API Bağlı ✓' : 'Bağlanıyor...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm">Live</span>
            </div>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-lg mb-8 w-fit">
          {(['signals', 'market', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab === 'signals' && 'Sinyaller'}
              {tab === 'market' && 'Piyasa'}
              {tab === 'analysis' && 'Analiz'}
            </button>
          ))}
        </div>

        {/* Signals Tab */}
        {activeTab === 'signals' && (
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Aktif Sinyaller
              </h2>
              <span className="bg-blue-600 text-xs px-2 py-1 rounded">
                {signals.length} aktif
              </span>
            </div>

            <div className="space-y-4">
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    signal.type === 'LONG' 
                      ? 'bg-green-900/20 border-green-500' 
                      : 'bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-semibold">
                        {signal.symbol}
                      </span>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        signal.type === 'LONG' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {signal.type}
                      </div>
                      <div className="text-sm text-gray-400">
                        Güven: {signal.strength}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {signal.timeframe} • {new Date(signal.timestamp).toLocaleTimeString('tr-TR')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Giriş</div>
                      <div className="font-mono">{formatCurrency(signal.entry)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
                      <div className="font-mono text-red-400">{formatCurrency(signal.stopLoss)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">TP1</div>
                      <div className="font-mono text-green-400">{formatCurrency(signal.takeProfit1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">TP2</div>
                      <div className="font-mono text-green-400">{formatCurrency(signal.takeProfit2)}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-300">
                    <strong>Sebep:</strong> {signal.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <Eye className="h-5 w-5 text-purple-500" />
              Piyasa Genel Bakış
            </h2>
            <div className="text-center py-16">
              <p className="text-gray-400">Market verileri yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Detaylı Analiz
            </h2>
            <div className="text-center py-16">
              <p className="text-gray-400">Coin seçerek detaylı analiz görüntüleyebilirsiniz</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
            <span>🔄 Her 5 dakikada güncellenir</span>
            <span>•</span>
            <span>📊 KuCoin API</span>
            <span>•</span>
            <span>🤖 AI Destekli</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              Canlı
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
