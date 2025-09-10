#!/bin/bash

echo "🧪 Testing Blaze Intelligence API Access"
echo "========================================"

# Test MLB Stats API
echo "1. Testing MLB Stats API..."
MLB_RESPONSE=$(curl -s "https://statsapi.mlb.com/api/v1/teams?sportId=1")
MLB_COUNT=$(echo "$MLB_RESPONSE" | jq '.teams | length' 2>/dev/null)
if [ "$MLB_COUNT" -gt "0" ]; then
    echo "✅ MLB API: $MLB_COUNT teams found"
else
    echo "❌ MLB API: Failed"
fi

# Test ESPN NFL API
echo "2. Testing ESPN NFL API..."
NFL_RESPONSE=$(curl -s "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams")
NFL_COUNT=$(echo "$NFL_RESPONSE" | jq '.sports[0].leagues[0].teams | length' 2>/dev/null)
if [ "$NFL_COUNT" -gt "0" ]; then
    echo "✅ ESPN NFL API: $NFL_COUNT teams found"
else
    echo "❌ ESPN NFL API: Failed"
fi

# Test CollegeFootballData API (requires key)
echo "3. Testing CollegeFootballData API..."
if [ -n "$CFBD_API_KEY" ]; then
    CFBD_RESPONSE=$(curl -s -H "Authorization: Bearer $CFBD_API_KEY" \
        "https://api.collegefootballdata.com/teams/fbs?year=2024")
    CFBD_COUNT=$(echo "$CFBD_RESPONSE" | jq '. | length' 2>/dev/null)
    if [ "$CFBD_COUNT" -gt "0" ]; then
        echo "✅ CFBD API: $CFBD_COUNT teams found"
    else
        echo "❌ CFBD API: Failed or invalid response"
    fi
else
    echo "⚠️  CFBD API: No API key set (export CFBD_API_KEY=your_key)"
fi

# Test Production Blaze API
echo "4. Testing Production Blaze API..."
BLAZE_HEALTH=$(curl -s "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/health" | jq -r '.status' 2>/dev/null)
if [ "$BLAZE_HEALTH" = "healthy" ]; then
    echo "✅ Blaze API: Healthy"
else
    echo "❌ Blaze API: $BLAZE_HEALTH"
fi

echo ""
echo "📊 API Status Summary:"
echo "  MLB Stats API: Free, no key required"
echo "  ESPN APIs: Free, no key required"  
echo "  CollegeFootballData: Free with registration"
echo "  Blaze Production: Deployed and operational"