'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Clock, Target, Shield, AlertTriangle } from 'lucide-react';
import { SignalData } from '@/types';

interface SignalCardProps {
  signal: SignalData;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const getSignalIcon = () => {
    switch (signal.type) {
      case 'LONG':
        return <TrendingUp className="h-6 w-6 text-green-400" />;
      case 'SHORT':
        return <TrendingDown className="h-6 w-6 text-red-400" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    }
  };

  const getSignalColor = () => {
    switch (signal.type) {
      case 'LONG':
        return 'signal-long';
      case 'SHORT':
        return 'signal-short';
      default:
        return 'signal-neutral';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(timestamp));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-active">● Aktif</span>;
      case 'COMPLETED':
        return <span className="status-completed">● Tamamlandı</span>;
      case 'CANCELLED':
        return <span className="status-cancelled">● İptal</span>;
      default:
        return <span className="text-gray-400">● Bilinmiyor</span>;
    }
  };

  return (
    <div className={`signal-card ${getSignalColor()} animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getSignalIcon()}
          <div>
            <h3 className="text-xl font-bold">{signal.symbol}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatTime(signal.timestamp)}</span>
              <span>•</span>
              <span>{signal.timeframe}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getStrengthColor(signal.strength)}`}>
            {signal.strength}%
          </div>
          <div className="text-sm text-gray-400">Güven</div>
        </div>
      </div>

      {/* Signal Type and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          signal.type === 'LONG' ? 'bg-green-500/20 text-green-400' :
          signal.type === 'SHORT' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {signal.type}
        </div>
        {getStatusBadge(signal.status)}
      </div>

      {/* Price Levels */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 flex items-center">
            <Target className="h-4 w-4 mr-1" />
            Giriş
          </span>
          <span className="font-mono font-medium">${formatPrice(signal.entry)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-400 flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            Stop Loss
          </span>
          <span className="font-mono font-medium text-red-400">
            ${formatPrice(signal.stopLoss)}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400 mb-1">Take Profit Seviyeleri</div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">TP1:</span>
            <span className="font-mono text-green-400">${formatPrice(signal.takeProfit1)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">TP2:</span>
            <span className="font-mono text-green-400">${formatPrice(signal.takeProfit2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">TP3:</span>
            <span className="font-mono text-green-400">${formatPrice(signal.takeProfit3)}</span>
          </div>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Sinyal Gücü</span>
          <span className={getStrengthColor(signal.strength)}>{signal.strength}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full strength-bar`}
            style={{ width: `${signal.strength}%` }}
          ></div>
        </div>
      </div>

      {/* Technical Indicators */}
      {signal.indicators && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Teknik İndikatörler</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {signal.indicators.rsi && (
              <div className="flex justify-between">
                <span>RSI:</span>
                <span className={
                  signal.indicators.rsi > 70 ? 'text-red-400' :
                  signal.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                }>
                  {signal.indicators.rsi.toFixed(1)}
                </span>
              </div>
            )}
            {signal.indicators.adx && (
              <div className="flex justify-between">
                <span>ADX:</span>
                <span className={signal.indicators.adx > 25 ? 'text-green-400' : 'text-yellow-400'}>
                  {signal.indicators.adx.toFixed(1)}
                </span>
              </div>
            )}
            {signal.indicators.bb_percentB && (
              <div className="flex justify-between">
                <span>BB %B:</span>
                <span className={
                  signal.indicators.bb_percentB > 80 ? 'text-red-400' :
                  signal.indicators.bb_percentB < 20 ? 'text-green-400' : 'text-yellow-400'
                }>
                  {signal.indicators.bb_percentB.toFixed(0)}%
                </span>
              </div>
            )}
            {signal.indicators.volume_ratio && (
              <div className="flex justify-between">
                <span>Hacim:</span>
                <span className={signal.indicators.volume_ratio > 1.5 ? 'text-green-400' : 'text-yellow-400'}>
                  {signal.indicators.volume_ratio.toFixed(1)}x
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="border-t border-gray-700 pt-3">
        <div className="text-sm text-gray-400 mb-1">Analiz Nedeni</div>
        <p className="text-sm leading-relaxed">{signal.reason}</p>
      </div>
    </div>
  );
}
