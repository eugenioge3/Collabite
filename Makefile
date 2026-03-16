.PHONY: dev backend frontend migrate install help

# Default target
help:
	@echo ""
	@echo "  make dev       Levanta backend + frontend juntos (Ctrl+C para ambos)"
	@echo "  make backend   Solo backend  (http://localhost:8000)"
	@echo "  make frontend  Solo frontend (http://localhost:5173)"
	@echo "  make migrate   Corre migraciones de Alembic"
	@echo "  make install   Instala dependencias de backend y frontend"
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
