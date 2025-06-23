import express from 'express';
import kycHandler from '../Controllers/kycController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

 router.post('/generate-did', authenticateToken, kycHandler.generateDID);
router.post('/access-token', authenticateToken, kycHandler.createAccessToken);

// New Sumsub routes
router.post('/applicant', authenticateToken, kycHandler.createApplicant);
router.get('/applicant/:applicantId/status', authenticateToken, kycHandler.getApplicantStatus);
router.post('/store-data', authenticateToken, kycHandler.storeApplicantData);

// Webhook route (no authentication needed - Sumsub will call this)
router.post('/webhook', kycHandler.handleWebhook);

// 🗄️ Enhanced Storage Routes
router.post('/enhanced-storage', authenticateToken, kycHandler.triggerEnhancedStorage);
router.get('/stored-data', authenticateToken, kycHandler.getStoredKycData);
router.get('/documents', authenticateToken, kycHandler.getDocumentsList);

// Status management routes
router.post('/update-status', authenticateToken, kycHandler.updateStatus);

export default router;
