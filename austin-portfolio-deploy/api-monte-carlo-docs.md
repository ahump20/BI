# Blaze Intelligence Monte Carlo Scenarios API

## Overview
Real-time sports scenario simulation endpoints supporting 10,000+ iteration Monte Carlo analysis.

## Base URL
```
https://blazesportsintel.com/api/monte-carlo
```

## Authentication
Include API key in header:
```
X-API-Key: your-blaze-intelligence-api-key
```

## Endpoints

### Team Performance Scenarios
```http
POST /team-performance/{teamId}
```

**Parameters:**
- `playerPerformance`: -50 to +50 (percentage change)
- `teamChemistry`: 0.5 to 1.5 (multiplier)
- `remainingGames`: 1-162 games
- `sosAdjustment`: -30 to +30 (percentage)

**Teams:** `cardinals`, `titans`, `longhorns`, `grizzlies`

### Playoff Probability Scenarios
```http
POST /playoff-probability/{teamId}
```

**Parameters:**
- `winStreak`: 0-20 games
- `rivalPerformance`: -25 to +25 (percentage)
- `h2hImpact`: 0-100 (percentage)

### NIL Valuation Scenarios
```http
POST /nil-valuation
```

**Parameters:**
- `sport`: "football", "basketball", "baseball"
- `position`: Position-specific (QB, RB, etc.)
- `performanceImprovement`: -40 to +40 (percentage)
- `socialMediaGrowth`: 0-200 (percentage)
- `marketSize`: "small", "medium", "large", "mega"
- `championshipFactor`: 1-5 (multiplier)

### Youth Development Scenarios
```http
POST /youth-development
```

**Parameters:**
- `sport`: "football", "baseball"
- `skillDevelopmentRate`: 0.5-2.0 (multiplier)
- `characterScore`: 1-10 scale
- `academicPerformance`: 2.0-4.0 GPA
- `hsRanking`: 1-500 ranking
- `region`: "texas", "california", "florida", "other"

### Response Format
```json
{
  "success": true,
  "scenario": "team-performance",
  "team": "cardinals",
  "results": {
    "iterations": 10000,
    "statistics": {
      "playoffProbability": {
        "mean": 67.3,
        "stdDev": 8.4,
        "confidenceInterval": {
          "lower": 58.2,
          "upper": 76.1,
          "level": 0.95
        },
        "percentiles": {
          "p5": 54.7,
          "p95": 79.8
        }
      }
    }
  },
  "generatedAt": "2025-01-26T15:30:00Z"
}
```

## Rate Limits
- 100 requests per 15 minutes per IP
- Results cached for 5 minutes
- Enterprise plans available for higher limits

## Error Handling
```json
{
  "success": false,
  "error": "Team cardinals not found",
  "scenario": "team-performance"
}
```

## Deep South Teams
- **Cardinals**: St. Louis Cardinals (MLB)
- **Titans**: Tennessee Titans (NFL)
- **Longhorns**: Texas Longhorns (NCAA)
- **Grizzlies**: Memphis Grizzlies (NBA)
