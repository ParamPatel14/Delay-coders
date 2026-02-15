from app.database import SessionLocal
from app import models, schemas
from app.services import company_auth_service


DEMO_EMAIL = "feifei.li@stanford.edu"
DEMO_NAME = "Stanford AI Lab"
DEMO_PASSWORD = "company123"


def ensure_demo_company(db) -> models.Company:
    comp = db.query(models.Company).filter(models.Company.email == DEMO_EMAIL).first()
    if comp:
        return comp
    data = schemas.CompanyCreate(
        email=DEMO_EMAIL,
        name=DEMO_NAME,
        password=DEMO_PASSWORD,
        wallet_address=None,
    )
    comp = company_auth_service.register_company(db, data)
    return comp


def seed_demo_purchases(db, comp: models.Company) -> None:
    existing_orders = (
        db.query(models.MarketplaceOrder)
        .filter(models.MarketplaceOrder.company_id == comp.id)
        .count()
    )
    if existing_orders > 0:
        print(f"Company already has {existing_orders} marketplace orders, skipping purchase seeding.")
        return
    listings = (
        db.query(models.CarbonCreditListing)
        .filter(models.CarbonCreditListing.status == "AVAILABLE")
        .order_by(models.CarbonCreditListing.id.asc())
        .limit(2)
        .all()
    )
    if not listings:
        print("No AVAILABLE listings found to seed purchases.")
        return
    for idx, listing in enumerate(listings, start=1):
        credit_amount = float(listing.credit_amount or 0.0)
        price_per_credit = float(listing.price_per_credit or 0.0)
        if credit_amount <= 0 or price_per_credit <= 0:
            continue
        total_price = price_per_credit * credit_amount
        order = models.MarketplaceOrder(
            company_id=comp.id,
            listing_id=listing.id,
            credit_amount=credit_amount,
            total_price=total_price,
            status="COMPLETED",
        )
        listing.status = "SOLD"
        db.add(order)
        db.add(listing)
        db.flush()
        db.refresh(order)
        tx = models.MarketplaceTransaction(
            buyer_company_id=comp.id,
            seller_user_id=listing.seller_user_id,
            credit_amount=order.credit_amount,
            total_price=order.total_price,
            blockchain_tx_hash=f"0xDEMO{order.id:04d}",
        )
        db.add(tx)
        print(
            f"Seeded demo purchase #{idx}: "
            f"{order.credit_amount} credits for company {comp.id} "
            f"(order_id={order.id}, listing_id={listing.id})"
        )
    db.commit()


def main():
    db = SessionLocal()
    try:
        comp = ensure_demo_company(db)
        print("Demo company:")
        print(f"  id: {comp.id}")
        print(f"  email: {DEMO_EMAIL}")
        print(f"  name: {DEMO_NAME}")
        print(f"  password: {DEMO_PASSWORD}")
        seed_demo_purchases(db, comp)
    finally:
        db.close()


if __name__ == "__main__":
    main()

