# NCAA Baseball API & Data Integration Specification

**Blaze Intelligence - College Baseball Product**  
**Document Type:** Technical Specification  
**Version:** 1.0  
**Last Updated:** October 2025  
**Status:** Design Phase

---

## Overview

This document specifies the API endpoints, data models, integration patterns, and implementation details for NCAA Division I baseball data integration within the Blaze Intelligence platform.

### Design Principles

1. **Extend, Don't Rebuild:** Leverage existing `ncaa-data-integration.js` patterns from football
2. **Multi-Source Resilience:** Support 3+ data sources with automatic fallback
3. **Edge-First Caching:** Aggressive caching with stale-while-revalidate patterns
4. **Sports-Agnostic Schema:** Enable reuse for softball, other diamond sports
5. **Mobile-Optimized:** Minimize payload size, support offline-first patterns

---

## Data Models

### Core Entities

#### Team
```typescript
interface NCAABaseballTeam {
  id: string;                    // Normalized team ID (e.g., "ncaa-baseball-tex")
  externalIds: {                 // Map to different data sources
    ncaa: string;
    d1baseball: string;
    espn?: string;
    sportradar?: string;
  };
  name: string;                  // "Texas Longhorns"
  shortName: string;             // "Texas"
  abbreviation: string;          // "TEX"
  conference: {
    id: string;                  // "big12"
    name: string;                // "Big 12 Conference"
  };
  division: "D1" | "D2" | "D3";
  location: {
    city: string;
    state: string;
    venue: string;               // "Disch-Falk Field"
    capacity?: number;
  };
  colors: {
    primary: string;             // "#BF5700" (burnt orange)
    secondary: string;           // "#FFFFFF"
  };
  logos: {
    primary: string;             // URL to primary logo
    alternate?: string;
  };
  socialMedia?: {
    twitter?: string;
    instagram?: string;
  };
  metadata: {
    source: string;              // "ncaa" | "d1baseball" | "sportradar"
    lastUpdated: string;         // ISO 8601 timestamp
    confidence: number;          // 0-1 data quality score
  };
}
```

#### Player
```typescript
interface NCAABaseballPlayer {
  id: string;                    // Normalized player ID
  externalIds: {
    ncaa: string;
    d1baseball?: string;
    mlbDraft?: string;
    perfectGame?: string;
  };
  name: {
    first: string;
    last: string;
    full: string;
    display: string;             // Preferred display name
  };
  team: {
    id: string;                  // Reference to Team.id
    name: string;
  };
  position: {
    primary: PlayerPosition;
    secondary?: PlayerPosition;
  };
  jerseyNumber?: string;
  classYear: "FR" | "SO" | "JR" | "SR" | "RS-FR" | "RS-SO" | "RS-JR" | "RS-SR";
  eligibility: {
    year: number;                // Year of eligibility (1-5)
    isRedshirt: boolean;
  };
  physical: {
    height?: string;             // "6-2"
    weight?: number;             // pounds
    batsThrows?: {
      bats: "R" | "L" | "S";     // Right, Left, Switch
      throws: "R" | "L";
    };
  };
  hometown?: {
    city: string;
    state: string;
  };
  previousSchool?: string;       // High school or transfer school
  bio?: string;
  photo?: string;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
  };
  mlbProspect?: {
    rank?: number;
    projectedRound?: string;
    scoutGrades?: {
      hit: number;               // 20-80 scale
      power: number;
      run: number;
      arm: number;
      field: number;
    };
  };
  metadata: {
    source: string;
    lastUpdated: string;
    confidence: number;
  };
}

type PlayerPosition = 
  | "P"    // Pitcher
  | "C"    // Catcher
  | "1B"   // First Base
  | "2B"   // Second Base
  | "3B"   // Third Base
  | "SS"   // Shortstop
  | "LF"   // Left Field
  | "CF"   // Center Field
  | "RF"   // Right Field
  | "DH"   // Designated Hitter
  | "IF"   // Infielder (generic)
  | "OF"   // Outfielder (generic)
  | "UTIL"; // Utility
```

#### Game
```typescript
interface NCAABaseballGame {
  id: string;                    // Normalized game ID
  externalIds: {
    ncaa: string;
    d1baseball?: string;
    espn?: string;
  };
  status: GameStatus;
  startTime: string;             // ISO 8601 timestamp
  venue: {
    name: string;
    city?: string;
    state?: string;
    isNeutralSite: boolean;
  };
  teams: {
    home: GameTeamInfo;
    away: GameTeamInfo;
  };
  weather?: {
    temperature?: number;
    conditions?: string;         // "Sunny", "Cloudy", "Rain Delay"
    wind?: string;
  };
  broadcast?: {
    tv?: string;                 // "ESPN", "SEC Network"
    radio?: string;
    stream?: string;             // URL or service name
  };
  gameType: "regular" | "conference" | "tournament" | "regional" | "superregional" | "cws";
  series?: {
    gameNumber: number;          // 1, 2, or 3
    totalGames: number;          // 2 or 3
  };
  metadata: {
    source: string;
    lastUpdated: string;
    nextUpdate?: string;         // When to expect next update
    confidence: number;
  };
}

type GameStatus = 
  | "scheduled"
  | "delayed"
  | "postponed"
  | "cancelled"
  | "warmup"
  | "live"
  | "final"
  | "suspended";

interface GameTeamInfo {
  id: string;                    // Team.id
  name: string;
  abbreviation: string;
  score?: number;
  isWinner?: boolean;
  record?: {
    wins: number;
    losses: number;
    conferenceWins?: number;
    conferenceLosses?: number;
  };
  pitchers?: {
    starter: string;             // Player.id
    current?: string;
    winning?: string;
    losing?: string;
    save?: string;
  };
}
```

#### Box Score
```typescript
interface NCAABaseballBoxScore {
  gameId: string;                // Game.id
  game: {
    date: string;
    status: GameStatus;
    inning: {
      current: number;
      half: "top" | "bottom" | "end";
    };
  };
  teams: {
    home: TeamBoxScore;
    away: TeamBoxScore;
  };
  lineScore: {
    innings: InningScore[];      // Score by inning
    totals: {
      runs: number;
      hits: number;
      errors: number;
    };
  };
  battingStats: {
    home: PlayerBattingStats[];
    away: PlayerBattingStats[];
  };
  pitchingStats: {
    home: PlayerPitchingStats[];
    away: PlayerPitchingStats[];
  };
  plays?: Play[];                // Play-by-play (if available)
  metadata: {
    source: string;
    lastUpdated: string;
    isComplete: boolean;         // All data populated
    confidence: number;
  };
}

interface TeamBoxScore {
  id: string;
  name: string;
  score: number;
  hits: number;
  errors: number;
  leftOnBase?: number;
}

interface InningScore {
  inning: number;
  home: number | null;           // null if not yet played
  away: number | null;
}

interface PlayerBattingStats {
  playerId: string;
  name: string;
  position: string;
  battingOrder?: number;
  ab: number;                    // At bats
  r: number;                     // Runs
  h: number;                     // Hits
  rbi: number;                   // RBIs
  bb: number;                    // Walks
  so: number;                    // Strikeouts
  avg: number;                   // Batting average
  obp?: number;                  // On-base percentage
  slg?: number;                  // Slugging percentage
  doubles?: number;
  triples?: number;
  homeRuns?: number;
  stolenBases?: number;
  caughtStealing?: number;
  hitByPitch?: number;
  sacrifices?: number;
  leftOnBase?: number;
}

interface PlayerPitchingStats {
  playerId: string;
  name: string;
  ip: string;                    // Innings pitched (e.g., "6.1")
  h: number;                     // Hits allowed
  r: number;                     // Runs allowed
  er: number;                    // Earned runs
  bb: number;                    // Walks
  so: number;                    // Strikeouts
  hr?: number;                   // Home runs allowed
  pitches?: number;
  strikes?: number;
  era: number;                   // ERA
  whip?: number;                 // WHIP
  decision?: "W" | "L" | "S" | "ND";  // Win, Loss, Save, No Decision
  blownSave?: boolean;
}

interface Play {
  inning: number;
  half: "top" | "bottom";
  outs: number;
  batter: string;                // Player.id
  pitcher: string;               // Player.id
  result: string;                // "Single to RF", "Strikeout swinging"
  runsScored: number;
  rbi: number;
}
```

#### Standings
```typescript
interface ConferenceStandings {
  conference: {
    id: string;
    name: string;
  };
  season: number;
  lastUpdated: string;
  teams: TeamStanding[];
}

interface TeamStanding {
  rank: number;
  team: {
    id: string;
    name: string;
    abbreviation: string;
  };
  overall: {
    wins: number;
    losses: number;
    winPercentage: number;
  };
  conference: {
    wins: number;
    losses: number;
    winPercentage: number;
  };
  streak?: {
    type: "W" | "L";
    count: number;
  };
  last10?: {
    wins: number;
    losses: number;
  };
  home?: {
    wins: number;
    losses: number;
  };
  away?: {
    wins: number;
    losses: number;
  };
  neutral?: {
    wins: number;
    losses: number;
  };
}
```

#### Season Statistics
```typescript
interface PlayerSeasonStats {
  playerId: string;
  player: {
    name: string;
    team: string;
  };
  season: number;
  batting?: {
    gamesPlayed: number;
    atBats: number;
    runs: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbi: number;
    walks: number;
    strikeouts: number;
    stolenBases: number;
    caughtStealing: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
  };
  pitching?: {
    gamesPlayed: number;
    gamesStarted: number;
    wins: number;
    losses: number;
    saves: number;
    inningsPitched: string;
    hits: number;
    runs: number;
    earnedRuns: number;
    walks: number;
    strikeouts: number;
    homeRuns: number;
    era: number;
    whip: number;
    k9: number;                  // Strikeouts per 9 innings
    bb9: number;                 // Walks per 9 innings
  };
  fielding?: {
    position: string;
    gamesPlayed: number;
    chances: number;
    putouts: number;
    assists: number;
    errors: number;
    fieldingPercentage: number;
    doublePlays?: number;
  };
}
```

---

## API Endpoints

### Base Configuration

```javascript
const BASE_URL = 'https://api.blazeintelligence.com';
const API_VERSION = 'v1';
const NCAA_BASEBALL_PREFIX = '/ncaa/baseball';

// Example: https://api.blazeintelligence.com/v1/ncaa/baseball/teams
```

### Endpoint Specifications

#### 1. List Games

**GET** `/ncaa/baseball/games`

Lists games with filtering and pagination.

**Query Parameters:**
- `date` (string, ISO 8601): Filter by specific date (default: today)
- `dateFrom` (string, ISO 8601): Start date range
- `dateTo` (string, ISO 8601): End date range
- `team` (string): Filter by team ID
- `conference` (string): Filter by conference ID
- `status` (string): Filter by game status (scheduled|live|final)
- `gameType` (string): Filter by game type
- `page` (number): Page number (default: 1)
- `perPage` (number): Results per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "ncaa-baseball-20250315-tex-okst",
        "status": "live",
        "startTime": "2025-03-15T18:00:00Z",
        "teams": {
          "home": {
            "id": "ncaa-baseball-tex",
            "name": "Texas Longhorns",
            "abbreviation": "TEX",
            "score": 5
          },
          "away": {
            "id": "ncaa-baseball-okst",
            "name": "Oklahoma State Cowboys",
            "abbreviation": "OKST",
            "score": 3
          }
        },
        "venue": {
          "name": "Disch-Falk Field",
          "isNeutralSite": false
        },
        "gameType": "conference"
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 50,
      "total": 127,
      "totalPages": 3
    }
  },
  "meta": {
    "cached": true,
    "cacheAge": 15,
    "source": "ncaa",
    "timestamp": "2025-03-15T20:30:45Z"
  }
}
```

**Caching:**
- Live games: 30s TTL
- Scheduled games: 5min TTL
- Final games: 1h TTL

---

#### 2. Get Game Details

**GET** `/ncaa/baseball/games/{gameId}`

Returns detailed game information including box score.

**Path Parameters:**
- `gameId` (string, required): Normalized game ID

**Query Parameters:**
- `include` (string[]): Additional data to include (`boxscore`, `plays`, `probablePitchers`)

**Response:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "ncaa-baseball-20250315-tex-okst",
      "status": "live",
      "startTime": "2025-03-15T18:00:00Z",
      "venue": {
        "name": "Disch-Falk Field",
        "city": "Austin",
        "state": "TX",
        "isNeutralSite": false
      },
      "teams": {
        "home": {
          "id": "ncaa-baseball-tex",
          "name": "Texas Longhorns",
          "abbreviation": "TEX",
          "score": 5,
          "record": {
            "wins": 18,
            "losses": 5,
            "conferenceWins": 3,
            "conferenceLosses": 1
          }
        },
        "away": {
          "id": "ncaa-baseball-okst",
          "name": "Oklahoma State Cowboys",
          "abbreviation": "OKST",
          "score": 3,
          "record": {
            "wins": 15,
            "losses": 8
          }
        }
      },
      "gameType": "conference",
      "broadcast": {
        "tv": "Longhorn Network",
        "stream": "ESPN+"
      }
    },
    "boxScore": {
      "lineScore": {
        "innings": [
          { "inning": 1, "home": 0, "away": 1 },
          { "inning": 2, "home": 2, "away": 0 },
          { "inning": 3, "home": 0, "away": 2 }
        ],
        "totals": {
          "runs": 8,
          "hits": 14,
          "errors": 2
        }
      },
      "battingStats": {
        "home": [
          {
            "playerId": "ncaa-baseball-player-12345",
            "name": "John Smith",
            "position": "SS",
            "battingOrder": 1,
            "ab": 3,
            "r": 2,
            "h": 2,
            "rbi": 1,
            "bb": 1,
            "so": 0,
            "avg": 0.345
          }
        ]
      }
    }
  },
  "meta": {
    "cached": true,
    "cacheAge": 18,
    "source": "ncaa",
    "timestamp": "2025-03-15T20:30:45Z"
  }
}
```

**Caching:**
- Live games: 15s TTL
- Final games: 1h TTL

---

#### 3. List Teams

**GET** `/ncaa/baseball/teams`

Lists all NCAA Division I baseball teams.

**Query Parameters:**
- `conference` (string): Filter by conference ID
- `search` (string): Search by team name
- `page` (number): Page number
- `perPage` (number): Results per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "ncaa-baseball-tex",
        "name": "Texas Longhorns",
        "shortName": "Texas",
        "abbreviation": "TEX",
        "conference": {
          "id": "big12",
          "name": "Big 12 Conference"
        },
        "location": {
          "city": "Austin",
          "state": "TX",
          "venue": "Disch-Falk Field"
        },
        "colors": {
          "primary": "#BF5700",
          "secondary": "#FFFFFF"
        },
        "logos": {
          "primary": "https://cdn.blazeintelligence.com/logos/ncaa-baseball-tex.png"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 50,
      "total": 301,
      "totalPages": 7
    }
  },
  "meta": {
    "cached": true,
    "cacheAge": 3600,
    "source": "ncaa",
    "timestamp": "2025-03-15T20:30:45Z"
  }
}
```

**Caching:**
- 1 day TTL (team data changes infrequently)

---

#### 4. Get Team Details

**GET** `/ncaa/baseball/teams/{teamId}`

Returns detailed team information, roster, and statistics.

**Path Parameters:**
- `teamId` (string, required): Normalized team ID

**Query Parameters:**
- `include` (string[]): Additional data (`roster`, `schedule`, `stats`)

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "ncaa-baseball-tex",
      "name": "Texas Longhorns",
      "conference": {
        "id": "big12",
        "name": "Big 12 Conference"
      },
      "location": {
        "venue": "Disch-Falk Field",
        "capacity": 7373
      },
      "socialMedia": {
        "twitter": "@TexasBaseball",
        "instagram": "@texasbaseball"
      }
    },
    "roster": [
      {
        "playerId": "ncaa-baseball-player-12345",
        "name": "John Smith",
        "position": "SS",
        "jerseyNumber": "5",
        "classYear": "JR"
      }
    ],
    "schedule": {
      "upcoming": [],
      "recent": []
    },
    "stats": {
      "season": 2025,
      "record": {
        "overall": { "wins": 18, "losses": 5 },
        "conference": { "wins": 3, "losses": 1 }
      },
      "batting": {
        "avg": 0.298,
        "ops": 0.842,
        "homeRuns": 32
      },
      "pitching": {
        "era": 3.45,
        "whip": 1.28,
        "strikeouts": 215
      }
    }
  },
  "meta": {
    "cached": true,
    "source": "ncaa"
  }
}
```

---

#### 5. Get Standings

**GET** `/ncaa/baseball/standings`

Returns conference standings.

**Query Parameters:**
- `conference` (string, required): Conference ID
- `season` (number): Season year (default: current)

**Response:**
```json
{
  "success": true,
  "data": {
    "conference": {
      "id": "big12",
      "name": "Big 12 Conference"
    },
    "season": 2025,
    "lastUpdated": "2025-03-15T20:00:00Z",
    "teams": [
      {
        "rank": 1,
        "team": {
          "id": "ncaa-baseball-tex",
          "name": "Texas Longhorns",
          "abbreviation": "TEX"
        },
        "overall": {
          "wins": 18,
          "losses": 5,
          "winPercentage": 0.783
        },
        "conference": {
          "wins": 3,
          "losses": 1,
          "winPercentage": 0.750
        },
        "streak": {
          "type": "W",
          "count": 5
        }
      }
    ]
  },
  "meta": {
    "cached": true,
    "cacheAge": 300,
    "source": "ncaa"
  }
}
```

**Caching:**
- 5min TTL during season

---

#### 6. Get Player Profile

**GET** `/ncaa/baseball/players/{playerId}`

Returns detailed player information and statistics.

**Path Parameters:**
- `playerId` (string, required): Normalized player ID

**Query Parameters:**
- `include` (string[]): Additional data (`stats`, `gamelog`, `mlbProjection`)

**Response:**
```json
{
  "success": true,
  "data": {
    "player": {
      "id": "ncaa-baseball-player-12345",
      "name": {
        "full": "John Michael Smith",
        "display": "John Smith"
      },
      "team": {
        "id": "ncaa-baseball-tex",
        "name": "Texas Longhorns"
      },
      "position": {
        "primary": "SS"
      },
      "jerseyNumber": "5",
      "classYear": "JR",
      "physical": {
        "height": "6-1",
        "weight": 195,
        "batsThrows": {
          "bats": "R",
          "throws": "R"
        }
      },
      "hometown": {
        "city": "Houston",
        "state": "TX"
      },
      "mlbProspect": {
        "rank": 15,
        "projectedRound": "1-2"
      }
    },
    "stats": {
      "season": 2025,
      "batting": {
        "gamesPlayed": 23,
        "atBats": 87,
        "hits": 30,
        "avg": 0.345,
        "homeRuns": 7,
        "rbi": 24,
        "stolenBases": 8
      }
    }
  },
  "meta": {
    "cached": true,
    "source": "ncaa"
  }
}
```

---

#### 7. Generate Content (NLG)

**POST** `/ncaa/baseball/content/generate`

Generates automated game previews, recaps, or player analysis.

**Request Body:**
```json
{
  "type": "recap" | "preview" | "playerProfile",
  "gameId": "ncaa-baseball-20250315-tex-okst",  // For recap/preview
  "playerId": "ncaa-baseball-player-12345",     // For playerProfile
  "language": "en",                             // "en" | "es"
  "tone": "neutral"                             // "neutral" | "hype" | "analytical"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": {
      "headline": "Longhorns Rally Past Cowboys 5-3",
      "summary": "Texas scored three runs in the bottom of the 7th to overcome a 3-2 deficit and defeat Oklahoma State 5-3 at Disch-Falk Field.",
      "body": "Texas Longhorns improved to 18-5 (3-1 Big 12) with a dramatic come-from-behind victory...",
      "keyPoints": [
        "John Smith went 2-for-3 with a run and RBI",
        "Mike Johnson pitched 6.1 innings with 8 strikeouts",
        "Texas rallied from 3-2 deficit in 7th inning"
      ],
      "quotes": [],
      "relatedPlayers": [
        { "id": "...", "name": "John Smith", "contribution": "2-3, R, RBI" }
      ]
    },
    "generatedAt": "2025-03-15T22:45:12Z",
    "model": "claude-3-sonnet",
    "wordCount": 347
  }
}
```

**Caching:**
- Generated content cached for 1 hour
- Regenerate on request if >1 hour old

---

## Data Source Integration

### NCAA Official Stats (stats.ncaa.org)

**Priority:** Primary (free)  
**Coverage:** All D1 games  
**Update Frequency:** 5-10 minutes during games  
**Reliability:** 85% (occasional outages)

**Endpoints:**
- Box scores: `https://stats.ncaa.org/game/box_score/{gameId}`
- Team stats: `https://stats.ncaa.org/teams/{teamId}`
- Player stats: `https://stats.ncaa.org/players/{playerId}`

**Implementation:**
```javascript
// /scripts/data-sources/ncaa-official-scraper.js
export class NCAAScraper {
  async fetchBoxScore(gameId) {
    const url = `https://stats.ncaa.org/game/box_score/${gameId}`;
    const html = await fetch(url).then(r => r.text());
    return this.parseBoxScoreHTML(html);
  }
  
  parseBoxScoreHTML(html) {
    // Cheerio-based HTML parsing
    // Extract tables, normalize data
    // Return standardized BoxScore object
  }
}
```

**Challenges:**
- HTML scraping (no JSON API)
- Rate limiting (max 60 req/min)
- Inconsistent data formats between schools

---

### D1Baseball.com

**Priority:** Secondary (augmentation)  
**Coverage:** Top 100 teams, in-depth analysis  
**Update Frequency:** Real-time to 2 minutes  
**Reliability:** 95% (professional operation)

**Endpoints:**
- Scores: `https://d1baseball.com/scores` (HTML)
- Rankings: `https://d1baseball.com/rankings` (HTML)
- Team pages: `https://d1baseball.com/teams/{slug}` (HTML)

**Implementation:**
```javascript
// /scripts/data-sources/d1baseball-scraper.js
export class D1BaseballScraper {
  async fetchScores(date) {
    const url = `https://d1baseball.com/scores?date=${date}`;
    // Respect robots.txt
    // User-Agent: BlazeIntelligence/1.0
    // Rate limit: 20 req/min
  }
}
```

**Legal Considerations:**
- Check robots.txt before scraping
- Implement rate limiting (20 req/min)
- Add attribution in app footer
- Consider licensing deal after validation

---

### Sportradar College API (Paid)

**Priority:** Tertiary (premium, post-MVP)  
**Cost:** $10K-30K/month for D1 coverage  
**Coverage:** All D1 games, play-by-play  
**Update Frequency:** Real-time (< 30 seconds)  
**Reliability:** 99.9% SLA

**Endpoints:**
- Live scores: `https://api.sportradar.com/ncaa-baseball/v1/games/{date}/schedule`
- Box scores: `https://api.sportradar.com/ncaa-baseball/v1/games/{gameId}/boxscore`
- Play-by-play: `https://api.sportradar.com/ncaa-baseball/v1/games/{gameId}/pbp`

**Implementation:**
```javascript
// /austin-portfolio-deploy/api/sportradar-ncaa-baseball.js
export class SportradarNCAABaseball {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.sportradar.com/ncaa-baseball/v1';
  }
  
  async fetchSchedule(date) {
    const url = `${this.baseUrl}/games/${date}/schedule?api_key=${this.apiKey}`;
    const response = await fetch(url);
    return await response.json();
  }
}
```

**When to Integrate:**
- After 20K+ MAU validation
- When scraper maintenance exceeds 20% of data engineer time
- Before monetization launch (Diamond Pro requires reliable data)

---

## Data Reconciliation Strategy

### Multi-Source Merging

**Priority Order:**
1. Sportradar (if available, highest quality)
2. NCAA Official (authoritative source)
3. D1Baseball (professional curation)
4. Team Athletic Sites (direct source but inconsistent)

**Merge Algorithm:**
```javascript
// /scripts/data-reconciliation/ncaa-baseball-merger.js
export class NCAABaseballDataMerger {
  mergeBoxScores(sources) {
    // Start with highest priority source
    let merged = sources.sportradar || sources.ncaa || sources.d1baseball;
    
    // Fill gaps from lower priority sources
    if (!merged.battingStats) {
      merged.battingStats = sources.ncaa?.battingStats || sources.d1baseball?.battingStats;
    }
    
    // Validate critical fields
    if (!merged.teams.home.score || !merged.teams.away.score) {
      throw new Error('Missing critical score data');
    }
    
    // Add metadata about sources used
    merged.metadata = {
      sources: Object.keys(sources),
      primarySource: sources.sportradar ? 'sportradar' : 'ncaa',
      confidence: this.calculateConfidence(merged),
      lastUpdated: new Date().toISOString()
    };
    
    return merged;
  }
  
  calculateConfidence(data) {
    // 0-1 score based on data completeness
    let score = 0.5;  // baseline
    
    if (data.battingStats?.home?.length > 0) score += 0.2;
    if (data.pitchingStats?.home?.length > 0) score += 0.2;
    if (data.lineScore?.innings?.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }
}
```

### Identifier Normalization

**Problem:** Each source uses different IDs for teams/players

**Solution:** Maintain mapping tables

```javascript
// /data/ncaa-baseball/id-mappings.json
{
  "teams": {
    "ncaa-baseball-tex": {
      "ncaa": "721",
      "d1baseball": "texas",
      "espn": "251",
      "sportradar": "sr:team:12345"
    }
  },
  "players": {
    "ncaa-baseball-player-12345": {
      "ncaa": "98765",
      "d1baseball": "john-smith-987",
      "mlbDraft": "smith-john-2025"
    }
  }
}
```

**Automated Matching:**
- Fuzzy string matching on team/player names
- Manual curation for ambiguous cases
- Confidence scoring for matches
- Human-in-the-loop verification UI

---

## Caching Strategy

### Cloudflare KV Implementation

**KV Namespace Structure:**
```
NCAA_BASEBALL_CACHE
├── games:date:{YYYY-MM-DD}              → List of game IDs for date
├── games:live                           → List of currently live game IDs
├── game:{gameId}                        → Game object
├── game:{gameId}:boxscore               → BoxScore object
├── team:{teamId}                        → Team object
├── team:{teamId}:roster                 → Array of Player objects
├── team:{teamId}:schedule:{season}      → Schedule array
├── player:{playerId}                    → Player object
├── player:{playerId}:stats:{season}     → Season stats
├── standings:{conferenceId}:{season}    → Standings array
└── content:{type}:{id}                  → Generated NLG content
```

**TTL Configuration:**
```javascript
const CACHE_TTL = {
  GAMES_LIVE: 30,           // 30 seconds for live game list
  GAME_LIVE: 15,            // 15 seconds for live game details
  BOXSCORE_LIVE: 15,        // 15 seconds for live box score
  GAME_FINAL: 3600,         // 1 hour for completed games
  GAME_SCHEDULED: 300,      // 5 minutes for scheduled games
  STANDINGS: 300,           // 5 minutes for standings
  TEAM_INFO: 86400,         // 1 day for team metadata
  ROSTER: 86400,            // 1 day for rosters
  PLAYER_INFO: 3600,        // 1 hour for player profiles
  PLAYER_STATS: 300,        // 5 minutes for season stats
  NLG_CONTENT: 3600,        // 1 hour for generated content
  SCHEDULE: 3600,           // 1 hour for schedules
};
```

**Stale-While-Revalidate Pattern:**
```javascript
async function getCachedOrFetch(key, fetcher, ttl) {
  const cached = await env.NCAA_BASEBALL_CACHE.get(key, { type: 'json' });
  
  if (cached) {
    // Serve from cache immediately
    const response = cached;
    
    // Check if stale (>50% of TTL expired)
    const age = Date.now() - new Date(cached.timestamp).getTime();
    if (age > ttl * 0.5 * 1000) {
      // Trigger background refresh (don't await)
      ctx.waitUntil(
        fetcher().then(fresh => 
          env.NCAA_BASEBALL_CACHE.put(key, JSON.stringify(fresh), { 
            expirationTtl: ttl 
          })
        )
      );
    }
    
    return response;
  }
  
  // Not in cache, fetch and store
  const fresh = await fetcher();
  await env.NCAA_BASEBALL_CACHE.put(key, JSON.stringify(fresh), { 
    expirationTtl: ttl 
  });
  return fresh;
}
```

---

## Error Handling & Observability

### Error Codes

```typescript
enum NCAABaseballErrorCode {
  DATA_SOURCE_UNAVAILABLE = 'NCAA_BB_1001',
  INVALID_GAME_ID = 'NCAA_BB_1002',
  INVALID_TEAM_ID = 'NCAA_BB_1003',
  INVALID_PLAYER_ID = 'NCAA_BB_1004',
  DATA_STALE = 'NCAA_BB_1005',
  RATE_LIMIT_EXCEEDED = 'NCAA_BB_1006',
  PARSING_ERROR = 'NCAA_BB_1007',
  INSUFFICIENT_DATA = 'NCAA_BB_1008',
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "NCAA_BB_1001",
    "message": "Primary data source unavailable",
    "details": "NCAA Stats API returned 503. Attempting fallback to D1Baseball.",
    "timestamp": "2025-03-15T20:30:45Z",
    "retryAfter": 60
  }
}
```

### Monitoring & Alerts

**Sentry Integration:**
```javascript
// /austin-portfolio-deploy/api/ncaa-baseball-monitoring.js
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.ENVIRONMENT || 'production',
  tracesSampleRate: 0.1,  // 10% of requests
});

function trackDataSourceHealth(source, success, responseTime) {
  Sentry.addBreadcrumb({
    category: 'data-source',
    message: `${source} ${success ? 'success' : 'failure'}`,
    level: success ? 'info' : 'error',
    data: { source, responseTime }
  });
  
  if (!success) {
    Sentry.captureMessage(`Data source ${source} failed`, {
      level: 'warning',
      extra: { source, responseTime }
    });
  }
}
```

**Cloudflare Analytics:**
- Track API endpoint usage
- Monitor cache hit rates
- Identify slow queries
- Detect traffic patterns

**Custom Metrics:**
```javascript
// Daily report on data quality
export class DataQualityMonitor {
  async generateDailyReport() {
    return {
      date: new Date().toISOString(),
      gamesProcessed: 127,
      dataStaleIncidents: 2,
      scraperFailures: {
        ncaa: 1,
        d1baseball: 0
      },
      averageDataConfidence: 0.92,
      cacheHitRate: 0.87,
      apiResponseTimes: {
        p50: 145,  // ms
        p95: 387,
        p99: 892
      }
    };
  }
}
```

---

## Mobile SDK Integration

### React Native Service

```typescript
// /mobile-app/src/services/NCAABaseballAPI.ts
export class NCAABaseballAPI {
  private baseUrl: string;
  private apiKey?: string;
  
  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }
  
  async getGames(params: GetGamesParams): Promise<Game[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const url = `${this.baseUrl}/ncaa/baseball/games?${queryString}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new NCAABaseballAPIError(response.status, await response.json());
    }
    
    const data = await response.json();
    return data.data.games;
  }
  
  async getBoxScore(gameId: string): Promise<BoxScore> {
    const url = `${this.baseUrl}/ncaa/baseball/games/${gameId}?include=boxscore`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    const data = await response.json();
    return data.data.boxScore;
  }
  
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'BlazeIntelligence-Mobile/1.0'
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }
}
```

### Offline-First Cache

```typescript
// /mobile-app/src/services/CollegeBaseballCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class CollegeBaseballCache {
  private static PREFIX = 'ncaa_baseball_';
  
  static async set(key: string, value: any, ttl: number = 3600) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000  // Convert to ms
    };
    
    await AsyncStorage.setItem(
      this.PREFIX + key, 
      JSON.stringify(item)
    );
  }
  
  static async get(key: string): Promise<any | null> {
    const raw = await AsyncStorage.getItem(this.PREFIX + key);
    
    if (!raw) return null;
    
    const item = JSON.parse(raw);
    const age = Date.now() - item.timestamp;
    
    // Return null if expired
    if (age > item.ttl) {
      await this.remove(key);
      return null;
    }
    
    return item.value;
  }
  
  static async remove(key: string) {
    await AsyncStorage.removeItem(this.PREFIX + key);
  }
  
  static async clear() {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(this.PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  }
}
```

---

## Testing Strategy

### Unit Tests

```javascript
// /tests/api/ncaa-baseball-api.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NCAABaseballAPI } from '../../austin-portfolio-deploy/api/ncaa-baseball-live-scores.js';

describe('NCAABaseballAPI', () => {
  let api;
  
  beforeEach(() => {
    api = new NCAABaseballAPI();
  });
  
  it('should fetch games for a specific date', async () => {
    const games = await api.getGames({ date: '2025-03-15' });
    
    expect(games).toBeInstanceOf(Array);
    expect(games[0]).toHaveProperty('id');
    expect(games[0]).toHaveProperty('teams');
  });
  
  it('should handle data source failures gracefully', async () => {
    // Mock NCAA source failure
    vi.spyOn(api, 'fetchFromNCAA').mockRejectedValue(new Error('503'));
    
    // Should fallback to D1Baseball
    const games = await api.getGames({ date: '2025-03-15' });
    
    expect(games).toBeInstanceOf(Array);
    expect(api.fetchFromD1Baseball).toHaveBeenCalled();
  });
  
  it('should merge data from multiple sources', async () => {
    const boxScore = await api.getBoxScore('ncaa-baseball-20250315-tex-okst');
    
    expect(boxScore.metadata.sources).toContain('ncaa');
    expect(boxScore.metadata.confidence).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests

```javascript
// /tests/integration/ncaa-baseball-flow.test.js
describe('NCAA Baseball Data Flow', () => {
  it('should fetch, cache, and serve game data', async () => {
    // 1. Fetch fresh data
    const games1 = await api.getGames({ date: '2025-03-15' });
    expect(games1).toHaveLength(127);
    
    // 2. Verify cached (should be faster)
    const start = Date.now();
    const games2 = await api.getGames({ date: '2025-03-15' });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(50);  // Cached should be <50ms
    expect(games2).toEqual(games1);
    
    // 3. Clear cache
    await cache.clear();
    
    // 4. Fetch again (should be slower)
    const start2 = Date.now();
    const games3 = await api.getGames({ date: '2025-03-15' });
    const duration2 = Date.now() - start2;
    
    expect(duration2).toBeGreaterThan(200);  // Uncached should be >200ms
  });
});
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| API Response (cached) | <100ms | <200ms | >500ms |
| API Response (uncached) | <500ms | <1000ms | >2000ms |
| Cache Hit Rate | >90% | >80% | <70% |
| Data Staleness | <1% | <3% | >5% |
| Error Rate | <0.1% | <0.5% | >1% |
| Availability | >99.9% | >99% | <99% |

### Load Testing

```javascript
// /tests/load/ncaa-baseball-load-test.js
import autocannon from 'autocannon';

const result = await autocannon({
  url: 'https://api.blazeintelligence.com/v1/ncaa/baseball/games',
  connections: 100,
  duration: 60,
  headers: {
    'Authorization': 'Bearer test_key'
  }
});

console.log(result);

// Expected output:
// Requests: 120,000
// Throughput: 2,000 req/s
// p50 Latency: 45ms
// p95 Latency: 180ms
// p99 Latency: 450ms
```

---

## Deployment Checklist

### Pre-Launch

- [ ] All API endpoints implemented and tested
- [ ] Data sources integrated with fallback logic
- [ ] Caching strategy implemented and validated
- [ ] Error handling and monitoring configured
- [ ] Legal review of scraping approach completed
- [ ] Rate limiting configured for all sources
- [ ] Performance benchmarks met
- [ ] Mobile SDK tested on iOS 15-17
- [ ] Documentation complete and published

### Launch Day

- [ ] Monitor data source health dashboards
- [ ] Alert channels configured (Slack, PagerDuty)
- [ ] On-call schedule established
- [ ] Rollback plan documented
- [ ] Status page updated (if applicable)

### Post-Launch

- [ ] Daily data quality reports
- [ ] Weekly performance reviews
- [ ] User feedback aggregation
- [ ] Scraper maintenance schedule
- [ ] Paid API evaluation and procurement

---

**Document Maintained By:** Blaze Intelligence Engineering Team  
**Next Review:** Post-MVP Launch (Month 6)  
**Questions:** Contact tech-lead@blazeintelligence.com

