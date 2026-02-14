from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..config import settings
from . import carbon_credit_blockchain_service as cc_chain
from decimal import Decimal

def ensure_holding(db: Session, user_id: int) -> models.CarbonCreditHolding:
    holding = db.query(models.CarbonCreditHolding).filter(models.CarbonCreditHolding.user_id == user_id).first()
    if not holding:
        holding = models.CarbonCreditHolding(user_id=user_id, carbon_amount=0.0, credit_amount=0.0)
        db.add(holding)
        db.flush()
        db.refresh(holding)
    return holding

def recalculate_user_holding(db: Session, user_id: int) -> models.CarbonCreditHolding:
    holding = ensure_holding(db, user_id)
    total_saved = db.query(func.sum(models.CarbonSaving.saved_amount)).filter(models.CarbonSaving.user_id == user_id).scalar() or 0.0
    kg_per_credit = float(settings.CARBON_CREDIT_KG_PER_CREDIT or 1000.0)
    holding.carbon_amount = float(total_saved)
    holding.credit_amount = float(total_saved / kg_per_credit)
    db.add(holding)
    return holding

def get_total_credits(db: Session) -> float:
    total = db.query(func.sum(models.CarbonCreditHolding.credit_amount)).scalar() or 0.0
    return float(total)

def generate_carbon_credits(db: Session, user_id: int) -> models.CarbonCreditHolding:
    holding = recalculate_user_holding(db, user_id)
    return holding

def convert_savings_to_credits(db: Session):
    users = db.query(models.User).all()
    for u in users:
        recalculate_user_holding(db, u.id)
    return True

def mint_credit_tokens(db: Session, user_id: int):
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == user_id).first()
    if not wallet or not wallet.address:
        return {"ok": False, "error": "Wallet not connected"}
    holding = recalculate_user_holding(db, user_id)
    onchain = cc_chain.get_credit_balance(wallet.address)
    # Mint delta only
    delta = float(holding.credit_amount) - float(onchain)
    if delta <= 0:
        return {"ok": True, "tx_hash": "", "minted": 0.0}
    res = cc_chain.mint_carbon_credit(wallet.address, Decimal(str(delta)))
    return {"ok": True, "tx_hash": res["tx_hash"], "minted": delta}
