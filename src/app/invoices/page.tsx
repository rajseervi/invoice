"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout/Layout';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box, 
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  partyName: string;
  total: number;
  createdAt: any;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const invoicesQuery = query(
          collection(db, 'invoices'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(invoicesQuery);
        
        const invoicesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Invoice));
        
        setInvoices(invoicesList);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);

  const handleEditInvoice = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoice) return;

    try {
      setLoading(true);
      const invoiceRef = doc(db, 'invoices', selectedInvoice.id);
      await deleteDoc(invoiceRef);

      setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id));
      setSuccessMessage('Invoice deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Invoices</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/invoices/new')}
          >
            New Invoice
          </Button>
        </Box>
        
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No invoices found</TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.partyName}</TableCell>
                        <TableCell align="right">
                          {typeof invoice.total === 'number' 
                            ? `₹${invoice.total.toFixed(2)}` 
                            : '₹0.00'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Button 
                              size="small" 
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                            >
                              View
                            </Button>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditInvoice(invoice)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(invoice)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete invoice {selectedInvoice?.invoiceNumber}? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert
            onClose={() => setSuccessMessage(null)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Error Message */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}