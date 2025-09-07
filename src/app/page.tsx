'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { MarketOverview } from '@/components/market-overview';
import { SignalList } from '@/components/signal-list';
import { useKucoinData } from '@/hooks/use-kucoin-data';
import { BarChart3, Target, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'signals' | 'market'>('signals');
  const [demoMode, setDemoMode] = useState(true); // Start with demo mode to show data
  const { tickers, signals, loading, error, lastUpdate, refetch } = useKucoinData(30000, demoMode);

  if (error && !demoMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header demoMode={demoMode} onToggleDemo={() => setDemoMode(!demoMode)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={refetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setDemoMode(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Switch to Demo Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header demoMode={demoMode} onToggleDemo={() => setDemoMode(!demoMode)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You&apos;re viewing demo data. Toggle to Live Mode to see real market data from Kucoin API.
                  {error && <span className="block mt-1 font-medium">{error}</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('signals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'signals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Trading Signals
                  {signals.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                      {signals.length}
                    </span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('market')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'market'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Market Overview
                  {tickers.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {tickers.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'signals' && (
          <SignalList
            signals={signals}
            loading={loading}
            onRefresh={refetch}
            lastUpdate={lastUpdate}
          />
        )}

        {activeTab === 'market' && (
          <MarketOverview tickers={tickers} />
        )}
      </main>
    </div>
  );
}
