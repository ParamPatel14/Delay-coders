import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

async function main() {
  const url = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
  const pk = process.env.PRIVATE_KEY;
  const addr = process.env.CONTRACT_ADDRESS || process.argv[2];
  if (!pk) {
    console.log("PRIVATE_KEY missing in env");
    return;
  }
  if (!addr) {
    console.log("Provide CONTRACT_ADDRESS in env or as CLI arg");
    return;
  }
  const provider = new ethers.JsonRpcProvider(url, 80002);
  const wallet = new ethers.Wallet(pk, provider);
  const network = await provider.getNetwork();
  const block = await provider.getBlockNumber();
  console.log("Network:", network.chainId);
  console.log("Block:", block);
  const artifactPath = path.resolve(__dirname, "..", "artifacts", "contracts", "EcoBadge.sol", "EcoBadge.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const eco = new ethers.Contract(addr, artifact.abi, wallet);
  const before = await eco.points(wallet.address);
  console.log("Points before:", before.toString());
  const tx = await eco.awardPoints(wallet.address, 7n);
  console.log("Sent awardPoints tx:", tx.hash);
  const receipt = await tx.wait();
  console.log("Mined in block:", receipt.blockNumber);
  const after = await eco.points(wallet.address);
  console.log("Points after:", after.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
