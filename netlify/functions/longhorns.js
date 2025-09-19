const fs = require('fs');
const path = require('path');

const DATA_ROOT = path.join(__dirname, '..', '..', 'data', 'longhorns');

const SPORT_INDEX = {
  football: {
    2023: 'football-2023.json'
  },
  baseball: {
    2023: 'baseball-2023.json'
  }
};

function listAvailableSeasons(sportKey) {
  const seasonMap = SPORT_INDEX[sportKey];
  if (!seasonMap) {
    return [];
  }
  return Object.keys(seasonMap)
    .map((season) => Number(season))
    .filter((season) => Number.isFinite(season))
    .sort((a, b) => a - b);
}

function resolveSeasonFile(sportKey, season) {
  const seasonMap = SPORT_INDEX[sportKey];
  if (!seasonMap) {
    return null;
  }
  if (season && seasonMap[season]) {
    return seasonMap[season];
  }
  const availableSeasons = listAvailableSeasons(sportKey);
  if (availableSeasons.length === 0) {
    return null;
  }
  const latestSeason = availableSeasons[availableSeasons.length - 1];
  return seasonMap[String(latestSeason)];
}

function loadSeasonData(sportKey, season) {
  const fileName = resolveSeasonFile(sportKey, season);
  if (!fileName) {
    return null;
  }
  const filePath = path.join(DATA_ROOT, fileName);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.error(`Failed to read Longhorns data for ${sportKey} ${season || ''}:`, error);
    return null;
  }
}

function shapeResponse(data, options = {}) {
  if (!data) {
    return { statusCode: 404, body: JSON.stringify({ error: 'not_found', message: 'Requested season data is unavailable.' }) };
  }

  const { sportKey, season, category } = options;
  const availableSeasons = listAvailableSeasons(sportKey);
  const latestSeason = availableSeasons.length ? availableSeasons[availableSeasons.length - 1] : null;
  const selectedSeason = season && availableSeasons.includes(Number(season)) ? Number(season) : latestSeason;

  let payload = data;
  if (category) {
    const section = data[category];
    if (typeof section === 'undefined') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'invalid_category',
          message: `Category "${category}" is not available for ${sportKey}.`,
          availableCategories: Object.keys(data)
        })
      };
    }
    payload = section;
  }

  const response = {
    sport: sportKey,
    season: selectedSeason,
    availableSeasons,
    dataStatus: data?.meta?.dataStatus || 'unknown',
    lastUpdated: data?.meta?.lastUpdated || null,
    requestedCategory: category || null,
    data: payload,
    metadata: {
      summaryAvailable: Boolean(data.summary),
      scheduleAvailable: Array.isArray(data.schedule),
      keyPlayersAvailable: Boolean(data.keyPlayers),
      updatePlanIncluded: Boolean(data.updatePlan)
    }
  };

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(response)
  };
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const sportKey = (params.sport || 'football').toLowerCase();

  if (!SPORT_INDEX[sportKey]) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: 'invalid_sport',
        message: 'Supported sports are football and baseball.',
        supportedSports: Object.keys(SPORT_INDEX)
      })
    };
  }

  const seasonParam = params.season ? Number(params.season) : null;
  const category = params.category ? params.category.trim() : null;

  const data = loadSeasonData(sportKey, seasonParam ? String(seasonParam) : null);
  if (!data) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: 'not_found',
        message: 'Season data not available yet. Check updatePlan for ingestion priorities.'
      })
    };
  }

  return shapeResponse(data, { sportKey, season: seasonParam, category });
};
