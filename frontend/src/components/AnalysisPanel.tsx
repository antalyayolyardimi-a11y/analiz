'use client';

import React, { useState } from 'react';
import { Search, BarChart3, Clock } from 'lucide-react';

export default function AnalysisPanel() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');

  const symbols = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'SOL-USDT'];
  const timeframes = ['15m', '1h', '4h', '1d'];

  const mockAnalysis = {
    trend: 'BULLISH' as const,
    strength: 78,
    support: 42500,
    resistance: 45800,
    indicators: {
      rsi: 68.2,
      adx: 34.5,
      macd: 'BULLISH' as const,
      bb_percentB: 75,
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-semibold">Detaylı Analiz</h3>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Coin Seç</label>
          <select 
            className="select-field w-full"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Zaman Dilimi</label>
          <div className="flex space-x-2">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="signal-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">{selectedSymbol} Analizi</h4>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mockAnalysis.trend === 'BULLISH' 
              ? 'bg-green-500/20 text-green-400'
              : mockAnalysis.trend === 'BEARISH'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {mockAnalysis.trend}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-400">Destek Seviyesi</div>
            <div className="text-lg font-mono">${mockAnalysis.support.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Direnç Seviyesi</div>
            <div className="text-lg font-mono">${mockAnalysis.resistance.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-semibold">Teknik İndikatörler</h5>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>RSI:</span>
              <span className={
                mockAnalysis.indicators.rsi > 70 ? 'text-red-400' :
                mockAnalysis.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
              }>
                {mockAnalysis.indicators.rsi}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>ADX:</span>
              <span className={mockAnalysis.indicators.adx > 25 ? 'text-green-400' : 'text-yellow-400'}>
                {mockAnalysis.indicators.adx}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>MACD:</span>
              <span className={
                mockAnalysis.indicators.macd === 'BULLISH' ? 'text-green-400' : 'text-red-400'
              }>
                {mockAnalysis.indicators.macd}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>BB %B:</span>
              <span className={
                mockAnalysis.indicators.bb_percentB > 80 ? 'text-red-400' :
                mockAnalysis.indicators.bb_percentB < 20 ? 'text-green-400' : 'text-yellow-400'
              }>
                {mockAnalysis.indicators.bb_percentB}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button className="btn-primary w-full">
            Detaylı Analiz Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
