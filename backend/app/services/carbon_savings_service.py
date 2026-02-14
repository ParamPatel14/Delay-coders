from sqlalchemy.orm import Session
from .. import models

def calculate_carbon_saved(db: Session, transaction: models.Transaction):
    factor = db.query(models.EmissionFactor).filter(models.EmissionFactor.category == transaction.category).first()
    if not factor:
        factor = db.query(models.EmissionFactor).filter(models.EmissionFactor.category == "Other").first()
    amount_inr = transaction.amount / 100.0
    actual_emission = amount_inr * (factor.co2_per_unit if factor else 0.0)
    baseline_emission = amount_inr * (factor.baseline_co2_per_unit if factor and factor.baseline_co2_per_unit else 0.0)
    saved = baseline_emission - actual_emission
    if saved < 0:
        saved = 0.0
    return {
        "transaction_id": transaction.id,
        "baseline_emission": baseline_emission,
        "actual_emission": actual_emission,
        "carbon_saved": saved
    }

def store_carbon_saving(db: Session, user_id: int, saving: dict):
    if not saving or (saving.get("carbon_saved", 0.0) or 0.0) <= 0:
        return None
    record = db.query(models.CarbonRecord).filter(
        models.CarbonRecord.transaction_id == saving["transaction_id"],
        models.CarbonRecord.user_id == user_id
    ).first()
    if not record:
        return None
    exists = db.query(models.CarbonSaving).filter(
        models.CarbonSaving.user_id == user_id,
        models.CarbonSaving.carbon_record_id == record.id
    ).first()
    if exists:
        return exists
    cs = models.CarbonSaving(
        user_id=user_id,
        carbon_record_id=record.id,
        saved_amount=saving["carbon_saved"]
    )
    db.add(cs)
    db.flush()
    db.refresh(cs)
    return cs

def get_total_savings(db: Session, user_id: int) -> float:
    from sqlalchemy import func
    total = db.query(func.sum(models.CarbonSaving.saved_amount)).filter(models.CarbonSaving.user_id == user_id).scalar() or 0.0
    return float(total)
