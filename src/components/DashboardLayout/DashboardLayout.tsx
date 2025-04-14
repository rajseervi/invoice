"use client"
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  ShoppingCart,
  Assessment,
  Settings,
  People,
  Notifications,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { 
    text: 'Inventory', 
    icon: <Inventory />, 
    path: '/inventory',
    subItems: [
      { text: 'Overview', path: '/inventory' },
      { text: 'Alerts', path: '/inventory/alerts' },
      { text: 'Products', path: '/products' },
      { text: 'Categories', path: '/categories' }
    ]
  },
  { text: 'Sales', icon: <ShoppingCart />, path: '/sales' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Inventory: true // Default expanded state
  });
  const router = useRouter();
  const pathname = usePathname();
  
  const handleMenuToggle = (text: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ marginRight: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>P</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            ...(open ? {
              transition: theme =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            } : {
              width: theme => theme.spacing(7),
              transition: theme =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              overflowX: 'hidden',
            }),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={pathname === item.path || pathname?.startsWith(item.path + '/')}
                    onClick={() => {
                      if (item.subItems) {
                        handleMenuToggle(item.text);
                      } else {
                        router.push(item.path);
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                    {item.subItems && open && (
                      expandedMenus[item.text] ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                
                {item.subItems && (
                  <Collapse in={open && expandedMenus[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          selected={pathname === subItem.path}
                          onClick={() => router.push(subItem.path)}
                          sx={{
                            pl: 4,
                            minHeight: 40,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CircleIcon sx={{ fontSize: 8 }} />
                          </ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
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