from app.database import SessionLocal
from app import models, utils
from app.services import wallet_service, upi_service


USER_EMAIL = "parampatel0714@gmail.com"
USER_PASSWORD = "param12345"
USER_NAME = "Param Patel"


def main():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == USER_EMAIL).first()
        if not user:
            hashed = utils.get_password_hash(USER_PASSWORD)
            user = models.User(
                email=USER_EMAIL,
                hashed_password=hashed,
                full_name=USER_NAME,
            )
            db.add(user)
            db.flush()
            db.refresh(user)
            print("created_user", user.id, user.email)

        acc = upi_service.get_or_create_user_upi(db, user)
        vpa = acc.vpa
        print("user_vpa", vpa)

        wallet = wallet_service.get_wallet_by_upi(db, vpa)
        if not wallet:
            wallet = wallet_service.create_wallet(db, "USER", user.id, vpa)

        wallet.balance = 500_000  # ₹5000 in paisa
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        print("wallet_topped_up", wallet.upi_id, wallet.balance)

    finally:
        db.close()


if __name__ == "__main__":
    main()
