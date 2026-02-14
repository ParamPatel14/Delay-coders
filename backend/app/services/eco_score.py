from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from datetime import datetime, timezone

POINTS_WEIGHT = 0.1
CARBON_WEIGHT = 2.0

def calculate_eco_score(db: Session, user_id: int) -> float:
    bal = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == user_id).first()
    points = bal.total_points if bal else 0
    saved = db.query(func.sum(models.CarbonSaving.saved_amount)).filter(models.CarbonSaving.user_id == user_id).scalar() or 0.0
    score = POINTS_WEIGHT * float(points) + CARBON_WEIGHT * float(saved)
    if score < 0:
        score = 0.0
    if score > 100.0:
        score = 100.0
    return round(score, 2)

def update_eco_score(db: Session, user_id: int) -> models.EcoScore:
    score_value = calculate_eco_score(db, user_id)
    existing = db.query(models.EcoScore).filter(models.EcoScore.user_id == user_id).first()
    now = datetime.now(timezone.utc)
    if existing:
        existing.score = score_value
        existing.last_updated = now
        db.add(existing)
        db.flush()
        db.refresh(existing)
        return existing
    record = models.EcoScore(user_id=user_id, score=score_value, last_updated=now)
    db.add(record)
    db.flush()
    db.refresh(record)
    return record
