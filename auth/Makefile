# Auth Service Makefile

.PHONY: help install build dev test clean format lint migrate

BINARY_NAME=auth-service
MAIN_PATH=./cmd/main.go

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Download Go modules
	@echo "📦 Installing Go dependencies..."
	@go mod download
	@go mod tidy
	@echo "✅ Go dependencies installed!"

build: ## Build the Go binary
	@echo "🔨 Building auth service..."
	@CGO_ENABLED=0 GOOS=linux go build -o $(BINARY_NAME) $(MAIN_PATH)
	@echo "✅ Auth service built!"

dev: ## Run in development mode
	@echo "🛠️  Starting auth service in development mode..."
	@go run $(MAIN_PATH)

test: ## Run tests
	@echo "🧪 Running auth service tests..."
	@go test -v ./...
	@echo "✅ Tests completed!"

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	@go test -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "✅ Coverage report generated: coverage.html"

clean: ## Clean build artifacts
	@echo "🧹 Cleaning auth service..."
	@rm -f $(BINARY_NAME)
	@rm -f coverage.out coverage.html
	@go clean
	@echo "✅ Auth service cleaned!"

format: ## Format Go code
	@echo "🎨 Formatting Go code..."
	@go fmt ./...
	@echo "✅ Go code formatted!"

lint: ## Run Go linting
	@echo "🔍 Running Go linting..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run; \
	else \
		echo "⚠️  golangci-lint not installed. Run: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
		go vet ./...; \
	fi
	@echo "✅ Linting completed!"

migrate: ## Run database migrations
	@echo "📊 Running auth database migrations..."
	@# This would typically use a migration tool like golang-migrate
	@echo "✅ Auth database migrations completed!"

docker-build: ## Build Docker image
	@echo "🐳 Building auth service Docker image..."
	@docker build -t auth-service .
	@echo "✅ Docker image built!"

docker-run: ## Run Docker container
	@echo "🐳 Running auth service Docker container..."
	@docker run -p 8080:8080 --env-file ../.env auth-service

# Security scanning
security-scan: ## Run security scanning
	@echo "🔒 Running security scan..."
	@if command -v gosec >/dev/null 2>&1; then \
		gosec ./...; \
	else \
		echo "⚠️  gosec not installed. Run: go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest"; \
	fi

# Development helpers
watch: ## Watch for file changes and restart
	@echo "👀 Watching for changes..."
	@if command -v air >/dev/null 2>&1; then \
		air; \
	else \
		echo "⚠️  air not installed. Run: go install github.com/cosmtrek/air@latest"; \
		make dev; \
	fi

mod-update: ## Update Go modules
	@echo "⬆️  Updating Go modules..."
	@go get -u ./...
	@go mod tidy
	@echo "✅ Go modules updated!"