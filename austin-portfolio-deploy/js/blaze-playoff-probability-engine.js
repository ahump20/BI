/**
 * 🏆 Blaze Intelligence Dynamic Playoff Probability Engine
 * Real-time Bayesian Monte Carlo simulations for championship predictions
 * Deep South Sports Authority - Championship Intelligence Platform
 */

class BlazePlayoffProbabilityEngine {
    constructor() {
        this.teams = {
            cardinals: {
                name: 'St. Louis Cardinals',
                sport: 'MLB',
                league: 'National League',
                division: 'NL Central',
                currentRecord: { wins: 83, losses: 79 },
                currentStanding: 2, // Division position
                playoffFormat: 'MLB',
                schedule: {
                    remaining: 0, // Season complete
                    homeGames: 0,
                    awayGames: 0,
                    vsRivals: 0,
                    vsDivision: 0
                },
                stats: {
                    winRate: 0.512,
                    recentForm: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1], // Last 10 games
                    homeAdvantage: 1.04,
                    clutchFactor: 0.96,
                    injuryIndex: 0.95,
                    teamChemistry: 0.88,
                    momentum: 0.82
                },
                historical: {
                    playoffAppearances: 31,
                    championships: 11,
                    recentSuccess: 0.65, // Last 5 years playoff rate
                    clutchPerformance: 0.74
                }
            },
            titans: {
                name: 'Tennessee Titans',
                sport: 'NFL',
                league: 'American Football Conference',
                division: 'AFC South',
                currentRecord: { wins: 3, losses: 14 },
                currentStanding: 4, // Division position
                playoffFormat: 'NFL',
                schedule: {
                    remaining: 0, // Season complete
                    homeGames: 0,
                    awayGames: 0,
                    vsRivals: 0,
                    vsDivision: 0
                },
                stats: {
                    winRate: 0.176,
                    recentForm: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0], // Last 10 games
                    homeAdvantage: 1.03,
                    pointDifferential: -232,
                    turnoverDifferential: -8,
                    injuryIndex: 0.78,
                    teamChemistry: 0.65,
                    momentum: 0.35
                },
                historical: {
                    playoffAppearances: 23,
                    championships: 0,
                    recentSuccess: 0.20, // Last 5 years playoff rate
                    clutchPerformance: 0.45
                }
            },
            longhorns: {
                name: 'Texas Longhorns',
                sport: 'NCAA Football',
                league: 'Southeastern Conference',
                division: 'SEC',
                currentRecord: { wins: 11, losses: 2 },
                currentStanding: 5, // CFP ranking
                playoffFormat: 'CFP',
                schedule: {
                    remaining: 1, // Championship game
                    homeGames: 0,
                    awayGames: 1,
                    vsRivals: 0,
                    vsDivision: 1
                },
                stats: {
                    winRate: 0.846,
                    recentForm: [1, 1, 1, 1, 1, 0, 1, 1, 1, 1], // Last 10 games
                    homeAdvantage: 1.12,
                    offensiveRating: 42.3,
                    defensiveRating: 18.1,
                    specialTeams: 0.92,
                    injuryIndex: 0.94,
                    teamChemistry: 0.96,
                    momentum: 0.95
                },
                historical: {
                    playoffAppearances: 8,
                    championships: 4,
                    recentSuccess: 0.60, // Last 5 years top-25 rate
                    clutchPerformance: 0.85
                }
            },
            grizzlies: {
                name: 'Memphis Grizzlies',
                sport: 'NBA',
                league: 'National Basketball Association',
                division: 'Southwest Division',
                currentRecord: { wins: 21, losses: 42 },
                currentStanding: 4, // Division position
                playoffFormat: 'NBA',
                schedule: {
                    remaining: 19,
                    homeGames: 10,
                    awayGames: 9,
                    vsRivals: 4,
                    vsDivision: 8
                },
                stats: {
                    winRate: 0.333,
                    recentForm: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1], // Last 10 games
                    homeAdvantage: 1.08,
                    netRating: -8.4,
                    offensiveRating: 108.2,
                    defensiveRating: 116.6,
                    injuryIndex: 0.72, // Significant injuries
                    teamChemistry: 0.88,
                    momentum: 0.58
                },
                historical: {
                    playoffAppearances: 12,
                    championships: 0,
                    recentSuccess: 0.40, // Last 5 years playoff rate
                    clutchPerformance: 0.68
                }
            }
        };

        this.playoffFormats = {
            MLB: {
                wildCardSpots: 6,
                divisionWinners: 6,
                totalTeams: 12,
                rounds: [
                    { name: 'Wild Card', teams: 6, advance: 4, format: 'best-of-3' },
                    { name: 'Division Series', teams: 8, advance: 4, format: 'best-of-5' },
                    { name: 'Championship Series', teams: 4, advance: 2, format: 'best-of-7' },
                    { name: 'World Series', teams: 2, advance: 1, format: 'best-of-7' }
                ]
            },
            NFL: {
                wildCardSpots: 6,
                divisionWinners: 8,
                totalTeams: 14,
                rounds: [
                    { name: 'Wild Card', teams: 12, advance: 8, format: 'single-game' },
                    { name: 'Divisional', teams: 8, advance: 4, format: 'single-game' },
                    { name: 'Conference Championship', teams: 4, advance: 2, format: 'single-game' },
                    { name: 'Super Bowl', teams: 2, advance: 1, format: 'single-game' }
                ]
            },
            CFP: {
                wildCardSpots: 7,
                divisionWinners: 5,
                totalTeams: 12,
                rounds: [
                    { name: 'First Round', teams: 8, advance: 4, format: 'single-game' },
                    { name: 'Quarterfinals', teams: 8, advance: 4, format: 'single-game' },
                    { name: 'Semifinals', teams: 4, advance: 2, format: 'single-game' },
                    { name: 'Championship', teams: 2, advance: 1, format: 'single-game' }
                ]
            },
            NBA: {
                wildCardSpots: 0,
                divisionWinners: 0,
                totalTeams: 16,
                rounds: [
                    { name: 'First Round', teams: 16, advance: 8, format: 'best-of-7' },
                    { name: 'Conference Semifinals', teams: 8, advance: 4, format: 'best-of-7' },
                    { name: 'Conference Finals', teams: 4, advance: 2, format: 'best-of-7' },
                    { name: 'NBA Finals', teams: 2, advance: 1, format: 'best-of-7' }
                ]
            }
        };

        this.initialize();
    }

    initialize() {
        console.log('🏆 Blaze Playoff Probability Engine Initializing...');
        this.loadCurrentSeasonData();
        this.initializeBayesianModel();
        console.log('✅ Championship Intelligence System Ready');
    }

    loadCurrentSeasonData() {
        // Update with real-time data from APIs
        // This would connect to actual sports APIs in production
        console.log('📊 Loading current season data for all teams...');

        // Calculate remaining season projections
        Object.keys(this.teams).forEach(teamKey => {
            const team = this.teams[teamKey];
            this.updateTeamProjections(teamKey);
        });
    }

    initializeBayesianModel() {
        // Set up Bayesian prior distributions for each team
        this.priors = {};

        Object.keys(this.teams).forEach(teamKey => {
            const team = this.teams[teamKey];
            this.priors[teamKey] = {
                playoffPrior: this.calculatePlayoffPrior(team),
                championshipPrior: this.calculateChampionshipPrior(team),
                confidence: this.calculatePriorConfidence(team)
            };
        });
    }

    calculatePlayoffPrior(team) {
        // Bayesian prior based on historical performance and current season
        const historicalWeight = 0.3;
        const currentWeight = 0.7;

        const historicalProb = team.historical.recentSuccess;
        const currentProb = this.estimateCurrentSeasonPlayoffProbability(team);

        return historicalWeight * historicalProb + currentWeight * currentProb;
    }

    calculateChampionshipPrior(team) {
        // Championship prior based on multiple factors
        const factors = {
            historical: team.historical.championships / 100, // Normalize championship history
            recent: team.historical.recentSuccess,
            current: team.stats.winRate,
            clutch: team.historical.clutchPerformance,
            chemistry: team.stats.teamChemistry,
            health: team.stats.injuryIndex
        };

        // Weighted combination
        return (
            factors.historical * 0.1 +
            factors.recent * 0.2 +
            factors.current * 0.3 +
            factors.clutch * 0.15 +
            factors.chemistry * 0.15 +
            factors.health * 0.1
        );
    }

    calculatePriorConfidence(team) {
        // Confidence in our prior based on data quality and sample size
        const factorsCount = Object.keys(team.stats).length;
        const recentFormConsistency = this.calculateFormConsistency(team.stats.recentForm);

        return Math.min(0.95, 0.5 + (factorsCount / 20) + (recentFormConsistency / 2));
    }

    calculateFormConsistency(recentForm) {
        if (!recentForm || recentForm.length === 0) return 0;

        const winRate = recentForm.reduce((sum, game) => sum + game, 0) / recentForm.length;
        const variance = recentForm.reduce((sum, game) => sum + Math.pow(game - winRate, 2), 0) / recentForm.length;

        return 1 - Math.sqrt(variance); // Higher consistency = lower variance
    }

    estimateCurrentSeasonPlayoffProbability(team) {
        // Estimate playoff probability based on current season performance
        switch (team.sport) {
            case 'MLB':
                return this.estimateMLBPlayoffProbability(team);
            case 'NFL':
                return this.estimateNFLPlayoffProbability(team);
            case 'NCAA Football':
                return this.estimateCFPPlayoffProbability(team);
            case 'NBA':
                return this.estimateNBAPlayoffProbability(team);
            default:
                return team.stats.winRate;
        }
    }

    estimateMLBPlayoffProbability(team) {
        // MLB-specific playoff probability calculation
        const totalGames = team.currentRecord.wins + team.currentRecord.losses;
        const winRate = team.currentRecord.wins / totalGames;

        // MLB playoff threshold is typically around .540-.550 win rate
        const playoffThreshold = 0.540;

        if (winRate >= playoffThreshold) {
            return Math.min(0.95, winRate + 0.1);
        } else {
            return Math.max(0.05, (winRate / playoffThreshold) * 0.5);
        }
    }

    estimateNFLPlayoffProbability(team) {
        // NFL-specific calculation (season complete)
        const winRate = team.stats.winRate;

        // NFL playoff threshold varies by division
        if (winRate >= 0.625) return 0.90; // 10+ wins
        if (winRate >= 0.562) return 0.70; // 9 wins
        if (winRate >= 0.500) return 0.40; // 8 wins
        if (winRate >= 0.438) return 0.15; // 7 wins

        return 0.02; // Less than 7 wins
    }

    estimateCFPPlayoffProbability(team) {
        // CFP specific calculation
        const ranking = team.currentStanding;
        const winRate = team.stats.winRate;

        if (ranking <= 4) return 0.95;
        if (ranking <= 8) return 0.80;
        if (ranking <= 12) return 0.60;
        if (ranking <= 16 && winRate >= 0.800) return 0.35;

        return 0.05;
    }

    estimateNBAPlayoffProbability(team) {
        // NBA playoff probability (season in progress)
        const totalGames = team.currentRecord.wins + team.currentRecord.losses;
        const gamesRemaining = team.schedule.remaining;
        const currentWinRate = team.currentRecord.wins / totalGames;

        // NBA typically needs 42-45 wins for playoffs
        const playoffWinsTarget = 42;
        const totalSeasonGames = 82;

        const currentWins = team.currentRecord.wins;
        const winsNeeded = Math.max(0, playoffWinsTarget - currentWins);
        const winRateNeeded = winsNeeded / gamesRemaining;

        if (winsNeeded <= 0) return 0.95;
        if (winRateNeeded <= 0.4) return 0.85;
        if (winRateNeeded <= 0.6) return 0.60;
        if (winRateNeeded <= 0.8) return 0.30;

        return 0.05;
    }

    async runDynamicPlayoffSimulation(teamKey, options = {}) {
        const {
            numSimulations = 10000,
            confidence = 0.95,
            includeInjuries = true,
            includeScheduleStrength = true,
            bayesianUpdate = true
        } = options;

        console.log(`🎲 Running ${numSimulations} playoff simulations for ${teamKey.toUpperCase()}`);

        const team = this.teams[teamKey];
        if (!team) {
            throw new Error(`Team ${teamKey} not found`);
        }

        const results = {
            team: team.name,
            sport: team.sport,
            simulations: numSimulations,
            playoffProbability: 0,
            championshipProbability: 0,
            roundProbabilities: {},
            expectedWins: 0,
            confidenceIntervals: {},
            scenarios: {
                best: null,
                worst: null,
                mostLikely: null
            },
            keyFactors: [],
            lastUpdated: new Date().toISOString()
        };

        // Initialize round probabilities
        const format = this.playoffFormats[team.playoffFormat];
        format.rounds.forEach(round => {
            results.roundProbabilities[round.name] = 0;
        });

        let playoffCount = 0;
        let championshipCount = 0;
        let expectedWinsSum = 0;
        const winDistribution = [];

        // Run Monte Carlo simulations
        for (let sim = 0; sim < numSimulations; sim++) {
            const simulation = await this.runSingleSeasonSimulation(teamKey, {
                includeInjuries,
                includeScheduleStrength,
                simulationNumber: sim
            });

            // Record results
            if (simulation.madePlayoffs) {
                playoffCount++;

                // Track round advancement
                simulation.playoffRounds.forEach(round => {
                    if (round.advanced) {
                        results.roundProbabilities[round.name]++;
                    }
                });

                if (simulation.wonChampionship) {
                    championshipCount++;
                }
            }

            expectedWinsSum += simulation.regularSeasonWins;
            winDistribution.push(simulation.regularSeasonWins);

            // Track scenarios
            if (sim === 0 || simulation.regularSeasonWins > (results.scenarios.best?.wins || 0)) {
                results.scenarios.best = {
                    wins: simulation.regularSeasonWins,
                    playoff: simulation.madePlayoffs,
                    championship: simulation.wonChampionship
                };
            }

            if (sim === 0 || simulation.regularSeasonWins < (results.scenarios.worst?.wins || 999)) {
                results.scenarios.worst = {
                    wins: simulation.regularSeasonWins,
                    playoff: simulation.madePlayoffs,
                    championship: simulation.wonChampionship
                };
            }
        }

        // Calculate final probabilities
        results.playoffProbability = playoffCount / numSimulations;
        results.championshipProbability = championshipCount / numSimulations;
        results.expectedWins = expectedWinsSum / numSimulations;

        // Normalize round probabilities
        Object.keys(results.roundProbabilities).forEach(round => {
            results.roundProbabilities[round] = results.roundProbabilities[round] / numSimulations;
        });

        // Calculate confidence intervals
        const sortedWins = winDistribution.sort((a, b) => a - b);
        const lowerIndex = Math.floor((1 - confidence) / 2 * numSimulations);
        const upperIndex = Math.floor((1 + confidence) / 2 * numSimulations);

        results.confidenceIntervals = {
            level: confidence,
            expectedWins: {
                lower: sortedWins[lowerIndex],
                upper: sortedWins[upperIndex],
                median: sortedWins[Math.floor(numSimulations / 2)]
            },
            playoffProbability: {
                lower: Math.max(0, results.playoffProbability - 1.96 * Math.sqrt(results.playoffProbability * (1 - results.playoffProbability) / numSimulations)),
                upper: Math.min(1, results.playoffProbability + 1.96 * Math.sqrt(results.playoffProbability * (1 - results.playoffProbability) / numSimulations))
            }
        };

        // Most likely scenario
        const medianWins = results.confidenceIntervals.expectedWins.median;
        results.scenarios.mostLikely = {
            wins: medianWins,
            playoff: results.playoffProbability > 0.5,
            championship: results.championshipProbability
        };

        // Identify key factors
        results.keyFactors = this.identifyKeyFactors(team, results);

        // Bayesian update if requested
        if (bayesianUpdate) {
            this.updateBayesianPriors(teamKey, results);
        }

        return results;
    }

    async runSingleSeasonSimulation(teamKey, options = {}) {
        const team = this.teams[teamKey];
        const {
            includeInjuries = true,
            includeScheduleStrength = true,
            simulationNumber = 0
        } = options;

        const simulation = {
            teamKey,
            regularSeasonWins: team.currentRecord.wins,
            regularSeasonLosses: team.currentRecord.losses,
            madePlayoffs: false,
            playoffRounds: [],
            wonChampionship: false,
            keyEvents: []
        };

        // Simulate remaining regular season games
        if (team.schedule.remaining > 0) {
            const remainingResults = this.simulateRemainingGames(team, {
                includeInjuries,
                includeScheduleStrength
            });

            simulation.regularSeasonWins += remainingResults.wins;
            simulation.regularSeasonLosses += remainingResults.losses;
            simulation.keyEvents.push(...remainingResults.keyEvents);
        }

        // Determine playoff qualification
        simulation.madePlayoffs = this.determinePlayoffQualification(team, simulation);

        // Simulate playoffs if qualified
        if (simulation.madePlayoffs) {
            const playoffResults = this.simulatePlayoffRun(team, simulation);
            simulation.playoffRounds = playoffResults.rounds;
            simulation.wonChampionship = playoffResults.wonChampionship;
            simulation.keyEvents.push(...playoffResults.keyEvents);
        }

        return simulation;
    }

    simulateRemainingGames(team, options) {
        const results = {
            wins: 0,
            losses: 0,
            keyEvents: []
        };

        const baseWinProbability = team.stats.winRate;

        for (let game = 0; game < team.schedule.remaining; game++) {
            let gameWinProbability = baseWinProbability;

            // Adjust for home/away
            const isHome = (game < team.schedule.homeGames);
            if (isHome) {
                gameWinProbability *= team.stats.homeAdvantage;
            }

            // Adjust for momentum
            gameWinProbability = gameWinProbability * 0.7 + team.stats.momentum * 0.3;

            // Add variance
            gameWinProbability += this.gaussianRandom(0, 0.1);
            gameWinProbability = Math.max(0.05, Math.min(0.95, gameWinProbability));

            // Simulate game
            if (Math.random() < gameWinProbability) {
                results.wins++;

                // Check for key wins
                if (game < team.schedule.vsRivals && Math.random() < 0.3) {
                    results.keyEvents.push(`Crucial rivalry victory`);
                }
            } else {
                results.losses++;
            }
        }

        return results;
    }

    determinePlayoffQualification(team, simulation) {
        const totalWins = simulation.regularSeasonWins;
        const winRate = totalWins / (simulation.regularSeasonWins + simulation.regularSeasonLosses);

        switch (team.sport) {
            case 'MLB':
                // Simple qualification check - would be more complex with actual standings
                return winRate >= 0.540 || Math.random() < 0.1; // Wild card chance

            case 'NFL':
                return winRate >= 0.562 || (winRate >= 0.500 && Math.random() < 0.3);

            case 'NCAA Football':
                return team.currentStanding <= 12 || (winRate >= 0.800 && Math.random() < 0.4);

            case 'NBA':
                return totalWins >= 42 || Math.random() < 0.05;

            default:
                return winRate >= 0.500;
        }
    }

    simulatePlayoffRun(team, simulation) {
        const results = {
            rounds: [],
            wonChampionship: false,
            keyEvents: []
        };

        const format = this.playoffFormats[team.playoffFormat];
        let teamStrength = this.calculatePlayoffStrength(team);

        for (const round of format.rounds) {
            const roundResult = this.simulatePlayoffRound(team, round, teamStrength);

            results.rounds.push({
                name: round.name,
                format: round.format,
                advanced: roundResult.advanced,
                games: roundResult.games,
                opponents: roundResult.opponents
            });

            if (!roundResult.advanced) {
                results.keyEvents.push(`Eliminated in ${round.name}`);
                break;
            }

            // Increase strength with each round win (momentum)
            teamStrength *= 1.02;

            if (round.name === format.rounds[format.rounds.length - 1].name) {
                results.wonChampionship = true;
                results.keyEvents.push(`🏆 Championship Victory!`);
            }
        }

        return results;
    }

    simulatePlayoffRound(team, round, teamStrength) {
        const baseWinProbability = teamStrength;
        let winProbability = baseWinProbability;

        // Adjust for playoff pressure and experience
        winProbability *= team.historical.clutchPerformance;

        // Add championship experience bonus
        if (team.historical.championships > 0) {
            winProbability *= 1.05;
        }

        if (round.format.includes('best-of')) {
            const gamesNeeded = round.format.includes('3') ? 2 : round.format.includes('5') ? 3 : 4;
            return this.simulateSeries(winProbability, gamesNeeded * 2 - 1);
        } else {
            // Single game
            return {
                advanced: Math.random() < winProbability,
                games: [Math.random() < winProbability],
                opponents: ['TBD']
            };
        }
    }

    simulateSeries(winProbability, maxGames) {
        const gamesNeeded = Math.ceil(maxGames / 2);
        let wins = 0;
        let losses = 0;
        const games = [];

        while (wins < gamesNeeded && losses < gamesNeeded) {
            const gameWon = Math.random() < winProbability;
            games.push(gameWon);

            if (gameWon) {
                wins++;
            } else {
                losses++;
            }
        }

        return {
            advanced: wins === gamesNeeded,
            games,
            opponents: ['TBD']
        };
    }

    calculatePlayoffStrength(team) {
        // Calculate overall playoff strength
        const factors = {
            regular: team.stats.winRate * 0.4,
            clutch: team.historical.clutchPerformance * 0.25,
            experience: Math.min(team.historical.playoffAppearances / 20, 1) * 0.15,
            health: team.stats.injuryIndex * 0.1,
            chemistry: team.stats.teamChemistry * 0.1
        };

        return Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    }

    identifyKeyFactors(team, results) {
        const factors = [];

        // Injury impact
        if (team.stats.injuryIndex < 0.8) {
            factors.push({
                factor: 'Injury Concerns',
                impact: (0.8 - team.stats.injuryIndex) * -0.2,
                description: 'Key player injuries affecting performance'
            });
        }

        // Momentum
        if (team.stats.momentum > 0.8) {
            factors.push({
                factor: 'Hot Streak',
                impact: (team.stats.momentum - 0.5) * 0.3,
                description: 'Team riding strong recent performance'
            });
        }

        // Schedule strength
        if (team.schedule.remaining > 0) {
            const strengthOfSchedule = team.schedule.vsRivals / team.schedule.remaining;
            if (strengthOfSchedule > 0.3) {
                factors.push({
                    factor: 'Difficult Schedule',
                    impact: strengthOfSchedule * -0.15,
                    description: 'Challenging remaining opponents'
                });
            }
        }

        // Historical performance
        if (team.historical.recentSuccess > 0.7) {
            factors.push({
                factor: 'Proven Success',
                impact: team.historical.recentSuccess * 0.2,
                description: 'Strong track record in recent years'
            });
        }

        return factors.slice(0, 5); // Top 5 factors
    }

    updateBayesianPriors(teamKey, simulationResults) {
        // Update Bayesian priors based on simulation results
        const currentPrior = this.priors[teamKey];
        const evidenceWeight = 0.1; // How much to weight new evidence

        this.priors[teamKey] = {
            playoffPrior: currentPrior.playoffPrior * (1 - evidenceWeight) +
                         simulationResults.playoffProbability * evidenceWeight,
            championshipPrior: currentPrior.championshipPrior * (1 - evidenceWeight) +
                             simulationResults.championshipProbability * evidenceWeight,
            confidence: Math.min(0.95, currentPrior.confidence + 0.01)
        };
    }

    updateTeamProjections(teamKey) {
        // Update team projections based on latest data
        // This would connect to real-time APIs in production
        const team = this.teams[teamKey];

        // Update momentum based on recent form
        if (team.stats.recentForm) {
            const recentWins = team.stats.recentForm.reduce((sum, game) => sum + game, 0);
            team.stats.momentum = recentWins / team.stats.recentForm.length;
        }

        console.log(`📊 Updated projections for ${team.name}`);
    }

    async getAllTeamProbabilities(options = {}) {
        console.log('🏆 Generating championship probabilities for all teams...');

        const results = {
            lastUpdated: new Date().toISOString(),
            teams: {},
            summary: {
                totalSimulations: options.numSimulations || 10000,
                confidence: options.confidence || 0.95
            }
        };

        // Run simulations for all teams
        for (const teamKey of Object.keys(this.teams)) {
            try {
                results.teams[teamKey] = await this.runDynamicPlayoffSimulation(teamKey, options);

                // Brief pause to prevent overwhelming the browser
                await new Promise(resolve => setTimeout(resolve, 10));
            } catch (error) {
                console.error(`Error simulating ${teamKey}:`, error);
                results.teams[teamKey] = {
                    error: error.message,
                    team: this.teams[teamKey].name
                };
            }
        }

        // Generate comparative analysis
        results.summary.topContenders = this.rankChampionshipContenders(results.teams);
        results.summary.surpriseTeams = this.identifySurpriseTeams(results.teams);

        return results;
    }

    rankChampionshipContenders(teamResults) {
        return Object.entries(teamResults)
            .filter(([key, result]) => !result.error)
            .sort(([,a], [,b]) => b.championshipProbability - a.championshipProbability)
            .slice(0, 4)
            .map(([key, result]) => ({
                team: result.team,
                sport: result.sport,
                championshipProbability: result.championshipProbability,
                playoffProbability: result.playoffProbability
            }));
    }

    identifySurpriseTeams(teamResults) {
        // Teams performing better than expected
        return Object.entries(teamResults)
            .filter(([key, result]) => {
                if (result.error) return false;
                const prior = this.priors[key];
                return result.playoffProbability > prior.playoffPrior + 0.2;
            })
            .map(([key, result]) => ({
                team: result.team,
                surprise: result.playoffProbability - this.priors[key].playoffPrior
            }));
    }

    gaussianRandom(mean = 0, stdDev = 1) {
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdDev + mean;
    }

    // Public API methods for dashboard integration
    async getTeamProbabilities(teamKey) {
        return await this.runDynamicPlayoffSimulation(teamKey);
    }

    async refreshAllProbabilities() {
        return await this.getAllTeamProbabilities();
    }

    getTeamSummary(teamKey) {
        const team = this.teams[teamKey];
        if (!team) return null;

        return {
            name: team.name,
            sport: team.sport,
            record: team.currentRecord,
            standing: team.currentStanding,
            momentum: team.stats.momentum,
            health: team.stats.injuryIndex,
            gamesRemaining: team.schedule.remaining
        };
    }
}

// Initialize the playoff probability engine
const blazePlayoffEngine = new BlazePlayoffProbabilityEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazePlayoffProbabilityEngine;
}

// Make globally accessible
window.blazePlayoffEngine = blazePlayoffEngine;

console.log('🏆 Blaze Playoff Probability Engine Loaded');