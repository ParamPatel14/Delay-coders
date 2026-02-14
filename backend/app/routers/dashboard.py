from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timezone
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import user_level, challenges

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    total_spent = db.query(func.sum(models.Transaction.amount))\
        .filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.type == "debit",
            models.Transaction.status == "completed"
        ).scalar() or 0
    count = db.query(func.count(models.Transaction.id))\
        .filter(models.Transaction.user_id == current_user.id)\
        .scalar() or 0
    recent = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == current_user.id)\
        .order_by(models.Transaction.created_at.desc())\
        .limit(5)\
        .all()
    today = datetime.now(timezone.utc)
    total_carbon = db.query(func.sum(models.CarbonRecord.carbon_emission))\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .scalar() or 0.0
    monthly_carbon = db.query(func.sum(models.CarbonRecord.carbon_emission))\
        .filter(
            models.CarbonRecord.user_id == current_user.id,
            func.extract('year', models.CarbonRecord.created_at) == today.year,
            func.extract('month', models.CarbonRecord.created_at) == today.month
        ).scalar() or 0.0
    first_record_date = db.query(func.min(models.CarbonRecord.created_at))\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .scalar()
    if first_record_date:
        if first_record_date.tzinfo is None:
            first_record_date = first_record_date.replace(tzinfo=timezone.utc)
        days_active = (today - first_record_date).days + 1
        daily_average = total_carbon / days_active
    else:
        daily_average = 0.0
    recent_carbon = db.query(models.CarbonRecord)\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .order_by(models.CarbonRecord.created_at.desc())\
        .limit(5)\
        .all()
    total_saved = db.query(func.sum(models.CarbonSaving.saved_amount))\
        .filter(models.CarbonSaving.user_id == current_user.id)\
        .scalar() or 0.0
    eco_bal = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == current_user.id).first()
    eco_score = db.query(models.EcoScore).filter(models.EcoScore.user_id == current_user.id).first()
    recent_rewards = db.query(models.EcoPointsTransaction)\
        .filter(models.EcoPointsTransaction.user_id == current_user.id)\
        .order_by(models.EcoPointsTransaction.created_at.desc())\
        .limit(5)\
        .all()
    user_lvl = db.query(models.EcoUserLevel).filter(models.EcoUserLevel.user_id == current_user.id).first()
    if not user_lvl:
        user_lvl = user_level.update_user_level(db, current_user.id)
    badges_list = db.query(models.Badge).join(models.UserBadge, models.UserBadge.badge_id == models.Badge.id)\
        .filter(models.UserBadge.user_id == current_user.id)\
        .order_by(models.Badge.name.asc())\
        .limit(20)\
        .all()
    streak = db.query(models.EcoStreak).filter(models.EcoStreak.user_id == current_user.id).first()
    challenges_status = challenges.get_user_challenges_status(db, current_user.id)
    leaderboard_rows = db.query(models.EcoPointsBalance, models.User, models.EcoUserLevel)\
        .join(models.User, models.User.id == models.EcoPointsBalance.user_id)\
        .outerjoin(models.EcoUserLevel, models.EcoUserLevel.user_id == models.User.id)\
        .order_by(models.EcoPointsBalance.lifetime_points.desc())\
        .limit(5)\
        .all()
    leaderboard = []
    for bal, user, lvl in leaderboard_rows:
        leaderboard.append({
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "lifetime_points": bal.lifetime_points or 0,
            "level": lvl.level if lvl else "Beginner"
        })
    return {
        "total_spent": total_spent,
        "transaction_count": count,
        "recent_transactions": recent,
        "carbon_summary": {
            "total_carbon": round(total_carbon, 2),
            "monthly_carbon": round(monthly_carbon, 2),
            "daily_average": round(daily_average, 2)
        },
        "recent_carbon_records": recent_carbon,
        "total_carbon_saved": round(total_saved, 2),
        "eco_points_balance": eco_bal,
        "eco_score": eco_score if eco_score else {"score": 0.0, "last_updated": None},
        "recent_rewards": recent_rewards,
        "user_level": user_lvl,
        "badges": badges_list,
        "streak": streak,
        "challenges": challenges_status,
        "leaderboard": leaderboard
    }
