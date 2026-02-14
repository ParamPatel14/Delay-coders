from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import carbon

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
    carbon.calculate_and_record_carbon(
        db=db,
        user_id=current_user.id,
        transaction_id=db_transaction.id,
        amount=db_transaction.amount,
        category=db_transaction.category
    )
    
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a summary of the user's transactions for the dashboard.
    Includes total spent, total count, and last 5 transactions.
    """
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

    return {
        "total_spent": total_spent,
        "transaction_count": count,
        "recent_transactions": recent
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
