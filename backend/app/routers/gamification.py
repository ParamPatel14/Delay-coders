from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import challenges

router = APIRouter(prefix="/gamification", tags=["gamification"])

@router.get("/level", response_model=schemas.EcoUserLevelResponse)
def get_level(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    lvl = db.query(models.EcoUserLevel).filter(models.EcoUserLevel.user_id == current_user.id).first()
    if not lvl:
        return {"level": "Beginner", "points_required": 0, "last_updated": None}
    return lvl

@router.get("/badges", response_model=List[schemas.BadgeResponse])
def get_badges(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    rows = db.query(models.Badge).join(models.UserBadge, models.UserBadge.badge_id == models.Badge.id)\
        .filter(models.UserBadge.user_id == current_user.id)\
        .order_by(models.Badge.name.asc())\
        .all()
    return rows

@router.get("/streak", response_model=schemas.StreakResponse)
def get_streak(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(models.EcoStreak).filter(models.EcoStreak.user_id == current_user.id).first()
    if not s:
        return {"current_streak": 0, "longest_streak": 0, "last_activity_date": None}
    return s

@router.get("/challenges", response_model=List[schemas.ChallengeStatusResponse])
def get_challenges(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    return challenges.get_user_challenges_status(db, current_user.id)

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntryResponse])
def get_leaderboard(
    db: Session = Depends(get_db),
    limit: int = 10
):
    rows = db.query(models.EcoPointsBalance, models.User, models.EcoUserLevel)\
        .join(models.User, models.User.id == models.EcoPointsBalance.user_id)\
        .outerjoin(models.EcoUserLevel, models.EcoUserLevel.user_id == models.User.id)\
        .order_by(models.EcoPointsBalance.lifetime_points.desc())\
        .limit(limit)\
        .all()
    result = []
    for bal, user, lvl in rows:
        result.append({
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "lifetime_points": bal.lifetime_points or 0,
            "level": lvl.level if lvl else "Beginner"
        })
    return result
