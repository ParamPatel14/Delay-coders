from app.database import SessionLocal
from app.models import User, UserWallet
from app.services import carbon_credit_service

def main():
    db = SessionLocal()
    u = db.query(User).first()
    if not u:
        print("no user")
        return
    wallet = db.query(UserWallet).filter(UserWallet.user_id == u.id).first()
    if not wallet:
        print("no wallet")
        return
    holding = carbon_credit_service.generate_carbon_credits(db, u.id)
    print("holding", holding.carbon_amount, holding.credit_amount)
    res = carbon_credit_service.mint_credit_tokens(db, u.id)
    db.commit()
    print("mint_res", res)
    db.close()

if __name__ == "__main__":
    main()
