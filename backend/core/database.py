import json
import boto3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from core.config import get_settings

_engine = None
_SessionLocal = None


class Base(DeclarativeBase):
    pass


def _get_db_credentials() -> dict:
    """Retrieve DB credentials from AWS Secrets Manager or local config."""
    settings = get_settings()

    if settings.db_secret_arn:
        client = boto3.client("secretsmanager", region_name=settings.cognito_region)
        response = client.get_secret_value(SecretId=settings.db_secret_arn)
        secret = json.loads(response["SecretString"])
        return {
            "username": secret["username"],
            "password": secret["password"],
            "host": secret.get("host", settings.db_host),
            "port": secret.get("port", settings.db_port),
            "dbname": secret.get("dbname", settings.db_name),
        }
    else:
        return {
            "username": settings.db_user,
            "password": settings.db_password,
            "host": settings.db_host,
            "port": settings.db_port,
            "dbname": settings.db_name,
        }


def get_engine():
    global _engine
    if _engine is None:
        creds = _get_db_credentials()
        database_url = (
            f"postgresql://{creds['username']}:{creds['password']}"
            f"@{creds['host']}:{creds['port']}/{creds['dbname']}"
        )
        _engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _SessionLocal


def get_db():
    """FastAPI dependency: yields a DB session."""
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
