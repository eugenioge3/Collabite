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
)
from models.schemas import (
    ApplicationCreate,
    ApplicationSubmitDeliverables,
    ApplicationResponse,
)

router = APIRouter()


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

    return db.query(CampaignApplication).filter(
        CampaignApplication.campaign_id == campaign_id,
        CampaignApplication.is_deleted == False,
    ).all()


@router.put("/{application_id}/accept", response_model=ApplicationResponse)
def accept_application(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    app, _ = _get_application_for_business(application_id, current_user, db)

    if app.status != ApplicationStatus.pending:
        raise HTTPException(status_code=400, detail="Application is not pending")

    app.status = ApplicationStatus.accepted

    # Update campaign status
    app.campaign.status = CampaignStatus.in_progress
    db.commit()
    db.refresh(app)
    return app


@router.put("/{application_id}/reject", response_model=ApplicationResponse)
def reject_application(
    application_id: UUID,
    current_user: dict = Depends(require_role("business")),
    db: Session = Depends(get_db),
):
    app, _ = _get_application_for_business(application_id, current_user, db)

    if app.status != ApplicationStatus.pending:
        raise HTTPException(status_code=400, detail="Application is not pending")

    app.status = ApplicationStatus.rejected
    db.commit()
    db.refresh(app)
    return app


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
    return app


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
