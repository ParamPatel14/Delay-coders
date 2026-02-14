from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from .. import models, schemas, dependencies
from ..database import get_db
from ..config import settings
from ..services import blockchain

router = APIRouter(prefix="/tokens", tags=["tokens"])

@router.get("/balance", response_model=schemas.TokenBalanceResponse)
def get_token_balance(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    if not wallet or not wallet.address:
        raise HTTPException(status_code=400, detail="Wallet not connected")
    if not settings.CHAIN_RPC_URL or not settings.ECO_TOKEN_ADDRESS:
        raise HTTPException(status_code=500, detail="Blockchain not configured")
    bal = blockchain.get_balance(wallet.address)
    eco = float(Decimal(bal) / Decimal(10**18))
    return {"wallet_address": wallet.address, "eco_tokens": eco}

@router.get("/history", response_model=list[schemas.TokenHistoryItem])
def get_token_history(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    rows = db.query(models.EcoTokenConversion)\
        .filter(models.EcoTokenConversion.user_id == current_user.id)\
        .order_by(models.EcoTokenConversion.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return rows
