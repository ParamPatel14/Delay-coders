from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from .. import models, schemas
from ..database import get_db
from ..config import settings
from ..services import admin_auth_service

router = APIRouter(prefix="/admin", tags=["admin"])

def get_current_admin(token: str, db: Session) -> models.Admin:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        scope: str = payload.get("scope")
        role: str = payload.get("role")
        if scope != "admin" or not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    rec = admin_auth_service.admin_authenticate(db, email)
    if not rec:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return rec

@router.post("/login", response_model=schemas.Token)
def login_admin(data: schemas.AdminLogin, db: Session = Depends(get_db)):
    try:
        t = admin_auth_service.admin_login(db, data.email, data.password)
        return {"access_token": t, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=schemas.AdminOut)
def admin_me(token: str, db: Session = Depends(get_db)):
    rec = get_current_admin(token, db)
    return rec

@router.get("/users")
def list_users(token: str, db: Session = Depends(get_db), skip: int = 0, limit: int = 50):
    _ = get_current_admin(token, db)
    rows = db.query(models.User).order_by(models.User.id.asc()).offset(skip).limit(limit).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "is_active": u.is_active} for u in rows]

@router.post("/users/{user_id}/suspend")
def suspend_user(user_id: int, token: str, db: Session = Depends(get_db)):
    _ = get_current_admin(token, db)
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_active = False
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"id": u.id, "is_active": u.is_active}

@router.post("/listings/{listing_id}/approve")
def approve_listing(listing_id: int, token: str, db: Session = Depends(get_db)):
    _ = get_current_admin(token, db)
    l = db.query(models.CarbonCreditListing).filter(models.CarbonCreditListing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    l.status = "AVAILABLE"
    db.add(l)
    db.commit()
    db.refresh(l)
    return {"id": l.id, "status": l.status}

@router.post("/listings/{listing_id}/reject")
def reject_listing(listing_id: int, token: str, db: Session = Depends(get_db)):
    _ = get_current_admin(token, db)
    l = db.query(models.CarbonCreditListing).filter(models.CarbonCreditListing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    l.status = "REJECTED"
    db.add(l)
    db.commit()
    db.refresh(l)
    return {"id": l.id, "status": l.status}

@router.get("/listings/pending")
def pending_listings(token: str, db: Session = Depends(get_db), skip: int = 0, limit: int = 50):
    _ = get_current_admin(token, db)
    rows = db.query(models.CarbonCreditListing)\
        .filter(models.CarbonCreditListing.status == "PENDING")\
        .order_by(models.CarbonCreditListing.created_at.desc())\
        .offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "credit_id": r.credit_id,
            "seller_user_id": r.seller_user_id,
            "credit_amount": r.credit_amount,
            "price_per_credit": r.price_per_credit,
            "status": r.status,
            "created_at": r.created_at
        } for r in rows
    ]
