from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.cache import get_cache, set_cache
from app.models import Scheme
from app.schemas.scheme import SchemeSummaryResponse, SchemeDetailResponse

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

@router.get("", response_model=List[SchemeSummaryResponse])
def get_schemes(
    state: Optional[str] = Query(None, description="Filter by state or region"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term in scheme name, description, or code"),
    limit: int = Query(20, ge=1, le=100, description="Page size limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    db: Session = Depends(get_db)
):
    """
    Retrieve government health insurance schemes with optional filtering by state, category, and text search.
    """
    query = db.query(Scheme)

    if state:
        query = query.filter(
            or_(
                Scheme.state_or_region.ilike(f"%{state.strip()}%"),
                Scheme.state_or_region.ilike("%All India%"),
                Scheme.state_or_region.ilike("%Central%")
            )
        )

    if category:
        query = query.filter(Scheme.category.ilike(f"%{category.strip()}%"))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Scheme.scheme_name.ilike(search_term),
                Scheme.description.ilike(search_term),
                Scheme.scheme_code.ilike(search_term)
            )
        )

    schemes = query.order_by(Scheme.scheme_name.asc()).offset(offset).limit(limit).all()
    return schemes


@router.get("/{scheme_id}", response_model=SchemeDetailResponse)
def get_scheme_detail(
    scheme_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve full scheme details including rules, documents, and versions by ID or scheme_code.
    Uses Redis cache with key format 'scheme:{scheme_id}' (TTL: 600s) and PostgreSQL fallback.
    """
    cache_key = f"scheme:{scheme_id}"

    # 1. Try Redis Cache
    cached = get_cache(cache_key)
    if cached:
        return cached

    # 2. Query PostgreSQL Database on Cache Miss
    scheme = db.query(Scheme).filter(
        or_(
            Scheme.id == scheme_id,
            Scheme.scheme_code == scheme_id
        )
    ).first()

    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with ID or code '{scheme_id}' not found")

    # Serialize object for response & cache
    response_data = SchemeDetailResponse.model_validate(scheme).model_dump(mode="json")

    # 3. Store in Redis Cache
    set_cache(cache_key, response_data, ttl_seconds=600)

    return response_data
