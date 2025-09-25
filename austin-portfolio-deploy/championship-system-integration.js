/**
 * BLAZE INTELLIGENCE - CHAMPIONSHIP SYSTEM INTEGRATION ORCHESTRATOR
 * Complete system integration and deployment management
 * Austin Humphrey - blazesportsintel.com - Revolutionary Sports Intelligence
 */

class BlazeIntelligenceChampionshipSystem {
    constructor() {
        this.systemComponents = new Map();
        this.integrationStatus = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            componentsLoaded: 0,
            totalComponents: 4,
            errors: []
        };

        // Championship system configuration
        this.config = {
            domain: 'blazesportsintel.com',
            version: '1.0.0-championship',
            environment: this.detectEnvironment(),
            features: {
                '3dVisualization': true,
                'mobileOptimization': true,
                'realTimeData': true,
                'aiInsights': true,
                'characterAssessment': true
            },
            supportedBrowsers: [
                'chrome', 'firefox', 'safari', 'edge'
            ],
            minimumRequirements: {
                webGL: true,
                touchSupport: 'preferred',
                memoryGB: 2,
                processorCores: 4
            }
        };

        this.initialize();
    }

    detectEnvironment() {
        const hostname = window.location.hostname;

        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('preview')) {
            return 'staging';
        } else if (hostname.includes('blazesportsintel.com')) {
            return 'production';
        }

        return 'unknown';
    }

    async initialize() {
        console.log('🏆 BLAZE INTELLIGENCE CHAMPIONSHIP SYSTEM INITIALIZING...');
        console.log(`Environment: ${this.config.environment}`);
        console.log(`Domain: ${this.config.domain}`);

        const startTime = performance.now();

        // Pre-flight system checks
        const systemCheck = await this.runSystemCompatibilityCheck();
        if (!systemCheck.compatible) {
            console.error('❌ System compatibility check failed:', systemCheck.issues);
            this.displayCompatibilityWarning(systemCheck.issues);
            return false;
        }

        // Initialize core components in sequence
        await this.initializeChampionshipComponents();

        // Post-initialization setup
        this.setupGlobalErrorHandling();
        this.startSystemMonitoring();
        this.registerGlobalAPIs();

        const loadTime = performance.now() - startTime;
        this.performanceMetrics.loadTime = Math.round(loadTime);

        console.log(`🚀 CHAMPIONSHIP SYSTEM ACTIVE - Loaded in ${loadTime}ms`);
        this.displaySystemStatus();

        // Trigger championship ready event
        this.triggerChampionshipReady();

        return true;
    }

    async runSystemCompatibilityCheck() {
        const issues = [];
        let compatible = true;

        // Check WebGL support
        const canvas = document.createElement('canvas');
        const webglContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!webglContext) {
            issues.push('WebGL not supported - 3D visualization will be disabled');
            this.config.features['3dVisualization'] = false;
            compatible = false;
        }

        // Check browser compatibility
        const userAgent = navigator.userAgent.toLowerCase();
        const supportedBrowser = this.config.supportedBrowsers.some(browser =>
            userAgent.includes(browser)
        );

        if (!supportedBrowser) {
            issues.push('Browser may not be fully supported - some features may not work properly');
        }

        // Check memory (if available)
        if (navigator.deviceMemory && navigator.deviceMemory < this.config.minimumRequirements.memoryGB) {
            issues.push(`Low device memory detected (${navigator.deviceMemory}GB) - performance may be limited`);
        }

        // Check processor cores
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < this.config.minimumRequirements.processorCores) {
            issues.push(`Limited processing power (${navigator.hardwareConcurrency} cores) - features will be optimized`);
        }

        return {
            compatible: compatible && issues.length < 3, // Allow up to 2 non-critical issues
            issues,
            webglSupported: !!webglContext,
            touchSupported: 'ontouchstart' in window,
            performanceProfile: this.assessPerformanceProfile()
        };
    }

    assessPerformanceProfile() {
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        const screenSize = window.innerWidth * window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;

        let score = 0;

        // Memory score (0-25)
        if (memory >= 8) score += 25;
        else if (memory >= 4) score += 15;
        else if (memory >= 2) score += 8;

        // CPU score (0-25)
        if (cores >= 8) score += 25;
        else if (cores >= 6) score += 18;
        else if (cores >= 4) score += 12;

        // Display score (0-25)
        if (screenSize > 2000000) score += 25;
        else if (screenSize > 1000000) score += 15;
        else score += 10;

        // Pixel ratio score (0-25)
        if (pixelRatio >= 3) score += 25;
        else if (pixelRatio >= 2) score += 15;
        else score += 10;

        if (score >= 80) return 'high';
        else if (score >= 50) return 'medium';
        else return 'low';
    }

    async initializeChampionshipComponents() {
        const components = [
            {
                name: '3DVisualization',
                loader: this.initialize3DSystem.bind(this),
                critical: true,
                timeout: 10000
            },
            {
                name: 'DataIntegration',
                loader: this.initializeDataSystem.bind(this),
                critical: true,
                timeout: 8000
            },
            {
                name: 'MobileOptimization',
                loader: this.initializeMobileSystem.bind(this),
                critical: false,
                timeout: 5000
            },
            {
                name: 'DashboardIntegration',
                loader: this.initializeDashboardSystem.bind(this),
                critical: false,
                timeout: 3000
            }
        ];

        for (const component of components) {
            try {
                console.log(`🔄 Initializing ${component.name}...`);

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Component initialization timeout')), component.timeout)
                );

                const initPromise = component.loader();

                await Promise.race([initPromise, timeoutPromise]);

                this.systemComponents.set(component.name, true);
                this.integrationStatus.set(component.name, 'active');
                this.performanceMetrics.componentsLoaded++;

                console.log(`✅ ${component.name} initialized successfully`);

            } catch (error) {
                console.error(`❌ Failed to initialize ${component.name}:`, error);

                this.systemComponents.set(component.name, false);
                this.integrationStatus.set(component.name, 'failed');
                this.performanceMetrics.errors.push({
                    component: component.name,
                    error: error.message,
                    critical: component.critical,
                    timestamp: new Date().toISOString()
                });

                // If critical component fails, attempt recovery
                if (component.critical) {
                    console.warn(`🔧 Attempting recovery for critical component: ${component.name}`);
                    await this.attemptComponentRecovery(component);
                }
            }
        }
    }

    async initialize3DSystem() {
        // Initialize 3D visualization engine
        if (!this.config.features['3dVisualization']) {
            throw new Error('3D visualization disabled due to compatibility issues');
        }

        // Wait for BlazeIntelligence3D to be available
        if (typeof window.BlazeIntelligence3D === 'undefined') {
            await this.waitForGlobal('BlazeIntelligence3D', 5000);
        }

        const engine = window.BlazeIntelligence3D.initialize();

        if (!engine) {
            throw new Error('Failed to initialize 3D engine');
        }

        // Test 3D rendering
        await this.test3DRendering(engine);

        return engine;
    }

    async initializeDataSystem() {
        // Initialize sports data integration
        if (typeof window.BlazeIntelligenceData === 'undefined') {
            await this.waitForGlobal('BlazeIntelligenceData', 5000);
        }

        const dataSystem = await window.BlazeIntelligenceData.initialize();

        if (!dataSystem) {
            throw new Error('Failed to initialize data integration system');
        }

        // Test data connectivity
        await this.testDataConnectivity(dataSystem);

        return dataSystem;
    }

    async initializeMobileSystem() {
        // Initialize mobile optimization
        if (typeof window.BlazeIntelligenceMobile === 'undefined') {
            await this.waitForGlobal('BlazeIntelligenceMobile', 3000);
        }

        const mobileSystem = window.BlazeIntelligenceMobile.initialize();

        // Mobile system is non-critical, so we don't throw on failure
        if (!mobileSystem) {
            console.warn('Mobile optimization system not available');
            return null;
        }

        return mobileSystem;
    }

    async initializeDashboardSystem() {
        // Initialize dashboard integration
        if (typeof window.BlazeDashboard === 'undefined') {
            await this.waitForGlobal('BlazeDashboard', 3000);
        }

        const dashboardSystem = window.BlazeDashboard;

        if (!dashboardSystem) {
            console.warn('Dashboard integration system not available');
            return null;
        }

        // Test dashboard connectivity
        if (typeof dashboardSystem.forceUpdate === 'function') {
            dashboardSystem.forceUpdate();
        }

        return dashboardSystem;
    }

    async waitForGlobal(globalName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkGlobal = () => {
                if (window[globalName]) {
                    resolve(window[globalName]);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for ${globalName}`));
                    return;
                }

                setTimeout(checkGlobal, 100);
            };

            checkGlobal();
        });
    }

    async test3DRendering(engine) {
        // Test basic 3D rendering capabilities
        if (!engine.renderer || !engine.scene || !engine.camera) {
            throw new Error('3D engine components not properly initialized');
        }

        // Test WebGL context
        const gl = engine.renderer.getContext();
        if (!gl || gl.isContextLost()) {
            throw new Error('WebGL context lost or unavailable');
        }

        // Render a test frame
        try {
            engine.renderer.render(engine.scene, engine.camera);
        } catch (error) {
            throw new Error(`3D rendering test failed: ${error.message}`);
        }

        console.log('✅ 3D rendering test passed');
    }

    async testDataConnectivity(dataSystem) {
        // Test data system connectivity
        try {
            const testData = dataSystem.getTeamData('cardinals');
            if (!testData && !dataSystem.integration) {
                throw new Error('Data system not properly connected');
            }
        } catch (error) {
            throw new Error(`Data connectivity test failed: ${error.message}`);
        }

        console.log('✅ Data connectivity test passed');
    }

    async attemptComponentRecovery(component) {
        console.log(`🔧 Attempting recovery for ${component.name}...`);

        // Wait a moment and retry
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await component.loader();

            this.systemComponents.set(component.name, true);
            this.integrationStatus.set(component.name, 'recovered');

            console.log(`✅ Successfully recovered ${component.name}`);
            return true;

        } catch (recoveryError) {
            console.error(`❌ Recovery failed for ${component.name}:`, recoveryError);
            return false;
        }
    }

    setupGlobalErrorHandling() {
        // Global error handler for championship system
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('championship')) {
                console.error('Championship System Error:', event.error);
                this.handleSystemError(event.error);
            }
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.stack && event.reason.stack.includes('championship')) {
                console.error('Championship System Promise Rejection:', event.reason);
                this.handleSystemError(event.reason);
            }
        });

        console.log('🛡️ Global error handling enabled');
    }

    handleSystemError(error) {
        // Log error to performance metrics
        this.performanceMetrics.errors.push({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            component: 'global'
        });

        // Attempt graceful degradation
        this.attemptGracefulDegradation(error);
    }

    attemptGracefulDegradation(error) {
        // Disable non-critical features if errors occur
        if (error.message.includes('WebGL') || error.message.includes('3D')) {
            console.warn('🔧 Disabling 3D features due to errors');
            this.config.features['3dVisualization'] = false;

            // Hide 3D container
            const container = document.getElementById('championship-3d-container');
            if (container) {
                container.style.display = 'none';
            }
        }

        if (error.message.includes('mobile') || error.message.includes('touch')) {
            console.warn('🔧 Disabling mobile optimizations due to errors');
            this.config.features['mobileOptimization'] = false;
        }
    }

    startSystemMonitoring() {
        // Monitor system performance every 30 seconds
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 30000);

        // Monitor memory usage if available
        if ('memory' in performance) {
            setInterval(() => {
                this.monitorMemoryUsage();
            }, 60000);
        }

        console.log('📊 System monitoring started');
    }

    collectPerformanceMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            } : null,
            timing: performance.timing ? {
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null,
            components: Object.fromEntries(this.integrationStatus),
            features: this.config.features
        };

        // Store metrics (could send to analytics service)
        this.performanceMetrics.currentMetrics = metrics;

        // Log performance warnings
        if (metrics.memory && metrics.memory.used > 100) {
            console.warn(`⚠️ High memory usage: ${metrics.memory.used}MB`);
        }
    }

    monitorMemoryUsage() {
        if (!performance.memory) return;

        const memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
        const memoryLimit = performance.memory.jsHeapSizeLimit / 1048576; // MB
        const memoryPercentage = (memoryUsage / memoryLimit) * 100;

        if (memoryPercentage > 80) {
            console.warn(`⚠️ Memory usage critical: ${memoryPercentage.toFixed(1)}%`);
            this.optimizeMemoryUsage();
        }
    }

    optimizeMemoryUsage() {
        // Reduce 3D particle count
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;
            const dataPoints = engine.scene.children.filter(child =>
                child.userData && child.userData.type === 'dataPoint'
            );

            if (dataPoints.length > 500) {
                const excess = dataPoints.length - 500;
                for (let i = 0; i < excess; i++) {
                    engine.scene.remove(dataPoints[i]);
                }
                console.log(`🔧 Reduced particles by ${excess} for memory optimization`);
            }
        }

        // Clear old chart data
        if (window.Chart && window.Chart.instances) {
            Object.values(window.Chart.instances).forEach(chart => {
                if (chart.data && chart.data.datasets) {
                    chart.data.datasets.forEach(dataset => {
                        if (dataset.data && dataset.data.length > 50) {
                            dataset.data = dataset.data.slice(-20); // Keep only last 20 points
                        }
                    });
                }
            });
            console.log('🔧 Optimized chart data for memory usage');
        }
    }

    registerGlobalAPIs() {
        // Register unified championship API
        window.BlazeIntelligenceChampionship = {
            // System information
            getSystemStatus: () => this.getSystemStatus(),
            getPerformanceMetrics: () => this.performanceMetrics,
            getConfig: () => this.config,

            // Component access
            get3DEngine: () => window.BlazeIntelligence3D?.engine,
            getDataSystem: () => window.BlazeIntelligenceData?.integration,
            getMobileSystem: () => window.BlazeIntelligenceMobile?.engine,
            getDashboard: () => window.BlazeDashboard,

            // System controls
            restartSystem: () => this.restartSystem(),
            optimizePerformance: () => this.optimizeSystemPerformance(),
            exportMetrics: () => this.exportPerformanceMetrics(),

            // Feature controls
            enableFeature: (feature) => this.enableFeature(feature),
            disableFeature: (feature) => this.disableFeature(feature),

            // Data operations
            refreshAllData: () => this.refreshAllSystemData(),
            clearCache: () => this.clearSystemCache(),

            // Mobile controls
            isMobile: () => window.BlazeIntelligenceMobile?.isActive() || false,
            triggerHaptic: (intensity) => window.BlazeIntelligenceMobile?.triggerHapticFeedback(intensity),

            // Developer utilities
            runDiagnostics: () => this.runSystemDiagnostics(),
            getDebugInfo: () => this.getDebugInfo()
        };

        console.log('🌐 Global Championship API registered');
    }

    getSystemStatus() {
        return {
            environment: this.config.environment,
            version: this.config.version,
            loadTime: this.performanceMetrics.loadTime,
            componentsActive: this.performanceMetrics.componentsLoaded,
            totalComponents: this.performanceMetrics.totalComponents,
            errors: this.performanceMetrics.errors.length,
            features: this.config.features,
            integrationStatus: Object.fromEntries(this.integrationStatus),
            timestamp: new Date().toISOString()
        };
    }

    displaySystemStatus() {
        const status = this.getSystemStatus();

        console.group('🏆 BLAZE INTELLIGENCE CHAMPIONSHIP SYSTEM STATUS');
        console.log(`Version: ${status.version}`);
        console.log(`Environment: ${status.environment}`);
        console.log(`Load Time: ${status.loadTime}ms`);
        console.log(`Components: ${status.componentsActive}/${status.totalComponents} active`);
        console.log(`Errors: ${status.errors}`);

        console.group('🔧 Features');
        Object.entries(status.features).forEach(([feature, enabled]) => {
            console.log(`${enabled ? '✅' : '❌'} ${feature}: ${enabled ? 'enabled' : 'disabled'}`);
        });
        console.groupEnd();

        console.group('📊 Components');
        Object.entries(status.integrationStatus).forEach(([component, status]) => {
            const icon = status === 'active' ? '✅' : status === 'failed' ? '❌' : '⚠️';
            console.log(`${icon} ${component}: ${status}`);
        });
        console.groupEnd();

        console.groupEnd();
    }

    displayCompatibilityWarning(issues) {
        // Create compatibility warning overlay
        const warning = document.createElement('div');
        warning.id = 'championship-compatibility-warning';
        warning.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="
                    background: linear-gradient(135deg, #BF5700, #002244);
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 500px;
                    text-align: center;
                    border: 2px solid #FFD700;
                ">
                    <h2 style="color: #FFD700; margin-bottom: 20px;">⚠️ Compatibility Notice</h2>
                    <p style="margin-bottom: 20px;">Your device or browser may not support all Championship features:</p>
                    <ul style="text-align: left; margin-bottom: 20px;">
                        ${issues.map(issue => `<li style="margin-bottom: 10px;">• ${issue}</li>`).join('')}
                    </ul>
                    <p style="margin-bottom: 20px;">The system will automatically optimize for your device.</p>
                    <button onclick="document.getElementById('championship-compatibility-warning').remove()" style="
                        background: #FFD700;
                        color: #002244;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                    ">Continue to Blaze Intelligence</button>
                </div>
            </div>
        `;

        document.body.appendChild(warning);

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 10000);
    }

    triggerChampionshipReady() {
        // Dispatch custom event when system is ready
        const readyEvent = new CustomEvent('blazeChampionshipReady', {
            detail: {
                system: this,
                status: this.getSystemStatus(),
                timestamp: new Date().toISOString()
            }
        });

        document.dispatchEvent(readyEvent);

        // Also trigger on window for global access
        window.dispatchEvent(readyEvent);

        console.log('🎉 Championship Ready event dispatched');
    }

    async restartSystem() {
        console.log('🔄 Restarting Championship System...');

        // Clear current state
        this.systemComponents.clear();
        this.integrationStatus.clear();
        this.performanceMetrics.componentsLoaded = 0;
        this.performanceMetrics.errors = [];

        // Reinitialize
        return await this.initialize();
    }

    optimizeSystemPerformance() {
        console.log('🚀 Optimizing Championship System Performance...');

        this.optimizeMemoryUsage();

        // Optimize 3D engine if available
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;
            engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        // Optimize mobile system if available
        if (window.BlazeIntelligenceMobile && window.BlazeIntelligenceMobile.engine) {
            window.BlazeIntelligenceMobile.engine.applyMobileOptimizations();
        }

        console.log('✅ Performance optimization complete');
    }

    exportPerformanceMetrics() {
        const metrics = {
            system: this.getSystemStatus(),
            performance: this.performanceMetrics,
            timestamp: new Date().toISOString()
        };

        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(metrics, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `blaze-championship-metrics-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);

        console.log('📊 Performance metrics exported');
        return metrics;
    }

    enableFeature(feature) {
        if (this.config.features.hasOwnProperty(feature)) {
            this.config.features[feature] = true;
            console.log(`✅ Feature enabled: ${feature}`);

            // Re-initialize related components if needed
            this.reinitializeFeature(feature);
        } else {
            console.warn(`❌ Unknown feature: ${feature}`);
        }
    }

    disableFeature(feature) {
        if (this.config.features.hasOwnProperty(feature)) {
            this.config.features[feature] = false;
            console.log(`❌ Feature disabled: ${feature}`);

            // Clean up feature resources
            this.cleanupFeature(feature);
        } else {
            console.warn(`❌ Unknown feature: ${feature}`);
        }
    }

    reinitializeFeature(feature) {
        switch (feature) {
            case '3dVisualization':
                if (window.BlazeIntelligence3D) {
                    window.BlazeIntelligence3D.initialize();
                }
                break;
            case 'mobileOptimization':
                if (window.BlazeIntelligenceMobile) {
                    window.BlazeIntelligenceMobile.initialize();
                }
                break;
        }
    }

    cleanupFeature(feature) {
        switch (feature) {
            case '3dVisualization':
                const container = document.getElementById('championship-3d-container');
                if (container) {
                    container.style.display = 'none';
                }
                break;
            case 'mobileOptimization':
                if (window.BlazeIntelligenceMobile) {
                    window.BlazeIntelligenceMobile.destroy();
                }
                break;
        }
    }

    async refreshAllSystemData() {
        console.log('🔄 Refreshing all system data...');

        if (window.BlazeIntelligenceData && window.BlazeIntelligenceData.integration) {
            await window.BlazeIntelligenceData.refresh();
        }

        if (window.BlazeDashboard && typeof window.BlazeDashboard.forceUpdate === 'function') {
            window.BlazeDashboard.forceUpdate();
        }

        console.log('✅ System data refresh complete');
    }

    clearSystemCache() {
        console.log('🗑️ Clearing system cache...');

        // Clear data integration cache
        if (window.BlazeIntelligenceData && window.BlazeIntelligenceData.integration) {
            window.BlazeIntelligenceData.integration.dataCache.clear();
        }

        // Clear browser caches if possible
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.includes('blaze') || name.includes('championship')) {
                        caches.delete(name);
                    }
                });
            });
        }

        console.log('✅ System cache cleared');
    }

    async runSystemDiagnostics() {
        console.log('🔍 Running Championship System Diagnostics...');

        const diagnostics = {
            timestamp: new Date().toISOString(),
            browser: {
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            performance: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                } : 'not available',
                timing: performance.timing ? {
                    navigationStart: performance.timing.navigationStart,
                    loadEventEnd: performance.timing.loadEventEnd,
                    totalLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
                } : 'not available'
            },
            display: {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio,
                colorDepth: screen.colorDepth,
                orientation: screen.orientation ? screen.orientation.type : 'unknown'
            },
            features: {
                webgl: !!document.createElement('canvas').getContext('webgl'),
                webgl2: !!document.createElement('canvas').getContext('webgl2'),
                touchSupport: 'ontouchstart' in window,
                geolocation: 'geolocation' in navigator,
                serviceWorker: 'serviceWorker' in navigator,
                webShare: 'share' in navigator
            },
            components: Object.fromEntries(this.integrationStatus),
            errors: this.performanceMetrics.errors
        };

        console.group('🔍 CHAMPIONSHIP SYSTEM DIAGNOSTICS');
        console.log('Browser:', diagnostics.browser);
        console.log('Performance:', diagnostics.performance);
        console.log('Display:', diagnostics.display);
        console.log('Features:', diagnostics.features);
        console.log('Components:', diagnostics.components);
        console.log('Errors:', diagnostics.errors);
        console.groupEnd();

        return diagnostics;
    }

    getDebugInfo() {
        return {
            config: this.config,
            components: Object.fromEntries(this.systemComponents),
            integration: Object.fromEntries(this.integrationStatus),
            performance: this.performanceMetrics,
            globals: {
                BlazeIntelligence3D: typeof window.BlazeIntelligence3D,
                BlazeIntelligenceData: typeof window.BlazeIntelligenceData,
                BlazeIntelligenceMobile: typeof window.BlazeIntelligenceMobile,
                BlazeDashboard: typeof window.BlazeDashboard
            }
        };
    }
}

// Auto-initialize Championship System
let championshipSystem = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        championshipSystem = new BlazeIntelligenceChampionshipSystem();
    });
} else {
    championshipSystem = new BlazeIntelligenceChampionshipSystem();
}

// Expose system for debugging
window.championshipSystem = championshipSystem;

console.log('🏆 BLAZE INTELLIGENCE CHAMPIONSHIP SYSTEM INTEGRATION LOADED');