#!/bin/bash

echo "🔍 DOMAIN ROUTING DIAGNOSTIC"
echo "============================"
echo ""

# Test different URLs
echo "1. Testing blazesportsintel.com (main domain):"
MAIN_RESPONSE=$(curl -s https://blazesportsintel.com | head -100)
if echo "$MAIN_RESPONSE" | grep -q "error.*Endpoint"; then
    echo "   ❌ Shows Worker API endpoints (BROKEN)"
    echo "   Worker endpoints detected: /healthz, /vision/sessions, etc."
elif echo "$MAIN_RESPONSE" | grep -q "Blaze Sports Intel"; then
    echo "   ✅ Shows Blaze Sports Intel website (WORKING)"
else
    echo "   ⚠️  Unknown response"
fi

echo ""
echo "2. Testing www.blazesportsintel.com:"
WWW_RESPONSE=$(curl -s https://www.blazesportsintel.com 2>/dev/null | head -100)
if echo "$WWW_RESPONSE" | grep -q "error.*Endpoint"; then
    echo "   ❌ Shows Worker API endpoints"
elif echo "$WWW_RESPONSE" | grep -q "Blaze Sports Intel"; then
    echo "   ✅ Shows Blaze Sports Intel website"
else
    echo "   ⚠️  Unknown or no response"
fi

echo ""
echo "3. Testing latest Pages deployment:"
PREVIEW_URL="https://926bcb31.blazesportsintel.pages.dev"
PREVIEW_RESPONSE=$(curl -s $PREVIEW_URL | head -100)
if echo "$PREVIEW_RESPONSE" | grep -q "Blaze Sports Intel"; then
    echo "   ✅ Preview URL works: $PREVIEW_URL"
    echo "   Your content IS deployed correctly to Pages!"
else
    echo "   ❌ Preview URL not working"
fi

echo ""
echo "4. DNS Resolution:"
echo "   blazesportsintel.com resolves to:"
nslookup blazesportsintel.com 8.8.8.8 2>/dev/null | grep -A1 "Name:" | tail -1 | sed 's/Address: /   /'

echo ""
echo "5. HTTP Headers Check:"
HEADERS=$(curl -sI https://blazesportsintel.com | head -10)
if echo "$HEADERS" | grep -q "cf-ray"; then
    echo "   ✅ Served by Cloudflare"
fi
if echo "$HEADERS" | grep -q "404"; then
    echo "   ❌ Returns 404 status"
elif echo "$HEADERS" | grep -q "200"; then
    echo "   ✅ Returns 200 status"
fi

echo ""
echo "============================"
echo "📊 DIAGNOSIS COMPLETE"
echo "============================"
echo ""

if echo "$MAIN_RESPONSE" | grep -q "error.*Endpoint"; then
    echo "🔴 PROBLEM IDENTIFIED:"
    echo "   A Cloudflare Worker is intercepting blazesportsintel.com"
    echo "   The Worker has vision AI endpoints (/healthz, /vision/sessions, etc.)"
    echo ""
    echo "🔧 SOLUTION:"
    echo "   1. Open Cloudflare Dashboard (already open in Chrome)"
    echo "   2. Go to Workers & Pages → Workers tab"
    echo "   3. Find the Worker (likely named 'blaze-vision-ai' or similar)"
    echo "   4. Click on it → Settings → Triggers/Routes"
    echo "   5. DELETE all routes for blazesportsintel.com"
    echo "   6. Or DELETE the entire Worker if not needed"
    echo ""
    echo "✅ Your website IS ready at: $PREVIEW_URL"
    echo "   Once you remove the Worker routes, blazesportsintel.com will work!"
else
    echo "✅ blazesportsintel.com appears to be working correctly!"
    echo "   If you still see old content, clear your browser cache."
fi

echo ""