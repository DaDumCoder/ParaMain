# Configuration Reference

## Current Configuration Values

### Firebase Configuration
- **API Key**: Set in `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Auth Domain**: Set in `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- **Project ID**: Set in `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **Storage Bucket**: Set in `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- **Messaging Sender ID**: Set in `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- **App ID**: Set in `NEXT_PUBLIC_FIREBASE_APP_ID`

### MongoDB Configuration
- **Connection String**: Set in `MONGODB_URI`

### Third-Party Services
- **Para API Key**: `cbaab0dbc16b98e540bb4b6d5322c6f1` (hardcoded in `app/client/para.ts`)
- **Reown Project ID**: `c70d056e9a9018d033c2195ba5aa5bf6` (hardcoded in `app/Config/index.tsx`)

## Smart Contract Addresses

### Current Addresses (Basecamp Testnet)

| Contract Type | Address | File Location |
|---------------|---------|---------------|
| Main Claim | `0x7917B4D4071AfdF7BB69bc65c423C3613Cd05c73` | `app/[id]/page.tsx:110`<br>`app/DailyCheck/page.tsx:113` |
| Claim | `0xCE2d19b5d9F4b93fC58c9d0Ab79D110055Ba54C3` | `app/Claim/page.tsx:395` |
| Purchase | `0xA10c4F558a15856223FdC292C547d96782F8A9dc` | `app/Claim/page.tsx:510` |

### Network Configuration
- **Network**: Basecamp Testnet
- **Configuration File**: `app/Config/index.tsx`

## Quick Update Commands

### Update Contract Addresses

```bash
# Search for all contract addresses
grep -r "0x" app/ --include="*.tsx" --include="*.ts" | grep -E "(contractAddress|contractAddress)"

# Replace contract addresses (example)
sed -i '' 's/0x7917B4D4071AfdF7BB69bc65c423C3613Cd05c73/YOUR_NEW_ADDRESS/g' app/[id]/page.tsx
sed -i '' 's/0x7917B4D4071AfdF7BB69bc65c423C3613Cd05c73/YOUR_NEW_ADDRESS/g' app/DailyCheck/page.tsx
sed -i '' 's/0xCE2d19b5d9F4b93fC58c9d0Ab79D110055Ba54C3/YOUR_NEW_CLAIM_ADDRESS/g' app/Claim/page.tsx
sed -i '' 's/0xA10c4F558a15856223FdC292C547d96782F8A9dc/YOUR_NEW_PURCHASE_ADDRESS/g' app/Claim/page.tsx
```

### Environment Variables Template

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# MongoDB
MONGODB_URI=

# Optional: Contract Addresses (if using environment variables)
NEXT_PUBLIC_MAIN_CLAIM_CONTRACT=
NEXT_PUBLIC_CLAIM_CONTRACT=
NEXT_PUBLIC_PURCHASE_CONTRACT=
```

## File Locations for Key Configuration

| Configuration | File | Line/Description |
|---------------|------|------------------|
| Firebase Config | `lib/firebase.js` | Environment variables |
| MongoDB Config | `lib/mongodb.ts` | Environment variables |
| Wagmi/Reown Config | `app/Config/index.tsx` | Hardcoded project ID |
| Para Config | `app/client/para.ts` | Hardcoded API key |
| Contract ABI | `app/ABI/abi.ts` | Thirdweb NFT Drop ABI |
| Contract Addresses | Multiple files | See table above |

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Network Information

- **Current Network**: Basecamp Testnet
- **Chain ID**: Check Reown documentation
- **RPC URL**: Provided by Reown AppKit
- **Block Explorer**: Check Reown documentation

## Dependencies

Key dependencies from `package.json`:
- `@getpara/react-sdk`: ^1.16.0
- `@reown/appkit-adapter-wagmi`: ^1.7.6
- `firebase`: ^11.10.0
- `mongodb`: ^6.17.0
- `mongoose`: ^8.15.1
- `next`: 15.3.2
- `react`: ^19.0.0
- `react-dom`: ^19.0.0 