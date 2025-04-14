"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Divider, 
  Alert, 
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  useTheme,
  alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CompanyInfo } from '@/models/CompanyInfo';
import { Save as SaveIcon, Business as BusinessIcon } from '@mui/icons-material';

export default function CompanyInfoForm() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    shortName: '',
    tagline: '',
    description: '',
    plan: {
      name: 'Basic Plan',
      expiryDate: new Date(new Date().getFullYear() + 1, 11, 31),
      maxUsers: 5,
      currentUsers: 1,
      isActive: true
    },
    contact: {
      email: '',
      phone: '',
      address: '',
      website: ''
    }
  });

  // Fetch company information on component mount
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/company');
        
        if (!response.ok) {
          throw new Error('Failed to fetch company information');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convert string dates to Date objects
          const data = result.data;
          if (data.plan && data.plan.expiryDate) {
            data.plan.expiryDate = new Date(data.plan.expiryDate);
          }
          
          setCompanyInfo(data);
        }
      } catch (err) {
        console.error('Error fetching company info:', err);
        setError('Failed to load company information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyInfo();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCompanyInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyInfo],
          [child]: value
        }
      }));
    } else {
      setCompanyInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle select field changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCompanyInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyInfo],
          [child]: value
        }
      }));
    } else {
      setCompanyInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (date: Date | null, fieldName: string) => {
    if (!date) return;
    
    // Handle nested date properties
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      setCompanyInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyInfo],
          [child]: date
        }
      }));
    } else {
      setCompanyInfo(prev => ({
        ...prev,
        [fieldName]: date
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save company information');
      }
      
      setSuccess('Company information saved successfully');
      
      // Update the form with the returned data
      if (result.data) {
        // Convert string dates to Date objects
        const data = result.data;
        if (data.plan && data.plan.expiryDate) {
          data.plan.expiryDate = new Date(data.plan.expiryDate);
        }
        
        setCompanyInfo(data);
      }
    } catch (err: any) {
      console.error('Error saving company info:', err);
      setError(err.message || 'Failed to save company information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccess(null);
    setError(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card 
        elevation={0}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2">
              Company Information
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Company Name"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Short Name / Acronym"
                  name="shortName"
                  value={companyInfo.shortName}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Used for logo and branding"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tagline"
                  name="tagline"
                  value={companyInfo.tagline}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={companyInfo.description}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              
              {/* Subscription Plan */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Subscription Plan
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="plan-name-label">Plan</InputLabel>
                  <Select
                    labelId="plan-name-label"
                    label="Plan"
                    name="plan.name"
                    value={companyInfo.plan.name}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Basic Plan">Basic Plan</MenuItem>
                    <MenuItem value="Standard Plan">Standard Plan</MenuItem>
                    <MenuItem value="Premium Plan">Premium Plan</MenuItem>
                    <MenuItem value="Enterprise Plan">Enterprise Plan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expiry Date"
                    value={companyInfo.plan.expiryDate}
                    onChange={(date) => handleDateChange(date, 'plan.expiryDate')}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Users"
                  name="plan.maxUsers"
                  value={companyInfo.plan.maxUsers}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Current Users"
                  name="plan.currentUsers"
                  value={companyInfo.plan.currentUsers}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="plan-status-label">Plan Status</InputLabel>
                  <Select
                    labelId="plan-status-label"
                    label="Plan Status"
                    name="plan.isActive"
                    value={companyInfo.plan.isActive}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                  <FormHelperText>
                    {companyInfo.plan.isActive ? 'Your subscription is active' : 'Your subscription is inactive'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="contact.email"
                  value={companyInfo.contact?.email || ''}
                  onChange={handleChange}
                  variant="outlined"
                  type="email"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="contact.phone"
                  value={companyInfo.contact?.phone || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="contact.address"
                  value={companyInfo.contact?.address || ''}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  name="contact.website"
                  value={companyInfo.contact?.website || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={saving}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {saving ? 'Saving...' : 'Save Company Information'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      {/* Success/Error Snackbars */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}