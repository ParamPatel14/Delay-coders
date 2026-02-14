from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import razorpay
from .. import models, schemas, dependencies
from ..database import get_db
from ..config import settings

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# Initialize Razorpay client
# Note: For demo purposes, if keys are placeholders, this might fail or not work as expected.
# User should replace them with valid Test Mode keys.
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.get("/key")
def get_razorpay_key():
    return {"key": settings.RAZORPAY_KEY_ID}

@router.post("/order", response_model=schemas.PaymentResponse)
def create_order(payment: schemas.PaymentCreate, 
                 current_user: models.User = Depends(dependencies.get_current_user),
                 db: Session = Depends(get_db)):
    
    amount_in_paisa = payment.amount * 100  # Convert to paisa
    
    data = {
        "amount": amount_in_paisa,
        "currency": payment.currency,
        "receipt": f"receipt_order_{current_user.id}",
        "notes": {
            "user_id": current_user.id,
            "email": current_user.email
        }
    }
    
    try:
        # Create Razorpay Order
        order = client.order.create(data=data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating Razorpay order: {str(e)}")
    
    # Save to Database
    db_payment = models.Payment(
        order_id=order['id'],
        amount=amount_in_paisa,
        currency=payment.currency,
        status="created",
        user_id=current_user.id
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    return db_payment

@router.post("/verify")
def verify_payment(payment_data: schemas.PaymentVerify,
                   db: Session = Depends(get_db)):
    
    try:
        # Verify Signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': payment_data.razorpay_order_id,
            'razorpay_payment_id': payment_data.razorpay_payment_id,
            'razorpay_signature': payment_data.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        # Update status to failed
        db_payment = db.query(models.Payment).filter(models.Payment.order_id == payment_data.razorpay_order_id).first()
        if db_payment:
            db_payment.status = "failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Update status to success
    db_payment = db.query(models.Payment).filter(models.Payment.order_id == payment_data.razorpay_order_id).first()
    if not db_payment:
         raise HTTPException(status_code=404, detail="Order not found")
         
    db_payment.payment_id = payment_data.razorpay_payment_id
    db_payment.signature = payment_data.razorpay_signature
    db_payment.status = "success"
    db.commit()

    # Create Transaction Record
    try:
        transaction = models.Transaction(
            user_id=db_payment.user_id,
            amount=db_payment.amount,
            currency=db_payment.currency,
            type="debit", # User paid money
            category="payment",
            description=f"Payment for Order {db_payment.order_id}",
            status="completed",
            payment_id=db_payment.id
        )
        db.add(transaction)
        db.commit()
    except Exception as e:
        # Log error but don't fail the response as payment is already verified
        print(f"Error creating transaction: {e}")
    
    return {"status": "success", "message": "Payment verified successfully"}

