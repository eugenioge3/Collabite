from __future__ import annotations

import re
import secrets
import string
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from core.auth import get_current_user
from core.config import get_settings
from core.database import get_db
from models.models import (
    BusinessProfile,
    InfluencerProfile,
    SocialVerification,
    User,
    UserRole,
    VerificationPlatform,
    VerificationStatus,
)
from models.schemas import (
    ManualVerificationApproveByCodeRequest,
    ManualPendingVerificationItem,
    ManualVerificationDecisionRequest,
    SocialVerificationInitRequest,
    SocialVerificationInitResponse,
    SocialVerificationStatusResponse,
)

router = APIRouter()

HANDLE_PATTERN = re.compile(r"^[a-z0-9._]{2,255}$")
CODE_LEN = 6


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_handle(raw_handle: str) -> str:
    handle = raw_handle.strip().lstrip("@").lower()
    if not HANDLE_PATTERN.match(handle):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid social handle. Use letters, numbers, dots, and underscore only.",
        )
    return handle


def _generate_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    code = "".join(secrets.choice(alphabet) for _ in range(CODE_LEN))
    return f"CBT-{code}"


def _get_user_or_404(db: Session, cognito_sub: str | None) -> User:
    if not cognito_sub:
        raise HTTPException(status_code=401, detail="Invalid token claims")

    user = db.query(User).filter(User.cognito_sub == cognito_sub, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _require_admin_token(x_admin_token: str | None = Header(default=None)) -> str:
    settings = get_settings()
    configured = settings.manual_verification_admin_token

    if not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Manual verification admin token not configured",
        )

    if x_admin_token != configured:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token",
        )

    return x_admin_token


def _mark_expired_if_needed(db: Session, verification: SocialVerification) -> bool:
    if verification.status == VerificationStatus.pending and verification.expires_at < _utcnow():
        verification.status = VerificationStatus.expired
        db.commit()
        db.refresh(verification)
        return True
    return False


def _apply_verified_flag(db: Session, user: User, verification: SocialVerification) -> None:
    if user.role == UserRole.influencer:
        profile = db.query(InfluencerProfile).filter(InfluencerProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Influencer profile not found")

        if verification.platform == VerificationPlatform.instagram:
            profile.instagram_handle = verification.account_handle
            profile.instagram_verified = True
        elif verification.platform == VerificationPlatform.tiktok:
            profile.tiktok_handle = verification.account_handle
            profile.tiktok_verified = True

        profile.verified = bool(profile.instagram_verified or profile.tiktok_verified)
    elif user.role == UserRole.business:
        profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Business profile not found")

        if verification.platform == VerificationPlatform.instagram:
            profile.instagram_handle = verification.account_handle
            profile.instagram_verified = True
        elif verification.platform == VerificationPlatform.tiktok:
            profile.tiktok_handle = verification.account_handle
            profile.tiktok_verified = True

        profile.verified = bool(profile.instagram_verified or profile.tiktok_verified)


@router.post("/init", response_model=SocialVerificationInitResponse)
def init_verification(
    body: SocialVerificationInitRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_user_or_404(db, current_user.get("sub"))
    handle = _normalize_handle(body.account_handle)

    # Invalidate previous pending requests for this user/platform.
    previous_pending = db.query(SocialVerification).filter(
        SocialVerification.user_id == user.id,
        SocialVerification.platform == body.platform,
        SocialVerification.status == VerificationStatus.pending,
    ).all()
    for item in previous_pending:
        item.status = VerificationStatus.expired

    expires_at = _utcnow() + timedelta(minutes=5)

    code = _generate_code()
    while db.query(SocialVerification).filter(SocialVerification.code == code).first():
        code = _generate_code()

    verification = SocialVerification(
        user_id=user.id,
        platform=body.platform,
        account_handle=handle,
        code=code,
        status=VerificationStatus.pending,
        expires_at=expires_at,
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)

    settings = get_settings()
    target_handle = (
        settings.instagram_ota_handle
        if body.platform == VerificationPlatform.instagram
        else settings.tiktok_ota_handle
    )

    instructions = (
        f"Send DM with code '{code}' to @{target_handle}. "
        "You have 5 minutes. The team will review and approve manually."
    )

    return SocialVerificationInitResponse(
        verification_id=verification.id,
        platform=verification.platform,
        account_handle=verification.account_handle,
        code=verification.code,
        expires_at=verification.expires_at,
        instructions=instructions,
    )


@router.get("/status", response_model=SocialVerificationStatusResponse)
def get_latest_verification_status(
    platform: VerificationPlatform = Query(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_user_or_404(db, current_user.get("sub"))

    latest = db.query(SocialVerification).filter(
        SocialVerification.user_id == user.id,
        SocialVerification.platform == platform,
    ).order_by(SocialVerification.created_at.desc()).first()

    if not latest:
        raise HTTPException(status_code=404, detail="Verification request not found")

    _mark_expired_if_needed(db, latest)

    return SocialVerificationStatusResponse(
        verification_id=latest.id,
        platform=latest.platform,
        account_handle=latest.account_handle,
        status=latest.status,
        code=latest.code,
        expires_at=latest.expires_at,
        verified_at=latest.verified_at,
        review_notes=latest.review_notes,
    )


@router.get("/admin/pending", response_model=list[ManualPendingVerificationItem])
def list_pending_for_manual_review(
    platform: VerificationPlatform | None = Query(default=None),
    code: str | None = Query(default=None),
    _: str = Depends(_require_admin_token),
    db: Session = Depends(get_db),
):
    now = _utcnow()
    query = db.query(SocialVerification, User).join(User, SocialVerification.user_id == User.id).filter(
        User.is_deleted == False,
        SocialVerification.status == VerificationStatus.pending,
    )

    if platform:
        query = query.filter(SocialVerification.platform == platform)
    if code:
        query = query.filter(SocialVerification.code == code.strip().upper())

    rows = query.order_by(SocialVerification.created_at.asc()).all()

    result: list[ManualPendingVerificationItem] = []
    has_updates = False

    for verification, user in rows:
        if verification.expires_at < now:
            verification.status = VerificationStatus.expired
            has_updates = True
            continue

        result.append(
            ManualPendingVerificationItem(
                verification_id=verification.id,
                user_id=user.id,
                user_email=user.email,
                user_role=user.role,
                platform=verification.platform,
                account_handle=verification.account_handle,
                code=verification.code,
                status=verification.status,
                expires_at=verification.expires_at,
                created_at=verification.created_at,
            )
        )

    if has_updates:
        db.commit()

    return result


@router.post("/admin/approve")
def approve_verification(
    body: ManualVerificationDecisionRequest,
    _: str = Depends(_require_admin_token),
    db: Session = Depends(get_db),
):
    verification = db.query(SocialVerification).filter(
        SocialVerification.id == body.verification_id,
    ).first()

    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")

    if _mark_expired_if_needed(db, verification):
        raise HTTPException(status_code=400, detail="Verification code has expired")

    if verification.status != VerificationStatus.pending:
        raise HTTPException(status_code=400, detail="Verification is no longer pending")

    user = db.query(User).filter(User.id == verification.user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    verification.status = VerificationStatus.verified
    verification.verified_at = _utcnow()
    verification.reviewed_by_email = "manual-review"
    verification.review_notes = body.review_notes

    _apply_verified_flag(db, user, verification)

    db.commit()

    return {
        "message": "Verification approved",
        "verification_id": str(verification.id),
        "user_id": str(user.id),
    }


@router.post("/admin/reject")
def reject_verification(
    body: ManualVerificationDecisionRequest,
    _: str = Depends(_require_admin_token),
    db: Session = Depends(get_db),
):
    verification = db.query(SocialVerification).filter(
        SocialVerification.id == body.verification_id,
    ).first()

    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")

    if verification.status not in [VerificationStatus.pending, VerificationStatus.expired]:
        raise HTTPException(status_code=400, detail="Verification cannot be rejected")

    verification.status = VerificationStatus.rejected
    verification.reviewed_by_email = "manual-review"
    verification.review_notes = body.review_notes

    db.commit()

    return {
        "message": "Verification rejected",
        "verification_id": str(verification.id),
    }


@router.post("/admin/approve-by-code")
def approve_verification_by_code(
    body: ManualVerificationApproveByCodeRequest,
    _: str = Depends(_require_admin_token),
    db: Session = Depends(get_db),
):
    code = body.code.strip().upper()

    verification = db.query(SocialVerification).filter(
        SocialVerification.platform == body.platform,
        SocialVerification.code == code,
        SocialVerification.status == VerificationStatus.pending,
    ).order_by(SocialVerification.created_at.desc()).first()

    if not verification:
        raise HTTPException(status_code=404, detail="Pending verification not found for this code")

    if body.account_handle:
        expected = _normalize_handle(body.account_handle)
        if expected != verification.account_handle:
            raise HTTPException(status_code=400, detail="Account handle does not match")

    if _mark_expired_if_needed(db, verification):
        raise HTTPException(status_code=400, detail="Verification code has expired")

    user = db.query(User).filter(User.id == verification.user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    verification.status = VerificationStatus.verified
    verification.verified_at = _utcnow()
    verification.reviewed_by_email = "manual-review"
    verification.review_notes = body.review_notes

    _apply_verified_flag(db, user, verification)
    db.commit()

    return {
        "message": "Verification approved",
        "verification_id": str(verification.id),
        "user_id": str(user.id),
    }
