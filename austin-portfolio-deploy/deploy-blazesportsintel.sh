#!/bin/bash

# 🔥 Blaze Sports Intel Complete Deployment Script
# Ensures all JavaScript, CSS, and assets are properly deployed

echo "🔥 Starting Blaze Sports Intel deployment..."
echo "📦 Preparing complete deployment package..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}Error: index.html not found. Are you in the right directory?${NC}"
    exit 1
fi

# Create a deployment manifest
echo -e "${YELLOW}📝 Creating deployment manifest...${NC}"
cat > deployment-manifest.txt << EOF
DEPLOYMENT MANIFEST - $(date)
========================================
Essential Files:
- index.html
- championship-dashboard-integration.js
- unreal-engine-module.js
- monte-carlo-engine.js
- monte-carlo-visualizer.js
- league-wide-data-2024.js
- championship-3d-visualization-engine.js
- championship-60fps-optimization-engine.js
- championship-webgl-shader-optimizer.js
- championship-memory-optimizer.js
- championship-mobile-optimization.js
- championship-system-integration.js

CSS Directory (all files):
$(ls -la css/ 2>/dev/null | tail -n +2)

JS Directory (all files):
$(ls -la js/ 2>/dev/null | tail -n +2)

Data Directory:
$(ls -la data/ 2>/dev/null | tail -n +2 || echo "No data directory")

Images & Assets:
$(ls -la images/ 2>/dev/null | tail -n +2 || echo "No images directory")
========================================
EOF

echo -e "${GREEN}✅ Manifest created${NC}"

# Ensure all JavaScript files have correct MIME types in a _headers file
echo -e "${YELLOW}📝 Creating _headers file for proper MIME types...${NC}"
cat > _headers << EOF
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type

/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=3600

/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=3600

/*.json
  Content-Type: application/json; charset=utf-8
  Cache-Control: public, max-age=300

/*.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: public, max-age=300
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/images/*
  Cache-Control: public, max-age=86400
EOF

echo -e "${GREEN}✅ Headers file created${NC}"

# Create a _redirects file for handling routes
echo -e "${YELLOW}📝 Creating _redirects file...${NC}"
cat > _redirects << EOF
# Redirect www to non-www
https://www.blazesportsintel.com/* https://blazesportsintel.com/:splat 301!

# Handle SPA routing
/*    /index.html   200
EOF

echo -e "${GREEN}✅ Redirects file created${NC}"

# Check for required files
echo -e "${YELLOW}🔍 Verifying required files...${NC}"
MISSING_FILES=0

check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}  ❌ Missing: $1${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        echo -e "${GREEN}  ✅ Found: $1${NC}"
    fi
}

check_file "index.html"
check_file "championship-dashboard-integration.js"
check_file "unreal-engine-module.js"
check_file "monte-carlo-engine.js"
check_file "monte-carlo-visualizer.js"
check_file "css/blaze-revolutionary-command-center.css"
check_file "js/blaze-revolutionary-command-center.js"

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}Warning: $MISSING_FILES required files are missing${NC}"
    echo "Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

# Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"
echo "Using project: blazesportsintel"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: wrangler is not installed${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

# Deploy with explicit inclusion of all directories
echo -e "${GREEN}📤 Uploading all files to Cloudflare...${NC}"

# Use npx to ensure we use the local wrangler
npx wrangler pages deploy . \
    --project-name=blazesportsintel \
    --commit-dirty=true \
    --branch=main

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✨ Deployment successful!${NC}"
    echo ""
    echo "🌐 Your site should be live at:"
    echo "   https://blazesportsintel.com"
    echo "   https://blazesportsintel.pages.dev"
    echo ""
    echo "📊 Deployment Summary:"
    echo "   - All JavaScript modules deployed ✅"
    echo "   - CSS directories included ✅"
    echo "   - JS directories included ✅"
    echo "   - CORS headers configured ✅"
    echo "   - MIME types properly set ✅"
    echo ""
    echo "🔍 Next Steps:"
    echo "   1. Visit https://blazesportsintel.com"
    echo "   2. Open browser console to check for any errors"
    echo "   3. Verify all 3D visualizations load"
    echo "   4. Test Monte Carlo simulations"
    echo "   5. Check championship dashboard data"

    # Save deployment info
    echo "$(date): Deployment successful" >> deployment-log.txt
else
    echo -e "${RED}❌ Deployment failed with exit code: $DEPLOY_EXIT_CODE${NC}"
    echo "Check the error messages above for details"
    echo ""
    echo "Common fixes:"
    echo "1. Run: wrangler login"
    echo "2. Ensure you have access to the blazesportsintel project"
    echo "3. Check your internet connection"

    # Save error info
    echo "$(date): Deployment failed - Exit code: $DEPLOY_EXIT_CODE" >> deployment-log.txt
fi

echo ""
echo "📝 Deployment manifest saved to: deployment-manifest.txt"
echo "📊 Deployment log saved to: deployment-log.txt"