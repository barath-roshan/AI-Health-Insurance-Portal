import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

if not DATABASE_URL or DATABASE_URL.startswith("https://placeholder"):
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "swasthyasetu.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator:
    """FastAPI Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Ensure database schema tables and columns are created."""
    from app.models import Base as ModelsBase
    ModelsBase.metadata.create_all(bind=engine)

    # Ensure rag_stale and role columns exist for SQLite schema updates
    with engine.connect() as conn:
        if is_sqlite:
            try:
                conn.execute(text("ALTER TABLE schemes ADD COLUMN rag_stale BOOLEAN DEFAULT 0;"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'USER';"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE handoff_requests ADD COLUMN user_id TEXT;"))
                conn.commit()
            except Exception:
                pass
