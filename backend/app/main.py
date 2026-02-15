from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, get_db, SessionLocal
from . import models, schemas, dependencies
from .routers import auth, payments, transactions, emissions, carbon, eco_points, achievements, gamification, dashboard, wallet, blockchain, tokens, carbon_credits, companies, marketplace, admin
from .services import badges, challenges, marketplace_service
from .services import logging_service
from fastapi.responses import JSONResponse

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GreenZaction API")

# Seed emission factors on startup
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        emissions.seed_emission_factors(db)
        badges.seed_default_badges(db)
        challenges.seed_default_challenges(db)
        marketplace_service.seed_demo_listings(db)
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(payments.router)
app.include_router(transactions.router)
app.include_router(emissions.router)
app.include_router(carbon.router)
app.include_router(eco_points.router)
app.include_router(achievements.router)
app.include_router(gamification.router)
app.include_router(dashboard.router)
app.include_router(wallet.router)
app.include_router(blockchain.router)
app.include_router(tokens.router)
app.include_router(carbon_credits.router)
app.include_router(companies.router)
app.include_router(marketplace.router)
app.include_router(admin.router)

@app.exception_handler(Exception)
async def _log_exception(request: Request, exc: Exception):
    db = SessionLocal()
    try:
        logging_service.log_event(db, "ERROR", None, str(exc))
        db.commit()
    finally:
        db.close()
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React/Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/protected-route", response_model=schemas.UserOut)
def protected_route(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query to check the connection
        db.execute(text("SELECT 1"))
        return {"status": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
