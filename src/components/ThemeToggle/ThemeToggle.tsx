import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7, DarkMode, LightMode } from '@mui/icons-material';

export default function ThemeToggle() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') as 'light' | 'dark' || 'light';
    setMode(savedTheme);
  }, []);
  
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    
    // Save to localStorage
    localStorage.setItem('themeMode', newMode);
    
    // Dispatch custom event to update theme
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newMode }));
  };
  
  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        size={isMobile ? "small" : "medium"}
        sx={{ 
          ml: { xs: 0.5, sm: 1 },
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        {mode === 'light' 
          ? (isMobile ? <DarkMode fontSize="small" /> : <Brightness4 />)
          : (isMobile ? <LightMode fontSize="small" /> : <Brightness7 />)
        }
      </IconButton>
    </Tooltip>
  );
}