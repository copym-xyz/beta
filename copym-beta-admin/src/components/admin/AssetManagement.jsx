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
  AccountBalance as AssetIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const AssetManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    activeAssets: 0,
    performanceGain: 0
  });

  useEffect(() => {
    setAssets([
      {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        type: 'Cryptocurrency',
        value: 45000,
        change24h: 2.5,
        volume: 1250000,
        supply: 19700000,
        status: 'Active',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Ethereum',
        symbol: 'ETH',
        type: 'Cryptocurrency',
        value: 3200,
        change24h: -1.2,
        volume: 850000,
        supply: 120000000,
        status: 'Active',
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        name: 'Real Estate Token',
        symbol: 'RET',
        type: 'Real Estate',
        value: 100,
        change24h: 0.8,
        volume: 45000,
        supply: 1000000,
        status: 'Active',
        createdAt: '2024-02-10'
      },
      {
        id: 4,
        name: 'Gold Token',
        symbol: 'GOLD',
        type: 'Commodity',
        value: 2050,
        change24h: -0.3,
        volume: 125000,
        supply: 500000,
        status: 'Inactive',
        createdAt: '2024-03-05'
      }
    ]);

    setStats({
      totalAssets: 4,
      totalValue: 2400000000,
      activeAssets: 3,
      performanceGain: 12.5
    });
  }, []);

  const handleMenuOpen = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAsset(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Cryptocurrency':
        return '#f39c12';
      case 'Real Estate':
        return '#27ae60';
      case 'Commodity':
        return '#8e44ad';
      default:
        return '#6c757d';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Box mb={3}>
        <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
          Asset Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#6c757d' }}>
          Monitor and manage blockchain assets and portfolios
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
                    {stats.totalAssets}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Total Assets
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#3498db', width: 48, height: 48 }}>
                  <AssetIcon />
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
                    {formatCurrency(stats.totalValue)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Total Value
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#27ae60', width: 48, height: 48 }}>
                  <TrendingUpIcon />
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
                    {stats.activeAssets}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Active Assets
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#e74c3c', width: 48, height: 48 }}>
                  <AssetIcon />
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
                    +{stats.performanceGain}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Performance
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#f39c12', width: 48, height: 48 }}>
                  <TrendingUpIcon />
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
              Asset Portfolio
            </Typography>
            
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search assets..."
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
                Add Asset
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ background: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Asset</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>24h Change</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Volume</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Supply</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets
                  .filter(asset => 
                    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((asset) => (
                    <TableRow key={asset.id} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ background: getTypeColor(asset.type) }}>
                            {asset.symbol.substring(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {asset.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {asset.symbol}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={asset.type}
                          size="small"
                          sx={{
                            background: `${getTypeColor(asset.type)}20`,
                            color: getTypeColor(asset.type),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(asset.value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {asset.change24h >= 0 ? (
                            <TrendingUpIcon fontSize="small" sx={{ color: '#27ae60' }} />
                          ) : (
                            <TrendingDownIcon fontSize="small" sx={{ color: '#e74c3c' }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{ color: asset.change24h >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 600 }}
                          >
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(asset.volume)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatNumber(asset.supply)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={asset.status}
                          size="small"
                          sx={{
                            background: asset.status === 'Active' ? '#27ae6020' : '#e74c3c20',
                            color: asset.status === 'Active' ? '#27ae60' : '#e74c3c',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, asset)}
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
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Asset
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove Asset
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AssetManagement; 