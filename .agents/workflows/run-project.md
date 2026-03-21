---
description: Automated steps to set up and run the ProofLance project.
---

# ProofLance Workflow

Follow these steps to get the decentralized marketplace running locally.

### 1. Initialize Dependencies
// turbo
Run this to install all necessary packages for both blockchain and frontend.
```bash
cd blockchain && npm install --legacy-peer-deps && cd ../frontend && npm install
```

### 2. Start Local Blockchain Node
Run the Hardhat node to simulate the Ethereum network.
```bash
cd blockchain && npx hardhat node
```
*Note: You must keep this terminal open.*

### 3. Deploy Smart Contract
// turbo
Deploy the ProofLanceEscrow contract to your local node.
```bash
cd blockchain && npx hardhat run scripts/deploy.cjs --network localhost
```

### 4. Launch Frontend
// turbo
Start the Next.js development server.
```bash
cd frontend && npm run dev
```

### 5. Open in Browser
Visit the app at [http://localhost:3000](http://localhost:3000).
