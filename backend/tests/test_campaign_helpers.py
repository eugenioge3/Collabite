from datetime import datetime, timezone
from uuid import uuid4

from api.campaigns import _business_hint, _short_text, _to_public_campaign_response
from models.models import BusinessCategory, BusinessProfile, Campaign, CampaignStatus, Currency


def _sample_campaign(**overrides):
    base = {
        "id": uuid4(),
        "business_user_id": uuid4(),
        "title": "Campana demo",
        "description": "Descripcion demo",
        "budget": 1500,
        "currency": Currency.MXN,
        "city": "Cancun",
        "state": "Quintana Roo",
        "niche_required": None,
        "min_followers": 0,
        "max_followers": None,
        "deliverables": [{"type": "Reel", "quantity": 1}],
        "includes": ["Comida"],
        "status": CampaignStatus.active,
        "escrow_funded": False,
        "deadline": None,
        "max_applicants": None,
        "created_at": datetime.now(timezone.utc),
    }
    base.update(overrides)
    return Campaign(**base)


def test_short_text_normalizes_whitespace_and_limits_words():
    value = "  Mariscos   frescos  frente al mar con vista hermosa  "
    assert _short_text(value, max_words=4) == "Mariscos frescos frente al"


def test_short_text_returns_empty_for_missing_values():
    assert _short_text(None) == ""
    assert _short_text("") == ""


def test_business_hint_prefers_campaign_city_and_profile_style():
    profile = BusinessProfile(
        business_name="Tacos del Mar",
        category=BusinessCategory.restaurant,
        city="Cancun",
        description="Mariscos frescos frente al mar",
    )
    campaign = _sample_campaign(city="Playa del Carmen")

    hint = _business_hint(profile, campaign)

    assert hint is not None
    assert hint.startswith("Restaurante en Playa del Carmen")
    assert "Mariscos frescos frente al mar" in hint


def test_business_hint_falls_back_to_generic_label_when_profile_missing():
    campaign = _sample_campaign(city=None)

    hint = _business_hint(None, campaign)

    assert hint == "Negocio local"


def test_to_public_campaign_response_maps_fields_and_defaults_lists():
    profile = BusinessProfile(
        business_name="Cafe Centro",
        category=BusinessCategory.cafe,
        city="Cancun",
        description="Cafe de especialidad",
    )
    campaign = _sample_campaign(deliverables=None, includes=None, budget=999.99)

    response = _to_public_campaign_response(
        campaign=campaign,
        business_profile=profile,
        already_applied=True,
    )

    assert response.already_applied is True
    assert response.business_hint is not None
    assert response.business_hint.startswith("Cafe en Cancun")
    assert response.deliverables == []
    assert response.includes == []
    assert response.budget == 999.99
    assert response.status == CampaignStatus.active