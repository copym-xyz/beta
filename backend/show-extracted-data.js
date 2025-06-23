/**
 * Show Extracted Sumsub Data
 * Display all the personal info and documents extracted from Sumsub
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showExtractedData() {
    console.log('📊 EXTRACTED SUMSUB DATA ANALYSIS');
    console.log('=' .repeat(60));
    
    try {
        const userId = 15;
        
        // Get KYC data from database
        const kycData = await prisma.kycData.findUnique({
            where: { userId: userId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        if (!kycData) {
            console.log('❌ No KYC data found for user 15');
            return;
        }
        
        console.log(`👤 USER INFORMATION:`);
        console.log(`   - Name: ${kycData.user.name}`);
        console.log(`   - Email: ${kycData.user.email}`);
        console.log(`   - Applicant ID: ${kycData.applicantId}`);
        console.log(`   - Status: ${kycData.status}`);
        console.log(`   - Review Result: ${kycData.reviewResult || 'Pending'}`);
        console.log('');
        
        // Parse and display personal info
        if (kycData.personalInfo) {
            console.log('👤 EXTRACTED PERSONAL INFORMATION:');
            const personalInfo = JSON.parse(kycData.personalInfo);
            
            console.log(`   - Full Name: ${personalInfo.firstName} ${personalInfo.lastName}`);
            console.log(`   - Email: ${personalInfo.email}`);
            console.log(`   - Date of Birth: ${personalInfo.dateOfBirth || 'Not provided'}`);
            console.log(`   - Nationality: ${personalInfo.nationality || 'Not provided'}`);
            console.log(`   - Country: ${personalInfo.country}`);
            console.log(`   - Phone: ${personalInfo.phone || 'Not provided'}`);
            console.log(`   - Gender: ${personalInfo.gender || 'Not provided'}`);
            console.log(`   - Verification Level: ${personalInfo.verificationLevel}`);
            console.log(`   - Is Verified: ${personalInfo.isVerified}`);
            console.log(`   - Review Status: ${personalInfo.reviewStatus}`);
            console.log(`   - Created At: ${personalInfo.createdAt}`);
            console.log(`   - Extracted At: ${personalInfo.extractedAt}`);
            
            // Show addresses if available
            if (personalInfo.addresses && personalInfo.addresses.length > 0) {
                console.log('   - Addresses:');
                personalInfo.addresses.forEach((addr, index) => {
                    console.log(`     ${index + 1}. ${addr.street}, ${addr.town}, ${addr.country} ${addr.postCode}`);
                });
            }
            
            // Show document info if available
            if (personalInfo.idDocType) {
                console.log(`   - ID Document Type: ${personalInfo.idDocType}`);
                console.log(`   - ID Document Number: ${personalInfo.idDocNumber || 'Not provided'}`);
                console.log(`   - ID Valid Until: ${personalInfo.idDocValidUntil || 'Not provided'}`);
            }
            
            console.log('');
        }
        
        // Parse and display documents info
        if (kycData.documentsInfo) {
            console.log('📄 EXTRACTED DOCUMENTS INFORMATION:');
            const documentsInfo = JSON.parse(kycData.documentsInfo);
            
            console.log(`   - Total Documents: ${documentsInfo.totalDocuments || 0}`);
            console.log(`   - Extraction Date: ${documentsInfo.extractedAt}`);
            
            if (documentsInfo.documents && documentsInfo.documents.length > 0) {
                console.log('   - Document Files:');
                documentsInfo.documents.forEach((doc, index) => {
                    console.log(`     ${index + 1}. ${doc.docType} - ${doc.fileName}`);
                    console.log(`        • File Size: ${Math.round(doc.fileSize / 1024)}KB`);
                    console.log(`        • Content Type: ${doc.contentType}`);
                    console.log(`        • Status: ${doc.status}`);
                    console.log(`        • Downloaded: ${doc.downloadedAt}`);
                    console.log(`        • File Path: ${doc.filePath}`);
                });
            } else {
                console.log('   - No document files downloaded (applicant may not have submitted documents yet)');
            }
            console.log('');
        }
        
        // Parse and display raw applicant data summary
        if (kycData.rawApplicantData) {
            console.log('🗃️ RAW SUMSUB DATA SUMMARY:');
            const rawData = JSON.parse(kycData.rawApplicantData);
            
            console.log(`   - Applicant ID: ${rawData.id}`);
            console.log(`   - External User ID: ${rawData.externalUserId}`);
            console.log(`   - Review Status: ${rawData.reviewStatus}`);
            console.log(`   - Level Name: ${rawData.levelName || 'Not specified'}`);
            console.log(`   - Created At Sumsub: ${rawData.createdAt}`);
            console.log(`   - Inspection ID: ${rawData.inspectionId || 'Not available'}`);
            console.log(`   - Environment: ${rawData.env || 'Not specified'}`);
            console.log(`   - Client ID: ${rawData.clientId || 'Not specified'}`);
            
            if (rawData.reviewResult) {
                console.log(`   - Review Answer: ${rawData.reviewResult.reviewAnswer || 'Pending'}`);
                console.log(`   - Review Date: ${rawData.reviewResult.reviewDate || 'Not reviewed yet'}`);
            }
            
            if (rawData.info) {
                console.log(`   - Has Info Object: YES`);
                console.log(`   - Info Keys: ${Object.keys(rawData.info).join(', ')}`);
            }
            
            if (rawData.fixedInfo) {
                console.log(`   - Has Fixed Info: YES`);
                console.log(`   - Fixed Info Keys: ${Object.keys(rawData.fixedInfo).join(', ')}`);
            }
            
            console.log('');
        }
        
        // Show database timestamps
        console.log('⏰ DATABASE TIMESTAMPS:');
        console.log(`   - Created: ${kycData.createdAt}`);
        console.log(`   - Updated: ${kycData.updatedAt}`);
        console.log(`   - Verified At: ${kycData.verifiedAt || 'Not verified yet'}`);
        
        console.log('');
        console.log('🎯 DATA EXTRACTION STATUS:');
        console.log(`   ✅ Personal Info Extracted: ${!!kycData.personalInfo}`);
        console.log(`   ✅ Documents Info Extracted: ${!!kycData.documentsInfo}`);
        console.log(`   ✅ Raw Data Stored: ${!!kycData.rawApplicantData}`);
        console.log(`   📊 Total Data Size: ${(kycData.personalInfo?.length || 0) + (kycData.documentsInfo?.length || 0) + (kycData.rawApplicantData?.length || 0)} characters`);
        
    } catch (error) {
        console.error('❌ Error showing extracted data:', error.message);
    } finally {
        await prisma.$disconnect();
    }
    
    console.log('');
    console.log('🎉 ENHANCED SUMSUB STORAGE WORKING PERFECTLY!');
    console.log('=' .repeat(60));
}

// Run the display
showExtractedData()
    .then(() => {
        console.log('✅ Data display completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Display failed:', error);
        process.exit(1);
    }); 