#!/bin/bash

# IAM & Auth Platform - Cleanup Script
# This script performs comprehensive cleanup and optimization

set -e

echo "🧹 IAM & Auth Platform - Comprehensive Cleanup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running in project root
if [ ! -f "Makefile" ] || [ ! -f "docker-compose.full.yml" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

log_info "Starting cleanup process..."

# 1. Stop all running containers
log_info "Stopping all Docker containers..."
docker-compose -f docker-compose.full.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.backend.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.frontend.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
docker-compose down --remove-orphans 2>/dev/null || true
log_success "Docker containers stopped"

# 2. Clean build artifacts
log_info "Cleaning build artifacts..."

# Go build artifacts
if [ -d "auth" ]; then
    cd auth
    go clean 2>/dev/null || true
    rm -rf bin/ 2>/dev/null || true
    cd ..
fi

# Node.js build artifacts
for dir in iam admin; do
    if [ -d "$dir" ]; then
        cd "$dir"
        rm -rf node_modules/.cache 2>/dev/null || true
        rm -rf dist/ 2>/dev/null || true
        rm -rf build/ 2>/dev/null || true
        rm -rf .next/ 2>/dev/null || true
        cd ..
    fi
done

# Root build artifacts
rm -rf bin/ 2>/dev/null || true
rm -rf coverage.html 2>/dev/null || true
log_success "Build artifacts cleaned"

# 3. Clean Docker resources
log_info "Cleaning Docker resources..."

# Remove project-specific images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | grep "iam-service" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Clean system
docker system prune -f 2>/dev/null || true

# Clean volumes (with confirmation)
read -p "🗑️  Do you want to remove Docker volumes (this will delete all data)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Removing Docker volumes (data will be lost)..."
    docker volume prune -f 2>/dev/null || true
    log_success "Docker volumes removed"
else
    log_info "Skipping volume removal"
fi

log_success "Docker cleanup completed"

# 4. Clean temporary files
log_info "Cleaning temporary files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
log_success "Temporary files cleaned"

# 5. Clean test artifacts
log_info "Cleaning test artifacts..."
find . -name "coverage.out" -type f -delete 2>/dev/null || true
find . -name "coverage.html" -type f -delete 2>/dev/null || true
find . -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true
log_success "Test artifacts cleaned"

# 6. Clean IDE and editor files
log_info "Cleaning IDE files..."
find . -name ".vscode" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.swp" -type f -delete 2>/dev/null || true
find . -name "*.swo" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true
log_success "IDE files cleaned"

# 7. Optimize Git repository
if [ -d ".git" ]; then
    log_info "Optimizing Git repository..."
    git gc --auto 2>/dev/null || true
    git prune 2>/dev/null || true
    log_success "Git repository optimized"
fi

# 8. Check for large files
log_info "Checking for large files (>10MB)..."
large_files=$(find . -type f -size +10M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null || true)
if [ -n "$large_files" ]; then
    log_warning "Large files found:"
    echo "$large_files" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  📁 $file ($size)"
    done
else
    log_success "No large files found"
fi

# 9. Security cleanup
log_info "Security cleanup..."
find . -name ".env.local" -type f -delete 2>/dev/null || true
find . -name ".env.development.local" -type f -delete 2>/dev/null || true
find . -name ".env.production.local" -type f -delete 2>/dev/null || true
log_success "Security cleanup completed"

# 10. Dependency cleanup
log_info "Cleaning dependency caches..."

# Go module cache cleanup
if command -v go &> /dev/null; then
    go clean -modcache 2>/dev/null || true
fi

# NPM cache cleanup
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null || true
fi

# Yarn cache cleanup
if command -v yarn &> /dev/null; then
    yarn cache clean 2>/dev/null || true
fi

log_success "Dependency caches cleaned"

# 11. Final disk usage check
log_info "Final disk usage report..."
if command -v du &> /dev/null; then
    total_size=$(du -sh . 2>/dev/null | cut -f1)
    echo "📊 Total project size: $total_size"
    
    # Show top 5 largest directories
    echo "🔍 Largest directories:"
    du -sh */ 2>/dev/null | sort -hr | head -5 | while read size dir; do
        echo "  📁 $dir - $size"
    done
fi

echo ""
echo "=============================================="
log_success "🎉 Cleanup completed successfully!"
echo ""
log_info "Next steps:"
echo "  • Run 'make dev-setup' to reinstall dependencies"
echo "  • Run 'make run-full' to start the platform"
echo "  • Run 'make test' to verify everything works"
echo ""
log_info "For a fresh start:"
echo "  • make deps          # Install dependencies"
echo "  • make docker-build  # Build Docker images"
echo "  • make run-full      # Start complete system"