import React from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface CorrelationHeatmapProps {
  data: Record<string, any[]>;
  selectedStocks: string[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  data,
  selectedStocks
}) => {
  // Calculate correlation matrix here
  const calculateCorrelation = (stock1Data: number[], stock2Data: number[]): number => {
    // Simple correlation calculation - implement your logic here
    return Math.random() * 2 - 1; // Placeholder
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Correlation Matrix
      </Typography>
      <Box>
        {selectedStocks.length >= 2 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {selectedStocks.map(stock => (
                    <TableCell key={stock} align="center">{stock}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedStocks.map(stock1 => (
                  <TableRow key={stock1}>
                    <TableCell component="th" scope="row">{stock1}</TableCell>
                    {selectedStocks.map(stock2 => (
                      <TableCell key={stock2} align="center">
                        {stock1 === stock2 ? '1.00' : '0.00'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Select at least 2 stocks to view correlation matrix
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
