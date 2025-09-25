/**
 * 🎬 BLAZE SPORTS INTEL - UNREAL ENGINE 5.5 INTEGRATION MODULE
 * Cinema-quality rendering pipeline for championship sports visualization
 */

class UnrealEngineIntegration {
    constructor() {
        this.config = {
            apiBase: window.location.origin,
            apiKey: 'blaze-intelligence-unreal-2025',
            r2PublicBase: 'https://media.blazesportsintel.com',
            pollInterval: 2000,
            maxPollDuration: 300000 // 5 minutes
        };

        this.activeJobs = new Map();
        this.renderHistory = [];
        this.isConnected = false;

        this.init();
    }

    async init() {
        console.log('🎬 Initializing Unreal Engine 5.5 Integration...');

        // Check connection status
        await this.checkConnection();

        // Set up periodic health checks
        setInterval(() => this.checkConnection(), 10000);

        // Initialize UI if present
        this.initializeUI();

        console.log('✅ Unreal Engine Integration Ready!');
    }

    /**
     * Check connection to the Unreal MCP bridge
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.config.apiBase}/api/health`);
            this.isConnected = response.ok;
            this.updateConnectionStatus(this.isConnected);
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus(false);
            return false;
        }
    }

    /**
     * Submit a render request to Unreal Engine
     */
    async submitRender(spec) {
        // Ensure spec has required fields
        const renderSpec = {
            type: spec.type || 'title-card',
            team: spec.team || 'cardinals',
            text: spec.text || 'Blaze Sports Intel',
            colors: spec.colors || {
                primary: '#BF5700',
                secondary: '#FFFFFF'
            },
            quality: spec.quality || 'cinematic',
            resolution: spec.resolution || '4K',
            engine: 'unreal-5.5',
            timestamp: Date.now()
        };

        try {
            const response = await fetch(`${this.config.apiBase}/api/render`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify(renderSpec)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.ok && result.id) {
                // Track the job
                this.activeJobs.set(result.id, {
                    id: result.id,
                    spec: renderSpec,
                    status: 'queued',
                    startTime: Date.now()
                });

                // Start polling for status
                this.pollJobStatus(result.id);

                // Trigger UI update
                this.onJobSubmitted(result.id, renderSpec);

                return result.id;
            }

            throw new Error('Invalid response from server');
        } catch (error) {
            console.error('❌ Render submission failed:', error);
            this.onJobFailed(null, error.message);
            throw error;
        }
    }

    /**
     * Poll for job status updates
     */
    async pollJobStatus(jobId) {
        const startTime = Date.now();

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${this.config.apiBase}/api/render/status?id=${jobId}`);
                const data = await response.json();

                if (!data.ok) {
                    throw new Error('Status check failed');
                }

                const job = this.activeJobs.get(jobId);
                if (job) {
                    job.status = data.status;
                    job.progress = data.progress || 0;

                    if (data.status === 'done' && data.r2_key) {
                        clearInterval(interval);
                        job.url = `${this.config.r2PublicBase}/${data.r2_key}`;
                        job.duration = data.duration_s;
                        job.completedAt = Date.now();

                        // Move to history
                        this.renderHistory.unshift(job);
                        this.activeJobs.delete(jobId);

                        // Trigger completion callback
                        this.onJobCompleted(jobId, job);
                    } else if (data.status === 'failed') {
                        clearInterval(interval);
                        job.error = data.error || 'Unknown error';

                        // Move to history with failed status
                        this.renderHistory.unshift(job);
                        this.activeJobs.delete(jobId);

                        // Trigger failure callback
                        this.onJobFailed(jobId, job.error);
                    } else if (data.status === 'processing') {
                        // Update progress
                        this.onJobProgress(jobId, job.progress);
                    }
                }

                // Stop polling after max duration
                if (Date.now() - startTime > this.config.maxPollDuration) {
                    clearInterval(interval);
                    console.warn(`⏱️ Job ${jobId} polling timeout`);
                    this.onJobTimeout(jobId);
                }
            } catch (error) {
                console.error('Poll error:', error);
            }
        }, this.config.pollInterval);
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