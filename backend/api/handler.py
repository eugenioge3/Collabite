from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from core.config import get_settings
from api.auth import router as auth_router
from api.influencers import router as influencers_router
from api.businesses import router as businesses_router
from api.campaigns import router as campaigns_router
from api.applications import router as applications_router

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


@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}


# Lambda handler
handler = Mangum(app, lifespan="off")
