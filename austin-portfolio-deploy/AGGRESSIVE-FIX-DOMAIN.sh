#!/bin/bash

# AGGRESSIVE DOMAIN FIX SCRIPT
# This will forcefully fix blazesportsintel.com routing

API_TOKEN="dd21Layyk6Ix6LKRWZUDDVygObagQbeVIjojHrEJ"
ACCOUNT_ID="a12cb329d84130460eed99b816e4d0d3"

echo "🔥 AGGRESSIVE DOMAIN FIX FOR BLAZESPORTSINTEL.COM"
echo "=================================================="
echo ""

# Step 1: List ALL Workers in the account
echo "📋 Finding ALL Workers in account..."
WORKERS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json")

echo "$WORKERS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    workers = data.get('result', [])
    print(f'Found {len(workers)} Workers:')
    for w in workers:
        print(f'  - {w.get(\"id\", \"unknown\")}')
else:
    print('Error accessing Workers:', data.get('errors', []))
"

# Step 2: Delete ANY Worker with vision-related names
echo ""
echo "🗑️ Deleting Workers that might interfere..."
WORKER_NAMES=("blaze-vision-ai" "blaze-vision" "vision-ai" "blazesportsintel-worker" "blaze-worker")

for WORKER_NAME in "${WORKER_NAMES[@]}"; do
    echo "Attempting to delete: $WORKER_NAME"
    curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/$WORKER_NAME" \
         -H "Authorization: Bearer $API_TOKEN" \
         -H "Content-Type: application/json" > /dev/null 2>&1
done

# Step 3: Get Zone ID
echo ""
echo "📍 Getting Zone information..."
ZONES=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json")

ZONE_ID=$(echo "$ZONES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    for zone in data.get('result', []):
        if 'blazesportsintel.com' in zone.get('name', ''):
            print(zone['id'])
            break
")

if [ -z "$ZONE_ID" ]; then
    echo "❌ Could not find zone for blazesportsintel.com"
    echo "Zone might be in different account or API token lacks permissions"
else
    echo "✅ Found Zone ID: $ZONE_ID"

    # Step 4: Delete ALL Worker routes for this zone
    echo ""
    echo "🗑️ Removing ALL Worker routes from zone..."
    ROUTES=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
         -H "Authorization: Bearer $API_TOKEN" \
         -H "Content-Type: application/json")

    echo "$ROUTES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    routes = data.get('result', [])
    for route in routes:
        print(f'Found route: {route.get(\"pattern\")} (ID: {route.get(\"id\")})')
"

    # Delete each route
    ROUTE_IDS=$(echo "$ROUTES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    for route in data.get('result', []):
        print(route.get('id', ''))
")

    for ROUTE_ID in $ROUTE_IDS; do
        if [ ! -z "$ROUTE_ID" ]; then
            echo "Deleting route: $ROUTE_ID"
            curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes/$ROUTE_ID" \
                 -H "Authorization: Bearer $API_TOKEN" \
                 -H "Content-Type: application/json" > /dev/null 2>&1
        fi
    done
fi

# Step 5: Deploy fresh to Pages
echo ""
echo "🚀 Deploying fresh to Cloudflare Pages..."
cd /Users/AustinHumphrey/austin-portfolio-deploy
npx wrangler pages deploy . --project-name=blazesportsintel --branch=main --commit-dirty=true 2>&1 | tail -5

# Step 6: Try API approach to set custom domain
echo ""
echo "🌐 Attempting to configure custom domain via API..."
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/blazesportsintel/domains" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"name": "blazesportsintel.com"}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    print('✅ Domain configuration successful!')
else:
    errors = data.get('errors', [])
    if errors:
        print('Status:', errors[0].get('message', 'Unknown'))
    else:
        print('Domain might already be configured')
"

echo ""
echo "=================================================="
echo "⏳ Waiting for propagation..."
sleep 5

# Step 7: Test the domain
echo ""
echo "🔍 Testing blazesportsintel.com..."
RESPONSE=$(curl -s -I https://blazesportsintel.com 2>/dev/null | head -1)
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "200"; then
    echo ""
    echo "✅ SUCCESS! blazesportsintel.com is now working!"
    echo "🔥 Visit https://blazesportsintel.com to see your AI-powered platform!"
else
    CONTENT=$(curl -s https://blazesportsintel.com 2>/dev/null | head -50)
    if echo "$CONTENT" | grep -q "error.*Endpoint"; then
        echo ""
        echo "❌ STILL SHOWING WORKER ENDPOINTS"
        echo ""
        echo "Manual intervention required:"
        echo "1. Go to Cloudflare Dashboard (already open)"
        echo "2. Workers & Pages → Workers"
        echo "3. Find ANY Worker and check its routes"
        echo "4. Delete routes for blazesportsintel.com"
        echo "5. Or delete the entire Worker"
    elif echo "$CONTENT" | grep -q "Blaze Sports Intel"; then
        echo ""
        echo "✅ SUCCESS! Site is loading correctly!"
        echo "Clear your browser cache if you still see old content."
    else
        echo ""
        echo "⏳ DNS still propagating. Wait 1-2 minutes and try again."
    fi
fi

echo ""
echo "=================================================="
echo "🎯 FINAL MANUAL STEP IF STILL NOT WORKING:"
echo "=================================================="
echo ""
echo "The Cloudflare Dashboard should be open in Chrome."
echo "1. Click on 'Workers & Pages'"
echo "2. Click the 'Workers' tab"
echo "3. Look for ANY Worker (especially with 'vision' in the name)"
echo "4. Click on it → Settings → Triggers/Routes"
echo "5. DELETE any route containing 'blazesportsintel'"
echo "6. Or just DELETE the entire Worker"
echo ""
echo "Then wait 60 seconds and visit https://blazesportsintel.com"
echo ""