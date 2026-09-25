from typing import Optional, List, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EligibilityRuleBase(BaseModel):
    field_name: str
    operator: str
    expected_value: str
    description: Optional[str] = None

class EligibilityRuleResponse(EligibilityRuleBase):
    id: str
    scheme_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SchemeDocumentBase(BaseModel):
    document_name: str
    mandatory: bool = True
    description: Optional[str] = None

class SchemeDocumentResponse(SchemeDocumentBase):
    id: str
    scheme_id: str

    model_config = ConfigDict(from_attributes=True)


class SchemeVersionResponse(BaseModel):
    id: str
    scheme_id: str
    version: int
    eligibility_rules: Any = []
    benefits: Any = {}
    documents: Any = []
    application_process: Any = {}
    source_url: Optional[str] = None
    verification_status: Optional[str] = None
    effective_from: Optional[datetime] = None
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SchemeBase(BaseModel):
    scheme_code: str
    scheme_name: str
    category: Optional[str] = None
    state_or_region: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[Any] = {}
    status: Optional[str] = "active"
    current_version: Optional[int] = 1
    source_url: Optional[str] = None
    verification_status: Optional[str] = "verified"

class SchemeSummaryResponse(SchemeBase):
    id: str
    last_verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SchemeDetailResponse(SchemeSummaryResponse):
    rules: List[EligibilityRuleResponse] = []
    documents: List[SchemeDocumentResponse] = []
    versions: List[SchemeVersionResponse] = []

    model_config = ConfigDict(from_attributes=True)
