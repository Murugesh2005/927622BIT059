import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import { Refresh as RefreshIcon, TrendingUp } from '@mui/icons-material';
import { StockChart } from '../components/StockChart';
import { MobileOptimizedChart } from '../components/MobileOptimizedChart';
import { StockSelector } from '../components/StockSelector';
import { TimeFrameSelector } from '../components/TimeFrameSelector';
import { useStockData } from '../hooks/useStockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency } from '../utils/calculations';

export const StockPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { stocks, stocksData, loading, error, fetchStockData, clearError } = useStockData();
  const [selectedStocks, setSelectedStocks] = useLocalStorage<string[]>('selectedStocks', []);
  const [timeFrame, setTimeFrame] = useLocalStorage<number>('timeFrame', 60);
  const [showAverage, setShowAverage] = useLocalStorage<boolean>('showAverage', false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && selectedStocks.length > 0) {
      interval = setInterval(() => {
        fetchStockData(selectedStocks, timeFrame).then(() => {
          setLastUpdate(new Date());
          setSnackbarOpen(true);
        });
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, selectedStocks, timeFrame, fetchStockData]);

  const handleFetchData = useCallback(async () => {
    if (selectedStocks.length > 0) {
      await fetchStockData(selectedStocks, timeFrame);
      setLastUpdate(new Date());
    }
  }, [selectedStocks, timeFrame, fetchStockData]);

  const handleStockSelection = useCallback((stocks: string[]) => {
    setSelectedStocks(stocks);
    clearError();
  }, [setSelectedStocks, clearError]);

  const handleTimeFrameChange = useCallback((minutes: number) => {
    setTimeFrame(minutes);
    clearError();
  }, [setTimeFrame, clearError]);

  // Calculate statistics
  const statistics = React.useMemo(() => {
    const stats: Record<string, any> = {};
    
    selectedStocks.forEach(ticker => {
      const data = stocksData[ticker];
      if (data && data.length > 0) {
        const prices = data.map(p => p.price);
        const latest = prices[prices.length - 1];
        const first = prices[0];
        const change = latest - first;
        const changePercent = (change / first) * 100;
        
        stats[ticker] = {
          latest,
          change,
          changePercent,
          dataPoints: data.length,
          timestamp: data[data.length - 1].timestamp,
        };
      }
    });
    
    return stats;
  }, [selectedStocks, stocksData]);

  const ChartComponent = isMobile ? MobileOptimizedChart : StockChart;

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUp sx={{ mr: 1, fontSize: isMobile ? 24 : 32 }} />
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Stock Price Analysis
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
        <Grid container spacing={isMobile ? 2 : 3} alignItems="center">
          <Grid item xs={12} md={4}>
            <StockSelector
              stocks={stocks}
              selectedStocks={selectedStocks}
              onSelectionChange={handleStockSelection}
              maxSelection={isMobile ? 3 : 8}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TimeFrameSelector
              value={timeFrame}
              onChange={handleTimeFrameChange}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAverage}
                    onChange={(e) => setShowAverage(e.target.checked)}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Show Average Lines
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Auto Refresh (30s)
                  </Typography>
                }
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={handleFetchData}
              disabled={selectedStocks.length === 0 || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Chart */}
      <ChartComponent
        data={stocksData}
        selectedStocks={selectedStocks}
        showAverage={showAverage}
      />

      {/* Stock Statistics */}
      {selectedStocks.length > 0 && Object.keys(stocksData).length > 0 && (
        <Paper sx={{ p: isMobile ? 2 : 3, mt: 3 }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
            Current Stock Prices
          </Typography>
          <Grid container spacing={2}>
            {selectedStocks.map(ticker => {
              const stockData = stocksData[ticker];
              const latestPrice = stockData && stockData.length > 0 
                ? stockData[stockData.length - 1].price 
                : null;
              
              return (
                <Grid item xs={6} sm={4} md={3} key={ticker}>
                  <Paper sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center' }}>
                    <Typography variant={isMobile ? "subtitle2" : "h6"} color="primary">
                      {ticker}
                    </Typography>
                    <Typography variant={isMobile ? "h6" : "h4"}>
                      {latestPrice ? `$${latestPrice.toFixed(2)}` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stockData && stockData.length > 0 
                        ? new Date(stockData[stockData.length - 1].timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No data'
                      }
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};