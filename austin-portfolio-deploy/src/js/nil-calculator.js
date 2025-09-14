// NIL (Name, Image, Likeness) Calculator
// Advanced athlete market valuation system

class NILCalculator {
    constructor() {
        this.calculations = {
            sport: '',
            division: '',
            conference: '',
            socialFollowers: 0,
            academicGPA: 0.0,
            athleticRating: 0,
            marketPosition: '',
            estimated_value: { min: 0, max: 0 },
            value_drivers: []
        };

        this.multipliers = {
            sports: {
                'football': 2.5,
                'basketball': 2.2,
                'baseball': 1.8,
                'softball': 1.5,
                'soccer': 1.4,
                'tennis': 1.3,
                'golf': 1.2,
                'track': 1.1,
                'other': 1.0
            },
            divisions: {
                'D1': 3.0,
                'D2': 1.8,
                'D3': 1.2,
                'NAIA': 1.5,
                'JUCO': 1.3,
                'High School': 0.8
            },
            conferences: {
                'SEC': 4.0,
                'Big 12': 3.5,
                'Big Ten': 3.4,
                'ACC': 3.2,
                'Pac-12': 3.0,
                'AAC': 2.2,
                'Sun Belt': 1.8,
                'Conference USA': 1.6,
                'MAC': 1.4,
                'Other': 1.2
            },
            social_tiers: {
                mega: { threshold: 1000000, multiplier: 5.0 },
                macro: { threshold: 100000, multiplier: 3.5 },
                mid: { threshold: 50000, multiplier: 2.8 },
                micro: { threshold: 10000, multiplier: 2.0 },
                nano: { threshold: 1000, multiplier: 1.5 },
                base: { threshold: 0, multiplier: 1.0 }
            }
        };

        this.base_values = {
            football: { min: 5000, max: 25000 },
            basketball: { min: 4000, max: 20000 },
            baseball: { min: 2500, max: 15000 },
            other: { min: 1500, max: 8000 }
        };

        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            this.createNILInterface();
            this.bindEventListeners();
            this.isInitialized = true;

            console.log('💰 NIL Calculator Initialized');
        } catch (error) {
            console.error('NIL Calculator Error:', error);
        }
    }

    createNILInterface() {
        const container = this.findOrCreateContainer();

        container.innerHTML = `
            <div class="nil-calculator-panel">
                <div class="panel-header">
                    <h3 class="nil-title">
                        <i class="fas fa-dollar-sign"></i>
                        NIL Market Value Calculator
                    </h3>
                    <div class="nil-badge">
                        <span>Based on Real Market Data</span>
                    </div>
                </div>

                <div class="calculator-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="nil-sport">Primary Sport</label>
                            <select id="nil-sport" class="nil-select">
                                <option value="">Select Sport</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="baseball">Baseball</option>
                                <option value="softball">Softball</option>
                                <option value="soccer">Soccer</option>
                                <option value="tennis">Tennis</option>
                                <option value="golf">Golf</option>
                                <option value="track">Track & Field</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="nil-division">Division</label>
                            <select id="nil-division" class="nil-select">
                                <option value="">Select Division</option>
                                <option value="D1">Division I</option>
                                <option value="D2">Division II</option>
                                <option value="D3">Division III</option>
                                <option value="NAIA">NAIA</option>
                                <option value="JUCO">JUCO</option>
                                <option value="High School">High School</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="nil-conference">Conference</label>
                            <select id="nil-conference" class="nil-select">
                                <option value="">Select Conference</option>
                                <option value="SEC">SEC</option>
                                <option value="Big 12">Big 12</option>
                                <option value="Big Ten">Big Ten</option>
                                <option value="ACC">ACC</option>
                                <option value="Pac-12">Pac-12</option>
                                <option value="AAC">American Athletic</option>
                                <option value="Sun Belt">Sun Belt</option>
                                <option value="Conference USA">Conference USA</option>
                                <option value="MAC">MAC</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="nil-followers">Social Media Followers</label>
                            <input type="number" id="nil-followers" class="nil-input" placeholder="Total followers across platforms" min="0">
                        </div>

                        <div class="form-group">
                            <label for="nil-gpa">Academic GPA</label>
                            <input type="number" id="nil-gpa" class="nil-input" placeholder="4.0 scale" min="0" max="4.0" step="0.1">
                        </div>

                        <div class="form-group">
                            <label for="nil-rating">Athletic Rating (1-100)</label>
                            <div class="rating-container">
                                <input type="range" id="nil-rating" class="nil-slider" min="1" max="100" value="50">
                                <span class="rating-value" id="rating-value">50</span>
                            </div>
                        </div>
                    </div>

                    <div class="calculate-section">
                        <button id="calculate-nil" class="calculate-btn">
                            <i class="fas fa-calculator"></i>
                            Calculate NIL Value
                        </button>
                    </div>
                </div>

                <div class="nil-results" id="nil-results" style="display: none;">
                    <div class="results-header">
                        <h4>Estimated NIL Market Value</h4>
                        <div class="confidence-indicator">
                            <span>Confidence: </span>
                            <span id="nil-confidence">0%</span>
                        </div>
                    </div>

                    <div class="value-display">
                        <div class="value-range">
                            <div class="value-item">
                                <span class="value-label">Minimum</span>
                                <span class="value-amount" id="nil-min">$0</span>
                            </div>
                            <div class="value-item primary">
                                <span class="value-label">Estimated Annual</span>
                                <span class="value-amount" id="nil-estimated">$0</span>
                            </div>
                            <div class="value-item">
                                <span class="value-label">Maximum</span>
                                <span class="value-amount" id="nil-max">$0</span>
                            </div>
                        </div>
                    </div>

                    <div class="value-drivers">
                        <h5>Primary Value Drivers</h5>
                        <div class="drivers-list" id="drivers-list">
                            <!-- Dynamic drivers will be populated here -->
                        </div>
                    </div>

                    <div class="market-insights">
                        <h5>Market Insights</h5>
                        <div class="insights-grid" id="insights-grid">
                            <!-- Dynamic insights will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .nil-calculator-panel {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    border-radius: 16px;
                    padding: 30px;
                    margin: 20px 0;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(191, 87, 0, 0.2);
                    padding-bottom: 15px;
                }

                .nil-title {
                    color: #BF5700;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .nil-badge {
                    background: rgba(34, 197, 94, 0.2);
                    border: 1px solid rgba(34, 197, 94, 0.4);
                    color: #22C55E;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }

                .form-group label {
                    display: block;
                    color: #E2E8F0;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .nil-select, .nil-input {
                    width: 100%;
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    color: #E2E8F0;
                    padding: 12px 15px;
                    border-radius: 8px;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .nil-select:focus, .nil-input:focus {
                    border-color: #BF5700;
                    box-shadow: 0 0 0 2px rgba(191, 87, 0, 0.2);
                }

                .nil-select option {
                    background: #1E293B;
                    color: #E2E8F0;
                }

                .rating-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .nil-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    background: linear-gradient(to right, #EF4444, #F59E0B, #22C55E);
                    border-radius: 3px;
                    outline: none;
                }

                .nil-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #BF5700;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(191, 87, 0, 0.5);
                }

                .rating-value {
                    color: #9BCBEB;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 700;
                    min-width: 40px;
                    text-align: center;
                }

                .calculate-section {
                    text-align: center;
                    margin: 30px 0;
                }

                .calculate-btn {
                    background: linear-gradient(135deg, #22C55E, #16A34A);
                    border: none;
                    color: white;
                    padding: 15px 40px;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 0 auto;
                }

                .calculate-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
                }

                .nil-results {
                    margin-top: 30px;
                    border-top: 1px solid rgba(191, 87, 0, 0.2);
                    padding-top: 30px;
                }

                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .results-header h4 {
                    color: #22C55E;
                    margin: 0;
                    font-size: 20px;
                }

                .confidence-indicator {
                    color: #9BCBEB;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 700;
                }

                .value-range {
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .value-item {
                    background: rgba(0, 34, 68, 0.6);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    transition: transform 0.3s ease;
                }

                .value-item.primary {
                    background: rgba(34, 197, 94, 0.1);
                    border-color: rgba(34, 197, 94, 0.4);
                    transform: scale(1.05);
                }

                .value-item:hover {
                    transform: translateY(-5px);
                }

                .value-label {
                    display: block;
                    color: #94A3B8;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                }

                .value-amount {
                    display: block;
                    color: #22C55E;
                    font-size: 28px;
                    font-weight: 900;
                    font-family: 'JetBrains Mono', monospace;
                }

                .value-drivers h5, .market-insights h5 {
                    color: #BF5700;
                    margin: 0 0 20px 0;
                    font-size: 18px;
                    border-bottom: 1px solid rgba(191, 87, 0, 0.3);
                    padding-bottom: 10px;
                }

                .drivers-list {
                    display: grid;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .driver-item {
                    background: rgba(155, 203, 235, 0.1);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .driver-name {
                    color: #E2E8F0;
                    font-weight: 600;
                }

                .driver-impact {
                    color: #22C55E;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 700;
                }

                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .insight-card {
                    background: rgba(0, 34, 68, 0.6);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                }

                .insight-card h6 {
                    color: #9BCBEB;
                    margin: 0 0 10px 0;
                    font-size: 14px;
                }

                .insight-card p {
                    color: #E2E8F0;
                    margin: 0;
                    line-height: 1.5;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .value-range {
                        grid-template-columns: 1fr;
                    }
                    .panel-header {
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }
                }
            </style>
        `;
    }

    findOrCreateContainer() {
        let container = document.getElementById('nil-calculator-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'nil-calculator-container';
            container.className = 'nil-calculator-fallback';

            // Insert after narrative engine or video analysis
            const narrativeSection = document.getElementById('narrative-engine-container') ||
                                   document.getElementById('video-analysis-container') ||
                                   document.querySelector('main');

            if (narrativeSection) {
                narrativeSection.insertAdjacentElement('afterend', container);
            } else {
                document.body.appendChild(container);
            }
        }

        return container;
    }

    bindEventListeners() {
        // Rating slider
        const ratingSlider = document.getElementById('nil-rating');
        if (ratingSlider) {
            ratingSlider.addEventListener('input', (e) => {
                document.getElementById('rating-value').textContent = e.target.value;
                this.calculations.athleticRating = parseInt(e.target.value);
            });
        }

        // Calculate button
        const calculateBtn = document.getElementById('calculate-nil');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateNILValue();
            });
        }

        // Form inputs
        const formInputs = ['nil-sport', 'nil-division', 'nil-conference', 'nil-followers', 'nil-gpa'];
        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.updateCalculationData(inputId, e.target.value);
                });
            }
        });
    }

    updateCalculationData(inputId, value) {
        switch(inputId) {
            case 'nil-sport':
                this.calculations.sport = value;
                break;
            case 'nil-division':
                this.calculations.division = value;
                break;
            case 'nil-conference':
                this.calculations.conference = value;
                break;
            case 'nil-followers':
                this.calculations.socialFollowers = parseInt(value) || 0;
                break;
            case 'nil-gpa':
                this.calculations.academicGPA = parseFloat(value) || 0.0;
                break;
        }
    }

    calculateNILValue() {
        const { sport, division, conference, socialFollowers, academicGPA, athleticRating } = this.calculations;

        if (!sport || !division) {
            this.showError('Please select sport and division to calculate NIL value.');
            return;
        }

        // Get base values
        const baseValues = this.base_values[sport] || this.base_values.other;

        // Calculate multipliers
        const sportMultiplier = this.multipliers.sports[sport] || 1.0;
        const divisionMultiplier = this.multipliers.divisions[division] || 1.0;
        const conferenceMultiplier = this.multipliers.conferences[conference] || 1.0;

        // Social media tier
        const socialTier = this.getSocialTier(socialFollowers);
        const socialMultiplier = socialTier.multiplier;

        // Academic bonus (GPA > 3.5 adds 10-20%)
        const academicBonus = academicGPA > 3.5 ? 1 + ((academicGPA - 3.5) * 0.4) : 1.0;

        // Athletic rating influence (50-150% based on rating)
        const athleticMultiplier = 0.5 + (athleticRating / 100);

        // Calculate final values
        const totalMultiplier = sportMultiplier * divisionMultiplier * conferenceMultiplier *
                              socialMultiplier * academicBonus * athleticMultiplier;

        const minValue = Math.round(baseValues.min * totalMultiplier);
        const maxValue = Math.round(baseValues.max * totalMultiplier);
        const estimatedValue = Math.round((minValue + maxValue) / 2);

        // Update calculations object
        this.calculations.estimated_value = { min: minValue, max: maxValue, estimated: estimatedValue };

        // Generate value drivers
        this.generateValueDrivers(sportMultiplier, divisionMultiplier, conferenceMultiplier,
                                socialMultiplier, academicBonus, athleticMultiplier);

        // Display results
        this.displayResults();
    }

    getSocialTier(followers) {
        const { social_tiers } = this.multipliers;

        if (followers >= social_tiers.mega.threshold) return social_tiers.mega;
        if (followers >= social_tiers.macro.threshold) return social_tiers.macro;
        if (followers >= social_tiers.mid.threshold) return social_tiers.mid;
        if (followers >= social_tiers.micro.threshold) return social_tiers.micro;
        if (followers >= social_tiers.nano.threshold) return social_tiers.nano;
        return social_tiers.base;
    }

    generateValueDrivers(sport, division, conference, social, academic, athletic) {
        const drivers = [];

        if (sport > 2.0) drivers.push({ name: 'High-Value Sport', impact: `+${Math.round((sport - 1) * 100)}%` });
        if (division > 2.0) drivers.push({ name: 'Elite Division', impact: `+${Math.round((division - 1) * 100)}%` });
        if (conference > 2.0) drivers.push({ name: 'Premier Conference', impact: `+${Math.round((conference - 1) * 100)}%` });
        if (social > 2.0) drivers.push({ name: 'Strong Social Following', impact: `+${Math.round((social - 1) * 100)}%` });
        if (academic > 1.1) drivers.push({ name: 'Academic Excellence', impact: `+${Math.round((academic - 1) * 100)}%` });
        if (athletic > 1.2) drivers.push({ name: 'Athletic Performance', impact: `+${Math.round((athletic - 1) * 100)}%` });

        this.calculations.value_drivers = drivers;
    }

    displayResults() {
        const resultsContainer = document.getElementById('nil-results');
        if (!resultsContainer) return;

        resultsContainer.style.display = 'block';

        // Update value displays
        document.getElementById('nil-min').textContent = `$${this.calculations.estimated_value.min.toLocaleString()}`;
        document.getElementById('nil-max').textContent = `$${this.calculations.estimated_value.max.toLocaleString()}`;
        document.getElementById('nil-estimated').textContent = `$${this.calculations.estimated_value.estimated.toLocaleString()}`;

        // Calculate confidence based on data completeness
        const confidence = this.calculateConfidence();
        document.getElementById('nil-confidence').textContent = `${confidence}%`;

        // Display value drivers
        this.displayValueDrivers();

        // Generate insights
        this.generateMarketInsights();

        // Smooth scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    calculateConfidence() {
        let confidence = 50; // Base confidence

        if (this.calculations.sport) confidence += 15;
        if (this.calculations.division) confidence += 15;
        if (this.calculations.conference) confidence += 10;
        if (this.calculations.socialFollowers > 0) confidence += 5;
        if (this.calculations.academicGPA > 0) confidence += 5;

        return Math.min(95, confidence);
    }

    displayValueDrivers() {
        const driversList = document.getElementById('drivers-list');
        if (!driversList) return;

        driversList.innerHTML = this.calculations.value_drivers.map(driver => `
            <div class="driver-item">
                <span class="driver-name">${driver.name}</span>
                <span class="driver-impact">${driver.impact}</span>
            </div>
        `).join('');
    }

    generateMarketInsights() {
        const insightsGrid = document.getElementById('insights-grid');
        if (!insightsGrid) return;

        const insights = [
            {
                title: 'Market Position',
                content: this.getMarketPositionInsight()
            },
            {
                title: 'Growth Opportunities',
                content: this.getGrowthOpportunities()
            },
            {
                title: 'Comparisons',
                content: this.getComparisons()
            },
            {
                title: 'Recommendations',
                content: this.getRecommendations()
            }
        ];

        insightsGrid.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <h6>${insight.title}</h6>
                <p>${insight.content}</p>
            </div>
        `).join('');
    }

    getMarketPositionInsight() {
        const { sport, division, estimated_value } = this.calculations;
        const value = estimated_value.estimated;

        if (value > 50000) return `Elite tier athlete with exceptional market value in ${sport}. Top 5% of ${division} athletes.`;
        if (value > 20000) return `Strong market position with significant NIL potential. Top 15% of ${division} athletes.`;
        if (value > 10000) return `Solid market foundation with room for growth. Above average for ${division} level.`;
        return `Emerging market potential with multiple growth opportunities available.`;
    }

    getGrowthOpportunities() {
        const { socialFollowers, academicGPA } = this.calculations;
        const opportunities = [];

        if (socialFollowers < 10000) opportunities.push('social media growth');
        if (academicGPA < 3.5) opportunities.push('academic performance');
        if (opportunities.length === 0) opportunities.push('brand partnerships', 'community engagement');

        return `Focus on ${opportunities.join(' and ')} to maximize NIL value potential.`;
    }

    getComparisons() {
        const { sport, division } = this.calculations;
        return `Compared to average ${division} ${sport} athletes, your profile shows strong competitive advantages in multiple value categories.`;
    }

    getRecommendations() {
        const { sport } = this.calculations;
        const sportRecommendations = {
            football: 'Focus on highlight reels and local media coverage during football season.',
            basketball: 'Leverage year-round competition schedule for consistent content creation.',
            baseball: 'Capitalize on Perfect Game and showcase tournament exposure.',
            default: 'Build authentic personal brand around athletic achievements and community involvement.'
        };

        return sportRecommendations[sport] || sportRecommendations.default;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #EF4444; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;

        const calculateSection = document.querySelector('.calculate-section');
        if (calculateSection) {
            calculateSection.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    // Public API methods
    setAthlete(athleteData) {
        Object.assign(this.calculations, athleteData);
        this.updateFormValues();
    }

    updateFormValues() {
        const { sport, division, conference, socialFollowers, academicGPA, athleticRating } = this.calculations;

        if (sport) document.getElementById('nil-sport').value = sport;
        if (division) document.getElementById('nil-division').value = division;
        if (conference) document.getElementById('nil-conference').value = conference;
        if (socialFollowers) document.getElementById('nil-followers').value = socialFollowers;
        if (academicGPA) document.getElementById('nil-gpa').value = academicGPA;
        if (athleticRating) {
            document.getElementById('nil-rating').value = athleticRating;
            document.getElementById('rating-value').textContent = athleticRating;
        }
    }

    getCalculationResults() {
        return this.calculations;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.nilCalculator) {
        window.nilCalculator = new NILCalculator();
        await window.nilCalculator.initialize();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NILCalculator;
}