/**
 * Blaze Intelligence Monte Carlo Simulation Engine
 * Advanced sports analytics with 10,000+ simulation capability
 * Supports multiple scenario types and real-time probability updates
 *
 * @version 2.0.0
 * @author Blaze Intelligence - The Deep South's Sports Intelligence Hub
 */

class BlazeMonteCarloEngine {
    constructor(options = {}) {
        this.options = {
            iterations: options.iterations || 10000,
            confidenceLevel: options.confidenceLevel || 0.95,
            randomSeed: options.randomSeed || Math.random(),
            enableCaching: options.enableCaching !== false,
            enableParallelProcessing: options.enableParallelProcessing !== false,
            ...options
        };

        this.cache = new Map();
        this.workers = [];
        this.initialized = false;

        this.initialize();
    }

    /**
     * Initialize the Monte Carlo engine
     */
    initialize() {
        // Set up random number generator with seed
        this.rng = this.createSeededRNG(this.options.randomSeed);

        // Initialize worker pool for parallel processing
        if (this.options.enableParallelProcessing && typeof Worker !== 'undefined') {
            this.initializeWorkerPool();
        }

        this.initialized = true;
        console.log('Blaze Monte Carlo Engine initialized with', this.options.iterations, 'iterations');
    }

    /**
     * Create seeded random number generator for reproducible results
     */
    createSeededRNG(seed) {
        let state = seed;
        return {
            random: function() {
                state = (state * 9301 + 49297) % 233280;
                return state / 233280;
            },
            gaussian: function(mean = 0, stdDev = 1) {
                let u = 0, v = 0;
                while(u === 0) u = this.random(); // Converting [0,1) to (0,1)
                while(v === 0) v = this.random();
                const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
                return z * stdDev + mean;
            },
            beta: function(alpha, beta) {
                const gamma1 = this.gamma(alpha);
                const gamma2 = this.gamma(beta);
                return gamma1 / (gamma1 + gamma2);
            },
            gamma: function(shape, scale = 1) {
                // Marsaglia and Tsang's method
                if (shape < 1) {
                    return this.gamma(shape + 1, scale) * Math.pow(this.random(), 1 / shape);
                }

                const d = shape - 1/3;
                const c = 1 / Math.sqrt(9 * d);

                while (true) {
                    let x, v;
                    do {
                        x = this.gaussian();
                        v = 1 + c * x;
                    } while (v <= 0);

                    v = v * v * v;
                    const u = this.random();

                    if (u < 1 - 0.0331 * x * x * x * x) {
                        return d * v * scale;
                    }

                    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
                        return d * v * scale;
                    }
                }
            }
        };
    }

    /**
     * Initialize worker pool for parallel processing
     */
    initializeWorkerPool() {
        const workerCount = Math.min(navigator.hardwareConcurrency || 4, 8);

        for (let i = 0; i < workerCount; i++) {
            try {
                const worker = new Worker(this.createWorkerScript());
                this.workers.push(worker);
            } catch (e) {
                console.warn('Failed to create worker:', e);
                this.options.enableParallelProcessing = false;
                break;
            }
        }
    }

    /**
     * Create worker script for parallel processing
     */
    createWorkerScript() {
        const workerScript = `
            self.onmessage = function(e) {
                const { iterations, scenario, parameters, startIndex } = e.data;
                const results = [];

                // Run simulation iterations
                for (let i = 0; i < iterations; i++) {
                    const result = runSingleIteration(scenario, parameters, startIndex + i);
                    results.push(result);
                }

                self.postMessage({ results });
            };

            function runSingleIteration(scenario, parameters, seed) {
                // Simplified simulation logic for worker
                const random = createSimpleRNG(seed);

                let baseValue = 50;
                let variance = 10;

                switch (scenario) {
                    case 'team-performance':
                        baseValue += parameters.playerPerformance || 0;
                        baseValue *= parameters.teamChemistry || 1;
                        break;
                    case 'playoff-probability':
                        baseValue += (parameters.winStreak || 0) * 2;
                        break;
                    case 'nil-valuation':
                        baseValue *= (1 + (parameters.performance || 0) / 100);
                        break;
                }

                return Math.max(0, Math.min(100, random.gaussian(baseValue, variance)));
            }

            function createSimpleRNG(seed) {
                let state = seed || Math.random();
                return {
                    random: function() {
                        state = (state * 9301 + 49297) % 233280;
                        return state / 233280;
                    },
                    gaussian: function(mean = 0, stdDev = 1) {
                        let u = 0, v = 0;
                        while(u === 0) u = this.random();
                        while(v === 0) v = this.random();
                        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
                        return z * stdDev + mean;
                    }
                };
            }
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    }

    /**
     * Run team performance scenario simulation
     */
    async runTeamPerformanceScenario(parameters) {
        const cacheKey = `team-performance-${JSON.stringify(parameters)}`;

        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const results = [];
        const iterations = this.options.iterations;

        for (let i = 0; i < iterations; i++) {
            const iteration = this.simulateTeamPerformanceIteration(parameters);
            results.push(iteration);
        }

        const analysis = this.analyzeResults(results);

        if (this.options.enableCaching) {
            this.cache.set(cacheKey, analysis);
        }

        return analysis;
    }

    /**
     * Simulate single team performance iteration
     */
    simulateTeamPerformanceIteration(parameters) {
        const {
            playerPerformance = 0,
            teamChemistry = 1.0,
            remainingGames = 20,
            sosAdjustment = 0,
            baseWinProbability = 0.55
        } = parameters;

        // Performance impact modeling
        const performanceMultiplier = 1 + (playerPerformance / 100);
        const chemistryFactor = teamChemistry;
        const scheduleStrengthFactor = 1 - (sosAdjustment / 100);

        // Injury probability modeling
        const injuryRisk = this.rng.beta(2, 10); // Higher chance of minor issues
        const injuryImpact = injuryRisk > 0.15 ? 0.85 : 1.0; // 15% chance of significant injury

        // Momentum and hot/cold streak modeling
        const momentumFactor = this.rng.gaussian(1.0, 0.1);

        // Weather and external factors
        const externalFactor = this.rng.gaussian(1.0, 0.05);

        // Calculate adjusted win probability
        let adjustedWinProb = baseWinProbability *
                              performanceMultiplier *
                              chemistryFactor *
                              scheduleStrengthFactor *
                              injuryImpact *
                              momentumFactor *
                              externalFactor;

        // Clamp to realistic bounds
        adjustedWinProb = Math.max(0.1, Math.min(0.9, adjustedWinProb));

        // Simulate remaining games
        let wins = 0;
        for (let game = 0; game < remainingGames; game++) {
            const gameResult = this.rng.random() < adjustedWinProb ? 1 : 0;
            wins += gameResult;

            // Momentum carry-over effect
            if (gameResult) {
                adjustedWinProb = Math.min(0.9, adjustedWinProb * 1.02);
            } else {
                adjustedWinProb = Math.max(0.1, adjustedWinProb * 0.98);
            }
        }

        // Calculate derived metrics
        const winPercentage = wins / remainingGames;
        const playoffProbability = this.calculatePlayoffProbability(winPercentage, parameters);
        const championshipProbability = this.calculateChampionshipProbability(playoffProbability, parameters);

        return {
            wins,
            winPercentage,
            playoffProbability,
            championshipProbability,
            injuryImpact,
            momentumFactor,
            adjustedWinProb
        };
    }

    /**
     * Run playoff probability scenario simulation
     */
    async runPlayoffProbabilityScenario(parameters) {
        const cacheKey = `playoff-probability-${JSON.stringify(parameters)}`;

        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const results = [];
        const iterations = this.options.iterations;

        for (let i = 0; i < iterations; i++) {
            const iteration = this.simulatePlayoffProbabilityIteration(parameters);
            results.push(iteration);
        }

        const analysis = this.analyzeResults(results);

        if (this.options.enableCaching) {
            this.cache.set(cacheKey, analysis);
        }

        return analysis;
    }

    /**
     * Simulate single playoff probability iteration
     */
    simulatePlayoffProbabilityIteration(parameters) {
        const {
            winStreak = 0,
            rivalPerformance = 0,
            h2hImpact = 50,
            currentStanding = 'wildcard',
            divisionRace = 'tight'
        } = parameters;

        // Win streak momentum
        const streakMomentum = Math.min(1.5, 1 + (winStreak * 0.05));

        // Division rival impact
        const rivalFactor = 1 + (rivalPerformance / 100);

        // Head-to-head tiebreaker value
        const h2hValue = h2hImpact / 100;

        // Strength of remaining schedule
        const scheduleStrength = this.rng.gaussian(0.5, 0.1);

        // Wild card race competitiveness
        const wildcardCompetition = this.rng.beta(3, 2); // Skewed toward competitive

        // Calculate base playoff probability
        let playoffProb = 0.55; // Base probability

        // Apply win streak momentum
        playoffProb *= streakMomentum;

        // Apply rival performance impact (inverse relationship)
        playoffProb /= rivalFactor;

        // Head-to-head impact
        playoffProb += (h2hValue - 0.5) * 0.2;

        // Schedule strength impact
        playoffProb *= (1.1 - scheduleStrength);

        // Wild card competition impact
        if (currentStanding === 'wildcard') {
            playoffProb *= (1.2 - wildcardCompetition);
        }

        // Add randomness for unpredictable factors
        const randomFactor = this.rng.gaussian(1.0, 0.15);
        playoffProb *= randomFactor;

        // Clamp to bounds
        playoffProb = Math.max(0.01, Math.min(0.99, playoffProb));

        // Calculate seeding probability
        const seedingProb = this.calculateSeedingProbability(playoffProb, parameters);

        // Calculate championship probability
        const championshipProb = this.calculateChampionshipProbability(playoffProb, parameters);

        return {
            playoffProbability: playoffProb * 100,
            championshipProbability: championshipProb * 100,
            seedingProbability: seedingProb,
            streakMomentum,
            rivalFactor,
            scheduleStrength,
            wildcardCompetition
        };
    }

    /**
     * Run NIL valuation scenario simulation
     */
    async runNILValuationScenario(parameters) {
        const cacheKey = `nil-valuation-${JSON.stringify(parameters)}`;

        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const results = [];
        const iterations = this.options.iterations;

        for (let i = 0; i < iterations; i++) {
            const iteration = this.simulateNILValuationIteration(parameters);
            results.push(iteration);
        }

        const analysis = this.analyzeResults(results);

        if (this.options.enableCaching) {
            this.cache.set(cacheKey, analysis);
        }

        return analysis;
    }

    /**
     * Simulate single NIL valuation iteration
     */
    simulateNILValuationIteration(parameters) {
        const {
            performanceImprovement = 0,
            socialMediaGrowth = 50,
            marketSize = 'medium',
            championshipFactor = 1.0,
            sport = 'football',
            position = 'QB',
            classYear = 'junior'
        } = parameters;

        // Base NIL value by sport and position
        const baseValues = {
            football: { QB: 500000, RB: 300000, WR: 280000, OL: 150000, DE: 200000, LB: 180000, DB: 160000 },
            basketball: { PG: 400000, SG: 350000, SF: 320000, PF: 300000, C: 280000 },
            baseball: { P: 200000, C: 150000, IF: 120000, OF: 110000 }
        };

        let baseValue = baseValues[sport]?.[position] || 150000;

        // Performance multiplier
        const performanceMultiplier = 1 + (performanceImprovement / 100);

        // Social media impact
        const socialMediaMultiplier = Math.pow(1 + (socialMediaGrowth / 100), 0.7); // Diminishing returns

        // Market size multipliers
        const marketMultipliers = {
            small: this.rng.gaussian(0.6, 0.1),
            medium: this.rng.gaussian(1.0, 0.15),
            large: this.rng.gaussian(1.6, 0.2),
            mega: this.rng.gaussian(2.4, 0.3)
        };
        const marketMultiplier = Math.max(0.3, marketMultipliers[marketSize]);

        // Championship/postseason performance bonus
        const championshipMultiplier = Math.pow(championshipFactor, 0.5);

        // Class year impact (eligibility remaining)
        const classMultipliers = { freshman: 1.2, sophomore: 1.1, junior: 1.0, senior: 0.8 };
        const classMultiplier = classMultipliers[classYear] || 1.0;

        // Economic conditions variance
        const economicFactor = this.rng.gaussian(1.0, 0.2);

        // Brand risk factors
        const brandRisk = this.rng.beta(8, 2); // Generally low risk, but possible issues
        const brandMultiplier = brandRisk > 0.95 ? 0.4 : (brandRisk > 0.85 ? 0.7 : 1.0);

        // Calculate final NIL value
        let nilValue = baseValue *
                       performanceMultiplier *
                       socialMediaMultiplier *
                       marketMultiplier *
                       championshipMultiplier *
                       classMultiplier *
                       economicFactor *
                       brandMultiplier;

        // Add marketplace volatility
        const volatilityFactor = this.rng.gaussian(1.0, 0.25);
        nilValue *= volatilityFactor;

        // Minimum floor and maximum ceiling
        nilValue = Math.max(10000, Math.min(5000000, nilValue));

        return {
            nilValue,
            performanceMultiplier,
            socialMediaMultiplier,
            marketMultiplier,
            championshipMultiplier,
            brandRisk,
            volatilityFactor,
            economicFactor
        };
    }

    /**
     * Run youth development scenario simulation
     */
    async runYouthDevelopmentScenario(parameters) {
        const cacheKey = `youth-development-${JSON.stringify(parameters)}`;

        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const results = [];
        const iterations = this.options.iterations;

        for (let i = 0; i < iterations; i++) {
            const iteration = this.simulateYouthDevelopmentIteration(parameters);
            results.push(iteration);
        }

        const analysis = this.analyzeResults(results);

        if (this.options.enableCaching) {
            this.cache.set(cacheKey, analysis);
        }

        return analysis;
    }

    /**
     * Simulate single youth development iteration
     */
    simulateYouthDevelopmentIteration(parameters) {
        const {
            skillDevelopmentRate = 1.0,
            characterScore = 7,
            academicPerformance = 3.5,
            hsRanking = 25,
            coachingQuality = 'good',
            familySupport = 'strong',
            injuryHistory = 'none'
        } = parameters;

        // Skill development trajectory
        const skillGrowth = this.rng.gamma(2, skillDevelopmentRate) * 0.5;

        // Character and leadership development
        const characterGrowth = (characterScore / 10) * this.rng.gaussian(1.0, 0.2);

        // Academic progress impact
        const academicImpact = Math.max(0.5, (academicPerformance - 2.0) / 2.0);

        // High school ranking trajectory
        const rankingImprovement = Math.max(0, this.rng.gaussian(10, 5));
        const projectedRanking = Math.max(1, hsRanking - rankingImprovement);

        // Coaching quality multiplier
        const coachingMultipliers = { poor: 0.7, average: 0.9, good: 1.1, excellent: 1.3 };
        const coachingMultiplier = coachingMultipliers[coachingQuality] || 1.0;

        // Family support system impact
        const familyMultipliers = { weak: 0.8, moderate: 1.0, strong: 1.2, exceptional: 1.4 };
        const familyMultiplier = familyMultipliers[familySupport] || 1.0;

        // Injury risk and recovery
        const injuryRiskFactors = { none: 0.05, minor: 0.12, moderate: 0.25, major: 0.4 };
        const injuryRisk = injuryRiskFactors[injuryHistory] || 0.1;
        const injuryImpact = this.rng.random() < injuryRisk ? this.rng.beta(2, 3) : 1.0;

        // College recruitment probability
        const recruitmentFactors = skillGrowth * characterGrowth * academicImpact *
                                  coachingMultiplier * familyMultiplier * injuryImpact;

        // Scholarship probability tiers
        let scholarshipTier = 'none';
        if (recruitmentFactors > 1.8) scholarshipTier = 'd1-full';
        else if (recruitmentFactors > 1.4) scholarshipTier = 'd1-partial';
        else if (recruitmentFactors > 1.1) scholarshipTier = 'd2-full';
        else if (recruitmentFactors > 0.8) scholarshipTier = 'd2-partial';
        else if (recruitmentFactors > 0.6) scholarshipTier = 'juco';

        // Professional potential (5-year projection)
        const proPotential = this.calculateProPotential(recruitmentFactors, parameters);

        // Texas high school football specific factors
        const txFootballFactor = this.calculateTexasFootballFactor(parameters);

        return {
            skillGrowth,
            characterGrowth,
            academicImpact,
            projectedRanking,
            recruitmentFactors,
            scholarshipTier,
            proPotential,
            injuryImpact,
            txFootballFactor,
            coachingMultiplier,
            familyMultiplier
        };
    }

    /**
     * Calculate playoff probability based on win percentage
     */
    calculatePlayoffProbability(winPercentage, parameters) {
        const league = parameters.league || 'mlb';

        // League-specific playoff probabilities
        const playoffThresholds = {
            mlb: { wildcard: 0.54, division: 0.58 },
            nfl: { wildcard: 0.56, division: 0.625 },
            nba: { wildcard: 0.49, division: 0.55 },
            ncaa: { wildcard: 0.67, division: 0.75 }
        };

        const threshold = playoffThresholds[league] || playoffThresholds.mlb;

        if (winPercentage >= threshold.division) {
            return Math.min(0.95, 0.7 + (winPercentage - threshold.division) * 2);
        } else if (winPercentage >= threshold.wildcard) {
            return 0.3 + (winPercentage - threshold.wildcard) * 10;
        } else {
            return Math.max(0.01, winPercentage * 0.5);
        }
    }

    /**
     * Calculate championship probability based on playoff probability
     */
    calculateChampionshipProbability(playoffProb, parameters) {
        if (playoffProb < 0.1) return 0;

        const league = parameters.league || 'mlb';

        // Championship multipliers by league format
        const champMultipliers = {
            mlb: 0.08,    // Best-of-7 series, more predictable
            nfl: 0.12,    // Single elimination, more volatile
            nba: 0.06,    // Best-of-7, star power matters
            ncaa: 0.03    // Single elimination tournament, very volatile
        };

        const multiplier = champMultipliers[league] || champMultipliers.mlb;

        return Math.min(0.4, playoffProb * multiplier * this.rng.gaussian(1.0, 0.3));
    }

    /**
     * Calculate seeding probability distribution
     */
    calculateSeedingProbability(playoffProb, parameters) {
        const seeds = [1, 2, 3, 4, 5, 6];
        const probabilities = {};

        // Higher playoff probability = better seeding
        const baseSeed = Math.max(1, Math.min(6, 7 - (playoffProb * 6)));

        seeds.forEach(seed => {
            const distance = Math.abs(seed - baseSeed);
            probabilities[seed] = Math.max(0.05, Math.exp(-distance) * playoffProb);
        });

        // Normalize probabilities
        const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
        Object.keys(probabilities).forEach(seed => {
            probabilities[seed] = probabilities[seed] / total;
        });

        return probabilities;
    }

    /**
     * Calculate professional potential for youth development
     */
    calculateProPotential(recruitmentFactors, parameters) {
        const sport = parameters.sport || 'football';

        // Base professional rates by sport
        const proRates = {
            football: 0.017,  // ~1.7% of college players make NFL
            basketball: 0.012, // ~1.2% make NBA
            baseball: 0.095   // ~9.5% make professional baseball
        };

        const baseRate = proRates[sport] || proRates.football;

        // Apply development factors
        const proProbability = Math.min(0.5, baseRate * Math.pow(recruitmentFactors, 2));

        return {
            probability: proProbability,
            tier: proProbability > 0.15 ? 'elite' :
                  proProbability > 0.05 ? 'high' :
                  proProbability > 0.02 ? 'moderate' : 'low'
        };
    }

    /**
     * Calculate Texas high school football specific factors
     */
    calculateTexasFootballFactor(parameters) {
        const region = parameters.region || 'metro';
        const classification = parameters.classification || '5A';

        // Texas HS football regional strength
        const regionalStrength = {
            metro: 1.2,    // Dallas/Houston/San Antonio/Austin
            suburban: 1.0, // Suburban districts
            rural: 0.8,    // Small town Texas
            borderland: 0.9 // Border regions
        };

        // Classification competition level
        const classificationStrength = {
            '6A': 1.3,
            '5A': 1.1,
            '4A': 1.0,
            '3A': 0.9,
            '2A': 0.8,
            '1A': 0.7
        };

        const regionMultiplier = regionalStrength[region] || 1.0;
        const classMultiplier = classificationStrength[classification] || 1.0;

        // Friday Night Lights factor - cultural importance
        const culturalFactor = this.rng.gaussian(1.1, 0.1);

        return {
            regionalStrength: regionMultiplier,
            classificationStrength: classMultiplier,
            culturalFactor: culturalFactor,
            overallFactor: regionMultiplier * classMultiplier * culturalFactor
        };
    }

    /**
     * Analyze simulation results and calculate statistics
     */
    analyzeResults(results) {
        if (!results || results.length === 0) {
            throw new Error('No results to analyze');
        }

        const metrics = {};
        const firstResult = results[0];

        // Identify all numeric properties
        Object.keys(firstResult).forEach(key => {
            if (typeof firstResult[key] === 'number') {
                const values = results.map(r => r[key]).filter(v => !isNaN(v));
                if (values.length > 0) {
                    metrics[key] = this.calculateStatistics(values);
                }
            }
        });

        return {
            iterations: results.length,
            metrics,
            confidenceLevel: this.options.confidenceLevel,
            timestamp: new Date().toISOString(),
            rawResults: this.options.includeRawResults ? results : null
        };
    }

    /**
     * Calculate comprehensive statistics for a set of values
     */
    calculateStatistics(values) {
        if (!values || values.length === 0) return null;

        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;

        // Basic statistics
        const mean = sorted.reduce((a, b) => a + b, 0) / n;
        const median = n % 2 === 0 ?
            (sorted[n/2 - 1] + sorted[n/2]) / 2 :
            sorted[Math.floor(n/2)];

        // Variance and standard deviation
        const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
        const stdDev = Math.sqrt(variance);

        // Confidence intervals
        const alpha = 1 - this.options.confidenceLevel;
        const lowerIndex = Math.floor(alpha / 2 * n);
        const upperIndex = Math.floor((1 - alpha / 2) * n);

        const confidenceInterval = {
            lower: sorted[lowerIndex],
            upper: sorted[upperIndex],
            level: this.options.confidenceLevel
        };

        // Percentiles
        const percentiles = {
            p5: sorted[Math.floor(0.05 * n)],
            p10: sorted[Math.floor(0.10 * n)],
            p25: sorted[Math.floor(0.25 * n)],
            p75: sorted[Math.floor(0.75 * n)],
            p90: sorted[Math.floor(0.90 * n)],
            p95: sorted[Math.floor(0.95 * n)]
        };

        // Risk metrics
        const valueAtRisk = {
            var95: sorted[Math.floor(0.05 * n)],
            var99: sorted[Math.floor(0.01 * n)]
        };

        return {
            mean,
            median,
            stdDev,
            variance,
            min: sorted[0],
            max: sorted[n - 1],
            confidenceInterval,
            percentiles,
            valueAtRisk,
            skewness: this.calculateSkewness(sorted, mean, stdDev),
            kurtosis: this.calculateKurtosis(sorted, mean, stdDev)
        };
    }

    /**
     * Calculate skewness (asymmetry of distribution)
     */
    calculateSkewness(values, mean, stdDev) {
        if (stdDev === 0) return 0;

        const n = values.length;
        const skewness = values.reduce((acc, val) => {
            return acc + Math.pow((val - mean) / stdDev, 3);
        }, 0) / n;

        return skewness;
    }

    /**
     * Calculate kurtosis (tail heaviness of distribution)
     */
    calculateKurtosis(values, mean, stdDev) {
        if (stdDev === 0) return 0;

        const n = values.length;
        const kurtosis = values.reduce((acc, val) => {
            return acc + Math.pow((val - mean) / stdDev, 4);
        }, 0) / n;

        return kurtosis - 3; // Excess kurtosis (0 for normal distribution)
    }

    /**
     * Run sensitivity analysis to identify key drivers
     */
    async runSensitivityAnalysis(baseParameters, scenario) {
        const results = {};
        const parameterKeys = Object.keys(baseParameters);

        for (const key of parameterKeys) {
            if (typeof baseParameters[key] === 'number') {
                const testValues = [
                    baseParameters[key] * 0.8,
                    baseParameters[key] * 0.9,
                    baseParameters[key],
                    baseParameters[key] * 1.1,
                    baseParameters[key] * 1.2
                ];

                const sensitivity = [];

                for (const testValue of testValues) {
                    const testParams = { ...baseParameters, [key]: testValue };
                    const result = await this.runScenario(scenario, testParams);
                    sensitivity.push({
                        parameterValue: testValue,
                        change: (testValue - baseParameters[key]) / baseParameters[key],
                        outcome: result.metrics.playoffProbability?.mean || result.metrics.nilValue?.mean || 0
                    });
                }

                results[key] = {
                    sensitivity,
                    impact: this.calculateParameterImpact(sensitivity)
                };
            }
        }

        return results;
    }

    /**
     * Calculate the impact of a parameter on outcomes
     */
    calculateParameterImpact(sensitivity) {
        if (sensitivity.length < 2) return 0;

        const baseOutcome = sensitivity.find(s => s.change === 0)?.outcome || sensitivity[2]?.outcome;
        if (!baseOutcome) return 0;

        const maxChange = Math.max(...sensitivity.map(s => Math.abs(s.outcome - baseOutcome) / baseOutcome));
        return maxChange;
    }

    /**
     * Main scenario runner - dispatches to appropriate simulation method
     */
    async runScenario(scenario, parameters) {
        if (!this.initialized) {
            throw new Error('Monte Carlo engine not initialized');
        }

        switch (scenario) {
            case 'team-performance':
                return await this.runTeamPerformanceScenario(parameters);
            case 'playoff-probability':
                return await this.runPlayoffProbabilityScenario(parameters);
            case 'nil-valuation':
                return await this.runNILValuationScenario(parameters);
            case 'youth-development':
                return await this.runYouthDevelopmentScenario(parameters);
            default:
                throw new Error(`Unknown scenario type: ${scenario}`);
        }
    }

    /**
     * Clear simulation cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
            memoryUsage: JSON.stringify([...this.cache]).length
        };
    }

    /**
     * Export simulation results
     */
    exportResults(results, format = 'json') {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

        switch (format) {
            case 'json':
                return {
                    data: JSON.stringify(results, null, 2),
                    filename: `blaze-monte-carlo-${timestamp}.json`,
                    mimeType: 'application/json'
                };
            case 'csv':
                return {
                    data: this.convertToCSV(results),
                    filename: `blaze-monte-carlo-${timestamp}.csv`,
                    mimeType: 'text/csv'
                };
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert results to CSV format
     */
    convertToCSV(results) {
        if (!results.metrics) return '';

        const headers = ['Metric', 'Mean', 'Median', 'StdDev', 'Min', 'Max', 'P5', 'P95'];
        const rows = [headers.join(',')];

        Object.entries(results.metrics).forEach(([metric, stats]) => {
            const row = [
                metric,
                stats.mean?.toFixed(4) || '',
                stats.median?.toFixed(4) || '',
                stats.stdDev?.toFixed(4) || '',
                stats.min?.toFixed(4) || '',
                stats.max?.toFixed(4) || '',
                stats.percentiles?.p5?.toFixed(4) || '',
                stats.percentiles?.p95?.toFixed(4) || ''
            ];
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }
}

// Export for browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeMonteCarloEngine;
} else if (typeof window !== 'undefined') {
    window.BlazeMonteCarloEngine = BlazeMonteCarloEngine;
}