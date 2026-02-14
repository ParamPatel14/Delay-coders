from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import carbon, eco_points, reward_rules

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)

@router.post("/", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new transaction manually.
    Automatically calculates and records carbon emission.
    """
    db_transaction = models.Transaction(
        user_id=current_user.id,
        amount=transaction.amount,
        currency=transaction.currency,
        type=transaction.type,
        category=transaction.category,
        description=transaction.description,
        status="completed",
        payment_id=None
    )
    
    db.add(db_transaction)
    db.flush() # Generate ID
    db.refresh(db_transaction)
    
    # Calculate and record carbon emission
    carbon_record = carbon.calculate_and_record_carbon(
        db=db,
        user_id=current_user.id,
        transaction_id=db_transaction.id,
        amount=db_transaction.amount,
        category=db_transaction.category
    )
    eco_points.award_points_for_carbon_saving(
        db=db,
        user_id=current_user.id,
        transaction_id=db_transaction.id,
        carbon_record_id=carbon_record.id
    )
    reward_rules.apply_rules_for_transaction(
        db=db,
        user_id=current_user.id,
        transaction_id=db_transaction.id,
        carbon_record_id=carbon_record.id
    )
    
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

from datetime import datetime, timezone

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a summary of the user's transactions for the dashboard.
    Includes total spent, total count, last 5 transactions,
    and carbon footprint stats.
    """
    # 1. Transaction Stats
    # Total spent (sum of completed debits)
    total_spent = db.query(func.sum(models.Transaction.amount))\
        .filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.type == "debit",
            models.Transaction.status == "completed"
        ).scalar() or 0

    # Total transaction count
    count = db.query(func.count(models.Transaction.id))\
        .filter(models.Transaction.user_id == current_user.id)\
        .scalar() or 0

    # Last 5 transactions
    recent = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == current_user.id)\
        .order_by(models.Transaction.created_at.desc())\
        .limit(5)\
        .all()
        
    # 2. Carbon Stats
    # Total Carbon
    total_carbon = db.query(func.sum(models.CarbonRecord.carbon_emission))\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .scalar() or 0.0

    # Monthly Carbon (Current Month)
    today = datetime.now(timezone.utc)
    monthly_carbon = db.query(func.sum(models.CarbonRecord.carbon_emission))\
        .filter(
            models.CarbonRecord.user_id == current_user.id,
            func.extract('year', models.CarbonRecord.created_at) == today.year,
            func.extract('month', models.CarbonRecord.created_at) == today.month
        ).scalar() or 0.0

    # Daily Average
    first_record_date = db.query(func.min(models.CarbonRecord.created_at))\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .scalar()

    if first_record_date:
        # Ensure first_record_date is offset-aware or today is naive to match
        # DB usually returns offset-aware if column is DateTime(timezone=True)
        if first_record_date.tzinfo is None:
            first_record_date = first_record_date.replace(tzinfo=timezone.utc)
            
        days_active = (today - first_record_date).days + 1
        daily_average = total_carbon / days_active
    else:
        daily_average = 0.0
        
    # Recent Carbon Records
    recent_carbon = db.query(models.CarbonRecord)\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .order_by(models.CarbonRecord.created_at.desc())\
        .limit(5)\
        .all()
        
    # Total Carbon Saved
    total_saved = db.query(func.sum(models.CarbonSaving.saved_amount))\
        .filter(models.CarbonSaving.user_id == current_user.id)\
        .scalar() or 0.0
    
    # Eco Points Balance
    eco_bal = db.query(models.EcoPointsBalance).filter(models.EcoPointsBalance.user_id == current_user.id).first()
    
    # Eco Score
    eco_score = db.query(models.EcoScore).filter(models.EcoScore.user_id == current_user.id).first()
    
    # Recent Rewards
    recent_rewards = db.query(models.EcoPointsTransaction)\
        .filter(models.EcoPointsTransaction.user_id == current_user.id)\
        .order_by(models.EcoPointsTransaction.created_at.desc())\
        .limit(5)\
        .all()

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
        "recent_rewards": recent_rewards
    }

@router.get("/", response_model=List[schemas.TransactionResponse])
def get_user_transactions(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all transactions for the current user.
    """
    transactions = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == current_user.id)\
        .order_by(models.Transaction.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return transactions
