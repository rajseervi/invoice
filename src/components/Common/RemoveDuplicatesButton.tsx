import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { removeDuplicateProducts } from '@/utils/productUtils';

interface RemoveDuplicatesButtonProps {
  onSuccess?: () => void;
}

export const RemoveDuplicatesButton: React.FC<RemoveDuplicatesButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleRemoveDuplicates = async () => {
    if (!window.confirm('Are you sure you want to remove duplicate products? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeDuplicateProducts();
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });

      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while removing duplicates.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Button
        variant="contained"
        color="warning"
        onClick={handleRemoveDuplicates}
        disabled={loading}
      >
        {loading ? 'Removing Duplicates...' : 'Remove Duplicate Products'}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};