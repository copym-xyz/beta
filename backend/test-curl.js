/**
 * Test Enhanced Storage Endpoints with HTTP requests
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
    console.log('🧪 Testing Enhanced Storage Endpoints');
    console.log('=' .repeat(50));
    
    try {
        // 1. Login to get JWT token
        console.log('🔐 Step 1: Login to get JWT token...');
        const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
            email: 'anaskhan@gmail.com',
            password: '123456'
        });
        
        if (loginResponse.data.token) {
            console.log('✅ Login successful');
            console.log(`Token: ${loginResponse.data.token.substring(0, 20)}...`);
        } else {
            throw new Error('No token received');
        }
        
        const token = loginResponse.data.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('');
        
        // 2. Test Enhanced Storage Trigger
        console.log('🚀 Step 2: Testing Enhanced Storage Trigger...');
        try {
            const enhancedStorageResponse = await axios.post(`${BASE_URL}/api/kyc/enhanced-storage`, {}, {
                headers
            });
            
            console.log('✅ Enhanced Storage Response:');
            console.log(`   - Success: ${enhancedStorageResponse.data.success}`);
            console.log(`   - Enhanced: ${enhancedStorageResponse.data.enhanced}`);
            console.log(`   - Message: ${enhancedStorageResponse.data.message}`);
            
            if (enhancedStorageResponse.data.data) {
                const data = enhancedStorageResponse.data.data;
                console.log(`   - Total Documents: ${data.totalDocuments}`);
                console.log(`   - Documents Stored: ${data.documentsStored}`);
                console.log(`   - Personal Info Extracted: ${data.personalInfoExtracted}`);
                console.log(`   - Errors: ${data.errors?.length || 0}`);
            }
        } catch (error) {
            console.log('❌ Enhanced Storage failed:');
            console.log(`   - Status: ${error.response?.status}`);
            console.log(`   - Error: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
        
        // 3. Test Get Stored KYC Data
        console.log('📊 Step 3: Testing Get Stored KYC Data...');
        try {
            const storedDataResponse = await axios.get(`${BASE_URL}/api/kyc/stored-data`, {
                headers
            });
            
            console.log('✅ Stored Data Response:');
            console.log(`   - Success: ${storedDataResponse.data.success}`);
            
            if (storedDataResponse.data.data) {
                const data = storedDataResponse.data.data;
                console.log(`   - User ID: ${data.userId}`);
                console.log(`   - Applicant ID: ${data.applicantId}`);
                console.log(`   - Status: ${data.status}`);
                console.log(`   - Review Result: ${data.reviewResult}`);
                console.log(`   - Is Verified: ${data.isVerified}`);
                console.log(`   - Verified At: ${data.verifiedAt}`);
                
                if (data.summary) {
                    console.log(`   - Total Documents: ${data.summary.totalDocuments}`);
                    console.log(`   - Verification Level: ${data.summary.verificationLevel}`);
                    console.log(`   - Has Personal Info: ${data.summary.hasPersonalInfo}`);
                    console.log(`   - Has Documents: ${data.summary.hasDocuments}`);
                    console.log(`   - Last Updated: ${data.summary.lastUpdated}`);
                }
            }
        } catch (error) {
            console.log('❌ Get Stored Data failed:');
            console.log(`   - Status: ${error.response?.status}`);
            console.log(`   - Error: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
        
        // 4. Test Get Documents List
        console.log('📄 Step 4: Testing Get Documents List...');
        try {
            const documentsResponse = await axios.get(`${BASE_URL}/api/kyc/documents`, {
                headers
            });
            
            console.log('✅ Documents List Response:');
            console.log(`   - Success: ${documentsResponse.data.success}`);
            console.log(`   - Total Documents: ${documentsResponse.data.totalDocuments}`);
            console.log(`   - Extracted At: ${documentsResponse.data.extractedAt}`);
            
            if (documentsResponse.data.documents && documentsResponse.data.documents.length > 0) {
                console.log('   - Documents:');
                documentsResponse.data.documents.forEach((doc, index) => {
                    console.log(`     ${index + 1}. ${doc.docType} - ${doc.fileName}`);
                    console.log(`        Size: ${Math.round(doc.fileSize / 1024)}KB, Status: ${doc.status}`);
                });
            } else {
                console.log('   - No documents found');
            }
        } catch (error) {
            console.log('❌ Get Documents List failed:');
            console.log(`   - Status: ${error.response?.status}`);
            console.log(`   - Error: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
        
        // 5. Test Basic Store Data (fallback)
        console.log('📋 Step 5: Testing Basic Store Data...');
        try {
            const storeDataResponse = await axios.post(`${BASE_URL}/api/kyc/store-data`, {
                applicantId: '680269fa6bbfd299aff0cf14'
            }, {
                headers
            });
            
            console.log('✅ Store Data Response:');
            console.log(`   - Message: ${storeDataResponse.data.message}`);
            console.log(`   - Enhanced: ${storeDataResponse.data.enhanced}`);
            console.log(`   - Total Documents: ${storeDataResponse.data.totalDocuments}`);
            console.log(`   - Errors: ${storeDataResponse.data.errors?.length || 0}`);
            console.log(`   - Stored At: ${storeDataResponse.data.storedAt}`);
        } catch (error) {
            console.log('❌ Store Data failed:');
            console.log(`   - Status: ${error.response?.status}`);
            console.log(`   - Error: ${error.response?.data?.error || error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error(`   - Status: ${error.response.status}`);
            console.error(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
    
    console.log('');
    console.log('🎯 Endpoint Testing Complete!');
    console.log('=' .repeat(50));
}

// Run the test
testEndpoints()
    .then(() => {
        console.log('✅ All endpoint tests completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Endpoint test suite failed:', error);
        process.exit(1);
    }); 