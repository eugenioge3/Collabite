from __future__ import annotations

import boto3
import base64
import json
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import get_settings
import httpx

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        settings = get_settings()
        url = (
            f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/"
            f"{settings.cognito_user_pool_id}/.well-known/jwks.json"
        )
        response = httpx.get(url, timeout=10)
        response.raise_for_status()
        _jwks_cache = response.json()
    return _jwks_cache


def _decode_token(token: str) -> dict:
    settings = get_settings()

    if token.startswith("dev."):
        if settings.environment != "local":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Dev tokens are only allowed in local environment",
            )

        encoded = token.split(".", 1)[1]
        padded = encoded + "=" * (-len(encoded) % 4)

        try:
            raw_payload = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
            payload = json.loads(raw_payload)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid dev token format",
            )

        required_claims = ["sub", "email", "custom:role"]
        if any(claim not in payload for claim in required_claims):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid dev token payload",
            )

        return payload

    if not settings.cognito_user_pool_id or not settings.cognito_client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cognito not configured. Use /api/auth/dev-login in local environment.",
        )

    jwks = _get_jwks()
    issuer = (
        f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
    )

    # Find the key
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    key = None
    for k in jwks.get("keys", []):
        if k["kid"] == kid:
            key = k
            break

    if key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token key not found",
        )

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.cognito_client_id,
            issuer=issuer,
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )

    return payload


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """FastAPI dependency: validates JWT and returns token claims."""
    payload = _decode_token(credentials.credentials)
    return payload


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
) -> dict | None:
    """FastAPI dependency: returns token claims when auth exists, otherwise None."""
    if credentials is None:
        return None
    payload = _decode_token(credentials.credentials)
    return payload


def require_role(required_role: str):
    """FastAPI dependency factory: ensures user has the specified role."""

    def _check_role(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("custom:role", "")
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires role: {required_role}",
            )
        return current_user

    return _check_role
