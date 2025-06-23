import crypto from 'crypto';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { EnhancedSumsubStorage } from './enhancedSumsubStorage.js';

const prisma = new PrismaClient();

/**
 * Complete Sumsub Service - Integrated with your project
 * Handles KYC verification, webhook processing, and database integration
 */
export class SumsubService {
    constructor(config = {}) {
        this.appToken = config.appToken || process.env.SUMSUB_APP_TOKEN;
        this.secretKey = config.secretKey || process.env.SUMSUB_SECRET_KEY;
        this.baseUrl = config.baseUrl || process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com';
        this.webhookSecret = config.webhookSecret || process.env.SUMSUB_WEBHOOK_SECRET;
        
        console.log('🔧 Sumsub Service initialized:');
        console.log(`- Base URL: ${this.baseUrl}`);
        console.log(`- App Token: ${this.appToken?.substring(0, 10)}...`);
        console.log(`- Secret Key: ${this.secretKey?.substring(0, 5)}...`);
    }

    /**
     * Generate API signature for Sumsub requests
     */
    generateSignature(method, endpoint, timestamp, body = '') {
        // Ensure method is uppercase
        method = (method || '').toUpperCase();
        
        // Convert body to string if it's an object, or empty string if null/undefined
        const bodyStr = body === null || body === undefined ? '' : 
                       (typeof body === 'object' ? JSON.stringify(body) : String(body));
        
        // Create signing string: timestamp + method + endpoint + body
        const signatureSource = `${timestamp}${method}${endpoint}${bodyStr}`;
        
        console.log(`🔐 Generating signature with: "${signatureSource}"`);
        
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(signatureSource)
            .digest('hex');
        
        console.log(`🔐 Generated signature: ${signature.substring(0, 16)}...`);
        return signature;
    }

    /**
     * Make authenticated API request to Sumsub
     */
    async makeApiRequest(method, endpoint, body = null) {
        try {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const signature = this.generateSignature(method, endpoint, timestamp, body);
            
            const headers = {
                'Accept': 'application/json',
                'X-App-Token': this.appToken,
                'X-App-Access-Sig': signature,
                'X-App-Access-Ts': timestamp
            };
            
            if (body) headers['Content-Type'] = 'application/json';
            
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers,
                data: body || undefined
            });
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Sumsub API error (${method} ${endpoint}):`, error.message);
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Create applicant for a user in your system
     */
    async createApplicant(userId, levelName = 'id-and-liveness') {
        try {
            // Get user from your database
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }

            const externalUserId = `user-${userId}`;
            
            const applicantData = {
                externalUserId: externalUserId,
                email: user.email,
                info: {
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ').slice(1).join(' ') || '',
                    country: 'USA' // Default, can be customized
                },
                fixedInfo: {
                    email: user.email
                },
                requiredIdDocs: {
                    docSets: [
                        {
                            idDocSetType: 'IDENTITY',
                            types: ['PASSPORT', 'ID_CARD', 'DRIVERS']
                        },
                        {
                            idDocSetType: 'SELFIE',
                            types: ['SELFIE']
                        }
                    ]
                }
            };
            
            console.log(`👤 Creating Sumsub applicant for user ${userId} (${user.email})`);
            
            const result = await this.makeApiRequest('POST', '/resources/applicants', applicantData);
            
            if (result.success) {
                console.log(`✅ Applicant created successfully: ${result.data.id}`);
                
                return {
                    success: true,
                    applicantId: result.data.id,
                    externalUserId: externalUserId,
                    applicant: result.data
                };
            } else if (result.details?.code === 409) {
                // Applicant already exists - extract the existing applicant ID
                const existingApplicantId = result.details.description.match(/([a-f0-9]{24})/)?.[1];
                console.log(`ℹ️ Applicant already exists: ${existingApplicantId}`);
                
                return {
                    success: true,
                    applicantId: existingApplicantId,
                    externalUserId: externalUserId,
                    applicant: { id: existingApplicantId },
                    message: 'Applicant already exists'
                };
            } else {
                throw new Error(`Failed to create applicant: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Error creating applicant:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate access token for WebSDK
     */
    async generateAccessToken(userId, levelName = 'id-and-liveness', ttlInSecs = 3600) {
        try {
            console.log(`🔑 Generating access token for user ${userId}, level: ${levelName}`);
            
            const externalUserId = `user-${userId}`;
            
            const endpoint = `/resources/accessTokens?userId=${externalUserId}&levelName=${levelName}&ttlInSecs=${ttlInSecs}`;
            
            const result = await this.makeApiRequest('POST', endpoint, '');
            
            if (result.success && result.data.token) {
                console.log(`✅ Access token generated successfully for user ${userId}`);
                
                const expiresAt = new Date(Date.now() + (ttlInSecs * 1000));
                
                return {
                    success: true,
                    token: result.data.token,
                    userId: result.data.userId || externalUserId,
                    expiresAt: expiresAt.toISOString(),
                    ttlInSecs
                };
            } else {
                throw new Error(`Failed to generate access token: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Error generating access token:', error.message);
            return {
                success: false,
                error: error.message,
                details: error.details
            };
        }
    }

    /**
     * Get applicant status
     */
    async getApplicantStatus(applicantId) {
        try {
            const result = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/status`);
            
            if (result.success) {
                return {
                    success: true,
                    status: result.data
                };
            } else {
                throw new Error(`Failed to get applicant status: ${result.error}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get applicant data
     */
    async getApplicant(applicantId) {
        try {
            const result = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/one`);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                throw new Error(`Failed to get applicant: ${result.error}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch and store complete applicant data in database (ENHANCED VERSION)
     */
    async fetchAndStoreApplicantData(applicantId, userId) {
        try {
            console.log(`📋 Using Enhanced Storage for applicant data: ${applicantId} (user ${userId})`);
            
            // Initialize enhanced storage
            const enhancedStorage = new EnhancedSumsubStorage();
            
            // Use enhanced storage to store complete applicant data
            const result = await enhancedStorage.storeCompleteApplicantData(applicantId, userId);
            
            if (result.success) {
                console.log(`✅ Enhanced storage completed successfully for user ${userId}`);
                console.log(`📄 Documents stored: ${result.results.documents?.documents?.length || 0}`);
                console.log(`👤 Personal info extracted: ${result.results.personalInfo?.success ? 'YES' : 'NO'}`);
                
                return {
                    success: true,
                    enhanced: true,
                    personalInfo: result.results.personalInfo?.personalInfo,
                    documents: result.results.documents?.documents || [],
                    totalDocuments: result.results.documents?.documents?.length || 0,
                    errors: result.results.errors,
                    message: result.message
                };
            } else {
                // Fallback to basic storage if enhanced storage fails
                console.log(`⚠️ Enhanced storage failed, falling back to basic storage`);
                return await this.basicFetchAndStoreApplicantData(applicantId, userId);
            }
            
        } catch (error) {
            console.error(`❌ Error in enhanced storage, falling back to basic:`, error.message);
            return await this.basicFetchAndStoreApplicantData(applicantId, userId);
        }
    }

    /**
     * Basic fetch and store (fallback method)
     */
    async basicFetchAndStoreApplicantData(applicantId, userId) {
        try {
            console.log(`📋 Using basic storage for applicant data: ${applicantId} (user ${userId})`);
            
            // Get applicant details
            const applicantResult = await this.getApplicant(applicantId);
            if (!applicantResult.success) {
                throw new Error(`Failed to fetch applicant data: ${applicantResult.error}`);
            }
            
            const applicantData = applicantResult.data;
            console.log(`✅ Fetched applicant data for ${applicantData.info?.firstName} ${applicantData.info?.lastName}`);
            
            // Get applicant status
            const statusResult = await this.getApplicantStatus(applicantId);
            if (!statusResult.success) {
                throw new Error(`Failed to fetch applicant status: ${statusResult.error}`);
            }
            
            const statusData = statusResult.status;
            console.log(`✅ Applicant status: ${statusData.reviewStatus}`);
            
            // Extract and structure the data
            const personalInfo = this.extractPersonalInfo(applicantData);
            const documentsInfo = this.extractDocumentsInfo(applicantData);
            
            // Store in database
            const storedData = await this.storeCompleteApplicantData({
                userId,
                applicantId,
                personalInfo,
                documentsInfo,
                status: statusData,
                rawApplicantData: applicantData
            });
            
            console.log(`✅ Basic storage completed for user ${userId}`);
            
            return {
                success: true,
                enhanced: false,
                personalInfo,
                documentsInfo,
                status: statusData,
                storedData
            };
            
        } catch (error) {
            console.error(`❌ Error in basic storage:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract documents information from applicant data
     */
    extractDocumentsInfo(applicantData) {
        try {
            const documents = [];
            
            if (applicantData.requiredIdDocs && applicantData.requiredIdDocs.docSets) {
                applicantData.requiredIdDocs.docSets.forEach(docSet => {
                    if (docSet.identityDocs) {
                        docSet.identityDocs.forEach(doc => {
                            documents.push({
                                type: doc.idDocType,
                                subType: doc.idDocSubType,
                                country: doc.country,
                                number: doc.number,
                                issuedDate: doc.issuedDate,
                                validUntil: doc.validUntil,
                                imageIds: doc.imageIds || [],
                                status: doc.reviewResult?.reviewAnswer || 'PENDING'
                            });
                        });
                    }
                });
            }
            
            // Also check for images/selfies
            if (applicantData.images) {
                applicantData.images.forEach(image => {
                    documents.push({
                        type: 'IMAGE',
                        subType: image.imageType,
                        imageId: image.imageId,
                        status: image.reviewResult?.reviewAnswer || 'PENDING'
                    });
                });
            }
            
            return {
                totalDocuments: documents.length,
                documents: documents,
                extractedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error extracting documents info:', error.message);
            return {
                totalDocuments: 0,
                documents: [],
                error: error.message,
                extractedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Store complete applicant data in database
     */
    async storeCompleteApplicantData(data) {
        try {
            const { userId, applicantId, personalInfo, documentsInfo, status, rawApplicantData } = data;
            
            // Check if user exists
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });
            
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            
            // Create or update KYC data record
            const kycData = await prisma.kycData.upsert({
                where: {
                    userId: userId
                },
                update: {
                    applicantId,
                    status: status.reviewStatus,
                    reviewResult: status.reviewResult?.reviewAnswer || null,
                    personalInfo: JSON.stringify(personalInfo),
                    documentsInfo: JSON.stringify(documentsInfo),
                    rawApplicantData: JSON.stringify(rawApplicantData),
                    rawStatusData: JSON.stringify(status),
                    verifiedAt: status.reviewStatus === 'completed' ? new Date() : null,
                    updatedAt: new Date()
                },
                create: {
                    userId,
                    applicantId,
                    status: status.reviewStatus,
                    reviewResult: status.reviewResult?.reviewAnswer || null,
                    personalInfo: JSON.stringify(personalInfo),
                    documentsInfo: JSON.stringify(documentsInfo),
                    rawApplicantData: JSON.stringify(rawApplicantData),
                    rawStatusData: JSON.stringify(status),
                    verifiedAt: status.reviewStatus === 'completed' ? new Date() : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            
            console.log(`✅ KYC data stored/updated for user ${userId}, record ID: ${kycData.id}`);
            
                         return kycData;
             
         } catch (error) {
             console.error('❌ Error storing applicant data in database:', error.message);
             throw error;
         }
     }

    /**
     * Process webhook from Sumsub
     */
    async processWebhook(req, res) {
        try {
            console.log('🔔 Webhook received from Sumsub');
            console.log('📨 Headers:', JSON.stringify(req.headers, null, 2));
            console.log('📝 Body:', JSON.stringify(req.body, null, 2));
            
            const { type } = req.body;
            
            if (!type) {
                console.error('❌ Missing webhook type in payload');
                return res.status(400).json({ success: false, message: 'Missing webhook type' });
            }
            
            // Process the webhook
            const result = await this.handleWebhookType(type, req.body);
            
            console.log(`✅ Webhook processed successfully:`, result);
            return res.status(200).json({ success: true, ...result });
            
        } catch (error) {
            console.error('❌ Error processing webhook:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Handle different webhook types
     */
    async handleWebhookType(type, payload) {
        const applicantId = payload.applicantId;
        const externalUserId = payload.externalUserId;
        const reviewStatus = payload.reviewStatus || 'unknown';
        
        console.log(`🔄 Processing webhook type: ${type}`);
        console.log(`📋 Applicant: ${applicantId}, External ID: ${externalUserId}, Status: ${reviewStatus}`);
        
        switch (type) {
            case 'applicantCreated':
                return await this.handleApplicantCreated(payload);
            case 'applicantReviewed':
                return await this.handleApplicantReviewed(payload);
            case 'applicantPending':
                return await this.handleApplicantPending(payload);
            case 'applicantPersonalInfoChanged':
                return await this.handleApplicantPersonalInfoChanged(payload);
            case 'test':
                return { action: 'test', success: true, message: 'Test webhook received' };
            default:
                console.log(`⚠️ Unhandled webhook type: ${type}`);
                return { action: type, success: true, message: `Webhook type ${type} received but not processed` };
        }
    }

    /**
     * Handle applicant reviewed webhook - Update your database
     */
    async handleApplicantReviewed(payload) {
        const applicantId = payload.applicantId;
        const reviewResult = payload.reviewResult;
        const reviewStatus = payload.reviewStatus;
        const externalUserId = payload.externalUserId;
        
        console.log(`🔄 Processing applicantReviewed webhook for: ${applicantId}`);
        console.log(`📊 Review status: ${reviewStatus}`);
        console.log(`📊 Review result:`, JSON.stringify(reviewResult, null, 2));
        
        // Extract user ID from external user ID
        const userId = this.extractUserId(externalUserId);
        
        if (!userId) {
            console.error(`❌ Could not extract user ID from external user ID: ${externalUserId}`);
            return { action: 'applicantReviewed', success: false, error: 'Invalid external user ID' };
        }
        
        const reviewAnswer = reviewResult?.reviewAnswer;
        const isApproved = reviewAnswer === 'GREEN' || reviewStatus === 'completed';
        
        console.log(`📋 Review answer: ${reviewAnswer}, Is approved: ${isApproved}`);
        
        try {
            // ENHANCED STORAGE: Use the enhanced storage service for complete data extraction
            console.log('🚀 WEBHOOK TRIGGERED - Using enhanced storage for complete data extraction...');
            
            // Import enhanced storage dynamically
            const { EnhancedSumsubStorage } = await import('./enhancedSumsubStorage.js');
            const enhancedStorage = new EnhancedSumsubStorage();
            
            // Ensure user exists first
            await prisma.users.upsert({
                where: { id: userId },
                update: {},
                create: {
                    id: userId,
                    name: `User ${userId}`,
                    email: `user${userId}@webhook.generated`,
                    provider: 'webhook'
                }
            });
            
            // Store complete applicant data with enhanced storage
            const storeResult = await enhancedStorage.storeCompleteApplicantData(applicantId, userId);
            
            if (storeResult.success) {
                console.log(`✅ ENHANCED WEBHOOK STORAGE completed for user ${userId}`);
                console.log(`📄 Documents stored: ${storeResult.results.documents?.documents?.length || 0}`);
                console.log(`👤 Personal info: ${storeResult.results.personalInfo?.success ? 'SUCCESS' : 'FAILED'}`);
                
                // Extract personal info from the stored data
                if (storeResult.results.personalInfo?.success) {
                    const personalInfo = storeResult.results.personalInfo.personalInfo;
                    
                    // Update user with extracted personal information
                    await prisma.users.update({
                        where: { id: userId },
                        data: {
                            name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || undefined,
                            email: personalInfo.email || undefined
                        }
                    });
                    
                    console.log(`👤 User updated: ${personalInfo.firstName} ${personalInfo.lastName} (${personalInfo.email})`);
                }
                
            } else {
                console.log(`❌ Enhanced webhook storage failed: ${storeResult.error}`);
                // Fallback to basic storage
                const personalInfoResult = await this.storePersonalInfo(applicantId, userId);
                console.log('📋 Basic storage fallback result:', personalInfoResult);
            }
            
            if (isApproved) {
                console.log(`🎉 KYC verification APPROVED for user: ${userId}`);
            } else {
                console.log(`❌ KYC verification REJECTED for user: ${userId}`);
            }
            
            return {
                action: 'applicantReviewed',
                success: true,
                applicantId,
                userId,
                reviewStatus,
                isApproved,
                enhancedStorage: storeResult.success,
                documentsStored: storeResult.results?.documents?.documents?.length || 0,
                personalInfoExtracted: storeResult.results?.personalInfo?.success || false
            };
        } catch (error) {
            console.error('❌ Error in enhanced webhook processing:', error);
            return {
                action: 'applicantReviewed',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Handle other webhook types
     */
    async handleApplicantCreated(payload) {
        console.log('👤 Applicant created:', payload.applicantId);
        return { action: 'applicantCreated', success: true };
    }

    async handleApplicantPending(payload) {
        console.log('⏳ Applicant pending:', payload.applicantId);
        return { action: 'applicantPending', success: true };
    }

    async handleApplicantPersonalInfoChanged(payload) {
        console.log('📝 Applicant info changed:', payload.applicantId);
        return { action: 'applicantPersonalInfoChanged', success: true };
    }

    /**
     * Store personal information from KYC verification
     */
    async storePersonalInfo(applicantId, userId) {
        try {
            console.log(`📋 Fetching applicant data for: ${applicantId}`);
            
            const applicantResult = await this.getApplicant(applicantId);
            
            if (!applicantResult.success) {
                throw new Error(`Failed to fetch applicant data: ${applicantResult.error}`);
            }
            
            const applicantData = applicantResult.data;
            const personalInfo = this.extractPersonalInfo(applicantData);
            
            console.log('📊 Extracted personal info:', JSON.stringify(personalInfo, null, 2));
            
            // Update user with extracted personal information
            const updatedUser = await prisma.users.update({
                where: { id: userId },
                data: {
                    name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || undefined,
                    // Add more fields as needed based on your database schema
                }
            });
            
            return {
                success: true,
                personalInfo,
                message: 'Personal information extracted and stored successfully'
            };
        } catch (error) {
            console.error('❌ Error storing personal info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract personal information from applicant data
     */
    extractPersonalInfo(applicantData) {
        const fixedInfo = applicantData.fixedInfo || {};
        const info = applicantData.info || {};
        
        return {
            firstName: fixedInfo.firstName || info.firstName || '',
            lastName: fixedInfo.lastName || info.lastName || '',
            email: applicantData.email || fixedInfo.email || '',
            phone: fixedInfo.phone || info.phone || '',
            dateOfBirth: fixedInfo.dob || info.dob || '',
            nationality: fixedInfo.nationality || info.nationality || '',
            addresses: info.addresses || [],
            idDocNumber: info.idDocNumber || '',
            applicantId: applicantData.id || '',
            isVerified: applicantData.reviewResult?.reviewAnswer === 'GREEN',
            reviewStatus: applicantData.reviewStatus || 'unknown'
        };
    }

    /**
     * Extract user ID from external user ID
     */
    extractUserId(externalUserId) {
        if (!externalUserId) return null;
        
        // Handle 'user-123' format
        const userIdMatch = externalUserId.match(/^user-(\d+)$/);
        if (userIdMatch && userIdMatch[1]) {
            return parseInt(userIdMatch[1]);
        }
        
        return null;
    }

    /**
     * Format verification status for frontend
     */
    static formatVerificationStatus(status) {
        const statusMap = {
            'GREEN': 'approved',
            'RED': 'rejected',
            'YELLOW': 'pending',
            'completed': 'approved',
            'pending': 'pending',
            'init': 'initialized'
        };
        
        return statusMap[status] || status;
    }
} 