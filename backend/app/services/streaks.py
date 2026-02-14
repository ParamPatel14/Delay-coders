from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .. import models

def update_on_activity(db: Session, user_id: int, activity_dt: datetime | None = None):
    now = activity_dt or datetime.now(timezone.utc)
    record = db.query(models.EcoStreak).filter(models.EcoStreak.user_id == user_id).first()
    if not record:
        record = models.EcoStreak(user_id=user_id, current_streak=1, longest_streak=1, last_activity_date=now)
        db.add(record)
        db.flush()
        db.refresh(record)
        return record
    last = record.last_activity_date
    today = now.date()
    if last:
        last_date = last.date()
        if last_date == today:
            return record
        delta_days = (today - last_date).days
        if delta_days == 1:
            record.current_streak = (record.current_streak or 0) + 1
        else:
            record.current_streak = 1
    else:
        record.current_streak = 1
    if (record.longest_streak or 0) < record.current_streak:
        record.longest_streak = record.current_streak
    record.last_activity_date = now
    db.add(record)
    db.flush()
    db.refresh(record)
    return record
