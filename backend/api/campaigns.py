from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user, require_role
from models.models import User, Campaign, CampaignStatus, Niche
from models.schemas import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    CampaignPublicResponse,
)

router = APIRouter()


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    body: CampaignCreate,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    campaign = Campaign(
        business_user_id=user.id,
        **body.model_dump(),
        status=CampaignStatus.draft,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("", response_model=list[CampaignPublicResponse])
def list_campaigns(
    city: str | None = Query(None),
    niche: Niche | None = Query(None),
    min_budget: float | None = Query(None, ge=0),
    max_budget: float | None = Query(None, ge=0),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Public view for influencers — no business name revealed."""
    query = db.query(Campaign).filter(
        Campaign.is_deleted == False,
        Campaign.status.in_([CampaignStatus.active, CampaignStatus.funded]),
    )

    if city:
        query = query.filter(Campaign.city.ilike(f"%{city}%"))
    if niche:
        query = query.filter(Campaign.niche_required == niche)
    if min_budget is not None:
        query = query.filter(Campaign.budget >= min_budget)
    if max_budget is not None:
        query = query.filter(Campaign.budget <= max_budget)

    query = query.order_by(Campaign.created_at.desc())
    return query.offset(offset).limit(limit).all()


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: UUID, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.is_deleted == False,
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: UUID,
    body: CampaignUpdate,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.business_user_id == user.id,
        Campaign.is_deleted == False,
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status not in (CampaignStatus.draft, CampaignStatus.funded):
        raise HTTPException(
            status_code=400,
            detail="Cannot edit a campaign that is already active or completed",
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)

    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/{campaign_id}/cancel")
def cancel_campaign(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.business_user_id == user.id,
        Campaign.is_deleted == False,
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status in (CampaignStatus.completed, CampaignStatus.canceled):
        raise HTTPException(status_code=400, detail="Campaign cannot be canceled")

    campaign.status = CampaignStatus.canceled
    db.commit()

    return {"message": "Campaign canceled"}
