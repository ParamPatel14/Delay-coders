import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const bal = await deployer.provider!.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(bal));

  const EcoToken = await ethers.getContractFactory("EcoToken");
  const token = await EcoToken.deploy();
  await token.waitForDeployment();
  console.log("EcoToken deployed at:", await token.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
