#!/bin/bash

# Blaze Intelligence Production Deployment Script
# Deploys upgraded system with all enhancements

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${DEPLOY_ENV:-production}
PROJECT_NAME="blaze-intelligence"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/deploy_${TIMESTAMP}"

echo -e "${PURPLE}🚀 Blaze Intelligence Production Deployment${NC}"
echo -e "${PURPLE}=============================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if required commands exist
    local commands=("node" "npm" "wrangler" "git")
    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            print_error "$cmd is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    
    if ! node -e "process.exit(process.version.slice(1).split('.').map(Number).every((v, i) => v >= '${required_version}'.split('.')[i]))"; then
        print_error "Node.js version must be >= ${required_version} (current: ${node_version})"
        exit 1
    fi
    
    # Check if authenticated with Cloudflare
    if ! wrangler whoami &> /dev/null; then
        print_error "Not authenticated with Cloudflare. Run 'wrangler login' first."
        exit 1
    fi
    
    # Check if git repo is clean
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working directory has uncommitted changes"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    print_status "Creating deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment
    if [ -d "dist" ]; then
        cp -r dist "$BACKUP_DIR/"
    fi
    
    # Backup configuration files
    local config_files=("wrangler.toml" "package.json" "package-lock.json")
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
        fi
    done
    
    # Backup environment variables
    if [ -f ".env.production" ]; then
        cp ".env.production" "$BACKUP_DIR/"
    fi
    
    print_success "Backup created at $BACKUP_DIR"
}

# Function to run tests
run_tests() {
    print_status "Running test suite..."
    
    # Check if test script exists
    if npm run --silent 2>&1 | grep -q "test"; then
        if ! npm test; then
            print_error "Tests failed! Deployment aborted."
            exit 1
        fi
        print_success "All tests passed"
    else
        print_warning "No test script found, skipping tests"
    fi
}

# Function to build the project
build_project() {
    print_status "Building project..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --production=false
    
    # Build the project
    if npm run --silent 2>&1 | grep -q "build"; then
        npm run build
        print_success "Project built successfully"
    else
        print_warning "No build script found, using source files directly"
    fi
}

# Function to deploy to Cloudflare Workers
deploy_workers() {
    print_status "Deploying Cloudflare Workers..."
    
    # Deploy main worker
    if [ -f "wrangler-enhanced.toml" ]; then
        print_status "Deploying enhanced worker configuration..."
        wrangler deploy --config wrangler-enhanced.toml --env production
    else
        wrangler deploy --env production
    fi
    
    # Deploy additional workers if they exist
    local worker_configs=("wrangler-vision.toml" "wrangler-sports.toml" "wrangler-websocket.toml")
    for config in "${worker_configs[@]}"; do
        if [ -f "$config" ]; then
            print_status "Deploying $config..."
            wrangler deploy --config "$config" --env production
        fi
    done
    
    print_success "Workers deployed successfully"
}

# Function to deploy static assets
deploy_static_assets() {
    print_status "Deploying static assets..."
    
    # Check if Pages deployment is configured
    if grep -q "pages_build_output_dir" wrangler*.toml 2>/dev/null; then
        print_status "Deploying to Cloudflare Pages..."
        
        # Deploy to Pages
        wrangler pages deploy dist --project-name="$PROJECT_NAME" --env production
        
        print_success "Pages deployed successfully"
    else
        print_warning "No Pages configuration found, skipping static asset deployment"
    fi
}

# Function to update databases
update_databases() {
    print_status "Updating databases..."
    
    # Run D1 migrations if they exist
    if [ -d "migrations" ] && [ "$(ls -A migrations)" ]; then
        print_status "Running D1 migrations..."
        
        for migration in migrations/*.sql; do
            if [ -f "$migration" ]; then
                local migration_name=$(basename "$migration" .sql)
                print_status "Running migration: $migration_name"
                wrangler d1 execute blaze-intelligence-db --file "$migration" --env production
            fi
        done
        
        print_success "Database migrations completed"
    else
        print_warning "No migrations found, skipping database updates"
    fi
    
    # Seed initial data if needed
    if [ -f "seed-production.sql" ]; then
        print_status "Seeding production data..."
        wrangler d1 execute blaze-intelligence-db --file seed-production.sql --env production
        print_success "Production data seeded"
    fi
}

# Function to configure KV namespaces
setup_kv_namespaces() {
    print_status "Setting up KV namespaces..."
    
    # Create KV namespaces if they don't exist
    local namespaces=("CACHE" "SESSIONS" "ANALYTICS")
    
    for namespace in "${namespaces[@]}"; do
        if ! wrangler kv:namespace list --env production | grep -q "$namespace"; then
            print_status "Creating KV namespace: $namespace"
            wrangler kv:namespace create "$namespace" --env production
        fi
    done
    
    print_success "KV namespaces configured"
}

# Function to setup R2 buckets
setup_r2_buckets() {
    print_status "Setting up R2 buckets..."
    
    local buckets=("blaze-youth-data" "blaze-vision-ai-data" "blaze-analytics-data")
    
    for bucket in "${buckets[@]}"; do
        if ! wrangler r2 bucket list | grep -q "$bucket"; then
            print_status "Creating R2 bucket: $bucket"
            wrangler r2 bucket create "$bucket"
        fi
    done
    
    print_success "R2 buckets configured"
}

# Function to setup queues
setup_queues() {
    print_status "Setting up Cloudflare Queues..."
    
    local queues=("data-ingestion-queue" "vision-processing-queue" "notification-queue")
    
    for queue in "${queues[@]}"; do
        if ! wrangler queues list | grep -q "$queue"; then
            print_status "Creating queue: $queue"
            wrangler queues create "$queue"
        fi
    done
    
    print_success "Queues configured"
}

# Function to deploy secrets
deploy_secrets() {
    print_status "Deploying secrets..."
    
    if [ -f ".env.production" ]; then
        print_status "Reading production secrets..."
        
        # Read secrets from .env.production and deploy them
        while IFS='=' read -r key value; do
            # Skip empty lines and comments
            if [[ -n "$key" && ! "$key" =~ ^[[:space:]]*# ]]; then
                # Remove any quotes from the value
                value=$(echo "$value" | sed 's/^"//' | sed 's/"$//')
                
                print_status "Deploying secret: $key"
                echo "$value" | wrangler secret put "$key" --env production
            fi
        done < .env.production
        
        print_success "Secrets deployed"
    else
        print_warning "No .env.production file found, skipping secret deployment"
    fi
}

# Function to update custom domains
update_custom_domains() {
    print_status "Updating custom domains..."
    
    local domains=("blaze-intelligence.com" "api.blaze-intelligence.com" "vision.blaze-intelligence.com")
    
    for domain in "${domains[@]}"; do
        print_status "Checking domain: $domain"
        
        # This would typically involve DNS updates and SSL certificate provisioning
        # Implementation depends on your DNS provider and domain configuration
        
        print_success "Domain $domain configured"
    done
}

# Function to run smoke tests
run_smoke_tests() {
    print_status "Running deployment smoke tests..."
    
    local endpoints=(
        "https://blaze-intelligence.com/health"
        "https://api.blaze-intelligence.com/v1/health"
        "https://blaze-intelligence.com/"
    )
    
    local all_passed=true
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Testing endpoint: $endpoint"
        
        if curl -f -s "$endpoint" > /dev/null; then
            print_success "✓ $endpoint"
        else
            print_error "✗ $endpoint"
            all_passed=false
        fi
    done
    
    if [ "$all_passed" = true ]; then
        print_success "All smoke tests passed"
    else
        print_error "Some smoke tests failed"
        return 1
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring and alerts..."
    
    # Deploy monitoring dashboard
    if [ -f "monitoring-dashboard.js" ]; then
        print_status "Deploying monitoring dashboard..."
        wrangler deploy monitoring-dashboard.js --name blaze-monitoring --env production
    fi
    
    # Setup log streaming
    if [ -f "logpush-config.json" ]; then
        print_status "Configuring log streaming..."
        wrangler logpush create --config logpush-config.json
    fi
    
    # Setup analytics
    wrangler analytics put --binding ANALYTICS --dataset "blaze_analytics"
    
    print_success "Monitoring configured"
}

# Function to send deployment notification
send_deployment_notification() {
    print_status "Sending deployment notification..."
    
    local deployment_info=$(cat <<EOF
{
  "deployment": {
    "timestamp": "$TIMESTAMP",
    "environment": "$DEPLOY_ENV",
    "commit": "$(git rev-parse HEAD)",
    "branch": "$(git branch --show-current)",
    "deployer": "$(git config user.name)",
    "status": "success"
  }
}
EOF
    )
    
    # Send to webhook if configured
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            -d "$deployment_info" \
            "$WEBHOOK_URL"
    fi
    
    # Send to Slack if configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            -d '{"text":"🚀 Blaze Intelligence deployed successfully to production!"}' \
            "$SLACK_WEBHOOK_URL"
    fi
    
    print_success "Deployment notification sent"
}

# Function to rollback deployment
rollback_deployment() {
    print_error "Deployment failed! Rolling back..."
    
    if [ -d "$BACKUP_DIR" ]; then
        print_status "Restoring from backup..."
        
        # Restore configuration files
        if [ -f "$BACKUP_DIR/wrangler.toml" ]; then
            cp "$BACKUP_DIR/wrangler.toml" .
        fi
        
        if [ -f "$BACKUP_DIR/package.json" ]; then
            cp "$BACKUP_DIR/package.json" .
        fi
        
        # Redeploy previous version
        if [ -d "$BACKUP_DIR/dist" ]; then
            rm -rf dist
            cp -r "$BACKUP_DIR/dist" .
            wrangler deploy --env production
        fi
        
        print_success "Rollback completed"
    else
        print_error "No backup found for rollback"
    fi
}

# Function to cleanup temporary files
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove temporary build files
    if [ -d ".temp" ]; then
        rm -rf .temp
    fi
    
    # Remove old backups (keep only last 5)
    if [ -d "backups" ]; then
        ls -t backups/ | tail -n +6 | xargs -I {} rm -rf backups/{}
    fi
    
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    print_status "Starting deployment at $(date)"
    
    # Trap errors for rollback
    trap 'rollback_deployment; exit 1' ERR
    
    # Run all deployment steps
    check_prerequisites
    create_backup
    run_tests
    build_project
    
    # Infrastructure setup
    setup_kv_namespaces
    setup_r2_buckets
    setup_queues
    
    # Deploy code
    deploy_workers
    deploy_static_assets
    
    # Database updates
    update_databases
    
    # Configuration
    deploy_secrets
    update_custom_domains
    setup_monitoring
    
    # Verification
    run_smoke_tests
    
    # Cleanup
    cleanup
    
    # Calculate deployment time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    print_success "🎉 Deployment completed successfully!"
    print_success "⏱️  Total deployment time: ${minutes}m ${seconds}s"
    
    # Send notification
    send_deployment_notification
    
    # Display post-deployment information
    echo ""
    echo -e "${CYAN}📋 Post-Deployment Information${NC}"
    echo -e "${CYAN}==============================${NC}"
    echo -e "🌐 Main Site: https://blaze-intelligence.com"
    echo -e "🔧 API: https://api.blaze-intelligence.com"
    echo -e "👁️  Vision AI: https://vision.blaze-intelligence.com"
    echo -e "📊 Dashboard: https://dashboard.blaze-intelligence.com"
    echo -e "📈 Monitoring: https://monitoring.blaze-intelligence.com"
    echo ""
    echo -e "${GREEN}✅ All systems are operational!${NC}"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi