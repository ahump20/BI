#!/bin/bash

# Cloudflare API configuration
API_TOKEN="dd21Layyk6Ix6LKRWZUDDVygObagQbeVIjojHrEJ"
ACCOUNT_ID="a12cb329d84130460eed99b816e4d0d3"
ZONE_ID="" # We'll get this from the API

echo "🔥 FIXING BLAZESPORTSINTEL.COM DOMAIN ROUTING"
echo "============================================="
echo ""

# Get Zone ID for blazesportsintel.com
echo "📊 Getting Zone ID for blazesportsintel.com..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=blazesportsintel.com" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json")

ZONE_ID=$(echo "$ZONE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['result'][0]['id'] if data['success'] and data['result'] else '')")

if [ -z "$ZONE_ID" ]; then
    echo "❌ Could not find zone for blazesportsintel.com"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# List current Worker routes
echo "📋 Checking for Worker routes..."
ROUTES_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json")

echo "$ROUTES_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success') and data.get('result'):
    for route in data['result']:
        print(f\"Found Worker route: {route.get('pattern')} -> {route.get('script', 'Unknown')} (ID: {route.get('id')})\")
"

# Get route IDs to delete
ROUTE_IDS=$(echo "$ROUTES_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success') and data.get('result'):
    for route in data['result']:
        if 'blazesportsintel.com' in route.get('pattern', ''):
            print(route.get('id'))
")

# Delete Worker routes
if [ ! -z "$ROUTE_IDS" ]; then
    echo ""
    echo "🗑️ Removing Worker routes..."
    for ROUTE_ID in $ROUTE_IDS; do
        DELETE_RESPONSE=$(curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes/$ROUTE_ID" \
             -H "Authorization: Bearer $API_TOKEN" \
             -H "Content-Type: application/json")

        SUCCESS=$(echo "$DELETE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")

        if [ "$SUCCESS" == "True" ]; then
            echo "✅ Removed Worker route: $ROUTE_ID"
        else
            echo "❌ Failed to remove route: $ROUTE_ID"
        fi
    done
fi

echo ""
echo "🌐 Setting up custom domain for Pages..."

# Add custom domain to Pages project
ADD_DOMAIN_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/blaze-intelligence/domains" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
         "name": "blazesportsintel.com"
     }')

SUCCESS=$(echo "$ADD_DOMAIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
if [ "$SUCCESS" == "True" ]; then
    echo "✅ Added blazesportsintel.com to Pages project"
else
    ERROR=$(echo "$ADD_DOMAIN_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('errors', [{}])[0].get('message', 'Unknown error') if d.get('errors') else 'Already configured or unknown error')")
    echo "⚠️  Domain configuration status: $ERROR"
fi

echo ""
echo "============================================="
echo "📊 VERIFICATION"
echo "============================================="
echo ""

# Wait a moment for changes to propagate
sleep 3

# Check the domain
echo "Checking blazesportsintel.com..."
RESPONSE=$(curl -s -I https://blazesportsintel.com | head -1)
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "200"; then
    echo "✅ SUCCESS! blazesportsintel.com is now serving Pages content!"
else
    echo "⚠️  Domain may still be propagating. Check again in 1-2 minutes."
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Wait 1-2 minutes for DNS propagation"
echo "2. Visit https://blazesportsintel.com to verify"
echo "3. If still showing API endpoints, clear browser cache"
echo ""