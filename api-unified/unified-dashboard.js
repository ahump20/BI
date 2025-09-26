const fs = require('fs/promises');
const path = require('path');

const DASHBOARD_DATA_PATH = path.join(process.cwd(), 'data', 'dashboard', 'unified-dashboard.json');
const TEAM_METRICS_PATH = path.join(process.cwd(), 'src', 'team-metrics.json');
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache window

let cachedPayload = null;
let cacheTimestamp = 0;

const TEAM_KEY_MAP = {
  UT: 'longhorns',
  STL: 'cardinals',
  TEN: 'titans'
};

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (cachedPayload && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'HIT'
        },
        body: JSON.stringify(cachedPayload)
      };
    }

    const [dashboardRaw, teamMetricsRaw] = await Promise.all([
      fs.readFile(DASHBOARD_DATA_PATH, 'utf8'),
      fs.readFile(TEAM_METRICS_PATH, 'utf8').catch(() => null)
    ]);

    const dashboardData = JSON.parse(dashboardRaw);
    const teamMetricsData = teamMetricsRaw ? JSON.parse(teamMetricsRaw) : null;

    const cloudinaryConfig = dashboardData.cloudinary || {};
    const cloudName = cloudinaryConfig.cloudName;
    const baseUrl = cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload` : null;

    const buildAssetUrl = (publicId, transformKey) => {
      if (!publicId || !baseUrl) return null;
      const transformation = cloudinaryConfig.transformations?.[transformKey];
      if (transformation) {
        return `${baseUrl}/${transformation}/${publicId}`;
      }
      return `${baseUrl}/${publicId}`;
    };

    const players = (dashboardData.players || []).map((player) => ({
      ...player,
      portraitUrl: buildAssetUrl(player.portraitPublicId, 'playerCard')
    }));

    const teams = (dashboardData.teams || []).map((team) => {
      const metricsKey = TEAM_KEY_MAP[team.code];
      const extraMetrics = metricsKey && teamMetricsData?.teams?.[metricsKey] ? teamMetricsData.teams[metricsKey] : {};
      return {
        ...team,
        metrics: {
          blazeScore: extraMetrics.blazeScore ?? null,
          organizationalHealth: extraMetrics.organizationalHealth ?? null,
          tier: extraMetrics.tier ?? null,
          championshipProbability: extraMetrics.championshipProbability ?? extraMetrics.playoffProbability ?? null
        },
        logoUrl: buildAssetUrl(team.logoPublicId, 'teamLogo')
      };
    });

    const resources = (dashboardData.resources || []).map((resource) => ({
      ...resource,
      heroUrl: buildAssetUrl(resource.heroPublicId, 'resourceHero')
    }));

    const payload = {
      updatedAt: dashboardData.updatedAt,
      cloudinary: {
        ...cloudinaryConfig,
        baseUrl
      },
      players,
      teams,
      resources
    };

    cachedPayload = payload;
    cacheTimestamp = Date.now();

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'MISS'
      },
      body: JSON.stringify(payload)
    };
  } catch (error) {
    console.error('Unified dashboard API error', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to load dashboard data',
        message: error.message
      })
    };
  }
};
