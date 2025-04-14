"use client"
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Define threshold for low stock
const LOW_STOCK_THRESHOLD = 10;
const CRITICAL_STOCK_THRESHOLD = 5;

// Interface for product data
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

// Interface for category data
interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function InventoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  
  // Colors for the charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  // Fetch products data
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, orderBy('stock', 'asc'));
      const productsSnapshot = await getDocs(productsQuery);
      
      const productsData = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          category: data.category || 'Uncategorized',
          price: data.price || 0,
          stock: data.stock || 0
        };
      });
      
      setProducts(productsData);
      
      // Calculate total inventory value
      const total = productsData.reduce((sum, product) => sum + (product.price * product.stock), 0);
      setTotalValue(total);
      
      // Filter low stock products
      const lowStock = productsData
        .filter(product => product.stock <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stock - b.stock);
      setLowStockProducts(lowStock);
      
      // Process category data for pie chart
      processCategoryData(productsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch inventory data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Process category data for charts
  const processCategoryData = (productsData: Product[]) => {
    // Group products by category
    const categoriesMap = new Map<string, number>();
    
    productsData.forEach(product => {
      const category = product.category || 'Uncategorized';
      const value = product.price * product.stock;
      
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, 0);
      }
      categoriesMap.set(category, (categoriesMap.get(category) || 0) + value);
    });
    
    // Convert to array for chart
    const categoryArray: CategoryData[] = [];
    let colorIndex = 0;
    
    categoriesMap.forEach((value, name) => {
      categoryArray.push({
        name,
        value,
        color: COLORS[colorIndex % COLORS.length]
      });
      colorIndex++;
    });
    
    // Sort by value (descending)
    categoryArray.sort((a, b) => b.value - a.value);
    
    setCategoryData(categoryArray);
  };
  
  // Calculate stock status percentages
  const calculateStockStatus = () => {
    const total = products.length;
    if (total === 0) return { normal: 0, low: 0, critical: 0 };
    
    const critical = products.filter(p => p.stock <= CRITICAL_STOCK_THRESHOLD).length;
    const low = products.filter(p => p.stock > CRITICAL_STOCK_THRESHOLD && p.stock <= LOW_STOCK_THRESHOLD).length;
    const normal = total - low - critical;
    
    return {
      normal: Math.round((normal / total) * 100),
      low: Math.round((low / total) * 100),
      critical: Math.round((critical / total) * 100)
    };
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const stockStatus = calculateStockStatus();
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="body2" color="text.primary">
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${payload[0].value.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {((payload[0].value / totalValue) * 100).toFixed(1)}% of inventory value
          </Typography>
        </Paper>
      );
    }
    return null;
  };
  
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Inventory Overview
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/inventory/alerts"
            endIcon={<ArrowForwardIcon />}
          >
            View Alerts
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InventoryIcon color="primary" sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      <Typography variant="subtitle1" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Total Products
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                      {products.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      <Typography variant="subtitle1" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Inventory Value
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                      ${Number(totalValue).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingDownIcon color="warning" sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      <Typography variant="subtitle1" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Low Stock
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                      {lowStockProducts.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon color="error" sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      <Typography variant="subtitle1" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Categories
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                      {categoryData.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Main Content */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Left Column - Pie Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Inventory Value by Category
                  </Typography>
                  <Box sx={{ height: { xs: 250, sm: 300 }, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={isMobile ? 80 : 100}
                          fill="#8884d8"
                          label={isMobile ? undefined : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={!isMobile}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Right Column - Stock Status */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Stock Status
                  </Typography>
                  
                  <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Normal Stock</Typography>
                      <Typography variant="body2">{stockStatus.normal}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stockStatus.normal} 
                      color="success"
                      sx={{ height: { xs: 8, sm: 10 }, borderRadius: 5, mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Low Stock</Typography>
                      <Typography variant="body2">{stockStatus.low}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stockStatus.low} 
                      color="warning"
                      sx={{ height: { xs: 8, sm: 10 }, borderRadius: 5, mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Critical Stock</Typography>
                      <Typography variant="body2">{stockStatus.critical}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stockStatus.critical} 
                      color="error"
                      sx={{ height: { xs: 8, sm: 10 }, borderRadius: 5, mb: 2 }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                    Critical Stock Items
                  </Typography>
                  
                  <List dense={isMobile}>
                    {lowStockProducts.slice(0, isMobile ? 3 : 5).map((product) => (
                      <ListItem key={product.id} divider>
                        <ListItemText
                          primary={product.name}
                          secondary={`Category: ${product.category}`}
                          primaryTypographyProps={{ 
                            noWrap: true,
                            fontSize: isMobile ? '0.875rem' : 'inherit'
                          }}
                          secondaryTypographyProps={{ 
                            noWrap: true,
                            fontSize: isMobile ? '0.75rem' : 'inherit'
                          }}
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={`Stock: ${product.stock}`} 
                            color={product.stock <= CRITICAL_STOCK_THRESHOLD ? "error" : "warning"}
                            size="small"
                            sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  {lowStockProducts.length > (isMobile ? 3 : 5) && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        href="/inventory/alerts"
                        endIcon={<ArrowForwardIcon />}
                      >
                        View All ({lowStockProducts.length})
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {/* Bottom Section - Category Details */}
              <Grid item xs={12}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Category Details
                  </Typography>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.5 }}>
                    {categoryData.slice(0, isMobile ? 3 : 6).map((category, index) => (
                      <Grid item xs={12} sm={6} md={4} key={category.name}>
                        <Card variant="outlined">
                          <CardHeader 
                            title={category.name} 
                            titleTypographyProps={{ 
                              variant: 'h6',
                              fontSize: { xs: '0.95rem', sm: '1.1rem' },
                              noWrap: true
                            }}
                            avatar={
                              <Box 
                                sx={{ 
                                  width: { xs: 12, sm: 16 }, 
                                  height: { xs: 12, sm: 16 }, 
                                  borderRadius: '50%', 
                                  bgcolor: category.color 
                                }} 
                              />
                            }
                            sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}
                          />
                          <Divider />
                          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              Value: ${Number(category.value).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {((category.value / totalValue) * 100).toFixed(1)}% of total inventory
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(category.value / totalValue) * 100} 
                              sx={{ 
                                height: { xs: 4, sm: 6 }, 
                                borderRadius: 3,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: category.color
                                }
                              }} 
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {categoryData.length > (isMobile ? 3 : 6) && (
                    <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                      <Button 
                        variant="outlined"
                        href="/products"
                        endIcon={<ArrowForwardIcon />}
                        size={isMobile ? "small" : "medium"}
                      >
                        View All Categories
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </DashboardLayout>
  );
}