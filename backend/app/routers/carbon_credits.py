from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import carbon_credit_service
from ..services import carbon_credit_blockchain_service as cc_chain

router = APIRouter(prefix="/carbon-credits", tags=["carbon-credits"])

@router.get("/balance", response_model=schemas.CarbonCreditBalanceResponse)
def get_balance(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    total_saved = db.query(func.sum(models.CarbonSaving.saved_amount))\
        .filter(models.CarbonSaving.user_id == current_user.id)\
        .scalar() or 0.0
    holding = carbon_credit_service.generate_carbon_credits(db, current_user.id)
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    token_bal = 0.0
    if wallet and wallet.address:
        try:
            token_bal = float(cc_chain.get_credit_balance(wallet.address))
        except Exception:
            token_bal = 0.0
    return {
        "carbon_saved": float(round(total_saved, 6)),
        "carbon_credits": float(round(holding.credit_amount or 0.0, 6)),
        "carbon_credit_tokens": float(round(token_bal, 6)),
        "wallet_address": wallet.address if wallet else None
    }

@router.get("/history", response_model=List[schemas.CarbonCreditHistoryItem])
def get_history(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    rows = db.query(models.CarbonSaving)\
        .filter(models.CarbonSaving.user_id == current_user.id)\
        .order_by(models.CarbonSaving.created_at.desc())\
        .offset(skip).limit(limit).all()
    out: List[schemas.CarbonCreditHistoryItem] = []
    for r in rows:
        out.append({
            "created_at": r.created_at,
            "carbon_saved": float(r.saved_amount or 0.0),
            "carbon_credits": float((r.saved_amount or 0.0) / (carbon_credit_service.settings.CARBON_CREDIT_KG_PER_CREDIT or 1000.0))
        })
    return out

@router.post("/generate")
def generate(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    carbon_credit_service.generate_carbon_credits(db, current_user.id)
    db.commit()
    return {"status": "ok"}
