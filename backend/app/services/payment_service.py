from sqlalchemy.orm import Session
import uuid
from .. import models, schemas
from . import upi_service, carbon, eco_points, reward_rules, badges


def create_order_by_category(
    db: Session,
    user: models.User,
    payload: schemas.PaymentCategoryCreate,
) -> models.Payment:
    amount_in_paisa = payload.amount * 100
    order_id = f"ORDER_{uuid.uuid4().hex[:16]}"
    payment = models.Payment(
        order_id=order_id,
        amount=amount_in_paisa,
        currency=payload.currency,
        status="created",
        user_id=user.id,
    )
    db.add(payment)
    payer_upi = upi_service.get_or_create_user_upi(db, user)
    merchant_upi = upi_service.get_or_create_default_merchant(db)
    upi_service.create_upi_payment_for_order(
        db=db,
        payment=payment,
        payer=payer_upi,
        payee=merchant_upi,
        note=None,
    )
    db.commit()
    db.refresh(payment)
    return payment


def create_order(
    db: Session,
    user: models.User,
    payload: schemas.PaymentCreate,
) -> models.Payment:
    amount_in_paisa = payload.amount * 100
    order_id = f"ORDER_{uuid.uuid4().hex[:16]}"
    payment = models.Payment(
        order_id=order_id,
        amount=amount_in_paisa,
        currency=payload.currency,
        status="created",
        user_id=user.id,
    )
    db.add(payment)
    payer_upi = upi_service.get_or_create_user_upi(db, user)
    merchant_upi = upi_service.get_or_create_default_merchant(db)
    upi_service.create_upi_payment_for_order(
        db=db,
        payment=payment,
        payer=payer_upi,
        payee=merchant_upi,
        note=None,
    )
    db.commit()
    db.refresh(payment)
    return payment


def verify_and_process_payment(
    db: Session,
    payload: schemas.PaymentVerify,
) -> models.Transaction:
    payment = (
        db.query(models.Payment)
        .filter(models.Payment.order_id == payload.order_id)
        .first()
    )
    if not payment:
        raise ValueError("Order not found")
    payment.status = "success"
    upi_service.complete_upi_payment(
        db=db,
        payment=payment,
        upi_vpa=payload.upi_vpa,
    )
    tx_category = payload.category or "payment"
    subcat = payload.subcategory or None
    description = f"Payment for Order {payment.order_id}"
    if tx_category and subcat:
        description = f"{tx_category} - {subcat} | Order {payment.order_id}"
    transaction = models.Transaction(
        user_id=payment.user_id,
        amount=payment.amount,
        currency=payment.currency,
        type="debit",
        category=tx_category,
        description=description,
        status="completed",
        payment_id=payment.id,
    )
    db.add(transaction)
    db.flush()
    db.refresh(transaction)
    carbon_map = {
        "Gas": "Utilities",
        "Shopping": "Shopping",
        "Travel": "Travel",
        "Sustainable Travel": "Travel",
        "Others": "Other",
        "payment": "Shopping",
    }
    carbon_category = carbon_map.get(tx_category, "Other")
    carbon_record = carbon.calculate_and_record_carbon(
        db=db,
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        amount=transaction.amount,
        category=carbon_category,
    )
    eco_points.award_points_for_carbon_saving(
        db=db,
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        carbon_record_id=carbon_record.id,
    )
    reward_rules.apply_rules_for_transaction(
        db=db,
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        carbon_record_id=carbon_record.id,
    )
    badges.award_badges_for_transaction(
        db=db,
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        carbon_record_id=carbon_record.id,
    )
    db.commit()
    db.refresh(transaction)
    return transaction


def get_upi_history_for_user(db: Session, user: models.User) -> list[models.UpiPayment]:
    account = upi_service.get_or_create_user_upi(db, user)
    return upi_service.get_history_for_vpa(db, account.vpa)

