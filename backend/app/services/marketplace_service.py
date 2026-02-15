from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..config import settings


def create_listing(db: Session, seller_user_id: int, credit_id: int, credit_amount: float, price_per_credit: float):
    if credit_amount <= 0 or price_per_credit <= 0:
        return None
    saving = (
        db.query(models.CarbonSaving)
        .filter(models.CarbonSaving.id == credit_id, models.CarbonSaving.user_id == seller_user_id)
        .first()
    )
    if not saving or (saving.saved_amount or 0.0) <= 0:
        return None
    rec = models.CarbonCreditListing(
        credit_id=credit_id,
        seller_user_id=seller_user_id,
        credit_amount=credit_amount,
        price_per_credit=price_per_credit,
        status="PENDING",
    )
    db.add(rec)
    db.flush()
    db.refresh(rec)
    return rec


def get_available_listings(db: Session, skip: int = 0, limit: int = 50):
    rows = (
        db.query(models.CarbonCreditListing)
        .filter(models.CarbonCreditListing.status == "AVAILABLE")
        .order_by(models.CarbonCreditListing.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return rows


def _ensure_demo_saving(db: Session, user_id: int, saved_amount_kg: float) -> models.CarbonSaving:
    saving = (
        db.query(models.CarbonSaving)
        .filter(models.CarbonSaving.user_id == user_id)
        .order_by(models.CarbonSaving.created_at.desc())
        .first()
    )
    if saving:
        return saving
    carbon_record = models.CarbonRecord(
        user_id=user_id,
        transaction_id=None,
        category="Demo",
        amount=0,
        emission_factor=0.0,
        carbon_emission=0.0,
    )
    db.add(carbon_record)
    db.flush()
    db.refresh(carbon_record)
    saving = models.CarbonSaving(
        user_id=user_id,
        carbon_record_id=carbon_record.id,
        saved_amount=saved_amount_kg,
    )
    db.add(saving)
    db.flush()
    db.refresh(saving)
    return saving


def seed_demo_listings(db: Session) -> None:
    existing = db.query(func.count(models.CarbonCreditListing.id)).scalar() or 0
    if existing > 0:
        return
    user_count = db.query(func.count(models.User.id)).scalar() or 0
    if user_count == 0:
        return
    kg_per_credit = float(getattr(settings, "CARBON_CREDIT_KG_PER_CREDIT", 1000.0) or 1000.0)
    templates = [
        {"credits": 120.0, "price_per_credit": 940.0},
        {"credits": 250.0, "price_per_credit": 975.0},
        {"credits": 80.0, "price_per_credit": 910.0},
    ]
    users = (
        db.query(models.User)
        .order_by(models.User.id.asc())
        .limit(len(templates))
        .all()
    )
    if not users:
        return
    for idx, tpl in enumerate(templates):
        seller = users[idx % len(users)]
        saving_amount = float(tpl["credits"]) * kg_per_credit
        saving = _ensure_demo_saving(db, seller.id, saving_amount)
        listing = models.CarbonCreditListing(
            credit_id=saving.id,
            seller_user_id=seller.id,
            credit_amount=tpl["credits"],
            price_per_credit=tpl["price_per_credit"],
            status="AVAILABLE",
        )
        db.add(listing)
    db.commit()
