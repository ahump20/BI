#!/bin/bash
set -euo pipefail

# Deploy Corrected Blaze Sports Intelligence Platform
# Fixes JavaScript loading issues and implements league-wide coverage

echo "🔥 Starting deployment of corrected blazesportsintel.com..."
echo "📊 Fixes implemented:"
echo "   - Removed team favoritism (Cardinals/Titans/Longhorns/Grizzlies focus)"
echo "   - Updated with real September 25, 2025 sports data"
echo "   - Removed fabricated claims (94.6% accuracy, etc.)"
echo "   - Added proper data source citations"
echo "   - Simplified JavaScript to fix loading issues"
echo "   - Implemented league-wide coverage"
echo ""

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Set Cloudflare account ID
export CLOUDFLARE_ACCOUNT_ID="a12cb329d84130460eed99b816e4d0d3"

echo "🚀 Deploying to Cloudflare Pages..."

# Deploy using the consolidated configuration
wrangler pages deploy . --config wrangler-consolidated.toml --project-name blazesportsintel

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Site URLs:"
echo "   Primary: https://blazesportsintel.com"
echo "   Backup:  https://blazesportsintel.pages.dev"
echo ""
echo "📋 Fixes Deployed:"
echo "   ✅ League-wide coverage (30 MLB, 32 NFL, 30 NBA, 134 FBS teams)"
echo "   ✅ Real September 25, 2025 data"
echo "   ✅ Proper citations for all statistics"
echo "   ✅ Removed fabricated accuracy claims"
echo "   ✅ Fixed JavaScript loading issues"
echo "   ✅ Professional, unbiased sports coverage"
echo ""
echo "🏆 blazesportsintel.com is now a professional sports intelligence platform!"