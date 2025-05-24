import { useState, useCallback, useRef, useEffect } from 'react';
import { stockApi } from '../services/api';
import { StockPrice, StockInfo, ApiError } from '../types';

interface UseStockDataReturn {
  stocks: StockInfo;
  stocksData: Record<string, StockPrice[]>;
  loading: boolean;
  error: string | null;
  fetchStockData: (tickers: string[], minutes: number) => Promise<void>;
  clearError: () => void;
  clearData: () => void;
  refetchStocks: () => Promise<void>;
}

export const useStockData = (): UseStockDataReturn => {
  const [stocks, setStocks] = useState<StockInfo>({});
  const [stocksData, setStocksData] = useState<Record<string, StockPrice[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Fetch available stocks
  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stocksData = await stockApi.getStocks();
      
      if (isMountedRef.current) {
        // Validate stocks data
        if (!stocksData || typeof stocksData !== 'object') {
          throw new Error('Invalid stocks data format');
        }
        
        // Filter out invalid entries
        const validStocks: StockInfo = {};
        Object.entries(stocksData).forEach(([ticker, name]) => {
          if (ticker && typeof ticker === 'string' && 
              name && typeof name === 'string') {
            validStocks[ticker] = name;
          }
        });
        
        if (Object.keys(validStocks).length === 0) {
          throw new Error('No valid stocks found');
        }
        
        setStocks(validStocks);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to fetch stocks list');
        console.error('Error fetching stocks:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch of stocks
  useEffect(() => {
    fetchStocks();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchStocks]);

  const fetchStockData = useCallback(async (tickers: string[], minutes: number) => {
    // Validation
    if (!Array.isArray(tickers) || tickers.length === 0) {
      setError('Please select at least one stock');
      return;
    }

    if (!minutes || minutes <= 0) {
      setError('Invalid time frame');
      return;
    }

    // Filter valid tickers
    const validTickers = tickers.filter(ticker => 
      ticker && typeof ticker === 'string' && stocks[ticker]
    );

    if (validTickers.length === 0) {
      setError('No valid stocks selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await stockApi.getMultipleStocksData(validTickers, minutes);
      
      if (isMountedRef.current) {
        // Validate that we have some data
        const hasData = Object.values(data).some(stockData => 
          Array.isArray(stockData) && stockData.length > 0
        );
        
        if (!hasData) {
          setError('No data available for the selected stocks and time frame');
          return;
        }

        // Filter out empty datasets
        const validData: Record<string, StockPrice[]> = {};
        Object.entries(data).forEach(([ticker, stockData]) => {
          if (Array.isArray(stockData) && stockData.length > 0) {
            validData[ticker] = stockData;
          }
        });

        setStocksData(validData);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to fetch stock data');
        console.error('Error fetching stock data:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [stocks]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setStocksData({});
    setError(null);
  }, []);

  const refetchStocks = useCallback(async () => {
    await fetchStocks();
  }, [fetchStocks]);

  return {
    stocks,
    stocksData,
    loading,
    error,
    fetchStockData,
    clearError,
    clearData,
    refetchStocks,
  };
};
