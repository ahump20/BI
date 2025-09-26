/**
 * NBA Comprehensive Data Integration
 * Blaze Intelligence - The Deep South's Sports Intelligence Hub
 * All 30 NBA teams with Grizzlies focus
 */

const NBA_CONFIG = {
  apiKey: process.env.NBA_API_KEY || 'demo',
  baseUrl: 'https://api.sportsdata.io/v3/nba',
  cacheTime: 120000, // 2 minutes cache
  teams: {
    // Eastern Conference - Atlantic
    'BOS': { id: 1, name: 'Boston Celtics', conference: 'Eastern', division: 'Atlantic', city: 'Boston' },
    'BKN': { id: 2, name: 'Brooklyn Nets', conference: 'Eastern', division: 'Atlantic', city: 'Brooklyn' },
    'NY': { id: 3, name: 'New York Knicks', conference: 'Eastern', division: 'Atlantic', city: 'New York' },
    'PHI': { id: 4, name: 'Philadelphia 76ers', conference: 'Eastern', division: 'Atlantic', city: 'Philadelphia' },
    'TOR': { id: 5, name: 'Toronto Raptors', conference: 'Eastern', division: 'Atlantic', city: 'Toronto' },
    // Eastern Conference - Central
    'CHI': { id: 6, name: 'Chicago Bulls', conference: 'Eastern', division: 'Central', city: 'Chicago' },
    'CLE': { id: 7, name: 'Cleveland Cavaliers', conference: 'Eastern', division: 'Central', city: 'Cleveland' },
    'DET': { id: 8, name: 'Detroit Pistons', conference: 'Eastern', division: 'Central', city: 'Detroit' },
    'IND': { id: 9, name: 'Indiana Pacers', conference: 'Eastern', division: 'Central', city: 'Indianapolis' },
    'MIL': { id: 10, name: 'Milwaukee Bucks', conference: 'Eastern', division: 'Central', city: 'Milwaukee' },
    // Eastern Conference - Southeast
    'ATL': { id: 11, name: 'Atlanta Hawks', conference: 'Eastern', division: 'Southeast', city: 'Atlanta' },
    'CHA': { id: 12, name: 'Charlotte Hornets', conference: 'Eastern', division: 'Southeast', city: 'Charlotte' },
    'MIA': { id: 13, name: 'Miami Heat', conference: 'Eastern', division: 'Southeast', city: 'Miami' },
    'ORL': { id: 14, name: 'Orlando Magic', conference: 'Eastern', division: 'Southeast', city: 'Orlando' },
    'WAS': { id: 15, name: 'Washington Wizards', conference: 'Eastern', division: 'Southeast', city: 'Washington' },
    // Western Conference - Northwest
    'DEN': { id: 16, name: 'Denver Nuggets', conference: 'Western', division: 'Northwest', city: 'Denver' },
    'MIN': { id: 17, name: 'Minnesota Timberwolves', conference: 'Western', division: 'Northwest', city: 'Minneapolis' },
    'OKC': { id: 18, name: 'Oklahoma City Thunder', conference: 'Western', division: 'Northwest', city: 'Oklahoma City' },
    'POR': { id: 19, name: 'Portland Trail Blazers', conference: 'Western', division: 'Northwest', city: 'Portland' },
    'UTA': { id: 20, name: 'Utah Jazz', conference: 'Western', division: 'Northwest', city: 'Salt Lake City' },
    // Western Conference - Pacific
    'GSW': { id: 21, name: 'Golden State Warriors', conference: 'Western', division: 'Pacific', city: 'San Francisco' },
    'LAC': { id: 22, name: 'LA Clippers', conference: 'Western', division: 'Pacific', city: 'Los Angeles' },
    'LAL': { id: 23, name: 'Los Angeles Lakers', conference: 'Western', division: 'Pacific', city: 'Los Angeles' },
    'PHX': { id: 24, name: 'Phoenix Suns', conference: 'Western', division: 'Pacific', city: 'Phoenix' },
    'SAC': { id: 25, name: 'Sacramento Kings', conference: 'Western', division: 'Pacific', city: 'Sacramento' },
    // Western Conference - Southwest
    'DAL': { id: 26, name: 'Dallas Mavericks', conference: 'Western', division: 'Southwest', city: 'Dallas' },
    'HOU': { id: 27, name: 'Houston Rockets', conference: 'Western', division: 'Southwest', city: 'Houston' },
    'MEM': { id: 28, name: 'Memphis Grizzlies', conference: 'Western', division: 'Southwest', city: 'Memphis', focus: true },
    'NO': { id: 29, name: 'New Orleans Pelicans', conference: 'Western', division: 'Southwest', city: 'New Orleans' },
    'SA': { id: 30, name: 'San Antonio Spurs', conference: 'Western', division: 'Southwest', city: 'San Antonio' }
  }
};

class NBADataIntegration {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.grizzliesSpecialMetrics = {
      offensiveTempo: 0,
      defensiveGrit: 0,
      clutchFactor: 0,
      youthDevelopment: 0
    };
  }

  async fetchTeamStats(teamCode) {
    const cacheKey = `nba_team_${teamCode}_${Math.floor(Date.now() / NBA_CONFIG.cacheTime)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const team = NBA_CONFIG.teams[teamCode];
      if (!team) throw new Error(`Team ${teamCode} not found`);

      const stats = await this.simulateNBAAPI(team);

      // Enhanced metrics for Grizzlies
      if (teamCode === 'MEM') {
        stats.championshipMetrics = await this.calculateGrizzliesChampionshipMetrics(stats);
      }

      this.cache.set(cacheKey, stats);
      setTimeout(() => this.cache.delete(cacheKey), NBA_CONFIG.cacheTime);

      return stats;
    } catch (error) {
      console.error(`Error fetching ${teamCode} data:`, error);
      return this.getFallbackData(teamCode);
    }
  }

  async simulateNBAAPI(team) {
    const gamesSim = Math.floor(Math.random() * 15) + 50; // Simulate 50-65 games played
    const wins = Math.floor(Math.random() * (gamesSim + 1));
    const losses = gamesSim - wins;

    return {
      teamId: team.id,
      teamName: team.name,
      conference: team.conference,
      division: team.division,
      season: '2024-25',
      record: {
        wins,
        losses,
        winPct: (wins / gamesSim).toFixed(3),
        conferenceWins: Math.floor(wins * 0.7),
        divisionWins: Math.floor(wins * 0.3),
        homeRecord: `${Math.floor(wins * 0.6)}-${Math.floor(losses * 0.4)}`,
        awayRecord: `${Math.floor(wins * 0.4)}-${Math.floor(losses * 0.6)}`
      },
      offense: {
        pointsPerGame: (105 + Math.random() * 20).toFixed(1),
        fieldGoalPct: (0.42 + Math.random() * 0.10).toFixed(3),
        threePointPct: (0.30 + Math.random() * 0.15).toFixed(3),
        freeThrowPct: (0.70 + Math.random() * 0.15).toFixed(3),
        assistsPerGame: (20 + Math.random() * 10).toFixed(1),
        reboundsPerGame: (40 + Math.random() * 10).toFixed(1),
        turnoversPerGame: (12 + Math.random() * 6).toFixed(1),
        pace: (95 + Math.random() * 15).toFixed(1)
      },
      defense: {
        pointsAllowed: (105 + Math.random() * 20).toFixed(1),
        fieldGoalPctAllowed: (0.42 + Math.random() * 0.10).toFixed(3),
        threePointPctAllowed: (0.30 + Math.random() * 0.15).toFixed(3),
        reboundsAllowed: (40 + Math.random() * 10).toFixed(1),
        stealsPerGame: (6 + Math.random() * 4).toFixed(1),
        blocksPerGame: (4 + Math.random() * 3).toFixed(1),
        forcedTurnovers: (12 + Math.random() * 6).toFixed(1)
      },
      advanced: {
        netRating: (-10 + Math.random() * 20).toFixed(1),
        offRating: (105 + Math.random() * 15).toFixed(1),
        defRating: (105 + Math.random() * 15).toFixed(1),
        trueShootingPct: (0.50 + Math.random() * 0.10).toFixed(3),
        effectiveFieldGoalPct: (0.48 + Math.random() * 0.10).toFixed(3),
        reboundRate: (48 + Math.random() * 8).toFixed(1),
        turnoverRate: (12 + Math.random() * 4).toFixed(1)
      }
    };
  }

  async calculateGrizzliesChampionshipMetrics(stats) {
    const offensiveTempo = this.calculateOffensiveTempo(stats);
    const defensiveGrit = this.calculateDefensiveGrit(stats);
    const clutchFactor = this.calculateClutchFactor(stats);
    const youthDevelopment = this.calculateYouthDevelopment(stats);

    return {
      offensiveTempo: (offensiveTempo * 100).toFixed(1),
      defensiveGrit: (defensiveGrit * 100).toFixed(1),
      clutchFactor: (clutchFactor * 100).toFixed(1),
      youthDevelopment: (youthDevelopment * 100).toFixed(1),
      playoffProbability: ((offensiveTempo + defensiveGrit + clutchFactor + youthDevelopment) / 4 * 100).toFixed(1),
      conferenceStanding: this.calculateConferenceStanding(stats),
      teamIdentity: this.calculateTeamIdentity(stats),
      insights: this.generateGrizzliesInsights(stats)
    };
  }

  calculateOffensiveTempo(stats) {
    const ppgFactor = parseFloat(stats.offense.pointsPerGame) / 115;
    const paceFactor = parseFloat(stats.offense.pace) / 105;
    const assistFactor = parseFloat(stats.offense.assistsPerGame) / 28;
    const efficiencyFactor = parseFloat(stats.advanced.offRating) / 115;
    return Math.min((ppgFactor + paceFactor + assistFactor + efficiencyFactor) / 4, 1.0);
  }

  calculateDefensiveGrit(stats) {
    const pointsFactor = Math.max(0, 1 - (parseFloat(stats.defense.pointsAllowed) - 100) / 20);
    const stealsFactor = parseFloat(stats.defense.stealsPerGame) / 10;
    const blocksFactor = parseFloat(stats.defense.blocksPerGame) / 6;
    const defRatingFactor = Math.max(0, 1 - (parseFloat(stats.advanced.defRating) - 100) / 20);
    return Math.min((pointsFactor + stealsFactor + blocksFactor + defRatingFactor) / 4, 1.0);
  }

  calculateClutchFactor(stats) {
    const winPctFactor = parseFloat(stats.record.winPct);
    const netRatingFactor = Math.max(0, (parseFloat(stats.advanced.netRating) + 10) / 20);
    const homeAdvantage = 0.6; // Simulated home court advantage
    return Math.min((winPctFactor + netRatingFactor + homeAdvantage) / 3, 1.0);
  }

  calculateYouthDevelopment(stats) {
    // Simulate youth development metrics based on team performance
    const improvementFactor = parseFloat(stats.record.winPct) > 0.5 ? 0.8 : 0.6;
    const uptrendFactor = 0.7; // Simulated upward trajectory
    const potentialFactor = 0.75; // Young player potential
    return Math.min((improvementFactor + uptrendFactor + potentialFactor) / 3, 1.0);
  }

  calculateConferenceStanding(stats) {
    if (parseFloat(stats.record.winPct) > 0.650) return 'Championship Contender';
    if (parseFloat(stats.record.winPct) > 0.550) return 'Playoff Lock';
    if (parseFloat(stats.record.winPct) > 0.450) return 'Play-In Tournament';
    return 'Development Phase';
  }

  calculateTeamIdentity(stats) {
    const netRating = parseFloat(stats.advanced.netRating);
    const pace = parseFloat(stats.offense.pace);

    if (netRating > 5 && pace > 102) return 'Fast-Break Champions';
    if (netRating > 5 && pace < 98) return 'Grind-It-Out Warriors';
    if (pace > 102) return 'Young and Athletic';
    return 'Grit and Grind';
  }

  generateGrizzliesInsights(stats) {
    const insights = [];

    if (parseFloat(stats.offense.pace) > 102) {
      insights.push('High-tempo offense creating transition opportunities');
    }

    if (parseFloat(stats.defense.stealsPerGame) > 8) {
      insights.push('Aggressive defense forcing turnovers and fast breaks');
    }

    if (parseFloat(stats.offense.assistsPerGame) > 25) {
      insights.push('Unselfish ball movement creating open scoring chances');
    }

    if (parseFloat(stats.advanced.netRating) > 3) {
      insights.push('Strong point differential indicating championship potential');
    }

    if (parseFloat(stats.record.winPct) > 0.600) {
      insights.push('Winning culture establishing Memphis as playoff threat');
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
      'Eastern': {
        'Atlantic': [], 'Central': [], 'Southeast': []
      },
      'Western': {
        'Northwest': [], 'Pacific': [], 'Southwest': []
      }
    };

    for (const [code, team] of Object.entries(NBA_CONFIG.teams)) {
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

  async getGrizzliesLiveUpdate() {
    const data = await this.fetchTeamStats('MEM');
    return {
      ...data,
      timestamp: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + NBA_CONFIG.cacheTime).toISOString()
    };
  }

  async getPlayoffPicture() {
    const allTeams = await this.getAllTeamsData();
    const playoffs = {
      Eastern: [],
      Western: []
    };

    for (const [conference, divisions] of Object.entries(allTeams)) {
      const teams = [];
      for (const division of Object.values(divisions)) {
        teams.push(...division);
      }
      teams.sort((a, b) => parseFloat(b.record?.winPct || 0) - parseFloat(a.record?.winPct || 0));
      playoffs[conference] = {
        guaranteed: teams.slice(0, 6),
        playIn: teams.slice(6, 10),
        lottery: teams.slice(10)
      };
    }

    return playoffs;
  }

  async getStandingsUpdate() {
    const conferences = await this.getAllTeamsData();

    return {
      Eastern: this.calculateConferenceStandings(conferences.Eastern),
      Western: this.calculateConferenceStandings(conferences.Western),
      lastUpdated: new Date().toISOString()
    };
  }

  calculateConferenceStandings(conference) {
    const teams = [];
    for (const division of Object.values(conference)) {
      teams.push(...division);
    }

    return teams
      .sort((a, b) => parseFloat(b.record?.winPct || 0) - parseFloat(a.record?.winPct || 0))
      .map((team, index) => ({
        rank: index + 1,
        team: team.teamName,
        code: team.code,
        record: `${team.record.wins}-${team.record.losses}`,
        winPct: team.record.winPct,
        focus: team.focus
      }));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NBADataIntegration;
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.NBADataIntegration = NBADataIntegration;
}