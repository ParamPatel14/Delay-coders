from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from .. import models, schemas
from ..database import get_db
from ..config import settings
from ..services import company_auth_service
from ..database import get_db

router = APIRouter(prefix="/companies", tags=["companies"])

@router.post("/register", response_model=schemas.CompanyOut)
def register_company(data: schemas.CompanyCreate, db: Session = Depends(get_db)):
    try:
        rec = company_auth_service.register_company(db, data)
        return rec
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.Token)
def login_company(data: schemas.CompanyLogin, db: Session = Depends(get_db)):
    try:
        token = company_auth_service.login_company(db, data.email, data.password)
        return {"access_token": token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

def get_current_company(token: str, db: Session) -> models.Company:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        scope: str = payload.get("scope")
        if email is None or scope != "company":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    comp = company_auth_service.authenticate_company(db, email)
    if not comp:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Company not found")
    return comp

@router.get("/me", response_model=schemas.CompanyOut)
def me(token: str, db: Session = Depends(get_db)):
    comp = get_current_company(token, db)
    return comp

def _is_valid_address(addr: str) -> bool:
    if not isinstance(addr, str):
        return False
    if not addr.startswith("0x") or len(addr) != 42:
        return False
    try:
        int(addr[2:], 16)
        return True
    except ValueError:
        return False

@router.post("/connect-wallet")
def connect_wallet(payload: dict, token: str, db: Session = Depends(get_db)):
    comp = get_current_company(token, db)
    address = payload.get("wallet_address")
    if not address or not _is_valid_address(address):
        raise HTTPException(status_code=400, detail="Invalid wallet address")
    rec = db.query(models.CompanyWallet).filter(models.CompanyWallet.company_id == comp.id).first()
    if not rec:
        rec = models.CompanyWallet(company_id=comp.id, wallet_address=address)
    else:
        rec.wallet_address = address
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"wallet_address": rec.wallet_address}
