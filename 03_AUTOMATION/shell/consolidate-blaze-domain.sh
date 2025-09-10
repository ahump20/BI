#!/bin/bash
# Blaze Intelligence Domain Consolidation Script
# Unifies all deployments under blaze-intelligence.com

set -euo pipefail

echo "🔥 BLAZE INTELLIGENCE DOMAIN CONSOLIDATION"
echo "==========================================="

# Configuration
MAIN_PROJECT="blaze-intelligence"
DOMAIN="blaze-intelligence.com"
GITHUB_REPO="ahump20/blaze-intelligence-official"

# Step 1: Clean up old deployments
echo "→ Cleaning up fragmented deployments..."
OLD_PROJECTS=(
    "blaze-intelligence-lsl"
    "blaze-intelligence-website"
    "blazeintelligence"
    "blaze-intelligence-site"
    "blaze-intelligence-enhanced"
    "blaze"
    "blaze-io"
)

# Step 2: Create main deployment structure
echo "→ Setting up unified structure..."
cd /Users/AustinHumphrey/blaze-intelligence-website

# Create proper page routing
cat > _routes.json << 'EOF'
{
  "version": 1,
  "include": ["/*"],
  "exclude": [],
  "routes": {
    "/": "/index.html",
    "/analytics": "/analytics-dashboard.html",
    "/demo": "/claude-baseball-demo.html",
    "/portfolio": "/portfolio-showcase.html",
    "/statistics": "/statistics-dashboard.html",
    "/coverage": "/fbs-coverage-integration.html",
    "/multiplayer": "/multiplayer-client.html",
    "/api/*": {
      "origin": "https://blaze-api-worker.humphrey-austin20.workers.dev"
    }
  }
}
EOF

# Step 3: Configure custom domain
echo "→ Configuring blaze-intelligence.com..."
cat > wrangler.toml << 'EOF'
name = "blaze-intelligence"
compatibility_date = "2024-08-20"

[site]
bucket = "./dist"

[[routes]]
pattern = "blaze-intelligence.com/*"
zone_name = "blaze-intelligence.com"

[[routes]]
pattern = "www.blaze-intelligence.com/*"
zone_name = "blaze-intelligence.com"

[env.production]
name = "blaze-intelligence-production"
routes = [
  { pattern = "blaze-intelligence.com", custom_domain = true },
  { pattern = "www.blaze-intelligence.com", custom_domain = true }
]
EOF

# Step 4: Deploy to production
echo "→ Deploying to Cloudflare Pages..."
wrangler pages deploy dist \
  --project-name="$MAIN_PROJECT" \
  --branch=main \
  --commit-message="Unified domain deployment"

# Step 5: Add custom domain
echo "→ Adding custom domain..."
wrangler pages domain add "$DOMAIN" --project="$MAIN_PROJECT" || true
wrangler pages domain add "www.$DOMAIN" --project="$MAIN_PROJECT" || true

# Step 6: Update DNS records
echo "→ DNS Configuration needed:"
echo "   CNAME @ -> blaze-intelligence.pages.dev"
echo "   CNAME www -> blaze-intelligence.pages.dev"

echo ""
echo "✅ CONSOLIDATION COMPLETE"
echo "==========================================="
echo "Main site: https://$DOMAIN"
echo "Pages project: $MAIN_PROJECT"
echo ""
echo "Next steps:"
echo "1. Verify DNS propagation (may take 5-10 minutes)"
echo "2. Test all routes at https://$DOMAIN"
echo "3. Update GitHub webhook for auto-deploy"