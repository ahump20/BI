# Social Media Intelligence API
*Blaze Intelligence · September 2025*

## Overview
The Social Media Intelligence API aggregates official, fan, and media conversations from X (formerly Twitter) for priority Blaze Intelligence franchises. It normalizes recent search results into a unified schema with author metadata, engagement metrics, and rate-limit telemetry so dashboards can monitor sentiment and storyline velocity in near real time.【F:api-unified/social-media-intelligence.js†L1-L207】

- **Supported teams:** St. Louis Cardinals, Texas Longhorns Football, Texas Longhorns Baseball, Tennessee Titans, Baltimore Orioles, Memphis Grizzlies.【F:api-unified/social-media-intelligence.js†L20-L54】
- **Categories:** `official`, `fan`, and `media` queries with independently-tuned search parameters and post-processing filters.【F:api-unified/social-media-intelligence.js†L89-L154】
- **Deployment targets:** Cloudflare Workers (primary) and Netlify Functions (via proxy) using the same module export pattern.

## Authentication & Environment
| Variable | Required | Description |
| --- | --- | --- |
| `X_BEARER_TOKEN` | ✅ | Official X API v2 OAuth 2.0 bearer token with access to the **Recent Search** endpoint.【F:api-unified/social-media-intelligence.js†L118-L206】 |
| `SOCIAL_INTELLIGENCE_USE_MOCK` | Optional | When set to `true`, responses return deterministic mock payloads for offline development and CI pipelines.【F:api-unified/social-media-intelligence.js†L130-L140】【F:api-unified/social-media-intelligence.js†L320-L471】 |
| `NODE_ENV` | Optional | Setting `NODE_ENV=test` implicitly enables mock responses. |

> **Compliance note:** The worker only consumes the official X API and respects the platform's terms of service. No scraping or credential sharing is performed.

## Endpoints
### `GET /api/social-intelligence`
Returns categorized conversation data for a selected franchise.

**Query Parameters**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `team` | string | — | Required slug (see `/api/social-intelligence/teams`). |
| `limit` | integer | 12 | Maximum normalized posts to return per category (capped at 50).【F:api-unified/social-media-intelligence.js†L102-L116】 |
| `hours` | integer | — | Restricts search window to the past `n` hours (1–168).【F:api-unified/social-media-intelligence.js†L108-L116】 |
| `lang` | string | `en` | ISO language code filter. Use `any` to disable language filtering.【F:api-unified/social-media-intelligence.js†L100-L116】 |

**Response Structure**
```jsonc
{
  "team": {
    "slug": "st-louis-cardinals",
    "name": "St. Louis Cardinals",
    "league": "MLB"
  },
  "generatedAt": "2025-09-18T18:22:01.302Z",
  "parameters": {
    "limit": 12,
    "startTime": "2025-09-18T11:22:01.302Z",
    "language": "en",
    "requestedAt": "2025-09-18T18:22:01.302Z"
  },
  "categories": {
    "official": {
      "label": "official",
      "query": "(from:Cardinals OR from:CardinalsCare)",
      "accounts": ["Cardinals", "CardinalsCare"],
      "items": [
        {
          "id": "1234567890",
          "text": "Final from Busch: Cards win!",
          "createdAt": "2025-09-18T17:55:03.000Z",
          "language": "en",
          "url": "https://twitter.com/Cardinals/status/1234567890",
          "author": {
            "id": "123",
            "name": "St. Louis Cardinals",
            "username": "Cardinals",
            "verified": true,
            "profileImageUrl": "https://...",
            "followers": 1234567,
            "accountType": "official"
          },
          "metrics": {
            "likes": 1845,
            "replies": 213,
            "reposts": 462,
            "quotes": 35,
            "impressions": 987654
          },
          "referencedTweets": [],
          "category": "official"
        }
      ],
      "rateLimit": {
        "limit": 450,
        "remaining": 440,
        "reset": "2025-09-18T19:15:00.000Z"
      }
    },
    "fan": { "..." },
    "media": { "..." }
  },
  "usage": {
    "source": "x",
    "searchEndpoint": "https://api.twitter.com/2/tweets/search/recent"
  }
}
```

**Error Codes**
| Status | Meaning |
| --- | --- |
| `400` | Missing or invalid `team` parameter.【F:api-unified/social-media-intelligence.js†L69-L101】 |
| `404` | Unsupported team slug. |
| `500` | Missing `X_BEARER_TOKEN` secret. |
| `502` | Upstream API failure or rate-limit exhaustion.【F:api-unified/social-media-intelligence.js†L180-L207】 |

### `GET /api/social-intelligence/teams`
Returns the list of supported team slugs, names, and leagues for client selection menus.【F:api-unified/social-media-intelligence.js†L56-L96】

## Mocking & Testing
- Enable `SOCIAL_INTELLIGENCE_USE_MOCK=true` (or `NODE_ENV=test`) to receive canned responses useful for Storybook, Cypress, or unit tests without consuming X rate limits.【F:api-unified/social-media-intelligence.js†L130-L140】【F:api-unified/social-media-intelligence.js†L320-L471】
- Mock payloads include representative engagement metrics and author personas for each category to validate downstream visualizations.【F:api-unified/social-media-intelligence.js†L346-L471】

## Implementation Checklist
1. **Provision credentials:** request Elevated access to the X v2 API, store the bearer token in Cloudflare Workers Secrets and Netlify environment variables.
2. **Configure monitoring:** alert on `rateLimit.remaining` < 25 to prevent coverage gaps on high-traffic event days.【F:api-unified/social-media-intelligence.js†L155-L207】
3. **Integrate dashboards:** feed normalized posts into the Blaze executive console, championship hub, and NIL storytelling surfaces.
4. **Governance:** review fan queries quarterly to avoid noisy hashtags, and update media handle lists alongside PR stakeholder changes.【F:api-unified/social-media-intelligence.js†L20-L55】

## Roadmap Enhancements
- Optional `sentiment` enrichment using in-house NLP classifiers.
- Webhook-based caching layer to pre-seed data for game days.
- Cross-network expansion (YouTube, Instagram) via official partner APIs once credentialed.
