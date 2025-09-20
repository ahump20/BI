const toNullableNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const resolveRecordSummary = (records) => {
  if (!Array.isArray(records)) {
    return null;
  }
  const preferred = records.find((record) => record.type === 'total');
  const fallback = preferred ?? records[0];
  return fallback?.summary ?? null;
};

const formatInning = (situation, status) => {
  if (!situation) {
    return status?.shortDetail ?? status?.detail ?? status?.description ?? null;
  }
  const inning = typeof situation.inning === 'number' ? situation.inning : null;
  const half = typeof situation.inningHalf === 'string' ? situation.inningHalf : null;
  if (inning == null && !half) {
    return status?.shortDetail ?? status?.detail ?? status?.description ?? null;
  }
  const label = half ? `${half.charAt(0).toUpperCase()}${half.slice(1)} ` : '';
  const formatted = `${label}${inning ?? ''}`.trim();
  if (formatted.length > 0) {
    return formatted;
  }
  return status?.shortDetail ?? status?.detail ?? status?.description ?? null;
};

const extractBroadcasts = (competition) => {
  if (!Array.isArray(competition?.broadcasts)) {
    return [];
  }
  const seen = new Set();
  const broadcasts = [];
  for (const broadcast of competition.broadcasts) {
    const candidates = Array.isArray(broadcast?.names) ? broadcast.names : [];
    for (const name of candidates) {
      if (typeof name === 'string' && name.trim().length > 0 && !seen.has(name)) {
        seen.add(name);
        broadcasts.push(name);
      }
    }
  }
  return broadcasts;
};

const mapTeam = (competitor) => {
  if (!competitor?.team) {
    return null;
  }

  const score = toNullableNumber(competitor.score);
  const linescores = Array.isArray(competitor.linescores)
    ? competitor.linescores.map((line) => toNullableNumber(line?.value ?? line)).filter((value) => value != null)
    : undefined;

  return {
    id: competitor.team.id ?? null,
    name: competitor.team.displayName ?? competitor.team.name ?? null,
    abbreviation: competitor.team.abbreviation ?? null,
    location: competitor.team.location ?? null,
    logo: Array.isArray(competitor.team.logos) && competitor.team.logos[0]?.href ? competitor.team.logos[0].href : null,
    score,
    record: resolveRecordSummary(competitor.records) ?? competitor.record ?? null,
    ranking: competitor.curatedRank?.current ?? null,
    linescores,
  };
};

const createMlbDetails = (competition, status) => {
  const situation = competition?.situation ?? {};
  return {
    inning: formatInning(situation, status),
    balls: toNullableNumber(situation.balls),
    strikes: toNullableNumber(situation.strikes),
    outs: toNullableNumber(situation.outs),
    onFirst: Boolean(situation.onFirst),
    onSecond: Boolean(situation.onSecond),
    onThird: Boolean(situation.onThird),
    lastPlay: situation.lastPlay?.text ?? null,
  };
};

const createNflDetails = (competition, status) => {
  const situation = competition?.situation ?? {};
  return {
    clock: situation.clock ?? competition?.status?.displayClock ?? status?.shortDetail ?? null,
    possession: situation.possession ?? null,
    downDistanceText: situation.shortDownDistanceText ?? situation.downDistanceText ?? null,
    lastPlay: situation.lastPlay?.text ?? null,
  };
};

const createBasketballDetails = (competition, status) => {
  const situation = competition?.situation ?? {};
  return {
    clock: situation.clock ?? competition?.status?.displayClock ?? status?.shortDetail ?? null,
    possession: situation.possession ?? null,
    lastPlay: situation.lastPlay?.text ?? null,
  };
};

const findCompetitor = (competition, homeAway) => {
  if (!Array.isArray(competition?.competitors)) {
    return null;
  }
  return competition.competitors.find((competitor) => competitor?.homeAway === homeAway) ?? null;
};

const mapScoreboardGame = (league, event) => {
  const competition = Array.isArray(event?.competitions) ? event.competitions[0] : null;
  if (!competition) {
    return null;
  }

  const status = competition.status?.type ?? event.status?.type ?? {};
  const home = findCompetitor(competition, 'home');
  const away = findCompetitor(competition, 'away');

  const summary = {
    id: event.id,
    uid: event.uid ?? null,
    league: league.toUpperCase(),
    name: event.name ?? null,
    shortName: event.shortName ?? null,
    startTime: competition.date ?? event.date ?? null,
    venue: competition.venue?.fullName ?? null,
    status: {
      state: status.state ?? status.name ?? null,
      detail: status.detail ?? status.description ?? null,
      shortDetail: status.shortDetail ?? status.detail ?? status.description ?? null,
      completed: Boolean(status.completed ?? (status.state === 'post' || status.state === 'final')),
    },
    broadcasts: extractBroadcasts(competition),
    home: mapTeam(home),
    away: mapTeam(away),
  };

  if (league === 'mlb') {
    summary.mlb = createMlbDetails(competition, status);
  } else if (league === 'nfl') {
    summary.nfl = createNflDetails(competition, status);
  } else if (league === 'nba') {
    summary.nba = createBasketballDetails(competition, status);
  }

  return summary;
};

const normalizeScoreboardParams = (params = {}) => {
  const normalized = {};

  const datesInput = params.dates ?? params.date;
  if (typeof datesInput === 'string' && datesInput.trim().length > 0) {
    const clean = datesInput.replace(/-/g, '');
    if (/^\d{8}$/.test(clean)) {
      normalized.dates = clean;
    }
  } else if (typeof datesInput === 'number' && Number.isFinite(datesInput)) {
    const padded = datesInput.toString().padStart(8, '0');
    if (/^\d{8}$/.test(padded)) {
      normalized.dates = padded;
    }
  }

  if (params.week != null) {
    const week = Number.parseInt(params.week, 10);
    if (Number.isFinite(week) && week > 0) {
      normalized.week = week.toString();
    }
  }

  if (params.season != null) {
    const season = Number.parseInt(params.season, 10);
    if (Number.isFinite(season)) {
      normalized.season = season.toString();
    }
  }

  const seasonTypeInput = params.seasontype ?? params.seasonType;
  if (seasonTypeInput != null) {
    const seasonType = Number.parseInt(seasonTypeInput, 10);
    if (Number.isFinite(seasonType)) {
      normalized.seasontype = seasonType.toString();
    }
  }

  if (params.limit != null) {
    const limit = Number.parseInt(params.limit, 10);
    if (Number.isFinite(limit) && limit > 0) {
      normalized.limit = Math.min(limit, 100).toString();
    }
  }

  return normalized;
};

const normalizeStandingsParams = (params = {}) => {
  const normalized = {};
  if (params.season != null) {
    const season = Number.parseInt(params.season, 10);
    if (Number.isFinite(season)) {
      normalized.season = season.toString();
    }
  }
  if (params.group != null) {
    const group = Number.parseInt(params.group, 10);
    if (Number.isFinite(group)) {
      normalized.group = group.toString();
    }
  }
  return normalized;
};

const normalizeStandings = (league, payload) => {
  const groups = Array.isArray(payload?.children) ? payload.children : [];
  const result = [];

  for (const group of groups) {
    const entries = Array.isArray(group?.standings?.entries) ? group.standings.entries : [];
    const teams = [];
    for (const entry of entries) {
      const stats = Array.isArray(entry?.stats) ? entry.stats : [];
      const statMap = {};
      for (const stat of stats) {
        if (!stat?.name) {
          continue;
        }
        const value = stat.value ?? stat.displayValue ?? stat.description ?? null;
        switch (stat.name) {
          case 'gamesPlayed':
            statMap.gamesPlayed = toNullableNumber(value);
            break;
          case 'wins':
            statMap.wins = toNullableNumber(value);
            break;
          case 'losses':
            statMap.losses = toNullableNumber(value);
            break;
          case 'ties':
            statMap.ties = toNullableNumber(value);
            break;
          case 'winPercent':
            statMap.winPercent = typeof value === 'number' ? value : toNullableNumber(value);
            break;
          case 'gamesBack':
            statMap.gamesBack = typeof value === 'string' ? value : toNullableNumber(value);
            break;
          case 'runsFor':
          case 'pointsFor':
            statMap.pointsFor = toNullableNumber(value);
            break;
          case 'runsAgainst':
          case 'pointsAgainst':
            statMap.pointsAgainst = toNullableNumber(value);
            break;
          case 'streak':
            statMap.streak = typeof value === 'string' ? value : null;
            break;
          default:
            break;
        }
      }

      teams.push({
        teamId: entry?.team?.id ?? null,
        teamName: entry?.team?.displayName ?? entry?.team?.name ?? null,
        abbreviation: entry?.team?.abbreviation ?? null,
        record: entry?.stats?.find((stat) => stat.name === 'overallRecord')?.displayValue ?? null,
        stats: statMap,
      });
    }

    result.push({
      id: group?.id ?? null,
      name: group?.name ?? null,
      abbreviation: group?.abbreviation ?? null,
      teams,
    });
  }

  return {
    league: league.toUpperCase(),
    season: payload?.season?.year ?? null,
    fetched_at: new Date().toISOString(),
    groups: result,
  };
};

export {
  mapScoreboardGame,
  normalizeScoreboardParams,
  normalizeStandings,
  normalizeStandingsParams,
  toNullableNumber,
};
