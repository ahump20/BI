/**
 * NFL Comprehensive Data Integration
 * Blaze Intelligence - The Deep South's Sports Intelligence Hub
 * All 32 NFL teams with Titans focus
 */

const NFL_CONFIG = {
  apiKey: process.env.NFL_API_KEY || 'demo',
  baseUrl: 'https://api.sportsdata.io/v3/nfl',
  cacheTime: 180000, // 3 minutes cache
  teams: {
    // AFC East
    'BUF': { id: 1, name: 'Buffalo Bills', conference: 'AFC', division: 'East', city: 'Buffalo' },
    'MIA': { id: 2, name: 'Miami Dolphins', conference: 'AFC', division: 'East', city: 'Miami' },
    'NE': { id: 3, name: 'New England Patriots', conference: 'AFC', division: 'East', city: 'Foxborough' },
    'NYJ': { id: 4, name: 'New York Jets', conference: 'AFC', division: 'East', city: 'East Rutherford' },
    // AFC North
    'BAL': { id: 5, name: 'Baltimore Ravens', conference: 'AFC', division: 'North', city: 'Baltimore' },
    'CIN': { id: 6, name: 'Cincinnati Bengals', conference: 'AFC', division: 'North', city: 'Cincinnati' },
    'CLE': { id: 7, name: 'Cleveland Browns', conference: 'AFC', division: 'North', city: 'Cleveland' },
    'PIT': { id: 8, name: 'Pittsburgh Steelers', conference: 'AFC', division: 'North', city: 'Pittsburgh' },
    // AFC South
    'HOU': { id: 9, name: 'Houston Texans', conference: 'AFC', division: 'South', city: 'Houston' },
    'IND': { id: 10, name: 'Indianapolis Colts', conference: 'AFC', division: 'South', city: 'Indianapolis' },
    'JAX': { id: 11, name: 'Jacksonville Jaguars', conference: 'AFC', division: 'South', city: 'Jacksonville' },
    'TEN': { id: 12, name: 'Tennessee Titans', conference: 'AFC', division: 'South', city: 'Nashville', focus: true },
    // AFC West
    'DEN': { id: 13, name: 'Denver Broncos', conference: 'AFC', division: 'West', city: 'Denver' },
    'KC': { id: 14, name: 'Kansas City Chiefs', conference: 'AFC', division: 'West', city: 'Kansas City' },
    'LV': { id: 15, name: 'Las Vegas Raiders', conference: 'AFC', division: 'West', city: 'Las Vegas' },
    'LAC': { id: 16, name: 'Los Angeles Chargers', conference: 'AFC', division: 'West', city: 'Los Angeles' },
    // NFC East
    'DAL': { id: 17, name: 'Dallas Cowboys', conference: 'NFC', division: 'East', city: 'Arlington' },
    'NYG': { id: 18, name: 'New York Giants', conference: 'NFC', division: 'East', city: 'East Rutherford' },
    'PHI': { id: 19, name: 'Philadelphia Eagles', conference: 'NFC', division: 'East', city: 'Philadelphia' },
    'WAS': { id: 20, name: 'Washington Commanders', conference: 'NFC', division: 'East', city: 'Landover' },
    // NFC North
    'CHI': { id: 21, name: 'Chicago Bears', conference: 'NFC', division: 'North', city: 'Chicago' },
    'DET': { id: 22, name: 'Detroit Lions', conference: 'NFC', division: 'North', city: 'Detroit' },
    'GB': { id: 23, name: 'Green Bay Packers', conference: 'NFC', division: 'North', city: 'Green Bay' },
    'MIN': { id: 24, name: 'Minnesota Vikings', conference: 'NFC', division: 'North', city: 'Minneapolis' },
    // NFC South
    'ATL': { id: 25, name: 'Atlanta Falcons', conference: 'NFC', division: 'South', city: 'Atlanta' },
    'CAR': { id: 26, name: 'Carolina Panthers', conference: 'NFC', division: 'South', city: 'Charlotte' },
    'NO': { id: 27, name: 'New Orleans Saints', conference: 'NFC', division: 'South', city: 'New Orleans' },
    'TB': { id: 28, name: 'Tampa Bay Buccaneers', conference: 'NFC', division: 'South', city: 'Tampa' },
    // NFC West
    'ARI': { id: 29, name: 'Arizona Cardinals', conference: 'NFC', division: 'West', city: 'Glendale' },
    'LAR': { id: 30, name: 'Los Angeles Rams', conference: 'NFC', division: 'West', city: 'Los Angeles' },
    'SF': { id: 31, name: 'San Francisco 49ers', conference: 'NFC', division: 'West', city: 'Santa Clara' },
    'SEA': { id: 32, name: 'Seattle Seahawks', conference: 'NFC', division: 'West', city: 'Seattle' }
  }
};

class NFLDataIntegration {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.titansSpecialMetrics = {
      offensiveExplosiveness: 0,
      defensiveIntensity: 0,
      specialTeamsEdge: 0,
      clutchPerformance: 0
    };
  }

  async fetchTeamStats(teamCode) {
    const cacheKey = `nfl_team_${teamCode}_${Math.floor(Date.now() / NFL_CONFIG.cacheTime)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const team = NFL_CONFIG.teams[teamCode];
      if (!team) throw new Error(`Team ${teamCode} not found`);

      const stats = await this.simulateNFLAPI(team);

      // Enhanced metrics for Titans
      if (teamCode === 'TEN') {
        stats.championshipMetrics = await this.calculateTitansChampionshipMetrics(stats);
      }

      this.cache.set(cacheKey, stats);
      setTimeout(() => this.cache.delete(cacheKey), NFL_CONFIG.cacheTime);

      return stats;
    } catch (error) {
      console.error(`Error fetching ${teamCode} data:`, error);
      return this.getFallbackData(teamCode);
    }
  }

  async simulateNFLAPI(team) {
    const gamesSim = Math.floor(Math.random() * 5) + 12; // Simulate 12-17 games played
    const wins = Math.floor(Math.random() * (gamesSim + 1));
    const losses = gamesSim - wins;

    return {
      teamId: team.id,
      teamName: team.name,
      conference: team.conference,
      division: team.division,
      season: 2025,
      record: {
        wins,
        losses,
        ties: 0,
        winPct: (wins / gamesSim).toFixed(3),
        conferenceWins: Math.floor(wins * 0.6),
        divisionWins: Math.floor(wins * 0.4)
      },
      offense: {
        pointsPerGame: (18 + Math.random() * 15).toFixed(1),
        yardsPerGame: Math.floor(280 + Math.random() * 140),
        passingYards: Math.floor(220 + Math.random() * 100),
        rushingYards: Math.floor(90 + Math.random() * 80),
        turnovers: Math.floor(Math.random() * 15) + 8,
        redZonePct: (0.45 + Math.random() * 0.30).toFixed(3),
        thirdDownPct: (0.35 + Math.random() * 0.25).toFixed(3)
      },
      defense: {
        pointsAllowed: (18 + Math.random() * 15).toFixed(1),
        yardsAllowed: Math.floor(280 + Math.random() * 140),
        passingYardsAllowed: Math.floor(200 + Math.random() * 120),
        rushingYardsAllowed: Math.floor(100 + Math.random() * 60),
        takeaways: Math.floor(Math.random() * 20) + 10,
        sacks: Math.floor(Math.random() * 30) + 25,
        redZoneDefPct: (0.40 + Math.random() * 0.35).toFixed(3)
      },
      specialTeams: {
        fieldGoalPct: (0.75 + Math.random() * 0.20).toFixed(3),
        puntAverage: (42 + Math.random() * 8).toFixed(1),
        kickReturnAvg: (20 + Math.random() * 8).toFixed(1),
        puntReturnAvg: (8 + Math.random() * 6).toFixed(1)
      },
      advanced: {
        pointDifferential: ((parseFloat(this.offense?.pointsPerGame || 0) - parseFloat(this.defense?.pointsAllowed || 0)) * gamesSim).toFixed(1),
        strengthOfSchedule: (0.45 + Math.random() * 0.10).toFixed(3),
        dvoa: (-0.20 + Math.random() * 0.40).toFixed(3),
        powerRating: (75 + Math.random() * 50).toFixed(1)
      }
    };
  }

  async calculateTitansChampionshipMetrics(stats) {
    const offensiveExplosiveness = this.calculateOffensiveExplosiveness(stats);
    const defensiveIntensity = this.calculateDefensiveIntensity(stats);
    const specialTeamsEdge = this.calculateSpecialTeamsEdge(stats);
    const clutchPerformance = this.calculateClutchPerformance(stats);

    return {
      offensiveExplosiveness: (offensiveExplosiveness * 100).toFixed(1),
      defensiveIntensity: (defensiveIntensity * 100).toFixed(1),
      specialTeamsEdge: (specialTeamsEdge * 100).toFixed(1),
      clutchPerformance: (clutchPerformance * 100).toFixed(1),
      playoffProbability: ((offensiveExplosiveness + defensiveIntensity + specialTeamsEdge + clutchPerformance) / 4 * 100).toFixed(1),
      divisionStanding: this.calculateDivisionStanding(stats),
      strengthRating: this.calculateStrengthRating(stats),
      insights: this.generateTitansInsights(stats)
    };
  }

  calculateOffensiveExplosiveness(stats) {
    const ppgFactor = parseFloat(stats.offense.pointsPerGame) / 28;
    const yardsFactor = stats.offense.yardsPerGame / 380;
    const efficiencyFactor = parseFloat(stats.offense.redZonePct) / 0.65;
    return Math.min((ppgFactor + yardsFactor + efficiencyFactor) / 3, 1.0);
  }

  calculateDefensiveIntensity(stats) {
    const pointsFactor = Math.max(0, 1 - (parseFloat(stats.defense.pointsAllowed) - 15) / 15);
    const takeawaysFactor = stats.defense.takeaways / 25;
    const sacksFactor = stats.defense.sacks / 45;
    return Math.min((pointsFactor + takeawaysFactor + sacksFactor) / 3, 1.0);
  }

  calculateSpecialTeamsEdge(stats) {
    const fgFactor = parseFloat(stats.specialTeams.fieldGoalPct) / 0.90;
    const puntFactor = parseFloat(stats.specialTeams.puntAverage) / 48;
    const returnFactor = (parseFloat(stats.specialTeams.kickReturnAvg) + parseFloat(stats.specialTeams.puntReturnAvg)) / 35;
    return Math.min((fgFactor + puntFactor + returnFactor) / 3, 1.0);
  }

  calculateClutchPerformance(stats) {
    const winPctFactor = parseFloat(stats.record.winPct);
    const closeFactor = stats.record.wins > stats.record.losses ? 0.8 : 0.4;
    const momentumFactor = parseFloat(stats.advanced.pointDifferential) > 0 ? 0.7 : 0.3;
    return Math.min((winPctFactor + closeFactor + momentumFactor) / 3, 1.0);
  }

  calculateDivisionStanding(stats) {
    if (parseFloat(stats.record.winPct) > 0.700) return '1st Place Contender';
    if (parseFloat(stats.record.winPct) > 0.500) return 'Playoff Hunt';
    if (parseFloat(stats.record.winPct) > 0.400) return 'Competitive';
    return 'Building';
  }

  calculateStrengthRating(stats) {
    const powerRating = parseFloat(stats.advanced.powerRating);
    if (powerRating > 100) return 'Elite';
    if (powerRating > 85) return 'Strong';
    if (powerRating > 70) return 'Average';
    return 'Developing';
  }

  generateTitansInsights(stats) {
    const insights = [];

    if (parseFloat(stats.offense.pointsPerGame) > 26) {
      insights.push('High-powered offense creating scoring opportunities');
    }

    if (parseFloat(stats.defense.pointsAllowed) < 20) {
      insights.push('Stifling defense controlling opponent drives');
    }

    if (stats.defense.takeaways > 20) {
      insights.push('Opportunistic defense creating extra possessions');
    }

    if (parseFloat(stats.specialTeams.fieldGoalPct) > 0.85) {
      insights.push('Reliable special teams providing field position advantage');
    }

    if (parseFloat(stats.record.winPct) > 0.600) {
      insights.push('Strong record positioning for playoff contention');
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
    const conferences = {
      'AFC': {
        'East': [], 'North': [], 'South': [], 'West': []
      },
      'NFC': {
        'East': [], 'North': [], 'South': [], 'West': []
      }
    };

    for (const [code, team] of Object.entries(NFL_CONFIG.teams)) {
      const data = await this.fetchTeamStats(code);
      data.code = code;
      data.focus = team.focus || false;
      conferences[team.conference][team.division].push(data);
    }

    // Sort each division by win percentage
    for (const conference of Object.values(conferences)) {
      for (const division of Object.values(conference)) {
        division.sort((a, b) => parseFloat(b.record?.winPct || 0) - parseFloat(a.record?.winPct || 0));
      }
    }

    return conferences;
  }

  async getTitansLiveUpdate() {
    const data = await this.fetchTeamStats('TEN');
    return {
      ...data,
      timestamp: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + NFL_CONFIG.cacheTime).toISOString()
    };
  }

  async getPlayoffPicture() {
    const allTeams = await this.getAllTeamsData();
    const playoffs = {
      AFC: [],
      NFC: []
    };

    for (const [conference, divisions] of Object.entries(allTeams)) {
      const teams = [];
      for (const division of Object.values(divisions)) {
        teams.push(...division);
      }
      teams.sort((a, b) => parseFloat(b.record?.winPct || 0) - parseFloat(a.record?.winPct || 0));
      playoffs[conference] = teams.slice(0, 7); // Top 7 teams make playoffs
    }

    return playoffs;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NFLDataIntegration;
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.NFLDataIntegration = NFLDataIntegration;
}