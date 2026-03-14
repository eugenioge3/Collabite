from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user, require_role
from models.models import (
    User,
    Campaign,
    CampaignApplication,
    CampaignStatus,
    ApplicationStatus,
    PayoutStatus,
    InfluencerProfile,
)
from models.schemas import (
    ApplicationCreate,
    ApplicationSubmitDeliverables,
    ApplicationCandidateResponse,
    ApplicationResponse,
)

router = APIRouter()
MASKED_UUID = UUID("00000000-0000-0000-0000-000000000000")


@router.post(
    "/campaigns/{campaign_id}/apply",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_to_campaign(
    campaign_id: UUID,
    body: ApplicationCreate,
    current_user: dict = Depends(require_role("influencer")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.is_deleted == False,
        Campaign.status.in_([CampaignStatus.active, CampaignStatus.funded]),
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or not active")

    # Check if already applied
    existing = db.query(CampaignApplication).filter(
        CampaignApplication.campaign_id == campaign_id,
        CampaignApplication.influencer_user_id == user.id,
        CampaignApplication.is_deleted == False,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You already applied to this campaign")

    # Check max applicants
    if campaign.max_applicants:
        count = db.query(CampaignApplication).filter(
            CampaignApplication.campaign_id == campaign_id,
            CampaignApplication.is_deleted == False,
        ).count()
        if count >= campaign.max_applicants:
            raise HTTPException(status_code=400, detail="Maximum applicants reached")

    application = CampaignApplication(
        campaign_id=campaign_id,
        influencer_user_id=user.id,
        message=body.message,
        payout_amount=float(campaign.budget),  # Default to campaign budget
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get(
    "/campaigns/{campaign_id}/applications",
    response_model=list[ApplicationResponse],
)
def list_applications(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify campaign ownership
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.business_user_id == user.id,
        Campaign.is_deleted == False,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    applications = db.query(CampaignApplication).filter(
        CampaignApplication.campaign_id == campaign_id,
        CampaignApplication.is_deleted == False,
    ).all()

    return _serialize_applications_for_business(
        db,
        applications,
        hide_identity=not bool(campaign.escrow_funded),
    )


@router.get(
    "/campaign/{campaign_id}",
    response_model=list[ApplicationResponse],
)
def list_applications_compat(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    return list_applications(campaign_id=campaign_id, current_user=current_user, db=db)


@router.put("/{application_id}/accept", response_model=ApplicationResponse)
def accept_application(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    app, _ = _get_application_for_business(application_id, current_user, db)

    if not app.campaign.escrow_funded:
        raise HTTPException(status_code=400, detail="Pay campaign escrow to review applicants")

    if app.status != ApplicationStatus.pending:
        raise HTTPException(status_code=400, detail="Application is not pending")

    app.status = ApplicationStatus.accepted

    # Update campaign status
    app.campaign.status = CampaignStatus.in_progress
    db.commit()
    db.refresh(app)
    return _serialize_application_for_business(db, app)


@router.patch("/{application_id}/accept", response_model=ApplicationResponse)
def accept_application_patch(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    return accept_application(application_id=application_id, current_user=current_user, db=db)


@router.put("/{application_id}/reject", response_model=ApplicationResponse)
def reject_application(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    app, _ = _get_application_for_business(application_id, current_user, db)

    if not app.campaign.escrow_funded:
        raise HTTPException(status_code=400, detail="Pay campaign escrow to review applicants")

    if app.status != ApplicationStatus.pending:
        raise HTTPException(status_code=400, detail="Application is not pending")

    app.status = ApplicationStatus.rejected
    db.commit()
    db.refresh(app)
    return _serialize_application_for_business(db, app)


@router.patch("/{application_id}/reject", response_model=ApplicationResponse)
def reject_application_patch(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    return reject_application(application_id=application_id, current_user=current_user, db=db)


@router.put("/{application_id}/submit-deliverables", response_model=ApplicationResponse)
def submit_deliverables(
    application_id: UUID,
    body: ApplicationSubmitDeliverables,
    current_user: dict = Depends(require_role("influencer")),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    app = db.query(CampaignApplication).filter(
        CampaignApplication.id == application_id,
        CampaignApplication.influencer_user_id == user.id,
        CampaignApplication.is_deleted == False,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.status != ApplicationStatus.accepted:
        raise HTTPException(status_code=400, detail="Application must be accepted first")

    app.deliverable_links = body.deliverable_links
    db.commit()
    db.refresh(app)
    return app


@router.put("/{application_id}/approve-deliverables", response_model=ApplicationResponse)
def approve_deliverables(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    app, _ = _get_application_for_business(application_id, current_user, db)

    if app.status != ApplicationStatus.accepted:
        raise HTTPException(status_code=400, detail="Application must be accepted")

    if not app.deliverable_links:
        raise HTTPException(status_code=400, detail="No deliverables submitted yet")

    app.status = ApplicationStatus.completed
    app.payout_status = PayoutStatus.released
    # TODO: Trigger Stripe payout here

    db.commit()
    db.refresh(app)
    return _serialize_application_for_business(db, app)


@router.put("/{application_id}/dispute", response_model=ApplicationResponse)
def dispute_application(
    application_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    app = db.query(CampaignApplication).filter(
        CampaignApplication.id == application_id,
        CampaignApplication.is_deleted == False,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Either the business owner or the influencer can dispute
    campaign = db.query(Campaign).filter(Campaign.id == app.campaign_id).first()
    if user.id != app.influencer_user_id and user.id != campaign.business_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    app.status = ApplicationStatus.disputed
    app.payout_status = PayoutStatus.disputed
    db.commit()
    db.refresh(app)
    return app


@router.post("/{application_id}/unlock-contact", response_model=ApplicationResponse)
def unlock_candidate_contact(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    app, _ = _get_application_for_business(application_id, current_user, db)

    if not app.campaign.escrow_funded:
        raise HTTPException(
            status_code=400,
            detail="Fund campaign escrow before unlocking candidate contact",
        )

    if app.status == ApplicationStatus.rejected:
        raise HTTPException(status_code=400, detail="Cannot unlock a rejected application")

    app.contact_unlocked = True
    app.contact_unlocked_at = app.contact_unlocked_at or app.updated_at
    db.commit()
    db.refresh(app)

    return _serialize_application_for_business(db, app)


# ── Helpers ────────────────────────────────────────────────────────────────────


def _get_application_for_business(
    application_id: UUID, current_user: dict, db: Session
):
    """Get an application and verify the current user owns the campaign."""
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    app = db.query(CampaignApplication).filter(
        CampaignApplication.id == application_id,
        CampaignApplication.is_deleted == False,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    campaign = db.query(Campaign).filter(
        Campaign.id == app.campaign_id,
        Campaign.business_user_id == user.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=403, detail="Not authorized")

    return app, user


def _serialize_applications_for_business(
    db: Session,
    applications: list[CampaignApplication],
    hide_identity: bool = False,
) -> list[ApplicationResponse]:
    influencer_ids = [a.influencer_user_id for a in applications]
    profile_rows = db.query(InfluencerProfile).filter(
        InfluencerProfile.user_id.in_(influencer_ids),
        InfluencerProfile.is_deleted == False,
    ).all() if influencer_ids else []

    profiles_by_user_id = {p.user_id: p for p in profile_rows}

    return [
        _serialize_application_for_business(
            db,
            app,
            profiles_by_user_id.get(app.influencer_user_id),
            hide_identity=hide_identity,
        )
        for app in applications
    ]


def _serialize_application_for_business(
    db: Session,
    app: CampaignApplication,
    profile: InfluencerProfile | None = None,
    hide_identity: bool = False,
) -> ApplicationResponse:
    if profile is None:
        profile = db.query(InfluencerProfile).filter(
            InfluencerProfile.user_id == app.influencer_user_id,
            InfluencerProfile.is_deleted == False,
        ).first()

    candidate = None
    if profile:
        show_contact = bool(app.contact_unlocked) and not hide_identity
        candidate_user_id = profile.user_id if not hide_identity else MASKED_UUID
        display_name = profile.display_name if not hide_identity else "Perfil reservado"
        candidate = ApplicationCandidateResponse(
            user_id=candidate_user_id,
            display_name=display_name,
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
            instagram_handle=profile.instagram_handle if show_contact else None,
            tiktok_handle=profile.tiktok_handle if show_contact else None,
            youtube_handle=profile.youtube_handle if show_contact else None,
        )

    influencer_user_id = app.influencer_user_id if not hide_identity else MASKED_UUID
    visible_message = app.message if not hide_identity else None

    return ApplicationResponse(
        id=app.id,
        campaign_id=app.campaign_id,
        influencer_user_id=influencer_user_id,
        status=app.status,
        message=visible_message,
        deliverable_links=app.deliverable_links or [],
        payout_amount=float(app.payout_amount) if app.payout_amount is not None else None,
        payout_status=app.payout_status,
        contact_unlocked=bool(app.contact_unlocked) and not hide_identity,
        candidate=candidate,
        created_at=app.created_at,
    )
