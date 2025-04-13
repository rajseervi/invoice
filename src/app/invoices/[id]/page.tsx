"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Layout from '@/app/components/Layout/Layout';
import InvoicePDF from '../components/InvoicePDF';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Invoice ID is missing');
          return;
        }
        
        const invoiceRef = doc(db, 'invoices', id as string);
        const invoiceSnap = await getDoc(invoiceRef);
        
        if (!invoiceSnap.exists()) {
          setError('Invoice not found');
          return;
        }
        
        const invoiceData = {
          id: invoiceSnap.id,
          ...invoiceSnap.data()
        };
        
        setInvoice(invoiceData);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (error || !invoice) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error || 'Failed to load invoice'}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button 
              component={Link} 
              href="/invoices" 
              startIcon={<ArrowBackIcon />}
            >
              Back to Invoices
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button 
            component={Link} 
            href="/invoices" 
            startIcon={<ArrowBackIcon />}
          >
            Back to Invoices
          </Button>
          
          <InvoicePDF invoice={invoice} />
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">INVOICE</Typography>
            <Box>
              <Typography variant="h6">{invoice.invoiceNumber}</Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {invoice.date}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                BILL TO:
              </Typography>
              <Typography variant="h6">{invoice.partyName}</Typography>
              {invoice.partyAddress && (
                <Typography variant="body2">{invoice.partyAddress}</Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  INVOICE TOTAL:
                </Typography>
                <Typography variant="h4">₹{invoice.total.toFixed(2)}</Typography>
              </Box>
            </Grid>
          </Grid>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      {item.discount > 0 ? `${item.discount}%` : '-'}
                    </TableCell>
                    <TableCell align="right">₹{item.finalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                
                {/* Summary rows */}
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="subtitle2">Subtotal:</Typography>
                  </TableCell>
                  <TableCell align="right">₹{invoice.subtotal.toFixed(2)}</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="subtitle2">Discount:</Typography>
                  </TableCell>
                  <TableCell align="right">₹{invoice.discount.toFixed(2)}</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      ₹{invoice.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Thank you for your business!
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}