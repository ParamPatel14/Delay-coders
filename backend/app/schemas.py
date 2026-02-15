from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

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

class CarbonFootprintSummary(BaseModel):
    total_carbon: float
    monthly_carbon: float # Current month
    daily_average: float

class MonthlyCarbonBreakdown(BaseModel):
    month: str # YYYY-MM
    total_carbon: float

class CarbonRecordBase(BaseModel):
    category: str
    amount: int
    emission_factor: float
    carbon_emission: float

class CarbonRecordCreate(CarbonRecordBase):
    user_id: int
    transaction_id: int

class CarbonRecordResponse(CarbonRecordBase):
    id: int
    user_id: int
    transaction_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    scope: Optional[str] = None

class CompanyBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    wallet_address: Optional[str] = None

class CompanyCreate(CompanyBase):
    password: str

class CompanyLogin(BaseModel):
    email: EmailStr
    password: str

class CompanyOut(CompanyBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class GoogleLogin(BaseModel):
    token: str # ID token from frontend

class PaymentCreate(BaseModel):
    amount: int  # Amount in INR (will be converted to paisa)
    currency: str = "INR"

class PaymentCategoryCreate(BaseModel):
    amount: int  # Amount in INR (will be converted to paisa)
    currency: str = "INR"
    category: str
    subcategory: Optional[str] = None

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    category: Optional[str] = None
    subcategory: Optional[str] = None

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

 

class EmissionFactorBase(BaseModel):
    category: str
    co2_per_unit: float
    baseline_co2_per_unit: Optional[float] = None # New field
    unit: str
    description: Optional[str] = None

class EmissionFactorCreate(EmissionFactorBase):
    pass

class EmissionFactorResponse(EmissionFactorBase):
    id: int

    class Config:
        from_attributes = True
 
class EcoScoreResponse(BaseModel):
    score: float
    last_updated: Optional[datetime] = None
 
    class Config:
        from_attributes = True

class EcoPointsBalanceBase(BaseModel):
    total_points: int
    lifetime_points: int

class EcoPointsBalanceResponse(EcoPointsBalanceBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EcoPointsTransactionBase(BaseModel):
    points: int
    action_type: str
    description: Optional[str] = None

class EcoPointsTransactionResponse(EcoPointsTransactionBase):
    id: int
    user_id: int
    transaction_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
 
class EcoUserLevelResponse(BaseModel):
    level: str
    points_required: int
    last_updated: Optional[datetime] = None
 
    class Config:
        from_attributes = True
 
class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime] = None
 
    class Config:
        from_attributes = True
 
class ChallengeStatusResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    type: str
    goal_value: float
    reward_points: int
    progress_value: float
    completed: bool
    completed_at: Optional[datetime] = None
 
    class Config:
        from_attributes = True
 
class BadgeResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
 
    class Config:
        from_attributes = True
 
class LeaderboardEntryResponse(BaseModel):
    user_id: int
    full_name: Optional[str] = None
    email: EmailStr
    lifetime_points: int
    level: str
 
class DashboardSummary(BaseModel):
    total_spent: int
    transaction_count: int
    recent_transactions: List[TransactionResponse]
    carbon_summary: CarbonFootprintSummary
    recent_carbon_records: List[CarbonRecordResponse]
    total_carbon_saved: float
    carbon_saved: float | None = None
    carbon_credits: float | None = None
    carbon_credit_tokens: float | None = None
    eco_points_balance: Optional[EcoPointsBalanceResponse] = None
    eco_score: Optional[EcoScoreResponse] = None
    recent_rewards: List[EcoPointsTransactionResponse] = []
    user_level: Optional[EcoUserLevelResponse] = None
    badges: List[BadgeResponse] = []
    streak: Optional[StreakResponse] = None
    challenges: List[ChallengeStatusResponse] = []
    leaderboard: List[LeaderboardEntryResponse] = []
 
class EcoTokenConversionResponse(BaseModel):
    tx_hash: str
    points_converted: int
    token_amount: float

class TokenBalanceResponse(BaseModel):
    wallet_address: str
    eco_tokens: float

class TokenHistoryItem(BaseModel):
    tx_hash: str
    token_amount: float
    points: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConvertiblePointsResponse(BaseModel):
    points_available: int
    remainder: int
    threshold: int

class CarbonCreditBalanceResponse(BaseModel):
    carbon_saved: float
    carbon_credits: float
    carbon_credit_tokens: float
    wallet_address: Optional[str] = None

class CarbonCreditHistoryItem(BaseModel):
    created_at: datetime
    carbon_saved: float
    carbon_credits: float
