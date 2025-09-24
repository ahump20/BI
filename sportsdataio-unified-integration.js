/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🔥 BLAZE INTELLIGENCE - SPORTSDATAIO UNIFIED INTEGRATION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * @author Austin Humphrey (ahump20@outlook.com)
 * @version 3.0 CHAMPIONSHIP EDITION
 * @date 2025-01-15
 *
 * This unified file contains the complete SportsDataIO integration for:
 * - Replit: https://blaze-intelligence.replit.app
 * - Netlify: https://blaze-intelligence.netlify.app
 * - Primary Domain: https://blaze-intelligence.com
 * - Sports Domain: https://blazesportsintel.com
 * - GitHub Pages: Multiple repositories
 *
 * API KEY: 6ca2adb39404482da5406f0a6cd7aa37
 *
 * FEATURED TEAMS:
 * ⚾ St. Louis Cardinals (MLB)
 * 🏈 Tennessee Titans (NFL)
 * 🏈 Texas Longhorns (NCAA Football)
 * 🏀 Memphis Grizzlies (NBA)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SPORTSDATAIO_CONFIG = {
  apiKey: '6ca2adb39404482da5406f0a6cd7aa37',
  baseUrls: {
    nfl: 'https://api.sportsdata.io/v3/nfl',
    mlb: 'https://api.sportsdata.io/v3/mlb',
    nba: 'https://api.sportsdata.io/v3/nba',
    ncaaFootball: 'https://api.sportsdata.io/v3/cfb',
    ncaaBasketball: 'https://api.sportsdata.io/v3/cbb'
  },
  updateIntervals: {
    mlb: 10000,      // 10 seconds
    nfl: 20000,      // 20 seconds
    ncaa: 30000,     // 30 seconds
    nba: 20000       // 20 seconds
  },
  cacheTimeout: 30000, // 30 seconds
  featuredTeams: {
    mlb: { key: 'STL', name: 'Cardinals', id: 15 },
    nfl: { key: 'TEN', name: 'Titans', id: 10 },
    nba: { key: 'MEM', name: 'Grizzlies', id: 29 },
    ncaaFootball: { school: 'Texas', name: 'Longhorns' }
  }
};

// ============================================================================
// UNIFIED API CONNECTOR CLASS
// ============================================================================

class BlazeIntelligenceSportsDataIO {
  constructor() {
    this.config = SPORTSDATAIO_CONFIG;
    this.cache = new Map();
    this.activeConnections = new Map();
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      apiCalls: 0,
      averageResponseTime: 0,
      lastUpdate: null
    };
  }

  // Core API request method with caching
  async makeRequest(sport, endpoint, params = {}) {
    const cacheKey = `${sport}_${endpoint}_${JSON.stringify(params)}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    // Build URL
    const baseUrl = this.config.baseUrls[sport];
    const url = `${baseUrl}/${endpoint}?key=${this.config.apiKey}`;

    try {
      const startTime = Date.now();
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Update metrics
      this.metrics.apiCalls++;
      this.metrics.totalRequests++;
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime * (this.metrics.apiCalls - 1) + responseTime) / this.metrics.apiCalls;
      this.metrics.lastUpdate = new Date().toISOString();

      // Cache the response
      this.setCache(cacheKey, data);

      console.log(`✅ [${sport}] ${endpoint} - ${responseTime}ms`);
      return data;

    } catch (error) {
      console.error(`❌ [${sport}] API Error:`, error);
      throw error;
    }
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  // ============================================================================
  // NFL METHODS
  // ============================================================================

  async getNFLTeams() {
    return this.makeRequest('nfl', 'scores/json/Teams');
  }

  async getNFLStandings(season = 2024) {
    return this.makeRequest('nfl', `scores/json/Standings/${season}`);
  }

  async getNFLScores(season = 2024, week = null) {
    const endpoint = week
      ? `scores/json/ScoresByWeek/${season}/${week}`
      : `scores/json/Scores/${season}`;
    return this.makeRequest('nfl', endpoint);
  }

  async getNFLPlayerStats(season = 2024) {
    return this.makeRequest('nfl', `stats/json/PlayerSeasonStats/${season}`);
  }

  async getTitansData() {
    const [teams, standings] = await Promise.all([
      this.getNFLTeams(),
      this.getNFLStandings()
    ]);

    const titans = teams.find(t => t.Key === 'TEN');
    const titansStanding = standings.find(s => s.Team === 'TEN');

    return {
      team: titans,
      standing: titansStanding,
      nextGame: await this.getTitansNextGame()
    };
  }

  async getTitansNextGame() {
    const currentWeek = this.getCurrentNFLWeek();
    const scores = await this.getNFLScores(2024, currentWeek);
    return scores.find(g =>
      g.HomeTeam === 'TEN' || g.AwayTeam === 'TEN'
    );
  }

  // ============================================================================
  // MLB METHODS
  // ============================================================================

  async getMLBTeams() {
    return this.makeRequest('mlb', 'scores/json/Teams');
  }

  async getMLBStandings(season = 2024) {
    return this.makeRequest('mlb', `scores/json/Standings/${season}`);
  }

  async getMLBGames(date = null) {
    const endpoint = date
      ? `scores/json/GamesByDate/${date}`
      : 'scores/json/Games/2024';
    return this.makeRequest('mlb', endpoint);
  }

  async getMLBPlayerStats(season = 2024) {
    return this.makeRequest('mlb', `stats/json/PlayerSeasonStats/${season}`);
  }

  async getCardinalsData() {
    const [teams, standings] = await Promise.all([
      this.getMLBTeams(),
      this.getMLBStandings()
    ]);

    const cardinals = teams.find(t => t.Key === 'STL');
    const cardinalsStanding = standings.find(s => s.Key === 'STL');

    return {
      team: cardinals,
      standing: cardinalsStanding,
      record: `${cardinalsStanding?.Wins || 0}-${cardinalsStanding?.Losses || 0}`,
      divisionRank: cardinalsStanding?.DivisionRank || 'N/A',
      nextGame: await this.getCardinalsNextGame()
    };
  }

  async getCardinalsNextGame() {
    const today = new Date().toISOString().split('T')[0];
    const games = await this.getMLBGames(today);
    return games.find(g =>
      g.HomeTeam === 'STL' || g.AwayTeam === 'STL'
    );
  }

  // ============================================================================
  // NBA METHODS
  // ============================================================================

  async getNBATeams() {
    return this.makeRequest('nba', 'scores/json/Teams');
  }

  async getNBAStandings(season = 2025) {
    return this.makeRequest('nba', `scores/json/Standings/${season}`);
  }

  async getNBAGames(date = null) {
    const endpoint = date
      ? `scores/json/GamesByDate/${date}`
      : 'scores/json/Games/2025';
    return this.makeRequest('nba', endpoint);
  }

  async getGrizzliesData() {
    const [teams, standings] = await Promise.all([
      this.getNBATeams(),
      this.getNBAStandings()
    ]);

    const grizzlies = teams.find(t => t.Key === 'MEM');
    const grizzliesStanding = standings.find(s => s.Key === 'MEM');

    return {
      team: grizzlies,
      standing: grizzliesStanding,
      record: `${grizzliesStanding?.Wins || 0}-${grizzliesStanding?.Losses || 0}`,
      conferenceRank: grizzliesStanding?.ConferenceRank || 'N/A'
    };
  }

  // ============================================================================
  // NCAA METHODS
  // ============================================================================

  async getNCAAFootballTeams() {
    return this.makeRequest('ncaaFootball', 'scores/json/Teams');
  }

  async getNCAAFootballGames(season = 2024, week = null) {
    const endpoint = week
      ? `scores/json/GamesByWeek/${season}/${week}`
      : `scores/json/Games/${season}`;
    return this.makeRequest('ncaaFootball', endpoint);
  }

  async getNCAAFootballRankings(season = 2024, week = null) {
    const endpoint = week
      ? `scores/json/Rankings/${season}/${week}`
      : `scores/json/Rankings/${season}`;
    return this.makeRequest('ncaaFootball', endpoint);
  }

  async getLonghornsData() {
    const teams = await this.getNCAAFootballTeams();
    const texas = teams.find(t =>
      t.School === 'Texas' || t.Name === 'Longhorns'
    );

    const currentWeek = this.getCurrentNCAAWeek();
    const rankings = await this.getNCAAFootballRankings(2024, currentWeek);
    const texasRanking = rankings?.find(r => r.School === 'Texas');

    return {
      team: texas,
      ranking: texasRanking,
      apRank: texasRanking?.APRank || 'NR',
      record: `${texas?.Wins || 0}-${texas?.Losses || 0}`,
      conference: 'SEC'
    };
  }

  // ============================================================================
  // UNIFIED DASHBOARD DATA
  // ============================================================================

  async getChampionshipDashboard() {
    console.log('🏆 Fetching Championship Dashboard Data...');

    const [cardinals, titans, grizzlies, longhorns] = await Promise.all([
      this.getCardinalsData(),
      this.getTitansData(),
      this.getGrizzliesData(),
      this.getLonghornsData()
    ]);

    return {
      timestamp: new Date().toISOString(),
      featuredTeams: {
        mlb: cardinals,
        nfl: titans,
        nba: grizzlies,
        ncaaFootball: longhorns
      },
      metrics: this.metrics,
      status: 'live'
    };
  }

  // ============================================================================
  // LIVE STREAMING
  // ============================================================================

  startLiveUpdates(callback, interval = 30000) {
    console.log('⚡ Starting live data streaming...');

    // Initial fetch
    this.getChampionshipDashboard().then(callback);

    // Set up interval
    const updateInterval = setInterval(async () => {
      try {
        const data = await this.getChampionshipDashboard();
        callback(data);
      } catch (error) {
        console.error('Live update error:', error);
      }
    }, interval);

    // Store interval ID for cleanup
    this.activeConnections.set('liveUpdates', updateInterval);

    return updateInterval;
  }

  stopLiveUpdates() {
    const interval = this.activeConnections.get('liveUpdates');
    if (interval) {
      clearInterval(interval);
      this.activeConnections.delete('liveUpdates');
      console.log('⏹️ Live updates stopped');
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  getCurrentNFLWeek() {
    const seasonStart = new Date('2024-09-05');
    const now = new Date();
    const weeksPassed = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(1, weeksPassed + 1), 18);
  }

  getCurrentNCAAWeek() {
    const seasonStart = new Date('2024-08-24');
    const now = new Date();
    const weeksPassed = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(1, weeksPassed + 1), 15);
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.cacheHits / this.metrics.totalRequests || 0
    };
  }
}

// ============================================================================
// UI COMPONENT GENERATORS
// ============================================================================

const BlazeUIComponents = {
  // Generate team card HTML
  createTeamCard(sport, data) {
    const sportIcons = {
      mlb: '⚾',
      nfl: '🏈',
      nba: '🏀',
      ncaaFootball: '🏈'
    };

    return `
      <div class="blaze-team-card" data-sport="${sport}">
        <div class="team-header">
          <span class="sport-icon">${sportIcons[sport]}</span>
          <h3>${data.team?.Name || data.team?.School || 'Unknown'}</h3>
        </div>
        <div class="team-stats">
          <div class="stat">
            <span class="label">Record</span>
            <span class="value">${data.record || 'N/A'}</span>
          </div>
          <div class="stat">
            <span class="label">Rank</span>
            <span class="value">${data.divisionRank || data.conferenceRank || data.apRank || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  },

  // Generate live score ticker
  createScoreTicker(games) {
    return `
      <div class="blaze-score-ticker">
        ${games.map(game => `
          <div class="game-score">
            <span class="away">${game.AwayTeam} ${game.AwayScore || 0}</span>
            <span class="vs">@</span>
            <span class="home">${game.HomeTeam} ${game.HomeScore || 0}</span>
            <span class="status">${game.Status || 'Scheduled'}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Generate championship dashboard
  createDashboard(data) {
    return `
      <div class="blaze-championship-dashboard">
        <div class="dashboard-header">
          <h1>🔥 Blaze Intelligence Championship Dashboard</h1>
          <div class="live-indicator">
            <span class="pulse"></span>
            LIVE DATA
          </div>
        </div>

        <div class="featured-teams">
          ${Object.entries(data.featuredTeams).map(([sport, teamData]) =>
            this.createTeamCard(sport, teamData)
          ).join('')}
        </div>

        <div class="metrics">
          <div class="metric">
            <span class="value">${data.metrics.totalRequests}</span>
            <span class="label">Total Requests</span>
          </div>
          <div class="metric">
            <span class="value">${Math.round(data.metrics.averageResponseTime)}ms</span>
            <span class="label">Avg Response</span>
          </div>
          <div class="metric">
            <span class="value">${Math.round(data.metrics.cacheHitRate * 100)}%</span>
            <span class="label">Cache Hit Rate</span>
          </div>
        </div>
      </div>
    `;
  }
};

// ============================================================================
// INITIALIZATION SCRIPT
// ============================================================================

const BlazeInit = {
  // Initialize for browser environment
  async initBrowser() {
    console.log('🔥 Initializing Blaze Intelligence SportsDataIO...');

    // Create global instance
    window.blazeSports = new BlazeIntelligenceSportsDataIO();

    // Start live updates if dashboard exists
    const dashboardElement = document.getElementById('blaze-dashboard');
    if (dashboardElement) {
      window.blazeSports.startLiveUpdates((data) => {
        dashboardElement.innerHTML = BlazeUIComponents.createDashboard(data);
      });
    }

    // Add to window for debugging
    window.BlazeUIComponents = BlazeUIComponents;

    console.log('✅ Blaze Intelligence Ready');
    console.log('📊 Access via: window.blazeSports');

    return window.blazeSports;
  },

  // Initialize for Node.js environment
  initNode() {
    const blazeSports = new BlazeIntelligenceSportsDataIO();

    module.exports = {
      BlazeIntelligenceSportsDataIO,
      BlazeUIComponents,
      blazeSports,
      config: SPORTSDATAIO_CONFIG
    };

    return blazeSports;
  },

  // Auto-detect environment and initialize
  autoInit() {
    if (typeof window !== 'undefined') {
      // Browser environment
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this.initBrowser);
      } else {
        this.initBrowser();
      }
    } else if (typeof module !== 'undefined' && module.exports) {
      // Node.js environment
      this.initNode();
    }
  }
};

// ============================================================================
// CSS STYLES (for injection)
// ============================================================================

const BLAZE_STYLES = `
<style>
/* Blaze Intelligence SportsDataIO Styles */
.blaze-championship-dashboard {
  font-family: 'Inter', -apple-system, sans-serif;
  background: linear-gradient(135deg, #0a0e27, #1a1a2e);
  color: #e0e6ed;
  padding: 2rem;
  border-radius: 12px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  background: linear-gradient(135deg, #BF5700, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin: 0;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4ade80;
  font-weight: bold;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

.featured-teams {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.blaze-team-card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid #BF5700;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.blaze-team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(191, 87, 0, 0.3);
}

.team-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.sport-icon {
  font-size: 2rem;
}

.team-header h3 {
  color: #9BCBEB;
  margin: 0;
  font-size: 1.5rem;
}

.team-stats {
  display: flex;
  justify-content: space-between;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat .label {
  color: #8892b0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat .value {
  color: #FFD700;
  font-size: 1.5rem;
  font-weight: bold;
}

.metrics {
  display: flex;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
}

.metric {
  text-align: center;
}

.metric .value {
  display: block;
  font-size: 2rem;
  color: #FFD700;
  font-weight: bold;
}

.metric .label {
  display: block;
  color: #8892b0;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.blaze-score-ticker {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.game-score {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  background: rgba(191, 87, 0, 0.1);
  border-left: 3px solid #BF5700;
  border-radius: 4px;
}

.game-score .status {
  color: #4ade80;
  font-size: 0.8rem;
  margin-left: 10px;
}
</style>
`;

// ============================================================================
// DEPLOYMENT CONFIGURATIONS
// ============================================================================

const DEPLOYMENT_CONFIG = {
  replit: {
    url: 'https://blaze-intelligence.replit.app',
    env: {
      SPORTSDATAIO_API_KEY: '6ca2adb39404482da5406f0a6cd7aa37'
    }
  },
  netlify: [
    {
      url: 'https://blaze-intelligence.netlify.app',
      siteId: '03417c09-4088-4dd8-8fdb-c5b29e3e58ba'
    },
    {
      url: 'https://blaze-intelligence.com',
      siteId: 'MAIN_DOMAIN'
    },
    {
      url: 'https://blazesportsintel.com',
      siteId: 'SPORTS_DOMAIN'
    },
    {
      url: 'https://blaze-3d.netlify.app',
      siteId: 'YOUR_SITE_ID'
    },
    {
      url: 'https://blaze-intelligence-main.netlify.app',
      siteId: 'YOUR_SITE_ID'
    }
  ],
  github: [
    'ahump20/BI',
    'ahump20/Blaze-Intelligence',
    'ahump20/Blaze-Intelligence-Main',
    'ahump20/Blaze-vision-ai',
    'ahump20/austin-humphrey-portfolio'
  ]
};

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

// Auto-initialize when loaded
BlazeInit.autoInit();

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
BROWSER USAGE:
--------------
// Get Cardinals data
const cardinals = await window.blazeSports.getCardinalsData();
console.log(cardinals);

// Start live updates
window.blazeSports.startLiveUpdates((data) => {
  console.log('Live data:', data);
});

// Get all featured teams
const dashboard = await window.blazeSports.getChampionshipDashboard();
console.log(dashboard);


NODE.JS USAGE:
--------------
const { blazeSports } = require('./SPORTSDATAIO_UNIFIED_INTEGRATION.js');

// Get Titans data
blazeSports.getTitansData().then(console.log);

// Get NFL standings
blazeSports.getNFLStandings(2024).then(console.log);


HTML INTEGRATION:
-----------------
<div id="blaze-dashboard"></div>
<script src="SPORTSDATAIO_UNIFIED_INTEGRATION.js"></script>


REACT INTEGRATION:
------------------
import { BlazeIntelligenceSportsDataIO } from './SPORTSDATAIO_UNIFIED_INTEGRATION.js';

const blazeSports = new BlazeIntelligenceSportsDataIO();

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    blazeSports.getChampionshipDashboard().then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
*/

// ============================================================================
// END OF UNIFIED INTEGRATION
// ============================================================================

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 BLAZE INTELLIGENCE - SPORTSDATAIO UNIFIED INTEGRATION LOADED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version: 3.0 CHAMPIONSHIP EDITION
API Key: Configured ✅
Featured Teams: Cardinals, Titans, Longhorns, Grizzlies
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);