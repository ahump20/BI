/**
 * Social Media Intelligence API for Blaze Intelligence
 *
 * Provides categorized X (Twitter) social listening streams for
 * key Blaze Intelligence partner teams. The worker retrieves
 * official team updates, community conversation, and media coverage
 * using the X v2 recent search endpoint and normalizes the payload
 * for downstream analytics dashboards.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const SEARCH_ENDPOINT = 'https://api.twitter.com/2/tweets/search/recent';

// Team configuration drives account targeting and fan sentiment discovery
const TEAM_CONFIG = {
  'st-louis-cardinals': {
    name: 'St. Louis Cardinals',
    league: 'MLB',
    officialAccounts: ['Cardinals', 'CardinalsCare'],
    mediaAccounts: ['stltoday', 'KMOXSports', 'MLBNetwork', 'TheAthleticMLB'],
    fanSearchTerms: ['#STLCards', '#CardinalNation', '"St. Louis Cardinals"', '"Cardinals baseball"'],
    fanExclusions: ['Cardinals', 'MLB', 'CardinalsCare']
  },
  'texas-longhorns-football': {
    name: 'Texas Longhorns Football',
    league: 'NCAA Football',
    officialAccounts: ['TexasFootball', 'TexasLonghorns', 'TexasSports'],
    mediaAccounts: ['LonghornNetwork', 'Horns247', 'On3Texas', 'espn'],
    fanSearchTerms: ['#HookEm', '#Longhorns', '"Texas Longhorns"', '"Texas Football"'],
    fanExclusions: ['TexasFootball', 'TexasLonghorns', 'TexasSports', 'LonghornNetwork']
  },
  'texas-longhorns-baseball': {
    name: 'Texas Longhorns Baseball',
    league: 'NCAA Baseball',
    officialAccounts: ['TexasBaseball', 'TexasSports'],
    mediaAccounts: ['LonghornNetwork', 'D1Baseball', 'Horns247'],
    fanSearchTerms: ['#HookEm', '#TexasBaseball', '"Texas Baseball"'],
    fanExclusions: ['TexasBaseball', 'TexasSports', 'LonghornNetwork']
  },
  'tennessee-titans': {
    name: 'Tennessee Titans',
    league: 'NFL',
    officialAccounts: ['Titans', 'TitansNFL'],
    mediaAccounts: ['TitansRadio', 'TitansWire', 'ESPNNFL', 'NFLNetwork'],
    fanSearchTerms: ['#Titans', '#TitanUp', '"Tennessee Titans"'],
    fanExclusions: ['Titans', 'TitansNFL', 'NFL']
  },
  'baltimore-orioles': {
    name: 'Baltimore Orioles',
    league: 'MLB',
    officialAccounts: ['Orioles', 'BirdlandInsider'],
    mediaAccounts: ['masnOrioles', 'BaltSunSports', 'MLBNetwork'],
    fanSearchTerms: ['#Birdland', '#Orioles', '"Baltimore Orioles"'],
    fanExclusions: ['Orioles', 'BirdlandInsider', 'MLBNetwork']
  },
  'memphis-grizzlies': {
    name: 'Memphis Grizzlies',
    league: 'NBA',
    officialAccounts: ['memgrizz', 'GrizzliesPR'],
    mediaAccounts: ['GrindCityMedia', 'ESPNNBA', 'TheAthleticNBA'],
    fanSearchTerms: ['#GrindCity', '#MemphisGrizzlies', '"Memphis Grizzlies"'],
    fanExclusions: ['memgrizz', 'GrizzliesPR']
  }
};

const TEAM_LIST = Object.entries(TEAM_CONFIG).map(([slug, info]) => ({
  slug,
  name: info.name,
  league: info.league
}));

const MOCK_RESPONSES = createMockDataset();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (!url.pathname.startsWith('/api/social-intelligence')) {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: CORS_HEADERS
      });
    }

    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: CORS_HEADERS
      });
    }

    if (url.pathname.endsWith('/teams')) {
      return new Response(JSON.stringify({ teams: TEAM_LIST }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    const teamKey = url.searchParams.get('team');
    if (!teamKey) {
      return new Response(JSON.stringify({
        error: 'Missing required "team" query parameter',
        teams: TEAM_LIST
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const teamConfig = TEAM_CONFIG[teamKey];
    if (!teamConfig) {
      return new Response(JSON.stringify({
        error: `Unsupported team slug: ${teamKey}`,
        teams: TEAM_LIST
      }), {
        status: 404,
        headers: CORS_HEADERS
      });
    }

    const limit = parseLimit(url.searchParams.get('limit'));
    const hours = parseHours(url.searchParams.get('hours'));
    const language = parseLanguage(url.searchParams.get('lang'));
    const useMock = shouldUseMock(env);

    if (useMock) {
      const mock = buildMockResponse(teamKey, limit, hours, language);
      return new Response(JSON.stringify(mock), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    if (!env || !env.X_BEARER_TOKEN) {
      return new Response(JSON.stringify({
        error: 'Missing X_BEARER_TOKEN secret',
        message: 'Set the X_BEARER_TOKEN environment variable with an official X API bearer token.'
      }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    const startTime = hours ? new Date(Date.now() - hours * 3600 * 1000).toISOString() : undefined;
    const requestMeta = {
      limit,
      startTime,
      language,
      requestedAt: new Date().toISOString()
    };

    try {
      const [official, fan, media] = await Promise.all([
        fetchCategoryFromX({
          label: 'official',
          query: buildAccountQuery(teamConfig.officialAccounts),
          accounts: teamConfig.officialAccounts,
          limit,
          startTime,
          language,
          env
        }),
        fetchCategoryFromX({
          label: 'fan',
          query: buildFanQuery(teamConfig),
          limit,
          startTime,
          language,
          env,
          accounts: []
        }),
        fetchCategoryFromX({
          label: 'media',
          query: buildAccountQuery(teamConfig.mediaAccounts),
          accounts: teamConfig.mediaAccounts,
          limit,
          startTime,
          language,
          env
        })
      ]);

      const responseBody = {
        team: {
          slug: teamKey,
          name: teamConfig.name,
          league: teamConfig.league
        },
        generatedAt: new Date().toISOString(),
        parameters: requestMeta,
        categories: {
          official,
          fan,
          media
        },
        usage: {
          source: 'x',
          searchEndpoint: SEARCH_ENDPOINT,
          documentation: 'https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent'
        }
      };

      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (error) {
      console.error('Social intelligence API error', error);
      return new Response(JSON.stringify({
        error: 'Failed to retrieve social intelligence data',
        message: error instanceof Error ? error.message : String(error)
      }), {
        status: 502,
        headers: CORS_HEADERS
      });
    }
  }
};

function parseLimit(raw) {
  const value = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(value) || value <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(value, MAX_LIMIT);
}

function parseHours(raw) {
  if (!raw) return undefined;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value <= 0) return undefined;
  return Math.min(value, 168); // cap at seven days for recent search
}

function parseLanguage(raw) {
  if (!raw || raw.toLowerCase() === 'en') return 'en';
  if (raw.toLowerCase() === 'any') return undefined;
  return raw;
}

function shouldUseMock(env) {
  return env && (env.SOCIAL_INTELLIGENCE_USE_MOCK === 'true' || env.NODE_ENV === 'test');
}

function buildAccountQuery(accounts = []) {
  if (!accounts.length) return undefined;
  const terms = accounts.map(handle => `from:${handle}`);
  return terms.length > 1 ? `(${terms.join(' OR ')})` : terms[0];
}

function buildFanQuery(config) {
  const { fanSearchTerms = [], fanExclusions = [], officialAccounts = [] } = config;
  if (!fanSearchTerms.length) return undefined;
  const normalizedTerms = fanSearchTerms.map(term => {
    const trimmed = term.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('#') || trimmed.startsWith('"') || trimmed.includes(':')) {
      return trimmed;
    }
    return `"${trimmed}"`;
  }).filter(Boolean);

  if (!normalizedTerms.length) return undefined;

  const includeClause = normalizedTerms.length > 1
    ? `(${normalizedTerms.join(' OR ')})`
    : normalizedTerms[0];

  const exclusionHandles = [...new Set([...fanExclusions, ...officialAccounts])];
  const exclusionClause = exclusionHandles
    .filter(Boolean)
    .map(handle => `-from:${handle}`)
    .join(' ');

  return exclusionClause ? `${includeClause} ${exclusionClause}` : includeClause;
}

async function fetchCategoryFromX({ label, query, accounts = [], limit, startTime, language, env }) {
  const category = {
    label,
    query,
    accounts,
    items: [],
    limit,
    startTime,
    language,
    error: null,
    rateLimit: null,
    totalAvailable: 0,
    nextToken: null
  };

  if (!query) {
    category.error = `No query configured for ${label} category`;
    return category;
  }

  const maxResults = Math.max(Math.min(limit, 100), 10);
  const searchUrl = new URL(SEARCH_ENDPOINT);
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('max_results', String(maxResults));
  searchUrl.searchParams.set('tweet.fields', 'created_at,lang,public_metrics,author_id,possibly_sensitive,referenced_tweets');
  searchUrl.searchParams.set('expansions', 'author_id');
  searchUrl.searchParams.set('user.fields', 'name,username,verified,profile_image_url,public_metrics,description,location');
  if (startTime) {
    searchUrl.searchParams.set('start_time', startTime);
  }

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Bearer ${env.X_BEARER_TOKEN}`,
      'User-Agent': 'BlazeIntelligenceSocialIntel/1.0'
    }
  });

  category.rateLimit = extractRateLimit(response.headers);
  const payload = await safeJson(response);

  if (!response.ok) {
    category.error = {
      status: response.status,
      detail: payload
    };
    return category;
  }

  const users = new Map();
  for (const user of payload?.includes?.users ?? []) {
    users.set(user.id, user);
  }

  const normalized = (payload?.data ?? [])
    .filter(tweet => !tweet.possibly_sensitive)
    .filter(tweet => !language || language === 'any' || tweet.lang === language)
    .map(tweet => normalizeTweet(tweet, users.get(tweet.author_id), label))
    .filter(item => {
      if (!accounts.length || !item.author?.username) return true;
      return accounts.some(handle => handle.toLowerCase() === item.author.username.toLowerCase());
    });

  category.totalAvailable = normalized.length;
  category.items = normalized.slice(0, limit);
  category.nextToken = payload?.meta?.next_token ?? null;

  return category;
}

function normalizeTweet(tweet, author, category) {
  const publicMetrics = tweet.public_metrics ?? {};
  return {
    id: tweet.id,
    text: tweet.text,
    createdAt: tweet.created_at,
    language: tweet.lang,
    url: author?.username ? `https://twitter.com/${author.username}/status/${tweet.id}` : null,
    author: author
      ? {
          id: author.id,
          name: author.name,
          username: author.username,
          verified: Boolean(author.verified),
          profileImageUrl: author.profile_image_url,
          followers: author.public_metrics?.followers_count,
          accountType: category
        }
      : null,
    metrics: {
      likes: publicMetrics.like_count ?? 0,
      replies: publicMetrics.reply_count ?? 0,
      reposts: publicMetrics.retweet_count ?? 0,
      quotes: publicMetrics.quote_count ?? 0,
      impressions: publicMetrics.impression_count
    },
    referencedTweets: tweet.referenced_tweets ?? [],
    category
  };
}

function extractRateLimit(headers) {
  if (!headers) return null;
  const limit = headers.get('x-rate-limit-limit');
  const remaining = headers.get('x-rate-limit-remaining');
  const reset = headers.get('x-rate-limit-reset');
  if (!limit) return null;
  return {
    limit: Number.parseInt(limit, 10),
    remaining: remaining ? Number.parseInt(remaining, 10) : undefined,
    reset: reset ? new Date(Number.parseInt(reset, 10) * 1000).toISOString() : undefined
  };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function buildMockResponse(teamKey, limit, hours, language) {
  const base = MOCK_RESPONSES[teamKey] ?? MOCK_RESPONSES.generic;
  return {
    team: base.team,
    generatedAt: new Date().toISOString(),
    parameters: {
      limit,
      startTime: hours ? new Date(Date.now() - hours * 3600 * 1000).toISOString() : undefined,
      language,
      requestedAt: new Date().toISOString(),
      mock: true
    },
    categories: {
      official: {
        ...base.categories.official,
        items: base.categories.official.items.slice(0, limit)
      },
      fan: {
        ...base.categories.fan,
        items: base.categories.fan.items.slice(0, limit)
      },
      media: {
        ...base.categories.media,
        items: base.categories.media.items.slice(0, limit)
      }
    },
    usage: base.usage
  };
}

function createMockDataset() {
  const baseTimestamp = '2025-09-18T14:00:00Z';
  return {
    generic: {
      team: {
        slug: 'generic-team',
        name: 'Generic Team',
        league: 'N/A'
      },
      categories: {
        official: makeMockCategory('official', ['OfficialSource'], baseTimestamp),
        fan: makeMockCategory('fan', [], baseTimestamp),
        media: makeMockCategory('media', ['MediaOutlet'], baseTimestamp)
      },
      usage: {
        source: 'x',
        mock: true
      }
    },
    'st-louis-cardinals': {
      team: {
        slug: 'st-louis-cardinals',
        name: 'St. Louis Cardinals',
        league: 'MLB'
      },
      categories: {
        official: makeMockCategory('official', ['Cardinals'], baseTimestamp, '#STLCards take the series in Chicago!'),
        fan: makeMockCategory('fan', [], baseTimestamp, 'Loving the energy from the rookies this week! #CardinalNation'),
        media: makeMockCategory('media', ['stltoday'], baseTimestamp, 'Injury update: Cardinals expect key arms back next week. Full breakdown on STLToday.')
      },
      usage: {
        source: 'x',
        mock: true
      }
    },
    'texas-longhorns-football': {
      team: {
        slug: 'texas-longhorns-football',
        name: 'Texas Longhorns Football',
        league: 'NCAA Football'
      },
      categories: {
        official: makeMockCategory('official', ['TexasFootball'], baseTimestamp, 'Longhorns lock in for conference play. #HookEm'),
        fan: makeMockCategory('fan', [], baseTimestamp, 'The atmosphere in Austin is unreal right now. This defense is dialed in. #HookEm'),
        media: makeMockCategory('media', ['Horns247'], baseTimestamp, 'Film room: How Texas is creating mismatches for its tight ends heading into league play.')
      },
      usage: {
        source: 'x',
        mock: true
      }
    },
    'texas-longhorns-baseball': {
      team: {
        slug: 'texas-longhorns-baseball',
        name: 'Texas Longhorns Baseball',
        league: 'NCAA Baseball'
      },
      categories: {
        official: makeMockCategory('official', ['TexasBaseball'], baseTimestamp, 'First pitch moved to 6:35 p.m. due to weather. See you at the Disch!'),
        fan: makeMockCategory('fan', [], baseTimestamp, 'Can we talk about how electric this bullpen has been? #TexasBaseball'),
        media: makeMockCategory('media', ['D1Baseball'], baseTimestamp, 'Series preview: Texas hosts a top-10 matchup this weekend with postseason seeding on the line.')
      },
      usage: {
        source: 'x',
        mock: true
      }
    },
    'tennessee-titans': {
      team: {
        slug: 'tennessee-titans',
        name: 'Tennessee Titans',
        league: 'NFL'
      },
      categories: {
        official: makeMockCategory('official', ['Titans'], baseTimestamp, 'Final: Titans close out a home win in front of a packed Nissan Stadium. #TitanUp'),
        fan: makeMockCategory('fan', [], baseTimestamp, 'That goal line stand was massive. Defense is finally healthy! #TitanUp'),
        media: makeMockCategory('media', ['TitansWire'], baseTimestamp, 'Titans film study: How the revamped offensive line protected in Week 2.')
      },
      usage: {
        source: 'x',
        mock: true
      }
    },
    'baltimore-orioles': {
      team: {
        slug: 'baltimore-orioles',
        name: 'Baltimore Orioles',
        league: 'MLB'
      },
      categories: {
        official: makeMockCategory('official', ['Orioles'], baseTimestamp, 'Birdland, we clinched! Orange fireworks all night long at Camden Yards.'),
        fan: makeMockCategory('fan', [], baseTimestamp, 'The vibes in Birdland are immaculate. Adley is HIM. #Birdland'),
        media: makeMockCategory('media', ['masnOrioles'], baseTimestamp, 'MASN breakdown: Orioles pitching depth continues to impress down the stretch.')
      },
      usage: {
        source: 'x',
        mock: true
      }
    },
    'memphis-grizzlies': {
      team: {
        slug: 'memphis-grizzlies',
        name: 'Memphis Grizzlies',
        league: 'NBA'
      },
      categories: {
        official: makeMockCategory('official', ['memgrizz'], baseTimestamp, 'Grizzlies announce preseason schedule and fan fest details. #GrindCity'),
        fan: makeMockCategory('fan', [], baseTimestamp, 'The new rotation looks scary with the rookies getting reps. #GrindCity'),
        media: makeMockCategory('media', ['GrindCityMedia'], baseTimestamp, 'Podcast drop: Breaking down Memphis\' position battles heading into camp.')
      },
      usage: {
        source: 'x',
        mock: true
      }
    }
  };
}

function makeMockCategory(label, accounts = [], timestamp, sampleText) {
  const sample = sampleText ?? 'Sample social insight for testing environments.';
  return {
    label,
    query: 'mock-query',
    accounts,
    items: [
      {
        id: `${label}-post-1`,
        text: sample,
        createdAt: timestamp,
        language: 'en',
        url: 'https://twitter.com/mock/status/1',
        author: accounts.length
          ? {
              id: `${accounts[0]}-id`,
              name: accounts[0],
              username: accounts[0],
              verified: true,
              profileImageUrl: null,
              followers: 100000,
              accountType: label
            }
          : {
              id: `${label}-fan-id`,
              name: 'Community Voice',
              username: 'fan_voice',
              verified: false,
              profileImageUrl: null,
              followers: 2500,
              accountType: label
            },
        metrics: {
          likes: 120,
          replies: 12,
          reposts: 18,
          quotes: 3,
          impressions: 25000
        },
        referencedTweets: [],
        category: label
      }
    ]
  };
}
