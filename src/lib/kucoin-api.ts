import axios from 'axios';

// Kucoin API base URL
const BASE_URL = 'https://api.kucoin.com/api/v1';

export interface KucoinTicker {
  symbol: string;
  name: string;
  buy: string;
  sell: string;
  changeRate: string;
  changePrice: string;
  high: string;
  low: string;
  vol: string;
  volValue: string;
  last: string;
  averagePrice: string;
  takerFeeRate: string;
  makerFeeRate: string;
  takerCoefficient: string;
  makerCoefficient: string;
}

export interface KucoinKline {
  time: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
}

export interface SignalData {
  symbol: string;
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  price: number;
  changeRate: number;
  volume: number;
  reason: string;
  timestamp: Date;
}

class KucoinAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  // Get all trading symbols
  async getSymbols(): Promise<Array<Record<string, unknown>>> {
    try {
      const response = await axios.get(`${this.baseURL}/symbols`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching symbols:', error);
      return [];
    }
  }

  // Get 24hr ticker statistics for all symbols
  async getAllTickers(): Promise<KucoinTicker[]> {
    try {
      const response = await axios.get(`${this.baseURL}/market/allTickers`);
      return response.data.data?.ticker || [];
    } catch (error) {
      console.error('Error fetching tickers:', error);
      return [];
    }
  }

  // Get ticker for specific symbol
  async getTicker(symbol: string): Promise<KucoinTicker | null> {
    try {
      const response = await axios.get(`${this.baseURL}/market/stats`, {
        params: { symbol }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol}:`, error);
      return null;
    }
  }

  // Get klines/candlestick data
  async getKlines(symbol: string, type: string = '1hour', startAt?: number, endAt?: number): Promise<KucoinKline[]> {
    try {
      const params: Record<string, unknown> = {
        symbol,
        type,
      };

      if (startAt) params.startAt = startAt;
      if (endAt) params.endAt = endAt;

      const response = await axios.get(`${this.baseURL}/market/candles`, { params });
      
      const rawData = response.data.data || [];
      return rawData.map((item: string[]) => ({
        time: item[0],
        open: item[1],
        close: item[2],
        high: item[3],
        low: item[4],
        volume: item[5],
        turnover: item[6]
      }));
    } catch (error) {
      console.error(`Error fetching klines for ${symbol}:`, error);
      return [];
    }
  }
}

export const kucoinAPI = new KucoinAPI();