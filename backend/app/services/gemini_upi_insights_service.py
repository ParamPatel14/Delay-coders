from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import json
import httpx
from .. import models
from ..config import settings


def _find_related_order(db: Session, upi_tx: models.UpiTransaction) -> models.MerchantOrder | None:
    q = (
        db.query(models.MerchantOrder)
        .filter(models.MerchantOrder.amount == upi_tx.amount)
        .order_by(models.MerchantOrder.paid_at.desc().nullslast(), models.MerchantOrder.created_at.desc())
    )
    return q.first()


def _find_carbon_info(db: Session, upi_tx: models.UpiTransaction) -> tuple[float | None, float | None]:
    account = (
        db.query(models.UpiAccount)
        .filter(models.UpiAccount.vpa == upi_tx.sender_upi_id)
        .first()
    )
    if not account or not account.user_id:
        return None, None
    user_id = account.user_id
    txn = (
        db.query(models.Transaction)
        .filter(
            models.Transaction.user_id == user_id,
            models.Transaction.amount == upi_tx.amount,
        )
        .order_by(models.Transaction.created_at.desc())
        .first()
    )
    if not txn:
        return None, None
    carbon_record = (
        db.query(models.CarbonRecord)
        .filter(
            models.CarbonRecord.transaction_id == txn.id,
            models.CarbonRecord.user_id == user_id,
        )
        .order_by(models.CarbonRecord.created_at.desc())
        .first()
    )
    carbon_kg = carbon_record.carbon_emission if carbon_record else None
    saving = (
        db.query(models.CarbonSaving)
        .filter(
            models.CarbonSaving.user_id == user_id,
            models.CarbonSaving.carbon_record_id == (carbon_record.id if carbon_record else None),
        )
        .first()
    )
    saved_kg = saving.saved_amount if saving else None
    return carbon_kg, saved_kg


def _call_gemini(prompt: str) -> str | None:
    api_key = settings.GEMINI_API_KEY if hasattr(settings, "GEMINI_API_KEY") else None
    model = settings.GEMINI_MODEL if hasattr(settings, "GEMINI_MODEL") else "gemini-1.5-flash"
    if not api_key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                ]
            }
        ]
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.post(url, params={"key": api_key}, json=payload)
        r.raise_for_status()
        data = r.json()
        candidates = data.get("candidates") or []
        if not candidates:
            return None
        content = candidates[0].get("content") or {}
        parts = content.get("parts") or []
        if not parts:
            return None
        text = parts[0].get("text")
        return text or None
    except Exception:
        return None


def analyze_transaction(db: Session, transaction_id: str, user_id: int | None = None) -> str:
    upi_tx = (
        db.query(models.UpiTransaction)
        .filter(models.UpiTransaction.transaction_id == transaction_id)
        .first()
    )
    if not upi_tx:
        raise ValueError("UPI transaction not found")
    amount_inr = upi_tx.amount / 100.0
    order = _find_related_order(db, upi_tx)
    items = []
    if order and order.items_json:
        try:
            parsed = json.loads(order.items_json)
            if isinstance(parsed, list):
                items = parsed
        except json.JSONDecodeError:
            items = []
    carbon_kg, saved_kg = _find_carbon_info(db, upi_tx)
    summary = {
        "transaction_id": upi_tx.transaction_id,
        "amount_inr": round(amount_inr, 2),
        "sender_vpa": upi_tx.sender_upi_id,
        "receiver_vpa": upi_tx.receiver_upi_id,
        "items": items,
        "carbon_emission_kg": carbon_kg,
        "carbon_saved_kg": saved_kg,
    }
    base_prompt = (
        "You are a sustainability assistant for a UPI payments app. "
        "Given the JSON transaction summary below, write a concise sustainability insight for the user. "
        "Focus on carbon impact and concrete, realistic eco-friendly alternatives. "
        "Respond in one or two short sentences, plain text only.\n\n"
        f"Transaction summary:\n{json.dumps(summary, ensure_ascii=False)}"
    )
    ai_text = _call_gemini(base_prompt)
    if ai_text:
        return ai_text.strip()
    if carbon_kg is not None:
        return (
            f"This UPI payment is estimated to have generated {carbon_kg:.2f} kg CO2. "
            "Choosing lower-carbon products, services, or transport options could cut this footprint significantly."
        )
    return (
        f"This UPI payment of ₹{amount_inr:.2f} has an associated carbon footprint based on what was purchased. "
        "Prefer eco-labelled products, public or shared transport, and lower-impact services to reduce future emissions."
    )

