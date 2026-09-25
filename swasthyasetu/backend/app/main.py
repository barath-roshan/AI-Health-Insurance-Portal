import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.core.database import init_db
from app.api.schemes import router as schemes_router
from app.api.profile import router as profile_router
from app.api.eligibility import router as eligibility_router
from app.api.chat import router as chat_router
from app.api.support import router as support_router
from app.api.admin import router as admin_router

load_dotenv()

# Initialize DB tables on application startup
init_db()

app = FastAPI(
    title="SwasthyaSetu Backend API",
    description="SwasthyaSetu Government Health Insurance Scheme Eligibility Finder API",
    version="1.0.0",
)

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "status": "ok",
        "service": "swasthyasetu-backend"
    }

@app.get("/")
def root():
    return {
        "message": "SwasthyaSetu API is running",
        "health_endpoint": "/health",
        "schemes_endpoint": "/api/schemes",
        "profile_endpoint": "/api/profile",
        "eligibility_check": "/api/eligibility/check",
        "rag_chat_endpoint": "/api/chat",
        "support_endpoint": "/api/support",
        "admin_endpoint": "/api/admin"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
