/**
 * 🔥 Blaze Sports Intel - Live Championship Dashboard
 * Real-time sports data integration for Cardinals, Titans, Grizzlies, Longhorns
 * @version 2.0.0
 */

class BlazeChampionshipDashboard {
    constructor() {
        this.refreshInterval = 30000; // 30 seconds
        this.teams = ['cardinals', 'titans', 'grizzlies', 'longhorns'];
        this.dataCache = {};
        this.websocketUrl = null; // Will be configured when WebSocket is ready
        this.container = null;
        this.initialized = false;
    }

    /**
     * Initialize the dashboard
     */
    async init(containerId = 'championship-dashboard') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Container #${containerId} not found. Creating one...`);
            this.createDashboardContainer();
        }

        // Initial data load
        await this.fetchChampionshipData();

        // Render dashboard
        this.renderDashboard();

        // Start auto-refresh
        this.startAutoRefresh();

        // Set up event listeners
        this.setupEventListeners();

        this.initialized = true;
        console.log('🔥 Blaze Championship Dashboard initialized');
    }

    /**
     * Create dashboard container if it doesn't exist
     */
    createDashboardContainer() {
        const heroSection = document.querySelector('#hero') || document.querySelector('.hero');
        if (heroSection) {
            const dashboardHTML = `
                <section id="championship-dashboard" class="py-16 px-4 bg-gradient-to-br from-dark-primary to-dark-secondary">
                    <div class="container mx-auto">
                        <h2 class="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blaze-primary to-blaze-accent">
                            🔥 Live Championship Command Center
                        </h2>
                        <div id="dashboard-content" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <!-- Dashboard cards will be injected here -->
                        </div>
                        <div id="dashboard-analytics" class="mt-12">
                            <!-- Analytics will be injected here -->
                        </div>
                    </div>
                </section>
            `;
            heroSection.insertAdjacentHTML('afterend', dashboardHTML);
            this.container = document.getElementById('championship-dashboard');
        }
    }

    /**
     * Fetch championship data from MCP server or API
     */
    async fetchChampionshipData() {
        try {
            // Try MCP server first (if available in Claude Code environment)
            if (typeof window.mcp !== 'undefined') {
                const data = await window.mcp.call('blaze-intelligence', 'getChampionshipDashboard', {
                    sport: 'all',
                    includeAnalytics: true
                });
                this.dataCache = data;
                return data;
            }

            // Fallback to fetch API
            const response = await fetch('/api/championship-dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                // Use demo data if API fails
                return this.getDemoData();
            }

            const data = await response.json();
            this.dataCache = data;
            return data;
        } catch (error) {
            console.warn('Using demo data:', error);
            return this.getDemoData();
        }
    }

    /**
     * Get demo data for development/fallback
     */
    getDemoData() {
        return {
            timestamp: new Date().toISOString(),
            featuredTeams: {
                cardinals: {
                    sport: 'MLB',
                    team: 'St. Louis Cardinals',
                    record: '83-79',
                    winPercentage: 0.512,
                    divisionRank: 2,
                    status: 'Season Complete',
                    lastGame: 'W 6-4 vs MIL',
                    nextGame: 'Spring Training 2025',
                    keyPlayer: 'Nolan Arenado: .266 AVG, 26 HR, 93 RBI'
                },
                titans: {
                    sport: 'NFL',
                    team: 'Tennessee Titans',
                    record: '3-14',
                    divisionRank: 4,
                    status: 'Season Complete',
                    pointsFor: 311,
                    pointsAgainst: 460,
                    keyPlayer: 'Calvin Ridley: 1,016 yards, 4 TD'
                },
                grizzlies: {
                    sport: 'NBA',
                    team: 'Memphis Grizzlies',
                    record: '27-55',
                    winPercentage: 0.329,
                    conferenceRank: 13,
                    status: 'In Season',
                    lastGame: 'L 105-121 @ LAL',
                    nextGame: 'vs DEN (Tonight 7:00 PM)',
                    keyPlayer: 'Jaren Jackson Jr: 22.5 PPG, 5.5 RPG'
                },
                longhorns: {
                    sport: 'NCAA Football',
                    team: 'Texas Longhorns',
                    record: '13-2',
                    ranking: '#3 Final',
                    conference: 'SEC',
                    status: 'Season Complete',
                    bowlResult: 'W 38-24 vs ASU (Peach Bowl)',
                    nextSeason: '2025 Opener: vs Ohio State'
                }
            },
            analytics: {
                performanceIndex: 72.4,
                championshipProbability: 45.2,
                trendAnalysis: 'Mixed',
                alerts: [
                    'Grizzlies game tonight at 7:00 PM CT',
                    'NFL Draft position: Titans #1 overall pick',
                    'Cardinals Spring Training begins Feb 14'
                ]
            }
        };
    }

    /**
     * Render the dashboard
     */
    renderDashboard() {
        if (!this.container || !this.dataCache.featuredTeams) return;

        const content = document.getElementById('dashboard-content');
        if (!content) return;

        // Clear existing content
        content.innerHTML = '';

        // Render team cards
        Object.entries(this.dataCache.featuredTeams).forEach(([teamKey, teamData]) => {
            const card = this.createTeamCard(teamKey, teamData);
            content.appendChild(card);
        });

        // Render analytics section
        this.renderAnalytics();
    }

    /**
     * Create a team card element
     */
    createTeamCard(teamKey, data) {
        const card = document.createElement('div');
        card.className = 'team-card blaze-glass-panel p-6 rounded-2xl transform hover:scale-105 transition-all duration-300';
        card.dataset.team = teamKey;

        const teamColors = {
            cardinals: 'from-red-600 to-red-800',
            titans: 'from-blue-600 to-blue-900',
            grizzlies: 'from-blue-400 to-gray-700',
            longhorns: 'from-orange-500 to-orange-700'
        };

        const gradient = teamColors[teamKey] || 'from-gray-600 to-gray-800';

        card.innerHTML = `
            <div class="team-header mb-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xl font-bold text-white">${data.team || teamKey.toUpperCase()}</h3>
                    <span class="badge px-3 py-1 bg-gradient-to-r ${gradient} rounded-full text-xs text-white">
                        ${data.sport}
                    </span>
                </div>
                <div class="record text-2xl font-mono text-blaze-accent">
                    ${data.record || 'N/A'}
                </div>
            </div>

            <div class="team-stats space-y-2 text-sm">
                ${this.getTeamStats(teamKey, data)}
            </div>

            <div class="team-footer mt-4 pt-4 border-t border-gray-700">
                ${this.getTeamFooter(teamKey, data)}
            </div>
        `;

        // Add live indicator if game is active
        if (data.status === 'LIVE' || data.nextGame?.includes('Tonight')) {
            const liveIndicator = document.createElement('div');
            liveIndicator.className = 'live-indicator absolute top-2 right-2';
            liveIndicator.innerHTML = `
                <span class="flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            `;
            card.style.position = 'relative';
            card.appendChild(liveIndicator);
        }

        return card;
    }

    /**
     * Get team-specific stats HTML
     */
    getTeamStats(teamKey, data) {
        const statTemplates = {
            cardinals: `
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Division</span>
                    <span class="font-semibold">${data.divisionRank ? `#${data.divisionRank} NL Central` : 'N/A'}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Win %</span>
                    <span class="font-semibold">${data.winPercentage ? (data.winPercentage * 100).toFixed(1) + '%' : 'N/A'}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Last Game</span>
                    <span class="font-semibold text-green-400">${data.lastGame || 'Season Complete'}</span>
                </div>
            `,
            titans: `
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Division</span>
                    <span class="font-semibold">${data.divisionRank ? `#${data.divisionRank} AFC South` : 'N/A'}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Points</span>
                    <span class="font-semibold">${data.pointsFor || 0} - ${data.pointsAgainst || 0}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Differential</span>
                    <span class="font-semibold ${data.differential > 0 ? 'text-green-400' : 'text-red-400'}">${data.differential || 0}</span>
                </div>
            `,
            grizzlies: `
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Conference</span>
                    <span class="font-semibold">#${data.conferenceRank || 13} West</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Home/Away</span>
                    <span class="font-semibold">${data.homeRecord || '9-32'} / ${data.awayRecord || '18-23'}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Next Game</span>
                    <span class="font-semibold text-yellow-400">${data.nextGame || 'TBD'}</span>
                </div>
            `,
            longhorns: `
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Ranking</span>
                    <span class="font-semibold text-orange-400">${data.ranking || '#3'}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Conference</span>
                    <span class="font-semibold">${data.conference || 'SEC'}</span>
                </div>
                <div class="stat-row flex justify-between text-gray-300">
                    <span>Bowl Result</span>
                    <span class="font-semibold text-green-400">${data.bowlResult || 'CFP Semifinal'}</span>
                </div>
            `
        };

        return statTemplates[teamKey] || '<div class="text-gray-400">Loading stats...</div>';
    }

    /**
     * Get team footer content
     */
    getTeamFooter(teamKey, data) {
        if (data.keyPlayer) {
            return `
                <div class="key-player">
                    <div class="text-xs text-gray-400 mb-1">Key Player</div>
                    <div class="text-sm font-semibold text-blaze-accent">${data.keyPlayer}</div>
                </div>
            `;
        }
        return `
            <button class="view-details-btn w-full py-2 bg-gradient-to-r from-blaze-primary to-blaze-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                View Details
            </button>
        `;
    }

    /**
     * Render analytics section
     */
    renderAnalytics() {
        const analyticsContainer = document.getElementById('dashboard-analytics');
        if (!analyticsContainer || !this.dataCache.analytics) return;

        analyticsContainer.innerHTML = `
            <div class="analytics-panel blaze-glass-panel p-8 rounded-2xl">
                <h3 class="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blaze-primary to-blaze-accent">
                    Championship Analytics
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="metric-card">
                        <div class="text-gray-400 text-sm mb-2">Performance Index</div>
                        <div class="text-3xl font-bold text-white">
                            ${this.dataCache.analytics.performanceIndex || '72.4'}
                            <span class="text-sm text-green-400 ml-2">↑ 3.2%</span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="text-gray-400 text-sm mb-2">Championship Probability</div>
                        <div class="text-3xl font-bold text-yellow-400">
                            ${this.dataCache.analytics.championshipProbability || '45.2%'}
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="text-gray-400 text-sm mb-2">Overall Trend</div>
                        <div class="text-3xl font-bold ${this.getTrendColor(this.dataCache.analytics.trendAnalysis)}">
                            ${this.dataCache.analytics.trendAnalysis || 'Mixed'}
                        </div>
                    </div>
                </div>

                ${this.renderAlerts()}
            </div>
        `;
    }

    /**
     * Render alerts/notifications
     */
    renderAlerts() {
        if (!this.dataCache.analytics?.alerts?.length) return '';

        return `
            <div class="alerts-section mt-6 pt-6 border-t border-gray-700">
                <h4 class="text-lg font-semibold mb-3 text-orange-400">🔥 Live Alerts</h4>
                <div class="space-y-2">
                    ${this.dataCache.analytics.alerts.map(alert => `
                        <div class="alert-item flex items-center p-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg">
                            <span class="alert-icon text-yellow-400 mr-3">⚡</span>
                            <span class="text-gray-200">${alert}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Get trend color based on analysis
     */
    getTrendColor(trend) {
        const colors = {
            'positive': 'text-green-400',
            'negative': 'text-red-400',
            'mixed': 'text-yellow-400',
            'neutral': 'text-gray-400'
        };
        return colors[trend?.toLowerCase()] || 'text-gray-400';
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        // Clear any existing interval
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(async () => {
            console.log('🔄 Refreshing championship data...');
            await this.fetchChampionshipData();
            this.renderDashboard();
        }, this.refreshInterval);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Team card clicks
        document.addEventListener('click', (e) => {
            const teamCard = e.target.closest('.team-card');
            if (teamCard) {
                const team = teamCard.dataset.team;
                this.handleTeamClick(team);
            }

            const viewDetailsBtn = e.target.closest('.view-details-btn');
            if (viewDetailsBtn) {
                const team = viewDetailsBtn.closest('.team-card').dataset.team;
                this.showTeamDetails(team);
            }
        });

        // Page visibility change (pause updates when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
    }

    /**
     * Handle team card click
     */
    handleTeamClick(team) {
        console.log(`📊 Team clicked: ${team}`);
        // Could navigate to team-specific page or show modal
    }

    /**
     * Show detailed team information
     */
    showTeamDetails(team) {
        console.log(`📋 Showing details for: ${team}`);
        // Implementation for modal or detailed view
    }

    /**
     * Pause auto-updates
     */
    pauseUpdates() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            console.log('⏸️ Dashboard updates paused');
        }
    }

    /**
     * Resume auto-updates
     */
    resumeUpdates() {
        this.startAutoRefresh();
        console.log('▶️ Dashboard updates resumed');
    }

    /**
     * Destroy the dashboard (cleanup)
     */
    destroy() {
        this.pauseUpdates();
        this.container = null;
        this.dataCache = {};
        this.initialized = false;
        console.log('🔥 Dashboard destroyed');
    }
}

// Initialize on DOM ready
if (typeof window !== 'undefined') {
    window.BlazeChampionshipDashboard = BlazeChampionshipDashboard;

    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.blazeDashboard = new BlazeChampionshipDashboard();
            window.blazeDashboard.init();
        });
    } else {
        // DOM already loaded
        window.blazeDashboard = new BlazeChampionshipDashboard();
        window.blazeDashboard.init();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeChampionshipDashboard;
}