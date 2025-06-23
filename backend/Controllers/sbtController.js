import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import VCService from '../services/vcService.js';
import SBTMintingService from '../services/sbtMintingService.js';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();
const prisma = new PrismaClient();

// Get available images for SBT selection
export const getAvailableImages = async (req, res) => {
  try {
    const images = [
      {
        id: 'image1',
        cid: process.env.IMAGE1_CID,
        url: `https://gateway.pinata.cloud/ipfs/${process.env.IMAGE1_CID}`,
        name: 'Professional Badge',
        description: 'Clean professional identity badge'
      },
      {
        id: 'image2', 
        cid: process.env.IMAGE2_CID,
        url: `https://gateway.pinata.cloud/ipfs/${process.env.IMAGE2_CID}`,
        name: 'Digital Certificate',
        description: 'Modern digital certificate design'
      },
      {
        id: 'image3',
        cid: process.env.IMAGE3_CID,
        url: `https://gateway.pinata.cloud/ipfs/${process.env.IMAGE3_CID}`,
        name: 'Verification Seal',
        description: 'Official verification seal'
      }
    ];

    res.json({
      success: true,
      images: images.filter(img => img.cid) // Only return images with valid CIDs
    });
  } catch (error) {
    console.error('❌ Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available images'
    });
  }
};

// Start SBT creation process
export const createSBT = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedImageId } = req.body;

    console.log(`🎯 Starting SBT creation for user ${userId}`);

    // 1. Get user data with KYC and wallet info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        kycData: true,
        vault: {
          include: {
            wallets: true
          }
        },
        didMetadata: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 2. Check KYC completion
    if (!user.kycData || user.kycData.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'KYC verification required before minting SBT',
        kycStatus: user.kycData?.status || 'not_started'
      });
    }

    // 3. Check wallet availability
    if (!user.vault || !user.vault.wallets || user.vault.wallets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Wallet setup required before minting SBT'
      });
    }

    // 4. Check DID metadata
    if (!user.didMetadata || user.didMetadata.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'DID generation required before minting SBT'
      });
    }

    // 5. Validate selected image
    const imageMap = {
      'image1': process.env.IMAGE1_CID,
      'image2': process.env.IMAGE2_CID,
      'image3': process.env.IMAGE3_CID
    };

    const selectedImageCID = imageMap[selectedImageId];
    if (!selectedImageCID) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image selection'
      });
    }

    // 6. Get wallet addresses
    const wallets = user.vault.wallets;
    const ethWallet = wallets.find(w => w.assetId === 'ETH_TEST5')?.address;
    const btcWallet = wallets.find(w => w.assetId === 'BTC_TEST')?.address;
    const solWallet = wallets.find(w => w.assetId === 'SOL_TEST')?.address;

    if (!ethWallet) {
      return res.status(400).json({
        success: false,
        message: 'ETH_TEST5 wallet required for SBT minting'
      });
    }

    // 7. Get latest DID metadata
    const latestDID = user.didMetadata[user.didMetadata.length - 1];

    // 8. Parse KYC data
    const kycPersonalInfo = JSON.parse(user.kycData.personalInfo);
    const kycDocuments = JSON.parse(user.kycData.documentsInfo);

    // 9. Create SBT record in database
    const sbtCredential = await prisma.sBTCredential.create({
      data: {
        userId: userId,
        imageCid: selectedImageCID,
        vcCid: '', // Will be updated after VC creation
        vcHash: '', // Will be updated after VC creation
        selectedImage: selectedImageId,
        minted: false
      }
    });

    console.log(`✅ SBT record created with ID: ${sbtCredential.id}`);

    // 10. Prepare environment variables for script execution
    const tempEnvVars = {
      DID_KEY: latestDID.did,
      ETH_WALLET_ADDRESS: ethWallet,
      BTC_WALLET_ADDRESS: btcWallet || 'N/A',
      SOL_WALLET_ADDRESS: solWallet || 'N/A',
      IPFS_CID: latestDID.allWalletsCid,
      SBT_IMAGE_CID: selectedImageCID,
      KYC_APPLICANT_ID: user.kycData.applicantId,
      KYC_STATUS: user.kycData.status,
      KYC_REVIEW_RESULT: user.kycData.reviewResult,
      USER_NAME: kycPersonalInfo.firstName + ' ' + kycPersonalInfo.lastName,
      USER_EMAIL: user.email,
      USER_PHONE: kycPersonalInfo.phone || '',
      USER_COUNTRY: kycPersonalInfo.country || '',
      USER_DOB: kycPersonalInfo.dob || '1990-01-01'
    };

    // Set temporary environment variables
    Object.keys(tempEnvVars).forEach(key => {
      process.env[key] = tempEnvVars[key];
    });

    console.log('🔧 Environment variables set for VC creation');

    res.json({
      success: true,
      message: 'SBT creation started',
      sbtId: sbtCredential.id,
      data: {
        user: {
          name: kycPersonalInfo.firstName + ' ' + kycPersonalInfo.lastName,
          email: user.email,
          kycStatus: user.kycData.status
        },
        wallets: {
          eth: ethWallet,
          btc: btcWallet,
          sol: solWallet
        },
        did: latestDID.did,
        selectedImage: {
          id: selectedImageId,
          cid: selectedImageCID,
          url: `https://gateway.pinata.cloud/ipfs/${selectedImageCID}`
        },
        nextStep: 'VC creation will begin automatically'
      }
    });

    // 11. Start VC creation process asynchronously
    processVCCreation(sbtCredential.id, userId).catch(error => {
      console.error('❌ VC creation process failed:', error);
    });

  } catch (error) {
    console.error('❌ Error creating SBT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SBT',
      error: error.message
    });
  }
};

// Process VC creation (async)
async function processVCCreation(sbtId, userId) {
  try {
    console.log(`🚀 Starting VC creation for SBT ${sbtId}`);

    // Get user data for VC creation
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        kycData: true,
        vault: { include: { wallets: true } },
        didMetadata: true
      }
    });

    const latestDID = user.didMetadata[user.didMetadata.length - 1];
    const kycPersonalInfo = JSON.parse(user.kycData.personalInfo);
    const wallets = user.vault.wallets;
    
    // Prepare user data for VC
    const userData = {
      did: latestDID.did,
      applicantId: user.kycData.applicantId,
      name: kycPersonalInfo.firstName + ' ' + kycPersonalInfo.lastName,
      email: user.email,
      country: kycPersonalInfo.country || 'IND',
      wallets: {
        eth: wallets.find(w => w.assetId === 'ETH_TEST5')?.address,
        btc: wallets.find(w => w.assetId === 'BTC_TEST')?.address,
        sol: wallets.find(w => w.assetId === 'SOL_TEST')?.address
      },
      walletMetadata: latestDID.allWalletsUrl
    };

    // Get SBT image CID
    const sbtRecord = await prisma.sBTCredential.findUnique({
      where: { id: sbtId }
    });

    // Create VC using service
    const vcService = new VCService();
    const vcResult = await vcService.createVCForSBT(userData, sbtRecord.imageCid);

    if (!vcResult) {
      throw new Error('VC creation failed');
    }

    // Update database with results
    await prisma.sBTCredential.update({
      where: { id: sbtId },
      data: {
        vcCid: vcResult.vcCid,
        vcHash: vcResult.vcHash,
        vcSigned: JSON.stringify(vcResult.signedVC),
        updatedAt: new Date()
      }
    });

    console.log(`✅ SBT ${sbtId} complete: ${vcResult.vcCid}`);

  } catch (error) {
    console.error(`❌ VC creation failed for SBT ${sbtId}:`, error);
    
    await prisma.sBTCredential.update({
      where: { id: sbtId },
      data: { updatedAt: new Date() }
    });
  }
}

// Get SBT status
export const getSBTStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sbtId } = req.params;

    const sbt = await prisma.sBTCredential.findFirst({
      where: {
        id: parseInt(sbtId),
        userId: userId
      }
    });

    if (!sbt) {
      return res.status(404).json({
        success: false,
        message: 'SBT not found'
      });
    }

    const status = {
      id: sbt.id,
      vcCreated: !!sbt.vcCid,
      vcSigned: !!sbt.vcHash,
      vcUploaded: !!sbt.vcCid,
      minted: sbt.minted,
      txHash: sbt.txHash,
      createdAt: sbt.createdAt,
      updatedAt: sbt.updatedAt
    };

    if (sbt.vcCid) {
      status.vcUrl = `https://gateway.pinata.cloud/ipfs/${sbt.vcCid}`;
      status.imageUrl = `https://gateway.pinata.cloud/ipfs/${sbt.imageCid}`;
    }

    res.json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error('❌ Error getting SBT status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SBT status'
    });
  }
};

// Get user's SBTs
export const getUserSBTs = async (req, res) => {
  try {
    const userId = req.user.id;

    const sbts = await prisma.sBTCredential.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    const sbtList = sbts.map(sbt => ({
      id: sbt.id,
      imageCid: sbt.imageCid,
      imageUrl: `https://gateway.pinata.cloud/ipfs/${sbt.imageCid}`,
      vcCid: sbt.vcCid,
      vcUrl: sbt.vcCid ? `https://gateway.pinata.cloud/ipfs/${sbt.vcCid}` : null,
      minted: sbt.minted,
      txHash: sbt.txHash,
      createdAt: sbt.createdAt,
      status: sbt.minted ? 'minted' : (sbt.vcCid ? 'ready_to_mint' : 'creating')
    }));

    res.json({
      success: true,
      sbts: sbtList
    });

  } catch (error) {
    console.error('❌ Error getting user SBTs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SBTs'
    });
  }
};

// Mint SBT endpoint
export const mintSBT = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sbtId } = req.body;

    console.log(`🎖️ Minting SBT for user ${userId}, SBT ID: ${sbtId}`);

    // Get SBT record
    const sbtRecord = await prisma.sBTCredential.findFirst({
      where: {
        id: parseInt(sbtId),
        userId: userId
      },
      include: {
        user: {
          include: {
            kycData: true,
            vault: { include: { wallets: true } },
            didMetadata: true
          }
        }
      }
    });

    if (!sbtRecord) {
      return res.status(404).json({
        success: false,
        message: 'SBT record not found'
      });
    }

    if (!sbtRecord.vcCid) {
      return res.status(400).json({
        success: false,
        message: 'VC must be created before minting SBT'
      });
    }

    if (sbtRecord.minted) {
      return res.status(400).json({
        success: false,
        message: 'SBT already minted',
        txHash: sbtRecord.txHash
      });
    }

    // Prepare user data
    const user = sbtRecord.user;
    const latestDID = user.didMetadata[user.didMetadata.length - 1];
    const kycPersonalInfo = JSON.parse(user.kycData.personalInfo);
    const wallets = user.vault.wallets;

    const userData = {
      name: kycPersonalInfo.firstName + ' ' + kycPersonalInfo.lastName,
      did: latestDID.did,
      wallets: {
        eth: wallets.find(w => w.assetId === 'ETH_TEST5')?.address
      }
    };

    const vcData = {
      vcCid: sbtRecord.vcCid,
      vcHash: sbtRecord.vcHash
    };

    // Mint SBT
    const sbtMintingService = new SBTMintingService();
    const mintResult = await sbtMintingService.mintSBT(userData, vcData);

    // Update database
    await prisma.sBTCredential.update({
      where: { id: sbtRecord.id },
      data: {
        minted: true,
        txHash: mintResult.transactionHash,
        updatedAt: new Date()
      }
    });

    console.log(`✅ SBT minted: Token ID ${mintResult.tokenId}`);

    res.json({
      success: true,
      message: 'SBT minted successfully',
      data: {
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        contractAddress: mintResult.contractAddress,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${mintResult.transactionHash}`,
        action: mintResult.action
      }
    });

  } catch (error) {
    console.error('❌ Error minting SBT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mint SBT',
      error: error.message
    });
  }
}; 