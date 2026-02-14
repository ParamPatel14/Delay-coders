from web3 import Web3
from eth_account import Account
from ..config import settings
import os

ABI = [
    {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
]

def get_w3():
    return Web3(Web3.HTTPProvider(settings.CHAIN_RPC_URL))

def get_contract(w3: Web3):
    addr = Web3.to_checksum_address(settings.ECO_TOKEN_ADDRESS)
    return w3.eth.contract(address=addr, abi=ABI)

def get_balance(address: str) -> int:
    w3 = get_w3()
    c = get_contract(w3)
    return c.functions.balanceOf(Web3.to_checksum_address(address)).call()

def get_owner() -> str:
    w3 = get_w3()
    c = get_contract(w3)
    return c.functions.owner().call()

def mint(to_address: str, amount_wei: int):
    w3 = get_w3()
    c = get_contract(w3)
    key = settings.ECO_TOKEN_OWNER_PRIVATE_KEY
    if not key:
        try:
            path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "blockchain", ".env")
            if os.path.exists(path):
                with open(path, "r") as f:
                    for line in f:
                        if line.strip().startswith("PRIVATE_KEY="):
                            key = line.strip().split("=", 1)[1]
                            break
        except Exception:
            key = None
    if not key:
        raise Exception("Owner key not configured")
    if not key.startswith("0x"):
        key = "0x" + key
    acct = Account.from_key(key)
    nonce = w3.eth.get_transaction_count(acct.address)
    gas = c.functions.mint(Web3.to_checksum_address(to_address), amount_wei).estimate_gas({"from": acct.address})
    tx = c.functions.mint(Web3.to_checksum_address(to_address), amount_wei).build_transaction({
        "from": acct.address,
        "nonce": nonce,
        "gas": gas,
        "gasPrice": w3.eth.gas_price,
        "chainId": w3.eth.chain_id
    })
    signed = acct.sign_transaction(tx)
    txh = w3.eth.send_raw_transaction(signed.rawTransaction)
    rcpt = w3.eth.wait_for_transaction_receipt(txh)
    return {"tx_hash": txh.hex(), "block_number": rcpt.blockNumber}
