# 🌌 FrethiX

**FrethiX** is a premium, fully decentralized freelance marketplace built on the Ethereum blockchain by **Aethyl**. It eliminates middlemen, ensures secure escrow, and guarantees instant, trustless payments for freelancers and clients worldwide through the power of smart contracts.

---

## 🚀 The Project
Traditional freelance platforms charge exorbitant fees, arbitrate disputes poorly, and hold funds hostage. FrethiX was created by Aethyl to solve these problems by moving the entire freelance workflow—from job posting and bidding to escrow and final payment—onto the blockchain. 

### Core Features
- **Decentralized Escrow**: Funds are locked in a smart contract upon hiring. Neither party can run away with the money until the agreed-upon conditions are met.
- **On-Chain Profiles**: Immutable professional identities (Name, Bio, Skills, Location) stored directly on the blockchain.
- **Dynamic Bidding**: A transparent quote system where freelancers propose terms, duration, and provide cryptographic proof of competence.
- **On-Chain Reviews**: Permanent, peer-to-peer 1-5 star ratings and text testimonials recorded after every successful milestone.
- **Arbitration Layer**: A built-in "Courthouse" for dispute resolution, where decentralized jurors and admins can vote to resolve conflicts.
- **FrethiX Journal**: A fully on-chain blog platform for industry insights and community updates.
- **Zero Middlemen**: Direct peer-to-peer interactions via Web3 wallets with no centralized authority taking hidden cuts.

---

## 🛠 Detailed Capabilities

### For Clients
- **Milestone Management**: Handle deadlines and delivery schedules with on-chain transparency.
- **Extension Requests**: Approve or deny freelancer requests for additional time directly via the contract.
- **Dispute Resolution**: Access a transparent courtroom if deliverables don't meet expectations.
- **Global Talent Pool**: Connect with verified developers and creators without geographical barriers.

### For Freelancers
- **Guaranteed Payment**: Funds are locked before you start working; no more chasing invoices.
- **Verifiable Reputation**: Build an immutable portfolio and rating history that belongs to you.
- **Instant Settlement**: ETH is released to your wallet the moment the client approves the work.
- **Verified Pro Badge**: Earn visual recognition for high-performance (3+ completed jobs).

---

## ⚙️ Tech Stack
- **Frontend Core**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (with dynamic mesh gradients), Framer Motion, Lucide Icons
- **Web3 Integration**: Wagmi v2, Viem, RainbowKit (Multi-wallet support)
- **Database**: MongoDB (for caching/indexing where applicable)
- **Smart Contracts**: Solidity v0.8.20, Hardhat
- **Network**: Ethereum Sepolia Testnet (Production-ready logic)

---

## 🔄 Workflow

### 1. Job Creation
A client posts a job defining title, category, budget, and required skills. This creates a state entry in the `Aethyl.sol` contract.

### 2. The Bidding Phase
Freelancers submit `Quotes` containing their proposed budget (in USD, converted to ETH), duration, and work evidence.

### 3. Funding & Escrow
The client selects a freelancer and funds the contract. The ETH is locked in the contract, and a hard deadline is established based on the accepted duration.

### 4. Extensions & Updates
Freelancers can request extra time if needed. Clients can approve these extensions, which dynamically updates the on-chain deadline.

### 5. Delivery & Resolution
- **Success**: Client approves the work, and the contract atomically releases funds + triggers the review phase.
- **Dispute**: Either party can trigger a dispute. Jurors/Admins then vote based on on-chain evidence to release funds to the rightful winner.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MetaMask Wallet (connected to Sepolia Testnet)
- Alchemy/Infura RPC Key

### Local Development
1. Clone the repository and install dependencies:
```bash
cd frontend
npm install
```
2. Set up `.env.local` with your `NEXT_PUBLIC_ALCHEMY_ID` and other keys.
3. Start the development server (Webpack recommended for ARM64):
```bash
npm run dev --webpack
```

### Smart Contract Deployment
1. Navigate to the `blockchain` directory:
```bash
cd blockchain
npm install
```
2. Compile and deploy:
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

### Admin Access
To access the administrative suite at `/admin`, your wallet address must be added to the `admins` mapping in the smart contract by the contract owner.

---
*Built for the future of decentralized work.*

