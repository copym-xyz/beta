import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AccountBalance,
  Security,
  Notifications,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Token,
  VerifiedUser,
  MonitorHeart,
  AttachMoney,
  Speed,
  Assessment
} from '@mui/icons-material';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: '12,459',
      change: '+12.5%',
      trend: 'up',
      icon: <People />,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)'
    },
    {
      title: 'Active Tokens',
      value: '847',
      change: '+8.2%',
      trend: 'up',
      icon: <Token />,
      color: '#f5576c',
      bgColor: 'rgba(245, 87, 108, 0.1)'
    },
    {
      title: 'Total Assets',
      value: '$2.4M',
      change: '+15.3%',
      trend: 'up',
      icon: <AccountBalance />,
      color: '#4facfe',
      bgColor: 'rgba(79, 172, 254, 0.1)'
    },
    {
      title: 'Security Score',
      value: '98.5%',
      change: '+2.1%',
      trend: 'up',
      icon: <Security />,
      color: '#43e97b',
      bgColor: 'rgba(67, 233, 123, 0.1)'
    }
  ];

  const recentActivities = [
    {
      type: 'user',
      title: 'New user registration',
      description: 'John Doe completed KYC verification',
      time: '2 minutes ago',
      avatar: 'JD',
      color: '#667eea'
    },
    {
      type: 'token',
      title: 'Token minted',
      description: 'PROP-001 token created successfully',
      time: '15 minutes ago',
      avatar: 'T',
      color: '#f5576c'
    },
    {
      type: 'security',
      title: 'Security alert',
      description: 'Suspicious login attempt blocked',
      time: '1 hour ago',
      avatar: 'S',
      color: '#43e97b'
    },
    {
      type: 'transaction',
      title: 'Large transaction',
      description: '$50,000 asset transfer approved',
      time: '2 hours ago',
      avatar: '$',
      color: '#4facfe'
    }
  ];

  const performanceMetrics = [
    { label: 'System Uptime', value: 99.9, color: '#43e97b' },
    { label: 'Transaction Success', value: 98.7, color: '#4facfe' },
    { label: 'KYC Completion', value: 85.3, color: '#f5576c' },
    { label: 'User Satisfaction', value: 94.2, color: '#667eea' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <Box className="dashboard-header" mb={4}>
        <Typography variant="h4" className="welcome-title">
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" className="welcome-subtitle">
          Here's what's happening with your blockchain platform today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="stats-card" sx={{ background: stat.bgColor }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Avatar 
                    sx={{ 
                      background: stat.color, 
                      width: 48, 
                      height: 48,
                      boxShadow: `0 4px 12px ${stat.color}40`
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                
                <Typography variant="h4" className="stats-value" mb={1}>
                  {stat.value}
                </Typography>
                
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" className="stats-label">
                    {stat.title}
                  </Typography>
                  <Chip
                    icon={stat.trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                    label={stat.change}
                    size="small"
                    sx={{
                      background: stat.trend === 'up' ? '#43e97b20' : '#f5576c20',
                      color: stat.trend === 'up' ? '#43e97b' : '#f5576c',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Metrics */}
        <Grid item xs={12} md={8}>
          <Card className="performance-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" className="section-title">
                  Performance Metrics
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Assessment />}
                  sx={{ borderColor: '#667eea', color: '#667eea' }}
                >
                  View Details
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {performanceMetrics.map((metric, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box className="metric-item">
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" className="metric-label">
                          {metric.label}
                        </Typography>
                        <Typography variant="body2" className="metric-value">
                          {metric.value}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={metric.value}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: `${metric.color}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: metric.color,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card className="activities-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" className="section-title">
                  Recent Activities
                </Typography>
                <IconButton size="small">
                  <Notifications />
                </IconButton>
              </Box>
              
              <List className="activities-list">
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem className="activity-item">
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            background: activity.color,
                            width: 40,
                            height: 40,
                            fontSize: '14px',
                            fontWeight: 600
                          }}
                        >
                          {activity.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" className="activity-time">
                              {activity.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card className="quick-actions-card">
            <CardContent>
              <Typography variant="h6" className="section-title" mb={3}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<People />}
                    className="action-button"
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      py: 1.5
                    }}
                  >
                    Manage Users
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Token />}
                    className="action-button"
                    sx={{ 
                      background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                      py: 1.5
                    }}
                  >
                    Create Token
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VerifiedUser />}
                    className="action-button"
                    sx={{ 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      py: 1.5
                    }}
                  >
                    KYC Review
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<MonitorHeart />}
                    className="action-button"
                    sx={{ 
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      py: 1.5
                    }}
                  >
                    System Monitor
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminDashboard; 