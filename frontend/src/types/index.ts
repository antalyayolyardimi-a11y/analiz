export interface SignalData {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT' | 'NEUTRAL';
  strength: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  reason: string;
  timestamp: Date;
  timeframe: string;
  indicators: {
    adx?: number;
    aroon?: number;
    rsi?: number;
    macd?: number;
    bb_percentB?: number;
    bb_bandwidth?: number;
    atr?: number;
    volume_ratio?: number;
    support_resistance?: {
      nearest_support?: SupportResistanceLevel;
      nearest_resistance?: SupportResistanceLevel;
    };
  };
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface SupportResistanceLevel {
  level: number;
  type: 'SUPPORT' | 'RESISTANCE';
  strength: number;
  touches: number;
  liquidityZone: boolean;
}

export interface MarketAlert {
  id: string;
  symbol: string;
  type: 'PUMP' | 'DUMP' | 'BREAKOUT' | 'BREAKDOWN';
  message: string;
  percentage: number;
  volume: number;
  timestamp: Date;
  reason: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high: number;
  low: number;
  marketCap?: number;
}

export interface AnalysisRequest {
  symbol: string;
  timeframes: ('15m' | '1h' | '4h' | '1d')[];
  indicators?: string[];
}

export interface AnalysisResult {
  symbol: string;
  timeframes: string[];
  analysis: {
    trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    strength: number;
    support: number;
    resistance: number;
    indicators: {
      rsi: number;
      macd: string;
      adx: number;
    };
  };
  timestamp: string;
}

export interface DashboardStats {
  totalSignals: number;
  activeSignals: number;
  successRate: number;
  totalProfit: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}
