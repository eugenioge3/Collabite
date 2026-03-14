import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    Numeric,
    Date,
    ForeignKey,
    Text,
    Enum as SAEnum,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from core.database import Base


# ── Enums ──────────────────────────────────────────────────────────────────────

import enum


class UserRole(str, enum.Enum):
    business = "business"
    influencer = "influencer"


class BusinessCategory(str, enum.Enum):
    restaurant = "restaurant"
    bar = "bar"
    hotel = "hotel"
    cafe = "cafe"


class Niche(str, enum.Enum):
    food = "food"
    nightlife = "nightlife"
    travel = "travel"
    lifestyle = "lifestyle"
    fitness = "fitness"


class CampaignStatus(str, enum.Enum):
    draft = "draft"
    funded = "funded"
    active = "active"
    in_progress = "in_progress"
    completed = "completed"
    canceled = "canceled"
    disputed = "disputed"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    disputed = "disputed"


class PayoutStatus(str, enum.Enum):
    pending = "pending"
    released = "released"
    disputed = "disputed"


class SubscriptionStatus(str, enum.Enum):
    free = "free"
    active = "active"
    canceled = "canceled"


class Currency(str, enum.Enum):
    MXN = "MXN"
    USD = "USD"


class VerificationPlatform(str, enum.Enum):
    instagram = "instagram"
    tiktok = "tiktok"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    expired = "expired"


# ── Mixin ──────────────────────────────────────────────────────────────────────


def utcnow():
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


class SoftDeleteMixin:
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)


# ── Models ─────────────────────────────────────────────────────────────────────


class User(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(SAEnum(UserRole, name="user_role"), nullable=False)
    cognito_sub = Column(String(255), unique=True, nullable=False, index=True)
    verified = Column(Boolean, default=False)

    business_profile = relationship(
        "BusinessProfile", back_populates="user", uselist=False
    )
    influencer_profile = relationship(
        "InfluencerProfile", back_populates="user", uselist=False
    )


class BusinessProfile(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "business_profiles"

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    business_name = Column(String(255), nullable=False)
    category = Column(SAEnum(BusinessCategory, name="business_category"), nullable=True)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="Mexico")
    google_maps_url = Column(String(500))
    logo_url = Column(String(500))
    description = Column(Text)
    stripe_customer_id = Column(String(255))
    verified = Column(Boolean, default=False)
    instagram_handle = Column(String(255))
    instagram_verified = Column(Boolean, default=False)
    tiktok_handle = Column(String(255))
    tiktok_verified = Column(Boolean, default=False)
    subscription_status = Column(
        SAEnum(SubscriptionStatus, name="subscription_status"),
        default=SubscriptionStatus.free,
    )

    user = relationship("User", back_populates="business_profile")


class InfluencerProfile(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "influencer_profiles"

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    display_name = Column(String(255), nullable=False)
    bio = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="Mexico")
    niche = Column(SAEnum(Niche, name="niche"), nullable=True)
    instagram_handle = Column(String(255))
    tiktok_handle = Column(String(255))
    youtube_handle = Column(String(255))
    followers_instagram = Column(Integer, default=0)
    followers_tiktok = Column(Integer, default=0)
    followers_youtube = Column(Integer, default=0)
    engagement_rate = Column(Numeric(5, 2), default=0)
    audience_demographics = Column(JSONB, default=dict)
    profile_photo_url = Column(String(500))
    portfolio_urls = Column(JSONB, default=list)
    estimated_price_per_post = Column(Numeric(10, 2))
    stripe_account_id = Column(String(255))
    verified = Column(Boolean, default=False)
    instagram_verified = Column(Boolean, default=False)
    tiktok_verified = Column(Boolean, default=False)
    subscription_status = Column(
        SAEnum(SubscriptionStatus, name="subscription_status"),
        default=SubscriptionStatus.free,
    )

    user = relationship("User", back_populates="influencer_profile")


class Campaign(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    title = Column(String(255), nullable=False)
    description = Column(Text)
    budget = Column(Numeric(12, 2), nullable=False)
    currency = Column(SAEnum(Currency, name="currency"), default=Currency.MXN)
    city = Column(String(100))
    state = Column(String(100))
    niche_required = Column(SAEnum(Niche, name="niche"), nullable=True)
    min_followers = Column(Integer, default=0)
    max_followers = Column(Integer)
    deliverables = Column(JSONB, default=list)
    includes = Column(JSONB, default=list)
    status = Column(
        SAEnum(CampaignStatus, name="campaign_status"),
        default=CampaignStatus.draft,
        index=True,
    )
    stripe_payment_intent_id = Column(String(255))
    escrow_funded = Column(Boolean, default=False)
    deadline = Column(Date)
    max_applicants = Column(Integer)

    applications = relationship("CampaignApplication", back_populates="campaign")

    __table_args__ = (
        CheckConstraint("budget > 0", name="ck_campaigns_budget_positive"),
    )


class CampaignApplication(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "campaign_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(
        UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True
    )
    influencer_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    status = Column(
        SAEnum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.pending,
    )
    message = Column(Text)
    deliverable_links = Column(JSONB, default=list)
    payout_amount = Column(Numeric(12, 2))
    payout_status = Column(
        SAEnum(PayoutStatus, name="payout_status"),
        default=PayoutStatus.pending,
    )

    campaign = relationship("Campaign", back_populates="applications")


class Review(TimestampMixin, Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reviewer_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    reviewed_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    campaign_id = Column(
        UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False
    )
    rating = Column(Integer, nullable=False)
    comment = Column(Text)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
    )


class SocialVerification(TimestampMixin, Base):
    """OTP challenges for manual/automatic social account verification."""
    __tablename__ = "social_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    platform = Column(
        SAEnum(VerificationPlatform, name="verification_platform"),
        nullable=False,
        index=True,
    )
    account_handle = Column(String(255), nullable=False)
    code = Column(String(20), nullable=False, unique=True, index=True)
    status = Column(
        SAEnum(VerificationStatus, name="verification_status"),
        default=VerificationStatus.pending,
        nullable=False,
        index=True,
    )
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by_email = Column(String(255), nullable=True)
    review_notes = Column(Text, nullable=True)
