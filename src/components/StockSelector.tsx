import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  Typography,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { StockInfo } from '../types';

interface StockSelectorProps {
  stocks: StockInfo;
  selectedStocks: string[];
  onSelectionChange: (stocks: string[]) => void;
  maxSelection?: number;
  disabled?: boolean;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedStocks,
  onSelectionChange,
  maxSelection = 10,
  disabled = false,
}) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if stocks data is loaded
  useEffect(() => {
    const stockEntries = Object.entries(stocks || {});
    setIsLoading(stockEntries.length === 0);
  }, [stocks]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    try {
      const value = event.target.value as string[];
      
      // Validate selection limit
      if (value.length > maxSelection) {
        setError(`Maximum ${maxSelection} stocks can be selected`);
        return;
      }
      
      // Validate that all selected stocks exist in the stocks list
      const validStocks = value.filter(ticker => stocks && stocks[ticker]);
      if (validStocks.length !== value.length) {
        setError('Some selected stocks are no longer available');
        return;
      }
      
      setError('');
      onSelectionChange(validStocks);
    } catch (err) {
      console.error('Error in stock selection:', err);
      setError('An error occurred while selecting stocks');
    }
  };

  const handleDelete = (stockToDelete: string) => {
    try {
      const newSelection = selectedStocks.filter(stock => stock !== stockToDelete);
      onSelectionChange(newSelection);
      setError('');
    } catch (err) {
      console.error('Error deleting stock:', err);
      setError('An error occurred while removing the stock');
    }
  };

  // Ensure stocks is an object and get entries safely
  const stockEntries = React.useMemo(() => {
    if (!stocks || typeof stocks !== 'object') {
      return [];
    }
    return Object.entries(stocks).filter(([ticker, name]) => 
      ticker && typeof ticker === 'string' && 
      name && typeof name === 'string'
    );
  }, [stocks]);

  // Filter out invalid selected stocks
  const validSelectedStocks = React.useMemo(() => {
    if (!selectedStocks || !Array.isArray(selectedStocks)) {
      return [];
    }
    return selectedStocks.filter(ticker => 
      ticker && typeof ticker === 'string' && stocks && stocks[ticker]
    );
  }, [selectedStocks, stocks]);

  // Update parent if selected stocks were filtered
  useEffect(() => {
    if (validSelectedStocks.length !== selectedStocks.length) {
      onSelectionChange(validSelectedStocks);
    }
  }, [validSelectedStocks, selectedStocks, onSelectionChange]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="textSecondary">
          Loading stocks...
        </Typography>
      </Box>
    );
  }

  if (stockEntries.length === 0) {
    return (
      <Alert severity="warning" sx={{ width: '100%' }}>
        No stocks available. Please check your connection and try again.
      </Alert>
    );
  }

  return (
    <Box>
      <FormControl fullWidth error={!!error} disabled={disabled}>
        <InputLabel id="stock-selector-label">Select Stocks</InputLabel>
        <Select
          labelId="stock-selector-label"
          multiple
          value={validSelectedStocks}
          onChange={handleChange}
          input={<OutlinedInput label="Select Stocks" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((ticker) => {
                const stockName = stocks[ticker];
                return (
                  <Chip
                    key={ticker}
                    label={ticker}
                    title={stockName} // Show full name on hover
                    size="small"
                    onDelete={disabled ? undefined : () => handleDelete(ticker)}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                    sx={{
                      maxWidth: 120,
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }
                    }}
                  />
                );
              })}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                width: 280,
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {stockEntries.map(([ticker, name]) => (
            <MenuItem 
              key={ticker} 
              value={ticker}
              disabled={
                validSelectedStocks.length >= maxSelection && 
                !validSelectedStocks.includes(ticker)
              }
            >
              <Box sx={{ width: '100%' }}>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {ticker}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block'
                  }}
                >
                  {name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          {validSelectedStocks.length}/{maxSelection} stocks selected
        </Typography>
        {stockEntries.length > 0 && (
          <Typography variant="caption" color="textSecondary">
            {stockEntries.length} stocks available
          </Typography>
        )}
      </Box>
    </Box>
  );
};