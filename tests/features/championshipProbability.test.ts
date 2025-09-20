/// <reference types="@cloudflare/workers-types" />
import { describe, expect, it } from 'vitest';
import { computeChampionshipProbabilities } from '../../src/features/championshipProbability';
import type { Bindings } from '../../src/types';

const env = {
  SPORTSDATAIO_API_KEY: 'sports-key',
  ScoreHub: {} as unknown as DurableObjectNamespace,
} as Bindings;

const sampleStandings = [
  {
    TeamID: 11,
    Team: 'Blaze Baseball Club',
    Wins: 94,
    Losses: 58,
    PointsFor: 780,
    PointsAgainst: 610,
    Streak: 5,
    StrengthOfSchedule: 1.3,
    PlayoffSeed: 1,
  },
  {
    TeamID: 22,
    Team: 'Blaze Football Elite',
    Wins: 11,
    Losses: 2,
    PointsFor: 520,
    PointsAgainst: 360,
    Streak: 3,
    StrengthOfSchedule: 0.8,
    PlayoffSeed: 2,
  },
  {
    TeamID: 33,
    Team: 'Blaze Hoops United',
    Wins: 46,
    Losses: 36,
    PointsFor: 845,
    PointsAgainst: 830,
    Streak: -1,
    StrengthOfSchedule: -0.2,
    PlayoffSeed: 6,
  },
];

const fetchStub: typeof fetch = async (input) => {
  const url = typeof input === 'string' ? input : input.toString();
  if (!url.includes('/Standings/')) {
    throw new Error(`Unexpected fetch URL: ${url}`);
  }
  return new Response(JSON.stringify(sampleStandings), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('computeChampionshipProbabilities', () => {
  it('ranks teams by modeled championship probability', async () => {
    const result = await computeChampionshipProbabilities(env, { league: 'mlb', season: 2024 }, fetchStub);

    expect(result.teams.length).toBeGreaterThanOrEqual(3);
    expect(result.teams[0].probability).toBeGreaterThan(result.teams[1].probability);
    expect(result.analysisSummary).toContain(result.teams[0].team);
    expect(result.teams[0].metrics.winPct).toBeGreaterThan(result.teams[2].metrics.winPct);
  });
});
