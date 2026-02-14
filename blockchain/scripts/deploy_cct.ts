import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const bal = await deployer.provider!.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(bal));

  const CCT = await ethers.getContractFactory("CarbonCreditToken");
  const token = await CCT.deploy();
  await token.waitForDeployment();
  const addr = await token.getAddress();
  console.log("CarbonCreditToken deployed at:", addr);
  const dir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const file = path.join(dir, `carbon_credit_token_${hre.network.name}.json`);
  fs.writeFileSync(file, JSON.stringify({
    address: addr,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString()
  }, null, 2));
  console.log("Saved deployment:", file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
