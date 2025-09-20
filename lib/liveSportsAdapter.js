import RedisCacheManager from '../services/redis-cache-manager.js';
import {
  mapScoreboardGame,
  normalizeScoreboardParams,
  normalizeStandings,
  normalizeStandingsParams,
} from './liveSportsUtils.js';

const ESPN_SCOREBOARD_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';
const ESPN_STANDINGS_BASE_URL = 'https://site.web.api.espn.com/apis/v2/sports';
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.ESPN_API_TIMEOUT_MS ?? '', 10);
const SCOREBOARD_TIMEOUT_MS = Number.isFinite(DEFAULT_TIMEOUT_MS) && DEFAULT_TIMEOUT_MS > 0 ? DEFAULT_TIMEOUT_MS : 8000;
const DEFAULT_USER_AGENT = 'Blaze Intelligence LiveSports/1.0';

const MLB_IDENTIFIERS = { sport: 'baseball', league: 'mlb' };
const NFL_IDENTIFIERS = { sport: 'football', league: 'nfl' };

const STANDINGS_DEFAULT_TTL = 1800;

class LiveSportsAdapter {
  constructor(options = {}) {
    this.cache = new RedisCacheManager({ db: options.redisDb ?? 5, ...(options.redis ?? {}) });
    this.cacheReady = false;
    this.timeoutMs = options.timeoutMs ?? SCOREBOARD_TIMEOUT_MS;
    this.scoreboardTtl = options.scoreboardTtl ?? this.cache.default_ttl?.scoreboard ?? 15;
    this.standingsTtl = options.standingsTtl ?? this.cache.default_ttl?.standings ?? STANDINGS_DEFAULT_TTL;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }
    await this.ensureCache();
    this.initialized = true;
    this.warmScoreboards().catch((error) => {
      console.warn('⚠️  Unable to warm scoreboard cache:', error.message);
    });
  }

  async ensureCache() {
    if (this.cacheReady) {
      return;
    }
    await this.cache.connect();
    this.cacheReady = true;
  }

  async warmScoreboards() {
    await Promise.allSettled([
      this.getMLBScoreboard(),
      this.getNFLScoreboard(),
    ]);
  }

  buildScoreboardUrl({ sport, league }, params = {}) {
    const url = new URL(`${ESPN_SCOREBOARD_BASE_URL}/${sport}/${league}/scoreboard`);
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  buildStandingsUrl({ sport, league }, params = {}) {
    const url = new URL(`${ESPN_STANDINGS_BASE_URL}/${sport}/${league}/standings`);
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  async fetchJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`ESPN API request failed (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`ESPN API request timed out after ${this.timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async fetchScoreboard(identifiers, params = {}) {
    await this.ensureCache();
    const normalizedParams = normalizeScoreboardParams(params);
    const cacheKey = `${identifiers.sport}:${identifiers.league}`;

    const cached = await this.cache.get('scoreboard', cacheKey, normalizedParams);
    if (cached) {
      return cached;
    }

    const url = this.buildScoreboardUrl(identifiers, normalizedParams);
    const payload = await this.fetchJson(url);
    const events = Array.isArray(payload?.events) ? payload.events : [];
    const normalizedEvents = events
      .map((event) => mapScoreboardGame(identifiers.league, event))
      .filter((event) => event !== null);

    const scoreboard = {
      league: identifiers.league.toUpperCase(),
      fetched_at: new Date().toISOString(),
      day: payload?.day?.date ?? null,
      events: normalizedEvents,
    };

    await this.cache.set('scoreboard', cacheKey, scoreboard, this.scoreboardTtl, normalizedParams);
    return scoreboard;
  }

  async fetchStandings(identifiers, params = {}) {
    await this.ensureCache();
    const normalizedParams = normalizeStandingsParams(params);
    const cacheKey = `${identifiers.sport}:${identifiers.league}:standings`;

    const cached = await this.cache.get('standings', cacheKey, normalizedParams);
    if (cached) {
      return cached;
    }

    const url = this.buildStandingsUrl(identifiers, normalizedParams);
    const payload = await this.fetchJson(url);
    const standings = normalizeStandings(identifiers.league, payload);

    await this.cache.set('standings', cacheKey, standings, this.standingsTtl, normalizedParams);
    return standings;
  }

  async getMLBScoreboard(date) {
    const params = date ? { dates: date } : {};
    return this.fetchScoreboard(MLB_IDENTIFIERS, params);
  }

  async getNFLScoreboard(week) {
    const params = week ? { week } : {};
    return this.fetchScoreboard(NFL_IDENTIFIERS, params);
  }

  async getMLBGameCount(date) {
    const scoreboard = await this.getMLBScoreboard(date);
    return scoreboard.events.length;
  }

  async getNFLGameCount(week) {
    const scoreboard = await this.getNFLScoreboard(week);
    return scoreboard.events.length;
  }

  async getMLBLiveScore(id, date) {
    const scoreboard = await this.getMLBScoreboard(date);
    const game = scoreboard.events.find((event) => event.id === String(id));
    if (!game) {
      throw new Error(`MLB game ${id} not found`);
    }

    const mlb = game.mlb ?? {};
    return {
      away_team: game.away?.name ?? null,
      away_team_id: game.away?.id ?? null,
      away_score: game.away?.score ?? null,
      home_team: game.home?.name ?? null,
      home_team_id: game.home?.id ?? null,
      home_score: game.home?.score ?? null,
      inning: mlb.inning ?? game.status.shortDetail ?? game.status.detail ?? null,
      current_state: game.status.detail ?? game.status.shortDetail ?? game.status.state ?? null,
      first_base: Boolean(mlb.onFirst),
      second_base: Boolean(mlb.onSecond),
      third_base: Boolean(mlb.onThird),
      balls: mlb.balls ?? null,
      strikes: mlb.strikes ?? null,
      outs: mlb.outs ?? null,
      last_play: mlb.lastPlay ?? null,
      updated_at: scoreboard.fetched_at,
    };
  }

  async getNFLLiveScore(id, week) {
    const scoreboard = await this.getNFLScoreboard(week);
    const game = scoreboard.events.find((event) => event.id === String(id));
    if (!game) {
      throw new Error(`NFL game ${id} not found`);
    }

    const nfl = game.nfl ?? {};
    return {
      away_team: game.away?.name ?? null,
      away_team_id: game.away?.id ?? null,
      away_score: game.away?.score ?? null,
      away_record: game.away?.record ?? null,
      home_team: game.home?.name ?? null,
      home_team_id: game.home?.id ?? null,
      home_score: game.home?.score ?? null,
      home_record: game.home?.record ?? null,
      display_game_state: game.status.shortDetail ?? game.status.detail ?? null,
      game_state: game.status.state ?? null,
      possession_info: nfl.possession ?? null,
      clock: nfl.clock ?? null,
      down_distance_text: nfl.downDistanceText ?? null,
      last_play: nfl.lastPlay ?? null,
      updated_at: scoreboard.fetched_at,
    };
  }

  async getMLBStandings(options = {}) {
    return this.fetchStandings(MLB_IDENTIFIERS, options);
  }

  async getAllLiveScores() {
    const results = await Promise.allSettled([
      this.getMLBScoreboard(),
      this.getNFLScoreboard(),
    ]);

    const payload = {
      generated_at: new Date().toISOString(),
      leagues: [],
    };

    const [mlbResult, nflResult] = results;

    if (mlbResult.status === 'fulfilled') {
      payload.leagues.push({ league: 'MLB', events: mlbResult.value.events });
    } else {
      payload.leagues.push({ league: 'MLB', error: 'unavailable' });
    }

    if (nflResult.status === 'fulfilled') {
      payload.leagues.push({ league: 'NFL', events: nflResult.value.events });
    } else {
      payload.leagues.push({ league: 'NFL', error: 'unavailable' });
    }

    return payload;
  }
}

export default LiveSportsAdapter;
export {
  mapScoreboardGame,
  normalizeScoreboardParams,
  normalizeStandings,
  normalizeStandingsParams,
} from './liveSportsUtils.js';
