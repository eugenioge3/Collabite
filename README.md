# Collabite

Marketplace que conecta restaurantes y negocios de hospitality con influencers locales de forma segura, rápida y verificada.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Python (FastAPI + Mangum) → AWS Lambda |
| Auth | AWS Cognito (1 pool, `custom:role`) |
| Database | PostgreSQL (Aurora Serverless v2) |
| Storage | S3 (media) + CloudFront (CDN) |
| Payments | Stripe Connect (escrow) |
| IaC | Terraform |
| CI/CD | GitHub Actions |

## Project Structure

```
Collabite/
├── frontend/          # React SPA
├── backend/           # FastAPI Lambda
│   ├── api/           # Route handlers
│   ├── core/          # Config, DB, auth
│   ├── models/        # SQLAlchemy + Pydantic
│   └── alembic/       # DB migrations
├── terraform/
│   ├── modules/       # Reusable TF modules
│   └── environments/  # Per-env configs
├── scripts/           # Deploy utilities
└── .github/workflows/ # CI/CD
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Terraform 1.5+
- AWS CLI configured
- PostgreSQL (local or Docker)

### 1. Bootstrap Terraform State

```bash
./terraform/scripts/bootstrap-state.sh dev
```

### 2. Deploy Infrastructure

```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### 3. Local Backend Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in values
uvicorn api.handler:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 4. Run Migrations

```bash
cd backend
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 5. Deploy

```bash
./scripts/deploy.sh dev           # Backend + infra
./scripts/deploy-frontend.sh dev  # Frontend
```

## Architecture Decisions

- **Aurora Serverless v2** over DynamoDB: relational data, complex queries, ACID for payments
- **1 Cognito User Pool** with `custom:role`: simpler auth, unique emails, single authorizer
- **Monolambda** with FastAPI + Mangum: fewer cold starts, simpler deploys, shared code
- **Alembic** for migrations: version-controlled schema changes
