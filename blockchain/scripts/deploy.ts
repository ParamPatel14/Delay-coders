import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const bal = await deployer.provider!.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(bal));

  const EcoBadge = await ethers.getContractFactory("EcoBadge");
  const eco = await EcoBadge.deploy();
  await eco.waitForDeployment();

  console.log("EcoBadge deployed at:", await eco.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
