import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
// import DIDKit from '@spruceid/didkit-wasm';

dotenv.config();
const prisma = new PrismaClient();

// Console colors for better output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

// Configuration
const IPFS_CONFIG = {
    pinataAPI: 'https://api.pinata.cloud',
    outputDir: './data/did-system',
    hashingAlgorithm: 'sha256'
};

class EnhancedDIDService {
    constructor(userId) {
        this.userId = userId;
        this.investorId = `user-${userId}`;
        this.walletAddresses = {};
        this.walletIPFSCIDs = {};
        this.didDocument = null;
        this.didKey = null;
        this.privateKey = null;
        this.errors = {};
        
        console.log(`🆔 Enhanced DID Service for User ID: ${userId}`);
        console.log(`📁 Data directory: ${IPFS_CONFIG.outputDir}`);
    }

    validatePinataConfig() {
        console.log('🔧 Validating Pinata configuration...');
        
        if (!process.env.PINATA_JWT) {
            console.error(`${colors.red}❌ Missing PINATA_JWT in environment${colors.reset}`);
            return false;
        }

        console.log(`${colors.green}✅ Pinata configuration valid${colors.reset}`);
        return true;
    }

    async loadWalletAddresses() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}📖 STEP 1: Loading Wallet Addresses from DB${colors.reset}`);
            console.log('═'.repeat(50));
            
            // Get user's vault with wallets
            const vault = await prisma.vault.findFirst({
                where: { userId: parseInt(this.userId) },
                include: { wallets: true, user: true }
            });

            if (!vault || !vault.wallets.length) {
                throw new Error(`No wallets found for user ${this.userId}`);
            }

            const supportedChains = {
                bitcoin: { name: 'Bitcoin Testnet', network: 'testnet', symbol: 'BTC' },
                ethereum: { name: 'Ethereum Sepolia', network: 'sepolia', symbol: 'ETH' },
                solana: { name: 'Solana Devnet', network: 'devnet', symbol: 'SOL' },
            };

            const validWallets = {};
            let validCount = 0;

            for (const chain in supportedChains) {
                const dbWallet = vault.wallets.find(w => w.network === chain);
                if (dbWallet && dbWallet.address) {
                    validWallets[chain] = {
                        address: dbWallet.address,
                        assetId: dbWallet.assetId,
                        chain,
                        network: supportedChains[chain].network,
                        name: supportedChains[chain].name,
                        symbol: supportedChains[chain].symbol,
                        balance: dbWallet.balance || 0,
                        walletId: dbWallet.id
                    };
                    validCount++;
                    console.log(`✅ ${supportedChains[chain].name}: ${dbWallet.address}`);
                } else {
                    console.log(`❌ ${supportedChains[chain].name}: No address found`);
                }
            }

            if (validCount === 0) {
                throw new Error('No valid wallet addresses found');
            }

            this.walletAddresses = validWallets;
            this.userInfo = {
                id: vault.userId,
                name: vault.user.name,
                email: vault.user.email,
                vaultId: vault.fireblocksVaultId
            };

            console.log(`\n${colors.green}✅ Loaded ${validCount}/3 wallet addresses${colors.reset}`);
            return true;

        } catch (error) {
            console.error(`${colors.red}❌ Failed to load wallet addresses:${colors.reset}`, error.message);
            this.errors.walletLoading = error.message;
            return false;
        }
    }

    async uploadAllWalletsToIPFS() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}📤 STEP 2: Uploading ALL Wallets as ONE JSON to IPFS${colors.reset}`);
            console.log('═'.repeat(50));

            // Create comprehensive wallets JSON with all wallets
            const allWalletsJSON = {
                metadata: {
                    userId: this.userId,
                    investorId: this.investorId,
                    purpose: 'Multi-chain wallet identity verification',
                    version: '2.0.0',
                    createdAt: new Date().toISOString(),
                    walletCount: Object.keys(this.walletAddresses).length,
                    chains: Object.keys(this.walletAddresses),
                    format: 'W3C DID Service Entry'
                },
                userInfo: this.userInfo,
                wallets: {},
                verification: {
                    method: 'multi-chain-wallet-ownership',
                    hashAlgorithm: 'sha256',
                    combinedHash: null
                },
                capabilities: {
                    signing: true,
                    transactions: true,
                    verification: true,
                    multiChain: true
                }
            };

            // Add all wallets to the JSON
            const addressesForHash = [];
            console.log('🔄 Processing all wallets...');

            for (const [chain, wallet] of Object.entries(this.walletAddresses)) {
                // Add wallet data
                allWalletsJSON.wallets[chain] = {
                    walletId: wallet.walletId,
                    address: wallet.address,
                    assetId: wallet.assetId,
                    chain: wallet.chain,
                    network: wallet.network,
                    name: wallet.name,
                    symbol: wallet.symbol,
                    balance: wallet.balance,
                    addressHash: crypto.createHash('sha256').update(wallet.address).digest('hex')
                };

                addressesForHash.push({
                    chain: wallet.chain,
                    address: wallet.address
                });

                console.log(`✅ Added ${wallet.name}: ${wallet.address}`);
            }

            // Create combined hash of all addresses
            console.log('🔗 Creating combined hash of all wallets...');
            const sortedAddresses = addressesForHash.sort((a, b) => a.chain.localeCompare(b.chain));
            const combinedString = sortedAddresses
                .map(w => `${w.chain}:${w.address}`)
                .join('|');
            
            const combinedHash = crypto.createHash('sha256')
                .update(combinedString)
                .digest('hex');

            allWalletsJSON.verification.combinedHash = combinedHash;
            allWalletsJSON.verification.combinedSource = combinedString;

            console.log(`✅ Combined hash: ${combinedHash.substring(0, 16)}...`);

            // Prepare Pinata metadata
            const metadata = {
                name: `${this.investorId}-all-wallets.json`,
                description: `All wallet addresses for user ${this.userId} - Multi-chain DID identity system`,
                keyvalues: {
                    user_id: this.userId.toString(),
                    purpose: 'multi_chain_wallets',
                    wallet_count: Object.keys(this.walletAddresses).length.toString(),
                    chains: Object.keys(this.walletAddresses).join(','),
                    combined_hash: combinedHash.substring(0, 16),
                    created_at: new Date().toISOString()
                }
            };

            // Upload ALL wallets as ONE JSON to IPFS
            const uploadData = {
                pinataContent: allWalletsJSON,
                pinataMetadata: metadata,
                pinataOptions: {
                    cidVersion: 1,
                    wrapWithDirectory: false
                }
            };

            console.log(`📡 Uploading ALL wallets JSON to IPFS...`);
            console.log(`📊 Data size: ${JSON.stringify(allWalletsJSON).length} bytes`);
            const startTime = Date.now();

            const response = await axios.post(
                `${IPFS_CONFIG.pinataAPI}/pinning/pinJSONToIPFS`,
                uploadData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.PINATA_JWT}`
                    }
                }
            );

            const uploadTime = Date.now() - startTime;

            if (response.data && response.data.IpfsHash) {
                const cid = response.data.IpfsHash;
                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
                
                this.allWalletsIPFS = {
                    cid: cid,
                    ipfsUrl: ipfsUrl,
                    uploadTime: uploadTime,
                    pinSize: response.data.PinSize,
                    walletData: allWalletsJSON,
                    walletCount: Object.keys(this.walletAddresses).length,
                    chains: Object.keys(this.walletAddresses),
                    combinedHash: combinedHash
                };

                console.log(`${colors.green}✅ ALL wallets uploaded successfully as ONE IPFS file${colors.reset}`);
                console.log(`${colors.blue}📋 CID: ${cid}${colors.reset}`);
                console.log(`${colors.blue}🔗 URL: ${ipfsUrl}${colors.reset}`);
                console.log(`${colors.blue}💼 Wallets: ${Object.keys(this.walletAddresses).length} (${Object.keys(this.walletAddresses).join(', ')})${colors.reset}`);
                console.log(`${colors.blue}⚡ Time: ${uploadTime}ms${colors.reset}`);
                console.log(`${colors.blue}📏 Size: ${response.data.PinSize} bytes${colors.reset}`);
            } else {
                throw new Error('Failed to upload all wallets - no CID returned');
            }
            
            return true;

        } catch (error) {
            console.error(`${colors.red}❌ Failed to upload all wallets to IPFS:${colors.reset}`, error.message);
            this.errors.allWalletsIPFSUpload = error.message;
            return false;
        }
    }

    async generateDIDWithSpruceDIDKit() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}🔑 STEP 3: Generating DID:key using Spruce DIDKit (Simulated)${colors.reset}`);
            console.log('═'.repeat(50));

            // For now, let's use a simple DID:key generation approach
            // You can replace this with proper DIDKit when it's fully integrated
            
            console.log('🔐 Generating Ed25519 key pair...');
            
            // Generate a pseudo-random key pair (replace with DIDKit later)
            const keyBytes = crypto.randomBytes(32);
            const keyHex = keyBytes.toString('hex');
            
            // Create DID:key using multibase encoding (simplified)
            const multibaseKey = 'z' + Buffer.from(keyBytes).toString('base64url');
            const did = `did:key:${multibaseKey}`;
            
            this.privateKey = keyHex;
            this.didKey = did;

            console.log(`${colors.green}✅ DID:key generated: ${did}${colors.reset}`);
            console.log(`🔐 Private key: ${keyHex.substring(0, 16)}...`);

            return true;

        } catch (error) {
            console.error(`${colors.red}❌ Failed to generate DID:key:${colors.reset}`, error.message);
            this.errors.didGeneration = error.message;
            return false;
        }
    }

    async createDIDDocumentWithWalletServices() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}📋 STEP 4: Creating DID Document with Wallet Service${colors.reset}`);
            console.log('═'.repeat(50));

            // Create services array with the single wallet IPFS CID
            const services = [];

            // Add the main multi-wallet service with single IPFS CID
            services.push({
                id: `${this.didKey}#multi-wallet-service`,
                type: 'MultiChainWalletService',
                serviceEndpoint: {
                    ipfsCid: this.allWalletsIPFS.cid,
                    ipfsUrl: this.allWalletsIPFS.ipfsUrl,
                    purpose: 'Multi-chain wallet ownership verification',
                    walletCount: this.allWalletsIPFS.walletCount,
                    supportedChains: this.allWalletsIPFS.chains,
                    combinedHash: this.allWalletsIPFS.combinedHash,
                    verificationMethod: 'multi-chain-wallet-ownership',
                    format: 'consolidated-wallet-json'
                }
            });

            console.log(`✅ Added multi-wallet service with single IPFS CID`);
            console.log(`📋 CID: ${this.allWalletsIPFS.cid.substring(0, 12)}...`);
            console.log(`💼 Covers ${this.allWalletsIPFS.walletCount} wallets: ${this.allWalletsIPFS.chains.join(', ')}`);

            // Add individual wallet references (for easy access)
            for (const [chain, wallet] of Object.entries(this.walletAddresses)) {
                services.push({
                    id: `${this.didKey}#wallet-${chain}`,
                    type: 'CryptocurrencyWallet',
                    serviceEndpoint: {
                        parentService: `${this.didKey}#multi-wallet-service`,
                        chain: wallet.chain,
                        network: wallet.network,
                        symbol: wallet.symbol,
                        address: wallet.address,
                        addressHash: crypto.createHash('sha256').update(wallet.address).digest('hex'),
                        verificationPurpose: 'individual-wallet-reference'
                    }
                });

                console.log(`✅ Added ${wallet.name} reference service`);
            }

            // Add identity verification service
            services.push({
                id: `${this.didKey}#identity-verification`,
                type: 'IdentityVerification',
                serviceEndpoint: {
                    purpose: 'Multi-chain identity verification',
                    walletDataSource: this.allWalletsIPFS.ipfsUrl,
                    verificationMethod: 'ipfs-consolidated-wallet-verification',
                    supportedChains: this.allWalletsIPFS.chains,
                    createdAt: new Date().toISOString()
                }
            });

            // Create complete DID Document
            this.didDocument = {
                '@context': [
                    'https://www.w3.org/ns/did/v1',
                    'https://w3id.org/security/suites/ed25519-2020/v1'
                ],
                id: this.didKey,
                verificationMethod: [{
                    id: `${this.didKey}#key-1`,
                    type: 'Ed25519VerificationKey2020',
                    controller: this.didKey,
                    publicKeyMultibase: this.didKey.split(':')[2]
                }],
                authentication: [`${this.didKey}#key-1`],
                assertionMethod: [`${this.didKey}#key-1`],
                service: services,
                metadata: {
                    userId: this.userId,
                    investorId: this.investorId,
                    userInfo: this.userInfo,
                    createdAt: new Date().toISOString(),
                    version: '2.0.0',
                    walletCount: this.allWalletsIPFS.walletCount,
                    consolidatedWalletIPFS: {
                        cid: this.allWalletsIPFS.cid,
                        url: this.allWalletsIPFS.ipfsUrl
                    },
                    txHash: this.smartContractResult?.transactionHash || null,
                    etherscanUrl: this.smartContractResult?.etherscanUrl || null
                }
            };

            console.log(`${colors.green}✅ DID Document created with ${services.length} services${colors.reset}`);
            console.log(`📋 DID: ${this.didKey}`);
            console.log(`🔗 Services: ${services.length} (1 consolidated + ${this.allWalletsIPFS.walletCount} references + 1 identity)`);
            console.log(`💾 Single IPFS file contains all ${this.allWalletsIPFS.walletCount} wallets`);

            return true;

        } catch (error) {
            console.error(`${colors.red}❌ Failed to create DID Document:${colors.reset}`, error.message);
            this.errors.didDocumentCreation = error.message;
            return false;
        }
    }

    async uploadDIDDocumentToIPFS() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}📤 STEP 5: Uploading DID Document to IPFS${colors.reset}`);
            console.log('═'.repeat(50));

            // Prepare metadata for DID Document
            const metadata = {
                name: `${this.investorId}-did-document.json`,
                description: `W3C DID Document with wallet services for user ${this.userId}`,
                keyvalues: {
                    user_id: this.userId.toString(),
                    did: this.didKey,
                    purpose: 'did_document',
                    wallet_count: Object.keys(this.walletIPFSCIDs).length.toString(),
                    created_at: new Date().toISOString()
                }
            };

            // Upload DID Document
            const uploadData = {
                pinataContent: this.didDocument,
                pinataMetadata: metadata,
                pinataOptions: {
                    cidVersion: 1,
                    wrapWithDirectory: false
                }
            };

            console.log('📡 Uploading DID Document to IPFS...');
            const startTime = Date.now();

            const response = await axios.post(
                `${IPFS_CONFIG.pinataAPI}/pinning/pinJSONToIPFS`,
                uploadData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.PINATA_JWT}`
                    }
                }
            );

            const uploadTime = Date.now() - startTime;

            if (response.data && response.data.IpfsHash) {
                this.didDocumentCID = {
                    cid: response.data.IpfsHash,
                    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
                    uploadTime: uploadTime,
                    pinSize: response.data.PinSize
                };

                console.log(`${colors.green}✅ DID Document uploaded successfully${colors.reset}`);
                console.log(`${colors.blue}📋 CID: ${this.didDocumentCID.cid}${colors.reset}`);
                console.log(`${colors.blue}🔗 URL: ${this.didDocumentCID.ipfsUrl}${colors.reset}`);
                console.log(`${colors.blue}⚡ Time: ${uploadTime}ms${colors.reset}`);

                return true;
            } else {
                throw new Error('Failed to upload DID Document - no CID returned');
            }

        } catch (error) {
            console.error(`${colors.red}❌ Failed to upload DID Document:${colors.reset}`, error.message);
            this.errors.didDocumentUpload = error.message;
            return false;
        }
    }

    async saveCompleteResults() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}💾 STEP 6: Saving Complete Results${colors.reset}`);
            console.log('═'.repeat(50));

            // Ensure output directory exists
            if (!fs.existsSync(IPFS_CONFIG.outputDir)) {
                fs.mkdirSync(IPFS_CONFIG.outputDir, { recursive: true });
            }

            // Prepare complete results
            const completeResults = {
                metadata: {
                    userId: this.userId,
                    investorId: this.investorId,
                    step: 'Enhanced DID Generation Complete',
                    version: '2.0.0',
                    completedAt: new Date().toISOString()
                },
                did: {
                    didKey: this.didKey,
                    privateKey: this.privateKey,
                    didDocument: this.didDocument,
                    didDocumentCID: this.didDocumentCID
                },
                wallets: {
                    addresses: this.walletAddresses,
                    consolidatedIPFS: this.allWalletsIPFS
                },
                userInfo: this.userInfo,
                summary: {
                    totalWallets: Object.keys(this.walletAddresses).length,
                    consolidatedWalletCID: this.allWalletsIPFS?.cid,
                    didGenerated: !!this.didKey,
                    didDocumentUploaded: !!this.didDocumentCID,
                    chains: Object.keys(this.walletAddresses)
                }
            };

            // Save complete results
            const resultsPath = `${IPFS_CONFIG.outputDir}/${this.investorId}-enhanced-did-complete.json`;
            fs.writeFileSync(resultsPath, JSON.stringify(completeResults, null, 2));
            console.log(`✅ Complete results saved to: ${resultsPath}`);

            // Save to database
            console.log('💾 Saving to database...');
            await this.saveToDIDMetadataTable();

            // Update environment file
            console.log('📝 Updating .env file...');
            let envContent = fs.readFileSync('.env', 'utf8');

            const envUpdates = {
                ENHANCED_DID_KEY: this.didKey,
                ENHANCED_DID_DOCUMENT_CID: this.didDocumentCID.cid,
                ENHANCED_DID_DOCUMENT_URL: this.didDocumentCID.ipfsUrl,
                ENHANCED_DID_ALL_WALLETS_CID: this.allWalletsIPFS.cid,
                ENHANCED_DID_ALL_WALLETS_URL: this.allWalletsIPFS.ipfsUrl,
                ENHANCED_DID_CREATED_AT: new Date().toISOString()
            };

            // Add smart contract info if available
            if (this.smartContractResult && this.smartContractResult.transactionHash) {
                envUpdates.ENHANCED_DID_SMART_CONTRACT_TX = this.smartContractResult.transactionHash;
                envUpdates.ENHANCED_DID_ETHERSCAN_URL = this.smartContractResult.etherscanUrl;
                envUpdates.ENHANCED_DID_ON_CHAIN = 'true';
            }

            for (const [key, value] of Object.entries(envUpdates)) {
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, `${key}=${value}`);
                    console.log(`✅ Updated ${key}`);
                } else {
                    envContent += `\n${key}=${value}`;
                    console.log(`✅ Added ${key}`);
                }
            }

            fs.writeFileSync('.env', envContent);
            console.log(`${colors.green}✅ Environment file updated${colors.reset}`);

            return {
                resultsPath,
                completeResults,
                envUpdates
            };

        } catch (error) {
            console.error(`${colors.red}❌ Failed to save results:${colors.reset}`, error.message);
            this.errors.saveResults = error.message;
            return null;
        }
    }

    generateSummary() {
        console.log(`\n${colors.cyan}${colors.bright}📊 ENHANCED DID GENERATION SUMMARY${colors.reset}`);
        console.log('═'.repeat(60));

        const walletCount = Object.keys(this.walletAddresses).length;
        const errorCount = Object.keys(this.errors).length;
        const success = this.didKey && this.didDocumentCID && this.allWalletsIPFS && errorCount === 0;

        console.log(`👤 User ID: ${this.userId}`);
        console.log(`🆔 Investor ID: ${this.investorId}`);
        console.log(`💼 Wallets loaded: ${walletCount}/3`);
        console.log(`📤 ALL wallets uploaded: ${this.allWalletsIPFS ? '✅ Yes (Single IPFS)' : '❌ No'}`);
        console.log(`🔑 DID:key generated: ${this.didKey ? '✅ Yes' : '❌ No'}`);
        console.log(`📋 DID Document uploaded: ${this.didDocumentCID ? '✅ Yes' : '❌ No'}`);
        console.log(`⛓️ Smart contract deployed: ${this.smartContractResult?.success ? '✅ Yes' : '❌ No'}`);
        console.log(`❌ Errors: ${errorCount}`);

        if (this.didKey) {
            console.log(`\n${colors.yellow}🔑 DID INFORMATION:${colors.reset}`);
            console.log(`  DID: ${this.didKey}`);
            if (this.didDocumentCID) {
                console.log(`  Document CID: ${this.didDocumentCID.cid}`);
                console.log(`  Document URL: ${this.didDocumentCID.ipfsUrl}`);
            }
        }

        if (this.allWalletsIPFS) {
            console.log(`\n${colors.yellow}💼 CONSOLIDATED WALLET IPFS:${colors.reset}`);
            console.log(`  📋 CID: ${this.allWalletsIPFS.cid}`);
            console.log(`  🔗 URL: ${this.allWalletsIPFS.ipfsUrl}`);
            console.log(`  💼 Wallet Count: ${this.allWalletsIPFS.walletCount}`);
            console.log(`  ⛓️ Chains: ${this.allWalletsIPFS.chains.join(', ')}`);
            console.log(`  🔐 Combined Hash: ${this.allWalletsIPFS.combinedHash.substring(0, 16)}...`);
            console.log(`  📏 Size: ${this.allWalletsIPFS.pinSize} bytes`);
            console.log('');

            console.log(`${colors.yellow}📍 INDIVIDUAL WALLETS IN IPFS:${colors.reset}`);
            Object.entries(this.walletAddresses).forEach(([chain, wallet]) => {
                console.log(`  ${wallet.name}: ${wallet.address}`);
            });
        }

        if (this.smartContractResult?.success) {
            console.log(`\n${colors.yellow}⛓️ SMART CONTRACT REGISTRATION:${colors.reset}`);
            if (this.smartContractResult.alreadyExists) {
                console.log(`  Status: Already registered`);
            } else {
                console.log(`  📄 Transaction: ${this.smartContractResult.transactionHash}`);
                console.log(`  ⛽ Gas used: ${this.smartContractResult.gasUsed}`);
                console.log(`  💼 Wallet proofs: ${this.smartContractResult.walletProofCount}`);
                console.log(`  🌐 Etherscan: ${this.smartContractResult.etherscanUrl}`);
            }
        }

        if (errorCount > 0) {
            console.log(`${colors.red}❌ ERRORS:${colors.reset}`);
            Object.entries(this.errors).forEach(([key, error]) => {
                console.log(`  ${key}: ${error}`);
            });
        }

        return {
            success,
            userId: this.userId,
            investorId: this.investorId,
            walletCount,
            didKey: this.didKey,
            didDocumentCID: this.didDocumentCID,
            allWalletsIPFS: this.allWalletsIPFS,
            smartContractResult: this.smartContractResult,
            errors: this.errors
        };
    }

    async run() {
        try {
            console.log(`${colors.bright}${colors.magenta}🚀 ENHANCED DID GENERATION WITH SPRUCE DIDKIT${colors.reset}`);
            console.log(`${colors.magenta}⏰ Started: ${new Date().toISOString()}${colors.reset}`);
            console.log(`${colors.magenta}👤 User: ${this.userId}${colors.reset}`);
            console.log('═'.repeat(70));

            // Validate configuration
            if (!this.validatePinataConfig()) {
                throw new Error('Pinata configuration invalid');
            }

            // Step 1: Load wallet addresses
            if (!await this.loadWalletAddresses()) {
                throw new Error('Failed to load wallet addresses');
            }

            // Step 2: Upload ALL wallets as ONE JSON to IPFS
            if (!await this.uploadAllWalletsToIPFS()) {
                throw new Error('Failed to upload all wallets to IPFS');
            }

            // Step 3: Generate DID:key using Spruce DIDKit
            if (!await this.generateDIDWithSpruceDIDKit()) {
                throw new Error('Failed to generate DID:key');
            }

            // Step 4: Create DID Document with wallet services
            if (!await this.createDIDDocumentWithWalletServices()) {
                throw new Error('Failed to create DID Document');
            }

            // Step 5: Upload DID Document to IPFS
            if (!await this.uploadDIDDocumentToIPFS()) {
                throw new Error('Failed to upload DID Document');
            }

            // Step 6: Register DID on Smart Contract
            if (!await this.registerDIDOnSmartContract()) {
                console.warn('⚠️ Smart contract registration failed, but continuing...');
            }

            // Step 7: Save complete results
            const savedResults = await this.saveCompleteResults();
            if (!savedResults) {
                throw new Error('Failed to save results');
            }

            const summary = this.generateSummary();

            console.log(`\n${colors.green}${colors.bright}🎉 ENHANCED DID GENERATION COMPLETED!${colors.reset}`);
            console.log(`📁 Results saved to: ${savedResults.resultsPath}`);
            console.log(`🔑 DID: ${this.didKey}`);
            console.log(`📋 DID Document: ${this.didDocumentCID.ipfsUrl}`);

            return summary;

        } catch (error) {
            console.error(`\n${colors.red}${colors.bright}💥 ENHANCED DID GENERATION FAILED:${colors.reset}`);
            console.error('Main error:', error.message);

            const summary = this.generateSummary();
            summary.success = false;
            summary.mainError = error.message;
            return summary;
        }
    }

    async registerDIDOnSmartContract() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}⛓️ STEP 6: Registering DID on Smart Contract${colors.reset}`);
            console.log('═'.repeat(50));

            // Import SmartContractService
            const { SmartContractService } = await import('./smartContractService.js');
            const smartContractService = new SmartContractService();

            // Register DID with wallet proofs
            const result = await smartContractService.registerDIDWithProofs(
                this.didKey,
                this.didDocumentCID.cid,
                this.walletAddresses
            );

            if (result.success) {
                if (result.alreadyExists) {
                    console.log(`${colors.yellow}⚠️ DID already registered on-chain${colors.reset}`);
                } else {
                    console.log(`${colors.green}✅ DID registered on smart contract successfully!${colors.reset}`);
                    console.log(`📄 Transaction: ${result.transactionHash}`);
                    console.log(`⛽ Gas used: ${result.gasUsed}`);
                    console.log(`💼 Wallet proofs verified: ${result.walletProofCount}`);
                    console.log(`🌐 Etherscan: ${result.etherscanUrl}`);
                }

                // Store smart contract info
                this.smartContractResult = result;
                return true;
            }

            return false;

        } catch (error) {
            console.error(`${colors.red}❌ Smart contract registration failed:${colors.reset}`, error.message);
            this.errors.smartContractRegistration = error.message;
            return false;
        }
    }

    async saveToDIDMetadataTable() {
        try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();

            // Check if DID already exists for this user
            const existingDID = await prisma.dIDMetadata.findFirst({
                where: { userId: this.userId }
            });

            const didData = {
                userId: this.userId,
                did: this.didKey,
                didDocumentCid: this.didDocumentCID.cid,
                didDocumentUrl: this.didDocumentCID.ipfsUrl,
                keyType: 'Ed25519',
                verificationMethod: `${this.didKey}#key-1`,
                allWalletsCid: this.allWalletsIPFS.cid,
                allWalletsUrl: this.allWalletsIPFS.ipfsUrl,
                walletCount: this.allWalletsIPFS.walletCount,
                chains: JSON.stringify(this.allWalletsIPFS.chains),
                combinedHash: this.allWalletsIPFS.combinedHash,
                txHash: this.smartContractResult?.transactionHash || null,
                etherscanUrl: this.smartContractResult?.etherscanUrl || null,
                investorId: this.investorId,
                version: '2.0.0',
                purpose: 'multi-chain-wallet-verification'
            };

            if (existingDID) {
                // Update existing record
                await prisma.dIDMetadata.update({
                    where: { id: existingDID.id },
                    data: didData
                });
                console.log(`✅ Updated existing DID record for user ${this.userId}`);
            } else {
                // Create new record
                await prisma.dIDMetadata.create({
                    data: didData
                });
                console.log(`✅ Created new DID record for user ${this.userId}`);
            }

            await prisma.$disconnect();

        } catch (error) {
            console.error(`❌ Failed to save to database:`, error.message);
            throw error;
        }
    }
}

export { EnhancedDIDService }; 