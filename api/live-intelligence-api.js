/**
 * Live Intelligence Endpoints and Security Tooling
 * Enhanced authentication, NIL valuation, and championship probability APIs
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

class LiveIntelligenceAPI {
    constructor(options = {}) {
        this.app = express();
        this.port = options.port || 3001;
        this.jwtSecret = process.env.JWT_SECRET || 'blaze-intelligence-secret-key';
        this.auth0Domain = process.env.AUTH0_DOMAIN;
        this.sentryDSN = process.env.SENTRY_DSN;
        
        this.setupMiddleware();
        this.setupSecurity();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security headers
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://api.sentry.io"],
                },
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            noSniff: true,
            referrerPolicy: { policy: "same-origin" }
        }));

        // CORS configuration
        this.app.use(cors({
            origin: [
                'http://localhost:3000',
                'http://localhost:8000',
                'https://blaze-intelligence.com',
                'https://blaze-intelligence.netlify.app',
                'https://blaze-intelligence-main.netlify.app',
                'https://blaze-3d.netlify.app'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }

    setupSecurity() {
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                code: 'RATE_LIMIT_EXCEEDED'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        // Stricter rate limiting for sensitive endpoints
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 10, // Limit authentication attempts
            message: {
                error: 'Too many authentication attempts, please try again later.',
                code: 'AUTH_RATE_LIMIT_EXCEEDED'
            }
        });

        this.app.use('/api/', limiter);
        this.app.use('/api/auth/', authLimiter);
        this.app.use('/api/nil/', authLimiter);
        this.app.use('/api/championship/', authLimiter);

        // Sentry error tracking setup
        if (this.sentryDSN) {
            this.setupSentry();
        }
    }

    setupSentry() {
        console.log('🔍 Setting up Sentry error tracking...');
        // Sentry setup would go here
        // For demo purposes, we'll use a mock implementation
        this.sentryCapture = (error, context = {}) => {
            console.error('Sentry Error Capture:', {
                error: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString()
            });
        };
    }

    // JWT Token verification middleware
    verifyToken(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'Access token is required',
                code: 'NO_TOKEN'
            });
        }

        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            req.user = decoded;
            next();
        } catch (error) {
            this.sentryCapture?.(error, { endpoint: req.path, userId: req.user?.id });
            
            return res.status(403).json({
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                services: {
                    database: 'connected',
                    authentication: 'active',
                    consciousness: 'streaming',
                    analytics: 'processing'
                }
            });
        });

        // Authentication endpoints
        this.setupAuthRoutes();
        
        // NIL valuation endpoints
        this.setupNILRoutes();
        
        // Championship probability endpoints
        this.setupChampionshipRoutes();
        
        // Character assessment endpoints
        this.setupCharacterRoutes();
        
        // Analytics endpoints
        this.setupAnalyticsRoutes();
    }

    setupAuthRoutes() {
        // Generate JWT token
        this.app.post('/api/auth/login', async (req, res) => {
            try {
                const { username, password, email } = req.body;

                // Input validation
                if (!username || !password) {
                    return res.status(400).json({
                        error: 'Username and password are required',
                        code: 'MISSING_CREDENTIALS'
                    });
                }

                // Mock authentication (replace with real auth logic)
                const user = await this.authenticateUser(username, password);
                
                if (!user) {
                    return res.status(401).json({
                        error: 'Invalid credentials',
                        code: 'INVALID_CREDENTIALS'
                    });
                }

                // Generate JWT
                const token = jwt.sign(
                    { 
                        id: user.id, 
                        username: user.username,
                        role: user.role,
                        permissions: user.permissions
                    },
                    this.jwtSecret,
                    { expiresIn: '24h' }
                );

                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        permissions: user.permissions
                    },
                    expiresIn: '24h'
                });

            } catch (error) {
                this.sentryCapture?.(error, { endpoint: '/api/auth/login' });
                res.status(500).json({
                    error: 'Authentication service unavailable',
                    code: 'AUTH_SERVICE_ERROR'
                });
            }
        });

        // Token validation
        this.app.post('/api/auth/verify', this.verifyToken.bind(this), (req, res) => {
            res.json({
                valid: true,
                user: req.user,
                timestamp: new Date().toISOString()
            });
        });

        // Token refresh
        this.app.post('/api/auth/refresh', this.verifyToken.bind(this), (req, res) => {
            const newToken = jwt.sign(
                { 
                    id: req.user.id, 
                    username: req.user.username,
                    role: req.user.role,
                    permissions: req.user.permissions
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token: newToken,
                expiresIn: '24h'
            });
        });
    }

    setupNILRoutes() {
        // Get NIL valuation for player
        this.app.get('/api/nil/player/:playerId', this.verifyToken.bind(this), async (req, res) => {
            try {
                const { playerId } = req.params;
                const valuation = await this.calculateNILValuation(playerId);

                res.json({
                    success: true,
                    playerId,
                    valuation: {
                        totalValue: valuation.total,
                        marketValue: valuation.market,
                        socialMedia: valuation.social,
                        performance: valuation.performance,
                        potential: valuation.potential,
                        confidence: valuation.confidence
                    },
                    lastUpdated: new Date().toISOString(),
                    dataPoints: valuation.dataPoints
                });

            } catch (error) {
                this.sentryCapture?.(error, { 
                    endpoint: '/api/nil/player',
                    playerId: req.params.playerId,
                    userId: req.user.id
                });
                
                res.status(500).json({
                    error: 'NIL valuation service unavailable',
                    code: 'NIL_SERVICE_ERROR'
                });
            }
        });

        // Get team NIL summary
        this.app.get('/api/nil/team/:teamId', this.verifyToken.bind(this), async (req, res) => {
            try {
                const { teamId } = req.params;
                const summary = await this.getTeamNILSummary(teamId);

                res.json({
                    success: true,
                    teamId,
                    summary: {
                        totalTeamValue: summary.total,
                        averagePlayerValue: summary.average,
                        topPlayers: summary.topPlayers,
                        growthRate: summary.growth,
                        conferenceRank: summary.rank
                    },
                    lastUpdated: new Date().toISOString()
                });

            } catch (error) {
                this.sentryCapture?.(error, { 
                    endpoint: '/api/nil/team',
                    teamId: req.params.teamId,
                    userId: req.user.id
                });
                
                res.status(500).json({
                    error: 'Team NIL service unavailable',
                    code: 'TEAM_NIL_SERVICE_ERROR'
                });
            }
        });
    }

    setupChampionshipRoutes() {
        // Calculate championship probability
        this.app.get('/api/championship/probability/:teamId', this.verifyToken.bind(this), async (req, res) => {
            try {
                const { teamId } = req.params;
                const probability = await this.calculateChampionshipProbability(teamId);

                res.json({
                    success: true,
                    teamId,
                    championship: {
                        probability: probability.overall,
                        confidence: probability.confidence,
                        factors: {
                            roster: probability.roster,
                            coaching: probability.coaching,
                            schedule: probability.schedule,
                            momentum: probability.momentum,
                            health: probability.health
                        },
                        comparison: probability.comparison,
                        lastCalculated: new Date().toISOString()
                    }
                });

            } catch (error) {
                this.sentryCapture?.(error, { 
                    endpoint: '/api/championship/probability',
                    teamId: req.params.teamId,
                    userId: req.user.id
                });
                
                res.status(500).json({
                    error: 'Championship calculation service unavailable',
                    code: 'CHAMPIONSHIP_SERVICE_ERROR'
                });
            }
        });

        // Get conference championship odds
        this.app.get('/api/championship/conference/:conferenceId', this.verifyToken.bind(this), async (req, res) => {
            try {
                const { conferenceId } = req.params;
                const odds = await this.getConferenceChampionshipOdds(conferenceId);

                res.json({
                    success: true,
                    conferenceId,
                    teams: odds.teams,
                    lastUpdated: new Date().toISOString()
                });

            } catch (error) {
                this.sentryCapture?.(error, { 
                    endpoint: '/api/championship/conference',
                    conferenceId: req.params.conferenceId,
                    userId: req.user.id
                });
                
                res.status(500).json({
                    error: 'Conference championship service unavailable',
                    code: 'CONFERENCE_SERVICE_ERROR'
                });
            }
        });
    }

    setupCharacterRoutes() {
        // Character assessment for player
        this.app.post('/api/character/assess', this.verifyToken.bind(this), async (req, res) => {
            try {
                const { playerId, videoData, biometricData } = req.body;
                const assessment = await this.performCharacterAssessment(playerId, videoData, biometricData);

                res.json({
                    success: true,
                    playerId,
                    assessment: {
                        leadership: assessment.leadership,
                        resilience: assessment.resilience,
                        teamwork: assessment.teamwork,
                        discipline: assessment.discipline,
                        competitiveness: assessment.competitiveness,
                        overall: assessment.overall,
                        confidence: assessment.confidence
                    },
                    analysisDate: new Date().toISOString(),
                    methodology: 'AI-powered behavioral analysis'
                });

            } catch (error) {
                this.sentryCapture?.(error, { 
                    endpoint: '/api/character/assess',
                    playerId: req.body.playerId,
                    userId: req.user.id
                });
                
                res.status(500).json({
                    error: 'Character assessment service unavailable',
                    code: 'CHARACTER_SERVICE_ERROR'
                });
            }
        });
    }

    setupAnalyticsRoutes() {
        // Real-time analytics dashboard data
        this.app.get('/api/analytics/live', this.verifyToken.bind(this), async (req, res) => {
            try {
                const liveData = await this.getLiveAnalytics();

                res.json({
                    success: true,
                    analytics: {
                        consciousness: {
                            level: liveData.consciousness.level,
                            status: liveData.consciousness.status,
                            neurons: liveData.consciousness.neurons,
                            processing: liveData.consciousness.processing
                        },
                        sports: {
                            cardinals: liveData.sports.cardinals,
                            titans: liveData.sports.titans,
                            longhorns: liveData.sports.longhorns,
                            grizzlies: liveData.sports.grizzlies
                        },
                        performance: {
                            dataPoints: liveData.performance.dataPoints,
                            accuracy: liveData.performance.accuracy,
                            updateFrequency: liveData.performance.updateFrequency
                        }
                    },
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                this.sentryCapture?.(error, { 
                    endpoint: '/api/analytics/live',
                    userId: req.user.id
                });
                
                res.status(500).json({
                    error: 'Live analytics service unavailable',
                    code: 'ANALYTICS_SERVICE_ERROR'
                });
            }
        });
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                code: 'ENDPOINT_NOT_FOUND',
                path: req.path
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            this.sentryCapture?.(error, { 
                endpoint: req.path,
                method: req.method,
                userId: req.user?.id
            });

            console.error('Unhandled error:', error);

            res.status(500).json({
                error: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });
    }

    // Mock service methods (replace with real implementations)
    async authenticateUser(username, password) {
        // Mock user database
        const users = {
            'admin': { 
                id: 1, 
                username: 'admin', 
                password: 'admin123', 
                role: 'admin',
                permissions: ['read', 'write', 'admin']
            },
            'analyst': { 
                id: 2, 
                username: 'analyst', 
                password: 'analyst123', 
                role: 'analyst',
                permissions: ['read', 'write']
            },
            'viewer': { 
                id: 3, 
                username: 'viewer', 
                password: 'viewer123', 
                role: 'viewer',
                permissions: ['read']
            }
        };

        const user = users[username];
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    async calculateNILValuation(playerId) {
        // Mock NIL calculation
        const baseValue = 100000 + Math.random() * 500000;
        return {
            total: Math.round(baseValue),
            market: Math.round(baseValue * 0.4),
            social: Math.round(baseValue * 0.3),
            performance: Math.round(baseValue * 0.2),
            potential: Math.round(baseValue * 0.1),
            confidence: 0.85 + Math.random() * 0.1,
            dataPoints: 1250 + Math.floor(Math.random() * 500)
        };
    }

    async getTeamNILSummary(teamId) {
        return {
            total: 15000000 + Math.random() * 10000000,
            average: 180000 + Math.random() * 100000,
            topPlayers: [
                { name: 'Player A', value: 800000 },
                { name: 'Player B', value: 650000 },
                { name: 'Player C', value: 500000 }
            ],
            growth: 0.15 + Math.random() * 0.2,
            rank: Math.floor(Math.random() * 10) + 1
        };
    }

    async calculateChampionshipProbability(teamId) {
        const baseProbability = 0.05 + Math.random() * 0.30;
        return {
            overall: Math.round(baseProbability * 100) / 100,
            confidence: 0.8 + Math.random() * 0.15,
            roster: 0.8 + Math.random() * 0.2,
            coaching: 0.7 + Math.random() * 0.3,
            schedule: 0.6 + Math.random() * 0.4,
            momentum: 0.5 + Math.random() * 0.5,
            health: 0.85 + Math.random() * 0.15,
            comparison: [
                { team: 'Team A', probability: 0.25 },
                { team: 'Team B', probability: 0.18 },
                { team: 'Team C', probability: 0.15 }
            ]
        };
    }

    async getConferenceChampionshipOdds(conferenceId) {
        return {
            teams: [
                { name: 'Texas', odds: 0.28, trend: 'up' },
                { name: 'Alabama', odds: 0.22, trend: 'stable' },
                { name: 'Georgia', odds: 0.20, trend: 'down' },
                { name: 'LSU', odds: 0.15, trend: 'up' },
                { name: 'Tennessee', odds: 0.10, trend: 'stable' },
                { name: 'Others', odds: 0.05, trend: 'mixed' }
            ]
        };
    }

    async performCharacterAssessment(playerId, videoData, biometricData) {
        return {
            leadership: 0.75 + Math.random() * 0.2,
            resilience: 0.80 + Math.random() * 0.15,
            teamwork: 0.85 + Math.random() * 0.1,
            discipline: 0.70 + Math.random() * 0.25,
            competitiveness: 0.90 + Math.random() * 0.08,
            overall: 0.80 + Math.random() * 0.15,
            confidence: 0.82 + Math.random() * 0.13
        };
    }

    async getLiveAnalytics() {
        return {
            consciousness: {
                level: 87.6 + (Math.random() - 0.5) * 8,
                status: 'Adaptive Intelligence Active',
                neurons: 25 + Math.floor(Math.random() * 10),
                processing: 94.2 + Math.random() * 4
            },
            sports: {
                cardinals: { readiness: 86.6 + Math.random() * 6 },
                titans: { power: 78 + Math.floor(Math.random() * 8) },
                longhorns: { rank: 3 },
                grizzlies: { rating: 114.7 + Math.random() * 8 }
            },
            performance: {
                dataPoints: 2800000 + Math.floor(Math.random() * 100000),
                accuracy: 94.6 + Math.random() * 3,
                updateFrequency: 3000
            }
        };
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Live Intelligence API server running on port ${this.port}`);
            console.log(`🔐 JWT authentication enabled`);
            console.log(`📊 Analytics endpoints active`);
            console.log(`💰 NIL valuation services ready`);
            console.log(`🏆 Championship probability calculations online`);
        });
    }
}

// Export for use in other modules
export default LiveIntelligenceAPI;

// CLI interface for standalone server
if (import.meta.url === `file://${process.argv[1]}`) {
    const api = new LiveIntelligenceAPI();
    api.start();
}