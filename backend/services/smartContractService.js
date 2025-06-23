import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// DID Registry Contract ABI (simplified - only the functions we need)
const DID_REGISTRY_ABI = [
  "function registerDID(string calldata did, string calldata ipfsMetadata, tuple(string walletAddress, string blockchain, bytes signature, string message)[] calldata walletProofs) external",
  "function getDIDRecord(string calldata did) external view returns (tuple(string did, string ipfsMetadata, string[] walletAddresses, string[] blockchains, uint256 timestamp, bool isActive))",
  "function didToOwner(string calldata did) external view returns (address)",
  "event DIDRegistered(string indexed did, address indexed owner, string ipfsMetadata, uint256 timestamp)",
  "event WalletProofAdded(string indexed did, string walletAddress, string blockchain, uint256 timestamp)"
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SmartContractService {
  constructor() {
    this.contractAddress = process.env.CONTRACT_ADDRESS || '0x07370AAB8155794c8DeC91CA69ddeB4e003Eb4f0';
    this.sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
    this.deploymentPrivateKey = process.env.DEPLOYMENT_PRIVATE_KEY || process.env.PHANTOM_PRIVATE_KEY;
    
    if (!this.deploymentPrivateKey) {
      throw new Error('DEPLOYMENT_PRIVATE_KEY or PHANTOM_PRIVATE_KEY required for smart contract operations');
    }
  }

  async initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.sepoliaRpcUrl);
      this.signer = new ethers.Wallet(this.deploymentPrivateKey, this.provider);
      this.contract = new ethers.Contract(this.contractAddress, DID_REGISTRY_ABI, this.signer);
      
      // Check connection
      const balance = await this.signer.provider.getBalance(this.signer.address);
      console.log(`${colors.green}✅ Smart contract service initialized${colors.reset}`);
      console.log(`👛 Signer: ${this.signer.address}`);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
      console.log(`🏢 Contract: ${this.contractAddress}`);
      
      return true;
    } catch (error) {
      console.error(`${colors.red}❌ Failed to initialize smart contract service:${colors.reset}`, error.message);
      return false;
    }
  }

  async checkDIDExists(did) {
    try {
      const record = await this.contract.getDIDRecord(did);
      return record.isActive && record.did.length > 0;
    } catch (error) {
      // If getDIDRecord throws, DID doesn't exist
      return false;
    }
  }

  async generateWalletProofs(did, walletAddresses) {
    console.log(`${colors.cyan}🔏 Generating wallet proofs for smart contract...${colors.reset}`);
    
    const walletProofs = [];
    const message = `DID Ownership Proof for: ${did}`;
    
    // For each wallet, create a proof
    for (const [chain, wallet] of Object.entries(walletAddresses)) {
      // Skip Ethereum wallets until proper signature implemented
      if (wallet.assetId && wallet.assetId.startsWith('ETH')) {
        console.log(`${colors.yellow}⚠️ Skipping Ethereum wallet proof (${wallet.assetId}) – no valid signature yet${colors.reset}`);
        continue;
      }
      
      // Generate a mock signature for demo purposes
      // In production, this would use Fireblocks or actual wallet signing
      const mockSignature = this.generateMockSignature(wallet.address, message);
      
      const proof = {
        walletAddress: wallet.address,
        blockchain: wallet.assetId || this.mapChainToBlockchain(chain),
        signature: mockSignature,
        message: message
      };
      
      walletProofs.push(proof);
      console.log(`✅ Generated proof for ${wallet.name}: ${wallet.address}`);
    }
    
    return walletProofs;
  }

  mapChainToBlockchain(chain) {
    const mapping = {
      'BTC_TEST': 'BTC_TEST',
      'ETH_TEST5': 'ETH_TEST5', 
      'SOL_TEST': 'SOL_TEST'
    };
    return mapping[chain] || chain;
  }

  generateMockSignature(address, message) {
    // Generate a deterministic mock signature for demo
    // In production, use actual cryptographic signing
    const hash = crypto.createHash('sha256')
      .update(address + message)
      .digest('hex');
    
    // Format as Ethereum signature (65 bytes)
    return '0x' + hash + hash.substring(0, 2);
  }

  async registerDIDOnChain(did, ipfsMetadata, walletProofs) {
    try {
      console.log(`${colors.cyan}${colors.bright}🚀 Registering DID on smart contract...${colors.reset}`);
      console.log(`🆔 DID: ${did}`);
      console.log(`📦 IPFS: ${ipfsMetadata}`);
      console.log(`💼 Wallet Proofs: ${walletProofs.length}`);

      // Check if DID already exists
      const exists = await this.checkDIDExists(did);
      if (exists) {
        console.log(`${colors.yellow}⚠️ DID already registered on-chain${colors.reset}`);
        return {
          success: true,
          alreadyExists: true,
          transactionHash: null
        };
      }

      // Estimate gas
      console.log('⛽ Estimating gas...');
      const gasEstimate = await this.contract.registerDID.estimateGas(
        did,
        ipfsMetadata,
        walletProofs
      );
      
      const gasLimit = gasEstimate * 130n / 100n; // Add 30% buffer
      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}, setting limit: ${gasLimit.toString()}`);

      // Send transaction
      const tx = await this.contract.registerDID(
        did,
        ipfsMetadata,
        walletProofs,
        {
          gasLimit,
          maxFeePerGas: ethers.parseUnits('25', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
        }
      );

      console.log(`📄 Transaction submitted: ${tx.hash}`);
      console.log('🔄 Waiting for confirmation...');

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`${colors.green}✅ DID registered on smart contract successfully!${colors.reset}`);
        console.log(`📄 Transaction: ${tx.hash}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`🌐 View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

        // Parse events
        const logs = receipt.logs;
        let walletProofCount = 0;
        
        for (const log of logs) {
          try {
            const parsedLog = this.contract.interface.parseLog(log);
            if (parsedLog?.name === 'WalletProofAdded') {
              walletProofCount++;
            }
          } catch (e) {
            // Ignore unparseable logs
          }
        }

        return {
          success: true,
          transactionHash: tx.hash,
          gasUsed: receipt.gasUsed.toString(),
          walletProofCount,
          etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error(`${colors.red}❌ Smart contract registration failed:${colors.reset}`, error.message);
      throw error;
    }
  }

  async registerDIDWithProofs(did, ipfsMetadata, walletAddresses) {
    try {
      // Initialize if not already done
      if (!this.contract) {
        const initialized = await this.initializeProvider();
        if (!initialized) {
          throw new Error('Failed to initialize smart contract service');
        }
      }

      // Generate wallet proofs
      const walletProofs = await this.generateWalletProofs(did, walletAddresses);
      
      // Register on-chain
      const result = await this.registerDIDOnChain(did, ipfsMetadata, walletProofs);
      
      return result;

    } catch (error) {
      console.error(`${colors.red}❌ DID registration process failed:${colors.reset}`, error.message);
      throw error;
    }
  }
}

export { SmartContractService }; 