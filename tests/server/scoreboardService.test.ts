import request, { type Response as SupertestResponse } from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app.js';
import {
  ScoreboardService,
  ScoreboardServiceOptions,
} from '../../src/server/services/scoreboardService.js';

const createResponse = (payload: unknown) => ({
  ok: true,
  status: 200,
  async json() {
    await Promise.resolve();
    return payload;
  },
});

describe('ScoreboardService', () => {
  const timestamp = new Date().toISOString();
  const basePayload = {
    events: [
      {
        id: 'event-1',
        name: 'Houston Astros at Texas Rangers',
        shortName: 'HOU @ TEX',
        date: timestamp,
        competitions: [
          {
            id: 'competition-1',
            status: { type: { state: 'in', detail: 'Top 3rd' } },
            competitors: [
              {
                id: 'houston-astros',
                homeAway: 'away',
                score: '2',
                team: {
                  id: 'houston-astros',
                  displayName: 'Houston Astros',
                  abbreviation: 'HOU',
                },
              },
              {
                id: 'texas-rangers',
                homeAway: 'home',
                score: '3',
                team: {
                  id: 'texas-rangers',
                  displayName: 'Texas Rangers',
                  abbreviation: 'TEX',
                },
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ESPN data when fetch succeeds', async () => {
    const fetcher = vi.fn().mockResolvedValue(createResponse(basePayload));
    const service = new ScoreboardService({ fetcher });

    const result = await service.getScoreboard('baseball');

    expect(result.source).toBe('espn');
    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.competitors).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('falls back to cached data and avoids duplicate fetches', async () => {
    const fetcher = vi.fn().mockResolvedValue(createResponse(basePayload));
    const service = new ScoreboardService({ fetcher, cacheTtlMs: 60_000 });

    const first = await service.getScoreboard('baseball');
    const second = await service.getScoreboard('baseball');

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(second).toStrictEqual(first);
  });

  it('returns fallback payload when fetch fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network down'));
    const service = new ScoreboardService({ fetcher });

    const result = await service.getScoreboard('baseball');

    expect(result.source).toBe('fallback');
    expect(result.events.length).toBeGreaterThan(0);
  });
});

describe('Scoreboard API routes', () => {
  const createService = (overrides: ScoreboardServiceOptions = {}) =>
    new ScoreboardService(overrides);

  it('returns metadata for supported sports', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('skip network during test'));
    const app = createApp(createService({ fetcher }));

    const response: SupertestResponse = await request(app).get('/api/scoreboard');

    expect(response.status).toBe(200);
    expect(response.body.sports).toContain('baseball');
  });

  it('returns 404 for unsupported sports', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('skip network during test'));
    const app = createApp(createService({ fetcher }));

    const response: SupertestResponse = await request(app).get('/api/scoreboard/soccer');

    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/Unsupported sport/);
  });
});
