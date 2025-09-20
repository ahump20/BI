import { z } from 'zod';
import { ConfigurationError, UpstreamError, ValidationError } from '../errors';
import type { Bindings, FetchLike } from '../types';

const SPORTS_DATA_BASE = 'https://fly.sportsdata.io';
const MODEL_VERSION = '2024.09';

const championshipRequestSchema = z
  .object({
    league: z.enum(['cfb', 'nfl', 'mlb', 'nba']),
    season: z
      .number()
      .int()
      .min(2000)
      .max(new Date().getFullYear() + 1)
      .optional(),
    teams: z.array(z.string().trim().min(1)).optional(),
    limit: z.number().int().min(1).max(32).optional(),
  })
  .transform((value) => ({
    ...value,
    season: value.season ?? new Date().getFullYear(),
  }));

export type ChampionshipProbabilityRequest = z.infer<typeof championshipRequestSchema>;

export interface ChampionshipProbabilityResult {
  generatedAt: string;
  league: string;
  season: number;
  teams: ChampionshipTeamProjection[];
  analysisSummary: string;
  assumptions: string[];
  modelMetadata: {
    version: string;
    dataSources: string[];
  };
}

export interface ChampionshipTeamProjection {
  team: string;
  teamId: number | null;
  alias?: string;
  probability: number;
  confidence: number;
  rank: number;
  metrics: {
    winPct: number;
    marginPerGame: number;
    offenseRating: number;
    defenseRating: number;
    strengthOfSchedule: number;
    momentum: number;
  };
  riskFactors: string[];
  insights: string[];
  scenarios: {
    bestCase: number;
    expected: number;
    upsetRisk: number;
  };
}

interface LeagueConfig {
  path: (season: number) => string;
}

const LEAGUE_CONFIG: Record<'cfb' | 'nfl' | 'mlb' | 'nba', LeagueConfig> = {
  cfb: { path: (season) => `/v3/cfb/scores/json/Standings/${season}` },
  nfl: { path: (season) => `/v3/nfl/scores/json/Standings/${season}` },
  mlb: { path: (season) => `/v3/mlb/scores/json/Standings/${season}` },
  nba: { path: (season) => `/v3/nba/scores/json/Standings/${season}` },
};

interface RawStandingsRow {
  TeamID?: number;
  Team?: string;
  Name?: string;
  School?: string;
  Key?: string;
  Wins?: number;
  Losses?: number;
  Ties?: number;
  Percentage?: number;
  PointsFor?: number;
  PointsAgainst?: number;
  RunsFor?: number;
  RunsAgainst?: number;
  GoalsFor?: number;
  GoalsAgainst?: number;
  Games?: number;
  ConferenceWins?: number;
  ConferenceLosses?: number;
  DivisionWins?: number;
  DivisionLosses?: number;
  ConferenceRank?: number;
  DivisionRank?: number;
  PlayoffSeed?: number;
  Rank?: number;
  Streak?: number;
  StreakDescription?: string;
  StrengthOfSchedule?: number;
  StrengthOfVictory?: number;
}

interface NormalizedRecord {
  id: number | null;
  team: string;
  alias?: string;
  wins: number;
  losses: number;
  ties: number;
  games: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  marginPerGame: number;
  conferenceWins: number;
  conferenceLosses: number;
  strengthOfSchedule: number;
  streak: number;
  ranking?: number;
}

export async function computeChampionshipProbabilities(
  env: Bindings,
  rawInput: unknown,
  fetcher: FetchLike = fetch
): Promise<ChampionshipProbabilityResult> {
  const parsed = championshipRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError('Invalid championship probability request', parsed.error.flatten());
  }

  const request = parsed.data;
  const apiKey = env.SPORTSDATAIO_API_KEY?.trim();
  if (!apiKey) {
    throw new ConfigurationError('SPORTSDATAIO_API_KEY is not configured');
  }

  const config = LEAGUE_CONFIG[request.league];
  const url = new URL(`${SPORTS_DATA_BASE}${config.path(request.season)}`);

  const response = await fetcher(url.toString(), {
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await safeErrorMessage(response);
    throw new UpstreamError(`SportsDataIO API error (${response.status})`, response.status, message);
  }

  const data = (await response.json()) as RawStandingsRow[];
  const records = data.map(normalizeRecord).filter((record): record is NormalizedRecord => record !== null);
  if (records.length === 0) {
    throw new UpstreamError('SportsDataIO returned no standings data', 502);
  }

  const filtered = filterTeams(records, request.teams);
  const metrics = computeLeagueMetrics(filtered);

  const projections = filtered
    .map((record) => buildProjection(record, metrics))
    .sort((a, b) => b.probability - a.probability);

  const limit = request.limit ?? Math.min(12, projections.length);
  const limited = projections.slice(0, limit).map((projection, index) => ({
    ...projection,
    rank: index + 1,
  }));

  const analysisSummary = createSummary(limited);

  return {
    generatedAt: new Date().toISOString(),
    league: request.league,
    season: request.season,
    teams: limited,
    analysisSummary,
    assumptions: [
      'Win probability calibrated using league-average scoring margins',
      'Strength of schedule and recent form weighted for postseason context',
      'Model assumes neutral-site championship environment',
    ],
    modelMetadata: {
      version: MODEL_VERSION,
      dataSources: ['SportsDataIO'],
    },
  };
}

function normalizeRecord(row: RawStandingsRow): NormalizedRecord | null {
  const name = row.Team ?? row.Name ?? row.School ?? row.Key;
  if (!name) {
    return null;
  }

  const wins = coalesce(row.Wins);
  const losses = coalesce(row.Losses);
  const ties = coalesce(row.Ties);
  const games = row.Games ?? wins + losses + ties;
  const winPct = row.Percentage ?? (games > 0 ? (wins + 0.5 * ties) / games : 0);

  const pointsFor =
    coalesce(row.PointsFor) + coalesce(row.RunsFor) + coalesce(row.GoalsFor);
  const pointsAgainst =
    coalesce(row.PointsAgainst) + coalesce(row.RunsAgainst) + coalesce(row.GoalsAgainst);

  const conferenceWins = coalesce(row.ConferenceWins ?? row.DivisionWins);
  const conferenceLosses = coalesce(row.ConferenceLosses ?? row.DivisionLosses);
  const strengthOfSchedule = coalesce(row.StrengthOfSchedule ?? row.StrengthOfVictory);

  const streak = resolveStreak(row);
  const marginPerGame = games > 0 ? (pointsFor - pointsAgainst) / games : 0;

  return {
    id: typeof row.TeamID === 'number' ? row.TeamID : null,
    team: name,
    alias: row.Key,
    wins,
    losses,
    ties,
    games,
    winPct,
    pointsFor,
    pointsAgainst,
    marginPerGame,
    conferenceWins,
    conferenceLosses,
    strengthOfSchedule,
    streak,
    ranking: row.PlayoffSeed ?? row.Rank ?? undefined,
  };
}

function filterTeams(records: NormalizedRecord[], teams?: string[]) {
  if (!teams || teams.length === 0) {
    return records;
  }
  const lookup = new Set(teams.map((team) => team.toLowerCase()));
  return records.filter((record) => lookup.has(record.team.toLowerCase()) || (record.alias && lookup.has(record.alias.toLowerCase())));
}

interface LeagueMetrics {
  winPctMean: number;
  winPctStd: number;
  marginMean: number;
  marginStd: number;
  sosMean: number;
  sosStd: number;
  offenseMean: number;
  defenseMean: number;
}

function computeLeagueMetrics(records: NormalizedRecord[]): LeagueMetrics {
  const winPcts = records.map((record) => record.winPct);
  const margins = records.map((record) => record.marginPerGame);
  const sos = records.map((record) => record.strengthOfSchedule);
  const offense = records.map((record) => record.pointsFor / Math.max(record.games, 1));
  const defense = records.map((record) => record.pointsAgainst / Math.max(record.games, 1));

  return {
    winPctMean: average(winPcts),
    winPctStd: stdDev(winPcts),
    marginMean: average(margins),
    marginStd: stdDev(margins),
    sosMean: average(sos),
    sosStd: stdDev(sos),
    offenseMean: average(offense),
    defenseMean: average(defense),
  };
}

function buildProjection(record: NormalizedRecord, metrics: LeagueMetrics): ChampionshipTeamProjection {
  const offensePerGame = record.pointsFor / Math.max(record.games, 1);
  const defensePerGame = record.pointsAgainst / Math.max(record.games, 1);

  const winPctZ = zScore(record.winPct, metrics.winPctMean, metrics.winPctStd);
  const marginZ = zScore(record.marginPerGame, metrics.marginMean, metrics.marginStd);
  const sosZ = zScore(record.strengthOfSchedule, metrics.sosMean, metrics.sosStd);
  const rankingBonus = record.ranking ? Math.max(0, 1.1 - record.ranking / 10) : 0;
  const streakScore = clamp(record.streak / 10, -0.6, 0.6);

  const baseScore = winPctZ * 0.45 + marginZ * 0.25 + sosZ * 0.15 + streakScore * 0.1 + rankingBonus * 0.05;
  const probability = clamp(logistic(baseScore), 0.01, 0.97);

  const offenseRating = normalizeRatio(offensePerGame, metrics.offenseMean);
  const defenseRating = normalizeRatio(metrics.defenseMean, defensePerGame);
  const momentum = clamp(0.5 + streakScore * 0.4 + marginZ * 0.1, 0, 1);

  const riskFactors = buildRiskFactors(record, metrics);
  const insights = buildInsights(record, offenseRating, defenseRating, sosZ, riskFactors);

  return {
    team: record.team,
    teamId: record.id,
    alias: record.alias,
    probability: round(probability, 4),
    confidence: round(clamp(0.45 + record.games / 30 - riskFactors.length * 0.04 + probability * 0.2, 0.35, 0.92), 3),
    rank: 0,
    metrics: {
      winPct: round(record.winPct, 3),
      marginPerGame: round(record.marginPerGame, 2),
      offenseRating: round(offenseRating, 3),
      defenseRating: round(defenseRating, 3),
      strengthOfSchedule: round(record.strengthOfSchedule, 2),
      momentum: round(momentum, 3),
    },
    riskFactors,
    insights,
    scenarios: buildScenarios(probability, riskFactors, record),
  };
}

function buildRiskFactors(record: NormalizedRecord, metrics: LeagueMetrics): string[] {
  const risks: string[] = [];
  if (record.marginPerGame < metrics.marginMean) {
    risks.push('narrow-margins');
  }
  if (record.strengthOfSchedule < metrics.sosMean - 0.5) {
    risks.push('schedule');
  }
  if (record.streak < 0) {
    risks.push('recent-slide');
  }
  if (record.conferenceLosses > Math.max(0, record.conferenceWins - 1)) {
    risks.push('conference-pressure');
  }
  return risks;
}

function buildInsights(
  record: NormalizedRecord,
  offenseRating: number,
  defenseRating: number,
  sosZ: number,
  risks: string[]
): string[] {
  const insights: string[] = [];
  insights.push(
    `Win rate ${(record.winPct * 100).toFixed(1)}% with margin ${record.marginPerGame.toFixed(1)} indicates ${
      record.marginPerGame >= 0 ? 'positive' : 'negative'
    } game control.`
  );
  if (offenseRating > 1.05) {
    insights.push('Top-tier offense drives championship probability.');
  } else if (defenseRating > 1.05) {
    insights.push('Defense-first profile can travel in postseason settings.');
  }
  if (sosZ > 0.5) {
    insights.push('Schedule strength validates record against elite competition.');
  }
  if (risks.includes('schedule')) {
    insights.push('Soft schedule requires statement wins to secure committee confidence.');
  }
  return insights;
}

function buildScenarios(probability: number, risks: string[], record: NormalizedRecord) {
  const volatility = Math.max(0.15, risks.length * 0.08);
  return {
    bestCase: round(clamp(probability * (1 + 0.35 - volatility * 0.2), 0.05, 0.99), 4),
    expected: round(probability, 4),
    upsetRisk: round(clamp(probability * (0.35 + volatility), 0.05, 0.6), 4),
  };
}

function createSummary(teams: ChampionshipTeamProjection[]): string {
  if (teams.length === 0) {
    return 'No teams evaluated.';
  }
  const leader = teams[0];
  const challengers = teams.slice(1, 4);
  const challengerList = challengers
    .map((team) => `${team.team} (${(team.probability * 100).toFixed(1)}%)`)
    .join(', ');
  return `${leader.team} leads the championship race at ${(leader.probability * 100).toFixed(1)}% probability. Key challengers: ${
    challengerList || 'none'
  }.`;
}

function resolveStreak(row: RawStandingsRow) {
  if (typeof row.Streak === 'number') {
    return row.Streak;
  }
  if (row.StreakDescription) {
    const match = /(W|L)(\d+)/i.exec(row.StreakDescription);
    if (match) {
      const [, type, count] = match;
      const value = Number.parseInt(count, 10);
      return type.toUpperCase() === 'W' ? value : -value;
    }
  }
  return 0;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function stdDev(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  const mean = average(values);
  const variance =
    values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / Math.max(values.length - 1, 1);
  return Math.sqrt(variance);
}

function zScore(value: number, mean: number, std: number) {
  if (std === 0) {
    return 0;
  }
  return (value - mean) / std;
}

function logistic(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function normalizeRatio(value: number, baseline: number) {
  if (baseline === 0) {
    return 1;
  }
  return clamp(value / baseline, 0, 3);
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

async function safeErrorMessage(response: Response) {
  try {
    return await response.json();
  } catch {
    return response.statusText || 'Unknown error';
  }
}
