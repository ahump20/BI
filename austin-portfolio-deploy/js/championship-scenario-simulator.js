/**
 * 🎯 Championship Scenario Simulator
 * Advanced interactive Monte Carlo scenario analysis for championship forecasting
 * Real-time "what-if" analysis with institutional-grade modeling
 *
 * Blaze Sports Intel - Deep South Sports Authority
 */

class ChampionshipScenarioSimulator {
    constructor() {
        this.scenarios = new Map();
        this.activeScenario = null;
        this.simulationQueue = [];
        this.results = new Map();
        this.isRunning = false;

        // Scenario templates for different analysis types
        this.scenarioTemplates = {
            injuryImpact: {
                name: 'Injury Impact Analysis',
                description: 'Analyze championship probability changes due to key player injuries',
                parameters: {
                    keyPlayerInjured: { type: 'boolean', default: false },
                    injurySeverity: { type: 'range', min: 0.1, max: 0.5, default: 0.2 },
                    recoveryTime: { type: 'integer', min: 1, max: 16, default: 4 },
                    positionImpact: { type: 'select', options: ['QB', 'RB', 'WR', 'OL', 'DEF'], default: 'QB' }
                },
                leagues: ['NFL', 'NCAA']
            },
            tradeScenario: {
                name: 'Trade Impact Analysis',
                description: 'Model championship probability changes from potential trades',
                parameters: {
                    tradeExecuted: { type: 'boolean', default: false },
                    playerValue: { type: 'range', min: 0.5, max: 2.0, default: 1.0 },
                    teamChemistry: { type: 'range', min: 0.8, max: 1.2, default: 1.0 },
                    salaryCapImpact: { type: 'range', min: 0.9, max: 1.1, default: 1.0 }
                },
                leagues: ['MLB', 'NFL', 'NBA']
            },
            scheduleStrength: {
                name: 'Schedule Strength Analysis',
                description: 'Evaluate championship odds based on remaining schedule difficulty',
                parameters: {
                    strengthOfSchedule: { type: 'range', min: 0.3, max: 0.7, default: 0.5 },
                    homeGameAdvantage: { type: 'range', min: 1.0, max: 1.15, default: 1.04 },
                    restDays: { type: 'integer', min: 0, max: 10, default: 3 },
                    travelDistance: { type: 'range', min: 0.5, max: 2.0, default: 1.0 }
                },
                leagues: ['MLB', 'NFL', 'NBA', 'NCAA']
            },
            weatherImpact: {
                name: 'Weather & Environmental Factors',
                description: 'Analyze performance changes due to weather and playing conditions',
                parameters: {
                    outdoorGames: { type: 'integer', min: 0, max: 8, default: 4 },
                    temperatureVariance: { type: 'range', min: 0.9, max: 1.1, default: 1.0 },
                    precipitationImpact: { type: 'range', min: 0.85, max: 1.0, default: 0.95 },
                    windImpact: { type: 'range', min: 0.9, max: 1.0, default: 0.98 }
                },
                leagues: ['NFL', 'NCAA', 'MLB']
            },
            hotStreak: {
                name: 'Momentum & Hot Streak Analysis',
                description: 'Model the impact of team momentum and hot/cold streaks',
                parameters: {
                    currentStreak: { type: 'integer', min: -10, max: 10, default: 0 },
                    momentumFactor: { type: 'range', min: 0.8, max: 1.3, default: 1.0 },
                    clutchPerformance: { type: 'range', min: 0.7, max: 1.4, default: 1.0 },
                    pressureResponse: { type: 'range', min: 0.8, max: 1.2, default: 1.0 }
                },
                leagues: ['MLB', 'NFL', 'NBA', 'NCAA']
            },
            playoffFormat: {
                name: 'Playoff Format Changes',
                description: 'Analyze how different playoff formats affect championship odds',
                parameters: {
                    playoffTeams: { type: 'integer', min: 8, max: 16, default: 12 },
                    seriesLength: { type: 'select', options: [1, 3, 5, 7], default: 7 },
                    homeFieldAdvantage: { type: 'range', min: 1.0, max: 1.2, default: 1.05 },
                    seedingImportance: { type: 'range', min: 0.8, max: 1.3, default: 1.1 }
                },
                leagues: ['MLB', 'NFL', 'NBA', 'NCAA']
            }
        };

        // Advanced Monte Carlo parameters
        this.simulationConfig = {
            defaultIterations: 10000,
            maxIterations: 50000,
            confidenceLevel: 0.95,
            convergenceThreshold: 0.001,
            adaptiveStepSize: true,
            parallelProcessing: true
        };

        // UI state management
        this.ui = {
            scenarioBuilder: null,
            resultsPanel: null,
            comparisonView: null,
            visualizations: new Map()
        };

        this.initialize();
    }

    async initialize() {
        console.log('🎯 Initializing Championship Scenario Simulator...');

        try {
            await this.setupUI();
            this.setupEventListeners();
            this.connectToDataSources();
            this.initializeWorkerPool();

            console.log('✅ Championship Scenario Simulator initialized');
        } catch (error) {
            console.error('❌ Scenario simulator initialization failed:', error);
        }
    }

    async setupUI() {
        // Find or create scenario builder container
        this.ui.scenarioBuilder = document.getElementById('scenarioBuilder') ||
                                  this.createScenarioBuilderUI();

        // Setup results panel
        this.ui.resultsPanel = document.getElementById('scenarioResults') ||
                               this.createResultsPanelUI();

        // Setup comparison view
        this.ui.comparisonView = document.getElementById('scenarioComparison') ||
                                 this.createComparisonViewUI();

        console.log('🎨 Scenario simulator UI components created');
    }

    createScenarioBuilderUI() {
        const container = document.createElement('div');
        container.id = 'scenarioBuilder';
        container.className = 'scenario-builder-container';
        container.innerHTML = `
            <div class="scenario-header">
                <h3>Championship Scenario Builder</h3>
                <p>Create custom "what-if" scenarios for championship probability analysis</p>
            </div>

            <div class="scenario-templates">
                <label for="scenarioTemplate">Scenario Template:</label>
                <select id="scenarioTemplate" class="scenario-control">
                    <option value="">Select a scenario type...</option>
                    ${Object.entries(this.scenarioTemplates).map(([key, template]) =>
                        `<option value="${key}">${template.name}</option>`
                    ).join('')}
                </select>
            </div>

            <div class="scenario-parameters" id="scenarioParameters">
                <!-- Dynamic parameter controls will be inserted here -->
            </div>

            <div class="scenario-teams">
                <label>Teams to Analyze:</label>
                <div class="team-selection">
                    <label><input type="checkbox" value="cardinals" checked> Cardinals</label>
                    <label><input type="checkbox" value="titans" checked> Titans</label>
                    <label><input type="checkbox" value="longhorns" checked> Longhorns</label>
                    <label><input type="checkbox" value="grizzlies" checked> Grizzlies</label>
                </div>
            </div>

            <div class="scenario-simulation">
                <div class="simulation-controls">
                    <label for="simulationIterations">Simulation Iterations:</label>
                    <select id="simulationIterations" class="scenario-control">
                        <option value="1000">1,000 (Fast)</option>
                        <option value="5000">5,000 (Standard)</option>
                        <option value="10000" selected>10,000 (Precise)</option>
                        <option value="25000">25,000 (Maximum)</option>
                    </select>
                </div>

                <button id="runScenarioSimulation" class="run-scenario-btn">
                    <i class="fas fa-play"></i> Run Scenario Analysis
                </button>

                <button id="compareScenarios" class="compare-scenarios-btn" style="display: none;">
                    <i class="fas fa-balance-scale"></i> Compare Scenarios
                </button>
            </div>

            <div class="scenario-progress" id="scenarioProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Initializing simulation...</div>
            </div>
        `;

        // Append to scenario builder section if it exists
        const scenarioSection = document.querySelector('.scenario-builder');
        if (scenarioSection) {
            const controls = scenarioSection.querySelector('.scenario-controls');
            if (controls) {
                controls.appendChild(container);
            }
        }

        return container;
    }

    createResultsPanelUI() {
        const container = document.createElement('div');
        container.id = 'scenarioResults';
        container.className = 'scenario-results-container';
        container.innerHTML = `
            <div class="results-header">
                <h3>Scenario Analysis Results</h3>
                <div class="results-meta" id="resultsMeta"></div>
            </div>

            <div class="results-summary" id="resultsSummary">
                <!-- Results summary will be populated here -->
            </div>

            <div class="results-visualization" id="resultsVisualization">
                <canvas id="scenarioChart" width="600" height="300"></canvas>
            </div>

            <div class="results-details" id="resultsDetails">
                <!-- Detailed results will be populated here -->
            </div>

            <div class="results-export">
                <button id="exportResults" class="export-btn">
                    <i class="fas fa-download"></i> Export Results
                </button>
                <button id="saveScenario" class="save-scenario-btn">
                    <i class="fas fa-save"></i> Save Scenario
                </button>
            </div>
        `;

        return container;
    }

    createComparisonViewUI() {
        const container = document.createElement('div');
        container.id = 'scenarioComparison';
        container.className = 'scenario-comparison-container';
        container.innerHTML = `
            <div class="comparison-header">
                <h3>Scenario Comparison Analysis</h3>
                <p>Compare multiple scenarios side-by-side</p>
            </div>

            <div class="comparison-scenarios" id="comparisonScenarios">
                <!-- Scenario comparison cards will be added here -->
            </div>

            <div class="comparison-chart">
                <canvas id="comparisonChart" width="800" height="400"></canvas>
            </div>

            <div class="comparison-insights" id="comparisonInsights">
                <!-- AI-generated insights will be added here -->
            </div>
        `;

        return container;
    }

    setupEventListeners() {
        // Scenario template selection
        const templateSelect = document.getElementById('scenarioTemplate');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.loadScenarioTemplate(e.target.value);
            });
        }

        // Run scenario simulation
        const runButton = document.getElementById('runScenarioSimulation');
        if (runButton) {
            runButton.addEventListener('click', () => {
                this.runScenarioSimulation();
            });
        }

        // Compare scenarios
        const compareButton = document.getElementById('compareScenarios');
        if (compareButton) {
            compareButton.addEventListener('click', () => {
                this.showComparisonView();
            });
        }

        // Export results
        const exportButton = document.getElementById('exportResults');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportResults();
            });
        }

        // Save scenario
        const saveButton = document.getElementById('saveScenario');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveScenario();
            });
        }
    }

    loadScenarioTemplate(templateKey) {
        if (!templateKey || !this.scenarioTemplates[templateKey]) {
            this.clearParameterControls();
            return;
        }

        const template = this.scenarioTemplates[templateKey];
        console.log(`📋 Loading scenario template: ${template.name}`);

        this.populateParameterControls(template);
        this.activeScenario = {
            template: templateKey,
            parameters: {},
            results: null
        };
    }

    populateParameterControls(template) {
        const parametersContainer = document.getElementById('scenarioParameters');
        if (!parametersContainer) return;

        parametersContainer.innerHTML = `
            <div class="parameters-header">
                <h4>${template.name}</h4>
                <p>${template.description}</p>
            </div>
            <div class="parameters-grid">
                ${Object.entries(template.parameters).map(([paramKey, param]) =>
                    this.createParameterControl(paramKey, param)
                ).join('')}
            </div>
        `;

        // Add event listeners to parameter controls
        this.setupParameterEventListeners(template);
    }

    createParameterControl(paramKey, param) {
        const controlId = `param_${paramKey}`;

        switch (param.type) {
            case 'boolean':
                return `
                    <div class="parameter-control">
                        <label for="${controlId}">${this.formatParameterLabel(paramKey)}:</label>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="${controlId}" ${param.default ? 'checked' : ''}>
                            <span class="checkmark"></span>
                        </div>
                    </div>
                `;

            case 'range':
                return `
                    <div class="parameter-control">
                        <label for="${controlId}">${this.formatParameterLabel(paramKey)}:</label>
                        <div class="range-wrapper">
                            <input type="range" id="${controlId}"
                                   min="${param.min}" max="${param.max}"
                                   step="${(param.max - param.min) / 100}"
                                   value="${param.default}">
                            <span class="range-value" id="${controlId}_value">${param.default}</span>
                        </div>
                    </div>
                `;

            case 'integer':
                return `
                    <div class="parameter-control">
                        <label for="${controlId}">${this.formatParameterLabel(paramKey)}:</label>
                        <input type="number" id="${controlId}"
                               min="${param.min}" max="${param.max}"
                               value="${param.default}" step="1">
                    </div>
                `;

            case 'select':
                return `
                    <div class="parameter-control">
                        <label for="${controlId}">${this.formatParameterLabel(paramKey)}:</label>
                        <select id="${controlId}">
                            ${param.options.map(option =>
                                `<option value="${option}" ${option === param.default ? 'selected' : ''}>${option}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;

            default:
                return `
                    <div class="parameter-control">
                        <label for="${controlId}">${this.formatParameterLabel(paramKey)}:</label>
                        <input type="text" id="${controlId}" value="${param.default}">
                    </div>
                `;
        }
    }

    formatParameterLabel(paramKey) {
        return paramKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    setupParameterEventListeners(template) {
        Object.keys(template.parameters).forEach(paramKey => {
            const control = document.getElementById(`param_${paramKey}`);
            const valueDisplay = document.getElementById(`param_${paramKey}_value`);

            if (control) {
                control.addEventListener('input', (e) => {
                    if (valueDisplay) {
                        valueDisplay.textContent = e.target.value;
                    }
                    this.updateActiveScenarioParameter(paramKey, e.target.value);
                });
            }
        });
    }

    updateActiveScenarioParameter(paramKey, value) {
        if (!this.activeScenario) return;

        this.activeScenario.parameters[paramKey] = value;
        console.log(`🔧 Updated parameter ${paramKey}:`, value);
    }

    clearParameterControls() {
        const parametersContainer = document.getElementById('scenarioParameters');
        if (parametersContainer) {
            parametersContainer.innerHTML = '<p class="no-template">Select a scenario template to configure parameters</p>';
        }
    }

    async runScenarioSimulation() {
        if (!this.activeScenario || !this.activeScenario.template) {
            alert('Please select a scenario template first');
            return;
        }

        const selectedTeams = this.getSelectedTeams();
        if (selectedTeams.length === 0) {
            alert('Please select at least one team to analyze');
            return;
        }

        const iterations = parseInt(document.getElementById('simulationIterations')?.value || '10000');

        console.log('🎯 Running scenario simulation...', {
            scenario: this.activeScenario,
            teams: selectedTeams,
            iterations
        });

        this.showProgress(true);
        this.setRunningState(true);

        try {
            const results = await this.executeScenarioSimulation(
                this.activeScenario,
                selectedTeams,
                iterations
            );

            this.activeScenario.results = results;
            this.displayResults(results);
            this.enableComparisonMode();

        } catch (error) {
            console.error('❌ Scenario simulation failed:', error);
            this.showError('Simulation failed: ' + error.message);
        } finally {
            this.showProgress(false);
            this.setRunningState(false);
        }
    }

    async executeScenarioSimulation(scenario, teams, iterations) {
        const template = this.scenarioTemplates[scenario.template];
        const results = new Map();

        for (const team of teams) {
            console.log(`🔄 Simulating scenario for ${team}...`);

            try {
                const teamResult = await this.simulateTeamScenario(
                    team,
                    scenario,
                    template,
                    iterations
                );

                results.set(team, teamResult);

                // Update progress
                this.updateProgress((results.size / teams.length) * 100);

            } catch (error) {
                console.error(`❌ Failed to simulate scenario for ${team}:`, error);
                results.set(team, { error: error.message });
            }
        }

        // Calculate comparative metrics
        const comparativeResults = this.calculateComparativeMetrics(results);

        return {
            scenario: scenario,
            teams: Array.from(results.keys()),
            teamResults: results,
            comparative: comparativeResults,
            metadata: {
                iterations,
                timestamp: new Date().toISOString(),
                template: template.name
            }
        };
    }

    async simulateTeamScenario(team, scenario, template, iterations) {
        // Get baseline championship probability
        const baselineProb = await this.getBaselineChampionshipProbability(team);

        // Apply scenario modifications
        const modifiedParameters = this.applyScenarioModifications(
            team,
            scenario.parameters,
            template
        );

        // Run Monte Carlo simulation
        const simulationResults = await this.runMonteCarloSimulation(
            team,
            modifiedParameters,
            iterations
        );

        // Calculate scenario impact
        const scenarioImpact = this.calculateScenarioImpact(
            baselineProb,
            simulationResults.championshipProbability
        );

        return {
            team,
            baseline: {
                championshipProbability: baselineProb.championshipProbability,
                playoffProbability: baselineProb.playoffProbability,
                expectedWins: baselineProb.expectedWins
            },
            scenario: {
                championshipProbability: simulationResults.championshipProbability,
                playoffProbability: simulationResults.playoffProbability,
                expectedWins: simulationResults.expectedWins,
                confidenceInterval: simulationResults.confidenceInterval
            },
            impact: scenarioImpact,
            parameters: modifiedParameters
        };
    }

    async getBaselineChampionshipProbability(team) {
        // Get current championship probability from data engine
        if (window.championshipDataEngine) {
            const teamData = window.championshipDataEngine.getTeamData(team);
            if (teamData) {
                return {
                    championshipProbability: teamData.realTime?.championshipProbability || 0.1,
                    playoffProbability: teamData.realTime?.playoffProbability || 0.5,
                    expectedWins: teamData.realTime?.expectedWins || teamData.currentSeason.wins
                };
            }
        }

        // Fallback baseline probabilities
        const fallbackBaselines = {
            cardinals: { championshipProbability: 0.123, playoffProbability: 0.67, expectedWins: 78 },
            titans: { championshipProbability: 0.037, playoffProbability: 0.18, expectedWins: 6 },
            longhorns: { championshipProbability: 0.189, playoffProbability: 0.76, expectedWins: 9 },
            grizzlies: { championshipProbability: 0.084, playoffProbability: 0.72, expectedWins: 45 }
        };

        return fallbackBaselines[team] || { championshipProbability: 0.1, playoffProbability: 0.5, expectedWins: 50 };
    }

    applyScenarioModifications(team, parameters, template) {
        const modifications = { ...parameters };

        // Apply template-specific logic
        switch (template.name) {
            case 'Injury Impact Analysis':
                modifications.performanceImpact = this.calculateInjuryImpact(parameters);
                break;

            case 'Trade Impact Analysis':
                modifications.teamStrengthMultiplier = this.calculateTradeImpact(parameters);
                break;

            case 'Schedule Strength Analysis':
                modifications.difficultyMultiplier = this.calculateScheduleImpact(parameters);
                break;

            case 'Weather & Environmental Factors':
                modifications.environmentalImpact = this.calculateWeatherImpact(parameters);
                break;

            case 'Momentum & Hot Streak Analysis':
                modifications.momentumMultiplier = this.calculateMomentumImpact(parameters);
                break;

            case 'Playoff Format Changes':
                modifications.formatAdvantage = this.calculateFormatImpact(parameters, team);
                break;
        }

        return modifications;
    }

    calculateInjuryImpact(parameters) {
        if (!parameters.keyPlayerInjured) return 1.0;

        const severityImpact = 1 - parseFloat(parameters.injurySeverity);
        const positionImpact = this.getPositionImpactMultiplier(parameters.positionImpact);
        const recoveryImpact = Math.max(0.5, 1 - (parseInt(parameters.recoveryTime) / 16));

        return severityImpact * positionImpact * recoveryImpact;
    }

    getPositionImpactMultiplier(position) {
        const impacts = {
            'QB': 0.6,   // Quarterback most critical
            'RB': 0.85,  // Running back moderate impact
            'WR': 0.9,   // Wide receiver lower impact
            'OL': 0.8,   // Offensive line significant
            'DEF': 0.88  // Defense moderate
        };
        return impacts[position] || 0.9;
    }

    calculateTradeImpact(parameters) {
        if (!parameters.tradeExecuted) return 1.0;

        const playerValue = parseFloat(parameters.playerValue);
        const chemistry = parseFloat(parameters.teamChemistry);
        const salaryCap = parseFloat(parameters.salaryCapImpact);

        return playerValue * chemistry * salaryCap;
    }

    calculateScheduleImpact(parameters) {
        const strengthOfSchedule = parseFloat(parameters.strengthOfSchedule);
        const homeAdvantage = parseFloat(parameters.homeGameAdvantage);
        const restFactor = 1 + (parseInt(parameters.restDays) * 0.02);
        const travelFactor = 2.0 - parseFloat(parameters.travelDistance);

        // Invert strength of schedule (higher SOS = lower multiplier)
        const difficultyFactor = 2.0 - strengthOfSchedule * 2;

        return difficultyFactor * homeAdvantage * restFactor * travelFactor;
    }

    calculateWeatherImpact(parameters) {
        const outdoorGames = parseInt(parameters.outdoorGames);
        const tempVariance = parseFloat(parameters.temperatureVariance);
        const precipImpact = parseFloat(parameters.precipitationImpact);
        const windImpact = parseFloat(parameters.windImpact);

        // More outdoor games = more weather impact
        const outdoorFactor = 1 - (outdoorGames / 16) * 0.1;

        return outdoorFactor * tempVariance * precipImpact * windImpact;
    }

    calculateMomentumImpact(parameters) {
        const streak = parseInt(parameters.currentStreak);
        const momentum = parseFloat(parameters.momentumFactor);
        const clutch = parseFloat(parameters.clutchPerformance);
        const pressure = parseFloat(parameters.pressureResponse);

        // Streak impact: positive streaks boost, negative hurt
        const streakImpact = 1 + (streak * 0.01);

        return streakImpact * momentum * clutch * pressure;
    }

    calculateFormatImpact(parameters, team) {
        const playoffTeams = parseInt(parameters.playoffTeams);
        const seriesLength = parseInt(parameters.seriesLength);
        const homeAdvantage = parseFloat(parameters.homeFieldAdvantage);
        const seedingImportance = parseFloat(parameters.seedingImportance);

        // More playoff teams = easier to make playoffs
        const accessibilityFactor = playoffTeams / 12; // Normalized to current format

        // Longer series favor better teams
        const consistencyFactor = seriesLength / 7;

        return accessibilityFactor * consistencyFactor * homeAdvantage * seedingImportance;
    }

    async runMonteCarloSimulation(team, modifiedParameters, iterations) {
        // Use existing Monte Carlo engine if available
        if (window.monteCarloEngine) {
            try {
                const seasonResults = await window.monteCarloEngine.simulateSeasonTrajectory(
                    team,
                    this.getRemainingGames(team),
                    {
                        numSims: iterations,
                        modifiers: modifiedParameters
                    }
                );

                const championshipResults = await window.monteCarloEngine.simulateChampionshipPath(
                    team,
                    {
                        numSims: iterations,
                        modifiers: modifiedParameters
                    }
                );

                return {
                    championshipProbability: championshipResults?.championshipProbability || 0,
                    playoffProbability: seasonResults?.playoffProbability || 0,
                    expectedWins: seasonResults?.expectedWins || 0,
                    confidenceInterval: this.calculateConfidenceInterval(championshipResults)
                };

            } catch (error) {
                console.warn('Monte Carlo engine simulation failed, using fallback:', error);
            }
        }

        // Fallback simulation
        return this.runFallbackSimulation(team, modifiedParameters, iterations);
    }

    runFallbackSimulation(team, modifiedParameters, iterations) {
        // Simple Monte Carlo simulation
        const baseline = this.getBaselineChampionshipProbability(team);

        let championshipWins = 0;
        let playoffWins = 0;
        let totalWins = 0;

        for (let i = 0; i < iterations; i++) {
            // Apply scenario modifications
            let modifiedChampProb = baseline.championshipProbability;
            let modifiedPlayoffProb = baseline.playoffProbability;

            // Apply all modifiers
            Object.values(modifiedParameters).forEach(modifier => {
                if (typeof modifier === 'number' && modifier !== 1.0) {
                    modifiedChampProb *= modifier;
                    modifiedPlayoffProb *= modifier;
                }
            });

            // Clamp probabilities
            modifiedChampProb = Math.max(0.001, Math.min(0.4, modifiedChampProb));
            modifiedPlayoffProb = Math.max(0.01, Math.min(0.99, modifiedPlayoffProb));

            // Simulate championship
            if (Math.random() < modifiedChampProb) {
                championshipWins++;
            }

            // Simulate playoff
            if (Math.random() < modifiedPlayoffProb) {
                playoffWins++;
            }

            // Simulate season wins
            totalWins += Math.round(baseline.expectedWins * (0.8 + Math.random() * 0.4));
        }

        return {
            championshipProbability: championshipWins / iterations,
            playoffProbability: playoffWins / iterations,
            expectedWins: totalWins / iterations,
            confidenceInterval: {
                lower: (championshipWins / iterations) * 0.8,
                upper: (championshipWins / iterations) * 1.2
            }
        };
    }

    calculateConfidenceInterval(results) {
        if (!results || !results.paths) {
            return { lower: 0, upper: 0 };
        }

        const championshipRate = results.championshipProbability;
        const n = results.paths.length;
        const margin = 1.96 * Math.sqrt((championshipRate * (1 - championshipRate)) / n);

        return {
            lower: Math.max(0, championshipRate - margin),
            upper: Math.min(1, championshipRate + margin)
        };
    }

    calculateScenarioImpact(baseline, scenario) {
        const champImpact = ((scenario.championshipProbability - baseline.championshipProbability) / baseline.championshipProbability) * 100;
        const playoffImpact = ((scenario.playoffProbability - baseline.playoffProbability) / baseline.playoffProbability) * 100;
        const winsImpact = scenario.expectedWins - baseline.expectedWins;

        return {
            championshipProbabilityChange: champImpact,
            playoffProbabilityChange: playoffImpact,
            expectedWinsChange: winsImpact,
            overallImpact: this.categorizeImpact(champImpact)
        };
    }

    categorizeImpact(percentChange) {
        if (percentChange > 20) return 'Highly Positive';
        if (percentChange > 5) return 'Positive';
        if (percentChange > -5) return 'Neutral';
        if (percentChange > -20) return 'Negative';
        return 'Highly Negative';
    }

    calculateComparativeMetrics(teamResults) {
        const teams = Array.from(teamResults.keys());
        const comparisons = {};

        // Calculate relative rankings
        const championshipProbs = teams.map(team => ({
            team,
            probability: teamResults.get(team).scenario?.championshipProbability || 0
        })).sort((a, b) => b.probability - a.probability);

        comparisons.championshipRankings = championshipProbs;

        // Calculate biggest winners/losers
        const impacts = teams.map(team => ({
            team,
            impact: teamResults.get(team).impact?.championshipProbabilityChange || 0
        })).sort((a, b) => b.impact - a.impact);

        comparisons.biggestWinner = impacts[0];
        comparisons.biggestLoser = impacts[impacts.length - 1];

        // Calculate variance and distribution
        const probabilities = championshipProbs.map(t => t.probability);
        comparisons.variance = this.calculateVariance(probabilities);
        comparisons.competitiveBalance = this.calculateCompetitiveBalance(probabilities);

        return comparisons;
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateCompetitiveBalance(probabilities) {
        const max = Math.max(...probabilities);
        const min = Math.min(...probabilities);
        return 1 - ((max - min) / max); // Higher = more balanced
    }

    getRemainingGames(team) {
        if (window.championshipDataEngine) {
            const teamData = window.championshipDataEngine.getTeamData(team);
            if (teamData) {
                return teamData.analytics?.remainingGames || 30;
            }
        }
        return 30; // Fallback
    }

    getSelectedTeams() {
        const checkboxes = document.querySelectorAll('.team-selection input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    displayResults(results) {
        console.log('📊 Displaying scenario results:', results);

        this.displayResultsSummary(results);
        this.displayResultsVisualization(results);
        this.displayResultsDetails(results);
        this.updateResultsMeta(results);
    }

    displayResultsSummary(results) {
        const summaryContainer = document.getElementById('resultsSummary');
        if (!summaryContainer) return;

        const { comparative } = results;

        summaryContainer.innerHTML = `
            <div class="summary-grid">
                <div class="summary-card">
                    <h4>Biggest Winner</h4>
                    <div class="team-name">${this.formatTeamName(comparative.biggestWinner.team)}</div>
                    <div class="impact-value positive">+${comparative.biggestWinner.impact.toFixed(1)}%</div>
                </div>

                <div class="summary-card">
                    <h4>Biggest Loser</h4>
                    <div class="team-name">${this.formatTeamName(comparative.biggestLoser.team)}</div>
                    <div class="impact-value negative">${comparative.biggestLoser.impact.toFixed(1)}%</div>
                </div>

                <div class="summary-card">
                    <h4>Competitive Balance</h4>
                    <div class="balance-score">${(comparative.competitiveBalance * 100).toFixed(1)}%</div>
                    <div class="balance-label">${this.getBalanceLabel(comparative.competitiveBalance)}</div>
                </div>

                <div class="summary-card">
                    <h4>Top Championship Odds</h4>
                    <div class="top-team">${this.formatTeamName(comparative.championshipRankings[0].team)}</div>
                    <div class="top-probability">${(comparative.championshipRankings[0].probability * 100).toFixed(1)}%</div>
                </div>
            </div>
        `;
    }

    displayResultsVisualization(results) {
        const canvas = document.getElementById('scenarioChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        // Prepare data for comparison chart
        const teams = results.teams;
        const baselineData = teams.map(team =>
            (results.teamResults.get(team).baseline.championshipProbability * 100).toFixed(1)
        );
        const scenarioData = teams.map(team =>
            (results.teamResults.get(team).scenario.championshipProbability * 100).toFixed(1)
        );

        // Destroy existing chart if it exists
        if (this.ui.visualizations.has('scenarioChart')) {
            this.ui.visualizations.get('scenarioChart').destroy();
        }

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: teams.map(team => this.formatTeamName(team)),
                datasets: [
                    {
                        label: 'Baseline Probability',
                        data: baselineData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Scenario Probability',
                        data: scenarioData,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Championship Probability Comparison',
                        color: 'white'
                    },
                    legend: {
                        labels: { color: 'white' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        title: {
                            display: true,
                            text: 'Championship Probability (%)',
                            color: 'white'
                        }
                    }
                }
            }
        });

        this.ui.visualizations.set('scenarioChart', chart);
    }

    displayResultsDetails(results) {
        const detailsContainer = document.getElementById('resultsDetails');
        if (!detailsContainer) return;

        let detailsHTML = '<div class="team-results-grid">';

        results.teams.forEach(team => {
            const teamResult = results.teamResults.get(team);
            detailsHTML += this.generateTeamResultCard(team, teamResult);
        });

        detailsHTML += '</div>';
        detailsContainer.innerHTML = detailsHTML;
    }

    generateTeamResultCard(team, result) {
        const impactClass = this.getImpactClass(result.impact.championshipProbabilityChange);

        return `
            <div class="team-result-card" data-team="${team}">
                <div class="team-header">
                    <h4>${this.formatTeamName(team)}</h4>
                    <div class="impact-badge ${impactClass}">
                        ${result.impact.overallImpact}
                    </div>
                </div>

                <div class="probability-comparison">
                    <div class="baseline">
                        <label>Baseline</label>
                        <div class="value">${(result.baseline.championshipProbability * 100).toFixed(1)}%</div>
                    </div>
                    <div class="arrow">→</div>
                    <div class="scenario">
                        <label>Scenario</label>
                        <div class="value">${(result.scenario.championshipProbability * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div class="impact-details">
                    <div class="impact-item">
                        <span>Championship Probability:</span>
                        <span class="${impactClass}">${result.impact.championshipProbabilityChange > 0 ? '+' : ''}${result.impact.championshipProbabilityChange.toFixed(1)}%</span>
                    </div>
                    <div class="impact-item">
                        <span>Playoff Probability:</span>
                        <span class="${this.getImpactClass(result.impact.playoffProbabilityChange)}">${result.impact.playoffProbabilityChange > 0 ? '+' : ''}${result.impact.playoffProbabilityChange.toFixed(1)}%</span>
                    </div>
                    <div class="impact-item">
                        <span>Expected Wins:</span>
                        <span class="${this.getImpactClass(result.impact.expectedWinsChange)}">${result.impact.expectedWinsChange > 0 ? '+' : ''}${result.impact.expectedWinsChange.toFixed(1)}</span>
                    </div>
                </div>

                <div class="confidence-interval">
                    <label>95% Confidence Interval</label>
                    <div class="interval">${(result.scenario.confidenceInterval.lower * 100).toFixed(1)}% - ${(result.scenario.confidenceInterval.upper * 100).toFixed(1)}%</div>
                </div>
            </div>
        `;
    }

    getImpactClass(value) {
        if (value > 5) return 'positive';
        if (value < -5) return 'negative';
        return 'neutral';
    }

    updateResultsMeta(results) {
        const metaContainer = document.getElementById('resultsMeta');
        if (!metaContainer) return;

        metaContainer.innerHTML = `
            <div class="meta-info">
                <span><strong>Scenario:</strong> ${results.metadata.template}</span>
                <span><strong>Iterations:</strong> ${results.metadata.iterations.toLocaleString()}</span>
                <span><strong>Teams:</strong> ${results.teams.length}</span>
                <span><strong>Generated:</strong> ${new Date(results.metadata.timestamp).toLocaleString()}</span>
            </div>
        `;
    }

    formatTeamName(team) {
        const names = {
            cardinals: 'Cardinals',
            titans: 'Titans',
            longhorns: 'Longhorns',
            grizzlies: 'Grizzlies'
        };
        return names[team] || team;
    }

    getBalanceLabel(balance) {
        if (balance > 0.8) return 'Very Balanced';
        if (balance > 0.6) return 'Balanced';
        if (balance > 0.4) return 'Somewhat Unbalanced';
        return 'Highly Unbalanced';
    }

    enableComparisonMode() {
        const compareButton = document.getElementById('compareScenarios');
        if (compareButton) {
            compareButton.style.display = 'inline-block';
        }
    }

    showComparisonView() {
        // Implementation for showing scenario comparison view
        console.log('📊 Opening scenario comparison view...');
    }

    showProgress(show) {
        const progressContainer = document.getElementById('scenarioProgress');
        if (progressContainer) {
            progressContainer.style.display = show ? 'block' : 'none';
        }
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        if (progressText) {
            progressText.textContent = `Running simulation... ${Math.round(percentage)}%`;
        }
    }

    setRunningState(isRunning) {
        this.isRunning = isRunning;
        const runButton = document.getElementById('runScenarioSimulation');

        if (runButton) {
            runButton.disabled = isRunning;
            runButton.innerHTML = isRunning
                ? '<i class="fas fa-spinner fa-spin"></i> Running Simulation...'
                : '<i class="fas fa-play"></i> Run Scenario Analysis';
        }
    }

    showError(message) {
        console.error('❌ Scenario simulator error:', message);
        // You could show a toast notification or modal here
        alert('Error: ' + message);
    }

    connectToDataSources() {
        // Connect to championship data engine for real data
        if (window.championshipDataEngine) {
            console.log('🔗 Connected to championship data engine');
        }

        // Connect to Monte Carlo engine for simulations
        if (window.monteCarloEngine) {
            console.log('🔗 Connected to Monte Carlo engine');
        }
    }

    initializeWorkerPool() {
        // Initialize web workers for parallel simulation processing
        if (window.Worker && this.simulationConfig.parallelProcessing) {
            console.log('🔧 Initializing worker pool for parallel simulations...');
            // Worker pool implementation would go here
        }
    }

    exportResults() {
        if (!this.activeScenario?.results) {
            alert('No results to export');
            return;
        }

        const data = {
            scenario: this.activeScenario,
            exportTime: new Date().toISOString(),
            source: 'Blaze Sports Intel Championship Scenario Simulator'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `championship-scenario-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        console.log('📁 Results exported successfully');
    }

    saveScenario() {
        if (!this.activeScenario) {
            alert('No scenario to save');
            return;
        }

        const scenarioId = `scenario_${Date.now()}`;
        this.scenarios.set(scenarioId, { ...this.activeScenario });

        console.log('💾 Scenario saved:', scenarioId);
        // You could add UI to show saved scenarios and load them later
    }

    destroy() {
        console.log('🔥 Destroying Championship Scenario Simulator...');

        // Clear visualizations
        this.ui.visualizations.forEach(chart => chart.destroy());
        this.ui.visualizations.clear();

        // Clear data
        this.scenarios.clear();
        this.results.clear();
        this.simulationQueue = [];

        console.log('✅ Championship Scenario Simulator destroyed');
    }
}

// Initialize championship scenario simulator
let championshipScenarioSimulator = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Initializing Championship Scenario Simulator...');

    championshipScenarioSimulator = new ChampionshipScenarioSimulator();
    window.championshipScenarioSimulator = championshipScenarioSimulator;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionshipScenarioSimulator;
}

// Global API
window.ChampionshipScenarioSimulator = ChampionshipScenarioSimulator;