from api.businesses import _missing_required_profile_fields, _normalize_business_updates
from models.models import BusinessCategory, BusinessProfile, User, UserRole


def test_normalize_business_updates_trims_strings_and_handles():
    payload = {
        "business_name": "  Tacos del Mar  ",
        "city": "  Cancun ",
        "instagram_handle": "@tacosdelmar",
        "tiktok_handle": "  @tacosdelmar.mx ",
        "description": "  Mariscos frente al mar  ",
    }

    normalized = _normalize_business_updates(payload)

    assert normalized["business_name"] == "Tacos del Mar"
    assert normalized["city"] == "Cancun"
    assert normalized["instagram_handle"] == "tacosdelmar"
    assert normalized["tiktok_handle"] == "tacosdelmar.mx"
    assert normalized["description"] == "Mariscos frente al mar"


def test_normalize_business_updates_infers_state_from_city_alias():
    payload = {
        "city": "CDMX",
    }

    normalized = _normalize_business_updates(payload)

    assert normalized["city"] == "Ciudad de Mexico"
    assert normalized["state"] == "Ciudad de Mexico"


def test_missing_required_profile_fields_flags_placeholder_name():
    user = User(email="demo.business@example.com", role=UserRole.business, cognito_sub="abc")
    profile = BusinessProfile(
        business_name="demo.business",
        category=None,
        city=None,
    )

    missing = _missing_required_profile_fields(profile, user, {})

    assert missing == ["nombre del negocio", "categoria", "ciudad"]


def test_missing_required_profile_fields_accepts_real_minimum_profile():
    user = User(email="demo.business@example.com", role=UserRole.business, cognito_sub="abc")
    profile = BusinessProfile(
        business_name="demo.business",
        category=None,
        city=None,
    )

    missing = _missing_required_profile_fields(
        profile,
        user,
        {
            "business_name": "Tacos del Mar",
            "category": BusinessCategory.restaurant,
            "city": "Cancun",
        },
    )

    assert missing == []
