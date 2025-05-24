import { StockPrice, CorrelationMatrix } from '../types';

// Calculate Pearson correlation coefficient
export const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
    return 0;
  }
  
  // Filter out invalid pairs
  const validPairs: Array<[number, number]> = [];
  for (let i = 0; i < x.length; i++) {
    if (typeof x[i] === 'number' && typeof y[i] === 'number' && 
        isFinite(x[i]) && isFinite(y[i])) {
      validPairs.push([x[i], y[i]]);
    }
  }
  
  if (validPairs.length < 2) {
    return 0;
  }
  
  const validX = validPairs.map(pair => pair[0]);
  const validY = validPairs.map(pair => pair[1]);
  
  const meanX = calculateAverage(validX);
  const meanY = calculateAverage(validY);
  
  let numerator = 0;
  let sumSquaredX = 0;
  let sumSquaredY = 0;
  
  for (let i = 0; i < validX.length; i++) {
    const diffX = validX[i] - meanX;
    const diffY = validY[i] - meanY;
    
    numerator += diffX * diffY;
    sumSquaredX += diffX * diffX;
    sumSquaredY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(sumSquaredX * sumSquaredY);
  
  if (denominator === 0) {
    return 0;
  }
  
  const correlation = numerator / denominator;
  
  // Ensure correlation is within valid range [-1, 1]
  return Math.max(-1, Math.min(1, correlation));
};

// Calculate standard deviation
export const calculateStandardDeviation = (numbers: number[]): number => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const validNumbers = numbers.filter(num => 
    typeof num === 'number' && isFinite(num)
  );
  
  if (validNumbers.length === 0) {
    return 0;
  }
  
  const mean = calculateAverage(validNumbers);
  const squaredDifferences = validNumbers.map(num => Math.pow(num - mean, 2));
  const variance = calculateAverage(squaredDifferences);
  
  return Math.sqrt(variance);
};

// Calculate average
export const calculateAverage = (numbers: number[]): number => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const validNumbers = numbers.filter(num => 
    typeof num === 'number' && isFinite(num)
  );
  
  if (validNumbers.length === 0) {
    return 0;
  }
  
  const sum = validNumbers.reduce((acc, num) => acc + num, 0);
  return sum / validNumbers.length;
};

// Align stock data by timestamp for correlation calculation
export const alignStockData = (stocksData: Record<string, StockPrice[]>): Record<string, number[]> => {
  const tickers = Object.keys(stocksData);
  if (tickers.length === 0) return {};

  // Get all unique timestamps
  const allTimestamps = new Set<string>();
  tickers.forEach(ticker => {
    stocksData[ticker]?.forEach(point => {
      allTimestamps.add(point.timestamp);
    });
  });

  const sortedTimestamps = Array.from(allTimestamps).sort();
  
  // Create aligned data
  const alignedData: Record<string, number[]> = {};
  
  tickers.forEach(ticker => {
    alignedData[ticker] = [];
    const stockData = stocksData[ticker] || [];
    
    sortedTimestamps.forEach(timestamp => {
      const dataPoint = stockData.find(point => point.timestamp === timestamp);
      if (dataPoint) {
        alignedData[ticker].push(dataPoint.price);
      }
    });
  });

  // Filter out tickers with insufficient data
  Object.keys(alignedData).forEach(ticker => {
    if (alignedData[ticker].length < 2) {
      delete alignedData[ticker];
    }
  });

  return alignedData;
};

// Calculate correlation matrix
export const calculateCorrelationMatrix = (
  data: Record<string, Array<{ timestamp: string; price: number }>>
): {
  matrix: number[][];
  standardDeviations: Record<string, number>;
  dataPoints: number;
} => {
  const tickers = Object.keys(data);
  
  if (tickers.length === 0) {
    return {
      matrix: [],
      standardDeviations: {},
      dataPoints: 0,
    };
  }
  
  // Find common timestamps
  const allTimestamps = new Set<string>();
  tickers.forEach(ticker => {
    if (data[ticker] && Array.isArray(data[ticker])) {
      data[ticker].forEach(point => {
        if (point && typeof point.timestamp === 'string') {
          allTimestamps.add(point.timestamp);
        }
      });
    }
  });
  
  const commonTimestamps = Array.from(allTimestamps).filter(timestamp => {
    return tickers.every(ticker => {
      return data[ticker] && data[ticker].some(point => 
        point && point.timestamp === timestamp && 
        typeof point.price === 'number' && isFinite(point.price)
      );
    });
  }).sort();
  
  if (commonTimestamps.length < 2) {
    return {
      matrix: [],
      standardDeviations: {},
      dataPoints: 0,
    };
  }
  
  // Create aligned price arrays
  const alignedData: Record<string, number[]> = {};
  tickers.forEach(ticker => {
    alignedData[ticker] = commonTimestamps.map(timestamp => {
      const point = data[ticker].find(p => p && p.timestamp === timestamp);
      return point ? point.price : 0;
    }).filter(price => typeof price === 'number' && isFinite(price));
  });
  
  // Calculate correlation matrix
  const matrix: number[][] = [];
  const standardDeviations: Record<string, number> = {};
  
  // Calculate standard deviations
  tickers.forEach(ticker => {
    standardDeviations[ticker] = calculateStandardDeviation(alignedData[ticker]);
  });
  
  // Calculate correlations
  for (let i = 0; i < tickers.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) {
        matrix[i][j] = 1; // Perfect correlation with itself
      } else {
        matrix[i][j] = calculatePearsonCorrelation(
          alignedData[tickers[i]], 
          alignedData[tickers[j]]
        );
      }
    }
  }
  
  return {
    matrix,
    standardDeviations,
    dataPoints: commonTimestamps.length,
  };
};

// Utility function to format numbers
export const formatNumber = (num: number, decimals: number = 2): string => {
  if (!isFinite(num)) {
    return 'N/A';
  }
  
  return num.toFixed(decimals);
};

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  if (!isFinite(amount)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Utility function to format percentage
export const formatPercentage = (value: number): string => {
  if (!isFinite(value)) {
    return 'N/A';
  }
  
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (!isFinite(current) || !isFinite(previous) || previous === 0) {
    return 0;
  }
  
  return ((current - previous) / previous) * 100;
};