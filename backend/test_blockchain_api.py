from app.database import SessionLocal
from app.utils import create_access_token
from app.models import User
from app.config import settings
from datetime import timedelta
import requests

def main():
    db = SessionLocal()
    u = db.query(User).first()
    db.close()
    token = create_access_token(data={"sub": u.email}, expires_delta=timedelta(minutes=30))
    headers = {"Authorization": f"Bearer {token}"}
    print("rpc", bool(settings.CHAIN_RPC_URL), "token", bool(settings.ECO_TOKEN_ADDRESS))
    r = requests.get("http://localhost:8000/blockchain/balance/0xBB8081fF9CC2f89aEfb8A4bE4a0511dB4473c582", headers=headers)
    print("balance", r.json())

if __name__ == "__main__":
    main()
