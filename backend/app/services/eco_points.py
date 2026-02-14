from sqlalchemy.orm import Session
from .. import models
from . import gamification
from ..config import settings
from . import blockchain
from sqlalchemy.orm import Session
from .. import models
import secrets

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
    gamification.trigger_on_points_awarded(db, user_id, points)
    return entry
 
def auto_convert_threshold(db: Session, user_id: int):
    if not settings.CHAIN_RPC_URL or not settings.ECO_TOKEN_ADDRESS:
        return None
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == user_id).first()
    if not wallet or not wallet.address:
        return None
    threshold = int(settings.ECO_TOKEN_AUTO_THRESHOLD or 0)
    if threshold <= 0:
        return None
    bal = ensure_balance(db, user_id)
    converted = []
    cap = 10
    while (bal.total_points or 0) >= threshold and cap > 0:
        conv = convert_points_to_tokens(db, user_id, threshold, wallet.address)
        if not conv:
            break
        converted.append(conv[0])
        bal = ensure_balance(db, user_id)
        cap -= 1
    return converted

def redeem_points(
    db: Session,
    user_id: int,
    points: int,
    description: str
):
    if points <= 0:
        return None
    balance = ensure_balance(db, user_id)
    if (balance.total_points or 0) < points:
        return None
    balance.total_points = (balance.total_points or 0) - points
    db.add(balance)
    entry = models.EcoPointsTransaction(
        user_id=user_id,
        transaction_id=None,
        points=-points,
        action_type="REDEMPTION",
        description=description
    )
    db.add(entry)
    db.flush()
    db.refresh(entry)
    return entry

def convert_points_to_tokens(
    db: Session,
    user_id: int,
    points: int,
    wallet_address: str
):
    if points <= 0:
        return None
    rate = float(settings.ECO_TOKEN_CONVERSION_RATE or 1.0)
    tokens = points * rate
    wei = int(tokens * (10**18))
    red = redeem_points(db, user_id, points, "Eco points converted to ECO token")
    if not red:
        return None
    if settings.ECO_TOKEN_DEMO_MODE:
        txh = "0x" + secrets.token_hex(32)
        res = {"tx_hash": txh, "block_number": 0}
    else:
        res = blockchain.mint(wallet_address, wei)
    conv = models.EcoTokenConversion(
        user_id=user_id,
        points=points,
        token_amount=tokens,
        tx_hash=res["tx_hash"],
        status="minted"
    )
    db.add(conv)
    db.flush()
    db.refresh(conv)
    return conv, res

def get_convertible_info(db: Session, user_id: int):
    threshold = int(settings.ECO_TOKEN_AUTO_THRESHOLD or 0)
    if threshold <= 0:
        return 0, 0, threshold
    bal = ensure_balance(db, user_id)
    total = int(bal.total_points or 0)
    available = (total // threshold) * threshold
    remainder = total % threshold
    return available, remainder, threshold
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
    gamification.trigger_on_points_awarded(db, user_id, points)
    auto_convert_threshold(db, user_id)
    return entry
