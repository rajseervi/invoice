"use client"
import React, { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout/Layout';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Checkbox
} from '@mui/material';
import { RemoveDuplicatesButton } from '@/components/Common/RemoveDuplicatesButton';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Define product interface
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

// Add category interface
interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkCategoryDialogOpen, setBulkCategoryDialogOpen] = useState(false);
  const [selectedBulkCategory, setSelectedBulkCategory] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      
      const productsList = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          status: data.stock < 10 ? 'Low Stock' : 'In Stock'
        };
      });
      
      setProducts(productsList);
      
      // Fetch categories
      const categoriesCollection = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      
      const categoriesList = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name
        };
      });
      
      setCategories(categoriesList);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setNewProduct({
      name: '',
      category: '',
      price: 0,
      stock: 0
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name as string]: value
    });
  };

  const handleSaveProduct = async () => {
    try {
      setLoading(true);
      
      if (selectedProduct) {
        // Update existing product in Firebase
        const productRef = doc(db, 'products', selectedProduct.id);
        await updateDoc(productRef, {
          name: newProduct.name,
          category: newProduct.category,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock)
        });
        
        // Update local state
        setProducts(products.map(p => 
          p.id === selectedProduct.id 
            ? { 
                ...p, 
                ...newProduct, 
                status: Number(newProduct.stock) < 10 ? 'Low Stock' : 'In Stock' 
              } 
            : p
        ));
      } else {
        // Create new product in Firebase
        const productsCollection = collection(db, 'products');
        const docRef = await addDoc(productsCollection, {
          name: newProduct.name,
          category: newProduct.category,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock)
        });
        
        // Add to local state
        setProducts([...products, {
          id: docRef.id,
          ...newProduct,
          status: Number(newProduct.stock) < 10 ? 'Low Stock' : 'In Stock'
        }]);
      }
      
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        
        // Delete from Firebase
        const productRef = doc(db, 'products', id);
        await deleteDoc(productRef);
        
        // Remove from local state
        setProducts(products.filter(p => p.id !== id));
        setError(null);
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkCategoryChange = async () => {
    if (!selectedBulkCategory || selectedProducts.length === 0) return;
    
    try {
      setLoading(true);
      
      // Update all selected products with new category
      const updatePromises = selectedProducts?.map(async (productId) => {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          category: selectedBulkCategory
        });
      });
      
      // Update local state
      setProducts(products.map(product => 
        selectedProducts.includes(product.id)
          ? { ...product, category: selectedBulkCategory }
          : product
      ));
      
      setSelectedProducts([]);
      setBulkCategoryDialogOpen(false);
      setSelectedBulkCategory('');
      setError(null);
    } catch (err) {
      console.error('Error updating categories:', err);
      setError('Failed to update categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Products</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <RemoveDuplicatesButton onSuccess={fetchData} />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Search Products"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
            >
              Filter
            </Button>
            {selectedProducts.length > 0 && (
              <Button
                variant="contained"
                onClick={() => setBulkCategoryDialogOpen(true)}
              >
                Update Category ({selectedProducts.length})
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                      checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                      onChange={handleSelectAllProducts}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No products found</TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell>{product.id.substring(0, 8)}...</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.status} 
                          color={product.status === 'Low Stock' ? 'warning' : 'success'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEditProduct(product)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Bulk Category Update Dialog */}
      <Dialog open={bulkCategoryDialogOpen} onClose={() => setBulkCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Category for Selected Products</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={selectedBulkCategory}
                onChange={(e) => setSelectedBulkCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCategoryDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkCategoryChange} 
            variant="contained"
            disabled={loading || !selectedBulkCategory}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Product Name"
              name="name"
              fullWidth
              value={newProduct.name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No categories available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={newProduct.price}
              onChange={handleInputChange}
            />
            <TextField
              label="Stock"
              name="stock"
              type="number"
              fullWidth
              value={newProduct.stock}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Category Update Dialog */}
      <Dialog open={bulkCategoryDialogOpen} onClose={() => setBulkCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Category for Selected Products</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={selectedBulkCategory}
                onChange={(e) => setSelectedBulkCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCategoryDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkCategoryChange} 
            variant="contained"
            disabled={loading || !selectedBulkCategory}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

  const handleBulkCategoryChange = async () => {
    if (!selectedBulkCategory || selectedProducts.length === 0) return;
    
    try {
      setLoading(true);
      
      // Update all selected products with new category
      const updatePromises = selectedProducts?.map(async (productId) => {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          category: selectedBulkCategory
        });
      });
      
      // Update local state
      setProducts(products.map(product => 
        selectedProducts.includes(product.id)
          ? { ...product, category: selectedBulkCategory }
          : product
      ));
      
      setSelectedProducts([]);
      setBulkCategoryDialogOpen(false);
      setSelectedBulkCategory('');
      setError(null);
    } catch (err) {
      console.error('Error updating categories:', err);
      setError('Failed to update categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };