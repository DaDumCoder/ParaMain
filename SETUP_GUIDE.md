# PARA Wallet Project Setup Guide

This guide will help you set up and run the PARA Wallet project, including configuration for Firebase and smart contract addresses.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- A Firebase project
- MongoDB database
- Web3 wallet (MetaMask or similar)

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd PARA-Wallet-Latest

# Install dependencies
npm install
```

## Step 2: Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Para API Key (already configured in the code)
# NEXT_PUBLIC_PARA_API_KEY=cbaab0dbc16b98e540bb4b6d5322c6f1

# Reown Project ID (already configured in the code)
# Project ID: c70d056e9a9018d033c2195ba5aa5bf6
```

### How to Get Firebase Configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app or create a new one
6. Copy the configuration values from the provided config object

### How to Get MongoDB Connection String:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) or your MongoDB provider
2. Create a new cluster or use existing one
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string and replace `<password>` with your actual password

## Step 3: Smart Contract Address Configuration

The project uses multiple smart contract addresses that need to be updated based on your deployed contracts. Here are the current hardcoded addresses:

### Current Contract Addresses:

1. **Main Claim Contract**: `0x7917B4D4071AfdF7BB69bc65c423C3613Cd05c73`
   - Used in: `app/[id]/page.tsx` and `app/DailyCheck/page.tsx`

2. **Claim Contract**: `0xCE2d19b5d9F4b93fC58c9d0Ab79D110055Ba54C3`
   - Used in: `app/Claim/page.tsx`

3. **Purchase Contract**: `0xA10c4F558a15856223FdC292C547d96782F8A9dc`
   - Used in: `app/Claim/page.tsx`

### How to Update Contract Addresses:

#### Option 1: Direct File Editing

Update the contract addresses in the following files:

**File: `app/[id]/page.tsx`**
```typescript
// Line 110
const contractAddress = "YOUR_NEW_CONTRACT_ADDRESS";
```

**File: `app/DailyCheck/page.tsx`**
```typescript
// Line 113
const contractAddress = "YOUR_NEW_CONTRACT_ADDRESS";
```

**File: `app/Claim/page.tsx`**
```typescript
// Line 395
const Claim_contractAddress = "YOUR_NEW_CLAIM_CONTRACT_ADDRESS";

// Line 510
const Purchase_contractAddress = "YOUR_NEW_PURCHASE_CONTRACT_ADDRESS";
```

#### Option 2: Environment Variables (Recommended)

Create a configuration file `app/Config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  MAIN_CLAIM: process.env.NEXT_PUBLIC_MAIN_CLAIM_CONTRACT || "0x7917B4D4071AfdF7BB69bc65c423C3613Cd05c73",
  CLAIM: process.env.NEXT_PUBLIC_CLAIM_CONTRACT || "0xCE2d19b5d9F4b93fC58c9d0Ab79D110055Ba54C3",
  PURCHASE: process.env.NEXT_PUBLIC_PURCHASE_CONTRACT || "0xA10c4F558a15856223FdC292C547d96782F8A9dc",
};
```

Then add these to your `.env.local`:
```env
NEXT_PUBLIC_MAIN_CLAIM_CONTRACT=your_main_claim_contract_address
NEXT_PUBLIC_CLAIM_CONTRACT=your_claim_contract_address
NEXT_PUBLIC_PURCHASE_CONTRACT=your_purchase_contract_address
```

And update the files to import from this config:
```typescript
import { CONTRACT_ADDRESSES } from '../Config/contracts';

// Then use:
const contractAddress = CONTRACT_ADDRESSES.MAIN_CLAIM;
```

## Step 4: Update ABI (if needed)

If your smart contracts have different functions or parameters, update the ABI in `app/ABI/abi.ts`. The current ABI is for a Thirdweb NFT Drop contract.

## Step 5: Run the Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 6: Build for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure Overview

```
PARA-Wallet-Latest/
├── app/
│   ├── ABI/                    # Smart contract ABI
│   ├── api/                    # API routes
│   ├── Claim/                  # Claim functionality
│   ├── Components/             # React components
│   ├── Config/                 # Configuration files
│   ├── Context/                # React context providers
│   ├── DailyCheck/             # Daily check functionality
│   └── [id]/                   # Dynamic routes
├── lib/
│   ├── firebase.js            # Firebase configuration
│   └── mongodb.ts             # MongoDB connection
├── models/                     # MongoDB models
└── public/                     # Static assets
```

## Key Features

- **Wallet Connection**: Uses Reown AppKit for wallet connectivity
- **Firebase Integration**: Stores user scores and data
- **MongoDB**: Tracks wallet connections and user data
- **Smart Contract Interaction**: Claims and purchases NFTs
- **Daily Check System**: Gamified daily engagement

## Troubleshooting

### Common Issues:

1. **Firebase Connection Error**:
   - Verify all Firebase environment variables are correct
   - Check if your Firebase project has Firestore enabled

2. **MongoDB Connection Error**:
   - Verify your MongoDB connection string
   - Ensure your IP is whitelisted in MongoDB Atlas

3. **Smart Contract Errors**:
   - Verify contract addresses are correct
   - Ensure contracts are deployed on the correct network (Basecamp Testnet)
   - Check if you have sufficient funds for transactions

4. **Wallet Connection Issues**:
   - Ensure you're using a compatible wallet
   - Check if the Reown Project ID is valid

### Network Configuration:

The project is configured to use **Basecamp Testnet**. If you need to change networks, update the configuration in `app/Config/index.tsx`:

```typescript
import { yourNetwork } from '@reown/appkit/networks'

export const networks = [yourNetwork]
```

## Deployment

### Vercel Deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms:

The project can be deployed to any platform that supports Next.js applications. Make sure to:
- Set all environment variables
- Configure build settings for Next.js
- Set the Node.js version to 18 or higher

## Security Notes

- Never commit `.env.local` files to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys and connection strings
- Monitor smart contract interactions for security

## Support

For issues related to:
- **Reown AppKit**: Check [Reown Documentation](https://docs.reown.com)
- **Firebase**: Check [Firebase Documentation](https://firebase.google.com/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **Wagmi**: Check [Wagmi Documentation](https://wagmi.sh) 