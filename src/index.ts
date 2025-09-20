/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import healthHandler from '../api/health.js';
import { ServiceError, ValidationError } from './errors';
import { calculateNilValuation } from './features/nilValuation';
import { computeChampionshipProbabilities } from './features/championshipProbability';
import { buildCharacterAssessment } from './features/characterAssessment';
import { requireAuth, getAuthenticatedUser, type BlazeVariables } from './security/auth0';
import { getSentryClient } from './security/sentry';
import type { Bindings } from './types';

const ORIGINS = {
  marketing: 'https://blaze-io.pages.dev',
  hq: 'https://blaze-intelligence.netlify.app',
  vision: 'https://blaze-vision-intelligence.pages.dev',
  pub: 'https://austin-humphrey-public.pages.dev',
};

const app = new Hono<{ Bindings: Bindings; Variables: BlazeVariables }>();
const requireUser = requireAuth();
type BlazeContext = Context<{ Bindings: Bindings; Variables: BlazeVariables }>;

const parseAllowedOrigins = (value?: string) =>
  new Set(
    (value ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
  );

async function readJsonBody(c: BlazeContext): Promise<unknown> {
  try {
    return await c.req.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON body', {
      message: error instanceof Error ? error.message : 'Unable to parse JSON',
    });
  }
}

async function captureError(c: BlazeContext, error: unknown, scope: string) {
  const sentry = getSentryClient(c.env);
  if (!sentry) {
    return;
  }
  const user = getAuthenticatedUser(c);
  await sentry.captureException(error, {
    tags: { scope },
    user: user ? { id: user.sub, email: user.email } : undefined,
    request: { method: c.req.method, url: c.req.url },
  });
}

async function respondWithError(c: BlazeContext, error: unknown, scope: string) {
  if (error instanceof ServiceError) {
    await captureError(c, error, scope);
    return c.json({ error: error.message, code: error.code, details: error.details }, error.status);
  }
  console.error(scope, error);
  await captureError(c, error, scope);
  return c.json({ error: 'Internal server error' }, 500);
}

app.use('*', async (c, next) => {
  const allowedOrigins = parseAllowedOrigins(c.env.ALLOWED_ORIGINS);
  const requestOrigin = c.req.header('Origin');

  if (requestOrigin && allowedOrigins.size && !allowedOrigins.has(requestOrigin)) {
    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
    return c.json({ error: 'Origin not allowed' }, 403);
  }

  const handler = cors({
    origin: (origin) => {
      if (!origin) {
        return '';
      }
      if (!allowedOrigins.size || allowedOrigins.has(origin)) {
        return origin;
      }
      return '';
    },
    allowMethods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
    allowHeaders: ['Content-Type', 'Authorization', 'CF-Access-Jwt-Assertion'],
    credentials: true,
  });

  return handler(c, next);
});

app.use('*', async (c, next) => {
  await next();
  const headers = c.res.headers;
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
});

app.onError(async (err, c) => {
  console.error('Unhandled Worker error', err);
  await captureError(c, err, 'worker');

  if (err instanceof ServiceError) {
    return c.json({ error: err.message, code: err.code, details: err.details }, err.status);
  }

  return c.json({ error: 'Internal server error' }, 500);
});

const nilSummaryCache = cache({ cacheName: 'api', cacheControl: 'max-age=15' });
const scoreboardCache = cache({ cacheName: 'api', cacheControl: 'max-age=5' });
const oddsCache = cache({ cacheName: 'api', cacheControl: 'max-age=15' });

const SCOREBOARD_DEFAULT_LIMIT = 20;
const SCOREBOARD_MAX_LIMIT = 50;
const ODDS_DEFAULT_LIMIT = 40;
const ODDS_MAX_LIMIT = 100;
const SCOREBOARD_STREAM_INTERVAL = 2000;
const scoreboardEncoder = new TextEncoder();

const marketingProxy = createProxy(ORIGINS.marketing);
const hqProxy = createProxy(ORIGINS.hq, '/hq');
const visionProxy = createProxy(ORIGINS.vision, '/vision');
const publicProxy = createProxy(ORIGINS.pub, '/public');

// --------- Experience routing ---------
app.all('/', marketingProxy);
app.all('/hq', hqProxy);
app.all('/hq/*', hqProxy);
app.all('/vision', visionProxy);
app.all('/vision/*', visionProxy);
app.all('/public', publicProxy);
app.all('/public/*', publicProxy);

// --------- Unified API ---------
app.get('/api/health', (c) => {
  return healthHandler(c.req.raw, c.env, c.executionCtx);
});

app.get('/api/v1/nil/summary', nilSummaryCache, nilSummaryHandler);

app.post('/api/v1/nil/valuation', requireUser, async (c) => {
  try {
    const payload = await readJsonBody(c);
    const result = await calculateNilValuation(c.env, payload);
    return c.json(result);
  } catch (error) {
    return respondWithError(c, error, 'nil_valuation');
  }
});

app.post('/api/v1/championship/probability', requireUser, async (c) => {
  try {
    const payload = await readJsonBody(c);
    const result = await computeChampionshipProbabilities(c.env, payload);
    return c.json(result);
  } catch (error) {
    return respondWithError(c, error, 'championship_probability');
  }
});

app.post('/api/v1/character/assessment', requireUser, async (c) => {
  try {
    const payload = await readJsonBody(c);
    const result = await buildCharacterAssessment(c.env, payload);
    return c.json(result);
  } catch (error) {
    return respondWithError(c, error, 'character_assessment');
  }
});

app.get('/api/v1/scoreboard', scoreboardCache, (c) => scoreboardHandler(c));
app.get('/api/scoreboard/ncaa', scoreboardCache, (c) =>
  scoreboardHandler(c, { league: 'NCAA' })
);

app.get('/api/v1/scoreboard/stream', scoreboardStreamHandler);

app.get('/api/v1/odds', oddsCache, (c) => oddsHandler(c));
app.get('/api/odds/nfl', oddsCache, (c) => oddsHandler(c, { league: 'NFL' }));

type ScoreboardQueryOptions = {
  league?: string | null;
  team?: string | null;
  limit?: number;
};

type OddsQueryOptions = {
  league?: string | null;
  limit?: number;
};

type NilSummaryRow = {
  conference: string | null;
  athlete_count: number | string | null;
  total_nil: number | string | null;
};

type ScoreboardRow = {
  id: string;
  league: string | null;
  start: string | null;
  status: string | null;
  home_id: string | null;
  away_id: string | null;
  home_score: number | string | null;
  away_score: number | string | null;
  home_team_name: string | null;
  away_team_name: string | null;
};

type ScoreboardGame = {
  id: string;
  league: string | null;
  home_team: string | null;
  away_team: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_points: number | null;
  away_points: number | null;
  status: string | null;
  start_time: string | null;
  start_date: string | null;
  updated_at: string;
};

type OddsRow = {
  game_id: string;
  book: string | null;
  moneyline_home: number | string | null;
  moneyline_away: number | string | null;
  spread: number | string | null;
  total: number | string | null;
  ts: string | null;
  league: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  home_id: string | null;
  away_id: string | null;
};

type OddsLine = {
  game_id: string;
  league: string | null;
  book: string | null;
  home_team: string | null;
  away_team: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  moneyline_home: number | null;
  moneyline_away: number | null;
  spread: number | null;
  total: number | null;
  ts: string | null;
};

function getPrimaryDatabase(env: Bindings): D1Database | undefined {
  return env.DB ?? env.BLAZE_DB;
}

function sanitizeLimit(
  value: string | null | undefined,
  fallback: number,
  max: number,
  min = 1
): number {
  const parsed = value != null ? Number(value) : NaN;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const floored = Math.floor(parsed);
  if (!Number.isFinite(floored)) {
    return fallback;
  }
  return Math.min(Math.max(floored, min), max);
}

function resolveLimit(limit: number | undefined, fallback: number, max: number): number {
  const candidate = typeof limit === 'number' && Number.isFinite(limit) ? limit : fallback;
  const floored = Math.floor(candidate);
  if (!Number.isFinite(floored)) {
    return fallback;
  }
  return Math.min(Math.max(floored, 1), max);
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

function toNumberWithFallback(value: unknown, fallback = 0): number {
  const numeric = toNullableNumber(value);
  return numeric ?? fallback;
}

async function nilSummaryHandler(c: BlazeContext) {
  const db = getPrimaryDatabase(c.env);
  if (!db) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  try {
    const conferences = await queryNilSummary(db);
    return c.json({ conferences });
  } catch (error) {
    console.error('NIL summary query failed', error);
    await captureError(c, error, 'nil_summary');
    return c.json({ error: 'Unable to load NIL summary' }, 500);
  }
}

async function queryNilSummary(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT
          COALESCE(teams.conference, 'Independent') AS conference,
          COUNT(DISTINCT players.id) AS athlete_count,
          SUM(COALESCE(players.nil_est, 0)) AS total_nil
        FROM players
        LEFT JOIN teams ON teams.id = players.team_id
        GROUP BY conference
        ORDER BY total_nil DESC`
    )
    .all<NilSummaryRow>();

  return (results ?? []).map((row) => ({
    conference: row.conference ?? 'Independent',
    athlete_count: toNumberWithFallback(row.athlete_count, 0),
    total_nil: toNumberWithFallback(row.total_nil, 0),
  }));
}

async function scoreboardHandler(
  c: BlazeContext,
  overrides: ScoreboardQueryOptions = {}
) {
  const db = getPrimaryDatabase(c.env);
  if (!db) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  const url = new URL(c.req.url);
  const league = overrides.league ?? url.searchParams.get('league');
  const team = overrides.team ?? url.searchParams.get('team');
  const fallbackLimit = sanitizeLimit(
    url.searchParams.get('limit'),
    SCOREBOARD_DEFAULT_LIMIT,
    SCOREBOARD_MAX_LIMIT
  );
  const limit = resolveLimit(overrides.limit, fallbackLimit, SCOREBOARD_MAX_LIMIT);

  try {
    const games = await queryScoreboard(db, { league, team, limit });
    return c.json({ games });
  } catch (error) {
    console.error('Scoreboard query failed', error);
    await captureError(c, error, 'scoreboard_query');
    return c.json({ error: 'Unable to load scoreboard' }, 500);
  }
}

async function scoreboardStreamHandler(c: BlazeContext) {
  const db = getPrimaryDatabase(c.env);
  if (!db) {
    return new Response('Database not configured', { status: 503 });
  }

  const url = new URL(c.req.url);
  const league = url.searchParams.get('league');
  const team = url.searchParams.get('team');
  const limit = sanitizeLimit(
    url.searchParams.get('limit'),
    SCOREBOARD_DEFAULT_LIMIT,
    SCOREBOARD_MAX_LIMIT
  );

  try {
    const stream = createScoreboardStream(db, { league, team, limit }, c.req.raw.signal);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Scoreboard stream failed', error);
    await captureError(c, error, 'scoreboard_stream');
    return new Response('Unable to establish stream', { status: 500 });
  }
}

async function queryScoreboard(
  db: D1Database,
  options: ScoreboardQueryOptions
): Promise<ScoreboardGame[]> {
  const trimmedLeague = options.league?.trim() ?? null;
  const trimmedTeam = options.team?.trim() ?? null;
  const teamPattern = trimmedTeam ? `%${trimmedTeam.toUpperCase()}%` : null;
  const limit = resolveLimit(options.limit, SCOREBOARD_DEFAULT_LIMIT, SCOREBOARD_MAX_LIMIT);

  const statement = db.prepare(
    `SELECT
        g.id,
        g.league,
        g.start,
        g.status,
        g.home_id,
        g.away_id,
        g.home_score,
        g.away_score,
        home.name AS home_team_name,
        away.name AS away_team_name
      FROM games g
      LEFT JOIN teams home ON home.id = g.home_id
      LEFT JOIN teams away ON away.id = g.away_id
      WHERE (g.start IS NULL OR g.start <= datetime('now', '+4 hours'))
        AND (?1 IS NULL OR UPPER(g.league) = UPPER(?1))
        AND (?2 IS NULL OR (
          (home.name IS NOT NULL AND UPPER(home.name) LIKE ?2) OR
          (away.name IS NOT NULL AND UPPER(away.name) LIKE ?2)
        ))
      ORDER BY g.start DESC
      LIMIT ?3`
  );

  const { results } = await statement
    .bind(trimmedLeague, teamPattern, limit)
    .all<ScoreboardRow>();

  const timestamp = new Date().toISOString();

  return (results ?? []).map((row) => ({
    id: row.id,
    league: row.league ?? null,
    home_team: row.home_team_name ?? row.home_id ?? null,
    away_team: row.away_team_name ?? row.away_id ?? null,
    home_team_id: row.home_id ?? null,
    away_team_id: row.away_id ?? null,
    home_points: toNullableNumber(row.home_score),
    away_points: toNullableNumber(row.away_score),
    status: row.status ?? null,
    start_time: row.start ?? null,
    start_date: row.start ?? null,
    updated_at: timestamp,
  }));
}

function createScoreboardStream(
  db: D1Database,
  options: ScoreboardQueryOptions,
  signal: AbortSignal
): ReadableStream<Uint8Array> {
  const normalized: ScoreboardQueryOptions = {
    league: options.league ?? null,
    team: options.team ?? null,
    limit: resolveLimit(options.limit, SCOREBOARD_DEFAULT_LIMIT, SCOREBOARD_MAX_LIMIT),
  };

  let closed = false;
  let intervalId: number | undefined;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = async () => {
        try {
          const games = await queryScoreboard(db, normalized);
          controller.enqueue(
            scoreboardEncoder.encode(`data: ${JSON.stringify({ games })}\n\n`)
          );
        } catch (error) {
          console.error('Scoreboard stream tick failed', error);
          controller.enqueue(
            scoreboardEncoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: 'scoreboard_unavailable' })}\n\n`
            )
          );
        }
      };

      try {
        await send();
      } catch (error) {
        console.error('Scoreboard stream initial send failed', error);
      }

      intervalId = setInterval(() => {
        if (!closed) {
          send().catch((error) => console.error('Scoreboard stream iteration failed', error));
        }
      }, SCOREBOARD_STREAM_INTERVAL) as unknown as number;

      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
        controller.close();
      };

      signal.addEventListener('abort', close);
    },
    cancel() {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      closed = true;
    },
  });
}

async function oddsHandler(
  c: BlazeContext,
  overrides: OddsQueryOptions = {}
) {
  const db = getPrimaryDatabase(c.env);
  if (!db) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  const url = new URL(c.req.url);
  const league = overrides.league ?? url.searchParams.get('league');
  const fallbackLimit = sanitizeLimit(
    url.searchParams.get('limit'),
    ODDS_DEFAULT_LIMIT,
    ODDS_MAX_LIMIT
  );
  const limit = resolveLimit(overrides.limit, fallbackLimit, ODDS_MAX_LIMIT);

  try {
    const lines = await queryOdds(db, { league, limit });
    return c.json({ lines });
  } catch (error) {
    console.error('Odds query failed', error);
    return c.json({ error: 'Unable to load odds' }, 500);
  }
}

async function queryOdds(db: D1Database, options: OddsQueryOptions): Promise<OddsLine[]> {
  const trimmedLeague = options.league?.trim() ?? null;
  const limit = resolveLimit(options.limit, ODDS_DEFAULT_LIMIT, ODDS_MAX_LIMIT);

  const statement = db.prepare(
    `SELECT
        o.game_id,
        o.book,
        o.moneyline_home,
        o.moneyline_away,
        o.spread,
        o.total,
        o.ts,
        g.league,
        g.home_id,
        g.away_id,
        home.name AS home_team_name,
        away.name AS away_team_name
      FROM odds o
      LEFT JOIN games g ON g.id = o.game_id
      LEFT JOIN teams home ON home.id = g.home_id
      LEFT JOIN teams away ON away.id = g.away_id
      WHERE (?1 IS NULL OR UPPER(g.league) = UPPER(?1))
      ORDER BY o.ts DESC
      LIMIT ?2`
  );

  const { results } = await statement.bind(trimmedLeague, limit).all<OddsRow>();

  return (results ?? []).map((row) => ({
    game_id: row.game_id,
    league: row.league ?? null,
    book: row.book ?? null,
    home_team: row.home_team_name ?? row.home_id ?? null,
    away_team: row.away_team_name ?? row.away_id ?? null,
    home_team_id: row.home_id ?? null,
    away_team_id: row.away_id ?? null,
    moneyline_home: toNullableNumber(row.moneyline_home),
    moneyline_away: toNullableNumber(row.moneyline_away),
    spread: toNullableNumber(row.spread),
    total: toNullableNumber(row.total),
    ts: row.ts ?? null,
  }));
}

app.get('/api/mlb/games/today', async (c) => {
  const params = new URLSearchParams(c.req.query());
  if (!params.has('date')) {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const today = new Date(Date.now() - tzOffset).toISOString().slice(0, 10);
    params.set('date', today);
  }

  const upstream = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&${params.toString()}`;
  const response = await fetch(upstream, {
    cf: {
      cacheTtl: 60,
      cacheEverything: true,
    },
  });

  if (!response.ok) {
    return c.json(
      {
        error: 'MLB Stats API request failed',
        status: response.status,
      },
      response.status
    );
  }

  const data = await response.json();
  return c.json(data);
});

app.get('/api/nba/team/:id', async (c) => {
  const id = c.req.param('id');
  const upstream = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${encodeURIComponent(id)}`;
  const response = await fetch(upstream, {
    cf: {
      cacheTtl: 120,
      cacheEverything: true,
    },
  });

  if (!response.ok) {
    return c.json(
      {
        error: 'NBA team lookup failed',
        status: response.status,
      },
      response.status
    );
  }

  const data = await response.json();
  return c.json(data);
});

app.get('/api/media/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const bucket = c.env.MEDIA ?? c.env.MEDIA_STORAGE ?? c.env.DATA_STORAGE;

  if (!bucket) {
    return c.json({ error: 'Media bucket not configured' }, 500);
  }

  const object = await bucket.get(key);
  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  const metadata = object.httpMetadata ?? {};
  if (metadata.contentType) {
    headers.set('content-type', metadata.contentType);
  }
  if (metadata.cacheControl) {
    headers.set('cache-control', metadata.cacheControl);
  } else {
    headers.set('cache-control', 'public, max-age=300');
  }

  return new Response(object.body, { headers });
});

app.get('/rt/ws', async (c) => {
  const authenticatedEmail = c.req.header('Cf-Access-Authenticated-User-Email');
  if (!authenticatedEmail) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const pair = new WebSocketPair();
  const [client, server] = [pair[0], pair[1]];
  const scoreHubId = c.env.ScoreHub.idFromName('pressure-terminal');
  const stub = c.env.ScoreHub.get(scoreHubId);

  const headers = new Headers(c.req.raw.headers);
  headers.set('Cf-Access-Authenticated-User-Email', authenticatedEmail);

  try {
    await stub.fetch(c.req.url, { headers, webSocket: server });
    return new Response(null, { status: 101, webSocket: client });
  } catch (error) {
    console.error('ScoreHub WebSocket upgrade failed', error);
    try {
      server.close(1011, 'Upstream error');
    } catch {
      // ignore close errors
    }
    try {
      client.close(1011, 'Upstream error');
    } catch {
      // ignore close errors
    }
    return new Response('Unable to establish WebSocket', { status: 500 });
  }
});

app.all('/socket/:room', async (c) => {
  const room = c.req.param('room');
  const id = c.env.ScoreHub.idFromName(room);
  const stub = c.env.ScoreHub.get(id);
  return stub.fetch(c.req.raw);
});

app.onError((err, c) => {
  console.error('Worker error', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.notFound(async (c) => {
  const pathname = new URL(c.req.url).pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/media') || pathname.startsWith('/socket')) {
    return c.json({ error: 'Not Found' }, 404);
  }
  return marketingProxy(c);
});

export class ScoreHub {
  private sessions: Set<WebSocket> = new Set();

  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {}

  async fetch(request: Request) {
    const injectedSocket = (request as unknown as { webSocket?: WebSocket }).webSocket;

    if (injectedSocket) {
      return this.acceptExternalSocket(injectedSocket);
    }

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = [pair[0], pair[1]];
      server.accept();
      this.registerSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === 'POST') {
      return this.handleBroadcast(request);
    }

    return new Response('Expected WebSocket', { status: 426 });
  }

  private acceptExternalSocket(socket: WebSocket) {
    socket.accept();
    this.registerSocket(socket);
    return new Response(null, { status: 101, webSocket: socket });
  }

  private async handleBroadcast(request: Request) {
    try {
      const payload = await request.json();
      const message = JSON.stringify({ type: 'update', payload, at: Date.now() });
      this.broadcast(message);
      return new Response(null, { status: 202 });
    } catch (error) {
      return new Response(`Invalid payload: ${(error as Error).message}`, { status: 400 });
    }
  }

  private registerSocket(socket: WebSocket) {
    this.sessions.add(socket);

    socket.addEventListener('message', (event) => {
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.type === 'ping') {
            socket.send(JSON.stringify({ type: 'pong', at: Date.now() }));
            return;
          }
        } catch {
          // ignore parse errors and fall through to ack
        }
      }
      socket.send(JSON.stringify({ type: 'ack', received: Date.now() }));
    });

    const cleanup = () => {
      this.sessions.delete(socket);
    };

    socket.addEventListener('close', cleanup);
    socket.addEventListener('error', cleanup);
  }

  private broadcast(message: string) {
    for (const socket of Array.from(this.sessions)) {
      try {
        socket.send(message);
      } catch (error) {
        console.error('Broadcast error', error);
        this.sessions.delete(socket);
      }
    }
  }
}

export default app;

function createProxy(origin: string, prefix = '') {
  const normalized = prefix && prefix !== '/' ? prefix.replace(/\/$/, '') : prefix;

  return async (c: BlazeContext) => {
    const url = new URL(c.req.url);
    let pathname = url.pathname;

    if (
      normalized &&
      (pathname === normalized || pathname.startsWith(`${normalized}/`))
    ) {
      pathname = pathname.slice(normalized.length);
    }

    if (!pathname.startsWith('/')) {
      pathname = `/${pathname}`;
    }

    const upstream = new URL(pathname + url.search, origin);
    const headers = new Headers(c.req.raw.headers);
    headers.set('host', new URL(origin).host);

    let body: ArrayBuffer | undefined;
    if (!['GET', 'HEAD'].includes(c.req.method)) {
      body = await c.req.raw.clone().arrayBuffer();
    }

    const init: RequestInit & { cf?: RequestInitCfProperties } = {
      method: c.req.method,
      headers,
      redirect: 'manual',
      cf: {
        cacheTtl: 300,
        cacheEverything: true,
      },
    };

    if (body) {
      init.body = body;
    }

    const response = await fetch(upstream.toString(), init);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}
