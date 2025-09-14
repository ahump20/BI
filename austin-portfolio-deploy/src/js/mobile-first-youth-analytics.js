// Mobile-First Youth Analytics - Championship AI for $49/month
// Targeting 3M+ teams abandoned by Hudl's pricing increase

class MobileFirstYouthAnalytics {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window;
        this.currentPlan = 'grassroots'; // grassroots, professional, elite

        this.pricingTiers = {
            grassroots: {
                price: 49,
                annual: 588,
                features: ['AI Consciousness Basics', 'Mobile Video Analysis', 'Basic NIL Calculator', 'Team Management'],
                target: 'Youth Sports Teams',
                savings: '75% vs Hudl minimum'
            },
            professional: {
                price: 149,
                annual: 1788,
                features: ['Full AI Consciousness', 'Advanced Video Analysis', 'Complete NIL Suite', 'Recruiting Analytics'],
                target: 'High School Programs',
                savings: '67% vs Hudl premium'
            },
            elite: {
                price: 'Custom',
                annual: 'Custom',
                features: ['Enterprise AI', 'Hardware-Free Analytics', 'Custom Integration', 'Dedicated Support'],
                target: 'College/Professional',
                savings: '80% vs Catapult/Zebra'
            }
        };

        this.youthMarketFeatures = {
            'mobile-optimized': true,
            'touch-friendly': true,
            'simple-upload': true,
            'instant-feedback': true,
            'parent-portal': true,
            'coach-collaboration': true,
            'hardware-free': true,
            'ai-powered': true
        };

        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Optimize for mobile-first experience
            this.optimizeForMobile();

            // Create youth market interface
            this.createYouthMarketInterface();

            // Setup touch interactions
            this.setupTouchInteractions();

            // Initialize mobile analytics
            this.initializeMobileAnalytics();

            // Create competitive positioning
            this.createCompetitivePositioning();

            this.isInitialized = true;
            console.log('📱 Mobile-First Youth Analytics: Championship Mode for $49/month');

        } catch (error) {
            console.error('Mobile Youth Analytics Error:', error);
        }
    }

    optimizeForMobile() {
        // Add mobile-specific meta tags if not present
        if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
            const mobileOptimizations = [
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-title', content: 'Blaze Intelligence' }
            ];

            mobileOptimizations.forEach(meta => {
                const metaTag = document.createElement('meta');
                metaTag.name = meta.name;
                metaTag.content = meta.content;
                document.head.appendChild(metaTag);
            });
        }

        // Optimize touch targets
        this.optimizeTouchTargets();

        // Add mobile-specific CSS
        this.addMobileCSS();
    }

    optimizeTouchTargets() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile-First Touch Optimization */
            @media (max-width: 768px) {
                .btn, button, .control-btn, .tab-btn {
                    min-height: 44px !important;
                    min-width: 44px !important;
                    padding: 12px 20px !important;
                    font-size: 16px !important;
                    touch-action: manipulation;
                }

                .consciousness-slider::-webkit-slider-thumb {
                    width: 44px !important;
                    height: 44px !important;
                    min-width: 44px !important;
                    min-height: 44px !important;
                }

                .upload-zone {
                    min-height: 120px !important;
                    touch-action: manipulation;
                }

                input, select, textarea {
                    font-size: 16px !important; /* Prevents zoom on iOS */
                    min-height: 44px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Youth Market Mobile-First Styles */
            .youth-analytics-panel {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
                border: 2px solid #BF5700;
                border-radius: 16px;
                padding: 20px;
                margin: 15px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(15px);
                position: relative;
            }

            @media (max-width: 768px) {
                .youth-analytics-panel {
                    margin: 10px 5px;
                    padding: 15px;
                    border-radius: 12px;
                }

                .pricing-grid {
                    grid-template-columns: 1fr !important;
                    gap: 15px !important;
                }

                .feature-grid {
                    grid-template-columns: 1fr !important;
                }

                .mobile-cta {
                    position: sticky;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(191, 87, 0, 0.95);
                    padding: 15px;
                    text-align: center;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                }

                .mobile-upload {
                    width: 100%;
                    height: 200px;
                    border: 3px dashed #BF5700;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.3);
                    touch-action: manipulation;
                }

                .youth-feature-card {
                    background: rgba(155, 203, 235, 0.1);
                    border: 2px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    touch-action: manipulation;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .youth-feature-card:active {
                    transform: scale(0.98);
                    box-shadow: 0 5px 15px rgba(155, 203, 235, 0.3);
                }
            }

            .hudl-comparison {
                background: rgba(239, 68, 68, 0.1);
                border: 2px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
            }

            .hudl-comparison::before {
                content: '🎯 MASSIVE OPPORTUNITY';
                position: absolute;
                top: -10px;
                left: 20px;
                background: #EF4444;
                color: white;
                padding: 5px 15px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
            }

            .savings-highlight {
                background: linear-gradient(135deg, #22C55E, #16A34A);
                color: white;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                font-weight: 700;
                margin: 15px 0;
                box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
            }

            .mobile-analytics-demo {
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #9BCBEB;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
                overflow: hidden;
            }

            .demo-overlay {
                position: absolute;
                top: 10px;
                right: 15px;
                background: #22C55E;
                color: white;
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
            }
        `;
        document.head.appendChild(style);
    }

    createYouthMarketInterface() {
        const container = this.findOrCreateContainer();

        container.innerHTML = `
            <div class="youth-analytics-panel">
                <div class="panel-header">
                    <h3 class="youth-title">
                        <i class="fas fa-mobile-alt"></i>
                        Championship AI for Youth Sports
                    </h3>
                    <div class="youth-tagline">
                        Professional Analytics • Mobile-First • $49/month
                    </div>
                </div>

                <div class="hudl-comparison">
                    <h4 style="color: #EF4444; margin: 0 0 15px 0;">Hudl Abandoned Youth Sports</h4>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Hudl Previous Price:</div>
                            <div class="comparison-value old-price">$99/year</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Hudl Current Minimum:</div>
                            <div class="comparison-value current-price">$400+/year</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Blaze Grassroots:</div>
                            <div class="comparison-value our-price">$588/year</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Market Gap:</div>
                            <div class="comparison-value gap">3M+ Teams</div>
                        </div>
                    </div>
                </div>

                <div class="savings-highlight">
                    🏆 75% SAVINGS vs Hudl • Championship AI • Hardware-Free
                </div>

                <div class="pricing-tiers">
                    <h4 style="color: #BF5700; margin: 0 0 20px 0;">Championship Pricing Tiers</h4>
                    <div class="pricing-grid">
                        ${Object.entries(this.pricingTiers).map(([tier, data]) => `
                            <div class="pricing-card ${tier}" data-tier="${tier}">
                                <div class="tier-header">
                                    <div class="tier-name">${tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
                                    <div class="tier-price">
                                        ${typeof data.price === 'number' ? `$${data.price}/month` : data.price}
                                    </div>
                                    ${typeof data.annual === 'number' ? `<div class="tier-annual">$${data.annual}/year</div>` : ''}
                                </div>
                                <div class="tier-target">${data.target}</div>
                                <div class="tier-savings">${data.savings}</div>
                                <div class="tier-features">
                                    ${data.features.map(feature => `<div class="feature-item">✓ ${feature}</div>`).join('')}
                                </div>
                                <button class="tier-cta" onclick="selectTier('${tier}')">
                                    ${tier === 'grassroots' ? 'Start Free Trial' : tier === 'elite' ? 'Contact Sales' : 'Choose Plan'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mobile-analytics-demo">
                    <div class="demo-overlay">LIVE DEMO</div>
                    <h4 style="color: #9BCBEB; margin: 0 0 15px 0;">Mobile-First Analytics</h4>
                    <div class="mobile-upload" id="youth-upload-demo">
                        <i class="fas fa-video" style="font-size: 48px; color: #BF5700; margin-bottom: 15px;"></i>
                        <div style="color: #E2E8F0; font-size: 18px; font-weight: 600;">Tap to Upload Game Video</div>
                        <div style="color: #94A3B8; font-size: 14px; margin-top: 5px;">AI Analysis in under 30 seconds</div>
                    </div>
                    <div class="demo-results" id="youth-demo-results" style="display: none;">
                        <div class="result-metric">
                            <span class="metric-label">Player Performance:</span>
                            <span class="metric-value">94.2%</span>
                        </div>
                        <div class="result-metric">
                            <span class="metric-label">AI Consciousness:</span>
                            <span class="metric-value">Active</span>
                        </div>
                        <div class="result-metric">
                            <span class="metric-label">Analysis Time:</span>
                            <span class="metric-value">23 seconds</span>
                        </div>
                    </div>
                </div>

                <div class="youth-features">
                    <h4 style="color: #BF5700; margin: 0 0 20px 0;">Why Youth Teams Choose Blaze</h4>
                    <div class="feature-grid">
                        <div class="youth-feature-card">
                            <div class="feature-icon">📱</div>
                            <div class="feature-title">Mobile-First Design</div>
                            <div class="feature-description">Built for coaches and parents on-the-go. Full functionality on any device.</div>
                        </div>
                        <div class="youth-feature-card">
                            <div class="feature-icon">🧠</div>
                            <div class="feature-title">AI Consciousness</div>
                            <div class="feature-description">Only platform with real-time AI that adapts like a championship athlete.</div>
                        </div>
                        <div class="youth-feature-card">
                            <div class="feature-icon">🔧</div>
                            <div class="feature-title">Hardware-Free</div>
                            <div class="feature-description">No expensive sensors or equipment. Works with any camera or phone.</div>
                        </div>
                        <div class="youth-feature-card">
                            <div class="feature-icon">👨‍👩‍👧‍👦</div>
                            <div class="feature-title">Parent Portal</div>
                            <div class="feature-description">Keep parents engaged with player progress and team updates.</div>
                        </div>
                        <div class="youth-feature-card">
                            <div class="feature-icon">⚡</div>
                            <div class="feature-title">Instant Feedback</div>
                            <div class="feature-description">Real-time analysis and coaching insights in under 30 seconds.</div>
                        </div>
                        <div class="youth-feature-card">
                            <div class="feature-icon">🏆</div>
                            <div class="feature-title">Championship Proven</div>
                            <div class="feature-description">Created by Austin Humphrey, Texas #20 RB with championship experience.</div>
                        </div>
                    </div>
                </div>

                <div class="competitive-advantages">
                    <h4 style="color: #BF5700; margin: 0 0 20px 0;">Competitive Advantages</h4>
                    <div class="advantages-list">
                        <div class="advantage-row">
                            <div class="advantage-us">✅ Real-Time AI Consciousness</div>
                            <div class="advantage-them">❌ Static AI Models</div>
                        </div>
                        <div class="advantage-row">
                            <div class="advantage-us">✅ $588/year Championship AI</div>
                            <div class="advantage-them">❌ $400+ Minimum (Hudl)</div>
                        </div>
                        <div class="advantage-row">
                            <div class="advantage-us">✅ Mobile-First Professional</div>
                            <div class="advantage-them">❌ Desktop-Heavy Tools</div>
                        </div>
                        <div class="advantage-row">
                            <div class="advantage-us">✅ Hardware-Free Analytics</div>
                            <div class="advantage-them">❌ $5K+ Equipment Required</div>
                        </div>
                    </div>
                </div>
            </div>

            ${this.isMobile ? `
                <div class="mobile-cta">
                    <button class="cta-button" onclick="startFreeTrial()">
                        Start Your Free Championship Trial
                    </button>
                </div>
            ` : ''}

            <style>
                .youth-title {
                    color: #BF5700;
                    font-size: 24px;
                    font-weight: 900;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .youth-tagline {
                    color: #9BCBEB;
                    font-size: 14px;
                    font-weight: 600;
                    margin-top: 5px;
                    text-align: center;
                }

                .comparison-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                }

                .comparison-item {
                    text-align: center;
                }

                .comparison-label {
                    color: #94A3B8;
                    font-size: 12px;
                    margin-bottom: 5px;
                }

                .comparison-value {
                    font-weight: 700;
                    font-size: 16px;
                    font-family: 'JetBrains Mono', monospace;
                }

                .old-price { color: #6B7280; text-decoration: line-through; }
                .current-price { color: #EF4444; }
                .our-price { color: #22C55E; }
                .gap { color: #F59E0B; }

                .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }

                .pricing-card {
                    background: rgba(155, 203, 235, 0.1);
                    border: 2px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 25px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                }

                .pricing-card.grassroots {
                    border-color: #22C55E;
                    background: rgba(34, 197, 94, 0.1);
                }

                .pricing-card.grassroots::before {
                    content: '🎯 YOUTH MARKET';
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    background: #22C55E;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .pricing-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(155, 203, 235, 0.2);
                }

                .tier-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(155, 203, 235, 0.3);
                    padding-bottom: 15px;
                }

                .tier-name {
                    color: #E2E8F0;
                    font-size: 20px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .tier-price {
                    color: #BF5700;
                    font-size: 32px;
                    font-weight: 900;
                    font-family: 'JetBrains Mono', monospace;
                }

                .tier-annual {
                    color: #9BCBEB;
                    font-size: 14px;
                    margin-top: 5px;
                }

                .tier-target {
                    color: #F59E0B;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 10px;
                    font-size: 14px;
                }

                .tier-savings {
                    color: #22C55E;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 13px;
                }

                .tier-features {
                    margin-bottom: 25px;
                }

                .feature-item {
                    color: #E2E8F0;
                    margin-bottom: 8px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tier-cta {
                    width: 100%;
                    background: linear-gradient(135deg, #BF5700, #E67E22);
                    border: none;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 16px;
                }

                .tier-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(191, 87, 0, 0.4);
                }

                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }

                .feature-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                }

                .feature-title {
                    color: #E2E8F0;
                    font-weight: 700;
                    font-size: 16px;
                    margin-bottom: 8px;
                }

                .feature-description {
                    color: #94A3B8;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .advantages-list {
                    display: grid;
                    gap: 10px;
                }

                .advantage-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                }

                .advantage-us {
                    color: #22C55E;
                    font-weight: 600;
                }

                .advantage-them {
                    color: #EF4444;
                    font-weight: 600;
                }

                .result-metric {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding: 10px;
                    background: rgba(155, 203, 235, 0.1);
                    border-radius: 6px;
                }

                .metric-label {
                    color: #E2E8F0;
                }

                .metric-value {
                    color: #22C55E;
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                }

                .cta-button {
                    background: linear-gradient(135deg, #22C55E, #16A34A);
                    border: none;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 18px;
                    cursor: pointer;
                    width: 100%;
                    box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
                }
            </style>
        `;
    }

    findOrCreateContainer() {
        let container = document.getElementById('mobile-youth-analytics-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'mobile-youth-analytics-container';

            // Insert after competitive intelligence
            const competitiveSection = document.getElementById('competitive-intelligence-container') ||
                                     document.getElementById('nil-calculator-container') ||
                                     document.querySelector('main');

            if (competitiveSection) {
                competitiveSection.insertAdjacentElement('afterend', container);
            } else {
                document.body.appendChild(container);
            }
        }

        return container;
    }

    setupTouchInteractions() {
        if (!this.isTouch) return;

        // Enhanced touch interactions for mobile
        const uploadDemo = document.getElementById('youth-upload-demo');
        if (uploadDemo) {
            uploadDemo.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.simulateVideoUpload();
            });

            uploadDemo.addEventListener('click', () => {
                this.simulateVideoUpload();
            });
        }

        // Add haptic feedback for supported devices
        this.addHapticFeedback();
    }

    simulateVideoUpload() {
        const uploadArea = document.getElementById('youth-upload-demo');
        const resultsArea = document.getElementById('youth-demo-results');

        if (!uploadArea || !resultsArea) return;

        // Show upload simulation
        uploadArea.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #BF5700; margin-bottom: 15px;"></i>
            <div style="color: #E2E8F0; font-size: 18px; font-weight: 600;">Analyzing with AI Consciousness...</div>
            <div style="color: #94A3B8; font-size: 14px; margin-top: 5px;">23 seconds remaining</div>
        `;

        // Simulate analysis progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            const remaining = Math.max(0, 23 - Math.floor(progress / 4));

            uploadArea.innerHTML = `
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #BF5700; margin-bottom: 15px;"></i>
                <div style="color: #E2E8F0; font-size: 18px; font-weight: 600;">AI Consciousness: ${progress}%</div>
                <div style="color: #94A3B8; font-size: 14px; margin-top: 5px;">${remaining} seconds remaining</div>
            `;

            if (progress >= 100) {
                clearInterval(progressInterval);
                this.showAnalysisResults(uploadArea, resultsArea);
            }
        }, 200);
    }

    showAnalysisResults(uploadArea, resultsArea) {
        uploadArea.style.display = 'none';
        resultsArea.style.display = 'block';

        // Animate results appearance
        const metrics = resultsArea.querySelectorAll('.result-metric');
        metrics.forEach((metric, index) => {
            setTimeout(() => {
                metric.style.opacity = '0';
                metric.style.transform = 'translateY(20px)';
                metric.style.transition = 'all 0.5s ease';

                setTimeout(() => {
                    metric.style.opacity = '1';
                    metric.style.transform = 'translateY(0)';
                }, 100);
            }, index * 300);
        });

        // Add celebration effect
        this.triggerCelebration();

        // Reset after demo
        setTimeout(() => {
            uploadArea.style.display = 'flex';
            resultsArea.style.display = 'none';
            uploadArea.innerHTML = `
                <i class="fas fa-video" style="font-size: 48px; color: #BF5700; margin-bottom: 15px;"></i>
                <div style="color: #E2E8F0; font-size: 18px; font-weight: 600;">Tap to Upload Game Video</div>
                <div style="color: #94A3B8; font-size: 14px; margin-top: 5px;">AI Analysis in under 30 seconds</div>
            `;
        }, 5000);
    }

    triggerCelebration() {
        // Championship celebration effect
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 60px;
            z-index: 10000;
            pointer-events: none;
            animation: celebrationPulse 2s ease-out;
        `;
        celebration.textContent = '🏆';

        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.remove();
        }, 2000);

        // Add celebration animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebrationPulse {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    addHapticFeedback() {
        // Add vibration feedback for mobile interactions
        const addHaptic = (element, pattern = [50]) => {
            element.addEventListener('touchstart', () => {
                if (navigator.vibrate) {
                    navigator.vibrate(pattern);
                }
            });
        };

        // Add haptic feedback to key elements
        document.querySelectorAll('.youth-feature-card, .pricing-card, .tier-cta').forEach(element => {
            addHaptic(element);
        });
    }

    initializeMobileAnalytics() {
        // Track mobile-specific interactions
        if (this.isMobile) {
            this.trackMobileEngagement();
        }
    }

    trackMobileEngagement() {
        const engagementMetrics = {
            touches: 0,
            swipes: 0,
            uploads: 0,
            tierSelections: 0
        };

        // Track touch interactions
        document.addEventListener('touchstart', () => {
            engagementMetrics.touches++;
        });

        // Track swipe gestures
        let startY = 0;
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;

            if (Math.abs(diff) > 50) {
                engagementMetrics.swipes++;
            }
        });

        // Log engagement metrics periodically
        setInterval(() => {
            console.log('📱 Mobile Engagement:', engagementMetrics);
        }, 30000);

        // Store in window for analytics integration
        window.mobileEngagement = engagementMetrics;
    }

    createCompetitivePositioning() {
        // Add competitive positioning elements throughout the interface
        const competitiveMessages = [
            "3M+ teams need affordable championship AI",
            "Hudl abandoned youth sports - we didn't",
            "Hardware-free = no $5K equipment costs",
            "Mobile-first = coaches can use anywhere"
        ];

        let messageIndex = 0;
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(191, 87, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            z-index: 999;
            backdrop-filter: blur(10px);
            text-align: center;
            max-width: 90%;
            display: none;
        `;

        document.body.appendChild(messageElement);

        // Rotate competitive messages
        setInterval(() => {
            messageElement.textContent = competitiveMessages[messageIndex];
            messageElement.style.display = 'block';

            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);

            messageIndex = (messageIndex + 1) % competitiveMessages.length;
        }, 8000);
    }

    // Public API methods
    selectTier(tier) {
        console.log(`Selected tier: ${tier}`);

        if (window.competitiveIntelligence) {
            window.competitiveIntelligence.showOpportunity('youthMarket');
        }

        // Track tier selection
        if (window.mobileEngagement) {
            window.mobileEngagement.tierSelections++;
        }

        // Show tier-specific messaging
        this.showTierMessage(tier);
    }

    showTierMessage(tier) {
        const messages = {
            grassroots: "Perfect for youth teams! Start your championship journey with AI consciousness.",
            professional: "High school excellence! Advanced AI for competitive programs.",
            elite: "Championship caliber! Custom enterprise solutions for serious programs."
        };

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 41, 59, 0.95);
            border: 2px solid #BF5700;
            border-radius: 12px;
            padding: 25px;
            color: #E2E8F0;
            text-align: center;
            z-index: 10000;
            backdrop-filter: blur(15px);
            max-width: 90%;
        `;

        messageDiv.innerHTML = `
            <h4 style="color: #BF5700; margin: 0 0 15px 0;">${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Selected</h4>
            <p style="margin: 0 0 20px 0;">${messages[tier]}</p>
            <button onclick="this.parentElement.remove()" style="background: #BF5700; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Continue
            </button>
        `;

        document.body.appendChild(messageDiv);
    }

    startFreeTrial() {
        console.log('🚀 Starting free championship trial for youth market');

        // Track trial start
        if (window.mobileEngagement) {
            window.mobileEngagement.trialStarts = (window.mobileEngagement.trialStarts || 0) + 1;
        }

        // Show trial activation
        const trialDiv = document.createElement('div');
        trialDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        trialDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 90%;">
                <div style="font-size: 60px; margin-bottom: 20px;">🏆</div>
                <h2 style="margin: 0 0 15px 0;">Championship Trial Activated!</h2>
                <p style="margin: 0 0 25px 0;">Welcome to the future of youth sports analytics</p>
                <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: 700;">
                    Let's Go!
                </button>
            </div>
        `;

        document.body.appendChild(trialDiv);
    }

    destroy() {
        const containers = [
            'mobile-youth-analytics-container'
        ];

        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });
    }
}

// Global functions for button interactions
window.selectTier = (tier) => {
    if (window.mobileYouthAnalytics) {
        window.mobileYouthAnalytics.selectTier(tier);
    }
};

window.startFreeTrial = () => {
    if (window.mobileYouthAnalytics) {
        window.mobileYouthAnalytics.startFreeTrial();
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.mobileYouthAnalytics) {
        window.mobileYouthAnalytics = new MobileFirstYouthAnalytics();
        await window.mobileYouthAnalytics.initialize();

        console.log('📱 Mobile-First Youth Analytics: Targeting 3M+ Teams with Championship AI');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileFirstYouthAnalytics;
}