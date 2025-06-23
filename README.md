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
   # Configure your .env file with database and API keys
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd copym-beta-app
   npm install
   # Copy .env.example to .env (optional - has good defaults)
   cp .env.example .env
   npm run dev
   ```

3. **Smart Contracts**:
   ```bash
   cd smart-contracts
   npm install
   npx hardhat compile
   ```

### Production Deployment 🌐
**Super Simple**: Environment detection is automatic!

**Backend**: Set `NODE_ENV=production` in your `.env` file
**Frontend**: Vite automatically detects build mode (`npm run build` = production)

```bash
# Backend .env file:
NODE_ENV=production

# Frontend automatically uses:
# Development: http://localhost:5000
# Production: https://api.copym.xyz
# Fallback: http://139.59.29.69:5000
```

**Deploy Commands**:
```bash
# Backend
cd backend && NODE_ENV=production npm start

# Frontend (automatically detects production mode)
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