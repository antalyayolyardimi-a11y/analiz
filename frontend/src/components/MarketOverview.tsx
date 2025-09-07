'use client';

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function MarketOverview() {
  const marketData = [
    {
      symbol: 'BTC-USDT',
      price: 43250.30,
      change: 2.45,
      volume: '1.2B',
      marketCap: '847B'
    },
    {
      symbol: 'ETH-USDT',
      price: 2890.15,
      change: -1.23,
      volume: '856M',
      marketCap: '347B'
    },
    {
      symbol: 'BNB-USDT',
      price: 315.80,
      change: 3.67,
      volume: '234M',
      marketCap: '48B'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-semibold">Piyasa Özeti</h3>
      </div>

      <div className="space-y-4">
        {marketData.map((coin) => (
          <div key={coin.symbol} className="signal-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{coin.symbol}</h4>
              <div className="text-right">
                <div className="font-mono font-bold">${coin.price.toLocaleString()}</div>
                <div className={`text-sm flex items-center ${
                  coin.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Hacim (24s)</span>
                <div className="font-medium">{coin.volume}</div>
              </div>
              <div>
                <span className="text-gray-400">Market Cap</span>
                <div className="font-medium">{coin.marketCap}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <DollarSign className="h-6 w-6 text-green-400" />
          <span className="text-lg font-semibold">Toplam Piyasa</span>
        </div>
        <div className="text-2xl font-bold text-center">$2.1T</div>
        <div className="text-sm text-green-400 text-center">+3.2% (24s)</div>
      </div>
    </div>
  );
}
