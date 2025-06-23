import { ethers } from 'ethers';
import crypto from 'crypto';
import fs from 'fs';

class SBTMintingService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.sbtContract = null;
        this.contractAddress = process.env.SBT_CONTRACT_ADDRESS;
        
        // Debug contract address
        console.log(`🔍 SBT Contract Address from env: ${this.contractAddress}`);
        if (!this.contractAddress) {
            console.log('❌ SBT_CONTRACT_ADDRESS is not set in environment variables');
            console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SBT')));
        }
    }

    async initialize() {
        try {
            if (!this.contractAddress) {
                throw new Error('SBT_CONTRACT_ADDRESS not found in environment variables');
            }

            // Initialize provider
            this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
            
            // Initialize signer
            this.signer = new ethers.Wallet(process.env.DEPLOYMENT_PRIVATE_KEY, this.provider);
            
            // Initialize contract
            const sbtABI = [
                "function mintSBT(address to, string memory did, string memory tokenURI, bytes32 vcHash) public returns (uint256)",
                "function holderToken(address holder) public view returns (uint256)",
                "function registerVC(uint256 tokenId, bytes32 vcHash) public",
                "function ownerOf(uint256 tokenId) public view returns (address)",
                "function tokenURI(uint256 tokenId) public view returns (string)",
                "function tokenDID(uint256 tokenId) public view returns (string)",
                "function getLatestVC(uint256 tokenId) public view returns (bytes32)",
                "function name() public view returns (string)",
                "function symbol() public view returns (string)",
                "function totalSupply() public view returns (uint256)"
            ];
            
            this.sbtContract = new ethers.Contract(this.contractAddress, sbtABI, this.signer);
            
            console.log(`✅ SBT service initialized with contract: ${this.contractAddress}`);
            return true;
            
        } catch (error) {
            console.error(`❌ SBT service initialization failed:`, error.message);
            return false;
        }
    }

    async mintSBT(userData, vcData) {
        try {
            console.log(`🎖️ Minting SBT for ${userData.name}...`);

            if (!this.sbtContract) {
                const initialized = await this.initialize();
                if (!initialized) throw new Error('Contract initialization failed');
            }

            // Prepare minting parameters
            const recipient = userData.wallets.eth;
            const did = userData.did;
            const tokenURI = `ipfs://${vcData.vcCid}`;
            const vcHash = `0x${vcData.vcHash}`;

            console.log(`🎯 Recipient: ${recipient}`);
            console.log(`🆔 DID: ${did}`);
            console.log(`🔗 Token URI: ${tokenURI}`);

            // Check if user already has SBT
            const existingTokenId = await this.sbtContract.holderToken(recipient);
            if (existingTokenId.toString() !== "0") {
                console.log(`⚠️ User already has SBT (Token ID: ${existingTokenId})`);
                
                // Update VC hash instead
                const updateTx = await this.sbtContract.registerVC(existingTokenId, vcHash);
                console.log(`🔄 Updating VC hash: ${updateTx.hash}`);
                
                const receipt = await updateTx.wait();
                console.log(`✅ VC hash updated for token ${existingTokenId}`);
                
                return {
                    action: 'vc_updated',
                    tokenId: existingTokenId.toString(),
                    transactionHash: updateTx.hash,
                    vcHash: vcHash
                };
            }

            // Mint new SBT
            console.log(`🚀 Minting new SBT...`);
            const mintTx = await this.sbtContract.mintSBT(recipient, did, tokenURI, vcHash);
            console.log(`⏳ Transaction: ${mintTx.hash}`);

            const receipt = await mintTx.wait();
            console.log(`✅ SBT minted successfully!`);

            // Extract token ID from events
            let tokenId = null;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = this.sbtContract.interface.parseLog(log);
                    if (parsedLog.name === 'SBTMinted') {
                        tokenId = parsedLog.args.tokenId.toString();
                        break;
                    }
                } catch (error) {
                    // Skip unparseable logs
                }
            }

            if (!tokenId) {
                const totalSupply = await this.sbtContract.totalSupply();
                tokenId = totalSupply.toString();
            }

            console.log(`🆔 Token ID: ${tokenId}`);

            return {
                action: 'sbt_minted',
                tokenId: tokenId,
                transactionHash: mintTx.hash,
                contractAddress: this.contractAddress,
                vcHash: vcHash,
                gasUsed: receipt.gasUsed.toString(),
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error(`❌ SBT minting failed:`, error.message);
            
            // Handle specific errors
            if (error.message.includes('insufficient funds')) {
                throw new Error('Insufficient ETH for gas fees');
            } else if (error.message.includes('already has SBT')) {
                throw new Error('User already has an SBT');
            } else {
                throw new Error(`Minting failed: ${error.message}`);
            }
        }
    }

    async verifySBT(tokenId) {
        try {
            if (!this.sbtContract) {
                await this.initialize();
            }

            const owner = await this.sbtContract.ownerOf(tokenId);
            const tokenURI = await this.sbtContract.tokenURI(tokenId);
            const tokenDID = await this.sbtContract.tokenDID(tokenId);
            const vcHash = await this.sbtContract.getLatestVC(tokenId);

            return {
                tokenId: tokenId,
                owner: owner,
                tokenURI: tokenURI,
                did: tokenDID,
                vcHash: vcHash
            };

        } catch (error) {
            console.error(`❌ SBT verification failed:`, error.message);
            return null;
        }
    }
}

export default SBTMintingService; 