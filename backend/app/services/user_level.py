from sqlalchemy.orm import Session
from .. import models
from datetime import datetime, timezone

LEVELS = [
    ("Carbon Champion", 5000),
    ("Eco Hero", 3000),
    ("Eco Warrior", 1500),
    ("Eco Starter", 500),
    ("Beginner", 0),
]

def determine_level(total_points: int):
    for name, required in LEVELS:
        if total_points >= required:
            return name, required
    return "Beginner", 0

def update_user_level(db: Session, user_id: int):
    bal = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == user_id).first()
    total = bal.total_points if bal else 0
    level_name, required = determine_level(total)
    record = db.query(models.EcoUserLevel).filter(models.EcoUserLevel.user_id == user_id).first()
    now = datetime.now(timezone.utc)
    if record:
        if record.level != level_name or record.points_required != required:
            record.level = level_name
            record.points_required = required
            record.last_updated = now
            db.add(record)
            db.flush()
            db.refresh(record)
        return record
    record = models.EcoUserLevel(
        user_id=user_id,
        level=level_name,
        points_required=required,
        last_updated=now
    )
    db.add(record)
    db.flush()
    db.refresh(record)
    return record
