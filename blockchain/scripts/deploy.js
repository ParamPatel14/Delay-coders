const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal));

  const EcoToken = await hre.ethers.getContractFactory("EcoToken");
  const token = await EcoToken.deploy();
  await token.waitForDeployment();
  const addr = await token.getAddress();
  console.log("EcoToken deployed at:", addr);

  const dir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const file = path.join(dir, `eco_token_${hre.network.name}.json`);
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
