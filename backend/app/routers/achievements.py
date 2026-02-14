from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import challenges

router = APIRouter(prefix="/achievements", tags=["achievements"])

@router.get("/badges", response_model=List[schemas.BadgeResponse])
def get_user_badges(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    rows = db.query(models.Badge).join(models.UserBadge, models.UserBadge.badge_id == models.Badge.id)\
        .filter(models.UserBadge.user_id == current_user.id)\
        .order_by(models.Badge.name.asc())\
        .all()
    return rows

@router.get("/challenges", response_model=List[schemas.ChallengeStatusResponse])
def get_user_challenges(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    return challenges.get_user_challenges_status(db, current_user.id)
