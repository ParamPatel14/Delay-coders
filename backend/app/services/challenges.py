from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from .. import models
from . import eco_points

DEFAULT_CHALLENGES = [
    ("TX_5", "Complete 5 eco transactions", "Complete transactions", "transactions_count", 5, 100),
    ("SAVE_10KG", "Save 10 kg carbon", "Carbon savings", "carbon_saved", 10.0, 200),
    ("POINTS_500", "Earn 500 eco points", "Eco points milestone", "points_earned", 500, 100),
]

def seed_default_challenges(db: Session):
    for code, name, desc, ctype, goal, reward in DEFAULT_CHALLENGES:
        exists = db.query(models.Challenge).filter(models.Challenge.code == code).first()
        if not exists:
            db.add(models.Challenge(code=code, name=name, description=desc, type=ctype, goal_value=goal, reward_points=reward, active=True))
    db.commit()

def _ensure_progress(db: Session, user_id: int, challenge_id: int):
    prog = db.query(models.UserChallengeProgress).filter(
        models.UserChallengeProgress.user_id == user_id,
        models.UserChallengeProgress.challenge_id == challenge_id
    ).first()
    if prog:
        return prog
    prog = models.UserChallengeProgress(user_id=user_id, challenge_id=challenge_id, progress_value=0.0, completed=False)
    db.add(prog)
    db.flush()
    db.refresh(prog)
    return prog

def _increment_and_check(db: Session, user_id: int, challenge: models.Challenge, delta: float):
    prog = _ensure_progress(db, user_id, challenge.id)
    if prog.completed:
        return prog
    prog.progress_value = float(prog.progress_value or 0.0) + float(delta)
    if prog.progress_value >= float(challenge.goal_value):
        prog.completed = True
        prog.completed_at = datetime.now(timezone.utc)
        eco_points.award_points(db, user_id, int(challenge.reward_points or 0), "BONUS", f"CHALLENGE:{challenge.code}")
    db.add(prog)
    db.flush()
    db.refresh(prog)
    return prog

def update_on_transaction(db: Session, user_id: int):
    rows = db.query(models.Challenge).filter(models.Challenge.active == True, models.Challenge.type == "transactions_count").all()
    for ch in rows:
        _increment_and_check(db, user_id, ch, 1)

def update_on_saving(db: Session, user_id: int, saved_amount: float):
    rows = db.query(models.Challenge).filter(models.Challenge.active == True, models.Challenge.type == "carbon_saved").all()
    for ch in rows:
        _increment_and_check(db, user_id, ch, float(saved_amount or 0.0))

def update_on_points(db: Session, user_id: int, points: int):
    rows = db.query(models.Challenge).filter(models.Challenge.active == True, models.Challenge.type == "points_earned").all()
    for ch in rows:
        _increment_and_check(db, user_id, ch, int(points or 0))

def get_user_challenges_status(db: Session, user_id: int):
    challs = db.query(models.Challenge).filter(models.Challenge.active == True).all()
    result = []
    for ch in challs:
        prog = db.query(models.UserChallengeProgress).filter(
            models.UserChallengeProgress.user_id == user_id,
            models.UserChallengeProgress.challenge_id == ch.id
        ).first()
        result.append({
            "id": ch.id,
            "code": ch.code,
            "name": ch.name,
            "description": ch.description,
            "type": ch.type,
            "goal_value": ch.goal_value,
            "reward_points": ch.reward_points,
            "progress_value": float(prog.progress_value) if prog else 0.0,
            "completed": bool(prog.completed) if prog else False,
            "completed_at": prog.completed_at if prog else None,
        })
    return result
