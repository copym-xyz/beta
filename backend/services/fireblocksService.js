import dotenv from 'dotenv';
import { Fireblocks, BasePath } from '@fireblocks/ts-sdk';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🔍 Script started...');
console.log('📁 Current directory:', process.cwd());

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

// Debug: Check environment variables
console.log('🔧 Checking environment variables...');
console.log('FIREBLOCKS_API_KEY:', process.env.FIREBLOCKS_API_KEY ? '✅ Set' : '❌ Missing');
console.log('FIREBLOCKS_SECRET_KEY_PATH:', process.env.FIREBLOCKS_SECRET_KEY_PATH ? '✅ Set' : '❌ Missing');
console.log('VAULT_ACCOUNT_ID:', process.env.VAULT_ACCOUNT_ID ? '✅ Set' : '❌ Missing');

// Target blockchain assets we want to retrieve - with multiple possible IDs
const TARGET_ASSETS = [
    {
        possibleIds: ['BTC_TEST', 'BTC'],
        name: 'Bitcoin Testnet',
        chain: 'bitcoin'
    },
    {
        possibleIds: ['ETH_TEST5', 'ETH_TEST', 'ETH'],
        name: 'Ethereum Sepolia',
        chain: 'ethereum'
    },
    {
        possibleIds: ['SOL_TEST', 'SOL'],
        name: 'Solana Devnet',
        chain: 'solana'
    }
];

class FireblocksWalletRetriever {
    constructor(userId) {
        console.log('🏗️ Initializing FireblocksWalletRetriever...');
        this.fireblocks = null;
        this.vaultAccountId = null;
        this.walletAddresses = {};
        this.errors = {};
        this.allVaultAssets = [];
        this.userId = userId;
        console.log('📦 Vault ID to retrieve from:', this.vaultAccountId);
    }

    async initializeSDK() {
        try {
            console.log(`${colors.cyan}${colors.bright}🔧 STEP 1: Initializing Fireblocks SDK${colors.reset}`);
            console.log('═'.repeat(50));

            // Check required environment variables
            if (!process.env.FIREBLOCKS_API_KEY) {
                throw new Error('FIREBLOCKS_API_KEY is missing from .env file');
            }

            if (!process.env.FIREBLOCKS_SECRET_KEY_PATH) {
                throw new Error('FIREBLOCKS_SECRET_KEY_PATH is missing from .env file');
            }

            // Check if private key file exists
            console.log('🔍 Checking private key file:', process.env.FIREBLOCKS_SECRET_KEY_PATH);
            if (!fs.existsSync(process.env.FIREBLOCKS_SECRET_KEY_PATH)) {
                throw new Error(`Private key file not found: ${process.env.FIREBLOCKS_SECRET_KEY_PATH}`);
            }

            // Read private key
            console.log('📖 Reading private key file...');
            const privateKey = fs.readFileSync(process.env.FIREBLOCKS_SECRET_KEY_PATH, 'utf8');
            console.log(`${colors.green}✅ Private key loaded (${privateKey.length} characters)${colors.reset}`);

            // Resolve the correct basePath
            let resolvedBasePath = process.env.FIREBLOCKS_BASE_URL;
            if (!resolvedBasePath || !/\/v\d+$/.test(resolvedBasePath)) {
                resolvedBasePath = BasePath.Sandbox;
            }

            console.log('🔧 Creating Fireblocks SDK instance...');

            this.fireblocks = new Fireblocks({
                apiKey: process.env.FIREBLOCKS_API_KEY,
                secretKey: privateKey,
                basePath: resolvedBasePath
            });

            console.log(`${colors.green}✅ Fireblocks SDK initialized successfully${colors.reset}`);
            console.log(`${colors.blue}📡 Base URL: ${resolvedBasePath}${colors.reset}`);
            console.log(`${colors.blue}🔑 API Key: ${process.env.FIREBLOCKS_API_KEY.substring(0, 8)}...${colors.reset}`);

            return true;

        } catch (error) {
            console.error(`${colors.red}❌ SDK initialization failed:${colors.reset}`);
            console.error('Error details:', error.message);
            this.errors.sdkInit = error.message;
            return false;
        }
    }

    async testConnection() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}🔗 STEP 2: Testing Fireblocks Connection${colors.reset}`);
            console.log('═'.repeat(50));

            console.log('📡 Making test API call...');
            const startTime = Date.now();

            // Test connection by getting supported assets
            const response = await this.fireblocks.blockchainsAssets.getSupportedAssets();
            const supportedAssets = response.data;

            const responseTime = Date.now() - startTime;

            console.log(`${colors.green}✅ Connection successful${colors.reset}`);
            console.log(`${colors.blue}⚡ Response time: ${responseTime}ms${colors.reset}`);
            console.log(`${colors.blue}📊 Supported assets: ${supportedAssets.length} assets available${colors.reset}`);

            return true;

        } catch (error) {
            console.error(`${colors.red}❌ Connection test failed:${colors.reset}`);
            console.error('Error details:', error.message);
            this.errors.connectionTest = error.message;
            return false;
        }
    }
    async createVaultForUser() {
        try {
            console.log(`🚀 Creating Fireblocks Vault`);
            const timestamp = Date.now();
            const vaultName = `Vault_User_${this.userId}_${timestamp}`;
            const customerRefId = `ref_user_${this.userId}_${timestamp}`;
            const createVaultRequest = {
                name: vaultName,
                hiddenOnUI: false,               // optional: show in UI
                customerRefId: customerRefId,    // link vault to your user
                autoFuel: true,                  // enable gas top-ups
                vaultType: 'MPC',                // Fireblocks default
                autoAssign: true                   // manually assign wallets later
            }
            console.log('Vault Creation Payload:', createVaultRequest);

            const response = await this.fireblocks.vaults.createVaultAccount({
                createVaultAccountRequest: createVaultRequest
            });

            const vaultAccount = response.data;

            console.log(`✅ Vault Created: ID ${vaultAccount.id}, Name ${vaultAccount.name}`);

            this.vaultAccountId = vaultAccount.id;

            return vaultAccount;
        } catch (err) {
            console.error('❌ Failed to create vault:', err.response?.data || err.message);
            throw err;
        }
    }
    async retrieveVaultWallets() {
        try {
            console.log(`\n${colors.cyan}${colors.bright}🏦 STEP 3: Retrieving Vault Wallet Details${colors.reset}`);
            console.log('═'.repeat(50));

            console.log(`📡 Getting vault account details for ID: ${this.vaultAccountId}...`);

            // Get vault account with all its assets
            const response = await this.fireblocks.vaults.getVaultAccount({
                vaultAccountId: this.vaultAccountId
            });
            const vaultAccount = response.data;

            console.log(`${colors.green}✅ Vault account retrieved successfully${colors.reset}`);
            console.log(`${colors.blue}🏦 Vault ID: ${vaultAccount.id}${colors.reset}`);
            console.log(`${colors.blue}📝 Vault Name: ${vaultAccount.name || 'Unnamed'}${colors.reset}`);
            console.log(`${colors.blue}🔢 Total assets in vault: ${vaultAccount.assets?.length || 0}${colors.reset}`);

            // Store all vault assets for later use
            this.allVaultAssets = vaultAccount.assets || [];

            if (this.allVaultAssets.length === 0) {
                console.log(`${colors.yellow}⚠️ No assets found in vault ${this.vaultAccountId}${colors.reset}`);
                console.log(`${colors.blue}💡 This vault might be empty. Let's try to create wallets for each blockchain...${colors.reset}`);
            } else {
                console.log(`\n${colors.cyan}📋 ALL Assets found in vault:${colors.reset}`);
                this.allVaultAssets.forEach(asset => {
                    console.log(`  - ${colors.yellow}${asset.id}${colors.reset}: ${asset.total || '0'} available`);
                });
            }

            return vaultAccount;

        } catch (error) {
            console.error(`${colors.red}❌ Failed to retrieve vault:${colors.reset}`);

            if (error.response?.status === 404) {
                console.error(`${colors.red}💡 Vault ID '${this.vaultAccountId}' does not exist${colors.reset}`);
                console.error(`${colors.yellow}🔧 Solutions:${colors.reset}`);
                console.error(`   1. Check if VAULT_ACCOUNT_ID in .env is correct`);
                console.error(`   2. Use a different vault ID that exists in your workspace`);
                console.error(`   3. Create the vault first if it doesn't exist`);
            } else if (error.response?.status === 403) {
                console.error(`${colors.red}💡 Access denied to vault '${this.vaultAccountId}'${colors.reset}`);
                console.error(`${colors.yellow}🔧 Check API key permissions${colors.reset}`);
            }

            console.error('Error details:', error.message);
            this.errors.vaultRetrieval = error.message;
            return null;
        }
    }

    findAssetInVault(targetAsset) {
        // Try to find any of the possible asset IDs in the vault
        for (const possibleId of targetAsset.possibleIds) {
            const found = this.allVaultAssets.find(asset => asset.id === possibleId);
            if (found) {
                return { found, assetId: possibleId };
            }
        }
        return { found: null, assetId: targetAsset.possibleIds[0] }; // Default to first ID
    }

    async getAddressesForAsset(assetId, targetAsset) {
        try {
            console.log(`📡 Getting wallet addresses for ${assetId}...`);

            const addressResponse = await this.fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
                vaultAccountId: this.vaultAccountId,
                assetId: assetId
            });

            const addresses = addressResponse.data.addresses;

            if (addresses && addresses.length > 0) {
                console.log(`${colors.green}✅ Found ${addresses.length} address(es) for ${targetAsset.name}${colors.reset}`);

                // Use the primary address (usually the first one)
                const primaryAddress = addresses[0];

                console.log(`${colors.blue}📍 Primary Address: ${primaryAddress.address}${colors.reset}`);
                if (primaryAddress.legacyAddress) {
                    console.log(`${colors.blue}📍 Legacy Address: ${primaryAddress.legacyAddress}${colors.reset}`);
                }

                return {
                    address: primaryAddress.address,
                    legacyAddress: primaryAddress.legacyAddress || null,
                    assetId: assetId,
                    name: targetAsset.name,
                    addressCount: addresses.length,
                    bip44AddressIndex: primaryAddress.bip44AddressIndex
                };
            } else {
                console.log(`${colors.yellow}⚠️ No addresses found for ${targetAsset.name} (${assetId})${colors.reset}`);
                return null;
            }

        } catch (addressError) {
            console.error(`${colors.red}❌ Failed to get addresses for ${targetAsset.name} (${assetId}):${colors.reset}`, addressError.message);
            return null;
        }
    }

    async createWalletAndAddress(assetId, targetAsset) {
        try {
            console.log(`${colors.blue}💡 Creating wallet and generating first deposit address for ${targetAsset.name}...${colors.reset}`);
            console.log(`🔍 DEBUG: Attempting to create asset: ${assetId} for chain: ${targetAsset.chain}`);

            // First, create the vault wallet (activate asset)
            console.log(`🔧 Creating vault asset for ${assetId}...`);
            
            try {
                const createResponse = await this.fireblocks.vaults.createVaultAccountAsset({
                vaultAccountId: this.vaultAccountId,
                assetId: assetId
            });
                console.log(`${colors.green}✅ Vault asset ${assetId} created successfully${colors.reset}`);
                console.log(`🔍 DEBUG: Create response:`, createResponse.data);
            } catch (assetError) {
                console.log(`🔍 DEBUG: Asset creation error for ${assetId}:`, assetError.response?.data || assetError.message);
                
                // Check if asset already exists
                if (assetError.message.includes('already exists') || assetError.response?.status === 409) {
                    console.log(`${colors.yellow}ℹ️ Asset ${assetId} already exists in vault, continuing...${colors.reset}`);
                } else {
                    console.error(`${colors.red}❌ Failed to create vault asset ${assetId}:${colors.reset}`, assetError.message);
                    
                    // For ETH, log the specific error and try alternatives
                    if (targetAsset.chain === 'ethereum') {
                        console.log(`🔍 DEBUG: ETH asset creation failed. Full error:`, assetError.response?.data);
                        console.log(`🔍 DEBUG: Trying alternatives...`);
                        
                        // Check all possible ETH asset IDs
                        for (const altAssetId of targetAsset.possibleIds) {
                            if (altAssetId !== assetId) {
                                console.log(`🔄 Trying alternative asset ID: ${altAssetId}`);
                                try {
                                    await this.fireblocks.vaults.createVaultAccountAsset({
                                        vaultAccountId: this.vaultAccountId,
                                        assetId: altAssetId
                                    });
                                    console.log(`${colors.green}✅ Successfully created ${altAssetId}${colors.reset}`);
                                    assetId = altAssetId; // Use the successful asset ID
                                    break;
                                } catch (altError) {
                                    console.log(`❌ ${altAssetId} also failed:`, altError.message);
                                }
                            }
                        }
                    } else {
                        throw assetError;
                    }
                }
            }

            // Increase delay for ETH assets as they might need more time
            const delay = targetAsset.chain === 'ethereum' ? 6000 : 2000; // Increased ETH delay
            console.log(`⏱️ Waiting ${delay}ms for asset to be ready...`);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Now create the first deposit address
            console.log(`🔧 Creating deposit address for ${assetId}...`);
            try {
            const addrResp = await this.fireblocks.vaults.createVaultAccountAssetAddress({
                vaultAccountId: this.vaultAccountId,
                assetId: assetId,
                createAddressRequest: {
                    description: `Primary ${targetAsset.name} address created by script`
                }
            });

            const addr = addrResp.data;
            console.log(`${colors.green}✅ Address generated: ${addr.address}${colors.reset}`);

            return {
                address: addr.address,
                legacyAddress: addr.legacyAddress || null,
                assetId: assetId,
                name: targetAsset.name,
                addressCount: 1,
                bip44AddressIndex: addr.bip44AddressIndex
            };
            } catch (addressError) {
                console.error(`${colors.red}❌ Failed to create address for ${assetId}:${colors.reset}`);
                console.log(`🔍 DEBUG: Address creation error:`, addressError.response?.data || addressError.message);
                
                // Try to get existing addresses instead
                console.log(`🔄 Trying to get existing addresses for ${assetId}...`);
                return await this.getAddressesForAsset(assetId, targetAsset);
            }

        } catch (creationError) {
            console.error(`${colors.red}❌ Failed to create wallet/address for ${targetAsset.name} (${assetId}):${colors.reset}`);
            console.error(`🔍 DEBUG: Full creation error:`, creationError.response?.data || creationError.message);
            
            // Store the error for debugging
            this.errors[`${targetAsset.chain}Creation`] = creationError.message;
            return null;
        }
    }

    async getWalletAddresses(vaultAccount) {
        try {
            console.log(`\n${colors.cyan}${colors.bright}🔐 STEP 4: Extracting Wallet Addresses${colors.reset}`);
            console.log('═'.repeat(50));

            const foundAddresses = {};
            const missingAssets = [];

            // Look for our target assets in the vault
            for (const targetAsset of TARGET_ASSETS) {
                console.log(`\n${colors.yellow}🔍 Looking for ${targetAsset.name}...${colors.reset}`);

                // Try to find this asset in the vault (checking all possible IDs)
                const { found: vaultAsset, assetId } = this.findAssetInVault(targetAsset);

                let addressInfo = null;

                if (vaultAsset) {
                    console.log(`${colors.green}✅ Found ${targetAsset.name} in vault as ${assetId}${colors.reset}`);
                    console.log(`${colors.blue}💰 Balance: ${vaultAsset.total || '0'}${colors.reset}`);

                    // Try to get addresses for this existing asset
                    addressInfo = await this.getAddressesForAsset(assetId, targetAsset);

                    if (addressInfo) {
                        addressInfo.balance = vaultAsset.total || '0';
                    }
                }

                // If we didn't find the asset in vault, or didn't get addresses, try to create
                if (!addressInfo) {
                    console.log(`${colors.yellow}⚠️ ${targetAsset.name} not found in vault or no addresses available${colors.reset}`);
                    addressInfo = await this.createWalletAndAddress(assetId, targetAsset);

                    if (addressInfo) {
                        addressInfo.balance = '0';
                    }
                }

                // If we successfully got address info, save it
                if (addressInfo) {
                    foundAddresses[targetAsset.chain] = addressInfo;
                    console.log(`${colors.green}🎉 Successfully retrieved ${targetAsset.name} address!${colors.reset}`);
                } else {
                    console.log(`${colors.red}❌ Could not retrieve ${targetAsset.name} address${colors.reset}`);
                    missingAssets.push(targetAsset);
                }

                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.walletAddresses = foundAddresses;

            // Show summary
            console.log(`\n${colors.cyan}📊 Retrieval Summary:${colors.reset}`);
            console.log(`${colors.green}✅ Found addresses: ${Object.keys(foundAddresses).length}/${TARGET_ASSETS.length}${colors.reset}`);
            console.log(`${colors.yellow}⚠️ Missing assets: ${missingAssets.length}${colors.reset}`);

            if (missingAssets.length > 0) {
                console.log(`\n${colors.yellow}📋 Missing Assets:${colors.reset}`);
                missingAssets.forEach(asset => {
                    console.log(`  - ${asset.name} (tried IDs: ${asset.possibleIds.join(', ')})`);
                });
            }

            return foundAddresses;

        } catch (error) {
            console.error(`${colors.red}❌ Failed to extract wallet addresses:${colors.reset}`);
            console.error('Error details:', error.message);
            this.errors.addressExtraction = error.message;
            return {};
        }
    }


    generateSummary() {
        console.log(`\n${colors.cyan}${colors.bright}📊 FINAL SUMMARY${colors.reset}`);
        console.log('═'.repeat(50));

        const foundCount = Object.keys(this.walletAddresses).length;
        const totalTargets = TARGET_ASSETS.length;
        const errorCount = Object.keys(this.errors).length;

        console.log(`${colors.green}✅ Wallet addresses found: ${foundCount}/${totalTargets}${colors.reset}`);
        console.log(`${colors.red}❌ Errors: ${errorCount}${colors.reset}`);

        if (foundCount > 0) {
            console.log(`\n${colors.yellow}📋 RETRIEVED WALLET ADDRESSES:${colors.reset}`);
            Object.entries(this.walletAddresses).forEach(([chain, info]) => {
                console.log(`  ${colors.bright}${info.name}:${colors.reset}`);
                console.log(`    Address: ${colors.green}${info.address}${colors.reset}`);
                if (info.legacyAddress) {
                    console.log(`    Legacy: ${colors.green}${info.legacyAddress}${colors.reset}`);
                }
                console.log(`    Balance: ${info.balance}`);
                console.log(`    Asset ID: ${info.assetId}`);
                if (info.bip44AddressIndex !== undefined) {
                    console.log(`    bip44AddressIndex: ${info.bip44AddressIndex}`);
                }
                console.log('');
            });
        }

        if (errorCount > 0) {
            console.log(`${colors.red}❌ ERRORS:${colors.reset}`);
            Object.entries(this.errors).forEach(([key, error]) => {
                console.log(`  ${key}: ${error}`);
            });
        }

        console.log(`\n${colors.cyan}🚀 NEXT STEPS:${colors.reset}`);
        if (foundCount >= 2) { // At least BTC and ETH
            console.log(`${colors.green}✅ Wallet addresses retrieved successfully!${colors.reset}`);
            if (foundCount === totalTargets) {
                console.log(`${colors.green}🎉 ALL 3 WALLETS EXTRACTED SUCCESSFULLY!${colors.reset}`);
            }
            console.log(`${colors.blue}🎯 Next: Create DID identity using the BTC address${colors.reset}`);
            console.log(`${colors.blue}📝 Run: npm run create-did${colors.reset}`);
            console.log(`${colors.blue}📝 Or: node scripts/2-create-did.js${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ Not enough wallet addresses were found${colors.reset}`);
            console.log(`${colors.yellow}🔧 You may need to manually create wallets in Fireblocks Console${colors.reset}`);
        }

        return {
            success: foundCount >= 1, // Success if we get at least BTC and ETH
            foundCount,
            totalTargets,
            errorCount,
            wallets: this.walletAddresses,
            vaultId: this.vaultAccountId,
            errors: this.errors
        };
    }

    async run() {
        console.log(`${colors.bright}${colors.cyan}🔍 FIREBLOCKS WALLET ADDRESS RETRIEVAL (FIXED)${colors.reset}`);
        console.log(`${colors.cyan}⏰ Started: ${new Date().toISOString()}${colors.reset}`);
        console.log(`${colors.cyan}🏦 Vault ID: ${this.vaultAccountId}${colors.reset}`);
        console.log('═'.repeat(60));

        try {
            console.log('🚀 Starting address retrieval process...');

            const sdkInit = await this.initializeSDK();
            if (!sdkInit) {
                throw new Error('SDK initialization failed');
            }

            const connectionOk = await this.testConnection();
            if (!connectionOk) {
                throw new Error('Connection test failed');
            }
            const createVaultAccount = await this.createVaultForUser();
            if (!createVaultAccount) {
                throw new Error('Vault creation failed');
            }
            const vaultAccount = await this.retrieveVaultWallets();
            if (!vaultAccount) {
                throw new Error('Vault retrieval failed');
            }

            await this.getWalletAddresses(vaultAccount);

            const summary = this.generateSummary();

            console.log(`\n${colors.green}${colors.bright}🎉 RETRIEVAL COMPLETED!${colors.reset}`);

            return summary;

        } catch (error) {
            console.error(`\n${colors.red}${colors.bright}💥 RETRIEVAL FAILED:${colors.reset}`);
            console.error('Main error:', error.message);

            const summary = this.generateSummary();
            summary.success = false;
            summary.mainError = error.message;
            return summary;
        }
    }
}

// Main execution
async function main() {
    console.log('🎬 Starting main function...');

    try {
        const retriever = new FireblocksWalletRetriever();
        console.log('🏃 Running wallet address retrieval...');
        const result = await retriever.run();

        console.log('📊 Final result:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    } catch (error) {
        console.error('💥 Unhandled error in main:', error);
        process.exit(1);
    }
}

// FORCED EXECUTION - Always run when script is loaded
console.log('🎯 Starting script execution...');
console.log('📄 Script arguments:', process.argv);


export { FireblocksWalletRetriever };