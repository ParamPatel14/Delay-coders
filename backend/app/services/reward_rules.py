from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from . import eco_points, streaks, challenges
from datetime import datetime, timezone

MILESTONES = [5, 10, 25, 50]

def apply_rules_for_transaction(db: Session, user_id: int, transaction_id: int, carbon_record_id: int):
    saving = db.query(models.CarbonSaving).filter(models.CarbonSaving.carbon_record_id == carbon_record_id).first()
    if not saving or saving.saved_amount is None or saving.saved_amount <= 0:
        return
    if saving.saved_amount >= 0.1:
        eco_points.award_points(db, user_id, 50, "BONUS", "Low carbon transaction", transaction_id)
    cr = db.query(models.CarbonRecord).filter(models.CarbonRecord.id == carbon_record_id).first()
    if cr:
        day = cr.created_at.date()
        exists_daily = db.query(models.EcoPointsTransaction).filter(
            models.EcoPointsTransaction.user_id == user_id,
            models.EcoPointsTransaction.action_type == "BONUS",
            models.EcoPointsTransaction.description == "Daily eco activity",
            func.date(models.EcoPointsTransaction.created_at) == day
        ).first()
        if not exists_daily:
            eco_points.award_points(db, user_id, 20, "BONUS", "Daily eco activity", transaction_id)
            streaks.update_on_activity(db, user_id, cr.created_at)
    if saving:
        challenges.update_on_saving(db, user_id, float(saving.saved_amount or 0.0))
    total_saved = db.query(func.sum(models.CarbonSaving.saved_amount)).filter(models.CarbonSaving.user_id == user_id).scalar() or 0.0
    for m in MILESTONES:
        if total_saved >= m:
            exists_m = db.query(models.EcoPointsTransaction).filter(
                models.EcoPointsTransaction.user_id == user_id,
                models.EcoPointsTransaction.action_type == "BONUS",
                models.EcoPointsTransaction.description == f"MILESTONE:{m}"
            ).first()
            if not exists_m:
                eco_points.award_points(db, user_id, 500, "BONUS", f"MILESTONE:{m}", transaction_id)
