import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Paper, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { StockPrice } from '../types';
import { calculateAverage } from '../utils/calculations';

interface MobileOptimizedChartProps {
  data: Record<string, StockPrice[]>;
  selectedStocks: string[];
  showAverage?: boolean;
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export const MobileOptimizedChart: React.FC<MobileOptimizedChartProps> = ({ 
  data, 
  selectedStocks, 
  showAverage = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Prepare chart data with mobile optimization
  const chartData = React.useMemo(() => {
    const allTimestamps = new Set<string>();
    selectedStocks.forEach(ticker => {
      if (data[ticker]) {
        data[ticker].forEach(point => allTimestamps.add(point.timestamp));
      }
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Limit data points on mobile for better performance
    const maxDataPoints = isMobile ? 20 : isTablet ? 40 : 100;
    const step = Math.max(1, Math.floor(sortedTimestamps.length / maxDataPoints));
    const filteredTimestamps = sortedTimestamps.filter((_, index) => index % step === 0);
    
    return filteredTimestamps.map(timestamp => {
      const point: any = { 
        timestamp: isMobile 
          ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(timestamp).toLocaleTimeString()
      };
      
      selectedStocks.forEach(ticker => {
        if (data[ticker]) {
          const stockPoint = data[ticker].find(p => p.timestamp === timestamp);
          point[ticker] = stockPoint ? stockPoint.price : null;
        }
      });
      
      return point;
    });
  }, [data, selectedStocks, isMobile, isTablet]);

  // Calculate averages for reference lines
  const averages = React.useMemo(() => {
    const avgs: Record<string, number> = {};
    selectedStocks.forEach(ticker => {
      if (data[ticker]) {
        const prices = data[ticker].map(p => p.price);
        avgs[ticker] = calculateAverage(prices);
      }
    });
    return avgs;
  }, [data, selectedStocks]);

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No data available for selected stocks
        </Typography>
      </Paper>
    );
  }

  const chartHeight = isMobile ? 300 : isTablet ? 350 : 400;

  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
        Stock Price History
      </Typography>
      <Box sx={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
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
              width={isMobile ? 50 : 60}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `$${Number(value).toFixed(2)}`, 
                name
              ]}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{
                fontSize: isMobile ? '12px' : '14px',
                padding: isMobile ? '8px' : '12px'
              }}
            />
            {!isMobile && <Legend />}
            
            {selectedStocks.slice(0, isMobile ? 3 : 6).map((ticker, index) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={colors[index % colors.length]}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={{ r: isMobile ? 2 : 3 }}
                connectNulls={false}
              />
            ))}
            
            {showAverage && !isMobile && selectedStocks.slice(0, 3).map((ticker, index) => (
              <ReferenceLine
                key={`avg-${ticker}`}
                y={averages[ticker]}
                stroke={colors[index % colors.length]}
                strokeDasharray="5 5"
                label={`${ticker} Avg: $${averages[ticker].toFixed(2)}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      {isMobile && selectedStocks.length > 3 && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Showing first 3 stocks. Use tablet/desktop view for more stocks.
        </Typography>
      )}
    </Paper>
  );
};