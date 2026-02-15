import base64
import io
import qrcode


def generate_upi_uri(
    payee_vpa: str,
    amount_paisa: int,
    payee_name: str | None = None,
    note: str | None = None,
    txn_ref: str | None = None,
) -> str:
    amount_inr = amount_paisa / 100.0
    params = [
        f"pa={payee_vpa}",
        f"am={amount_inr:.2f}",
        "cu=INR",
    ]
    if payee_name:
        params.append(f"pn={payee_name}")
    if note:
        params.append(f"tn={note}")
    if txn_ref:
        params.append(f"tr={txn_ref}")
    query = "&".join(params)
    return f"upi://pay?{query}"


def generate_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(border=1)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return encoded

