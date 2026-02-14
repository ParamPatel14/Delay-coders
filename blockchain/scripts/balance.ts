import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const url = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.log("PRIVATE_KEY missing in env");
    return;
  }
  const provider = new ethers.JsonRpcProvider(url, 80002);
  const wallet = new ethers.Wallet(pk, provider);
  const bal = await provider.getBalance(wallet.address);
  console.log("Address:", wallet.address);
  console.log("Balance (POL):", ethers.formatEther(bal));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
