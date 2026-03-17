from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_optional_current_user, require_role
from models.models import (
    User,
    Campaign,
    CampaignStatus,
    Niche,
    BusinessProfile,
    BusinessCategory,
    CampaignApplication,
    UserRole,
)
from models.schemas import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    CampaignPublicResponse,
)

router = APIRouter()


_CATEGORY_HINT = {
    BusinessCategory.restaurant: "Restaurante",
    BusinessCategory.bar: "Bar",
    BusinessCategory.hotel: "Hotel",
    BusinessCategory.cafe: "Cafe",
}


def _missing_publish_requirements(
    *,
    title: str | None,
    budget: float | int | None,
    city: str | None,
    niche_required: Niche | None,
) -> list[str]:
    missing = []

    if not title or len(title.strip()) < 3:
        missing.append("titulo")

    if budget is None or float(budget) <= 0:
        missing.append("presupuesto")

    if not city or not city.strip():
        missing.append("ciudad")

    if niche_required is None:
        missing.append("nicho")

    return missing


def _ensure_publish_requirements(*, title: str | None, budget: float | int | None, city: str | None, niche_required: Niche | None):
    missing = _missing_publish_requirements(
        title=title,
        budget=budget,
        city=city,
        niche_required=niche_required,
    )

    if missing:
        raise HTTPException(
            status_code=400,
            detail="Completa campos obligatorios para publicar: " + ", ".join(missing),
        )


def _short_text(value: str | None, max_words: int = 8, max_chars: int = 70) -> str:
    if not value:
        return ""
    clean = " ".join(value.split())
    words = clean.split(" ")
    chunk = " ".join(words[:max_words])
    return chunk[:max_chars].strip()


def _business_hint(profile: BusinessProfile | None, campaign: Campaign) -> str | None:
    city = campaign.city or (profile.city if profile else None)
    category_label = _CATEGORY_HINT.get(profile.category, "Negocio local") if profile else "Negocio local"

    style_source = None
    if profile:
        style_source = profile.description or profile.business_name
    style = _short_text(style_source)

    if city and style:
        return f"{category_label} en {city} · {style}"
    if city:
        return f"{category_label} en {city}"
    if style:
        return f"{category_label} · {style}"
    return category_label


def _to_public_campaign_response(
    campaign: Campaign,
    business_profile: BusinessProfile | None,
    already_applied: bool,
) -> CampaignPublicResponse:
    return CampaignPublicResponse(
        id=campaign.id,
        title=campaign.title,
        description=campaign.description,
        budget=float(campaign.budget),
        currency=campaign.currency,
        city=campaign.city,
        state=campaign.state,
        niche_required=campaign.niche_required,
        min_followers=campaign.min_followers or 0,
        max_followers=campaign.max_followers,
        deliverables=campaign.deliverables or [],
        includes=campaign.includes or [],
        status=campaign.status,
        deadline=campaign.deadline,
        max_applicants=campaign.max_applicants,
        business_hint=_business_hint(business_profile, campaign),
        already_applied=already_applied,
        created_at=campaign.created_at,
    )


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

    if body.publish_now:
        _ensure_publish_requirements(
            title=body.title,
            budget=body.budget,
            city=body.city,
            niche_required=body.niche_required,
        )

    campaign_data = body.model_dump(exclude={"publish_now"})

    campaign = Campaign(
        business_user_id=user.id,
        **campaign_data,
        status=CampaignStatus.active if body.publish_now else CampaignStatus.draft,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/mine", response_model=list[CampaignResponse])
def list_my_campaigns(
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(Campaign).filter(
        Campaign.business_user_id == user.id,
        Campaign.is_deleted == False,
    ).order_by(Campaign.created_at.desc()).all()


@router.get("", response_model=list[CampaignPublicResponse])
def list_campaigns(
    city: str | None = Query(None),
    niche: Niche | None = Query(None),
    min_budget: float | None = Query(None, ge=0),
    max_budget: float | None = Query(None, ge=0),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Public view for influencers with optional applied state and anonymized business hints."""
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
    campaigns = query.offset(offset).limit(limit).all()

    business_ids = [c.business_user_id for c in campaigns]
    profile_rows = db.query(BusinessProfile).filter(
        BusinessProfile.user_id.in_(business_ids),
        BusinessProfile.is_deleted == False,
    ).all() if business_ids else []
    profiles_by_user_id = {p.user_id: p for p in profile_rows}

    applied_campaign_ids = set()
    if current_user and current_user.get("custom:role") == UserRole.influencer.value:
        cognito_sub = current_user.get("sub")
        influencer_user = db.query(User).filter(
            User.cognito_sub == cognito_sub,
            User.is_deleted == False,
        ).first()

        if influencer_user and campaigns:
            campaign_ids = [c.id for c in campaigns]
            applied_rows = db.query(CampaignApplication.campaign_id).filter(
                CampaignApplication.campaign_id.in_(campaign_ids),
                CampaignApplication.influencer_user_id == influencer_user.id,
                CampaignApplication.is_deleted == False,
            ).all()
            applied_campaign_ids = {row[0] for row in applied_rows}

    return [
        _to_public_campaign_response(
            campaign=c,
            business_profile=profiles_by_user_id.get(c.business_user_id),
            already_applied=c.id in applied_campaign_ids,
        )
        for c in campaigns
    ]


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: UUID, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.is_deleted == False,
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign


@router.post("/{campaign_id}/publish", response_model=CampaignResponse)
def publish_campaign(
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

    if campaign.status in (CampaignStatus.canceled, CampaignStatus.completed):
        raise HTTPException(status_code=400, detail="Campaign cannot be published")

    _ensure_publish_requirements(
        title=campaign.title,
        budget=float(campaign.budget) if campaign.budget is not None else None,
        city=campaign.city,
        niche_required=campaign.niche_required,
    )

    campaign.status = CampaignStatus.active
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/{campaign_id}/fund-escrow", response_model=CampaignResponse)
def fund_campaign_escrow(
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

    if campaign.status == CampaignStatus.draft:
        raise HTTPException(status_code=400, detail="Publish campaign before funding escrow")

    if campaign.status in (CampaignStatus.canceled, CampaignStatus.completed):
        raise HTTPException(status_code=400, detail="Campaign cannot be funded")

    campaign.escrow_funded = True
    if campaign.status == CampaignStatus.active:
        campaign.status = CampaignStatus.funded

    db.commit()
    db.refresh(campaign)
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

    if campaign.status != CampaignStatus.draft:
        raise HTTPException(
            status_code=400,
            detail="Only draft campaigns can be edited",
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)

    db.commit()
    db.refresh(campaign)
    return campaign


@router.delete("/{campaign_id}")
def delete_campaign(
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

    if campaign.status not in (CampaignStatus.active, CampaignStatus.funded):
        raise HTTPException(
            status_code=400,
            detail="Only published campaigns can be deleted",
        )

    campaign.is_deleted = True
    campaign.deleted_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Campaign deleted"}


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
