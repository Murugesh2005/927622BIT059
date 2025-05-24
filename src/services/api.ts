import { StockPrice, StockInfo } from '../types';

class StockApi {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  async getStocks(): Promise<StockInfo> {
    const response = await fetch(`${this.baseUrl}/stocks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks: ${response.statusText}`);
    }
    return response.json();
  }

  async getMultipleStocksData(tickers: string[], minutes: number): Promise<Record<string, StockPrice[]>> {
    const response = await fetch(`${this.baseUrl}/stocks/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickers, minutes }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const stockApi = new StockApi();