/**
 * 🎬 BLAZE SPORTS INTEL - UNREAL ENGINE 5.5 INTEGRATION MODULE
 * Cinema-quality rendering pipeline for championship sports visualization
 */

class UnrealEngineIntegration {
    constructor() {
        this.config = {
            wsUrl: 'ws://localhost:8765', // WebSocket bridge server
            wsSecureUrl: 'wss://blaze-mcp-bridge.blazesportsintel.com',
            apiKey: 'blaze-intelligence-unreal-2025',
            r2PublicBase: 'https://media.blazesportsintel.com',
            reconnectInterval: 3000,
            maxReconnectAttempts: 10
        };

        this.ws = null;
        this.activeJobs = new Map();
        this.renderHistory = [];
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];

        this.init();
    }

    async init() {
        console.log('🎬 Initializing Unreal Engine 5.5 Integration...');

        // Connect to WebSocket bridge
        await this.connectWebSocket();

        // Initialize UI if present
        this.initializeUI();

        console.log('✅ Unreal Engine Integration Ready!');
    }

    /**
     * Connect to the WebSocket MCP bridge
     */
    async connectWebSocket() {
        return new Promise((resolve) => {
            try {
                // Use secure WebSocket if on HTTPS
                const wsUrl = window.location.protocol === 'https:'
                    ? this.config.wsSecureUrl
                    : this.config.wsUrl;

                console.log(`🔌 Connecting to MCP Bridge: ${wsUrl}`);
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('✅ Connected to Unreal MCP Bridge');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.updateConnectionStatus(true);

                    // Process any queued messages
                    while (this.messageQueue.length > 0) {
                        const msg = this.messageQueue.shift();
                        this.ws.send(JSON.stringify(msg));
                    }

                    resolve(true);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleServerMessage(data);
                    } catch (error) {
                        console.error('Failed to parse server message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                };

                this.ws.onclose = () => {
                    console.log('🔌 WebSocket disconnected');
                    this.isConnected = false;
                    this.updateConnectionStatus(false);

                    // Attempt to reconnect
                    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
                        setTimeout(() => this.connectWebSocket(), this.config.reconnectInterval);
                    }
                };
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
                this.isConnected = false;
                this.updateConnectionStatus(false);
                resolve(false);
            }
        });
    }

    /**
     * Handle messages from the MCP bridge server
     */
    handleServerMessage(data) {
        console.log('📨 Server message:', data.type);

        switch(data.type) {
            case 'connection':
                console.log('Server features:', data.features);
                break;

            case 'render_queued':
                this.activeJobs.set(data.jobId, {
                    id: data.jobId,
                    spec: data.spec,
                    status: 'queued',
                    progress: 0,
                    startTime: Date.now()
                });

                // Resolve pending render request if exists
                if (this.pendingRenderRequest) {
                    this.pendingRenderRequest.resolve(data.jobId);
                    this.pendingRenderRequest = null;
                }

                this.onJobSubmitted(data.jobId, data.spec);
                break;

            case 'render_started':
                this.updateJobStatus(data.jobId, 'processing');
                break;

            case 'progress':
                this.updateJobProgress(data.jobId, data.progress, data.stage);
                break;

            case 'render_complete':
                this.completeJob(data.jobId, data);
                break;

            case 'error':
                console.error('Server error:', data.message);
                this.onJobFailed(data.jobId || null, data.message);
                break;

            case 'live_data':
                this.onLiveDataReceived(data);
                break;
        }
    }

    /**
     * Send message to MCP bridge (with queueing if disconnected)
     */
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.log('⏳ Queueing message (not connected)');
            this.messageQueue.push(message);
        }
    }

    /**
     * Submit a render request to Unreal Engine via MCP Bridge
     */
    async submitRender(spec) {
        if (!this.isConnected) {
            console.warn('⚠️ Not connected to MCP Bridge. Attempting to connect...');
            await this.connectWebSocket();
            if (!this.isConnected) {
                throw new Error('Unable to connect to Unreal Engine MCP Bridge');
            }
        }

        // Ensure spec has required fields
        const renderSpec = {
            type: 'render',
            renderType: spec.type || 'title-card',
            team: spec.team || 'cardinals',
            text: spec.text || 'Blaze Sports Intel',
            colors: spec.colors || {
                primary: '#BF5700',
                secondary: '#FFFFFF'
            },
            quality: spec.quality || 'production',
            resolution: spec.resolution || '3840x2160',
            engine: 'unreal-5.5',
            timestamp: Date.now()
        };

        // Add sports-specific parameters based on render type
        if (spec.type === 'championship-stadium') {
            renderSpec.stadium = spec.stadium || 'busch_stadium';
            renderSpec.weather = spec.weather || 'clear';
            renderSpec.timeOfDay = spec.timeOfDay || 'night';
            renderSpec.crowdDensity = spec.crowdDensity || 0.85;
        } else if (spec.type === 'player-spotlight') {
            renderSpec.playerName = spec.playerName || 'Player';
            renderSpec.action = spec.action || 'hero_pose';
            renderSpec.statsOverlay = spec.statsOverlay !== false;
            renderSpec.stats = spec.stats || {};
        } else if (spec.type === 'analytics-visualization') {
            renderSpec.visualizationType = spec.visualizationType || 'heatmap';
            renderSpec.data = spec.data;
            renderSpec.style = spec.style || 'holographic';
        } else if (spec.type === 'game-moment') {
            renderSpec.momentType = spec.momentType;
            renderSpec.teams = spec.teams;
            renderSpec.description = spec.description;
            renderSpec.cinematicMode = spec.cinematicMode !== false;
        } else if (spec.type === 'monte-carlo') {
            renderSpec.simulations = spec.simulations || 10000;
            renderSpec.scenario = spec.scenario || 'playoff_odds';
            renderSpec.teams = spec.teams || ['Cardinals', 'Yankees'];
            renderSpec.visualizationStyle = spec.visualizationStyle || 'probability_cloud';
        }

        // Send render request via WebSocket
        this.sendMessage(renderSpec);

        // Generate a temporary job ID (server will assign actual ID)
        const tempJobId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Return a promise that resolves when we get confirmation
        return new Promise((resolve, reject) => {
            // Set a timeout for response
            const timeout = setTimeout(() => {
                reject(new Error('Render request timeout'));
            }, 10000);

            // Store promise handlers for when we get server response
            this.pendingRenderRequest = {
                resolve: (jobId) => {
                    clearTimeout(timeout);
                    resolve(jobId);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                },
                tempJobId: tempJobId,
                spec: renderSpec
            };
        });
    }

    /**
     * Update job status
     */
    updateJobStatus(jobId, status) {
        const job = this.activeJobs.get(jobId);
        if (job) {
            job.status = status;
            console.log(`📊 Job ${jobId}: ${status}`);
        }
    }

    /**
     * Update job progress
     */
    updateJobProgress(jobId, progress, stage) {
        const job = this.activeJobs.get(jobId);
        if (job) {
            job.progress = progress;
            job.stage = stage;
            console.log(`⚡ Job ${jobId}: ${progress}% - ${stage}`);
            this.onJobProgress(jobId, progress, stage);
        }
    }

    /**
     * Complete a render job
     */
    completeJob(jobId, data) {
        const job = this.activeJobs.get(jobId);
        if (job) {
            job.status = 'completed';
            job.progress = 100;
            job.outputUrl = data.outputUrl;
            job.duration = data.duration;
            job.completedAt = Date.now();

            // Move to history
            this.renderHistory.unshift(job);
            this.activeJobs.delete(jobId);

            // Trigger completion callback
            this.onJobCompleted(jobId, job);
        }
    }

    /**
     * Handle live data from MCP bridge
     */
    onLiveDataReceived(data) {
        console.log('📊 Live data received:', data.dataType);
        // Can be used to update real-time visualizations
        // Broadcast live data to any listening components
        if (window.BlazeIntelligence && window.BlazeIntelligence.onLiveData) {
            window.BlazeIntelligence.onLiveData(data);
        }
    }

    /**
     * Create championship-quality render presets
     */
    getRenderPresets() {
        return {
            'title-card': {
                name: 'Championship Title Card',
                icon: '🎴',
                description: 'Broadcast-quality title sequence',
                duration: '15-30s',
                format: 'mp4'
            },
            'highlight-reel': {
                name: 'Highlight Reel',
                icon: '🎥',
                description: 'Dynamic sports highlights with transitions',
                duration: '30-60s',
                format: 'mp4'
            },
            'player-spotlight': {
                name: 'Player Spotlight',
                icon: '⭐',
                description: '3D player showcase with stats',
                duration: '10-20s',
                format: 'mp4'
            },
            'stadium-flythrough': {
                name: 'Stadium Flythrough',
                icon: '🏟️',
                description: 'Cinematic stadium tour',
                duration: '20-40s',
                format: 'mp4'
            },
            'spray-chart': {
                name: '3D Spray Chart',
                icon: '📊',
                description: 'Interactive hitting data visualization',
                duration: 'static',
                format: 'png'
            },
            'recruiting-card': {
                name: 'Recruiting Card',
                icon: '🎯',
                description: 'Player recruitment showcase',
                duration: 'static',
                format: 'png'
            }
        };
    }

    /**
     * Get team configurations
     */
    getTeamConfigs() {
        return {
            'cardinals': {
                name: 'St. Louis Cardinals',
                primaryColor: '#C41E3A',
                secondaryColor: '#FEDB00',
                logo: '⚾',
                stadium: 'Busch Stadium'
            },
            'titans': {
                name: 'Tennessee Titans',
                primaryColor: '#002244',
                secondaryColor: '#4B92DB',
                logo: '🏈',
                stadium: 'Nissan Stadium'
            },
            'longhorns': {
                name: 'Texas Longhorns',
                primaryColor: '#BF5700',
                secondaryColor: '#FFFFFF',
                logo: '🤘',
                stadium: 'DKR Stadium'
            },
            'grizzlies': {
                name: 'Memphis Grizzlies',
                primaryColor: '#5D76A9',
                secondaryColor: '#12294B',
                logo: '🐻',
                stadium: 'FedExForum'
            }
        };
    }

    /**
     * Initialize UI components if present on the page
     */
    initializeUI() {
        // Add Unreal Engine button to existing UI if found
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && !document.getElementById('unrealEngineBtn')) {
            const button = document.createElement('button');
            button.id = 'unrealEngineBtn';
            button.className = 'unreal-engine-btn';
            button.innerHTML = `
                <span class="unreal-badge">Unreal Engine 5.5</span>
                <span>Cinema Renders</span>
            `;
            button.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00D4FF, #0099CC);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 30px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
                transition: all 0.3s ease;
            `;

            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 0 50px rgba(0, 212, 255, 0.8)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
            });

            button.addEventListener('click', () => {
                this.openRenderPanel();
            });

            document.body.appendChild(button);
        }
    }

    /**
     * Open the render control panel
     */
    openRenderPanel() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'unrealRenderModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        // Create iframe for render UI
        const iframe = document.createElement('iframe');
        iframe.src = '/unreal-integration.html';
        iframe.style.cssText = `
            width: 90%;
            height: 90%;
            max-width: 1400px;
            border: none;
            border-radius: 20px;
            box-shadow: 0 0 100px rgba(0, 212, 255, 0.5);
        `;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.appendChild(iframe);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(isConnected) {
        const statusEl = document.getElementById('unrealStatus');
        if (statusEl) {
            statusEl.className = isConnected ? 'connected' : 'disconnected';
            statusEl.textContent = isConnected ?
                'Unreal Engine Connected' :
                'Unreal Engine Offline';
        }
    }

    /**
     * Render a championship stadium scene
     */
    async renderChampionshipStadium(options = {}) {
        return this.submitRender({
            type: 'championship-stadium',
            sport: options.sport || 'baseball',
            team: options.team || 'cardinals',
            weather: options.weather || 'clear',
            timeOfDay: options.timeOfDay || 'night',
            crowdDensity: options.crowdDensity || 0.85
        });
    }

    /**
     * Render a player spotlight
     */
    async renderPlayerSpotlight(playerName, options = {}) {
        return this.submitRender({
            type: 'player-spotlight',
            playerName: playerName,
            team: options.team || 'cardinals',
            sport: options.sport || 'baseball',
            action: options.action || 'hero_pose',
            statsOverlay: options.statsOverlay !== false
        });
    }

    /**
     * Render analytics visualization
     */
    async renderAnalytics(data, options = {}) {
        return this.submitRender({
            type: 'analytics-visualization',
            data: data,
            visualizationType: options.type || 'heatmap',
            sport: options.sport || 'baseball',
            style: options.style || 'holographic'
        });
    }

    /**
     * Render a game moment
     */
    async renderGameMoment(momentType, teams, description, options = {}) {
        return this.submitRender({
            type: 'game-moment',
            momentType: momentType,
            teams: teams,
            description: description,
            sport: options.sport || 'baseball',
            cinematicMode: options.cinematicMode !== false
        });
    }

    /**
     * Render Monte Carlo visualization
     */
    async renderMonteCarlo(simulationData, options = {}) {
        return this.submitRender({
            type: 'monte-carlo',
            simulationData: simulationData,
            visualizationStyle: options.style || 'probability_cloud',
            team: options.team
        });
    }

    // Event callbacks (can be overridden)
    onJobSubmitted(jobId, spec) {
        console.log(`🚀 Render job submitted: ${jobId}`);
    }

    onJobProgress(jobId, progress) {
        console.log(`⚡ Job ${jobId}: ${progress}% complete`);
    }

    onJobCompleted(jobId, job) {
        console.log(`✅ Render complete: ${jobId}`);
        console.log(`📍 URL: ${job.url}`);

        // Show notification if available
        if (window.showNotification) {
            window.showNotification('🎉 Render Complete!', 'success');
        }
    }

    onJobFailed(jobId, error) {
        console.error(`❌ Render failed: ${jobId}`, error);

        // Show error notification if available
        if (window.showNotification) {
            window.showNotification(`❌ Render failed: ${error}`, 'error');
        }
    }

    onJobTimeout(jobId) {
        console.warn(`⏱️ Render timeout: ${jobId}`);
    }
}

// 🚀 Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unrealEngine = new UnrealEngineIntegration();
    });
} else {
    window.unrealEngine = new UnrealEngineIntegration();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnrealEngineIntegration;
}