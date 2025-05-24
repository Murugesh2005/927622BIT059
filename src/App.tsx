import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography } from '@mui/material';
import { StockChart } from './components/StockChart';
import { ErrorBoundary } from './components/ErrorBoundary';

const theme = createTheme();

// Generate sample stock data
const generateSampleData = () => {
  const now = new Date();
  const data: Record<string, Array<{ timestamp: string; price: number }>> = {};
  
  const stocks = ['AAPL', 'GOOGL', 'MSFT'];
  const basePrices = { AAPL: 150, GOOGL: 2800, MSFT: 300 };
  
  stocks.forEach(stock => {
    data[stock] = [];
    let currentPrice = basePrices[stock as keyof typeof basePrices];
    
    // Generate 20 data points over the last 2 hours
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 6 * 60 * 1000); // Every 6 minutes
      
      // Add some random price movement
      const change = (Math.random() - 0.5) * 10; // Random change between -5 and +5
      currentPrice += change;
      
      data[stock].push({
        timestamp: timestamp.toISOString(),
        price: Math.round(currentPrice * 100) / 100 // Round to 2 decimal places
      });
    }
  });
  
  return data;
};

function App() {
  const [stockData, setStockData] = useState<Record<string, Array<{ timestamp: string; price: number }>>>({});
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['AAPL', 'GOOGL']);

  useEffect(() => {
    // Generate initial data
    const data = generateSampleData();
    setStockData(data);
    
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      const newData = generateSampleData();
      setStockData(newData);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Stock Price Monitor
            </Typography>
            
            <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Real-time stock price visualization
            </Typography>
            
            {Object.keys(stockData).length > 0 ? (
              <StockChart 
                data={stockData}
                selectedStocks={selectedStocks}
                showAverage={true}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6">Loading stock data...</Typography>
              </Box>
            )}
          </Box>
        </Container>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
