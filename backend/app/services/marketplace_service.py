from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models

def create_listing(db: Session, seller_user_id: int, credit_id: int, credit_amount: float, price_per_credit: float):
    if credit_amount <= 0 or price_per_credit <= 0:
        return None
    saving = db.query(models.CarbonSaving).filter(models.CarbonSaving.id == credit_id, models.CarbonSaving.user_id == seller_user_id).first()
    if not saving or (saving.saved_amount or 0.0) <= 0:
        return None
    rec = models.CarbonCreditListing(
        credit_id=credit_id,
        seller_user_id=seller_user_id,
        credit_amount=credit_amount,
        price_per_credit=price_per_credit,
        status="PENDING"
    )
    db.add(rec)
    db.flush()
    db.refresh(rec)
    return rec

def get_available_listings(db: Session, skip: int = 0, limit: int = 50):
    rows = db.query(models.CarbonCreditListing)\
        .filter(models.CarbonCreditListing.status == "AVAILABLE")\
        .order_by(models.CarbonCreditListing.created_at.desc())\
        .offset(skip).limit(limit).all()
    return rows
