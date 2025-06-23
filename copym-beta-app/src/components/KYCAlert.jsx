import React, { useState } from 'react';
import { 
  Alert, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography,
  Box,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  Security,
  VerifiedUser,
  Warning,
  CheckCircle,
  Close,
  Fingerprint,
  Shield
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SumsubVerification from './SumsubVerification';

const KYCAlert = () => {
  const [openConsent, setOpenConsent] = useState(false);
  const [openKYC, setOpenKYC] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);
  const { user } = useAuth();
  const [latestApplicantId, setLatestApplicantId] = useState(null);

  const handleDIDConsent = () => setOpenConsent(true);

  const handleConsentAgree = async () => {
    setOpenConsent(false);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.post(
        'http://localhost:5000/api/kyc/generate-did', 
        { userId: user.id }, 
        { 
          headers,
          withCredentials: true 
        }
      );
      
      if (res.data.did) {
        const chainsText = res.data.chains?.join(', ') || 'No chains';
        const combinedHashText = res.data.combinedHash?.substring(0, 16) + '...' || 'No hash';
        
        const smartContractText = res.data.smartContract?.deployed 
          ? `✅ Deployed: ${res.data.smartContract.transactionHash}\n🌐 Etherscan: ${res.data.smartContract.etherscanUrl}`
          : '❌ Not deployed';
          
        alert(`${res.data.message}\n\n🔑 DID: ${res.data.did}\n\n📋 DID Document:\nCID: ${res.data.didDocumentCid}\nURL: ${res.data.didDocumentUrl}\n\n💼 ALL Wallets IPFS (Single File):\n📋 CID: ${res.data.allWalletsCid}\n🔗 URL: ${res.data.allWalletsUrl}\n💼 Wallets: ${res.data.walletCount} (${chainsText})\n🔐 Combined Hash: ${combinedHashText}\n\n⛓️ Smart Contract Registry:\n${smartContractText}`);
      } else if (res.data.ipfsCid) {
        alert(`${res.data.message}\n\nIPFS Details:\n📋 CID: ${res.data.ipfsCid}\n🔗 URL: ${res.data.ipfsUrl}`);
      } else {
      alert(res.data.message);
      }
    } catch (err) {
      console.error('DID generation error:', err);
      alert(`DID generation failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleKYC = () => {
    setOpenKYC(true);
  };

  const handleKYCSuccess = async (payload) => {
    console.log('🎉 KYC Verification completed successfully!', payload);
    if (payload?.applicantId) {
      setLatestApplicantId(payload.applicantId);
    }
    setKycCompleted(true);
    
    // Check if data was stored properly
    try {
      const token = localStorage.getItem('token');
      if (token && payload.applicantId) {
        console.log('📊 Checking stored KYC data...');
        
        // Call backend to verify data storage
        const response = await fetch('http://localhost:5000/api/kyc/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ KYC data verification:', data);
          
          if (data.kycData) {
            console.log(`📋 Stored applicant ID: ${data.kycData.applicantId}`);
            console.log(`👤 Personal info: ${data.kycData.personalInfo ? 'STORED' : 'MISSING'}`);
            console.log(`📄 Documents: ${data.kycData.documentsInfo ? 'STORED' : 'MISSING'}`);
            
            // Show success message with stored data info
            const personalInfo = data.kycData.personalInfo ? JSON.parse(data.kycData.personalInfo) : null;
            const successMessage = `🎉 KYC Verification completed successfully!\n\n📋 Applicant ID: ${payload.applicantId}\n👤 Name: ${personalInfo?.firstName} ${personalInfo?.lastName}\n📧 Email: ${personalInfo?.email}\n🎂 DOB: ${personalInfo?.dateOfBirth}\n🌍 Country: ${personalInfo?.country}\n\n✅ Your identity has been verified and all data has been stored securely.`;
            alert(successMessage);
            return;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking stored data:', error);
    }
    
    // Fallback message if data check fails
    alert(`🎉 KYC Verification completed successfully!\n\nApplicant ID: ${payload.applicantId || 'Unknown'}\nYour identity has been verified.`);
  };

  const handleKYCError = (error) => {
    console.error('❌ KYC Verification failed:', error);
    alert(`❌ KYC Verification failed: ${error.message || 'Unknown error'}`);
  };

  // Helper ➜ update status to completed using sendBeacon (fires even on tab close)
  const finalizeKyc = (applicantIdParam) => {
    // Always close the dialog first
    setOpenKYC(false);

    setKycCompleted(true);

    const id = applicantIdParam || latestApplicantId;
    if (!id) {
      return; // still close dialog; status will refresh on next login/webhook
    }

    const token = localStorage.getItem('token');
    const payload = JSON.stringify({
      applicantId: id,
      status: 'completed',
      reviewResult: 'GREEN'
    });

    // Prefer sendBeacon so the request survives tab close
    try {
      navigator.sendBeacon('http://localhost:5000/api/kyc/update-status', payload);
    } catch (err) {
      // Fallback – fire-and-forget fetch
      fetch('http://localhost:5000/api/kyc/update-status', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        keepalive: true
      }).catch(() => {});
    }
  };

  if (kycCompleted) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ 
              fontSize: 28, 
              color: '#22c55e', 
              mr: 2,
              filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))'
            }} />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#16a34a',
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                KYC Verification Complete
                <Chip
                  label="Verified"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#16a34a',
                    fontWeight: 600,
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    fontSize: '0.7rem',
                  }}
                />
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#15803d',
                  fontWeight: 500,
                  lineHeight: 1.5
                }}
              >
                Your identity has been successfully verified. You now have access to all platform features.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Warning sx={{ 
                fontSize: 28, 
                color: '#ff9800', 
                mr: 2,
                filter: 'drop-shadow(0 2px 4px rgba(255, 152, 0, 0.3))'
              }} />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#d97706',
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  KYC Verification Required
                  <Chip
                    label="Pending"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      color: '#d97706',
                      fontWeight: 600,
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                      fontSize: '0.7rem',
                    }}
                  />
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#92400e',
                    fontWeight: 500,
                    lineHeight: 1.5
                  }}
                >
                  Complete your Know Your Customer (KYC) verification to unlock all platform features and ensure compliance.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ 
            borderColor: 'rgba(255, 152, 0, 0.2)', 
            mb: 3,
            '&::before, &::after': {
              borderColor: 'rgba(255, 152, 0, 0.2)',
            }
          }} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              onClick={handleDIDConsent}
              variant="outlined"
              startIcon={<Fingerprint />}
              sx={{
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Generate DID
            </Button>
            <Button
              onClick={handleKYC}
              variant="contained"
              startIcon={<VerifiedUser />}
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
              Start KYC Verification
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* DID Consent Dialog */}
      <Dialog 
        open={openConsent} 
        onClose={() => setOpenConsent(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 197, 94, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            maxWidth: 500,
            width: '90%',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
        }}>
          <Shield sx={{ fontSize: 32, color: '#22c55e' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a472a' }}>
              Consent for DID Generation
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Decentralized Identity Setup
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ 
            p: 2, 
            mb: 3,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
            borderRadius: 2,
            border: '1px solid rgba(34, 197, 94, 0.1)',
          }}>
            <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.6, mb: 2 }}>
              We need to generate a <strong>Decentralized Identifier (DID)</strong> for your identity. This DID will:
            </Typography>
            <Box component="ul" sx={{ 
              pl: 2, 
              m: 0,
              '& li': {
                color: '#4b5563',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }
            }}>
              <li>• Provide you with a secure, self-sovereign digital identity</li>
              <li>• Enable secure authentication across the platform</li>
              <li>• Protect your privacy while ensuring compliance</li>
              <li>• Allow you to control your own identity data</li>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
            By proceeding, you consent to the generation and storage of your DID in accordance with our privacy policy.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setOpenConsent(false)} 
            variant="outlined"
            startIcon={<Close />}
            sx={{
              borderColor: 'rgba(107, 114, 128, 0.3)',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#6b7280',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConsentAgree} 
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{
              background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(45deg, #16a34a 0%, #15803d 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            I Agree & Generate DID
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Verification Dialog */}
      <Dialog 
        open={openKYC} 
        onClose={() => finalizeKyc(latestApplicantId)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 197, 94, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            minHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
        }}>
          <VerifiedUser sx={{ fontSize: 32, color: '#22c55e' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a472a' }}>
              KYC Verification
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Complete your identity verification
            </Typography>
          </Box>
          <Button
            onClick={() => finalizeKyc(latestApplicantId)}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2, minHeight: '60vh' }}>
          <SumsubVerification
            userId={user?.id}
            onSuccess={handleKYCSuccess}
            onError={handleKYCError}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KYCAlert;
