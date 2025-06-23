import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Security,
  TrendingUp,
  Add,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import axios from 'axios';

const WalletSection = () => {
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const token = localStorage.getItem('token'); // Or use context/auth method
        const res = await axios.get('http://localhost:5000/api/vault', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVault(res.data);
      } catch (error) {
        console.error('Failed to fetch vault data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, []);

  const handleCreateVault = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/vault', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVault(res.data);
    } catch (error) {
      console.error('Failed to create vault:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // Re-fetch data
    const fetchVaultData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/vault', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVault(res.data);
      } catch (error) {
        console.error('Failed to fetch vault data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVaultData();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        background: 'linear-gradient(135deg, rgba(26, 71, 42, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
        borderRadius: 3,
        border: '1px solid rgba(34, 197, 94, 0.1)',
      }}>
        <CircularProgress 
          sx={{ 
            color: '#22c55e',
            mb: 2,
          }} 
        />
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#1a472a',
            fontWeight: 500,
          }}
        >
          Loading your vault...
        </Typography>
      </Box>
    );
  }

  if (!vault) {
    return (
      <Box sx={{ 
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(26, 71, 42, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
        borderRadius: 3,
        border: '1px solid rgba(34, 197, 94, 0.1)',
      }}>
        <Security sx={{ fontSize: 60, color: '#22c55e', mb: 2 }} />
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 2,
            fontWeight: 600,
            color: '#1a472a',
          }}
        >
          No Vault Found
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#64748b',
            mb: 3,
          }}
        >
          Connect or create a wallet to see your vault.
        </Typography>
        <Button
          variant="contained"
          startIcon={creating ? <CircularProgress size={20} sx={{color: 'white'}} /> : <Add />}
          onClick={handleCreateVault}
          disabled={creating}
          sx={{
            background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
            color: '#ffffff',
            fontWeight: 600,
            px: 3,
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
          {creating ? 'Creating...' : 'Create Vault'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        p: 2,
        background: 'linear-gradient(135deg, rgba(26, 71, 42, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(34, 197, 94, 0.2)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceWallet sx={{ fontSize: 32, color: '#22c55e', mr: 2 }} />
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: '#1a472a',
                mb: 0.5,
              }}
            >
              🔐 Vault ID: {vault.id}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              Secure Digital Asset Management
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={showBalances ? <VisibilityOff /> : <Visibility />}
            onClick={() => setShowBalances(!showBalances)}
            sx={{
              borderColor: 'rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              '&:hover': {
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
              },
            }}
          >
            {showBalances ? 'Hide' : 'Show'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderColor: 'rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              '&:hover': {
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {vault.wallets.length === 0 ? (
        <Box sx={{ 
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(26, 71, 42, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(34, 197, 94, 0.1)',
        }}>
          <AccountBalanceWallet sx={{ fontSize: 60, color: '#22c55e', mb: 2 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: '#1a472a',
            }}
          >
            No Wallets Connected
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              mb: 3,
            }}
          >
            Connect your first wallet to start managing your digital assets.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              fontWeight: 600,
              px: 3,
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
            Connect Wallet
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {vault.wallets.map((wallet) => (
            <Grid item xs={12} sm={6} md={4} key={wallet.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(34, 197, 94, 0.1)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#1a472a',
                        textTransform: 'uppercase',
                      }}
                    >
                      {wallet.network}
                    </Typography>
                    <Chip
                      label="Connected"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        fontWeight: 600,
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2, borderColor: 'rgba(34, 197, 94, 0.1)' }} />
                  
                  <Typography
                    variant="body2"
                    sx={{ 
                      wordBreak: 'break-all', 
                      color: '#64748b',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      mb: 2,
                      p: 1.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 1,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {wallet.address}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(34, 197, 94, 0.1)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ fontSize: 20, color: '#22c55e', mr: 1 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748b',
                          fontWeight: 500,
                        }}
                      >
                        Balance:
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#1a472a',
                        fontSize: '1.1rem',
                      }}
                    >
                      {showBalances ? wallet.balance : '••••••'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default WalletSection;
