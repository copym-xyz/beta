import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Badge as BadgeIcon,
  Verified as VerifiedIcon,
  Link as LinkIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const DIDManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDID, setSelectedDID] = useState(null);
  const [dids, setDids] = useState([]);
  const [stats, setStats] = useState({
    totalDIDs: 0,
    activeDIDs: 0,
    verifiedDIDs: 0,
    pendingDIDs: 0
  });

  useEffect(() => {
    setDids([
      {
        id: 1,
        didId: 'did:ethr:0x1234567890abcdef',
        owner: 'John Smith',
        email: 'john.smith@email.com',
        method: 'ethr',
        network: 'Ethereum',
        status: 'Active',
        verified: true,
        createdAt: '2024-01-15',
        lastUsed: '2024-06-20',
        credentialCount: 5,
        keyCount: 2
      },
      {
        id: 2,
        didId: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        owner: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        method: 'key',
        network: 'Universal',
        status: 'Active',
        verified: true,
        createdAt: '2024-02-10',
        lastUsed: '2024-06-21',
        credentialCount: 3,
        keyCount: 1
      },
      {
        id: 3,
        didId: 'did:web:example.com:users:alice',
        owner: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        method: 'web',
        network: 'Web',
        status: 'Pending',
        verified: false,
        createdAt: '2024-03-05',
        lastUsed: '2024-06-19',
        credentialCount: 1,
        keyCount: 1
      },
      {
        id: 4,
        didId: 'did:ion:EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg',
        owner: 'Bob Wilson',
        email: 'bob.wilson@email.com',
        method: 'ion',
        network: 'Bitcoin',
        status: 'Inactive',
        verified: true,
        createdAt: '2024-04-12',
        lastUsed: '2024-05-15',
        credentialCount: 7,
        keyCount: 3
      }
    ]);

    setStats({
      totalDIDs: 4,
      activeDIDs: 2,
      verifiedDIDs: 3,
      pendingDIDs: 1
    });
  }, []);

  const handleMenuOpen = (event, did) => {
    setAnchorEl(event.currentTarget);
    setSelectedDID(did);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDID(null);
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'ethr':
        return '#627eea';
      case 'key':
        return '#27ae60';
      case 'web':
        return '#3498db';
      case 'ion':
        return '#f39c12';
      default:
        return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#27ae60';
      case 'Inactive':
        return '#e74c3c';
      case 'Pending':
        return '#f39c12';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const truncateDID = (did) => {
    if (did.length > 30) {
      return did.substring(0, 30) + '...';
    }
    return did;
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Box mb={3}>
        <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
          DID Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#6c757d' }}>
          Manage Decentralized Identifiers and digital identity credentials
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700 }}>
                    {stats.totalDIDs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Total DIDs
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#3498db', width: 48, height: 48 }}>
                  <BadgeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700 }}>
                    {stats.activeDIDs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Active DIDs
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#27ae60', width: 48, height: 48 }}>
                  <VerifiedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700 }}>
                    {stats.verifiedDIDs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Verified DIDs
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#e74c3c', width: 48, height: 48 }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700 }}>
                    {stats.pendingDIDs}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Pending DIDs
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#f39c12', width: 48, height: 48 }}>
                  <LinkIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
              Decentralized Identifiers
            </Typography>
            
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search DIDs..."
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ background: '#3498db', '&:hover': { background: '#2980b9' } }}
              >
                Create DID
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ background: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>DID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Network</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Credentials</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Last Used</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dids
                  .filter(did => 
                    did.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    did.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    did.didId.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((did) => (
                    <TableRow key={did.id} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ background: getMethodColor(did.method) }}>
                            {did.owner.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {did.owner}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {did.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace">
                            {truncateDID(did.didId)}
                          </Typography>
                          {did.verified && (
                            <VerifiedIcon fontSize="small" sx={{ color: '#27ae60' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={did.method.toUpperCase()}
                          size="small"
                          sx={{
                            background: `${getMethodColor(did.method)}20`,
                            color: getMethodColor(did.method),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {did.network}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={did.status}
                          size="small"
                          sx={{
                            background: `${getStatusColor(did.status)}20`,
                            color: getStatusColor(did.status),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {did.credentialCount} credentials
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {did.keyCount} keys
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(did.lastUsed)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, did)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <LinkIcon fontSize="small" sx={{ mr: 1 }} />
          View DID Document
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <VerifiedIcon fontSize="small" sx={{ mr: 1 }} />
          Manage Credentials
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit DID
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Revoke DID
        </MenuItem>
      </Menu>
    </div>
  );
};

export default DIDManagement; 