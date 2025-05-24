import React, { useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Analytics, Refresh as RefreshIcon } from '@mui/icons-material';
import { CorrelationHeatmap } from '../components/CorrelationHeatmap';
import { StockSelector } from '../components/StockSelector';
import { TimeFrameSelector } from '../components/TimeFrameSelector';
import { useStockData } from '../hooks/useStockData';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const CorrelationPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { stocks, stocksData, loading, error, fetchStockData, clearError } = useStockData();
  const [selectedStocks, setSelectedStocks] = useLocalStorage<string[]>('correlationSelectedStocks', []);
  const [timeFrame, setTimeFrame] = useLocalStorage<number>('correlationTimeFrame', 120);

  const handleFetchData = useCallback(async () => {
    if (selectedStocks.length >= 2) {
      await fetchStockData(selectedStocks, timeFrame);
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

  const hasValidData = selectedStocks.length >= 2 && 
    selectedStocks.some(ticker => stocksData[ticker] && stocksData[ticker].length > 0);

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Analytics sx={{ mr: 1, fontSize: isMobile ? 24 : 32 }} />
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Stock Correlation Analysis
        </Typography>
      </Box>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Analyze correlations between stock prices to understand how they move relative to each other.
        Select at least 2 stocks to generate the correlation matrix.
      </Typography>

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
          <Grid item xs={12} md={5}>
            <StockSelector
              stocks={stocks}
              selectedStocks={selectedStocks}
              onSelectionChange={handleStockSelection}
              maxSelection={isMobile ? 4 : 8}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TimeFrameSelector
              value={timeFrame}
              onChange={handleTimeFrameChange}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={handleFetchData}
              disabled={selectedStocks.length < 2 || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              {loading ? 'Calculating...' : 'Calculate Correlations'}
            </Button>
          </Grid>
        </Grid>

        {selectedStocks.length > 0 && selectedStocks.length < 2 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Please select at least 2 stocks to calculate correlations.
          </Alert>
        )}
      </Paper>

      {/* Correlation Matrix */}
      <CorrelationHeatmap
        data={stocksData}
        selectedStocks={selectedStocks}
      />

      {/* Information Panel */}
      {hasValidData && (
        <Paper sx={{ p: isMobile ? 2 : 3, mt: 3 }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
            Understanding Correlation Values
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Correlation Ranges:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>
                  <Typography variant="body2">
                    <strong>+0.7 to +1.0:</strong> Strong positive correlation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>+0.3 to +0.7:</strong> Moderate positive correlation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>-0.3 to +0.3:</strong> Weak or no correlation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>-0.7 to -0.3:</strong> Moderate negative correlation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>-1.0 to -0.7:</strong> Strong negative correlation
                  </Typography>
                </li>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Interpretation:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>
                  <Typography variant="body2">
                    <strong>Positive correlation:</strong> Stocks tend to move in the same direction
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Negative correlation:</strong> Stocks tend to move in opposite directions
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>No correlation:</strong> Stock movements are independent
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Standard deviation:</strong> Measures price volatility
                  </Typography>
                </li>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};
