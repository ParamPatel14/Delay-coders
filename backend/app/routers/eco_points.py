from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db

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
