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
const NIL_MODEL_VERSION = '2024.09';

const nilRequestSchema = z
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
    includeUsage: z.boolean().optional(),
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

export type NilValuationRequest = z.infer<typeof nilRequestSchema>;

export interface NilValuationResult {
  generatedAt: string;
  player: {
    id: number;
    name: string;
    team: string;
    conference: string | null;
    position: string | null;
    season: number;
    classLevel: string | null;
  };
  valuations: {
    baseline: number;
    expectedValue: number;
    ceiling: number;
    floor: number;
    currency: 'USD';
  };
  metrics: NilValuationMetrics;
  usage: UsageProfile;
  valuationBreakdown: ValuationBreakdown;
  insights: string[];
  recommendations: string[];
  scenarioAnalysis: ScenarioAnalysis;
  confidence: number;
  modelMetadata: {
    version: string;
    dataSources: string[];
    features: string[];
  };
}

interface NilValuationMetrics {
  games: number;
  totalYards: number;
  touchdowns: number;
  turnovers: number;
  productionScore: number;
  defensiveImpact: number;
  specialTeamsImpact: number;
  yardsPerGame: number;
  explosiveRate: number;
  mistakeRate: number;
  impactPlays: number;
}

interface UsageProfile {
  share: number;
  snapShare: number;
  targetShare: number;
  rushShare: number;
  exposureMultiplier: number;
  growthPotential: number;
  marketAffinity: number;
}

interface ValuationBreakdown {
  production: number;
  exposure: number;
  brand: number;
  riskAdjustment: number;
}

interface ScenarioAnalysis {
  breakout: { probability: number; valuation: number };
  consolidation: { probability: number; valuation: number };
  downside: { probability: number; valuation: number };
}

export async function calculateNilValuation(
  env: Bindings,
  rawInput: unknown,
  fetcher: FetchLike = fetch
): Promise<NilValuationResult> {
  const parsed = nilRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError('Invalid NIL valuation request', parsed.error.flatten());
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
  if (request.includeUsage !== false) {
    try {
      usage = await fetchPlayerUsage(env, lookup, fetcher);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      // Treat usage fetch failures as non-fatal to keep core valuation online.
      console.warn('NIL usage fetch failed', error);
    }
  }

  const metrics = computeMetrics(season);
  const usageProfile = computeUsageProfile(usage);
  const valuations = computeValuation(metrics, usageProfile);
  const breakdown = computeBreakdown(metrics, usageProfile, valuations.expectedValue, valuations.floor);
  const { insights, recommendations, scenarioAnalysis, confidence } = buildNarrative(
    metrics,
    usageProfile,
    valuations
  );

  return {
    generatedAt: new Date().toISOString(),
    player: {
      id: season.playerId,
      name: season.player,
      team: season.team,
      conference: season.conference ?? null,
      position: season.position ?? null,
      season: season.season,
      classLevel: season.class ?? null,
    },
    valuations: {
      baseline: valuations.baseline,
      expectedValue: valuations.expectedValue,
      ceiling: valuations.ceiling,
      floor: valuations.floor,
      currency: 'USD',
    },
    metrics,
    usage: usageProfile,
    valuationBreakdown: breakdown,
    insights,
    recommendations,
    scenarioAnalysis,
    confidence,
    modelMetadata: {
      version: NIL_MODEL_VERSION,
      dataSources: ['College Football Data API'],
      features: [
        'productionScore',
        'usageShare',
        'explosiveRate',
        'brandMomentum',
        'riskIndex',
      ],
    },
  };
}

function computeMetrics(season: PlayerSeasonRecord): NilValuationMetrics {
  const games = Math.max(0, season.games ?? 0);
  const passingYards = coalesce(season.passingYards);
  const rushingYards = coalesce(season.rushingYards);
  const receivingYards = coalesce(season.receivingYards);
  const allPurposeYards = coalesce(season.allPurposeYards);
  const totalYards =
    allPurposeYards > 0
      ? allPurposeYards
      : passingYards + rushingYards + receivingYards + coalesce(season.kickoffReturnYards) + coalesce(season.puntReturnYards);

  const passingTouchdowns = coalesce(season.passingTouchdowns);
  const rushingTouchdowns = coalesce(season.rushingTouchdowns);
  const receivingTouchdowns = coalesce(season.receivingTouchdowns);
  const returnTouchdowns = coalesce(season.puntReturnTouchdowns) + coalesce(season.kickReturnTouchdowns);
  const defensiveTouchdowns = coalesce(season.defensiveTouchdowns);
  const touchdowns =
    passingTouchdowns +
    rushingTouchdowns +
    receivingTouchdowns +
    returnTouchdowns +
    defensiveTouchdowns;

  const interceptions = coalesce(season.interceptions);
  const fumblesLost = coalesce(season.fumblesLost ?? season.fumbles);
  const turnovers = interceptions + fumblesLost;

  const tackles = coalesce(season.totalTackles);
  const sacks = coalesce(season.sacks);
  const tacklesForLoss = coalesce(season.tacklesForLoss);
  const passesDefended = coalesce(season.passesDefended);
  const defensiveImpact = tackles * 2.4 + sacks * 18 + tacklesForLoss * 7.5 + passesDefended * 12 + interceptions * 25;
  const specialTeamsImpact =
    coalesce(season.puntReturnYards) * 0.12 +
    coalesce(season.kickoffReturnYards) * 0.1 +
    returnTouchdowns * 30;

  const rushingAttempts = coalesce(season.rushingAttempts);
  const receptions = coalesce(season.receptions);
  const estimatedPassingAttempts = passingYards > 0 ? Math.max(10, Math.round(passingYards / 25)) : 0;
  const touches = rushingAttempts + receptions + estimatedPassingAttempts;

  const yardsPerGame = games > 0 ? totalYards / games : totalYards;
  const impactPlays = touchdowns + sacks + tacklesForLoss + passesDefended;
  const explosiveRate = clamp(impactPlays / Math.max(1, touches), 0, 1.5);
  const mistakeRate = clamp(turnovers / Math.max(1, touches), 0, 1.2);

  const productionBase =
    totalYards * 0.45 +
    touchdowns * 55 +
    defensiveImpact +
    specialTeamsImpact +
    impactPlays * 12;
  const productionScore = Math.max(productionBase - turnovers * 22, 0);

  return {
    games,
    totalYards: round(totalYards, 1),
    touchdowns: round(touchdowns, 1),
    turnovers: round(turnovers, 1),
    productionScore: round(productionScore, 2),
    defensiveImpact: round(defensiveImpact, 2),
    specialTeamsImpact: round(specialTeamsImpact, 2),
    yardsPerGame: round(yardsPerGame, 2),
    explosiveRate: round(explosiveRate, 3),
    mistakeRate: round(mistakeRate, 3),
    impactPlays: round(impactPlays, 1),
  };
}

function computeUsageProfile(usage: PlayerUsageRecord | null): UsageProfile {
  if (!usage || !usage.usage) {
    return {
      share: 0.18,
      snapShare: 0.35,
      targetShare: 0.12,
      rushShare: 0.14,
      exposureMultiplier: 1.12,
      growthPotential: 0.32,
      marketAffinity: 0.28,
    };
  }

  const offense = usage.usage.offense ?? {};
  const share = clamp(
    offense.usage ?? averageDefined([offense.targetShare, offense.rushShare, offense.snapShare]) ?? 0.18,
    0,
    1
  );
  const snapShare = clamp(offense.snapShare ?? share, 0, 1);
  const targetShare = clamp(offense.targetShare ?? share * 0.5, 0, 1);
  const rushShare = clamp(offense.rushShare ?? share * 0.5, 0, 1);
  const exposureMultiplier = 1 + share * 0.75 + snapShare * 0.35 + targetShare * 0.25;
  const growthPotential = clamp(0.15 + (1 - share) * 0.45, 0.12, 0.48);
  const marketAffinity = clamp(targetShare * 0.5 + rushShare * 0.4 + share * 0.3, 0, 1);

  return {
    share: round(share, 3),
    snapShare: round(snapShare, 3),
    targetShare: round(targetShare, 3),
    rushShare: round(rushShare, 3),
    exposureMultiplier: round(exposureMultiplier, 3),
    growthPotential: round(growthPotential, 3),
    marketAffinity: round(marketAffinity, 3),
  };
}

function computeValuation(metrics: NilValuationMetrics, usage: UsageProfile) {
  const brandMomentum = metrics.yardsPerGame * 0.32 + metrics.touchdowns * 4 + usage.marketAffinity * 95;
  const riskIndex = clamp(metrics.mistakeRate * 3.5 + Math.max(0, 0.35 - usage.share), 0.05, 1.25);

  const baseline = Math.max(20000, metrics.productionScore * 12 + metrics.defensiveImpact * 1.4 + 15000);
  const expectedValue = baseline * usage.exposureMultiplier * (1 + brandMomentum / 900);
  const ceiling = expectedValue * (1.12 + usage.growthPotential + metrics.explosiveRate * 0.45);
  const floor = expectedValue * Math.max(0.45, 0.72 - riskIndex * 0.28);

  return {
    baseline: Math.round(baseline),
    expectedValue: Math.round(expectedValue),
    ceiling: Math.round(ceiling),
    floor: Math.round(floor),
    brandMomentum: round(brandMomentum, 2),
    riskIndex: round(riskIndex, 3),
  };
}

function computeBreakdown(
  metrics: NilValuationMetrics,
  usage: UsageProfile,
  expectedValue: number,
  floor: number
): ValuationBreakdown {
  const productionContribution = Math.max(0, metrics.productionScore * 9.5);
  const exposureContribution = Math.max(0, expectedValue * (usage.exposureMultiplier - 1));
  const brandContribution = Math.max(0, expectedValue * usage.marketAffinity * 0.25);
  const riskAdjustment = Math.max(0, expectedValue - floor);

  return {
    production: Math.round(productionContribution),
    exposure: Math.round(exposureContribution),
    brand: Math.round(brandContribution),
    riskAdjustment: Math.round(riskAdjustment),
  };
}

function buildNarrative(
  metrics: NilValuationMetrics,
  usage: UsageProfile,
  valuation: ReturnType<typeof computeValuation>
) {
  const insights: string[] = [];
  const recommendations: string[] = [];
  const tier = resolveMarketTier(valuation.expectedValue);

  insights.push(`Projected ${tier} NIL profile with $${formatCurrency(valuation.expectedValue)} in annual upside.`);
  if (usage.share > 0.35) {
    insights.push(`High offensive usage (${(usage.share * 100).toFixed(1)}%) sustains premium brand demand.`);
  }
  if (metrics.touchdowns >= 20) {
    insights.push('Explosive scoring production positions athlete for national activations.');
  }
  if (metrics.specialTeamsImpact > 40) {
    insights.push('Special teams contributions unlock multi-role sponsorship inventory.');
  }
  if (valuation.riskIndex < 0.45) {
    insights.push('Low turnover profile builds trust with collectives and blue-chip sponsors.');
  }

  if (usage.targetShare < 0.2) {
    recommendations.push('Expand earned media and digital storytelling to offset limited target share.');
  }
  if (metrics.turnovers > 8) {
    recommendations.push('Prioritise ball security programming to protect valuation floor.');
  }
  if (valuation.ceiling - valuation.expectedValue > 150_000) {
    recommendations.push('Bundle long-term incentives with breakout escalators to capture upside.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain current activation cadence; focus on postseason amplification.');
  }

  const scenarioAnalysis: ScenarioAnalysis = {
    breakout: {
      probability: clamp((usage.growthPotential + metrics.explosiveRate) / 1.8, 0.08, 0.6),
      valuation: Math.round(valuation.ceiling * (1 + usage.growthPotential * 0.35)),
    },
    consolidation: {
      probability: clamp(0.35 + metrics.games / 20 + (1 - valuation.riskIndex) * 0.2, 0.3, 0.9),
      valuation: valuation.expectedValue,
    },
    downside: {
      probability: clamp(valuation.riskIndex * 0.55, 0.07, 0.45),
      valuation: Math.round(valuation.floor),
    },
  };

  const confidence = clamp(
    0.5 + Math.min(0.3, metrics.games / 18) + Math.min(0.25, valuation.expectedValue / 1_200_000) - valuation.riskIndex * 0.2,
    0.4,
    0.92
  );

  return { insights, recommendations, scenarioAnalysis, confidence };
}

function resolveMarketTier(expectedValue: number) {
  if (expectedValue >= 750_000) {
    return 'national flagship';
  }
  if (expectedValue >= 300_000) {
    return 'power conference';
  }
  if (expectedValue >= 125_000) {
    return 'regional leader';
  }
  return 'emerging market';
}

function averageDefined(values: Array<number | null | undefined>): number | undefined {
  const filtered = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (filtered.length === 0) {
    return undefined;
  }
  return filtered.reduce((acc, value) => acc + value, 0) / filtered.length;
}

// Utility functions imported from shared module
import { clamp, coalesce, round } from '../../utils/math';
function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `${round(value / 1_000_000, 2)}M`;
  }
  if (value >= 1_000) {
    return `${round(value / 1_000, 1)}K`;
  }
  return value.toString();
}
