#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const ESPN_SITE_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ESPN_CORE_BASE = 'https://sports.core.api.espn.com/v2/sports';
const ESPN_SEARCH_ENDPOINT = 'https://site.web.api.espn.com/apis/common/v3/search';

class EspnDataServer {
  constructor() {
    this.server = new Server(
      {
        name: 'espn-data-connector',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registerHandlers();
  }

  registerHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'getScoreboard',
          description:
            'Fetch live or historical scoreboard data for a specific sport and league from ESPN (supports date ranges, season filters, and weekly views).',
          inputSchema: {
            type: 'object',
            properties: {
              sport: {
                type: 'string',
                description: 'ESPN sport key, e.g. football, basketball, baseball',
              },
              league: {
                type: 'string',
                description: 'ESPN league key, e.g. nfl, nba, mlb, ncf',
              },
              date: {
                type: 'string',
                pattern: '^\\d{8}$',
                description: 'Single day in YYYYMMDD format (converted to the dates parameter).',
              },
              dates: {
                type: 'string',
                description:
                  'Explicit date or range string accepted by ESPN (YYYYMMDD or YYYYMMDD-YYYYMMDD) for historical lookups.',
              },
              season: {
                type: 'number',
                description: 'Season year (e.g. 2023).',
              },
              seasontype: {
                type: 'number',
                description: 'Season type (1=preseason, 2=regular season, 3=postseason).',
              },
              week: {
                type: 'number',
                description: 'Week number for football scoreboards.',
              },
              group: {
                type: 'string',
                description: 'Conference or group identifier used by certain leagues.',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of events to return.',
              },
            },
            required: ['sport', 'league'],
            additionalProperties: false,
          },
        },
        {
          name: 'getTeamData',
          description:
            'Aggregate current and historical team data including details, schedule, roster, statistics, and news.',
          inputSchema: {
            type: 'object',
            properties: {
              sport: {
                type: 'string',
                description: 'ESPN sport key, e.g. football, basketball, baseball',
              },
              league: {
                type: 'string',
                description: 'ESPN league key, e.g. nfl, nba, mlb, ncf',
              },
              teamId: {
                type: 'string',
                description: 'ESPN team identifier (numeric or slug).',
              },
              season: {
                type: 'number',
                description: 'Season year filter for schedule/statistics requests.',
              },
              seasontype: {
                type: 'number',
                description: 'Season type (1=pre, 2=regular, 3=post).',
              },
              include: {
                type: 'array',
                description:
                  'Which resources to include. Defaults to ["details","schedule","roster"].',
                items: {
                  type: 'string',
                  enum: ['details', 'schedule', 'roster', 'statistics', 'news', 'rankings'],
                },
              },
            },
            required: ['sport', 'league', 'teamId'],
            additionalProperties: false,
          },
        },
        {
          name: 'getEventSummary',
          description:
            'Fetch detailed recap information for a specific ESPN event/game, including historical events.',
          inputSchema: {
            type: 'object',
            properties: {
              sport: {
                type: 'string',
                description: 'ESPN sport key (e.g. football, basketball).',
              },
              league: {
                type: 'string',
                description: 'ESPN league key (e.g. nfl, nba, mlb).',
              },
              eventId: {
                type: 'string',
                description: 'ESPN event identifier.',
              },
              lang: {
                type: 'string',
                description: 'Optional language code (default en).',
              },
              region: {
                type: 'string',
                description: 'Optional region code (default us).',
              },
            },
            required: ['sport', 'league', 'eventId'],
            additionalProperties: false,
          },
        },
        {
          name: 'getAthleteBio',
          description:
            'Retrieve athlete biography, stats, and related links from ESPN core data services.',
          inputSchema: {
            type: 'object',
            properties: {
              sport: {
                type: 'string',
                description: 'Sport identifier (e.g. football, basketball).',
              },
              league: {
                type: 'string',
                description: 'League identifier (e.g. nfl, nba, mlb).',
              },
              athleteId: {
                type: 'string',
                description: 'ESPN athlete identifier.',
              },
              params: {
                type: 'object',
                description: 'Additional query parameters forwarded to the ESPN API.',
                additionalProperties: {
                  type: ['string', 'number', 'boolean'],
                },
              },
            },
            required: ['sport', 'league', 'athleteId'],
            additionalProperties: false,
          },
        },
        {
          name: 'searchEspnContent',
          description:
            'Use ESPN\'s public search API to find news, videos, and reference content across sports.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search phrase (e.g. player or team name).',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default 10).',
              },
              type: {
                type: 'string',
                description: 'Optional content type filter (e.g. news, video).',
              },
            },
            required: ['query'],
            additionalProperties: false,
          },
        },
        {
          name: 'getSeasonSchedule',
          description:
            'Pull a season schedule feed from ESPN\'s historical core database (team-specific or league wide).',
          inputSchema: {
            type: 'object',
            properties: {
              sport: {
                type: 'string',
                description: 'Sport identifier (e.g. football, basketball).',
              },
              league: {
                type: 'string',
                description: 'League identifier (e.g. nfl, nba, mlb, college-football).',
              },
              season: {
                type: 'number',
                description: 'Season year to retrieve.',
              },
              seasontype: {
                type: 'number',
                description: 'Season type (1=preseason, 2=regular, 3=postseason). Defaults to regular season.',
              },
              teamId: {
                type: 'string',
                description: 'Optional ESPN team identifier to filter schedule.',
              },
            },
            required: ['sport', 'league', 'season'],
            additionalProperties: false,
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      switch (name) {
        case 'getScoreboard':
          return this.getScoreboard(args);
        case 'getTeamData':
          return this.getTeamData(args);
        case 'getEventSummary':
          return this.getEventSummary(args);
        case 'getAthleteBio':
          return this.getAthleteBio(args);
        case 'searchEspnContent':
          return this.searchEspnContent(args);
        case 'getSeasonSchedule':
          return this.getSeasonSchedule(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  buildUrl(base, segments = [], query = {}) {
    const trimmedSegments = segments
      .filter(Boolean)
      .map((segment) => segment.toString().replace(/^\/+|\/+$/g, ''));
    const url = new URL(`${trimmedSegments.join('/')}`, `${base.replace(/\/$/, '')}/`);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    return url;
  }

  async fetchJson(url, { label } = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'espn-mcp-connector/1.0 (+https://github.com/)',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Request failed${label ? ` for ${label}` : ''} with ${response.status}: ${body.slice(0, 500)}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out${label ? ` for ${label}` : ''}`);
      }
      throw error;
    }
  }

  async safeFetchJson(url, options) {
    try {
      return await this.fetchJson(url, options);
    } catch (error) {
      return { error: error.message };
    }
  }

  formatResponse(data) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  formatError(error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  async getScoreboard(args) {
    try {
      const { sport, league, date, dates, season, seasontype, week, group, limit } = args;
      const query = { season, seasontype, week, group, limit };
      if (dates) {
        query.dates = dates;
      } else if (date) {
        query.dates = date;
      }

      const url = this.buildUrl(ESPN_SITE_BASE, [sport, league, 'scoreboard'], query);
      const data = await this.fetchJson(url, { label: 'ESPN scoreboard' });
      return this.formatResponse({ metadata: { sport, league, query }, data });
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getTeamData(args) {
    const { sport, league, teamId, season, seasontype, include } = args;
    const selected = Array.isArray(include) && include.length
      ? include
      : ['details', 'schedule', 'roster'];

    const query = { season, seasontype };
    const results = { sport, league, teamId, season, seasontype };

    const baseSegments = [sport, league, 'teams', teamId];

    const tasks = selected.map(async (resource) => {
      const segments = [...baseSegments];
      switch (resource) {
        case 'details':
          break;
        case 'schedule':
          segments.push('schedule');
          break;
        case 'roster':
          segments.push('roster');
          break;
        case 'statistics':
          segments.push('statistics');
          break;
        case 'news':
          segments.push('news');
          break;
        case 'rankings':
          segments.push('rankings');
          break;
        default:
          results[resource] = { error: `Unsupported resource: ${resource}` };
          return;
      }

      const url = this.buildUrl(ESPN_SITE_BASE, segments, resource === 'details' ? {} : query);
      results[resource] = await this.safeFetchJson(url, {
        label: `team ${resource}`,
      });
    });

    await Promise.all(tasks);
    return this.formatResponse(results);
  }

  async getEventSummary(args) {
    try {
      const { sport, league, eventId, lang = 'en', region = 'us' } = args;
      const url = this.buildUrl(ESPN_SITE_BASE, [sport, league, 'summary'], {
        event: eventId,
        lang,
        region,
      });
      const data = await this.fetchJson(url, { label: 'event summary' });
      return this.formatResponse({ sport, league, eventId, data });
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getAthleteBio(args) {
    try {
      const { sport, league, athleteId, params = {} } = args;
      const url = this.buildUrl(ESPN_CORE_BASE, [sport, 'leagues', league, 'athletes', athleteId], params);
      const data = await this.fetchJson(url, { label: 'athlete bio' });
      return this.formatResponse({ sport, league, athleteId, data });
    } catch (error) {
      return this.formatError(error);
    }
  }

  async searchEspnContent(args) {
    try {
      const { query, limit = 10, type } = args;
      const searchUrl = new URL(ESPN_SEARCH_ENDPOINT);
      searchUrl.searchParams.set('query', query);
      searchUrl.searchParams.set('limit', String(limit));
      if (type) {
        searchUrl.searchParams.set('type', type);
      }
      searchUrl.searchParams.set('page', '1');
      searchUrl.searchParams.set('mode', 'json');

      const data = await this.fetchJson(searchUrl, { label: 'ESPN search' });
      return this.formatResponse({ query, limit, type, data });
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getSeasonSchedule(args) {
    try {
      const { sport, league, season, seasontype = 2, teamId } = args;
      const segments = [sport, 'leagues', league, 'seasons', season, 'types', seasontype];
      if (teamId) {
        segments.push('teams', teamId, 'schedule');
      } else {
        segments.push('events');
      }
      const url = this.buildUrl(ESPN_CORE_BASE, segments);
      const data = await this.fetchJson(url, { label: 'season schedule' });
      return this.formatResponse({ sport, league, season, seasontype, teamId, data });
    } catch (error) {
      return this.formatError(error);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ESPN data MCP server is running on stdio transport');
  }
}

const server = new EspnDataServer();
server.run().catch((error) => {
  console.error('Failed to start ESPN MCP server:', error);
  process.exit(1);
});
