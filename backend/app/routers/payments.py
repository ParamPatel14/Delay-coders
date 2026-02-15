from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import payment_service, upi_service, qr_service

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

@router.post("/order-by-category", response_model=schemas.PaymentResponse)
def create_order_by_category(
    payment: schemas.PaymentCategoryCreate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    db_payment = payment_service.create_order_by_category(
        db=db,
        user=current_user,
        payload=payment,
    )
    return db_payment

@router.post("/order", response_model=schemas.PaymentResponse)
def create_order(
    payment: schemas.PaymentCreate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    db_payment = payment_service.create_order(
        db=db,
        user=current_user,
        payload=payment,
    )
    return db_payment

@router.post("/verify")
def verify_payment(
    payment_data: schemas.PaymentVerify,
    db: Session = Depends(get_db),
):
    try:
        transaction = payment_service.verify_and_process_payment(
            db=db,
            payload=payment_data,
        )
        return {"status": "ok", "transaction_id": transaction.id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction processing failed: {str(e)}",
        )


@router.get(
    "/upi/account",
    response_model=schemas.UpiAccountResponse,
)
def get_upi_account(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    account = upi_service.get_or_create_user_upi(db, current_user)
    return account


@router.get(
    "/upi/history",
    response_model=List[schemas.UpiPaymentHistoryItem],
)
def upi_history(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    items = payment_service.get_upi_history_for_user(db, current_user)
    return items


@router.get(
    "/upi/qr/{order_id}",
    response_model=schemas.UpiQrResponse,
)
def upi_qr_for_order(
    order_id: str,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    payment = (
        db.query(models.Payment)
        .filter(models.Payment.order_id == order_id, models.Payment.user_id == current_user.id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    merchant = upi_service.get_or_create_default_merchant(db)
    upi_payment = upi_service.create_upi_payment_for_order(
        db=db,
        payment=payment,
        payer=upi_service.get_or_create_user_upi(db, current_user),
        payee=merchant,
        note=None,
    )
    upi_uri = qr_service.generate_upi_uri(
        payee_vpa=merchant.vpa,
        amount_paisa=payment.amount,
        payee_name=merchant.display_name or merchant.vpa,
        note=None,
        txn_ref=upi_payment.request_id,
    )
    qr_image_base64 = qr_service.generate_qr_base64(upi_uri)
    return schemas.UpiQrResponse(
        request_id=upi_payment.request_id,
        upi_uri=upi_uri,
        qr_image_base64=qr_image_base64,
    )
