import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com';
const KYC_DOCS_BASE_DIR = path.join(__dirname, '../uploads/kyc');

export class EnhancedSumsubStorage {
    constructor() {
        this.appToken = SUMSUB_APP_TOKEN;
        this.secretKey = SUMSUB_SECRET_KEY;
        this.baseUrl = SUMSUB_BASE_URL;
        
        console.log('🗄️ Enhanced Sumsub Storage initialized');
        console.log(`- App Token: ${this.appToken?.substring(0, 10)}...`);
        console.log(`- Secret Key: ${this.secretKey?.substring(0, 5)}...`);
    }

    /**
     * 🔐 Generate API signature
     */
    generateApiSignature(method, endpoint, ts, body = '') {
        method = method.toUpperCase();
        const bodyStr = body === null || body === undefined ? '' : 
                       (typeof body === 'object' ? JSON.stringify(body) : String(body));
        const signingString = `${ts}${method}${endpoint}${bodyStr}`;
        
        return crypto.createHmac('sha256', this.secretKey)
            .update(signingString)
            .digest('hex');
    }

    /**
     * 🌐 Make authenticated API request
     */
    async makeApiRequest(method, endpoint, body = null) {
        try {
            const ts = Math.floor(Date.now() / 1000).toString();
            const signature = this.generateApiSignature(method, endpoint, ts, body);
            
            const headers = {
                'Accept': 'application/json',
                'X-App-Token': this.appToken,
                'X-App-Access-Sig': signature,
                'X-App-Access-Ts': ts
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
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * 📋 Store comprehensive personal information
     */
    async storeComprehensivePersonalInfo(applicantId, userId) {
        try {
            console.log(`📋 Fetching comprehensive personal info for: ${applicantId}`);
            
            // Get applicant data from Sumsub
            const result = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/one`);
            if (!result.success) {
                throw new Error(`Failed to fetch applicant data: ${result.error}`);
            }
            
            const applicantData = result.data;
            
            // Extract comprehensive personal information
            const personalInfo = this.extractComprehensivePersonalInfo(applicantData);
            
            // Update existing KycData record
            const kycData = await prisma.kycData.upsert({
                where: { userId: userId },
                update: {
                    personalInfo: JSON.stringify(personalInfo),
                    rawApplicantData: JSON.stringify(applicantData),
                    updatedAt: new Date()
                },
                create: {
                    userId: userId,
                    applicantId: applicantId,
                    status: applicantData.reviewStatus || 'pending',
                    reviewResult: applicantData.reviewResult?.reviewAnswer || null,
                    personalInfo: JSON.stringify(personalInfo),
                    documentsInfo: JSON.stringify({}),
                    rawApplicantData: JSON.stringify(applicantData),
                    rawStatusData: JSON.stringify({}),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            
            console.log(`✅ Comprehensive personal info stored for user ${userId}`);
            return {
                success: true,
                personalInfo,
                kycData
            };
        } catch (error) {
            console.error('❌ Error storing comprehensive personal info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔍 Extract comprehensive personal info
     */
    extractComprehensivePersonalInfo(applicantData) {
        const fixedInfo = applicantData.fixedInfo || {};
        const info = applicantData.info || {};
        const reviewResult = applicantData.reviewResult || {};
        
        return {
            // Basic Information
            applicantId: applicantData.id || '',
            externalUserId: applicantData.externalUserId || '',
            email: applicantData.email || fixedInfo.email || '',
            
            // Personal Details
            firstName: fixedInfo.firstName || info.firstName || '',
            lastName: fixedInfo.lastName || info.lastName || '',
            middleName: fixedInfo.middleName || info.middleName || '',
            dateOfBirth: fixedInfo.dob || info.dob || '',
            placeOfBirth: fixedInfo.placeOfBirth || info.placeOfBirth || '',
            nationality: fixedInfo.nationality || info.nationality || '',
            gender: fixedInfo.gender || info.gender || '',
            
            // Contact Information
            phone: fixedInfo.phone || info.phone || '',
            mobilePhone: fixedInfo.mobilePhone || info.mobilePhone || '',
            
            // Address Information
            addresses: this.extractAddresses(info.addresses || []),
            country: fixedInfo.country || info.country || '',
            
            // Document Information
            idDocType: info.idDocType || '',
            idDocNumber: info.idDocNumber || '',
            idDocIssuedDate: info.idDocIssuedDate || '',
            idDocValidUntil: info.idDocValidUntil || '',
            idDocPersonalNumber: info.idDocPersonalNumber || '',
            
            // Verification Status
            reviewStatus: applicantData.reviewStatus || 'unknown',
            reviewAnswer: reviewResult.reviewAnswer || '',
            isVerified: reviewResult.reviewAnswer === 'GREEN',
            verificationLevel: this.determineVerificationLevel(applicantData),
            
            // Additional Data
            tags: applicantData.tags || [],
            metadata: this.extractMetadata(applicantData),
            
            // Timestamps
            createdAt: applicantData.createdAt || new Date().toISOString(),
            reviewDate: reviewResult.reviewDate || null,
            extractedAt: new Date().toISOString()
        };
    }

    /**
     * 🏠 Extract addresses
     */
    extractAddresses(addresses) {
        return addresses.map(addr => ({
            country: addr.country || '',
            postCode: addr.postCode || '',
            town: addr.town || '',
            street: addr.street || '',
            subStreet: addr.subStreet || '',
            state: addr.state || '',
            buildingName: addr.buildingName || '',
            flatNumber: addr.flatNumber || '',
            buildingNumber: addr.buildingNumber || '',
            startDate: addr.startDate || '',
            endDate: addr.endDate || ''
        }));
    }

    /**
     * 📊 Extract metadata
     */
    extractMetadata(applicantData) {
        return {
            inspectionId: applicantData.inspectionId || '',
            externalUserId: applicantData.externalUserId || '',
            sourceKey: applicantData.sourceKey || '',
            clientId: applicantData.clientId || '',
            env: applicantData.env || '',
            levelName: applicantData.levelName || '',
            sandboxMode: applicantData.sandboxMode || false
        };
    }

    /**
     * 📄 Store document metadata and download files
     */
    async storeDocumentMetadata(applicantId, userId) {
        try {
            console.log(`📄 Fetching document metadata for: ${applicantId}`);
            
            // Get required documents status
            const docsResult = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/requiredIdDocsStatus`);
            if (!docsResult.success) {
                throw new Error(`Failed to fetch documents: ${docsResult.error}`);
            }
            
            // Get applicant data for inspection ID
            const applicantResult = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/one`);
            if (!applicantResult.success) {
                throw new Error(`Failed to fetch applicant: ${applicantResult.error}`);
            }
            
            const applicantData = applicantResult.data;
            const inspectionId = applicantData.inspectionId;
            
            if (!inspectionId) {
                throw new Error('No inspection ID found for applicant');
            }
            
            // Extract and store documents
            const documentResults = await this.extractAndStoreDocuments(
                applicantId, 
                userId,
                docsResult.data, 
                applicantData
            );
            
            console.log(`✅ Document metadata stored for: ${applicantId}`);
            return {
                success: true,
                documents: documentResults,
                message: 'Document metadata stored successfully'
            };
        } catch (error) {
            console.error('❌ Error storing document metadata:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🗂️ Extract and store documents
     */
    async extractAndStoreDocuments(applicantId, userId, documentMetadata, applicantData) {
        const inspectionId = applicantData.inspectionId;
        const documents = [];
        
        if (!documentMetadata || !Array.isArray(documentMetadata)) {
            console.warn('No document metadata available');
            return documents;
        }
        
        for (const docSet of documentMetadata) {
            if (!docSet.imageIds || docSet.imageIds.length === 0) {
                continue;
            }
            
            for (const imageId of docSet.imageIds) {
                try {
                    // Download document image
                    const imageResult = await this.downloadDocumentImage(applicantId, inspectionId, imageId);
                    
                    if (imageResult.success) {
                        // Create folder structure
                        const folderPath = await this.createDateBasedFolderStructure(applicantId);
                        
                        // Save file
                        const fileName = `${imageId}.${this.getFileExtensionFromContentType(imageResult.contentType)}`;
                        const filePath = path.join(folderPath, fileName);
                        
                        await fs.writeFile(filePath, imageResult.data);
                        
                        // Store document info in documents array
                        const documentInfo = {
                            imageId: imageId,
                            docType: docSet.idDocSetType || 'UNKNOWN',
                            docSubType: docSet.types ? docSet.types.join(',') : '',
                            fileName: fileName,
                            filePath: filePath,
                            contentType: imageResult.contentType,
                            fileSize: imageResult.data.length,
                            status: this.determineDocumentStatus(docSet),
                            downloadedAt: new Date().toISOString()
                        };
                        
                        documents.push(documentInfo);
                        console.log(`📄 Document saved: ${fileName}`);
                    }
                } catch (error) {
                    console.error(`❌ Error processing document ${imageId}:`, error);
                }
            }
        }
        
        // Update KycData with documents info
        await prisma.kycData.update({
            where: { userId: userId },
            data: {
                documentsInfo: JSON.stringify({
                    totalDocuments: documents.length,
                    documents: documents,
                    extractedAt: new Date().toISOString()
                }),
                updatedAt: new Date()
            }
        });
        
        return documents;
    }

    /**
     * 📥 Download document image
     */
    async downloadDocumentImage(applicantId, inspectionId, imageId) {
        try {
            const endpoint = `/resources/inspections/${inspectionId}/resources/${imageId}`;
            const ts = Math.floor(Date.now() / 1000).toString();
            const signature = this.generateApiSignature('GET', endpoint, ts);
            
            const headers = {
                'X-App-Token': this.appToken,
                'X-App-Access-Sig': signature,
                'X-App-Access-Ts': ts
            };
            
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                headers,
                responseType: 'arraybuffer'
            });
            
            return {
                success: true,
                data: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            console.error(`❌ Error downloading document ${imageId}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 📁 Create date-based folder structure
     */
    async createDateBasedFolderStructure(applicantId) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const folderPath = path.join(KYC_DOCS_BASE_DIR, String(year), month, day, applicantId);
        
        try {
            await fs.mkdir(folderPath, { recursive: true });
            console.log(`📁 Created folder: ${folderPath}`);
            return folderPath;
        } catch (error) {
            console.error('❌ Error creating folder structure:', error);
            throw error;
        }
    }

    /**
     * 🚀 Complete data storage pipeline
     */
    async storeCompleteApplicantData(applicantId, userId) {
        try {
            console.log(`🚀 Starting complete data storage for applicant: ${applicantId}, user: ${userId}`);
            
            const results = {
                applicantId,
                userId,
                personalInfo: null,
                documents: null,
                errors: []
            };
            
            // 1. Store comprehensive personal information
            try {
                results.personalInfo = await this.storeComprehensivePersonalInfo(applicantId, userId);
                if (!results.personalInfo.success) {
                    results.errors.push(`Personal Info: ${results.personalInfo.error}`);
                }
            } catch (error) {
                results.errors.push(`Personal Info: ${error.message}`);
            }
            
            // 2. Store document metadata and download files
            try {
                results.documents = await this.storeDocumentMetadata(applicantId, userId);
                if (!results.documents.success) {
                    results.errors.push(`Documents: ${results.documents.error}`);
                }
            } catch (error) {
                results.errors.push(`Documents: ${error.message}`);
            }
            
            console.log(`✅ Complete data storage finished for: ${applicantId}`);
            console.log(`Errors: ${results.errors.length}`);
            
            return {
                success: results.errors.length === 0,
                results,
                message: results.errors.length === 0 ? 
                    'All data stored successfully' : 
                    `Stored with ${results.errors.length} errors`
            };
        } catch (error) {
            console.error('❌ Error in complete data storage:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🛠️ UTILITY FUNCTIONS
     */
    
    // Extract user ID from external user ID
    extractUserId(externalUserId) {
        if (!externalUserId) return null;
        
        const userIdMatch = externalUserId.match(/^user-(\d+)$/);
        if (userIdMatch && userIdMatch[1]) {
            return parseInt(userIdMatch[1]);
        }
        
        return null;
    }
    
    // Determine verification level
    determineVerificationLevel(applicantData) {
        const hasIdentityDoc = applicantData.info?.idDocNumber;
        const hasAddressVerification = applicantData.info?.addresses?.length > 0;
        const hasPEPCheck = applicantData.reviewResult?.reviewAnswer === 'GREEN';
        
        if (hasIdentityDoc && hasAddressVerification && hasPEPCheck) {
            return 'full';
        } else if (hasIdentityDoc) {
            return 'basic';
        }
        return 'minimal';
    }
    
    // Determine document status
    determineDocumentStatus(docItem) {
        if (docItem.reviewResult?.reviewAnswer === 'GREEN') {
            return 'approved';
        } else if (docItem.reviewResult?.reviewAnswer === 'RED') {
            return 'rejected';
        }
        return 'pending';
    }
    
    // Get file extension from content type
    getFileExtensionFromContentType(contentType) {
        const extensionMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/bmp': 'bmp',
            'image/webp': 'webp',
            'application/pdf': 'pdf'
        };
        
        return extensionMap[contentType] || 'bin';
    }

    /**
     * 🔍 Get all stored data for user
     */
    async getAllStoredDataForUser(userId) {
        try {
            const kycData = await prisma.kycData.findUnique({
                where: { userId: userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            
            if (!kycData) {
                return {
                    success: false,
                    message: 'No KYC data found for user'
                };
            }
            
            return {
                success: true,
                data: {
                    ...kycData,
                    personalInfo: kycData.personalInfo ? JSON.parse(kycData.personalInfo) : null,
                    documentsInfo: kycData.documentsInfo ? JSON.parse(kycData.documentsInfo) : null,
                    rawApplicantData: kycData.rawApplicantData ? JSON.parse(kycData.rawApplicantData) : null,
                    rawStatusData: kycData.rawStatusData ? JSON.parse(kycData.rawStatusData) : null
                }
            };
        } catch (error) {
            console.error('❌ Error getting stored data for user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
} 