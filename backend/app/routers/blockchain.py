from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, dependencies
from ..database import get_db
from ..config import settings
from ..services import blockchain
from decimal import Decimal

router = APIRouter(prefix="/blockchain", tags=["blockchain"])

@router.get("/balance/{address}")
def get_balance(address: str, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(get_db)):
    if not settings.CHAIN_RPC_URL or not settings.ECO_TOKEN_ADDRESS:
        raise HTTPException(status_code=500, detail="Chain not configured")
    try:
        bal = blockchain.get_balance(address)
        return {"address": address, "balance": str(Decimal(bal) / Decimal(10**18))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mint")
def mint(payload: dict, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(get_db)):
    to = payload.get("to")
    amount = payload.get("amount")
    if not settings.ECO_TOKEN_OWNER_PRIVATE_KEY:
        raise HTTPException(status_code=500, detail="Owner key not configured")
    if not isinstance(to, str) or not amount:
        raise HTTPException(status_code=400, detail="Invalid payload")
    try:
        amount_wei = int(Decimal(str(amount)) * Decimal(10**18))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid amount")
    try:
        res = blockchain.mint(to, amount_wei)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
