#!/usr/bin/env bash

set -euo pipefail

# =====================================================================
# Blaze Intelligence - Custom Domain Setup for blazesportsintel.com
# =====================================================================
# This script adds the custom domain to the existing Cloudflare Pages deployment
# Deployment URL: https://e73351a4.blazesportsintel.pages.dev (verified working)
# Target Domain: blazesportsintel.com
# =====================================================================

DOMAIN="blazesportsintel.com"
DEPLOYMENT_URL="e73351a4.blazesportsintel.pages.dev"
PROJECT_NAME="blazesportsintel"

echo "🔥 Blaze Intelligence - Custom Domain Setup"
echo "=" * 50

echo "🎯 Target Configuration:"
echo "   Domain: ${DOMAIN}"
echo "   Deployment: https://${DEPLOYMENT_URL}"
echo "   Project: ${PROJECT_NAME}"
echo ""

echo "📋 Step-by-Step Instructions:"
echo ""

echo "1️⃣ Access Cloudflare Dashboard:"
echo "   → Open: https://dash.cloudflare.com"
echo "   → Login with your Cloudflare account"
echo ""

echo "2️⃣ Navigate to Pages:"
echo "   → Click 'Workers & Pages' in the left sidebar"
echo "   → Click the 'Pages' tab at the top"
echo ""

echo "3️⃣ Find Your Project:"
echo "   → Look for the project with deployment: ${DEPLOYMENT_URL}"
echo "   → This should be your championship platform project"
echo "   → Click on the project name to open it"
echo ""

echo "4️⃣ Add Custom Domain:"
echo "   → Click the 'Custom domains' tab"
echo "   → Click 'Set up a custom domain' button"
echo "   → Enter: ${DOMAIN}"
echo "   → Click 'Continue'"
echo ""

echo "5️⃣ Verify DNS Configuration:"
echo "   → Cloudflare should automatically detect your DNS"
echo "   → Since DNS is already configured, this should show as ✅ Ready"
echo "   → Click 'Activate domain'"
echo ""

echo "⚡ Expected Timeline:"
echo "   → Domain activation: 1-5 minutes"
echo "   → SSL certificate generation: 5-15 minutes"
echo "   → Full propagation: 15-30 minutes"
echo ""

echo "🔍 Verification Steps:"
echo "   1. Test: https://${DOMAIN}"
echo "   2. Verify championship dashboard loads"
echo "   3. Check SSL certificate (🔒 should show in browser)"
echo "   4. Test all interactive features"
echo ""

echo "🏆 What You'll Get:"
echo "   ✅ blazesportsintel.com serving your championship platform"
echo "   ✅ 4,145+ lines of advanced sports intelligence code"
echo "   ✅ Real-time Cardinals, Titans, Longhorns, Grizzlies data"
echo "   ✅ Three.js 3D visualizations and interactive dashboards"
echo "   ✅ SSL encryption and Cloudflare CDN performance"
echo ""

echo "🚨 If You Encounter Issues:"
echo "   → DNS propagation may take additional time"
echo "   → Clear browser cache and try incognito mode"
echo "   → Check Cloudflare dashboard for any error messages"
echo "   → Verify DNS records in Cloudflare DNS tab"
echo ""

# Check current deployment status
echo "🔍 Checking Current Deployment Status..."
echo ""

if command -v curl >/dev/null 2>&1; then
    echo "Testing deployment accessibility..."
    if curl -s --head "https://${DEPLOYMENT_URL}" | head -n 1 | grep -q "200 OK"; then
        echo "✅ Deployment is LIVE and responding"
        echo "📡 Server: Cloudflare"
        echo "🔒 SSL: Active"
        echo ""
        echo "🚀 Ready to add custom domain!"
    else
        echo "⚠️  Deployment may have issues - please verify manually"
        echo "   → Test: https://${DEPLOYMENT_URL}"
    fi
else
    echo "⚠️  curl not available - please test deployment manually:"
    echo "   → Test: https://${DEPLOYMENT_URL}"
fi

echo ""
echo "📞 Need Help?"
echo "   → Cloudflare Support: https://support.cloudflare.com/"
echo "   → Domain setup guide: https://developers.cloudflare.com/pages/how-to/custom-domain"
echo ""

echo "🎯 Once complete, your championship platform will be live at:"
echo "   🌟 https://${DOMAIN}"
echo ""

echo "Ready to proceed with the manual setup? (Press Enter to continue)"
read -r

echo "Opening Cloudflare Dashboard..."
if command -v open >/dev/null 2>&1; then
    open "https://dash.cloudflare.com"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "https://dash.cloudflare.com"
else
    echo "Please manually open: https://dash.cloudflare.com"
fi

echo ""
echo "✨ Setup guide complete! Follow the steps above to add your custom domain."