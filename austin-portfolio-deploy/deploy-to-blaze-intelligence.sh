#!/bin/bash

echo "🔥 DEPLOYING TO CORRECT DOMAIN: blazesportsintel.com"
echo "=================================================="
echo ""

# Remove any worker.js files that might interfere
rm -f worker.js functions/*.js 2>/dev/null

echo "📦 Preparing deployment..."
echo "  - Using project: blaze-intelligence (connected to blazesportsintel.com)"
echo "  - Content: Unified AI-powered championship platform"
echo ""

# Deploy to the blaze-intelligence project which has the domain
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy . \
  --project-name=blaze-intelligence \
  --branch=main \
  --commit-dirty=true \
  --compatibility-date=2024-09-26

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should now be live at:"
echo "  - https://blazesportsintel.com (custom domain)"
echo "  - https://blaze-intelligence.pages.dev (preview)"
echo ""
echo "📝 If blazesportsintel.com still shows API endpoints:"
echo "  1. Go to Cloudflare Dashboard > Workers & Pages"
echo "  2. Find any Worker with blazesportsintel.com route"
echo "  3. Remove that route"
echo "  4. In Pages > blaze-intelligence > Custom domains"
echo "  5. Add blazesportsintel.com if not already there"
echo ""