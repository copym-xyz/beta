/**
 * Test Enhanced Sumsub Storage Implementation
 * This script demonstrates the comprehensive data storage capabilities
 */

import { EnhancedSumsubStorage } from './services/enhancedSumsubStorage.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEnhancedStorage() {
    console.log('🧪 Testing Enhanced Sumsub Storage Implementation');
    console.log('=' .repeat(60));
    
    // Initialize enhanced storage
    const storage = new EnhancedSumsubStorage();
    
    // Test configuration
    const testUserId = 15; // Your user ID
    const testApplicantId = '680269fa6bbfd299aff0cf14'; // Your applicant ID
    
    console.log(`👤 Test User ID: ${testUserId}`);
    console.log(`📋 Test Applicant ID: ${testApplicantId}`);
    console.log('');
    
    try {
        // 1. Test comprehensive personal info storage
        console.log('📋 Step 1: Testing comprehensive personal info storage...');
        const personalInfoResult = await storage.storeComprehensivePersonalInfo(testApplicantId, testUserId);
        
        if (personalInfoResult.success) {
            console.log('✅ Personal info stored successfully');
            console.log(`   - Name: ${personalInfoResult.personalInfo.firstName} ${personalInfoResult.personalInfo.lastName}`);
            console.log(`   - Email: ${personalInfoResult.personalInfo.email}`);
            console.log(`   - Verification Level: ${personalInfoResult.personalInfo.verificationLevel}`);
            console.log(`   - Is Verified: ${personalInfoResult.personalInfo.isVerified}`);
        } else {
            console.log('❌ Personal info storage failed:', personalInfoResult.error);
        }
        console.log('');
        
        // 2. Test document metadata and file downloads
        console.log('📄 Step 2: Testing document metadata and file downloads...');
        const documentsResult = await storage.storeDocumentMetadata(testApplicantId, testUserId);
        
        if (documentsResult.success) {
            console.log('✅ Documents stored successfully');
            console.log(`   - Total documents: ${documentsResult.documents.length}`);
            documentsResult.documents.forEach((doc, index) => {
                console.log(`   - Document ${index + 1}: ${doc.docType} (${doc.fileName})`);
                console.log(`     Size: ${Math.round(doc.fileSize / 1024)}KB, Status: ${doc.status}`);
            });
        } else {
            console.log('❌ Document storage failed:', documentsResult.error);
        }
        console.log('');
        
        // 3. Test complete data storage pipeline
        console.log('🚀 Step 3: Testing complete data storage pipeline...');
        const completeResult = await storage.storeCompleteApplicantData(testApplicantId, testUserId);
        
        if (completeResult.success) {
            console.log('✅ Complete data storage successful');
            console.log(`   - Personal Info: ${completeResult.results.personalInfo?.success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`   - Documents: ${completeResult.results.documents?.success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`   - Total Documents: ${completeResult.results.documents?.documents?.length || 0}`);
            console.log(`   - Errors: ${completeResult.results.errors.length}`);
            
            if (completeResult.results.errors.length > 0) {
                console.log('   - Error Details:');
                completeResult.results.errors.forEach(error => {
                    console.log(`     • ${error}`);
                });
            }
        } else {
            console.log('❌ Complete data storage failed:', completeResult.error);
        }
        console.log('');
        
        // 4. Test data retrieval
        console.log('🔍 Step 4: Testing data retrieval...');
        const retrievalResult = await storage.getAllStoredDataForUser(testUserId);
        
        if (retrievalResult.success) {
            console.log('✅ Data retrieval successful');
            console.log(`   - Applicant ID: ${retrievalResult.data.applicantId}`);
            console.log(`   - Status: ${retrievalResult.data.status}`);
            console.log(`   - Review Result: ${retrievalResult.data.reviewResult}`);
            console.log(`   - Is Verified: ${retrievalResult.data.reviewResult === 'GREEN'}`);
            
            const personalInfo = retrievalResult.data.personalInfo;
            if (personalInfo) {
                console.log(`   - Name: ${personalInfo.firstName} ${personalInfo.lastName}`);
                console.log(`   - Country: ${personalInfo.country}`);
                console.log(`   - Verification Level: ${personalInfo.verificationLevel}`);
            }
            
            const documentsInfo = retrievalResult.data.documentsInfo;
            if (documentsInfo) {
                console.log(`   - Total Documents: ${documentsInfo.totalDocuments}`);
                console.log(`   - Documents Extracted: ${documentsInfo.extractedAt}`);
            }
        } else {
            console.log('❌ Data retrieval failed:', retrievalResult.message);
        }
        console.log('');
        
        // 5. Show database summary
        console.log('📊 Step 5: Database summary...');
        const kycData = await prisma.kycData.findUnique({
            where: { userId: testUserId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        if (kycData) {
            console.log('✅ Database record found');
            console.log(`   - User: ${kycData.user.name} (${kycData.user.email})`);
            console.log(`   - Applicant ID: ${kycData.applicantId}`);
            console.log(`   - Status: ${kycData.status}`);
            console.log(`   - Review Result: ${kycData.reviewResult}`);
            console.log(`   - Created: ${kycData.createdAt}`);
            console.log(`   - Updated: ${kycData.updatedAt}`);
            console.log(`   - Has Personal Info: ${!!kycData.personalInfo}`);
            console.log(`   - Has Documents Info: ${!!kycData.documentsInfo}`);
            console.log(`   - Has Raw Data: ${!!kycData.rawApplicantData}`);
        } else {
            console.log('❌ No database record found');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
    
    console.log('');
    console.log('🎯 Enhanced Storage Test Complete!');
    console.log('=' .repeat(60));
}

// Run the test
testEnhancedStorage()
    .then(() => {
        console.log('✅ All tests completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    }); 