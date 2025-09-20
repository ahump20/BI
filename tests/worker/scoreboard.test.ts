import type { D1Database } from '@cloudflare/workers-types';
import app, { type Bindings } from '../../src/index';
import { describe, expect, it, vi } from 'vitest';

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

function createScoreboardDb(
  rows: ScoreboardRow[],
  onBind: (args: unknown[]) => void = () => {}
): D1Database {
  return {
    prepare: vi.fn(() => ({
      bind: (...args: unknown[]) => {
        onBind(args);
        return {
          all: async () => ({ results: rows }),
        };
      },
    })),
  } as unknown as D1Database;
}

describe('scoreboard API', () => {
  it('clamps limit and applies team filter', async () => {
    const binds: unknown[][] = [];
    const db = createScoreboardDb(
      [
        {
          id: 'game-1',
          league: 'MLB',
          start: '2025-04-01T18:00:00Z',
          status: 'final',
          home_id: 'BI',
          away_id: 'OPP',
          home_score: 12,
          away_score: 6,
          home_team_name: 'Blaze Intelligence',
          away_team_name: 'Opponents',
        },
      ],
      (args) => {
        binds.push(args);
      }
    );

    const env: Bindings = {
      DB: db,
    };

    const response = await app.request(
      '/api/v1/scoreboard?team=Blaze&limit=9999',
      {},
      env
    );

    expect(response.status).toBe(200);
    const payload = await response.json<{
      games: Array<Record<string, unknown>>;
    }>();

    expect(Array.isArray(payload.games)).toBe(true);
    expect(payload.games).toHaveLength(1);
    expect(payload.games[0]).toMatchObject({
      home_team: 'Blaze Intelligence',
      away_team: 'Opponents',
      home_points: 12,
      away_points: 6,
    });

    expect(binds).toHaveLength(1);
    expect(binds[0][1]).toBe('%BLAZE%');
    expect(binds[0][2]).toBe(50);
  });

  it('cleans up scoreboard stream interval on abort', async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const db = createScoreboardDb([
      {
        id: 'game-1',
        league: 'MLB',
        start: '2025-04-01T18:00:00Z',
        status: 'final',
        home_id: 'BI',
        away_id: 'OPP',
        home_score: 12,
        away_score: 6,
        home_team_name: 'Blaze Intelligence',
        away_team_name: 'Opponents',
      },
    ]);

    const env: Bindings = {
      DB: db,
    };

    const controller = new AbortController();

    try {
      const request = new Request('http://localhost/api/v1/scoreboard/stream', {
        signal: controller.signal,
      });
      const response = await app.fetch(request, env);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      const reader = response.body?.getReader();
      expect(reader).toBeDefined();

      const firstChunk = await reader!.read();
      expect(firstChunk.done).toBe(false);

      controller.abort();
      await Promise.resolve();

      expect(clearIntervalSpy).toHaveBeenCalled();

      await reader!.cancel();
    } finally {
      clearIntervalSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});
