from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas, utils
from . import wallet_service, upi_service
from ..config import settings

def register_company(db: Session, data: schemas.CompanyCreate) -> models.Company:
    exists = db.query(models.Company).filter(models.Company.email == data.email).first()
    if exists:
        raise ValueError("Email already registered")
    hashed = utils.get_password_hash(data.password)
    rec = models.Company(
        email=data.email,
        hashed_password=hashed,
        name=data.name,
        wallet_address=data.wallet_address
    )
    db.add(rec)
    db.flush()
    acc = upi_service.get_or_create_default_merchant(db)
    wallet_service.create_wallet(db, "MERCHANT", rec.id, acc.vpa)
    db.commit()
    db.refresh(rec)
    return rec

def login_company(db: Session, email: str, password: str) -> str:
    comp = db.query(models.Company).filter(models.Company.email == email).first()
    if not comp or not comp.hashed_password or not utils.verify_password(password, comp.hashed_password):
        raise ValueError("Incorrect email or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = utils.create_access_token(data={"sub": email, "scope": "company"}, expires_delta=access_token_expires)
    return token

def authenticate_company(db: Session, email: str) -> models.Company | None:
    return db.query(models.Company).filter(models.Company.email == email).first()
