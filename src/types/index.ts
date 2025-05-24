export interface Stock {
  name: string;
  ticker: string;
}

export interface StockData {
  [ticker: string]: StockPrice[];
}

export interface StockPrice {
  timestamp: string;
  price: number;
}

export interface CorrelationMatrix {
  matrix: number[][];
  standardDeviations: Record<string, number>;
  dataPoints: number;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export interface StockStatistics {
  latest: number;
  change: number;
  changePercent: number;
  dataPoints: number;
  timestamp: string;
  high?: number;
  low?: number;
  average?: number;
  volatility?: number;
}

export interface ChartDataPoint {
  timestamp: string;
  fullTimestamp: string;
  [ticker: string]: string | number | null;
}

export interface TimeFrame {
  value: number;
  label: string;
}

export interface NavigationItem {
  key: 'stocks' | 'correlation';
  label: string;
  icon: React.ReactNode;
}

export interface StockInfo {
  [ticker: string]: string; // ticker -> company name
}