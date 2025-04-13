"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/app/components/Layout/Layout';
import InvoiceForm from '@/app/invoices/components/InvoiceForm';
import { Container, Typography, Box, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = useParams();

  const handleSuccess = () => {
    router.push('/invoices');
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            component={Link}
            href="/invoices"
            startIcon={<ArrowBackIcon />}
          >
            Back to Invoices
          </Button>
          <Typography variant="h5">
            Edit Invoice
          </Typography>
        </Box>
        <InvoiceForm onSuccess={handleSuccess} invoiceId={id as string} />
      </Container>
    </Layout>
  );
}