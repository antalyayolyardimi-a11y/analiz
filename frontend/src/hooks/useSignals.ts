'use client';

import { useState, useEffect, useCallback } from 'react';
import { SignalData, APIResponse } from '@/types';
import { useSocket } from './useSocket';
import toast from 'react-hot-toast';

export function useSignals() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket();

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/signals`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<SignalData[]> = await response.json();
      
      if (result.success && result.data) {
        setSignals(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch signals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching signals:', err);
      
      // Don't show toast if it's a connection error during initial load
      if (!errorMessage.includes('Failed to fetch')) {
        toast.error(`Sinyaller yüklenirken hata: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Initial fetch
  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewSignal = (signal: SignalData) => {
      setSignals(prev => [signal, ...prev]);
      toast.success(`Yeni sinyal: ${signal.symbol} ${signal.type}`, {
        icon: signal.type === 'LONG' ? '📈' : '📉',
      });
    };

    const handleSignalUpdate = (updatedSignal: SignalData) => {
      setSignals(prev => 
        prev.map(signal => 
          signal.id === updatedSignal.id ? updatedSignal : signal
        )
      );
      
      if (updatedSignal.status === 'COMPLETED') {
        toast.success(`Sinyal tamamlandı: ${updatedSignal.symbol}`);
      }
    };

    const handleActiveSignals = (activeSignals: SignalData[]) => {
      setSignals(activeSignals);
      setLoading(false);
    };

    socket.on('newSignal', handleNewSignal);
    socket.on('signalUpdate', handleSignalUpdate);
    socket.on('activeSignals', handleActiveSignals);

    return () => {
      socket.off('newSignal', handleNewSignal);
      socket.off('signalUpdate', handleSignalUpdate);
      socket.off('activeSignals', handleActiveSignals);
    };
  }, [socket]);

  return {
    signals,
    loading,
    error,
    refresh
  };
}
