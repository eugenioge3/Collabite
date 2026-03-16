from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user, require_role
from models.models import User, BusinessProfile
from models.schemas import (
    BusinessProfileUpdate,
    BusinessProfileResponse,
)

router = APIRouter()


def _normalize_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def _normalize_business_updates(update_data: dict) -> dict:
    normalized = dict(update_data)

    for field in ["business_name", "city", "state", "country", "google_maps_url", "description"]:
        if field in normalized:
            normalized[field] = _normalize_text(normalized[field])

    for field in ["instagram_handle", "tiktok_handle"]:
        if field in normalized:
            handle = _normalize_text(normalized[field])
            normalized[field] = handle.lstrip("@") if handle else None

    return normalized


def _missing_required_profile_fields(profile: BusinessProfile, user: User, update_data: dict) -> list[str]:
    business_name = update_data.get("business_name", profile.business_name)
    category = update_data.get("category", profile.category)
    city = update_data.get("city", profile.city)
    email_alias = user.email.split("@")[0].strip().lower()

    missing = []
    if not business_name or business_name.strip().lower() == email_alias:
        missing.append("nombre del negocio")
    if not category:
        missing.append("categoria")
    if not city:
        missing.append("ciudad")
    return missing


@router.get("/me", response_model=BusinessProfileResponse)
def get_my_business_profile(
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == user.id,
        BusinessProfile.is_deleted == False,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.get("/{business_id}", response_model=BusinessProfileResponse)
def get_business(business_id: UUID, db: Session = Depends(get_db)):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == business_id,
        BusinessProfile.is_deleted == False,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Business not found")

    return profile


@router.put("/me", response_model=BusinessProfileResponse)
def update_my_profile(
    body: BusinessProfileUpdate,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == user.id,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = _normalize_business_updates(body.model_dump(exclude_unset=True))
    missing_fields = _missing_required_profile_fields(profile, user, update_data)
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Completa los campos obligatorios para continuar: "
                + ", ".join(missing_fields)
                + "."
            ),
        )

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
