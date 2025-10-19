#!/bin/bash

echo "🔥 FINAL DEPLOYMENT TO BLAZESPORTSINTEL.COM"
echo "============================================"
echo ""
echo "CURRENT SITUATION:"
echo "✅ Content deployed to: blaze-intelligence.pages.dev"
echo "❌ blazesportsintel.com pointing to: Worker (shows API endpoints)"
echo ""
echo "SOLUTION: Manual steps required in Cloudflare Dashboard"
echo ""

# First, let's confirm deployment is live
echo "📊 Checking deployment status..."
echo ""

# Check Pages deployment
echo "1. Pages deployment (blaze-intelligence.pages.dev):"
curl -s https://blaze-intelligence.pages.dev | head -3 | grep -E "Blaze Sports Intel"
if [ $? -eq 0 ]; then
    echo "   ✅ AI-powered platform is deployed and working!"
else
    echo "   ⚠️  Deployment may still be propagating..."
fi

echo ""

# Check domain status
echo "2. Domain status (blazesportsintel.com):"
RESPONSE=$(curl -s https://blazesportsintel.com | head -1)
if echo "$RESPONSE" | grep -q "available_endpoints"; then
    echo "   ❌ Currently showing Worker API (needs to be fixed)"
elif echo "$RESPONSE" | grep -q "Blaze Sports Intel"; then
    echo "   ✅ SUCCESS! Now showing the correct site!"
else
    echo "   ⚠️  Unknown response - checking..."
    echo "$RESPONSE" | head -20
fi

echo ""
echo "================================================"
echo "📝 TO FIX blazesportsintel.com ROUTING:"
echo "================================================"
echo ""
echo "The Cloudflare Dashboard is open in Chrome. Please:"
echo ""
echo "STEP 1: Remove Worker Route"
echo "  1. Go to Workers & Pages → Workers"
echo "  2. Look for any worker (might be named 'blaze-vision-ai' or similar)"
echo "  3. Click on it → Triggers tab"
echo "  4. DELETE any route for blazesportsintel.com"
echo ""
echo "STEP 2: Add Domain to Pages"
echo "  1. Go to Workers & Pages → Pages"
echo "  2. Click 'blaze-intelligence' project"
echo "  3. Click 'Custom domains' tab"
echo "  4. Click 'Set up a custom domain'"
echo "  5. Type: blazesportsintel.com"
echo "  6. Click Continue → Activate"
echo ""
echo "STEP 3: Wait 1-2 minutes for DNS"
echo ""
echo "================================================"
echo "🎯 AFTER COMPLETING THESE STEPS:"
echo "================================================"
echo ""
echo "blazesportsintel.com will show:"
echo "  🤖 AI-powered championship dashboard"
echo "  📊 Real-time sports analytics"
echo "  🏆 Cardinals, Titans, Grizzlies, Longhorns"
echo "  ⚡ Live scores ticker"
echo "  🌟 3D visualizations"
echo "  🔥 Deep South Sports Authority branding"
echo ""

# Open dashboard
osascript -e 'tell application "Google Chrome" to open location "https://dash.cloudflare.com/?to=/:account/workers-and-pages"'

echo "🌐 Cloudflare Dashboard opened in Chrome"
echo ""
echo "Please complete the manual steps above to activate blazesportsintel.com"
echo ""