from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..config import settings
from ..services import eco_points

router = APIRouter(prefix="/eco-points", tags=["eco-points"])

@router.get("/balance", response_model=schemas.EcoPointsBalanceResponse)
def get_balance(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    bal = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == current_user.id).first()
    if not bal:
        bal = models.EcoPointsBalance(user_id=current_user.id, total_points=0, lifetime_points=0)
        db.add(bal)
        db.commit()
        db.refresh(bal)
    return bal

@router.get("/history", response_model=List[schemas.EcoPointsTransactionResponse])
def get_history(
    skip: int = 0,
    limit: int = 20,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    rows = db.query(models.EcoPointsTransaction)\
        .filter(models.EcoPointsTransaction.user_id == current_user.id)\
        .order_by(models.EcoPointsTransaction.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return rows

@router.get("/score", response_model=schemas.EcoScoreResponse)
def get_score(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(models.EcoScore).filter(models.EcoScore.user_id == current_user.id).first()
    if not rec:
        return {"score": 0.0, "last_updated": None}
    return rec

@router.post("/convert", response_model=schemas.EcoTokenConversionResponse)
def convert_points(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    if not settings.CHAIN_RPC_URL or not settings.ECO_TOKEN_ADDRESS or not settings.ECO_TOKEN_OWNER_PRIVATE_KEY:
        raise HTTPException(status_code=500, detail="Blockchain not configured")
    points = int(payload.get("points", 0))
    if points <= 0:
        raise HTTPException(status_code=400, detail="Invalid points")
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    if not wallet or not wallet.address:
        raise HTTPException(status_code=400, detail="Wallet not connected")
    result = eco_points.convert_points_to_tokens(db, current_user.id, points, wallet.address)
    if not result:
        raise HTTPException(status_code=400, detail="Insufficient points")
    conv, res = result
    db.commit()
    return {"tx_hash": res["tx_hash"], "points_converted": conv.points, "token_amount": conv.token_amount}
