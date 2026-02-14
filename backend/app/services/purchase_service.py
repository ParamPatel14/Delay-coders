from sqlalchemy.orm import Session
from .. import models

def create_order(db: Session, company_id: int, listing_id: int, credit_amount: float) -> models.MarketplaceOrder | None:
    listing = db.query(models.CarbonCreditListing).filter(models.CarbonCreditListing.id == listing_id).first()
    if not listing or listing.status != "AVAILABLE":
        return None
    if credit_amount <= 0 or abs(credit_amount - float(listing.credit_amount)) > 1e-9:
        return None
    total_price = float(listing.price_per_credit) * credit_amount
    order = models.MarketplaceOrder(
        company_id=company_id,
        listing_id=listing_id,
        credit_amount=credit_amount,
        total_price=total_price,
        status="PENDING"
    )
    listing.status = "SOLD"
    db.add(order)
    db.add(listing)
    db.commit()
    db.refresh(order)
    return order

def complete_order(db: Session, order_id: int) -> models.MarketplaceOrder | None:
    order = db.query(models.MarketplaceOrder).filter(models.MarketplaceOrder.id == order_id).first()
    if not order:
        return None
    order.status = "COMPLETED"
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
