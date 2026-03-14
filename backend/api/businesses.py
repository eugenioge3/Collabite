from uuid import UUID
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

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
