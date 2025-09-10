/**
 * Blaze Intelligence Universal Readiness Board
 * Generalized readiness calculation for all teams across all leagues
 * Extends the Cardinals Readiness Board to support MLB, NFL, NCAA, and more
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Readiness calculation weights by sport
const READINESS_WEIGHTS = {
  MLB: {
    recent_performance: 0.30,    // Last 10 games
    player_availability: 0.25,   // Injury status
    matchup_history: 0.20,       // H2H vs opponent
    momentum: 0.15,              // Win/loss streaks
    rest_factor: 0.10           // Days since last game
  },
  NFL: {
    injury_report: 0.35,         // Game-time decisions critical
    divisional_matchup: 0.20,    // Division games matter more
    home_field: 0.15,            // Home advantage significant
    rest_advantage: 0.15,        // Extra rest between games
    playoff_implications: 0.15   // Stakes of the game
  },
  NCAA: {
    ranking_differential: 0.25,  // AP/Coaches poll difference
    rivalry_factor: 0.20,        // Traditional rivalries
    recruiting_advantage: 0.20,  // Talent differential
    conference_standing: 0.20,   // Conference implications
    coaching_matchup: 0.15       // Coach H2H records
  },
  NBA: {
    load_management: 0.30,       // Back-to-backs, travel
    matchup_analytics: 0.25,     // Pace, efficiency differentials
    clutch_performance: 0.20,    // Performance in close games
    injury_status: 0.15,         // Star player availability
    momentum: 0.10              // Recent form
  }
};

// Traffic light thresholds
const READINESS_THRESHOLDS = {
  HIGH: 75,      // Green
  MEDIUM: 50,    // Yellow
  LOW: 25        // Red
};

class UniversalReadinessBoard {
  constructor(config = {}) {
    this.config = {
      dataDir: config.dataDir || './data/unified',
      outputDir: config.outputDir || './site/src/data',
      updateInterval: config.updateInterval || 600000, // 10 minutes
      ...config
    };
    
    this.cache = new Map();
    this.lastUpdate = null;
  }

  /**
   * Calculate readiness for all teams
   */
  async calculateAllReadiness() {
    console.log('🎯 Calculating Universal Readiness Board');
    
    try {
      // Load unified dataset
      const dataset = await this.loadDataset();
      
      // Group teams by sport
      const teamsBySport = this.groupTeamsBySport(dataset.teams);
      
      // Calculate readiness for each sport
      const readinessData = {
        timestamp: new Date().toISOString(),
        sports: {},
        featured: [],
        alerts: []
      };
      
      for (const [sport, teams] of Object.entries(teamsBySport)) {
        readinessData.sports[sport] = await this.calculateSportReadiness(
          sport,
          teams,
          dataset.players
        );
      }
      
      // Generate featured matchups
      readinessData.featured = this.selectFeaturedMatchups(readinessData.sports);
      
      // Generate alerts for significant changes
      readinessData.alerts = this.generateAlerts(readinessData.sports);
      
      // Save readiness data
      await this.saveReadinessData(readinessData);
      
      // Generate team-specific dashboards
      await this.generateTeamDashboards(readinessData);
      
      console.log(`✅ Readiness calculated for ${Object.keys(teamsBySport).length} sports`);
      return readinessData;
      
    } catch (error) {
      console.error('❌ Readiness calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate readiness for a specific sport
   */
  async calculateSportReadiness(sport, teams, allPlayers) {
    const sportReadiness = {
      teams: [],
      averageReadiness: 0,
      topTeams: [],
      bottomTeams: []
    };
    
    const weights = READINESS_WEIGHTS[sport] || READINESS_WEIGHTS.MLB;
    
    for (const team of teams) {
      // Get team's players
      const teamPlayers = allPlayers.filter(p => p.team_id === team.team_id);
      
      // Calculate readiness components
      const components = await this.calculateReadinessComponents(
        sport,
        team,
        teamPlayers
      );
      
      // Apply weights
      let readinessScore = 0;
      for (const [component, value] of Object.entries(components)) {
        readinessScore += value * (weights[component] || 0);
      }
      
      // Determine status
      const status = this.getReadinessStatus(readinessScore);
      
      // Calculate leverage (importance of next game)
      const leverage = this.calculateLeverage(team, sport);
      
      const teamReadiness = {
        team_id: team.team_id,
        name: team.name,
        readiness_score: Math.round(readinessScore),
        status: status,
        components: components,
        leverage: leverage,
        players: {
          total: teamPlayers.length,
          available: teamPlayers.filter(p => 
            !p.injury_status || p.injury_status.current_status === 'healthy'
          ).length,
          stars: teamPlayers.filter(p => 
            p.hav_f && p.hav_f.composite_score > 80
          ).length
        },
        next_game: team.next_game || null,
        trend: this.calculateTrend(team.team_id)
      };
      
      sportReadiness.teams.push(teamReadiness);
    }
    
    // Sort teams by readiness
    sportReadiness.teams.sort((a, b) => b.readiness_score - a.readiness_score);
    
    // Calculate sport-wide metrics
    const scores = sportReadiness.teams.map(t => t.readiness_score);
    sportReadiness.averageReadiness = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    sportReadiness.topTeams = sportReadiness.teams.slice(0, 5);
    sportReadiness.bottomTeams = sportReadiness.teams.slice(-5);
    
    return sportReadiness;
  }

  /**
   * Calculate readiness components for a team
   */
  async calculateReadinessComponents(sport, team, players) {
    const components = {};
    
    switch (sport) {
      case 'MLB':
        components.recent_performance = this.calculateRecentPerformance(team);
        components.player_availability = this.calculateAvailability(players);
        components.matchup_history = this.calculateMatchupHistory(team);
        components.momentum = this.calculateMomentum(team);
        components.rest_factor = this.calculateRestFactor(team);
        break;
        
      case 'NFL':
        components.injury_report = this.calculateInjuryImpact(players);
        components.divisional_matchup = team.next_opponent_division ? 100 : 50;
        components.home_field = team.next_game_home ? 75 : 25;
        components.rest_advantage = this.calculateRestAdvantage(team);
        components.playoff_implications = this.calculatePlayoffImplications(team);
        break;
        
      case 'NCAA':
        components.ranking_differential = this.calculateRankingDiff(team);
        components.rivalry_factor = team.next_opponent_rival ? 100 : 50;
        components.recruiting_advantage = this.calculateRecruitingEdge(players);
        components.conference_standing = this.calculateConferencePosition(team);
        components.coaching_matchup = 50; // Default neutral
        break;
        
      case 'NBA':
        components.load_management = this.calculateLoadManagement(team);
        components.matchup_analytics = this.calculateMatchupAnalytics(team);
        components.clutch_performance = this.calculateClutchRating(team);
        components.injury_status = this.calculateAvailability(players);
        components.momentum = this.calculateMomentum(team);
        break;
        
      default:
        // Generic components
        components.overall_health = this.calculateAvailability(players);
        components.recent_form = this.calculateRecentPerformance(team);
        components.team_quality = this.calculateTeamQuality(players);
    }
    
    return components;
  }

  /**
   * Component calculation helpers
   */
  calculateRecentPerformance(team) {
    // Check last 10 games
    if (!team.recent_games) return 50;
    
    const last10 = team.recent_games.slice(-10);
    const wins = last10.filter(g => g.result === 'W').length;
    return (wins / 10) * 100;
  }

  calculateAvailability(players) {
    if (!players || players.length === 0) return 100;
    
    const healthy = players.filter(p => 
      !p.injury_status || p.injury_status.current_status === 'healthy'
    ).length;
    
    return (healthy / players.length) * 100;
  }

  calculateInjuryImpact(players) {
    // Weight by player importance (HAV-F score)
    let totalImpact = 0;
    let totalWeight = 0;
    
    for (const player of players) {
      const weight = player.hav_f?.composite_score || 50;
      const available = (!player.injury_status || 
                        player.injury_status.current_status === 'healthy') ? 1 : 0;
      
      totalImpact += available * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? (totalImpact / totalWeight) * 100 : 50;
  }

  calculateMatchupHistory(team) {
    // Simplified H2H calculation
    if (!team.h2h_record) return 50;
    
    const { wins, losses } = team.h2h_record;
    const total = wins + losses;
    return total > 0 ? (wins / total) * 100 : 50;
  }

  calculateMomentum(team) {
    if (!team.recent_games) return 50;
    
    // Check streak
    const last5 = team.recent_games.slice(-5);
    const wins = last5.filter(g => g.result === 'W').length;
    
    if (wins === 5) return 100;  // Hot streak
    if (wins === 0) return 0;    // Cold streak
    return wins * 20;
  }

  calculateRestFactor(team) {
    if (!team.last_game_date) return 75;
    
    const daysSinceLastGame = Math.floor(
      (Date.now() - new Date(team.last_game_date)) / (1000 * 60 * 60 * 24)
    );
    
    // Optimal rest is 1-2 days for MLB
    if (daysSinceLastGame === 1 || daysSinceLastGame === 2) return 100;
    if (daysSinceLastGame === 0) return 25;  // Same day
    if (daysSinceLastGame > 4) return 50;     // Too much rest
    return 75;
  }

  calculateRestAdvantage(team) {
    // NFL specific - compare rest days
    const teamRest = team.days_rest || 7;
    const oppRest = team.opponent_days_rest || 7;
    
    if (teamRest > oppRest) return 75;
    if (teamRest < oppRest) return 25;
    return 50;
  }

  calculatePlayoffImplications(team) {
    // Based on current standing and remaining games
    if (team.playoff_position <= 6) return 90;  // In playoff position
    if (team.games_back <= 2) return 70;        // Close to playoffs
    if (team.eliminated) return 10;             // Eliminated
    return 50;
  }

  calculateRankingDiff(team) {
    if (!team.ranking || !team.opponent_ranking) return 50;
    
    const diff = team.opponent_ranking - team.ranking;
    // Positive diff means we're ranked higher (better)
    return Math.max(0, Math.min(100, 50 + diff * 2));
  }

  calculateRecruitingEdge(players) {
    if (!players || players.length === 0) return 50;
    
    const avgStars = players.reduce((sum, p) => {
      return sum + (p.recruiting?.stars || 0);
    }, 0) / players.length;
    
    return Math.min(100, avgStars * 20);
  }

  calculateConferencePosition(team) {
    if (!team.conference_rank) return 50;
    
    // Top of conference = 100, bottom = 0
    const totalTeams = team.conference_size || 14;
    return Math.max(0, 100 - (team.conference_rank - 1) * (100 / totalTeams));
  }

  calculateLoadManagement(team) {
    // NBA back-to-back and travel considerations
    if (team.back_to_back) return 25;
    if (team.third_in_four) return 40;
    if (team.long_road_trip) return 60;
    return 85;
  }

  calculateMatchupAnalytics(team) {
    // Simplified analytics matchup
    const netRating = team.net_rating || 0;
    const oppNetRating = team.opponent_net_rating || 0;
    const diff = netRating - oppNetRating;
    
    return Math.max(0, Math.min(100, 50 + diff * 2));
  }

  calculateClutchRating(team) {
    if (!team.clutch_record) return 50;
    
    const { wins, losses } = team.clutch_record;
    const total = wins + losses;
    return total > 0 ? (wins / total) * 100 : 50;
  }

  calculateTeamQuality(players) {
    if (!players || players.length === 0) return 50;
    
    // Average HAV-F composite score
    const avgHavf = players.reduce((sum, p) => {
      return sum + (p.hav_f?.composite_score || 50);
    }, 0) / players.length;
    
    return avgHavf;
  }

  /**
   * Calculate leverage (game importance)
   */
  calculateLeverage(team, sport) {
    let leverage = 50; // Base leverage
    
    // Playoff/championship implications
    if (team.playoff_position) {
      if (team.playoff_position <= 2) leverage += 20;  // Top seed race
      else if (team.playoff_position <= 6) leverage += 15;  // Playoff position
      else if (team.games_back <= 3) leverage += 25;  // Wild card race
    }
    
    // Rivalry games
    if (team.next_opponent_rival) leverage += 15;
    
    // Division/conference games
    if (team.next_opponent_division) leverage += 10;
    
    // Season stage
    const gamesRemaining = team.games_remaining || 20;
    if (gamesRemaining < 10) leverage += 15;  // End of season
    if (gamesRemaining < 5) leverage += 10;   // Final stretch
    
    return Math.min(100, leverage);
  }

  /**
   * Determine readiness status (traffic light)
   */
  getReadinessStatus(score) {
    if (score >= READINESS_THRESHOLDS.HIGH) return 'green';
    if (score >= READINESS_THRESHOLDS.MEDIUM) return 'yellow';
    return 'red';
  }

  /**
   * Calculate trend based on historical data
   */
  calculateTrend(teamId) {
    const history = this.cache.get(`history_${teamId}`) || [];
    
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(-3);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const avgPrevious = history.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    
    if (avgRecent > avgPrevious + 5) return 'rising';
    if (avgRecent < avgPrevious - 5) return 'declining';
    return 'stable';
  }

  /**
   * Select featured matchups
   */
  selectFeaturedMatchups(sportData) {
    const featured = [];
    
    for (const [sport, data] of Object.entries(sportData)) {
      // High-leverage games with both teams ready
      const highLeverageGames = data.teams
        .filter(t => t.leverage > 70 && t.readiness_score > 60)
        .slice(0, 2);
      
      for (const team of highLeverageGames) {
        featured.push({
          sport: sport,
          team: team.name,
          opponent: team.next_opponent || 'TBD',
          readiness: team.readiness_score,
          leverage: team.leverage,
          status: team.status,
          headline: this.generateHeadline(team, sport)
        });
      }
    }
    
    // Sort by combined readiness + leverage
    featured.sort((a, b) => 
      (b.readiness + b.leverage) - (a.readiness + a.leverage)
    );
    
    return featured.slice(0, 5);
  }

  /**
   * Generate alerts for significant changes
   */
  generateAlerts(sportData) {
    const alerts = [];
    
    for (const [sport, data] of Object.entries(sportData)) {
      // Teams with significant readiness drops
      for (const team of data.teams) {
        if (team.trend === 'declining' && team.readiness_score < 40) {
          alerts.push({
            type: 'warning',
            sport: sport,
            team: team.name,
            message: `${team.name} readiness declining (${team.readiness_score}%)`,
            components: team.components
          });
        }
        
        // High-leverage games with low readiness
        if (team.leverage > 80 && team.readiness_score < 50) {
          alerts.push({
            type: 'critical',
            sport: sport,
            team: team.name,
            message: `Critical game for ${team.name} but low readiness`,
            readiness: team.readiness_score,
            leverage: team.leverage
          });
        }
      }
    }
    
    return alerts;
  }

  /**
   * Generate headline for featured game
   */
  generateHeadline(team, sport) {
    const templates = {
      high_ready_high_leverage: `${team.name} primed for crucial matchup`,
      low_ready_high_leverage: `${team.name} faces uphill battle in key game`,
      improving: `Surging ${team.name} looks to continue momentum`,
      rivalry: `${team.name} ready for rivalry showdown`
    };
    
    if (team.readiness_score > 75 && team.leverage > 75) {
      return templates.high_ready_high_leverage;
    }
    if (team.readiness_score < 50 && team.leverage > 75) {
      return templates.low_ready_high_leverage;
    }
    if (team.trend === 'rising') {
      return templates.improving;
    }
    if (team.next_opponent_rival) {
      return templates.rivalry;
    }
    
    return `${team.name} readiness: ${team.status}`;
  }

  /**
   * Generate team-specific dashboards
   */
  async generateTeamDashboards(readinessData) {
    const dashboards = {};
    
    for (const [sport, sportData] of Object.entries(readinessData.sports)) {
      for (const team of sportData.teams) {
        const dashboard = {
          team_id: team.team_id,
          name: team.name,
          sport: sport,
          timestamp: readinessData.timestamp,
          current_readiness: {
            score: team.readiness_score,
            status: team.status,
            trend: team.trend,
            percentile: this.calculatePercentile(
              team.readiness_score,
              sportData.teams.map(t => t.readiness_score)
            )
          },
          components: team.components,
          leverage: {
            current_game: team.leverage,
            season_average: 50, // Placeholder
            next_5_games: [] // Placeholder
          },
          players: team.players,
          recommendations: this.generateRecommendations(team),
          historical: this.getHistoricalData(team.team_id)
        };
        
        dashboards[team.team_id] = dashboard;
      }
    }
    
    // Save individual dashboards
    for (const [teamId, dashboard] of Object.entries(dashboards)) {
      const dashboardFile = path.join(
        this.config.outputDir,
        'dashboards',
        `${teamId}.json`
      );
      await fs.mkdir(path.dirname(dashboardFile), { recursive: true });
      await fs.writeFile(dashboardFile, JSON.stringify(dashboard, null, 2));
    }
    
    return dashboards;
  }

  /**
   * Generate recommendations based on readiness
   */
  generateRecommendations(team) {
    const recommendations = [];
    
    // Check each component for issues
    for (const [component, value] of Object.entries(team.components)) {
      if (value < 40) {
        recommendations.push({
          component: component,
          severity: value < 25 ? 'critical' : 'warning',
          action: this.getRecommendedAction(component, value)
        });
      }
    }
    
    // Overall recommendations
    if (team.readiness_score < 50 && team.leverage > 70) {
      recommendations.push({
        component: 'overall',
        severity: 'critical',
        action: 'Consider lineup adjustments and strategic changes for high-stakes game'
      });
    }
    
    return recommendations;
  }

  /**
   * Get recommended action for low component score
   */
  getRecommendedAction(component, value) {
    const actions = {
      player_availability: 'Review injury prevention protocols and consider roster moves',
      recent_performance: 'Analyze recent game footage and adjust strategy',
      momentum: 'Focus on fundamentals and team morale building',
      rest_factor: 'Optimize rotation and manage player minutes',
      injury_report: 'Accelerate recovery protocols and prepare backup plans',
      recruiting_advantage: 'Leverage experienced players and coaching',
      load_management: 'Adjust rotation to preserve key players'
    };
    
    return actions[component] || 'Review and address component deficiencies';
  }

  /**
   * Calculate percentile rank
   */
  calculatePercentile(value, allValues) {
    const sorted = allValues.sort((a, b) => a - b);
    const index = sorted.indexOf(value);
    return Math.round((index / sorted.length) * 100);
  }

  /**
   * Get historical readiness data
   */
  getHistoricalData(teamId) {
    const history = this.cache.get(`history_${teamId}`) || [];
    
    return {
      last_30_days: history.slice(-30),
      average: history.length > 0 ? 
        history.reduce((a, b) => a + b, 0) / history.length : 50,
      peak: history.length > 0 ? Math.max(...history) : 50,
      trough: history.length > 0 ? Math.min(...history) : 50
    };
  }

  /**
   * Helper methods
   */
  async loadDataset() {
    const dataFile = path.join(this.config.dataDir, 'unified_data_latest.json');
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  }

  groupTeamsBySport(teams) {
    const grouped = {};
    
    for (const team of teams) {
      if (!grouped[team.sport]) {
        grouped[team.sport] = [];
      }
      grouped[team.sport].push(team);
    }
    
    return grouped;
  }

  async saveReadinessData(data) {
    // Save main readiness file
    const mainFile = path.join(this.config.outputDir, 'readiness.json');
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.writeFile(mainFile, JSON.stringify(data, null, 2));
    
    // Save sport-specific files
    for (const [sport, sportData] of Object.entries(data.sports)) {
      const sportFile = path.join(
        this.config.outputDir,
        `readiness-${sport.toLowerCase()}.json`
      );
      await fs.writeFile(sportFile, JSON.stringify(sportData, null, 2));
    }
    
    // Update cache for trend calculation
    for (const [sport, sportData] of Object.entries(data.sports)) {
      for (const team of sportData.teams) {
        const history = this.cache.get(`history_${team.team_id}`) || [];
        history.push(team.readiness_score);
        
        // Keep last 30 data points
        if (history.length > 30) {
          history.shift();
        }
        
        this.cache.set(`history_${team.team_id}`, history);
      }
    }
    
    console.log(`✓ Readiness data saved to ${mainFile}`);
  }

  /**
   * Start continuous monitoring
   */
  async startMonitoring() {
    console.log('🚀 Starting Universal Readiness Board monitoring');
    
    // Initial calculation
    await this.calculateAllReadiness();
    
    // Set up interval
    setInterval(async () => {
      try {
        await this.calculateAllReadiness();
      } catch (error) {
        console.error('Error in readiness calculation:', error);
      }
    }, this.config.updateInterval);
    
    console.log(`⏱️  Updating every ${this.config.updateInterval / 1000} seconds`);
  }
}

// Export for use
export default UniversalReadinessBoard;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const board = new UniversalReadinessBoard();
  
  if (process.argv[2] === '--monitor') {
    board.startMonitoring();
  } else {
    board.calculateAllReadiness().then(data => {
      console.log('\n🏆 Top Ready Teams:');
      for (const [sport, sportData] of Object.entries(data.sports)) {
        console.log(`\n${sport}:`);
        sportData.topTeams.slice(0, 3).forEach((team, i) => {
          console.log(`  ${i + 1}. ${team.name}: ${team.readiness_score}% (${team.status})`);
        });
      }
      
      if (data.alerts.length > 0) {
        console.log('\n⚠️  Alerts:');
        data.alerts.forEach(alert => {
          console.log(`  • [${alert.type}] ${alert.message}`);
        });
      }
    }).catch(console.error);
  }
}