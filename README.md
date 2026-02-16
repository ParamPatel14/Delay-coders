# GreenZaction – Delay Coders Sustainability Platform

GreenZaction is an end‑to‑end sustainability platform built by **Delay Coders**.  
It connects everyday payments, carbon tracking, rewards, and blockchain into one experience for:

- Users who want to see their climate impact and earn eco‑rewards
- Merchants who want a green‑aware payments and QR experience
- Admins and companies who need dashboards and controls

This repository is a monorepo containing:

- A **FastAPI** backend for carbon tracking, eco‑points, gamification, payments, wallets, and company/admin APIs
- A **React + Vite** frontend for user, merchant, and admin portals
- A **Hardhat** blockchain workspace for Polygon Amoy smart contracts (eco tokens, badges, carbon credits)

---

## 1. Project Structure

At the root:

- `backend/` – FastAPI app (`GreenZaction API`) with PostgreSQL, custom payments, wallets, and blockchain integration
- `frontend/` – React single‑page app using Vite, Tailwind, React Router, and axios
- `blockchain/` – Hardhat + ethers.js project for Polygon Amoy smart contracts

High‑level roles and flows:

- **End‑users** – earn eco‑points by recording low‑carbon activities and transactions, then convert to on‑chain eco tokens and carbon credits.
- **Companies / Merchants** – manage their own dashboard, generate merchant QRs, view aggregated impact, and accept UPI‑style payments.
- **Admins** – manage users, companies, marketplace listings, and inspect overall system health from an admin panel.

---

## 2. What the Platform Does

### 2.1 Core Concepts

- **Eco Points**  
  Users earn eco‑points for eco‑friendly activities and transactions. Points are tracked in the backend (`EcoPointsTransaction`, `EcoPointsBalance`) and power:
  - User levels (Beginner and higher tiers)
  - Badges and challenges
  - Conversion to on‑chain tokens

- **Gamification**  
  The backend awards:
  - **Badges** – e.g. first transaction, eco saver, carbon champion
  - **Challenges** – progressive goals with rewards
  - **Streaks and levels** – maintained by gamification services

- **Eco Tokens & Carbon Credits (Blockchain)**  
  - ERC‑20‑style tokens (`EcoToken`, `CarbonCreditToken`) and badges (`EcoBadge`) on Polygon Amoy.
  - Backend uses Web3 via `CHAIN_RPC_URL`, `ECO_TOKEN_ADDRESS`, `CARBON_CREDIT_TOKEN_ADDRESS` to mint tokens and query balances.
  - Carbon savings can be converted into on‑chain carbon credit tokens using configurable ratios (`CARBON_CREDIT_KG_PER_CREDIT`, etc.).

- **Marketplace & Payments**  
  - Custom in‑app payment flow (GreenZaction Pay) for fiat payments, including UPI‑style wallets and QR flows.
  - Marketplace APIs allow listing, pricing, and purchasing of eco‑related items or bundles.
 
 ### 2.2 Backend Features (FastAPI)
 
The backend exposes REST APIs, grouped by routers:
- `auth` – user authentication (email/password + optional Google OAuth)
- `transactions` – record transactions and derive carbon impact + points
- `emissions` / `carbon` – emission factors and carbon calculations
- `eco-points` – earn, track, and convert eco‑points
- `achievements` / `gamification` – badges, challenges, levels, streaks
- `dashboard` – aggregated user dashboard summary (recent activity, badges, leaderboard, etc.)
- `wallet` / `wallets` / `tokens` / `blockchain` / `carbon-credits` – wallet integration, UPI wallets, and blockchain interactions
- `companies` – company registration, authentication, and company‑level data
- `marketplace` – marketplace listings and purchases (integrated with payments)
- `admin` – admin‑only endpoints for managing entities and inspecting the system
- `merchant-orders` / `upi` – merchant QR order generation, UPI pay, scan‑and‑pay, and UPI history
 
 The app is configured via `app/config.py` using environment variables (see Setup below).
 
### 2.3 Frontend Features (React + Vite)

The frontend is a SPA served by Vite and talks to the backend via axios:

- **Authentication flows**
  - User login / register
  - Company login / register
  - Admin login

- **User Dashboard** (`Dashboard.jsx`)
  - Overview metrics from `/dashboard/summary`
  - Recent transactions and carbon records
  - Rewards, badges, challenges, and leaderboard
  - Wallet, UPI, and token panels
  - Animated layout built with framer‑motion

- **Company Portal**
  - Company login and dashboard components under `Company*` files
  - Company view into aggregated impact and activity
  - Merchant POS, realistic item catalog, and QR generation with carbon/eco‑points preview

- **Admin Panel**
  - Admin login and panel components (`AdminLogin`, `AdminPanel`)
  - Manage users, companies, and high‑level settings via admin APIs

- **Payments & Marketplace**
  - Dedicated payment pages (`Payment`, `PaymentsHub`) calling backend `/payments` and `/marketplace` routes
  - Public marketplace view (`MarketplacePublic`) for browsing offerings

UI is styled primarily via Tailwind utility classes, lucide‑react icons, and framer‑motion on key dashboards.
 
### 2.4 Blockchain Workspace (Hardhat)

The `blockchain/` folder contains:
- Solidity contracts:
  - `EcoToken.sol` – ERC‑20‑like token for eco points on‑chain
  - `EcoBadge.sol` – NFT/badge contract
  - `CarbonCreditToken.sol` – token representing carbon credits
- Hardhat scripts under `scripts/` for:
  - Deploying contracts (`deploy.ts`, `deploy_cct.ts`, etc.)
  - Minting tokens (`mint_token.ts`, `mint_cct.ts`)
  - Checking balances (`balance.ts`)

The backend reads from `blockchain/deployments/*.json` (e.g. `eco_token_polygon.json`) or environment variables to discover on‑chain addresses.

### 2.5 Merchant UPI QR Flow (High Level)

The platform includes a merchant‑style UPI wallet flow:

- Merchants create QR‑coded orders via `POST /merchant/orders/generate-qr`.  
  The QR payload contains the merchant UPI ID, merchant ID, order ID, amount, and optional item list. A `MerchantOrder` row is created or updated.
- Users pay either by entering UPI IDs directly (`POST /upi/pay`) or by scanning the merchant QR (`POST /upi/scan-and-pay`).  
  Both paths move balance between UPI wallets and mark the merchant order as paid when applicable.
- Every successful UPI QR payment (`/upi/scan-and-pay`) also:
  - Creates a core `Transaction` entry
  - Calculates and records carbon impact
  - Awards eco‑points and applies reward rules and badges
  - Can auto‑convert eco‑points to on‑chain tokens when thresholds and blockchain configuration are set
- UPI transaction history is available via:
  - `GET /upi/transactions/user` – history for the current user’s UPI VPA
  - `GET /upi/transactions/merchant` – history for the default merchant UPI account

---

## 3. Technology Stack
 
 - **Backend**
   - Python, FastAPI
   - SQLAlchemy ORM with PostgreSQL (via `psycopg2-binary`)
   - JWT auth using `python-jose`
   - Pydantic + pydantic‑settings for config
   - Web3.py + `eth-account` for blockchain calls
 
 - **Frontend**
   - React 18+ with Vite
   - React Router
   - axios for API calls (`src/api/axios.js`)
   - Tailwind CSS 4
   - lucide‑react icons
 
 - **Blockchain**
   - Hardhat
   - ethers.js
   - TypeScript scripts
   - Polygon Amoy testnet
 
 ---
 
 ## 4. Local Development – Quick Start
 
 ### 4.1 Prerequisites
 
 - Node.js (LTS)
 - Python 3.10+ (recommended)
 - PostgreSQL database
 - Optional but recommended:
   - Polygon Amoy RPC endpoint (Alchemy or similar)
   - MetaMask wallet for interacting with tokens
 
 ### 4.2 Backend Setup (`backend/`)
 
 1. Create and activate a virtual environment:
 
    ```bash
    cd backend
    python -m venv venv
    # Windows PowerShell
    venv\Scripts\Activate
    ```
 
 2. Install dependencies:
 
    ```bash
    pip install -r requirements.txt
    ```
 
 3. Create `.env` in `backend/` (based on `app/config.py` fields):
 
    ```env
    DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/greenzaction
    SECRET_KEY=change-me
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    DB_POOL_SIZE=5
    DB_MAX_OVERFLOW=10
    DB_POOL_TIMEOUT=30
    DB_POOL_PRE_PING=true
    DB_SSLMODE=prefer
    
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
 
    CHAIN_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/your-key
    ECO_TOKEN_ADDRESS=0x...
    ECO_TOKEN_OWNER_PRIVATE_KEY=0x...
    ECO_TOKEN_CONVERSION_RATE=1.0
    ECO_TOKEN_AUTO_THRESHOLD=100
    ECO_TOKEN_DEMO_MODE=true
    CARBON_CREDIT_KG_PER_CREDIT=1000.0
    CARBON_CREDIT_TOKEN_ADDRESS=0x...
    CARBON_CREDIT_OWNER_PRIVATE_KEY=0x...
    ```
 
    Notes:
    - You can start without blockchain by leaving the related values as placeholders, but any endpoints that depend on them will fail until configured.
 
 4. Ensure PostgreSQL is running and the `DATABASE_URL` points to a valid database.
 
 5. Run the backend:
 
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
 
    - Tables are created automatically (`models.Base.metadata.create_all(bind=engine)`).
    - On startup, emission factors, default badges, challenges, and demo marketplace listings are seeded.
 
 6. Optional: run demo scripts/tests from the backend root (they call the running API):
 
    ```bash
    python test_demo_flow.py
    python test_convert_api.py
    python test_blockchain_api.py
    ```
 
 ### 4.3 Frontend Setup (`frontend/`)
 
 1. Install dependencies:
 
    ```bash
    cd frontend
    npm install
    ```
 
 2. Configure the API base URL if needed in [`src/api/axios.js`](file:///c:/Projects/Delay-coders/frontend/src/api/axios.js):
    - By default, it usually points to `http://localhost:8000`.
 
 3. Run the dev server:
 
    ```bash
    npm run dev
    ```
 
 4. Open the app in the browser at the URL shown (typically `http://localhost:5173`).
 
 5. Available flows:
    - User register/login → Dashboard
    - Company register/login → Company panel
    - Admin login → Admin panel
    - Payments and marketplace pages via navigation buttons in the dashboard
 
 ### 4.4 Blockchain Setup (`blockchain/`)
 
 For full on‑chain integration (tokens and carbon credits):
 
 1. Follow the detailed instructions in [`blockchain/README.md`](file:///c:/Projects/Delay-coders/blockchain/README.md).
 
 2. After deploying contracts to Polygon Amoy, update:
    - `blockchain/deployments/*.json` files, and/or
    - Backend `.env` contract address variables:
      - `ECO_TOKEN_ADDRESS`
      - `CARBON_CREDIT_TOKEN_ADDRESS`
 
 3. Make sure `CHAIN_RPC_URL` and owner private keys are set in the backend `.env`.
 
 4. Restart the backend so it picks up the new configuration.
 
 ---
 
 ## 5. Running Everything Together
 
 Basic local dev workflow:
 - Start PostgreSQL.
 - Start the **backend** (`uvicorn app.main:app --reload --port 8000`).
 - Start the **frontend** (`npm run dev` inside `frontend/`).
 - Optionally run **blockchain** dev tasks from `blockchain/` (deploy, mint, check balance).
 
 Health checks:
 - Backend: `GET http://localhost:8000/health` → `{"status": "ok"}`
 - Frontend: load the dashboard/login in the browser.
 
 ---
 
 ## 6. Configuration Reference (Backend)
 
 From [`app/config.py`](file:///c:/Projects/Delay-coders/backend/app/config.py):
 
 - `DATABASE_URL` – PostgreSQL DSN
 - `SECRET_KEY` – JWT signing secret
 - `ALGORITHM` – JWT algorithm (default HS256)
 - `ACCESS_TOKEN_EXPIRE_MINUTES` – access token lifetime
 - `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_TIMEOUT`, `DB_POOL_PRE_PING`, `DB_SSLMODE` – DB pool tuning
 - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` – Google OAuth
 - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` – Razorpay API keys
 - `CHAIN_RPC_URL` – RPC endpoint for Polygon Amoy or other EVM chains
 - `ECO_TOKEN_ADDRESS`, `ECO_TOKEN_OWNER_PRIVATE_KEY` – Eco token contract and owner key
 - `ECO_TOKEN_CONVERSION_RATE`, `ECO_TOKEN_AUTO_THRESHOLD`, `ECO_TOKEN_DEMO_MODE` – eco token conversion behavior
 - `CARBON_CREDIT_KG_PER_CREDIT`, `CARBON_CREDIT_TOKEN_ADDRESS`, `CARBON_CREDIT_OWNER_PRIVATE_KEY` – carbon credit configuration
 
 ---
 
 ## 7. Testing and Linting
 
 - **Backend**
   - A set of integration/demo scripts exist under `backend/` (e.g. `test_demo_flow.py`, `test_convert_api.py`, `test_blockchain_api.py`).
   - You can expand this with pytest if desired.
 
 - **Frontend**
   - Lint:
 
     ```bash
     cd frontend
     npm run lint
     ```
 
 - **Blockchain**
   - Hardhat tasks and scripts are defined in [`blockchain/hardhat.config.ts`](file:///c:/Projects/Delay-coders/blockchain/hardhat.config.ts).
   - Common commands:
 
     ```bash
     cd blockchain
     npm install
     npx hardhat compile
     npx hardhat test
     ```
 
 ---
 
 ## 8. Notes and Limitations
 
 - Payment and blockchain features require valid external credentials; they will not work with placeholder keys.
 - The project is currently oriented toward **local development and demo flows**; production‑grade deployment (Docker, CI/CD, secrets management) is not covered in this README.
 - Authentication and authorization assume trusted origins configured in CORS (`http://localhost:5173`, `http://localhost:3000` by default).
 
