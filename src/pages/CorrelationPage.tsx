import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { CorrelationHeatmap } from '../components/CorrelationHeatmap';
import { StockSelector } from '../components/StockSelector';
import { TimeFrameSelector } from '../components/TimeFrameSelector';
import { useStockData } from '../hooks/useStockData';

export const CorrelationPage: React.FC = () => {
  const { stocks, stocksData, loading, error, fetchStockData } = useStockData();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [timeFrame, setTimeFrame] = useState<number>(60);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && selectedStocks.length >= 2) {
      interval = setInterval(() => {
        fetchStockData(selectedStocks, timeFrame);
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, selectedStocks, timeFrame, fetchStockData]);

  const handleFetchData = () => {
    if (selectedStocks.length >= 2) {
      fetchStockData(selectedStocks, timeFrame);
    }
  };

  const handleStockSelection = (stocks: string[]) => {
    setSelectedStocks(stocks);
  };

  const handleTimeFrameChange = (minutes: number) => {
    setTimeFrame(minutes);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Correlation Analysis
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Analyze correlations between stocks using Pearson's correlation coefficient.
        Select at least 2 stocks to generate the correlation heatmap.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <StockSelector
              stocks={stocks}
              selectedStocks={selectedStocks}
              onSelectionChange={handleStockSelection}
              maxSelection={8}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TimeFrameSelector
              value={timeFrame}
              onChange={handleTimeFrameChange}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh (30s)"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={handleFetchData}
              disabled={selectedStocks.length < 2 || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              fullWidth
            >
              {loading ? 'Loading...' : 'Calculate Correlations'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Information Panel */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          Understanding Correlation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" paragraph>
              <strong>Pearson Correlation Coefficient Formula:</strong><br />
              ρ = cov(X, Y) / (std(X) × std(Y))
            </Typography>
            <Typography variant="body2">
              <strong>Interpretation:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>+1.0: Perfect positive correlation</li>
              <li>+0.7 to +0.9: Strong positive correlation</li>
              <li>+0.3 to +0.7: Moderate positive correlation</li>
              <li>-0.3 to +0.3: Weak or no correlation</li>
              <li>-0.3 to -0.7: Moderate negative correlation</li>
              <li>-0.7 to -0.9: Strong negative correlation</li>
              <li>-1.0: Perfect negative correlation</li>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" paragraph>
              <strong>Key Points:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Only time-aligned data points are used in calculations</li>
              <li>Standard deviation shows price volatility</li>
              <li>Correlation helps identify portfolio diversification opportunities</li>
              <li>High correlation means stocks tend to move together</li>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Correlation Heatmap */}
      <CorrelationHeatmap
        data={stocksData}
        selectedStocks={selectedStocks}
      />

      {/* Data Summary */}
      {selectedStocks.length >= 2 && Object.keys(stocksData).length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Summary
          </Typography>
          <Grid container spacing={2}>
            {selectedStocks.map(ticker => {
              const stockData = stocksData[ticker];
              const dataPoints = stockData ? stockData.length : 0;
              const latestPrice = stockData && stockData.length > 0 
                ? stockData[stockData.length - 1].price 
                : null;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ticker}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {ticker}
                    </Typography>
                    <Typography variant="body2">
                      Data Points: {dataPoints}
                    </Typography>
                    <Typography variant="body2">
                      Latest Price: {latestPrice ? `$${latestPrice.toFixed(2)}` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stockData && stockData.length > 0 
                        ? `Updated: ${new Date(stockData[stockData.length - 1].timestamp).toLocaleTimeString()}`
                        : 'No data available'
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