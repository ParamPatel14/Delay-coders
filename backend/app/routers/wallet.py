from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .. import models, schemas, dependencies
from ..database import get_db
from ..config import settings
import os, json
import httpx

router = APIRouter(prefix="/wallet", tags=["wallet"])

def is_valid_address(addr: str) -> bool:
    if not isinstance(addr, str):
        return False
    if not addr.startswith("0x") or len(addr) != 42:
        return False
    try:
        int(addr[2:], 16)
        return True
    except ValueError:
        return False

@router.get("/address")
def get_wallet_address(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    return {"address": rec.address if rec else None}

@router.put("/connect")
def connect_wallet(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    address = payload.get("address")
    provider = payload.get("provider", "MetaMask")
    network = payload.get("network", "polygon-amoy")
    if not address or not is_valid_address(address):
        raise HTTPException(status_code=400, detail="Invalid wallet address")
    rec = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    if not rec:
        rec = models.UserWallet(user_id=current_user.id, address=address, provider=provider, network=network)
    else:
        rec.address = address
        rec.provider = provider
        rec.network = network
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"address": rec.address}

@router.get("/eco-balance")
def get_eco_token_balance(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(models.UserWallet).filter(models.UserWallet.user_id == current_user.id).first()
    if not rec or not rec.address:
        raise HTTPException(status_code=404, detail="Wallet not connected")
    rpc = settings.CHAIN_RPC_URL or "https://rpc-amoy.polygon.technology"
    token_addr = settings.ECO_TOKEN_ADDRESS
    if not token_addr:
        try:
            path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "blockchain", "deployments", "eco_token_polygon.json")
            if os.path.exists(path):
                with open(path, "r") as f:
                    data = json.load(f)
                    token_addr = data.get("address")
        except Exception:
            token_addr = None
    if not token_addr:
        raise HTTPException(status_code=500, detail="RPC or token address not configured")
    addr = rec.address.lower()
    selector = "0x70a08231"  # balanceOf(address)
    hex_addr = addr[2:]
    padded = hex_addr.rjust(64, "0")
    data = selector + padded
    body = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [
            {"to": settings.ECO_TOKEN_ADDRESS, "data": data},
            "latest"
        ],
        "id": 1
    }
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(rpc, json=body)
            resp.raise_for_status()
            out = resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RPC error: {str(e)}")
    result = out.get("result")
    if not result or not isinstance(result, str):
        raise HTTPException(status_code=500, detail="Invalid RPC response")
    try:
        value = int(result, 16)
    except Exception:
        value = 0
    return {"address": rec.address, "balance_wei": value, "balance": value / (10**18)}
