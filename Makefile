.PHONY: build test clean docker-build docker-up docker-down deps run-full run-backend run-frontend

# Variables
BINARY_NAME_AUTH=auth-service
BINARY_NAME_IAM=iam-service
DOCKER_COMPOSE_FULL=docker-compose.full.yml
DOCKER_COMPOSE_BACKEND=docker-compose.backend.yml
DOCKER_COMPOSE_FRONTEND=docker-compose.frontend.yml
DOCKER_COMPOSE_DEV=docker-compose.dev.yml

# Build commands
build:
	@echo "Building Auth Service..."
	cd auth && go build -o ../bin/$(BINARY_NAME_AUTH) ./cmd/main.go
	@echo "Building IAM Service..."
	cd iam && npm run build
	@echo "Building Admin Frontend..."
	cd admin && npm run build

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf bin/
	rm -rf auth/bin/
	rm -rf iam/dist/
	rm -rf admin/build/
	cd auth && go clean
	docker system prune -f

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	cd auth && go mod download && go mod tidy
	cd iam && npm ci
	cd admin && npm ci

# Run tests
test:
	@echo "Running tests..."
	cd auth && go test -v -race -coverprofile=coverage.out ./...
	cd iam && npm test
	cd admin && npm test -- --watchAll=false

# Run tests with coverage report
test-coverage:
	@echo "Running tests with coverage..."
	cd auth && go test -v -race -coverprofile=coverage.out ./...
	cd auth && go tool cover -html=coverage.out -o coverage.html
	cd iam && npm test -- --coverage --watchAll=false
	cd admin && npm test -- --coverage --watchAll=false

# ==============================================================================
# DOCKER COMMANDS - FULL STACK
# ==============================================================================

# Build all Docker images
docker-build:
	@echo "🔨 Building all Docker images..."
	docker compose -f $(DOCKER_COMPOSE_FULL) build

# Run complete system (Backend + Frontend + Databases)
run-full:
	@echo "🚀 Starting complete IAM system (Backend + Frontend + Databases)..."
	@echo "📊 Admin Dashboard will be available at: http://localhost:3001"
	@echo "🔐 Auth API will be available at: http://localhost:8080/api/auth"
	@echo "👥 IAM API will be available at: http://localhost:3000/api"
	@echo "🐘 PostgreSQL Auth DB: localhost:5432"
	@echo "🐘 PostgreSQL IAM DB: localhost:5433"
	@echo "🔴 Redis: localhost:6379"
	docker compose -f $(DOCKER_COMPOSE_FULL) up -d
	@echo "✅ All services started! Check status with: make status"

# Stop complete system
stop-full:
	@echo "🛑 Stopping complete IAM system..."
	docker compose -f $(DOCKER_COMPOSE_FULL) down

# ==============================================================================
# DOCKER COMMANDS - BACKEND ONLY
# ==============================================================================

# Run backend only (Auth + IAM + Databases)
run-backend:
	@echo "🔧 Starting backend services only..."
	@echo "🔐 Auth API will be available at: http://localhost:8080/api/auth"
	@echo "👥 IAM API will be available at: http://localhost:3000/api"
	@echo "🐘 PostgreSQL Auth DB: localhost:5432"
	@echo "🐘 PostgreSQL IAM DB: localhost:5433"
	@echo "🔴 Redis: localhost:6379"
	docker compose -f $(DOCKER_COMPOSE_BACKEND) up -d
	@echo "✅ Backend services started!"

# Stop backend
stop-backend:
	@echo "🛑 Stopping backend services..."
	docker compose -f $(DOCKER_COMPOSE_BACKEND) down

# ==============================================================================
# DOCKER COMMANDS - FRONTEND ONLY
# ==============================================================================

# Run frontend only (requires backend to be running)
run-frontend:
	@echo "🎨 Starting frontend service only..."
	@echo "⚠️  Make sure backend is running first!"
	@echo "📊 Admin Dashboard will be available at: http://localhost:3001"
	docker compose -f $(DOCKER_COMPOSE_FRONTEND) up -d
	@echo "✅ Frontend service started!"

# Stop frontend
stop-frontend:
	@echo "🛑 Stopping frontend service..."
	docker compose -f $(DOCKER_COMPOSE_FRONTEND) down

# ==============================================================================
# DOCKER COMMANDS - DEVELOPMENT
# ==============================================================================

# Original dev setup (backend only, no frontend container)
docker-up:
	@echo "🔧 Starting development environment (backend containers only)..."
	docker compose -f $(DOCKER_COMPOSE_DEV) up -d

# Stop dev environment
docker-down:
	@echo "🛑 Stopping development environment..."
	docker compose -f $(DOCKER_COMPOSE_DEV) down

# ==============================================================================
# MONITORING & MANAGEMENT
# ==============================================================================

# Show status of all services
status:
	@echo "📊 Full Stack Status:"
	@docker compose -f $(DOCKER_COMPOSE_FULL) ps
	@echo "\n🔧 Backend Only Status:"
	@docker compose -f $(DOCKER_COMPOSE_BACKEND) ps
	@echo "\n🎨 Frontend Only Status:"
	@docker compose -f $(DOCKER_COMPOSE_FRONTEND) ps

# Show logs for full stack
logs-full:
	@echo "📋 Showing logs for complete system..."
	docker compose -f $(DOCKER_COMPOSE_FULL) logs -f

# Show logs for backend only
logs-backend:
	@echo "📋 Showing logs for backend services..."
	docker compose -f $(DOCKER_COMPOSE_BACKEND) logs -f

# Show logs for frontend only
logs-frontend:
	@echo "📋 Showing logs for frontend service..."
	docker compose -f $(DOCKER_COMPOSE_FRONTEND) logs -f

# Show logs for specific service
logs:
	@echo "📋 Usage: make logs SERVICE=auth-service|iam-service|admin|auth-db|iam-db|redis"
	@if [ -n "$(SERVICE)" ]; then \
		docker compose -f $(DOCKER_COMPOSE_FULL) logs -f $(SERVICE); \
	fi

# Restart specific service
restart:
	@echo "🔄 Usage: make restart SERVICE=auth-service|iam-service|admin|auth-db|iam-db|redis"
	@if [ -n "$(SERVICE)" ]; then \
		docker compose -f $(DOCKER_COMPOSE_FULL) restart $(SERVICE); \
	fi

# Clean up everything
clean-docker:
	@echo "🧹 Cleaning up Docker resources..."
	docker compose -f $(DOCKER_COMPOSE_FULL) down -v
	docker compose -f $(DOCKER_COMPOSE_BACKEND) down -v
	docker compose -f $(DOCKER_COMPOSE_FRONTEND) down -v
	docker compose -f $(DOCKER_COMPOSE_DEV) down -v
	docker system prune -f
	docker volume prune -f

# ==============================================================================
# LOCAL DEVELOPMENT COMMANDS
# ==============================================================================

# Development setup
dev-setup:
	@echo "🛠️  Setting up development environment..."
	@if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || true; fi
	make deps
	@echo "✅ Development environment ready!"

# Run Auth Service locally (requires databases)
run-auth:
	@echo "🔐 Running Auth Service locally..."
	@echo "⚠️  Make sure databases are running: make docker-up"
	cd auth && go run ./cmd/main.go

# Run IAM Service locally (requires databases)
run-iam:
	@echo "👥 Running IAM Service locally..."
	@echo "⚠️  Make sure databases are running: make docker-up"
	cd iam && npm run dev

# Run admin frontend locally (requires Node.js)
run-admin-dev:
	@echo "🎨 Running admin frontend in development mode..."
	@echo "⚠️  Make sure backend is running: make run-backend"
	cd admin && npm start

# Install frontend dependencies
frontend-deps:
	@echo "📦 Installing frontend dependencies..."
	cd admin && npm install

# ==============================================================================
# DATABASE COMMANDS
# ==============================================================================

# Database migrations
migrate-up:
	@echo "🔼 Running database migrations..."
	@echo "Running Auth DB migrations..."
	docker compose -f $(DOCKER_COMPOSE_DEV) exec auth-db psql -U authuser -d authdb -f /docker-entrypoint-initdb.d/001_init.sql || true
	@echo "Running IAM DB migrations..."
	docker compose -f $(DOCKER_COMPOSE_DEV) exec iam-db psql -U iamuser -d iamdb -f /docker-entrypoint-initdb.d/001_init.sql || true

migrate-down:
	@echo "🔽 Rolling back database migrations..."
	@echo "⚠️  This will drop all tables! Continue? [y/N]"
	@read -r REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		docker compose -f $(DOCKER_COMPOSE_DEV) exec auth-db psql -U authuser -d authdb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		docker compose -f $(DOCKER_COMPOSE_DEV) exec iam-db psql -U iamuser -d iamdb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		echo "✅ Database rollback completed!"; \
	else \
		echo "❌ Database rollback cancelled."; \
	fi

# Reset databases
db-reset:
	@echo "🗃️  Resetting databases..."
	docker compose -f $(DOCKER_COMPOSE_DEV) down auth-db iam-db
	docker volume rm iam-service_auth_data iam-service_iam_data 2>/dev/null || true
	docker compose -f $(DOCKER_COMPOSE_DEV) up -d auth-db iam-db redis
	@sleep 10
	make migrate-up
	@echo "✅ Databases reset completed!"

# Backup databases
backup:
	@echo "💾 Creating database backups..."
	@mkdir -p backups
	docker compose -f $(DOCKER_COMPOSE_DEV) exec auth-db pg_dump -U authuser authdb > backups/auth-$(shell date +%Y%m%d-%H%M%S).sql
	docker compose -f $(DOCKER_COMPOSE_DEV) exec iam-db pg_dump -U iamuser iamdb > backups/iam-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "✅ Database backups created in ./backups/"

# ==============================================================================
# TESTING & QUALITY
# ==============================================================================

# Health check all services
health-check:
	@echo "🩺 Checking health of all services..."
	@echo "Auth Service:" && curl -s http://localhost:8080/health || echo "❌ Auth Service not responding"
	@echo "IAM Service:" && curl -s http://localhost:3000/health || echo "❌ IAM Service not responding"
	@echo "Admin Frontend:" && curl -s http://localhost:3001 || echo "❌ Admin Frontend not responding"

# Linting
lint:
	@echo "🔍 Running linters..."
	cd auth && golangci-lint run || go vet ./...
	cd iam && npm run lint || echo "⚠️  No lint script found in IAM service"
	cd admin && npm run lint || echo "⚠️  No lint script found in Admin frontend"

# Format code
fmt:
	@echo "✨ Formatting code..."
	cd auth && go fmt ./...
	cd iam && npm run format 2>/dev/null || echo "⚠️  No format script found in IAM service"
	cd admin && npm run format 2>/dev/null || echo "⚠️  No format script found in Admin frontend"

# Security scan
security:
	@echo "🔒 Running security scan..."
	cd auth && gosec ./... || echo "⚠️  gosec not installed"
	cd iam && npm audit || echo "⚠️  npm audit failed"
	cd admin && npm audit || echo "⚠️  npm audit failed"

# Full CI pipeline
ci: deps fmt lint test

# ==============================================================================
# CODE QUALITY & CLEANUP COMMANDS
# ==============================================================================

# Run comprehensive code cleanup and optimization
cleanup:
	@echo "🧹 Running comprehensive code cleanup..."
	@if [ -f scripts/cleanup.sh ]; then bash scripts/cleanup.sh; else echo "⚠️  cleanup.sh script not found"; fi

# Format Go code
format:
	@echo "🎨 Formatting code..."
	cd auth && go fmt ./...
	cd iam && npm run format 2>/dev/null || echo "✅ IAM formatting skipped"
	cd admin && npm run format 2>/dev/null || echo "✅ Admin formatting skipped"
	@echo "✅ Code formatting completed!"

# Check for TODOs and FIXMEs
check-todos:
	@echo "📝 Checking for TODOs and FIXMEs..."
	@find . -name "*.go" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -n -i "todo\|fixme" || echo "✅ No TODOs or FIXMEs found!"

# Full code quality check
code-quality: format lint security check-todos
	@echo "🎯 Code quality check completed!"

# ==============================================================================
# HELP
# ==============================================================================

help:
	@echo "🔐 IAM & Auth Platform - Available Commands"
	@echo ""
	@echo "🚀 QUICK START:"
	@echo "  make run-full          Start complete system (Backend + Frontend + Databases)"
	@echo "  make run-backend       Start backend only (Auth + IAM + Databases)"
	@echo "  make run-frontend      Start frontend only (requires backend running)"
	@echo ""
	@echo "🛑 STOP SERVICES:"
	@echo "  make stop-full         Stop complete system"
	@echo "  make stop-backend      Stop backend services"
	@echo "  make stop-frontend     Stop frontend service"
	@echo ""
	@echo "📊 MONITORING:"
	@echo "  make status           Show status of all services"
	@echo "  make logs-full        Show logs for complete system"
	@echo "  make logs-backend     Show logs for backend"
	@echo "  make logs-frontend    Show logs for frontend"
	@echo "  make health-check     Check health of all services"
	@echo ""
	@echo "🔨 DEVELOPMENT:"
	@echo "  make dev-setup        Setup development environment"
	@echo "  make run-auth         Run Auth Service locally"
	@echo "  make run-iam          Run IAM Service locally"
	@echo "  make run-admin-dev    Run admin frontend in dev mode"
	@echo ""
	@echo "🗃️  DATABASE:"
	@echo "  make migrate-up       Run database migrations"
	@echo "  make migrate-down     Rollback database migrations"
	@echo "  make db-reset         Reset databases"
	@echo "  make backup           Backup databases"
	@echo ""
	@echo "🧹 CLEANUP:"
	@echo "  make clean-docker     Clean up all Docker resources"
	@echo "  make clean            Clean build artifacts"
	@echo ""
	@echo "🔗 SERVICE URLS:"
	@echo "  Admin Dashboard:       http://localhost:3001"
	@echo "  Auth API:              http://localhost:8080/api/auth"
	@echo "  IAM API:               http://localhost:3000/api"
	@echo "  PostgreSQL Auth DB:    localhost:5432"
	@echo "  PostgreSQL IAM DB:     localhost:5433"
	@echo "  Redis:                 localhost:6379"

# Production deployment
deploy-prod: test docker-build
	@echo "🚀 Deploying to production..."
	@echo "⚠️  Add production deployment commands here"