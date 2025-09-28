/**
 * 🎲 NIL Uncertainty Modeling Engine - Blaze Intelligence
 * Advanced Monte Carlo simulation system for NIL valuations with confidence intervals
 * Integrates with existing sports intelligence platform and Monte Carlo capabilities
 * Focus: Texas/Deep South athletics with institutional-grade uncertainty quantification
 */

class NILUncertaintyEngine {
    constructor() {
        this.simulationCount = 10000;
        this.confidenceLevels = [80, 90, 95];
        this.currentSimulation = null;

        // Uncertainty factor models
        this.uncertaintyFactors = {
            performance: {
                injuryProbability: 0.15,      // 15% chance of significant injury
                performanceDecline: 0.12,     // 12% chance of major decline
                consistencyVariance: 0.25     // Performance volatility factor
            },
            market: {
                socialMediaVolatility: 0.30,  // 30% volatility in follower growth
                brandAlignmentRisk: 0.20,     // 20% risk of brand misalignment
                economicFactors: 0.15         // Economic condition impacts
            },
            career: {
                transferPortalRisk: 0.25,     // 25% chance of transfer
                draftProjectionVar: 0.40,     // High variability in draft projections
                academicEligibility: 0.08     // Academic risk factor
            },
            regional: {
                texasMarketPremium: 1.25,     // 25% premium for Texas market
                secConferencePremium: 1.30,   // 30% premium for SEC
                localBusinessDensity: 0.85    // Local business partnership factor
            }
        };

        // Program-specific value multipliers with uncertainty
        this.programMultipliers = {
            'Texas Longhorns': {
                base: 2.8,
                uncertainty: 0.35,
                marketFactors: ['austin_market', 'oil_money', 'alumni_network']
            },
            'Alabama Crimson Tide': {
                base: 3.2,
                uncertainty: 0.25,
                marketFactors: ['championship_tradition', 'national_brand']
            },
            'Georgia Bulldogs': {
                base: 3.0,
                uncertainty: 0.30,
                marketFactors: ['atlanta_market', 'sec_network']
            },
            'LSU Tigers': {
                base: 2.7,
                uncertainty: 0.32,
                marketFactors: ['louisiana_culture', 'oil_industry']
            },
            'Texas A&M Aggies': {
                base: 2.5,
                uncertainty: 0.28,
                marketFactors: ['college_station', 'aggie_network']
            }
        };

        // Position-specific risk factors
        this.positionRiskFactors = {
            quarterback: {
                volatility: 0.45,
                upside: 3.5,
                injuryRisk: 0.18,
                marketDemand: 4.2
            },
            runningback: {
                volatility: 0.60,
                upside: 2.2,
                injuryRisk: 0.35,
                marketDemand: 2.8
            },
            widereceiver: {
                volatility: 0.35,
                upside: 2.8,
                injuryRisk: 0.22,
                marketDemand: 3.5
            },
            defensiveend: {
                volatility: 0.40,
                upside: 2.1,
                injuryRisk: 0.28,
                marketDemand: 2.3
            },
            linebacker: {
                volatility: 0.38,
                upside: 2.0,
                injuryRisk: 0.25,
                marketDemand: 2.1
            },
            pitcher: {
                volatility: 0.55,
                upside: 2.7,
                injuryRisk: 0.30,
                marketDemand: 3.1
            },
            catcher: {
                volatility: 0.32,
                upside: 2.3,
                injuryRisk: 0.20,
                marketDemand: 2.7
            },
            centerfielder: {
                volatility: 0.42,
                upside: 2.5,
                injuryRisk: 0.18,
                marketDemand: 3.0
            }
        };

        this.init();
    }

    init() {
        console.log('🎲 NIL Uncertainty Engine initialized');
        this.setupDistributionModels();
    }

    setupDistributionModels() {
        // Beta distributions for performance factors
        this.performanceDistribution = {
            alpha: 2.5,
            beta: 2.0,
            scale: 1.0
        };

        // Log-normal for social media growth
        this.socialMediaDistribution = {
            mu: 0.15,      // 15% average growth
            sigma: 0.40    // High volatility
        };

        // Triangular for market conditions
        this.marketDistribution = {
            min: 0.7,
            mode: 1.0,
            max: 1.4
        };
    }

    /**
     * Primary Monte Carlo simulation for NIL valuation uncertainty
     */
    async simulateNILValuation(athleteData, options = {}) {
        const {
            iterations = this.simulationCount,
            timeHorizon = 4, // years
            confidenceLevels = this.confidenceLevels
        } = options;

        console.log(`🎯 Starting NIL Monte Carlo simulation for ${athleteData.name || 'Athlete'}`);
        console.log(`📊 Running ${iterations.toLocaleString()} simulations over ${timeHorizon} years`);

        const simulations = [];
        const yearlyProjections = Array(timeHorizon).fill(null).map(() => []);

        for (let i = 0; i < iterations; i++) {
            const simulation = await this.runSingleSimulation(athleteData, timeHorizon);
            simulations.push(simulation);

            // Store yearly projections for temporal analysis
            simulation.yearlyValues.forEach((value, year) => {
                yearlyProjections[year].push(value);
            });

            // Progress reporting for large simulations
            if (i % 1000 === 0 && i > 0) {
                console.log(`📈 Completed ${i.toLocaleString()} simulations (${(i/iterations*100).toFixed(1)}%)`);
            }
        }

        // Generate comprehensive uncertainty analysis
        const analysis = this.analyzeSimulationResults(simulations, yearlyProjections, confidenceLevels);

        // Store for visualization and reporting
        this.currentSimulation = {
            athleteData,
            simulations,
            analysis,
            timestamp: new Date().toISOString()
        };

        console.log('✅ Monte Carlo simulation completed');
        return analysis;
    }

    /**
     * Execute single simulation path with all uncertainty factors
     */
    async runSingleSimulation(athleteData, timeHorizon) {
        const baseValue = this.calculateBaseNILValue(athleteData);
        const yearlyValues = [];
        let currentValue = baseValue;

        // Sample uncertainty factors for this simulation path
        const uncertaintyPath = this.sampleUncertaintyPath(athleteData, timeHorizon);

        for (let year = 0; year < timeHorizon; year++) {
            // Apply year-specific uncertainty factors
            const yearFactors = uncertaintyPath[year];

            // Performance evolution
            currentValue *= yearFactors.performanceFactor;

            // Social media growth/decline with volatility
            currentValue *= yearFactors.socialMediaFactor;

            // Market condition impacts
            currentValue *= yearFactors.marketFactor;

            // Career progression/regression risks
            currentValue *= yearFactors.careerFactor;

            // Regional market dynamics
            currentValue *= yearFactors.regionalFactor;

            // Position-specific adjustments
            currentValue *= yearFactors.positionFactor;

            // Academic year progression bonus/penalty
            const yearProgression = this.calculateYearProgression(year, athleteData.currentYear);
            currentValue *= yearProgression;

            // Ensure minimum floor (academic scholarship equivalent)
            currentValue = Math.max(currentValue, 5000);

            yearlyValues.push(currentValue);
        }

        return {
            finalValue: currentValue,
            yearlyValues,
            uncertaintyPath,
            riskFactors: this.calculateRiskFactors(uncertaintyPath)
        };
    }

    /**
     * Sample uncertainty factors for complete simulation path
     */
    sampleUncertaintyPath(athleteData, timeHorizon) {
        const path = [];
        const position = athleteData.position?.toLowerCase() || 'unknown';
        const program = athleteData.program || 'unknown';

        // Get position-specific risk profile
        const positionRisk = this.positionRiskFactors[position] || {
            volatility: 0.35,
            upside: 2.0,
            injuryRisk: 0.20,
            marketDemand: 2.5
        };

        for (let year = 0; year < timeHorizon; year++) {
            const yearFactor = {
                performanceFactor: this.samplePerformanceFactor(positionRisk, year),
                socialMediaFactor: this.sampleSocialMediaFactor(year),
                marketFactor: this.sampleMarketFactor(),
                careerFactor: this.sampleCareerFactor(athleteData, year),
                regionalFactor: this.sampleRegionalFactor(program),
                positionFactor: this.samplePositionFactor(positionRisk)
            };

            path.push(yearFactor);
        }

        return path;
    }

    /**
     * Sample performance factor with injury and consistency risks
     */
    samplePerformanceFactor(positionRisk, year) {
        // Base performance trend (slight improvement over time)
        let baseTrend = 1.0 + (year * 0.05);

        // Injury risk check
        if (Math.random() < positionRisk.injuryRisk) {
            baseTrend *= (0.4 + Math.random() * 0.4); // 40-80% of normal if injured
        }

        // Performance volatility
        const volatility = positionRisk.volatility;
        const performanceShock = this.sampleNormal(0, volatility);

        return Math.max(0.3, baseTrend * (1 + performanceShock));
    }

    /**
     * Sample social media growth with high volatility
     */
    sampleSocialMediaFactor(year) {
        // Viral potential decreases slightly over time
        const viralPotential = 1.2 - (year * 0.05);

        // Log-normal growth with potential for viral spikes
        const growthRate = this.sampleLogNormal(0.10, 0.35);

        // Occasional viral events (5% chance of 10x spike)
        if (Math.random() < 0.05) {
            return Math.min(10.0, viralPotential * (5 + Math.random() * 5));
        }

        return Math.max(0.5, 1 + growthRate);
    }

    /**
     * Sample market condition factor
     */
    sampleMarketFactor() {
        // Economic conditions, NIL market maturity, etc.
        return this.sampleTriangular(0.8, 1.0, 1.3);
    }

    /**
     * Sample career progression factor
     */
    sampleCareerFactor(athleteData, year) {
        let careerFactor = 1.0;

        // Transfer portal risk (higher in years 1-2)
        const transferRisk = year < 2 ? 0.25 : 0.15;
        if (Math.random() < transferRisk) {
            careerFactor *= (0.6 + Math.random() * 0.3); // Transfer penalty
        }

        // Draft projection impact (higher in years 3-4)
        if (year >= 2) {
            const draftBonus = Math.random() < 0.3 ? (1.2 + Math.random() * 0.8) : 1.0;
            careerFactor *= draftBonus;
        }

        // Academic eligibility risk
        if (Math.random() < this.uncertaintyFactors.career.academicEligibility) {
            careerFactor *= 0.1; // Academic suspension
        }

        return careerFactor;
    }

    /**
     * Sample regional market factor based on program
     */
    sampleRegionalFactor(program) {
        const programData = this.programMultipliers[program];

        if (!programData) {
            return this.sampleNormal(1.0, 0.15); // Generic program uncertainty
        }

        return this.sampleNormal(programData.base, programData.uncertainty);
    }

    /**
     * Sample position-specific market demand factor
     */
    samplePositionFactor(positionRisk) {
        const demandVariability = positionRisk.marketDemand * 0.2;
        return this.sampleNormal(positionRisk.marketDemand, demandVariability) / positionRisk.marketDemand;
    }

    /**
     * Calculate base NIL value before uncertainty
     */
    calculateBaseNILValue(athleteData) {
        const sportMultipliers = {
            'football': 25000,
            'basketball': 18000,
            'baseball': 12000,
            'softball': 8000,
            'track': 5000
        };

        const baseValue = sportMultipliers[athleteData.sport?.toLowerCase()] || 8000;

        // Social media contribution
        const socialValue = this.calculateSocialMediaValue(athleteData.socialMedia || {});

        // Performance multiplier
        const performanceMultiplier = 1 + ((athleteData.performanceRating || 5) - 5) * 0.2;

        return (baseValue + socialValue) * performanceMultiplier;
    }

    calculateSocialMediaValue(socialMedia) {
        const rates = {
            instagram: 0.05,
            tiktok: 0.03,
            twitter: 0.02,
            youtube: 0.10
        };

        return Object.entries(socialMedia).reduce((total, [platform, followers]) => {
            return total + (followers * (rates[platform] || 0.01));
        }, 0);
    }

    calculateYearProgression(simulationYear, currentYear) {
        const yearMap = {
            'freshman': 1,
            'sophomore': 2,
            'junior': 3,
            'senior': 4,
            'graduate': 5
        };

        const currentYearNum = yearMap[currentYear] || 2;
        const projectYear = currentYearNum + simulationYear;

        // Peak value typically in junior/senior years
        const progressionMultipliers = [0, 0.8, 1.0, 1.3, 1.5, 1.2];
        return progressionMultipliers[Math.min(projectYear, 5)] || 1.0;
    }

    /**
     * Analyze simulation results and generate comprehensive uncertainty metrics
     */
    analyzeSimulationResults(simulations, yearlyProjections, confidenceLevels) {
        const finalValues = simulations.map(s => s.finalValue);

        const analysis = {
            summary: this.calculateDistributionSummary(finalValues, confidenceLevels),
            yearlyAnalysis: yearlyProjections.map(yearData =>
                this.calculateDistributionSummary(yearData, confidenceLevels)
            ),
            riskMetrics: this.calculateRiskMetrics(simulations),
            scenarioAnalysis: this.performScenarioAnalysis(simulations),
            volatilityMetrics: this.calculateVolatilityMetrics(simulations),
            downSideProtection: this.calculateDownsideProtection(finalValues)
        };

        return analysis;
    }

    calculateDistributionSummary(values, confidenceLevels) {
        const sorted = values.slice().sort((a, b) => a - b);
        const n = sorted.length;

        const summary = {
            mean: values.reduce((a, b) => a + b, 0) / n,
            median: sorted[Math.floor(n / 2)],
            mode: this.calculateMode(sorted),
            standardDeviation: this.calculateStandardDeviation(values),
            confidenceIntervals: {},
            percentiles: {}
        };

        // Calculate confidence intervals
        confidenceLevels.forEach(level => {
            const tail = (100 - level) / 2;
            summary.confidenceIntervals[level] = {
                lower: this.percentile(sorted, tail),
                upper: this.percentile(sorted, 100 - tail),
                range: this.percentile(sorted, 100 - tail) - this.percentile(sorted, tail)
            };
        });

        // Key percentiles
        [5, 10, 25, 50, 75, 90, 95].forEach(p => {
            summary.percentiles[p] = this.percentile(sorted, p);
        });

        return summary;
    }

    calculateRiskMetrics(simulations) {
        const finalValues = simulations.map(s => s.finalValue);
        const mean = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;

        return {
            valueAtRisk: {
                var95: this.percentile(finalValues.slice().sort((a, b) => a - b), 5),
                var90: this.percentile(finalValues.slice().sort((a, b) => a - b), 10),
                var80: this.percentile(finalValues.slice().sort((a, b) => a - b), 20)
            },
            expectedShortfall: {
                es95: this.calculateExpectedShortfall(finalValues, 0.05),
                es90: this.calculateExpectedShortfall(finalValues, 0.10)
            },
            probabilityOfLoss: finalValues.filter(v => v < mean * 0.8).length / finalValues.length,
            maxDrawdown: this.calculateMaxDrawdown(simulations),
            riskAdjustedReturn: mean / this.calculateStandardDeviation(finalValues)
        };
    }

    performScenarioAnalysis(simulations) {
        const finalValues = simulations.map(s => s.finalValue);
        const sorted = finalValues.slice().sort((a, b) => a - b);
        const n = sorted.length;

        return {
            bestCase: {
                value: sorted[Math.floor(n * 0.95)],
                probability: 0.05,
                description: "Top 5% outcome - viral social media growth, elite performance, no major setbacks"
            },
            optimistic: {
                value: sorted[Math.floor(n * 0.75)],
                probability: 0.25,
                description: "Above average outcome - steady improvement, moderate social growth"
            },
            mostLikely: {
                value: sorted[Math.floor(n * 0.50)],
                probability: 0.50,
                description: "Median outcome - expected performance with normal market conditions"
            },
            pessimistic: {
                value: sorted[Math.floor(n * 0.25)],
                probability: 0.25,
                description: "Below average outcome - performance decline, social media stagnation"
            },
            worstCase: {
                value: sorted[Math.floor(n * 0.05)],
                probability: 0.05,
                description: "Bottom 5% outcome - major injury, transfer, or significant controversy"
            }
        };
    }

    calculateVolatilityMetrics(simulations) {
        const yearlyVolatilities = [];

        for (let year = 0; year < simulations[0].yearlyValues.length; year++) {
            const yearValues = simulations.map(s => s.yearlyValues[year]);
            yearlyVolatilities.push(this.calculateStandardDeviation(yearValues));
        }

        return {
            yearlyVolatilities,
            averageVolatility: yearlyVolatilities.reduce((a, b) => a + b, 0) / yearlyVolatilities.length,
            volatilityTrend: this.calculateLinearTrend(yearlyVolatilities)
        };
    }

    calculateDownsideProtection(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        return {
            floorValue: Math.min(...values),
            academicScholarshipFloor: 5000, // Minimum academic value
            probabilityAboveFloor: values.filter(v => v > 10000).length / values.length,
            downsideDeviation: this.calculateDownsideDeviation(values, mean)
        };
    }

    /**
     * Utility functions for statistical calculations
     */
    sampleNormal(mean = 0, stdDev = 1) {
        // Box-Muller transformation
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + stdDev * z0;
    }

    sampleLogNormal(mu, sigma) {
        const normal = this.sampleNormal(mu, sigma);
        return Math.exp(normal) - 1;
    }

    sampleTriangular(min, mode, max) {
        const u = Math.random();
        const c = (mode - min) / (max - min);

        if (u < c) {
            return min + Math.sqrt(u * (max - min) * (mode - min));
        } else {
            return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
        }
    }

    percentile(sortedArray, p) {
        const index = (p / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;

        if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }

    calculateMode(sortedValues) {
        // Simplified mode calculation for continuous data
        // Use histogram approach with bins
        const bins = 20;
        const min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];
        const binWidth = (max - min) / bins;
        const histogram = new Array(bins).fill(0);

        sortedValues.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
            histogram[binIndex]++;
        });

        const maxBinIndex = histogram.indexOf(Math.max(...histogram));
        return min + (maxBinIndex + 0.5) * binWidth;
    }

    calculateExpectedShortfall(values, alpha) {
        const sorted = values.slice().sort((a, b) => a - b);
        const cutoffIndex = Math.floor(alpha * sorted.length);
        const tailValues = sorted.slice(0, cutoffIndex);
        return tailValues.reduce((a, b) => a + b, 0) / tailValues.length;
    }

    calculateMaxDrawdown(simulations) {
        let maxDrawdown = 0;

        simulations.forEach(simulation => {
            let peak = simulation.yearlyValues[0];
            let currentDrawdown = 0;

            simulation.yearlyValues.forEach(value => {
                if (value > peak) peak = value;
                currentDrawdown = Math.max(currentDrawdown, (peak - value) / peak);
            });

            maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
        });

        return maxDrawdown;
    }

    calculateDownsideDeviation(values, target) {
        const downsideValues = values.filter(v => v < target).map(v => Math.pow(target - v, 2));
        return Math.sqrt(downsideValues.reduce((a, b) => a + b, 0) / values.length);
    }

    calculateLinearTrend(values) {
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    calculateRiskFactors(uncertaintyPath) {
        // Aggregate risk factors across the simulation path
        const riskFactors = {
            performanceRisk: 0,
            marketRisk: 0,
            careerRisk: 0,
            overallVolatility: 0
        };

        uncertaintyPath.forEach(yearFactors => {
            riskFactors.performanceRisk += Math.abs(1 - yearFactors.performanceFactor);
            riskFactors.marketRisk += Math.abs(1 - yearFactors.marketFactor);
            riskFactors.careerRisk += Math.abs(1 - yearFactors.careerFactor);
        });

        // Average the risks
        const years = uncertaintyPath.length;
        Object.keys(riskFactors).forEach(key => {
            if (key !== 'overallVolatility') {
                riskFactors[key] /= years;
            }
        });

        riskFactors.overallVolatility = (riskFactors.performanceRisk + riskFactors.marketRisk + riskFactors.careerRisk) / 3;

        return riskFactors;
    }

    /**
     * Generate comprehensive NIL uncertainty report
     */
    generateUncertaintyReport(analysis, athleteData) {
        const report = {
            athleteProfile: {
                name: athleteData.name,
                sport: athleteData.sport,
                position: athleteData.position,
                program: athleteData.program,
                currentYear: athleteData.currentYear
            },
            executiveSummary: {
                expectedValue: analysis.summary.mean,
                confidenceInterval95: analysis.summary.confidenceIntervals[95],
                riskRating: this.calculateRiskRating(analysis.riskMetrics),
                recommendedStrategy: this.generateRecommendedStrategy(analysis)
            },
            uncertaintyAnalysis: {
                distributionSummary: analysis.summary,
                riskMetrics: analysis.riskMetrics,
                scenarioAnalysis: analysis.scenarioAnalysis,
                volatilityProfile: analysis.volatilityMetrics
            },
            temporalProjections: {
                yearlyForecasts: analysis.yearlyAnalysis,
                valueTrajectory: this.calculateValueTrajectory(analysis.yearlyAnalysis),
                riskEvolution: this.calculateRiskEvolution(analysis.yearlyAnalysis)
            },
            strategicInsights: {
                keyRiskFactors: this.identifyKeyRiskFactors(analysis),
                opportunityAreas: this.identifyOpportunityAreas(analysis),
                hedgingStrategies: this.suggestHedgingStrategies(analysis)
            },
            timestamp: new Date().toISOString(),
            methodology: {
                simulationCount: this.simulationCount,
                uncertaintyFactors: Object.keys(this.uncertaintyFactors),
                confidenceLevels: this.confidenceLevels
            }
        };

        return report;
    }

    calculateRiskRating(riskMetrics) {
        const volatility = riskMetrics.riskAdjustedReturn;
        const probabilityOfLoss = riskMetrics.probabilityOfLoss;

        if (volatility > 2.0 && probabilityOfLoss < 0.10) return 'Low Risk';
        if (volatility > 1.5 && probabilityOfLoss < 0.20) return 'Moderate Risk';
        if (volatility > 1.0 && probabilityOfLoss < 0.35) return 'High Risk';
        return 'Very High Risk';
    }

    generateRecommendedStrategy(analysis) {
        const cv = analysis.summary.standardDeviation / analysis.summary.mean; // Coefficient of variation

        if (cv < 0.30) {
            return 'Conservative approach - focus on consistent performance and brand building';
        } else if (cv < 0.50) {
            return 'Balanced approach - diversify NIL opportunities while maximizing upside';
        } else {
            return 'Aggressive approach - high risk/high reward strategy with downside protection';
        }
    }

    calculateValueTrajectory(yearlyAnalysis) {
        return yearlyAnalysis.map((year, index) => ({
            year: index + 1,
            expectedValue: year.mean,
            confidenceBand: year.confidenceIntervals[90],
            growthRate: index > 0 ? (year.mean / yearlyAnalysis[index - 1].mean - 1) : 0
        }));
    }

    calculateRiskEvolution(yearlyAnalysis) {
        return yearlyAnalysis.map((year, index) => ({
            year: index + 1,
            volatility: year.standardDeviation / year.mean,
            downside: year.percentiles[10],
            upside: year.percentiles[90]
        }));
    }

    identifyKeyRiskFactors(analysis) {
        const factors = [];

        if (analysis.riskMetrics.probabilityOfLoss > 0.25) {
            factors.push('High probability of significant value decline');
        }

        if (analysis.riskMetrics.maxDrawdown > 0.50) {
            factors.push('Potential for severe drawdowns during career');
        }

        if (analysis.volatilityMetrics.averageVolatility > analysis.summary.mean * 0.4) {
            factors.push('High value volatility across projection period');
        }

        return factors;
    }

    identifyOpportunityAreas(analysis) {
        const opportunities = [];

        if (analysis.scenarioAnalysis.bestCase.value / analysis.summary.mean > 3) {
            opportunities.push('Significant upside potential through viral social media growth');
        }

        if (analysis.volatilityMetrics.volatilityTrend < 0) {
            opportunities.push('Decreasing volatility suggests stabilizing value over time');
        }

        return opportunities;
    }

    suggestHedgingStrategies(analysis) {
        const strategies = [];

        if (analysis.riskMetrics.probabilityOfLoss > 0.20) {
            strategies.push('Consider guaranteed minimum contracts to establish value floor');
        }

        if (analysis.volatilityMetrics.averageVolatility > 0.40) {
            strategies.push('Diversify across multiple smaller deals rather than single large contract');
        }

        strategies.push('Maintain academic performance as insurance against sports-related value decline');

        return strategies;
    }

    /**
     * Export simulation data for external analysis or visualization
     */
    exportSimulationData(format = 'json') {
        if (!this.currentSimulation) {
            throw new Error('No simulation data available. Run simulation first.');
        }

        switch (format) {
            case 'json':
                return JSON.stringify(this.currentSimulation, null, 2);

            case 'csv':
                return this.convertToCSV(this.currentSimulation.simulations);

            default:
                return this.currentSimulation;
        }
    }

    convertToCSV(simulations) {
        const headers = ['Simulation', 'FinalValue', 'Year1', 'Year2', 'Year3', 'Year4', 'PerformanceRisk', 'MarketRisk', 'CareerRisk'];
        const rows = simulations.map((sim, index) => [
            index + 1,
            sim.finalValue,
            ...sim.yearlyValues,
            sim.riskFactors.performanceRisk,
            sim.riskFactors.marketRisk,
            sim.riskFactors.careerRisk
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Global export for browser usage
if (typeof window !== 'undefined') {
    window.NILUncertaintyEngine = NILUncertaintyEngine;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NILUncertaintyEngine;
}

console.log('🎲 NIL Uncertainty Engine loaded - ready for Monte Carlo NIL simulations');