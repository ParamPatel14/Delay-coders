from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import marketplace_service

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.get("/listings")
def get_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    rows = marketplace_service.get_available_listings(db, skip, limit)
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

@router.post("/listings")
def create_listing(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    credit_id = int(payload.get("credit_id", 0))
    credit_amount = float(payload.get("credit_amount", 0.0))
    price_per_credit = float(payload.get("price_per_credit", 0.0))
    rec = marketplace_service.create_listing(db, current_user.id, credit_id, credit_amount, price_per_credit)
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid listing")
    db.commit()
    db.refresh(rec)
    return {
        "id": rec.id,
        "credit_id": rec.credit_id,
        "seller_user_id": rec.seller_user_id,
        "credit_amount": rec.credit_amount,
        "price_per_credit": rec.price_per_credit,
        "status": rec.status,
        "created_at": rec.created_at
    }
