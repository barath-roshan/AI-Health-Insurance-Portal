from typing import List, Optional, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import HandoffRequest

router = APIRouter(prefix="/api/support", tags=["Citizen Support"])

class HandoffResponseSchema(BaseModel):
    id: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    user_query: str
    intent: Optional[str] = None
    reason: Optional[str] = None
    summary: Optional[str] = None
    retrieved_schemes: Optional[Any] = []
    status: str  # PENDING, IN_PROGRESS, RESOLVED, CLOSED
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[HandoffResponseSchema])
def get_user_support_requests(
    user_id: Optional[str] = Query("demo_user"),
    db: Session = Depends(get_db)
):
    """
    Retrieve support/handoff requests for the current authenticated citizen.
    """
    requests = db.query(HandoffRequest).filter(
        HandoffRequest.user_id == user_id
    ).order_by(HandoffRequest.created_at.desc()).all()
    return requests


@router.get("/{support_id}", response_model=HandoffResponseSchema)
def get_user_support_request_by_id(
    support_id: str,
    user_id: Optional[str] = Query("demo_user"),
    db: Session = Depends(get_db)
):
    """
    Retrieve specific support request details by ID with ownership verification.
    """
    req = db.query(HandoffRequest).filter(HandoffRequest.id == support_id).first()
    if not req:
        raise HTTPException(status_code=404, detail=f"Support request '{support_id}' not found")

    # Ownership check: non-admin can only access their own request
    if req.user_id and req.user_id != user_id and user_id != "admin_user":
        raise HTTPException(status_code=403, detail="Access denied: You are not authorized to view this support request")

    return req
