/**
 * Blaze Intelligence Monte Carlo Scenarios API
 * Real-time sports scenario simulation endpoints
 *
 * Handles advanced "what-if" scenarios for:
 * - Team performance modeling
 * - Playoff probability calculations
 * - NIL valuation scenarios
 * - Youth development projections
 * - Injury impact analysis
 * - Trade/transfer effects
 *
 * @version 2.0.0
 * @author Blaze Intelligence - The Deep South's Sports Intelligence Hub
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Express app if not already done
const app = express.app || express();

// CORS configuration for Blaze Intelligence domains
const corsOptions = {
    origin: [
        'https://blazesportsintel.com',
        'https://www.blazesportsintel.com',
        'http://localhost:8000',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
};

app.use(cors(corsOptions));

// Rate limiting for API protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many simulation requests, please try again later',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/monte-carlo', limiter);

// Middleware for JSON parsing and logging
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Deep South Teams Data - Cardinals, Titans, Longhorns, Grizzlies
 */
const DEEP_SOUTH_TEAMS = {
    cardinals: {
        id: 'STL',
        name: 'St. Louis Cardinals',
        league: 'MLB',
        division: 'NL Central',
        city: 'St. Louis',
        state: 'Missouri',
        keyPlayers: ['Paul Goldschmidt', 'Nolan Arenado', 'Jordan Walker'],
        baseMetrics: {
            winProbability: 0.525,
            playoffOdds: 54.9,
            championshipOdds: 5.8,
            strengthOfSchedule: 0.512,
            injuryRisk: 0.15
        },
        seasonStructure: {
            totalGames: 162,
            playoffFormat: 'wildcard',
            divisionRivals: ['CHC', 'MIL', 'CIN', 'PIT']
        }
    },
    titans: {
        id: 'TEN',
        name: 'Tennessee Titans',
        league: 'NFL',
        division: 'AFC South',
        city: 'Nashville',
        state: 'Tennessee',
        keyPlayers: ['Derrick Henry', 'Ryan Tannehill', 'Jeffery Simmons'],
        baseMetrics: {
            winProbability: 0.412,
            playoffOdds: 12.3,
            championshipOdds: 0.8,
            strengthOfSchedule: 0.487,
            injuryRisk: 0.22
        },
        seasonStructure: {
            totalGames: 17,
            playoffFormat: 'wildcard',
            divisionRivals: ['IND', 'JAX', 'HOU']
        }
    },
    longhorns: {
        id: 'TEX',
        name: 'Texas Longhorns',
        league: 'NCAA',
        division: 'SEC',
        city: 'Austin',
        state: 'Texas',
        keyPlayers: ['Quinn Ewers', 'Bijan Robinson', 'Xavier Worthy'],
        baseMetrics: {
            winProbability: 0.867,
            playoffOdds: 89.7,
            championshipOdds: 23.4,
            strengthOfSchedule: 0.623,
            injuryRisk: 0.18
        },
        seasonStructure: {
            totalGames: 12,
            playoffFormat: 'cfp',
            divisionRivals: ['OU', 'A&M', 'ARK', 'LSU']
        }
    },
    grizzlies: {
        id: 'MEM',
        name: 'Memphis Grizzlies',
        league: 'NBA',
        division: 'Western Conference',
        city: 'Memphis',
        state: 'Tennessee',
        keyPlayers: ['Ja Morant', 'Jaren Jackson Jr.', 'Desmond Bane'],
        baseMetrics: {
            winProbability: 0.329,
            playoffOdds: 31.2,
            championshipOdds: 3.7,
            strengthOfSchedule: 0.534,
            injuryRisk: 0.28
        },
        seasonStructure: {
            totalGames: 82,
            playoffFormat: 'playoffs',
            divisionRivals: ['LAL', 'LAC', 'GSW', 'SAC']
        }
    }
};

/**
 * Monte Carlo simulation engine initialization
 */
class MonteCarloSimulator {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Run team performance scenario
     */
    async runTeamPerformanceScenario(teamId, parameters) {
        const team = DEEP_SOUTH_TEAMS[teamId];
        if (!team) {
            throw new Error(`Team ${teamId} not found`);
        }

        const {
            playerPerformance = 0,
            teamChemistry = 1.0,
            remainingGames = null,
            sosAdjustment = 0,
            injuryRisk = null
        } = parameters;

        const actualRemainingGames = remainingGames || this.calculateRemainingGames(team);
        const actualInjuryRisk = injuryRisk || team.baseMetrics.injuryRisk;

        const iterations = 10000;
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const result = this.simulateTeamPerformanceIteration({
                team,
                playerPerformance,
                teamChemistry,
                remainingGames: actualRemainingGames,
                sosAdjustment,
                injuryRisk: actualInjuryRisk
            });
            results.push(result);
        }

        return this.analyzeResults(results, {
            scenario: 'team-performance',
            team: teamId,
            parameters
        });
    }

    /**
     * Run playoff probability scenario
     */
    async runPlayoffProbabilityScenario(teamId, parameters) {
        const team = DEEP_SOUTH_TEAMS[teamId];
        if (!team) {
            throw new Error(`Team ${teamId} not found`);
        }

        const {
            winStreak = 0,
            rivalPerformance = 0,
            h2hRecord = 0.5,
            strengthOfSchedule = null
        } = parameters;

        const actualSOS = strengthOfSchedule || team.baseMetrics.strengthOfSchedule;

        const iterations = 10000;
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const result = this.simulatePlayoffProbabilityIteration({
                team,
                winStreak,
                rivalPerformance,
                h2hRecord,
                strengthOfSchedule: actualSOS
            });
            results.push(result);
        }

        return this.analyzeResults(results, {
            scenario: 'playoff-probability',
            team: teamId,
            parameters
        });
    }

    /**
     * Run NIL valuation scenario
     */
    async runNILValuationScenario(parameters) {
        const {
            sport = 'football',
            position = 'QB',
            performanceImprovement = 0,
            socialMediaFollowers = 50000,
            socialMediaGrowth = 0,
            marketSize = 'medium',
            championshipFactor = 1.0,
            classYear = 'junior',
            academicStanding = 'good'
        } = parameters;

        const iterations = 10000;
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const result = this.simulateNILValuationIteration({
                sport,
                position,
                performanceImprovement,
                socialMediaFollowers,
                socialMediaGrowth,
                marketSize,
                championshipFactor,
                classYear,
                academicStanding
            });
            results.push(result);
        }

        return this.analyzeResults(results, {
            scenario: 'nil-valuation',
            parameters
        });
    }

    /**
     * Run youth development scenario (Perfect Game/Texas HS Football)
     */
    async runYouthDevelopmentScenario(parameters) {
        const {
            sport = 'football',
            currentAge = 16,
            skillLevel = 7,
            characterScore = 8,
            academicGPA = 3.5,
            familySupport = 'strong',
            coachingQuality = 'good',
            region = 'texas',
            competitionLevel = '5A'
        } = parameters;

        const iterations = 10000;
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const result = this.simulateYouthDevelopmentIteration({
                sport,
                currentAge,
                skillLevel,
                characterScore,
                academicGPA,
                familySupport,
                coachingQuality,
                region,
                competitionLevel
            });
            results.push(result);
        }

        return this.analyzeResults(results, {
            scenario: 'youth-development',
            parameters
        });
    }

    /**
     * Run injury impact scenario
     */
    async runInjuryImpactScenario(teamId, parameters) {
        const team = DEEP_SOUTH_TEAMS[teamId];
        if (!team) {
            throw new Error(`Team ${teamId} not found`);
        }

        const {
            playerName = 'Key Player',
            injurySeverity = 'moderate',
            gamesAffected = 10,
            replacementQuality = 0.7,
            teamDepth = 'average'
        } = parameters;

        const iterations = 10000;
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const result = this.simulateInjuryImpactIteration({
                team,
                playerName,
                injurySeverity,
                gamesAffected,
                replacementQuality,
                teamDepth
            });
            results.push(result);
        }

        return this.analyzeResults(results, {
            scenario: 'injury-impact',
            team: teamId,
            parameters
        });
    }

    /**
     * Run trade/transfer effects scenario
     */
    async runTradeEffectsScenario(teamId, parameters) {
        const team = DEEP_SOUTH_TEAMS[teamId];
        if (!team) {
            throw new Error(`Team ${teamId} not found`);
        }

        const {
            tradeType = 'acquisition',
            playerValue = 75,
            positionNeed = 'high',
            chemistryFit = 'good',
            costImpact = 'moderate'
        } = parameters;

        const iterations = 10000;
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const result = this.simulateTradeEffectsIteration({
                team,
                tradeType,
                playerValue,
                positionNeed,
                chemistryFit,
                costImpact
            });
            results.push(result);
        }

        return this.analyzeResults(results, {
            scenario: 'trade-effects',
            team: teamId,
            parameters
        });
    }

    /**
     * Simulate single team performance iteration
     */
    simulateTeamPerformanceIteration(params) {
        const { team, playerPerformance, teamChemistry, remainingGames, sosAdjustment, injuryRisk } = params;

        // Base win probability
        let winProb = team.baseMetrics.winProbability;

        // Apply player performance impact
        const performanceMultiplier = 1 + (playerPerformance / 100);
        winProb *= performanceMultiplier;

        // Apply team chemistry
        winProb *= teamChemistry;

        // Strength of schedule adjustment
        const sosMultiplier = 1 - (sosAdjustment / 100);
        winProb *= sosMultiplier;

        // Injury impact
        const injuryOccurs = Math.random() < injuryRisk;
        if (injuryOccurs) {
            winProb *= (0.7 + Math.random() * 0.2); // 70-90% performance
        }

        // Add randomness
        winProb *= (0.8 + Math.random() * 0.4); // ±20% variance

        // Clamp to realistic bounds
        winProb = Math.max(0.1, Math.min(0.9, winProb));

        // Simulate remaining games
        let wins = 0;
        for (let game = 0; game < remainingGames; game++) {
            if (Math.random() < winProb) {
                wins++;
            }
        }

        const winPercentage = wins / remainingGames;
        const playoffProbability = this.calculatePlayoffProbability(winPercentage, team);
        const championshipProbability = this.calculateChampionshipProbability(playoffProbability, team);

        return {
            wins,
            winPercentage,
            playoffProbability,
            championshipProbability,
            injuryOccurred: injuryOccurs,
            finalWinProb: winProb
        };
    }

    /**
     * Simulate single playoff probability iteration
     */
    simulatePlayoffProbabilityIteration(params) {
        const { team, winStreak, rivalPerformance, h2hRecord, strengthOfSchedule } = params;

        let playoffProb = team.baseMetrics.playoffOdds / 100;

        // Win streak momentum
        const streakBonus = Math.min(0.3, winStreak * 0.025);
        playoffProb += streakBonus;

        // Rival performance impact (inverse relationship)
        const rivalImpact = rivalPerformance / 100;
        playoffProb *= (1 - rivalImpact * 0.5);

        // Head-to-head record impact
        const h2hBonus = (h2hRecord - 0.5) * 0.2;
        playoffProb += h2hBonus;

        // Strength of schedule
        playoffProb *= (1.1 - strengthOfSchedule);

        // Add randomness
        playoffProb *= (0.7 + Math.random() * 0.6);

        // Clamp to bounds
        playoffProb = Math.max(0.01, Math.min(0.99, playoffProb));

        const championshipProb = this.calculateChampionshipProbability(playoffProb, team);

        return {
            playoffProbability: playoffProb * 100,
            championshipProbability: championshipProb * 100,
            streakBonus: streakBonus * 100,
            rivalImpact: rivalImpact * 100
        };
    }

    /**
     * Simulate single NIL valuation iteration
     */
    simulateNILValuationIteration(params) {
        const {
            sport,
            position,
            performanceImprovement,
            socialMediaFollowers,
            socialMediaGrowth,
            marketSize,
            championshipFactor,
            classYear,
            academicStanding
        } = params;

        // Base NIL values by sport and position
        const baseValues = {
            football: {
                QB: 500000, RB: 300000, WR: 280000, TE: 180000,
                OL: 150000, DE: 200000, LB: 180000, DB: 160000
            },
            basketball: {
                PG: 400000, SG: 350000, SF: 320000, PF: 300000, C: 280000
            },
            baseball: {
                P: 200000, C: 150000, IF: 120000, OF: 110000
            }
        };

        let baseValue = baseValues[sport]?.[position] || 150000;

        // Performance improvement multiplier
        const performanceMultiplier = 1 + (performanceImprovement / 100);
        baseValue *= performanceMultiplier;

        // Social media impact
        const socialBase = Math.log10(socialMediaFollowers + 1) / 6; // Normalize followers
        const socialGrowthMultiplier = 1 + (socialMediaGrowth / 100);
        const socialMultiplier = socialBase * socialGrowthMultiplier;
        baseValue *= (0.7 + socialMultiplier * 0.5);

        // Market size multipliers
        const marketMultipliers = {
            small: 0.6 + Math.random() * 0.2,
            medium: 0.9 + Math.random() * 0.2,
            large: 1.3 + Math.random() * 0.3,
            mega: 1.8 + Math.random() * 0.5
        };
        baseValue *= marketMultipliers[marketSize] || 1.0;

        // Championship performance bonus
        baseValue *= Math.pow(championshipFactor, 0.5);

        // Class year impact (eligibility remaining)
        const classMultipliers = { freshman: 1.2, sophomore: 1.1, junior: 1.0, senior: 0.8 };
        baseValue *= classMultipliers[classYear] || 1.0;

        // Academic standing impact
        const academicMultipliers = { poor: 0.8, average: 0.95, good: 1.0, excellent: 1.1 };
        baseValue *= academicMultipliers[academicStanding] || 1.0;

        // Market volatility
        baseValue *= (0.7 + Math.random() * 0.6);

        // Risk factors
        const brandRisk = Math.random();
        if (brandRisk > 0.95) baseValue *= 0.3; // Major scandal risk
        else if (brandRisk > 0.85) baseValue *= 0.6; // Minor controversy

        return {
            nilValue: Math.max(5000, Math.min(3000000, baseValue)),
            performanceMultiplier,
            socialMultiplier,
            marketMultiplier: marketMultipliers[marketSize] || 1.0,
            brandRisk
        };
    }

    /**
     * Simulate single youth development iteration
     */
    simulateYouthDevelopmentIteration(params) {
        const {
            sport,
            currentAge,
            skillLevel,
            characterScore,
            academicGPA,
            familySupport,
            coachingQuality,
            region,
            competitionLevel
        } = params;

        // Skill development trajectory
        const ageMultiplier = currentAge < 16 ? 1.2 : currentAge > 18 ? 0.8 : 1.0;
        const skillGrowth = (skillLevel / 10) * ageMultiplier * (0.8 + Math.random() * 0.4);

        // Character development impact
        const characterMultiplier = (characterScore / 10);

        // Academic impact
        const academicMultiplier = Math.max(0.5, (academicGPA - 2.0) / 2.0);

        // Family support impact
        const familyMultipliers = { weak: 0.7, moderate: 0.9, strong: 1.1, exceptional: 1.3 };
        const familyMultiplier = familyMultipliers[familySupport] || 1.0;

        // Coaching quality impact
        const coachingMultipliers = { poor: 0.6, average: 0.8, good: 1.0, excellent: 1.2 };
        const coachingMultiplier = coachingMultipliers[coachingQuality] || 1.0;

        // Regional competition strength
        const regionMultipliers = { texas: 1.2, california: 1.1, florida: 1.1, other: 0.9 };
        const regionMultiplier = regionMultipliers[region] || 0.9;

        // Competition level strength
        const competitionMultipliers = { '6A': 1.3, '5A': 1.1, '4A': 1.0, '3A': 0.9, '2A': 0.8, '1A': 0.7 };
        const competitionMultiplier = competitionMultipliers[competitionLevel] || 1.0;

        // Calculate overall development score
        const developmentScore = skillGrowth *
                                characterMultiplier *
                                academicMultiplier *
                                familyMultiplier *
                                coachingMultiplier *
                                regionMultiplier *
                                competitionMultiplier;

        // College recruitment probability
        let recruitmentTier = 'none';
        if (developmentScore > 1.8) recruitmentTier = 'd1-elite';
        else if (developmentScore > 1.4) recruitmentTier = 'd1-major';
        else if (developmentScore > 1.1) recruitmentTier = 'd1-mid';
        else if (developmentScore > 0.8) recruitmentTier = 'd2';
        else if (developmentScore > 0.6) recruitmentTier = 'juco';

        // Professional potential
        const proPotential = Math.min(0.5, developmentScore * 0.1);

        return {
            developmentScore,
            recruitmentTier,
            proPotential,
            skillGrowth,
            characterMultiplier,
            academicMultiplier,
            familyMultiplier,
            coachingMultiplier
        };
    }

    /**
     * Simulate single injury impact iteration
     */
    simulateInjuryImpactIteration(params) {
        const { team, injurySeverity, gamesAffected, replacementQuality, teamDepth } = params;

        // Injury severity impact
        const severityMultipliers = { minor: 0.95, moderate: 0.85, major: 0.65, season_ending: 0.4 };
        const severityMultiplier = severityMultipliers[injurySeverity] || 0.85;

        // Replacement quality impact
        const replacementImpact = replacementQuality;

        // Team depth impact
        const depthMultipliers = { poor: 0.6, average: 0.8, good: 0.9, excellent: 0.95 };
        const depthMultiplier = depthMultipliers[teamDepth] || 0.8;

        // Calculate win probability impact
        const baseWinProb = team.baseMetrics.winProbability;
        const injuredWinProb = baseWinProb * severityMultiplier * replacementImpact * depthMultiplier;

        // Simulate affected games
        let winsWithInjury = 0;
        let winsWithoutInjury = 0;

        for (let game = 0; game < gamesAffected; game++) {
            if (Math.random() < injuredWinProb) winsWithInjury++;
            if (Math.random() < baseWinProb) winsWithoutInjury++;
        }

        const impactOnWins = winsWithoutInjury - winsWithInjury;
        const playoffImpact = impactOnWins * (100 / team.seasonStructure.totalGames);

        return {
            winsWithInjury,
            winsWithoutInjury,
            impactOnWins,
            playoffImpact,
            severityMultiplier,
            replacementImpact,
            depthMultiplier
        };
    }

    /**
     * Simulate single trade effects iteration
     */
    simulateTradeEffectsIteration(params) {
        const { team, tradeType, playerValue, positionNeed, chemistryFit, costImpact } = params;

        let impactMultiplier = 1.0;

        // Trade type impact
        if (tradeType === 'acquisition') {
            impactMultiplier += (playerValue - 50) / 100; // Normalize around 50
        } else {
            impactMultiplier -= (playerValue - 50) / 100;
        }

        // Position need impact
        const needMultipliers = { low: 0.5, moderate: 0.75, high: 1.0, critical: 1.25 };
        const needMultiplier = needMultipliers[positionNeed] || 1.0;

        // Chemistry fit impact
        const chemistryMultipliers = { poor: 0.7, average: 0.9, good: 1.0, excellent: 1.15 };
        const chemistryMultiplier = chemistryMultipliers[chemistryFit] || 1.0;

        // Cost impact (salary cap, roster flexibility)
        const costMultipliers = { low: 1.1, moderate: 1.0, high: 0.9, prohibitive: 0.7 };
        const costMultiplier = costMultipliers[costImpact] || 1.0;

        // Calculate overall trade impact
        const tradeImpact = impactMultiplier * needMultiplier * chemistryMultiplier * costMultiplier;

        // Apply to team metrics
        const newWinProb = team.baseMetrics.winProbability * (1 + (tradeImpact - 1) * 0.5);
        const newPlayoffProb = team.baseMetrics.playoffOdds * (1 + (tradeImpact - 1) * 0.3);

        return {
            tradeImpact,
            newWinProbability: Math.max(0.1, Math.min(0.9, newWinProb)),
            newPlayoffProbability: Math.max(1, Math.min(99, newPlayoffProb)),
            impactMultiplier,
            needMultiplier,
            chemistryMultiplier,
            costMultiplier
        };
    }

    /**
     * Calculate playoff probability based on win percentage
     */
    calculatePlayoffProbability(winPercentage, team) {
        const league = team.league.toLowerCase();

        // League-specific playoff probability curves
        const curves = {
            mlb: { threshold: 0.54, steepness: 8 },
            nfl: { threshold: 0.56, steepness: 12 },
            nba: { threshold: 0.49, steepness: 6 },
            ncaa: { threshold: 0.67, steepness: 15 }
        };

        const curve = curves[league] || curves.mlb;

        // Sigmoid curve for playoff probability
        const x = (winPercentage - curve.threshold) * curve.steepness;
        const playoffProb = 1 / (1 + Math.exp(-x));

        return Math.max(0.01, Math.min(0.99, playoffProb)) * 100;
    }

    /**
     * Calculate championship probability based on playoff probability
     */
    calculateChampionshipProbability(playoffProb, team) {
        if (playoffProb < 10) return 0;

        const league = team.league.toLowerCase();

        // Championship multipliers by league
        const multipliers = {
            mlb: 0.08,   // Best-of-7 series
            nfl: 0.15,   // Single elimination
            nba: 0.06,   // Best-of-7, star-dependent
            ncaa: 0.04   // Tournament randomness
        };

        const multiplier = multipliers[league] || 0.08;
        const champProb = (playoffProb / 100) * multiplier * 100;

        return Math.max(0, Math.min(40, champProb));
    }

    /**
     * Calculate remaining games for a team
     */
    calculateRemainingGames(team) {
        const now = new Date();
        const month = now.getMonth();

        // Rough estimates based on time of year
        switch (team.league) {
            case 'MLB':
                if (month < 3) return team.seasonStructure.totalGames;
                if (month < 6) return Math.floor(team.seasonStructure.totalGames * 0.7);
                if (month < 8) return Math.floor(team.seasonStructure.totalGames * 0.3);
                return Math.floor(team.seasonStructure.totalGames * 0.1);

            case 'NFL':
                if (month < 8) return team.seasonStructure.totalGames;
                if (month < 11) return Math.floor(team.seasonStructure.totalGames * 0.6);
                return Math.floor(team.seasonStructure.totalGames * 0.2);

            case 'NBA':
                if (month < 4 || month > 9) return Math.floor(team.seasonStructure.totalGames * 0.8);
                return 0;

            case 'NCAA':
                if (month < 8) return 0;
                if (month < 11) return Math.floor(team.seasonStructure.totalGames * 0.7);
                return Math.floor(team.seasonStructure.totalGames * 0.2);

            default:
                return 20;
        }
    }

    /**
     * Analyze simulation results
     */
    analyzeResults(results, metadata) {
        if (!results || results.length === 0) {
            throw new Error('No results to analyze');
        }

        const analysis = {
            metadata,
            iterations: results.length,
            timestamp: new Date().toISOString(),
            statistics: {}
        };

        // Calculate statistics for each numeric property
        const firstResult = results[0];
        Object.keys(firstResult).forEach(key => {
            if (typeof firstResult[key] === 'number') {
                const values = results.map(r => r[key]).filter(v => !isNaN(v));
                if (values.length > 0) {
                    analysis.statistics[key] = this.calculateStatistics(values);
                }
            }
        });

        return analysis;
    }

    /**
     * Calculate comprehensive statistics
     */
    calculateStatistics(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;

        const mean = sorted.reduce((a, b) => a + b, 0) / n;
        const median = n % 2 === 0 ?
            (sorted[n/2 - 1] + sorted[n/2]) / 2 :
            sorted[Math.floor(n/2)];

        const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
        const stdDev = Math.sqrt(variance);

        return {
            mean: parseFloat(mean.toFixed(4)),
            median: parseFloat(median.toFixed(4)),
            stdDev: parseFloat(stdDev.toFixed(4)),
            min: sorted[0],
            max: sorted[n - 1],
            percentiles: {
                p5: sorted[Math.floor(0.05 * n)],
                p10: sorted[Math.floor(0.10 * n)],
                p25: sorted[Math.floor(0.25 * n)],
                p75: sorted[Math.floor(0.75 * n)],
                p90: sorted[Math.floor(0.90 * n)],
                p95: sorted[Math.floor(0.95 * n)]
            },
            confidenceInterval: {
                lower: sorted[Math.floor(0.025 * n)],
                upper: sorted[Math.floor(0.975 * n)],
                level: 0.95
            }
        };
    }
}

// Initialize simulator
const simulator = new MonteCarloSimulator();

/**
 * API Routes
 */

// Team Performance Scenario
app.post('/api/monte-carlo/team-performance/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const parameters = req.body;

        console.log(`Running team performance scenario for ${teamId}:`, parameters);

        const results = await simulator.runTeamPerformanceScenario(teamId, parameters);

        res.json({
            success: true,
            scenario: 'team-performance',
            team: teamId,
            results,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Team performance scenario error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            scenario: 'team-performance'
        });
    }
});

// Playoff Probability Scenario
app.post('/api/monte-carlo/playoff-probability/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const parameters = req.body;

        console.log(`Running playoff probability scenario for ${teamId}:`, parameters);

        const results = await simulator.runPlayoffProbabilityScenario(teamId, parameters);

        res.json({
            success: true,
            scenario: 'playoff-probability',
            team: teamId,
            results,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Playoff probability scenario error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            scenario: 'playoff-probability'
        });
    }
});

// NIL Valuation Scenario
app.post('/api/monte-carlo/nil-valuation', async (req, res) => {
    try {
        const parameters = req.body;

        console.log('Running NIL valuation scenario:', parameters);

        const results = await simulator.runNILValuationScenario(parameters);

        res.json({
            success: true,
            scenario: 'nil-valuation',
            results,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('NIL valuation scenario error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            scenario: 'nil-valuation'
        });
    }
});

// Youth Development Scenario (Perfect Game / Texas HS Football)
app.post('/api/monte-carlo/youth-development', async (req, res) => {
    try {
        const parameters = req.body;

        console.log('Running youth development scenario:', parameters);

        const results = await simulator.runYouthDevelopmentScenario(parameters);

        res.json({
            success: true,
            scenario: 'youth-development',
            results,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Youth development scenario error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            scenario: 'youth-development'
        });
    }
});

// Injury Impact Scenario
app.post('/api/monte-carlo/injury-impact/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const parameters = req.body;

        console.log(`Running injury impact scenario for ${teamId}:`, parameters);

        const results = await simulator.runInjuryImpactScenario(teamId, parameters);

        res.json({
            success: true,
            scenario: 'injury-impact',
            team: teamId,
            results,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Injury impact scenario error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            scenario: 'injury-impact'
        });
    }
});

// Trade/Transfer Effects Scenario
app.post('/api/monte-carlo/trade-effects/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const parameters = req.body;

        console.log(`Running trade effects scenario for ${teamId}:`, parameters);

        const results = await simulator.runTradeEffectsScenario(teamId, parameters);

        res.json({
            success: true,
            scenario: 'trade-effects',
            team: teamId,
            results,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Trade effects scenario error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            scenario: 'trade-effects'
        });
    }
});

// Get Available Teams
app.get('/api/monte-carlo/teams', (req, res) => {
    res.json({
        success: true,
        teams: Object.entries(DEEP_SOUTH_TEAMS).map(([id, team]) => ({
            id,
            name: team.name,
            league: team.league,
            division: team.division,
            city: team.city,
            state: team.state,
            baseMetrics: team.baseMetrics
        })),
        description: "The Deep South's Sports Intelligence Hub - From Friday Night Lights to Sunday in the Show"
    });
});

// Health Check
app.get('/api/monte-carlo/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        features: [
            'Team Performance Scenarios',
            'Playoff Probability Modeling',
            'NIL Valuation Simulations',
            'Youth Development Projections',
            'Injury Impact Analysis',
            'Trade/Transfer Effects'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

module.exports = app;