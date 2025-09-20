/// <reference types="@cloudflare/workers-types" />
import { describe, expect, it } from 'vitest';
import { calculateNilValuation } from '../../src/features/nilValuation';
import type { Bindings } from '../../src/types';

const env = {
  CFB_API_KEY: 'test-key',
  ScoreHub: {} as unknown as DurableObjectNamespace,
} as Bindings;

const sampleSeason = {
  playerId: 101,
  player: 'Jordan Brooks',
  team: 'Texas',
  conference: 'Big 12',
  position: 'QB',
  season: 2024,
  class: 'JR',
  games: 12,
  gamesStarted: 12,
  passingYards: 3280,
  passingTouchdowns: 29,
  interceptions: 7,
  rushingYards: 485,
  rushingTouchdowns: 8,
  receivingYards: 0,
  receivingTouchdowns: 0,
  allPurposeYards: 3765,
  sacks: 0,
  tacklesForLoss: 0,
  puntReturnTouchdowns: 0,
  kickReturnTouchdowns: 0,
  defensiveTouchdowns: 0,
};

const sampleUsage = {
  playerId: 101,
  player: 'Jordan Brooks',
  team: 'Texas',
  season: 2024,
  position: 'QB',
  usage: {
    offense: {
      usage: 0.32,
      snapShare: 0.82,
      targetShare: 0.18,
      rushShare: 0.21,
    },
  },
};

const fetchStub: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.toString();
  if (url.includes('/player/season')) {
    return new Response(JSON.stringify([sampleSeason]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (url.includes('/player/usage')) {
    return new Response(JSON.stringify([sampleUsage]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  throw new Error(`Unexpected fetch URL: ${url}`);
};

describe('calculateNilValuation', () => {
  it('creates valuation output with usage-adjusted metrics', async () => {
    const result = await calculateNilValuation(env, { playerId: 101, year: 2024 }, fetchStub);

    expect(result.player.name).toBe('Jordan Brooks');
    expect(result.usage.share).toBeCloseTo(0.32, 2);
    expect(result.metrics.games).toBe(12);
    expect(result.valuations.expectedValue).toBeGreaterThan(result.valuations.floor);
    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.scenarioAnalysis.breakout.probability).toBeGreaterThan(0);
    expect(result.scenarioAnalysis.breakout.probability).toBeLessThanOrEqual(1);
  });
});
