from datetime import datetime, timezone
from uuid import uuid4

from api.applications import MASKED_UUID, _serialize_application_for_business
from models.models import (
    ApplicationStatus,
    CampaignApplication,
    InfluencerProfile,
    Niche,
    PayoutStatus,
)


def _sample_profile():
    return InfluencerProfile(
        user_id=uuid4(),
        display_name="Ana Creator",
        city="Cancun",
        state="Quintana Roo",
        country="Mexico",
        niche=Niche.food,
        followers_instagram=12000,
        followers_tiktok=5000,
        followers_youtube=0,
        engagement_rate=4.2,
        instagram_handle="ana.creator",
        tiktok_handle="anacreator",
        youtube_handle=None,
        verified=True,
    )


def _sample_application(profile: InfluencerProfile, *, contact_unlocked: bool = False):
    return CampaignApplication(
        id=uuid4(),
        campaign_id=uuid4(),
        influencer_user_id=profile.user_id,
        status=ApplicationStatus.pending,
        message="Me interesa colaborar con su campana",
        deliverable_links=[],
        payout_amount=1500,
        payout_status=PayoutStatus.pending,
        contact_unlocked=contact_unlocked,
        created_at=datetime.now(timezone.utc),
    )


def test_serialize_application_hides_sensitive_fields_before_payment():
    profile = _sample_profile()
    app = _sample_application(profile, contact_unlocked=True)

    response = _serialize_application_for_business(
        db=None,
        app=app,
        profile=profile,
        hide_identity=True,
    )

    assert response.candidate is not None
    assert response.candidate.display_name == "Perfil reservado"
    assert response.candidate.user_id == MASKED_UUID
    assert response.message is None
    assert response.contact_unlocked is False
    assert response.candidate.instagram_handle is None
    assert response.candidate.tiktok_handle is None


def test_serialize_application_shows_name_after_payment_but_keeps_contact_locked():
    profile = _sample_profile()
    app = _sample_application(profile, contact_unlocked=False)

    response = _serialize_application_for_business(
        db=None,
        app=app,
        profile=profile,
        hide_identity=False,
    )

    assert response.candidate is not None
    assert response.candidate.display_name == "Ana Creator"
    assert response.candidate.user_id == profile.user_id
    assert response.message == "Me interesa colaborar con su campana"
    assert response.contact_unlocked is False
    assert response.candidate.instagram_handle is None
    assert response.candidate.tiktok_handle is None


def test_serialize_application_keeps_unlocked_contact_visible():
    profile = _sample_profile()
    app = _sample_application(profile, contact_unlocked=True)

    response = _serialize_application_for_business(
        db=None,
        app=app,
        profile=profile,
        hide_identity=False,
    )

    assert response.contact_unlocked is True
    assert response.candidate is not None
    assert response.candidate.instagram_handle == "ana.creator"
    assert response.candidate.tiktok_handle == "anacreator"
