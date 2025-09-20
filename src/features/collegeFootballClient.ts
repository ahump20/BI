import { ConfigurationError, NotFoundError, UpstreamError } from '../errors';
import type { Bindings, FetchLike } from '../types';

const CFBD_BASE_URL = 'https://api.collegefootballdata.com';

export interface PlayerSeasonRecord {
  playerId: number;
  player: string;
  team: string;
  conference?: string | null;
  position?: string | null;
  season: number;
  class?: string | null;
  height?: number | null;
  weight?: number | null;
  games?: number | null;
  gamesStarted?: number | null;
  passingYards?: number | null;
  passingTouchdowns?: number | null;
  interceptions?: number | null;
  rushingYards?: number | null;
  rushingAttempts?: number | null;
  rushingTouchdowns?: number | null;
  receivingYards?: number | null;
  receptions?: number | null;
  receivingTouchdowns?: number | null;
  allPurposeYards?: number | null;
  totalTackles?: number | null;
  sacks?: number | null;
  tacklesForLoss?: number | null;
  passesDefended?: number | null;
  fumblesRecovered?: number | null;
  fumbles?: number | null;
  fumblesLost?: number | null;
  puntReturnYards?: number | null;
  kickoffReturnYards?: number | null;
  puntReturnTouchdowns?: number | null;
  kickReturnTouchdowns?: number | null;
  defensiveTouchdowns?: number | null;
}

export interface PlayerUsageRecord {
  playerId: number;
  player: string;
  team: string;
  season: number;
  position?: string | null;
  usage?: {
    offense?: UsageSplits;
    defense?: UsageSplits;
    specialTeams?: UsageSplits;
  } | null;
}

export interface UsageSplits {
  usage?: number | null;
  targetShare?: number | null;
  rushShare?: number | null;
  snapShare?: number | null;
  pressureShare?: number | null;
}

export interface PlayerLookupParams {
  playerId?: number;
  player?: string;
  team?: string;
  year: number;
}

export async function fetchPlayerSeason(
  env: Bindings,
  params: PlayerLookupParams,
  fetcher: FetchLike
): Promise<PlayerSeasonRecord> {
  const apiKey = env.CFB_API_KEY?.trim();
  if (!apiKey) {
    throw new ConfigurationError('CFB_API_KEY is not configured');
  }

  const url = new URL(`${CFBD_BASE_URL}/player/season`);
  url.searchParams.set('year', params.year.toString());
  if (params.playerId) {
    url.searchParams.set('playerId', params.playerId.toString());
  }
  if (params.player) {
    url.searchParams.set('player', params.player);
  }
  if (params.team) {
    url.searchParams.set('team', params.team);
  }

  const response = await fetcher(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await safeErrorMessage(response);
    throw new UpstreamError(`College Football Data API error (${response.status})`, response.status, message);
  }

  const data = (await response.json()) as PlayerSeasonRecord[];
  const record = selectSeason(data, params);
  if (!record) {
    throw new NotFoundError('Player season data not found', params);
  }
  return record;
}

export async function fetchPlayerUsage(
  env: Bindings,
  params: PlayerLookupParams,
  fetcher: FetchLike
): Promise<PlayerUsageRecord | null> {
  const apiKey = env.CFB_API_KEY?.trim();
  if (!apiKey) {
    throw new ConfigurationError('CFB_API_KEY is not configured');
  }

  const url = new URL(`${CFBD_BASE_URL}/player/usage`);
  url.searchParams.set('year', params.year.toString());
  url.searchParams.set('seasonType', 'regular');
  if (params.playerId) {
    url.searchParams.set('playerId', params.playerId.toString());
  }
  if (params.player) {
    url.searchParams.set('player', params.player);
  }
  if (params.team) {
    url.searchParams.set('team', params.team);
  }

  const response = await fetcher(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await safeErrorMessage(response);
    throw new UpstreamError(`College Football Data API error (${response.status})`, response.status, message);
  }

  const data = (await response.json()) as PlayerUsageRecord[];
  const usage = selectUsage(data, params);
  return usage ?? null;
}

function selectSeason(records: PlayerSeasonRecord[], params: PlayerLookupParams) {
  const filtered = records.filter((record) => {
    if (params.playerId && record.playerId !== params.playerId) {
      return false;
    }
    if (params.player && record.player.toLowerCase() !== params.player.toLowerCase()) {
      return false;
    }
    if (params.team && record.team.toLowerCase() !== params.team.toLowerCase()) {
      return false;
    }
    return true;
  });

  const candidates = filtered.length > 0 ? filtered : records;
  const byYear = candidates.filter((record) => record.season === params.year);
  if (byYear.length > 0) {
    return prioritise(byYear);
  }
  return prioritise(candidates);
}

function selectUsage(records: PlayerUsageRecord[], params: PlayerLookupParams) {
  const filtered = records.filter((record) => {
    if (params.playerId && record.playerId !== params.playerId) {
      return false;
    }
    if (params.player && record.player.toLowerCase() !== params.player.toLowerCase()) {
      return false;
    }
    if (params.team && record.team.toLowerCase() !== params.team.toLowerCase()) {
      return false;
    }
    return true;
  });

  const candidates = filtered.length > 0 ? filtered : records;
  const byYear = candidates.filter((record) => record.season === params.year);
  if (byYear.length > 0) {
    return prioritise(byYear);
  }
  return prioritise(candidates);
}

function prioritise<T extends { season: number }>(records: T[]): T | undefined {
  return [...records].sort((a, b) => b.season - a.season)[0];
}

async function safeErrorMessage(response: Response): Promise<unknown> {
  try {
    const data = await response.json();
    return data;
  } catch {
    return response.statusText || 'Unknown error';
  }
}
