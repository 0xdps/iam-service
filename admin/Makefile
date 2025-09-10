# Admin Frontend Makefile

.PHONY: help install build dev test clean format lint

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install Node.js dependencies
	@echo "📦 Installing React dependencies..."
	@npm ci
	@echo "✅ React dependencies installed!"

build: ## Build React app for production
	@echo "🔨 Building admin frontend..."
	@npm run build
	@echo "✅ Admin frontend built!"

dev: ## Run in development mode
	@echo "🛠️  Starting admin frontend in development mode..."
	@npm start

start: ## Start production build (same as dev for React)
	@echo "🚀 Starting admin frontend..."
	@npm start

test: ## Run tests
	@echo "🧪 Running admin frontend tests..."
	@npm test -- --watchAll=false
	@echo "✅ Tests completed!"

test-watch: ## Run tests in watch mode
	@echo "👀 Running tests in watch mode..."
	@npm test

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	@npm test -- --coverage --watchAll=false
	@echo "✅ Coverage report generated!"

clean: ## Clean build artifacts and node_modules
	@echo "🧹 Cleaning admin frontend..."
	@rm -rf build
	@rm -rf node_modules
	@rm -rf coverage
	@echo "✅ Admin frontend cleaned!"

format: ## Format React/TypeScript code
	@echo "🎨 Formatting React/TypeScript code..."
	@if [ -f node_modules/.bin/prettier ]; then \
		npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"; \
	else \
		echo "⚠️  Prettier not found. Installing..."; \
		npm install --save-dev prettier; \
		npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"; \
	fi
	@echo "✅ React/TypeScript code formatted!"

lint: ## Run ESLint
	@echo "🔍 Running ESLint..."
	@if [ -f node_modules/.bin/eslint ]; then \
		npx eslint "src/**/*.{ts,tsx,js,jsx}"; \
	else \
		echo "⚠️  ESLint not found. Installing..."; \
		npm install --save-dev eslint; \
		npx eslint "src/**/*.{ts,tsx,js,jsx}"; \
	fi
	@echo "✅ Linting completed!"

lint-fix: ## Fix ESLint issues
	@echo "🔧 Fixing ESLint issues..."
	@if [ -f node_modules/.bin/eslint ]; then \
		npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix; \
	else \
		npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix; \
	fi
	@echo "✅ ESLint issues fixed!"

type-check: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript type checking..."
	@npx tsc --noEmit
	@echo "✅ Type checking completed!"

docker-build: ## Build Docker image
	@echo "🐳 Building admin frontend Docker image..."
	@docker build -t admin-frontend .
	@echo "✅ Docker image built!"

docker-run: ## Run Docker container
	@echo "🐳 Running admin frontend Docker container..."
	@docker run -p 3001:3000 admin-frontend

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
watch: ## Watch for file changes (same as dev)
	@echo "👀 Watching for changes..."
	@npm start

deps-update: ## Update dependencies
	@echo "⬆️  Updating dependencies..."
	@npm update
	@npm audit fix
	@echo "✅ Dependencies updated!"

deps-check: ## Check for outdated dependencies
	@echo "🔍 Checking for outdated dependencies..."
	@npm outdated

# Build analysis
analyze: ## Analyze bundle size
	@echo "📊 Analyzing bundle size..."
	@npm run build
	@if [ -f node_modules/.bin/source-map-explorer ]; then \
		npx source-map-explorer 'build/static/js/*.js'; \
	else \
		echo "⚠️  source-map-explorer not found. Installing..."; \
		npm install --save-dev source-map-explorer; \
		npx source-map-explorer 'build/static/js/*.js'; \
	fi

# Production helpers
prod-build: ## Build for production with optimizations
	@echo "🏭 Building for production..."
	@GENERATE_SOURCEMAP=false npm run build
	@echo "✅ Production build completed!"

serve-build: ## Serve production build locally
	@echo "🚀 Serving production build..."
	@if [ -f node_modules/.bin/serve ]; then \
		npx serve -s build -p 3001; \
	else \
		echo "⚠️  serve not found. Installing..."; \
		npm install --save-dev serve; \
		npx serve -s build -p 3001; \
	fi

# Testing helpers
test-e2e: ## Run end-to-end tests
	@echo "🧪 Running e2e tests..."
	@if [ -f node_modules/.bin/cypress ]; then \
		npx cypress run; \
	else \
		echo "⚠️  Cypress not installed. Skipping e2e tests."; \
	fi

test-unit: ## Run unit tests only
	@echo "🧪 Running unit tests..."
	@npm test -- --testPathPattern=".*\.test\.(ts|tsx)$$" --watchAll=false