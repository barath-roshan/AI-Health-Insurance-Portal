import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Profile
from app.schemas.profile import ProfileUpdateSchema, ProfileResponseSchema

router = APIRouter(prefix="/api/profile", tags=["Profile"])

def get_or_create_profile(db: Session, user_id: Optional[str] = "demo_user") -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(
            id=str(uuid.uuid4()),
            user_id=user_id,
            full_name="Citizen User",
            state=None,
            district=None,
            age=None,
            gender=None,
            occupation=None,
            annual_income=None,
            family_size=1,
            existing_coverage=None
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=ProfileResponseSchema)
def get_user_profile(
    user_id: Optional[str] = Query("demo_user"),
    db: Session = Depends(get_db)
):
    """
    Fetch citizen profile.
    """
    profile = get_or_create_profile(db, user_id=user_id)
    return profile


@router.put("", response_model=ProfileResponseSchema)
def update_user_profile(
    profile_data: ProfileUpdateSchema,
    user_id: Optional[str] = Query("demo_user"),
    db: Session = Depends(get_db)
):
    """
    Update citizen profile (State, District, Age, Gender, Occupation, Annual Income, Family Size, Existing Coverage).
    """
    profile = get_or_create_profile(db, user_id=user_id)

    update_dict = profile_data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile
