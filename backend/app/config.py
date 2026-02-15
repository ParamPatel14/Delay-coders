from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "your-secret-key-keep-it-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_PRE_PING: bool = True
    DB_SSLMODE: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = "http://localhost:8000/auth/google/callback"
    
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"
    CHAIN_RPC_URL: Optional[str] = None
    ECO_TOKEN_ADDRESS: Optional[str] = None
    ECO_TOKEN_OWNER_PRIVATE_KEY: Optional[str] = None
    ECO_TOKEN_CONVERSION_RATE: float = 1.0
    ECO_TOKEN_AUTO_THRESHOLD: int = 100
    ECO_TOKEN_DEMO_MODE: bool = False
    CARBON_CREDIT_KG_PER_CREDIT: float = 1000.0
    CARBON_CREDIT_TOKEN_ADDRESS: Optional[str] = None
    CARBON_CREDIT_OWNER_PRIVATE_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore" # Ignore extra fields in .env

settings = Settings()
