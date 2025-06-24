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
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';

const KYCManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycApplications, setKycApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    setKycApplications([
      {
        id: 1,
        userId: 'USR001',
        fullName: 'John Smith',
        email: 'john.smith@email.com',
        documentType: 'Passport',
        documentNumber: 'P123456789',
        country: 'United States',
        status: 'Pending',
        submittedAt: '2024-06-20',
        reviewedAt: null,
        riskScore: 'Low',
        completionLevel: 85
      },
      {
        id: 2,
        userId: 'USR002',
        fullName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        documentType: 'Driver License',
        documentNumber: 'DL987654321',
        country: 'Mexico',
        status: 'Approved',
        submittedAt: '2024-06-18',
        reviewedAt: '2024-06-19',
        riskScore: 'Low',
        completionLevel: 100
      },
      {
        id: 3,
        userId: 'USR003',
        fullName: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
        documentType: 'National ID',
        documentNumber: 'ID456789123',
        country: 'UAE',
        status: 'Under Review',
        submittedAt: '2024-06-21',
        reviewedAt: null,
        riskScore: 'Medium',
        completionLevel: 75
      },
      {
        id: 4,
        userId: 'USR004',
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        documentType: 'Passport',
        documentNumber: 'P987654321',
        country: 'Canada',
        status: 'Rejected',
        submittedAt: '2024-06-17',
        reviewedAt: '2024-06-18',
        riskScore: 'High',
        completionLevel: 60
      }
    ]);

    setStats({
      totalApplications: 4,
      pendingReview: 2,
      approved: 1,
      rejected: 1
    });
  }, []);

  const handleMenuOpen = (event, kyc) => {
    setAnchorEl(event.currentTarget);
    setSelectedKyc(kyc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedKyc(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#27ae60';
      case 'Rejected':
        return '#e74c3c';
      case 'Pending':
        return '#f39c12';
      case 'Under Review':
        return '#3498db';
      default:
        return '#6c757d';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return '#27ae60';
      case 'Medium':
        return '#f39c12';
      case 'High':
        return '#e74c3c';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <VerifiedIcon fontSize="small" />;
      case 'Rejected':
        return <RejectIcon fontSize="small" />;
      case 'Pending':
        return <PendingIcon fontSize="small" />;
      case 'Under Review':
        return <WarningIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Box mb={3}>
        <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
          KYC Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#6c757d' }}>
          Manage Know Your Customer verification processes and compliance
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
                    {stats.totalApplications}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Total Applications
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
          <Card sx={{ background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700 }}>
                    {stats.pendingReview}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Pending Review
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#f39c12', width: 48, height: 48 }}>
                  <PendingIcon />
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
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Approved
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
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                    Rejected
                  </Typography>
                </Box>
                <Avatar sx={{ background: '#e74c3c', width: 48, height: 48 }}>
                  <RejectIcon />
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
              KYC Applications
            </Typography>
            
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search applications..."
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

          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ background: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Document</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Risk Score</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Completion</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Submitted</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kycApplications
                  .filter(kyc => 
                    kyc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    kyc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    kyc.userId.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((kyc) => (
                    <TableRow key={kyc.id} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ background: getStatusColor(kyc.status) }}>
                            {kyc.fullName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {kyc.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kyc.email} • {kyc.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {kyc.documentType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {kyc.documentNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {kyc.country}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(kyc.status)}
                          label={kyc.status}
                          size="small"
                          sx={{
                            background: `${getStatusColor(kyc.status)}20`,
                            color: getStatusColor(kyc.status),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={kyc.riskScore}
                          size="small"
                          sx={{
                            background: `${getRiskColor(kyc.riskScore)}20`,
                            color: getRiskColor(kyc.riskScore),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {kyc.completionLevel}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={kyc.completionLevel}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              '& .MuiLinearProgress-bar': {
                                background: getStatusColor(kyc.status)
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(kyc.submittedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, kyc)}
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
        {selectedKyc?.status === 'Pending' && (
          <>
            <MenuItem onClick={handleMenuClose} sx={{ color: '#27ae60' }}>
              <ApproveIcon fontSize="small" sx={{ mr: 1 }} />
              Approve KYC
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ color: '#e74c3c' }}>
              <RejectIcon fontSize="small" sx={{ mr: 1 }} />
              Reject KYC
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );
};

export default KYCManagement; 