'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Box,
  Divider,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Get the theme preference from localStorage on component mount
    const savedTheme = localStorage.getItem('themeMode');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newThemeMode = event.target.checked ? 'dark' : 'light';
    setIsDarkMode(event.target.checked);
    localStorage.setItem('themeMode', newThemeMode);
    // Theme change will be handled by ThemeRegistry
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newThemeMode }));
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Theme Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={handleThemeChange}
                  icon={<LightModeIcon />}
                  checkedIcon={<DarkModeIcon />}
                />
              }
              label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
            />
          </Box>

          <Divider sx={{ my: 3 }} />
          
          {/* Additional settings sections can be added here */}
        </Paper>
      </Container>
    </DashboardLayout>
  );
}