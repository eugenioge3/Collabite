from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import require_role
from core.location import normalize_mexico_city, normalize_mexico_state
from models.models import User, InfluencerProfile, Niche
from models.schemas import (
    InfluencerProfileUpdate,
    InfluencerProfileResponse,
    InfluencerBusinessRankingResponse,
    InfluencerPublicRankingResponse,
)

router = APIRouter()


def _followers_range(total: int) -> str:
    if total < 10_000:
        return "0-10k"
    if total < 50_000:
        return "10k-50k"
    if total < 100_000:
        return "50k-100k"
    if total < 250_000:
        return "100k-250k"
    if total < 500_000:
        return "250k-500k"
    return "500k+"


def _engagement_range(rate: float) -> str:
    if rate < 2:
        return "<2%"
    if rate < 4:
        return "2%-4%"
    if rate < 6:
        return "4%-6%"
    return "6%+"


def _alias_for_profile(profile: InfluencerProfile) -> str:
    short_id = str(profile.user_id).split("-")[0][:6].upper()
    return f"Creator {short_id}"


def _apply_filters(
    query,
    city: str | None,
    state: str | None,
    niche: Niche | None,
    min_followers: int,
    max_followers: int | None,
):
    city_filter = normalize_mexico_city(city)
    state_filter = normalize_mexico_state(state)

    if city_filter:
        query = query.filter(InfluencerProfile.city.ilike(f"%{city_filter}%"))
    if state_filter:
        query = query.filter(InfluencerProfile.state.ilike(f"%{state_filter}%"))
    if niche:
        query = query.filter(InfluencerProfile.niche == niche)
    if min_followers > 0:
        query = query.filter(InfluencerProfile.followers_instagram >= min_followers)
    if max_followers is not None:
        query = query.filter(InfluencerProfile.followers_instagram <= max_followers)
    return query


def _to_business_ranking_response(profile: InfluencerProfile) -> InfluencerBusinessRankingResponse:
    return InfluencerBusinessRankingResponse(
        user_id=profile.user_id,
        display_name=profile.display_name,
        city=profile.city,
        state=profile.state,
        country=profile.country,
        niche=profile.niche,
        followers_instagram=profile.followers_instagram or 0,
        followers_tiktok=profile.followers_tiktok or 0,
        followers_youtube=profile.followers_youtube or 0,
        engagement_rate=float(profile.engagement_rate or 0),
        estimated_price_per_post=float(profile.estimated_price_per_post or 0)
        if profile.estimated_price_per_post is not None
        else None,
        verified=bool(profile.verified),
        instagram_verified=bool(profile.instagram_verified),
        tiktok_verified=bool(profile.tiktok_verified),
        created_at=profile.created_at,
    )


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


@router.get("", response_model=list[InfluencerPublicRankingResponse])
def search_influencers(
    city: str | None = Query(None),
    state: str | None = Query(None),
    niche: Niche | None = Query(None),
    min_followers: int = Query(0, ge=0),
    max_followers: int | None = Query(None, ge=0),
    sort_by: str = Query("followers_instagram", pattern="^(followers_instagram|followers_tiktok|followers_youtube|engagement_rate)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(InfluencerProfile).filter(
        InfluencerProfile.is_deleted == False,
    )

    query = _apply_filters(query, city, state, niche, min_followers, max_followers)

    sort_col = getattr(InfluencerProfile, sort_by)
    query = query.order_by(sort_col.desc())

    profiles = query.offset(offset).limit(limit).all()

    result = []
    for profile in profiles:
        total_followers = (
            (profile.followers_instagram or 0)
            + (profile.followers_tiktok or 0)
            + (profile.followers_youtube or 0)
        )
        result.append(
            InfluencerPublicRankingResponse(
                alias=_alias_for_profile(profile),
                city=profile.city,
                state=profile.state,
                niche=profile.niche,
                followers_range=_followers_range(total_followers),
                engagement_range=_engagement_range(float(profile.engagement_rate or 0)),
                verified=bool(profile.verified),
            )
        )

    return result


@router.get("/private/rankings", response_model=list[InfluencerBusinessRankingResponse])
def private_rankings_for_business(
    city: str | None = Query(None),
    state: str | None = Query(None),
    niche: Niche | None = Query(None),
    min_followers: int = Query(0, ge=0),
    max_followers: int | None = Query(None, ge=0),
    sort_by: str = Query("followers_instagram", pattern="^(followers_instagram|followers_tiktok|followers_youtube|engagement_rate)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    query = db.query(InfluencerProfile).filter(
        InfluencerProfile.is_deleted == False,
    )
    query = _apply_filters(query, city, state, niche, min_followers, max_followers)

    sort_col = getattr(InfluencerProfile, sort_by)
    query = query.order_by(sort_col.desc())

    profiles = query.offset(offset).limit(limit).all()
    return [_to_business_ranking_response(p) for p in profiles]


@router.get("/{influencer_id}", response_model=InfluencerBusinessRankingResponse)
def get_influencer(
    influencer_id: UUID,
    _: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    profile = db.query(InfluencerProfile).filter(
        InfluencerProfile.user_id == influencer_id,
        InfluencerProfile.is_deleted == False,
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Influencer not found")

    return _to_business_ranking_response(profile)


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
