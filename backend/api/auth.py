import boto3
import base64
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.config import get_settings
from core.database import get_db
from core.auth import get_current_user
from models.schemas import (
    RegisterRequest,
    LoginRequest,
    DevLoginRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    AuthResponse,
    UserResponse,
)
from models.models import User, UserRole, BusinessProfile, InfluencerProfile

router = APIRouter()


def _encode_dev_token(payload: dict) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    encoded = base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")
    return f"dev.{encoded}"


def _is_cognito_configured(settings) -> bool:
    return bool(settings.cognito_user_pool_id and settings.cognito_client_id)


def _is_local_auth_mode(settings) -> bool:
    return settings.environment == "local" and not _is_cognito_configured(settings)


def _build_dev_auth_response(user: User) -> AuthResponse:
    token_payload = {
        "sub": user.cognito_sub,
        "email": user.email,
        "custom:role": user.role.value,
        "iss": "collabite-local-dev",
    }
    token = _encode_dev_token(token_payload)

    return AuthResponse(
        access_token=token,
        id_token=token,
        refresh_token=token,
    )


def _create_profile_if_needed(db: Session, user: User, role: UserRole):
    if role == UserRole.business:
        existing = db.query(BusinessProfile).filter(
            BusinessProfile.user_id == user.id,
        ).first()
        if not existing:
            db.add(
                BusinessProfile(
                    user_id=user.id,
                    business_name=user.email.split("@")[0],
                    verified=user.verified,
                )
            )
    else:
        existing = db.query(InfluencerProfile).filter(
            InfluencerProfile.user_id == user.id,
        ).first()
        if not existing:
            db.add(
                InfluencerProfile(
                    user_id=user.id,
                    display_name=user.email.split("@")[0],
                    verified=user.verified,
                )
            )


def _get_cognito_client():
    return boto3.client("cognito-idp", region_name=get_settings().cognito_region)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    email = body.email.lower().strip()

    if _is_local_auth_mode(settings):
        existing = db.query(User).filter(
            User.email == email,
            User.is_deleted == False,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        user = User(
            email=email,
            role=body.role,
            cognito_sub=f"local-dev-{uuid.uuid4()}",
            verified=True,
        )
        db.add(user)
        db.flush()
        _create_profile_if_needed(db, user, body.role)
        db.commit()

        return {
            "message": "Account created in local mode. Email marked as verified.",
            "user_id": str(user.id),
            "cognito_sub": user.cognito_sub,
        }

    if not _is_cognito_configured(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cognito is not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.",
        )

    cognito = _get_cognito_client()

    # Register in Cognito
    try:
        cognito_response = cognito.sign_up(
            ClientId=settings.cognito_client_id,
            Username=email,
            Password=body.password,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "custom:role", "Value": body.role.value},
            ],
        )
    except cognito.exceptions.UsernameExistsException:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    cognito_sub = cognito_response["UserSub"]

    # Create user in our DB
    user = User(
        email=email,
        role=body.role,
        cognito_sub=cognito_sub,
        verified=False,
    )
    db.add(user)
    db.flush()

    # Create empty profile
    if body.role == UserRole.business:
        profile = BusinessProfile(
            user_id=user.id,
            business_name=email.split("@")[0],  # Placeholder
        )
        db.add(profile)
    else:
        profile = InfluencerProfile(
            user_id=user.id,
            display_name=email.split("@")[0],  # Placeholder
        )
        db.add(profile)

    db.commit()

    return {
        "message": "Account created. Check your email for the verification code.",
        "user_id": str(user.id),
        "cognito_sub": cognito_sub,
    }


@router.post("/verify-email")
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    settings = get_settings()

    if _is_local_auth_mode(settings):
        email = body.email.lower().strip()
        user = db.query(User).filter(
            User.email == email,
            User.is_deleted == False,
        ).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.verified = True
        db.commit()
        return {"message": "Email verified successfully (local mode)"}

    if not _is_cognito_configured(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cognito is not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.",
        )

    cognito = _get_cognito_client()

    try:
        cognito.confirm_sign_up(
            ClientId=settings.cognito_client_id,
            Username=body.email,
            ConfirmationCode=body.code,
        )
    except cognito.exceptions.CodeMismatchException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )
    except cognito.exceptions.ExpiredCodeException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return {"message": "Email verified successfully"}


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    settings = get_settings()

    if _is_local_auth_mode(settings):
        email = body.email.lower().strip()
        user = db.query(User).filter(
            User.email == email,
            User.is_deleted == False,
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        _create_profile_if_needed(db, user, user.role)
        db.commit()
        db.refresh(user)
        return _build_dev_auth_response(user)

    if not _is_cognito_configured(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cognito is not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.",
        )

    cognito = _get_cognito_client()

    try:
        response = cognito.initiate_auth(
            ClientId=settings.cognito_client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": body.email.lower().strip(),
                "PASSWORD": body.password,
            },
        )
    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    except cognito.exceptions.UserNotConfirmedException:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    auth_result = response["AuthenticationResult"]
    return AuthResponse(
        access_token=auth_result["AccessToken"],
        id_token=auth_result["IdToken"],
        refresh_token=auth_result["RefreshToken"],
    )


@router.post("/dev-login", response_model=AuthResponse)
def dev_login(body: DevLoginRequest, db: Session = Depends(get_db)):
    settings = get_settings()

    if settings.environment != "local":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dev login is only available in local environment",
        )

    email = body.email.lower().strip()

    user = db.query(User).filter(
        User.email == email,
        User.is_deleted == False,
    ).first()

    if user and user.role != body.role:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already used by another role",
        )

    if not user:
        user = User(
            email=email,
            role=body.role,
            cognito_sub=f"local-dev-{uuid.uuid4()}",
            verified=True,
        )
        db.add(user)
        db.flush()
    _create_profile_if_needed(db, user, body.role)
    db.commit()
    db.refresh(user)

    return _build_dev_auth_response(user)


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest):
    settings = get_settings()

    if _is_local_auth_mode(settings):
        return {"message": "Local mode: use your existing account and any password for testing."}

    if not _is_cognito_configured(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cognito is not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.",
        )

    cognito = _get_cognito_client()

    try:
        cognito.forgot_password(
            ClientId=settings.cognito_client_id,
            Username=body.email,
        )
    except Exception:
        pass  # Don't reveal whether the email exists

    return {"message": "If the email is registered, a reset code has been sent."}


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cognito_sub = current_user.get("sub")
    user = db.query(User).filter(
        User.cognito_sub == cognito_sub,
        User.is_deleted == False,
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
