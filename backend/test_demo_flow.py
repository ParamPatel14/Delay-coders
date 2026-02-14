from app.database import SessionLocal
from app.utils import create_access_token
from app.models import User
from datetime import timedelta
import requests

def main():
    db = SessionLocal()
    u = db.query(User).first()
    db.close()
    token = create_access_token(data={"sub": u.email}, expires_delta=timedelta(minutes=30))
    headers = {"Authorization": f"Bearer {token}"}
    print("award", requests.post("http://localhost:8000/eco-points/award-demo", json={"points": 200}, headers=headers).status_code)
    print("convert", requests.post("http://localhost:8000/eco-points/convert", json={}, headers=headers).status_code)
    print("balance", requests.get("http://localhost:8000/tokens/balance", headers=headers).json())
    print("history", requests.get("http://localhost:8000/tokens/history", headers=headers).json())

if __name__ == "__main__":
    main()
