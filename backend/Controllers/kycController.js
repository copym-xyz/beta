import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';
import crypto from 'crypto';
import { generateToken } from '../utils/generateToken.js';
import { WalletHashIPFSUploader } from '../services/walletIPFS.js';
import { EnhancedDIDService } from '../services/enhancedDIDService.js';
import { SumsubService } from '../services/sumsubService.js';

const prisma = new PrismaClient();

const kycController = {
  generateDID: async (req, res) => {
    const userId = req.user.id;

    try {
      console.log(`🚀 Enhanced DID generation for user ID: ${userId}`);
      
      // Create Enhanced DID Service instance
      const enhancedDIDService = new EnhancedDIDService(userId);
      
      // Run the complete enhanced DID generation process
      const result = await enhancedDIDService.run();

      if (!result.success) {
        throw new Error(`Enhanced DID generation failed: ${result.mainError}`);
      }

      console.log(`✅ Enhanced DID generation completed for user ${userId}`);
      console.log(`🔑 DID: ${result.didKey}`);
      console.log(`📋 DID Document CID: ${result.didDocumentCID?.cid}`);
      console.log(`💼 All Wallets IPFS CID: ${result.allWalletsIPFS?.cid}`);

      return res.status(200).json({ 
        message: 'Enhanced DID generated - All wallets in single IPFS file + Smart Contract deployed',
        did: result.didKey,
        didDocumentCid: result.didDocumentCID?.cid,
        didDocumentUrl: result.didDocumentCID?.ipfsUrl,
        allWalletsCid: result.allWalletsIPFS?.cid,
        allWalletsUrl: result.allWalletsIPFS?.ipfsUrl,
        walletCount: result.walletCount,
        chains: result.allWalletsIPFS?.chains || [],
        combinedHash: result.allWalletsIPFS?.combinedHash,
        smartContract: {
          deployed: result.smartContractResult?.success || false,
          transactionHash: result.smartContractResult?.transactionHash,
          etherscanUrl: result.smartContractResult?.etherscanUrl,
          contractAddress: process.env.CONTRACT_ADDRESS
        },
        summary: result
      });
    } catch (error) {
      console.error('❌ Enhanced DID generation failed:', error.message);
      return res.status(500).json({ 
        message: 'Failed to generate enhanced DID',
        error: error.message 
      });
    }
  },

  createAccessToken: async (req, res) => {
    const userId = req.user.id;

    try {
      console.log(`🔑 Creating KYC access token for user ID: ${userId}`);
      
      // Get user info
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize Sumsub service
      const sumsubService = new SumsubService();
      
      // Generate access token using the new service
      const result = await sumsubService.generateAccessToken(userId, 'id-and-liveness', 3600);

      if (!result.success) {
        console.error('❌ Failed to generate Sumsub access token:', result.error);
        return res.status(500).json({ 
          message: 'Failed to create access token',
          error: result.error 
        });
      }
      
      console.log(`✅ KYC access token created for user ${userId}`);

      return res.status(200).json({ 
        message: 'Access token created successfully',
        token: result.token,
        expiresAt: result.expiresAt,
        userId: result.userId
      });
    } catch (error) {
      console.error('❌ Access token creation failed:', error.message);
      return res.status(500).json({ 
        message: 'Failed to create access token',
        error: error.message 
      });
    }
  },

  createApplicant: async (req, res) => {
    const userId = req.user.id;

    try {
      console.log(`👤 Creating Sumsub applicant for user ID: ${userId}`);
      
      // Initialize Sumsub service
      const sumsubService = new SumsubService();
      
      // Create applicant
      const result = await sumsubService.createApplicant(userId, 'id-and-liveness');

      if (!result.success) {
        console.error('❌ Failed to create Sumsub applicant:', result.error);
        return res.status(500).json({ 
          message: 'Failed to create applicant',
          error: result.error 
        });
      }
      
      console.log(`✅ Sumsub applicant created for user ${userId}: ${result.applicantId}`);

      return res.status(200).json({ 
        message: 'Applicant created successfully',
        applicantId: result.applicantId,
        externalUserId: result.externalUserId,
        applicant: result.applicant
      });
    } catch (error) {
      console.error('❌ Applicant creation failed:', error.message);
      return res.status(500).json({ 
        message: 'Failed to create applicant',
        error: error.message 
      });
    }
  },

  getApplicantStatus: async (req, res) => {
    const userId = req.user.id;
    const { applicantId } = req.params;

    try {
      console.log(`📊 Getting applicant status for user ${userId}, applicant: ${applicantId}`);
      
      // Initialize Sumsub service
      const sumsubService = new SumsubService();
      
      // Get applicant status
      const result = await sumsubService.getApplicantStatus(applicantId);

      if (!result.success) {
        console.error('❌ Failed to get applicant status:', result.error);
        return res.status(500).json({ 
          message: 'Failed to get applicant status',
          error: result.error 
        });
      }
      
      console.log(`✅ Applicant status retrieved for ${applicantId}`);

      return res.status(200).json({ 
        message: 'Applicant status retrieved successfully',
        status: result.status,
        formattedStatus: SumsubService.formatVerificationStatus(result.status.reviewStatus)
      });
    } catch (error) {
      console.error('❌ Failed to get applicant status:', error.message);
      return res.status(500).json({ 
        message: 'Failed to get applicant status',
        error: error.message 
      });
    }
  },

  handleWebhook: async (req, res) => {
    try {
      console.log('🔔 Received Sumsub webhook');
      
      // Initialize Sumsub service
      const sumsubService = new SumsubService();
      
      // Process webhook using the service
      return await sumsubService.processWebhook(req, res);
    } catch (error) {
      console.error('❌ Webhook processing failed:', error.message);
      return res.status(500).json({ 
        message: 'Failed to process webhook',
        error: error.message 
      });
    }
  },

  storeApplicantData: async (req, res) => {
    const userId = req.user.id;
    const { applicantId } = req.body;

    try {
      console.log(`💾 Storing applicant data for user ${userId}, applicant: ${applicantId}`);
      
      if (!applicantId) {
        return res.status(400).json({ 
          message: 'Applicant ID is required' 
        });
      }

      // Initialize Sumsub service
      const sumsubService = new SumsubService();
      
      // Fetch and store complete applicant data (now uses enhanced storage)
      const result = await sumsubService.fetchAndStoreApplicantData(applicantId, userId);

      if (!result.success) {
        console.error('❌ Failed to store applicant data:', result.error);
        return res.status(500).json({ 
          message: 'Failed to store applicant data',
          error: result.error 
        });
      }
      
      console.log(`✅ Successfully stored applicant data for user ${userId} (Enhanced: ${result.enhanced})`);

      return res.status(200).json({ 
        message: result.enhanced ? 
          'Enhanced applicant data stored successfully' : 
          'Basic applicant data stored successfully',
        enhanced: result.enhanced,
        personalInfo: result.personalInfo,
        documentsInfo: result.documentsInfo,
        totalDocuments: result.totalDocuments || 0,
        errors: result.errors || [],
        storedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Failed to store applicant data:', error.message);
      return res.status(500).json({ 
        message: 'Failed to store applicant data',
        error: error.message 
      });
    }
  },

  // 🗄️ Enhanced Storage Endpoints
  
  /**
   * Manually trigger enhanced data storage for a user
   */
  triggerEnhancedStorage: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's KYC data to find applicant ID
      const kycData = await prisma.kycData.findUnique({
        where: { userId: userId }
      });
      
      if (!kycData || !kycData.applicantId) {
        return res.status(404).json({
          success: false,
          error: 'No KYC applicant found for user'
        });
      }
      
      console.log(`🚀 Triggering enhanced storage for user ${userId}, applicant ${kycData.applicantId}`);
      
      // Initialize Sumsub service
      const sumsubService = new SumsubService();
      
      // Use enhanced storage
      const result = await sumsubService.fetchAndStoreApplicantData(kycData.applicantId, userId);
      
      res.json({
        success: result.success,
        enhanced: result.enhanced,
        message: result.enhanced ? 
          'Enhanced storage completed successfully' : 
          'Basic storage completed (enhanced failed)',
        data: {
          totalDocuments: result.totalDocuments || 0,
          documentsStored: result.documents?.length || 0,
          personalInfoExtracted: !!result.personalInfo,
          errors: result.errors || []
        }
      });
      
    } catch (error) {
      console.error('❌ Enhanced storage trigger error:', error);
      res.status(500).json({
        success: false,
        error: 'Enhanced storage failed',
        details: error.message
      });
    }
  },

  /**
   * Get all stored KYC data for current user
   */
  getStoredKycData: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Import enhanced storage
      const { EnhancedSumsubStorage } = await import('../services/enhancedSumsubStorage.js');
      const enhancedStorage = new EnhancedSumsubStorage();
      
      // Get all stored data
      const result = await enhancedStorage.getAllStoredDataForUser(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message || 'No KYC data found'
        });
      }
      
      // Format response for frontend
      const formattedData = {
        userId: userId,
        applicantId: result.data.applicantId,
        status: result.data.status,
        reviewResult: result.data.reviewResult,
        isVerified: result.data.reviewResult === 'GREEN',
        verifiedAt: result.data.verifiedAt,
        personalInfo: result.data.personalInfo,
        documentsInfo: result.data.documentsInfo,
        summary: {
          totalDocuments: result.data.documentsInfo?.totalDocuments || 0,
          verificationLevel: result.data.personalInfo?.verificationLevel || 'unknown',
          hasPersonalInfo: !!result.data.personalInfo,
          hasDocuments: !!result.data.documentsInfo,
          lastUpdated: result.data.updatedAt
        }
      };
      
      res.json({
        success: true,
        data: formattedData
      });
      
    } catch (error) {
      console.error('❌ Get stored KYC data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KYC data',
        details: error.message
      });
    }
  },

  /**
   * Get user's document files list
   */
  getDocumentsList: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const kycData = await prisma.kycData.findUnique({
        where: { userId: userId }
      });
      
      if (!kycData || !kycData.documentsInfo) {
        return res.json({
          success: true,
          documents: [],
          totalDocuments: 0
        });
      }
      
      const documentsInfo = JSON.parse(kycData.documentsInfo);
      const documents = documentsInfo.documents || [];
      
      // Format document list for frontend (without file paths for security)
      const formattedDocuments = documents.map(doc => ({
        imageId: doc.imageId,
        docType: doc.docType,
        docSubType: doc.docSubType,
        fileName: doc.fileName,
        contentType: doc.contentType,
        fileSize: doc.fileSize,
        status: doc.status,
        downloadedAt: doc.downloadedAt
      }));
      
      res.json({
        success: true,
        documents: formattedDocuments,
        totalDocuments: documents.length,
        extractedAt: documentsInfo.extractedAt
      });
      
    } catch (error) {
      console.error('❌ Get documents list error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve documents list',
        details: error.message
      });
    }
  },

  /**
   * Update KYC status (for completion tracking)
   */
  updateStatus: async (req, res) => {
    try {
      console.log('🔄 KYC status update endpoint called');
      const userId = req.user?.id;
      const { applicantId, status, reviewResult } = req.body;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      
      console.log(`👤 Updating KYC status for user ${userId}:`);
      console.log(`📋 Applicant ID: ${applicantId}`);
      console.log(`📊 Status: ${status}`);
      console.log(`📊 Review Result: ${reviewResult}`);
      
      // Update KYC data status
      const updatedKyc = await prisma.kycData.upsert({
        where: { userId: userId },
        update: {
          status: status || 'pending',
          reviewResult: reviewResult || null,
          verifiedAt: status === 'completed' ? new Date() : null,
          updatedAt: new Date()
        },
        create: {
          userId: userId,
          applicantId: applicantId,
          status: status || 'pending',
          reviewResult: reviewResult || null,
          personalInfo: JSON.stringify({}),
          documentsInfo: JSON.stringify({}),
          rawApplicantData: JSON.stringify({}),
          rawStatusData: JSON.stringify({}),
          verifiedAt: status === 'completed' ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ KYC status updated successfully for user ${userId}`);
      console.log(`📊 New status: ${updatedKyc.status}`);
      console.log(`📊 Review result: ${updatedKyc.reviewResult}`);
      console.log(`✅ Verified at: ${updatedKyc.verifiedAt}`);
      
      return res.json({
        success: true,
        message: `KYC status updated to ${status}`,
        data: {
          userId: userId,
          applicantId: updatedKyc.applicantId,
          status: updatedKyc.status,
          reviewResult: updatedKyc.reviewResult,
          verifiedAt: updatedKyc.verifiedAt,
          updatedAt: updatedKyc.updatedAt
        }
      });
      
    } catch (error) {
      console.error('❌ KYC status update error:', error);
      return res.status(500).json({
        success: false,
        message: `Status update error: ${error.message}`
      });
    }
  }
};

export default kycController;
