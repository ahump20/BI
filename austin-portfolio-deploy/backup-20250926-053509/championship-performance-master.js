/**
 * BLAZE INTELLIGENCE - CHAMPIONSHIP PERFORMANCE MASTER CONTROLLER
 * Ultimate 60FPS Performance System Integration
 * Austin Humphrey - blazesportsintel.com - Deep South Sports Authority
 */

class ChampionshipPerformanceMaster {
    constructor() {
        this.performanceEngines = {
            optimization: null,    // 60FPS Optimization Engine
            shaders: null,        // WebGL Shader Optimizer
            memory: null,         // Memory Optimizer
            mobile: null,         // Mobile Optimizer
            analytics: null       // Performance Analytics
        };

        this.masterConfig = {
            targetFPS: 60,
            adaptiveQuality: true,
            autoOptimization: true,
            emergencyFallback: true,
            performanceLogging: true
        };

        this.systemState = {
            initialized: false,
            performanceTier: 'detecting',
            activeOptimizations: new Set(),
            healthScore: 100,
            warningLevel: 'none' // 'none', 'low', 'medium', 'high', 'critical'
        };

        this.performanceTargets = {
            fps: { min: 45, target: 60, excellent: 90 },
            frameTime: { max: 22, target: 16.67, excellent: 11 },
            memoryUsage: { max: 400, target: 200, excellent: 150 }, // MB
            drawCalls: { max: 150, target: 100, excellent: 70 },
            loadTime: { max: 5000, target: 2000, excellent: 1000 } // ms
        };

        this.emergencyProtocols = {
            triggered: false,
            fallbackMode: false,
            recoveryAttempts: 0,
            maxRecoveryAttempts: 3
        };

        this.initialize();
    }

    async initialize() {
        console.log('🚀 Championship Performance Master Controller Initializing...');

        try {
            await this.initializePerformanceEngines();
            await this.detectSystemCapabilities();
            await this.setupPerformanceMonitoring();
            await this.createUnifiedInterface();
            await this.startMasterPerformanceLoop();

            this.systemState.initialized = true;
            console.log('🏆 CHAMPIONSHIP PERFORMANCE SYSTEM FULLY ACTIVE - 60FPS GUARANTEED');

            this.logSystemInitialization();
        } catch (error) {
            console.error('❌ Performance Master initialization failed:', error);
            await this.initializeEmergencyMode();
        }
    }

    async initializePerformanceEngines() {
        console.log('⚡ Initializing performance engines...');

        // Initialize core optimization engine
        if (window.Championship60FPS) {
            this.performanceEngines.optimization = window.Championship60FPS.initialize();
            console.log('✅ 60FPS Optimization Engine loaded');
        }

        // Initialize shader optimizer
        if (window.ChampionshipShaders) {
            this.performanceEngines.shaders = window.ChampionshipShaders.initialize();
            console.log('✅ Shader Optimizer loaded');
        }

        // Initialize memory optimizer
        if (window.ChampionshipMemory) {
            this.performanceEngines.memory = window.ChampionshipMemory.initialize();
            console.log('✅ Memory Optimizer loaded');
        }

        // Initialize mobile optimizer
        if (window.BlazeIntelligenceMobile) {
            this.performanceEngines.mobile = window.BlazeIntelligenceMobile.initialize();
            console.log('✅ Mobile Optimizer loaded');
        }

        // Create performance analytics engine
        this.performanceEngines.analytics = new ChampionshipPerformanceAnalytics();
        console.log('✅ Performance Analytics loaded');
    }

    async detectSystemCapabilities() {
        console.log('🔍 Detecting system capabilities...');

        const capabilities = {
            // Device detection
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Android.*(?!.*Mobile)/i.test(navigator.userAgent),
            platform: navigator.platform,

            // Hardware detection
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            pixelRatio: window.devicePixelRatio || 1,
            screenSize: window.innerWidth * window.innerHeight,

            // WebGL capabilities
            webGL: this.detectWebGLCapabilities(),

            // Network detection
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,

            // Battery status
            battery: null
        };

        // Try to get battery information
        if ('getBattery' in navigator) {
            try {
                capabilities.battery = await navigator.getBattery();
            } catch (error) {
                console.log('Battery API not available');
            }
        }

        // Determine performance tier
        this.systemState.performanceTier = this.calculatePerformanceTier(capabilities);

        console.log(`📊 System classified as: ${this.systemState.performanceTier.toUpperCase()} tier`);
        console.log('System capabilities:', capabilities);

        this.systemCapabilities = capabilities;
    }

    detectWebGLCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) return null;

        return {
            version: gl.getParameter(gl.VERSION),
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            webGL2: gl.constructor.name.includes('2'),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            extensions: gl.getSupportedExtensions()
        };
    }

    calculatePerformanceTier(capabilities) {
        let score = 0;

        // Mobile penalty/bonus
        if (capabilities.isMobile) {
            score -= 20;
        } else {
            score += 10;
        }

        // CPU cores
        score += capabilities.cores * 8;

        // RAM
        score += capabilities.memory * 6;

        // WebGL support
        if (capabilities.webGL) {
            score += 15;
            if (capabilities.webGL.webGL2) score += 15;

            // GPU quality estimation
            const renderer = capabilities.webGL.renderer.toLowerCase();
            if (renderer.includes('rtx') || renderer.includes('rx 6') || renderer.includes('rx 7')) {
                score += 40;
            } else if (renderer.includes('gtx') || renderer.includes('rx 5')) {
                score += 25;
            } else if (renderer.includes('adreno') || renderer.includes('mali')) {
                score += capabilities.isMobile ? 15 : 8;
            }
        }

        // Screen resolution impact
        if (capabilities.screenSize > 2073600) score -= 15; // 4K
        else if (capabilities.screenSize > 921600) score -= 8; // 1080p

        // Network quality
        if (capabilities.connection) {
            const netScore = {
                'slow-2g': -10,
                '2g': -5,
                '3g': 0,
                '4g': 5
            }[capabilities.connection.effectiveType] || 0;
            score += netScore;
        }

        // Determine tier
        if (score >= 100) return 'championship';
        if (score >= 70) return 'professional';
        if (score >= 40) return 'competitive';
        return 'optimized';
    }

    async setupPerformanceMonitoring() {
        console.log('📊 Setting up unified performance monitoring...');

        this.performanceMonitor = {
            metrics: {
                fps: 60,
                frameTime: 16.67,
                memoryUsage: 0,
                gpuMemory: 0,
                drawCalls: 0,
                triangles: 0,
                loadTime: 0,
                networkLatency: 0
            },

            history: [],
            maxHistory: 1000,

            thresholds: this.performanceTargets,

            collectors: {
                fps: new FPSCollector(),
                memory: new MemoryCollector(),
                network: new NetworkCollector(),
                render: new RenderCollector()
            },

            intervals: {
                realtime: 100,   // 100ms for real-time metrics
                detailed: 1000,  // 1s for detailed analysis
                reporting: 5000  // 5s for health reports
            }
        };

        // Start monitoring loops
        this.startRealtimeMonitoring();
        this.startDetailedMonitoring();
        this.startHealthReporting();
    }

    startRealtimeMonitoring() {
        setInterval(() => {
            this.collectRealtimeMetrics();
            this.updateHealthScore();
            this.checkEmergencyConditions();
        }, this.performanceMonitor.intervals.realtime);
    }

    startDetailedMonitoring() {
        setInterval(() => {
            this.collectDetailedMetrics();
            this.analyzePerformanceTrends();
            this.optimizeIfNeeded();
        }, this.performanceMonitor.intervals.detailed);
    }

    startHealthReporting() {
        setInterval(() => {
            this.generateHealthReport();
            this.reportToAnalytics();
            this.adjustSystemConfiguration();
        }, this.performanceMonitor.intervals.reporting);
    }

    collectRealtimeMetrics() {
        const metrics = this.performanceMonitor.metrics;

        // FPS from optimization engine
        if (this.performanceEngines.optimization) {
            const report = this.performanceEngines.optimization.getPerformanceReport();
            if (report) {
                metrics.fps = report.performance.averageFPS;
                metrics.frameTime = report.performance.averageFrameTime;
            }
        }

        // Memory from memory optimizer
        if (this.performanceEngines.memory) {
            const memoryReport = this.performanceEngines.memory.getMemoryReport();
            if (memoryReport) {
                metrics.memoryUsage = memoryReport.system.currentUsage / (1024 * 1024); // Convert to MB
            }
        }

        // Shader performance
        if (this.performanceEngines.shaders) {
            const shaderReport = this.performanceEngines.shaders.getPerformanceReport();
            if (shaderReport && shaderReport.shaderPerformance) {
                metrics.drawCalls = shaderReport.shaderPerformance.drawCalls;
                metrics.triangles = shaderReport.shaderPerformance.triangles;
            }
        }

        // Store in history
        this.performanceMonitor.history.push({
            timestamp: Date.now(),
            ...metrics
        });

        // Trim history
        if (this.performanceMonitor.history.length > this.performanceMonitor.maxHistory) {
            this.performanceMonitor.history.shift();
        }
    }

    collectDetailedMetrics() {
        // Collect detailed metrics from all engines
        const detailedMetrics = {
            system: this.systemCapabilities,
            optimization: this.performanceEngines.optimization?.getPerformanceReport(),
            shaders: this.performanceEngines.shaders?.getPerformanceReport(),
            memory: this.performanceEngines.memory?.getMemoryReport(),
            mobile: this.performanceEngines.mobile?.getDeviceCapabilities()
        };

        this.performanceEngines.analytics.recordDetailedMetrics(detailedMetrics);
    }

    updateHealthScore() {
        const metrics = this.performanceMonitor.metrics;
        let score = 100;

        // FPS penalty
        if (metrics.fps < this.performanceTargets.fps.min) {
            score -= 30;
        } else if (metrics.fps < this.performanceTargets.fps.target) {
            score -= 15;
        }

        // Frame time penalty
        if (metrics.frameTime > this.performanceTargets.frameTime.max) {
            score -= 20;
        } else if (metrics.frameTime > this.performanceTargets.frameTime.target) {
            score -= 10;
        }

        // Memory penalty
        if (metrics.memoryUsage > this.performanceTargets.memoryUsage.max) {
            score -= 25;
        } else if (metrics.memoryUsage > this.performanceTargets.memoryUsage.target) {
            score -= 12;
        }

        // Draw calls penalty
        if (metrics.drawCalls > this.performanceTargets.drawCalls.max) {
            score -= 15;
        } else if (metrics.drawCalls > this.performanceTargets.drawCalls.target) {
            score -= 8;
        }

        this.systemState.healthScore = Math.max(0, score);

        // Update warning level
        if (score <= 20) {
            this.systemState.warningLevel = 'critical';
        } else if (score <= 40) {
            this.systemState.warningLevel = 'high';
        } else if (score <= 60) {
            this.systemState.warningLevel = 'medium';
        } else if (score <= 80) {
            this.systemState.warningLevel = 'low';
        } else {
            this.systemState.warningLevel = 'none';
        }
    }

    checkEmergencyConditions() {
        const metrics = this.performanceMonitor.metrics;

        // Emergency conditions
        const emergencyConditions = [
            metrics.fps < 30,                                    // Critically low FPS
            metrics.frameTime > 33,                             // Frame time over 33ms
            metrics.memoryUsage > this.performanceTargets.memoryUsage.max * 1.5, // 150% of max memory
            this.systemState.healthScore < 20                   // Critical health score
        ];

        const emergencyActive = emergencyConditions.some(condition => condition);

        if (emergencyActive && !this.emergencyProtocols.triggered) {
            this.triggerEmergencyProtocols();
        } else if (!emergencyActive && this.emergencyProtocols.triggered) {
            this.disableEmergencyProtocols();
        }
    }

    triggerEmergencyProtocols() {
        console.log('🚨 EMERGENCY PERFORMANCE PROTOCOLS ACTIVATED!');

        this.emergencyProtocols.triggered = true;
        this.emergencyProtocols.recoveryAttempts++;

        if (this.emergencyProtocols.recoveryAttempts <= this.emergencyProtocols.maxRecoveryAttempts) {
            this.executeEmergencyOptimizations();
        } else {
            this.activateFallbackMode();
        }
    }

    executeEmergencyOptimizations() {
        console.log('🔥 Executing emergency optimizations...');

        // Trigger emergency cleanup in all engines
        if (this.performanceEngines.optimization) {
            this.performanceEngines.optimization.optimizeFor60FPS();
        }

        if (this.performanceEngines.memory) {
            this.performanceEngines.memory.triggerCleanup();
        }

        if (this.performanceEngines.shaders) {
            this.performanceEngines.shaders.optimizer?.downgradeShaderTier();
        }

        // Reduce quality settings globally
        this.setGlobalQualityLevel('optimized');

        // Disable non-essential features
        this.disableNonEssentialFeatures();

        this.systemState.activeOptimizations.add('emergency');
    }

    activateFallbackMode() {
        console.log('⚠️ ACTIVATING FALLBACK MODE - Minimal Performance Configuration');

        this.emergencyProtocols.fallbackMode = true;

        // Switch to absolute minimal configuration
        this.setGlobalQualityLevel('minimal');

        // Disable all advanced features
        this.disableAdvancedFeatures();

        // Show performance warning to user
        this.showPerformanceWarning();

        this.systemState.activeOptimizations.add('fallback');
    }

    disableEmergencyProtocols() {
        console.log('✅ Emergency protocols deactivated - Performance recovered');

        this.emergencyProtocols.triggered = false;
        this.emergencyProtocols.fallbackMode = false;
        this.emergencyProtocols.recoveryAttempts = 0;

        // Re-enable features gradually
        this.graduallyRestoreFeatures();

        this.systemState.activeOptimizations.delete('emergency');
        this.systemState.activeOptimizations.delete('fallback');
    }

    analyzePerformanceTrends() {
        const history = this.performanceMonitor.history;
        if (history.length < 10) return;

        const recentHistory = history.slice(-10);
        const trends = {
            fps: this.calculateTrend(recentHistory.map(h => h.fps)),
            frameTime: this.calculateTrend(recentHistory.map(h => h.frameTime)),
            memoryUsage: this.calculateTrend(recentHistory.map(h => h.memoryUsage))
        };

        // Predictive optimization
        if (trends.fps < -2) {
            console.log('📉 FPS declining - Preemptive optimization triggered');
            this.preemptiveOptimization('fps');
        }

        if (trends.memoryUsage > 5) {
            console.log('📈 Memory usage increasing - Preemptive cleanup triggered');
            this.preemptiveOptimization('memory');
        }

        this.performanceTrends = trends;
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;

        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    optimizeIfNeeded() {
        const metrics = this.performanceMonitor.metrics;

        // Adaptive optimization triggers
        if (metrics.fps < this.performanceTargets.fps.target && !this.systemState.activeOptimizations.has('fps')) {
            this.triggerOptimization('fps');
        }

        if (metrics.memoryUsage > this.performanceTargets.memoryUsage.target && !this.systemState.activeOptimizations.has('memory')) {
            this.triggerOptimization('memory');
        }

        if (metrics.drawCalls > this.performanceTargets.drawCalls.target && !this.systemState.activeOptimizations.has('render')) {
            this.triggerOptimization('render');
        }
    }

    triggerOptimization(type) {
        console.log(`🎯 Triggering ${type} optimization`);

        switch (type) {
            case 'fps':
                if (this.performanceEngines.optimization) {
                    this.performanceEngines.optimization.optimizeFor60FPS();
                }
                break;

            case 'memory':
                if (this.performanceEngines.memory) {
                    this.performanceEngines.memory.triggerCleanup();
                }
                break;

            case 'render':
                if (this.performanceEngines.shaders) {
                    this.performanceEngines.shaders.optimizeRenderState();
                }
                break;
        }

        this.systemState.activeOptimizations.add(type);

        // Remove optimization flag after cooldown period
        setTimeout(() => {
            this.systemState.activeOptimizations.delete(type);
        }, 10000);
    }

    preemptiveOptimization(type) {
        console.log(`🔮 Preemptive ${type} optimization`);
        this.triggerOptimization(type);
    }

    setGlobalQualityLevel(level) {
        console.log(`🎛️ Setting global quality level to: ${level}`);

        // Update all engines with new quality level
        if (this.performanceEngines.optimization) {
            this.performanceEngines.optimization.setQualityLevel(level);
        }

        if (this.performanceEngines.shaders && this.performanceEngines.shaders.optimizer) {
            this.performanceEngines.shaders.optimizer.applyQualityLevel(level);
        }

        // Update 3D engine if available
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            this.apply3DQualitySettings(level);
        }
    }

    apply3DQualitySettings(level) {
        const engine = window.BlazeIntelligence3D.engine;
        if (!engine) return;

        const settings = {
            minimal: {
                particleCount: 100,
                shadowsEnabled: false,
                antialiasing: false,
                pixelRatio: 0.5
            },
            optimized: {
                particleCount: 400,
                shadowsEnabled: false,
                antialiasing: false,
                pixelRatio: 0.75
            },
            competitive: {
                particleCount: 800,
                shadowsEnabled: true,
                antialiasing: false,
                pixelRatio: 1.0
            },
            professional: {
                particleCount: 1500,
                shadowsEnabled: true,
                antialiasing: true,
                pixelRatio: 1.0
            },
            championship: {
                particleCount: 3000,
                shadowsEnabled: true,
                antialiasing: true,
                pixelRatio: Math.min(window.devicePixelRatio, 2)
            }
        };

        const config = settings[level] || settings.optimized;

        // Apply settings to renderer
        if (engine.renderer) {
            engine.renderer.setPixelRatio(config.pixelRatio);
            engine.renderer.shadowMap.enabled = config.shadowsEnabled;
        }

        // Update particle systems
        const particles = engine.scene.children.filter(child =>
            child.userData && child.userData.type === 'dataPoint'
        );

        if (particles.length > config.particleCount) {
            const excess = particles.length - config.particleCount;
            for (let i = 0; i < excess; i++) {
                engine.scene.remove(particles[i]);
                if (particles[i].geometry) particles[i].geometry.dispose();
                if (particles[i].material) particles[i].material.dispose();
            }
        }
    }

    disableNonEssentialFeatures() {
        // Disable animations
        if (window.gsap) {
            window.gsap.globalTimeline.pause();
        }

        // Disable post-processing
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine && window.BlazeIntelligence3D.engine.composer) {
            window.BlazeIntelligence3D.engine.composer.enabled = false;
        }

        // Reduce update frequencies
        this.performanceMonitor.intervals.realtime = 200;
        this.performanceMonitor.intervals.detailed = 2000;
    }

    disableAdvancedFeatures() {
        this.disableNonEssentialFeatures();

        // Disable all particle systems
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const particles = window.BlazeIntelligence3D.engine.scene.children.filter(child =>
                child.userData && child.userData.type === 'dataPoint'
            );
            particles.forEach(particle => {
                particle.visible = false;
            });
        }

        // Disable charts animations
        if (window.Chart) {
            Chart.defaults.animation = false;
        }
    }

    graduallyRestoreFeatures() {
        console.log('🔄 Gradually restoring features...');

        // Restore features in stages
        setTimeout(() => {
            if (window.gsap) {
                window.gsap.globalTimeline.resume();
            }
        }, 1000);

        setTimeout(() => {
            this.setGlobalQualityLevel(this.systemState.performanceTier);
        }, 3000);

        setTimeout(() => {
            // Restore normal update frequencies
            this.performanceMonitor.intervals.realtime = 100;
            this.performanceMonitor.intervals.detailed = 1000;
        }, 5000);
    }

    showPerformanceWarning() {
        const warning = document.createElement('div');
        warning.id = 'performance-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 999999;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        warning.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Performance Mode Active</div>
            <div>Visual quality reduced to maintain smooth experience</div>
            <button style="margin-top: 10px; padding: 5px 15px; background: white; color: red; border: none; border-radius: 5px; cursor: pointer;" onclick="this.parentElement.remove()">OK</button>
        `;

        document.body.appendChild(warning);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }

    generateHealthReport() {
        const report = {
            timestamp: Date.now(),
            systemState: { ...this.systemState },
            performance: { ...this.performanceMonitor.metrics },
            trends: this.performanceTrends,
            capabilities: this.systemCapabilities,
            engines: {
                optimization: this.performanceEngines.optimization?.getPerformanceReport(),
                shaders: this.performanceEngines.shaders?.getPerformanceReport(),
                memory: this.performanceEngines.memory?.getMemoryReport(),
                mobile: this.performanceEngines.mobile?.isActive() ? this.performanceEngines.mobile.getDeviceCapabilities() : null
            },
            recommendations: this.generateRecommendations()
        };

        this.lastHealthReport = report;
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        const metrics = this.performanceMonitor.metrics;

        if (metrics.fps < this.performanceTargets.fps.target) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'Frame rate below target - consider reducing visual quality',
                action: 'reduce_quality'
            });
        }

        if (metrics.memoryUsage > this.performanceTargets.memoryUsage.target) {
            recommendations.push({
                type: 'memory',
                priority: 'medium',
                message: 'High memory usage detected - cleanup recommended',
                action: 'cleanup_memory'
            });
        }

        if (this.systemCapabilities.isMobile && !this.performanceEngines.mobile?.isActive()) {
            recommendations.push({
                type: 'mobile',
                priority: 'high',
                message: 'Mobile device detected - enable mobile optimizations',
                action: 'enable_mobile'
            });
        }

        return recommendations;
    }

    reportToAnalytics() {
        if (this.performanceEngines.analytics) {
            this.performanceEngines.analytics.recordHealthReport(this.lastHealthReport);
        }
    }

    adjustSystemConfiguration() {
        const report = this.lastHealthReport;
        if (!report) return;

        // Auto-adjust configuration based on performance
        if (report.performance.fps < this.performanceTargets.fps.min &&
            !this.systemState.activeOptimizations.has('auto_quality')) {

            const currentTierIndex = ['optimized', 'competitive', 'professional', 'championship'].indexOf(this.systemState.performanceTier);
            if (currentTierIndex > 0) {
                const newTier = ['optimized', 'competitive', 'professional', 'championship'][currentTierIndex - 1];
                this.setGlobalQualityLevel(newTier);
                this.systemState.activeOptimizations.add('auto_quality');

                console.log(`🎛️ Auto-downgraded to ${newTier} quality for better performance`);
            }
        }
    }

    async createUnifiedInterface() {
        // Create master performance dashboard
        this.performanceDashboard = new ChampionshipPerformanceDashboard(this);

        // Create keyboard shortcuts for debugging
        this.setupKeyboardShortcuts();

        // Create performance overlay if in development
        if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
            this.performanceDashboard.createDebugOverlay();
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + Shift + P: Toggle performance overlay
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                this.performanceDashboard.toggleOverlay();
            }

            // Ctrl/Cmd + Shift + M: Toggle memory overlay
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
                event.preventDefault();
                this.performanceDashboard.toggleMemoryOverlay();
            }

            // Ctrl/Cmd + Shift + Q: Cycle quality levels
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Q') {
                event.preventDefault();
                this.cycleQualityLevel();
            }

            // Ctrl/Cmd + Shift + R: Force optimization
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.triggerOptimization('fps');
            }
        });
    }

    cycleQualityLevel() {
        const levels = ['optimized', 'competitive', 'professional', 'championship'];
        const currentIndex = levels.indexOf(this.systemState.performanceTier);
        const nextIndex = (currentIndex + 1) % levels.length;
        const nextLevel = levels[nextIndex];

        this.setGlobalQualityLevel(nextLevel);
        this.systemState.performanceTier = nextLevel;

        console.log(`🔄 Quality level cycled to: ${nextLevel}`);
    }

    async startMasterPerformanceLoop() {
        console.log('🔄 Starting master performance loop...');

        const performanceLoop = async () => {
            try {
                // Coordinate all performance engines
                await this.coordinateEngines();

                // Update global performance state
                this.updateGlobalState();

                // Schedule next iteration
                requestAnimationFrame(performanceLoop);
            } catch (error) {
                console.error('Performance loop error:', error);

                // Try to recover
                setTimeout(performanceLoop, 100);
            }
        };

        requestAnimationFrame(performanceLoop);
    }

    async coordinateEngines() {
        // Coordinate shader optimization with 3D engine
        if (this.performanceEngines.shaders && window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            this.performanceEngines.shaders.optimizeRenderState(
                window.BlazeIntelligence3D.engine.renderer,
                window.BlazeIntelligence3D.engine.scene,
                window.BlazeIntelligence3D.engine.camera
            );
        }

        // Coordinate memory optimization with asset loading
        if (this.performanceEngines.memory && this.assetLoadQueue?.length > 0) {
            // Process asset queue with memory constraints
            await this.processAssetsWithMemoryLimit();
        }
    }

    updateGlobalState() {
        // Update global performance indicators
        const currentTime = Date.now();

        // Update FPS indicator in UI
        this.updateFPSIndicator();

        // Update memory usage indicator
        this.updateMemoryIndicator();

        // Update quality indicator
        this.updateQualityIndicator();
    }

    updateFPSIndicator() {
        const fpsElement = document.getElementById('fps-indicator');
        if (fpsElement) {
            const fps = Math.round(this.performanceMonitor.metrics.fps);
            fpsElement.textContent = `${fps} FPS`;

            // Color coding
            if (fps >= 55) {
                fpsElement.style.color = '#00FF00';
            } else if (fps >= 40) {
                fpsElement.style.color = '#FFFF00';
            } else {
                fpsElement.style.color = '#FF0000';
            }
        }
    }

    updateMemoryIndicator() {
        const memoryElement = document.getElementById('memory-indicator');
        if (memoryElement) {
            const memory = Math.round(this.performanceMonitor.metrics.memoryUsage);
            memoryElement.textContent = `${memory}MB`;

            // Color coding
            if (memory < this.performanceTargets.memoryUsage.target) {
                memoryElement.style.color = '#00FF00';
            } else if (memory < this.performanceTargets.memoryUsage.max) {
                memoryElement.style.color = '#FFFF00';
            } else {
                memoryElement.style.color = '#FF0000';
            }
        }
    }

    updateQualityIndicator() {
        const qualityElement = document.getElementById('quality-indicator');
        if (qualityElement) {
            qualityElement.textContent = this.systemState.performanceTier.toUpperCase();
        }
    }

    async initializeEmergencyMode() {
        console.log('🆘 Initializing emergency mode...');

        // Create minimal performance system
        this.performanceMonitor = {
            metrics: { fps: 30, frameTime: 33, memoryUsage: 0 },
            history: [],
            collectors: {},
            intervals: { realtime: 500, detailed: 5000 }
        };

        this.systemState = {
            initialized: true,
            performanceTier: 'emergency',
            activeOptimizations: new Set(['emergency']),
            healthScore: 20,
            warningLevel: 'critical'
        };

        // Start minimal monitoring
        setInterval(() => {
            this.collectBasicMetrics();
        }, 500);

        console.log('🆘 Emergency mode active - Basic functionality only');
    }

    collectBasicMetrics() {
        // Very basic FPS measurement
        if (!this.lastFrameTime) this.lastFrameTime = performance.now();
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.performanceMonitor.metrics.fps = Math.round(1000 / frameTime);
        this.performanceMonitor.metrics.frameTime = frameTime;

        if ('memory' in performance) {
            this.performanceMonitor.metrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024);
        }
    }

    logSystemInitialization() {
        const initLog = {
            timestamp: new Date().toISOString(),
            systemTier: this.systemState.performanceTier,
            engines: Object.keys(this.performanceEngines).filter(key => this.performanceEngines[key] !== null),
            capabilities: this.systemCapabilities,
            targets: this.performanceTargets
        };

        console.log('🏆 Championship Performance System Initialization Complete:', initLog);

        // Send to analytics if available
        if (this.performanceEngines.analytics) {
            this.performanceEngines.analytics.logSystemInitialization(initLog);
        }
    }

    // Public API methods
    getSystemStatus() {
        return {
            initialized: this.systemState.initialized,
            performanceTier: this.systemState.performanceTier,
            healthScore: this.systemState.healthScore,
            warningLevel: this.systemState.warningLevel,
            activeOptimizations: Array.from(this.systemState.activeOptimizations),
            emergencyMode: this.emergencyProtocols.fallbackMode,
            currentMetrics: { ...this.performanceMonitor.metrics },
            lastHealthReport: this.lastHealthReport
        };
    }

    forceOptimization(type = 'all') {
        if (type === 'all') {
            ['fps', 'memory', 'render'].forEach(t => this.triggerOptimization(t));
        } else {
            this.triggerOptimization(type);
        }
    }

    setTargetFPS(fps) {
        this.performanceTargets.fps.target = fps;
        this.masterConfig.targetFPS = fps;

        if (this.performanceEngines.optimization) {
            this.performanceEngines.optimization.targetFPS = fps;
        }

        console.log(`🎯 Target FPS updated to: ${fps}`);
    }

    enableDebugMode() {
        if (this.performanceDashboard) {
            this.performanceDashboard.createDebugOverlay();
        }
    }

    disableDebugMode() {
        if (this.performanceDashboard) {
            this.performanceDashboard.hideDebugOverlay();
        }
    }

    // Cleanup
    dispose() {
        // Dispose all performance engines
        Object.values(this.performanceEngines).forEach(engine => {
            if (engine && engine.dispose) {
                engine.dispose();
            }
        });

        // Clear intervals
        clearInterval(this.realtimeMonitoringInterval);
        clearInterval(this.detailedMonitoringInterval);
        clearInterval(this.healthReportingInterval);

        // Remove event listeners
        document.removeEventListener('keydown', this.keyboardShortcutHandler);

        console.log('🧹 Championship Performance Master disposed');
    }
}

// Minimal FPS collector
class FPSCollector {
    constructor() {
        this.frames = 0;
        this.lastTime = performance.now();
        this.fps = 60;
    }

    update() {
        this.frames++;
        const now = performance.now();

        if (now >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
            this.frames = 0;
            this.lastTime = now;
        }

        return this.fps;
    }
}

// Minimal memory collector
class MemoryCollector {
    constructor() {
        this.lastUsage = 0;
    }

    update() {
        if ('memory' in performance) {
            this.lastUsage = performance.memory.usedJSHeapSize;
        }
        return this.lastUsage;
    }
}

// Network performance collector
class NetworkCollector {
    constructor() {
        this.connection = navigator.connection;
        this.lastLatency = 0;
    }

    update() {
        if (this.connection) {
            return {
                effectiveType: this.connection.effectiveType,
                downlink: this.connection.downlink,
                rtt: this.connection.rtt
            };
        }
        return null;
    }
}

// Render performance collector
class RenderCollector {
    constructor() {
        this.lastDrawCalls = 0;
        this.lastTriangles = 0;
    }

    update(renderer) {
        if (renderer && renderer.info) {
            this.lastDrawCalls = renderer.info.render.calls;
            this.lastTriangles = renderer.info.render.triangles;
        }

        return {
            drawCalls: this.lastDrawCalls,
            triangles: this.lastTriangles
        };
    }
}

// Performance analytics engine
class ChampionshipPerformanceAnalytics {
    constructor() {
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            deviceInfo: {},
            performanceLog: [],
            errors: [],
            optimizations: []
        };
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    recordDetailedMetrics(metrics) {
        this.sessionData.performanceLog.push({
            timestamp: Date.now(),
            ...metrics
        });

        // Keep only last 100 entries to prevent memory bloat
        if (this.sessionData.performanceLog.length > 100) {
            this.sessionData.performanceLog.shift();
        }
    }

    recordHealthReport(report) {
        this.sessionData.healthReports = this.sessionData.healthReports || [];
        this.sessionData.healthReports.push(report);

        // Keep only last 20 health reports
        if (this.sessionData.healthReports.length > 20) {
            this.sessionData.healthReports.shift();
        }
    }

    logSystemInitialization(initLog) {
        this.sessionData.initialization = initLog;
    }

    getAnalyticsReport() {
        return {
            sessionId: this.sessionData.sessionId,
            sessionDuration: Date.now() - this.sessionData.startTime,
            performanceSummary: this.calculatePerformanceSummary(),
            optimizationHistory: this.sessionData.optimizations,
            errorCount: this.sessionData.errors.length
        };
    }

    calculatePerformanceSummary() {
        const logs = this.sessionData.performanceLog;
        if (logs.length === 0) return null;

        // Calculate averages and trends
        const fpsValues = logs.map(log => log.optimization?.performance?.averageFPS).filter(Boolean);
        const memoryValues = logs.map(log => log.memory?.system?.currentUsage).filter(Boolean);

        return {
            averageFPS: fpsValues.length > 0 ? fpsValues.reduce((a, b) => a + b) / fpsValues.length : 0,
            averageMemory: memoryValues.length > 0 ? memoryValues.reduce((a, b) => a + b) / memoryValues.length : 0,
            dataPoints: logs.length
        };
    }
}

// Performance dashboard
class ChampionshipPerformanceDashboard {
    constructor(master) {
        this.master = master;
        this.overlayVisible = false;
        this.memoryOverlayVisible = false;
    }

    createDebugOverlay() {
        if (document.getElementById('performance-debug-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'performance-debug-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #FFD700;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 999999;
            min-width: 300px;
            border: 2px solid #FFD700;
        `;

        document.body.appendChild(overlay);
        this.updateDebugOverlay();

        // Update every second
        this.debugUpdateInterval = setInterval(() => {
            this.updateDebugOverlay();
        }, 1000);
    }

    updateDebugOverlay() {
        const overlay = document.getElementById('performance-debug-overlay');
        if (!overlay) return;

        const status = this.master.getSystemStatus();
        const metrics = status.currentMetrics;

        overlay.innerHTML = `
            <div style="font-weight: bold; color: #FFD700; margin-bottom: 10px; text-align: center;">
                🏆 CHAMPIONSHIP PERFORMANCE DEBUG
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div style="color: #00B2A9; font-weight: bold; margin-bottom: 5px;">System Status</div>
                    <div>Tier: <span style="color: #BF5700;">${status.performanceTier.toUpperCase()}</span></div>
                    <div>Health: <span style="color: ${this.getHealthColor(status.healthScore)}">${status.healthScore}%</span></div>
                    <div>Warning: <span style="color: ${this.getWarningColor(status.warningLevel)}">${status.warningLevel.toUpperCase()}</span></div>
                    <div>Emergency: <span style="color: ${status.emergencyMode ? '#FF0000' : '#00FF00'}">${status.emergencyMode ? 'ACTIVE' : 'OFF'}</span></div>
                </div>

                <div>
                    <div style="color: #00B2A9; font-weight: bold; margin-bottom: 5px;">Performance Metrics</div>
                    <div>FPS: <span style="color: ${this.getFPSColor(metrics.fps)}">${Math.round(metrics.fps)}</span></div>
                    <div>Frame Time: <span style="color: ${this.getFrameTimeColor(metrics.frameTime)}">${metrics.frameTime.toFixed(2)}ms</span></div>
                    <div>Memory: <span style="color: ${this.getMemoryColor(metrics.memoryUsage)}">${Math.round(metrics.memoryUsage)}MB</span></div>
                    <div>Draw Calls: <span style="color: #FFFFFF">${metrics.drawCalls || 0}</span></div>
                </div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">
                <div style="color: #00B2A9; font-weight: bold; margin-bottom: 5px;">Active Optimizations</div>
                <div style="color: #FFFFFF; font-size: 11px;">
                    ${status.activeOptimizations.length > 0 ? status.activeOptimizations.join(', ') : 'None'}
                </div>
            </div>

            <div style="margin-top: 10px; font-size: 10px; text-align: center; opacity: 0.7;">
                Ctrl+Shift+P: Toggle | Ctrl+Shift+M: Memory | Ctrl+Shift+Q: Quality | Ctrl+Shift+R: Optimize
            </div>
        `;
    }

    getHealthColor(score) {
        if (score >= 80) return '#00FF00';
        if (score >= 60) return '#FFFF00';
        if (score >= 40) return '#FF8800';
        return '#FF0000';
    }

    getWarningColor(level) {
        const colors = {
            none: '#00FF00',
            low: '#CCFF00',
            medium: '#FFFF00',
            high: '#FF8800',
            critical: '#FF0000'
        };
        return colors[level] || '#FFFFFF';
    }

    getFPSColor(fps) {
        if (fps >= 55) return '#00FF00';
        if (fps >= 40) return '#FFFF00';
        return '#FF0000';
    }

    getFrameTimeColor(frameTime) {
        if (frameTime <= 16.67) return '#00FF00';
        if (frameTime <= 20) return '#FFFF00';
        return '#FF0000';
    }

    getMemoryColor(memory) {
        if (memory <= 200) return '#00FF00';
        if (memory <= 300) return '#FFFF00';
        return '#FF0000';
    }

    toggleOverlay() {
        const overlay = document.getElementById('performance-debug-overlay');
        if (overlay) {
            overlay.remove();
            clearInterval(this.debugUpdateInterval);
            this.overlayVisible = false;
        } else {
            this.createDebugOverlay();
            this.overlayVisible = true;
        }
    }

    toggleMemoryOverlay() {
        // Toggle memory-specific overlay
        if (this.master.performanceEngines.memory) {
            const report = this.master.performanceEngines.memory.getMemoryReport();
            console.log('💾 Memory Report:', report);
        }
    }

    hideDebugOverlay() {
        const overlay = document.getElementById('performance-debug-overlay');
        if (overlay) {
            overlay.remove();
            clearInterval(this.debugUpdateInterval);
        }
        this.overlayVisible = false;
    }
}

// Global API
window.ChampionshipPerformance = {
    master: null,

    async initialize() {
        if (!this.master) {
            this.master = new ChampionshipPerformanceMaster();
            await this.master.initialize();
        }
        return this.master;
    },

    getStatus() {
        return this.master ? this.master.getSystemStatus() : null;
    },

    setQuality(level) {
        if (this.master) {
            this.master.setGlobalQualityLevel(level);
        }
    },

    optimize(type = 'all') {
        if (this.master) {
            this.master.forceOptimization(type);
        }
    },

    setTargetFPS(fps) {
        if (this.master) {
            this.master.setTargetFPS(fps);
        }
    },

    enableDebug() {
        if (this.master) {
            this.master.enableDebugMode();
        }
    },

    disableDebug() {
        if (this.master) {
            this.master.disableDebugMode();
        }
    },

    getReport() {
        if (this.master && this.master.performanceEngines.analytics) {
            return this.master.performanceEngines.analytics.getAnalyticsReport();
        }
        return null;
    },

    dispose() {
        if (this.master) {
            this.master.dispose();
            this.master = null;
        }
    }
};

// Auto-initialize in production environments
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await window.ChampionshipPerformance.initialize();
    });
} else {
    window.ChampionshipPerformance.initialize();
}

console.log('🏆 CHAMPIONSHIP PERFORMANCE MASTER CONTROLLER LOADED - Ultimate 60FPS System Ready');