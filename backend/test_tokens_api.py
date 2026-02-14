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
    rb = requests.get("http://localhost:8000/tokens/balance", headers=headers)
    print("balance", rb.status_code, rb.json())
    rh = requests.get("http://localhost:8000/tokens/history", headers=headers)
    print("history", rh.status_code, rh.json())

if __name__ == "__main__":
    main()
