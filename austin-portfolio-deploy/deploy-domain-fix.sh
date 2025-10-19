#!/bin/bash

echo "🔥 Deploying Blaze Sports Intel to Cloudflare Pages..."

# Deploy to Pages
echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy . --project-name=blazesportsintel --commit-dirty=true

echo "✅ Deployment complete!"
echo "📍 Staging URL: https://blazesportsintel.pages.dev"
echo "🌐 Production URL: https://blazesportsintel.com (pending DNS setup)"

echo ""
echo "🔧 Manual DNS Configuration Required:"
echo "1. Go to Cloudflare Dashboard > Websites > blazesportsintel.com"
echo "2. Go to DNS > Records"
echo "3. Add CNAME record:"
echo "   Type: CNAME"
echo "   Name: @"
echo "   Content: blazesportsintel.pages.dev"
echo "   Proxy status: Proxied (orange cloud)"
echo ""
echo "4. Add CNAME record for www:"
echo "   Type: CNAME"
echo "   Name: www"
echo "   Content: blazesportsintel.pages.dev"
echo "   Proxy status: Proxied (orange cloud)"
echo ""
echo "Alternatively, if using A records:"
echo "   Type: A"
echo "   Name: @"
echo "   Content: 192.0.2.1 (Cloudflare placeholder)"
echo "   Proxy status: Proxied (orange cloud)"

echo ""
echo "🚨 IMPORTANT: blazesportsintel.com domain must be added to the Pages project"
echo "   in the Cloudflare dashboard under Pages > blazesportsintel > Custom domains"