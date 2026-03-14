from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from models.models import (
    UserRole,
    BusinessCategory,
    Niche,
    CampaignStatus,
    ApplicationStatus,
    PayoutStatus,
    SubscriptionStatus,
    Currency,
    VerificationPlatform,
    VerificationStatus,
)


# ── Auth ───────────────────────────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class DevLoginRequest(BaseModel):
    email: EmailStr
    role: UserRole


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class AuthResponse(BaseModel):
    access_token: str
    id_token: str
    refresh_token: str
    token_type: str = "Bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    role: UserRole
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Business Profile ──────────────────────────────────────────────────────────


class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = Field(None, max_length=255)
    category: Optional[BusinessCategory] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    google_maps_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    instagram_handle: Optional[str] = Field(None, max_length=255)
    tiktok_handle: Optional[str] = Field(None, max_length=255)


class BusinessProfileResponse(BaseModel):
    user_id: UUID
    business_name: str
    category: Optional[BusinessCategory] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    google_maps_url: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    instagram_handle: Optional[str] = None
    instagram_verified: bool = False
    tiktok_handle: Optional[str] = None
    tiktok_verified: bool = False
    verified: bool
    subscription_status: SubscriptionStatus
    created_at: datetime

    class Config:
        from_attributes = True


# ── Influencer Profile ────────────────────────────────────────────────────────


class InfluencerProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=2000)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    niche: Optional[Niche] = None
    instagram_handle: Optional[str] = Field(None, max_length=255)
    tiktok_handle: Optional[str] = Field(None, max_length=255)
    youtube_handle: Optional[str] = Field(None, max_length=255)


class InfluencerProfileResponse(BaseModel):
    user_id: UUID
    display_name: str
    bio: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    niche: Optional[Niche] = None
    instagram_handle: Optional[str] = None
    tiktok_handle: Optional[str] = None
    youtube_handle: Optional[str] = None
    followers_instagram: int = 0
    followers_tiktok: int = 0
    followers_youtube: int = 0
    engagement_rate: float = 0
    profile_photo_url: Optional[str] = None
    portfolio_urls: list = []
    estimated_price_per_post: Optional[float] = None
    instagram_verified: bool = False
    tiktok_verified: bool = False
    verified: bool = False
    subscription_status: SubscriptionStatus = SubscriptionStatus.free
    created_at: datetime

    class Config:
        from_attributes = True


class InfluencerPublicRankingResponse(BaseModel):
    alias: str
    city: Optional[str] = None
    state: Optional[str] = None
    niche: Optional[Niche] = None
    followers_range: str
    engagement_range: str
    verified: bool = False


# ── Campaign ──────────────────────────────────────────────────────────────────


class CampaignCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    budget: float = Field(gt=0)
    currency: Currency = Currency.MXN
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    niche_required: Optional[Niche] = None
    min_followers: int = Field(default=0, ge=0)
    max_followers: Optional[int] = Field(None, ge=0)
    deliverables: list = []
    includes: list = []
    deadline: Optional[date] = None
    max_applicants: Optional[int] = Field(None, ge=1)


class CampaignUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    niche_required: Optional[Niche] = None
    min_followers: Optional[int] = Field(None, ge=0)
    max_followers: Optional[int] = Field(None, ge=0)
    deliverables: Optional[list] = None
    includes: Optional[list] = None
    deadline: Optional[date] = None
    max_applicants: Optional[int] = Field(None, ge=1)


class CampaignResponse(BaseModel):
    id: UUID
    business_user_id: UUID
    title: str
    description: Optional[str] = None
    budget: float
    currency: Currency
    city: Optional[str] = None
    state: Optional[str] = None
    niche_required: Optional[Niche] = None
    min_followers: int = 0
    max_followers: Optional[int] = None
    deliverables: list = []
    includes: list = []
    status: CampaignStatus
    escrow_funded: bool
    deadline: Optional[date] = None
    max_applicants: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Influencer-facing view: no business_user_id, no business_name
class CampaignPublicResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    budget: float
    currency: Currency
    city: Optional[str] = None
    state: Optional[str] = None
    niche_required: Optional[Niche] = None
    min_followers: int = 0
    max_followers: Optional[int] = None
    deliverables: list = []
    includes: list = []
    status: CampaignStatus
    deadline: Optional[date] = None
    max_applicants: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Application ───────────────────────────────────────────────────────────────


class ApplicationCreate(BaseModel):
    message: Optional[str] = Field(None, max_length=2000)


class ApplicationSubmitDeliverables(BaseModel):
    deliverable_links: list[str]


class ApplicationResponse(BaseModel):
    id: UUID
    campaign_id: UUID
    influencer_user_id: UUID
    status: ApplicationStatus
    message: Optional[str] = None
    deliverable_links: list = []
    payout_amount: Optional[float] = None
    payout_status: PayoutStatus
    created_at: datetime

    class Config:
        from_attributes = True


# ── Review ────────────────────────────────────────────────────────────────────


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: UUID
    reviewer_user_id: UUID
    reviewed_user_id: UUID
    campaign_id: UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Social Verification ───────────────────────────────────────────────────────


class SocialVerificationInitRequest(BaseModel):
    platform: VerificationPlatform
    account_handle: str = Field(min_length=2, max_length=255)


class SocialVerificationInitResponse(BaseModel):
    verification_id: UUID
    platform: VerificationPlatform
    account_handle: str
    code: str
    expires_at: datetime
    instructions: str


class SocialVerificationStatusResponse(BaseModel):
    verification_id: UUID
    platform: VerificationPlatform
    account_handle: str
    status: VerificationStatus
    code: str
    expires_at: datetime
    verified_at: Optional[datetime] = None
    review_notes: Optional[str] = None


class ManualVerificationDecisionRequest(BaseModel):
    verification_id: UUID
    review_notes: Optional[str] = Field(None, max_length=1000)


class ManualVerificationApproveByCodeRequest(BaseModel):
    platform: VerificationPlatform
    code: str = Field(min_length=4, max_length=20)
    account_handle: Optional[str] = Field(None, max_length=255)
    review_notes: Optional[str] = Field(None, max_length=1000)


class ManualPendingVerificationItem(BaseModel):
    verification_id: UUID
    user_id: UUID
    user_email: str
    user_role: UserRole
    platform: VerificationPlatform
    account_handle: str
    code: str
    status: VerificationStatus
    expires_at: datetime
    created_at: datetime
