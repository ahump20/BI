/**
 * BLAZE INTELLIGENCE - MOBILE CHAMPIONSHIP DATA VISUALIZATION ENGINE
 * Optimized mobile experience for championship-grade analytics
 * Austin Humphrey - blazesportsintel.com - Deep South Sports Authority
 */

class BlazeIntelligenceMobileEngine {
    constructor() {
        this.isMobile = this.detectMobileDevice();
        this.deviceCapabilities = this.assessDeviceCapabilities();
        this.touchGestures = new Map();
        this.mobileCharts = new Map();
        this.adaptiveUI = null;

        // Mobile-optimized performance settings
        this.mobileConfig = {
            maxParticles: this.deviceCapabilities.tier === 'high' ? 800 :
                         this.deviceCapabilities.tier === 'medium' ? 400 : 200,
            animationDuration: this.deviceCapabilities.tier === 'high' ? 600 :
                              this.deviceCapabilities.tier === 'medium' ? 400 : 250,
            chartUpdateInterval: this.deviceCapabilities.tier === 'high' ? 5000 :
                                this.deviceCapabilities.tier === 'medium' ? 8000 : 12000,
            maxConcurrentAnimations: this.deviceCapabilities.tier === 'high' ? 6 :
                                    this.deviceCapabilities.tier === 'medium' ? 4 : 2
        };

        // Championship teams optimized for mobile display
        this.mobileTeamConfigs = {
            cardinals: {
                displayName: 'STL Cardinals',
                emoji: '⚾',
                primaryColor: '#C41E3A',
                sport: 'MLB',
                shortStats: ['Wins', 'Playoff %', 'ERA', 'OPS']
            },
            titans: {
                displayName: 'TEN Titans',
                emoji: '🏈',
                primaryColor: '#4B92DB',
                sport: 'NFL',
                shortStats: ['Wins', 'Playoff %', 'PPG', 'YPG']
            },
            longhorns: {
                displayName: 'TX Longhorns',
                emoji: '🤘',
                primaryColor: '#BF5700',
                sport: 'NCAA',
                shortStats: ['Wins', 'Playoff %', 'Recruit Rank', 'PPG']
            },
            grizzlies: {
                displayName: 'MEM Grizzlies',
                emoji: '🐻',
                primaryColor: '#00B2A9',
                sport: 'NBA',
                shortStats: ['Wins', 'Playoff %', 'PPG', 'RPG']
            }
        };

        this.initialize();
    }

    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

        return {
            isMobile: mobileRegex.test(userAgent),
            isTablet: /iPad|Android(?=.*Mobile)/i.test(userAgent),
            isPhone: /iPhone|Android.*Mobile/i.test(userAgent),
            iOS: /iPad|iPhone|iPod/.test(userAgent),
            android: /Android/i.test(userAgent),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }

    assessDeviceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        let gpuInfo = 'unknown';
        let memoryInfo = null;

        try {
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }

                const memoryExt = gl.getExtension('WEBGL_lose_context');
                if (memoryExt) {
                    memoryInfo = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                }
            }
        } catch (error) {
            console.warn('GPU assessment failed:', error);
        }

        // Assess device tier based on multiple factors
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        const screenSize = window.innerWidth * window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;

        let tier = 'medium';
        let score = 0;

        // CPU score
        if (cores >= 8) score += 30;
        else if (cores >= 6) score += 20;
        else if (cores >= 4) score += 10;

        // Memory score
        if (memory >= 8) score += 25;
        else if (memory >= 4) score += 15;
        else if (memory >= 2) score += 5;

        // GPU score (simplified)
        if (gpuInfo.includes('Adreno 6') || gpuInfo.includes('Mali-G7') ||
            gpuInfo.includes('A14') || gpuInfo.includes('A15')) {
            score += 25;
        } else if (gpuInfo.includes('Adreno 5') || gpuInfo.includes('Mali-G5')) {
            score += 15;
        } else if (gl) {
            score += 10;
        }

        // Screen score
        if (screenSize > 2000000 && pixelRatio > 2) score += 15;
        else if (screenSize > 1000000) score += 10;
        else score += 5;

        // Determine tier
        if (score >= 80) tier = 'high';
        else if (score >= 50) tier = 'medium';
        else tier = 'low';

        return {
            tier,
            score,
            cores,
            memory,
            gpuInfo,
            webGL2: !!gl?.getParameter?.(gl.VERSION)?.includes('2.0'),
            maxTextureSize: memoryInfo || 2048,
            supportedExtensions: gl ? gl.getSupportedExtensions() : []
        };
    }

    initialize() {
        if (!this.isMobile.isMobile) {
            console.log('📱 Mobile optimization skipped - Desktop detected');
            return;
        }

        console.log(`📱 Mobile Championship Engine Initializing - ${this.deviceCapabilities.tier.toUpperCase()} tier device`);

        this.createMobileInterface();
        this.optimizeFor3D();
        this.setupTouchGestures();
        this.createMobileCharts();
        this.enableMobileAnimations();
        this.startMobileDataStreams();
        this.setupMobilePerformanceMonitoring();

        console.log('📱 Mobile Championship Experience ACTIVE');
    }

    createMobileInterface() {
        // Override desktop layout with mobile-optimized version
        this.injectMobileStyles();
        this.createMobileNavigation();
        this.createSwipeableTeamCards();
        this.createMobileControlPanel();
        this.adaptChartsForMobile();
    }

    injectMobileStyles() {
        const mobileStyles = document.createElement('style');
        mobileStyles.id = 'mobile-championship-styles';
        mobileStyles.textContent = `
            @media (max-width: 768px) {
                /* Mobile Container Adjustments */
                #championship-3d-container {
                    position: relative;
                    height: 60vh;
                    margin-top: 60px;
                }

                /* Mobile Header Optimization */
                .championship-header {
                    position: fixed;
                    padding: 8px 15px;
                    backdrop-filter: blur(10px);
                }

                .header-content {
                    flex-direction: column;
                    gap: 10px;
                }

                .blaze-logo {
                    font-size: 1.4rem;
                }

                .championship-stats {
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                }

                .stat-item {
                    padding: 4px 8px;
                    min-width: 60px;
                }

                .stat-value {
                    font-size: 0.9rem;
                }

                /* Mobile Control Panel */
                .championship-control-panel {
                    position: relative;
                    top: auto;
                    left: auto;
                    width: 100%;
                    margin: 10px;
                    padding: 15px;
                    max-height: none;
                    background: rgba(0, 17, 34, 0.98);
                }

                .team-focus-buttons {
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .team-button {
                    padding: 8px;
                    font-size: 0.75rem;
                }

                .team-emoji {
                    font-size: 1rem;
                }

                /* Mobile Analytics Panel */
                .floating-analytics {
                    position: relative;
                    top: auto;
                    right: auto;
                    width: 100%;
                    margin: 10px;
                    padding: 15px;
                    max-height: none;
                }

                .analytics-chart {
                    margin-bottom: 20px;
                }

                .chart-title {
                    font-size: 1rem;
                }

                /* Mobile Insights Feed */
                .insights-feed {
                    position: relative;
                    bottom: auto;
                    left: auto;
                    right: auto;
                    margin: 10px;
                    max-height: 200px;
                }

                .insight-item {
                    padding: 10px;
                }

                .insight-text {
                    font-size: 0.85rem;
                }

                /* Performance Bar Mobile */
                .performance-bar {
                    position: relative;
                    top: auto;
                    left: auto;
                    transform: none;
                    margin: 10px;
                    padding: 8px 12px;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }

                .performance-metric {
                    min-width: 50px;
                }

                /* Mobile Team Cards */
                .mobile-team-carousel {
                    display: block;
                    width: 100%;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                    padding: 10px;
                    background: rgba(0, 17, 34, 0.95);
                    margin: 10px 0;
                }

                .mobile-team-card {
                    display: inline-block;
                    width: 280px;
                    margin-right: 15px;
                    scroll-snap-align: start;
                    background: rgba(0, 0, 0, 0.6);
                    border: 2px solid var(--team-color, #FFD700);
                    border-radius: 15px;
                    padding: 15px;
                    position: relative;
                    overflow: hidden;
                }

                .mobile-team-card:last-child {
                    margin-right: 20px;
                }

                .mobile-team-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 15px;
                }

                .mobile-team-name {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--team-color, #FFD700);
                }

                .mobile-team-emoji {
                    font-size: 1.8rem;
                }

                .mobile-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .mobile-stat {
                    text-align: center;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                }

                .mobile-stat-label {
                    font-size: 0.7rem;
                    opacity: 0.8;
                    margin-bottom: 3px;
                }

                .mobile-stat-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--team-color, #FFD700);
                }

                /* Touch-friendly animations */
                .touch-ripple {
                    position: relative;
                    overflow: hidden;
                }

                .touch-ripple::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 0;
                    border-radius: 100%;
                    transform: scale(1, 1) translate(-50%);
                    transform-origin: 50% 50%;
                }

                .touch-ripple.animate::after {
                    animation: ripple 0.6s ease-out;
                }

                @keyframes ripple {
                    0% {
                        transform: scale(0, 0);
                        opacity: 1;
                    }
                    20% {
                        transform: scale(25, 25);
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(40, 40);
                    }
                }

                /* Mobile chart optimizations */
                .mobile-chart-container {
                    position: relative;
                    height: 200px;
                    margin-bottom: 20px;
                }

                .mobile-chart-container canvas {
                    max-height: 180px !important;
                }

                /* Gesture indicators */
                .gesture-hint {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    opacity: 0.7;
                    pointer-events: none;
                    animation: fadeInOut 3s ease-in-out infinite;
                }

                @keyframes fadeInOut {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }

                /* Loading states for mobile */
                .mobile-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                }

                .mobile-loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255, 215, 0, 0.3);
                    border-left: 4px solid #FFD700;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Haptic feedback indicators */
                .haptic-pulse {
                    animation: hapticPulse 0.1s ease-in-out;
                }

                @keyframes hapticPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            }

            @media (max-width: 480px) {
                .mobile-team-card {
                    width: 260px;
                }

                .team-focus-buttons {
                    grid-template-columns: 1fr;
                }

                .championship-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .mobile-stats-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
            }
        `;

        document.head.appendChild(mobileStyles);
    }

    createMobileNavigation() {
        // Create bottom navigation bar for mobile
        const mobileNav = document.createElement('div');
        mobileNav.id = 'mobile-championship-nav';
        mobileNav.className = 'mobile-nav-bar';
        mobileNav.innerHTML = `
            <div class="mobile-nav-item active" data-section="teams">
                <div class="nav-icon">🏆</div>
                <div class="nav-label">Teams</div>
            </div>
            <div class="mobile-nav-item" data-section="analytics">
                <div class="nav-icon">📊</div>
                <div class="nav-label">Analytics</div>
            </div>
            <div class="mobile-nav-item" data-section="insights">
                <div class="nav-icon">🧠</div>
                <div class="nav-label">Insights</div>
            </div>
            <div class="mobile-nav-item" data-section="3d">
                <div class="nav-icon">🎮</div>
                <div class="nav-label">3D View</div>
            </div>
        `;

        // Style the navigation bar
        const navStyles = document.createElement('style');
        navStyles.textContent = `
            .mobile-nav-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 17, 34, 0.98);
                backdrop-filter: blur(15px);
                border-top: 2px solid var(--championship-gold);
                display: flex;
                justify-content: space-around;
                padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
                z-index: 1003;
            }

            .mobile-nav-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 12px;
                margin: 0 4px;
            }

            .mobile-nav-item.active {
                background: rgba(255, 215, 0, 0.2);
            }

            .nav-icon {
                font-size: 1.2rem;
                margin-bottom: 2px;
            }

            .nav-label {
                font-size: 0.7rem;
                font-weight: 600;
                color: white;
                opacity: 0.8;
            }

            .mobile-nav-item.active .nav-label {
                color: var(--championship-gold);
                opacity: 1;
            }
        `;

        document.head.appendChild(navStyles);
        document.body.appendChild(mobileNav);

        // Add navigation functionality
        mobileNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.mobile-nav-item');
            if (navItem) {
                this.switchMobileSection(navItem.dataset.section);
                this.updateActiveNav(navItem);
                this.triggerHapticFeedback('light');
            }
        });
    }

    createSwipeableTeamCards() {
        // Create horizontal scrolling team cards
        const teamCarousel = document.createElement('div');
        teamCarousel.className = 'mobile-team-carousel';
        teamCarousel.id = 'mobile-team-carousel';

        Object.entries(this.mobileTeamConfigs).forEach(([teamKey, config]) => {
            const teamCard = this.createMobileTeamCard(teamKey, config);
            teamCarousel.appendChild(teamCard);
        });

        // Insert after header
        const header = document.querySelector('.championship-header');
        if (header) {
            header.parentNode.insertBefore(teamCarousel, header.nextSibling);
        } else {
            document.body.insertBefore(teamCarousel, document.body.firstChild);
        }

        // Add swipe detection
        this.setupTeamCardSwipe(teamCarousel);
    }

    createMobileTeamCard(teamKey, config) {
        const card = document.createElement('div');
        card.className = 'mobile-team-card touch-ripple';
        card.dataset.team = teamKey;
        card.style.setProperty('--team-color', config.primaryColor);

        // Get team data if available
        const teamData = this.getMobileTeamData(teamKey);

        card.innerHTML = `
            <div class="mobile-team-header">
                <div class="mobile-team-name">${config.displayName}</div>
                <div class="mobile-team-emoji">${config.emoji}</div>
            </div>
            <div class="mobile-stats-grid">
                <div class="mobile-stat">
                    <div class="mobile-stat-label">${config.shortStats[0]}</div>
                    <div class="mobile-stat-value">${teamData.wins || '0'}</div>
                </div>
                <div class="mobile-stat">
                    <div class="mobile-stat-label">${config.shortStats[1]}</div>
                    <div class="mobile-stat-value">${teamData.playoffProb || '0.0'}%</div>
                </div>
                <div class="mobile-stat">
                    <div class="mobile-stat-label">${config.shortStats[2]}</div>
                    <div class="mobile-stat-value">${teamData.stat3 || '0.0'}</div>
                </div>
                <div class="mobile-stat">
                    <div class="mobile-stat-label">${config.shortStats[3]}</div>
                    <div class="mobile-stat-value">${teamData.stat4 || '0.0'}</div>
                </div>
            </div>
            <div class="mobile-team-insight">
                <div class="insight-text">${teamData.insight || 'Analyzing performance...'}</div>
            </div>
        `;

        // Add touch interactions
        card.addEventListener('touchstart', (e) => {
            this.handleCardTouchStart(e, teamKey);
        });

        card.addEventListener('touchend', (e) => {
            this.handleCardTouchEnd(e, teamKey);
        });

        return card;
    }

    getMobileTeamData(teamKey) {
        // Get simplified team data for mobile display
        if (window.BlazeIntelligenceData && window.BlazeIntelligenceData.integration) {
            const data = window.BlazeIntelligenceData.getTeamData(teamKey);
            if (data) {
                return this.simplifyTeamDataForMobile(teamKey, data);
            }
        }

        // Return mock data for development
        return this.getMockMobileTeamData(teamKey);
    }

    simplifyTeamDataForMobile(teamKey, data) {
        const config = this.mobileTeamConfigs[teamKey];

        const simplified = {
            wins: data.currentSeason?.wins || 0,
            playoffProb: data.currentSeason?.playoffProb?.toFixed(1) || '0.0',
            insight: data.insights?.[0]?.message?.substring(0, 80) + '...' || 'Performance analysis in progress...'
        };

        // Sport-specific third and fourth stats
        switch (config.sport) {
            case 'MLB':
                simplified.stat3 = data.performance?.pitching || '0';
                simplified.stat4 = data.performance?.hitting || '0';
                break;
            case 'NFL':
                simplified.stat3 = '22.4'; // Mock PPG
                simplified.stat4 = '350'; // Mock YPG
                break;
            case 'NCAA':
                simplified.stat3 = '#5'; // Mock recruit rank
                simplified.stat4 = '35.2'; // Mock PPG
                break;
            case 'NBA':
                simplified.stat3 = '112'; // Mock PPG
                simplified.stat4 = '45'; // Mock RPG
                break;
        }

        return simplified;
    }

    getMockMobileTeamData(teamKey) {
        const mockData = {
            cardinals: {
                wins: '78',
                playoffProb: '96.6',
                stat3: '3.45',
                stat4: '.804',
                insight: 'Championship window open! Strong playoff positioning suggests October baseball is likely.'
            },
            titans: {
                wins: '0',
                playoffProb: '8.4',
                stat3: '17.0',
                stat4: '285',
                insight: 'Critical rebuild phase. Early season struggles require strategic adjustments.'
            },
            longhorns: {
                wins: '12',
                playoffProb: '89.7',
                stat3: '#3',
                stat4: '38.5',
                insight: 'Elite recruiting and strong performance indicate championship potential this season.'
            },
            grizzlies: {
                wins: '42',
                playoffProb: '52.1',
                stat3: '112',
                stat4: '47',
                insight: 'Balanced roster with playoff potential. Strong fourth quarter performance noted.'
            }
        };

        return mockData[teamKey] || mockData.cardinals;
    }

    setupTeamCardSwipe(carousel) {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        carousel.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            carousel.style.cursor = 'grabbing';
        });

        carousel.addEventListener('touchend', () => {
            isDown = false;
            carousel.style.cursor = 'grab';

            // Snap to nearest card
            this.snapToNearestCard(carousel);
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });

        // Add scroll indicators
        this.addScrollIndicators(carousel);
    }

    snapToNearestCard(carousel) {
        const cardWidth = 295; // 280px width + 15px margin
        const scrollLeft = carousel.scrollLeft;
        const cardIndex = Math.round(scrollLeft / cardWidth);
        const targetScroll = cardIndex * cardWidth;

        carousel.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });

        // Update active team
        const teams = Object.keys(this.mobileTeamConfigs);
        if (teams[cardIndex]) {
            this.setActiveTeam(teams[cardIndex]);
        }
    }

    addScrollIndicators(carousel) {
        const indicators = document.createElement('div');
        indicators.className = 'team-scroll-indicators';
        indicators.innerHTML = Object.keys(this.mobileTeamConfigs).map((team, index) =>
            `<div class="scroll-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
        ).join('');

        // Style indicators
        const indicatorStyles = document.createElement('style');
        indicatorStyles.textContent = `
            .team-scroll-indicators {
                display: flex;
                justify-content: center;
                gap: 8px;
                padding: 10px;
                background: rgba(0, 17, 34, 0.8);
            }

            .scroll-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transition: all 0.3s ease;
            }

            .scroll-dot.active {
                background: var(--championship-gold);
                transform: scale(1.2);
            }
        `;

        document.head.appendChild(indicatorStyles);
        carousel.parentNode.insertBefore(indicators, carousel.nextSibling);

        // Add indicator click functionality
        indicators.addEventListener('click', (e) => {
            if (e.target.classList.contains('scroll-dot')) {
                const index = parseInt(e.target.dataset.index);
                const cardWidth = 295;
                carousel.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth'
                });
                this.updateScrollIndicators(indicators, index);
                this.triggerHapticFeedback('medium');
            }
        });

        // Update indicators on scroll
        carousel.addEventListener('scroll', () => {
            const cardWidth = 295;
            const activeIndex = Math.round(carousel.scrollLeft / cardWidth);
            this.updateScrollIndicators(indicators, activeIndex);
        });
    }

    updateScrollIndicators(indicators, activeIndex) {
        const dots = indicators.querySelectorAll('.scroll-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    createMobileControlPanel() {
        // Create collapsible mobile control panel
        const controlPanel = document.createElement('div');
        controlPanel.id = 'mobile-control-panel';
        controlPanel.className = 'mobile-control-collapsed';
        controlPanel.innerHTML = `
            <div class="mobile-control-header">
                <div class="control-title">🎮 Controls</div>
                <div class="expand-button">▼</div>
            </div>
            <div class="mobile-control-content">
                <div class="mobile-control-section">
                    <div class="section-title">Visualization Mode</div>
                    <div class="mobile-button-group">
                        <button class="mobile-control-btn active" data-mode="championship">🏆 Championship</button>
                        <button class="mobile-control-btn" data-mode="performance">📊 Performance</button>
                        <button class="mobile-control-btn" data-mode="trajectory">📈 Trajectory</button>
                    </div>
                </div>
                <div class="mobile-control-section">
                    <div class="section-title">Display Options</div>
                    <div class="mobile-toggle-group">
                        <label class="mobile-toggle">
                            <input type="checkbox" id="mobile-particles" checked>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Data Particles</span>
                        </label>
                        <label class="mobile-toggle">
                            <input type="checkbox" id="mobile-towers" checked>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Championship Towers</span>
                        </label>
                        <label class="mobile-toggle">
                            <input type="checkbox" id="mobile-animations" checked>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Animations</span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Add mobile control styles
        const controlStyles = document.createElement('style');
        controlStyles.textContent = `
            #mobile-control-panel {
                position: fixed;
                bottom: 80px;
                left: 10px;
                right: 10px;
                background: rgba(0, 17, 34, 0.98);
                border: 2px solid var(--championship-gold);
                border-radius: 15px;
                z-index: 1002;
                transform: translateY(calc(100% - 50px));
                transition: transform 0.3s ease;
                backdrop-filter: blur(15px);
            }

            #mobile-control-panel.expanded {
                transform: translateY(0);
            }

            .mobile-control-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                cursor: pointer;
            }

            .control-title {
                font-weight: 800;
                color: var(--championship-gold);
            }

            .expand-button {
                font-size: 1.2rem;
                transition: transform 0.3s ease;
            }

            #mobile-control-panel.expanded .expand-button {
                transform: rotate(180deg);
            }

            .mobile-control-content {
                padding: 0 15px 15px;
            }

            .mobile-control-section {
                margin-bottom: 20px;
            }

            .section-title {
                font-size: 0.9rem;
                font-weight: 700;
                color: var(--grizzly-teal);
                margin-bottom: 10px;
            }

            .mobile-button-group {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 5px;
            }

            .mobile-control-btn {
                padding: 8px 4px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                color: white;
                font-size: 0.7rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .mobile-control-btn.active {
                background: rgba(255, 215, 0, 0.3);
                border-color: var(--championship-gold);
                color: var(--championship-gold);
            }

            .mobile-toggle-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .mobile-toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
            }

            .mobile-toggle input {
                display: none;
            }

            .toggle-slider {
                width: 40px;
                height: 20px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                position: relative;
                transition: all 0.3s ease;
            }

            .toggle-slider::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                top: 2px;
                left: 2px;
                transition: all 0.3s ease;
            }

            .mobile-toggle input:checked + .toggle-slider {
                background: var(--championship-gold);
            }

            .mobile-toggle input:checked + .toggle-slider::after {
                transform: translateX(20px);
            }

            .toggle-label {
                font-size: 0.85rem;
                color: white;
            }
        `;

        document.head.appendChild(controlStyles);
        document.body.appendChild(controlPanel);

        // Add expand/collapse functionality
        const header = controlPanel.querySelector('.mobile-control-header');
        header.addEventListener('click', () => {
            controlPanel.classList.toggle('expanded');
            this.triggerHapticFeedback('light');
        });

        // Add button functionality
        this.setupMobileControlInteractions(controlPanel);
    }

    setupMobileControlInteractions(controlPanel) {
        // Mode buttons
        const modeButtons = controlPanel.querySelectorAll('.mobile-control-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changeMobileVisualizationMode(btn.dataset.mode);
                this.triggerHapticFeedback('medium');
            });
        });

        // Toggle switches
        const toggles = controlPanel.querySelectorAll('.mobile-toggle input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.toggleMobileDisplayOption(toggle.id, toggle.checked);
                this.triggerHapticFeedback('light');
            });
        });
    }

    optimizeFor3D() {
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;

            // Reduce particle count for mobile
            const dataPoints = engine.scene.children.filter(child =>
                child.userData && child.userData.type === 'dataPoint'
            );

            const targetCount = this.mobileConfig.maxParticles;
            if (dataPoints.length > targetCount) {
                const excess = dataPoints.length - targetCount;
                for (let i = 0; i < excess; i++) {
                    engine.scene.remove(dataPoints[i]);
                }
            }

            // Reduce renderer quality
            engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            engine.renderer.shadowMap.enabled = this.deviceCapabilities.tier !== 'low';

            // Simplify materials
            engine.scene.children.forEach(child => {
                if (child.material) {
                    if (this.deviceCapabilities.tier === 'low') {
                        child.material.transparent = false;
                        child.castShadow = false;
                        child.receiveShadow = false;
                    }
                }
            });

            console.log(`📱 3D Engine optimized for ${this.deviceCapabilities.tier} tier mobile device`);
        }
    }

    setupTouchGestures() {
        if (typeof Hammer === 'undefined') {
            console.warn('Hammer.js not available, using basic touch events');
            this.setupBasicTouchEvents();
            return;
        }

        // Setup advanced touch gestures with Hammer.js
        const container = document.getElementById('championship-3d-container') || document.body;
        const hammer = new Hammer(container);

        // Enable pinch and pan
        hammer.get('pinch').set({ enable: true });
        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

        // Pinch to zoom
        hammer.on('pinch', (e) => {
            this.handlePinchGesture(e);
        });

        // Pan to rotate
        hammer.on('pan', (e) => {
            this.handlePanGesture(e);
        });

        // Double tap to focus
        hammer.get('tap').set({ taps: 2 });
        hammer.on('tap', (e) => {
            this.handleDoubleTap(e);
        });

        // Long press for context menu
        hammer.get('press').set({ time: 500 });
        hammer.on('press', (e) => {
            this.handleLongPress(e);
        });

        this.touchGestures.set('hammer', hammer);
        console.log('📱 Advanced touch gestures enabled');
    }

    setupBasicTouchEvents() {
        const container = document.getElementById('championship-3d-container') || document.body;

        let touches = [];
        let lastTap = 0;

        container.addEventListener('touchstart', (e) => {
            touches = Array.from(e.touches);

            // Detect double tap
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                this.handleDoubleTap(e);
            }
            lastTap = currentTime;
        });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (touches.length === 2 && e.touches.length === 2) {
                // Pinch gesture
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.pageX - touch1.pageX, 2) +
                    Math.pow(touch2.pageY - touch1.pageY, 2)
                );

                if (this.lastPinchDistance) {
                    const scale = currentDistance / this.lastPinchDistance;
                    this.handlePinchGesture({ scale });
                }
                this.lastPinchDistance = currentDistance;
            } else if (touches.length === 1 && e.touches.length === 1) {
                // Pan gesture
                const deltaX = e.touches[0].pageX - touches[0].pageX;
                const deltaY = e.touches[0].pageY - touches[0].pageY;
                this.handlePanGesture({ deltaX, deltaY });
            }
        });

        container.addEventListener('touchend', (e) => {
            touches = Array.from(e.touches);
            this.lastPinchDistance = null;
        });

        console.log('📱 Basic touch events enabled');
    }

    handlePinchGesture(e) {
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;
            const scale = e.scale || 1;
            const scaleFactor = 2 - scale; // Invert for intuitive zoom

            engine.camera.position.multiplyScalar(scaleFactor);
            this.triggerHapticFeedback('light');
        }
    }

    handlePanGesture(e) {
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;
            const sensitivity = 0.01;

            // Rotate camera around target
            if (engine.controls) {
                engine.controls.azimuthalAngle += (e.deltaX || 0) * sensitivity;
                engine.controls.polarAngle += (e.deltaY || 0) * sensitivity;
            }
        }
    }

    handleDoubleTap(e) {
        // Focus on nearest championship team
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            window.BlazeIntelligence3D.focusTeam(this.getActiveTeam());
            this.triggerHapticFeedback('medium');
            this.showGestureHint('Focusing on team...');
        }
    }

    handleLongPress(e) {
        // Show context menu or team details
        this.showMobileContextMenu(e);
        this.triggerHapticFeedback('heavy');
    }

    createMobileCharts() {
        // Create simplified charts optimized for mobile viewing
        const analyticsSection = document.querySelector('.floating-analytics') ||
                               document.getElementById('mobile-analytics-section');

        if (!analyticsSection) return;

        // Clear existing charts
        analyticsSection.innerHTML = '';

        // Create mobile-optimized charts
        this.createMobileChampionshipChart(analyticsSection);
        this.createMobilePerformanceChart(analyticsSection);
        this.createMobileTrendChart(analyticsSection);
    }

    createMobileChampionshipChart(container) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'mobile-chart-container';
        chartContainer.innerHTML = `
            <div class="chart-title">🏆 Championship Probabilities</div>
            <canvas id="mobile-championship-chart" width="300" height="180"></canvas>
        `;

        container.appendChild(chartContainer);

        const canvas = document.getElementById('mobile-championship-chart');
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'],
                datasets: [{
                    data: [96.6, 8.4, 89.7, 52.1],
                    backgroundColor: [
                        'rgba(196, 30, 58, 0.8)',
                        'rgba(75, 146, 219, 0.8)',
                        'rgba(191, 87, 0, 0.8)',
                        'rgba(0, 178, 169, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: { size: 10 },
                            padding: 10,
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                animation: {
                    duration: this.mobileConfig.animationDuration
                },
                onHover: (event, elements) => {
                    if (elements.length > 0) {
                        this.triggerHapticFeedback('light');
                    }
                }
            }
        });

        this.mobileCharts.set('championship', chart);
    }

    createMobilePerformanceChart(container) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'mobile-chart-container';
        chartContainer.innerHTML = `
            <div class="chart-title">📊 Performance Trends</div>
            <canvas id="mobile-performance-chart" width="300" height="160"></canvas>
        `;

        container.appendChild(chartContainer);

        const canvas = document.getElementById('mobile-performance-chart');
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
                datasets: [{
                    label: 'Active Team',
                    data: [45, 52, 61, 58, 67, 72],
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff',
                            font: { size: 10 }
                        },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            font: { size: 10 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        min: 0,
                        max: 100
                    }
                },
                animation: {
                    duration: this.mobileConfig.animationDuration
                }
            }
        });

        this.mobileCharts.set('performance', chart);
    }

    createMobileTrendChart(container) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'mobile-chart-container';
        chartContainer.innerHTML = `
            <div class="chart-title">📈 Momentum Analysis</div>
            <canvas id="mobile-trend-chart" width="300" height="140"></canvas>
        `;

        container.appendChild(chartContainer);

        const canvas = document.getElementById('mobile-trend-chart');
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'],
                datasets: [{
                    label: 'Momentum Score',
                    data: [85, 25, 92, 68],
                    backgroundColor: [
                        'rgba(196, 30, 58, 0.7)',
                        'rgba(75, 146, 219, 0.7)',
                        'rgba(191, 87, 0, 0.7)',
                        'rgba(0, 178, 169, 0.7)'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff',
                            font: { size: 9 }
                        },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            font: { size: 9 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        min: 0,
                        max: 100
                    }
                },
                animation: {
                    duration: this.mobileConfig.animationDuration
                },
                onHover: (event, elements) => {
                    if (elements.length > 0) {
                        this.triggerHapticFeedback('light');
                    }
                }
            }
        });

        this.mobileCharts.set('trend', chart);
    }

    adaptChartsForMobile() {
        // Adapt existing charts for mobile viewing
        const existingCharts = document.querySelectorAll('canvas');

        existingCharts.forEach(canvas => {
            // Reduce canvas size for mobile
            if (this.isMobile.screenWidth < 768) {
                canvas.style.maxHeight = '180px';
                canvas.parentElement.style.padding = '10px';
            }
        });
    }

    enableMobileAnimations() {
        // Enable touch-responsive animations
        this.setupTouchRippleEffect();
        this.setupMobileLoadingAnimations();
        this.setupMobileTransitions();
    }

    setupTouchRippleEffect() {
        document.addEventListener('touchstart', (e) => {
            const element = e.target.closest('.touch-ripple');
            if (element) {
                element.classList.remove('animate');

                // Trigger animation on next frame
                requestAnimationFrame(() => {
                    element.classList.add('animate');

                    // Remove animation class after completion
                    setTimeout(() => {
                        element.classList.remove('animate');
                    }, 600);
                });
            }
        });
    }

    setupMobileLoadingAnimations() {
        // Add loading states for mobile interactions
        const loadingClass = 'mobile-loading-state';

        document.addEventListener('touchstart', (e) => {
            const actionElement = e.target.closest('[data-loading]');
            if (actionElement) {
                actionElement.classList.add(loadingClass);

                // Remove loading state after action
                setTimeout(() => {
                    actionElement.classList.remove(loadingClass);
                }, 1000);
            }
        });
    }

    setupMobileTransitions() {
        // Smooth transitions for mobile section switching
        const mobileCSS = `
            .mobile-section-transition {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                           opacity 0.3s ease;
            }

            .mobile-section-slide-out {
                transform: translateX(-100%);
                opacity: 0;
            }

            .mobile-section-slide-in {
                transform: translateX(0);
                opacity: 1;
            }
        `;

        const style = document.createElement('style');
        style.textContent = mobileCSS;
        document.head.appendChild(style);
    }

    startMobileDataStreams() {
        // Start mobile-optimized data updates
        setInterval(() => {
            this.updateMobileTeamCards();
        }, this.mobileConfig.chartUpdateInterval);

        setInterval(() => {
            this.updateMobileCharts();
        }, this.mobileConfig.chartUpdateInterval * 2);

        console.log(`📱 Mobile data streams active (${this.mobileConfig.chartUpdateInterval}ms intervals)`);
    }

    updateMobileTeamCards() {
        const teamCards = document.querySelectorAll('.mobile-team-card');

        teamCards.forEach(card => {
            const teamKey = card.dataset.team;
            const teamData = this.getMobileTeamData(teamKey);

            // Update stats
            const stats = card.querySelectorAll('.mobile-stat-value');
            stats[0].textContent = teamData.wins || '0';
            stats[1].textContent = `${teamData.playoffProb || '0.0'}%`;
            stats[2].textContent = teamData.stat3 || '0.0';
            stats[3].textContent = teamData.stat4 || '0.0';

            // Update insight
            const insight = card.querySelector('.insight-text');
            if (insight) {
                insight.textContent = teamData.insight || 'Analyzing performance...';
            }

            // Add update animation
            card.classList.add('haptic-pulse');
            setTimeout(() => {
                card.classList.remove('haptic-pulse');
            }, 100);
        });
    }

    updateMobileCharts() {
        // Update mobile charts with fresh data
        this.mobileCharts.forEach((chart, chartType) => {
            if (chartType === 'performance') {
                // Update performance chart for active team
                const activeTeam = this.getActiveTeam();
                const newData = this.getTeamTrajectoryData(activeTeam);

                chart.data.datasets[0].data = newData;
                chart.data.datasets[0].borderColor = this.getTeamColor(activeTeam);
                chart.update('none'); // No animation for performance
            }
        });
    }

    setupMobilePerformanceMonitoring() {
        // Monitor mobile performance and adjust accordingly
        let frameCount = 0;
        let lastTime = performance.now();

        const checkPerformance = () => {
            frameCount++;
            const now = performance.now();

            if (now >= lastTime + 2000) { // Check every 2 seconds
                const fps = Math.round((frameCount * 1000) / (now - lastTime));

                // Adjust performance based on FPS
                if (fps < 45) {
                    this.reduceMobileQuality();
                } else if (fps > 55 && this.deviceCapabilities.tier !== 'high') {
                    this.increaseMobileQuality();
                }

                frameCount = 0;
                lastTime = now;
            }

            requestAnimationFrame(checkPerformance);
        };

        checkPerformance();
    }

    reduceMobileQuality() {
        console.log('📱 Reducing mobile quality for better performance');

        // Reduce particles
        this.mobileConfig.maxParticles = Math.max(100, this.mobileConfig.maxParticles * 0.8);

        // Reduce animation duration
        this.mobileConfig.animationDuration = Math.max(200, this.mobileConfig.animationDuration * 0.8);

        // Increase update intervals
        this.mobileConfig.chartUpdateInterval = Math.min(20000, this.mobileConfig.chartUpdateInterval * 1.5);

        this.applyMobileOptimizations();
    }

    increaseMobileQuality() {
        console.log('📱 Increasing mobile quality - good performance detected');

        // Increase particles (within limits)
        const maxForTier = this.deviceCapabilities.tier === 'medium' ? 600 : 400;
        this.mobileConfig.maxParticles = Math.min(maxForTier, this.mobileConfig.maxParticles * 1.2);

        // Increase animation duration
        this.mobileConfig.animationDuration = Math.min(800, this.mobileConfig.animationDuration * 1.2);

        this.applyMobileOptimizations();
    }

    applyMobileOptimizations() {
        // Apply current optimization settings to 3D engine
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;

            // Update particle count
            const currentParticles = engine.scene.children.filter(child =>
                child.userData && child.userData.type === 'dataPoint'
            ).length;

            const targetParticles = this.mobileConfig.maxParticles;

            if (currentParticles > targetParticles) {
                // Remove excess particles
                const excess = currentParticles - targetParticles;
                const dataPoints = engine.scene.children.filter(child =>
                    child.userData && child.userData.type === 'dataPoint'
                );

                for (let i = 0; i < excess && i < dataPoints.length; i++) {
                    engine.scene.remove(dataPoints[i]);
                }
            }
        }
    }

    // Mobile-specific UI control methods
    switchMobileSection(section) {
        const sections = ['teams', 'analytics', 'insights', '3d'];

        sections.forEach(sec => {
            const element = document.getElementById(`mobile-${sec}-section`) ||
                           document.querySelector(`[data-section="${sec}"]`);
            if (element) {
                element.style.display = sec === section ? 'block' : 'none';
            }
        });

        // Handle special cases
        switch (section) {
            case '3d':
                this.show3DView();
                break;
            case 'teams':
                this.showTeamCarousel();
                break;
            case 'analytics':
                this.showAnalyticsCharts();
                break;
            case 'insights':
                this.showInsightsFeed();
                break;
        }

        console.log(`📱 Switched to ${section} section`);
    }

    show3DView() {
        const container = document.getElementById('championship-3d-container');
        if (container) {
            container.style.display = 'block';
            container.style.height = '60vh';

            // Add mobile gesture hints
            this.showGestureHint('Pinch to zoom, drag to rotate, double-tap to focus');
        }
    }

    showTeamCarousel() {
        const carousel = document.getElementById('mobile-team-carousel');
        if (carousel) {
            carousel.style.display = 'block';
            carousel.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showAnalyticsCharts() {
        const analytics = document.querySelector('.floating-analytics');
        if (analytics) {
            analytics.style.position = 'relative';
            analytics.style.top = 'auto';
            analytics.style.right = 'auto';
            analytics.style.width = '100%';
            analytics.style.margin = '10px';
        }
    }

    showInsightsFeed() {
        const insights = document.querySelector('.insights-feed');
        if (insights) {
            insights.style.position = 'relative';
            insights.style.bottom = 'auto';
            insights.style.left = 'auto';
            insights.style.right = 'auto';
            insights.style.margin = '10px';
            insights.style.maxHeight = 'none';
        }
    }

    updateActiveNav(activeItem) {
        const navItems = document.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    changeMobileVisualizationMode(mode) {
        console.log(`📱 Changing to ${mode} visualization mode`);

        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            // Update 3D visualization based on mode
            const engine = window.BlazeIntelligence3D.engine;

            // Implementation for different modes
            switch (mode) {
                case 'championship':
                    // Focus on championship towers
                    break;
                case 'performance':
                    // Emphasize performance pillars
                    break;
                case 'trajectory':
                    // Show trajectory paths
                    break;
            }
        }

        // Update mobile charts accordingly
        this.updateChartsForMode(mode);
    }

    toggleMobileDisplayOption(optionId, enabled) {
        console.log(`📱 ${optionId}: ${enabled ? 'enabled' : 'disabled'}`);

        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;

            switch (optionId) {
                case 'mobile-particles':
                    engine.scene.children.forEach(child => {
                        if (child.userData && child.userData.type === 'dataPoint') {
                            child.visible = enabled;
                        }
                    });
                    break;
                case 'mobile-towers':
                    engine.scene.children.forEach(child => {
                        if (child.userData && child.userData.type === 'championship') {
                            child.visible = enabled;
                        }
                    });
                    break;
                case 'mobile-animations':
                    engine.animationsEnabled = enabled;
                    break;
            }
        }
    }

    updateChartsForMode(mode) {
        // Update charts based on visualization mode
        this.mobileCharts.forEach((chart, chartType) => {
            if (chartType === 'performance') {
                // Update chart styling or data based on mode
                chart.options.plugins.title = {
                    display: true,
                    text: `📊 ${mode.charAt(0).toUpperCase() + mode.slice(1)} Analysis`,
                    color: '#FFD700'
                };
                chart.update();
            }
        });
    }

    handleCardTouchStart(e, teamKey) {
        // Handle team card touch interactions
        this.setActiveTeam(teamKey);
        this.triggerHapticFeedback('light');

        // Add visual feedback
        const card = e.currentTarget;
        card.style.transform = 'scale(0.98)';
    }

    handleCardTouchEnd(e, teamKey) {
        // Reset visual feedback
        const card = e.currentTarget;
        card.style.transform = 'scale(1)';

        // Focus 3D view on selected team
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            setTimeout(() => {
                window.BlazeIntelligence3D.focusTeam(teamKey);
            }, 100);
        }
    }

    showMobileContextMenu(e) {
        // Create and show mobile context menu
        const existingMenu = document.getElementById('mobile-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.id = 'mobile-context-menu';
        menu.className = 'mobile-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="focus-team">🎯 Focus Team</div>
            <div class="context-menu-item" data-action="team-details">ℹ️ Team Details</div>
            <div class="context-menu-item" data-action="share">📤 Share</div>
            <div class="context-menu-item" data-action="close">❌ Close</div>
        `;

        // Position menu
        const touch = e.touches ? e.touches[0] : e;
        menu.style.left = `${touch.pageX - 80}px`;
        menu.style.top = `${touch.pageY - 100}px`;

        document.body.appendChild(menu);

        // Add menu functionality
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleContextMenuAction(action);
            menu.remove();
        });

        // Auto-remove menu after 5 seconds
        setTimeout(() => {
            if (menu.parentNode) {
                menu.remove();
            }
        }, 5000);
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'focus-team':
                if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
                    window.BlazeIntelligence3D.focusTeam(this.getActiveTeam());
                }
                break;
            case 'team-details':
                this.showTeamDetails(this.getActiveTeam());
                break;
            case 'share':
                this.shareTeamData(this.getActiveTeam());
                break;
        }
    }

    showGestureHint(message, duration = 3000) {
        const existingHint = document.querySelector('.gesture-hint');
        if (existingHint) {
            existingHint.remove();
        }

        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.textContent = message;

        const container = document.getElementById('championship-3d-container') || document.body;
        container.appendChild(hint);

        setTimeout(() => {
            hint.remove();
        }, duration);
    }

    triggerHapticFeedback(intensity = 'light') {
        if ('vibrate' in navigator) {
            const patterns = {
                light: 10,
                medium: [10, 50, 10],
                heavy: [10, 100, 30, 100, 10]
            };

            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    }

    // Utility methods
    getActiveTeam() {
        const activeCard = document.querySelector('.mobile-team-card.active');
        return activeCard?.dataset.team || 'cardinals';
    }

    setActiveTeam(teamKey) {
        const cards = document.querySelectorAll('.mobile-team-card');
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.team === teamKey);
        });

        // Update 3D focus if available
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            window.BlazeIntelligence3D.focusTeam(teamKey);
        }
    }

    getTeamColor(teamKey) {
        return this.mobileTeamConfigs[teamKey]?.primaryColor || '#FFD700';
    }

    getTeamTrajectoryData(teamKey) {
        // Mock trajectory data for mobile charts
        const trajectories = {
            cardinals: [45, 52, 61, 58, 67, 72],
            titans: [85, 78, 65, 42, 38, 32],
            longhorns: [92, 89, 94, 96, 94, 91],
            grizzlies: [34, 42, 56, 61, 58, 52]
        };

        return trajectories[teamKey] || trajectories.cardinals;
    }

    showTeamDetails(teamKey) {
        // Show detailed team information modal
        console.log(`📱 Showing details for ${teamKey}`);
        // Implementation for team details modal
    }

    shareTeamData(teamKey) {
        // Share team data using Web Share API if available
        if (navigator.share) {
            const config = this.mobileTeamConfigs[teamKey];
            const data = this.getMobileTeamData(teamKey);

            navigator.share({
                title: `${config.displayName} Championship Analysis`,
                text: `${config.displayName} has a ${data.playoffProb}% playoff probability. ${data.insight}`,
                url: window.location.href
            });
        } else {
            // Fallback to copy to clipboard
            const shareText = `${this.mobileTeamConfigs[teamKey].displayName} Championship Analysis - ${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showGestureHint('Link copied to clipboard!');
            });
        }
    }

    destroy() {
        // Clean up mobile optimizations
        this.touchGestures.forEach((gesture, key) => {
            if (typeof gesture.destroy === 'function') {
                gesture.destroy();
            }
        });

        this.mobileCharts.forEach((chart, key) => {
            chart.destroy();
        });

        // Remove mobile-specific elements
        const mobileElements = [
            'mobile-championship-nav',
            'mobile-control-panel',
            'mobile-team-carousel',
            'mobile-context-menu'
        ];

        mobileElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });

        console.log('📱 Mobile Championship Engine destroyed');
    }
}

// Global mobile API
window.BlazeIntelligenceMobile = {
    engine: null,

    initialize() {
        if (!this.engine) {
            this.engine = new BlazeIntelligenceMobileEngine();
        }
        return this.engine;
    },

    isActive() {
        return this.engine && this.engine.isMobile.isMobile;
    },

    getDeviceCapabilities() {
        return this.engine?.deviceCapabilities;
    },

    triggerHapticFeedback(intensity) {
        if (this.engine) {
            this.engine.triggerHapticFeedback(intensity);
        }
    },

    destroy() {
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
    }
};

// Auto-initialize mobile engine
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BlazeIntelligenceMobile.initialize();
    });
} else {
    window.BlazeIntelligenceMobile.initialize();
}

console.log('📱 BLAZE INTELLIGENCE MOBILE OPTIMIZATION ENGINE LOADED - Touch-Optimized Championship Experience Ready');