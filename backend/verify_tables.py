import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine
from app import models
from sqlalchemy import text

def verify_tables():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        # Create tables
        print("Creating tables...")
        models.Base.metadata.create_all(bind=engine)
        print("Tables created (if not exist).")

        # Verify tables exist by querying information_schema
        print("Verifying table existence...")
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        print(f"Found tables: {tables}")

        if "users" in tables and "items" in tables:
            print("SUCCESS: 'users' and 'items' tables found.")
        else:
            print("WARNING: Could not find 'users' or 'items' tables.")

    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_tables()
