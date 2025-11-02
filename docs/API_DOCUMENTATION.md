# Blaze Intelligence API Documentation

## Base URL
- **Production**: `https://blazesportsintel.com/api`
- **Staging**: `https://staging.blazesportsintel.com/api`
- **Local**: `http://localhost:8000/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute
- **Rate limit headers** included in all responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-02T12:00:00Z",
  "requestId": "uuid"
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_REQUEST | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Health Check Endpoints

### GET /health

Comprehensive health check with all dependencies.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T12:00:00Z",
  "version": "2.0.0",
  "dependencies": {
    "database": { "status": "healthy", "latency": "5ms" },
    "redis": { "status": "healthy", "latency": "2ms" }
  },
  "system": {
    "uptime": { "ms": 86400000 },
    "memory": { "rss": "128MB", "heapUsed": "64MB" },
    "environment": "production"
  }
}
```

### GET /health/live

Liveness probe for Kubernetes/load balancers.

**Response 200:**
```json
{
  "status": "alive",
  "timestamp": "2025-11-02T12:00:00Z"
}
```

### GET /health/ready

Readiness probe checking all dependencies.

**Response 200/503:** Same as `/health` endpoint

## Analytics Endpoints

### GET /api/analytics/teams/:teamId

Get team analytics and performance data.

**Parameters:**
- `teamId` (path, required): Team ID (numeric)
- `season` (query, optional): Season year (YYYY)
- `metrics` (query, optional): Comma-separated list of metrics

**Example Request:**
```bash
GET /api/analytics/teams/138?season=2024&metrics=batting,pitching
```

**Response 200:**
```json
{
  "team": {
    "id": 138,
    "name": "St. Louis Cardinals",
    "league": "MLB"
  },
  "season": "2024",
  "metrics": {
    "batting": {
      "avg": 0.265,
      "obp": 0.335,
      "slg": 0.425
    },
    "pitching": {
      "era": 3.85,
      "whip": 1.25
    }
  },
  "updated": "2025-11-02T12:00:00Z"
}
```

### GET /api/analytics/players/:playerId

Get player statistics and analytics.

**Parameters:**
- `playerId` (path, required): Player ID
- `season` (query, optional): Season year
- `gameType` (query, optional): R (regular), P (playoffs), S (spring)

**Response 200:**
```json
{
  "player": {
    "id": 123456,
    "name": "Player Name",
    "team": "Cardinals",
    "position": "SS"
  },
  "stats": {
    "batting": {
      "games": 162,
      "avg": 0.285,
      "hr": 25,
      "rbi": 95
    }
  }
}
```

### POST /api/analytics/reports

Generate custom analytics report.

**Authentication:** Required

**Request Body:**
```json
{
  "reportType": "team_performance",
  "parameters": {
    "teamIds": [138, 143],
    "startDate": "2024-04-01",
    "endDate": "2024-10-01",
    "metrics": ["batting", "pitching", "fielding"]
  },
  "format": "json"
}
```

**Response 201:**
```json
{
  "reportId": "rpt_abc123",
  "status": "processing",
  "estimatedCompletion": "2025-11-02T12:05:00Z",
  "downloadUrl": "/api/reports/rpt_abc123"
}
```

## Live Data Endpoints

### GET /api/live/games/:gameId

Get real-time game data and play-by-play.

**Parameters:**
- `gameId` (path, required): Game ID

**Response 200:**
```json
{
  "game": {
    "id": 123456,
    "status": "In Progress",
    "inning": 7,
    "inningState": "Top",
    "teams": {
      "away": {
        "name": "Cardinals",
        "score": 4,
        "hits": 8,
        "errors": 1
      },
      "home": {
        "name": "Cubs",
        "score": 3,
        "hits": 7,
        "errors": 0
      }
    },
    "currentPlay": {
      "description": "Ball in dirt",
      "count": { "balls": 2, "strikes": 1 }
    }
  },
  "updated": "2025-11-02T12:00:00Z"
}
```

### GET /api/live/schedule

Get today's game schedule.

**Query Parameters:**
- `date` (optional): YYYY-MM-DD format
- `sport` (optional): mlb, nfl, nba, ncaa
- `teamId` (optional): Filter by team

**Response 200:**
```json
{
  "date": "2025-11-02",
  "games": [
    {
      "id": 123456,
      "time": "19:05:00Z",
      "status": "Scheduled",
      "teams": {
        "away": "Cardinals",
        "home": "Cubs"
      }
    }
  ]
}
```

## Perfect Game Integration

### GET /api/perfect-game/players/:playerId

Get youth baseball player data from Perfect Game.

**Response 200:**
```json
{
  "player": {
    "id": "pg123",
    "name": "Player Name",
    "gradYear": 2025,
    "position": "SS",
    "battingHand": "R",
    "throwingHand": "R"
  },
  "rankings": {
    "national": 150,
    "state": 25
  },
  "measurables": {
    "height": "6-2",
    "weight": 185,
    "sixtyYard": 6.8,
    "exitVelocity": 92
  }
}
```

## Request Examples

### cURL
```bash
# Health check
curl https://blazesportsintel.com/health

# Team analytics (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://blazesportsintel.com/api/analytics/teams/138

# Generate report
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reportType":"team_performance","parameters":{"teamIds":[138]}}' \
  https://blazesportsintel.com/api/analytics/reports
```

### JavaScript (Fetch)
```javascript
// Get team analytics
const response = await fetch('https://blazesportsintel.com/api/analytics/teams/138', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Python (requests)
```python
import requests

# Get team analytics
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
response = requests.get(
    'https://blazesportsintel.com/api/analytics/teams/138',
    headers=headers
)
data = response.json()
```

## Webhooks (Coming Soon)

Subscribe to real-time events:
- Game start/end
- Score updates
- Player transactions
- Injury reports

## SDK Libraries (Coming Soon)

Official SDKs for:
- JavaScript/Node.js
- Python
- Go
- Ruby

## Support

For API support or to request access:
- **Email**: ahump20@outlook.com
- **Documentation**: https://docs.blazesportsintel.com

---

**Version**: 2.0.0  
**Last Updated**: 2025-11-02
