from sqlalchemy.orm import Session
from .. import models

def log_event(db: Session, event_type: str, user_id: int | None = None, description: str | None = None):
    rec = models.SystemLog(event_type=event_type, user_id=user_id, description=description or "")
    db.add(rec)
    db.flush()
    return rec
