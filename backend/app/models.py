from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)  # Nullable for Google users
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    items = relationship("Item", back_populates="owner")
    payments = relationship("Payment", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    carbon_records = relationship("CarbonRecord", back_populates="user")
    carbon_savings = relationship("CarbonSaving", back_populates="user")
    eco_points_balance = relationship("EcoPointsBalance", back_populates="user", uselist=False)
    eco_points_transactions = relationship("EcoPointsTransaction", back_populates="user")
    eco_score = relationship("EcoScore", back_populates="user", uselist=False)
    eco_user_level = relationship("EcoUserLevel", back_populates="user", uselist=False)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    payment_id = Column(String, nullable=True)
    signature = Column(String, nullable=True)
    status = Column(String, default="created")  # created, success, failed
    amount = Column(Integer)  # Amount in paisa
    currency = Column(String, default="INR")
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="payments")
    transaction = relationship("Transaction", back_populates="payment", uselist=False)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer) # Amount in paisa
    currency = Column(String, default="INR")
    type = Column(String) # credit, debit
    category = Column(String) # payment, refund, transfer
    description = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Link to payment (optional, as some transactions might not be razorpay payments)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    
    user = relationship("User", back_populates="transactions")
    payment = relationship("Payment", back_populates="transaction")
    carbon_record = relationship("CarbonRecord", back_populates="transaction", uselist=False)
    eco_points_transaction = relationship("EcoPointsTransaction", back_populates="transaction", uselist=False)

class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, index=True)
    co2_per_unit = Column(Float)  # kg CO2 per unit (e.g., per INR)
    baseline_co2_per_unit = Column(Float, nullable=True) # Industry average for comparison
    unit = Column(String, default="kg/INR")
    description = Column(String, nullable=True)

class CarbonRecord(Base):
    __tablename__ = "carbon_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    category = Column(String) # Transport, Food, etc.
    amount = Column(Integer) # Transaction amount in paisa
    emission_factor = Column(Float) # The factor used for calculation
    carbon_emission = Column(Float) # Calculated emission in kg CO2
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="carbon_records")
    transaction = relationship("Transaction", back_populates="carbon_record")
    carbon_saving = relationship("CarbonSaving", back_populates="carbon_record", uselist=False)

class CarbonSaving(Base):
    __tablename__ = "carbon_savings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    carbon_record_id = Column(Integer, ForeignKey("carbon_records.id"))
    saved_amount = Column(Float) # Amount of CO2 saved in kg
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_type = Column(String, default="USER")  # USER or COMPANY
    owner_id = Column(Integer, nullable=True)    # user_id or company_id depending on owner_type

    user = relationship("User", back_populates="carbon_savings")
    carbon_record = relationship("CarbonRecord", back_populates="carbon_saving")

class EcoPointsBalance(Base):
    __tablename__ = "eco_points_balance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    total_points = Column(Integer, default=0)
    lifetime_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="eco_points_balance")

class EcoPointsTransaction(Base):
    __tablename__ = "eco_points_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True) # Optional link to financial transaction
    points = Column(Integer)
    action_type = Column(String) # TRANSACTION_REWARD, BONUS, PENALTY, REDEMPTION
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="eco_points_transactions")
    transaction = relationship("Transaction", back_populates="eco_points_transaction")

class EcoScore(Base):
    __tablename__ = "eco_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    score = Column(Float, default=0.0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="eco_score")

class EcoUserLevel(Base):
    __tablename__ = "eco_user_levels"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    level = Column(String, default="Beginner")
    points_required = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="eco_user_level")

class UserWallet(Base):
    __tablename__ = "user_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    address = Column(String, index=True)
    provider = Column(String, default="MetaMask")
    network = Column(String, default="polygon-amoy")
    last_connected = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    name = Column(String, nullable=True)
    wallet_address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CompanyWallet(Base):
    __tablename__ = "company_wallets"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), unique=True, index=True)
    wallet_address = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="ADMIN")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class EcoTokenConversion(Base):
    __tablename__ = "eco_token_conversions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    points = Column(Integer)
    token_amount = Column(Float)
    tx_hash = Column(String, index=True)
    status = Column(String, default="minted")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), index=True)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    badge = relationship("Badge")

class EcoStreak(Base):
    __tablename__ = "eco_streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    type = Column(String)  # transactions_count, carbon_saved, points_earned
    goal_value = Column(Float)
    reward_points = Column(Integer, default=0)
    active = Column(Boolean, default=True)

class UserChallengeProgress(Base):
    __tablename__ = "user_challenge_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), index=True)
    progress_value = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
    challenge = relationship("Challenge")

class CarbonCreditHolding(Base):
    __tablename__ = "carbon_credit_holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    carbon_amount = Column(Float, default=0.0) # kg CO2
    credit_amount = Column(Float, default=0.0) # credits (tCO2e)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")

class CarbonCreditListing(Base):
    __tablename__ = "carbon_credit_listings"

    id = Column(Integer, primary_key=True, index=True)
    credit_id = Column(Integer, ForeignKey("carbon_savings.id"))
    seller_user_id = Column(Integer, ForeignKey("users.id"), index=True)
    credit_amount = Column(Float)
    price_per_credit = Column(Float)
    status = Column(String, default="AVAILABLE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CarbonCreditPrice(Base):
    __tablename__ = "carbon_credit_prices"

    id = Column(Integer, primary_key=True, index=True)
    price_per_credit = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MarketplaceOrder(Base):
    __tablename__ = "marketplace_orders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    listing_id = Column(Integer, ForeignKey("carbon_credit_listings.id"), index=True)
    credit_amount = Column(Float)
    total_price = Column(Float)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    razorpay_payment_id = Column(String, nullable=True)
    tx_hash = Column(String, nullable=True)

class MarketplaceTransaction(Base):
    __tablename__ = "marketplace_transactions"

    id = Column(Integer, primary_key=True, index=True)
    buyer_company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    seller_user_id = Column(Integer, ForeignKey("users.id"), index=True)
    credit_amount = Column(Float)
    total_price = Column(Float)
    blockchain_tx_hash = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
