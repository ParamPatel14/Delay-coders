# GreenzAction Blockchain (Hardhat)

Project uses Hardhat + ethers.js targeting Polygon **Amoy** testnet.

## Setup
1. Copy `.env.example` to `.env` and fill values:
   - `AMOY_RPC_URL` (Alchemy recommended)  
   - `PRIVATE_KEY` (MetaMask account)  
   - `POLYGONSCAN_API_KEY` (optional for verify)

2. Install dependencies:
   ```
   npm install
   ```

3. Compile:
   ```
   npm run compile
   ```

## Useful
- Check balance:
  ```
  npm run balance
  ```
- Deploy to Amoy:
  ```
  npm run deploy:amoy
  ```
- Verify (after deploy):
  ```
  npm run verify:amoy <contract_address>
  ```

## Notes
- Amoy chainId: `80002`
- Alchemy Amoy endpoint format: `https://polygon-amoy.g.alchemy.com/v2/<API_KEY>`
- Public RPC alternative: `https://rpc-amoy.polygon.technology`
