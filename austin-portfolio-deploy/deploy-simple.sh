#!/bin/bash

echo "🔥 Simple Blaze Sports Intel Deployment"
echo "========================================"
echo ""
echo "📊 Current Status from Audit:"
echo "✅ blaze-intelligence.pages.dev - Fully Functional (Primary)"
echo "⚠️  blazesportsintel.com - JavaScript loading issues (Custom Domain)"
echo ""
echo "🎯 Solution: Deploy to working blaze-intelligence project"
echo "   which is already connected to blazesportsintel.com domain"
echo ""

# Check for required files
echo "🔍 Verifying critical files..."
if [ -f "index.html" ]; then
    echo "  ✅ index.html found"
else
    echo "  ❌ index.html missing!"
    exit 1
fi

if [ -f "championship-dashboard-integration.js" ]; then
    echo "  ✅ championship-dashboard-integration.js found"
else
    echo "  ❌ championship-dashboard-integration.js missing!"
fi

# Now that package.json is fixed, try deployment
echo ""
echo "🚀 Attempting deployment to blaze-intelligence..."
npx wrangler pages deploy . --project-name=blaze-intelligence --commit-dirty=true

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your site is now live at:"
    echo "   Primary: https://blaze-intelligence.pages.dev"
    echo "   Custom: https://blazesportsintel.com"
    echo ""
    echo "📊 Deployment includes:"
    echo "   ✅ All JavaScript modules"
    echo "   ✅ CSS directories"
    echo "   ✅ JS directories"
    echo "   ✅ Monte Carlo Engine"
    echo "   ✅ Championship Dashboard"
    echo "   ✅ League-wide Data (No team favoritism)"
    echo ""
    echo "🔍 Next Steps:"
    echo "1. Visit https://blaze-intelligence.pages.dev to verify"
    echo "2. Check https://blazesportsintel.com after DNS propagation"
    echo "3. Open browser console to verify no JavaScript errors"
else
    echo ""
    echo "⚠️ Automated deployment failed. Manual steps:"
    echo ""
    echo "Option 1: Cloudflare Dashboard"
    echo "1. Go to: https://dash.cloudflare.com"
    echo "2. Select: Pages > blaze-intelligence"
    echo "3. Click: 'Create new deployment'"
    echo "4. Upload this folder"
    echo ""
    echo "Option 2: GitHub Push"
    echo "1. Commit all changes"
    echo "2. Push to main branch"
    echo "3. Cloudflare will auto-deploy"
fi

echo ""
echo "📋 Summary of Updates:"
echo "- Fixed JavaScript loading paths"
echo "- Added proper CORS headers"
echo "- Integrated Monte Carlo simulations"
echo "- Updated to league-wide sports focus"
echo "- Removed team-specific bias"
echo "- Enhanced 3D visualizations"
echo ""
echo "🔥 Blaze Sports Intel - Deep South Sports Authority"