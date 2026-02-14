import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

async function main() {
  const url = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
  const pk = process.env.PRIVATE_KEY;
  const addr = process.env.CONTRACT_ADDRESS || process.argv[2];
  const to = process.env.MINT_TO || process.argv[3];
  const amountStr = process.env.MINT_AMOUNT || process.argv[4] || "1";
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
  const artifactPath = path.resolve(__dirname, "..", "artifacts", "contracts", "CarbonCreditToken.sol", "CarbonCreditToken.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const token = new ethers.Contract(addr, artifact.abi, wallet);
  const toAddr = to || wallet.address;
  const amount = ethers.parseUnits(amountStr, 18);
  const before = await token.balanceOf(toAddr);
  console.log("Balance before:", ethers.formatUnits(before, 18));
  const tx = await token.mint(toAddr, amount);
  console.log("Mint tx:", tx.hash);
  const receipt = await tx.wait();
  console.log("Mined in block:", receipt.blockNumber);
  const after = await token.balanceOf(toAddr);
  console.log("Balance after:", ethers.formatUnits(after, 18));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
