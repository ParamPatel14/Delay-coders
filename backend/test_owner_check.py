from eth_account import Account
from app.services import blockchain
import os

def main():
    key = None
    path = os.path.join(os.path.dirname(__file__), "..", "blockchain", ".env")
    path = os.path.abspath(path)
    if os.path.exists(path):
        with open(path, "r") as f:
            for line in f:
                if line.strip().startswith("PRIVATE_KEY="):
                    key = line.strip().split("=", 1)[1]
                    break
    if key and not key.startswith("0x"):
        key = "0x" + key
    addr = Account.from_key(key).address if key else None
    print("deployer_addr", addr)
    try:
        owner = blockchain.get_owner()
        print("contract_owner", owner)
    except Exception as e:
        print("owner_fetch_error", str(e))

if __name__ == "__main__":
    main()
