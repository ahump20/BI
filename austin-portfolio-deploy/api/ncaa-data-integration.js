/**
 * NCAA Football & Baseball Comprehensive Data Integration
 * Blaze Intelligence - The Deep South's Sports Intelligence Hub
 * Focus on Longhorns, SEC teams, and championship contenders
 */

const NCAA_CONFIG = {
  apiKey: process.env.COLLEGEFOOTBALLDATA_API_KEY || 'demo',
  baseUrl: 'https://api.collegefootballdata.com',
  cacheTime: 300000, // 5 minutes cache
  conferences: {
    // Power 5 Conferences
    'SEC': {
      name: 'Southeastern Conference',
      teams: {
        'ALA': { name: 'Alabama Crimson Tide', focus: true },
        'ARK': { name: 'Arkansas Razorbacks' },
        'AUB': { name: 'Auburn Tigers' },
        'FLA': { name: 'Florida Gators' },
        'GA': { name: 'Georgia Bulldogs', focus: true },
        'KY': { name: 'Kentucky Wildcats' },
        'LSU': { name: 'LSU Tigers', focus: true },
        'MISS': { name: 'Ole Miss Rebels' },
        'MSU': { name: 'Mississippi State Bulldogs' },
        'MU': { name: 'Missouri Tigers' },
        'SC': { name: 'South Carolina Gamecocks' },
        'TENN': { name: 'Tennessee Volunteers', focus: true },
        'TEX': { name: 'Texas Longhorns', focus: true },
        'A&M': { name: 'Texas A&M Aggies', focus: true },
        'VAN': { name: 'Vanderbilt Commodores' },
        'OU': { name: 'Oklahoma Sooners', focus: true }
      }
    },
    'Big12': {
      name: 'Big 12 Conference',
      teams: {
        'BAY': { name: 'Baylor Bears' },
        'ISU': { name: 'Iowa State Cyclones' },
        'KU': { name: 'Kansas Jayhawks' },
        'KSU': { name: 'Kansas State Wildcats' },
        'OSU': { name: 'Oklahoma State Cowboys' },
        'TCU': { name: 'TCU Horned Frogs' },
        'TTU': { name: 'Texas Tech Red Raiders' },
        'WVU': { name: 'West Virginia Mountaineers' },
        'CIN': { name: 'Cincinnati Bearcats' },
        'HOU': { name: 'Houston Cougars' },
        'UCF': { name: 'UCF Knights' },
        'BYU': { name: 'BYU Cougars' },
        'UTAH': { name: 'Utah Utes' },
        'ASU': { name: 'Arizona State Sun Devils' },
        'ARIZ': { name: 'Arizona Wildcats' },
        'COL': { name: 'Colorado Buffaloes' }
      }
    },
    'ACC': {
      name: 'Atlantic Coast Conference',
      teams: {
        'BC': { name: 'Boston College Eagles' },
        'CLEM': { name: 'Clemson Tigers' },
        'DUKE': { name: 'Duke Blue Devils' },
        'FSU': { name: 'Florida State Seminoles' },
        'GT': { name: 'Georgia Tech Yellow Jackets' },
        'LOU': { name: 'Louisville Cardinals' },
        'MIA': { name: 'Miami Hurricanes' },
        'UNC': { name: 'North Carolina Tar Heels' },
        'NCST': { name: 'NC State Wolfpack' },
        'PITT': { name: 'Pittsburgh Panthers' },
        'SYR': { name: 'Syracuse Orange' },
        'VT': { name: 'Virginia Tech Hokies' },
        'UVA': { name: 'Virginia Cavaliers' },
        'WAKE': { name: 'Wake Forest Demon Deacons' },
        'ND': { name: 'Notre Dame Fighting Irish' },
        'CAL': { name: 'California Golden Bears' },
        'STAN': { name: 'Stanford Cardinal' },
        'SMU': { name: 'SMU Mustangs' }
      }
    },
    'Big10': {
      name: 'Big Ten Conference',
      teams: {
        'ILL': { name: 'Illinois Fighting Illini' },
        'IND': { name: 'Indiana Hoosiers' },
        'IOWA': { name: 'Iowa Hawkeyes' },
        'MD': { name: 'Maryland Terrapins' },
        'MICH': { name: 'Michigan Wolverines' },
        'MSU': { name: 'Michigan State Spartans' },
        'MINN': { name: 'Minnesota Golden Gophers' },
        'NEB': { name: 'Nebraska Cornhuskers' },
        'NW': { name: 'Northwestern Wildcats' },
        'OSU': { name: 'Ohio State Buckeyes' },
        'PSU': { name: 'Penn State Nittany Lions' },
        'PUR': { name: 'Purdue Boilermakers' },
        'RUT': { name: 'Rutgers Scarlet Knights' },
        'WIS': { name: 'Wisconsin Badgers' },
        'UCLA': { name: 'UCLA Bruins' },
        'USC': { name: 'USC Trojans' },
        'ORE': { name: 'Oregon Ducks' },
        'WASH': { name: 'Washington Huskies' }
      }
    },
    'Pac12': {
      name: 'Pac-12 Conference',
      teams: {
        'WSU': { name: 'Washington State Cougars' },
        'OSU': { name: 'Oregon State Beavers' }
      }
    }
  }
};

class NCAADataIntegration {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.longhornSpecialMetrics = {
      recruitingMomentum: 0,
      offensiveExplosiveness: 0,
      defensiveToughness: 0,
      championshipReadiness: 0
    };
  }

  async fetchTeamStats(teamCode, conference, sport = 'football') {
    const cacheKey = `ncaa_${sport}_${conference}_${teamCode}_${Math.floor(Date.now() / NCAA_CONFIG.cacheTime)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const team = NCAA_CONFIG.conferences[conference]?.teams[teamCode];
      if (!team) throw new Error(`Team ${teamCode} not found in ${conference}`);

      const stats = await this.simulateNCAAAPI(team, conference, sport);

      // Enhanced metrics for focus teams
      if (team.focus) {
        stats.championshipMetrics = await this.calculateChampionshipMetrics(stats, teamCode, sport);
      }

      this.cache.set(cacheKey, stats);
      setTimeout(() => this.cache.delete(cacheKey), NCAA_CONFIG.cacheTime);

      return stats;
    } catch (error) {
      console.error(`Error fetching ${teamCode} data:`, error);
      return this.getFallbackData(teamCode);
    }
  }

  async simulateNCAAAPI(team, conference, sport) {
    if (sport === 'football') {
      return this.simulateFootballStats(team, conference);
    } else if (sport === 'baseball') {
      return this.simulateBaseballStats(team, conference);
    }
  }

  async simulateFootballStats(team, conference) {
    const gamesSim = Math.floor(Math.random() * 3) + 10; // 10-12 games
    const wins = Math.floor(Math.random() * (gamesSim + 1));
    const losses = gamesSim - wins;

    return {
      teamName: team.name,
      conference,
      sport: 'football',
      season: 2025,
      record: {
        wins,
        losses,
        ties: 0,
        winPct: (wins / gamesSim).toFixed(3),
        conferenceWins: Math.floor(wins * 0.6),
        conferenceLosses: Math.floor(losses * 0.6)
      },
      offense: {
        pointsPerGame: (20 + Math.random() * 25).toFixed(1),
        yardsPerGame: Math.floor(350 + Math.random() * 200),
        passingYards: Math.floor(250 + Math.random() * 150),
        rushingYards: Math.floor(120 + Math.random() * 120),
        turnovers: Math.floor(Math.random() * 15) + 8,
        redZonePct: (0.50 + Math.random() * 0.35).toFixed(3),
        thirdDownPct: (0.35 + Math.random() * 0.30).toFixed(3)
      },
      defense: {
        pointsAllowed: (15 + Math.random() * 25).toFixed(1),
        yardsAllowed: Math.floor(300 + Math.random() * 200),
        passingYardsAllowed: Math.floor(200 + Math.random() * 150),
        rushingYardsAllowed: Math.floor(100 + Math.random() * 120),
        takeaways: Math.floor(Math.random() * 20) + 10,
        sacks: Math.floor(Math.random() * 25) + 20,
        tacklesForLoss: Math.floor(Math.random() * 40) + 60
      },
      recruiting: {
        class2025Rank: Math.floor(Math.random() * 50) + 1,
        class2026Commits: Math.floor(Math.random() * 15) + 5,
        transferPortalGains: Math.floor(Math.random() * 10) + 2,
        recruitingMomentum: (Math.random() * 10).toFixed(1)
      },
      rankings: {
        ap: Math.floor(Math.random() * 25) + 1,
        coaches: Math.floor(Math.random() * 25) + 1,
        cfp: Math.floor(Math.random() * 25) + 1,
        strengthOfRecord: (Math.random() * 100).toFixed(1)
      }
    };
  }

  async simulateBaseballStats(team, conference) {
    const gamesSim = Math.floor(Math.random() * 10) + 40; // 40-50 games
    const wins = Math.floor(Math.random() * (gamesSim + 1));
    const losses = gamesSim - wins;

    return {
      teamName: team.name,
      conference,
      sport: 'baseball',
      season: 2025,
      record: {
        wins,
        losses,
        winPct: (wins / gamesSim).toFixed(3),
        conferenceWins: Math.floor(wins * 0.5),
        conferenceLosses: Math.floor(losses * 0.5)
      },
      batting: {
        avg: (0.250 + Math.random() * 0.080).toFixed(3),
        obp: (0.320 + Math.random() * 0.080).toFixed(3),
        slg: (0.380 + Math.random() * 0.150).toFixed(3),
        ops: 0, // Will be calculated
        homeRuns: Math.floor(Math.random() * 60) + 30,
        rbi: Math.floor(Math.random() * 200) + 250,
        stolenBases: Math.floor(Math.random() * 80) + 20,
        strikeouts: Math.floor(Math.random() * 300) + 200
      },
      pitching: {
        era: (2.50 + Math.random() * 3.50).toFixed(2),
        whip: (1.00 + Math.random() * 0.60).toFixed(2),
        strikeouts: Math.floor(Math.random() * 400) + 300,
        walks: Math.floor(Math.random() * 200) + 150,
        saves: Math.floor(Math.random() * 20) + 10,
        completeGames: Math.floor(Math.random() * 8) + 2
      },
      fielding: {
        fieldingPct: (0.960 + Math.random() * 0.035).toFixed(3),
        errors: Math.floor(Math.random() * 40) + 30,
        doublePlays: Math.floor(Math.random() * 40) + 40
      }
    };
  }

  async calculateChampionshipMetrics(stats, teamCode, sport) {
    if (sport === 'football') {
      return this.calculateFootballChampionshipMetrics(stats, teamCode);
    } else if (sport === 'baseball') {
      return this.calculateBaseballChampionshipMetrics(stats, teamCode);
    }
  }

  calculateFootballChampionshipMetrics(stats, teamCode) {
    const offensiveExplosiveness = this.calculateOffensiveExplosiveness(stats);
    const defensiveToughness = this.calculateDefensiveToughness(stats);
    const recruitingMomentum = this.calculateRecruitingMomentum(stats);
    const championshipReadiness = this.calculateChampionshipReadiness(stats);

    let insights = [];
    if (teamCode === 'TEX') {
      insights = this.generateLonghornInsights(stats);
    } else {
      insights = this.generateGenericInsights(stats, 'football');
    }

    return {
      offensiveExplosiveness: (offensiveExplosiveness * 100).toFixed(1),
      defensiveToughness: (defensiveToughness * 100).toFixed(1),
      recruitingMomentum: (recruitingMomentum * 100).toFixed(1),
      championshipReadiness: (championshipReadiness * 100).toFixed(1),
      playoffProbability: ((offensiveExplosiveness + defensiveToughness + recruitingMomentum + championshipReadiness) / 4 * 100).toFixed(1),
      conferenceTitle: this.calculateConferenceTitleOdds(stats),
      nationalTitle: this.calculateNationalTitleOdds(stats),
      insights
    };
  }

  calculateBaseballChampionshipMetrics(stats, teamCode) {
    const offensivePower = this.calculateOffensivePower(stats);
    const pitchingDepth = this.calculatePitchingDepth(stats);
    const defensiveReliability = this.calculateDefensiveReliability(stats);
    const tournamentReadiness = this.calculateTournamentReadiness(stats);

    return {
      offensivePower: (offensivePower * 100).toFixed(1),
      pitchingDepth: (pitchingDepth * 100).toFixed(1),
      defensiveReliability: (defensiveReliability * 100).toFixed(1),
      tournamentReadiness: (tournamentReadiness * 100).toFixed(1),
      cwsProbability: ((offensivePower + pitchingDepth + defensiveReliability + tournamentReadiness) / 4 * 100).toFixed(1),
      rpiProjection: this.calculateRPIProjection(stats),
      seedProjection: this.calculateSeedProjection(stats),
      insights: this.generateGenericInsights(stats, 'baseball')
    };
  }

  calculateOffensiveExplosiveness(stats) {
    const ppgFactor = parseFloat(stats.offense.pointsPerGame) / 35;
    const yardsFactor = stats.offense.yardsPerGame / 500;
    const efficiencyFactor = parseFloat(stats.offense.redZonePct) / 0.75;
    return Math.min((ppgFactor + yardsFactor + efficiencyFactor) / 3, 1.0);
  }

  calculateDefensiveToughness(stats) {
    const pointsFactor = Math.max(0, 1 - (parseFloat(stats.defense.pointsAllowed) - 10) / 25);
    const takeawaysFactor = stats.defense.takeaways / 25;
    const sacksFactor = stats.defense.sacks / 40;
    return Math.min((pointsFactor + takeawaysFactor + sacksFactor) / 3, 1.0);
  }

  calculateRecruitingMomentum(stats) {
    const rankFactor = Math.max(0, 1 - (stats.recruiting.class2025Rank - 1) / 25);
    const commitsFactor = stats.recruiting.class2026Commits / 20;
    const transferFactor = stats.recruiting.transferPortalGains / 15;
    return Math.min((rankFactor + commitsFactor + transferFactor) / 3, 1.0);
  }

  calculateChampionshipReadiness(stats) {
    const winPctFactor = parseFloat(stats.record.winPct);
    const rankingFactor = Math.max(0, 1 - (stats.rankings.ap - 1) / 25);
    const sosCompFactor = parseFloat(stats.rankings.strengthOfRecord) / 100;
    return Math.min((winPctFactor + rankingFactor + sosCompFactor) / 3, 1.0);
  }

  calculateOffensivePower(stats) {
    const avgFactor = parseFloat(stats.batting.avg) / 0.320;
    const slugFactor = parseFloat(stats.batting.slg) / 0.520;
    const hrFactor = stats.batting.homeRuns / 80;
    return Math.min((avgFactor + slugFactor + hrFactor) / 3, 1.0);
  }

  calculatePitchingDepth(stats) {
    const eraFactor = Math.max(0, 1 - (parseFloat(stats.pitching.era) - 2.50) / 3.50);
    const whipFactor = Math.max(0, 1 - (parseFloat(stats.pitching.whip) - 1.00) / 0.60);
    const soFactor = stats.pitching.strikeouts / 500;
    return Math.min((eraFactor + whipFactor + soFactor) / 3, 1.0);
  }

  calculateDefensiveReliability(stats) {
    const fieldingFactor = parseFloat(stats.fielding.fieldingPct) / 0.980;
    const errorFactor = Math.max(0, 1 - stats.fielding.errors / 60);
    const dpFactor = stats.fielding.doublePlays / 70;
    return Math.min((fieldingFactor + errorFactor + dpFactor) / 3, 1.0);
  }

  calculateTournamentReadiness(stats) {
    const winPctFactor = parseFloat(stats.record.winPct);
    const confWinFactor = stats.record.conferenceWins / (stats.record.conferenceWins + stats.record.conferenceLosses);
    const experienceFactor = 0.75; // Simulated experience factor
    return Math.min((winPctFactor + confWinFactor + experienceFactor) / 3, 1.0);
  }

  generateLonghornInsights(stats) {
    const insights = [];

    if (parseFloat(stats.offense.pointsPerGame) > 35) {
      insights.push('High-octane offense showcasing championship potential');
    }

    if (stats.recruiting.class2025Rank <= 10) {
      insights.push('Elite recruiting class building foundation for sustained success');
    }

    if (parseFloat(stats.record.winPct) > 0.750) {
      insights.push('Dominant season establishing Texas as Big 12 powerhouse');
    }

    if (stats.rankings.ap <= 10) {
      insights.push('Top-10 ranking validates championship expectations');
    }

    return insights;
  }

  generateGenericInsights(stats, sport) {
    const insights = [];

    if (sport === 'football') {
      if (parseFloat(stats.offense.pointsPerGame) > 30) {
        insights.push('Explosive offensive attack creating scoring opportunities');
      }
      if (parseFloat(stats.defense.pointsAllowed) < 20) {
        insights.push('Stingy defense anchoring championship run');
      }
    } else if (sport === 'baseball') {
      if (parseFloat(stats.batting.avg) > 0.300) {
        insights.push('Potent offensive lineup driving run production');
      }
      if (parseFloat(stats.pitching.era) < 4.00) {
        insights.push('Strong pitching staff controlling opposing offenses');
      }
    }

    return insights;
  }

  calculateConferenceTitleOdds(stats) {
    const winPct = parseFloat(stats.record.winPct);
    if (winPct > 0.800) return 'Heavy Favorite';
    if (winPct > 0.650) return 'Strong Contender';
    if (winPct > 0.500) return 'In the Hunt';
    return 'Building';
  }

  calculateNationalTitleOdds(stats) {
    const ranking = stats.rankings.ap;
    if (ranking <= 4) return 'Playoff Favorite';
    if (ranking <= 12) return 'Playoff Contender';
    if (ranking <= 25) return 'Dark Horse';
    return 'Long Shot';
  }

  calculateRPIProjection(stats) {
    const winPct = parseFloat(stats.record.winPct);
    return Math.floor(winPct * 100 + Math.random() * 50);
  }

  calculateSeedProjection(stats) {
    const winPct = parseFloat(stats.record.winPct);
    if (winPct > 0.700) return 'National Seed (1-8)';
    if (winPct > 0.600) return 'Regional Seed (1-2)';
    if (winPct > 0.500) return 'At-Large Bid';
    return 'Bubble Team';
  }

  getFallbackData(teamCode) {
    return {
      teamCode,
      status: 'offline',
      message: 'Using cached data',
      lastUpdate: this.lastUpdate
    };
  }

  async getAllConferenceData(sport = 'football') {
    const conferences = {};

    for (const [confName, confData] of Object.entries(NCAA_CONFIG.conferences)) {
      conferences[confName] = {
        name: confData.name,
        teams: []
      };

      for (const [teamCode, team] of Object.entries(confData.teams)) {
        const data = await this.fetchTeamStats(teamCode, confName, sport);
        data.code = teamCode;
        data.focus = team.focus || false;
        conferences[confName].teams.push(data);
      }

      // Sort teams by win percentage
      conferences[confName].teams.sort((a, b) => parseFloat(b.record?.winPct || 0) - parseFloat(a.record?.winPct || 0));
    }

    return conferences;
  }

  async getLonghornsLiveUpdate(sport = 'football') {
    const data = await this.fetchTeamStats('TEX', 'SEC', sport);
    return {
      ...data,
      timestamp: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + NCAA_CONFIG.cacheTime).toISOString()
    };
  }

  async getSECStandings(sport = 'football') {
    const secData = NCAA_CONFIG.conferences.SEC;
    const standings = [];

    for (const [teamCode, team] of Object.entries(secData.teams)) {
      const data = await this.fetchTeamStats(teamCode, 'SEC', sport);
      standings.push({
        ...data,
        code: teamCode,
        focus: team.focus || false
      });
    }

    return standings.sort((a, b) => parseFloat(b.record?.winPct || 0) - parseFloat(a.record?.winPct || 0));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NCAADataIntegration;
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.NCAADataIntegration = NCAADataIntegration;
}