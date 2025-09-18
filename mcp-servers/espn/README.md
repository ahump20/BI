# ESPN MCP Connector

This Model Context Protocol (MCP) server exposes curated tools that make it easy for ChatGPT to pull data from ESPN's public web APIs along with season-level historical datasets. The connector wraps the most useful ESPN endpoints behind a consistent JSON interface and is safe to call directly from ChatGPT when researching games, teams, and athletes.

## Available tools

| Tool | Purpose |
| ---- | ------- |
| `getScoreboard` | Retrieve live or historical scoreboard feeds for any supported sport/league. Supports single dates, date ranges, season filters, and weekly views. |
| `getTeamData` | Aggregate team details, schedules, rosters, statistics, rankings, and news in one call. |
| `getEventSummary` | Pull full event recaps, play-by-play capsules, and box score metadata for any ESPN event ID. |
| `getAthleteBio` | Access the ESPN Core athlete service to view biographies, metrics, and linked resources. |
| `searchEspnContent` | Run ESPN's unified search endpoint to surface articles, video, and reference pages. |
| `getSeasonSchedule` | Use ESPN's historical database to retrieve season schedules for a league or a specific team. |

## Running the server

```bash
node mcp-servers/espn/index.js
```

The server speaks MCP over stdio so it can be launched directly by the OpenAI Desktop App or by the `@modelcontextprotocol/inspector` CLI for development.

## Usage guidance

- **Sports & league keys** follow ESPN's URL structure, such as `football/nfl`, `basketball/nba`, `college-football/fbs`, or `baseball/mlb`.
- **Historical lookups** can be performed with the `dates` parameter on `getScoreboard` (`YYYYMMDD` or `YYYYMMDD-YYYYMMDD`) or by using `getSeasonSchedule` with a `season` year and optional `teamId`.
- **Event IDs** and **team IDs** can be copied from ESPN URLs. For example, `https://www.espn.com/nfl/team/_/name/kc/kansas-city-chiefs` uses team ID `12`.
- Every tool returns raw JSON from ESPN. Responses include a small metadata envelope so downstream consumers can tell which parameters were used.

> ⚠️ ESPN's public APIs are intended for personal, non-commercial use. Always confirm that downstream applications comply with ESPN's terms of service before using this connector in production.
