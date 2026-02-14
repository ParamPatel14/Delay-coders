from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models

DEFAULT_BADGES = [
    ("FIRST_TRANSACTION", "First Transaction", "Completed the first transaction"),
    ("LOW_CARBON_USER", "Low Carbon User", "Made a low-carbon transaction"),
    ("ECO_SAVER", "Eco Saver", "Saved 10 kg CO₂"),
    ("CARBON_CHAMPION", "Carbon Champion", "Saved 50 kg CO₂"),
    ("POINTS_500", "Eco Starter", "Reached 500 points"),
    ("POINTS_1500", "Eco Warrior", "Reached 1500 points"),
    ("POINTS_3000", "Eco Hero", "Reached 3000 points"),
    ("POINTS_5000", "Carbon Champion", "Reached 5000 points"),
]

def seed_default_badges(db: Session):
    for code, name, desc in DEFAULT_BADGES:
        exists = db.query(models.Badge).filter(models.Badge.code == code).first()
        if not exists:
            db.add(models.Badge(code=code, name=name, description=desc))
    db.commit()

def ensure_awarded(db: Session, user_id: int, code: str):
    b = db.query(models.Badge).filter(models.Badge.code == code).first()
    if not b:
        return None
    exists = db.query(models.UserBadge).filter(
        models.UserBadge.user_id == user_id,
        models.UserBadge.badge_id == b.id
    ).first()
    if exists:
        return exists
    ub = models.UserBadge(user_id=user_id, badge_id=b.id)
    db.add(ub)
    db.flush()
    db.refresh(ub)
    return ub

def award_badges_for_transaction(db: Session, user_id: int, transaction_id: int, carbon_record_id: int):
    count_tx = db.query(func.count(models.Transaction.id)).filter(models.Transaction.user_id == user_id).scalar() or 0
    if count_tx == 1:
        ensure_awarded(db, user_id, "FIRST_TRANSACTION")
    saving = db.query(models.CarbonSaving).filter(models.CarbonSaving.carbon_record_id == carbon_record_id).first()
    if saving and saving.saved_amount and saving.saved_amount >= 0.1:
        ensure_awarded(db, user_id, "LOW_CARBON_USER")
    total_saved = db.query(func.sum(models.CarbonSaving.saved_amount)).filter(models.CarbonSaving.user_id == user_id).scalar() or 0.0
    if total_saved >= 10.0:
        ensure_awarded(db, user_id, "ECO_SAVER")
    if total_saved >= 50.0:
        ensure_awarded(db, user_id, "CARBON_CHAMPION")

def award_badges_post_points(db: Session, user_id: int):
    bal = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == user_id).first()
    total = bal.total_points if bal else 0
    if total >= 500:
        ensure_awarded(db, user_id, "POINTS_500")
    if total >= 1500:
        ensure_awarded(db, user_id, "POINTS_1500")
    if total >= 3000:
        ensure_awarded(db, user_id, "POINTS_3000")
    if total >= 5000:
        ensure_awarded(db, user_id, "POINTS_5000")
