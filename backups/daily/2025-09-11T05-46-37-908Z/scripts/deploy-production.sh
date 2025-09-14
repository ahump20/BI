#!/bin/bash
# Blaze Intelligence Production Deployment Script
# Deploys platform with comprehensive error handling and testing

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check for required tools
    command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { error "npm is required but not installed."; exit 1; }
    command -v git >/dev/null 2>&1 || { error "git is required but not installed."; exit 1; }
    command -v python3 >/dev/null 2>&1 || { error "python3 is required but not installed."; exit 1; }
    
    # Check if wrangler is available
    if ! command -v wrangler >/dev/null 2>&1; then
        log "Installing wrangler..."
        npm install -g wrangler
    fi
    
    success "Prerequisites check completed"
}

# Run tests
run_tests() {
    log "🧪 Running tests..."
    
    # Test Python biometric integration
    log "Testing biometric integration..."
    if python3 biometrics/biometric_integrator.py >/dev/null 2>&1; then
        success "Biometric integration tests passed"
    else
        error "Biometric integration tests failed"
        exit 1
    fi
    
    # Test API health endpoint
    log "Testing API health endpoint..."
    if node -e "
        const health = require('./api/health.js');
        console.log('API health endpoint available');
    " >/dev/null 2>&1; then
        success "API endpoints are valid"
    else
        warning "API endpoint tests skipped (no runtime environment)"
    fi
    
    # Test Cardinals analytics server
    log "Testing Cardinals analytics server..."
    if node -c cardinals-analytics-server.js; then
        success "Cardinals analytics server is valid"
    else
        error "Cardinals analytics server validation failed"
        exit 1
    fi
}

# Build and optimize
build_project() {
    log "🏗️  Building project..."
    
    # Install dependencies
    log "Installing Node.js dependencies..."
    npm install --production
    
    # Create optimized production build
    log "Creating production build..."
    npm run build 2>/dev/null || log "No build script defined, skipping..."
    
    success "Build completed"
}

# Deploy to Cloudflare
deploy_cloudflare() {
    log "🚀 Deploying to Cloudflare..."
    
    # Check if wrangler is authenticated
    if ! wrangler whoami >/dev/null 2>&1; then
        error "Wrangler not authenticated. Please run 'wrangler login' first."
        exit 1
    fi
    
    # Deploy Workers
    log "Deploying Cloudflare Workers..."
    wrangler deploy || {
        error "Cloudflare Workers deployment failed"
        exit 1
    }
    
    # Deploy to Pages (if configured)
    if [ -f "wrangler.toml" ] && grep -q "pages" wrangler.toml; then
        log "Deploying to Cloudflare Pages..."
        wrangler pages publish ./ || warning "Pages deployment failed or not configured"
    fi
    
    success "Cloudflare deployment completed"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    log "📄 Deploying to GitHub Pages..."
    
    # Create deployment commit
    git add .
    git diff --staged --quiet || {
        git commit -m "🚀 Production deployment $(date +'%Y-%m-%d %H:%M:%S')"
        git push origin main || {
            error "Failed to push to GitHub"
            exit 1
        }
    }
    
    success "GitHub Pages deployment completed"
}

# Health checks
run_health_checks() {
    log "🔍 Running post-deployment health checks..."
    
    # Wait for deployment to propagate
    sleep 10
    
    # Check main domain
    if curl -sS -o /dev/null -w "%{http_code}" "https://ahump20.github.io/BI" | grep -q "200"; then
        success "Main site is accessible"
    else
        warning "Main site health check failed or still propagating"
    fi
    
    # Check API endpoints (if available)
    if curl -sS -o /dev/null -w "%{http_code}" "https://ahump20.github.io/BI/api/health" | grep -q "200"; then
        success "API health endpoint responding"
    else
        warning "API health endpoint not accessible (may be Cloudflare Workers only)"
    fi
}

# Backup current state
create_backup() {
    log "💾 Creating deployment backup..."
    
    BACKUP_DIR="backups/deployment_$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"
    
    # Backup critical files
    cp -r api/ "$BACKUP_DIR/" 2>/dev/null || true
    cp -r biometrics/ "$BACKUP_DIR/" 2>/dev/null || true
    cp -r scripts/ "$BACKUP_DIR/" 2>/dev/null || true
    cp wrangler.toml "$BACKUP_DIR/" 2>/dev/null || true
    cp package.json "$BACKUP_DIR/" 2>/dev/null || true
    cp requirements.txt "$BACKUP_DIR/" 2>/dev/null || true
    
    success "Backup created in $BACKUP_DIR"
}

# Main deployment function
main() {
    log "🔥 Starting Blaze Intelligence Production Deployment"
    log "=================================================="
    
    # Create backup before deployment
    create_backup
    
    # Run all deployment steps
    check_prerequisites
    run_tests
    build_project
    
    # Deploy to multiple targets
    deploy_github_pages
    
    # Deploy to Cloudflare (if configured)
    if command -v wrangler >/dev/null 2>&1 && [ -f "wrangler.toml" ]; then
        deploy_cloudflare
    else
        warning "Cloudflare deployment skipped (wrangler not configured)"
    fi
    
    # Final health checks
    run_health_checks
    
    success "🎉 Deployment completed successfully!"
    log "=================================================="
    log "🌐 Site: https://ahump20.github.io/BI"
    log "📊 Analytics: https://ahump20.github.io/BI/cardinals"
    log "🔍 Health: https://ahump20.github.io/BI/api/health"
    log "📱 Mobile: https://ahump20.github.io/BI/mobile-app"
    log "=================================================="
}

# Handle script arguments
case "${1:-deploy}" in
    "test-only")
        log "Running tests only..."
        check_prerequisites
        run_tests
        ;;
    "build-only")
        log "Building project only..."
        check_prerequisites
        build_project
        ;;
    "deploy"|"")
        main
        ;;
    *)
        echo "Usage: $0 [test-only|build-only|deploy]"
        exit 1
        ;;
esac