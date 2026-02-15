from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, dependencies
from ..database import get_db
from ..services import wallet_service, upi_service


router = APIRouter(prefix="/wallets", tags=["wallets"])


@router.get("/me")
def get_my_wallet(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    upi_account = upi_service.get_or_create_user_upi(db, current_user)
    wallet = wallet_service.create_wallet(db, "USER", current_user.id, upi_account.vpa)
    return {
        "upi_id": wallet.upi_id,
        "balance": wallet.balance,
        "owner_type": wallet.owner_type,
        "owner_id": wallet.owner_id,
    }


@router.get("/transactions")
def get_my_upi_transactions(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    upi_account = upi_service.get_or_create_user_upi(db, current_user)
    rows = (
        db.query(models.UpiTransaction)
        .filter(
            (models.UpiTransaction.sender_upi_id == upi_account.vpa)
            | (models.UpiTransaction.receiver_upi_id == upi_account.vpa)
        )
        .order_by(models.UpiTransaction.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "transaction_id": r.transaction_id,
            "sender_upi_id": r.sender_upi_id,
            "receiver_upi_id": r.receiver_upi_id,
            "amount": r.amount,
            "status": r.status,
            "created_at": r.created_at,
            "completed_at": r.completed_at,
        }
        for r in rows
    ]


@router.post("/transfer")
def transfer(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db),
):
    receiver_upi = payload.get("receiver_upi_id")
    amount = int(payload.get("amount", 0))
    if not receiver_upi:
        raise HTTPException(status_code=400, detail="receiver_upi_id is required")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be positive")
    upi_account = upi_service.get_or_create_user_upi(db, current_user)
    try:
        tx = wallet_service.transfer_balance(
            db=db,
            sender_upi=upi_account.vpa,
            receiver_upi=receiver_upi,
            amount=amount,
        )
        return {
            "transaction_id": tx.transaction_id,
            "status": tx.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

