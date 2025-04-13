'use client';
import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton, 
  ListItemIcon,
  ListItemText,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  ShoppingCart,
  Inventory,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  Category,
  AddShoppingCart,
  Receipt
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation'; 

const drawerWidth = 240;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [inventoryOpen, setInventoryOpen] = React.useState(true);
  const [salesOpen, setSalesOpen] = React.useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    {
      text: 'Sales',
      icon: <ShoppingCart />,
      children: [
        { text: 'New Sale', icon: <AddShoppingCart />, path: '/sales/new' },
        { text: 'Sales List', icon: <Receipt />, path: '/sales' },
        { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
      ]
    },
    {
      text: 'Inventory',
      icon: <Inventory />,
      children: [
        { text: 'Products', icon: <Inventory />, path: '/products' },
        { text: 'Categories', icon: <Category />, path: '/categories' },
        { text: 'Stock Alerts', icon: <Inventory />, path: '/inventory/alerts' },
      ]
    },
    {
      text: 'Purchase',
      icon: <AddShoppingCart />,
      children: [
        { text: 'New Purchase', icon: <AddShoppingCart />, path: '/purchase-orders/new' },
        { text: 'Purchase Orders', icon: <Receipt />, path: '/purchase-orders' },
      ]
    },
    { text: 'Parties', icon: <People />, path: '/parties' },
    { text: 'Reports', icon: <Receipt />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isSelected = (path: string) => pathname === path;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Add logout logic here
    router.push('/auth/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Business Management
            </Typography>
          </Box>
           
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              item.children ? (
                <React.Fragment key={item.text}>
                  <ListItemButton onClick={() => {
                    if (item.text === 'Inventory') setInventoryOpen(!inventoryOpen);
                    if (item.text === 'Sales') setSalesOpen(!salesOpen);
                  }}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {(item.text === 'Inventory' ? inventoryOpen : salesOpen) ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse 
                    in={item.text === 'Inventory' ? inventoryOpen : salesOpen} 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.text}
                          sx={{ pl: 4 }}
                          selected={isSelected(child.path)}
                          onClick={() => handleNavigation(child.path)}
                        >
                          <ListItemIcon>{child.icon}</ListItemIcon>
                          <ListItemText primary={child.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItemButton
                  key={item.text}
                  selected={isSelected(item.path)}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              )
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}