'use client';

import { SignalData } from '@/lib/kucoin-api';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

interface SignalCardProps {
  signal: SignalData;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isLong = signal.signal === 'LONG';
  const isShort = signal.signal === 'SHORT';

  const signalColor = isLong 
    ? 'bg-green-50 border-green-200 text-green-800' 
    : isShort 
    ? 'bg-red-50 border-red-200 text-red-800' 
    : 'bg-gray-50 border-gray-200 text-gray-800';

  const iconColor = isLong 
    ? 'text-green-600' 
    : isShort 
    ? 'text-red-600' 
    : 'text-gray-600';

  return (
    <div className={`rounded-lg border-2 p-4 ${signalColor} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLong && <TrendingUp className={`w-5 h-5 ${iconColor}`} />}
          {isShort && <TrendingDown className={`w-5 h-5 ${iconColor}`} />}
          <h3 className="font-bold text-lg">{signal.symbol}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isLong ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {signal.signal}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-sm opacity-75">Price</p>
          <p className="font-semibold">${signal.price.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-sm opacity-75">24h Change</p>
          <p className={`font-semibold ${signal.changeRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(signal.changeRate * 100).toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm opacity-75">Confidence</p>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <p className="font-semibold">{signal.confidence}%</p>
          </div>
        </div>
        <div>
          <p className="text-sm opacity-75">Volume</p>
          <p className="font-semibold">{signal.volume.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-sm opacity-75">Analysis</p>
        <p className="text-sm">{signal.reason}</p>
      </div>

      <div className="flex items-center gap-1 text-xs opacity-60">
        <Clock className="w-3 h-3" />
        <span>{signal.timestamp.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}