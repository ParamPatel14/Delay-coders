from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db
from ..services import marketplace_service
from ..services import pricing_service
from ..config import settings
from jose import jwt, JWTError
from .. import models
from ..database import get_db

import razorpay
from ..services import purchase_service
from ..services import logging_service
from ..services import credit_transfer_service
from sqlalchemy import func

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.get("/listings")
def get_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    rows = marketplace_service.get_available_listings(db, skip, limit)
    return [
        {
            "id": r.id,
            "credit_id": r.credit_id,
            "seller_user_id": r.seller_user_id,
            "credit_amount": r.credit_amount,
            "price_per_credit": r.price_per_credit,
            "status": r.status,
            "created_at": r.created_at
        } for r in rows
    ]

@router.get("/price")
def get_price(db: Session = Depends(get_db)):
    price = pricing_service.get_price(db)
    return {"price_per_credit": price}

@router.post("/price")
def set_price(payload: dict, db: Session = Depends(get_db)):
    price = float(payload.get("price_per_credit", 0.0))
    rec = pricing_service.set_price(db, price)
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid price")
    return {"price_per_credit": rec.price_per_credit, "created_at": rec.created_at}

@router.get("/stats")
def marketplace_stats(db: Session = Depends(get_db)):
    available_count = db.query(func.count(models.CarbonCreditListing.id))\
        .filter(models.CarbonCreditListing.status == "AVAILABLE").scalar() or 0
    total_available_credits = db.query(func.sum(models.CarbonCreditListing.credit_amount))\
        .filter(models.CarbonCreditListing.status == "AVAILABLE").scalar() or 0.0
    avg_price = db.query(func.avg(models.CarbonCreditListing.price_per_credit))\
        .filter(models.CarbonCreditListing.status == "AVAILABLE").scalar() or 0.0
    sold_count = db.query(func.count(models.MarketplaceOrder.id))\
        .filter(models.MarketplaceOrder.status == "COMPLETED").scalar() or 0
    total_sold_credits = db.query(func.sum(models.MarketplaceOrder.credit_amount))\
        .filter(models.MarketplaceOrder.status == "COMPLETED").scalar() or 0.0
    return {
        "available_count": int(available_count),
        "total_available_credits": float(total_available_credits),
        "avg_price_per_credit": float(avg_price or 0.0),
        "sold_count": int(sold_count),
        "total_sold_credits": float(total_sold_credits)
    }
@router.post("/listings")
def create_listing(
    payload: dict,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(get_db)
):
    credit_id = int(payload.get("credit_id", 0))
    credit_amount = float(payload.get("credit_amount", 0.0))
    price_per_credit = float(payload.get("price_per_credit", 0.0))
    rec = marketplace_service.create_listing(db, current_user.id, credit_id, credit_amount, price_per_credit)
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid listing")
    db.commit()
    db.refresh(rec)
    return {
        "id": rec.id,
        "credit_id": rec.credit_id,
        "seller_user_id": rec.seller_user_id,
        "credit_amount": rec.credit_amount,
        "price_per_credit": rec.price_per_credit,
        "status": rec.status,
        "created_at": rec.created_at
    }

def _get_current_company(token: str, db: Session) -> models.Company:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        scope: str = payload.get("scope")
        if email is None or scope != "company":
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    comp = db.query(models.Company).filter(models.Company.email == email).first()
    if not comp:
        raise HTTPException(status_code=401, detail="Company not found")
    return comp

@router.post("/company-order")
def create_company_order(payload: dict, token: str, db: Session = Depends(get_db)):
    comp = _get_current_company(token, db)
    listing_id = int(payload.get("listing_id", 0))
    credit_amount = float(payload.get("credit_amount", 0.0))
    order = purchase_service.create_order(db, comp.id, listing_id, credit_amount)
    if not order:
        raise HTTPException(status_code=400, detail="Unable to create order")
    amount_paisa = int(order.total_price * 100)
    try:
        rz = client.order.create({"amount": amount_paisa, "currency": "INR", "receipt": f"cmp_order_{order.id}", "notes": {"company_id": comp.id, "order_id": order.id}})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    logging_service.log_event(db, "TRANSACTION", None, f"company {comp.id} order {order.id} created")
    return {"marketplace_order_id": order.id, "razorpay_order_id": rz["id"], "amount": amount_paisa, "currency": "INR", "key": settings.RAZORPAY_KEY_ID}

@router.post("/company-verify")
def verify_company_payment(payload: dict, token: str, db: Session = Depends(get_db)):
    comp = _get_current_company(token, db)
    marketplace_order_id = int(payload.get("marketplace_order_id", 0))
    razorpay_order_id = payload.get("razorpay_order_id")
    razorpay_payment_id = payload.get("razorpay_payment_id")
    razorpay_signature = payload.get("razorpay_signature")
    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    order = db.query(models.MarketplaceOrder).filter(models.MarketplaceOrder.id == marketplace_order_id, models.MarketplaceOrder.company_id == comp.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "COMPLETED"
    order.razorpay_payment_id = razorpay_payment_id
    db.add(order)
    db.commit()
    db.refresh(order)
    logging_service.log_event(db, "TRANSACTION", None, f"company {comp.id} order {order.id} payment {razorpay_payment_id}")
    res = credit_transfer_service.transfer_to_company(db, order.id)
    if not res:
        raise HTTPException(status_code=400, detail="Token transfer failed")
    listing = db.query(models.CarbonCreditListing).filter(models.CarbonCreditListing.id == order.listing_id).first()
    if listing:
        credit = db.query(models.CarbonSaving).filter(models.CarbonSaving.id == listing.credit_id).first()
        if credit:
            credit.owner_type = "COMPANY"
            credit.owner_id = comp.id
            db.add(credit)
        seller_tx = models.Transaction(
            user_id=listing.seller_user_id,
            amount=int(order.total_price * 100),
            currency="INR",
            type="credit",
            category="marketplace_sale",
            description=f"Sale of {order.credit_amount} credits to company {comp.id}",
            status="completed",
            payment_id=None,
        )
        db.add(seller_tx)
    tx = models.MarketplaceTransaction(
        buyer_company_id=comp.id,
        seller_user_id=listing.seller_user_id if listing else None,
        credit_amount=order.credit_amount,
        total_price=order.total_price,
        blockchain_tx_hash=res.get("tx_hash"),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return {"status": "ok", "tx_hash": res.get("tx_hash")}

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    rows = db.query(models.MarketplaceTransaction)\
        .order_by(models.MarketplaceTransaction.created_at.desc())\
        .offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "buyer_company_id": r.buyer_company_id,
            "seller_user_id": r.seller_user_id,
            "credit_amount": r.credit_amount,
            "total_price": r.total_price,
            "blockchain_tx_hash": r.blockchain_tx_hash,
            "created_at": r.created_at
        } for r in rows
    ]
@router.post("/purchase")
def purchase(payload: dict, token: str, db: Session = Depends(get_db)):
    comp = _get_current_company(token, db)
    listing_id = int(payload.get("listing_id", 0))
    credit_amount = float(payload.get("credit_amount", 0.0))
    listing = db.query(models.CarbonCreditListing).filter(models.CarbonCreditListing.id == listing_id).first()
    if not listing or listing.status != "AVAILABLE":
        raise HTTPException(status_code=404, detail="Listing not available")
    if credit_amount <= 0 or abs(credit_amount - float(listing.credit_amount)) > 1e-9:
        raise HTTPException(status_code=400, detail="Credit amount must match listing")
    total_price = float(listing.price_per_credit) * credit_amount
    order = models.MarketplaceOrder(
        company_id=comp.id,
        listing_id=listing.id,
        credit_amount=credit_amount,
        total_price=total_price,
        status="PENDING"
    )
    listing.status = "SOLD"
    db.add(order)
    db.add(listing)
    db.commit()
    db.refresh(order)
    return {
        "id": order.id,
        "company_id": order.company_id,
        "listing_id": order.listing_id,
        "credit_amount": order.credit_amount,
        "total_price": order.total_price,
        "status": order.status,
        "created_at": order.created_at
    }
