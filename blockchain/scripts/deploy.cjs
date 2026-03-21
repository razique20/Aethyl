const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const Aethyl = await hre.ethers.getContractFactory("Aethyl");
  const escrow = await Aethyl.deploy();

  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("Aethyl deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
