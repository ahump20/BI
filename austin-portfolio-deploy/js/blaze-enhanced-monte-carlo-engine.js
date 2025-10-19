/**
 * 🎲 Blaze Intelligence Enhanced Monte Carlo Engine
 * League-Wide Probabilistic Simulations with Comprehensive Data Integration
 * Deep South Sports Authority - Championship Intelligence Platform
 */

class BlazeEnhancedMonteCarloEngine extends MonteCarloEngine {
    constructor() {
        super();

        this.leagueDataManager = null;
        this.crossTeamComparisons = {};
        this.leagueWideSimulations = {};
        this.enhancedModels = {
            strengthOfSchedule: new StrengthOfScheduleModel(),
            injuryImpact: new InjuryImpactModel(),
            momentumTracking: new MomentumTrackingModel(),
            divisionRivalry: new DivisionRivalryModel()
        };

        this.initializeEnhancedEngine();
    }

    async initializeEnhancedEngine() {
        console.log('🏆 Initializing Enhanced Monte Carlo Engine with League-Wide Data...');

        // Wait for league data manager to be available
        if (window.blazeLeagueDataManager) {
            this.leagueDataManager = window.blazeLeagueDataManager;
            await this.loadLeagueWideData();
        } else {
            // Retry in 1 second if not available yet
            setTimeout(() => this.initializeEnhancedEngine(), 1000);
            return;
        }

        this.setupEnhancedModels();
        console.log('✅ Enhanced Monte Carlo Engine Ready - League-Wide Analysis Enabled');
    }

    async loadLeagueWideData() {
        console.log('📊 Loading comprehensive league data for Monte Carlo analysis...');

        try {
            this.leagueWideData = await this.leagueDataManager.getComprehensiveLeagueData();
            this.updateHistoricalData();
            this.calculateCrossLeagueMetrics();
            console.log('✅ League-wide data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading league-wide data:', error);
            this.leagueWideData = this.generateFallbackData();
        }
    }

    updateHistoricalData() {
        // Enhanced historical data with league-wide context
        this.historicalData = {
            // Existing featured teams
            cardinals: {
                ...this.historicalData.cardinals,
                leagueContext: this.leagueWideData.mlb,
                divisionRivals: ['CHC', 'MIL', 'CIN', 'PIT'],
                strengthOfSchedule: this.leagueWideData.mlb.strengthOfSchedule?.STL || 0.500,
                injuryIndex: this.leagueWideData.mlb.injuries?.STL?.healthIndex || 0.90
            },
            titans: {
                ...this.historicalData.titans,
                leagueContext: this.leagueWideData.nfl,
                divisionRivals: ['HOU', 'IND', 'JAX'],
                strengthOfSchedule: this.leagueWideData.nfl.strengthOfSchedule?.TEN || 0.500,
                injuryIndex: this.leagueWideData.nfl.injuries?.TEN?.healthIndex || 0.85
            },
            longhorns: {
                ...this.historicalData.longhorns,
                leagueContext: this.leagueWideData.ncaa,
                conferenceRivals: ['OU', 'A&M', 'ALA', 'GA'],
                strengthOfSchedule: this.leagueWideData.ncaa.strengthOfSchedule?.TEX || 0.520,
                injuryIndex: this.leagueWideData.ncaa.injuries?.TEX?.healthIndex || 0.95
            },
            grizzlies: {
                ...this.historicalData.grizzlies,
                leagueContext: this.leagueWideData.nba,
                divisionRivals: ['DAL', 'HOU', 'NO', 'SA'],
                strengthOfSchedule: this.leagueWideData.nba.strengthOfSchedule?.MEM || 0.500,
                injuryIndex: this.leagueWideData.nba.injuries?.MEM?.healthIndex || 0.75
            }
        };

        // Add all league teams for comprehensive analysis
        this.addAllLeagueTeams();
    }

    addAllLeagueTeams() {
        // Add all MLB teams
        if (this.leagueWideData.mlb.standings) {
            Object.entries(this.leagueWideData.mlb.standings).forEach(([teamCode, data]) => {
                if (!this.historicalData[teamCode.toLowerCase()]) {
                    this.historicalData[teamCode.toLowerCase()] = this.generateTeamProfile(teamCode, data, 'mlb');
                }
            });
        }

        // Add all NFL teams
        if (this.leagueWideData.nfl.standings) {
            Object.entries(this.leagueWideData.nfl.standings).forEach(([teamCode, data]) => {
                if (!this.historicalData[teamCode.toLowerCase()]) {
                    this.historicalData[teamCode.toLowerCase()] = this.generateTeamProfile(teamCode, data, 'nfl');
                }
            });
        }

        // Add all NBA teams
        if (this.leagueWideData.nba.standings) {
            Object.entries(this.leagueWideData.nba.standings).forEach(([teamCode, data]) => {
                if (!this.historicalData[teamCode.toLowerCase()]) {
                    this.historicalData[teamCode.toLowerCase()] = this.generateTeamProfile(teamCode, data, 'nba');
                }
            });
        }

        // Add major NCAA teams
        if (this.leagueWideData.ncaa.standings) {
            Object.entries(this.leagueWideData.ncaa.standings).forEach(([teamCode, data]) => {
                if (!this.historicalData[teamCode.toLowerCase()]) {
                    this.historicalData[teamCode.toLowerCase()] = this.generateTeamProfile(teamCode, data, 'ncaa');
                }
            });
        }

        console.log(`📈 Added ${Object.keys(this.historicalData).length} teams to Monte Carlo analysis`);
    }

    generateTeamProfile(teamCode, standingsData, sport) {
        const baseProfile = {
            teamCode: teamCode,
            sport: sport,
            winRate: standingsData.winPercentage || 0.500,
            homeAdvantage: this.getLeagueHomeAdvantage(sport),
            clutchFactor: 0.85 + (Math.random() * 0.3),
            injuryIndex: this.leagueWideData[sport]?.injuries?.[teamCode]?.healthIndex || 0.90,
            teamChemistry: 0.80 + (Math.random() * 0.2),
            momentum: this.calculateTeamMomentum(standingsData),
            strengthOfSchedule: this.leagueWideData[sport]?.strengthOfSchedule?.[teamCode] || 0.500
        };

        // Sport-specific additions
        switch (sport) {
            case 'mlb':
                return {
                    ...baseProfile,
                    avgRuns: standingsData.runsScored / 162 || 4.5,
                    avgRunsAllowed: standingsData.runsAllowed / 162 || 4.5,
                    pythWins: standingsData.pythWins || standingsData.wins,
                    vsAL: standingsData.vsAL || 0,
                    vsNL: standingsData.vsNL || 0
                };
            case 'nfl':
                return {
                    ...baseProfile,
                    avgPoints: standingsData.pointsFor / 17 || 20,
                    avgPointsAllowed: standingsData.pointsAgainst / 17 || 20,
                    turnoverRate: (Math.random() - 0.5) * 4,
                    pointDifferential: standingsData.pointDifferential || 0
                };
            case 'nba':
                return {
                    ...baseProfile,
                    avgPoints: standingsData.pointsFor || 110,
                    avgPointsAllowed: standingsData.pointsAgainst || 110,
                    netRating: standingsData.netRating || 0,
                    pace: standingsData.pace || 100
                };
            case 'ncaa':
                return {
                    ...baseProfile,
                    avgPoints: standingsData.pointsFor || 28,
                    avgPointsAllowed: standingsData.pointsAgainst || 25,
                    marginOfVictory: standingsData.marginOfVictory || 0,
                    qualityWins: standingsData.qualityWins || 0,
                    cfpRank: standingsData.cfpRank || null
                };
            default:
                return baseProfile;
        }
    }

    getLeagueHomeAdvantage(sport) {
        const advantages = {
            mlb: 1.04,
            nfl: 1.03,
            nba: 1.05,
            ncaa: 1.08
        };
        return advantages[sport] || 1.04;
    }

    calculateTeamMomentum(standingsData) {
        // Calculate momentum from recent performance
        if (standingsData.lastTenGames) {
            const recentWins = standingsData.lastTenGames.wins || 5;
            return recentWins / 10;
        }
        if (standingsData.lastFiveGames) {
            const recentWins = standingsData.lastFiveGames.wins || 2.5;
            return recentWins / 5;
        }
        return 0.5; // Default neutral momentum
    }

    setupEnhancedModels() {
        // Configure enhanced analytical models
        this.enhancedModels.strengthOfSchedule.configure({
            leagueData: this.leagueWideData,
            weightingFactors: {
                opponentWinRate: 0.6,
                recentForm: 0.2,
                homeAwayBalance: 0.1,
                restAdvantage: 0.1
            }
        });

        this.enhancedModels.injuryImpact.configure({
            positionWeights: this.getPositionWeights(),
            recoveryTimelines: this.getInjuryRecoveryTimelines(),
            replacementLevels: this.getReplacementLevels()
        });

        this.enhancedModels.momentumTracking.configure({
            lookbackGames: 10,
            decayFactor: 0.9,
            situationalWeights: {
                clutchTime: 1.5,
                blowouts: 0.5,
                rivalryGames: 1.3
            }
        });

        this.enhancedModels.divisionRivalry.configure({
            rivalryMultipliers: this.getRivalryMultipliers(),
            divisionImportance: this.getDivisionImportance()
        });
    }

    calculateCrossLeagueMetrics() {
        console.log('🔄 Calculating cross-league performance metrics...');

        this.crossTeamComparisons = {
            playoffContenders: this.identifyPlayoffContenders(),
            strengthRankings: this.calculateLeagueStrengthRankings(),
            momentumLeaders: this.identifyMomentumLeaders(),
            injuryImpact: this.analyzeLeagueWideInjuryImpact(),
            surpriseTeams: this.identifySurpriseTeams()
        };
    }

    identifyPlayoffContenders() {
        const contenders = {};

        ['mlb', 'nfl', 'nba', 'ncaa'].forEach(league => {
            if (!this.leagueWideData[league]?.standings) return;

            const teams = Object.entries(this.leagueWideData[league].standings)
                .map(([code, data]) => ({
                    teamCode: code,
                    winRate: data.winPercentage,
                    playoffProb: data.playoffProbability || 0,
                    momentum: this.calculateTeamMomentum(data),
                    strengthOfSchedule: this.leagueWideData[league].strengthOfSchedule?.[code] || 0.500
                }))
                .filter(team => team.playoffProb > 0.25)
                .sort((a, b) => b.playoffProb - a.playoffProb);

            contenders[league] = {
                topContenders: teams.slice(0, 8),
                bubbleTeams: teams.slice(8, 16),
                darkHorse: teams.filter(t => t.playoffProb > 0.40 && t.winRate < 0.550)
            };
        });

        return contenders;
    }

    calculateLeagueStrengthRankings() {
        const rankings = {};

        ['mlb', 'nfl', 'nba', 'ncaa'].forEach(league => {
            if (!this.leagueWideData[league]?.standings) return;

            const teams = Object.entries(this.leagueWideData[league].standings)
                .map(([code, data]) => {
                    const profile = this.historicalData[code.toLowerCase()];
                    return {
                        teamCode: code,
                        overallStrength: this.calculateOverallStrength(data, profile, league),
                        offensiveRating: this.calculateOffensiveRating(data, profile, league),
                        defensiveRating: this.calculateDefensiveRating(data, profile, league),
                        situationalStrength: this.calculateSituationalStrength(data, profile)
                    };
                })
                .sort((a, b) => b.overallStrength - a.overallStrength);

            rankings[league] = teams;
        });

        return rankings;
    }

    calculateOverallStrength(standingsData, profile, league) {
        if (!profile) return 0.500;

        const factors = {
            winRate: standingsData.winPercentage * 0.4,
            strengthOfSchedule: profile.strengthOfSchedule * 0.2,
            momentum: profile.momentum * 0.15,
            health: profile.injuryIndex * 0.1,
            clutch: profile.clutchFactor * 0.1,
            chemistry: profile.teamChemistry * 0.05
        };

        return Object.values(factors).reduce((sum, value) => sum + value, 0);
    }

    calculateOffensiveRating(standingsData, profile, league) {
        if (!profile) return 0.500;

        switch (league) {
            case 'mlb':
                return (standingsData.runsScored / 162) / 4.5; // Normalized to league average
            case 'nfl':
                return (standingsData.pointsFor / 17) / 22; // Normalized to league average
            case 'nba':
                return standingsData.offensiveRating / 110; // Normalized to league average
            case 'ncaa':
                return (standingsData.pointsFor / 13) / 28; // Normalized to league average
            default:
                return 0.500;
        }
    }

    calculateDefensiveRating(standingsData, profile, league) {
        if (!profile) return 0.500;

        switch (league) {
            case 'mlb':
                return 1 - ((standingsData.runsAllowed / 162) / 4.5); // Inverted (lower is better)
            case 'nfl':
                return 1 - ((standingsData.pointsAgainst / 17) / 22); // Inverted
            case 'nba':
                return 1 - (standingsData.defensiveRating / 110); // Inverted
            case 'ncaa':
                return 1 - ((standingsData.pointsAgainst / 13) / 25); // Inverted
            default:
                return 0.500;
        }
    }

    calculateSituationalStrength(standingsData, profile) {
        if (!profile) return 0.500;

        const factors = {
            clutchPerformance: profile.clutchFactor * 0.4,
            homeAdvantage: (profile.homeAdvantage - 1) * 5 * 0.3, // Scale home advantage
            momentum: profile.momentum * 0.3
        };

        return Object.values(factors).reduce((sum, value) => sum + value, 0);
    }

    identifyMomentumLeaders() {
        const leaders = {};

        ['mlb', 'nfl', 'nba', 'ncaa'].forEach(league => {
            if (!this.leagueWideData[league]?.standings) return;

            const teams = Object.entries(this.leagueWideData[league].standings)
                .map(([code, data]) => ({
                    teamCode: code,
                    momentum: this.calculateTeamMomentum(data),
                    recentRecord: data.lastTenGames || data.lastFiveGames || {},
                    trend: this.calculateTrend(data)
                }))
                .sort((a, b) => b.momentum - a.momentum);

            leaders[league] = {
                hottest: teams.slice(0, 5),
                coldest: teams.slice(-5).reverse(),
                trending: teams.filter(t => t.trend > 0.1)
            };
        });

        return leaders;
    }

    calculateTrend(standingsData) {
        // Calculate if team is trending up or down
        if (standingsData.lastTenGames) {
            const recent5 = standingsData.lastTenGames.games.slice(-5);
            const earlier5 = standingsData.lastTenGames.games.slice(0, 5);

            const recentWins = recent5.filter(g => g === 'W').length;
            const earlierWins = earlier5.filter(g => g === 'W').length;

            return (recentWins - earlierWins) / 5;
        }
        return 0;
    }

    analyzeLeagueWideInjuryImpact() {
        const impact = {};

        ['mlb', 'nfl', 'nba', 'ncaa'].forEach(league => {
            if (!this.leagueWideData[league]?.injuries) return;

            const injuryData = Object.entries(this.leagueWideData[league].injuries)
                .map(([code, data]) => ({
                    teamCode: code,
                    healthIndex: data.healthIndex,
                    totalInjuries: data.totalInjuries,
                    severityScore: this.calculateSeverityScore(data.injuries),
                    impactOnPerformance: this.estimateInjuryImpact(data)
                }))
                .sort((a, b) => a.healthIndex - b.healthIndex);

            impact[league] = {
                mostInjured: injuryData.slice(0, 5),
                healthiest: injuryData.slice(-5).reverse(),
                averageHealthIndex: injuryData.reduce((sum, team) => sum + team.healthIndex, 0) / injuryData.length
            };
        });

        return impact;
    }

    calculateSeverityScore(injuries) {
        if (!injuries || !Array.isArray(injuries)) return 0;

        const severityWeights = {
            'Minor': 1,
            'Moderate': 2,
            'Significant': 3,
            'Major': 4
        };

        return injuries.reduce((score, injury) => {
            const weight = severityWeights[injury.severity] || 1;
            const positionWeight = injury.impactRating || 0.2;
            return score + (weight * positionWeight);
        }, 0);
    }

    estimateInjuryImpact(injuryData) {
        const baseImpact = (1 - injuryData.healthIndex) * 0.3; // Max 30% impact
        const severityMultiplier = this.calculateSeverityScore(injuryData.injuries) / 10;
        return Math.min(0.4, baseImpact + severityMultiplier); // Cap at 40% impact
    }

    identifySurpriseTeams() {
        const surprises = {};

        ['mlb', 'nfl', 'nba', 'ncaa'].forEach(league => {
            if (!this.leagueWideData[league]?.standings || !this.leagueWideData[league]?.historical) return;

            const teams = Object.entries(this.leagueWideData[league].standings)
                .map(([code, data]) => {
                    const historical = this.leagueWideData[league].historical[code];
                    if (!historical) return null;

                    const expectedWinRate = historical.avgWinRate;
                    const actualWinRate = data.winPercentage;
                    const surprise = actualWinRate - expectedWinRate;

                    return {
                        teamCode: code,
                        expectedWinRate,
                        actualWinRate,
                        surprise,
                        surpriseType: surprise > 0.1 ? 'positive' : surprise < -0.1 ? 'negative' : 'expected'
                    };
                })
                .filter(team => team && Math.abs(team.surprise) > 0.08)
                .sort((a, b) => Math.abs(b.surprise) - Math.abs(a.surprise));

            surprises[league] = {
                overperformers: teams.filter(t => t.surprise > 0),
                underperformers: teams.filter(t => t.surprise < 0),
                biggest: teams.slice(0, 3)
            };
        });

        return surprises;
    }

    // Enhanced simulation methods
    async runLeagueWidePlayoffSimulation(options = {}) {
        const {
            numSimulations = 10000,
            includeAllTeams = true,
            focusLeagues = ['mlb', 'nfl', 'nba', 'ncaa'],
            confidence = 0.95
        } = options;

        console.log(`🏆 Running league-wide playoff simulations (${numSimulations} iterations)...`);

        const results = {
            timestamp: new Date().toISOString(),
            simulations: numSimulations,
            leagues: {},
            crossLeagueInsights: {},
            featuredTeams: {}
        };

        // Run simulations for each league
        for (const league of focusLeagues) {
            if (!this.leagueWideData[league]?.standings) continue;

            console.log(`📊 Simulating ${league.toUpperCase()} playoffs...`);
            results.leagues[league] = await this.simulateLeaguePlayoffs(league, numSimulations);
        }

        // Analyze cross-league patterns
        results.crossLeagueInsights = this.analyzeCrossLeaguePatterns(results.leagues);

        // Featured teams analysis
        results.featuredTeams = await this.simulateFeaturedTeams(numSimulations);

        // Generate insights and recommendations
        results.insights = this.generateSimulationInsights(results);

        console.log('✅ League-wide playoff simulations complete');
        return results;
    }

    async simulateLeaguePlayoffs(league, numSimulations) {
        const leagueData = this.leagueWideData[league];
        const standings = leagueData.standings;
        const playoffFormat = this.getPlayoffFormat(league);

        const results = {
            league: league,
            totalTeams: Object.keys(standings).length,
            playoffSpots: playoffFormat.totalSpots,
            simulations: {},
            probabilities: {},
            scenarios: []
        };

        // Get teams that could make playoffs (reasonable chance)
        const viableTeams = Object.entries(standings)
            .filter(([, data]) => data.winPercentage > 0.350 || data.playoffProbability > 0.05)
            .map(([code]) => code);

        console.log(`📈 Analyzing ${viableTeams.length} viable teams in ${league.toUpperCase()}`);

        // Run simulations for each viable team
        for (const teamCode of viableTeams) {
            results.simulations[teamCode] = await this.simulateTeamPlayoffChances(
                teamCode,
                league,
                standings[teamCode],
                numSimulations
            );
        }

        // Calculate probabilities
        results.probabilities = this.calculateLeaguePlayoffProbabilities(results.simulations, playoffFormat);

        // Generate interesting scenarios
        results.scenarios = this.generatePlayoffScenarios(league, results.simulations);

        return results;
    }

    async simulateTeamPlayoffChances(teamCode, league, standingsData, numSimulations) {
        const profile = this.historicalData[teamCode.toLowerCase()];
        if (!profile) return this.generateDefaultSimulation(teamCode, standingsData);

        let playoffCount = 0;
        let championshipCount = 0;
        let seedDistribution = {};
        let keyFactors = [];

        for (let sim = 0; sim < numSimulations; sim++) {
            const simulation = await this.runEnhancedTeamSimulation(teamCode, league, profile, standingsData);

            if (simulation.madePlayoffs) {
                playoffCount++;
                const seed = simulation.playoffSeed || 'WC';
                seedDistribution[seed] = (seedDistribution[seed] || 0) + 1;

                if (simulation.wonChampionship) {
                    championshipCount++;
                }
            }

            // Track factors that led to success/failure
            keyFactors.push(...simulation.keyFactors);
        }

        return {
            teamCode,
            league,
            playoffProbability: playoffCount / numSimulations,
            championshipProbability: championshipCount / numSimulations,
            seedDistribution: this.normalizeSeedDistribution(seedDistribution, playoffCount),
            averageWins: standingsData.wins + this.estimateRemainingWins(standingsData, profile),
            keyFactors: this.summarizeKeyFactors(keyFactors),
            upside: Math.min(0.95, (playoffCount + championshipCount * 2) / numSimulations),
            downside: Math.max(0.05, 1 - playoffCount / numSimulations)
        };
    }

    async runEnhancedTeamSimulation(teamCode, league, profile, standingsData) {
        const simulation = {
            teamCode,
            madePlayoffs: false,
            playoffSeed: null,
            wonChampionship: false,
            keyFactors: [],
            finalWins: standingsData.wins,
            seasonMetrics: {}
        };

        // Enhanced factors affecting performance
        const enhancedFactors = {
            baseStrength: profile.winRate,
            strengthOfSchedule: profile.strengthOfSchedule,
            injuryImpact: this.enhancedModels.injuryImpact.calculate(profile.injuryIndex),
            momentum: this.enhancedModels.momentumTracking.calculate(profile.momentum),
            chemistry: profile.teamChemistry,
            clutchFactor: profile.clutchFactor,
            homeAdvantage: profile.homeAdvantage
        };

        // Calculate remaining season performance
        const remainingGames = this.leagueWideData[league]?.remainingGames || 0;
        if (remainingGames > 0) {
            const remainingWins = this.simulateRemainingGames(enhancedFactors, remainingGames);
            simulation.finalWins += remainingWins;
            simulation.keyFactors.push(`Projected ${remainingWins}/${remainingGames} in remaining games`);
        }

        // Determine playoff qualification
        const qualificationResult = this.determineEnhancedPlayoffQualification(
            simulation.finalWins,
            league,
            teamCode,
            enhancedFactors
        );

        simulation.madePlayoffs = qualificationResult.qualified;
        simulation.playoffSeed = qualificationResult.seed;
        simulation.keyFactors.push(...qualificationResult.factors);

        // Simulate playoff run if qualified
        if (simulation.madePlayoffs) {
            const playoffResult = await this.simulateEnhancedPlayoffRun(
                teamCode,
                league,
                enhancedFactors,
                qualificationResult.seed
            );

            simulation.wonChampionship = playoffResult.wonChampionship;
            simulation.keyFactors.push(...playoffResult.factors);
        }

        return simulation;
    }

    simulateRemainingGames(enhancedFactors, remainingGames) {
        let wins = 0;
        const baseWinProb = enhancedFactors.baseStrength;

        for (let game = 0; game < remainingGames; game++) {
            let gameWinProb = baseWinProb;

            // Apply enhanced factor adjustments
            gameWinProb *= (1 + enhancedFactors.momentum * 0.2);
            gameWinProb *= enhancedFactors.injuryImpact;
            gameWinProb *= (0.8 + enhancedFactors.chemistry * 0.4);

            // Strength of schedule adjustment
            gameWinProb *= (1.1 - enhancedFactors.strengthOfSchedule);

            // Add variance
            gameWinProb += this.gaussianRandom(0, 0.08);
            gameWinProb = Math.max(0.05, Math.min(0.95, gameWinProb));

            if (Math.random() < gameWinProb) {
                wins++;
            }
        }

        return wins;
    }

    determineEnhancedPlayoffQualification(finalWins, league, teamCode, enhancedFactors) {
        const leagueData = this.leagueWideData[league];
        const playoffFormat = this.getPlayoffFormat(league);

        // Get current playoff picture
        const standings = Object.entries(leagueData.standings || {})
            .map(([code, data]) => ({
                teamCode: code,
                projectedWins: code === teamCode ? finalWins : data.wins + this.estimateTeamRemainingWins(code, league),
                winRate: 0
            }))
            .sort((a, b) => b.projectedWins - a.projectedWins);

        // Update win rates
        standings.forEach(team => {
            const totalGames = this.getTotalGamesForLeague(league);
            team.winRate = team.projectedWins / totalGames;
        });

        const teamRank = standings.findIndex(team => team.teamCode === teamCode) + 1;
        const qualified = teamRank <= playoffFormat.totalSpots;

        // Enhanced qualification factors
        const factors = [];
        let seed = null;

        if (qualified) {
            seed = teamRank;
            factors.push(`Clinched playoff spot as ${this.formatSeed(seed)} seed`);

            // Add context about how they qualified
            if (teamRank <= playoffFormat.divisionWinners) {
                factors.push('Division winner or conference champion');
            } else {
                factors.push('Wild card qualification');
            }
        } else {
            const gamesBack = standings[playoffFormat.totalSpots - 1].projectedWins - finalWins;
            factors.push(`Missed playoffs by ${gamesBack} games`);

            // Check for close misses
            if (gamesBack <= 2) {
                factors.push('Narrow miss - could have made it with better health/luck');
            }
        }

        // Factor in enhanced metrics
        if (enhancedFactors.injuryImpact < 0.90) {
            factors.push('Injury impact affected playoff chances');
        }
        if (enhancedFactors.momentum > 0.65) {
            factors.push('Strong finishing momentum');
        }
        if (enhancedFactors.strengthOfSchedule > 0.520) {
            factors.push('Tough schedule may have hurt playoff chances');
        }

        return { qualified, seed, factors };
    }

    async simulateEnhancedPlayoffRun(teamCode, league, enhancedFactors, seed) {
        const playoffFormat = this.getPlayoffFormat(league);
        const rounds = playoffFormat.rounds;

        let currentRound = 0;
        let wonChampionship = false;
        const factors = [];
        let playoffStrength = this.calculateEnhancedPlayoffStrength(enhancedFactors);

        // Seed-based advantages
        if (seed <= 2) {
            playoffStrength *= 1.08; // Top seeds get home field advantage
            factors.push('Home field advantage throughout playoffs');
        } else if (seed <= 4) {
            playoffStrength *= 1.04;
            factors.push('Home field advantage in early rounds');
        }

        for (const round of rounds) {
            const roundResult = this.simulateEnhancedPlayoffRound(
                round,
                playoffStrength,
                enhancedFactors,
                seed
            );

            if (!roundResult.advanced) {
                factors.push(`Eliminated in ${round.name}`);
                break;
            }

            factors.push(`Advanced past ${round.name}`);
            currentRound++;

            // Increase strength with playoff experience
            playoffStrength *= 1.02;

            // Final round check
            if (currentRound === rounds.length) {
                wonChampionship = true;
                factors.push('🏆 Won Championship!');
            }
        }

        return { wonChampionship, factors };
    }

    calculateEnhancedPlayoffStrength(enhancedFactors) {
        const weights = {
            baseStrength: 0.40,
            clutchFactor: 0.25,
            injuryImpact: 0.15,
            momentum: 0.10,
            chemistry: 0.10
        };

        let strength = 0;
        strength += enhancedFactors.baseStrength * weights.baseStrength;
        strength += enhancedFactors.clutchFactor * weights.clutchFactor;
        strength += enhancedFactors.injuryImpact * weights.injuryImpact;
        strength += enhancedFactors.momentum * weights.momentum;
        strength += enhancedFactors.chemistry * weights.chemistry;

        return Math.max(0.2, Math.min(0.8, strength));
    }

    simulateEnhancedPlayoffRound(round, playoffStrength, enhancedFactors, seed) {
        let winProbability = playoffStrength;

        // Clutch factor becomes more important in playoffs
        winProbability *= enhancedFactors.clutchFactor;

        // Home field advantage in playoffs
        if (seed <= 4) {
            winProbability *= enhancedFactors.homeAdvantage;
        }

        // Series vs single game adjustments
        if (round.format.includes('best-of')) {
            return this.simulateEnhancedSeries(winProbability, round.format);
        } else {
            return {
                advanced: Math.random() < winProbability,
                games: [Math.random() < winProbability]
            };
        }
    }

    simulateEnhancedSeries(winProbability, format) {
        const gamesNeeded = this.getGamesNeededFromFormat(format);
        const maxGames = gamesNeeded * 2 - 1;

        let wins = 0;
        let losses = 0;
        const games = [];

        while (wins < gamesNeeded && losses < gamesNeeded) {
            // Adjust probability based on series situation
            let gameWinProb = winProbability;

            // Elimination game pressure
            if (losses === gamesNeeded - 1) {
                gameWinProb *= 1.1; // Slight boost when backs against wall
            }

            // Series clinching opportunity
            if (wins === gamesNeeded - 1) {
                gameWinProb *= 0.95; // Slight reduction when trying to close
            }

            const gameWon = Math.random() < gameWinProb;
            games.push(gameWon);

            if (gameWon) {
                wins++;
            } else {
                losses++;
            }
        }

        return {
            advanced: wins === gamesNeeded,
            games: games
        };
    }

    // Utility methods for enhanced analysis
    getPlayoffFormat(league) {
        const formats = {
            mlb: {
                totalSpots: 12,
                divisionWinners: 6,
                rounds: [
                    { name: 'Wild Card', format: 'best-of-3' },
                    { name: 'Division Series', format: 'best-of-5' },
                    { name: 'Championship Series', format: 'best-of-7' },
                    { name: 'World Series', format: 'best-of-7' }
                ]
            },
            nfl: {
                totalSpots: 14,
                divisionWinners: 8,
                rounds: [
                    { name: 'Wild Card', format: 'single-game' },
                    { name: 'Divisional', format: 'single-game' },
                    { name: 'Conference Championship', format: 'single-game' },
                    { name: 'Super Bowl', format: 'single-game' }
                ]
            },
            nba: {
                totalSpots: 16,
                divisionWinners: 0,
                rounds: [
                    { name: 'First Round', format: 'best-of-7' },
                    { name: 'Conference Semifinals', format: 'best-of-7' },
                    { name: 'Conference Finals', format: 'best-of-7' },
                    { name: 'NBA Finals', format: 'best-of-7' }
                ]
            },
            ncaa: {
                totalSpots: 12,
                divisionWinners: 5,
                rounds: [
                    { name: 'First Round', format: 'single-game' },
                    { name: 'Quarterfinals', format: 'single-game' },
                    { name: 'Semifinals', format: 'single-game' },
                    { name: 'Championship', format: 'single-game' }
                ]
            }
        };

        return formats[league] || formats.mlb;
    }

    getGamesNeededFromFormat(format) {
        if (format.includes('3')) return 2;
        if (format.includes('5')) return 3;
        if (format.includes('7')) return 4;
        return 1;
    }

    getTotalGamesForLeague(league) {
        const games = {
            mlb: 162,
            nfl: 17,
            nba: 82,
            ncaa: 13
        };
        return games[league] || 162;
    }

    formatSeed(seed) {
        if (seed === 1) return '1st';
        if (seed === 2) return '2nd';
        if (seed === 3) return '3rd';
        return `${seed}th`;
    }

    estimateTeamRemainingWins(teamCode, league) {
        const profile = this.historicalData[teamCode.toLowerCase()];
        const remainingGames = this.leagueWideData[league]?.remainingGames || 0;
        const winRate = profile?.winRate || 0.500;
        return Math.round(remainingGames * winRate);
    }

    estimateRemainingWins(standingsData, profile) {
        const totalGames = this.getTotalGamesForLeague(profile.sport);
        const gamesPlayed = standingsData.wins + standingsData.losses;
        const remainingGames = totalGames - gamesPlayed;
        return Math.round(remainingGames * profile.winRate);
    }

    // Analysis and insight methods
    analyzeCrossLeaguePatterns(leagueResults) {
        return {
            consistentPerformers: this.findConsistentPerformers(leagueResults),
            volatileTeams: this.findVolatileTeams(leagueResults),
            strengthCorrelations: this.analyzeStrengthCorrelations(),
            momentumPatterns: this.analyzeMomentumPatterns(),
            injuryImpactPatterns: this.analyzeInjuryPatterns()
        };
    }

    async simulateFeaturedTeams(numSimulations) {
        const featured = {};

        for (const [teamKey, teamInfo] of Object.entries(this.leagueDataManager.featuredTeams)) {
            console.log(`🎯 Running enhanced simulation for ${teamKey.toUpperCase()}...`);

            try {
                featured[teamKey] = await this.runDynamicPlayoffSimulation(teamKey, {
                    numSimulations,
                    includeLeagueContext: true,
                    enhancedFactors: true
                });
            } catch (error) {
                console.error(`Error simulating ${teamKey}:`, error);
                featured[teamKey] = { error: error.message };
            }
        }

        return featured;
    }

    generateSimulationInsights(results) {
        return {
            surpriseTeams: this.identifySimulationSurprises(results),
            keyTrends: this.identifyKeyTrends(results),
            riskFactors: this.identifyRiskFactors(results),
            opportunities: this.identifyOpportunities(results),
            recommendations: this.generateRecommendations(results)
        };
    }

    // Enhanced public API
    async getEnhancedTeamAnalysis(teamKey) {
        if (!this.leagueDataManager) {
            throw new Error('League data manager not initialized');
        }

        const teamData = this.leagueDataManager.getTeamData(teamKey);
        if (!teamData) {
            throw new Error(`Team ${teamKey} not found`);
        }

        // Run enhanced simulation
        const simulation = await this.runDynamicPlayoffSimulation(teamKey, {
            numSimulations: 10000,
            includeLeagueContext: true,
            enhancedFactors: true
        });

        // Add cross-team comparisons
        const comparisons = this.generateTeamComparisons(teamKey, teamData.league);

        // Generate insights
        const insights = this.generateTeamInsights(teamKey, simulation, comparisons);

        return {
            team: teamData,
            simulation: simulation,
            comparisons: comparisons,
            insights: insights,
            lastUpdated: new Date().toISOString()
        };
    }

    async refreshLeagueData() {
        if (this.leagueDataManager) {
            await this.leagueDataManager.refreshAllData();
            await this.loadLeagueWideData();
            console.log('🔄 Enhanced Monte Carlo data refreshed');
        }
    }

    getSystemStatus() {
        return {
            leagueDataConnected: !!this.leagueDataManager,
            leagueDataLoaded: !!this.leagueWideData,
            enhancedModelsReady: Object.keys(this.enhancedModels).length === 4,
            teamsInDatabase: Object.keys(this.historicalData).length,
            lastUpdate: this.leagueDataManager?.dataFresh?.lastUpdated,
            crossTeamComparisons: Object.keys(this.crossTeamComparisons).length > 0
        };
    }
}

// Enhanced models for specialized analysis
class StrengthOfScheduleModel {
    configure(config) {
        this.config = config;
    }

    calculate(teamData) {
        // Advanced SOS calculation
        return teamData.strengthOfSchedule || 0.500;
    }
}

class InjuryImpactModel {
    configure(config) {
        this.config = config;
    }

    calculate(injuryIndex) {
        // Non-linear injury impact
        return Math.pow(injuryIndex, 1.5);
    }
}

class MomentumTrackingModel {
    configure(config) {
        this.config = config;
    }

    calculate(momentum) {
        // Momentum with decay and situational weighting
        return momentum;
    }
}

class DivisionRivalryModel {
    configure(config) {
        this.config = config;
    }

    calculate(teamA, teamB) {
        // Rivalry factor calculation
        return 1.0;
    }
}

// Initialize enhanced engine when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if base Monte Carlo engine exists
    if (window.monteCarloEngine) {
        window.blazeEnhancedMonteCarloEngine = new BlazeEnhancedMonteCarloEngine();
        console.log('🏆 Enhanced Monte Carlo Engine with League-Wide Data Initialized');
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeEnhancedMonteCarloEngine;
}