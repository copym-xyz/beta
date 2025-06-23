import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  getAvailableImages, 
  createSBT, 
  getSBTStatus, 
  getUserSBTs,
  mintSBT
} from '../Controllers/sbtController.js';

const router = express.Router();

// Get available images for SBT selection
router.get('/images', authenticateToken, getAvailableImages);

// Create new SBT (starts VC creation process)
router.post('/create', authenticateToken, createSBT);

// Mint SBT to blockchain
router.post('/mint', authenticateToken, mintSBT);

// Get SBT creation status
router.get('/status/:sbtId', authenticateToken, getSBTStatus);

// Get user's SBTs
router.get('/list', authenticateToken, getUserSBTs);

export default router; 