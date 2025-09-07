'use client';

import { useState } from 'react';
import { SignalData } from '@/lib/kucoin-api';
import { SignalCard } from './signal-card';
import { Filter, RefreshCw } from 'lucide-react';

interface SignalListProps {
  signals: SignalData[];
  loading: boolean;
  onRefresh: () => void;
  lastUpdate: Date | null;
}

export function SignalList({ signals, loading, onRefresh, lastUpdate }: SignalListProps) {
  const [filter, setFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [minConfidence, setMinConfidence] = useState(50);

  const filteredSignals = signals.filter(signal => {
    if (filter !== 'ALL' && signal.signal !== filter) return false;
    if (signal.confidence < minConfidence) return false;
    return true;
  });

  const longSignals = signals.filter(s => s.signal === 'LONG').length;
  const shortSignals = signals.filter(s => s.signal === 'SHORT').length;

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trading Signals</h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {longSignals} LONG
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {shortSignals} SHORT
              </span>
              <span>Total: {signals.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-3">
            Last updated: {lastUpdate.toLocaleString()}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signal Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'ALL' | 'LONG' | 'SHORT')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Signals</option>
              <option value="LONG">Long Only</option>
              <option value="SHORT">Short Only</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Confidence: {minConfidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-600">Analyzing market data...</p>
        </div>
      )}

      {/* Signals grid */}
      {!loading && (
        <>
          {filteredSignals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSignals.map((signal, index) => (
                <SignalCard key={`${signal.symbol}-${index}`} signal={signal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No signals match your current filters</p>
              <p className="text-sm text-gray-400">
                Try adjusting the confidence threshold or signal type
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}