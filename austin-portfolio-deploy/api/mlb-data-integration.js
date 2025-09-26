/**
 * MLB Comprehensive Data Integration
 * Blaze Intelligence - The Deep South's Sports Intelligence Hub
 * All 30 MLB teams with Cardinals focus
 */

const MLB_CONFIG = {
  apiKey: process.env.MLB_STATS_API_KEY || 'demo',
  baseUrl: 'https://statsapi.mlb.com/api/v1',
  cacheTime: 60000, // 1 minute cache
  teams: {
    // National League
    'STL': { id: 138, name: 'St. Louis Cardinals', division: 'NL Central', focus: true },
    'ATL': { id: 144, name: 'Atlanta Braves', division: 'NL East' },
    'MIA': { id: 146, name: 'Miami Marlins', division: 'NL East' },
    'NYM': { id: 121, name: 'New York Mets', division: 'NL East' },
    'PHI': { id: 143, name: 'Philadelphia Phillies', division: 'NL East' },
    'WSH': { id: 120, name: 'Washington Nationals', division: 'NL East' },
    'CHC': { id: 112, name: 'Chicago Cubs', division: 'NL Central' },
    'CIN': { id: 113, name: 'Cincinnati Reds', division: 'NL Central' },
    'MIL': { id: 158, name: 'Milwaukee Brewers', division: 'NL Central' },
    'PIT': { id: 134, name: 'Pittsburgh Pirates', division: 'NL Central' },
    'ARI': { id: 109, name: 'Arizona Diamondbacks', division: 'NL West' },
    'COL': { id: 115, name: 'Colorado Rockies', division: 'NL West' },
    'LAD': { id: 119, name: 'Los Angeles Dodgers', division: 'NL West' },
    'SD': { id: 135, name: 'San Diego Padres', division: 'NL West' },
    'SF': { id: 137, name: 'San Francisco Giants', division: 'NL West' },
    // American League
    'BAL': { id: 110, name: 'Baltimore Orioles', division: 'AL East' },
    'BOS': { id: 111, name: 'Boston Red Sox', division: 'AL East' },
    'NYY': { id: 147, name: 'New York Yankees', division: 'AL East' },
    'TB': { id: 139, name: 'Tampa Bay Rays', division: 'AL East' },
    'TOR': { id: 141, name: 'Toronto Blue Jays', division: 'AL East' },
    'CWS': { id: 145, name: 'Chicago White Sox', division: 'AL Central' },
    'CLE': { id: 114, name: 'Cleveland Guardians', division: 'AL Central' },
    'DET': { id: 116, name: 'Detroit Tigers', division: 'AL Central' },
    'KC': { id: 118, name: 'Kansas City Royals', division: 'AL Central' },
    'MIN': { id: 142, name: 'Minnesota Twins', division: 'AL Central' },
    'HOU': { id: 117, name: 'Houston Astros', division: 'AL West' },
    'LAA': { id: 108, name: 'Los Angeles Angels', division: 'AL West' },
    'OAK': { id: 133, name: 'Oakland Athletics', division: 'AL West' },
    'SEA': { id: 136, name: 'Seattle Mariners', division: 'AL West' },
    'TEX': { id: 140, name: 'Texas Rangers', division: 'AL West' }
  }
};

class MLBDataIntegration {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.cardinalsSpecialMetrics = {
      clutchRating: 0,
      bullpenReadiness: 0,
      offensiveMomentum: 0,
      defensiveEfficiency: 0
    };
  }

  async fetchTeamStats(teamCode) {
    const cacheKey = `team_${teamCode}_${Date.now()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const team = MLB_CONFIG.teams[teamCode];
      if (!team) throw new Error(`Team ${teamCode} not found`);

      // Simulate API call - in production, use actual MLB Stats API
      const stats = await this.simulateMLBAPI(team);

      // Enhanced metrics for Cardinals
      if (teamCode === 'STL') {
        stats.championshipMetrics = await this.calculateCardinalsChampionshipMetrics(stats);
      }

      this.cache.set(cacheKey, stats);
      setTimeout(() => this.cache.delete(cacheKey), MLB_CONFIG.cacheTime);

      return stats;
    } catch (error) {
      console.error(`Error fetching ${teamCode} data:`, error);
      return this.getFallbackData(teamCode);
    }
  }

  async simulateMLBAPI(team) {
    // Production would fetch from: ${MLB_CONFIG.baseUrl}/teams/${team.id}/stats
    return {
      teamId: team.id,
      teamName: team.name,
      division: team.division,
      season: 2025,
      record: {
        wins: Math.floor(Math.random() * 50) + 40,
        losses: Math.floor(Math.random() * 50) + 40,
        winPct: 0
      },
      batting: {
        avg: (0.240 + Math.random() * 0.040).toFixed(3),
        ops: (0.700 + Math.random() * 0.150).toFixed(3),
        runs: Math.floor(Math.random() * 200) + 500,
        homeRuns: Math.floor(Math.random() * 100) + 100,
        rbi: Math.floor(Math.random() * 200) + 480,
        stolenBases: Math.floor(Math.random() * 80) + 40
      },
      pitching: {
        era: (3.50 + Math.random() * 1.50).toFixed(2),
        whip: (1.10 + Math.random() * 0.30).toFixed(2),
        strikeouts: Math.floor(Math.random() * 400) + 1000,
        saves: Math.floor(Math.random() * 30) + 20,
        qualityStarts: Math.floor(Math.random() * 40) + 60
      },
      fielding: {
        fieldingPct: (0.980 + Math.random() * 0.015).toFixed(3),
        errors: Math.floor(Math.random() * 50) + 40,
        doublePlays: Math.floor(Math.random() * 80) + 100
      },
      advanced: {
        war: (15 + Math.random() * 30).toFixed(1),
        wrc: Math.floor(Math.random() * 20) + 90,
        fip: (3.50 + Math.random() * 1.00).toFixed(2),
        babip: (0.290 + Math.random() * 0.030).toFixed(3)
      }
    };
  }

  async calculateCardinalsChampionshipMetrics(stats) {
    // Special Cardinals championship analytics
    const clutchRating = this.calculateClutchRating(stats);
    const bullpenReadiness = this.calculateBullpenReadiness(stats);
    const offensiveMomentum = this.calculateOffensiveMomentum(stats);
    const defensiveEfficiency = this.calculateDefensiveEfficiency(stats);

    return {
      clutchRating: (clutchRating * 100).toFixed(1),
      bullpenReadiness: (bullpenReadiness * 100).toFixed(1),
      offensiveMomentum: (offensiveMomentum * 100).toFixed(1),
      defensiveEfficiency: (defensiveEfficiency * 100).toFixed(1),
      championshipProbability: ((clutchRating + bullpenReadiness + offensiveMomentum + defensiveEfficiency) / 4 * 100).toFixed(1),
      powerRanking: this.calculatePowerRanking(stats),
      playoffOdds: this.calculatePlayoffOdds(stats),
      insights: this.generateCardinalsInsights(stats)
    };
  }

  calculateClutchRating(stats) {
    // Complex clutch performance algorithm
    const opsWeight = parseFloat(stats.batting.ops) / 0.850;
    const saveWeight = stats.pitching.saves / 50;
    return Math.min((opsWeight + saveWeight) / 2, 1.0);
  }

  calculateBullpenReadiness(stats) {
    const eraFactor = Math.max(0, 1 - (parseFloat(stats.pitching.era) - 3.00) / 2.00);
    const savesFactor = stats.pitching.saves / 50;
    return (eraFactor + savesFactor) / 2;
  }

  calculateOffensiveMomentum(stats) {
    const avgFactor = parseFloat(stats.batting.avg) / 0.270;
    const opsFactor = parseFloat(stats.batting.ops) / 0.800;
    const runsFactor = stats.batting.runs / 700;
    return Math.min((avgFactor + opsFactor + runsFactor) / 3, 1.0);
  }

  calculateDefensiveEfficiency(stats) {
    const fieldingFactor = parseFloat(stats.fielding.fieldingPct) / 0.990;
    const errorFactor = Math.max(0, 1 - stats.fielding.errors / 100);
    const dpFactor = stats.fielding.doublePlays / 150;
    return Math.min((fieldingFactor + errorFactor + dpFactor) / 3, 1.0);
  }

  calculatePowerRanking(stats) {
    const war = parseFloat(stats.advanced.war);
    if (war > 35) return 'Elite';
    if (war > 25) return 'Contender';
    if (war > 15) return 'Competitive';
    return 'Building';
  }

  calculatePlayoffOdds(stats) {
    const baseOdds = stats.record.wins / (stats.record.wins + stats.record.losses);
    const warBonus = parseFloat(stats.advanced.war) / 100;
    return Math.min((baseOdds + warBonus) * 100, 99).toFixed(1);
  }

  generateCardinalsInsights(stats) {
    const insights = [];

    if (parseFloat(stats.batting.ops) > 0.800) {
      insights.push('Elite offensive production driving championship contention');
    }

    if (parseFloat(stats.pitching.era) < 3.50) {
      insights.push('Dominant pitching staff anchoring playoff push');
    }

    if (stats.pitching.saves > 40) {
      insights.push('Lockdown bullpen creating late-game advantages');
    }

    if (parseFloat(stats.fielding.fieldingPct) > 0.985) {
      insights.push('Gold Glove caliber defense minimizing opponent opportunities');
    }

    return insights;
  }

  getFallbackData(teamCode) {
    return {
      teamCode,
      status: 'offline',
      message: 'Using cached data',
      lastUpdate: this.lastUpdate
    };
  }

  async getAllTeamsData() {
    const divisions = {
      'NL East': [], 'NL Central': [], 'NL West': [],
      'AL East': [], 'AL Central': [], 'AL West': []
    };

    for (const [code, team] of Object.entries(MLB_CONFIG.teams)) {
      const data = await this.fetchTeamStats(code);
      data.code = code;
      data.focus = team.focus || false;
      divisions[team.division].push(data);
    }

    // Sort each division by wins
    for (const division of Object.values(divisions)) {
      division.sort((a, b) => (b.record?.wins || 0) - (a.record?.wins || 0));
    }

    return divisions;
  }

  async getCardinalsLiveUpdate() {
    const data = await this.fetchTeamStats('STL');
    return {
      ...data,
      timestamp: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + MLB_CONFIG.cacheTime).toISOString()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MLBDataIntegration;
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.MLBDataIntegration = MLBDataIntegration;
}