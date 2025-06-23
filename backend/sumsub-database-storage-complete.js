/**
 * Complete Sumsub Database Storage Implementation
 * Based on your project structure with Prisma ORM
 * Stores ALL Sumsub data including personal info, documents, verification status, etc.
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Your Sumsub configuration
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN || 'sbx:tM8HVP9NTOKvJMGn0ivKhYpr.eL4yA7WHjYXzbZDeh818LZdZ2cnHCLZr';
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY || '535NduU5ydNWqHnFsplSuiq7wDPR3BnC';
const SUMSUB_BASE_URL = 'https://api.sumsub.com';
const KYC_DOCS_BASE_DIR = path.join(__dirname, '../uploads/kyc');

class SumsubDatabaseStorage {
    constructor() {
        this.appToken = SUMSUB_APP_TOKEN;
        this.secretKey = SUMSUB_SECRET_KEY;
        this.baseUrl = SUMSUB_BASE_URL;
        
        console.log('🗄️ Sumsub Database Storage initialized');
        console.log(`- App Token: ${this.appToken.substring(0, 10)}...`);
        console.log(`- Secret Key: ${this.secretKey.substring(0, 5)}...`);
    }

    /**
     * 🔐 Generate API signature (your implementation)
     */
    generateApiSignature(method, endpoint, ts, body = '') {
        const dataToSign = ts + method.toUpperCase() + endpoint + body;
        return crypto.createHmac('sha256', this.secretKey)
            .update(dataToSign)
            .digest('hex');
    }

    /**
     * 🌐 Make authenticated API request
     */
    async makeApiRequest(method, endpoint, body = null) {
        try {
            const ts = Math.floor(Date.now() / 1000).toString();
            const payload = body ? JSON.stringify(body) : '';
            const signature = this.generateApiSignature(method, endpoint, ts, payload);
            
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
            
            return response.data;
        } catch (error) {
            console.error(`Sumsub API error (${method} ${endpoint}):`, error.message);
            throw error;
        }
    }

    /**
     * 📝 1. STORE WEBHOOK LOG (Your implementation)
     */
    async storeWebhookLog(type, payload, status = 'received') {
        try {
            const webhookLog = await prisma.webhookLog.create({
                data: {
                    provider: 'sumsub',
                    type: type,
                    payload: JSON.stringify(payload),
                    status: status,
                    created_at: new Date()
                }
            });
            
            console.log(`📝 Webhook logged: ${webhookLog.id}`);
            return webhookLog;
        } catch (error) {
            console.error('Error storing webhook log:', error);
            throw error;
        }
    }

    /**
     * 👤 2. STORE KYC VERIFICATION RECORD (Your implementation)
     */
    async storeKycVerification(payload, signatureValid = true) {
        try {
            const applicantId = payload.applicantId;
            const reviewResult = payload.reviewResult;
            const reviewStatus = payload.reviewStatus;
            const externalUserId = payload.externalUserId;
            
            // Extract userId from externalUserId
            const userId = this.extractUserId(externalUserId);
            
            const kycData = {
                type: payload.type || 'applicantReviewed',
                applicant_id: applicantId,
                correlation_id: payload.correlationId,
                external_user_id: externalUserId,
                inspection_id: payload.inspectionId,
                review_status: reviewStatus || 'unknown',
                review_result: JSON.stringify(reviewResult),
                raw_data: JSON.stringify(payload),
                user_id: userId || null,
                webhook_type: payload.type || 'applicantReviewed',
                signature_valid: signatureValid,
                event_timestamp: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
                // Additional fields
                is_verified: reviewResult?.reviewAnswer === 'GREEN',
                kyc_status: this.determineKycStatus(reviewResult, reviewStatus),
                personal_info_extracted: false,
                personal_info_message: null
            };
            
            const kycVerification = await prisma.kycVerification.create({
                data: kycData
            });
            
            console.log(`✅ KYC verification stored: ${kycVerification.id}`);
            return kycVerification;
        } catch (error) {
            console.error('Error storing KYC verification:', error);
            throw error;
        }
    }

    /**
     * 📋 3. STORE COMPREHENSIVE PERSONAL INFO (Your implementation)
     */
    async storeComprehensivePersonalInfo(applicantId) {
        try {
            console.log(`📋 Fetching comprehensive personal info for: ${applicantId}`);
            
            // Get applicant data from Sumsub
            const applicantData = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/one`);
            
            // Extract personal information
            const personalInfo = this.extractComprehensivePersonalInfo(applicantData);
            
            // Save to database
            const savedInfo = await this.saveComprehensivePersonalInfo(applicantId, personalInfo);
            
            console.log(`✅ Comprehensive personal info stored for: ${applicantId}`);
            return {
                success: true,
                personalInfo: savedInfo,
                message: 'Comprehensive personal information stored successfully'
            };
        } catch (error) {
            console.error('Error storing comprehensive personal info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔍 Extract comprehensive personal info (Your implementation)
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
            
            // Raw data for backup
            rawApplicantData: JSON.stringify(applicantData)
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
     * 💾 Save comprehensive personal info to database
     */
    async saveComprehensivePersonalInfo(applicantId, personalInfo) {
        try {
            // Check if record already exists
            const existing = await prisma.sumsubPersonalInfo.findFirst({
                where: { applicant_id: applicantId }
            });
            
            const personalInfoData = {
                applicant_id: applicantId,
                external_user_id: personalInfo.externalUserId,
                email: personalInfo.email,
                first_name: personalInfo.firstName,
                last_name: personalInfo.lastName,
                middle_name: personalInfo.middleName,
                date_of_birth: personalInfo.dateOfBirth,
                place_of_birth: personalInfo.placeOfBirth,
                nationality: personalInfo.nationality,
                gender: personalInfo.gender,
                phone: personalInfo.phone,
                mobile_phone: personalInfo.mobilePhone,
                addresses: JSON.stringify(personalInfo.addresses),
                country: personalInfo.country,
                id_doc_type: personalInfo.idDocType,
                id_doc_number: personalInfo.idDocNumber,
                id_doc_issued_date: personalInfo.idDocIssuedDate,
                id_doc_valid_until: personalInfo.idDocValidUntil,
                id_doc_personal_number: personalInfo.idDocPersonalNumber,
                review_status: personalInfo.reviewStatus,
                review_answer: personalInfo.reviewAnswer,
                is_verified: personalInfo.isVerified,
                verification_level: personalInfo.verificationLevel,
                tags: JSON.stringify(personalInfo.tags),
                metadata: JSON.stringify(personalInfo.metadata),
                created_at_sumsub: personalInfo.createdAt,
                review_date: personalInfo.reviewDate,
                raw_applicant_data: personalInfo.rawApplicantData,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            let savedInfo;
            if (existing) {
                savedInfo = await prisma.sumsubPersonalInfo.update({
                    where: { id: existing.id },
                    data: { ...personalInfoData, updated_at: new Date() }
                });
                console.log(`📝 Updated existing personal info record: ${savedInfo.id}`);
            } else {
                savedInfo = await prisma.sumsubPersonalInfo.create({
                    data: personalInfoData
                });
                console.log(`✨ Created new personal info record: ${savedInfo.id}`);
            }
            
            return savedInfo;
        } catch (error) {
            console.error('Error saving comprehensive personal info:', error);
            throw error;
        }
    }

    /**
     * 📄 4. STORE DOCUMENT METADATA AND FILES (Your implementation)
     */
    async storeDocumentMetadata(applicantId) {
        try {
            console.log(`📄 Fetching document metadata for: ${applicantId}`);
            
            // Get required documents status
            const documentsStatus = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/requiredIdDocsStatus`);
            
            // Get applicant data for inspection ID
            const applicantData = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/one`);
            const inspectionId = applicantData.inspectionId;
            
            if (!inspectionId) {
                throw new Error('No inspection ID found for applicant');
            }
            
            // Extract and store documents
            const documentResults = await this.extractAndStoreDocuments(applicantId, documentsStatus, applicantData);
            
            console.log(`✅ Document metadata stored for: ${applicantId}`);
            return {
                success: true,
                documents: documentResults,
                message: 'Document metadata stored successfully'
            };
        } catch (error) {
            console.error('Error storing document metadata:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🗂️ Extract and store documents
     */
    async extractAndStoreDocuments(applicantId, documentMetadata, applicantData) {
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
                        
                        // Create document record
                        const documentRecord = {
                            applicant_id: applicantId,
                            inspection_id: inspectionId,
                            image_id: imageId,
                            doc_type: docSet.idDocSetType || 'UNKNOWN',
                            doc_sub_type: docSet.types ? docSet.types.join(',') : '',
                            file_path: filePath,
                            file_name: fileName,
                            content_type: imageResult.contentType,
                            file_size: imageResult.data.length,
                            status: this.determineDocumentStatus(docSet),
                            metadata: JSON.stringify({
                                docSet: docSet,
                                imageId: imageId,
                                inspectionId: inspectionId
                            }),
                            created_at: new Date(),
                            updated_at: new Date()
                        };
                        
                        const savedDocument = await this.saveDocumentRecord(documentRecord);
                        documents.push(savedDocument);
                        
                        console.log(`📄 Document saved: ${fileName}`);
                    }
                } catch (error) {
                    console.error(`Error processing document ${imageId}:`, error);
                }
            }
        }
        
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
            console.error(`Error downloading document ${imageId}:`, error);
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
            console.error('Error creating folder structure:', error);
            throw error;
        }
    }

    /**
     * 💾 Save document record to database
     */
    async saveDocumentRecord(documentRecord) {
        try {
            const document = await prisma.sumsubDocument.create({
                data: documentRecord
            });
            
            console.log(`📄 Document record saved: ${document.id}`);
            return document;
        } catch (error) {
            console.error('Error saving document record:', error);
            throw error;
        }
    }

    /**
     * 🗃️ 5. STORE RAW APPLICANT DATA (Your implementation)
     */
    async storeRawApplicantData(applicantId, dataType = 'full_applicant_data') {
        try {
            console.log(`🗃️ Storing raw applicant data for: ${applicantId}`);
            
            // Get complete applicant data
            const applicantData = await this.makeApiRequest('GET', `/resources/applicants/${applicantId}/one`);
            
            // Store raw data
            const rawDataRecord = await prisma.sumsubRawData.create({
                data: {
                    applicant_id: applicantId,
                    data_type: dataType,
                    raw_data: JSON.stringify(applicantData),
                    data_size: JSON.stringify(applicantData).length,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
            
            console.log(`✅ Raw applicant data stored: ${rawDataRecord.id}`);
            return {
                success: true,
                record: rawDataRecord,
                message: 'Raw applicant data stored successfully'
            };
        } catch (error) {
            console.error('Error storing raw applicant data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔗 6. LINK DATA WITH USER (Your implementation)
     */
    async linkDataWithUser(userId, applicantId) {
        try {
            console.log(`🔗 Linking applicant ${applicantId} with user ${userId}`);
            
            // Update issuer record with applicant ID
            const issuer = await prisma.issuer.findFirst({
                where: { user_id: userId }
            });
            
            if (issuer) {
                await prisma.issuer.update({
                    where: { id: issuer.id },
                    data: { 
                        sumsub_applicant_id: applicantId,
                        updated_at: new Date()
                    }
                });
                
                console.log(`✅ Updated issuer ${issuer.id} with applicant ID`);
            }
            
            // Update KYC verification records
            await prisma.kycVerification.updateMany({
                where: { applicant_id: applicantId },
                data: { 
                    user_id: userId,
                    updated_at: new Date()
                }
            });
            
            // Update personal info records
            await prisma.sumsubPersonalInfo.updateMany({
                where: { applicant_id: applicantId },
                data: { 
                    user_id: userId,
                    updated_at: new Date()
                }
            });
            
            console.log(`✅ Linked all data for applicant ${applicantId} with user ${userId}`);
            return {
                success: true,
                message: 'Data linked with user successfully'
            };
        } catch (error) {
            console.error('Error linking data with user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 📊 7. COMPLETE DATA STORAGE PIPELINE
     */
    async storeCompleteApplicantData(applicantId, webhookPayload = null) {
        try {
            console.log(`🚀 Starting complete data storage for: ${applicantId}`);
            
            const results = {
                applicantId,
                personalInfo: null,
                documents: null,
                rawData: null,
                userLink: null,
                errors: []
            };
            
            // 1. Store personal information
            try {
                results.personalInfo = await this.storeComprehensivePersonalInfo(applicantId);
            } catch (error) {
                results.errors.push(`Personal Info: ${error.message}`);
            }
            
            // 2. Store document metadata and files
            try {
                results.documents = await this.storeDocumentMetadata(applicantId);
            } catch (error) {
                results.errors.push(`Documents: ${error.message}`);
            }
            
            // 3. Store raw applicant data
            try {
                results.rawData = await this.storeRawApplicantData(applicantId);
            } catch (error) {
                results.errors.push(`Raw Data: ${error.message}`);
            }
            
            // 4. Link with user if possible
            if (webhookPayload && webhookPayload.externalUserId) {
                try {
                    const userId = this.extractUserId(webhookPayload.externalUserId);
                    if (userId) {
                        results.userLink = await this.linkDataWithUser(userId, applicantId);
                    }
                } catch (error) {
                    results.errors.push(`User Link: ${error.message}`);
                }
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
            console.error('Error in complete data storage:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🛠️ UTILITY FUNCTIONS
     */
    
    // Extract user ID from external user ID (your implementation)
    extractUserId(externalUserId) {
        if (!externalUserId) return null;
        
        const userIdMatch = externalUserId.match(/^user-(\d+)$/);
        if (userIdMatch && userIdMatch[1]) {
            return parseInt(userIdMatch[1]);
        }
        
        const userIdMatch2 = externalUserId.match(/^userId-(\d+)$/);
        if (userIdMatch2 && userIdMatch2[1]) {
            return parseInt(userIdMatch2[1]);
        }
        
        return null;
    }
    
    // Determine KYC status
    determineKycStatus(reviewResult, reviewStatus) {
        if (reviewResult?.reviewAnswer === 'GREEN' || reviewStatus === 'completed') {
            return 'verified';
        } else if (reviewResult?.reviewAnswer === 'RED') {
            return 'rejected';
        } else if (reviewResult?.reviewAnswer === 'YELLOW' || reviewStatus === 'pending') {
            return 'pending';
        }
        return 'unknown';
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
     * 🔍 SEARCH AND RETRIEVAL FUNCTIONS
     */
    
    // Find user by Sumsub identifiers
    async findUserBySumsubIdentifiers(applicantId, externalUserId) {
        console.log(`🔍 Looking up user for applicantId=${applicantId}, externalUserId=${externalUserId}`);
        
        // Try direct lookup in issuer table
        if (applicantId) {
            const issuer = await prisma.issuer.findFirst({
                where: { sumsub_applicant_id: applicantId },
                include: { user: true }
            });
            
            if (issuer?.user) {
                console.log(`User found via Issuer.sumsub_applicant_id: ${issuer.user.id}`);
                return issuer.user;
            }
        }
        
        // Try externalUserId pattern matching
        if (externalUserId) {
            const userId = this.extractUserId(externalUserId);
            if (userId) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user) {
                    console.log(`User found via externalUserId pattern: ${user.id}`);
                    return user;
                }
            }
        }
        
        console.log(`No user found for applicantId=${applicantId}, externalUserId=${externalUserId}`);
        return null;
    }
    
    // Get all stored data for applicant
    async getAllStoredDataForApplicant(applicantId) {
        try {
            const [
                kycVerifications,
                personalInfo,
                documents,
                rawData
            ] = await Promise.all([
                prisma.kycVerification.findMany({
                    where: { applicant_id: applicantId }
                }),
                prisma.sumsubPersonalInfo.findMany({
                    where: { applicant_id: applicantId }
                }),
                prisma.sumsubDocument.findMany({
                    where: { applicant_id: applicantId }
                }),
                prisma.sumsubRawData.findMany({
                    where: { applicant_id: applicantId }
                })
            ]);
            
            return {
                applicantId,
                kycVerifications,
                personalInfo,
                documents,
                rawData,
                summary: {
                    totalVerifications: kycVerifications.length,
                    totalPersonalInfoRecords: personalInfo.length,
                    totalDocuments: documents.length,
                    totalRawDataRecords: rawData.length
                }
            };
        } catch (error) {
            console.error('Error getting all stored data:', error);
            throw error;
        }
    }
}

/**
 * 🚀 EXPRESS.JS INTEGRATION EXAMPLES
 */
const expressIntegration = {
    // Webhook handler with complete data storage
    handleWebhookWithStorage: async (req, res) => {
        try {
            const storage = new SumsubDatabaseStorage();
            const payload = req.body;
            
            // 1. Store webhook log
            await storage.storeWebhookLog(payload.type, payload);
            
            // 2. Store KYC verification if applicable
            if (payload.type === 'applicantReviewed') {
                await storage.storeKycVerification(payload);
                
                // 3. Store complete applicant data
                if (payload.applicantId) {
                    await storage.storeCompleteApplicantData(payload.applicantId, payload);
                }
            }
            
            res.status(200).json({ success: true, message: 'Webhook processed and stored' });
        } catch (error) {
            console.error('Webhook storage error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Manual data extraction endpoint
    extractApplicantData: async (req, res) => {
        try {
            const { applicantId } = req.params;
            const storage = new SumsubDatabaseStorage();
            
            const result = await storage.storeCompleteApplicantData(applicantId);
            
            res.json({
                success: result.success,
                message: result.message,
                data: result.results
            });
        } catch (error) {
            console.error('Manual extraction error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get all stored data for applicant
    getApplicantData: async (req, res) => {
        try {
            const { applicantId } = req.params;
            const storage = new SumsubDatabaseStorage();
            
            const data = await storage.getAllStoredDataForApplicant(applicantId);
            
            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Get applicant data error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = {
    SumsubDatabaseStorage,
    expressIntegration
};

// Usage example
/*
const storage = new SumsubDatabaseStorage();

// Complete data storage for an applicant
const result = await storage.storeCompleteApplicantData('applicant-id');

// Store specific data types
await storage.storeComprehensivePersonalInfo('applicant-id');
await storage.storeDocumentMetadata('applicant-id');
await storage.storeRawApplicantData('applicant-id');

// Express routes
app.post('/sumsub/webhooks', expressIntegration.handleWebhookWithStorage);
app.post('/admin/extract/:applicantId', expressIntegration.extractApplicantData);
app.get('/admin/applicant/:applicantId', expressIntegration.getApplicantData);
*/ 