#!/usr/bin/env node

/**
 * Blaze Intelligence Interactive Demo Environment
 * Sample data showcase with live sports analytics
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import SecurityConfig from '../config/security-config.js';
import OptimizedSportsDataService from '../services/optimized-sports-data-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InteractiveDemoEnvironment {
  constructor(options = {}) {
    this.port = options.port || 8097;
    this.environment = options.environment || 'demo';
    
    // Initialize services
    this.sportsService = new OptimizedSportsDataService();
    this.securityConfig = new SecurityConfig(this.environment);
    
    // Sample data for demonstration
    this.sampleData = this.generateSampleData();
  }

  async initialize() {
    console.log('🚀 Initializing Blaze Intelligence Interactive Demo...');
    
    // Initialize sports service
    await this.sportsService.initialize();
    
    // Setup Express app
    this.app = express();
    this.server = createServer(this.app);
    
    // Apply security middleware
    const securityMiddleware = this.securityConfig.getExpressMiddleware();
    securityMiddleware.forEach(middleware => this.app.use(middleware));

    // Middleware
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
    
    this.setupRoutes();
    
    console.log('✅ Interactive Demo Environment initialized');
  }

  generateSampleData() {
    return {
      teams: {
        cardinals: {
          name: 'St. Louis Cardinals',
          league: 'MLB',
          season: 2024,
          stats: {
            wins: 83,
            losses: 79,
            winPercentage: 0.512,
            runsScored: 744,
            runsAllowed: 738,
            homeRecord: '43-38',
            roadRecord: '40-41'
          },
          players: [
            {
              name: 'Paul Goldschmidt',
              position: '1B',
              stats: { avg: 0.245, hr: 22, rbi: 65, ops: 0.716 },
              insights: 'Power numbers down but still elite plate discipline'
            },
            {
              name: 'Nolan Arenado',
              position: '3B',
              stats: { avg: 0.272, hr: 16, rbi: 71, ops: 0.746 },
              insights: 'Consistent defensive excellence with solid offensive production'
            },
            {
              name: 'Sonny Gray',
              position: 'SP',
              stats: { w: 13, l: 9, era: 3.84, so: 203, whip: 1.09 },
              insights: 'Ace-level strikeout rates with improved command'
            }
          ],
          recentGames: [
            { date: '2024-09-25', opponent: 'Brewers', result: 'W 7-6', highlights: 'Walk-off home run in 10th' },
            { date: '2024-09-24', opponent: 'Brewers', result: 'L 2-4', highlights: 'Strong pitching, limited offense' },
            { date: '2024-09-23', opponent: 'Brewers', result: 'W 5-2', highlights: 'Complete game by starter' }
          ],
          predictions: {
            nextGame: { opponent: 'Giants', winProbability: 0.62, keyFactors: ['Home field', 'Pitching matchup'] },
            playoffs: { probability: 0.15, scenario: 'Wild card longshot, need hot streak' }
          }
        },
        titans: {
          name: 'Tennessee Titans',
          league: 'NFL',
          season: 2024,
          stats: {
            wins: 3,
            losses: 8,
            winPercentage: 0.273,
            pointsFor: 187,
            pointsAgainst: 267,
            homeRecord: '2-3',
            roadRecord: '1-5'
          },
          players: [
            {
              name: 'Derrick Henry',
              position: 'RB',
              stats: { rushYards: 695, touchdowns: 8, ypc: 4.2, receptions: 15 },
              insights: 'Workhorse back carrying heavy load, age showing slightly'
            },
            {
              name: 'DeAndre Hopkins',
              position: 'WR',
              stats: { receptions: 42, yards: 512, touchdowns: 2, ypr: 12.2 },
              insights: 'Reliable target but limited by quarterback play'
            },
            {
              name: 'Ryan Tannehill',
              position: 'QB',
              stats: { completions: 189, attempts: 294, yards: 2145, tds: 12, ints: 9 },
              insights: 'Inconsistent performance, needs better protection'
            }
          ],
          recentGames: [
            { date: '2024-11-10', opponent: 'Chargers', result: 'L 17-27', highlights: 'Defensive struggles continue' },
            { date: '2024-11-03', opponent: 'Patriots', result: 'W 20-17', highlights: 'Overtime victory on road' },
            { date: '2024-10-27', opponent: 'Lions', result: 'L 14-52', highlights: 'Blown out at home' }
          ],
          predictions: {
            nextGame: { opponent: 'Texans', winProbability: 0.38, keyFactors: ['Divisional rivalry', 'Injury report'] },
            playoffs: { probability: 0.02, scenario: 'Rebuild year, focus on development' }
          }
        },
        longhorns: {
          name: 'Texas Longhorns',
          league: 'NCAA Football',
          season: 2024,
          stats: {
            wins: 9,
            losses: 1,
            winPercentage: 0.900,
            pointsFor: 412,
            pointsAgainst: 189,
            homeRecord: '5-0',
            roadRecord: '4-1'
          },
          players: [
            {
              name: 'Quinn Ewers',
              position: 'QB',
              stats: { completions: 189, attempts: 285, yards: 2375, tds: 24, ints: 6 },
              insights: 'Excellent decision-making, improved deep ball accuracy'
            },
            {
              name: 'Bijan Robinson',
              position: 'RB',
              stats: { rushYards: 1127, touchdowns: 18, ypc: 6.1, receptions: 28 },
              insights: 'Elite dual-threat capability, Heisman candidate'
            },
            {
              name: 'Xavier Worthy',
              position: 'WR',
              stats: { receptions: 51, yards: 789, touchdowns: 8, ypr: 15.5 },
              insights: 'Game-breaking speed, consistent deep threat'
            }
          ],
          recentGames: [
            { date: '2024-11-09', opponent: 'Oklahoma State', result: 'W 49-21', highlights: 'Dominant home performance' },
            { date: '2024-11-02', opponent: 'TCU', result: 'W 35-13', highlights: 'Defense forced 4 turnovers' },
            { date: '2024-10-26', opponent: 'Oklahoma', result: 'W 34-3', highlights: 'Red River Showdown dominance' }
          ],
          predictions: {
            nextGame: { opponent: 'Kansas', winProbability: 0.85, keyFactors: ['Home field', 'Talent gap'] },
            playoffs: { probability: 0.92, scenario: 'Big 12 title game favorite, CFP lock' }
          }
        },
        grizzlies: {
          name: 'Memphis Grizzlies',
          league: 'NBA',
          season: '2024-25',
          stats: {
            wins: 9,
            losses: 7,
            winPercentage: 0.563,
            pointsFor: 122.1,
            pointsAgainst: 119.4,
            homeRecord: '5-4',
            roadRecord: '4-3'
          },
          players: [
            {
              name: 'Ja Morant',
              position: 'PG',
              stats: { ppg: 22.0, apg: 8.1, rpg: 5.0, fg: 0.457 },
              insights: 'Explosive playmaker returning from suspension, team catalyst'
            },
            {
              name: 'Jaren Jackson Jr.',
              position: 'PF',
              stats: { ppg: 22.5, rpg: 5.5, bpg: 1.6, fg: 0.507 },
              insights: 'Defensive anchor with improved offensive efficiency'
            },
            {
              name: 'Desmond Bane',
              position: 'SG',
              stats: { ppg: 24.7, apg: 5.5, rpg: 4.8, fg: 0.478 },
              insights: 'Consistent scorer and secondary playmaker'
            }
          ],
          recentGames: [
            { date: '2024-11-09', opponent: 'Trail Blazers', result: 'W 123-98', highlights: 'Balanced scoring attack' },
            { date: '2024-11-07', opponent: 'Lakers', result: 'L 124-131', highlights: 'Overtime thriller in LA' },
            { date: '2024-11-06', opponent: 'Warriors', result: 'W 123-118', highlights: 'Fourth quarter comeback' }
          ],
          predictions: {
            nextGame: { opponent: 'Nuggets', winProbability: 0.45, keyFactors: ['Home court', 'Defensive matchup'] },
            playoffs: { probability: 0.78, scenario: 'Play-in tournament likely, young core developing' }
          }
        }
      },
      analytics: {
        trends: [
          { metric: 'Team Chemistry', cardinals: 78, titans: 65, longhorns: 94, grizzlies: 82 },
          { metric: 'Injury Risk', cardinals: 23, titans: 45, longhorns: 12, grizzlies: 28 },
          { metric: 'Momentum', cardinals: 56, titans: 34, longhorns: 91, grizzlies: 73 },
          { metric: 'Clutch Performance', cardinals: 67, titans: 42, longhorns: 88, grizzlies: 79 }
        ],
        insights: [
          'Cardinals showing late-season resilience despite disappointing record',
          'Titans in clear rebuild mode, focus shifting to 2025 draft positioning',
          'Longhorns emerging as legitimate College Football Playoff contender',
          'Grizzlies exceeding early expectations with improved depth and chemistry'
        ]
      },
      liveData: {
        lastUpdated: new Date().toISOString(),
        dataPoints: 2847,
        apiStatus: 'operational',
        cacheHitRatio: '89%'
      }
    };
  }

  setupRoutes() {
    // Main demo page
    this.app.get('/', (req, res) => {
      res.send(this.generateDemoHTML());
    });

    // API endpoints
    this.app.get('/api/demo/teams', (req, res) => {
      res.json({
        success: true,
        teams: this.sampleData.teams,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/demo/team/:teamKey', (req, res) => {
      const { teamKey } = req.params;
      const team = this.sampleData.teams[teamKey];
      
      if (!team) {
        return res.status(404).json({
          success: false,
          error: `Team '${teamKey}' not found`,
          availableTeams: Object.keys(this.sampleData.teams)
        });
      }

      res.json({
        success: true,
        team,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/demo/analytics', (req, res) => {
      res.json({
        success: true,
        analytics: this.sampleData.analytics,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/demo/live', (req, res) => {
      // Simulate live data updates
      const updatedLiveData = {
        ...this.sampleData.liveData,
        lastUpdated: new Date().toISOString(),
        dataPoints: this.sampleData.liveData.dataPoints + Math.floor(Math.random() * 10),
        activeUsers: Math.floor(Math.random() * 50) + 25,
        requestsPerMinute: Math.floor(Math.random() * 100) + 150
      };

      res.json({
        success: true,
        liveData: updatedLiveData,
        timestamp: new Date().toISOString()
      });
    });

    this.app.post('/api/demo/simulate/:teamKey', (req, res) => {
      const { teamKey } = req.params;
      const team = this.sampleData.teams[teamKey];
      
      if (!team) {
        return res.status(404).json({
          success: false,
          error: `Team '${teamKey}' not found`
        });
      }

      // Simulate game outcome
      const simulation = {
        team: team.name,
        nextOpponent: team.predictions.nextGame.opponent,
        simulatedScore: this.generateGameSimulation(team),
        confidence: team.predictions.nextGame.winProbability,
        keyFactors: team.predictions.nextGame.keyFactors,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        simulation,
        timestamp: new Date().toISOString()
      });
    });

    // Health check
    this.app.get('/api/demo/health', (req, res) => {
      res.json({
        status: 'healthy',
        environment: 'demo',
        uptime: process.uptime(),
        features: {
          sampleData: true,
          liveSimulation: true,
          teamAnalytics: true,
          gameSimulation: true
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  generateGameSimulation(team) {
    const isWin = Math.random() < team.predictions.nextGame.winProbability;
    
    let teamScore, opponentScore;
    
    switch (team.league) {
      case 'MLB':
        teamScore = Math.floor(Math.random() * 10) + 2;
        opponentScore = isWin ? Math.floor(Math.random() * teamScore) : teamScore + Math.floor(Math.random() * 5) + 1;
        break;
      case 'NFL':
        teamScore = Math.floor(Math.random() * 21) + 14;
        opponentScore = isWin ? Math.floor(Math.random() * teamScore) : teamScore + Math.floor(Math.random() * 14) + 3;
        break;
      case 'NCAA Football':
        teamScore = Math.floor(Math.random() * 35) + 21;
        opponentScore = isWin ? Math.floor(Math.random() * teamScore) : teamScore + Math.floor(Math.random() * 21) + 7;
        break;
      case 'NBA':
        teamScore = Math.floor(Math.random() * 40) + 100;
        opponentScore = isWin ? Math.floor(Math.random() * teamScore) : teamScore + Math.floor(Math.random() * 20) + 5;
        break;
      default:
        teamScore = Math.floor(Math.random() * 5) + 1;
        opponentScore = isWin ? Math.floor(Math.random() * teamScore) : teamScore + Math.floor(Math.random() * 3) + 1;
    }

    return {
      result: isWin ? 'W' : 'L',
      teamScore,
      opponentScore,
      margin: Math.abs(teamScore - opponentScore),
      gameNotes: isWin ? 'Solid performance across all phases' : 'Areas for improvement identified'
    };
  }

  generateDemoHTML() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blaze Intelligence - Interactive Demo</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #0a0b1e 0%, #1a1b3c 50%, #2a2b5c 100%);
                color: #ffffff;
                min-height: 100vh;
                overflow-x: hidden;
            }
            
            .header {
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                padding: 1.5rem 2rem;
                border-bottom: 1px solid rgba(191, 87, 0, 0.3);
                text-align: center;
            }
            
            .logo {
                font-size: 2rem;
                font-weight: bold;
                color: #BF5700;
                text-shadow: 0 0 20px rgba(191, 87, 0, 0.5);
                margin-bottom: 0.5rem;
            }
            
            .tagline {
                font-size: 1.125rem;
                color: #9BCBEB;
                margin-bottom: 1rem;
            }
            
            .demo-badge {
                background: linear-gradient(45deg, #00B2A9, #9BCBEB);
                padding: 0.5rem 1.5rem;
                border-radius: 25px;
                font-size: 0.875rem;
                font-weight: 600;
                display: inline-block;
            }
            
            .container {
                padding: 2rem;
                max-width: 1600px;
                margin: 0 auto;
            }
            
            .teams-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .team-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .team-card:hover {
                border-color: rgba(191, 87, 0, 0.5);
                box-shadow: 0 8px 32px rgba(191, 87, 0, 0.2);
                transform: translateY(-2px);
            }
            
            .team-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .team-name {
                font-size: 1.25rem;
                font-weight: 600;
                color: #BF5700;
            }
            
            .league-badge {
                background: #00B2A9;
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            
            .team-record {
                font-size: 1.5rem;
                font-weight: bold;
                color: #9BCBEB;
                margin-bottom: 1rem;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
                margin-bottom: 1rem;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-value {
                font-size: 1.125rem;
                font-weight: bold;
                color: #00B2A9;
            }
            
            .stat-label {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .controls {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 1.5rem;
                margin: 2rem 0;
            }
            
            .controls h3 {
                color: #BF5700;
                margin-bottom: 1rem;
                font-size: 1.25rem;
            }
            
            .button-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .demo-button {
                background: linear-gradient(45deg, #BF5700, #FF7A00);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;
            }
            
            .demo-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(191, 87, 0, 0.4);
            }
            
            .demo-button.secondary {
                background: linear-gradient(45deg, #00B2A9, #9BCBEB);
            }
            
            .analytics-section {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 1.5rem;
                margin: 2rem 0;
            }
            
            .analytics-section h3 {
                color: #BF5700;
                margin-bottom: 1rem;
                font-size: 1.25rem;
            }
            
            .insights-list {
                list-style: none;
            }
            
            .insights-list li {
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
            }
            
            .insights-list li:last-child {
                border-bottom: none;
            }
            
            .output {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 0.875rem;
                max-height: 400px;
                overflow-y: auto;
                white-space: pre-wrap;
            }
            
            .hidden { display: none; }
            
            .loading {
                text-align: center;
                color: #00B2A9;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🔥 Blaze Intelligence</div>
            <div class="tagline">Interactive Demo Environment</div>
            <div class="demo-badge">Live Sample Data • Cardinals • Titans • Longhorns • Grizzlies</div>
        </div>
        
        <div class="container">
            <div class="teams-grid" id="teamsGrid">
                <!-- Teams will be populated by JavaScript -->
            </div>
            
            <div class="controls">
                <h3>📊 Interactive Demo Controls</h3>
                <div class="button-grid">
                    <button class="demo-button" onclick="loadAllTeams()">Load All Teams</button>
                    <button class="demo-button" onclick="loadAnalytics()">View Analytics</button>
                    <button class="demo-button" onclick="loadLiveData()">Live Data Feed</button>
                    <button class="demo-button secondary" onclick="simulateGame('cardinals')">Simulate Cardinals Game</button>
                    <button class="demo-button secondary" onclick="simulateGame('titans')">Simulate Titans Game</button>
                    <button class="demo-button secondary" onclick="simulateGame('longhorns')">Simulate Longhorns Game</button>
                    <button class="demo-button secondary" onclick="simulateGame('grizzlies')">Simulate Grizzlies Game</button>
                    <button class="demo-button" onclick="clearOutput()">Clear Output</button>
                </div>
            </div>
            
            <div class="analytics-section">
                <h3>💡 Key Insights</h3>
                <ul class="insights-list" id="insightsList">
                    <li>Cardinals showing late-season resilience despite disappointing record</li>
                    <li>Titans in clear rebuild mode, focus shifting to 2025 draft positioning</li>
                    <li>Longhorns emerging as legitimate College Football Playoff contender</li>
                    <li>Grizzlies exceeding early expectations with improved depth and chemistry</li>
                </ul>
            </div>
            
            <div class="output" id="output">
                Welcome to the Blaze Intelligence Interactive Demo!
                
Use the controls above to:
• Load team data and statistics
• View cross-sport analytics 
• Simulate live data feeds
• Run game outcome simulations
• Explore predictive insights

Click any button to get started...
            </div>
        </div>
        
        <script>
            async function loadAllTeams() {
                showLoading('Loading all team data...');
                try {
                    const response = await fetch('/api/demo/teams');
                    const data = await response.json();
                    
                    if (data.success) {
                        displayOutput('TEAM DATA LOADED', JSON.stringify(data.teams, null, 2));
                        populateTeamsGrid(data.teams);
                    } else {
                        displayOutput('ERROR', 'Failed to load team data');
                    }
                } catch (error) {
                    displayOutput('ERROR', error.message);
                }
            }
            
            async function loadAnalytics() {
                showLoading('Loading analytics data...');
                try {
                    const response = await fetch('/api/demo/analytics');
                    const data = await response.json();
                    
                    if (data.success) {
                        displayOutput('ANALYTICS DATA', JSON.stringify(data.analytics, null, 2));
                    } else {
                        displayOutput('ERROR', 'Failed to load analytics');
                    }
                } catch (error) {
                    displayOutput('ERROR', error.message);
                }
            }
            
            async function loadLiveData() {
                showLoading('Fetching live data feed...');
                try {
                    const response = await fetch('/api/demo/live');
                    const data = await response.json();
                    
                    if (data.success) {
                        displayOutput('LIVE DATA FEED', JSON.stringify(data.liveData, null, 2));
                    } else {
                        displayOutput('ERROR', 'Failed to load live data');
                    }
                } catch (error) {
                    displayOutput('ERROR', error.message);
                }
            }
            
            async function simulateGame(teamKey) {
                showLoading(\`Simulating game for \${teamKey}...\`);
                try {
                    const response = await fetch(\`/api/demo/simulate/\${teamKey}\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        displayOutput(\`GAME SIMULATION - \${teamKey.toUpperCase()}\`, JSON.stringify(data.simulation, null, 2));
                    } else {
                        displayOutput('ERROR', data.error);
                    }
                } catch (error) {
                    displayOutput('ERROR', error.message);
                }
            }
            
            function populateTeamsGrid(teams) {
                const grid = document.getElementById('teamsGrid');
                grid.innerHTML = '';
                
                Object.entries(teams).forEach(([key, team]) => {
                    const card = document.createElement('div');
                    card.className = 'team-card';
                    card.onclick = () => loadTeamData(key);
                    
                    const record = team.league === 'NBA' 
                        ? \`\${team.stats.wins}-\${team.stats.losses}\`
                        : \`\${team.stats.wins}-\${team.stats.losses} (\${(team.stats.winPercentage * 100).toFixed(1)}%)\`;
                    
                    card.innerHTML = \`
                        <div class="team-header">
                            <div class="team-name">\${team.name}</div>
                            <div class="league-badge">\${team.league}</div>
                        </div>
                        <div class="team-record">\${record}</div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-value">\${team.league === 'NBA' ? team.stats.pointsFor.toFixed(1) : team.stats.pointsFor}</div>
                                <div class="stat-label">\${team.league === 'NBA' ? 'PPG' : 'Points For'}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">\${team.league === 'NBA' ? team.stats.pointsAgainst.toFixed(1) : team.stats.pointsAgainst}</div>
                                <div class="stat-label">\${team.league === 'NBA' ? 'Opp PPG' : 'Points Against'}</div>
                            </div>
                        </div>
                    \`;
                    
                    grid.appendChild(card);
                });
            }
            
            async function loadTeamData(teamKey) {
                showLoading(\`Loading \${teamKey} data...\`);
                try {
                    const response = await fetch(\`/api/demo/team/\${teamKey}\`);
                    const data = await response.json();
                    
                    if (data.success) {
                        displayOutput(\`TEAM DATA - \${teamKey.toUpperCase()}\`, JSON.stringify(data.team, null, 2));
                    } else {
                        displayOutput('ERROR', data.error);
                    }
                } catch (error) {
                    displayOutput('ERROR', error.message);
                }
            }
            
            function showLoading(message) {
                const output = document.getElementById('output');
                output.innerHTML = \`<div class="loading">\${message}</div>\`;
            }
            
            function displayOutput(title, content) {
                const output = document.getElementById('output');
                const timestamp = new Date().toLocaleTimeString();
                output.innerHTML = \`[\${timestamp}] \${title}:\\n\\n\${content}\`;
            }
            
            function clearOutput() {
                const output = document.getElementById('output');
                output.innerHTML = \`Welcome to the Blaze Intelligence Interactive Demo!
                
Use the controls above to:
• Load team data and statistics
• View cross-sport analytics 
• Simulate live data feeds
• Run game outcome simulations
• Explore predictive insights

Click any button to get started...\`;
            }
            
            // Auto-load teams on page load
            window.addEventListener('load', () => {
                setTimeout(loadAllTeams, 1000);
            });
        </script>
    </body>
    </html>
    `;
  }

  async start() {
    try {
      await this.initialize();
      
      return new Promise((resolve, reject) => {
        this.server.on('error', reject);
        
        this.server.listen(this.port, () => {
          console.log(`🚀 Blaze Intelligence Interactive Demo running`);
          console.log(`📊 Demo URL: http://localhost:${this.port}`);
          console.log(`🔧 Environment: ${this.environment}`);
          console.log(`🎯 Features: Sample data, live simulation, game predictions`);
          
          resolve(this.server);
        });
      });
    } catch (error) {
      console.error('❌ Failed to start interactive demo:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping interactive demo...');
    
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🔒 Interactive demo stopped');
          resolve();
        });
      });
    }
    
    await this.sportsService.close();
  }
}

// Start demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new InteractiveDemoEnvironment({
    port: process.argv[2] ? parseInt(process.argv[2]) : 8097,
    environment: process.argv[3] || 'demo'
  });
  
  demo.start().catch(error => {
    console.error('❌ Demo startup failed:', error.message);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down interactive demo...');
    await demo.stop();
    process.exit(0);
  });
}

export default InteractiveDemoEnvironment;