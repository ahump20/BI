/// <reference types="@cloudflare/workers-types" />
import { describe, expect, it } from 'vitest';
import { buildCharacterAssessment } from '../../src/features/characterAssessment';
import type { Bindings } from '../../src/types';

const env = {
  CFB_API_KEY: 'test-key',
  ScoreHub: {} as unknown as DurableObjectNamespace,
} as Bindings;

const sampleSeason = {
  playerId: 202,
  player: 'Riley Carter',
  team: 'Texas',
  conference: 'Big 12',
  position: 'LB',
  season: 2024,
  games: 13,
  gamesStarted: 13,
  tacklesForLoss: 14,
  sacks: 9,
  defensiveTouchdowns: 1,
  interceptions: 2,
  fumblesLost: 1,
  rushingYards: 110,
  rushingTouchdowns: 2,
  receivingYards: 85,
  receivingTouchdowns: 1,
  allPurposeYards: 450,
};

const sampleUsage = {
  playerId: 202,
  player: 'Riley Carter',
  team: 'Texas',
  season: 2024,
  position: 'LB',
  usage: {
    offense: {
      usage: 0.18,
      snapShare: 0.64,
      targetShare: 0.12,
      rushShare: 0.22,
    },
  },
};

const fetchStub: typeof fetch = async (input) => {
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

describe('buildCharacterAssessment', () => {
  it('generates leadership and discipline diagnostics', async () => {
    const assessment = await buildCharacterAssessment(
      env,
      {
        playerId: 202,
        year: 2024,
        qualitative: {
          gpa: 3.4,
          communityServiceHours: 52,
          leadershipRoles: 3,
          interviewScore: 8.5,
          disciplinaryIncidents: 0,
        },
      },
      fetchStub
    );

    expect(assessment.player.name).toBe('Riley Carter');
    expect(assessment.compositeIndex).toBeGreaterThan(0);
    expect(assessment.compositeIndex).toBeLessThanOrEqual(100);
    expect(assessment.scores.leadership.score).toBeGreaterThan(assessment.scores.discipline.score - 40);
    expect(assessment.riskSignals).toBeInstanceOf(Array);
    expect(assessment.developmentPlan.length).toBeGreaterThan(0);
  });
});
