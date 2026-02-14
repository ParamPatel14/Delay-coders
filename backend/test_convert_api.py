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
    r = requests.post("http://localhost:8000/eco-points/convert", json={}, headers=headers)
    print("convert", r.status_code, r.text)

if __name__ == "__main__":
    main()
