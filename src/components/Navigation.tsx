import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { 
  TrendingUp, 
  Analytics, 
  Menu as MenuIcon 
} from '@mui/icons-material';

interface NavigationProps {
  currentPage: 'stocks' | 'correlation';
  onPageChange: (page: 'stocks' | 'correlation') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePageSelect = (page: 'stocks' | 'correlation') => {
    onPageChange(page);
    handleMenuClose();
  };

  const navigationItems = [
    {
      key: 'stocks' as const,
      label: 'Stock Analysis',
      icon: <TrendingUp />,
    },
    {
      key: 'correlation' as const,
      label: 'Correlation Matrix',
      icon: <Analytics />,
    },
  ];

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <TrendingUp sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {isMobile ? 'Stock Analytics' : 'Stock Price Analytics'}
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.key}
                  onClick={() => handlePageSelect(item.key)}
                  selected={currentPage === item.key}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    {item.label}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                color="inherit"
                variant={currentPage === item.key ? 'outlined' : 'text'}
                startIcon={item.icon}
                onClick={() => onPageChange(item.key)}
                sx={{
                  borderColor: currentPage === item.key ? 'white' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};