#!/usr/bin/env bash

# =====================================================================
# Quick Cloudflare Dashboard Access for blazesportsintel.com
# =====================================================================

echo "🔥 Opening Cloudflare Dashboard..."

# Open Cloudflare dashboard directly to Workers & Pages
osascript -e 'tell application "Google Chrome" to open location "https://dash.cloudflare.com/pages"'

echo ""
echo "🎯 Quick Setup Steps:"
echo "1. Find your project with deployment: e73351a4.blazesportsintel.pages.dev"
echo "2. Click the project name"
echo "3. Go to 'Custom domains' tab"
echo "4. Click 'Set up a custom domain'"
echo "5. Enter: blazesportsintel.com"
echo "6. Click 'Continue' and then 'Activate domain'"
echo ""
echo "✨ Your championship platform will be live at blazesportsintel.com!"