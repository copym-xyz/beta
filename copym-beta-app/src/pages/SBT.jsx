import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import axios from 'axios';

const SBT = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [mintingStep, setMintingStep] = useState(0);
  const [sbtId, setSbtId] = useState(null);
  const [sbtStatus, setSbtStatus] = useState(null);
  const [userSBTs, setUserSBTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    'Creating Verifiable Credential',
    'Signing with DIDKit',
    'Uploading to IPFS',
    'Ready for Minting'
  ];

  useEffect(() => {
    loadImages();
    loadUserSBTs();
  }, []);

  useEffect(() => {
    if (sbtId) {
      const interval = setInterval(() => {
        checkSBTStatus();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [sbtId]);

  const loadImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sbt/images', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(response.data.images);
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load available images');
    }
  };

  const loadUserSBTs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sbt/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserSBTs(response.data.sbts);
    } catch (error) {
      console.error('Error loading SBTs:', error);
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setShowMintDialog(true);
  };

  const startSBTCreation = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/sbt/create', {
        selectedImageId: selectedImage.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSbtId(response.data.sbtId);
      setMintingStep(0);
      console.log('SBT creation started:', response.data);
    } catch (error) {
      console.error('Error creating SBT:', error);
      setError(error.response?.data?.message || 'Failed to create SBT');
    } finally {
      setLoading(false);
    }
  };

  const checkSBTStatus = async () => {
    if (!sbtId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/sbt/status/${sbtId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const status = response.data.status;
      setSbtStatus(status);

      // Update step based on progress
      if (status.vcCreated && status.vcSigned && status.vcUploaded) {
        setMintingStep(3); // Ready for minting
      } else if (status.vcCreated && status.vcSigned) {
        setMintingStep(2); // Uploading to IPFS
      } else if (status.vcCreated) {
        setMintingStep(1); // Signing
      } else {
        setMintingStep(0); // Creating VC
      }

      // If completed, refresh the SBT list
      if (status.vcUploaded) {
        loadUserSBTs();
      }
    } catch (error) {
      console.error('Error checking SBT status:', error);
    }
  };

  const closeMintDialog = () => {
    setShowMintDialog(false);
    setSelectedImage(null);
    setSbtId(null);
    setSbtStatus(null);
    setMintingStep(0);
    setError('');
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1a472a 0%, #22c55e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Soul-Bound Tokens (SBT)
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
          Create verifiable credentials and mint your identity as an SBT
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Your SBTs Section */}
      {userSBTs.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Your SBTs
          </Typography>
          <Grid container spacing={3}>
            {userSBTs.map((sbt) => (
              <Grid item xs={12} sm={6} md={4} key={sbt.id}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={sbt.imageUrl}
                    alt="SBT Image"
                  />
                  <CardContent>
                    <Typography variant="h6">SBT #{sbt.id}</Typography>
                    <Chip 
                      label={sbt.status}
                      color={sbt.minted ? 'success' : 'primary'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    {sbt.vcUrl && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <a href={sbt.vcUrl} target="_blank" rel="noopener noreferrer">
                          View Verifiable Credential
                        </a>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Create New SBT Section */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Create New SBT
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
          Choose an image for your Soul-Bound Token. This will represent your verified identity.
        </Typography>

        <Grid container spacing={3}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => handleImageSelect(image)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={image.url}
                  alt={image.name}
                />
                <CardContent>
                  <Typography variant="h6">{image.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {image.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #16a34a 0%, #15803d 100%)',
                      }
                    }}
                  >
                    Select This Image
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Minting Dialog */}
      <Dialog 
        open={showMintDialog} 
        onClose={closeMintDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Soul-Bound Token
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Selected Image:</Typography>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                />
                <Box>
                  <Typography variant="subtitle1">{selectedImage.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedImage.description}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {sbtId && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Creating Verifiable Credential...
              </Typography>
              <Stepper activeStep={mintingStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      {label}
                      {index === mintingStep && index < 3 && (
                        <CircularProgress size={20} sx={{ ml: 2 }} />
                      )}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {index === 0 && "Generating W3C compliant verifiable credential with your KYC data..."}
                        {index === 1 && "Signing credential with DIDKit WASM for cryptographic proof..."}
                        {index === 2 && "Uploading signed credential to IPFS for decentralized storage..."}
                        {index === 3 && "Ready to mint your SBT on the blockchain!"}
                      </Typography>
                      {sbtStatus && index === 3 && sbtStatus.vcUrl && (
                        <Box sx={{ mt: 2 }}>
                          <Alert severity="success">
                            <Typography variant="body2">
                              Verifiable Credential created successfully!
                            </Typography>
                            <Button 
                              href={sbtStatus.vcUrl} 
                              target="_blank" 
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              View VC on IPFS
                            </Button>
                          </Alert>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMintDialog}>
            Cancel
          </Button>
          {!sbtId ? (
            <Button 
              onClick={startSBTCreation}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating...' : 'Create Verifiable Credential'}
            </Button>
          ) : (
            sbtStatus?.vcUploaded && (
              <Button 
                variant="contained"
                color="success"
                onClick={() => {
                  // TODO: Implement blockchain minting
                  alert('Blockchain minting will be implemented in the next step!');
                }}
              >
                Mint SBT on Blockchain
              </Button>
            )
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SBT; 