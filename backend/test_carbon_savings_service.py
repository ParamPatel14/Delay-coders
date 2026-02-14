from app.database import SessionLocal
from app.services import carbon_savings_service
from app.models import Transaction, User

def main():
    db = SessionLocal()
    u = db.query(User).first()
    tx = db.query(Transaction).filter(Transaction.user_id == u.id).order_by(Transaction.created_at.desc()).first()
    if not tx:
        print("no transaction")
        db.close()
        return
    saving = carbon_savings_service.calculate_carbon_saved(db, tx)
    print("calc", saving)
    stored = carbon_savings_service.store_carbon_saving(db, u.id, saving)
    db.commit()
    print("stored", bool(stored))
    total = carbon_savings_service.get_total_savings(db, u.id)
    print("total", total)
    db.close()

if __name__ == "__main__":
    main()
