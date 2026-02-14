import json
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(
    prefix="/emissions",
    tags=["emissions"]
)

@router.get("/factors", response_model=List[schemas.EmissionFactorResponse])
def get_emission_factors(db: Session = Depends(database.get_db)):
    """
    Get all emission factors.
    """
    return db.query(models.EmissionFactor).all()

@router.get("/factors/{category}", response_model=schemas.EmissionFactorResponse)
def get_emission_factor_by_category(category: str, db: Session = Depends(database.get_db)):
    """
    Get emission factor by category.
    """
    factor = db.query(models.EmissionFactor).filter(models.EmissionFactor.category == category).first()
    if not factor:
        raise HTTPException(status_code=404, detail="Emission factor not found for this category")
    return factor

def seed_emission_factors(db: Session):
    """
    Load emission factors from JSON file if table is empty.
    """
    # Check if we already have data
    if db.query(models.EmissionFactor).count() > 0:
        return

    # Path to the data file: backend/data/emission_factors.json
    # __file__ is backend/app/routers/emissions.py
    # We need to go up 3 levels to reach backend/
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    json_path = os.path.join(base_dir, "data", "emission_factors.json")
    
    if not os.path.exists(json_path):
        # Fallback to creating the data dir and file if it doesn't exist? 
        # For now, let's assume it exists because we created it.
        # But for robustness, we can log a warning.
        print(f"Warning: {json_path} not found. Skipping seeding.")
        return

    with open(json_path, "r") as f:
        data = json.load(f)
        
    for item in data:
        factor = models.EmissionFactor(
            category=item["category"],
            co2_per_unit=item["co2_per_unit"],
            unit=item["unit"],
            description=item.get("description")
        )
        db.add(factor)
    
    try:
        db.commit()
        print("Emission factors seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding emission factors: {e}")
