"use client";
import React from 'react';
import Layout from '@/app/components/Layout/Layout';
import { Container } from '@mui/material';
import InvoiceForm from '../components/InvoiceForm';
import { useRouter } from 'next/navigation';

export default function NewInvoicePage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/invoices');
  };
  
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <InvoiceForm onSuccess={handleSuccess} />
      </Container>
    </Layout>
  );
}