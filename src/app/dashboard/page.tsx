"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Divider, 
  Paper,Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  ReceiptLong as InvoiceIcon, 
  People as PeopleIcon, 
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Layout from '@/app/components/Layout/Layout';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import chart components to avoid SSR issues
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalParties: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const salesData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 }
  ];
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch invoices count and recent invoices
        const invoicesCollection = collection(db, 'invoices');
        const invoicesSnapshot = await getDocs(invoicesCollection);
        
        // Get total invoices count
        const invoicesCount = invoicesSnapshot.size;
        
        // Calculate total revenue
        let totalRevenue = 0;
        invoicesSnapshot.forEach(doc => {
          const invoiceData = doc.data();
          if (invoiceData.total) {
            totalRevenue += invoiceData.total;
          }
        });
        
        // Get recent invoices
        const recentInvoicesQuery = query(
          collection(db, 'invoices'),
          orderBy('date', 'desc'),
          limit(5)
        );
        const recentInvoicesSnapshot = await getDocs(recentInvoicesQuery);
        const recentInvoicesList = recentInvoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch parties count
        const partiesCollection = collection(db, 'parties');
        const partiesSnapshot = await getDocs(partiesCollection);
        const partiesCount = partiesSnapshot.size;
        
        // Fetch products count
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsCount = productsSnapshot.size;
        
        // Update state
        setStats({
          totalInvoices: invoicesCount,
          totalParties: partiesCount,
          totalProducts: productsCount,
          totalRevenue: totalRevenue,
        });
        
        setRecentInvoices(recentInvoicesList);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100vh - 64px)' 
        }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ 
        width: '100%', 
        p: { xs: 1, sm: 2, md: 3 },
        overflow: 'hidden'
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ px: 1 }}>
          Dashboard
        </Typography>
      
        {/* Stats Cards - Full Width Flex Layout */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3,
          width: '100%'
        }}>
          <Card 
            elevation={2} 
            sx={{ 
              flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ 
              p: 2,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: { xs: 40, sm: 56 }, 
                height: { xs: 40, sm: 56 }, 
                mb: 1 
              }}>
                <InvoiceIcon />
              </Avatar>
              <Typography variant={isMobile ? "h6" : "h5"} component="div">
                {stats.totalInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={2} 
            sx={{ 
              flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ 
              p: 2,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: { xs: 40, sm: 56 }, 
                height: { xs: 40, sm: 56 }, 
                mb: 1 
              }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant={isMobile ? "h6" : "h5"} component="div">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={2} 
            sx={{ 
              flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ 
              p: 2,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar sx={{ 
                bgcolor: 'warning.main', 
                width: { xs: 40, sm: 56 }, 
                height: { xs: 40, sm: 56 }, 
                mb: 1 
              }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant={isMobile ? "h6" : "h5"} component="div">
                {stats.totalParties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Parties
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={2} 
            sx={{ 
              flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ 
              p: 2,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar sx={{ 
                bgcolor: 'info.main', 
                width: { xs: 40, sm: 56 }, 
                height: { xs: 40, sm: 56 }, 
                mb: 1 
              }}>
                <InventoryIcon />
              </Avatar>
              <Typography variant={isMobile ? "h6" : "h5"} component="div">
                {stats.totalProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* Quick Actions - Full Width Flex Layout */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            mb: 3,
            width: '100%'
          }}
        >
          <Typography variant="h6" component="div">
            Quick Actions
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            width: '100%'
          }}>
            {/* Invoice Actions */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Invoices
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                href="/invoices/new"
                startIcon={<InvoiceIcon />}
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                Create New Invoice
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                component={Link}
                href="/invoices"
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                View All Invoices
              </Button>
            </Box>
            
            {/* Products/Categories Actions */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Products & Categories
              </Typography>
              <Button 
                variant="contained" 
                color="secondary"
                component={Link}
                href="/products/new"
                startIcon={<InventoryIcon />}
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                Add New Product
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                component={Link}
                href="/categories/new"
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                Create New Category
              </Button>
            </Box>
            
            {/* Parties Actions */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Parties
              </Typography>
              <Button 
                variant="contained" 
                color="info"
                component={Link}
                href="/parties/new"
                startIcon={<PeopleIcon />}
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                Add New Party
              </Button>
              <Button 
                variant="outlined" 
                color="info"
                component={Link}
                href="/parties"
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                View All Parties
              </Button>
            </Box>
            
            {/* Reports Actions */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Reports
              </Typography>
              <Button 
                variant="contained" 
                color="success"
                component={Link}
                href="/reports/sales"
                startIcon={<TrendingUpIcon />}
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                Sales Report
              </Button>
              <Button 
                variant="outlined" 
                color="success"
                component={Link}
                href="/reports"
                fullWidth
                sx={{ borderRadius: 2, py: 1 }}
              >
                All Reports
              </Button>
            </Box>
          </Box>
        </Paper>
        
        {/* Charts and Recent Invoices - Full Width Flex Layout */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          width: '100%'
        }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              height: { xs: 300, sm: 400 },
              flex: { xs: '1 1 100%', lg: '1 1 calc(66.666% - 8px)' },
              minWidth: { xs: '100%', lg: 'calc(66.666% - 8px)' },
              overflow: 'hidden'
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Sales Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ width: '100%', height: '85%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" name="Sales Amount" fill="#4dabf5" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              height: { xs: 'auto', lg: 400 },
              flex: { xs: '1 1 100%', lg: '1 1 calc(33.333% - 8px)' },
              minWidth: { xs: '100%', lg: 'calc(33.333% - 8px)' },
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Recent Invoices
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ 
              width: '100%', 
              overflow: 'auto', 
              flexGrow: 1,
              maxHeight: { xs: 300, lg: 280 }
            }}>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <ListItem
                    key={invoice.id}
                    component={Link}
                    href={`/invoices/${invoice.id}`}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <InvoiceIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={invoice.partyName}
                      secondary={
                        <>
                          {invoice.invoiceNumber} - {invoice.date}
                          <Typography component="span" sx={{ display: 'block', fontWeight: 'bold' }}>
                            ₹{invoice.total?.toLocaleString('en-IN') || '0.00'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No invoices found
                </Typography>
              )}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button
                component={Link}
                href="/invoices"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                View All Invoices
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}