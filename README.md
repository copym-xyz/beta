# CopyM Beta 🚀

Blockchain-based identity and asset tokenization platform with KYC, SBT minting, and DID management.

## Project Structure
- `backend/` - Node.js backend server with authentication, KYC, and blockchain services
- `copym-beta-app/` - React frontend application with modern UI
- `smart-contracts/` - Solidity smart contracts for SBT and DID registry

## Quick Start

### Development
1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd copym-beta-app
   npm install
   npm run dev
   ```

3. **Smart Contracts**:
   ```bash
   cd smart-contracts
   npm install
   npx hardhat compile
   ```

### Production Deployment 🌐
**Super Simple**: Just set `NODE_ENV=production` in your `.env` file!

```bash
# In your .env file, change:
NODE_ENV=production

# The app automatically detects production and uses:
# Frontend: https://issuer.copym.xyz
# Backend: https://api.copym.xyz
# Fallback: http://139.59.29.69:5000
```

**Deploy Commands**:
```bash
# Backend
cd backend && NODE_ENV=production npm start

# Frontend  
cd copym-beta-app && npm run build
```

## Features ✨
- 🔐 OAuth authentication (Google)
- 📋 KYC verification with Sumsub
- 🏦 Fireblocks wallet integration
- 🎫 SBT (Soul Bound Token) minting
- 🆔 DID (Decentralized Identity) management
- 🌐 Environment-aware configuration
- 📱 Modern responsive UI