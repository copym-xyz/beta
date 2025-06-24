import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    userType: '',
    isActive: true
  });

  // Sample user data - In real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleUsers = [
        {
          id: 1,
          email: 'admin@blockchain.com',
          firstName: 'Admin',
          lastName: 'User',
          userType: 'ADMIN',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-06-22T14:25:00Z',
          lastUpdated: '2024-06-20T09:15:00Z',
          profilePicture: null,
          phone: '+1 (555) 123-4567',
          department: 'Administration',
          location: 'New York, USA',
          timezone: 'UTC-5',
          twoFactorEnabled: true,
          loginAttempts: 0,
          accountLocked: false
        },
        {
          id: 2,
          email: 'john.doe@company.com',
          firstName: 'John',
          lastName: 'Doe',
          userType: 'ISSUER',
          isActive: true,
          createdAt: '2024-02-10T08:45:00Z',
          lastLogin: '2024-06-21T16:30:00Z',
          lastUpdated: '2024-06-18T11:20:00Z',
          profilePicture: null,
          phone: '+1 (555) 987-6543',
          department: 'Token Management',
          location: 'San Francisco, USA',
          timezone: 'UTC-8',
          twoFactorEnabled: false,
          loginAttempts: 0,
          accountLocked: false
        },
        {
          id: 3,
          email: 'jane.smith@investor.com',
          firstName: 'Jane',
          lastName: 'Smith',
          userType: 'INVESTOR',
          isActive: true,
          createdAt: '2024-03-05T12:15:00Z',
          lastLogin: '2024-06-20T10:45:00Z',
          lastUpdated: '2024-06-19T15:30:00Z',
          profilePicture: null,
          phone: '+1 (555) 456-7890',
          department: 'Investment',
          location: 'London, UK',
          timezone: 'UTC+0',
          twoFactorEnabled: true,
          loginAttempts: 0,
          accountLocked: false
        },
        {
          id: 4,
          email: 'mike.wilson@blockchain.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          userType: 'ADMIN',
          isActive: false,
          createdAt: '2024-01-20T14:20:00Z',
          lastLogin: '2024-05-15T09:10:00Z',
          lastUpdated: '2024-05-16T13:45:00Z',
          profilePicture: null,
          phone: '+1 (555) 321-0987',
          department: 'Security',
          location: 'Toronto, Canada',
          timezone: 'UTC-5',
          twoFactorEnabled: true,
          loginAttempts: 3,
          accountLocked: true
        }
      ];

      const foundUser = sampleUsers.find(u => u.id === parseInt(userId));
      if (foundUser) {
        setUser(foundUser);
        setEditForm({
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          userType: foundUser.userType,
          isActive: foundUser.isActive
        });
      } else {
        setError('User not found');
      }
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return '#e74c3c';
      case 'ISSUER':
        return '#3498db';
      case 'INVESTOR':
        return '#27ae60';
      default:
        return '#6c757d';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <AdminIcon />;
      case 'ISSUER':
        return <BusinessIcon />;
      case 'INVESTOR':
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditSave = () => {
    // In real app, this would make API call to update user
    setUser(prev => ({
      ...prev,
      ...editForm,
      lastUpdated: new Date().toISOString()
    }));
    setEditDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading user profile...</Typography>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'User not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          variant="outlined"
        >
          Back to Users
        </Button>
      </div>
    );
  }

  // Sample activity data
  const recentActivity = [
    { action: 'Logged in', timestamp: '2024-06-22T14:25:00Z', ip: '192.168.1.100' },
    { action: 'Updated profile', timestamp: '2024-06-20T09:15:00Z', ip: '192.168.1.100' },
    { action: 'Password changed', timestamp: '2024-06-18T16:30:00Z', ip: '192.168.1.105' },
    { action: 'Logged in', timestamp: '2024-06-18T08:45:00Z', ip: '192.168.1.100' },
    { action: 'Failed login attempt', timestamp: '2024-06-17T22:15:00Z', ip: '10.0.0.50' }
  ];

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/users')}
            variant="outlined"
            sx={{ borderColor: '#3498db', color: '#3498db' }}
          >
            Back to Users
          </Button>
          <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700 }}>
            User Profile
          </Typography>
        </Box>
        <Button
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
          variant="contained"
          sx={{ background: '#3498db', '&:hover': { background: '#2980b9' } }}
        >
          Edit User
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto 16px',
                  background: getRoleColor(user.userType),
                  fontSize: '2rem'
                }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </Avatar>
              
              <Typography variant="h5" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
                {user.firstName} {user.lastName}
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 2 }}>
                {user.email}
              </Typography>

              <Chip
                icon={getRoleIcon(user.userType)}
                label={user.userType}
                sx={{
                  background: `${getRoleColor(user.userType)}20`,
                  color: getRoleColor(user.userType),
                  fontWeight: 600,
                  mb: 2
                }}
              />

              <Box mt={2}>
                <Chip
                  icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                  label={user.isActive ? 'Active' : 'Blocked'}
                  sx={{
                    background: user.isActive ? '#27ae6020' : '#e74c3c20',
                    color: user.isActive ? '#27ae60' : '#e74c3c',
                    fontWeight: 600
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                Quick Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="User ID"
                    secondary={`#${user.id}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={user.phone || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={user.department}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Timezone"
                    secondary={user.timezone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="2FA Status"
                    secondary={
                      <Chip
                        size="small"
                        label={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        sx={{
                          background: user.twoFactorEnabled ? '#27ae6020' : '#f39c1220',
                          color: user.twoFactorEnabled ? '#27ae60' : '#f39c12',
                          fontWeight: 600
                        }}
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Account Details" />
                <Tab label="Activity Log" />
                <Tab label="Security" />
              </Tabs>

              {/* Account Details Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        First Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {user.firstName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        Last Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {user.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {user.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        User Role
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {user.userType}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        Account Created
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        Last Login
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {formatDate(user.lastLogin)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {user.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2 }}>
                        {formatDate(user.lastUpdated)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Activity Log Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 3 }}>
                  <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Table>
                      <TableHead sx={{ background: '#f8f9fa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Action</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Timestamp</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>IP Address</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentActivity.map((activity, index) => (
                          <TableRow key={index} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {activity.action}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(activity.timestamp)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {activity.ip}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Security Tab */}
              {activeTab === 2 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                          Account Security
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <VerifiedIcon color={user.twoFactorEnabled ? 'success' : 'action'} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Two-Factor Authentication"
                              secondary={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <SecurityIcon color={user.accountLocked ? 'error' : 'success'} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Account Status"
                              secondary={user.accountLocked ? 'Locked' : 'Active'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <HistoryIcon color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Failed Login Attempts"
                              secondary={`${user.loginAttempts} recent attempts`}
                            />
                          </ListItem>
                        </List>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                          Quick Actions
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Button
                            variant="outlined"
                            startIcon={<SecurityIcon />}
                            fullWidth
                          >
                            Reset Password
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<VerifiedIcon />}
                            fullWidth
                          >
                            {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<BlockIcon />}
                            color={user.accountLocked ? 'success' : 'error'}
                            fullWidth
                          >
                            {user.accountLocked ? 'Unlock Account' : 'Lock Account'}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="First Name"
              fullWidth
              value={editForm.firstName}
              onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <TextField
              label="Last Name"
              fullWidth
              value={editForm.lastName}
              onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={editForm.userType}
                onChange={(e) => setEditForm(prev => ({ ...prev, userType: e.target.value }))}
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="ISSUER">Issuer</MenuItem>
                <MenuItem value="INVESTOR">Investor</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editForm.isActive}
                onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.value }))}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Blocked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserProfile; 