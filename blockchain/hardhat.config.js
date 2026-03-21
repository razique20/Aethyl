require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ...(SEPOLIA_RPC_URL !== "" ? {
      sepolia: {
        url: SEPOLIA_RPC_URL,
        accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
      },
    } : {}),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
