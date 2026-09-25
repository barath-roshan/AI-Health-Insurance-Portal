from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Profile
from app.services.eligibility.eligibility_engine import evaluate_all_schemes_for_profile

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])

class EligibilityCheckRequest(BaseModel):
    profile_id: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None

class RuleInfoSchema(BaseModel):
    id: Optional[str] = None
    field_name: str
    operator: str
    expected_value: str
    description: Optional[str] = None
    reason: Optional[str] = None

class SchemeEligibilityResultSchema(BaseModel):
    scheme_id: str
    scheme_code: str
    scheme_name: str
    category: Optional[str] = None
    state_or_region: Optional[str] = None
    status: str  # ELIGIBLE, NOT_ELIGIBLE, NEEDS_INFORMATION, NEAR_MATCH
    satisfied_rules: List[Dict[str, Any]] = []
    failed_rules: List[Dict[str, Any]] = []
    missing_fields: List[str] = []
    explanation: List[str] = []
    benefits: Optional[Any] = None

class EligibilityCheckResponse(BaseModel):
    results: List[SchemeEligibilityResultSchema]

@router.post("/check", response_model=EligibilityCheckResponse)
def check_eligibility(
    payload: EligibilityCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates citizen profile against all registered government health schemes.
    Deterministic decision engine using PostgreSQL eligibility rules.
    """
    profile_obj = None

    if payload.profile:
        profile_obj = payload.profile
    elif payload.profile_id:
        profile_obj = db.query(Profile).filter(Profile.id == payload.profile_id).first()
        if not profile_obj:
            raise HTTPException(status_code=404, detail=f"Profile with ID '{payload.profile_id}' not found")
    else:
        # Default fallback to demo profile
        profile_obj = db.query(Profile).filter(Profile.user_id == "demo_user").first()

    if not profile_obj:
        profile_obj = {}

    results = evaluate_all_schemes_for_profile(db, profile_obj)
    return {"results": results}
