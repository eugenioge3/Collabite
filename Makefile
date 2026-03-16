.PHONY: dev backend frontend migrate install help lint test test-backend test-frontend smoke qa

# Default target
help:
	@echo ""
	@echo "  make dev       Levanta backend + frontend juntos (Ctrl+C para ambos)"
	@echo "  make backend   Solo backend  (http://localhost:8000)"
	@echo "  make frontend  Solo frontend (http://localhost:5173)"
	@echo "  make migrate   Corre migraciones de Alembic"
	@echo "  make install   Instala dependencias de backend y frontend"
	@echo "  make lint      Corre lint del frontend"
	@echo "  make test      Corre tests unitarios de backend y frontend"
	@echo "  make smoke     Corre smoke test local del stack"
	@echo "  make qa        Corre gate manual: tests + build + smoke"
	@echo ""

# Levanta ambos en paralelo; Ctrl+C mata los dos
dev:
	@trap 'kill 0' INT; \
	bash scripts/run-local-backend.sh & \
	bash scripts/run-local-frontend.sh & \
	wait

backend:
	@bash scripts/run-local-backend.sh

frontend:
	@bash scripts/run-local-frontend.sh

migrate:
	@cd backend && ../.venv/bin/alembic upgrade head 2>/dev/null || \
	  .venv/bin/alembic upgrade head

install:
	@echo "→ Backend: instalando dependencias..."
	@cd backend && .venv/bin/python -m pip install -r requirements.txt -q
	@echo "→ Frontend: instalando dependencias..."
	@cd frontend && npm ci --silent
	@echo "✓ Listo"

lint:
	@echo "→ Frontend lint"
	@cd frontend && npm run lint

test: test-backend test-frontend

test-backend:
	@echo "→ Backend tests"
	@cd backend && .venv/bin/python -m pytest -q

test-frontend:
	@echo "→ Frontend tests"
	@cd frontend && npm run test

smoke:
	@bash scripts/smoke-local.sh

qa: lint test
	@echo "→ Frontend build"
	@cd frontend && npm run build
	@$(MAKE) smoke
