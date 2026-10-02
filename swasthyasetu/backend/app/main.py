import os
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text

from app.core.database import init_db, engine
from app.api.schemes import router as schemes_router
from app.api.profile import router as profile_router
from app.api.eligibility import router as eligibility_router
from app.api.chat import router as chat_router
from app.api.support import router as support_router
from app.api.admin import router as admin_router

load_dotenv()

# Production logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("kaapan_main")

# Initialize DB schema
init_db()

app = FastAPI(
    title="KAAPAN API — Government Health Benefits Guide",
    description="KAAPAN Backend API for Government Health Insurance Scheme Eligibility and PageIndex Vectorless RAG Chatbot.",
    version="1.0.0",
)

# Production CORS Configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Production Error Handling Middleware (prevents internal stack trace leakage)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "status": "error"
        }
    )

# Register API routers
app.include_router(schemes_router)
app.include_router(profile_router)
app.include_router(eligibility_router)
app.include_router(chat_router)
app.include_router(support_router)
app.include_router(admin_router)

@app.get("/health")
def health():
    return {
        "status": "ok"
    }

@app.get("/health/ready")
def health_ready():
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database readiness check failed: {e}")
        db_status = f"unhealthy: {str(e)}"
        return JSONResponse(status_code=503, content={"status": "not_ready", "database": db_status})

    return {
        "status": "ready",
        "database": db_status,
        "service": "kaapan-backend"
    }

@app.get("/")
def root():
    return {
        "message": "KAAPAN API is running",
        "health_endpoint": "/health",
        "readiness_endpoint": "/health/ready",
        "schemes_endpoint": "/api/schemes",
        "profile_endpoint": "/api/profile",
        "eligibility_check": "/api/eligibility/check",
        "rag_chat_endpoint": "/api/chat",
        "support_endpoint": "/api/support",
        "admin_endpoint": "/api/admin"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
