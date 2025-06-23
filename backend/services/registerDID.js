import hre from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

async function registerDID(DID, IPFS_METADATA) {
  console.log("🚀 Registering DID with multi-chain wallet proofs...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const PHANTOM_PRIVATE_KEY = process.env.PHANTOM_PRIVATE_KEY;

  console.log("🆔 DID:", DID);
  console.log("📦 IPFS Metadata:", IPFS_METADATA);
  console.log("🏢 Contract:", CONTRACT_ADDRESS);

  const dataDir = path.join(__dirname, "../data/did-system");
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith("contract-call-data-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error("No wallet proof files found. Run generate-multichain-proofs.js first.");
  }

  const proofFile = path.join(dataDir, files[0]);
  console.log(`📄 Loading wallet proofs from: ${proofFile}`);

  const contractData = JSON.parse(fs.readFileSync(proofFile, 'utf8'));
  const rawWalletProofs = contractData.walletProofs;

  const walletProofs = rawWalletProofs.map(proof => {
    let formattedSignature = proof.signature;
    if (!formattedSignature.startsWith("0x")) {
      formattedSignature = "0x" + formattedSignature;
    }
    return {
      walletAddress: proof.walletAddress,
      blockchain: proof.blockchain,
      signature: formattedSignature,
      message: proof.message
    };
  });

  console.log(`✅ Loaded ${walletProofs.length} wallet proofs:`);
  walletProofs.forEach((proof, i) => {
    console.log(`   ${i + 1}. ${proof.blockchain}: ${proof.walletAddress}`);
  });

  const provider = new hre.ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const signer = new hre.ethers.Wallet(PHANTOM_PRIVATE_KEY, provider);
  const balance = await signer.getBalance();

  console.log(`\n👛 Transaction sender: ${signer.address}`);
  console.log(`💰 Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);

  const didRegistryAbi = (await hre.artifacts.readArtifact("SimplifiedMultiChainDIDRegistry")).abi;
  const didRegistry = new hre.ethers.Contract(CONTRACT_ADDRESS, didRegistryAbi, signer);

  console.log("\n🔍 Checking if DID already exists...");
  try {
    await didRegistry.getDIDRecord(DID);
    console.log("⚠️ DID already registered!");
    return;
  } catch {
    console.log("✅ DID not yet registered, proceeding...");
  }

  console.log("\n📝 Registering DID with multi-chain wallet proofs...");
  try {
    const estimated = await didRegistry.estimateGas.registerDID(DID, IPFS_METADATA, walletProofs);
    const gasLimit = estimated.mul(130).div(100);

    const tx = await didRegistry.registerDID(
      DID,
      IPFS_METADATA,
      walletProofs,
      {
        gasLimit,
        maxFeePerGas: hre.ethers.utils.parseUnits("25", "gwei"),
        maxPriorityFeePerGas: hre.ethers.utils.parseUnits("2", "gwei")
      }
    );

    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log("🔄 Waiting for confirmation...");

    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("\n🎉 DID REGISTRATION SUCCESSFUL!");
      console.log(`📄 Transaction: ${tx.hash}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

      const didRegisteredEvent = receipt.events?.find(e => e.event === "DIDRegistered");
      if (didRegisteredEvent) {
        console.log("\n📋 Registration Details:");
        console.log(`🆔 DID: ${didRegisteredEvent.args.did}`);
        console.log(`👑 Owner: ${didRegisteredEvent.args.owner}`);
        console.log(`📦 IPFS: ${didRegisteredEvent.args.ipfsMetadata}`);
      }

      const walletProofEvents = receipt.events?.filter(e => e.event === "WalletProofAdded") || [];
      console.log(`\n✅ Verified ${walletProofEvents.length} wallet proofs:`);
      walletProofEvents.forEach((event, i) => {
        console.log(`   ${i + 1}. ${event.args.blockchain}: ${event.args.walletAddress}`);
      });

      console.log("\n🏆 SUCCESS SUMMARY:");
      console.log(`✅ DID registered: ${DID}`);
      console.log(`✅ Multi-chain wallets proven: ${walletProofEvents.length}`);
      console.log(`✅ Blockchains: ${walletProofEvents.map(e => e.args.blockchain).join(", ")}`);
      console.log("\n🌐 View on Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    } else {
      throw new Error("Transaction failed");
    }

  } catch (error) {
    console.error("❌ Registration failed:", error.message);
    throw error;
  }
}

export default registerDID;
