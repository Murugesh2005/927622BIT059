import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Paper, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

// Define types locally if they don't exist
interface StockPrice {
  timestamp: string;
  price: number;
}

// Define utility functions locally if they don't exist
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

interface StockChartProps {
  data: Record<string, StockPrice[]>;
  selectedStocks: string[];
  showAverage?: boolean;
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff8042', '#0088fe', '#00c49f'
];

export const StockChart: React.FC<StockChartProps> = ({ 
  data, 
  selectedStocks, 
  showAverage = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!selectedStocks.length || !Object.keys(data).length) return [];

    // Get all unique timestamps
    const allTimestamps = new Set<string>();
    selectedStocks.forEach(ticker => {
      if (data[ticker]) {
        data[ticker].forEach(point => allTimestamps.add(point.timestamp));
      }
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Limit data points for performance on mobile
    const maxDataPoints = isMobile ? 30 : isTablet ? 60 : 100;
    const step = Math.max(1, Math.floor(sortedTimestamps.length / maxDataPoints));
    const filteredTimestamps = sortedTimestamps.filter((_, index) => index % step === 0);
    
    return filteredTimestamps.map(timestamp => {
      const point: Record<string, string | number | null> = { 
        timestamp: new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(isMobile ? {} : { second: '2-digit' })
        }),
        fullTimestamp: timestamp
      };
      
      selectedStocks.forEach(ticker => {
        if (data[ticker]) {
          const stockPoint = data[ticker].find(p => p.timestamp === timestamp);
          point[ticker] = stockPoint ? Number(stockPoint.price.toFixed(2)) : null;
        }
      });
      
      return point;
    }).filter(point => 
      selectedStocks.some(ticker => point[ticker] !== null)
    );
  }, [data, selectedStocks, isMobile, isTablet]);

  // Calculate averages for reference lines
  const averages = useMemo(() => {
    const avgs: Record<string, number> = {};
    selectedStocks.forEach(ticker => {
      if (data[ticker] && data[ticker].length > 0) {
        const prices = data[ticker].map(p => p.price);
        avgs[ticker] = calculateAverage(prices);
      }
    });
    return avgs;
  }, [data, selectedStocks]);

  // Prepare reference lines data (not JSX)
  const referenceLineData = useMemo(() => {
    if (!showAverage || isMobile) return [];
    
    return selectedStocks
      .slice(0, 5)
      .filter(ticker => averages[ticker])
      .map((ticker, index) => ({
        ticker,
        average: averages[ticker],
        color: CHART_COLORS[index % CHART_COLORS.length],
        index
      }));
  }, [showAverage, isMobile, selectedStocks, averages]);

  // Prepare mobile averages data (not JSX)
  const mobileAverageData = useMemo(() => {
    if (!showAverage || !isMobile) return [];
    
    return selectedStocks
      .slice(0, 3)
      .filter(ticker => averages[ticker])
      .map(ticker => ({
        ticker,
        average: averages[ticker]
      }));
  }, [showAverage, isMobile, selectedStocks, averages]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Time: {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ 
                color: entry.color,
                display: 'block',
                fontWeight: 'medium'
              }}
            >
              {entry.dataKey}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {selectedStocks.length === 0 
            ? 'Please select stocks to view chart' 
            : 'No data available for selected stocks'
          }
        </Typography>
      </Paper>
    );
  }

  const chartHeight = isMobile ? 300 : isTablet ? 400 : 500;

  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
        Stock Price History
      </Typography>
      
      <Box sx={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <LineChart 
            data={chartData} 
            margin={{ 
              top: 20, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 10 : 20, 
              bottom: isMobile ? 60 : 20 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : "preserveStart"}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 60 : 80}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && (
              <Legend 
                wrapperStyle={{ fontSize: '14px' }}
                iconType="line"
              />
            )}
            
            {selectedStocks.slice(0, isMobile ? 3 : 10).map((ticker, index) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={isMobile ? 2 : 2.5}
                dot={{ r: isMobile ? 0 : 3, strokeWidth: 2 }}
                activeDot={{ r: isMobile ? 4 : 6, strokeWidth: 0 }}
                connectNulls={false}
                name={ticker}
              />
            ))}
            
            {referenceLineData.map(({ ticker, average, color }) => (
              <ReferenceLine
                key={`avg-${ticker}`}
                y={average}
                stroke={color}
                strokeDasharray="8 8"
                strokeWidth={1.5}
                label={`${ticker} Avg: ${formatCurrency(average)}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      {isMobile && selectedStocks.length > 3 && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Showing first 3 stocks. Switch to desktop view for more stocks.
        </Typography>
      )}

      {showAverage && isMobile && mobileAverageData.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" fontWeight="bold">Averages:</Typography>
          {mobileAverageData.map(({ ticker, average }) => (
            <Typography key={ticker} variant="caption" sx={{ display: 'block' }}>
              {ticker}: {formatCurrency(average)}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
};
