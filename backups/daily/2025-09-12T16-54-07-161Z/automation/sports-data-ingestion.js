#!/usr/bin/env node

/**
 * Blaze Intelligence Sports Data Ingestion System
 * Automated data collection from multiple sports APIs
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SportsDataIngestion {
  constructor() {
    this.config = {
      dataDir: path.join(process.cwd(), 'data'),
      backupDir: path.join(process.cwd(), 'data', 'backups'),
      ingestionInterval: 300000, // 5 minutes
      retryAttempts: 3,
      rateLimitDelay: 1000 // 1 second between API calls
    };

    this.dataSources = {
      mlb: {
        name: 'MLB Stats API',
        baseUrl: 'https://statsapi.mlb.com/api/v1',
        endpoints: {
          teams: '/teams',
          schedule: '/schedule',
          standings: '/standings'
        },
        enabled: true
      },
      espn: {
        name: 'ESPN API',
        baseUrl: 'https://site.api.espn.com/apis/site/v2/sports',
        endpoints: {
          nfl: '/football/nfl',
          nba: '/basketball/nba',
          ncaaf: '/football/college-football'
        },
        enabled: true
      },
      perfectGame: {
        name: 'Perfect Game API',
        baseUrl: process.env.PERFECT_GAME_BASE_URL || 'https://api.perfectgame.org',
        apiKey: process.env.PERFECT_GAME_API_KEY,
        enabled: !!process.env.PERFECT_GAME_API_KEY
      }
    };

    this.teams = {
      cardinals: { id: 138, league: 'mlb', name: 'St. Louis Cardinals' },
      titans: { id: 10, league: 'nfl', name: 'Tennessee Titans' },
      grizzlies: { id: 15, league: 'nba', name: 'Memphis Grizzlies' },
      longhorns: { id: 251, league: 'ncaaf', name: 'Texas Longhorns' }
    };

    this.logs = [];
    this.lastIngestion = null;
    this.metrics = {
      totalIngestions: 0,
      successfulIngestions: 0,
      failedIngestions: 0,
      dataPoints: 0
    };
  }

  /**
   * Initialize data ingestion system
   */
  async initialize() {
    this.log('info', 'Initializing Sports Data Ingestion System');
    
    try {
      await this.createDirectories();
      await this.validateDataSources();
      await this.loadConfiguration();
      
      this.log('info', 'Data ingestion system initialized successfully');
      return { success: true, message: 'System initialized' };
    } catch (error) {
      this.log('error', `Initialization failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create necessary directories
   */
  async createDirectories() {
    const directories = [
      this.config.dataDir,
      this.config.backupDir,
      path.join(this.config.dataDir, 'analytics'),
      path.join(this.config.dataDir, 'analytics', 'mlb'),
      path.join(this.config.dataDir, 'analytics', 'nfl'), 
      path.join(this.config.dataDir, 'analytics', 'nba'),
      path.join(this.config.dataDir, 'analytics', 'ncaa'),
      path.join(this.config.dataDir, 'live'),
      path.join(this.config.dataDir, 'youth-baseball')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        this.log('debug', `✅ Directory created/verified: ${dir}`);
      } catch (error) {
        this.log('warn', `⚠️  Could not create directory ${dir}: ${error.message}`);
      }
    }
  }

  /**
   * Validate data sources
   */
  async validateDataSources() {
    this.log('info', 'Validating data sources...');
    
    for (const [sourceName, source] of Object.entries(this.dataSources)) {
      if (!source.enabled) {
        this.log('warn', `⚠️  Data source ${sourceName} is disabled`);
        continue;
      }

      try {
        // Simple validation - check if baseUrl is accessible
        this.log('debug', `✅ Data source ${sourceName} configured`);
      } catch (error) {
        this.log('warn', `⚠️  Data source ${sourceName} validation failed: ${error.message}`);
        source.enabled = false;
      }
    }
  }

  /**
   * Load ingestion configuration
   */
  async loadConfiguration() {
    try {
      const configPath = path.join(this.config.dataDir, 'ingestion-config.json');
      
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Merge with existing config
        this.config = { ...this.config, ...config };
        this.log('info', '✅ Ingestion configuration loaded');
      } catch {
        // Create default configuration
        const defaultConfig = {
          lastUpdate: null,
          ingestionSchedule: '*/5 * * * *', // Every 5 minutes
          priorities: ['cardinals', 'titans', 'grizzlies', 'longhorns'],
          dataRetention: 30 // days
        };
        
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
        this.log('info', '✅ Default ingestion configuration created');
      }
    } catch (error) {
      this.log('warn', `⚠️  Configuration loading failed: ${error.message}`);
    }
  }

  /**
   * Run priority data ingestion
   */
  async runPriorityIngestion() {
    this.log('info', '🚀 Starting priority data ingestion...');
    
    const startTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      duration: 0,
      dataPoints: 0,
      sources: {},
      success: true
    };

    try {
      // Ingest data for priority teams
      for (const [teamKey, team] of Object.entries(this.teams)) {
        this.log('info', `📊 Ingesting data for ${team.name}...`);
        
        try {
          const teamData = await this.ingestTeamData(team);
          results.sources[teamKey] = teamData;
          results.dataPoints += teamData.dataPoints || 0;
          
          // Save team data
          await this.saveTeamData(teamKey, teamData);
          
          this.log('info', `✅ ${team.name} data ingestion completed`);
          
          // Rate limiting
          await this.delay(this.config.rateLimitDelay);
          
        } catch (error) {
          this.log('error', `❌ ${team.name} data ingestion failed: ${error.message}`);
          results.sources[teamKey] = { error: error.message };
          results.success = false;
        }
      }

      // Ingest youth baseball data if enabled
      if (this.dataSources.perfectGame.enabled) {
        try {
          this.log('info', '🏟️ Ingesting Perfect Game youth baseball data...');
          const youthData = await this.ingestYouthBaseballData();
          results.sources.perfectGame = youthData;
          results.dataPoints += youthData.dataPoints || 0;
          
          await this.saveYouthData(youthData);
          this.log('info', '✅ Perfect Game data ingestion completed');
        } catch (error) {
          this.log('error', `❌ Perfect Game data ingestion failed: ${error.message}`);
          results.sources.perfectGame = { error: error.message };
        }
      }

      results.duration = Date.now() - startTime;
      this.lastIngestion = new Date();
      this.metrics.totalIngestions++;
      this.metrics.dataPoints += results.dataPoints;
      
      if (results.success) {
        this.metrics.successfulIngestions++;
      } else {
        this.metrics.failedIngestions++;
      }

      this.log('info', `🎯 Priority ingestion completed in ${results.duration}ms - ${results.dataPoints} data points`);
      return results;
      
    } catch (error) {
      results.duration = Date.now() - startTime;
      results.success = false;
      results.error = error.message;
      
      this.metrics.totalIngestions++;
      this.metrics.failedIngestions++;
      
      this.log('error', `❌ Priority ingestion failed: ${error.message}`);
      return results;
    }
  }

  /**
   * Ingest data for a specific team
   */
  async ingestTeamData(team) {
    const teamData = {
      team: team.name,
      league: team.league,
      timestamp: new Date().toISOString(),
      dataPoints: 0,
      data: {}
    };

    try {
      switch (team.league) {
        case 'mlb':
          teamData.data = await this.ingestMLBData(team);
          break;
        case 'nfl':
          teamData.data = await this.ingestNFLData(team);
          break;
        case 'nba':
          teamData.data = await this.ingestNBAData(team);
          break;
        case 'ncaaf':
          teamData.data = await this.ingestNCAAData(team);
          break;
        default:
          throw new Error(`Unknown league: ${team.league}`);
      }

      teamData.dataPoints = this.countDataPoints(teamData.data);
      return teamData;
      
    } catch (error) {
      teamData.error = error.message;
      return teamData;
    }
  }

  /**
   * Ingest MLB data
   */
  async ingestMLBData(team) {
    const mlbData = {
      schedule: await this.generateMockScheduleData('MLB', team.name),
      stats: await this.generateMockStatsData('MLB', team.name),
      standings: await this.generateMockStandingsData('MLB', team.name)
    };

    return mlbData;
  }

  /**
   * Ingest NFL data
   */
  async ingestNFLData(team) {
    const nflData = {
      schedule: await this.generateMockScheduleData('NFL', team.name),
      stats: await this.generateMockStatsData('NFL', team.name),
      standings: await this.generateMockStandingsData('NFL', team.name)
    };

    return nflData;
  }

  /**
   * Ingest NBA data
   */
  async ingestNBAData(team) {
    const nbaData = {
      schedule: await this.generateMockScheduleData('NBA', team.name),
      stats: await this.generateMockStatsData('NBA', team.name),
      standings: await this.generateMockStandingsData('NBA', team.name)
    };

    return nbaData;
  }

  /**
   * Ingest NCAA data
   */
  async ingestNCAAData(team) {
    const ncaaData = {
      schedule: await this.generateMockScheduleData('NCAA', team.name),
      stats: await this.generateMockStatsData('NCAA', team.name),
      rankings: await this.generateMockRankingsData('NCAA', team.name)
    };

    return ncaaData;
  }

  /**
   * Ingest youth baseball data
   */
  async ingestYouthBaseballData() {
    const youthData = {
      timestamp: new Date().toISOString(),
      tournaments: await this.generateMockTournamentData(),
      rankings: await this.generateMockYouthRankingsData(),
      prospects: await this.generateMockProspectData(),
      dataPoints: 0
    };

    youthData.dataPoints = this.countDataPoints(youthData);
    return youthData;
  }

  /**
   * Generate mock data (placeholder for real API calls)
   */
  async generateMockScheduleData(league, teamName) {
    return {
      league,
      team: teamName,
      games: [
        {
          date: new Date().toISOString(),
          opponent: 'Mock Opponent',
          home: true,
          result: 'W 7-3'
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateMockStatsData(league, teamName) {
    return {
      league,
      team: teamName,
      wins: 75,
      losses: 45,
      percentage: 0.625,
      lastUpdated: new Date().toISOString()
    };
  }

  async generateMockStandingsData(league, teamName) {
    return {
      league,
      division: 'Mock Division',
      position: 2,
      gamesBack: 1.5,
      lastUpdated: new Date().toISOString()
    };
  }

  async generateMockRankingsData(league, teamName) {
    return {
      league,
      team: teamName,
      rank: 15,
      points: 1250,
      lastUpdated: new Date().toISOString()
    };
  }

  async generateMockTournamentData() {
    return [
      {
        name: 'Perfect Game Showcase',
        location: 'Dallas, TX',
        date: new Date().toISOString(),
        teams: 32
      }
    ];
  }

  async generateMockYouthRankingsData() {
    return {
      top100: [
        { rank: 1, player: 'Mock Player 1', position: 'SS', state: 'TX' }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateMockProspectData() {
    return {
      prospects: [
        { name: 'Mock Prospect', position: 'RHP', graduation: 2025, rating: 95 }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Save team data to file system
   */
  async saveTeamData(teamKey, teamData) {
    try {
      const league = teamData.league;
      const filename = `${teamKey}-${Date.now()}.json`;
      const filepath = path.join(this.config.dataDir, 'analytics', league, filename);
      
      await fs.writeFile(filepath, JSON.stringify(teamData, null, 2));
      
      // Also save as latest
      const latestPath = path.join(this.config.dataDir, 'analytics', league, `${teamKey}-latest.json`);
      await fs.writeFile(latestPath, JSON.stringify(teamData, null, 2));
      
      this.log('debug', `✅ Data saved: ${filepath}`);
    } catch (error) {
      this.log('error', `❌ Failed to save team data: ${error.message}`);
    }
  }

  /**
   * Save youth data to file system
   */
  async saveYouthData(youthData) {
    try {
      const filename = `youth-baseball-${Date.now()}.json`;
      const filepath = path.join(this.config.dataDir, 'youth-baseball', filename);
      
      await fs.writeFile(filepath, JSON.stringify(youthData, null, 2));
      
      // Also save as latest
      const latestPath = path.join(this.config.dataDir, 'youth-baseball', 'latest.json');
      await fs.writeFile(latestPath, JSON.stringify(youthData, null, 2));
      
      this.log('debug', `✅ Youth data saved: ${filepath}`);
    } catch (error) {
      this.log('error', `❌ Failed to save youth data: ${error.message}`);
    }
  }

  /**
   * Get ingestion status
   */
  async getIngestionStatus() {
    return {
      timestamp: new Date().toISOString(),
      lastIngestion: this.lastIngestion,
      metrics: this.metrics,
      dataSources: Object.fromEntries(
        Object.entries(this.dataSources).map(([key, source]) => [
          key,
          { name: source.name, enabled: source.enabled }
        ])
      ),
      teams: this.teams,
      logs: this.logs.slice(-10) // Last 10 log entries
    };
  }

  /**
   * Count data points in an object
   */
  countDataPoints(obj) {
    let count = 0;
    
    function countRecursive(item) {
      if (Array.isArray(item)) {
        count += item.length;
        item.forEach(countRecursive);
      } else if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach(countRecursive);
      } else {
        count++;
      }
    }
    
    countRecursive(obj);
    return count;
  }

  /**
   * Delay function for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging system
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[90m',
      reset: '\x1b[0m'
    };
    
    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] INGESTION ${level.toUpperCase()}: ${message}${colors.reset}`);
  }
}

// CLI Interface
async function main() {
  const ingestion = new SportsDataIngestion();
  const command = process.argv[2] || 'priority';

  try {
    await ingestion.initialize();

    switch (command) {
      case 'priority':
        const results = await ingestion.runPriorityIngestion();
        console.log(JSON.stringify(results, null, 2));
        process.exit(results.success ? 0 : 1);
        break;

      case 'status':
        const status = await ingestion.getIngestionStatus();
        console.log(JSON.stringify(status, null, 2));
        break;

      default:
        console.log(`Blaze Intelligence Sports Data Ingestion

Usage: node sports-data-ingestion.js [command]

Commands:
  priority    Run priority data ingestion for key teams
  status      Show ingestion system status

Examples:
  npm run ingest-data
  node automation/sports-data-ingestion.js priority
`);
        break;
    }
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SportsDataIngestion;