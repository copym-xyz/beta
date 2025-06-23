import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          position: 'relative',
          zIndex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(34, 197, 94, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(34, 197, 94, 0.5)',
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 