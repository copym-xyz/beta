import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

const ComplianceCenter = () => {
  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Box mb={3}>
        <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
          Compliance Center
        </Typography>
        <Typography variant="body1" sx={{ color: '#6c757d' }}>
          Monitor regulatory compliance and manage audit requirements
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ background: '#38f9d7', width: 48, height: 48 }}>
                  <SecurityIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Compliance Dashboard
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                This section will contain compliance monitoring tools, regulatory reporting features, and audit trail management.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ComplianceCenter; 