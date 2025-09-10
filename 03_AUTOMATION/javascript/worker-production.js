export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    switch (url.pathname) {
      case '/api/health':
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }), { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      
      case '/api/prospects':
        // Mock top prospects for demo
        const prospects = [
          {
            name: "Quinn Ewers",
            position: "QB",
            team: "Texas Longhorns",
            havf_composite: 81.9,
            champion_readiness: 75.8,
            cognitive_leverage: 82.4,
            nil_trust_score: 91.2
          },
          {
            name: "Derrick Henry",
            position: "RB", 
            team: "Tennessee Titans",
            havf_composite: 79.1,
            champion_readiness: 89.7,
            cognitive_leverage: 65.3,
            nil_trust_score: 78.4
          },
          {
            name: "Paul Goldschmidt",
            position: "1B",
            team: "St. Louis Cardinals", 
            havf_composite: 62.3,
            champion_readiness: 67.4,
            cognitive_leverage: 71.2,
            nil_trust_score: 45.8
          }
        ];
        
        return new Response(JSON.stringify(prospects), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      
      case '/api/readiness':
        const readiness = {
          timestamp: new Date().toISOString(),
          sports: {
            MLB: { averageReadiness: 56.4, topTeam: "Cardinals" },
            NFL: { averageReadiness: 58.1, topTeam: "Titans" },
            NCAA: { averageReadiness: 66.0, topTeam: "Longhorns" }
          }
        };
        
        return new Response(JSON.stringify(readiness), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
        
      case '/api/teams':
        const teams = [
          { name: "St. Louis Cardinals", sport: "MLB", readiness: 56.4, status: "yellow" },
          { name: "Tennessee Titans", sport: "NFL", readiness: 58.1, status: "yellow" },
          { name: "Texas Longhorns", sport: "NCAA-FB", readiness: 66.0, status: "yellow" }
        ];
        
        return new Response(JSON.stringify(teams), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      
      default:
        return new Response('Blaze Intelligence API v2.0\n\nEndpoints:\n- /api/health\n- /api/prospects\n- /api/readiness\n- /api/teams', {
          headers: { 'Content-Type': 'text/plain', ...corsHeaders }
        });
    }
  }
};
