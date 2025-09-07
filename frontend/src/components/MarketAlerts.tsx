'use client';

import React from 'react';
import { Bell, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export default function MarketAlerts() {
  // Mock data for now
  const alerts = [
    {
      id: '1',
      symbol: 'BTC-USDT',
      type: 'PUMP' as const,
      message: 'BTC büyük pump yaşıyor! Direnç kırılımı gerçekleşti.',
      percentage: 8.5,
      timestamp: new Date(),
      reason: 'Direnç kırılımı + yüksek hacim'
    },
    {
      id: '2',
      symbol: 'ETH-USDT',
      type: 'BREAKOUT' as const,
      message: 'ETH önemli destek seviyesini kırdı.',
      percentage: -4.2,
      timestamp: new Date(Date.now() - 600000),
      reason: 'Destek kırılımı'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'PUMP':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'DUMP':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'BREAKOUT':
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'BREAKDOWN':
        return <TrendingDown className="h-5 w-5 text-purple-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'PUMP':
        return 'alert-card alert-pump';
      case 'DUMP':
        return 'alert-card alert-dump';
      case 'BREAKOUT':
        return 'alert-card alert-breakout';
      case 'BREAKDOWN':
        return 'alert-card alert-breakdown';
      default:
        return 'alert-card';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="h-6 w-6 text-yellow-400" />
        <h3 className="text-xl font-semibold">Son Uyarılar</h3>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={getAlertClass(alert.type)}>
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{alert.symbol}</h4>
                  <span className={`font-mono text-lg ${
                    alert.percentage > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {alert.percentage > 0 ? '+' : ''}{alert.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Neden: {alert.reason}</span>
                  <span>{alert.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
