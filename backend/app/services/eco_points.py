from sqlalchemy.orm import Session
from .. import models
from . import eco_score, user_level, badges

DEFAULT_MULTIPLIER = 100

def ensure_balance(db: Session, user_id: int) -> models.EcoPointsBalance:
    balance = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == user_id).first()
    if not balance:
        balance = models.EcoPointsBalance(user_id=user_id, total_points=0, lifetime_points=0)
        db.add(balance)
        db.flush()
        db.refresh(balance)
    return balance

def award_points_for_carbon_saving(
    db: Session,
    user_id: int,
    transaction_id: int,
    carbon_record_id: int,
    multiplier: int = DEFAULT_MULTIPLIER
):
    saving = db.query(models.CarbonSaving).filter(models.CarbonSaving.carbon_record_id == carbon_record_id).first()
    if not saving or saving.saved_amount is None or saving.saved_amount <= 0:
        return None

    points = int(round(saving.saved_amount * multiplier))
    if points <= 0:
        return None

    balance = ensure_balance(db, user_id)
    balance.total_points = (balance.total_points or 0) + points
    balance.lifetime_points = (balance.lifetime_points or 0) + points
    db.add(balance)

    entry = models.EcoPointsTransaction(
        user_id=user_id,
        transaction_id=transaction_id,
        points=points,
        action_type="TRANSACTION_REWARD",
        description="Eco points awarded for carbon savings"
    )
    db.add(entry)
    db.flush()
    db.refresh(entry)
    eco_score.update_eco_score(db, user_id)
    user_level.update_user_level(db, user_id)
    badges.award_badges_post_points(db, user_id)
    return entry

def award_points(
    db: Session,
    user_id: int,
    points: int,
    action_type: str,
    description: str,
    transaction_id: int | None = None
):
    if points <= 0:
        return None
    balance = ensure_balance(db, user_id)
    balance.total_points = (balance.total_points or 0) + points
    balance.lifetime_points = (balance.lifetime_points or 0) + points
    db.add(balance)
    entry = models.EcoPointsTransaction(
        user_id=user_id,
        transaction_id=transaction_id,
        points=points,
        action_type=action_type,
        description=description
    )
    db.add(entry)
    db.flush()
    db.refresh(entry)
    eco_score.update_eco_score(db, user_id)
    user_level.update_user_level(db, user_id)
    badges.award_badges_post_points(db, user_id)
    return entry
