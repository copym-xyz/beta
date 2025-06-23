const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying Multi-Chain DID Registry...\n");

  try {
    // Get deployer info
    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.getBalance();
    
    console.log("👤 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(hre.ethers.utils.parseEther("0.01"))) {
      console.log("⚠️  WARNING: Low balance!");
    }

    // Compile
    console.log("🔨 Compiling contract...");
    await hre.run("compile");
    console.log("✅ Compiled successfully\n");

    // Deploy
    console.log("📦 Deploying MultiChainDIDRegistry...");
    const MultiChainDIDRegistry = await hre.ethers.getContractFactory("MultiChainDIDRegistry");
    const didRegistry = await MultiChainDIDRegistry.deploy();
    
    await didRegistry.deployed();
    
    console.log("✅ Contract deployed!");
    console.log("🏢 Address:", didRegistry.address);
    console.log("📄 Tx Hash:", didRegistry.deployTransaction.hash);

    // Transfer ownership if ETH wallet specified
    if (process.env.ETH_WALLET_ADDRESS) {
      console.log("\n👑 Transferring ownership...");
      const transferTx = await didRegistry.transferOwnership(process.env.ETH_WALLET_ADDRESS);
      await transferTx.wait();
      console.log("✅ Ownership transferred to:", process.env.ETH_WALLET_ADDRESS);
    }

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const owner = await didRegistry.owner();
    const maxWallets = await didRegistry.MAX_WALLETS_PER_DID();
    
    console.log("👑 Owner:", owner);
    console.log("📊 Max wallets:", maxWallets.toString());

    // Check supported blockchains
    const chains = ["ETH_TEST5", "BTC_TEST", "SOL_TEST"];
    console.log("🔗 Supported blockchains:");
    for (const chain of chains) {
      const supported = await didRegistry.supportedBlockchains(chain);
      console.log(`   ${chain}: ${supported ? "✅" : "❌"}`);
    }

    // Update .env
    console.log("\n💾 Updating .env file...");
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Remove old contract lines
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('CONTRACT_ADDRESS='))
      .join('\n');
    
    // Add new contract address
    envContent += `\nCONTRACT_ADDRESS=${didRegistry.address}\n`;
    fs.writeFileSync('.env', envContent);
    
    console.log("✅ .env updated with contract address");

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("🏢 Contract:", didRegistry.address);
    console.log("🌐 Etherscan:", `https://sepolia.etherscan.io/address/${didRegistry.address}`);
    
    console.log("\n📋 NEXT STEPS:");
    console.log("1. ✅ Multi-chain contract deployed");
    console.log("2. 🚀 Register DID: npx hardhat run scripts/register-did-multichain.js --network sepolia");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });