from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleLogin(BaseModel):
    token: str # ID token from frontend

class PaymentCreate(BaseModel):
    amount: int  # Amount in INR (will be converted to paisa)
    currency: str = "INR"

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

from datetime import datetime

class PaymentResponse(BaseModel):
    id: int
    order_id: str
    status: str
    amount: int
    currency: str

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    amount: int
    currency: str
    type: str
    category: str
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    payment_id: Optional[int] = None

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_spent: int
    transaction_count: int
    recent_transactions: List[TransactionResponse]

class EmissionFactorBase(BaseModel):
    category: str
    co2_per_unit: float
    unit: str
    description: Optional[str] = None

class EmissionFactorCreate(EmissionFactorBase):
    pass

class EmissionFactorResponse(EmissionFactorBase):
    id: int

    class Config:
        from_attributes = True
