'use client';

import { KucoinTicker } from '@/lib/kucoin-api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface MarketOverviewProps {
  tickers: KucoinTicker[];
}

export function MarketOverview({ tickers }: MarketOverviewProps) {
  // Calculate market stats
  const gainers = tickers
    .filter(t => parseFloat(t.changeRate) > 0)
    .sort((a, b) => parseFloat(b.changeRate) - parseFloat(a.changeRate))
    .slice(0, 5);

  const losers = tickers
    .filter(t => parseFloat(t.changeRate) < 0)
    .sort((a, b) => parseFloat(a.changeRate) - parseFloat(b.changeRate))
    .slice(0, 5);

  const topVolume = tickers
    .sort((a, b) => parseFloat(b.volValue) - parseFloat(a.volValue))
    .slice(0, 10);

  const totalVolume = tickers.reduce((sum, t) => sum + parseFloat(t.volValue), 0);

  const chartData = topVolume.map(ticker => ({
    symbol: ticker.symbol.replace('-USDT', ''),
    volume: Math.round(parseFloat(ticker.volValue) / 1000000), // In millions
    change: parseFloat(ticker.changeRate) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Market Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Pairs</p>
              <p className="text-2xl font-bold text-gray-900">{tickers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Volume 24h</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalVolume / 1000000000).toFixed(1)}B
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gainers</p>
              <p className="text-2xl font-bold text-green-600">
                {tickers.filter(t => parseFloat(t.changeRate) > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Losers</p>
              <p className="text-2xl font-bold text-red-600">
                {tickers.filter(t => parseFloat(t.changeRate) < 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 by Volume (24h)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'volume' ? `$${value}M` : `${value.toFixed(2)}%`,
                  name === 'volume' ? 'Volume' : 'Change'
                ]}
              />
              <Bar dataKey="volume" fill="#3b82f6" name="volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {gainers.map(ticker => (
              <div key={ticker.symbol} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {ticker.symbol}
                </span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    +{(parseFloat(ticker.changeRate) * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    ${parseFloat(ticker.last).toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {losers.map(ticker => (
              <div key={ticker.symbol} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {ticker.symbol}
                </span>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    {(parseFloat(ticker.changeRate) * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    ${parseFloat(ticker.last).toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}