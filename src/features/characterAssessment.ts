import { z } from 'zod';
import { ConfigurationError, ServiceError, UpstreamError, ValidationError } from '../errors';
import type { Bindings, FetchLike } from '../types';
import {
  fetchPlayerSeason,
  fetchPlayerUsage,
  type PlayerLookupParams,
  type PlayerSeasonRecord,
  type PlayerUsageRecord,
} from './collegeFootballClient';

const CURRENT_YEAR = new Date().getFullYear();
const MODEL_VERSION = '2024.09';

const characterRequestSchema = z
  .object({
    playerId: z.number().int().positive().optional(),
    player: z.string().trim().min(1).optional(),
    team: z.string().trim().min(1).optional(),
    year: z
      .number()
      .int()
      .min(2013)
      .max(CURRENT_YEAR + 1)
      .default(CURRENT_YEAR),
    qualitative: z
      .object({
        gpa: z.number().min(0).max(4).optional(),
        communityServiceHours: z.number().min(0).optional(),
        leadershipRoles: z.number().int().min(0).max(12).optional(),
        interviewScore: z.number().min(0).max(10).optional(),
        disciplinaryIncidents: z.number().int().min(0).optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.playerId && !value.player) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide either playerId or player name',
        path: ['player'],
      });
    }
  });

export type CharacterAssessmentRequest = z.infer<typeof characterRequestSchema>;

export interface CharacterAssessmentResult {
  generatedAt: string;
  player: {
    id: number;
    name: string;
    team: string;
    position: string | null;
    season: number;
    conference: string | null;
  };
  scores: Record<CharacterDimension, CharacterScore>;
  compositeIndex: number;
  aiInsights: string[];
  riskSignals: string[];
  developmentPlan: string[];
  metadata: {
    version: string;
    dataSources: string[];
  };
}

type CharacterDimension =
  | 'leadership'
  | 'discipline'
  | 'resilience'
  | 'coachability'
  | 'brandReadiness';

interface CharacterScore {
  score: number;
  tier: 'elite' | 'strong' | 'developing' | 'risk';
  rationale: string;
}

export async function buildCharacterAssessment(
  env: Bindings,
  rawInput: unknown,
  fetcher: FetchLike = fetch
): Promise<CharacterAssessmentResult> {
  const parsed = characterRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError('Invalid character assessment request', parsed.error.flatten());
  }

  const request = parsed.data;
  const lookup: PlayerLookupParams = {
    playerId: request.playerId,
    player: request.player,
    team: request.team,
    year: request.year,
  };

  let season: PlayerSeasonRecord;
  try {
    season = await fetchPlayerSeason(env, lookup, fetcher);
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new UpstreamError('Failed to load player season data', 502, error);
  }

  let usage: PlayerUsageRecord | null = null;
  try {
    usage = await fetchPlayerUsage(env, lookup, fetcher);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    console.warn('Character usage fetch failed', error);
  }

  const qualitative = request.qualitative ?? {};
  const metrics = computeCharacterMetrics(season, usage);
  const scores = buildScores(metrics, qualitative, season.position ?? null);
  const compositeIndex = round(
    average(Object.values(scores).map((score) => score.score)),
    1
  );

  const aiInsights = buildInsights(scores, metrics, qualitative);
  const riskSignals = deriveRiskSignals(scores, metrics, qualitative);
  const developmentPlan = buildDevelopmentPlan(scores, metrics, qualitative);

  return {
    generatedAt: new Date().toISOString(),
    player: {
      id: season.playerId,
      name: season.player,
      team: season.team,
      position: season.position ?? null,
      season: season.season,
      conference: season.conference ?? null,
    },
    scores,
    compositeIndex,
    aiInsights,
    riskSignals,
    developmentPlan,
    metadata: {
      version: MODEL_VERSION,
      dataSources: ['College Football Data API'],
    },
  };
}

interface CharacterMetrics {
  games: number;
  usageShare: number;
  snapShare: number;
  targetShare: number;
  rushShare: number;
  touchdownsPerGame: number;
  turnoversPerGame: number;
  yardsPerGame: number;
  impactPlays: number;
  experienceIndex: number;
}

function computeCharacterMetrics(
  season: PlayerSeasonRecord,
  usage: PlayerUsageRecord | null
): CharacterMetrics {
  const games = Math.max(0, season.games ?? 0);
  const touchdowns =
    coalesce(season.passingTouchdowns) +
    coalesce(season.rushingTouchdowns) +
    coalesce(season.receivingTouchdowns) +
    coalesce(season.defensiveTouchdowns) +
    coalesce(season.puntReturnTouchdowns) +
    coalesce(season.kickReturnTouchdowns);
  const turnovers = coalesce(season.interceptions) + coalesce(season.fumblesLost ?? season.fumbles);
  const yards =
    coalesce(season.allPurposeYards) > 0
      ? coalesce(season.allPurposeYards)
      : coalesce(season.passingYards) +
        coalesce(season.rushingYards) +
        coalesce(season.receivingYards) +
        coalesce(season.puntReturnYards) +
        coalesce(season.kickoffReturnYards);
  const impactPlays = touchdowns + coalesce(season.sacks) + coalesce(season.tacklesForLoss);

  const offense = usage?.usage?.offense ?? {};
  const share = clamp(
    offense.usage ?? averageDefined([offense.snapShare, offense.targetShare, offense.rushShare]) ?? 0.2,
    0,
    1
  );
  const snapShare = clamp(offense.snapShare ?? share, 0, 1);
  const targetShare = clamp(offense.targetShare ?? share * 0.5, 0, 1);
  const rushShare = clamp(offense.rushShare ?? share * 0.5, 0, 1);

  const touchdownsPerGame = games > 0 ? touchdowns / games : touchdowns;
  const turnoversPerGame = games > 0 ? turnovers / games : turnovers;
  const yardsPerGame = games > 0 ? yards / games : yards;

  const experienceIndex =
    Math.min(1, games / 13) * 0.45 +
    Math.min(1, (season.gamesStarted ?? games) / Math.max(games, 1)) * 0.35 +
    clamp(impactPlays / Math.max(games, 1) / 10, 0, 0.2);

  return {
    games,
    usageShare: round(share, 3),
    snapShare: round(snapShare, 3),
    targetShare: round(targetShare, 3),
    rushShare: round(rushShare, 3),
    touchdownsPerGame: round(touchdownsPerGame, 3),
    turnoversPerGame: round(turnoversPerGame, 3),
    yardsPerGame: round(yardsPerGame, 2),
    impactPlays: round(impactPlays, 1),
    experienceIndex: round(experienceIndex, 3),
  };
}

interface QualitativeSignals {
  gpa?: number;
  communityServiceHours?: number;
  leadershipRoles?: number;
  interviewScore?: number;
  disciplinaryIncidents?: number;
}

function buildScores(
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals,
  position: string | null
): Record<CharacterDimension, CharacterScore> {
  const disciplineScore = scoreDiscipline(metrics, qualitative);
  const leadershipScore = scoreLeadership(metrics, qualitative, position);
  const resilienceScore = scoreResilience(metrics, qualitative);
  const coachabilityScore = scoreCoachability(metrics, qualitative, disciplineScore.score);
  const brandScore = scoreBrandReadiness(metrics, qualitative, position);

  return {
    leadership: leadershipScore,
    discipline: disciplineScore,
    resilience: resilienceScore,
    coachability: coachabilityScore,
    brandReadiness: brandScore,
  };
}

function scoreLeadership(
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals,
  position: string | null
): CharacterScore {
  const positionalWeight = position && ['QB', 'LB', 'S'].includes(position.toUpperCase()) ? 1.1 : 1;
  const leadershipRoles = qualitative.leadershipRoles ?? 1;
  const interview = qualitative.interviewScore ?? 6;
  const leadershipBase =
    metrics.usageShare * 55 +
    metrics.experienceIndex * 35 +
    leadershipRoles * 3.5 +
    interview * 2.5;
  const adjusted = leadershipBase * positionalWeight;
  return scoreDetail(adjusted, 'Handles leadership reps with poise and consistent usage share.');
}

function scoreDiscipline(metrics: CharacterMetrics, qualitative: QualitativeSignals): CharacterScore {
  const incidents = qualitative.disciplinaryIncidents ?? 0;
  const base = 100 - metrics.turnoversPerGame * 28 - incidents * 12;
  const academic = qualitative.gpa ? clamp((qualitative.gpa / 4) * 8, 0, 8) : 4;
  const score = clamp(base + academic, 25, 100);
  const rationale = incidents > 0 ? 'Manageable discipline concerns flagged for monitoring.' : 'Stable discipline profile with controllable turnover rate.';
  return scoreDetail(score, rationale);
}

function scoreResilience(metrics: CharacterMetrics, qualitative: QualitativeSignals): CharacterScore {
  const workload = metrics.usageShare * 45 + metrics.snapShare * 25;
  const impact = clamp(metrics.impactPlays / Math.max(metrics.games, 1) * 8, 0, 18);
  const community = qualitative.communityServiceHours ? clamp(qualitative.communityServiceHours / 20, 0, 10) : 4;
  const score = clamp(workload + impact + community + metrics.experienceIndex * 20, 35, 100);
  return scoreDetail(score, 'Handles workload and off-field responsibilities with resilience indicators.');
}

function scoreCoachability(
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals,
  disciplineScore: number
): CharacterScore {
  const interview = qualitative.interviewScore ?? 6.5;
  const gpa = qualitative.gpa ?? 3.0;
  const base = disciplineScore * 0.35 + interview * 4 + gpa * 6;
  const adaptability = clamp((1 - metrics.turnoversPerGame) * 18, -10, 18);
  const score = clamp(base + adaptability, 30, 100);
  return scoreDetail(score, 'Feedback adoption likely strong given academic and discipline indicators.');
}

function scoreBrandReadiness(
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals,
  position: string | null
): CharacterScore {
  const exposure = metrics.usageShare * 45 + metrics.targetShare * 25;
  const production = clamp(metrics.touchdownsPerGame * 18 + metrics.yardsPerGame * 0.18, 0, 40);
  const community = qualitative.communityServiceHours ? clamp(qualitative.communityServiceHours / 15, 0, 12) : 5;
  const leadership = qualitative.leadershipRoles ? qualitative.leadershipRoles * 2 : 4;
  const positionalBoost = position && ['QB', 'WR', 'RB'].includes(position.toUpperCase()) ? 8 : 4;
  const score = clamp(exposure + production + community + leadership + positionalBoost, 35, 100);
  return scoreDetail(score, 'Brand platform ready for expanded storytelling and partner alignment.');
}

function buildInsights(
  scores: Record<CharacterDimension, CharacterScore>,
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals
): string[] {
  const insights: string[] = [];
  const topAreas = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 2);
  topAreas.forEach(([dimension, detail]) => {
    insights.push(`${toTitleCase(dimension)} profile grades ${tierLabel(detail.tier)} (${detail.score}).`);
  });
  if ((qualitative.communityServiceHours ?? 0) > 40) {
    insights.push('Community engagement portfolio strengthens leadership narrative.');
  }
  if (metrics.turnoversPerGame < 0.4) {
    insights.push('On-field decision-making reinforces discipline reputation.');
  }
  if (metrics.usageShare > 0.4) {
    insights.push('High-usage role validates leadership and trust from staff.');
  }
  return insights;
}

function deriveRiskSignals(
  scores: Record<CharacterDimension, CharacterScore>,
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals
): string[] {
  const signals: string[] = [];
  if (scores.discipline.score < 65 || (qualitative.disciplinaryIncidents ?? 0) > 0) {
    signals.push('Discipline monitoring required for NIL risk mitigation.');
  }
  if (scores.brandReadiness.score < 60) {
    signals.push('Brand readiness below partner expectations—enhance media training.');
  }
  if (metrics.turnoversPerGame > 1) {
    signals.push('Ball security focus needed to sustain leadership credibility.');
  }
  return signals;
}

function buildDevelopmentPlan(
  scores: Record<CharacterDimension, CharacterScore>,
  metrics: CharacterMetrics,
  qualitative: QualitativeSignals
): string[] {
  const plan: string[] = [];
  if (scores.coachability.score < 70) {
    plan.push('Deploy mentorship pairing and install structured feedback loops.');
  }
  if (scores.discipline.score < 70) {
    plan.push('Implement accountability cadence: weekly performance and conduct reviews.');
  }
  if (scores.brandReadiness.score < 75) {
    plan.push('Launch content calendar with media coaching to elevate storytelling assets.');
  }
  if (plan.length === 0) {
    plan.push('Maintain leadership councils and reinforce community activation rhythm.');
  }
  return plan;
}

function scoreDetail(score: number, rationale: string): CharacterScore {
  const bounded = clamp(score, 25, 100);
  return {
    score: round(bounded, 1),
    tier: resolveTier(bounded),
    rationale,
  };
}

function resolveTier(score: number): CharacterScore['tier'] {
  if (score >= 85) {
    return 'elite';
  }
  if (score >= 70) {
    return 'strong';
  }
  if (score >= 55) {
    return 'developing';
  }
  return 'risk';
}

function tierLabel(tier: CharacterScore['tier']) {
  switch (tier) {
    case 'elite':
      return 'elite';
    case 'strong':
      return 'strong';
    case 'developing':
      return 'developing';
    default:
      return 'high-risk';
  }
}

function toTitleCase(value: string) {
  return value.replace(/(^|_)([a-z])/g, (_, prefix, char) => `${prefix ? ' ' : ''}${char.toUpperCase()}`);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function averageDefined(values: Array<number | null | undefined>) {
  const filtered = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (filtered.length === 0) {
    return undefined;
  }
  return filtered.reduce((acc, value) => acc + value, 0) / filtered.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function coalesce(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
