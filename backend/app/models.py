from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
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

