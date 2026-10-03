import os
import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("database")

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

if DATABASE_URL:
    # Fix Render / Supabase postgres:// dialect for SQLAlchemy compatibility
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL or DATABASE_URL.startswith("https://placeholder"):
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    os.makedirs(data_dir, exist_ok=True)
    DB_PATH = os.path.join(data_dir, "swasthyasetu.db")
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
    try:
        from app.models import Base as ModelsBase
        ModelsBase.metadata.create_all(bind=engine)

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
    except Exception as e:
        logger.error(f"Database schema initialization warning: {e}")
