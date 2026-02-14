from ..config import settings
import os
from decimal import Decimal

ABI = [
    {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
]

def _get_token_address():
    if settings.CARBON_CREDIT_TOKEN_ADDRESS:
        return settings.CARBON_CREDIT_TOKEN_ADDRESS
    base = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    dep = os.path.join(base, "blockchain", "deployments", "carbon_credit_token_amoy.json")
    if os.path.exists(dep):
        import json
        with open(dep, "r") as f:
            return json.load(f).get("address")
    return None

def _get_owner_key():
    key = settings.CARBON_CREDIT_OWNER_PRIVATE_KEY
    if key:
        return key if key.startswith("0x") else "0x" + key
    try:
        path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "blockchain", ".env")
        if os.path.exists(path):
            with open(path, "r") as f:
                for line in f:
                    if line.strip().startswith("PRIVATE_KEY="):
                        k = line.strip().split("=", 1)[1]
                        return k if k.startswith("0x") else "0x" + k
    except Exception:
        pass
    return None

def get_w3():
    from web3 import Web3
    url = settings.CHAIN_RPC_URL or "https://rpc-amoy.polygon.technology"
    return Web3(Web3.HTTPProvider(url))

def get_contract(w3):
    from web3 import Web3
    addr = _get_token_address()
    if not addr:
        raise Exception("CarbonCreditToken address not configured")
    return w3.eth.contract(address=Web3.to_checksum_address(addr), abi=ABI)

def get_credit_balance(address: str) -> Decimal:
    if settings.ECO_TOKEN_DEMO_MODE:
        return Decimal(0)
    w3 = get_w3()
    c = get_contract(w3)
    bal = c.functions.balanceOf(Web3.to_checksum_address(address)).call()
    return Decimal(bal) / Decimal(10**18)

def mint_carbon_credit(to_address: str, amount_tokens: Decimal):
    if settings.ECO_TOKEN_DEMO_MODE:
        return {"tx_hash": "0x" + os.urandom(32).hex(), "block_number": 0}
    w3 = get_w3()
    c = get_contract(w3)
    key = _get_owner_key()
    if not key:
        raise Exception("Owner key not configured")
    from eth_account import Account
    acct = Account.from_key(key)
    from web3 import Web3
    amount_wei = int(amount_tokens * Decimal(10**18))
    tx = c.functions.mint(Web3.to_checksum_address(to_address), amount_wei).build_transaction({
        "from": acct.address,
        "nonce": w3.eth.get_transaction_count(acct.address),
        "gas": 300000,
        "maxFeePerGas": w3.to_wei("10", "gwei"),
        "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
    })
    signed = w3.eth.account.sign_transaction(tx, private_key=key)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return {"tx_hash": tx_hash.hex(), "block_number": receipt.blockNumber}
