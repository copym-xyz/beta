import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Grid,

  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import './ClientLeadsManagement.css';
import axios from '../../services/axios';

const ClientLeadsManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tab from URL parameters
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'leads') return 1;
    return 0; // default to clients
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [_selectedItem, setSelectedItem] = useState(null);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalLeads: 0,
    totalBalance: 0,
    verificationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      console.log('Fetching data with token:', token.substring(0, 20) + '...');
      
      // Fetch clients, leads, and stats in parallel
      const [clientsRes, leadsRes, clientStatsRes, leadStatsRes] = await Promise.all([
        axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/leads', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/clients/stats/overview', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/leads/stats/overview', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('API Responses:', {
        clients: clientsRes.data,
        leads: leadsRes.data,
        clientStats: clientStatsRes.data,
        leadStats: leadStatsRes.data
      });

      setClients(clientsRes.data.data || []);
      setLeads(leadsRes.data.data || []);
      
      // Combine stats
      const clientStats = clientStatsRes.data.data;
      const leadStats = leadStatsRes.data.data;
      
      setStats({
        totalClients: clientStats.totalClients || 0,
        totalLeads: leadStats.totalLeads || 0,
        totalBalance: clientStats.totalBalance || 0,
        verificationRate: clientStats.verificationRate || 0
      });
      
      console.log('Data loaded successfully:', {
        clientsCount: clientsRes.data.data?.length,
        leadsCount: leadsRes.data.data?.length,
        stats: stats
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(error.message || 'Failed to load data');
      
      // Set fallback data to show the UI
      setClients([]);
      setLeads([]);
      setStats({
        totalClients: 0,
        totalLeads: 0,
        totalBalance: 0,
        verificationRate: 0
      });
    } finally {
      setLoading(false);
    }
  };



  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update URL to reflect tab change
    const tabParam = newValue === 1 ? 'leads' : 'clients';
    navigate(`/admin/clients?tab=${tabParam}`, { replace: true });
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#43e97b';
      case 'inactive':
        return '#6c757d';
      case 'hot':
        return '#f5576c';
      case 'warm':
        return '#f093fb';
      case 'cold':
        return '#4facfe';
      default:
        return '#6c757d';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const ClientsTable = () => (
    <TableContainer component={Paper} className="data-table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client ID</TableCell>
            <TableCell>Email ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Verification</TableCell>
            <TableCell>Registration Date</TableCell>
            <TableCell>Trading Status</TableCell>
            <TableCell>Manager</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Client Type</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients
            .filter(client => 
              client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.clientId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((client) => (
              <TableRow key={client.id} className="table-row">
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="#2c3e50">
                    {client.clientId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ background: '#3498db' }}>
                      {client.firstName[0]}{client.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {client.firstName} {client.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{client.country}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={client.isVerified ? 'Verified' : 'Pending'}
                    size="small"
                    sx={{
                      background: client.isVerified ? '#43e97b20' : '#f5576c20',
                      color: client.isVerified ? '#43e97b' : '#f5576c',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(client.registrationAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={client.tradingStatus}
                    size="small"
                    sx={{
                      background: `${getStatusColor(client.tradingStatus)}20`,
                      color: getStatusColor(client.tradingStatus),
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client.manager}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="#2c3e50">
                    {formatCurrency(client.balance)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={client.clientType}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: client.clientType === 'Individual' ? '#3498db' : '#f093fb',
                      color: client.clientType === 'Individual' ? '#3498db' : '#f093fb',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, client)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const LeadsTable = () => (
    <TableContainer component={Paper} className="data-table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Lead ID</TableCell>
            <TableCell>Email ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Last Contact</TableCell>
            <TableCell>Est. Value</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads
            .filter(lead => 
              lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              lead.leadId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((lead) => (
              <TableRow key={lead.id} className="table-row">
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="#2c3e50">
                    {lead.leadId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{lead.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ background: '#f5576c' }}>
                      {lead.firstName[0]}{lead.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {lead.firstName} {lead.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{lead.country}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={lead.status}
                    size="small"
                    sx={{
                      background: `${getStatusColor(lead.status)}20`,
                      color: getStatusColor(lead.status),
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{lead.source}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {lead.score}
                    </Typography>
                    <TrendingUpIcon fontSize="small" color="action" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(lead.lastContact)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="#2c3e50">
                    {formatCurrency(lead.estimatedValue)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={lead.clientType}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: lead.clientType === 'Individual' ? '#3498db' : '#f093fb',
                      color: lead.clientType === 'Individual' ? '#3498db' : '#f093fb',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, lead)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <div className="client-leads-management">
        <Box className="page-header" mb={3}>
          <Typography variant="h4" className="page-title">
            Client & Leads Management
          </Typography>
          <Typography variant="body1" className="page-subtitle">
            Loading...
          </Typography>
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-leads-management">
        <Box className="page-header" mb={3}>
          <Typography variant="h4" className="page-title">
            Client & Leads Management
          </Typography>
          <Typography variant="body1" className="page-subtitle" color="error">
            Error: {error}
          </Typography>
          <Button onClick={fetchData} variant="contained" sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div className="client-leads-management">
      {/* Header */}
      <Box className="page-header" mb={3}>
        <Typography variant="h4" className="page-title">
          Client & Leads Management
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Manage your clients and track potential leads
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" className="stats-value">
                    {loading ? '...' : stats.totalClients}
                  </Typography>
                  <Typography variant="body2" className="stats-label">
                    Total Clients
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#3498db', width: 48, height: 48 }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" className="stats-value">
                    {loading ? '...' : stats.totalLeads}
                  </Typography>
                  <Typography variant="body2" className="stats-label">
                    Active Leads
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#f5576c', width: 48, height: 48 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" className="stats-value">
                    {loading ? '...' : formatCurrency(stats.totalBalance)}
                  </Typography>
                  <Typography variant="body2" className="stats-label">
                    Total Balance
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#43e97b', width: 48, height: 48 }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" className="stats-value">
                    {loading ? '...' : `${stats.verificationRate}%`}
                  </Typography>
                  <Typography variant="body2" className="stats-label">
                    Verification Rate
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#f093fb', width: 48, height: 48 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card className="main-card">
        <CardContent>
          {/* Tabs and Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="custom-tabs"
            >
              <Tab label="Clients" />
              <Tab label="Leads" />
            </Tabs>
            
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder={`Search ${activeTab === 0 ? 'clients' : 'leads'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
            </Box>
          </Box>

          {/* Table Content */}
          {activeTab === 0 ? <ClientsTable /> : <LeadsTable />}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ClientLeadsManagement; 