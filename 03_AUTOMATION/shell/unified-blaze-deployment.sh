#!/bin/bash
# Unified Blaze Intelligence Domain Deployment Script
# This script consolidates all Blaze Intelligence pages under blaze-intelligence.com

set -euo pipefail

echo "🚀 Starting Blaze Intelligence Unification Process..."
echo "Target Domain: blaze-intelligence.com"
echo "====================================="

# Create unified deployment directory
UNIFIED_DIR="/Users/AustinHumphrey/blaze-unified-deployment"
mkdir -p "$UNIFIED_DIR"

# Copy core assets from main website
echo "📁 Copying core website assets..."
cp -r "/Users/AustinHumphrey/blaze-intelligence-website/index.html" "$UNIFIED_DIR/"
cp -r "/Users/AustinHumphrey/blaze-intelligence-website/js" "$UNIFIED_DIR/" 2>/dev/null || true
cp -r "/Users/AustinHumphrey/blaze-intelligence-website/src" "$UNIFIED_DIR/" 2>/dev/null || true
cp -r "/Users/AustinHumphrey/blaze-intelligence-website/site/src/data" "$UNIFIED_DIR/data/" 2>/dev/null || true

# Copy essential pages from different locations
echo "🔗 Consolidating pages from multiple sources..."

# From main website
for page in analytics-dashboard.html competitive-analysis.html pricing.html contact.html; do
    if [ -f "/Users/AustinHumphrey/blaze-intelligence-website/$page" ]; then
        cp "/Users/AustinHumphrey/blaze-intelligence-website/$page" "$UNIFIED_DIR/"
    fi
done

# From BlazeIntelligence directory
for page in integration-hub.html championship-os.html enterprise.html; do
    if [ -f "/Users/AustinHumphrey/BlazeIntelligence/$page" ]; then
        cp "/Users/AustinHumphrey/BlazeIntelligence/$page" "$UNIFIED_DIR/"
    fi
done

# Create unified real data integration
echo "📊 Integrating real data sources..."

# Copy real data files
mkdir -p "$UNIFIED_DIR/api/data"
cp "/Users/AustinHumphrey/blaze-sports-data-2025.json" "$UNIFIED_DIR/api/data/" 2>/dev/null || true
cp "/Users/AustinHumphrey/blaze-intelligence-website/site/src/data/readiness.json" "$UNIFIED_DIR/api/data/" 2>/dev/null || true

# Create robots.txt and sitemap
echo "🔍 Creating SEO files..."
cat > "$UNIFIED_DIR/robots.txt" << EOF
User-agent: *
Allow: /

Sitemap: https://blaze-intelligence.com/sitemap.xml
EOF

# Create _headers file for Cloudflare Pages
echo "🔒 Setting up security headers..."
cat > "$UNIFIED_DIR/_headers" << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://blaze-intelligence-api.workers.dev;

/api/*
  Access-Control-Allow-Origin: https://blaze-intelligence.com
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
EOF

# Create _redirects file for URL consolidation
echo "🔄 Setting up URL redirects..."
cat > "$UNIFIED_DIR/_redirects" << EOF
# Redirect old domains and pages
https://blaze-intelligence-lsl.pages.dev/* https://blaze-intelligence.com/:splat 301!
https://austin-humphrey-portfolio.pages.dev/* https://blaze-intelligence.com/:splat 301!

# Page redirects
/claude-baseball-demo /analytics-dashboard 301
/portfolio-showcase /competitive-analysis 301
/statistics-dashboard /analytics-dashboard 301
/multiplayer-client /enterprise 301

# API endpoints
/api/readiness /api/data/readiness.json 200
/api/sports-data /api/data/blaze-sports-data-2025.json 200
EOF

echo "✅ Unified deployment structure created at: $UNIFIED_DIR"
echo "📋 Next steps:"
echo "   1. Review unified content"
echo "   2. Deploy to blaze-intelligence.com"
echo "   3. Update DNS settings"
echo "   4. Test all redirects"
echo ""
echo "🎯 Ready for deployment to main domain!"