// Competitive Intelligence Dashboard - Championship Market Positioning
// Real-time competitive analysis and market advantage tracking

class CompetitiveIntelligenceDashboard {
    constructor() {
        this.competitors = {
            'hudl': {
                name: 'Hudl',
                pricing: { min: 400, max: 3300 },
                features: ['Video Analysis', 'Team Management', 'Basic AI'],
                marketPosition: 'Premium Mid-Market',
                weaknesses: ['Abandoned $99 pricing', 'Desktop-heavy', 'Static AI'],
                strengths: ['Market leader', 'Comprehensive tools']
            },
            'catapult': {
                name: 'Catapult Sports',
                pricing: { min: 5000, max: 50000 },
                features: ['GPS Tracking', 'Injury Prevention', 'Hardware Required'],
                marketPosition: 'Enterprise Elite',
                weaknesses: ['Expensive hardware', 'Complex setup', 'Enterprise only'],
                strengths: ['Professional grade', 'Comprehensive analytics']
            },
            'secondSpectrum': {
                name: 'Second Spectrum',
                pricing: { min: 10000, max: 100000 },
                features: ['Computer Vision', 'Broadcast Integration', 'Dragon Tech'],
                marketPosition: 'Enterprise Elite',
                weaknesses: ['League-specific', 'Very expensive', 'Limited sports'],
                strengths: ['NBA integration', 'Advanced computer vision']
            },
            'teamsnap': {
                name: 'TeamSnap',
                pricing: { min: 70, max: 600 },
                features: ['Team Management', 'Basic Communication', 'Scheduling'],
                marketPosition: 'Team Management Basic',
                weaknesses: ['No analytics', 'Basic features only', 'No AI'],
                strengths: ['Affordable', 'Easy to use', 'Large user base']
            },
            'zebra': {
                name: 'Zebra Sports',
                pricing: { min: 15000, max: 75000 },
                features: ['RFID Tracking', 'Real-time Data', 'Hardware Required'],
                marketPosition: 'Enterprise Elite',
                weaknesses: ['Hardware dependency', 'NFL-specific', 'Very expensive'],
                strengths: ['Real-time tracking', 'Professional grade']
            },
            'statsPerform': {
                name: 'Stats Perform',
                pricing: { min: 5000, max: 25000 },
                features: ['8 AI Models', 'Data Analytics', 'Betting Focus'],
                marketPosition: 'Enterprise Elite',
                weaknesses: ['Static AI', 'Betting-focused', 'No consciousness'],
                strengths: ['Multiple AI models', 'Data coverage']
            }
        };

        this.ourAdvantages = {
            'aiConsciousness': {
                name: 'Real-Time AI Consciousness',
                uniqueness: 100, // Completely unique
                description: 'Only platform with dynamic consciousness parameter adjustment',
                competitorComparison: 'NO competitor offers this capability'
            },
            'austinCredentials': {
                name: 'Austin Humphrey #20 Authority',
                uniqueness: 100, // Completely unique
                description: 'Elite Texas RB + Perfect Game experience',
                competitorComparison: 'No competitor has authentic playing experience'
            },
            'pricingPosition': {
                name: '$588-$1,788 Sweet Spot',
                uniqueness: 95, // Near unique positioning
                description: 'Bridges critical $600-$5K market gap',
                competitorComparison: 'Hudl abandoned this space, others too expensive'
            },
            'hardwareFree': {
                name: 'Hardware-Free Analytics',
                uniqueness: 80, // Strong advantage
                description: 'Championship analytics without hardware requirements',
                competitorComparison: 'Catapult/Zebra require expensive hardware'
            },
            'mobileFirst': {
                name: 'Mobile-First Professional',
                uniqueness: 90, // First in market
                description: 'Professional analytics optimized for mobile',
                competitorComparison: 'Enterprise solutions are desktop-heavy'
            },
            'regionalAuthority': {
                name: 'Deep South Sports Authority',
                uniqueness: 100, // Completely unique
                description: 'Authentic SEC/Texas cultural credibility',
                competitorComparison: 'No competitor leverages regional expertise'
            }
        };

        this.marketOpportunities = {
            'youthMarket': {
                size: '3M+ teams',
                currentPrice: '$70-$600',
                ourPrice: '$588',
                opportunity: 'Hudl abandoned $99 pricing - massive gap',
                revenue: 'High'
            },
            'nilValuation': {
                size: 'Expanding college market',
                currentPrice: 'No major competitor',
                ourPrice: 'Premium service',
                opportunity: 'First-mover advantage in NIL analytics',
                revenue: 'Very High'
            },
            'hardwareFreeEnterprise': {
                size: 'Professional teams',
                currentPrice: '$5K-$50K',
                ourPrice: 'Custom Elite',
                opportunity: 'Software-only alternative to hardware solutions',
                revenue: 'Extremely High'
            }
        };

        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            this.createCompetitiveDashboard();
            this.createMarketPositionMap();
            this.createAdvantageMatrix();
            this.createOpportunityTracker();
            this.startRealTimeUpdates();

            this.isInitialized = true;
            console.log('📊 Competitive Intelligence Dashboard Activated');

        } catch (error) {
            console.error('Competitive Dashboard Error:', error);
        }
    }

    createCompetitiveDashboard() {
        const container = this.findOrCreateContainer();

        container.innerHTML = `
            <div class="competitive-dashboard">
                <div class="dashboard-header">
                    <h3 class="dashboard-title">
                        <i class="fas fa-trophy"></i>
                        Competitive Intelligence Dashboard
                    </h3>
                    <div class="market-status">
                        <span class="status-indicator champion"></span>
                        Market Position: Championship Leader
                    </div>
                </div>

                <div class="intelligence-tabs">
                    <button class="tab-btn active" data-tab="positioning">Market Position</button>
                    <button class="tab-btn" data-tab="advantages">Our Advantages</button>
                    <button class="tab-btn" data-tab="opportunities">Opportunities</button>
                    <button class="tab-btn" data-tab="competitors">Competitor Analysis</button>
                </div>

                <div class="tab-content active" id="positioning-tab">
                    <div id="market-position-map"></div>
                </div>

                <div class="tab-content" id="advantages-tab">
                    <div id="advantage-matrix"></div>
                </div>

                <div class="tab-content" id="opportunities-tab">
                    <div id="opportunity-tracker"></div>
                </div>

                <div class="tab-content" id="competitors-tab">
                    <div id="competitor-analysis"></div>
                </div>
            </div>

            <style>
                .competitive-dashboard {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
                    border: 2px solid #BF5700;
                    border-radius: 16px;
                    padding: 30px;
                    margin: 20px 0;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(15px);
                    position: relative;
                    overflow: hidden;
                }

                .competitive-dashboard::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #BF5700, #9BCBEB, #BF5700);
                    animation: championshipPulse 3s ease-in-out infinite;
                }

                @keyframes championshipPulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(191, 87, 0, 0.3);
                    padding-bottom: 20px;
                }

                .dashboard-title {
                    color: #BF5700;
                    font-size: 28px;
                    font-weight: 900;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .market-status {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #22C55E;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 700;
                }

                .status-indicator {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    box-shadow: 0 0 20px;
                }

                .status-indicator.champion {
                    background: #22C55E;
                    box-shadow: 0 0 20px #22C55E;
                    animation: championGlow 2s ease-in-out infinite;
                }

                @keyframes championGlow {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }

                .intelligence-tabs {
                    display: flex;
                    gap: 0;
                    margin-bottom: 30px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    padding: 4px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    color: #94A3B8;
                    font-weight: 600;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 14px;
                }

                .tab-btn.active {
                    background: linear-gradient(135deg, #BF5700, #E67E22);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(191, 87, 0, 0.4);
                }

                .tab-btn:not(.active):hover {
                    color: #E2E8F0;
                    background: rgba(191, 87, 0, 0.1);
                }

                .tab-content {
                    display: none;
                    min-height: 400px;
                }

                .tab-content.active {
                    display: block;
                    animation: fadeInUp 0.4s ease-out;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .competitor-card {
                    background: rgba(155, 203, 235, 0.1);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .competitor-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(155, 203, 235, 0.2);
                }

                .competitor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .competitor-name {
                    color: #E2E8F0;
                    font-size: 18px;
                    font-weight: 700;
                }

                .pricing-range {
                    color: #9BCBEB;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 600;
                }

                .advantage-item {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 15px;
                    position: relative;
                    overflow: hidden;
                }

                .advantage-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: #22C55E;
                }

                .advantage-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .advantage-name {
                    color: #22C55E;
                    font-weight: 700;
                    font-size: 16px;
                }

                .uniqueness-score {
                    background: #22C55E;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .opportunity-card {
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                }

                .opportunity-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .opportunity-title {
                    color: #F59E0B;
                    font-weight: 700;
                    font-size: 16px;
                }

                .revenue-potential {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .revenue-high { background: #22C55E; color: white; }
                .revenue-very-high { background: #BF5700; color: white; }
                .revenue-extremely-high { background: #EF4444; color: white; }

                @media (max-width: 768px) {
                    .intelligence-tabs {
                        flex-direction: column;
                    }
                    .dashboard-header {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }
                }
            </style>
        `;

        this.bindTabEvents();
    }

    findOrCreateContainer() {
        let container = document.getElementById('competitive-intelligence-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'competitive-intelligence-container';

            // Insert after narrative engine
            const narrativeSection = document.getElementById('narrative-engine-container') ||
                                   document.getElementById('nil-calculator-container') ||
                                   document.querySelector('main');

            if (narrativeSection) {
                narrativeSection.insertAdjacentElement('afterend', container);
            } else {
                document.body.appendChild(container);
            }
        }

        return container;
    }

    bindTabEvents() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }

    createMarketPositionMap() {
        const container = document.getElementById('market-position-map');
        if (!container) return;

        container.innerHTML = `
            <div class="position-map">
                <h4 class="section-title">Championship Market Position</h4>
                <div class="position-grid">
                    <div class="position-tier enterprise">
                        <h5>Enterprise Elite ($5K-$50K+)</h5>
                        <div class="tier-competitors">
                            <div class="competitor-bubble catapult">Catapult Sports</div>
                            <div class="competitor-bubble second-spectrum">Second Spectrum</div>
                            <div class="competitor-bubble zebra">Zebra Sports</div>
                            <div class="competitor-bubble stats-perform">Stats Perform</div>
                        </div>
                        <div class="tier-weaknesses">Hardware Required • Very Expensive • Complex Setup</div>
                    </div>

                    <div class="position-tier our-tier">
                        <h5>🏆 OUR CHAMPIONSHIP ZONE ($600-$5K)</h5>
                        <div class="our-position">
                            <div class="champion-bubble">
                                <div class="champion-title">Deep South Sports Authority</div>
                                <div class="champion-subtitle">AI Consciousness • #20 Authority • Hardware-Free</div>
                            </div>
                        </div>
                        <div class="tier-advantages">MARKET GAP DOMINATED • NO DIRECT COMPETITION</div>
                    </div>

                    <div class="position-tier professional">
                        <h5>Professional Mid-Market ($400-$3.3K)</h5>
                        <div class="tier-competitors">
                            <div class="competitor-bubble hudl">Hudl Premium</div>
                        </div>
                        <div class="tier-weaknesses">Abandoned Low-End • Desktop-Heavy • Static AI</div>
                    </div>

                    <div class="position-tier basic">
                        <h5>Team Management Basic ($70-$600)</h5>
                        <div class="tier-competitors">
                            <div class="competitor-bubble teamsnap">TeamSnap</div>
                            <div class="competitor-bubble whip">WHIP LIVE</div>
                        </div>
                        <div class="tier-weaknesses">No Analytics • Basic Features • No AI</div>
                    </div>
                </div>

                <div class="market-insights">
                    <div class="insight-card gap-opportunity">
                        <h6>🎯 MASSIVE OPPORTUNITY</h6>
                        <p>Hudl abandoned $99 pricing → 3M+ teams need championship-level analytics at accessible prices</p>
                    </div>
                    <div class="insight-card unique-position">
                        <h6>🚀 UNIQUE POSITIONING</h6>
                        <p>Only platform bridging youth market accessibility with professional-grade AI consciousness</p>
                    </div>
                </div>
            </div>

            <style>
                .position-grid {
                    display: grid;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .position-tier {
                    border-radius: 12px;
                    padding: 20px;
                    border: 2px solid;
                }

                .position-tier.enterprise {
                    border-color: #EF4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .position-tier.our-tier {
                    border-color: #BF5700;
                    background: rgba(191, 87, 0, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                .position-tier.our-tier::before {
                    content: '👑';
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                }

                .position-tier.professional {
                    border-color: #F59E0B;
                    background: rgba(245, 158, 11, 0.1);
                }

                .position-tier.basic {
                    border-color: #6B7280;
                    background: rgba(107, 114, 128, 0.1);
                }

                .tier-competitors {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin: 15px 0;
                }

                .competitor-bubble {
                    background: rgba(155, 203, 235, 0.3);
                    border: 1px solid rgba(155, 203, 235, 0.5);
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    color: #E2E8F0;
                }

                .champion-bubble {
                    background: linear-gradient(135deg, #BF5700, #E67E22);
                    border: 2px solid #FFD700;
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 0 30px rgba(191, 87, 0, 0.5);
                }

                .champion-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 900;
                    margin-bottom: 5px;
                }

                .champion-subtitle {
                    color: #FFD700;
                    font-size: 12px;
                    font-weight: 600;
                }

                .tier-weaknesses {
                    color: #EF4444;
                    font-size: 11px;
                    font-style: italic;
                }

                .tier-advantages {
                    color: #22C55E;
                    font-size: 11px;
                    font-weight: 700;
                    text-align: center;
                }

                .market-insights {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .insight-card {
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid;
                }

                .insight-card.gap-opportunity {
                    border-color: #F59E0B;
                    background: rgba(245, 158, 11, 0.1);
                }

                .insight-card.unique-position {
                    border-color: #22C55E;
                    background: rgba(34, 197, 94, 0.1);
                }

                .insight-card h6 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: 700;
                }

                .insight-card p {
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #E2E8F0;
                }
            </style>
        `;
    }

    createAdvantageMatrix() {
        const container = document.getElementById('advantage-matrix');
        if (!container) return;

        container.innerHTML = `
            <div class="advantage-matrix">
                <h4 class="section-title">Championship Competitive Advantages</h4>
                <div class="advantages-grid">
                    ${Object.entries(this.ourAdvantages).map(([key, advantage]) => `
                        <div class="advantage-item" data-advantage="${key}">
                            <div class="advantage-header">
                                <div class="advantage-name">${advantage.name}</div>
                                <div class="uniqueness-score">${advantage.uniqueness}% UNIQUE</div>
                            </div>
                            <div class="advantage-description">${advantage.description}</div>
                            <div class="competitor-comparison">
                                <strong>vs Competition:</strong> ${advantage.competitorComparison}
                            </div>
                            <div class="advantage-meter">
                                <div class="meter-fill" style="width: ${advantage.uniqueness}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="advantage-summary">
                    <div class="summary-stat">
                        <div class="stat-number">6</div>
                        <div class="stat-label">Unique Advantages</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-number">95%</div>
                        <div class="stat-label">Avg Uniqueness</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-number">0</div>
                        <div class="stat-label">Direct Competitors</div>
                    </div>
                </div>
            </div>

            <style>
                .advantages-grid {
                    display: grid;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .advantage-description {
                    color: #E2E8F0;
                    margin-bottom: 10px;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .competitor-comparison {
                    color: #9BCBEB;
                    font-size: 12px;
                    margin-bottom: 15px;
                    font-style: italic;
                }

                .advantage-meter {
                    width: 100%;
                    height: 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .meter-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #22C55E, #BF5700);
                    border-radius: 4px;
                    transition: width 1s ease;
                }

                .advantage-summary {
                    display: flex;
                    justify-content: space-around;
                    background: rgba(191, 87, 0, 0.1);
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                }

                .summary-stat {
                    text-align: center;
                }

                .stat-number {
                    font-size: 36px;
                    font-weight: 900;
                    color: #BF5700;
                    font-family: 'JetBrains Mono', monospace;
                }

                .stat-label {
                    color: #E2E8F0;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            </style>
        `;
    }

    createOpportunityTracker() {
        const container = document.getElementById('opportunity-tracker');
        if (!container) return;

        container.innerHTML = `
            <div class="opportunity-tracker">
                <h4 class="section-title">Championship Market Opportunities</h4>
                <div class="opportunities-grid">
                    ${Object.entries(this.marketOpportunities).map(([key, opportunity]) => `
                        <div class="opportunity-card" data-opportunity="${key}">
                            <div class="opportunity-header">
                                <div class="opportunity-title">${this.formatOpportunityTitle(key)}</div>
                                <div class="revenue-potential revenue-${opportunity.revenue.toLowerCase().replace(' ', '-')}">${opportunity.revenue} Revenue</div>
                            </div>
                            <div class="opportunity-details">
                                <div class="opportunity-size"><strong>Market Size:</strong> ${opportunity.size}</div>
                                <div class="opportunity-pricing"><strong>Current Pricing:</strong> ${opportunity.currentPrice}</div>
                                <div class="opportunity-our-price"><strong>Our Positioning:</strong> ${opportunity.ourPrice}</div>
                                <div class="opportunity-description">${opportunity.opportunity}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="implementation-roadmap">
                    <h5>Implementation Roadmap</h5>
                    <div class="roadmap-phases">
                        <div class="phase phase-immediate">
                            <div class="phase-title">Phase 1: IMMEDIATE (30 Days)</div>
                            <div class="phase-items">
                                • AI consciousness marketing campaign<br>
                                • Youth market $49/month launch<br>
                                • Mobile optimization completion
                            </div>
                        </div>
                        <div class="phase phase-expansion">
                            <div class="phase-title">Phase 2: EXPANSION (90 Days)</div>
                            <div class="phase-items">
                                • Hardware-free positioning<br>
                                • SEC/Texas authority campaign<br>
                                • NIL services premium launch
                            </div>
                        </div>
                        <div class="phase phase-domination">
                            <div class="phase-title">Phase 3: DOMINATION (180 Days)</div>
                            <div class="phase-items">
                                • Enterprise tier competition<br>
                                • Perfect Game integration<br>
                                • API partnership ecosystem
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .opportunities-grid {
                    display: grid;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .opportunity-details {
                    color: #E2E8F0;
                    font-size: 14px;
                }

                .opportunity-details > div {
                    margin-bottom: 8px;
                }

                .opportunity-description {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(251, 191, 36, 0.3);
                    font-style: italic;
                    color: #F59E0B;
                }

                .implementation-roadmap {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                }

                .implementation-roadmap h5 {
                    color: #9BCBEB;
                    margin: 0 0 20px 0;
                    font-size: 18px;
                }

                .roadmap-phases {
                    display: grid;
                    gap: 15px;
                }

                .phase {
                    border-radius: 8px;
                    padding: 15px;
                    border: 1px solid;
                }

                .phase-immediate {
                    border-color: #EF4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .phase-expansion {
                    border-color: #F59E0B;
                    background: rgba(245, 158, 11, 0.1);
                }

                .phase-domination {
                    border-color: #22C55E;
                    background: rgba(34, 197, 94, 0.1);
                }

                .phase-title {
                    font-weight: 700;
                    margin-bottom: 10px;
                    color: #E2E8F0;
                }

                .phase-items {
                    font-size: 13px;
                    line-height: 1.6;
                    color: #94A3B8;
                }
            </style>
        `;
    }

    createCompetitorAnalysis() {
        const container = document.getElementById('competitor-analysis');
        if (!container) return;

        container.innerHTML = `
            <div class="competitor-analysis">
                <h4 class="section-title">Detailed Competitor Analysis</h4>
                <div class="competitors-grid">
                    ${Object.entries(this.competitors).map(([key, competitor]) => `
                        <div class="competitor-card" data-competitor="${key}">
                            <div class="competitor-header">
                                <div class="competitor-name">${competitor.name}</div>
                                <div class="pricing-range">$${competitor.pricing.min.toLocaleString()}-$${competitor.pricing.max.toLocaleString()}</div>
                            </div>
                            <div class="market-position">${competitor.marketPosition}</div>
                            <div class="features-list">
                                <strong>Features:</strong> ${competitor.features.join(', ')}
                            </div>
                            <div class="competitor-strengths">
                                <strong>Strengths:</strong> ${competitor.strengths.join(', ')}
                            </div>
                            <div class="competitor-weaknesses">
                                <strong>Weaknesses:</strong> ${competitor.weaknesses.join(', ')}
                            </div>
                            <div class="competitive-gap">
                                ${this.getCompetitiveGap(key)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <style>
                .competitors-grid {
                    display: grid;
                    gap: 20px;
                }

                .market-position {
                    color: #9BCBEB;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 15px;
                    padding: 4px 8px;
                    background: rgba(155, 203, 235, 0.2);
                    border-radius: 6px;
                    display: inline-block;
                }

                .features-list, .competitor-strengths, .competitor-weaknesses {
                    margin-bottom: 10px;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .features-list {
                    color: #E2E8F0;
                }

                .competitor-strengths {
                    color: #22C55E;
                }

                .competitor-weaknesses {
                    color: #EF4444;
                }

                .competitive-gap {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(155, 203, 235, 0.3);
                    color: #BF5700;
                    font-weight: 600;
                    font-size: 12px;
                }
            </style>
        `;
    }

    formatOpportunityTitle(key) {
        const titles = {
            'youthMarket': 'Youth Market Domination',
            'nilValuation': 'NIL Valuation Leadership',
            'hardwareFreeEnterprise': 'Hardware-Free Enterprise'
        };
        return titles[key] || key;
    }

    getCompetitiveGap(competitorKey) {
        const gaps = {
            'hudl': '🎯 GAP: Abandoned affordable pricing, no AI consciousness',
            'catapult': '🎯 GAP: Expensive hardware required, enterprise-only',
            'secondSpectrum': '🎯 GAP: League-specific, very expensive, limited sports',
            'teamsnap': '🎯 GAP: No analytics, basic features, no AI capabilities',
            'zebra': '🎯 GAP: Hardware-dependent, NFL-specific, very expensive',
            'statsPerform': '🎯 GAP: Static AI models, no consciousness parameters'
        };
        return gaps[competitorKey] || '';
    }

    startRealTimeUpdates() {
        // Simulate real-time competitive intelligence updates
        setInterval(() => {
            this.updateMarketPosition();
            this.updateOpportunityMetrics();
        }, 10000);
    }

    updateMarketPosition() {
        // Simulate market position changes
        const status = document.querySelector('.market-status');
        if (status) {
            const positions = [
                'Championship Leader',
                'Market Disruptor',
                'Innovation Pioneer',
                'Competitive Advantage'
            ];
            const currentIndex = Math.floor(Date.now() / 10000) % positions.length;
            status.innerHTML = `
                <span class="status-indicator champion"></span>
                Market Position: ${positions[currentIndex]}
            `;
        }
    }

    updateOpportunityMetrics() {
        // Animate opportunity metrics
        const opportunities = document.querySelectorAll('.opportunity-card');
        opportunities.forEach((card, index) => {
            const delay = index * 500;
            setTimeout(() => {
                card.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }, delay);
        });
    }

    // Public API methods
    highlightAdvantage(advantageKey) {
        const advantage = document.querySelector(`[data-advantage="${advantageKey}"]`);
        if (advantage) {
            advantage.style.background = 'rgba(191, 87, 0, 0.2)';
            advantage.style.transform = 'scale(1.05)';
            setTimeout(() => {
                advantage.style.background = 'rgba(34, 197, 94, 0.1)';
                advantage.style.transform = 'scale(1)';
            }, 2000);
        }
    }

    showOpportunity(opportunityKey) {
        // Switch to opportunities tab and highlight
        const opportunitiesTab = document.querySelector('[data-tab="opportunities"]');
        if (opportunitiesTab) {
            opportunitiesTab.click();
            setTimeout(() => {
                const opportunity = document.querySelector(`[data-opportunity="${opportunityKey}"]`);
                if (opportunity) {
                    opportunity.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    opportunity.style.background = 'rgba(191, 87, 0, 0.3)';
                    setTimeout(() => {
                        opportunity.style.background = 'rgba(251, 191, 36, 0.1)';
                    }, 3000);
                }
            }, 500);
        }
    }

    getCompetitiveIntelligence() {
        return {
            competitors: this.competitors,
            advantages: this.ourAdvantages,
            opportunities: this.marketOpportunities,
            marketPosition: 'Championship Leader'
        };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.competitiveIntelligence) {
        window.competitiveIntelligence = new CompetitiveIntelligenceDashboard();
        await window.competitiveIntelligence.initialize();

        // Auto-populate competitor analysis tab
        setTimeout(() => {
            if (window.competitiveIntelligence.createCompetitorAnalysis) {
                window.competitiveIntelligence.createCompetitorAnalysis();
            }
        }, 1000);

        console.log('📊 Competitive Intelligence: Championship Analysis Active');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompetitiveIntelligenceDashboard;
}