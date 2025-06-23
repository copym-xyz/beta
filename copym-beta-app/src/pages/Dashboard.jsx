import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import KYCAlert from '../components/KYCAlert';
import WalletSection from '../components/WalletSection';
import ErrorBoundary from '../components/ErrorBoundary'; // fixed import path

const Dashboard = () => {
  console.log('🔍 Rendering Dashboard...');

  return (
        <ErrorBoundary>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1a472a 0%, #22c55e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              Welcome back! Here's your tokenization overview
            </Typography>
          </Box>

          <KYCAlert />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <WalletSection />
              </Paper>
            </Grid>
            
            {/* Additional Dashboard Cards */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#1a472a',
                    mb: 2,
                  }}
                >
                  Quick Actions
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#64748b',
                    mb: 3,
                  }}
                >
                  Get started with tokenizing your assets or explore your portfolio
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                    },
                  }}>
                    Tokenize Asset
                  </Box>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                    },
                  }}>
                    View Portfolio
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </ErrorBoundary>
  );
};

export default Dashboard;
