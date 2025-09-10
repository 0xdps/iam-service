# IAM Service Makefile

.PHONY: help install build dev test clean format lint migrate

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install Node.js dependencies
	@echo "📦 Installing Node.js dependencies..."
	@npm ci
	@echo "✅ Node.js dependencies installed!"

build: ## Build TypeScript code
	@echo "🔨 Building IAM service..."
	@npm run build
	@echo "✅ IAM service built!"

dev: ## Run in development mode
	@echo "🛠️  Starting IAM service in development mode..."
	@npm run dev

start: ## Start production build
	@echo "🚀 Starting IAM service..."
	@npm start

test: ## Run tests
	@echo "🧪 Running IAM service tests..."
	@npm test
	@echo "✅ Tests completed!"

test-watch: ## Run tests in watch mode
	@echo "👀 Running tests in watch mode..."
	@npm run test:watch

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	@npm run test:coverage
	@echo "✅ Coverage report generated!"

clean: ## Clean build artifacts and node_modules
	@echo "🧹 Cleaning IAM service..."
	@rm -rf dist
	@rm -rf node_modules
	@rm -rf coverage
	@echo "✅ IAM service cleaned!"

format: ## Format TypeScript code
	@echo "🎨 Formatting TypeScript code..."
	@if [ -f node_modules/.bin/prettier ]; then \
		npm run format || npx prettier --write "src/**/*.{ts,js,json}"; \
	else \
		echo "⚠️  Prettier not found. Installing..."; \
		npm install --save-dev prettier; \
		npx prettier --write "src/**/*.{ts,js,json}"; \
	fi
	@echo "✅ TypeScript code formatted!"

lint: ## Run ESLint
	@echo "🔍 Running ESLint..."
	@if [ -f node_modules/.bin/eslint ]; then \
		npm run lint || npx eslint "src/**/*.{ts,js}"; \
	else \
		echo "⚠️  ESLint not found. Installing..."; \
		npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin; \
		npx eslint "src/**/*.{ts,js}"; \
	fi
	@echo "✅ Linting completed!"

lint-fix: ## Fix ESLint issues
	@echo "🔧 Fixing ESLint issues..."
	@if [ -f node_modules/.bin/eslint ]; then \
		npm run lint:fix || npx eslint "src/**/*.{ts,js}" --fix; \
	else \
		npx eslint "src/**/*.{ts,js}" --fix; \
	fi
	@echo "✅ ESLint issues fixed!"

type-check: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript type checking..."
	@npx tsc --noEmit
	@echo "✅ Type checking completed!"

migrate: ## Run database migrations
	@echo "📊 Running IAM database migrations..."
	@npm run migrate || node dist/migrations/migrate.js
	@echo "✅ IAM database migrations completed!"

docker-build: ## Build Docker image
	@echo "🐳 Building IAM service Docker image..."
	@docker build -t iam-service .
	@echo "✅ Docker image built!"

docker-run: ## Run Docker container
	@echo "🐳 Running IAM service Docker container..."
	@docker run -p 3000:3000 --env-file ../.env iam-service

# Security scanning
security-audit: ## Run npm security audit
	@echo "🔒 Running npm security audit..."
	@npm audit
	@echo "✅ Security audit completed!"

security-fix: ## Fix npm security issues
	@echo "🔧 Fixing npm security issues..."
	@npm audit fix
	@echo "✅ Security issues fixed!"

# Development helpers
watch: ## Watch for file changes and restart
	@echo "👀 Watching for changes..."
	@npm run dev

deps-update: ## Update dependencies
	@echo "⬆️  Updating dependencies..."
	@npm update
	@npm audit fix
	@echo "✅ Dependencies updated!"

deps-check: ## Check for outdated dependencies
	@echo "🔍 Checking for outdated dependencies..."
	@npm outdated

# Production helpers
prod-build: ## Build for production
	@echo "🏭 Building for production..."
	@NODE_ENV=production npm run build
	@echo "✅ Production build completed!"

prod-start: ## Start in production mode
	@echo "🚀 Starting in production mode..."
	@NODE_ENV=production npm start