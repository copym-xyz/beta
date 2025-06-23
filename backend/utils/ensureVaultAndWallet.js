import { PrismaClient } from '@prisma/client';
import {FireblocksWalletRetriever}from '../services/fireblocksService.js';
const prisma = new PrismaClient();
export async function ensureVaultAndWallet(userId) {
  // Check if the user already has a vault
  let vault = await prisma.vault.findUnique({
    where: { userId },
    include: { wallets: true },
  });

  // If not, create a vault + wallet
  if (!vault) {
    const manager = new FireblocksWalletRetriever(userId);
 
  const result = await manager.run(); // 🏁 Runs vault+wallet creation+fetching
  console.log('🔎 Fireblocks summary:', result);
  if (!result.success) {
    throw new Error(`Vault/Wallet retrieval failed: ${result.mainError}`);
  }

  const { vaultId, wallets } = result;

  // 🔐 Create vault + wallet entries in your DB
  const vault = await prisma.vault.create({
    data: {
      user: { connect: { id: userId } },
      fireblocksVaultId: vaultId.toString(),
      wallets: {
        create: Object.entries(wallets).map(([asset, data]) => ({
          address: data.address,
          assetId: data.assetId,
          network: asset,
          balance: parseFloat(data.balance || '0'),
        })),
      },
    },
    include: { wallets: true },
  });

  // 🚀 AUTOMATICALLY GENERATE ENHANCED DID WITH SPRUCE DIDKIT AFTER VAULT CREATION
  try {
    console.log('🔄 Starting automatic enhanced DID generation for newly created vault...');
    const { EnhancedDIDService } = await import('../services/enhancedDIDService.js');
    
    // Wait a bit for database consistency
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enhancedDIDService = new EnhancedDIDService(userId);
    
    // Run the complete enhanced DID generation process
    const result = await enhancedDIDService.run();
    
    if (result.success) {
      console.log(`🎉 Automatic enhanced DID generation completed for user ${userId}`);
      console.log(`🔑 DID: ${result.didKey}`);
      console.log(`📋 DID Document CID: ${result.didDocumentCID?.cid}`);
      console.log(`💼 Individual wallet CIDs: ${result.walletCIDCount}`);
      console.log(`🔗 Chains: ${Object.keys(result.walletIPFSCIDs || {}).join(', ')}`);
    } else {
      console.log('⚠️ Automatic enhanced DID generation failed:', result.mainError);
    }
  } catch (didError) {
    console.error('⚠️ Automatic enhanced DID generation failed (vault still created):', didError.message);
    // Don't fail vault creation if DID generation fails
  }
  }

  return vault;
}
