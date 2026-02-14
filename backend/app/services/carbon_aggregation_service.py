from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..config import settings

def total_carbon_saved_all_users(db: Session) -> float:
    total = db.query(func.sum(models.CarbonSaving.saved_amount)).scalar() or 0.0
    return float(total)

def carbon_credits_from_savings(total_saved_kg: float) -> float:
    kg_per_credit = float(settings.CARBON_CREDIT_KG_PER_CREDIT or 1000.0)
    if kg_per_credit <= 0:
        kg_per_credit = 1000.0
    return float(total_saved_kg / kg_per_credit)

def aggregate_summary(db: Session):
    total_saved = total_carbon_saved_all_users(db)
    total_credits = carbon_credits_from_savings(total_saved)
    return {"total_saved_kg": total_saved, "total_credits": total_credits}
