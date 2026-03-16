from api.auth import _build_dev_auth_response, _is_local_auth_mode
from core.config import Settings
from models.models import User, UserRole


def test_local_auth_mode_enabled_only_in_local_without_cognito():
    settings = Settings(environment="local", cognito_user_pool_id="", cognito_client_id="")
    assert _is_local_auth_mode(settings) is True


def test_local_auth_mode_disabled_when_cognito_is_configured():
    settings = Settings(
        environment="local",
        cognito_user_pool_id="pool-123",
        cognito_client_id="client-123",
    )
    assert _is_local_auth_mode(settings) is False


def test_build_dev_auth_response_returns_consistent_dev_tokens():
    user = User(
        email="business@example.com",
        role=UserRole.business,
        cognito_sub="local-dev-123",
        verified=True,
    )

    response = _build_dev_auth_response(user)

    assert response.access_token.startswith("dev.")
    assert response.access_token == response.id_token
    assert response.access_token == response.refresh_token
    assert response.token_type == "Bearer"
