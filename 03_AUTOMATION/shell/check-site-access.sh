#!/bin/bash

echo "🔍 Checking portfolio site access..."
echo "Site: https://austin-humphrey-portfolio.pages.dev"
echo ""

# Test direct access
echo "Testing direct access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://austin-humphrey-portfolio.pages.dev)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ SUCCESS: Site is publicly accessible (HTTP $HTTP_CODE)"
    echo "🎉 Your portfolio is now live at: https://austin-humphrey-portfolio.pages.dev"
elif [ "$HTTP_CODE" -eq 302 ] || [ "$HTTP_CODE" -eq 301 ]; then
    echo "🔄 REDIRECT: Site returned HTTP $HTTP_CODE"
    echo "This might still be the Access login redirect"
    
    # Follow redirects to check final destination
    FINAL_URL=$(curl -s -L -w "%{url_effective}" -o /dev/null https://austin-humphrey-portfolio.pages.dev)
    echo "Final URL: $FINAL_URL"
    
    if [[ "$FINAL_URL" == *"cloudflareaccess.com"* ]]; then
        echo "❌ Access protection is still active"
        echo "Please remove Access policy from Cloudflare Dashboard"
    else
        echo "✅ Site appears to be accessible"
    fi
else
    echo "⚠️  Unexpected response: HTTP $HTTP_CODE"
fi

echo ""
echo "To remove Access protection:"
echo "1. Go to: https://dash.cloudflare.com/a12cb329d84130460eed99b816e4d0d3/access/apps"
echo "2. Find 'austin-humphrey-portfolio' and delete it"
echo "3. OR go to Pages settings and disable Access Policy"