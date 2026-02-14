from sqlalchemy.orm import Session
from sqlalchemy import desc
from .. import models

def set_price(db: Session, price_per_credit: float) -> models.CarbonCreditPrice | None:
    if price_per_credit <= 0:
        return None
    rec = models.CarbonCreditPrice(price_per_credit=price_per_credit)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

def get_price(db: Session) -> float:
    rec = db.query(models.CarbonCreditPrice).order_by(desc(models.CarbonCreditPrice.created_at)).first()
    return float(rec.price_per_credit) if rec else 0.0
