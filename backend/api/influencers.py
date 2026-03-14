from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user, require_role
from models.models import User, InfluencerProfile, Niche
from models.schemas import (
    InfluencerProfileUpdate,
    InfluencerProfileResponse,
)

router = APIRouter()


@router.get("/me", response_model=InfluencerProfileResponse)
def get_my_profile(
    current_user: dict = Depends(require_role("influencer")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(InfluencerProfile).filter(
        InfluencerProfile.user_id == user.id,
        InfluencerProfile.is_deleted == False,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.get("", response_model=list[InfluencerProfileResponse])
def search_influencers(
    city: str | None = Query(None),
    niche: Niche | None = Query(None),
    min_followers: int = Query(0, ge=0),
    max_followers: int | None = Query(None, ge=0),
    sort_by: str = Query("followers_instagram", pattern="^(followers_instagram|followers_tiktok|engagement_rate)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(InfluencerProfile).filter(
        InfluencerProfile.is_deleted == False,
    )

    if city:
        query = query.filter(InfluencerProfile.city.ilike(f"%{city}%"))
    if niche:
        query = query.filter(InfluencerProfile.niche == niche)
    if min_followers > 0:
        query = query.filter(InfluencerProfile.followers_instagram >= min_followers)
    if max_followers is not None:
        query = query.filter(InfluencerProfile.followers_instagram <= max_followers)

    sort_col = getattr(InfluencerProfile, sort_by)
    query = query.order_by(sort_col.desc())

    return query.offset(offset).limit(limit).all()


@router.get("/{influencer_id}", response_model=InfluencerProfileResponse)
def get_influencer(influencer_id: UUID, db: Session = Depends(get_db)):
    profile = db.query(InfluencerProfile).filter(
        InfluencerProfile.user_id == influencer_id,
        InfluencerProfile.is_deleted == False,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Influencer not found")

    return profile


@router.put("/me", response_model=InfluencerProfileResponse)
def update_my_profile(
    body: InfluencerProfileUpdate,
    current_user: dict = Depends(require_role("influencer")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(InfluencerProfile).filter(
        InfluencerProfile.user_id == user.id,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
