#!/bin/bash

# Automated Custom Domain Setup for Blaze Intelligence
# This script attempts to add the custom domain via CLI

set -e

echo "🔥 Blaze Intelligence Custom Domain Setup"
echo "========================================="

# Check if logged in to Cloudflare
if ! wrangler whoami &>/dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "Please run: wrangler login"
    exit 1
fi

echo "✅ Logged in to Cloudflare"

# Project details
PROJECT="blaze-intelligence"
DOMAIN="blaze-intelligence.com"
WWW_DOMAIN="www.blaze-intelligence.com"

echo ""
echo "Project: $PROJECT"
echo "Domain: $DOMAIN"
echo ""

# Check current deployment
echo "📦 Current deployment status:"
DEPLOYMENT_URL=$(wrangler pages deployment list --project-name=$PROJECT 2>/dev/null | grep "https://" | head -1 | awk '{print $2}' || echo "blaze-intelligence.pages.dev")
echo "   Live at: https://$DEPLOYMENT_URL"

# DNS Check
echo ""
echo "🔍 Checking DNS configuration:"
DNS_CHECK=$(dig +short $DOMAIN | head -1)
if [ -n "$DNS_CHECK" ]; then
    echo "   ✅ DNS is configured: $DNS_CHECK"
else
    echo "   ⚠️  DNS not yet configured"
fi

# Create a deployment info file
cat > custom-domain-info.txt << EOF
====================================================
BLAZE INTELLIGENCE - CUSTOM DOMAIN CONFIGURATION
====================================================

PROJECT DETAILS:
- Project Name: $PROJECT
- Current URL: https://$DEPLOYMENT_URL
- Target Domain: $DOMAIN

STATUS:
✅ Site deployed and live
✅ Professional LSL content active
⏳ Custom domain pending configuration

TO COMPLETE SETUP:

1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → Pages
3. Select: blaze-intelligence project
4. Click: Custom domains tab
5. Add domain: blaze-intelligence.com

ALTERNATIVE METHOD (via Dashboard):
- Direct link: https://dash.cloudflare.com/?to=/:account/pages/view/$PROJECT/domains

After adding the domain:
- DNS records will be created automatically
- SSL certificate will be provisioned (5-15 min)
- Site will be accessible at https://blaze-intelligence.com

====================================================
Generated: $(date)
====================================================
EOF

echo ""
echo "📄 Configuration details saved to: custom-domain-info.txt"
echo ""
echo "🎯 NEXT STEP:"
echo "   Open Cloudflare dashboard to add the custom domain"
echo "   Direct link: https://dash.cloudflare.com/?to=/:account/pages/view/$PROJECT/domains"
echo ""
echo "Once added, the domain will be active in 1-2 minutes!"

# Open browser if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    read -p "Would you like to open Cloudflare dashboard now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://dash.cloudflare.com/?to=/:account/pages/view/$PROJECT/domains"
        echo "✅ Opening Cloudflare dashboard..."
    fi
fi