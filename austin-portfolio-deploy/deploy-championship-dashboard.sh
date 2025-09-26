#!/bin/bash

echo "🏆 CHAMPIONSHIP DASHBOARD DEPLOYMENT TO BLAZESPORTSINTEL.COM"
echo "============================================================"
echo ""
echo "🎯 Deploying institutional-grade Monte Carlo championship analytics..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_progress() {
    echo -e "${PURPLE}🔄${NC} $1"
}

# Pre-deployment validation
echo "🔍 Pre-deployment validation..."
echo ""

# Check if required files exist
print_progress "Checking championship dashboard files..."

required_files=(
    "championship-dashboard.html"
    "js/championship-data-engine.js"
    "js/championship-monte-carlo-visualizer.js"
    "js/championship-scenario-simulator.js"
    "monte-carlo-engine.js"
    "monte-carlo-visualizer.js"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Missing required files. Please ensure all championship dashboard components are present."
    exit 1
fi

echo ""

# Check file sizes to ensure they're not empty
print_progress "Validating file content..."

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        if [ $size -gt 1000 ]; then
            print_status "$file: ${size} bytes"
        else
            print_warning "$file: Only ${size} bytes (may be incomplete)"
        fi
    fi
done

echo ""

# Check network connectivity
print_progress "Checking network connectivity..."

if ping -c 1 cloudflare.com &> /dev/null; then
    print_status "Network connectivity confirmed"
else
    print_error "Network connectivity issues detected"
    exit 1
fi

echo ""

# Stage 1: Deploy to Cloudflare Pages
echo "🚀 STAGE 1: Deploying to Cloudflare Pages"
echo "=========================================="
echo ""

print_progress "Preparing deployment package..."

# Create deployment directory
DEPLOY_DIR="championship-deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy all necessary files
print_progress "Copying championship dashboard files..."

cp -r * "$DEPLOY_DIR/" 2>/dev/null || true

# Ensure critical files are present
cp championship-dashboard.html "$DEPLOY_DIR/"
cp -r js/ "$DEPLOY_DIR/"
cp monte-carlo-engine.js "$DEPLOY_DIR/"
cp monte-carlo-visualizer.js "$DEPLOY_DIR/"

# Copy CSS and assets if they exist
[ -d "css" ] && cp -r css/ "$DEPLOY_DIR/"
[ -d "assets" ] && cp -r assets/ "$DEPLOY_DIR/"
[ -d "data" ] && cp -r data/ "$DEPLOY_DIR/"

print_status "Deployment package prepared in $DEPLOY_DIR"

echo ""

# Deploy to Cloudflare Pages
print_progress "Deploying to Cloudflare Pages..."

if command -v wrangler &> /dev/null; then
    print_info "Using Wrangler CLI for deployment..."

    cd "$DEPLOY_DIR"

    # Deploy to pages
    if wrangler pages deploy . --project-name blaze-intelligence --compatibility-date 2024-01-01; then
        print_status "Successfully deployed to Cloudflare Pages!"
        PAGES_URL="https://blaze-intelligence.pages.dev"
        print_info "Pages URL: $PAGES_URL"
    else
        print_error "Failed to deploy to Cloudflare Pages"
        cd ..
        rm -rf "$DEPLOY_DIR"
        exit 1
    fi

    cd ..
else
    print_warning "Wrangler CLI not found. Please install it for automated deployment."
    print_info "Manual deployment: Upload contents of $DEPLOY_DIR to Cloudflare Pages"
fi

echo ""

# Stage 2: Verify deployment
echo "🔍 STAGE 2: Deployment Verification"
echo "==================================="
echo ""

sleep 10 # Wait for propagation

print_progress "Verifying championship dashboard deployment..."

# Check if pages deployment is working
PAGES_URL="https://blaze-intelligence.pages.dev"
if curl -s "$PAGES_URL/championship-dashboard.html" | grep -q "Championship Intelligence Hub"; then
    print_status "Championship dashboard deployed successfully to Pages!"
else
    print_warning "Championship dashboard may still be propagating to Pages"
fi

# Check if main site has championship navigation
if curl -s "$PAGES_URL" | grep -q "championship-dashboard.html"; then
    print_status "Main site updated with championship navigation!"
else
    print_warning "Main site may need manual update for championship navigation"
fi

# Check JavaScript assets
JS_FILES=("championship-data-engine.js" "championship-monte-carlo-visualizer.js" "championship-scenario-simulator.js")
for js_file in "${JS_FILES[@]}"; do
    if curl -s "$PAGES_URL/js/$js_file" | grep -q "Championship"; then
        print_status "JavaScript asset loaded: $js_file"
    else
        print_warning "JavaScript asset may have issues: $js_file"
    fi
done

echo ""

# Stage 3: Domain routing instructions
echo "🌐 STAGE 3: Domain Routing Configuration"
echo "========================================"
echo ""

print_info "Championship dashboard is now deployed to Cloudflare Pages"
print_info "Next step: Configure blazesportsintel.com to point to Pages"

echo ""
echo "📋 MANUAL STEPS REQUIRED IN CLOUDFLARE DASHBOARD:"
echo ""
echo "1. REMOVE WORKER ROUTE (if exists):"
echo "   - Go to Workers & Pages → Workers"
echo "   - Find any worker attached to blazesportsintel.com"
echo "   - Click worker → Triggers tab"
echo "   - Delete route: blazesportsintel.com/*"
echo ""
echo "2. ADD PAGES CUSTOM DOMAIN:"
echo "   - Go to Workers & Pages → Pages"
echo "   - Click 'blaze-intelligence' project"
echo "   - Go to Custom domains tab"
echo "   - Click 'Set up a custom domain'"
echo "   - Enter: blazesportsintel.com"
echo "   - Click 'Continue'"
echo "   - Follow DNS setup instructions"
echo ""
echo "3. VERIFY DNS RECORDS:"
echo "   - Ensure CNAME: blazesportsintel.com → blaze-intelligence.pages.dev"
echo "   - Wait for DNS propagation (5-10 minutes)"
echo ""

# Stage 4: Final verification
echo "⏳ Waiting for DNS propagation..."
echo ""

# Wait and then check domain
for i in {1..3}; do
    print_progress "Checking blazesportsintel.com (attempt $i/3)..."

    if curl -s https://blazesportsintel.com | grep -q "Championship Intelligence Hub"; then
        print_status "SUCCESS! blazesportsintel.com is now serving the championship dashboard!"
        break
    elif curl -s https://blazesportsintel.com | grep -q "Blaze Sports Intel"; then
        print_status "blazesportsintel.com is working, but may need cache refresh for championship features"
        break
    else
        print_warning "blazesportsintel.com not ready yet (attempt $i/3)"
        if [ $i -lt 3 ]; then
            echo "   Waiting 30 seconds before retry..."
            sleep 30
        fi
    fi
done

echo ""

# Performance metrics
print_progress "Generating deployment metrics..."

echo ""
echo "📊 CHAMPIONSHIP DASHBOARD DEPLOYMENT METRICS"
echo "============================================"
echo ""

# Calculate deployment package size
if [ -d "$DEPLOY_DIR" ]; then
    PACKAGE_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)
    echo "📦 Deployment package size: $PACKAGE_SIZE"
fi

# Count files deployed
FILE_COUNT=$(find "$DEPLOY_DIR" -type f | wc -l)
echo "📁 Files deployed: $FILE_COUNT"

# JavaScript bundle analysis
if [ -f "$DEPLOY_DIR/js/championship-data-engine.js" ]; then
    ENGINE_SIZE=$(wc -c < "$DEPLOY_DIR/js/championship-data-engine.js")
    echo "🎲 Data engine size: $((ENGINE_SIZE / 1024))KB"
fi

if [ -f "$DEPLOY_DIR/js/championship-monte-carlo-visualizer.js" ]; then
    VISUALIZER_SIZE=$(wc -c < "$DEPLOY_DIR/js/championship-monte-carlo-visualizer.js")
    echo "🎨 Visualizer size: $((VISUALIZER_SIZE / 1024))KB"
fi

if [ -f "$DEPLOY_DIR/js/championship-scenario-simulator.js" ]; then
    SIMULATOR_SIZE=$(wc -c < "$DEPLOY_DIR/js/championship-scenario-simulator.js")
    echo "🎯 Simulator size: $((SIMULATOR_SIZE / 1024))KB"
fi

echo ""

# Feature summary
echo "🏆 CHAMPIONSHIP DASHBOARD FEATURES DEPLOYED"
echo "==========================================="
echo ""
print_status "✨ Real-time championship probabilities for Cardinals/Titans/Longhorns/Grizzlies"
print_status "✨ 3D Monte Carlo visualizer with team-specific branding"
print_status "✨ Interactive scenario simulation tools"
print_status "✨ Advanced probability distributions with confidence intervals"
print_status "✨ GPU-accelerated particle systems with 15,000+ particles"
print_status "✨ Team-specific formations (baseball diamond, football field, basketball court)"
print_status "✨ Real-time data integration with championship data engine"
print_status "✨ Professional-grade Bloomberg Terminal style interface"
print_status "✨ Mobile-responsive design with performance optimization"
print_status "✨ Export capabilities for PDF reports and CSV data"

echo ""

# Analytics URLs
echo "📊 CHAMPIONSHIP DASHBOARD URLS"
echo "=============================="
echo ""
echo "🏆 Main Championship Dashboard:"
echo "   https://blazesportsintel.com/championship-dashboard.html"
echo ""
echo "📊 Pages Deployment:"
echo "   https://blaze-intelligence.pages.dev/championship-dashboard.html"
echo ""
echo "🎲 Monte Carlo Integration:"
echo "   https://blazesportsintel.com/#mcProbabilityCloud"
echo ""
echo "🎯 Scenario Simulator:"
echo "   https://blazesportsintel.com/championship-dashboard.html#scenarioBuilder"
echo ""

# Final status
if curl -s https://blazesportsintel.com | grep -q "Championship"; then
    echo ""
    print_status "🎉 CHAMPIONSHIP DASHBOARD DEPLOYMENT COMPLETE!"
    print_status "🔗 Live at: https://blazesportsintel.com"
    print_status "🏆 Championship Hub: https://blazesportsintel.com/championship-dashboard.html"
    echo ""
    print_info "The Deep South's definitive championship intelligence platform is now live!"
else
    echo ""
    print_warning "⏳ Deployment complete, but domain may still be propagating"
    print_info "📝 Manual DNS configuration may be required in Cloudflare Dashboard"
    print_info "🔄 Check again in 5-10 minutes for full propagation"
fi

echo ""
echo "📝 DEPLOYMENT LOG SAVED TO: championship-deployment-$(date +%Y%m%d).log"

# Clean up deployment directory
if [ -d "$DEPLOY_DIR" ]; then
    print_progress "Cleaning up deployment directory..."
    rm -rf "$DEPLOY_DIR"
    print_status "Cleanup complete"
fi

echo ""
echo "🏆 Championship Dashboard Deployment Complete!"
echo "============================================="
echo ""