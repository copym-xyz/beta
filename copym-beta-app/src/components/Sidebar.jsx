import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer, Avatar, Typography, Button, Box, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  AccountCircle, 
  Token, 
  Dashboard as DashboardIcon, 
  Logout,
  TrendingUp,
  Security,
  Badge
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tokenize Asset', icon: <Token />, path: '/tokenize' },
    { text: 'Portfolio', icon: <TrendingUp />, path: '/portfolio' },
    { text: 'SBT', icon: <Badge />, path: '/sbt' },
    { text: 'Security', icon: <Security />, path: '/security' },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a472a 0%, #0d2e1a 50%, #0a1f14 100%)',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            pointerEvents: 'none',
          }
        },
      }}
    >
      <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(34, 197, 94, 0.2)', 
              width: 90, 
              height: 90, 
              mb: 2,
              border: '3px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 600,
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            {user?.name || user?.email || 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}
          >
            Premium Member
          </Typography>
        </Box>

        <Divider sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)', 
          mb: 3,
          '&::before, &::after': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }
        }} />

        {/* Navigation Menu */}
        <List sx={{ mb: 3 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
            <ListItem
              key={index}
              button
                component={Link}
                to={item.path}
              sx={{
                mb: 1,
                borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  transform: 'translateX(4px)',
                  transition: 'all 0.3s ease',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ 
                  color: isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.7)',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{
                  '& .MuiTypography-root': {
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                      fontWeight: isActive ? 600 : 400,
                    fontSize: '0.95rem',
                  }
                }}
              />
            </ListItem>
            );
          })}
        </List>

        <Divider sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)', 
          mb: 3 
        }} />

        {/* Action Buttons */}
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Token sx={{ mr: 1, fontSize: 20 }} />
            Tokenize Asset
          </Button>
        </Box>

        {/* Logout Section */}
        <Box sx={{ mt: 'auto' }}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={logout}
            startIcon={<Logout />}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              fontWeight: 500,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
