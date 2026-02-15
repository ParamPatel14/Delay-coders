from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import models
import uuid

UPI_SUFFIX = "ecopay"


def _normalize_local_part(local_part: str) -> str:
    cleaned = "".join(ch for ch in local_part.lower() if ch.isalnum())
    return cleaned or "user"


def _generate_vpa_candidate(base: str) -> str:
    base_clean = _normalize_local_part(base)
    return f"{base_clean}@{UPI_SUFFIX}"


def _ensure_unique_vpa(db: Session, candidate: str) -> str:
    vpa = candidate
    counter = 1
    while db.query(models.UpiAccount).filter(models.UpiAccount.vpa == vpa).first():
        vpa = f"{candidate.split('@')[0]}{counter}@{UPI_SUFFIX}"
        counter += 1
    return vpa


def get_or_create_user_upi(db: Session, user: models.User) -> models.UpiAccount:
    existing = (
        db.query(models.UpiAccount)
        .filter(models.UpiAccount.user_id == user.id, models.UpiAccount.is_active == True)
        .first()
    )
    if existing:
        return existing
    local_part = user.email.split("@")[0] if user.email and "@" in user.email else f"user{user.id}"
    candidate = _generate_vpa_candidate(local_part)
    vpa = _ensure_unique_vpa(db, candidate)
    account = models.UpiAccount(
        user_id=user.id,
        vpa=vpa,
        display_name=user.full_name or user.email or vpa,
        is_merchant=False,
    )
    db.add(account)
    db.flush()
    db.refresh(account)
    return account


def get_or_create_default_merchant(db: Session) -> models.UpiAccount:
    existing = (
        db.query(models.UpiAccount)
        .filter(models.UpiAccount.is_merchant == True, models.UpiAccount.is_active == True)
        .order_by(models.UpiAccount.id.asc())
        .first()
    )
    if existing:
        return existing
    vpa = _ensure_unique_vpa(db, _generate_vpa_candidate("merchant"))
    account = models.UpiAccount(
        vpa=vpa,
        display_name="GreenZaction Merchant",
        is_merchant=True,
        is_active=True,
    )
    db.add(account)
    db.flush()
    db.refresh(account)
    return account


def resolve_vpa(db: Session, vpa: str) -> models.UpiAccount | None:
    return db.query(models.UpiAccount).filter(
        models.UpiAccount.vpa == vpa, models.UpiAccount.is_active == True
    ).first()


def create_upi_payment_for_order(
    db: Session,
    payment: models.Payment,
    payer: models.UpiAccount,
    payee: models.UpiAccount,
    note: str | None = None,
) -> models.UpiPayment:
    existing = (
        db.query(models.UpiPayment)
        .filter(models.UpiPayment.payment_id == payment.id)
        .first()
    )
    if existing:
        return existing
    request_id = f"UPI_REQ_{uuid.uuid4().hex[:16]}"
    upi_payment = models.UpiPayment(
        request_id=request_id,
        payer_vpa=payer.vpa,
        payee_vpa=payee.vpa,
        amount=payment.amount,
        currency=payment.currency,
        note=note,
        status="PENDING",
        payment_id=payment.id,
    )
    db.add(upi_payment)
    db.flush()
    db.refresh(upi_payment)
    return upi_payment


def complete_upi_payment(
    db: Session,
    payment: models.Payment,
    upi_vpa: str | None = None,
) -> models.UpiPayment | None:
    upi_payment = (
        db.query(models.UpiPayment)
        .filter(models.UpiPayment.payment_id == payment.id)
        .first()
    )
    if not upi_payment:
        payer_account = None
        if upi_vpa:
            payer_account = resolve_vpa(db, upi_vpa)
        if not payer_account and payment.user_id:
            user = db.query(models.User).filter(models.User.id == payment.user_id).first()
            if user:
                payer_account = get_or_create_user_upi(db, user)
        payee_account = get_or_create_default_merchant(db)
        upi_payment = create_upi_payment_for_order(
            db=db,
            payment=payment,
            payer=payer_account,
            payee=payee_account,
            note=None,
        )
    if upi_vpa and upi_payment.payer_vpa != upi_vpa:
        upi_payment.payer_vpa = upi_vpa
    if not upi_payment.upi_txn_id:
        upi_payment.upi_txn_id = f"ECOUPI{uuid.uuid4().hex[:16].upper()}"
    upi_payment.status = "COMPLETED"
    db.flush()
    db.refresh(upi_payment)
    return upi_payment


def get_history_for_vpa(db: Session, vpa: str) -> list[models.UpiPayment]:
    return (
        db.query(models.UpiPayment)
        .filter(
            or_(
                models.UpiPayment.payer_vpa == vpa,
                models.UpiPayment.payee_vpa == vpa,
            )
        )
        .order_by(models.UpiPayment.created_at.desc())
        .all()
    )


def create_transaction(
    db: Session,
    sender_upi: str,
    receiver_upi: str,
    amount: int,
) -> models.UpiTransaction:
    if amount <= 0:
        raise ValueError("Amount must be positive")
    tx_id = f"UPITXN_{uuid.uuid4().hex[:18]}"
    rec = models.UpiTransaction(
        transaction_id=tx_id,
        sender_upi_id=sender_upi,
        receiver_upi_id=receiver_upi,
        amount=amount,
        status="PENDING",
    )
    db.add(rec)
    db.flush()
    db.refresh(rec)
    return rec


def verify_transaction(
    db: Session,
    transaction_id: str,
) -> models.UpiTransaction:
    rec = (
        db.query(models.UpiTransaction)
        .filter(models.UpiTransaction.transaction_id == transaction_id)
        .first()
    )
    if not rec:
        raise ValueError("UPI transaction not found")
    return rec


def complete_transaction(
    db: Session,
    transaction_id: str,
    completed_at,
) -> models.UpiTransaction:
    rec = (
        db.query(models.UpiTransaction)
        .filter(models.UpiTransaction.transaction_id == transaction_id)
        .first()
    )
    if not rec:
        raise ValueError("UPI transaction not found")
    rec.status = "SUCCESS"
    rec.completed_at = completed_at
    db.flush()
    db.refresh(rec)
    return rec
