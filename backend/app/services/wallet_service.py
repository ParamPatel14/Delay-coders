from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .. import models
from . import upi_service


def create_wallet(db: Session, owner_type: str, owner_id: int, upi_id: str | None = None) -> models.Wallet:
    existing = (
        db.query(models.Wallet)
        .filter(models.Wallet.owner_type == owner_type, models.Wallet.owner_id == owner_id)
        .first()
    )
    if existing:
        return existing
    vpa = upi_id
    if not vpa and owner_type == "USER":
        user = db.query(models.User).filter(models.User.id == owner_id).first()
        if user:
            acc = upi_service.get_or_create_user_upi(db, user)
            vpa = acc.vpa
    if not vpa and owner_type == "MERCHANT":
        acc = upi_service.get_or_create_default_merchant(db)
        vpa = acc.vpa
    if not vpa:
        raise ValueError("Unable to determine UPI ID for wallet")
    wallet = models.Wallet(
        owner_type=owner_type,
        owner_id=owner_id,
        upi_id=vpa,
        balance=0,
    )
    db.add(wallet)
    db.flush()
    db.refresh(wallet)
    return wallet


def get_wallet_by_upi(db: Session, upi_id: str) -> models.Wallet | None:
    return db.query(models.Wallet).filter(models.Wallet.upi_id == upi_id).first()


def get_wallet_balance(db: Session, upi_id: str) -> int:
    wallet = get_wallet_by_upi(db, upi_id)
    if not wallet:
        raise ValueError("Wallet not found")
    return wallet.balance


def update_balance(db: Session, upi_id: str, delta_amount: int) -> models.Wallet:
    wallet = get_wallet_by_upi(db, upi_id)
    if not wallet:
        raise ValueError("Wallet not found")
    new_balance = wallet.balance + delta_amount
    if new_balance < 0:
        raise ValueError("Insufficient balance")
    wallet.balance = new_balance
    db.flush()
    db.refresh(wallet)
    return wallet


def transfer_balance(
    db: Session,
    sender_upi: str,
    receiver_upi: str,
    amount: int,
) -> models.UpiTransaction:
    if amount <= 0:
        raise ValueError("Amount must be positive")
    sender_wallet = get_wallet_by_upi(db, sender_upi)
    if not sender_wallet:
        raise ValueError("Sender wallet not found")
    receiver_wallet = get_wallet_by_upi(db, receiver_upi)
    if not receiver_wallet:
        raise ValueError("Receiver wallet not found")
    if sender_wallet.balance < amount:
        raise ValueError("Insufficient balance")
    upi_txn = upi_service.create_transaction(
        db=db,
        sender_upi=sender_upi,
        receiver_upi=receiver_upi,
        amount=amount,
    )
    sender_wallet.balance -= amount
    receiver_wallet.balance += amount
    now = datetime.now(timezone.utc)
    upi_service.complete_transaction(
        db=db,
        transaction_id=upi_txn.transaction_id,
        completed_at=now,
    )
    db.commit()
    db.refresh(upi_txn)
    return upi_txn

