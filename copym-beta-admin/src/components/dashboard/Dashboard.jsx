import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Token as TokenIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  MonitorHeart as MonitorIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import './Dashboard.css';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', color: '#667eea' },
  { text: 'Client & Leads', icon: <PeopleIcon />, path: '/admin/clients', color: '#764ba2' },
  { text: 'User Management', icon: <PersonIcon />, path: '/admin/users', color: '#f093fb' },
  { text: 'Asset Management', icon: <AccountBalanceIcon />, path: '/admin/assets', color: '#f5576c' },
  { text: 'Token Management', icon: <TokenIcon />, path: '/admin/tokens', color: '#4facfe' },
  { text: 'KYC Management', icon: <VerifiedUserIcon />, path: '/admin/kyc', color: '#43e97b' },
  { text: 'Compliance Center', icon: <SecurityIcon />, path: '/admin/compliance', color: '#38f9d7' },
  { text: 'Security Center', icon: <SecurityIcon />, path: '/admin/security', color: '#ffecd2' },
  { text: 'Regulatory Reports', icon: <AssessmentIcon />, path: '/admin/reports', color: '#fcb69f' },
  { text: 'Transaction Monitor', icon: <MonitorIcon />, path: '/admin/transactions', color: '#667eea' },
  { text: 'Wallet Management', icon: <WalletIcon />, path: '/admin/wallets', color: '#764ba2' },
  { text: 'Investment Management', icon: <BusinessIcon />, path: '/admin/investments', color: '#f5576c' },
  { text: 'DID Management', icon: <BadgeIcon />, path: '/admin/did', color: '#4facfe' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('dashboardAccess');
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div className="dashboard-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">♦</span>
          <Typography variant="h6" className="logo-text">
            Blockchain Admin
          </Typography>
        </div>
      </div>

      <Divider className="sidebar-divider" />

      {/* Navigation Menu */}
      <List className="sidebar-menu">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding className="menu-item">
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              className={`menu-button ${location.pathname === item.path ? 'active' : ''}`}
              sx={{
                '&.active': {
                  background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)`,
                  borderRight: `3px solid ${item.color}`,
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color,
                    fontWeight: 600,
                  }
                }
              }}
            >
              <ListItemIcon className="menu-icon">
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                className="menu-text"
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>


    </div>
  );

  return (
    <Box sx={{ display: 'flex' }} className="dashboard-container">
      <CssBaseline />
      
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        className="dashboard-appbar"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar className="appbar-toolbar">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Top Bar Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Search">
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    background: 'rgba(255,255,255,0.2)'
                  }}
                >
                  {user?.firstName?.[0] || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
        className="dashboard-main"
      >
        <Toolbar />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </Box>
    </Box>
  );
};

export default Dashboard; 