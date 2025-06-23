import React from 'react';
import { Box, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
     return (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h5" color="error">Something went wrong on the dashboard.</Typography>
    <Typography variant="body2">{this.state.errorInfo?.toString()}</Typography>
  </Box>
);
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
