#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { parse } from 'csv-parse/sync';

const FOOTBALL_ROSTER_BASE = 'https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data/main/rosters/csv';
const FOOTBALL_SCHEDULE_BASE = 'https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data/main/schedules/csv';
const BASEBALL_ROSTER_URL = 'https://raw.githubusercontent.com/nathanblumenfeld/collegebaseball/main/collegebaseball/data/rosters_2012_2023_all.csv';
const BASEBALL_GAMES_URL = 'https://raw.githubusercontent.com/nathanblumenfeld/collegebaseball/main/collegebaseball/data/games_1992_2021.csv';
const GITHUB_SEARCH_ISSUES = 'https://api.github.com/search/issues';

const CLASS_TRANSLATIONS = {
  '1': 'FR',
  '2': 'SO',
  '3': 'JR',
  '4': 'SR',
  '5': 'GR',
  'FR': 'FR',
  'RFR': 'RFR',
  'RSFR': 'RFR',
  'SO': 'SO',
  'RSO': 'RSO',
  'JR': 'JR',
  'RSJR': 'RSJR',
  'SR': 'SR',
  'RSSR': 'RSSR',
  'GR': 'GR',
};

const POSITION_SIDES = {
  QB: 'Offense',
  RB: 'Offense',
  TB: 'Offense',
  HB: 'Offense',
  FB: 'Offense',
  WR: 'Offense',
  TE: 'Offense',
  OL: 'Offense',
  OT: 'Offense',
  OG: 'Offense',
  C: 'Offense',
  DL: 'Defense',
  DE: 'Defense',
  DT: 'Defense',
  NT: 'Defense',
  LB: 'Defense',
  ILB: 'Defense',
  OLB: 'Defense',
  DB: 'Defense',
  CB: 'Defense',
  S: 'Defense',
  FS: 'Defense',
  SS: 'Defense',
  STAR: 'Defense',
  NICKEL: 'Defense',
  PK: 'Special Teams',
  P: 'Special Teams',
  LS: 'Special Teams',
  K: 'Special Teams',
  KR: 'Special Teams',
  PR: 'Special Teams',
};

const DEFAULT_CACHE_TTL = 1000 * 60 * 15; // 15 minutes

function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === 't' || normalized === '1' || normalized === 'yes';
}

function parseHeightToInches(rawHeight) {
  const numeric = toNumber(rawHeight);
  if (numeric) return numeric;
  if (!rawHeight) return null;
  const text = String(rawHeight).trim();
  const match = text.match(/(\d+)[\-'](\d{1,2})/);
  if (match) {
    const feet = Number(match[1]);
    const inches = Number(match[2]);
    return feet * 12 + inches;
  }
  return null;
}

function formatHeight(inches) {
  const total = toNumber(inches);
  if (!total) return null;
  const feet = Math.floor(total / 12);
  const remainder = total % 12;
  return `${feet}'${remainder}\"`;
}

function computeDepthScore(player) {
  const classWeightMap = {
    FR: 1,
    RFR: 1.1,
    SO: 1.8,
    RSO: 2,
    JR: 2.6,
    RSJR: 2.8,
    SR: 3.2,
    RSSR: 3.4,
    GR: 3.8,
  };
  const classLabel = player.classification || 'FR';
  const classScore = classWeightMap[classLabel] ?? 1;
  const weightScore = player.weight_lbs ? Math.min(player.weight_lbs / 100, 3) : 1;
  const heightScore = player.height_inches ? Math.min(player.height_inches / 40, 3) : 1;
  const experienceBoost = player.experience ?? 0;
  return Number((classScore * 10 + weightScore + heightScore + experienceBoost).toFixed(3));
}

function attachRosterMetadata(player) {
  const heightInches = parseHeightToInches(player.height);
  const weightLbs = toNumber(player.weight);
  const classLabel = CLASS_TRANSLATIONS[player.year?.toUpperCase?.() ?? player.year] || CLASS_TRANSLATIONS[String(player.year || '').toUpperCase()] || null;
  const experience = classLabel
    ? ['FR', 'RFR'].includes(classLabel)
      ? 0
      : ['SO', 'RSO'].includes(classLabel)
      ? 1
      : ['JR', 'RSJR'].includes(classLabel)
      ? 2
      : ['SR', 'RSSR'].includes(classLabel)
      ? 3
      : 4
    : 0;
  const bmi = heightInches && weightLbs ? Number(((weightLbs / (heightInches * heightInches)) * 703).toFixed(2)) : null;
  const heightFormatted = formatHeight(heightInches);
  const enriched = {
    ...player,
    height_inches: heightInches,
    height_formatted: heightFormatted,
    weight_lbs: weightLbs,
    bmi,
    classification: classLabel,
    experience,
  };
  enriched.depth_score = computeDepthScore(enriched);
  return enriched;
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function summarizeSchedule(games) {
  const summary = {
    record: { wins: 0, losses: 0, ties: 0 },
    conferenceRecord: { wins: 0, losses: 0, ties: 0 },
    pointsFor: 0,
    pointsAgainst: 0,
    averageMargin: null,
    completedGames: [],
    upcomingGames: [],
    streak: null,
    lastFive: [],
    notableWins: [],
    closeLosses: [],
  };

  const resultsSequence = [];
  for (const game of games) {
    const { result, conferenceGame } = game;
    if (result.status === 'scheduled') {
      summary.upcomingGames.push(game);
      continue;
    }

    summary.completedGames.push(game);
    if (typeof result.margin === 'number') {
      summary.pointsFor += result.texasPoints ?? 0;
      summary.pointsAgainst += result.opponentPoints ?? 0;
    }

    if (result.outcome === 'W') {
      summary.record.wins += 1;
      if (conferenceGame) summary.conferenceRecord.wins += 1;
      if (typeof result.margin === 'number' && result.margin >= 14) {
        summary.notableWins.push(game);
      }
      resultsSequence.push('W');
    } else if (result.outcome === 'L') {
      summary.record.losses += 1;
      if (conferenceGame) summary.conferenceRecord.losses += 1;
      if (typeof result.margin === 'number' && Math.abs(result.margin) <= 7) {
        summary.closeLosses.push(game);
      }
      resultsSequence.push('L');
    } else {
      summary.record.ties += 1;
      if (conferenceGame) summary.conferenceRecord.ties += 1;
      resultsSequence.push('T');
    }
  }

  if (summary.completedGames.length > 0) {
    summary.averageMargin = Number(
      (
        (summary.pointsFor - summary.pointsAgainst) /
        summary.completedGames.length
      ).toFixed(2)
    );
  }

  if (resultsSequence.length > 0) {
    let streakType = resultsSequence.at(-1);
    let streakLength = 0;
    for (let i = resultsSequence.length - 1; i >= 0; i -= 1) {
      if (resultsSequence[i] === streakType) {
        streakLength += 1;
      } else {
        break;
      }
    }
    summary.streak = `${streakType}${streakLength}`;
    summary.lastFive = resultsSequence.slice(-5);
  }

  return summary;
}

function summarizeBaseballResults(games) {
  const summary = {
    record: { wins: 0, losses: 0, ties: 0 },
    runsScored: 0,
    runsAllowed: 0,
    averageMargin: null,
    bestWin: null,
    toughestLoss: null,
  };

  for (const game of games) {
    if (typeof game.runDifference !== 'number') continue;
    summary.runsScored += game.runsScored ?? 0;
    summary.runsAllowed += game.runsAllowed ?? 0;
    if (game.runDifference > 0) {
      summary.record.wins += 1;
      if (!summary.bestWin || game.runDifference > summary.bestWin.runDifference) {
        summary.bestWin = game;
      }
    } else if (game.runDifference < 0) {
      summary.record.losses += 1;
      if (!summary.toughestLoss || game.runDifference < summary.toughestLoss.runDifference) {
        summary.toughestLoss = game;
      }
    } else {
      summary.record.ties += 1;
    }
  }

  if (games.length > 0) {
    summary.averageMargin = Number(
      (
        (summary.runsScored - summary.runsAllowed) /
        games.length
      ).toFixed(2)
    );
  }

  return summary;
}

function baseballGameFromRow(row) {
  const runsScored = toNumber(row.runs_scored);
  const runsAllowed = toNumber(row.runs_allowed);
  const margin =
    typeof runsScored === 'number' && typeof runsAllowed === 'number'
      ? runsScored - runsAllowed
      : null;
  return {
    date: row.date,
    venueType: row.field,
    opponent: row.opponent,
    runsScored,
    runsAllowed,
    runDifference: margin,
    outcome: margin > 0 ? 'W' : margin < 0 ? 'L' : 'T',
    season: Number(row.season) || null,
    school: row.school,
  };
}

function formatFootballGame(row) {
  const homeTeam = row.home_team;
  const awayTeam = row.away_team;
  const homePoints = toNumber(row.home_points);
  const awayPoints = toNumber(row.away_points);
  const completed = toBoolean(row.completed);
  const isHome = homeTeam === 'Texas';
  const opponent = isHome ? awayTeam : homeTeam;
  const texasPoints = isHome ? homePoints : awayPoints;
  const opponentPoints = isHome ? awayPoints : homePoints;
  let outcome = 'scheduled';
  let margin = null;
  if (completed && texasPoints !== null && opponentPoints !== null) {
    margin = texasPoints - opponentPoints;
    if (margin > 0) outcome = 'W';
    else if (margin < 0) outcome = 'L';
    else outcome = 'T';
  }

  return {
    gameId: row.game_id,
    season: Number(row.season) || null,
    week: Number(row.week) || null,
    seasonType: row.season_type,
    date: row.start_date,
    venue: row.venue,
    location: row.neutral_site === 'TRUE' ? 'neutral' : isHome ? 'home' : 'away',
    opponent,
    conferenceGame: row.conference_game === 'TRUE',
    attendance: toNumber(row.attendance),
    excitementIndex: toNumber(row.excitement_index),
    notes: row.notes || null,
    result: {
      status: completed ? 'completed' : 'scheduled',
      outcome,
      texasPoints,
      opponentPoints,
      margin,
    },
  };
}

class LonghornsDataService {
  constructor() {
    this.cache = new Map();
  }

  getCached(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expires && entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  setCached(key, value, ttl = DEFAULT_CACHE_TTL) {
    this.cache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl : null,
    });
    return value;
  }

  async fetchText(url, { ttl = DEFAULT_CACHE_TTL, headers = {} } = {}) {
    const cached = this.getCached(url);
    if (cached) return cached;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'texas-longhorns-mcp-server',
        ...headers,
      },
    });
    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`Request failed for ${url}: ${response.status} ${details}`);
    }
    const text = await response.text();
    this.setCached(url, text, ttl);
    return text;
  }

  async fetchCSV(url, options = {}) {
    const cacheKey = `csv:${url}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    const text = await this.fetchText(url, options);
    const rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
    });
    return this.setCached(cacheKey, rows, options.ttl ?? DEFAULT_CACHE_TTL);
  }

  async getFootballRoster(season) {
    const resolvedSeason = season ?? new Date().getFullYear();
    const possibleSeasons = [resolvedSeason, resolvedSeason - 1, resolvedSeason - 2];
    let rosterRows = null;
    let usedSeason = null;
    for (const yr of possibleSeasons) {
      const url = `${FOOTBALL_ROSTER_BASE}/cfb_rosters_${yr}.csv`;
      try {
        const rows = await this.fetchCSV(url, { ttl: 1000 * 60 * 60 });
        rosterRows = rows.filter((row) => row.team === 'Texas');
        if (rosterRows.length > 0) {
          usedSeason = yr;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    if (!rosterRows || rosterRows.length === 0) {
      throw new Error('Unable to locate Texas roster data for the requested range.');
    }

    const enriched = rosterRows.map((row) =>
      attachRosterMetadata({
        athlete_id: row.athlete_id,
        first_name: row.first_name,
        last_name: row.last_name,
        position: row.position,
        height: row.height,
        weight: row.weight,
        jersey: row.jersey,
        year: row.year,
        home_city: row.home_city,
        home_state: row.home_state,
        home_country: row.home_country,
        headshot_url: row.headshot_url,
        hometown: [row.home_city, row.home_state, row.home_country].filter(Boolean).join(', '),
      })
    );

    return {
      season: usedSeason,
      count: enriched.length,
      players: enriched,
      source: `${FOOTBALL_ROSTER_BASE}/cfb_rosters_${usedSeason}.csv`,
    };
  }

  async getFootballDepthChart(season) {
    const rosterData = await this.getFootballRoster(season);
    const depthChart = {};
    for (const player of rosterData.players) {
      const position = player.position || 'ATH';
      if (!depthChart[position]) depthChart[position] = [];
      depthChart[position].push(player);
    }

    for (const position of Object.keys(depthChart)) {
      depthChart[position].sort((a, b) => b.depth_score - a.depth_score);
    }

    const positionGroups = {};
    for (const [position, players] of Object.entries(depthChart)) {
      const side = POSITION_SIDES[position] || 'Special Teams';
      if (!positionGroups[side]) positionGroups[side] = {};
      positionGroups[side][position] = players.slice(0, 5).map((player, index) => ({
        rank: index + 1,
        athlete_id: player.athlete_id,
        name: `${player.first_name} ${player.last_name}`.trim(),
        position: player.position,
        classification: player.classification,
        height: player.height_formatted,
        weight: player.weight_lbs,
        depth_score: player.depth_score,
      }));
    }

    return {
      season: rosterData.season,
      positionGroups,
      source: rosterData.source,
    };
  }

  async fetchFootballSeasonRows(season) {
    const url = `${FOOTBALL_SCHEDULE_BASE}/cfb_schedules_${season}.csv`;
    return this.fetchCSV(url, { ttl: 1000 * 60 * 60 });
  }

  async getFootballSeasonSchedule(season) {
    const resolvedSeason = season ?? new Date().getFullYear();
    const rows = await this.fetchFootballSeasonRows(resolvedSeason);
    const texasGames = rows.filter(
      (row) => row.home_team === 'Texas' || row.away_team === 'Texas'
    );
    const games = texasGames.map(formatFootballGame);
    const summary = summarizeSchedule(games);
    return {
      season: resolvedSeason,
      games,
      summary,
      source: `${FOOTBALL_SCHEDULE_BASE}/cfb_schedules_${resolvedSeason}.csv`,
    };
  }

  async getFootballSeasonStats(season) {
    const schedule = await this.getFootballSeasonSchedule(season);
    const games = schedule.games;
    const completed = games.filter((game) => game.result.status === 'completed');
    const totalGames = completed.length;
    const pointsFor = completed.reduce((sum, game) => sum + (game.result.texasPoints ?? 0), 0);
    const pointsAgainst = completed.reduce(
      (sum, game) => sum + (game.result.opponentPoints ?? 0),
      0
    );

    const homeGames = completed.filter((game) => game.location === 'home');
    const roadGames = completed.filter((game) => game.location === 'away');
    const neutralGames = completed.filter((game) => game.location === 'neutral');

    const countOutcome = (gamesArr, outcome) =>
      gamesArr.filter((game) => game.result.outcome === outcome).length;

    const stats = {
      season: schedule.season,
      gamesPlayed: totalGames,
      pointsFor,
      pointsAgainst,
      averagePointsFor: totalGames ? Number((pointsFor / totalGames).toFixed(2)) : null,
      averagePointsAgainst: totalGames ? Number((pointsAgainst / totalGames).toFixed(2)) : null,
      averageMargin: totalGames
        ? Number(((pointsFor - pointsAgainst) / totalGames).toFixed(2))
        : null,
      homeRecord: {
        wins: countOutcome(homeGames, 'W'),
        losses: countOutcome(homeGames, 'L'),
        ties: countOutcome(homeGames, 'T'),
      },
      roadRecord: {
        wins: countOutcome(roadGames, 'W'),
        losses: countOutcome(roadGames, 'L'),
        ties: countOutcome(roadGames, 'T'),
      },
      neutralRecord: {
        wins: countOutcome(neutralGames, 'W'),
        losses: countOutcome(neutralGames, 'L'),
        ties: countOutcome(neutralGames, 'T'),
      },
      closeGameRecord: {
        wins: completed.filter((g) => Math.abs(g.result.margin ?? 0) <= 7 && g.result.outcome === 'W').length,
        losses: completed.filter((g) => Math.abs(g.result.margin ?? 0) <= 7 && g.result.outcome === 'L').length,
      },
      blowoutWins: completed.filter((g) => (g.result.margin ?? 0) >= 21).length,
      blowoutLosses: completed.filter((g) => (g.result.margin ?? 0) <= -21).length,
      lastFive: completed.slice(-5),
      summary: schedule.summary,
      source: schedule.source,
    };

    return stats;
  }

  async getFootballMatchupHistory(opponent, { startSeason = 1997, endSeason = new Date().getFullYear() } = {}) {
    if (!opponent) throw new Error('Opponent is required for matchup history.');
    const normalizedOpponent = normalizeName(opponent);
    const results = [];
    for (let season = startSeason; season <= endSeason; season += 1) {
      try {
        const rows = await this.fetchFootballSeasonRows(season);
        for (const row of rows) {
          if (row.home_team !== 'Texas' && row.away_team !== 'Texas') continue;
          const opponentName = row.home_team === 'Texas' ? row.away_team : row.home_team;
          if (normalizeName(opponentName) !== normalizedOpponent) continue;
          const game = formatFootballGame(row);
          results.push(game);
        }
      } catch (error) {
        continue;
      }
    }

    if (results.length === 0) {
      return {
        opponent,
        startSeason,
        endSeason,
        meetings: [],
        record: { wins: 0, losses: 0, ties: 0 },
        averageMargin: null,
        largestWin: null,
        toughestLoss: null,
      };
    }

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let marginSum = 0;
    let countedGames = 0;
    let largestWin = null;
    let toughestLoss = null;

    for (const game of results) {
      if (game.result.margin !== null) {
        marginSum += game.result.margin;
        countedGames += 1;
        if (game.result.margin > 0) {
          wins += 1;
          if (!largestWin || game.result.margin > largestWin.result.margin) {
            largestWin = game;
          }
        } else if (game.result.margin < 0) {
          losses += 1;
          if (!toughestLoss || game.result.margin < toughestLoss.result.margin) {
            toughestLoss = game;
          }
        } else {
          ties += 1;
        }
      }
    }

    const averageMargin = countedGames ? Number((marginSum / countedGames).toFixed(2)) : null;

    return {
      opponent,
      startSeason,
      endSeason,
      meetings: results.sort((a, b) => (a.date || '').localeCompare(b.date || '')),
      record: { wins, losses, ties },
      averageMargin,
      largestWin,
      toughestLoss,
      lastMeeting: results.at(-1),
    };
  }

  async getBaseballRoster(season = 2023) {
    const rows = await this.fetchCSV(BASEBALL_ROSTER_URL, { ttl: 1000 * 60 * 60 });
    const filtered = rows.filter(
      (row) => row.school === 'Texas' && (!season || Number(row.season) === Number(season))
    );
    const players = filtered.map((row) => ({
      jersey: row.jersey,
      name: row.name,
      position: row.position,
      height: row.height || null,
      class_year: row.class_year || null,
      games_played: toNumber(row.games_played),
      games_started: toNumber(row.games_started),
      season: Number(row.season) || null,
    }));
    return {
      season: season ?? null,
      count: players.length,
      players,
      source: BASEBALL_ROSTER_URL,
    };
  }

  async getBaseballSeasonResults(season) {
    const rows = await this.fetchCSV(BASEBALL_GAMES_URL, { ttl: 1000 * 60 * 60 });
    const filtered = rows.filter(
      (row) => row.school === 'Texas' && (!season || Number(row.season) === Number(season))
    );
    const games = filtered.map(baseballGameFromRow);
    const summary = summarizeBaseballResults(games);
    return {
      season: season ?? null,
      games,
      summary,
      source: BASEBALL_GAMES_URL,
    };
  }

  async getBaseballMatchupHistory(opponent, { startSeason = 1992, endSeason = 2021 } = {}) {
    if (!opponent) throw new Error('Opponent is required for baseball matchup history.');
    const normalizedOpponent = normalizeName(opponent);
    const rows = await this.fetchCSV(BASEBALL_GAMES_URL, { ttl: 1000 * 60 * 60 });
    const games = rows
      .filter((row) => row.school === 'Texas')
      .filter((row) => normalizeName(row.opponent) === normalizedOpponent)
      .filter((row) => {
        const season = Number(row.season);
        return season >= startSeason && season <= endSeason;
      })
      .map(baseballGameFromRow);

    if (games.length === 0) {
      return {
        opponent,
        startSeason,
        endSeason,
        meetings: [],
        record: { wins: 0, losses: 0, ties: 0 },
        averageMargin: null,
        bestWin: null,
        toughestLoss: null,
      };
    }

    const summary = summarizeBaseballResults(games);
    return {
      opponent,
      startSeason,
      endSeason,
      meetings: games,
      record: summary.record,
      averageMargin: summary.averageMargin,
      bestWin: summary.bestWin,
      toughestLoss: summary.toughestLoss,
    };
  }

  async getLonghornsNews({ query = 'Texas Longhorns', days = 14, limit = 12 } = {}) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const q = `${query} created:>=${sinceDate}`;
    const url = `${GITHUB_SEARCH_ISSUES}?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=${Math.min(
      limit,
      30
    )}`;
    const text = await this.fetchText(url, {
      ttl: 1000 * 60 * 10,
      headers: { Accept: 'application/vnd.github+json' },
    });
    const payload = JSON.parse(text);
    const items = (payload.items || []).map((item) => ({
      title: item.title,
      url: item.html_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      comments: item.comments,
      repository: item.repository_url?.split('/').slice(-2).join('/') ?? null,
      snippet: item.body ? item.body.slice(0, 280) : null,
      type: item.pull_request ? 'pull_request' : item.html_url.includes('/discussions/') ? 'discussion' : 'issue',
    }));
    return {
      query,
      since: sinceDate,
      totalCount: payload.total_count,
      items,
      source: url,
    };
  }
}

class TexasLonghornsServer {
  constructor() {
    this.dataService = new LonghornsDataService();
    this.server = new Server(
      {
        name: 'texas-longhorns',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'getFootballRoster',
          description:
            'Fetch the Texas Longhorns football roster with height/weight metadata for a given season.',
          inputSchema: {
            type: 'object',
            properties: {
              season: {
                type: 'integer',
                description: 'Season year (e.g., 2025). Defaults to the current year.',
              },
            },
          },
        },
        {
          name: 'getFootballDepthChart',
          description: 'Builds a depth chart from the roster with ranking heuristics.',
          inputSchema: {
            type: 'object',
            properties: {
              season: { type: 'integer', description: 'Season year for the depth chart.' },
            },
          },
        },
        {
          name: 'getFootballSeasonSchedule',
          description: 'Retrieve the full season schedule, completed results, and upcoming games.',
          inputSchema: {
            type: 'object',
            properties: {
              season: { type: 'integer', description: 'Season year (e.g., 2025).' },
            },
          },
        },
        {
          name: 'getFootballSeasonStats',
          description:
            'Compute aggregate performance metrics (points, margins, situational records) for a season.',
          inputSchema: {
            type: 'object',
            properties: {
              season: { type: 'integer', description: 'Season year (e.g., 2024).' },
            },
          },
        },
        {
          name: 'getFootballMatchupHistory',
          description: 'Summarize the Longhorns historical record against a specific opponent.',
          inputSchema: {
            type: 'object',
            properties: {
              opponent: {
                type: 'string',
                description: 'Opponent name (e.g., Alabama).',
              },
              startSeason: {
                type: 'integer',
                description: 'Earliest season to include (default 1997).',
              },
              endSeason: {
                type: 'integer',
                description: 'Latest season to include (default current year).',
              },
            },
            required: ['opponent'],
          },
        },
        {
          name: 'getBaseballRoster',
          description: 'Retrieve the Texas baseball roster from the historical dataset (2012-2023).',
          inputSchema: {
            type: 'object',
            properties: {
              season: {
                type: 'integer',
                description: 'Season year between 2012 and 2023.',
              },
            },
          },
        },
        {
          name: 'getBaseballSeasonResults',
          description: 'Retrieve season results for Texas baseball (1992-2021 data coverage).',
          inputSchema: {
            type: 'object',
            properties: {
              season: {
                type: 'integer',
                description: 'Season year (1992-2021) to summarize.',
              },
            },
          },
        },
        {
          name: 'getBaseballMatchupHistory',
          description: 'Summarize baseball matchup history against a specific opponent.',
          inputSchema: {
            type: 'object',
            properties: {
              opponent: { type: 'string', description: 'Opponent name.' },
              startSeason: {
                type: 'integer',
                description: 'Earliest season to include (default 1992).',
              },
              endSeason: {
                type: 'integer',
                description: 'Latest season to include (default 2021).',
              },
            },
            required: ['opponent'],
          },
        },
        {
          name: 'getLonghornsNews',
          description:
            'Fetch recent GitHub discussions/issues mentioning the Longhorns to monitor news and chatter.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Custom search phrase (default "Texas Longhorns").',
              },
              days: {
                type: 'integer',
                description: 'Lookback window in days (default 14).',
              },
              limit: {
                type: 'integer',
                description: 'Maximum number of items to return (default 12).',
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      try {
        switch (name) {
          case 'getFootballRoster':
            return this.handleGetFootballRoster(args);
          case 'getFootballDepthChart':
            return this.handleGetFootballDepthChart(args);
          case 'getFootballSeasonSchedule':
            return this.handleGetFootballSeasonSchedule(args);
          case 'getFootballSeasonStats':
            return this.handleGetFootballSeasonStats(args);
          case 'getFootballMatchupHistory':
            return this.handleGetFootballMatchupHistory(args);
          case 'getBaseballRoster':
            return this.handleGetBaseballRoster(args);
          case 'getBaseballSeasonResults':
            return this.handleGetBaseballSeasonResults(args);
          case 'getBaseballMatchupHistory':
            return this.handleGetBaseballMatchupHistory(args);
          case 'getLonghornsNews':
            return this.handleGetLonghornsNews(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async handleGetFootballRoster(args) {
    const data = await this.dataService.getFootballRoster(args.season);
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetFootballDepthChart(args) {
    const data = await this.dataService.getFootballDepthChart(args.season);
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetFootballSeasonSchedule(args) {
    const data = await this.dataService.getFootballSeasonSchedule(args.season);
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetFootballSeasonStats(args) {
    const data = await this.dataService.getFootballSeasonStats(args.season);
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetFootballMatchupHistory(args) {
    const data = await this.dataService.getFootballMatchupHistory(args.opponent, {
      startSeason: args.startSeason,
      endSeason: args.endSeason,
    });
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetBaseballRoster(args) {
    const data = await this.dataService.getBaseballRoster(args.season);
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetBaseballSeasonResults(args) {
    const data = await this.dataService.getBaseballSeasonResults(args.season);
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetBaseballMatchupHistory(args) {
    const data = await this.dataService.getBaseballMatchupHistory(args.opponent, {
      startSeason: args.startSeason,
      endSeason: args.endSeason,
    });
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async handleGetLonghornsNews(args) {
    const data = await this.dataService.getLonghornsNews({
      query: args.query,
      days: args.days,
      limit: args.limit,
    });
    return {
      content: [
        {
          type: 'json',
          json: data,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Texas Longhorns MCP server listening on stdio');
  }
}

const server = new TexasLonghornsServer();
server.run().catch((error) => {
  console.error('Failed to start Texas Longhorns MCP server:', error);
  process.exit(1);
});

