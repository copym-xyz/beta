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
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Token as TokenIcon,
  Launch as LaunchIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

const TokenManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({
    totalTokens: 0,
    activeTokens: 0,
    totalSupply: 0,
    marketCap: 0
  });

  useEffect(() => {
    setTokens([
      {
        id: 1,
        name: 'BlockChain Utility Token',
        symbol: 'BUT',
        contractAddress: '0x1234...5678',
        totalSupply: 1000000000,
        circulatingSupply: 750000000,
        price: 2.45,
        marketCap: 1837500000,
        holders: 15420,
        status: 'Active',
        network: 'Ethereum',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Investment Token',
        symbol: 'INVT',
        contractAddress: '0xabcd...efgh',
        totalSupply: 500000000,
        circulatingSupply: 300000000,
        price: 5.80,
        marketCap: 1740000000,
        holders: 8900,
        status: 'Active',
        network: 'Polygon',
        createdAt: '2024-02-10'
      },
      {
        id: 3,
        name: 'Governance Token',
        symbol: 'GOV',
        contractAddress: '0x9876...5432',
        totalSupply: 100000000,
        circulatingSupply: 65000000,
        price: 12.30,
        marketCap: 799500000,
        holders: 3200,
        status: 'Paused',
        network: 'BSC',
        createdAt: '2024-03-05'
      },
      {
        id: 4,
        name: 'Reward Token',
        symbol: 'RWT',
        contractAddress: '0xfedc...ba98',
        totalSupply: 2000000000,
        circulatingSupply: 1200000000,
        price: 0.85,
        marketCap: 1020000000,
        holders: 25600,
        status: 'Active',
        network: 'Ethereum',
        createdAt: '2024-04-12'
      }
    ]);

    setStats({
      totalTokens: 4,
      activeTokens: 3,
      totalSupply: 3600000000,
      marketCap: 5397000000
    });
  }, []);

  const handleMenuOpen = (event, token) => {
    setAnchorEl(event.currentTarget);
    setSelectedToken(token);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedToken(null);
  };

  const getNetworkColor = (network) => {
    switch (network) {
      case 'Ethereum':
        return '#627eea';
      case 'Polygon':
        return '#8247e5';
      case 'BSC':
        return '#f3ba2f';
      default:
        return '#6c757d';
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return '$' + (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toFixed(2);
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getCirculationPercentage = (circulating, total) => {
    return (circulating / total) * 100;
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Box mb={3}>
        <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
          Token Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#6c757d' }}>
          Manage blockchain tokens, smart contracts, and token economics
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
                    {stats.totalTokens}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Total Tokens
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#3498db', width: 48, height: 48 }}>
                  <TokenIcon />
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
                    {stats.activeTokens}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Active Tokens
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#27ae60', width: 48, height: 48 }}>
                  <PlayIcon />
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
                    {formatNumber(stats.totalSupply)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Total Supply
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#e74c3c', width: 48, height: 48 }}>
                  <TokenIcon />
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
                    {formatCurrency(stats.marketCap)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Market Cap
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#f39c12', width: 48, height: 48 }}>
                  <LaunchIcon />
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
              Token Portfolio
            </Typography>
            
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search tokens..."
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
                Deploy Token
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ background: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Token</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Network</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Market Cap</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Supply</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Holders</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens
                  .filter(token => 
                    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((token) => (
                    <TableRow key={token.id} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ background: getNetworkColor(token.network) }}>
                            {token.symbol.substring(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {token.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {token.symbol} • {token.contractAddress}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={token.network}
                          size="small"
                          sx={{
                            background: `${getNetworkColor(token.network)}20`,
                            color: getNetworkColor(token.network),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ${token.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(token.marketCap)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {formatNumber(token.circulatingSupply)} / {formatNumber(token.totalSupply)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getCirculationPercentage(token.circulatingSupply, token.totalSupply)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              '& .MuiLinearProgress-bar': {
                                background: getNetworkColor(token.network)
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatNumber(token.holders)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={token.status}
                          size="small"
                          sx={{
                            background: token.status === 'Active' ? '#27ae6020' : '#f39c1220',
                            color: token.status === 'Active' ? '#27ae60' : '#f39c12',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, token)}
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
          <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
          View on Explorer
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Token
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {selectedToken?.status === 'Active' ? (
            <>
              <PauseIcon fontSize="small" sx={{ mr: 1 }} />
              Pause Token
            </>
          ) : (
            <>
              <PlayIcon fontSize="small" sx={{ mr: 1 }} />
              Activate Token
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove Token
        </MenuItem>
      </Menu>
    </div>
  );
};

export default TokenManagement; 