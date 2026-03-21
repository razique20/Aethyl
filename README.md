# 🌌 Aethyl

**Aethyl** is a premium, fully decentralized freelance marketplace built on the Ethereum blockchain. It eliminates middlemen, ensures secure escrow, and guarantees instant, trustless payments for freelancers and clients worldwide through the power of smart contracts.

---

## 🚀 The Project
Traditional freelance platforms charge exorbitant fees, arbitrate disputes poorly, and hold funds hostage. Aethyl was created to solve these problems by moving the entire freelance workflow—from job posting and bidding to escrow and final payment—onto the blockchain. 

### Core Features
- **Decentralized Escrow**: Funds are locked in a smart contract upon hiring. Neither party can run away with the money until the agreed-upon conditions are met.
- **On-Chain Profiles**: User profiles (Name, Bio, Skills, Location) are stored entirely decentralized and retrieved dynamically.
- **Zero Middlemen**: Direct peer-to-peer interactions via Web3 wallets (MetaMask, RainbowKit, etc.).
- **Dynamic Bidding**: Freelancers can submit competitive bids with their terms directly against the client's job posting.
- **Aethyl Insights (Blogs)**: A dedicated space for community insights, platform updates, and Web3 resources, fully integrated into the home timeline.

---

## 🎨 Design & Theme
Aethyl is designed with a premium, glassmorphism-inspired aesthetic aimed at high-end creators and developers.

- **Dark Mode First**: The platform features a customized deep-space dark theme (`#020617` and pure black `#000000`) for an immersive, modern experience.
- **Premium Typography**: Uses modern, sleek typography. **Plus Jakarta Sans** serves as a highly legible, dense body font, while **Outfit** provides striking and bold structural headings.
- **Styling Engine**: Built entirely on **Tailwind CSS v4** utilizing advanced CSS variables, dynamic mesh gradients, and precise glass-card utilities for floating components.

---

## ⚙️ Tech Stack
- **Frontend Core**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide React Icons
- **Web3 Integration**: Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity, Hardhat
- **Network**: Ethereum Sepolia Testnet

---

## 🔄 Workflow

### 1. Client Posts a Job
A client connects their Web3 wallet and posts a job. The job details, including the exact budget in ETH and required skills, are recorded on the Ethereum blockchain via the `createJob` function.

### 2. Freelancers Submit Quotes
Freelancers browse the active jobs and submit their quotes (bids). They propose their conditions and demonstrate their capability for the project using the decentralized quote system.

### 3. Escrow & Hiring
The client reviews the submitted quotes and selects a freelancer. Upon hiring, the client deposits the exact job amount into the Aethyl Escrow Smart Contract. The funds are securely locked and verified on-chain.

### 4. Work Delivery & Payment
Once the freelancer completes the work, the client approves the deliverables. The smart contract immediately and immutably releases the funds directly to the freelancer's wallet. If a dispute arises, the contract's structure natively handles resolutions transparently.

---

## 🛠 Getting Started

### Prerequisites
- Node.js v18+
- MetaMask Wallet (connected to Sepolia Testnet)
- Alchemy/Infura RPC Key (for deployment)

### Local Development
1. Clone the repository and install dependencies:
```bash
cd frontend
npm install
```
2. Set up environment variables locally for your Web3 Provider (`.env.local`).
3. Start the Next.js development server (Webpack recommended for ARM64):
```bash
npm run dev
```

### Smart Contract Deployment
1. Navigate to the `blockchain` directory:
```bash
cd blockchain
npm install
```
2. Compile and deploy the contracts to the Sepolia Testnet:
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

---
*Built for the future of decentralized work.*
