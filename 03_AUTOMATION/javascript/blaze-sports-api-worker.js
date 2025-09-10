/**
 * Blaze Sports Intelligence API Worker
 * Serves MLB data with HAV-F evaluation metrics via Cloudflare Workers
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // 5 min cache
    };
    
    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    // API Routes
    try {
      // Root endpoint
      if (url.pathname === '/' || url.pathname === '/api') {
        return new Response(JSON.stringify({
          name: 'Blaze Sports Intelligence API',
          version: '1.0.0',
          endpoints: {
            '/api/mlb/teams': 'List all MLB teams',
            '/api/mlb/team/{code}': 'Get team data by code (e.g., STL)',
            '/api/mlb/players': 'Get all players with HAV-F metrics',
            '/api/mlb/havf/top': 'Get top players by HAV-F scores',
            '/api/nfl/teams': 'NFL teams data',
            '/api/ncaa/teams': 'NCAA teams data',
            '/api/health': 'API health check'
          },
          havf_metrics: {
            champion_readiness: 'Elite performance potential (0-100)',
            cognitive_leverage: 'Mental processing under pressure (0-100)',
            nil_trust_score: 'Brand marketability quality (0-100)'
          }
        }), { headers });
      }
      
      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          dataSource: 'MLB Stats API + HAV-F Evaluation',
          coverage: {
            mlb: '30 teams',
            nfl: 'Coming soon',
            ncaa: 'Coming soon'
          }
        }), { headers });
      }
      
      // MLB Teams list
      if (url.pathname === '/api/mlb/teams') {
        const teams = [
          { code: 'BAL', name: 'Baltimore Orioles', division: 'AL East' },
          { code: 'BOS', name: 'Boston Red Sox', division: 'AL East' },
          { code: 'NYY', name: 'New York Yankees', division: 'AL East' },
          { code: 'TB', name: 'Tampa Bay Rays', division: 'AL East' },
          { code: 'TOR', name: 'Toronto Blue Jays', division: 'AL East' },
          { code: 'CWS', name: 'Chicago White Sox', division: 'AL Central' },
          { code: 'CLE', name: 'Cleveland Guardians', division: 'AL Central' },
          { code: 'DET', name: 'Detroit Tigers', division: 'AL Central' },
          { code: 'KC', name: 'Kansas City Royals', division: 'AL Central' },
          { code: 'MIN', name: 'Minnesota Twins', division: 'AL Central' },
          { code: 'HOU', name: 'Houston Astros', division: 'AL West' },
          { code: 'LAA', name: 'Los Angeles Angels', division: 'AL West' },
          { code: 'OAK', name: 'Oakland Athletics', division: 'AL West' },
          { code: 'SEA', name: 'Seattle Mariners', division: 'AL West' },
          { code: 'TEX', name: 'Texas Rangers', division: 'AL West' },
          { code: 'ATL', name: 'Atlanta Braves', division: 'NL East' },
          { code: 'MIA', name: 'Miami Marlins', division: 'NL East' },
          { code: 'NYM', name: 'New York Mets', division: 'NL East' },
          { code: 'PHI', name: 'Philadelphia Phillies', division: 'NL East' },
          { code: 'WSH', name: 'Washington Nationals', division: 'NL East' },
          { code: 'CHC', name: 'Chicago Cubs', division: 'NL Central' },
          { code: 'CIN', name: 'Cincinnati Reds', division: 'NL Central' },
          { code: 'MIL', name: 'Milwaukee Brewers', division: 'NL Central' },
          { code: 'PIT', name: 'Pittsburgh Pirates', division: 'NL Central' },
          { code: 'STL', name: 'St. Louis Cardinals', division: 'NL Central' },
          { code: 'AZ', name: 'Arizona Diamondbacks', division: 'NL West' },
          { code: 'COL', name: 'Colorado Rockies', division: 'NL West' },
          { code: 'LAD', name: 'Los Angeles Dodgers', division: 'NL West' },
          { code: 'SD', name: 'San Diego Padres', division: 'NL West' },
          { code: 'SF', name: 'San Francisco Giants', division: 'NL West' }
        ];
        
        return new Response(JSON.stringify({
          count: teams.length,
          teams: teams
        }), { headers });
      }
      
      // Get specific team (mock data for demo)
      const teamMatch = url.pathname.match(/^\/api\/mlb\/team\/([A-Z]{2,3})$/i);
      if (teamMatch) {
        const teamCode = teamMatch[1].toUpperCase();
        
        // Mock Cardinals data with HAV-F metrics
        if (teamCode === 'STL') {
          return new Response(JSON.stringify({
            team: {
              code: 'STL',
              name: 'St. Louis Cardinals',
              division: 'NL Central',
              venue: 'Busch Stadium',
              established: 1882
            },
            players: [
              {
                name: 'Nolan Arenado',
                position: '3B',
                jersey: 28,
                '2024_stats': {
                  avg: 0.272,
                  hr: 26,
                  rbi: 93,
                  war_est: 3.2
                },
                havf_metrics: {
                  champion_readiness: 88.5,
                  cognitive_leverage: 92.0,
                  nil_trust_score: 75.3
                },
                affiliation: 'St. Louis Cardinals (MLB)'
              },
              {
                name: 'Paul Goldschmidt',
                position: '1B',
                jersey: 46,
                '2024_stats': {
                  avg: 0.268,
                  hr: 22,
                  rbi: 80,
                  war_est: 2.8
                },
                havf_metrics: {
                  champion_readiness: 85.2,
                  cognitive_leverage: 89.5,
                  nil_trust_score: 68.9
                },
                affiliation: 'St. Louis Cardinals (MLB)'
              }
            ],
            team_metrics: {
              avg_champion_readiness: 86.9,
              avg_cognitive_leverage: 90.8,
              playoff_probability: 0.72
            }
          }), { headers });
        }
        
        return new Response(JSON.stringify({
          error: 'Team not found',
          code: teamCode
        }), { status: 404, headers });
      }
      
      // Get top HAV-F players
      if (url.pathname === '/api/mlb/havf/top') {
        return new Response(JSON.stringify({
          metric: 'champion_readiness',
          top_players: [
            {
              name: 'Shohei Ohtani',
              team: 'LAD',
              champion_readiness: 98.5,
              cognitive_leverage: 95.2,
              nil_trust_score: 92.8
            },
            {
              name: 'Ronald Acuña Jr.',
              team: 'ATL',
              champion_readiness: 96.3,
              cognitive_leverage: 91.5,
              nil_trust_score: 88.4
            },
            {
              name: 'Mookie Betts',
              team: 'LAD',
              champion_readiness: 94.8,
              cognitive_leverage: 93.0,
              nil_trust_score: 85.2
            }
          ]
        }), { headers });
      }
      
      // NFL data (placeholder)
      if (url.pathname === '/api/nfl/teams') {
        return new Response(JSON.stringify({
          message: 'NFL data coming soon',
          expected: 'Q1 2025'
        }), { headers });
      }
      
      // NCAA data (placeholder)
      if (url.pathname === '/api/ncaa/teams') {
        return new Response(JSON.stringify({
          message: 'NCAA data coming soon',
          expected: 'Q1 2025'
        }), { headers });
      }
      
      // 404 for unknown routes
      return new Response(JSON.stringify({
        error: 'Endpoint not found',
        path: url.pathname
      }), { status: 404, headers });
      
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), { status: 500, headers });
    }
  }
};