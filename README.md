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

- Python 3.9+
- Node.js 20+
- npm 10+
- PostgreSQL 16 locally, or Docker/Docker Compose if quieres usar el `docker-compose.yml`
- Terraform 1.5+ y AWS CLI solo para despliegue remoto

## Local Development

### 1. Base de datos local

Opcion A: usar una instancia local de PostgreSQL con estos valores, que ya coinciden con [backend/.env.example](backend/.env.example):

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=collabite
DB_USER=collabite_admin
DB_PASSWORD=changeme
```

Opcion B: si tienes Docker disponible, levantar la DB incluida en el repo:

```bash
docker compose up -d db
```

### 2. Preparar backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
```

### 3. Levantar backend

Comando recomendado desde la raiz del repo:

```bash
./scripts/run-local-backend.sh
```

Comando equivalente manual:

```bash
cd backend
.venv/bin/alembic upgrade head
ENVIRONMENT=local .venv/bin/uvicorn api.handler:app --app-dir "$PWD" --host 127.0.0.1 --port 8000
```

Backend listo en:
- API health: `http://127.0.0.1:8000/api/health`
- OpenAPI docs: `http://127.0.0.1:8000/docs`

### 4. Preparar frontend

```bash
cd frontend
npm ci
```

### 5. Levantar frontend

Comando recomendado desde la raiz del repo:

```bash
./scripts/run-local-frontend.sh
```

Comando equivalente manual:

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend listo en:
- App: `http://127.0.0.1:5173`

### 6. Verificar stack local

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:5173/api/health
```

La segunda llamada valida tambien el proxy de Vite hacia el backend local.

### 7. Login local rapido

En desarrollo, la pantalla de login muestra botones de demo para entrar como negocio o influencer cuando el frontend corre en modo dev y el backend esta en `ENVIRONMENT=local`.

Abre:

```text
http://127.0.0.1:5173/login
```

Y usa:
- `Entrar demo Negocio`
- `Entrar demo Influencer`

## Remote Deploy

Los scripts de `scripts/deploy.sh` y `scripts/deploy-frontend.sh` despliegan a AWS. No son necesarios para correr la app en local.

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
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
ENVIRONMENT=local .venv/bin/uvicorn api.handler:app --app-dir "$PWD" --host 127.0.0.1 --port 8000
```

API docs: http://localhost:8000/docs

### 4. Run Migrations

```bash
cd backend
.venv/bin/alembic upgrade head
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
