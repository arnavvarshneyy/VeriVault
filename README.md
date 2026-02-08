# VeriVault

A decentralized certificate verification platform built on Ethereum blockchain. VeriVault enables secure issuance, verification, and management of digital certificates using smart contracts and Web3 technology.

## 🌟 Features

- **Certificate Issuance**: Issue tamper-proof digital certificates on the blockchain
- **Instant Verification**: Verify certificate authenticity instantly using blockchain data
- **User Profiles**: Manage and view all issued certificates in user profiles
- **Web3 Integration**: Connect with MetaMask and other Web3 wallets
- **Decentralized Storage**: Certificate metadata stored securely on IPFS
- **Smart Contract Security**: Built with OpenZeppelin libraries for maximum security

## 🏗️ Architecture

### Smart Contracts
- **Certisure.sol**: Main contract handling certificate minting and verification
- Built with OpenZeppelin's ERC721 standard for NFT-based certificates
- Access control for authorized certificate issuers

### Backend API
- **Express.js** REST API server with TypeScript
- **IPFS Integration**: Pinata service for decentralized file storage
- **Blockchain Interaction**: Ethers.js for smart contract communication
- **File Upload**: Multer for handling certificate file uploads
- **Security**: SHA256 hashing for file integrity verification

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for modern, responsive styling
- **Wagmi & Viem** for Web3 wallet integration
- **React Query** for efficient data fetching

### Development Tools
- **Hardhat** for smart contract development and testing
- **TypeScript** for type safety across the entire stack

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Ethereum wallet with testnet ETH

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/arnavvarshneyy/VeriVault.git
cd VeriVault
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Set up environment variables**
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. **Configure environment**
Edit the following files with your configuration:
- `.env`: Root environment variables
- `backend/.env`: Backend API configuration (Pinata JWT, RPC URL, contract address)
- `frontend/.env`: Frontend configuration (API URL, contract address)

### Development

1. **Compile smart contracts**
```bash
npm run build
```

2. **Start backend server**
```bash
cd backend
npm run dev
```

3. **Run local blockchain** (in new terminal)
```bash
npx hardhat node
```

4. **Deploy contracts** (in new terminal)
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

5. **Start frontend development server** (in new terminal)
```bash
cd frontend
npm run dev
```

6. **Open your browser** and navigate to `http://localhost:5173`

## 📜 Smart Contract Functions

### Core Functions
- `issueCertificate(recipient, metadataURI)`: Issue a new certificate
- `verifyCertificate(tokenId)`: Verify certificate authenticity
- `getCertificate(tokenId)`: Get certificate details
- `getUserCertificates(address)`: Get all certificates for a user

### Access Control
- Only authorized addresses can issue certificates
- Certificate ownership follows ERC721 standard
- Transfer restrictions for certificate integrity

## � Backend API Endpoints

### File Management
- `POST /api/ipfs/upload`: Upload certificate files to IPFS
  - Request: `multipart/form-data` with file
  - Response: `{ cid, file_hash_sha256 }`

### Certificate Operations
- `GET /api/certificate/:tokenId`: Get certificate details from blockchain
- `GET /api/verify/:tokenId`: Verify certificate authenticity
- `GET /api/user/:address`: Get all certificates for a user

### Health Check
- `GET /health`: API health status

### Environment Variables (Backend)
```env
PORT=4000
PINATA_JWT=your_pinata_jwt_token
RPC_URL=https://your_ethereum_rpc_url
CONTRACT_ADDRESS=0x...
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## � Deployment

### Testnet Deployment
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.ts --network mainnet
```

### Backend Deployment
```bash
# Build backend
cd backend
npm run build

# Start production server
npm start
```

### Frontend Deployment
The frontend is configured for deployment on Vercel:

1. **Automatic Deployment**: Connected to Vercel for CI/CD
2. **Environment Variables**: Configure in Vercel dashboard
3. **Custom Domain**: Can be configured in Vercel settings

## 🌐 Live Demo

- **Frontend**: [Deployed on Vercel]
- **Backend API**: [Deployed API Endpoint]
- **Smart Contract**: [Etherscan Link]
- **Testnet**: Sepolia Testnet

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/Certisure.ts
```

## 📁 Project Structure

```
VeriVault/
├── contracts/              # Smart contract source files
│   └── Certisure.sol      # Main certificate contract
├── scripts/               # Deployment and utility scripts
│   └── deploy.ts         # Contract deployment script
├── test/                  # Smart contract tests
│   └── Certisure.ts      # Contract test suite
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── index.ts      # Main server file with API endpoints
│   │   └── pinata.ts     # IPFS/Pinata integration
│   ├── dist/             # Compiled TypeScript output
│   └── package.json      # Backend dependencies
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── abi/          # Contract ABI files
│   │   └── utils/        # Utility functions
│   ├── public/           # Static assets
│   └── dist/            # Build output
├── artifacts/            # Compiled contract artifacts
├── typechain-types/     # TypeScript contract types
├── hardhat.config.ts    # Hardhat configuration
└── package.json         # Root dependencies
```

## 🔧 Configuration

### Hardhat Configuration
- Networks: localhost, sepolia, mainnet
- Gas settings optimized for each network
- Etherscan verification configured

### Backend Configuration
- **Express Server**: TypeScript with hot reload in development
- **IPFS Integration**: Pinata for decentralized file storage
- **Security**: CORS enabled, file size limits, SHA256 hashing
- **Blockchain**: Ethers.js for contract interaction

### Frontend Configuration
- **Vite Build System**: Fast development and optimized builds
- **TailwindCSS**: Utility-first CSS framework
- **Web3 Integration**: Wagmi hooks for wallet connectivity
- **Environment Variables**: Separate configs for development/production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Docs]
- **Issues**: [GitHub Issues](https://github.com/arnavvarshneyy/VeriVault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arnavvarshneyy/VeriVault/discussions)

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Hardhat](https://hardhat.org/) for development framework
- [Vercel](https://vercel.com/) for hosting
- [Wagmi](https://wagmi.sh/) for Web3 React hooks

---

**Built with ❤️ for decentralized education and certification**
