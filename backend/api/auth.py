import boto3
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.config import get_settings
from core.database import get_db
from core.auth import get_current_user
from models.schemas import (
    RegisterRequest,
    LoginRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    AuthResponse,
    UserResponse,
)
from models.models import User, UserRole, BusinessProfile, InfluencerProfile

router = APIRouter()


def _get_cognito_client():
    return boto3.client("cognito-idp", region_name=get_settings().cognito_region)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    cognito = _get_cognito_client()

    # Register in Cognito
    try:
        cognito_response = cognito.sign_up(
            ClientId=settings.cognito_client_id,
            Username=body.email,
            Password=body.password,
            UserAttributes=[
                {"Name": "email", "Value": body.email},
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
        email=body.email,
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
            business_name=body.email.split("@")[0],  # Placeholder
        )
        db.add(profile)
    else:
        profile = InfluencerProfile(
            user_id=user.id,
            display_name=body.email.split("@")[0],  # Placeholder
        )
        db.add(profile)

    db.commit()

    return {
        "message": "Account created. Check your email for the verification code.",
        "user_id": str(user.id),
        "cognito_sub": cognito_sub,
    }


@router.post("/verify-email")
def verify_email(body: VerifyEmailRequest):
    settings = get_settings()
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
def login(body: LoginRequest):
    settings = get_settings()
    cognito = _get_cognito_client()

    try:
        response = cognito.initiate_auth(
            ClientId=settings.cognito_client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": body.email,
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


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest):
    settings = get_settings()
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
