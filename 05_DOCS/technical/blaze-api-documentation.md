# Blaze Intelligence API Documentation

## Overview

The Blaze Intelligence API provides real-time access to sports analytics, player evaluations, and team readiness data across multiple leagues including MLB, NFL, NCAA, and high school programs.

**Base URL**: `https://blaze-intelligence-api.humphrey-austin20.workers.dev`  
**Version**: 2.0.0  
**Protocol**: HTTPS  
**Format**: JSON  
**Authentication**: API Key (coming soon)

## Quick Start

```bash
# Test API connectivity
curl https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/health

# Get top prospects
curl https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/prospects

# Get team readiness scores
curl https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/readiness
```

## Endpoints

### System Status

#### GET `/api/health`
Returns current system health and status information.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-24T19:00:00.000Z",
  "version": "2.0.0"
}
```

**Status Codes**:
- `200` - System operational
- `503` - System degraded or maintenance

---

### Player Data

#### GET `/api/prospects`
Returns top-ranked prospects across all leagues with HAV-F scores.

**Response**:
```json
[
  {
    "name": "Quinn Ewers",
    "position": "QB",
    "team": "Texas Longhorns",
    "havf_composite": 81.9,
    "champion_readiness": 75.8,
    "cognitive_leverage": 82.4,
    "nil_trust_score": 91.2
  }
]
```

**Query Parameters**:
- `limit` (integer): Number of results (default: 25, max: 100)
- `sport` (string): Filter by sport (`MLB`, `NFL`, `NCAA-FB`, `HS-FB`)
- `position` (string): Filter by position (`QB`, `RB`, `WR`, etc.)
- `min_score` (number): Minimum HAV-F composite score

**Example**:
```bash
curl "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/prospects?sport=NCAA-FB&limit=10&min_score=80"
```

#### GET `/api/players/{player_id}`
Returns detailed information for a specific player.

**Response**:
```json
{
  "player_id": "NCAA-TEX-0001",
  "name": "Quinn Ewers",
  "sport": "NCAA-FB",
  "team": "Texas Longhorns",
  "position": "QB",
  "bio": {
    "height_cm": 191,
    "weight_kg": 93,
    "class_year": "Junior"
  },
  "stats_2024": {
    "passing_yards": 2665,
    "passing_tds": 25,
    "completion_pct": 65.8
  },
  "hav_f": {
    "champion_readiness": 75.8,
    "cognitive_leverage": 82.4,
    "nil_trust_score": 91.2,
    "composite_score": 81.9,
    "percentile_rank": 94,
    "trend": "rising"
  },
  "nil_profile": {
    "valuation_usd": 1200000,
    "social_followers": 381000,
    "engagement_rate": 4.2
  }
}
```

---

### Team Data

#### GET `/api/teams`
Returns list of all tracked teams with basic readiness information.

**Response**:
```json
[
  {
    "name": "St. Louis Cardinals",
    "sport": "MLB",
    "readiness": 67.4,
    "status": "yellow"
  },
  {
    "name": "Tennessee Titans",
    "sport": "NFL", 
    "readiness": 58.1,
    "status": "yellow"
  }
]
```

#### GET `/api/teams/{team_id}/roster`
Returns full roster with HAV-F scores for all players on a team.

**Response**:
```json
{
  "team_id": "MLB-STL",
  "name": "St. Louis Cardinals",
  "sport": "MLB",
  "roster": [
    {
      "name": "Paul Goldschmidt",
      "position": "1B",
      "havf_composite": 62.3,
      "status": "healthy"
    }
  ],
  "team_analytics": {
    "avg_havf": 72.4,
    "readiness_score": 67.4,
    "injury_count": 2
  }
}
```

#### GET `/api/longhorns`
Provides Blaze Intelligence with program-specific datasets for the Texas Longhorns. The route is powered by the Netlify function `netlify/functions/longhorns.js` and serves curated season bundles for football and baseball.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sport` | `string` | `football` | Supported values: `football`, `baseball`. |
| `season` | `number` | Latest available | Optional season override. The repository currently includes 2023 data while 2024/2025 ingestion is pending. |
| `category` | `string` | _none_ | Optional filter returning a single section (`summary`, `schedule`, `keyPlayers`, `updatePlan`, etc.). |

**Example – football schedule**

```bash
curl "https://blaze-intelligence.netlify.app/api/longhorns?sport=football&category=schedule"
```

**Response**

```json
{
  "sport": "football",
  "season": 2023,
  "availableSeasons": [2023],
  "dataStatus": "historical",
  "lastUpdated": "2024-01-02T00:00:00Z",
  "requestedCategory": "schedule",
  "data": [
    {
      "date": "2023-09-02",
      "opponent": "Rice",
      "gameType": "Regular Season",
      "result": "W",
      "score": { "texas": 37, "opponent": 10 }
    }
  ],
  "metadata": {
    "summaryAvailable": true,
    "scheduleAvailable": true,
    "keyPlayersAvailable": true,
    "updatePlanIncluded": true
  }
}
```

**Notes**

- Football coverage reflects the 12-2 2023 season (Big 12 title, CFP semifinal appearance). Values are derived from publicly available box scores and should be replaced by licensed feeds before production launch.
- Baseball coverage summarises the 42-22 2023 campaign (Austin Regional champions, Stanford Super Regional appearance).
- The `updatePlan` field highlights ingestion tasks (e.g., onboarding 2024/2025 data, automating roster scrapes, wiring news feeds). Surfacing those tasks in internal dashboards will keep stakeholders aware of remaining work.

---

### Readiness Data

#### GET `/api/readiness`
Returns current readiness scores for all teams, organized by sport.

**Response**:
```json
{
  "timestamp": "2025-01-24T19:00:00.000Z",
  "sports": {
    "MLB": {
      "teams": [
        {
          "team_id": "MLB-STL",
          "name": "St. Louis Cardinals",
          "readiness_score": 67.4,
          "status": "yellow",
          "players": {
            "total": 25,
            "available": 23,
            "stars": 3
          },
          "leverage": 45.2
        }
      ],
      "averageReadiness": 67.4
    }
  }
}
```

**Query Parameters**:
- `sport` (string): Filter by specific sport
- `status` (string): Filter by readiness status (`green`, `yellow`, `red`)
- `min_score` (number): Minimum readiness threshold

#### GET `/api/readiness/{team_id}`
Returns detailed readiness breakdown for a specific team.

**Response**:
```json
{
  "team_id": "MLB-STL",
  "name": "St. Louis Cardinals",
  "readiness_score": 67.4,
  "status": "yellow",
  "components": {
    "recent_performance": 72.5,
    "player_availability": 85.2,
    "matchup_history": 45.8,
    "momentum": 60.0,
    "rest_factor": 90.0
  },
  "leverage": 45.2,
  "trend": "stable",
  "last_updated": "2025-01-24T18:45:00.000Z",
  "recommendations": [
    {
      "component": "matchup_history",
      "severity": "warning",
      "action": "Review recent H2H performance against upcoming opponent"
    }
  ]
}
```

---

### Analytics

#### GET `/api/analytics/trending`
Returns trending players and teams based on recent performance changes.

**Response**:
```json
{
  "rising_players": [
    {
      "name": "Quinn Ewers",
      "team": "Texas Longhorns",
      "havf_change": +5.2,
      "period": "30_days"
    }
  ],
  "declining_players": [
    {
      "name": "Example Player",
      "team": "Example Team", 
      "havf_change": -3.1,
      "period": "30_days"
    }
  ],
  "hot_teams": [
    {
      "name": "Texas Longhorns",
      "sport": "NCAA-FB",
      "readiness_change": +12.5
    }
  ]
}
```

#### GET `/api/analytics/comparisons`
Compare players or teams using various metrics.

**Query Parameters**:
- `players` (string): Comma-separated player IDs
- `teams` (string): Comma-separated team IDs
- `metrics` (string): Specific metrics to compare

**Example**:
```bash
curl "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/analytics/comparisons?players=NCAA-TEX-0001,MLB-STL-0001&metrics=havf,performance"
```

---

## Data Models

### HAV-F Score Object
```json
{
  "champion_readiness": 75.8,      // 0-100, performance under pressure
  "cognitive_leverage": 82.4,      // 0-100, decision-making ability  
  "nil_trust_score": 91.2,         // 0-100, market value potential
  "composite_score": 81.9,         // Weighted average of above
  "percentile_rank": 94,           // Percentile within position group
  "trend": "rising",               // "rising", "stable", "declining"
  "computed_at": "2025-01-24T19:00:00.000Z"
}
```

### Player Object
```json
{
  "player_id": "string",           // Unique identifier
  "name": "string",                // Full name
  "sport": "string",               // MLB, NFL, NCAA-FB, etc.
  "league": "string",              // Specific league
  "team": "string",                // Current team name
  "position": "string",            // Primary position
  "bio": {                         // Biographical info
    "height_cm": 191,
    "weight_kg": 93,
    "age": 21,
    "class_year": "Junior"
  },
  "stats_2024": {},                // Current season stats
  "projections_2025": {},          // Next season projections
  "hav_f": {},                     // HAV-F scores (see above)
  "nil_profile": {},               // NIL valuation data
  "injury_status": "string",       // Current injury status
  "meta": {
    "sources": ["string"],         // Data sources
    "updated_at": "ISO_8601_date"
  }
}
```

### Team Object
```json
{
  "team_id": "string",             // Unique identifier  
  "name": "string",                // Team name
  "sport": "string",               // Sport type
  "league": "string",              // League/division
  "readiness_score": 67.4,         // Current readiness (0-100)
  "status": "yellow",              // Traffic light status
  "roster": [],                    // Array of player objects
  "analytics": {
    "avg_havf": 72.4,
    "offense_rating": 98.2,
    "defense_rating": 91.7
  }
}
```

---

## Rate Limits

### Current Limits (Public Beta)
- **Requests**: 1000 per hour per IP
- **Burst**: 100 requests per minute
- **Concurrent**: 10 simultaneous connections

### Response Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1643030400
```

### Exceeding Limits
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again in 45 seconds.",
  "retry_after": 45
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "string",               // Error type
  "message": "string",             // Human-readable description
  "code": 400,                     // HTTP status code
  "timestamp": "2025-01-24T19:00:00.000Z",
  "request_id": "uuid"             // For support debugging
}
```

### Common Errors

#### 400 Bad Request
Invalid query parameters or malformed request.

#### 404 Not Found
Requested resource doesn't exist.
```json
{
  "error": "Player not found",
  "message": "Player with ID 'NCAA-TEX-9999' does not exist",
  "code": 404
}
```

#### 429 Too Many Requests
Rate limit exceeded.

#### 503 Service Unavailable  
API temporarily unavailable for maintenance.

---

## SDKs and Libraries

### JavaScript/Node.js
```javascript
// Official Blaze Intelligence SDK (coming soon)
const BlazeeIntelligence = require('@blaze/intelligence-sdk');

const client = new BlazeIntelligence({
  apiKey: 'your_api_key',
  baseUrl: 'https://blaze-intelligence-api.humphrey-austin20.workers.dev'
});

// Get top prospects
const prospects = await client.getProspects({
  sport: 'NCAA-FB',
  limit: 10
});

// Get team readiness
const readiness = await client.getTeamReadiness('MLB-STL');
```

### Python
```python
import requests

# Basic usage
base_url = "https://blaze-intelligence-api.humphrey-austin20.workers.dev"

def get_prospects(sport=None, limit=25):
    params = {'limit': limit}
    if sport:
        params['sport'] = sport
    
    response = requests.get(f"{base_url}/api/prospects", params=params)
    return response.json()

def get_team_readiness(team_id=None):
    url = f"{base_url}/api/readiness"
    if team_id:
        url += f"/{team_id}"
    
    response = requests.get(url)
    return response.json()

# Example usage
prospects = get_prospects(sport='NFL', limit=10)
cardinals_readiness = get_team_readiness('MLB-STL')
```

### cURL Examples
```bash
# Get all prospects
curl "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/prospects"

# Get NFL quarterbacks only
curl "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/prospects?sport=NFL&position=QB"

# Get team readiness with pretty JSON
curl -s "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/readiness" | jq .

# Check system health
curl -w "Response time: %{time_total}s\n" \
  "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/health"
```

---

## Webhooks (Coming Soon)

Subscribe to real-time updates when player scores or team readiness changes.

### Webhook Events
- `player.havf_updated` - HAV-F score changed significantly  
- `team.readiness_changed` - Team readiness status changed
- `player.injury_status` - Injury status updated
- `system.maintenance` - Scheduled maintenance notifications

### Webhook Payload
```json
{
  "event": "player.havf_updated",
  "timestamp": "2025-01-24T19:00:00.000Z",
  "data": {
    "player_id": "NCAA-TEX-0001",
    "old_score": 79.1,
    "new_score": 81.9,
    "change": +2.8
  }
}
```

---

## Authentication (Coming Soon)

### API Key Authentication
```bash
curl -H "Authorization: Bearer your_api_key" \
  "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/prospects"
```

### Obtaining API Keys
1. Sign up at https://blaze-intelligence.com
2. Navigate to API Settings
3. Generate new API key
4. Include in Authorization header

---

## Changelog

### v2.0.0 (Current)
- Initial public API release
- HAV-F evaluation framework
- Multi-league coverage (MLB, NFL, NCAA, HS)
- Real-time readiness calculations
- Comprehensive player profiles

### Upcoming v2.1.0
- API key authentication
- Webhook support
- Enhanced analytics endpoints
- SDK releases (JavaScript, Python)
- International league support

---

## Support

### Documentation
- **API Docs**: https://docs.blaze-intelligence.com
- **Status Page**: https://status.blaze-intelligence.com
- **Changelog**: https://github.com/blaze-intelligence/api/releases

### Contact
- **Technical Support**: api-support@blaze-intelligence.com
- **Business Inquiries**: Austin Humphrey - ahump20@outlook.com
- **Phone**: (210) 273-5538
- **Response Time**: < 4 hours during business hours

### Community
- **Discord**: https://discord.gg/blaze-intelligence
- **Twitter**: @BlazeIntel
- **GitHub**: https://github.com/blaze-intelligence

---

**© 2025 Blaze Intelligence. All rights reserved.**