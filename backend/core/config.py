from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    environment: str = "dev"

    # Cognito
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""
    cognito_region: str = "us-east-1"

    # Database
    db_secret_arn: str = ""
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "collabite"
    db_user: str = ""
    db_password: str = ""

    # S3
    media_bucket: str = ""

    # CORS
    cors_allowed_origins: str = "*"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Meta / Instagram (optional for webhook automation later)
    meta_app_secret: str = ""
    meta_webhook_verify_token: str = ""
    meta_page_access_token: str = ""

    # Manual verification operations
    instagram_ota_handle: str = "collabite_mx"
    tiktok_ota_handle: str = "collabite_mx"
    manual_verification_admin_token: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
