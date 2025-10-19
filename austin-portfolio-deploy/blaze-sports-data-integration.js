/**
 * BLAZE INTELLIGENCE - ADVANCED SPORTS DATA INTEGRATION MODULE
 * Real-time MCP data integration for championship-grade analytics
 * Austin Humphrey - blazesportsintel.com - Deep South Sports Authority
 */

class BlazeSportsDataIntegration {
    constructor() {
        this.mcpEndpoint = '/api/blaze-intelligence';
        this.dataCache = new Map();
        this.updateIntervals = new Map();
        this.webSocketConnection = null;

        // Championship Team Data Structure
        this.championshipTeams = {
            cardinals: {
                sport: 'mlb',
                teamId: 'STL',
                displayName: 'St. Louis Cardinals',
                colors: { primary: '#C41E3A', secondary: '#FFFFFF' },
                league: 'NL Central',
                championships: 11
            },
            titans: {
                sport: 'nfl',
                teamId: 'TEN',
                displayName: 'Tennessee Titans',
                colors: { primary: '#4B92DB', secondary: '#002244' },
                league: 'AFC South',
                championships: 0
            },
            longhorns: {
                sport: 'ncaa',
                teamId: 'TEX',
                displayName: 'Texas Longhorns',
                colors: { primary: '#BF5700', secondary: '#FFFFFF' },
                league: 'SEC',
                championships: 4
            },
            grizzlies: {
                sport: 'nba',
                teamId: 'MEM',
                displayName: 'Memphis Grizzlies',
                colors: { primary: '#00B2A9', secondary: '#FDB927' },
                league: 'Western Conference',
                championships: 0
            }
        };

        // Deep South Regional Focus
        this.regionalScope = {
            states: ['TX', 'TN', 'MS', 'AL', 'LA', 'AR', 'OK', 'FL', 'GA', 'SC', 'NC', 'KY'],
            conferences: ['SEC', 'Big 12', 'ACC'],
            perfectGameRegions: ['Texas', 'Southeast', 'South']
        };

        // AI-Powered Contextual Intelligence
        this.aiContext = {
            seasonPhase: this.detectSeasonPhase(),
            competitiveBalance: new Map(),
            momentumIndicators: new Map(),
            characterAssessments: new Map()
        };

        this.initialize();
    }

    async initialize() {
        console.log('🚀 Blaze Sports Data Integration Initializing...');

        await this.establishMCPConnection();
        await this.initializeDataStreams();
        await this.setupRealTimeUpdates();
        await this.startAIAnalysis();

        console.log('⚡ Championship-Grade Data Flows ACTIVE');
    }

    async establishMCPConnection() {
        try {
            // Test MCP connectivity
            const response = await fetch(`${this.mcpEndpoint}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const status = await response.json();
                console.log('🔗 MCP Connection Established:', status);
                return true;
            }
        } catch (error) {
            console.warn('⚠️ MCP Connection Failed, using fallback data:', error);
            await this.loadFallbackData();
            return false;
        }
    }

    async initializeDataStreams() {
        // Initialize data for each championship team
        for (const [teamKey, teamConfig] of Object.entries(this.championshipTeams)) {
            await this.loadTeamData(teamKey, teamConfig);
            this.startTeamDataStream(teamKey);
        }

        // Initialize regional recruiting data
        await this.loadRecruitingIntelligence();

        // Initialize NIL market data
        await this.loadNILMarketData();

        // Initialize Perfect Game youth baseball data
        await this.loadYouthBaseballData();
    }

    async loadTeamData(teamKey, teamConfig) {
        try {
            console.log(`📊 Loading ${teamConfig.displayName} championship data...`);

            // Fetch comprehensive team analytics
            const teamData = await this.fetchMCPData('getTeamPerformance', {
                sport: teamConfig.sport,
                teamKey: teamConfig.teamId,
                season: '2024'
            });

            if (teamData) {
                // Process and cache team data
                const processedData = this.processTeamData(teamKey, teamData);
                this.dataCache.set(`team_${teamKey}`, processedData);

                // Update 3D visualization if available
                this.update3DVisualization(teamKey, processedData);

                console.log(`✅ ${teamConfig.displayName} data loaded successfully`);
            } else {
                // Use fallback data
                await this.loadTeamFallbackData(teamKey);
            }

        } catch (error) {
            console.error(`❌ Error loading ${teamKey} data:`, error);
            await this.loadTeamFallbackData(teamKey);
        }
    }

    async fetchMCPData(functionName, parameters) {
        try {
            const response = await fetch(`${this.mcpEndpoint}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parameters)
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`MCP request failed: ${response.status}`);
            }
        } catch (error) {
            console.warn(`MCP fetch failed for ${functionName}:`, error);
            return null;
        }
    }

    processTeamData(teamKey, rawData) {
        const teamConfig = this.championshipTeams[teamKey];

        const processedData = {
            // Core Performance Metrics
            performance: this.calculatePerformanceMetrics(teamKey, rawData),

            // Championship Trajectory
            trajectory: this.calculateChampionshipTrajectory(teamKey, rawData),

            // Current Season Status
            currentSeason: this.extractCurrentSeasonData(rawData),

            // AI-Generated Insights
            insights: this.generateAIInsights(teamKey, rawData),

            // Character Assessment (Blaze Intelligence Specialty)
            character: this.assessTeamCharacter(teamKey, rawData),

            // Contextual Intelligence
            context: this.generateContextualIntelligence(teamKey, rawData),

            // Last Update Timestamp
            lastUpdate: new Date().toISOString()
        };

        return processedData;
    }

    calculatePerformanceMetrics(teamKey, rawData) {
        const teamConfig = this.championshipTeams[teamKey];

        switch (teamConfig.sport) {
            case 'mlb':
                return {
                    hitting: this.calculateBaseballHittingScore(rawData),
                    pitching: this.calculateBaseballPitchingScore(rawData),
                    defense: this.calculateBaseballDefenseScore(rawData),
                    speed: this.calculateBaseballSpeedScore(rawData),
                    clutch: this.calculateBaseballClutchScore(rawData)
                };

            case 'nfl':
                return {
                    offense: this.calculateFootballOffenseScore(rawData),
                    defense: this.calculateFootballDefenseScore(rawData),
                    specialTeams: this.calculateFootballSpecialTeamsScore(rawData),
                    coaching: this.calculateFootballCoachingScore(rawData),
                    depth: this.calculateFootballDepthScore(rawData)
                };

            case 'ncaa':
                return {
                    recruiting: this.calculateRecruitingScore(rawData),
                    offense: this.calculateCollegeOffenseScore(rawData),
                    defense: this.calculateCollegeDefenseScore(rawData),
                    specialTeams: this.calculateCollegeSpecialTeamsScore(rawData),
                    coaching: this.calculateCollegeCoachingScore(rawData)
                };

            case 'nba':
                return {
                    offense: this.calculateBasketballOffenseScore(rawData),
                    defense: this.calculateBasketballDefenseScore(rawData),
                    rebounding: this.calculateBasketballReboundingScore(rawData),
                    bench: this.calculateBasketballBenchScore(rawData),
                    coaching: this.calculateBasketballCoachingScore(rawData)
                };

            default:
                return {
                    overall: 75,
                    potential: 80,
                    consistency: 70,
                    momentum: 65,
                    character: 85
                };
        }
    }

    // Baseball Performance Calculations
    calculateBaseballHittingScore(data) {
        const ops = data.teamStats?.ops || 0.750;
        const runsPerGame = data.teamStats?.runsPerGame || 4.5;
        const battingAvg = data.teamStats?.battingAverage || 0.265;

        // Normalize to 0-100 scale
        const opsScore = Math.min(100, (ops - 0.650) / 0.250 * 100);
        const runsScore = Math.min(100, (runsPerGame - 3.0) / 3.0 * 100);
        const avgScore = Math.min(100, (battingAvg - 0.220) / 0.080 * 100);

        return Math.round((opsScore + runsScore + avgScore) / 3);
    }

    calculateBaseballPitchingScore(data) {
        const era = data.teamStats?.era || 4.20;
        const whip = data.teamStats?.whip || 1.30;
        const strikeouts = data.teamStats?.strikeoutsPerNine || 8.5;

        const eraScore = Math.max(0, 100 - ((era - 2.50) / 2.50 * 100));
        const whipScore = Math.max(0, 100 - ((whip - 1.00) / 0.50 * 100));
        const soScore = Math.min(100, (strikeouts - 6.0) / 6.0 * 100);

        return Math.round((eraScore + whipScore + soScore) / 3);
    }

    calculateBaseballDefenseScore(data) {
        const fieldingPct = data.teamStats?.fieldingPercentage || 0.985;
        const errors = data.teamStats?.errors || 70;
        const defensiveRuns = data.teamStats?.defensiveRunsSaved || 0;

        const fieldingScore = Math.min(100, (fieldingPct - 0.970) / 0.025 * 100);
        const errorScore = Math.max(0, 100 - ((errors - 40) / 60 * 100));
        const runsScore = Math.min(100, (defensiveRuns + 20) / 40 * 100);

        return Math.round((fieldingScore + errorScore + runsScore) / 3);
    }

    calculateBaseballSpeedScore(data) {
        const stolenBases = data.teamStats?.stolenBases || 80;
        const triples = data.teamStats?.triples || 25;

        const sbScore = Math.min(100, stolenBases / 120 * 100);
        const tripleScore = Math.min(100, triples / 40 * 100);

        return Math.round((sbScore + tripleScore) / 2);
    }

    calculateBaseballClutchScore(data) {
        const ripb = data.teamStats?.runnersInScoringPosition || 0.250;
        const lateInnings = data.teamStats?.lateInningPerformance || 0.270;

        const risp = Math.min(100, (ripb - 0.200) / 0.100 * 100);
        const late = Math.min(100, (lateInnings - 0.220) / 0.100 * 100);

        return Math.round((risp + late) / 2);
    }

    // Football Performance Calculations
    calculateFootballOffenseScore(data) {
        const yardsPerGame = data.teamStats?.yardsPerGame || 350;
        const pointsPerGame = data.teamStats?.pointsPerGame || 22;
        const redZonePct = data.teamStats?.redZoneEfficiency || 0.60;

        const yardsScore = Math.min(100, (yardsPerGame - 250) / 200 * 100);
        const pointsScore = Math.min(100, (pointsPerGame - 14) / 21 * 100);
        const redZoneScore = Math.min(100, redZonePct * 100);

        return Math.round((yardsScore + pointsScore + redZoneScore) / 3);
    }

    calculateFootballDefenseScore(data) {
        const yardsAllowed = data.teamStats?.yardsAllowedPerGame || 350;
        const pointsAllowed = data.teamStats?.pointsAllowedPerGame || 22;
        const turnovers = data.teamStats?.turnoversForced || 12;

        const yardsScore = Math.max(0, 100 - ((yardsAllowed - 250) / 200 * 100));
        const pointsScore = Math.max(0, 100 - ((pointsAllowed - 14) / 21 * 100));
        const turnoverScore = Math.min(100, turnovers / 25 * 100);

        return Math.round((yardsScore + pointsScore + turnoverScore) / 3);
    }

    calculateFootballSpecialTeamsScore(data) {
        const kickReturnAvg = data.teamStats?.kickReturnAverage || 22;
        const puntReturnAvg = data.teamStats?.puntReturnAverage || 8;
        const fieldGoalPct = data.teamStats?.fieldGoalPercentage || 0.80;

        const kickScore = Math.min(100, (kickReturnAvg - 18) / 10 * 100);
        const puntScore = Math.min(100, (puntReturnAvg - 5) / 10 * 100);
        const fgScore = Math.min(100, fieldGoalPct * 100);

        return Math.round((kickScore + puntScore + fgScore) / 3);
    }

    calculateFootballCoachingScore(data) {
        const winPct = data.seasonRecord?.winPercentage || 0.50;
        const closeGames = data.teamStats?.oneScoreGames || 0.50;
        const adjustments = data.teamStats?.halfTimeAdjustments || 0.50;

        const winScore = Math.min(100, winPct * 100);
        const clutchScore = Math.min(100, closeGames * 100);
        const adjustScore = Math.min(100, adjustments * 100);

        return Math.round((winScore + clutchScore + adjustScore) / 3);
    }

    calculateFootballDepthScore(data) {
        const injuries = data.teamStats?.injuredReserveCount || 5;
        const backupContributions = data.teamStats?.backupPlayerStats || 0.30;

        const injuryScore = Math.max(0, 100 - (injuries / 15 * 100));
        const depthScore = Math.min(100, backupContributions * 100);

        return Math.round((injuryScore + depthScore) / 2);
    }

    // College Performance Calculations
    calculateRecruitingScore(data) {
        const recruitingRank = data.recruiting?.nationalRank || 25;
        const starAverage = data.recruiting?.averageStars || 3.2;
        const commits = data.recruiting?.commitCount || 15;

        const rankScore = Math.max(0, 100 - (recruitingRank - 1) / 24 * 100);
        const starScore = Math.min(100, (starAverage - 2.0) / 3.0 * 100);
        const countScore = Math.min(100, commits / 25 * 100);

        return Math.round((rankScore + starScore + countScore) / 3);
    }

    calculateCollegeOffenseScore(data) {
        // Similar to NFL but adjusted for college game
        return this.calculateFootballOffenseScore(data);
    }

    calculateCollegeDefenseScore(data) {
        // Similar to NFL but adjusted for college game
        return this.calculateFootballDefenseScore(data);
    }

    calculateCollegeSpecialTeamsScore(data) {
        // Similar to NFL but adjusted for college game
        return this.calculateFootballSpecialTeamsScore(data);
    }

    calculateCollegeCoachingScore(data) {
        // Similar to NFL but adjusted for college game
        return this.calculateFootballCoachingScore(data);
    }

    // Basketball Performance Calculations
    calculateBasketballOffenseScore(data) {
        const pointsPerGame = data.teamStats?.pointsPerGame || 110;
        const fieldGoalPct = data.teamStats?.fieldGoalPercentage || 0.45;
        const threePtPct = data.teamStats?.threePointPercentage || 0.35;

        const pointsScore = Math.min(100, (pointsPerGame - 90) / 30 * 100);
        const fgScore = Math.min(100, (fieldGoalPct - 0.40) / 0.15 * 100);
        const threePtScore = Math.min(100, (threePtPct - 0.30) / 0.15 * 100);

        return Math.round((pointsScore + fgScore + threePtScore) / 3);
    }

    calculateBasketballDefenseScore(data) {
        const pointsAllowed = data.teamStats?.pointsAllowedPerGame || 110;
        const oppFieldGoalPct = data.teamStats?.oppFieldGoalPercentage || 0.45;
        const steals = data.teamStats?.stealsPerGame || 7;

        const pointsScore = Math.max(0, 100 - ((pointsAllowed - 90) / 30 * 100));
        const fgDefScore = Math.max(0, 100 - ((oppFieldGoalPct - 0.40) / 0.15 * 100));
        const stealsScore = Math.min(100, steals / 12 * 100);

        return Math.round((pointsScore + fgDefScore + stealsScore) / 3);
    }

    calculateBasketballReboundingScore(data) {
        const reboundsPerGame = data.teamStats?.reboundsPerGame || 42;
        const reboundingMargin = data.teamStats?.reboundingMargin || 0;

        const totalRebScore = Math.min(100, (reboundsPerGame - 35) / 15 * 100);
        const marginScore = Math.min(100, (reboundingMargin + 5) / 10 * 100);

        return Math.round((totalRebScore + marginScore) / 2);
    }

    calculateBasketballBenchScore(data) {
        const benchPoints = data.teamStats?.benchPoints || 25;
        const benchMinutes = data.teamStats?.benchMinutes || 120;

        const pointsScore = Math.min(100, benchPoints / 40 * 100);
        const minutesScore = Math.min(100, benchMinutes / 200 * 100);

        return Math.round((pointsScore + minutesScore) / 2);
    }

    calculateBasketballCoachingScore(data) {
        const winPct = data.seasonRecord?.winPercentage || 0.50;
        const closeGames = data.teamStats?.oneScoreGames || 0.50;

        const winScore = Math.min(100, winPct * 100);
        const clutchScore = Math.min(100, closeGames * 100);

        return Math.round((winScore + clutchScore) / 2);
    }

    calculateChampionshipTrajectory(teamKey, rawData) {
        // Generate 6-point trajectory based on season progression
        const seasonProgress = this.getSeasonProgress();
        const currentForm = this.calculateCurrentForm(rawData);
        const trajectory = [];

        // Generate realistic trajectory points
        for (let i = 0; i < 6; i++) {
            const timePoint = i / 5; // 0 to 1
            const formAdjustment = (Math.random() - 0.5) * 10; // Random variance
            const trendAdjustment = currentForm * timePoint; // Trend over time

            let value = 50 + currentForm + formAdjustment + trendAdjustment;
            value = Math.max(10, Math.min(95, value)); // Clamp to realistic range

            trajectory.push(Math.round(value));
        }

        return trajectory;
    }

    getSeasonProgress() {
        const now = new Date();
        const month = now.getMonth() + 1;

        // Return season progress (0-1) based on sport seasons
        if (month >= 4 && month <= 9) {
            // Baseball season
            return (month - 4) / 5;
        } else if (month >= 9 || month <= 2) {
            // Football season
            return month >= 9 ? (month - 9) / 3 : (month + 3) / 3;
        } else {
            // Basketball season
            return (month + 8) / 6;
        }
    }

    calculateCurrentForm(rawData) {
        // Calculate current team form (-30 to +30)
        const recentRecord = rawData.recentGames?.winPercentage || 0.50;
        const momentum = rawData.teamStats?.momentum || 0;
        const injuries = rawData.teamStats?.injuredReserveCount || 5;

        let form = (recentRecord - 0.50) * 60; // -30 to +30
        form += momentum * 10; // Momentum adjustment
        form -= (injuries - 3) * 2; // Injury penalty

        return Math.max(-30, Math.min(30, form));
    }

    extractCurrentSeasonData(rawData) {
        return {
            wins: rawData.seasonRecord?.wins || 0,
            losses: rawData.seasonRecord?.losses || 0,
            winPercentage: rawData.seasonRecord?.winPercentage || 0.500,
            playoffProb: this.calculatePlayoffProbability(rawData),
            championshipProb: this.calculateChampionshipProbability(rawData),
            divisionRank: rawData.standings?.divisionRank || 3,
            conferenceRank: rawData.standings?.conferenceRank || 8
        };
    }

    calculatePlayoffProbability(rawData) {
        const winPct = rawData.seasonRecord?.winPercentage || 0.50;
        const strength = rawData.analytics?.strengthOfSchedule || 0.50;
        const remaining = rawData.seasonRecord?.gamesRemaining || 20;
        const current = rawData.standings?.divisionRank || 3;

        // Complex playoff probability calculation
        let prob = winPct * 100;

        // Adjust for remaining games
        if (remaining > 0) {
            const needWinPct = this.getPlayoffWinThreshold();
            const gamesNeeded = Math.ceil(needWinPct * remaining);
            const projectedWins = winPct * remaining;

            if (projectedWins >= gamesNeeded) {
                prob = Math.min(95, prob + (projectedWins - gamesNeeded) * 5);
            } else {
                prob = Math.max(5, prob - (gamesNeeded - projectedWins) * 5);
            }
        }

        // Adjust for current standing
        if (current <= 2) {
            prob = Math.min(95, prob + 10);
        } else if (current >= 4) {
            prob = Math.max(5, prob - 15);
        }

        return Math.round(Math.max(1, Math.min(99, prob)) * 10) / 10;
    }

    getPlayoffWinThreshold() {
        // Return win percentage typically needed for playoffs by sport
        const sportThresholds = {
            mlb: 0.556, // ~90 wins
            nfl: 0.563, // ~9 wins
            nba: 0.500, // ~41 wins
            ncaa: 0.750  // ~9 wins
        };

        // Default to 0.550 if sport not found
        return sportThresholds[this.currentSport] || 0.550;
    }

    calculateChampionshipProbability(rawData) {
        const playoffProb = this.calculatePlayoffProbability(rawData);
        const teamStrength = this.calculateTeamStrength(rawData);

        // Championship probability is much lower than playoff probability
        let champProb = (playoffProb / 100) * (teamStrength / 100) * 25; // Max 25% for strongest team

        return Math.round(Math.max(0.1, Math.min(25, champProb)) * 10) / 10;
    }

    calculateTeamStrength(rawData) {
        // Aggregate team strength from various factors
        const factors = [
            rawData.teamStats?.overallRating || 75,
            rawData.analytics?.powerRanking || 75,
            rawData.playerRatings?.averageOverall || 75,
            rawData.coachingStats?.overallGrade || 75
        ];

        return factors.reduce((sum, val) => sum + val, 0) / factors.length;
    }

    generateAIInsights(teamKey, rawData) {
        const insights = [];
        const teamConfig = this.championshipTeams[teamKey];

        // Generate contextual insights based on data
        const playoffProb = this.calculatePlayoffProbability(rawData);
        const currentForm = this.calculateCurrentForm(rawData);
        const teamStrength = this.calculateTeamStrength(rawData);

        // Championship window analysis
        if (playoffProb > 80) {
            insights.push({
                type: 'championship_window',
                priority: 'high',
                message: `Championship window wide open! ${playoffProb}% playoff probability indicates strong postseason positioning.`,
                confidence: 0.92
            });
        } else if (playoffProb < 20) {
            insights.push({
                type: 'rebuild_focus',
                priority: 'medium',
                message: `Focus on future development. Current ${playoffProb}% playoff probability suggests strategic rebuilding phase.`,
                confidence: 0.85
            });
        }

        // Form analysis
        if (currentForm > 15) {
            insights.push({
                type: 'momentum_positive',
                priority: 'high',
                message: `Exceptional momentum building. Recent form indicates championship-caliber performance trajectory.`,
                confidence: 0.88
            });
        } else if (currentForm < -15) {
            insights.push({
                type: 'momentum_concern',
                priority: 'high',
                message: `Performance concerns evident. Recent form suggests need for strategic adjustments.`,
                confidence: 0.84
            });
        }

        // Sport-specific insights
        insights.push(...this.generateSportSpecificInsights(teamKey, rawData));

        return insights;
    }

    generateSportSpecificInsights(teamKey, rawData) {
        const teamConfig = this.championshipTeams[teamKey];
        const insights = [];

        switch (teamConfig.sport) {
            case 'mlb':
                // Bullpen analysis
                const era = rawData.teamStats?.era || 4.20;
                if (era < 3.50) {
                    insights.push({
                        type: 'pitching_strength',
                        message: `Elite pitching staff with ${era} ERA provides championship foundation.`,
                        confidence: 0.90
                    });
                }

                // Clutch performance
                const risp = rawData.teamStats?.runnersInScoringPosition || 0.250;
                if (risp > 0.280) {
                    insights.push({
                        type: 'clutch_hitting',
                        message: `Exceptional clutch hitting (.${Math.round(risp * 1000)}) in pressure situations.`,
                        confidence: 0.87
                    });
                }
                break;

            case 'nfl':
                // Turnover differential
                const turnovers = rawData.teamStats?.turnoverDifferential || 0;
                if (turnovers > 5) {
                    insights.push({
                        type: 'turnover_advantage',
                        message: `+${turnovers} turnover differential indicates defensive playmaking ability.`,
                        confidence: 0.85
                    });
                }
                break;

            case 'ncaa':
                // Recruiting analysis
                const recruitingRank = rawData.recruiting?.nationalRank || 25;
                if (recruitingRank <= 5) {
                    insights.push({
                        type: 'recruiting_dominance',
                        message: `Elite #${recruitingRank} recruiting class builds championship foundation.`,
                        confidence: 0.93
                    });
                }
                break;

            case 'nba':
                // Bench scoring
                const benchPoints = rawData.teamStats?.benchPoints || 25;
                if (benchPoints > 35) {
                    insights.push({
                        type: 'depth_advantage',
                        message: `Strong bench production (${benchPoints} PPG) provides championship depth.`,
                        confidence: 0.82
                    });
                }
                break;
        }

        return insights;
    }

    assessTeamCharacter(teamKey, rawData) {
        // Blaze Intelligence's proprietary character assessment
        const characterMetrics = {
            grit: this.calculateGritScore(rawData),
            leadership: this.calculateLeadershipScore(rawData),
            resilience: this.calculateResilienceScore(rawData),
            chemistry: this.calculateChemistryScore(rawData),
            focus: this.calculateFocusScore(rawData)
        };

        const overallCharacter = Object.values(characterMetrics)
            .reduce((sum, val) => sum + val, 0) / Object.keys(characterMetrics).length;

        return {
            ...characterMetrics,
            overall: Math.round(overallCharacter),
            assessment: this.generateCharacterAssessment(overallCharacter)
        };
    }

    calculateGritScore(rawData) {
        // Measure team's ability to perform under pressure
        const comeFromBehind = rawData.teamStats?.comeFromBehindWins || 0;
        const closeLosses = rawData.teamStats?.closeLosses || 0;
        const adversityResponse = rawData.analytics?.adversityScore || 50;

        let grit = adversityResponse;
        grit += (comeFromBehind * 5);
        grit -= (closeLosses * 2);

        return Math.max(20, Math.min(100, Math.round(grit)));
    }

    calculateLeadershipScore(rawData) {
        // Assess leadership presence and impact
        const veteranPresence = rawData.playerRatings?.veteranLeadership || 50;
        const coachingGrade = rawData.coachingStats?.leadershipGrade || 75;
        const teamCohesion = rawData.analytics?.teamCohesion || 60;

        const leadership = (veteranPresence + coachingGrade + teamCohesion) / 3;
        return Math.round(leadership);
    }

    calculateResilienceScore(rawData) {
        // Measure bounce-back ability from setbacks
        const injuryRecovery = rawData.teamStats?.injuryRecoveryRate || 0.7;
        const adversityBounceBack = rawData.analytics?.bounceBackRate || 0.6;
        const mentalToughness = rawData.playerRatings?.mentalToughness || 65;

        let resilience = mentalToughness;
        resilience += (injuryRecovery * 20);
        resilience += (adversityBounceBack * 15);

        return Math.max(30, Math.min(100, Math.round(resilience)));
    }

    calculateChemistryScore(rawData) {
        // Assess team chemistry and cohesion
        const lockerRoomCulture = rawData.teamStats?.lockerRoomGrade || 75;
        const onFieldChemistry = rawData.analytics?.onFieldChemistry || 70;
        const conflictLevel = rawData.teamStats?.internalConflicts || 2;

        let chemistry = (lockerRoomCulture + onFieldChemistry) / 2;
        chemistry -= (conflictLevel * 5);

        return Math.max(40, Math.min(100, Math.round(chemistry)));
    }

    calculateFocusScore(rawData) {
        // Measure team's mental focus and preparation
        const preparationGrade = rawData.coachingStats?.preparationGrade || 75;
        const executionRate = rawData.teamStats?.executionRate || 0.75;
        const mentalErrors = rawData.teamStats?.mentalErrors || 8;

        let focus = preparationGrade;
        focus += (executionRate * 20);
        focus -= (mentalErrors * 2);

        return Math.max(30, Math.min(100, Math.round(focus)));
    }

    generateCharacterAssessment(overallScore) {
        if (overallScore >= 90) {
            return "Elite championship character. Exceptional leadership, grit, and mental toughness.";
        } else if (overallScore >= 80) {
            return "Strong championship character. Solid leadership with proven resilience.";
        } else if (overallScore >= 70) {
            return "Developing championship character. Good foundation with room for growth.";
        } else if (overallScore >= 60) {
            return "Average character profile. Inconsistent leadership and mental toughness.";
        } else {
            return "Character concerns evident. Leadership and mental toughness need development.";
        }
    }

    generateContextualIntelligence(teamKey, rawData) {
        const context = {
            seasonPhase: this.aiContext.seasonPhase,
            competitiveEnvironment: this.assessCompetitiveEnvironment(teamKey, rawData),
            marketFactors: this.analyzeMarketFactors(teamKey, rawData),
            regionalAdvantage: this.calculateRegionalAdvantage(teamKey),
            momentumFactors: this.analyzeMomentumFactors(rawData),
            predictiveIndicators: this.generatePredictiveIndicators(rawData)
        };

        return context;
    }

    assessCompetitiveEnvironment(teamKey, rawData) {
        const divisionStrength = rawData.analytics?.divisionStrength || 0.5;
        const scheduleStrength = rawData.analytics?.strengthOfSchedule || 0.5;

        return {
            divisionCompetitiveness: divisionStrength,
            scheduleIntensity: scheduleStrength,
            rivalryFactors: this.calculateRivalryImpact(teamKey),
            competitiveAdvantage: (1 - divisionStrength) * 0.6 + (1 - scheduleStrength) * 0.4
        };
    }

    calculateRivalryImpact(teamKey) {
        // Define key rivalries for each team
        const rivalries = {
            cardinals: ['cubs', 'brewers'],
            titans: ['colts', 'jaguars', 'texans'],
            longhorns: ['oklahoma', 'texas_am'],
            grizzlies: ['lakers', 'warriors']
        };

        return rivalries[teamKey]?.length || 1;
    }

    analyzeMarketFactors(teamKey, rawData) {
        const fanSupport = rawData.teamStats?.attendancePercentage || 0.85;
        const mediaAttention = rawData.analytics?.mediaScore || 50;
        const marketSize = this.getMarketSize(teamKey);

        return {
            fanEngagement: fanSupport,
            mediaPresence: mediaAttention,
            marketInfluence: marketSize,
            homeFieldAdvantage: this.calculateHomeFieldAdvantage(fanSupport, marketSize)
        };
    }

    getMarketSize(teamKey) {
        const marketSizes = {
            cardinals: 65, // St. Louis - Medium market
            titans: 55,    // Nashville - Medium-small market
            longhorns: 85, // Austin/Texas - Large market
            grizzlies: 45  // Memphis - Small market
        };

        return marketSizes[teamKey] || 50;
    }

    calculateHomeFieldAdvantage(fanSupport, marketSize) {
        return Math.round((fanSupport * 60 + marketSize * 0.4));
    }

    calculateRegionalAdvantage(teamKey) {
        const teamConfig = this.championshipTeams[teamKey];

        // Deep South teams get regional advantage boost
        const regionalBonus = {
            cardinals: 40,  // Midwest, some regional support
            titans: 75,     // Deep South, strong regional identity
            longhorns: 95,  // Texas - Ultimate regional identity
            grizzlies: 70   // Deep South, Memphis blues culture
        };

        return {
            regionalIdentity: regionalBonus[teamKey] || 50,
            culturalConnection: regionalBonus[teamKey] || 50,
            talentPipeline: this.calculateTalentPipeline(teamKey),
            fanLoyalty: regionalBonus[teamKey] * 0.8 || 40
        };
    }

    calculateTalentPipeline(teamKey) {
        // Texas and Deep South have strong talent pipelines
        const pipelineStrength = {
            cardinals: 60,  // Midwest talent
            titans: 75,     // Southeast talent
            longhorns: 95,  // Texas talent dominance
            grizzlies: 80   // Southeast basketball talent
        };

        return pipelineStrength[teamKey] || 50;
    }

    analyzeMomentumFactors(rawData) {
        const recentForm = this.calculateCurrentForm(rawData);
        const trendDirection = rawData.analytics?.trendDirection || 0;
        const momentumEvents = rawData.teamStats?.momentumEvents || [];

        return {
            currentMomentum: recentForm,
            trendDirection: trendDirection,
            momentumEvents: momentumEvents.length,
            sustainabilityScore: this.calculateMomentumSustainability(recentForm, trendDirection)
        };
    }

    calculateMomentumSustainability(form, trend) {
        // Calculate how sustainable current momentum is
        const sustainability = 50 + (form * 0.3) + (trend * 0.7);
        return Math.max(10, Math.min(90, Math.round(sustainability)));
    }

    generatePredictiveIndicators(rawData) {
        return {
            injuryRisk: this.calculateInjuryRisk(rawData),
            fatigueLevel: this.calculateFatigueLevel(rawData),
            peakPerformanceTiming: this.predictPeakTiming(rawData),
            regressionRisk: this.calculateRegressionRisk(rawData)
        };
    }

    calculateInjuryRisk(rawData) {
        const currentInjuries = rawData.teamStats?.injuredReserveCount || 3;
        const injuryHistory = rawData.analytics?.injuryProneness || 0.5;
        const workloadIntensity = rawData.teamStats?.workloadIntensity || 0.6;

        let risk = (currentInjuries * 10) + (injuryHistory * 30) + (workloadIntensity * 40);
        return Math.max(10, Math.min(90, Math.round(risk)));
    }

    calculateFatigueLevel(rawData) {
        const gamesPlayed = rawData.seasonRecord?.gamesPlayed || 0;
        const totalSeasonGames = this.getTotalSeasonGames(rawData.sport);
        const intensityLevel = rawData.teamStats?.gameIntensity || 0.7;

        const seasonProgress = gamesPlayed / totalSeasonGames;
        let fatigue = (seasonProgress * 60) + (intensityLevel * 30);

        return Math.max(0, Math.min(100, Math.round(fatigue)));
    }

    getTotalSeasonGames(sport) {
        const seasonLengths = {
            mlb: 162,
            nfl: 17,
            nba: 82,
            ncaa: 12
        };

        return seasonLengths[sport] || 82;
    }

    predictPeakTiming(rawData) {
        // Predict when team will hit peak performance
        const currentForm = this.calculateCurrentForm(rawData);
        const seasonProgress = this.getSeasonProgress();
        const developmentCurve = rawData.analytics?.developmentCurve || 0.5;

        // Teams typically peak at different times
        let optimalTiming = 0.75; // Default to 75% through season (playoffs)

        if (currentForm > 20) {
            optimalTiming = Math.min(1.0, seasonProgress + 0.2); // Peak soon
        } else if (currentForm < -20) {
            optimalTiming = Math.max(0.8, seasonProgress + 0.4); // Need more time
        }

        return Math.round(optimalTiming * 100) / 100;
    }

    calculateRegressionRisk(rawData) {
        const currentPerformance = this.calculateTeamStrength(rawData);
        const sustainabilityFactors = rawData.analytics?.sustainabilityScore || 50;
        const historicalVariance = rawData.analytics?.performanceVariance || 15;

        let regressionRisk = 50;

        if (currentPerformance > 85) {
            regressionRisk += 20; // High performers more likely to regress
        }

        regressionRisk += (historicalVariance - 10); // More variance = more risk
        regressionRisk -= (sustainabilityFactors - 50) * 0.5; // Better sustainability = lower risk

        return Math.max(10, Math.min(90, Math.round(regressionRisk)));
    }

    async loadRecruitingIntelligence() {
        try {
            const recruitingData = await this.fetchMCPData('getRecruitingAnalytics', {
                sport: 'football',
                graduationYear: '2025'
            });

            if (recruitingData) {
                this.dataCache.set('recruiting_intelligence', this.processRecruitingData(recruitingData));
                console.log('📈 Recruiting intelligence loaded');
            }
        } catch (error) {
            console.warn('⚠️ Recruiting data unavailable:', error);
        }
    }

    processRecruitingData(rawData) {
        return {
            topProspects: rawData.prospects?.slice(0, 50) || [],
            regionalStrength: this.calculateRegionalRecruitingStrength(rawData),
            competitiveBalance: this.analyzeRecruitingCompetition(rawData),
            trendAnalysis: this.analyzeRecruitingTrends(rawData),
            lastUpdate: new Date().toISOString()
        };
    }

    calculateRegionalRecruitingStrength(rawData) {
        const regionalData = {};

        this.regionalScope.states.forEach(state => {
            const stateProspects = rawData.prospects?.filter(p => p.state === state) || [];
            regionalData[state] = {
                prospectCount: stateProspects.length,
                averageRating: stateProspects.reduce((sum, p) => sum + (p.rating || 85), 0) / (stateProspects.length || 1),
                topPosition: stateProspects[0]?.position || 'N/A'
            };
        });

        return regionalData;
    }

    analyzeRecruitingCompetition(rawData) {
        const schoolTargets = {};

        rawData.prospects?.forEach(prospect => {
            prospect.targets?.forEach(school => {
                if (!schoolTargets[school]) {
                    schoolTargets[school] = { count: 0, averageRating: 0, totalRating: 0 };
                }
                schoolTargets[school].count++;
                schoolTargets[school].totalRating += (prospect.rating || 85);
                schoolTargets[school].averageRating = schoolTargets[school].totalRating / schoolTargets[school].count;
            });
        });

        return Object.entries(schoolTargets)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 20);
    }

    analyzeRecruitingTrends(rawData) {
        return {
            positionTrends: this.calculatePositionTrends(rawData),
            geographicShifts: this.calculateGeographicTrends(rawData),
            ratingInflation: this.calculateRatingTrends(rawData),
            commitmentTiming: this.analyzeCommitmentTiming(rawData)
        };
    }

    calculatePositionTrends(rawData) {
        const positions = {};

        rawData.prospects?.forEach(prospect => {
            if (!positions[prospect.position]) {
                positions[prospect.position] = { count: 0, averageRating: 0, totalRating: 0 };
            }
            positions[prospect.position].count++;
            positions[prospect.position].totalRating += (prospect.rating || 85);
            positions[prospect.position].averageRating = positions[prospect.position].totalRating / positions[prospect.position].count;
        });

        return positions;
    }

    calculateGeographicTrends(rawData) {
        const geographic = {};

        rawData.prospects?.forEach(prospect => {
            if (!geographic[prospect.state]) {
                geographic[prospect.state] = 0;
            }
            geographic[prospect.state]++;
        });

        return Object.entries(geographic)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
    }

    calculateRatingTrends(rawData) {
        const currentYear = new Date().getFullYear();
        const ratings = {
            fiveStar: rawData.prospects?.filter(p => p.stars === 5).length || 0,
            fourStar: rawData.prospects?.filter(p => p.stars === 4).length || 0,
            threeStar: rawData.prospects?.filter(p => p.stars === 3).length || 0
        };

        return {
            distribution: ratings,
            inflationScore: this.calculateRatingInflation(ratings),
            competitiveIndex: this.calculateCompetitiveIndex(ratings)
        };
    }

    calculateRatingInflation(ratings) {
        const total = ratings.fiveStar + ratings.fourStar + ratings.threeStar;
        const topTierPct = (ratings.fiveStar + ratings.fourStar) / total;

        // Compare to historical baseline (typically ~15% top tier)
        const historicalBaseline = 0.15;
        return Math.round((topTierPct / historicalBaseline) * 100) / 100;
    }

    calculateCompetitiveIndex(ratings) {
        // Higher number of highly rated prospects increases competition
        const competitiveProspects = ratings.fiveStar + ratings.fourStar;
        return Math.min(100, competitiveProspects * 2); // Scale to 0-100
    }

    analyzeCommitmentTiming(rawData) {
        const commitmentData = {
            early: 0,
            regular: 0,
            late: 0
        };

        rawData.prospects?.forEach(prospect => {
            if (prospect.commitmentDate) {
                const commitDate = new Date(prospect.commitmentDate);
                const month = commitDate.getMonth() + 1;

                if (month <= 6) {
                    commitmentData.early++;
                } else if (month <= 11) {
                    commitmentData.regular++;
                } else {
                    commitmentData.late++;
                }
            }
        });

        return commitmentData;
    }

    async loadNILMarketData() {
        try {
            const nilData = await this.fetchMCPData('getNILValuation', {
                sport: 'football',
                stats: { position: 'QB', performance: 90 },
                socialMedia: { instagram: 50000, tiktok: 25000, twitter: 30000 }
            });

            if (nilData) {
                this.dataCache.set('nil_market', this.processNILData(nilData));
                console.log('💰 NIL market data loaded');
            }
        } catch (error) {
            console.warn('⚠️ NIL data unavailable:', error);
        }
    }

    processNILData(rawData) {
        return {
            marketSize: rawData.marketSize || 500000000, // $500M estimated market
            averageValuation: rawData.averageValuation || 25000,
            topTierValuation: rawData.topTierValuation || 1000000,
            positionValues: this.calculatePositionNILValues(rawData),
            marketTrends: this.analyzeNILTrends(rawData),
            regionalFactors: this.calculateNILRegionalFactors(),
            lastUpdate: new Date().toISOString()
        };
    }

    calculatePositionNILValues(rawData) {
        return {
            QB: { average: 150000, top: 2000000 },
            RB: { average: 75000, top: 800000 },
            WR: { average: 85000, top: 1200000 },
            TE: { average: 45000, top: 400000 },
            OL: { average: 35000, top: 300000 },
            DL: { average: 50000, top: 600000 },
            LB: { average: 60000, top: 700000 },
            DB: { average: 70000, top: 900000 }
        };
    }

    analyzeNILTrends(rawData) {
        return {
            yearOverYear: 1.25, // 25% growth
            socialMediaImpact: 0.65, // 65% correlation
            performanceCorrelation: 0.78, // 78% correlation
            marketSegmentation: {
                tier1: { schools: 15, averageNIL: 750000 },
                tier2: { schools: 35, averageNIL: 350000 },
                tier3: { schools: 80, averageNIL: 150000 }
            }
        };
    }

    calculateNILRegionalFactors() {
        return {
            texas: { multiplier: 1.35, marketSize: 'XL' },
            california: { multiplier: 1.30, marketSize: 'XL' },
            florida: { multiplier: 1.25, marketSize: 'XL' },
            georgia: { multiplier: 1.20, marketSize: 'L' },
            alabama: { multiplier: 1.15, marketSize: 'M' },
            tennessee: { multiplier: 1.10, marketSize: 'M' }
        };
    }

    async loadYouthBaseballData() {
        try {
            const youthData = await this.fetchMCPData('getRecruitingAnalytics', {
                sport: 'baseball',
                graduationYear: '2025'
            });

            if (youthData) {
                this.dataCache.set('youth_baseball', this.processYouthBaseballData(youthData));
                console.log('⚾ Youth baseball data loaded');
            }
        } catch (error) {
            console.warn('⚠️ Youth baseball data unavailable:', error);
        }
    }

    processYouthBaseballData(rawData) {
        return {
            perfectGameProspects: rawData.prospects || [],
            regionalTournaments: this.extractTournamentData(rawData),
            collegeCommitments: this.analyzeCollegeCommitments(rawData),
            professionalSignings: this.analyzeProfessionalSignings(rawData),
            developmentTrends: this.analyzeYouthDevelopmentTrends(rawData),
            lastUpdate: new Date().toISOString()
        };
    }

    extractTournamentData(rawData) {
        return {
            majorTournaments: rawData.tournaments?.major || [],
            regionalEvents: rawData.tournaments?.regional || [],
            showcases: rawData.tournaments?.showcases || [],
            performanceMetrics: this.calculateTournamentPerformance(rawData.tournaments)
        };
    }

    calculateTournamentPerformance(tournaments) {
        if (!tournaments) return {};

        return {
            participationRate: tournaments.participationRate || 0.75,
            averagePerformance: tournaments.averagePerformance || 85,
            standoutPerformances: tournaments.standoutPerformances || 150,
            scoutingAttention: tournaments.scoutingAttention || 0.85
        };
    }

    analyzeCollegeCommitments(rawData) {
        const commitments = rawData.collegeCommitments || [];

        return {
            totalCommitments: commitments.length,
            byConference: this.groupCommitmentsByConference(commitments),
            byState: this.groupCommitmentsByState(commitments),
            timingTrends: this.analyzeCommitmentTiming(commitments)
        };
    }

    groupCommitmentsByConference(commitments) {
        const conferences = {};

        commitments.forEach(commitment => {
            const conference = commitment.conference || 'Other';
            if (!conferences[conference]) {
                conferences[conference] = 0;
            }
            conferences[conference]++;
        });

        return Object.entries(conferences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    groupCommitmentsByState(commitments) {
        const states = {};

        commitments.forEach(commitment => {
            const state = commitment.playerState || 'Unknown';
            if (!states[state]) {
                states[state] = 0;
            }
            states[state]++;
        });

        return Object.entries(states)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    analyzeProfessionalSignings(rawData) {
        const signings = rawData.professionalSignings || [];

        return {
            totalSignings: signings.length,
            averageBonus: this.calculateAverageBonus(signings),
            byRound: this.groupSigningsByRound(signings),
            developmentSuccess: this.calculateDevelopmentSuccess(signings)
        };
    }

    calculateAverageBonus(signings) {
        if (signings.length === 0) return 0;

        const totalBonus = signings.reduce((sum, signing) => sum + (signing.bonus || 0), 0);
        return Math.round(totalBonus / signings.length);
    }

    groupSigningsByRound(signings) {
        const rounds = {};

        signings.forEach(signing => {
            const round = signing.round || 'Undrafted';
            if (!rounds[round]) {
                rounds[round] = 0;
            }
            rounds[round]++;
        });

        return rounds;
    }

    calculateDevelopmentSuccess(signings) {
        // Track professional development success
        const successMetrics = signings.reduce((acc, signing) => {
            if (signing.professionalLevel) {
                acc[signing.professionalLevel] = (acc[signing.professionalLevel] || 0) + 1;
            }
            return acc;
        }, {});

        return successMetrics;
    }

    analyzeYouthDevelopmentTrends(rawData) {
        return {
            velocityTrends: this.analyzeVelocityTrends(rawData),
            positionTrends: this.analyzePositionDevelopmentTrends(rawData),
            geographicTrends: this.analyzeGeographicDevelopmentTrends(rawData),
            technologyImpact: this.analyzeTechnologyImpact(rawData)
        };
    }

    analyzeVelocityTrends(rawData) {
        const velocityData = rawData.velocityData || {};

        return {
            averageVelocity: velocityData.average || 87,
            topPercentile: velocityData.top10Percent || 94,
            yearOverYearIncrease: velocityData.yearOverYear || 1.5,
            regionalVariation: velocityData.regionalVariation || {}
        };
    }

    analyzePositionDevelopmentTrends(rawData) {
        return {
            catcherDevelopment: { trend: 'increasing', focus: 'framing_technology' },
            infielderDevelopment: { trend: 'stable', focus: 'versatility' },
            outfielderDevelopment: { trend: 'increasing', focus: 'power_speed' },
            pitcherDevelopment: { trend: 'velocity_focused', focus: 'spin_rate' }
        };
    }

    analyzeGeographicDevelopmentTrends(rawData) {
        return this.regionalScope.states.reduce((acc, state) => {
            acc[state] = {
                developmentRate: Math.random() * 20 + 80, // Mock data: 80-100
                facilityQuality: Math.random() * 30 + 70,  // Mock data: 70-100
                coachingLevel: Math.random() * 25 + 75     // Mock data: 75-100
            };
            return acc;
        }, {});
    }

    analyzeTechnologyImpact(rawData) {
        return {
            trackingSystemUsage: 0.78,
            videoAnalysisAdoption: 0.85,
            biometricMonitoring: 0.45,
            virtualRealityTraining: 0.25,
            impactOnDevelopment: 0.82
        };
    }

    startTeamDataStream(teamKey) {
        // Set up real-time data updates for each team
        const updateInterval = 30000; // 30 seconds

        const intervalId = setInterval(async () => {
            await this.refreshTeamData(teamKey);
        }, updateInterval);

        this.updateIntervals.set(teamKey, intervalId);
    }

    async refreshTeamData(teamKey) {
        try {
            const teamConfig = this.championshipTeams[teamKey];
            console.log(`🔄 Refreshing ${teamConfig.displayName} data...`);

            // Fetch latest team data
            const freshData = await this.fetchMCPData('getTeamPerformance', {
                sport: teamConfig.sport,
                teamKey: teamConfig.teamId,
                season: '2024'
            });

            if (freshData) {
                // Process and cache new data
                const processedData = this.processTeamData(teamKey, freshData);
                this.dataCache.set(`team_${teamKey}`, processedData);

                // Update 3D visualization
                this.update3DVisualization(teamKey, processedData);

                // Update UI components
                this.updateUIComponents(teamKey, processedData);

                console.log(`✅ ${teamConfig.displayName} data refreshed`);
            }

        } catch (error) {
            console.warn(`⚠️ Failed to refresh ${teamKey} data:`, error);
        }
    }

    update3DVisualization(teamKey, processedData) {
        // Update 3D engine with new data
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            window.BlazeIntelligence3D.updateData(teamKey, processedData);
        }
    }

    updateUIComponents(teamKey, processedData) {
        // Update championship dashboard
        if (window.BlazeDashboard) {
            window.BlazeDashboard.forceUpdate();
        }

        // Update specific UI elements
        this.updateTeamMetrics(teamKey, processedData);
        this.updateInsightsFeed(teamKey, processedData);
    }

    updateTeamMetrics(teamKey, processedData) {
        // Update team-specific metrics in UI
        const teamElements = document.querySelectorAll(`[data-team="${teamKey}"]`);

        teamElements.forEach(element => {
            // Update various metrics based on element type
            const metricType = element.getAttribute('data-metric');
            if (metricType && processedData[metricType]) {
                element.textContent = this.formatMetricValue(metricType, processedData[metricType]);

                // Add update animation
                element.style.animation = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.animation = 'metricUpdate 0.5s ease-in-out';
            }
        });
    }

    formatMetricValue(metricType, value) {
        switch (metricType) {
            case 'playoffProb':
                return `${value}%`;
            case 'championshipProb':
                return `${value}%`;
            case 'winPercentage':
                return `${(value * 100).toFixed(1)}%`;
            default:
                return value.toString();
        }
    }

    updateInsightsFeed(teamKey, processedData) {
        // Add new insights to the feed
        if (processedData.insights && processedData.insights.length > 0) {
            const container = document.getElementById('insightsContainer');
            if (container) {
                processedData.insights.forEach(insight => {
                    this.addInsightToFeed(teamKey, insight);
                });
            }
        }
    }

    addInsightToFeed(teamKey, insight) {
        const container = document.getElementById('insightsContainer');
        if (!container) return;

        const teamConfig = this.championshipTeams[teamKey];

        const insightElement = document.createElement('div');
        insightElement.className = 'insight-item';
        insightElement.innerHTML = `
            <div class="insight-team">${teamConfig.displayName}</div>
            <div class="insight-text">${insight.message}</div>
            <div class="insight-timestamp">Just now</div>
        `;

        // Add to top of container
        container.insertBefore(insightElement, container.firstChild);

        // Remove old insights to prevent overflow
        while (container.children.length > 8) {
            container.removeChild(container.lastChild);
        }

        // Animate in
        insightElement.style.opacity = '0';
        insightElement.style.transform = 'translateY(-20px)';

        requestAnimationFrame(() => {
            insightElement.style.transition = 'all 0.5s ease-out';
            insightElement.style.opacity = '1';
            insightElement.style.transform = 'translateY(0)';
        });
    }

    async setupRealTimeUpdates() {
        // Attempt to establish WebSocket connection for real-time updates
        try {
            const wsUrl = `ws://${window.location.host}/api/blaze-intelligence/ws`;
            this.webSocketConnection = new WebSocket(wsUrl);

            this.webSocketConnection.onopen = () => {
                console.log('🔗 Real-time data stream established');
            };

            this.webSocketConnection.onmessage = (event) => {
                this.handleRealTimeUpdate(JSON.parse(event.data));
            };

            this.webSocketConnection.onerror = (error) => {
                console.warn('⚠️ WebSocket connection failed:', error);
            };

        } catch (error) {
            console.warn('⚠️ WebSocket not available, using polling instead');
        }
    }

    handleRealTimeUpdate(update) {
        console.log('📡 Real-time update received:', update);

        // Process different types of updates
        switch (update.type) {
            case 'team_data':
                this.handleTeamDataUpdate(update);
                break;
            case 'game_event':
                this.handleGameEventUpdate(update);
                break;
            case 'injury_report':
                this.handleInjuryReportUpdate(update);
                break;
            case 'roster_move':
                this.handleRosterMoveUpdate(update);
                break;
            default:
                console.log('Unknown update type:', update.type);
        }
    }

    handleTeamDataUpdate(update) {
        const { teamKey, data } = update;
        if (this.championshipTeams[teamKey]) {
            const processedData = this.processTeamData(teamKey, data);
            this.dataCache.set(`team_${teamKey}`, processedData);
            this.update3DVisualization(teamKey, processedData);
            this.updateUIComponents(teamKey, processedData);
        }
    }

    handleGameEventUpdate(update) {
        // Handle live game events
        const { teamKey, event } = update;

        // Create real-time insight
        const insight = {
            type: 'live_event',
            priority: 'high',
            message: `${event.description} - Impact on championship probability being calculated.`,
            confidence: 0.85,
            timestamp: new Date().toISOString()
        };

        this.addInsightToFeed(teamKey, insight);
    }

    handleInjuryReportUpdate(update) {
        // Handle injury report updates
        const { teamKey, injury } = update;

        const insight = {
            type: 'injury_report',
            priority: 'medium',
            message: `${injury.player} ${injury.status} - Analyzing impact on team performance.`,
            confidence: 0.90,
            timestamp: new Date().toISOString()
        };

        this.addInsightToFeed(teamKey, insight);
    }

    handleRosterMoveUpdate(update) {
        // Handle roster move updates
        const { teamKey, move } = update;

        const insight = {
            type: 'roster_move',
            priority: 'medium',
            message: `${move.description} - Evaluating strategic implications.`,
            confidence: 0.80,
            timestamp: new Date().toISOString()
        };

        this.addInsightToFeed(teamKey, insight);
    }

    async startAIAnalysis() {
        // Start AI-powered contextual analysis
        setInterval(() => {
            this.runContextualAnalysis();
        }, 60000); // Every minute

        setInterval(() => {
            this.updateAIInsights();
        }, 300000); // Every 5 minutes

        console.log('🧠 AI Contextual Analysis Active');
    }

    runContextualAnalysis() {
        // Analyze current context and update AI recommendations
        this.aiContext.seasonPhase = this.detectSeasonPhase();

        // Update competitive balance
        this.updateCompetitiveBalance();

        // Update momentum indicators
        this.updateMomentumIndicators();

        // Generate predictive recommendations
        this.generatePredictiveRecommendations();
    }

    detectSeasonPhase() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        // Detect current season phase for each sport
        return {
            mlb: this.detectMLBPhase(month, day),
            nfl: this.detectNFLPhase(month, day),
            nba: this.detectNBAPhase(month, day),
            ncaa: this.detectCollegePhase(month, day)
        };
    }

    detectMLBPhase(month, day) {
        if (month < 3) return 'offseason';
        if (month === 3 || (month === 4 && day < 15)) return 'spring_training';
        if (month >= 4 && month <= 7) return 'first_half';
        if (month === 8 || (month === 9 && day < 15)) return 'second_half';
        if (month === 9 || month === 10) return 'playoffs';
        return 'offseason';
    }

    detectNFLPhase(month, day) {
        if (month >= 3 && month <= 7) return 'offseason';
        if (month === 8) return 'preseason';
        if (month >= 9 && month <= 12) return 'regular_season';
        if (month === 1 || month === 2) return 'playoffs';
        return 'offseason';
    }

    detectNBAPhase(month, day) {
        if (month >= 7 && month <= 9) return 'offseason';
        if (month === 10) return 'preseason';
        if (month >= 11 || month <= 3) return 'regular_season';
        if (month >= 4 && month <= 6) return 'playoffs';
        return 'offseason';
    }

    detectCollegePhase(month, day) {
        if (month >= 1 && month <= 7) return 'offseason';
        if (month === 8) return 'preseason';
        if (month >= 9 && month <= 11) return 'regular_season';
        if (month === 12 || month === 1) return 'playoffs';
        return 'offseason';
    }

    updateCompetitiveBalance() {
        // Analyze competitive balance across teams
        const teams = Object.keys(this.championshipTeams);

        teams.forEach(teamKey => {
            const teamData = this.dataCache.get(`team_${teamKey}`);
            if (teamData) {
                const balance = this.calculateTeamBalance(teamKey, teamData);
                this.aiContext.competitiveBalance.set(teamKey, balance);
            }
        });
    }

    calculateTeamBalance(teamKey, teamData) {
        // Calculate how balanced/unbalanced team performance is
        const performance = teamData.performance;
        const values = Object.values(performance);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;

        return {
            average: Math.round(average),
            variance: Math.round(variance),
            balance: Math.round(100 - variance), // Lower variance = better balance
            strengths: this.identifyStrengths(performance),
            weaknesses: this.identifyWeaknesses(performance)
        };
    }

    identifyStrengths(performance) {
        const average = Object.values(performance).reduce((sum, val) => sum + val, 0) / Object.keys(performance).length;
        return Object.entries(performance)
            .filter(([key, value]) => value > average + 10)
            .map(([key, value]) => ({ area: key, rating: value }));
    }

    identifyWeaknesses(performance) {
        const average = Object.values(performance).reduce((sum, val) => sum + val, 0) / Object.keys(performance).length;
        return Object.entries(performance)
            .filter(([key, value]) => value < average - 10)
            .map(([key, value]) => ({ area: key, rating: value }));
    }

    updateMomentumIndicators() {
        // Update momentum indicators for each team
        const teams = Object.keys(this.championshipTeams);

        teams.forEach(teamKey => {
            const teamData = this.dataCache.get(`team_${teamKey}`);
            if (teamData) {
                const momentum = this.calculateMomentumIndicator(teamKey, teamData);
                this.aiContext.momentumIndicators.set(teamKey, momentum);
            }
        });
    }

    calculateMomentumIndicator(teamKey, teamData) {
        // Calculate comprehensive momentum indicator
        const trajectory = teamData.trajectory;
        const recentForm = trajectory.slice(-3); // Last 3 data points
        const trend = this.calculateTrend(recentForm);
        const consistency = this.calculateConsistency(trajectory);
        const character = teamData.character.overall;

        return {
            trend: trend,
            consistency: consistency,
            character: character,
            overall: Math.round((trend * 0.4 + consistency * 0.3 + character * 0.3)),
            direction: trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'stable'
        };
    }

    calculateTrend(recentForm) {
        if (recentForm.length < 2) return 0;

        let trend = 0;
        for (let i = 1; i < recentForm.length; i++) {
            trend += recentForm[i] - recentForm[i - 1];
        }

        return Math.round(trend / (recentForm.length - 1));
    }

    calculateConsistency(trajectory) {
        if (trajectory.length === 0) return 50;

        const average = trajectory.reduce((sum, val) => sum + val, 0) / trajectory.length;
        const variance = trajectory.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / trajectory.length;

        // Convert variance to consistency score (0-100, higher is more consistent)
        return Math.max(0, Math.min(100, 100 - Math.sqrt(variance)));
    }

    generatePredictiveRecommendations() {
        // Generate AI-powered recommendations for each team
        const teams = Object.keys(this.championshipTeams);

        teams.forEach(teamKey => {
            const recommendations = this.generateTeamRecommendations(teamKey);
            this.aiContext[`${teamKey}_recommendations`] = recommendations;
        });
    }

    generateTeamRecommendations(teamKey) {
        const teamData = this.dataCache.get(`team_${teamKey}`);
        const balance = this.aiContext.competitiveBalance.get(teamKey);
        const momentum = this.aiContext.momentumIndicators.get(teamKey);

        if (!teamData || !balance || !momentum) return [];

        const recommendations = [];

        // Performance-based recommendations
        if (balance.weaknesses.length > 0) {
            balance.weaknesses.forEach(weakness => {
                recommendations.push({
                    type: 'performance_improvement',
                    priority: 'high',
                    area: weakness.area,
                    recommendation: `Focus on ${weakness.area} development. Current rating of ${weakness.rating} below team average.`,
                    expectedImpact: this.calculateExpectedImpact(weakness.rating)
                });
            });
        }

        // Momentum-based recommendations
        if (momentum.trend < -5) {
            recommendations.push({
                type: 'momentum_recovery',
                priority: 'urgent',
                recommendation: 'Immediate intervention needed to reverse negative momentum trend.',
                expectedImpact: 'high'
            });
        } else if (momentum.trend > 10) {
            recommendations.push({
                type: 'momentum_sustain',
                priority: 'medium',
                recommendation: 'Maintain current strategies to sustain positive momentum.',
                expectedImpact: 'medium'
            });
        }

        // Season phase recommendations
        const currentPhase = this.aiContext.seasonPhase[this.championshipTeams[teamKey].sport];
        recommendations.push(...this.generatePhaseSpecificRecommendations(teamKey, currentPhase, teamData));

        return recommendations;
    }

    calculateExpectedImpact(currentRating) {
        if (currentRating < 40) return 'very_high';
        if (currentRating < 60) return 'high';
        if (currentRating < 80) return 'medium';
        return 'low';
    }

    generatePhaseSpecificRecommendations(teamKey, phase, teamData) {
        const recommendations = [];
        const sport = this.championshipTeams[teamKey].sport;

        switch (phase) {
            case 'preseason':
                recommendations.push({
                    type: 'preparation',
                    priority: 'medium',
                    recommendation: 'Focus on conditioning and system implementation.',
                    expectedImpact: 'medium'
                });
                break;

            case 'first_half':
            case 'regular_season':
                if (teamData.currentSeason.playoffProb > 70) {
                    recommendations.push({
                        type: 'championship_push',
                        priority: 'high',
                        recommendation: 'Optimize roster for championship run. Consider strategic improvements.',
                        expectedImpact: 'high'
                    });
                }
                break;

            case 'playoffs':
                recommendations.push({
                    type: 'playoff_optimization',
                    priority: 'urgent',
                    recommendation: 'Execute championship-level game plans. Focus on clutch performance.',
                    expectedImpact: 'very_high'
                });
                break;

            case 'offseason':
                recommendations.push({
                    type: 'roster_construction',
                    priority: 'low',
                    recommendation: 'Evaluate roster needs and plan for next season improvements.',
                    expectedImpact: 'long_term'
                });
                break;
        }

        return recommendations;
    }

    updateAIInsights() {
        // Generate fresh AI insights for each team
        const teams = Object.keys(this.championshipTeams);

        teams.forEach(async (teamKey) => {
            const freshInsights = await this.generateFreshAIInsights(teamKey);
            if (freshInsights.length > 0) {
                freshInsights.forEach(insight => {
                    this.addInsightToFeed(teamKey, insight);
                });
            }
        });
    }

    async generateFreshAIInsights(teamKey) {
        const teamData = this.dataCache.get(`team_${teamKey}`);
        const momentum = this.aiContext.momentumIndicators.get(teamKey);
        const balance = this.aiContext.competitiveBalance.get(teamKey);

        if (!teamData || !momentum || !balance) return [];

        const insights = [];

        // Generate momentum insights
        if (momentum.direction === 'positive' && momentum.trend > 8) {
            insights.push({
                type: 'momentum_surge',
                priority: 'high',
                message: `${this.championshipTeams[teamKey].displayName} showing championship momentum with +${momentum.trend} trajectory.`,
                confidence: 0.88
            });
        }

        // Generate balance insights
        if (balance.balance < 60) {
            const topWeakness = balance.weaknesses[0];
            if (topWeakness) {
                insights.push({
                    type: 'balance_concern',
                    priority: 'medium',
                    message: `${this.championshipTeams[teamKey].displayName} showing imbalance in ${topWeakness.area} (${topWeakness.rating}/100).`,
                    confidence: 0.82
                });
            }
        }

        // Generate playoff probability insights
        const playoffChange = this.calculatePlayoffProbabilityChange(teamKey);
        if (Math.abs(playoffChange) > 5) {
            insights.push({
                type: 'playoff_probability',
                priority: playoffChange > 0 ? 'high' : 'medium',
                message: `${this.championshipTeams[teamKey].displayName} playoff probability ${playoffChange > 0 ? 'surged' : 'dropped'} ${Math.abs(playoffChange)}% in recent analysis.`,
                confidence: 0.85
            });
        }

        return insights;
    }

    calculatePlayoffProbabilityChange(teamKey) {
        // Calculate change in playoff probability (mock for now)
        const currentData = this.dataCache.get(`team_${teamKey}`);
        const historicalData = this.dataCache.get(`team_${teamKey}_previous`);

        if (!currentData || !historicalData) {
            return (Math.random() - 0.5) * 10; // Mock change -5 to +5
        }

        return currentData.currentSeason.playoffProb - historicalData.currentSeason.playoffProb;
    }

    async loadTeamFallbackData(teamKey) {
        // Load fallback/mock data when MCP is unavailable
        const fallbackData = {
            teamStats: {
                // Mock team stats based on team
                ...this.generateMockTeamStats(teamKey)
            },
            seasonRecord: {
                wins: Math.floor(Math.random() * 20) + 40,
                losses: Math.floor(Math.random() * 20) + 40,
                winPercentage: 0.450 + Math.random() * 0.200,
                gamesRemaining: Math.floor(Math.random() * 30) + 10
            },
            standings: {
                divisionRank: Math.floor(Math.random() * 4) + 1,
                conferenceRank: Math.floor(Math.random() * 15) + 1
            },
            analytics: {
                powerRanking: Math.floor(Math.random() * 50) + 50,
                strengthOfSchedule: 0.400 + Math.random() * 0.200,
                trendDirection: (Math.random() - 0.5) * 20,
                momentum: (Math.random() - 0.5) * 30
            }
        };

        const processedData = this.processTeamData(teamKey, fallbackData);
        this.dataCache.set(`team_${teamKey}`, processedData);
        this.update3DVisualization(teamKey, processedData);

        console.log(`📊 ${this.championshipTeams[teamKey].displayName} fallback data loaded`);
    }

    generateMockTeamStats(teamKey) {
        const teamConfig = this.championshipTeams[teamKey];

        switch (teamConfig.sport) {
            case 'mlb':
                return {
                    ops: 0.700 + Math.random() * 0.200,
                    era: 3.50 + Math.random() * 1.50,
                    whip: 1.20 + Math.random() * 0.40,
                    fieldingPercentage: 0.980 + Math.random() * 0.020,
                    runsPerGame: 4.0 + Math.random() * 2.0,
                    strikeoutsPerNine: 7.0 + Math.random() * 4.0
                };

            case 'nfl':
                return {
                    pointsPerGame: 18.0 + Math.random() * 16.0,
                    yardsPerGame: 300.0 + Math.random() * 150.0,
                    pointsAllowedPerGame: 18.0 + Math.random() * 16.0,
                    yardsAllowedPerGame: 300.0 + Math.random() * 150.0,
                    turnoverDifferential: Math.floor((Math.random() - 0.5) * 20),
                    redZoneEfficiency: 0.50 + Math.random() * 0.40
                };

            case 'nba':
                return {
                    pointsPerGame: 100.0 + Math.random() * 25.0,
                    fieldGoalPercentage: 0.40 + Math.random() * 0.15,
                    threePointPercentage: 0.30 + Math.random() * 0.15,
                    reboundsPerGame: 38.0 + Math.random() * 12.0,
                    pointsAllowedPerGame: 100.0 + Math.random() * 25.0
                };

            case 'ncaa':
                return {
                    pointsPerGame: 25.0 + Math.random() * 15.0,
                    yardsPerGame: 350.0 + Math.random() * 200.0,
                    pointsAllowedPerGame: 25.0 + Math.random() * 15.0,
                    yardsAllowedPerGame: 350.0 + Math.random() * 200.0,
                    recruitingRank: Math.floor(Math.random() * 50) + 1
                };

            default:
                return {};
        }
    }

    async loadFallbackData() {
        // Load all fallback data when MCP is completely unavailable
        console.log('📊 Loading comprehensive fallback data...');

        for (const teamKey of Object.keys(this.championshipTeams)) {
            await this.loadTeamFallbackData(teamKey);
        }

        // Load fallback recruiting data
        this.dataCache.set('recruiting_intelligence', {
            topProspects: this.generateMockProspects(50),
            regionalStrength: this.generateMockRegionalStrength(),
            competitiveBalance: [],
            trendAnalysis: {},
            lastUpdate: new Date().toISOString()
        });

        // Load fallback NIL data
        this.dataCache.set('nil_market', {
            marketSize: 500000000,
            averageValuation: 25000,
            topTierValuation: 1000000,
            positionValues: this.calculatePositionNILValues({}),
            marketTrends: this.analyzeNILTrends({}),
            regionalFactors: this.calculateNILRegionalFactors(),
            lastUpdate: new Date().toISOString()
        });

        // Load fallback youth baseball data
        this.dataCache.set('youth_baseball', {
            perfectGameProspects: this.generateMockBaseballProspects(100),
            regionalTournaments: {},
            collegeCommitments: this.generateMockCommitments(200),
            professionalSignings: this.generateMockSignings(50),
            developmentTrends: {},
            lastUpdate: new Date().toISOString()
        });

        console.log('✅ Fallback data loading complete');
    }

    generateMockProspects(count) {
        const prospects = [];
        const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB'];

        for (let i = 0; i < count; i++) {
            prospects.push({
                name: `Prospect ${i + 1}`,
                position: positions[Math.floor(Math.random() * positions.length)],
                state: this.regionalScope.states[Math.floor(Math.random() * this.regionalScope.states.length)],
                rating: 70 + Math.random() * 25,
                stars: Math.floor(Math.random() * 3) + 3, // 3-5 stars
                height: `6'${Math.floor(Math.random() * 6)}`,
                weight: 180 + Math.random() * 100,
                commitmentStatus: Math.random() > 0.7 ? 'committed' : 'uncommitted'
            });
        }

        return prospects;
    }

    generateMockRegionalStrength() {
        const regional = {};

        this.regionalScope.states.forEach(state => {
            regional[state] = {
                prospectCount: Math.floor(Math.random() * 20) + 5,
                averageRating: 75 + Math.random() * 15,
                topPosition: ['QB', 'RB', 'WR', 'OL', 'DL'][Math.floor(Math.random() * 5)]
            };
        });

        return regional;
    }

    generateMockBaseballProspects(count) {
        const prospects = [];
        const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'OF'];

        for (let i = 0; i < count; i++) {
            prospects.push({
                name: `Baseball Prospect ${i + 1}`,
                position: positions[Math.floor(Math.random() * positions.length)],
                state: this.regionalScope.states[Math.floor(Math.random() * this.regionalScope.states.length)],
                battingAverage: 0.250 + Math.random() * 0.200,
                era: positions[0] === 'P' ? 2.00 + Math.random() * 3.00 : null,
                velocity: positions[0] === 'P' ? 75 + Math.random() * 20 : null,
                exitVelocity: positions[0] !== 'P' ? 75 + Math.random() * 25 : null,
                graduation: 2025
            });
        }

        return prospects;
    }

    generateMockCommitments(count) {
        const commitments = [];
        const conferences = ['SEC', 'Big 12', 'ACC', 'Big Ten', 'Pac-12'];

        for (let i = 0; i < count; i++) {
            commitments.push({
                playerName: `Player ${i + 1}`,
                playerState: this.regionalScope.states[Math.floor(Math.random() * this.regionalScope.states.length)],
                school: `University ${i + 1}`,
                conference: conferences[Math.floor(Math.random() * conferences.length)],
                position: ['QB', 'RB', 'WR', 'OL', 'DL'][Math.floor(Math.random() * 5)],
                rating: 70 + Math.random() * 25,
                commitmentDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
            });
        }

        return commitments;
    }

    generateMockSignings(count) {
        const signings = [];

        for (let i = 0; i < count; i++) {
            const round = Math.floor(Math.random() * 40) + 1;
            signings.push({
                playerName: `Signee ${i + 1}`,
                round: round <= 40 ? round : 'Undrafted',
                team: `Team ${Math.floor(Math.random() * 30) + 1}`,
                bonus: round <= 10 ? Math.floor(Math.random() * 2000000) + 100000 : Math.floor(Math.random() * 50000),
                position: ['P', 'C', 'IF', 'OF'][Math.floor(Math.random() * 4)],
                professionalLevel: ['Rookie', 'A', 'A+', 'AA', 'AAA'][Math.floor(Math.random() * 5)]
            });
        }

        return signings;
    }

    // Public API Methods
    getTeamData(teamKey) {
        return this.dataCache.get(`team_${teamKey}`);
    }

    getAllTeamData() {
        const allTeamData = {};
        Object.keys(this.championshipTeams).forEach(teamKey => {
            allTeamData[teamKey] = this.getTeamData(teamKey);
        });
        return allTeamData;
    }

    getRecruitingData() {
        return this.dataCache.get('recruiting_intelligence');
    }

    getNILMarketData() {
        return this.dataCache.get('nil_market');
    }

    getYouthBaseballData() {
        return this.dataCache.get('youth_baseball');
    }

    getAIContext() {
        return this.aiContext;
    }

    async forceRefresh(teamKey = null) {
        if (teamKey) {
            await this.refreshTeamData(teamKey);
        } else {
            // Refresh all teams
            for (const team of Object.keys(this.championshipTeams)) {
                await this.refreshTeamData(team);
            }
        }
    }

    destroy() {
        // Clean up intervals and connections
        this.updateIntervals.forEach((intervalId, teamKey) => {
            clearInterval(intervalId);
        });
        this.updateIntervals.clear();

        if (this.webSocketConnection) {
            this.webSocketConnection.close();
        }

        this.dataCache.clear();
        console.log('🔄 Blaze Sports Data Integration destroyed');
    }
}

// Global API
window.BlazeIntelligenceData = {
    integration: null,

    async initialize() {
        if (!this.integration) {
            this.integration = new BlazeSportsDataIntegration();
            await this.integration.initialize();
            console.log('🏆 Blaze Intelligence Data Integration Active');
        }
        return this.integration;
    },

    getTeamData(teamKey) {
        return this.integration?.getTeamData(teamKey);
    },

    getAllData() {
        return this.integration?.getAllTeamData();
    },

    async refresh(teamKey = null) {
        if (this.integration) {
            await this.integration.forceRefresh(teamKey);
        }
    },

    getAIInsights() {
        return this.integration?.getAIContext();
    },

    destroy() {
        if (this.integration) {
            this.integration.destroy();
            this.integration = null;
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BlazeIntelligenceData.initialize();
    });
} else {
    window.BlazeIntelligenceData.initialize();
}

console.log('🚀 BLAZE INTELLIGENCE SPORTS DATA INTEGRATION LOADED - Deep South Championship Analytics Ready');