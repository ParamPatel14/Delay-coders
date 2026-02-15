from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from jose import jwt, JWTError

from ..database import get_db
from .. import models, dependencies
from ..config import settings
from ..services import (
    qr_service,
    wallet_service,
    upi_service,
    carbon,
    eco_points,
    reward_rules,
    badges,
    gemini_upi_insights_service,
)


router = APIRouter(prefix="/merchant/orders", tags=["merchant-orders"])


def _get_current_company(token: str, db: Session) -> models.Company:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        scope: str = payload.get("scope")
        if not email or scope != "company":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    comp = db.query(models.Company).filter(models.Company.email == email).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Company not found")
    return comp


@router.post("/generate-qr")
def generate_order_qr(
    payload: dict,
    token: str,
    db: Session = Depends(get_db),
):
    current_company = _get_current_company(token, db)
    order_id = payload.get("order_id")
    amount = payload.get("amount")
    items = payload.get("items") or []

    if not order_id or amount is None:
        raise HTTPException(status_code=400, detail="order_id and amount are required")

    merchant_upi_account = upi_service.get_or_create_default_merchant(db)

    qr_data = {
        "merchant_upi": merchant_upi_account.vpa,
        "merchant_id": current_company.id,
        "order_id": order_id,
        "amount": amount,
        "items": items,
    }

    existing = db.query(models.MerchantOrder).filter(
        models.MerchantOrder.order_id == order_id
    ).first()

    amount_paisa = int(float(amount) * 100)
    items_json = json.dumps(items)

    if existing:
        existing.amount = amount_paisa
        existing.items_json = items_json
        existing.status = "PENDING"
        db.add(existing)
    else:
        order = models.MerchantOrder(
            merchant_id=current_company.id,
            order_id=order_id,
            amount=amount_paisa,
            items_json=items_json,
            status="PENDING",
        )
        db.add(order)

    db.commit()

    encoded = qr_service.generate_qr_base64(json.dumps(qr_data, separators=(",", ":")))
    qr_code_url = f"data:image/png;base64,{encoded}"

    return {
        "qr_code_url": qr_code_url,
        "qr_data": qr_data,
    }


upi_router = APIRouter(prefix="/upi", tags=["upi"])


@upi_router.post("/pay")
def upi_pay(payload: dict, db: Session = Depends(get_db)):
    sender_upi_id = payload.get("sender_upi_id")
    receiver_upi_id = payload.get("receiver_upi_id")
    amount = payload.get("amount")
    order_id = payload.get("order_id")

    if not sender_upi_id or not receiver_upi_id or amount is None or not order_id:
        raise HTTPException(
            status_code=400,
            detail="sender_upi_id, receiver_upi_id, amount, and order_id are required",
        )

    try:
        amount_paisa = int(float(amount) * 100)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid amount")

    sender_wallet = wallet_service.get_wallet_by_upi(db, sender_upi_id)
    if not sender_wallet:
        raise HTTPException(status_code=400, detail="Sender wallet not found")

    if sender_wallet.balance < amount_paisa:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    receiver_wallet = wallet_service.get_wallet_by_upi(db, receiver_upi_id)
    if not receiver_wallet:
        raise HTTPException(status_code=400, detail="Receiver wallet not found")

    try:
        tx = wallet_service.transfer_balance(
            db=db,
            sender_upi=sender_upi_id,
            receiver_upi=receiver_upi_id,
            amount=amount_paisa,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    order = db.query(models.MerchantOrder).filter(
        models.MerchantOrder.order_id == order_id
    ).first()
    if order:
        order.status = "PAID"
        order.paid_at = datetime.now(timezone.utc)
        db.add(order)
        db.commit()

    return {
        "transaction_id": tx.transaction_id,
        "status": tx.status,
    }


@upi_router.post("/scan-and-pay")
def scan_and_pay(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    qr_raw = payload.get("qr_data")

    if qr_raw is None:
        raise HTTPException(
            status_code=400,
            detail="qr_data is required",
        )

    if isinstance(qr_raw, str):
        try:
            qr_data = json.loads(qr_raw)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid qr_data JSON")
    elif isinstance(qr_raw, dict):
        qr_data = qr_raw
    else:
        raise HTTPException(status_code=400, detail="qr_data must be an object or JSON string")

    merchant_upi = qr_data.get("merchant_upi")
    amount = qr_data.get("amount")
    order_id = qr_data.get("order_id")

    if not merchant_upi or amount is None or not order_id:
        raise HTTPException(
            status_code=400,
            detail="qr_data must include merchant_upi, amount, and order_id",
        )

    user_upi_account = upi_service.get_or_create_user_upi(db, current_user)
    user_upi_id = user_upi_account.vpa

    try:
        amount_paisa = int(float(amount) * 100)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid amount in qr_data")

    try:
        tx = wallet_service.transfer_balance(
            db=db,
            sender_upi=user_upi_id,
            receiver_upi=merchant_upi,
            amount=amount_paisa,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    order = db.query(models.MerchantOrder).filter(
        models.MerchantOrder.order_id == order_id
    ).first()
    items = []
    if order:
        order.status = "PAID"
        order.paid_at = datetime.now(timezone.utc)
        db.add(order)
        if order.items_json:
            try:
                items = json.loads(order.items_json)
            except json.JSONDecodeError:
                items = []
    else:
        items = qr_data.get("items") or []

    account = upi_service.resolve_vpa(db, user_upi_id)
    if not account or not account.user_id:
        raise HTTPException(status_code=400, detail="User account for UPI not found")
    user_id = account.user_id

    description = f"UPI QR payment for order {order_id}"
    transaction = models.Transaction(
        user_id=user_id,
        amount=amount_paisa,
        currency="INR",
        type="debit",
        category="UPI_QR",
        description=description,
        status="completed",
    )
    db.add(transaction)
    db.flush()
    db.refresh(transaction)

    carbon_category = "Shopping"
    carbon_record = carbon.calculate_and_record_carbon(
        db=db,
        user_id=user_id,
        transaction_id=transaction.id,
        amount=transaction.amount,
        category=carbon_category,
    )

    eco_points.award_points_for_carbon_saving(
        db=db,
        user_id=user_id,
        transaction_id=transaction.id,
        carbon_record_id=carbon_record.id,
    )
    reward_rules.apply_rules_for_transaction(
        db=db,
        user_id=user_id,
        transaction_id=transaction.id,
        carbon_record_id=carbon_record.id,
    )
    badges.award_badges_for_transaction(
        db=db,
        user_id=user_id,
        transaction_id=transaction.id,
        carbon_record_id=carbon_record.id,
    )

    eco_points.auto_convert_threshold(db, user_id)
    db.commit()
    db.refresh(transaction)

    return {
        "transaction_id": tx.transaction_id,
        "status": tx.status,
        "order_id": order_id,
        "items": items,
        "carbon_kg": carbon_record.carbon_emission,
    }


@upi_router.get("/transactions/user")
def get_user_upi_transactions(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    account = upi_service.get_or_create_user_upi(db, current_user)
    vpa = account.vpa
    rows = (
        db.query(models.UpiTransaction)
        .filter(
            (models.UpiTransaction.sender_upi_id == vpa)
            | (models.UpiTransaction.receiver_upi_id == vpa)
        )
        .order_by(models.UpiTransaction.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "transaction_id": r.transaction_id,
            "amount": r.amount,
            "sender": r.sender_upi_id,
            "receiver": r.receiver_upi_id,
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in rows
    ]


@upi_router.get("/transactions/merchant")
def get_merchant_upi_transactions(token: str, db: Session = Depends(get_db)):
    _ = _get_current_company(token, db)
    merchant_acc = upi_service.get_or_create_default_merchant(db)
    merchant_vpa = merchant_acc.vpa
    rows = (
        db.query(models.UpiTransaction)
        .filter(models.UpiTransaction.receiver_upi_id == merchant_vpa)
        .order_by(models.UpiTransaction.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "transaction_id": r.transaction_id,
            "amount": r.amount,
            "sender": r.sender_upi_id,
            "receiver": r.receiver_upi_id,
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in rows
    ]


@upi_router.get("/insights/{transaction_id}")
def get_upi_transaction_insight(
    transaction_id: str,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    upi_account = upi_service.get_or_create_user_upi(db, current_user)
    upi_tx = (
        db.query(models.UpiTransaction)
        .filter(models.UpiTransaction.transaction_id == transaction_id)
        .first()
    )
    if not upi_tx:
        raise HTTPException(status_code=404, detail="UPI transaction not found")
    if (
        upi_tx.sender_upi_id != upi_account.vpa
        and upi_tx.receiver_upi_id != upi_account.vpa
    ):
        raise HTTPException(status_code=403, detail="Not allowed to view this transaction")
    insight = gemini_upi_insights_service.analyze_transaction(
        db=db,
        transaction_id=transaction_id,
        user_id=current_user.id,
    )
    return {
        "transaction_id": transaction_id,
        "insight": insight,
    }
