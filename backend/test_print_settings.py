from app.config import settings
print("CHAIN_RPC_URL:", settings.CHAIN_RPC_URL)
print("ECO_TOKEN_ADDRESS:", settings.ECO_TOKEN_ADDRESS)
print("HAS_OWNER_KEY:", bool(settings.ECO_TOKEN_OWNER_PRIVATE_KEY))
