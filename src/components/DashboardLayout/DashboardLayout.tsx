"use client"
import React, { useState, useEffect } from 'react';
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
  useTheme,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
  SwipeableDrawer,
  Container,
  Backdrop,
  CircularProgress,
  Chip,
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
  Person as PersonIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '../ThemeToggle';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Inventory: true // Default expanded state
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received", read: false },
    { id: 2, message: "Low stock alert: Product XYZ", read: false },
    { id: 3, message: "Payment confirmed", read: true },
    { id: 4, message: "New user registered", read: true }
  ]);
  
  const [companyInfo, setCompanyInfo] = useState<any>({
    name: 'MasterStock Inc.',
    shortName: 'MS',
    tagline: 'Inventory Management Solutions',
    plan: {
      name: 'Enterprise Plan',
      isActive: true
    }
  });
  const [loadingCompany, setLoadingCompany] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Handle window resize to collapse sidebar on small screens
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else if (isTablet) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile, isTablet]);
  
  // Fetch company information
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoadingCompany(true);
        const response = await fetch('/api/company', {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          }
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            if (data.success && data.data) {
              setCompanyInfo(data.data);
            }
          } catch (jsonError) {
            console.error('Error parsing company info JSON:', jsonError);
            // Continue with default company info
          }
        } else {
          console.warn(`Failed to fetch company info: ${response.status} ${response.statusText}`);
          // Continue with default company info
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
        // Continue with default company info
      } finally {
        setLoadingCompany(false);
      }
    };
    
    fetchCompanyInfo();
  }, []);
  
  const handleMenuToggle = (text: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };
  
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };
  
  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleProfileClick = () => {
    router.push('/profile');
    handleProfileMenuClose();
  };
  
  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logout clicked');
    handleProfileMenuClose();
  };
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(90deg, rgba(67,97,238,1) 0%, rgba(72,149,239,1) 100%)' 
            : 'linear-gradient(90deg, rgba(30,41,59,1) 0%, rgba(44,55,74,1) 100%)',
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 3 }, minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: { xs: 1, sm: 2 } }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
          
          <Box
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                lineHeight: 1.2
              }}
            >
              <Box 
                sx={{ 
                  width: { xs: 24, sm: 32 }, 
                  height: { xs: 24, sm: 32 }, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                  mr: 1
                }}
              >
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {companyInfo.shortName || 'MS'}
                </Typography>
              </Box>
              {isMobile ? (companyInfo.name.split(' ')[0] || 'MasterStock') : companyInfo.name}
            </Typography>
            {!isMobile && (
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.8,
                  fontWeight: 500,
                  ml: { sm: 4 }
                }}
              >
                {companyInfo.tagline || 'Enterprise Inventory Management System'}
              </Typography>
            )}
          </Box>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit"
              onClick={handleNotificationsOpen}
              size={isMobile ? "small" : "medium"}
            >
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <Notifications fontSize={isMobile ? "small" : "medium"} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User Profile */}
          <Tooltip title="Account">
            <IconButton 
              onClick={handleProfileMenuOpen}
              sx={{ ml: { xs: 0.5, sm: 1 } }}
              size={isMobile ? "small" : "medium"}
            >
              <Avatar 
                sx={{ 
                  width: isMobile ? 28 : 32, 
                  height: isMobile ? 28 : 32,
                  bgcolor: theme.palette.secondary.main
                }}
              >
                P
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5,
            minWidth: isMobile ? 180 : 200,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick} dense={isMobile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} dense={isMobile}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5,
            width: isMobile ? '90vw' : 'auto',
            minWidth: isMobile ? 'auto' : 300,
            maxWidth: isMobile ? '90vw' : 360,
            maxHeight: isMobile ? 'calc(100vh - 100px)' : 'auto',
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ 
          p: isMobile ? 1.5 : 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
          {isMobile && (
            <IconButton size="small" onClick={handleNotificationsClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        {notifications.length > 0 ? (
          <>
            <Box sx={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto', overflowY: 'auto' }}>
              {notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={handleNotificationsClose}
                  sx={{ 
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 1.5 : 2,
                    borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                  }}
                  dense={isMobile}
                >
                  <Typography variant={isMobile ? "caption" : "body2"}>
                    {notification.message}
                  </Typography>
                </MenuItem>
              ))}
            </Box>
            <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => {
                  router.push('/notifications');
                  handleNotificationsClose();
                }}
              >
                View All
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        )}
      </Menu>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onOpen={() => setMobileOpen(true)}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRadius: { xs: '0 16px 16px 0', sm: 0 },
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Toolbar 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              px: 2,
              minHeight: { xs: 56, sm: 64 }
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Menu
            </Typography>
            <IconButton onClick={handleDrawerClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          
          {/* Company Information */}
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {loadingCompany ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Box 
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    mx: 'auto',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(67,97,238,0.1) 0%, rgba(72,149,239,0.1) 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: theme.palette.primary.main,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {companyInfo.shortName || 'MS'}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                  {companyInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {companyInfo.tagline}
                </Typography>
                <Chip 
                  label={companyInfo.plan.name} 
                  size="small" 
                  color="primary" 
                  variant={companyInfo.plan.isActive ? "outlined" : "filled"}
                  sx={{ 
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 500
                  }}
                />
              </>
            )}
          </Box>
          
          <Divider />
          
          {/* User Profile Summary */}
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                mx: 'auto',
                mb: 1,
                bgcolor: theme.palette.secondary.main,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              P
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600}>
              Prakash Seervi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrator
            </Typography>
          </Box>
          
          <Divider />
          
          <Box 
            sx={{ 
              overflow: 'auto',
              px: 2,
              py: 2,
              height: 'calc(100% - 320px)',
              backgroundColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.primary.main, 0.03)
                : 'transparent'
            }}
          >
            <List component="nav" disablePadding>
              {menuItems.map((item) => (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={pathname === item.path || pathname?.startsWith(item.path + '/')}
                      onClick={() => {
                        if (item.subItems) {
                          handleMenuToggle(item.text);
                        } else {
                          handleNavigation(item.path);
                        }
                      }}
                      sx={{
                        minHeight: 48,
                        borderRadius: '10px',
                        '&.Mui-selected': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: 'inherit'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontWeight: pathname === item.path || pathname?.startsWith(item.path + '/') ? 600 : 500,
                        }}
                      />
                      {item.subItems && (
                        expandedMenus[item.text] ? <ExpandLess /> : <ExpandMore />
                      )}
                    </ListItemButton>
                  </ListItem>
                  
                  {item.subItems && (
                    <Collapse in={expandedMenus[item.text]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.subItems.map((subItem) => (
                          <ListItemButton
                            key={subItem.text}
                            selected={pathname === subItem.path}
                            onClick={() => handleNavigation(subItem.path)}
                            sx={{
                              pl: 4,
                              minHeight: 40,
                              borderRadius: '10px',
                              mb: 0.5,
                              '&.Mui-selected': {
                                color: theme.palette.primary.main,
                              }
                            }}
                          >
                            <ListItemIcon 
                              sx={{ 
                                minWidth: 24, 
                                mr: 2,
                                color: 'inherit'
                              }}
                            >
                              <CircleIcon sx={{ fontSize: 8 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text} 
                              primaryTypographyProps={{ 
                                fontWeight: pathname === subItem.path ? 600 : 400,
                                fontSize: '0.85rem'
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>
      </SwipeableDrawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
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
        <Toolbar 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          {open && (
            <IconButton onClick={() => setOpen(false)}>
              <ChevronLeft />
            </IconButton>
          )}
        </Toolbar>
        <Divider />
        
        {/* Company Information */}
        {open && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {loadingCompany ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(67,97,238,0.1) 0%, rgba(72,149,239,0.1) 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: theme.palette.primary.main,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {companyInfo.shortName || 'MS'}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                  {companyInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {companyInfo.tagline}
                </Typography>
                <Chip 
                  label={companyInfo.plan.name} 
                  size="small" 
                  color="primary" 
                  variant={companyInfo.plan.isActive ? "outlined" : "filled"}
                  sx={{ 
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 500
                  }}
                />
              </>
            )}
          </Box>
        )}
        
        <Divider />
        
        {/* User Profile Summary */}
        {open && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                mx: 'auto',
                mb: 1,
                bgcolor: theme.palette.secondary.main,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              P
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600}>
              Prakash Seervi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        )}
        
        <Divider />
        
        <Box 
          sx={{ 
            overflow: 'auto',
            px: open ? 2 : 1,
            py: 2,
            height: '100%',
            backgroundColor: theme.palette.mode === 'light' 
              ? alpha(theme.palette.primary.main, 0.03)
              : 'transparent'
          }}
        >
          <List component="nav" disablePadding>
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                <Tooltip 
                  title={!open ? item.text : ""}
                  placement="right"
                  arrow
                  disableHoverListener={open}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
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
                        borderRadius: '10px',
                        '&.Mui-selected': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: 'inherit'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {open && (
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{ 
                            fontWeight: pathname === item.path || pathname?.startsWith(item.path + '/') ? 600 : 500,
                            fontSize: '0.9rem'
                          }}
                        />
                      )}
                      {item.subItems && open && (
                        expandedMenus[item.text] ? <ExpandLess /> : <ExpandMore />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                
                {item.subItems && (
                  <Collapse in={open && expandedMenus[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <Tooltip 
                          key={subItem.text}
                          title={!open ? subItem.text : ""}
                          placement="right"
                          arrow
                          disableHoverListener={open}
                        >
                          <ListItemButton
                            selected={pathname === subItem.path}
                            onClick={() => router.push(subItem.path)}
                            sx={{
                              pl: 4,
                              minHeight: 40,
                              borderRadius: '10px',
                              mb: 0.5,
                              '&.Mui-selected': {
                                color: theme.palette.primary.main,
                              }
                            }}
                          >
                            <ListItemIcon 
                              sx={{ 
                                minWidth: 24, 
                                mr: open ? 2 : 'auto',
                                color: 'inherit'
                              }}
                            >
                              <CircleIcon sx={{ fontSize: 8 }} />
                            </ListItemIcon>
                            {open && (
                              <ListItemText 
                                primary={subItem.text} 
                                primaryTypographyProps={{ 
                                  fontWeight: pathname === subItem.path ? 600 : 400,
                                  fontSize: '0.85rem'
                                }}
                              />
                            )}
                          </ListItemButton>
                        </Tooltip>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Backdrop for mobile */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer - 1,
          display: { xs: 'block', md: 'none' }
        }}
        open={mobileOpen}
        onClick={handleDrawerClose}
      />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1.5, sm: 2, md: 3 },
          backgroundColor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.primary.main, 0.02)
            : 'transparent',
          minHeight: '100vh',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: '100%',
          ...(open && {
            width: { md: `calc(100% - ${drawerWidth}px)` },
            marginLeft: { md: `${drawerWidth}px` },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Container 
          maxWidth="xl" 
          disableGutters 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            maxWidth: '100%',
            animation: 'fadeIn 0.5s',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              },
            },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}