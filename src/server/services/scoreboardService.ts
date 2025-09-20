import { z } from 'zod';

import { fallbackScoreboards } from '../data/scoreboardFallback.js';

const SPORT_PATHS = {
  baseball: 'baseball/mlb',
  football: 'football/nfl',
  basketball: 'basketball/nba',
  'track-field': 'olympics/trackandfield',
} as const satisfies Record<string, string>;

export type SportKey = keyof typeof SPORT_PATHS;

type Fetcher = typeof fetch;

type CacheEntry = {
  expiresAt: number;
  payload: ScoreboardResponse;
};

export type ScoreboardCompetitor = {
  id: string;
  name: string;
  abbreviation?: string;
  score?: number;
  homeAway: 'home' | 'away';
};

export type ScoreboardEvent = {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: {
    state: 'pre' | 'in' | 'post' | 'final' | 'unknown';
    detail?: string;
  };
  competitors: ScoreboardCompetitor[];
};

export type ScoreboardResponse = {
  sport: SportKey;
  events: ScoreboardEvent[];
  fetchedAt: string;
  source: 'espn' | 'fallback';
};

export type ScoreboardCacheSummary = {
  sport: SportKey;
  lastUpdated?: string;
  expiresAt?: string;
  source?: ScoreboardResponse['source'];
};

export type ScoreboardServiceOptions = {
  cacheTtlMs?: number;
  fetchTimeoutMs?: number;
  fetcher?: Fetcher;
  cacheMap?: Map<SportKey, CacheEntry>;
};

export class InvalidSportError extends Error {
  constructor(sport: string) {
    super(`Unsupported sport: ${sport}`);
  }
}

export class ScoreboardFetchError extends Error {}

const ScoreboardSchema = z.object({
  events: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        shortName: z.string().default(''),
        date: z.string(),
        competitions: z
          .array(
            z.object({
              id: z.string(),
              status: z
                .object({
                  type: z
                    .object({
                      state: z.enum(['pre', 'in', 'post', 'final']).optional(),
                      detail: z.string().optional(),
                      shortDetail: z.string().optional(),
                      description: z.string().optional(),
                    })
                    .optional(),
                })
                .optional(),
              competitors: z.array(
                z.object({
                  id: z.string().optional(),
                  score: z.string().optional(),
                  homeAway: z.enum(['home', 'away']).default('home'),
                  team: z
                    .object({
                      id: z.string().optional(),
                      displayName: z.string().optional(),
                      name: z.string().optional(),
                      abbreviation: z.string().optional(),
                    })
                    .optional(),
                }),
              ),
            }),
          )
          .min(1),
      }),
    )
    .default([]),
});

const DEFAULT_CACHE_TTL = 15 * 60 * 1000;
const DEFAULT_FETCH_TIMEOUT = 8000;

export class ScoreboardService {
  static supportedSports(): SportKey[] {
    return Object.keys(SPORT_PATHS) as SportKey[];
  }

  private readonly cache: Map<SportKey, CacheEntry>;
  private readonly cacheTtlMs: number;
  private readonly fetchTimeoutMs: number;
  private readonly fetcher: Fetcher;

  constructor(options: ScoreboardServiceOptions = {}) {
    this.cache = options.cacheMap ?? new Map<SportKey, CacheEntry>();
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL;
    this.fetchTimeoutMs = options.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT;
    this.fetcher = options.fetcher ?? fetch;
  }

  async getScoreboard(sport: SportKey): Promise<ScoreboardResponse> {
    const now = Date.now();
    const cached = this.cache.get(sport);
    if (cached && cached.expiresAt > now) {
      return cached.payload;
    }

    try {
      const payload = await this.fetchFromEspn(sport);
      this.cache.set(sport, {
        expiresAt: now + this.cacheTtlMs,
        payload,
      });
      return payload;
    } catch (error) {
      const fallback = this.buildFallbackResponse(sport);
      this.cache.set(sport, {
        expiresAt: now + this.cacheTtlMs,
        payload: fallback,
      });
      if (error instanceof ScoreboardFetchError) {
        console.warn(error.message);
      } else {
        console.warn('Unexpected scoreboard error', error);
      }
      return fallback;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSummary(): ScoreboardCacheSummary[] {
    return ScoreboardService.supportedSports().map((sport) => {
      const entry = this.cache.get(sport);
      if (!entry) {
        return { sport };
      }
      return {
        sport,
        lastUpdated: entry.payload.fetchedAt,
        expiresAt: new Date(entry.expiresAt).toISOString(),
        source: entry.payload.source,
      } satisfies ScoreboardCacheSummary;
    });
  }

  private async fetchFromEspn(sport: SportKey): Promise<ScoreboardResponse> {
    const path = SPORT_PATHS[sport];
    if (!path) {
      throw new InvalidSportError(sport);
    }

    const url = `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.fetchTimeoutMs);

    try {
      const response = await this.fetcher(url, {
        headers: {
          'User-Agent': 'Blaze-Intelligence-Scoreboard/1.0',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ScoreboardFetchError(`ESPN responded with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      const parsed = ScoreboardSchema.safeParse(payload);
      if (!parsed.success) {
        throw new ScoreboardFetchError('ESPN payload failed validation');
      }

      const events = parsed.data.events
        .map((event) => this.transformEvent(event))
        .filter((event): event is ScoreboardEvent => event !== undefined);

      if (events.length === 0) {
        throw new ScoreboardFetchError('No events returned from ESPN');
      }

      return {
        sport,
        events,
        fetchedAt: new Date().toISOString(),
        source: 'espn',
      } satisfies ScoreboardResponse;
    } catch (error) {
      if (error instanceof InvalidSportError || error instanceof ScoreboardFetchError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ScoreboardFetchError('Invalid scoreboard payload');
      }
      if ((error as Error).name === 'AbortError') {
        throw new ScoreboardFetchError('ESPN scoreboard request timed out');
      }
      throw new ScoreboardFetchError((error as Error).message);
    } finally {
      clearTimeout(timeout);
    }
  }

  private transformEvent(event: z.infer<typeof ScoreboardSchema>['events'][number]): ScoreboardEvent | undefined {
    const competition = event.competitions.at(0);
    if (!competition) {
      return undefined;
    }

    const status = competition.status?.type;
    const competitors = competition.competitors
      .map((competitor) => {
        const team = competitor.team;
        const teamName = team?.displayName ?? team?.name;
        if (!teamName) {
          return undefined;
        }
        const numericScore = competitor.score ? Number.parseInt(competitor.score, 10) : undefined;
        return {
          id: team?.id ?? competitor.id ?? `${event.id}-${competitor.homeAway}`,
          name: teamName,
          abbreviation: team?.abbreviation,
          score: Number.isNaN(numericScore) ? undefined : numericScore,
          homeAway: competitor.homeAway,
        } satisfies ScoreboardCompetitor;
      })
      .filter((competitor): competitor is ScoreboardCompetitor => competitor !== undefined);

    if (competitors.length === 0) {
      return undefined;
    }

    return {
      id: event.id,
      name: event.name,
      shortName: event.shortName || event.name,
      date: event.date,
      status: {
        state: status?.state ?? 'unknown',
        detail: status?.detail ?? status?.shortDetail ?? status?.description,
      },
      competitors,
    } satisfies ScoreboardEvent;
  }

  private buildFallbackResponse(sport: SportKey): ScoreboardResponse {
    const events = fallbackScoreboards[sport];
    if (!events) {
      throw new InvalidSportError(sport);
    }

    return {
      sport,
      events,
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
    } satisfies ScoreboardResponse;
  }
}
