'use client';

import { useState, useEffect, useCallback } from 'react';
import { kucoinAPI, KucoinTicker, SignalData } from '@/lib/kucoin-api';
import { signalAnalyzer } from '@/lib/signal-analyzer';
import { mockTickers, mockSignals } from '@/lib/demo-data';

export function useKucoinData(refreshInterval: number = 30000, demoMode: boolean = false) {
  const [tickers, setTickers] = useState<KucoinTicker[]>([]);
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (demoMode) {
        // Use mock data for demo
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setTickers(mockTickers);
        setSignals(mockSignals);
        setLastUpdate(new Date());
      } else {
        // Fetch all tickers
        const allTickers = await kucoinAPI.getAllTickers();
        
        // Filter for USDT pairs and major coins
        const majorPairs = allTickers.filter(ticker => 
          ticker.symbol.endsWith('-USDT') && 
          parseFloat(ticker.volValue) > 100000 // Filter by volume
        );

        setTickers(majorPairs);

        // Generate signals for top coins by volume
        const topCoins = majorPairs
          .sort((a, b) => parseFloat(b.volValue) - parseFloat(a.volValue))
          .slice(0, 50);

        const signalPromises = topCoins.map(async (ticker) => {
          try {
            // Get recent klines for better signal analysis
            const klines = await kucoinAPI.getKlines(ticker.symbol, '1hour');
            return signalAnalyzer.analyzeSignal(ticker, klines);
          } catch (error) {
            console.error(`Error analyzing ${ticker.symbol}:`, error);
            return signalAnalyzer.analyzeSignal(ticker, []);
          }
        });

        const allSignals = await Promise.all(signalPromises);
        
        // Filter and sort signals
        const filteredSignals = signalAnalyzer.filterSignals(allSignals, 40);
        const sortedSignals = signalAnalyzer.sortSignalsByConfidence(filteredSignals);
        
        setSignals(sortedSignals);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching Kucoin data:', err);
      
      // Fallback to demo mode if API fails
      if (!demoMode) {
        setTickers(mockTickers);
        setSignals(mockSignals);
        setLastUpdate(new Date());
        setError('Live API unavailable, showing demo data');
      }
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    tickers,
    signals,
    loading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
}