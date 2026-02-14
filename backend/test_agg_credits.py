from app.database import SessionLocal
from app.services import carbon_aggregation_service, carbon_credit_service
from app.models import User

def main():
    db = SessionLocal()
    summary = carbon_aggregation_service.aggregate_summary(db)
    print("aggregate", summary)
    # Recalculate holdings for all users
    users = db.query(User).all()
    for u in users:
        carbon_credit_service.recalculate_user_holding(db, u.id)
    db.commit()
    total = carbon_credit_service.get_total_credits(db)
    print("total_credits", total)
    db.close()

if __name__ == "__main__":
    main()
