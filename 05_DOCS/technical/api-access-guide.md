# Blaze Intelligence API Access Setup Guide

## Free Tier APIs (Immediate Access)

### 1. MLB Stats API
**Status**: ✅ **FREE** - No key required
- **Base URL**: `https://statsapi.mlb.com/api/v1`
- **Rate Limit**: 60 requests/minute
- **Documentation**: https://appac.github.io/mlb-data-api-docs/
- **Key Endpoints**:
  ```
  /teams?sportId=1&season=2024
  /teams/{team_id}/roster
  /people/{player_id}/stats
  ```

### 2. ESPN APIs
**Status**: ✅ **FREE** - No key required
- **NFL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl`
- **College**: `https://site.api.espn.com/apis/site/v2/sports/football/college-football`
- **Rate Limit**: ~100 requests/minute
- **Examples**:
  ```bash
  curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams"
  curl "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams"
  ```

### 3. CollegeFootballData API
**Status**: 🔑 **FREE with Registration**
- **URL**: https://collegefootballdata.com/
- **Steps**:
  1. Visit https://collegefootballdata.com/
  2. Click "Get API Key" 
  3. Sign up with email
  4. Get instant free key (no payment required)
- **Rate Limit**: 200 requests/minute (free tier)
- **Documentation**: https://api.collegefootballdata.com/

## Enhanced APIs (Paid/Premium)

### 4. Baseball Savant (Statcast)
**Status**: ✅ **FREE** - Web scraping
- **URL**: https://baseballsavant.mlb.com/statcast_search
- **Method**: HTTP scraping with rate limiting
- **Data**: Exit velocity, launch angle, spin rate

### 5. Perfect Game
**Status**: 🔍 **Scraping Required**
- **URL**: https://www.perfectgame.org
- **Method**: Respectful web scraping
- **Rate Limit**: 10 requests/minute max
- **Focus**: Texas showcases and rankings

### 6. MaxPreps
**Status**: 🔍 **Scraping Required**  
- **URL**: https://www.maxpreps.com
- **Method**: Team page scraping
- **Rate Limit**: 20 requests/minute max
- **Focus**: Texas 6A programs

## Setup Instructions

### Step 1: Get CollegeFootballData API Key

```bash
# 1. Visit https://collegefootballdata.com/
# 2. Click "Request API Access"
# 3. Fill out form:
#    - Name: Austin Humphrey
#    - Email: ahump20@outlook.com  
#    - Use Case: Sports analytics research
# 4. Get API key instantly

# 5. Set environment variable
export CFBD_API_KEY="your_api_key_here"

# 6. Test access
curl -H "Authorization: Bearer $CFBD_API_KEY" \
  "https://api.collegefootballdata.com/teams/fbs?year=2024"
```

### Step 2: Configure Production Environment

```bash
# Create .env file for local development
cat > .env << 'EOF'
# API Keys
CFBD_API_KEY=your_collegefootballdata_key
MLB_API_KEY=not_required
NFL_API_KEY=not_required

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Monitoring
SLACK_WEBHOOK_URL=your_slack_webhook

# Rate Limiting
ENABLE_RATE_LIMITING=true
CACHE_TTL=3600
EOF

# Set Cloudflare Worker environment variables
wrangler secret put CFBD_API_KEY
# Enter your CollegeFootballData API key when prompted
```

### Step 3: Update Ingestion Scripts

```python
# Update blaze-multi-league-ingestion.py
import os

# Add to API_CONFIG
API_CONFIG = {
    'NCAA': {
        'cfbd_url': 'https://api.collegefootballdata.com',
        'headers': {
            'Authorization': f"Bearer {os.getenv('CFBD_API_KEY', '')}"
        },
        'rate_limit': {'calls': 200, 'period': 60},
        'endpoints': {
            'teams': '/teams/fbs?year=2024',
            'roster': '/roster?team={team}&year=2024',
            'stats': '/stats/player/season?year=2024&team={team}',
            'recruiting': '/recruiting/players?year=2025&classification=HighSchool&state=TX'
        }
    }
}
```

## API Testing Scripts

### Test All APIs

```bash
# Create API test script
cat > test-apis.sh << 'EOF'
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
EOF

chmod +x test-apis.sh
```

### Run API Tests

```bash
# Test without CFBD key
./test-apis.sh

# Test with CFBD key (after getting one)
export CFBD_API_KEY="your_key_here"
./test-apis.sh
```

## Next Steps for Full Access

### Immediate (Free)
1. ✅ MLB Stats API - Already working
2. ✅ ESPN APIs - Already working  
3. 🔑 Get CollegeFootballData API key (5 minutes)
4. ✅ Baseball Savant scraping - Implement respectfully

### Enhanced (Optional)
1. **Sports Reference APIs** - $5-20/month for more data
2. **Stathead subscriptions** - $8/month for advanced queries
3. **Perfect Game Premium** - Contact for data partnerships
4. **MaxPreps Direct** - Contact for school partnerships

## Rate Limiting Best Practices

```python
# Implement in production
RATE_LIMITS = {
    'mlb_stats': {'calls': 50, 'period': 60},      # Conservative
    'espn': {'calls': 80, 'period': 60},           # Conservative  
    'cfbd': {'calls': 150, 'period': 60},          # 75% of limit
    'scraping': {'calls': 5, 'period': 60}         # Very conservative
}
```

## Legal Compliance

### Terms of Service Summary
- **MLB**: ✅ Public API, respect rate limits
- **ESPN**: ✅ Public endpoints, non-commercial research OK
- **CFBD**: ✅ Free tier includes commercial use
- **Scraping**: ⚠️ Follow robots.txt, rate limit aggressively

### Data Attribution
Always include data source attribution:
```json
{
  "data_sources": [
    "MLB Stats API",
    "ESPN Public API", 
    "CollegeFootballData.com",
    "Baseball Savant (MLB Advanced Media)"
  ]
}
```