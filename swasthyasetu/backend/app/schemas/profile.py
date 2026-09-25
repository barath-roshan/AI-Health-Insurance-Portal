from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = Field(None, ge=0)
    family_size: Optional[int] = Field(None, ge=1)
    existing_coverage: Optional[str] = None

class ProfileUpdateSchema(ProfileBase):
    pass

class ProfileResponseSchema(ProfileBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
