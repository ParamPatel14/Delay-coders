from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, date
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(
    prefix="/carbon",
    tags=["carbon"]
)

@router.get("/summary", response_model=schemas.CarbonFootprintSummary)
def get_carbon_summary(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the total carbon footprint, monthly carbon (current month), and daily average.
    """
    # Total Carbon
    total_carbon = db.query(func.sum(models.CarbonRecord.carbon_emission))\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .scalar() or 0.0

    # Monthly Carbon (Current Month)
    today = datetime.now()
    # Extract year and month matching
    monthly_carbon = db.query(func.sum(models.CarbonRecord.carbon_emission))\
        .filter(
            models.CarbonRecord.user_id == current_user.id,
            func.extract('year', models.CarbonRecord.created_at) == today.year,
            func.extract('month', models.CarbonRecord.created_at) == today.month
        ).scalar() or 0.0

    # Daily Average
    # Find the date of the first transaction/record
    first_record_date = db.query(func.min(models.CarbonRecord.created_at))\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .scalar()

    if first_record_date:
        # Calculate days since first record
        days_active = (today - first_record_date).days + 1 # +1 to avoid division by zero on day 1
        daily_average = total_carbon / days_active
    else:
        daily_average = 0.0

    return {
        "total_carbon": round(total_carbon, 2),
        "monthly_carbon": round(monthly_carbon, 2),
        "daily_average": round(daily_average, 2)
    }

@router.get("/history", response_model=List[schemas.CarbonRecordResponse])
def get_carbon_history(
    skip: int = 0,
    limit: int = 20,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the carbon footprint history (list of records).
    """
    records = db.query(models.CarbonRecord)\
        .filter(models.CarbonRecord.user_id == current_user.id)\
        .order_by(models.CarbonRecord.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return records

@router.get("/monthly", response_model=List[schemas.MonthlyCarbonBreakdown])
def get_monthly_breakdown(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the monthly breakdown of carbon emissions.
    """
    # Postgres specific: to_char
    # If using SQLite for testing, this might fail. 
    # But user requirements implied "Efficient SQL", so likely Postgres.
    # To be safe for hybrid envs, we can check dialect or just use generic extract if simpler.
    # But to_char is standard for formatting.
    # Let's try to_char.
    
    results = db.query(
        func.to_char(models.CarbonRecord.created_at, 'YYYY-MM').label('month'),
        func.sum(models.CarbonRecord.carbon_emission).label('total_carbon')
    ).filter(
        models.CarbonRecord.user_id == current_user.id
    ).group_by(
        'month'
    ).order_by(
        desc('month')
    ).all()
    
    return [
        {"month": row.month, "total_carbon": round(row.total_carbon, 2)}
        for row in results
    ]
