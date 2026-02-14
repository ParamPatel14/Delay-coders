from sqlalchemy.orm import Session
from decimal import Decimal
from .. import models
from . import carbon_credit_blockchain_service as cc_chain
from ..services import logging_service

def transfer_to_company(db: Session, order_id: int) -> dict | None:
    order = db.query(models.MarketplaceOrder).filter(models.MarketplaceOrder.id == order_id).first()
    if not order or order.status != "COMPLETED":
        return None
    cw = db.query(models.CompanyWallet).filter(models.CompanyWallet.company_id == order.company_id).first()
    if not cw or not cw.wallet_address:
        return None
    amount_tokens = Decimal(str(order.credit_amount or 0.0))
    res = cc_chain.mint_carbon_credit(cw.wallet_address, amount_tokens)
    order.tx_hash = res.get("tx_hash")
    db.add(order)
    db.commit()
    db.refresh(order)
    logging_service.log_event(db, "CREDIT_TRANSFER", None, f"order {order.id} tx {order.tx_hash}")
    return res
