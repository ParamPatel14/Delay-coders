from sqlalchemy.orm import Session
from .. import models


def estimate_carbon_preview(
    db: Session,
    amount: int,
    category: str,
):
    factor = db.query(models.EmissionFactor).filter(
        models.EmissionFactor.category == category
    ).first()
    if not factor:
        factor = db.query(models.EmissionFactor).filter(
            models.EmissionFactor.category == "Other"
        ).first()
    emission_factor_value = factor.co2_per_unit if factor else 0.0003
    amount_inr = amount / 100.0
    carbon_emission = amount_inr * emission_factor_value
    carbon_saving = 0.0
    if factor and factor.baseline_co2_per_unit:
        baseline_emission = amount_inr * factor.baseline_co2_per_unit
        saved_amount = baseline_emission - carbon_emission
        if saved_amount > 0:
            carbon_saving = saved_amount
    return carbon_emission, carbon_saving


def calculate_and_record_carbon(
    db: Session,
    user_id: int,
    transaction_id: int,
    amount: int,
    category: str
):
    """
    Calculates carbon emission for a transaction and stores it in the carbon_records table.
    
    Args:
        db: Database session
        user_id: ID of the user
        transaction_id: ID of the transaction
        amount: Transaction amount in paisa
        category: Transaction category (e.g., 'Transport', 'Food')
    """
    
    # 1. Fetch emission factor
    # Try to find exact match, otherwise default to 'Other'
    factor = db.query(models.EmissionFactor).filter(
        models.EmissionFactor.category == category
    ).first()
    
    if not factor:
        factor = db.query(models.EmissionFactor).filter(
            models.EmissionFactor.category == "Other"
        ).first()
    
    # Default fallback if 'Other' is missing (shouldn't happen if seeded correctly)
    emission_factor_value = factor.co2_per_unit if factor else 0.0003
    
    # 2. Calculate Carbon Emission
    # Amount is in paisa, convert to INR first? 
    # The requirement says "CO2 per unit activity". 
    # Example says: 0.0005 kg per INR (implied).
    # If amount is 500 (assuming INR in example, but our DB stores paisa).
    # Let's assume the factor is per INR.
    
    amount_inr = amount / 100.0
    carbon_emission = amount_inr * emission_factor_value
    
    # 3. Create Carbon Record
    carbon_record = models.CarbonRecord(
        user_id=user_id,
        transaction_id=transaction_id,
        category=category,
        amount=amount,
        emission_factor=emission_factor_value,
        carbon_emission=carbon_emission
    )
    
    db.add(carbon_record)
    # Note: We do NOT commit here to allow atomic transactions by the caller.
    # The caller is responsible for committing the session.
    db.flush() 
    db.refresh(carbon_record)
    
    # 4. Calculate and Record Carbon Savings
    if factor and factor.baseline_co2_per_unit:
        baseline_emission = amount_inr * factor.baseline_co2_per_unit
        # Savings = Baseline - Actual
        # Only record if positive savings
        saved_amount = baseline_emission - carbon_emission
        
        if saved_amount > 0:
            carbon_saving = models.CarbonSaving(
                user_id=user_id,
                carbon_record_id=carbon_record.id,
                saved_amount=saved_amount
            )
            db.add(carbon_saving)
            db.flush() # Ensure ID is generated
    
    return carbon_record
