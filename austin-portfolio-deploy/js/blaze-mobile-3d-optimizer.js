/**
 * Mobile-Optimized 3D Graphics System for Blaze Sports Intel
 * Ensures championship-level performance across all mobile devices
 * Optimized for iOS, Android, and responsive web experiences
 */

class BlazeMobile3DOptimizer {
    constructor() {
        this.deviceProfile = this.detectDeviceProfile();
        this.performanceProfile = this.analyzePerformanceProfile();
        this.optimizationStrategies = this.getOptimizationStrategies();

        this.init();
    }

    detectDeviceProfile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();

        // Detailed mobile device detection
        const deviceInfo = {
            // Device Type
            isIOS: /iphone|ipad|ipod/.test(userAgent),
            isAndroid: /android/.test(userAgent),
            isTablet: /ipad|android(?!.*mobile)/.test(userAgent) ||
                     (window.screen && Math.max(window.screen.width, window.screen.height) > 1024),

            // Performance Indicators
            memoryGB: navigator.deviceMemory || this.estimateMemory(),
            cores: navigator.hardwareConcurrency || 4,
            pixelRatio: window.devicePixelRatio || 1,

            // Screen Properties
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,

            // Network
            connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,

            // Touch Capabilities
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

            // GPU Detection (approximate)
            hasWebGL2: this.detectWebGL2Support(),
            gpuTier: this.estimateGPUTier()
        };

        // Device-specific optimizations
        if (deviceInfo.isIOS) {
            deviceInfo.safariVersion = this.getSafariVersion();
            deviceInfo.isNewIPad = deviceInfo.isTablet && deviceInfo.pixelRatio >= 2;
            deviceInfo.isIPhone = !deviceInfo.isTablet;
        }

        if (deviceInfo.isAndroid) {
            deviceInfo.chromeVersion = this.getChromeVersion();
            deviceInfo.isHighEndAndroid = deviceInfo.memoryGB >= 6 && deviceInfo.cores >= 8;
        }

        return deviceInfo;
    }

    estimateMemory() {
        // Fallback memory estimation for devices without navigator.deviceMemory
        const screen = window.screen;
        const totalPixels = screen.width * screen.height * (window.devicePixelRatio || 1);

        if (totalPixels > 2000000) return 6; // High-res displays usually have more memory
        if (totalPixels > 1000000) return 4;
        if (totalPixels > 500000) return 2;
        return 1;
    }

    detectWebGL2Support() {
        const canvas = document.createElement('canvas');
        const gl2 = canvas.getContext('webgl2');

        if (gl2) {
            const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                return { supported: true, renderer };
            }
            return { supported: true, renderer: 'Unknown' };
        }

        return { supported: false };
    }

    estimateGPUTier() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return 'low';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

            // iOS GPU Detection
            if (renderer.includes('apple')) {
                if (renderer.includes('a15') || renderer.includes('a16') || renderer.includes('a17')) return 'high';
                if (renderer.includes('a12') || renderer.includes('a13') || renderer.includes('a14')) return 'medium';
                return 'low';
            }

            // Android GPU Detection
            if (renderer.includes('adreno')) {
                const adrenoMatch = renderer.match(/adreno[^\d]*(\d+)/);
                if (adrenoMatch) {
                    const adrenoNumber = parseInt(adrenoMatch[1]);
                    if (adrenoNumber >= 650) return 'high';
                    if (adrenoNumber >= 530) return 'medium';
                }
                return 'low';
            }

            if (renderer.includes('mali')) {
                if (renderer.includes('g78') || renderer.includes('g710')) return 'high';
                if (renderer.includes('g76') || renderer.includes('g57')) return 'medium';
                return 'low';
            }
        }

        // Fallback based on device memory and cores
        if (this.deviceProfile.memoryGB >= 6 && this.deviceProfile.cores >= 8) return 'high';
        if (this.deviceProfile.memoryGB >= 4 && this.deviceProfile.cores >= 6) return 'medium';
        return 'low';
    }

    getSafariVersion() {
        const match = navigator.userAgent.match(/Version\/(\d+\.\d+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    getChromeVersion() {
        const match = navigator.userAgent.match(/Chrome\/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    analyzePerformanceProfile() {
        const device = this.deviceProfile;

        // Performance scoring algorithm
        let performanceScore = 0;

        // Memory contribution (30%)
        performanceScore += Math.min(device.memoryGB * 15, 45);

        // CPU contribution (25%)
        performanceScore += Math.min(device.cores * 4, 25);

        // GPU contribution (30%)
        const gpuScore = device.gpuTier === 'high' ? 30 : device.gpuTier === 'medium' ? 20 : 10;
        performanceScore += gpuScore;

        // Screen resolution penalty (15%) - higher resolution = more pixels to render
        const pixelCount = device.screenWidth * device.screenHeight * device.pixelRatio;
        const resolutionPenalty = Math.max(0, (pixelCount / 1000000) * 2);
        performanceScore -= Math.min(resolutionPenalty, 15);

        // Determine performance tier
        let tier;
        if (performanceScore >= 85) tier = 'championship';
        else if (performanceScore >= 65) tier = 'professional';
        else if (performanceScore >= 45) tier = 'competitive';
        else tier = 'optimized';

        return {
            score: performanceScore,
            tier: tier,
            targetFPS: tier === 'championship' ? 60 : tier === 'professional' ? 50 : 40,
            maxParticles: tier === 'championship' ? 800 : tier === 'professional' ? 500 : tier === 'competitive' ? 250 : 100
        };
    }

    getOptimizationStrategies() {
        const profile = this.performanceProfile;
        const device = this.deviceProfile;

        return {
            // Particle System Optimizations
            particleSystem: {
                count: profile.maxParticles,
                useInstancing: profile.tier !== 'optimized',
                useTextureAtlas: true,
                simplifyShaders: profile.tier === 'optimized' || profile.tier === 'competitive',
                disableSort: profile.tier === 'optimized',
                cullDistance: profile.tier === 'championship' ? 100 : 80
            },

            // Rendering Optimizations
            rendering: {
                pixelRatio: Math.min(device.pixelRatio, profile.tier === 'championship' ? 2 : 1.5),
                antialias: profile.tier === 'championship',
                shadows: profile.tier === 'championship' ? 'soft' : profile.tier === 'professional' ? 'basic' : 'off',
                postProcessing: profile.tier === 'championship',
                maxLights: profile.tier === 'championship' ? 6 : profile.tier === 'professional' ? 4 : 2
            },

            // Animation Optimizations
            animation: {
                maxFPS: profile.targetFPS,
                useRAF: true,
                skipFrames: profile.tier === 'optimized' ? 2 : 1,
                simplifyMotion: profile.tier === 'optimized' || profile.tier === 'competitive',
                reduceComplexity: profile.tier === 'optimized'
            },

            // Memory Management
            memory: {
                texturePoolSize: Math.max(5, device.memoryGB),
                geometryPoolSize: Math.max(10, device.memoryGB * 2),
                disposeUnused: true,
                compressTextures: profile.tier !== 'championship',
                unloadOffscreen: true
            },

            // Touch Optimizations
            touch: {
                optimizeForTouch: device.hasTouch,
                increaseTouchTargets: device.hasTouch,
                disableHover: device.hasTouch,
                enablePinchZoom: device.hasTouch && device.isTablet
            },

            // Network Optimizations
            network: {
                compressAssets: true,
                lazyLoadTextures: true,
                useWebP: this.supportsWebP(),
                prefetchCritical: device.connection && device.connection.effectiveType !== 'slow-2g'
            }
        };
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
    }

    init() {
        this.setupMobileRenderer();
        this.optimizeParticleSystem();
        this.setupTouchControls();
        this.implementBatteryOptimizations();
        this.setupPerformanceMonitoring();

        console.log(`📱 Mobile 3D Optimization initialized for ${this.performanceProfile.tier} tier`);
        console.log('Device Profile:', this.deviceProfile);
        console.log('Performance Score:', this.performanceProfile.score);
    }

    setupMobileRenderer() {
        if (!window.blazeRenderer) return;

        const renderer = window.blazeRenderer;
        const strategies = this.optimizationStrategies;

        // Mobile-specific renderer settings
        renderer.setPixelRatio(strategies.rendering.pixelRatio);
        renderer.antialias = strategies.rendering.antialias;

        // iOS-specific optimizations
        if (this.deviceProfile.isIOS) {
            // Prevent Safari from pausing WebGL context
            renderer.preserveDrawingBuffer = false;
            renderer.premultipliedAlpha = false;

            // iOS power management
            renderer.domElement.style.webkitTransform = 'translate3d(0,0,0)';
            renderer.domElement.style.webkitBackfaceVisibility = 'hidden';
        }

        // Android-specific optimizations
        if (this.deviceProfile.isAndroid) {
            // Android GPU optimization
            renderer.sortObjects = true;
            renderer.shadowMap.autoUpdate = false;

            // Chrome mobile optimizations
            if (this.deviceProfile.chromeVersion >= 90) {
                renderer.outputEncoding = THREE.sRGBEncoding;
            }
        }

        // Universal mobile optimizations
        renderer.gammaFactor = 2.2;
        renderer.physicallyCorrectLights = false; // Disable for performance

        // Memory pressure handling
        this.setupMemoryPressureHandling(renderer);

        console.log('📱 Mobile renderer optimized');
    }

    setupMemoryPressureHandling(renderer) {
        // Handle memory pressure events (iOS)
        window.addEventListener('pagehide', () => {
            this.pauseRendering();
        });

        window.addEventListener('pageshow', () => {
            this.resumeRendering();
        });

        // Android low memory detection
        if ('onmemorywarning' in window) {
            window.addEventListener('memorywarning', () => {
                this.handleLowMemory();
            });
        }

        // Visibility API for power savings
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseRendering();
            } else {
                this.resumeRendering();
            }
        });
    }

    optimizeParticleSystem() {
        const strategies = this.optimizationStrategies.particleSystem;

        // Mobile-optimized particle shader
        const mobileParticleShader = {
            uniforms: {
                time: { value: 0 },
                scale: { value: 1 },
                opacity: { value: 1 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;

                uniform float time;
                uniform float scale;

                varying vec3 vColor;
                varying float vOpacity;

                void main() {
                    vColor = color;

                    vec3 pos = position;

                    // Simplified wave motion for mobile
                    ${strategies.simplifyShaders ?
                        'pos.y += sin(time * 0.001 + position.x * 0.02) * 1.0;' :
                        `pos.x += sin(time * 0.001 + position.y * 0.01) * 2.0;
                         pos.y += cos(time * 0.001 + position.x * 0.01) * 2.0;`
                    }

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Mobile-optimized size calculation
                    float distance = length(mvPosition.xyz);
                    gl_PointSize = size * scale * (50.0 / max(1.0, distance));

                    vOpacity = 1.0 - smoothstep(30.0, ${strategies.cullDistance}.0, distance);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;

                void main() {
                    // Simple circular particle
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);

                    if (dist > 0.5) discard;

                    float alpha = ${strategies.simplifyShaders ?
                        'vOpacity' :
                        'smoothstep(0.5, 0.2, dist) * vOpacity'
                    };

                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false
        };

        // Apply mobile particle system optimizations
        this.mobileParticleShader = mobileParticleShader;

        console.log(`📱 Particle system optimized: ${strategies.count} particles`);
    }

    setupTouchControls() {
        if (!this.optimizationStrategies.touch.optimizeForTouch) return;

        const touchHandler = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            isActive: false,
            sensitivity: this.deviceProfile.isTablet ? 0.5 : 0.3
        };

        // Touch event handlers optimized for 3D interaction
        const handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchHandler.startX = touch.clientX;
            touchHandler.startY = touch.clientY;
            touchHandler.currentX = touch.clientX;
            touchHandler.currentY = touch.clientY;
            touchHandler.isActive = true;
        };

        const handleTouchMove = (e) => {
            if (!touchHandler.isActive) return;
            e.preventDefault();

            const touch = e.touches[0];
            touchHandler.currentX = touch.clientX;
            touchHandler.currentY = touch.clientY;

            // Update camera or particle system based on touch
            if (window.blazeHeroViz && window.blazeHeroViz.camera) {
                const deltaX = (touchHandler.currentX - touchHandler.startX) * touchHandler.sensitivity;
                const deltaY = (touchHandler.currentY - touchHandler.startY) * touchHandler.sensitivity;

                // Smooth camera rotation
                window.blazeHeroViz.camera.rotation.y += deltaX * 0.01;
                window.blazeHeroViz.camera.rotation.x += deltaY * 0.01;
            }
        };

        const handleTouchEnd = (e) => {
            touchHandler.isActive = false;
        };

        // Add touch events to renderer canvas
        if (window.blazeRenderer && window.blazeRenderer.domElement) {
            const canvas = window.blazeRenderer.domElement;

            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);

            // Prevent context menu on long press
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        console.log('📱 Touch controls optimized for mobile');
    }

    implementBatteryOptimizations() {
        // Battery API support
        const getBattery = navigator.getBattery || navigator.webkitGetBattery || navigator.mozGetBattery;

        if (getBattery) {
            getBattery.call(navigator).then((battery) => {
                this.batteryStatus = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };

                // Adjust performance based on battery level
                this.adjustForBatteryLevel();

                // Monitor battery changes
                battery.addEventListener('levelchange', () => {
                    this.batteryStatus.level = battery.level;
                    this.adjustForBatteryLevel();
                });

                battery.addEventListener('chargingchange', () => {
                    this.batteryStatus.charging = battery.charging;
                    this.adjustForBatteryLevel();
                });
            });
        }

        // CPU throttling detection
        this.setupCPUThrottlingDetection();

        console.log('🔋 Battery optimizations implemented');
    }

    adjustForBatteryLevel() {
        if (!this.batteryStatus) return;

        const level = this.batteryStatus.level;
        const charging = this.batteryStatus.charging;

        let powerMode = 'normal';

        if (!charging && level < 0.2) {
            powerMode = 'power-saver';
        } else if (!charging && level < 0.4) {
            powerMode = 'balanced';
        } else if (charging || level > 0.8) {
            powerMode = 'performance';
        }

        this.applyPowerMode(powerMode);
    }

    applyPowerMode(mode) {
        if (!window.blazeRenderer) return;

        switch (mode) {
            case 'power-saver':
                // Drastically reduce performance to save battery
                this.setTargetFPS(20);
                this.setParticleCount(Math.floor(this.optimizationStrategies.particleSystem.count * 0.3));
                this.enableAggressiveCulling(true);
                break;

            case 'balanced':
                // Moderate performance reduction
                this.setTargetFPS(30);
                this.setParticleCount(Math.floor(this.optimizationStrategies.particleSystem.count * 0.6));
                this.enableAggressiveCulling(false);
                break;

            case 'performance':
                // Full performance mode
                this.setTargetFPS(this.performanceProfile.targetFPS);
                this.setParticleCount(this.optimizationStrategies.particleSystem.count);
                this.enableAggressiveCulling(false);
                break;

            default:
                // Normal mode
                this.setTargetFPS(this.performanceProfile.targetFPS * 0.8);
                this.setParticleCount(Math.floor(this.optimizationStrategies.particleSystem.count * 0.8));
                break;
        }

        console.log(`🔋 Power mode set to: ${mode}`);
    }

    setupCPUThrottlingDetection() {
        let frameCount = 0;
        let lastTime = performance.now();
        let consecutiveSlowFrames = 0;

        const detectThrottling = () => {
            const now = performance.now();
            frameCount++;

            if (now - lastTime >= 1000) {
                const fps = (frameCount * 1000) / (now - lastTime);
                const expectedFPS = this.performanceProfile.targetFPS;

                if (fps < expectedFPS * 0.6) {
                    consecutiveSlowFrames++;

                    if (consecutiveSlowFrames >= 3) {
                        // Likely CPU throttling - reduce load
                        this.handleCPUThrottling();
                        consecutiveSlowFrames = 0;
                    }
                } else {
                    consecutiveSlowFrames = Math.max(0, consecutiveSlowFrames - 1);
                }

                frameCount = 0;
                lastTime = now;
            }

            requestAnimationFrame(detectThrottling);
        };

        requestAnimationFrame(detectThrottling);
    }

    handleCPUThrottling() {
        console.log('🌡️ CPU throttling detected - reducing load');

        // Temporary performance reduction
        this.setTargetFPS(Math.max(20, this.performanceProfile.targetFPS * 0.5));
        this.setParticleCount(Math.floor(this.optimizationStrategies.particleSystem.count * 0.5));

        // Restore performance after 30 seconds
        setTimeout(() => {
            this.setTargetFPS(this.performanceProfile.targetFPS);
            this.setParticleCount(this.optimizationStrategies.particleSystem.count);
            console.log('🌡️ Performance restored after throttling period');
        }, 30000);
    }

    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const monitor = () => {
            frameCount++;
            const now = performance.now();

            if (now - lastTime >= 2000) { // Check every 2 seconds
                const fps = (frameCount * 1000) / (now - lastTime);
                const frameTime = (now - lastTime) / frameCount;

                // Update performance metrics
                this.currentPerformance = {
                    fps: Math.round(fps),
                    frameTime: frameTime.toFixed(1),
                    timestamp: now
                };

                // Auto-adjust if performance is consistently poor
                if (fps < this.performanceProfile.targetFPS * 0.7) {
                    this.autoOptimizePerformance();
                }

                frameCount = 0;
                lastTime = now;
            }

            requestAnimationFrame(monitor);
        };

        requestAnimationFrame(monitor);
    }

    autoOptimizePerformance() {
        const currentParticles = this.getCurrentParticleCount();
        const reductionFactor = 0.8;

        if (currentParticles > 50) {
            const newCount = Math.floor(currentParticles * reductionFactor);
            this.setParticleCount(newCount);

            console.log(`📱 Auto-optimized: Reduced particles to ${newCount} for better performance`);
        }
    }

    // Public API methods
    setTargetFPS(fps) {
        this.performanceProfile.targetFPS = fps;

        // Adjust animation frame skipping
        const skipFrames = fps < 30 ? 2 : fps < 45 ? 1 : 0;
        this.optimizationStrategies.animation.skipFrames = skipFrames;
    }

    setParticleCount(count) {
        this.optimizationStrategies.particleSystem.count = count;

        // Update particle systems if they exist
        if (window.blazeHeroViz && window.blazeHeroViz.particleSystem) {
            this.updateParticleSystemCount(window.blazeHeroViz.particleSystem, count);
        }
    }

    updateParticleSystemCount(particleSystem, newCount) {
        // Implementation would depend on the specific particle system structure
        // This is a placeholder for the actual update logic
        console.log(`📱 Updating particle system to ${newCount} particles`);
    }

    getCurrentParticleCount() {
        return this.optimizationStrategies.particleSystem.count;
    }

    enableAggressiveCulling(enabled) {
        this.aggressiveCulling = enabled;

        // Implement aggressive culling logic
        if (enabled && window.blazeHeroViz) {
            // Reduce draw distance
            this.optimizationStrategies.particleSystem.cullDistance = 40;
        } else {
            this.optimizationStrategies.particleSystem.cullDistance = 80;
        }
    }

    pauseRendering() {
        this.isPaused = true;
        console.log('⏸️ 3D rendering paused');
    }

    resumeRendering() {
        this.isPaused = false;
        console.log('▶️ 3D rendering resumed');
    }

    handleLowMemory() {
        console.log('⚠️ Low memory detected - aggressive optimization');

        // Emergency memory management
        this.setParticleCount(Math.floor(this.getCurrentParticleCount() * 0.3));
        this.setTargetFPS(20);
        this.enableAggressiveCulling(true);

        // Clear texture and geometry caches
        if (this.memoryManager) {
            this.memoryManager.emergencyCleanup();
        }
    }

    getDeviceReport() {
        return {
            device: this.deviceProfile,
            performance: this.performanceProfile,
            optimizations: this.optimizationStrategies,
            currentState: {
                fps: this.currentPerformance ? this.currentPerformance.fps : 'N/A',
                isPaused: this.isPaused,
                batteryLevel: this.batteryStatus ? this.batteryStatus.level : 'N/A'
            }
        };
    }

    destroy() {
        this.pauseRendering();

        // Remove event listeners
        window.removeEventListener('pagehide', this.pauseRendering);
        window.removeEventListener('pageshow', this.resumeRendering);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        console.log('📱 Mobile 3D optimizer destroyed');
    }
}

// Initialize mobile optimization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        // Detect if device is mobile/tablet
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Initialize mobile optimizer
            window.blazeMobileOptimizer = new BlazeMobile3DOptimizer();

            // Add mobile-specific CSS
            const mobileStyles = document.createElement('style');
            mobileStyles.textContent = `
                /* Mobile 3D optimizations */
                canvas {
                    -webkit-transform: translate3d(0,0,0);
                    -webkit-backface-visibility: hidden;
                    touch-action: none;
                    user-select: none;
                    -webkit-user-select: none;
                }

                /* Reduce motion for battery saving */
                @media (prefers-reduced-motion: reduce) {
                    canvas {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                /* High contrast mode adjustments */
                @media (prefers-contrast: high) {
                    .blaze-particle-system {
                        filter: contrast(1.5);
                    }
                }
            `;
            document.head.appendChild(mobileStyles);

            console.log('📱 Mobile 3D optimization system active');
        }
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeMobile3DOptimizer;
}