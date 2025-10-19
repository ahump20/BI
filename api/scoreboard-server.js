/**
 * Typed Scoreboard Service API Server
 * Express.js application with TypeScript-style configuration
 * PR #49: Rebuild API server with typed scoreboard service
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SecurityUtils } from '../lib/security-utils.js';

class ScoreboardAPIServer {
    constructor(config = {}) {
        this.app = express();
        this.config = {
            port: config.port || process.env.PORT || 3000,
            environment: config.environment || process.env.NODE_ENV || 'development',
            corsOrigins: config.corsOrigins || ['http://localhost:8000', 'https://blaze-intelligence.com'],
            rateLimit: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 1000 // limit each IP to 1000 requests per windowMs
            },
            cache: {
                enabled: true,
                ttl: 300 // 5 minutes
            }
        };
        
        this.cache = new Map();
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        
        // CORS
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit(this.config.rateLimit);
        this.app.use(limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: this.config.environment,
                uptime: process.uptime()
            });
        });
        
        // Scoreboard endpoints
        this.app.get('/api/scoreboard/:gameId', this.getScoreboard.bind(this));
        this.app.post('/api/scoreboard/:gameId/update', this.updateScoreboard.bind(this));
        this.app.get('/api/live-scores', this.getLiveScores.bind(this));
        this.app.get('/api/team/:teamId/stats', this.getTeamStats.bind(this));
        
        // Sports data endpoints
        this.app.get('/api/teams', this.getTeams.bind(this));
        this.app.get('/api/games/today', this.getTodaysGames.bind(this));
        this.app.get('/api/standings/:league', this.getStandings.bind(this));
        
        // Error handling
        this.app.use(this.errorHandler.bind(this));
    }
    
    async getScoreboard(req, res) {
        try {
            const { gameId } = req.params;
            
            // Input validation
            const validation = SecurityUtils.validateInput(gameId, {
                required: true,
                pattern: /^[a-zA-Z0-9-_]+$/
            });
            
            if (validation.length > 0) {
                return res.status(400).json({
                    error: 'Invalid game ID',
                    details: validation
                });
            }
            
            // Check cache
            const cacheKey = `scoreboard_${gameId}`;
            if (this.config.cache.enabled && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.config.cache.ttl * 1000) {
                    return res.json(cached.data);
                }
            }
            
            // Simulate scoreboard data
            const scoreboardData = {
                gameId: SecurityUtils.sanitize(gameId),
                teams: {
                    home: {
                        name: "Cardinals",
                        score: Math.floor(Math.random() * 10),
                        record: "45-17"
                    },
                    away: {
                        name: "Titans", 
                        score: Math.floor(Math.random() * 10),
                        record: "38-24"
                    }
                },
                inning: Math.floor(Math.random() * 9) + 1,
                status: "In Progress",
                lastUpdated: new Date().toISOString()
            };
            
            // Cache the result
            if (this.config.cache.enabled) {
                this.cache.set(cacheKey, {
                    data: scoreboardData,
                    timestamp: Date.now()
                });
            }
            
            res.json(scoreboardData);
            
        } catch (error) {
            console.error('Error getting scoreboard:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: this.config.environment === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
    
    async updateScoreboard(req, res) {
        try {
            const { gameId } = req.params;
            const updateData = req.body;
            
            // Validate and sanitize input
            const sanitizedData = SecurityUtils.preventXSS(updateData);
            
            // Simulate update
            const result = {
                gameId: SecurityUtils.sanitize(gameId),
                updated: true,
                timestamp: new Date().toISOString(),
                data: sanitizedData
            };
            
            // Clear cache for this game
            const cacheKey = `scoreboard_${gameId}`;
            this.cache.delete(cacheKey);
            
            res.json(result);
            
        } catch (error) {
            console.error('Error updating scoreboard:', error);
            res.status(500).json({ error: 'Failed to update scoreboard' });
        }
    }
    
    async getLiveScores(req, res) {
        try {
            const liveScores = [
                {
                    gameId: "game_001",
                    teams: { home: "Cardinals", away: "Titans" },
                    score: { home: 7, away: 4 },
                    status: "In Progress"
                },
                {
                    gameId: "game_002", 
                    teams: { home: "Longhorns", away: "Grizzlies" },
                    score: { home: 21, away: 14 },
                    status: "Final"
                }
            ];
            
            res.json({
                liveScores: SecurityUtils.preventXSS(liveScores),
                lastUpdated: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error getting live scores:', error);
            res.status(500).json({ error: 'Failed to get live scores' });
        }
    }
    
    async getTeamStats(req, res) {
        try {
            const { teamId } = req.params;
            
            const stats = {
                teamId: SecurityUtils.sanitize(teamId),
                stats: {
                    wins: Math.floor(Math.random() * 50),
                    losses: Math.floor(Math.random() * 30),
                    runsScored: Math.floor(Math.random() * 800),
                    runsAllowed: Math.floor(Math.random() * 700)
                }
            };
            
            res.json(stats);
            
        } catch (error) {
            console.error('Error getting team stats:', error);
            res.status(500).json({ error: 'Failed to get team stats' });
        }
    }
    
    async getTeams(req, res) {
        try {
            const teams = [
                { id: "cardinals", name: "St. Louis Cardinals", league: "MLB" },
                { id: "titans", name: "Tennessee Titans", league: "NFL" },
                { id: "longhorns", name: "Texas Longhorns", league: "NCAA" },
                { id: "grizzlies", name: "Memphis Grizzlies", league: "NBA" }
            ];
            
            res.json({ teams });
            
        } catch (error) {
            console.error('Error getting teams:', error);
            res.status(500).json({ error: 'Failed to get teams' });
        }
    }
    
    async getTodaysGames(req, res) {
        try {
            const games = [
                {
                    gameId: "game_001",
                    teams: { home: "Cardinals", away: "Titans" },
                    startTime: new Date().toISOString(),
                    status: "Scheduled"
                }
            ];
            
            res.json({ games });
            
        } catch (error) {
            console.error('Error getting today\'s games:', error);
            res.status(500).json({ error: 'Failed to get today\'s games' });
        }
    }
    
    async getStandings(req, res) {
        try {
            const { league } = req.params;
            
            const standings = [
                { team: "Cardinals", wins: 45, losses: 17, percentage: 0.726 },
                { team: "Titans", wins: 38, losses: 24, percentage: 0.613 }
            ];
            
            res.json({
                league: SecurityUtils.sanitize(league),
                standings
            });
            
        } catch (error) {
            console.error('Error getting standings:', error);
            res.status(500).json({ error: 'Failed to get standings' });
        }
    }
    
    errorHandler(error, req, res, next) {
        console.error('API Error:', error);
        
        res.status(error.status || 500).json({
            error: error.message || 'Internal server error',
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
    
    start() {
        return new Promise((resolve, reject) => {
            try {
                const server = this.app.listen(this.config.port, () => {
                    console.log(`🚀 Scoreboard API Server running on port ${this.config.port}`);
                    console.log(`📊 Environment: ${this.config.environment}`);
                    console.log(`🔒 Security: Enabled with rate limiting and CORS`);
                    resolve(server);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default ScoreboardAPIServer;

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new ScoreboardAPIServer();
    server.start().catch(console.error);
}