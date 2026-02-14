from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas, utils
from ..config import settings

DEFAULT_ADMIN_EMAIL = "parampraman59@gmail.com"

def admin_login(db: Session, email: str, password: str) -> str:
    if email.lower() != DEFAULT_ADMIN_EMAIL.lower():
        raise ValueError("Unauthorized")
    rec = db.query(models.Admin).filter(models.Admin.email == email).first()
    if not rec:
        hashed = utils.get_password_hash(password)
        rec = models.Admin(email=email, password_hash=hashed, role="SUPER_ADMIN")
        db.add(rec)
        db.commit()
        db.refresh(rec)
    else:
        if not utils.verify_password(password, rec.password_hash):
            raise ValueError("Incorrect password")
    exp = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = utils.create_access_token(data={"sub": rec.email, "scope": "admin", "role": rec.role}, expires_delta=exp)
    return token

def admin_authenticate(db: Session, email: str) -> models.Admin | None:
    return db.query(models.Admin).filter(models.Admin.email == email).first()
