"use client";
import React from 'react';
import { Box, Typography, Container, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Home as HomeIcon, Settings as SettingsIcon, Business as BusinessIcon } from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import CompanyInfoForm from '@/components/settings/CompanyInfoForm';
import Link from 'next/link';

export default function CompanySettingsPage() {
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink 
            component={Link} 
            href="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            underline="hover"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </MuiLink>
          <MuiLink
            component={Link}
            href="/settings"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            underline="hover"
          >
            <SettingsIcon sx={{ mr: 0.5 }} fontSize="small" />
            Settings
          </MuiLink>
          <Typography 
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="small" />
            Company Information
          </Typography>
        </Breadcrumbs>
        
        {/* Page Header */}
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Company Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your company information and subscription details.
        </Typography>
        
        {/* Company Information Form */}
        <CompanyInfoForm />
      </Container>
    </DashboardLayout>
  );
}