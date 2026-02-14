from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..config import settings
from ..services import eco_points
from ..services import logging_service
from fastapi import status

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
    if not settings.CHAIN_RPC_URL or not settings.ECO_TOKEN_ADDRESS:
        raise HTTPException(status_code=500, detail="Blockchain not configured")
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    if not wallet or not wallet.address:
        raise HTTPException(status_code=400, detail="Wallet not connected")
    points = int(payload.get("points", 0))
    if points and points > 0:
        result = eco_points.convert_points_to_tokens(db, current_user.id, points, wallet.address)
        if not result:
            raise HTTPException(status_code=400, detail="Insufficient points")
        conv, res = result
    else:
        converted = eco_points.auto_convert_threshold(db, current_user.id)
        if not converted:
            db.commit()
            return {"tx_hash": "", "points_converted": 0, "token_amount": 0.0}
        total_points = sum(c.points for c in converted)
        total_tokens = sum(c.token_amount for c in converted)
        conv = converted[-1]
        res = {"tx_hash": conv.tx_hash}
    db.commit()
    logging_service.log_event(db, "TOKEN_MINT", current_user.id, f"{res['tx_hash']}")
    return {"tx_hash": res["tx_hash"], "points_converted": total_points if not points else conv.points, "token_amount": total_tokens if not points else conv.token_amount}

@router.get("/convertible", response_model=schemas.ConvertiblePointsResponse)
def get_convertible(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    available, remainder, threshold = eco_points.get_convertible_info(db, current_user.id)
    return {"points_available": available, "remainder": remainder, "threshold": threshold}
@router.post("/award-demo", status_code=status.HTTP_204_NO_CONTENT)
def award_demo(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    points = int(payload.get("points", 0))
    if points <= 0:
        raise HTTPException(status_code=400, detail="Invalid points")
    eco_points.award_points(db, current_user.id, points, "BONUS", "Demo points award")
    db.commit()
