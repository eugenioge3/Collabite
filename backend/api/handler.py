from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from sqlalchemy import text
from core.config import get_settings
from core.database import get_engine
from api.auth import router as auth_router
from api.influencers import router as influencers_router
from api.businesses import router as businesses_router
from api.campaigns import router as campaigns_router
from api.applications import router as applications_router
from api.verification import router as verification_router

settings = get_settings()

app = FastAPI(
    title="Collabite API",
    description="Marketplace connecting businesses with local influencers",
    version="0.1.0",
    root_path="/api" if settings.environment != "local" else "",
)

# CORS
origins = settings.cors_allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(influencers_router, prefix="/api/influencers", tags=["Influencers"])
app.include_router(businesses_router, prefix="/api/businesses", tags=["Businesses"])
app.include_router(campaigns_router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
app.include_router(verification_router, prefix="/api/verify", tags=["Verification"])


def _check_database_health():
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        return {
            "status": "error",
            "error": "database_unreachable",
        }


def _build_health_payload():
    db_health = _check_database_health()

    checks = {
        "api": "ok",
        "database": db_health["status"],
    }

    payload = {
        "status": "ok" if db_health["status"] == "ok" else "degraded",
        "environment": settings.environment,
        "checks": checks,
    }

    if db_health["status"] != "ok":
        payload["checks"]["database_error"] = db_health.get("error", "unknown")
        return 503, payload

    return 200, payload


@app.get("/api/health")
def health_check():
    status_code, payload = _build_health_payload()
    return JSONResponse(status_code=status_code, content=payload)


# Lambda handler
handler = Mangum(app, lifespan="off")
