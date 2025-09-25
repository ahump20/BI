/**
 * BLAZE INTELLIGENCE - CHAMPIONSHIP 60FPS PERFORMANCE OPTIMIZATION ENGINE
 * Revolutionary Performance System for Championship-Grade 3D Experience
 * Austin Humphrey - blazesportsintel.com - Deep South Sports Authority
 */

class Championship60FPSOptimizationEngine {
    constructor() {
        this.targetFPS = 60;
        this.frameBudget = 16.67; // ms per frame for 60fps
        this.performanceMetrics = {
            fps: 60,
            frameTime: 16.67,
            memoryUsage: 0,
            drawCalls: 0,
            triangles: 0,
            gpuLoad: 0,
            cpuLoad: 0
        };

        this.deviceTier = this.classifyDeviceCapabilities();
        this.qualitySettings = this.getQualitySettings();
        this.performanceHistory = [];
        this.autoOptimizationEnabled = true;
        this.frameTimeBuffer = [];
        this.fpsBuffer = [];
        this.memoryPool = new Map();

        // Performance thresholds for adaptive optimization
        this.thresholds = {
            criticalFPS: 45,
            targetFPS: 60,
            excellentFPS: 90,
            maxFrameTime: 22,
            criticalMemory: 500 * 1024 * 1024, // 500MB
            maxDrawCalls: 100
        };

        // LOD system for dynamic quality scaling
        this.lodSystem = {
            distances: [50, 150, 300, 500],
            qualityLevels: ['ultra', 'high', 'medium', 'low', 'minimal']
        };

        // Asset streaming and memory management
        this.assetManager = {
            textureCache: new Map(),
            geometryCache: new Map(),
            materialCache: new Map(),
            loadQueue: [],
            streamingEnabled: true
        };

        this.initialize();
    }

    initialize() {
        console.log(`🚀 Championship 60FPS Optimization Engine Initializing - ${this.deviceTier.tier} tier device`);

        this.setupPerformanceMonitoring();
        this.initializeMemoryManagement();
        this.createAdaptiveQualitySystem();
        this.setupFrameBudgetManager();
        this.initializeCullingSystem();
        this.startPerformanceLoop();

        console.log('🏆 60FPS Championship Performance System ACTIVE');
    }

    classifyDeviceCapabilities() {
        const ua = navigator.userAgent;
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        let score = 0;
        let details = {
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            webGL2: false,
            extensions: [],
            gpuInfo: 'unknown'
        };

        if (gl) {
            details.webGL2 = gl.constructor.name.includes('2');
            details.extensions = gl.getSupportedExtensions() || [];

            // GPU detection
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                details.gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }

            // Performance scoring
            score += details.cores * 10;
            score += details.memory * 5;
            score += details.webGL2 ? 25 : 10;
            score += details.extensions.length > 20 ? 20 : 10;

            // GPU scoring
            if (details.gpuInfo.includes('RTX') || details.gpuInfo.includes('RX 6') || details.gpuInfo.includes('RX 7')) {
                score += 50; // High-end GPU
            } else if (details.gpuInfo.includes('GTX') || details.gpuInfo.includes('RX 5')) {
                score += 30; // Mid-range GPU
            } else if (details.gpuInfo.includes('Adreno') || details.gpuInfo.includes('Mali')) {
                score += details.isMobile ? 20 : 10; // Mobile GPU
            }

            // Screen resolution impact
            const pixels = window.innerWidth * window.innerHeight;
            if (pixels > 2073600) score -= 20; // 4K penalty
            else if (pixels > 921600) score -= 10; // 1080p penalty
        }

        // Mobile penalty
        if (details.isMobile) score = Math.max(score * 0.6, 20);

        // Classify tier
        let tier, config;
        if (score >= 120) {
            tier = 'championship';
            config = {
                particleCount: 3000,
                shadowQuality: 'ultra',
                textureResolution: '4K',
                lodDistance: 500,
                animationQuality: 'full',
                postProcessing: true,
                maxDrawCalls: 150
            };
        } else if (score >= 80) {
            tier = 'professional';
            config = {
                particleCount: 1500,
                shadowQuality: 'high',
                textureResolution: '2K',
                lodDistance: 300,
                animationQuality: 'high',
                postProcessing: true,
                maxDrawCalls: 100
            };
        } else if (score >= 50) {
            tier = 'competitive';
            config = {
                particleCount: 800,
                shadowQuality: 'medium',
                textureResolution: '1K',
                lodDistance: 200,
                animationQuality: 'medium',
                postProcessing: false,
                maxDrawCalls: 70
            };
        } else {
            tier = 'optimized';
            config = {
                particleCount: 400,
                shadowQuality: 'low',
                textureResolution: '512px',
                lodDistance: 100,
                animationQuality: 'basic',
                postProcessing: false,
                maxDrawCalls: 50
            };
        }

        return { tier, score, config, details };
    }

    getQualitySettings() {
        const base = this.deviceTier.config;

        return {
            rendering: {
                pixelRatio: Math.min(window.devicePixelRatio, this.deviceTier.tier === 'championship' ? 2 : 1.5),
                antialias: this.deviceTier.tier !== 'optimized',
                shadowMapSize: {
                    championship: 2048,
                    professional: 1024,
                    competitive: 512,
                    optimized: 256
                }[this.deviceTier.tier],
                maxLights: {
                    championship: 8,
                    professional: 6,
                    competitive: 4,
                    optimized: 2
                }[this.deviceTier.tier]
            },
            particles: {
                maxCount: base.particleCount,
                updateFrequency: this.deviceTier.tier === 'championship' ? 60 : 30,
                complexPhysics: this.deviceTier.tier === 'championship'
            },
            animation: {
                duration: {
                    championship: 1000,
                    professional: 700,
                    competitive: 500,
                    optimized: 300
                }[this.deviceTier.tier],
                easing: this.deviceTier.tier === 'championship' ? 'elastic' : 'ease-out',
                simultaneousAnimations: base.maxDrawCalls / 10
            },
            memory: {
                texturePoolSize: {
                    championship: 200 * 1024 * 1024,
                    professional: 150 * 1024 * 1024,
                    competitive: 100 * 1024 * 1024,
                    optimized: 64 * 1024 * 1024
                }[this.deviceTier.tier],
                geometryPoolSize: 50 * 1024 * 1024,
                garbageCollectionThreshold: 0.8
            }
        };
    }

    setupPerformanceMonitoring() {
        this.performanceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    this.updatePerformanceMetrics(entry);
                }
            }
        });

        this.performanceObserver.observe({ entryTypes: ['measure'] });

        // FPS monitoring
        this.fpsCounter = {
            frames: 0,
            lastTime: performance.now(),
            fps: 60
        };

        // Memory monitoring
        if ('memory' in performance) {
            this.memoryMonitor = setInterval(() => {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
                this.checkMemoryPressure();
            }, 1000);
        }
    }

    initializeMemoryManagement() {
        this.memoryManager = {
            pools: {
                geometries: new Map(),
                materials: new Map(),
                textures: new Map()
            },

            getGeometry: (key, creator) => {
                if (!this.memoryManager.pools.geometries.has(key)) {
                    this.memoryManager.pools.geometries.set(key, creator());
                }
                return this.memoryManager.pools.geometries.get(key);
            },

            getMaterial: (key, creator) => {
                if (!this.memoryManager.pools.materials.has(key)) {
                    this.memoryManager.pools.materials.set(key, creator());
                }
                return this.memoryManager.pools.materials.get(key);
            },

            getTexture: (key, creator) => {
                if (!this.memoryManager.pools.textures.has(key)) {
                    this.memoryManager.pools.textures.set(key, creator());
                }
                return this.memoryManager.pools.textures.get(key);
            },

            cleanup: () => {
                // Dispose unused resources
                const now = Date.now();
                [this.memoryManager.pools.geometries, this.memoryManager.pools.materials, this.memoryManager.pools.textures]
                    .forEach(pool => {
                        for (const [key, resource] of pool.entries()) {
                            if (resource.lastUsed && (now - resource.lastUsed) > 60000) {
                                if (resource.dispose) resource.dispose();
                                pool.delete(key);
                            }
                        }
                    });
            }
        };

        // Periodic cleanup
        setInterval(() => this.memoryManager.cleanup(), 30000);
    }

    createAdaptiveQualitySystem() {
        this.adaptiveQuality = {
            currentLevel: this.deviceTier.tier,
            adjustmentHistory: [],

            adjust: (direction) => {
                const levels = ['optimized', 'competitive', 'professional', 'championship'];
                const currentIndex = levels.indexOf(this.adaptiveQuality.currentLevel);

                if (direction === 'down' && currentIndex > 0) {
                    this.adaptiveQuality.currentLevel = levels[currentIndex - 1];
                    this.applyQualityLevel(this.adaptiveQuality.currentLevel);
                    console.log(`🔧 Quality reduced to ${this.adaptiveQuality.currentLevel} for better performance`);
                } else if (direction === 'up' && currentIndex < levels.length - 1) {
                    this.adaptiveQuality.currentLevel = levels[currentIndex + 1];
                    this.applyQualityLevel(this.adaptiveQuality.currentLevel);
                    console.log(`📈 Quality increased to ${this.adaptiveQuality.currentLevel}`);
                }

                this.adaptiveQuality.adjustmentHistory.push({
                    level: this.adaptiveQuality.currentLevel,
                    direction,
                    timestamp: Date.now(),
                    fps: this.performanceMetrics.fps
                });
            }
        };
    }

    setupFrameBudgetManager() {
        this.frameBudgetManager = {
            budget: this.frameBudget,
            spent: 0,
            tasks: [],

            allocate: (taskName, budgetMs) => {
                if (this.frameBudgetManager.spent + budgetMs <= this.frameBudgetManager.budget) {
                    this.frameBudgetManager.spent += budgetMs;
                    this.frameBudgetManager.tasks.push({ name: taskName, budget: budgetMs });
                    return true;
                }
                return false;
            },

            reset: () => {
                this.frameBudgetManager.spent = 0;
                this.frameBudgetManager.tasks = [];
            },

            getRemainingBudget: () => {
                return this.frameBudgetManager.budget - this.frameBudgetManager.spent;
            }
        };
    }

    initializeCullingSystem() {
        this.cullingSystem = {
            frustumCuller: null,
            occlusionCuller: null,
            distanceCuller: null,

            setupFrustumCulling: (camera) => {
                this.cullingSystem.frustumCuller = {
                    frustum: new THREE.Frustum(),
                    matrix: new THREE.Matrix4(),

                    updateFrustum: () => {
                        this.cullingSystem.frustumCuller.matrix.multiplyMatrices(
                            camera.projectionMatrix,
                            camera.matrixWorldInverse
                        );
                        this.cullingSystem.frustumCuller.frustum.setFromProjectionMatrix(
                            this.cullingSystem.frustumCuller.matrix
                        );
                    },

                    isVisible: (object) => {
                        return this.cullingSystem.frustumCuller.frustum.intersectsObject(object);
                    }
                };
            },

            setupDistanceCulling: (maxDistance) => {
                this.cullingSystem.distanceCuller = {
                    maxDistance,

                    isVisible: (object, camera) => {
                        const distance = camera.position.distanceTo(object.position);
                        return distance <= this.cullingSystem.distanceCuller.maxDistance;
                    }
                };
            },

            cullObjects: (objects, camera) => {
                if (!this.cullingSystem.frustumCuller) return objects;

                this.cullingSystem.frustumCuller.updateFrustum();

                return objects.filter(object => {
                    // Frustum culling
                    if (!this.cullingSystem.frustumCuller.isVisible(object)) return false;

                    // Distance culling
                    if (this.cullingSystem.distanceCuller &&
                        !this.cullingSystem.distanceCuller.isVisible(object, camera)) {
                        return false;
                    }

                    return true;
                });
            }
        };
    }

    startPerformanceLoop() {
        const performanceLoop = (timestamp) => {
            const frameStart = performance.now();
            this.frameBudgetManager.reset();

            // Update FPS
            this.updateFPS(timestamp);

            // Monitor performance
            this.monitorFramePerformance(frameStart);

            // Auto-optimize if needed
            if (this.autoOptimizationEnabled) {
                this.autoOptimize();
            }

            // Schedule next frame
            this.performanceLoopId = requestAnimationFrame(performanceLoop);
        };

        this.performanceLoopId = requestAnimationFrame(performanceLoop);
    }

    updateFPS(timestamp) {
        this.fpsCounter.frames++;

        if (timestamp >= this.fpsCounter.lastTime + 1000) {
            this.fpsCounter.fps = Math.round((this.fpsCounter.frames * 1000) / (timestamp - this.fpsCounter.lastTime));
            this.performanceMetrics.fps = this.fpsCounter.fps;

            // Update FPS buffer for smoothing
            this.fpsBuffer.push(this.fpsCounter.fps);
            if (this.fpsBuffer.length > 10) this.fpsBuffer.shift();

            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = timestamp;
        }
    }

    monitorFramePerformance(frameStart) {
        const frameTime = performance.now() - frameStart;
        this.performanceMetrics.frameTime = frameTime;

        // Update frame time buffer
        this.frameTimeBuffer.push(frameTime);
        if (this.frameTimeBuffer.length > 60) this.frameTimeBuffer.shift();

        // Record in performance history
        this.performanceHistory.push({
            timestamp: Date.now(),
            fps: this.performanceMetrics.fps,
            frameTime,
            memoryUsage: this.performanceMetrics.memoryUsage
        });

        // Keep only last 1000 entries
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory.shift();
        }
    }

    autoOptimize() {
        const avgFPS = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length || 60;
        const avgFrameTime = this.frameTimeBuffer.reduce((a, b) => a + b, 0) / this.frameTimeBuffer.length || 16;

        // Check if optimization is needed
        if (avgFPS < this.thresholds.criticalFPS || avgFrameTime > this.thresholds.maxFrameTime) {
            this.optimizeForPerformance();
        } else if (avgFPS > this.thresholds.excellentFPS && avgFrameTime < this.frameBudget * 0.8) {
            this.increaseQualityIfPossible();
        }

        // Memory pressure check
        if (this.performanceMetrics.memoryUsage > this.thresholds.criticalMemory) {
            this.optimizeMemoryUsage();
        }
    }

    optimizeForPerformance() {
        console.log('🔧 Auto-optimization triggered: Reducing quality for better performance');

        // Reduce particle count
        this.qualitySettings.particles.maxCount = Math.max(
            100,
            this.qualitySettings.particles.maxCount * 0.8
        );

        // Reduce shadow quality
        if (this.qualitySettings.rendering.shadowMapSize > 256) {
            this.qualitySettings.rendering.shadowMapSize *= 0.5;
        }

        // Reduce texture resolution
        this.downgradeTextures();

        // Reduce LOD distances
        this.lodSystem.distances = this.lodSystem.distances.map(d => d * 0.8);

        // Reduce animation quality
        this.qualitySettings.animation.duration = Math.max(
            200,
            this.qualitySettings.animation.duration * 0.8
        );

        this.adaptiveQuality.adjust('down');
    }

    increaseQualityIfPossible() {
        if (this.adaptiveQuality.currentLevel !== this.deviceTier.tier) {
            console.log('📈 Performance excellent: Increasing quality');
            this.adaptiveQuality.adjust('up');
        }
    }

    optimizeMemoryUsage() {
        console.log('🧹 Memory pressure detected: Cleaning up resources');

        // Force garbage collection
        this.memoryManager.cleanup();

        // Clear texture cache
        this.assetManager.textureCache.clear();

        // Reduce particle count more aggressively
        this.qualitySettings.particles.maxCount = Math.max(
            50,
            this.qualitySettings.particles.maxCount * 0.5
        );

        // Trigger browser garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    checkMemoryPressure() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            const usage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;

            if (usage > this.qualitySettings.memory.garbageCollectionThreshold) {
                this.optimizeMemoryUsage();
            }
        }
    }

    applyQualityLevel(level) {
        const configs = {
            championship: {
                particleCount: 3000,
                shadowMapSize: 2048,
                textureRes: '4K',
                animationDuration: 1000
            },
            professional: {
                particleCount: 1500,
                shadowMapSize: 1024,
                textureRes: '2K',
                animationDuration: 700
            },
            competitive: {
                particleCount: 800,
                shadowMapSize: 512,
                textureRes: '1K',
                animationDuration: 500
            },
            optimized: {
                particleCount: 400,
                shadowMapSize: 256,
                textureRes: '512px',
                animationDuration: 300
            }
        };

        const config = configs[level];
        if (config) {
            this.qualitySettings.particles.maxCount = config.particleCount;
            this.qualitySettings.rendering.shadowMapSize = config.shadowMapSize;
            this.qualitySettings.animation.duration = config.animationDuration;

            // Apply to existing 3D engine if available
            this.applyToEngine();
        }
    }

    applyToEngine() {
        if (window.BlazeIntelligence3D && window.BlazeIntelligence3D.engine) {
            const engine = window.BlazeIntelligence3D.engine;

            // Update renderer settings
            engine.renderer.setPixelRatio(this.qualitySettings.rendering.pixelRatio);
            engine.renderer.shadowMap.enabled = this.qualitySettings.rendering.shadowMapSize > 0;

            // Update particles
            const particles = engine.scene.children.filter(child =>
                child.userData && child.userData.type === 'dataPoint'
            );

            const targetCount = this.qualitySettings.particles.maxCount;
            if (particles.length > targetCount) {
                // Remove excess particles
                const excess = particles.length - targetCount;
                for (let i = 0; i < excess; i++) {
                    engine.scene.remove(particles[i]);
                    if (particles[i].geometry) particles[i].geometry.dispose();
                    if (particles[i].material) particles[i].material.dispose();
                }
            }

            // Setup culling for camera
            if (engine.camera) {
                this.cullingSystem.setupFrustumCulling(engine.camera);
                this.cullingSystem.setupDistanceCulling(this.lodSystem.distances[0]);
            }
        }
    }

    downgradeTextures() {
        // Reduce texture resolution for performance
        if (this.assetManager.textureCache.size > 0) {
            this.assetManager.textureCache.forEach((texture, key) => {
                if (texture.image && texture.image.width > 512) {
                    // Create lower resolution version
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const newSize = Math.max(256, texture.image.width / 2);

                    canvas.width = newSize;
                    canvas.height = newSize;
                    ctx.drawImage(texture.image, 0, 0, newSize, newSize);

                    texture.image = canvas;
                    texture.needsUpdate = true;
                }
            });
        }
    }

    // LOD (Level of Detail) Management
    updateLOD(objects, camera) {
        objects.forEach(object => {
            if (!object.userData.lodLevels) return;

            const distance = camera.position.distanceTo(object.position);
            let lodLevel = 0;

            // Determine LOD level based on distance
            for (let i = 0; i < this.lodSystem.distances.length; i++) {
                if (distance > this.lodSystem.distances[i]) {
                    lodLevel = Math.min(i + 1, object.userData.lodLevels.length - 1);
                } else {
                    break;
                }
            }

            // Apply LOD level
            this.applyLODToObject(object, lodLevel);
        });
    }

    applyLODToObject(object, lodLevel) {
        if (!object.userData.currentLOD || object.userData.currentLOD !== lodLevel) {
            object.userData.currentLOD = lodLevel;

            // Implement LOD changes based on level
            switch (lodLevel) {
                case 0: // Highest quality
                    object.visible = true;
                    if (object.material) object.material.transparent = false;
                    break;
                case 1: // High quality
                    object.visible = true;
                    if (object.material) object.material.transparent = true;
                    break;
                case 2: // Medium quality
                    object.visible = true;
                    if (object.castShadow) object.castShadow = false;
                    break;
                case 3: // Low quality
                    object.visible = distance < this.lodSystem.distances[2];
                    break;
                default: // Minimal/invisible
                    object.visible = false;
                    break;
            }
        }
    }

    // Animation Performance Management
    createOptimizedAnimation(target, properties, options = {}) {
        const duration = options.duration || this.qualitySettings.animation.duration;
        const easing = options.easing || this.qualitySettings.animation.easing;

        // Check if we can add more animations
        const currentAnimations = this.getActiveAnimationCount();
        if (currentAnimations >= this.qualitySettings.animation.simultaneousAnimations) {
            // Queue animation for later
            this.queueAnimation({ target, properties, options });
            return null;
        }

        // Create optimized animation
        return this.createFrameBudgetedAnimation(target, properties, { duration, easing, ...options });
    }

    createFrameBudgetedAnimation(target, properties, options) {
        const startTime = performance.now();
        const duration = options.duration;
        const startValues = {};

        // Record initial values
        Object.keys(properties).forEach(prop => {
            startValues[prop] = target[prop];
        });

        const animate = (currentTime) => {
            const frameStart = performance.now();

            // Check frame budget
            if (!this.frameBudgetManager.allocate('animation', 2)) {
                // Skip this frame if no budget
                requestAnimationFrame(animate);
                return;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Apply eased progress
            const easedProgress = this.applyEasing(progress, options.easing);

            // Update properties
            Object.keys(properties).forEach(prop => {
                const startValue = startValues[prop];
                const endValue = properties[prop];
                target[prop] = startValue + (endValue - startValue) * easedProgress;
            });

            // Continue or complete
            if (progress < 1) {
                const frameTime = performance.now() - frameStart;
                if (frameTime < this.frameBudget * 0.5) {
                    requestAnimationFrame(animate);
                } else {
                    // Defer to next frame if taking too long
                    setTimeout(() => requestAnimationFrame(animate), 0);
                }
            } else {
                if (options.onComplete) options.onComplete();
            }
        };

        requestAnimationFrame(animate);
        return { stop: () => {} }; // Return animation control object
    }

    applyEasing(progress, type) {
        switch (type) {
            case 'elastic':
                return this.elasticEaseOut(progress);
            case 'bounce':
                return this.bounceEaseOut(progress);
            case 'ease-out':
            default:
                return 1 - Math.pow(1 - progress, 3);
        }
    }

    elasticEaseOut(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    bounceEaseOut(t) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    getActiveAnimationCount() {
        // Count active GSAP animations or other animation systems
        if (window.gsap) {
            return window.gsap.globalTimeline.getChildren().length;
        }
        return 0;
    }

    queueAnimation(animationData) {
        // Queue animation for later execution
        if (!this.animationQueue) this.animationQueue = [];
        this.animationQueue.push(animationData);

        // Process queue when possible
        setTimeout(() => this.processAnimationQueue(), 100);
    }

    processAnimationQueue() {
        if (!this.animationQueue || this.animationQueue.length === 0) return;

        const currentAnimations = this.getActiveAnimationCount();
        if (currentAnimations < this.qualitySettings.animation.simultaneousAnimations) {
            const nextAnimation = this.animationQueue.shift();
            this.createFrameBudgetedAnimation(
                nextAnimation.target,
                nextAnimation.properties,
                nextAnimation.options
            );
        }
    }

    // Performance Reporting and Analytics
    getPerformanceReport() {
        const avgFPS = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length || 0;
        const avgFrameTime = this.frameTimeBuffer.reduce((a, b) => a + b, 0) / this.frameTimeBuffer.length || 0;

        return {
            deviceTier: this.deviceTier.tier,
            deviceScore: this.deviceTier.score,
            currentQualityLevel: this.adaptiveQuality.currentLevel,
            performance: {
                averageFPS: Math.round(avgFPS),
                averageFrameTime: Math.round(avgFrameTime * 100) / 100,
                memoryUsage: Math.round(this.performanceMetrics.memoryUsage / 1024 / 1024),
                qualityAdjustments: this.adaptiveQuality.adjustmentHistory.length
            },
            qualitySettings: {
                particleCount: this.qualitySettings.particles.maxCount,
                shadowMapSize: this.qualitySettings.rendering.shadowMapSize,
                animationDuration: this.qualitySettings.animation.duration
            },
            recommendations: this.generateOptimizationRecommendations()
        };
    }

    generateOptimizationRecommendations() {
        const recommendations = [];
        const avgFPS = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length || 60;

        if (avgFPS < 45) {
            recommendations.push('Consider closing other browser tabs to improve performance');
            recommendations.push('Try reducing browser zoom level to 100%');
        }

        if (this.performanceMetrics.memoryUsage > 300 * 1024 * 1024) {
            recommendations.push('High memory usage detected - restart browser if performance degrades');
        }

        if (this.deviceTier.details.isMobile) {
            recommendations.push('For best experience on mobile, enable "Desktop site" mode');
            recommendations.push('Close background apps to free up device resources');
        }

        return recommendations;
    }

    // Debug and Development Tools
    createPerformanceOverlay() {
        if (document.getElementById('performance-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'performance-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #FFD700;
            padding: 15px;
            border-radius: 10px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(overlay);

        const updateOverlay = () => {
            const report = this.getPerformanceReport();
            overlay.innerHTML = `
                <div style="color: #FFD700; font-weight: bold; margin-bottom: 8px;">
                    🏆 Championship Performance Monitor
                </div>
                <div>Device Tier: <span style="color: #00B2A9;">${report.deviceTier.toUpperCase()}</span></div>
                <div>Quality Level: <span style="color: #BF5700;">${report.currentQualityLevel}</span></div>
                <div>FPS: <span style="color: ${report.performance.averageFPS >= 55 ? '#00FF00' : report.performance.averageFPS >= 40 ? '#FFFF00' : '#FF0000'}">${report.performance.averageFPS}</span></div>
                <div>Frame Time: <span style="color: ${report.performance.averageFrameTime <= 20 ? '#00FF00' : '#FFFF00'}">${report.performance.averageFrameTime}ms</span></div>
                <div>Memory: <span style="color: ${report.performance.memoryUsage <= 200 ? '#00FF00' : '#FFFF00'}">${report.performance.memoryUsage}MB</span></div>
                <div>Particles: <span style="color: #9BCBEB;">${report.qualitySettings.particleCount}</span></div>
                <div style="margin-top: 8px; font-size: 10px; opacity: 0.8;">
                    Auto-optimized ${report.performance.qualityAdjustments} times
                </div>
            `;
        };

        updateOverlay();
        setInterval(updateOverlay, 1000);

        // Click to toggle detailed view
        overlay.addEventListener('click', () => {
            const detailed = overlay.querySelector('.detailed-info');
            if (detailed) {
                detailed.remove();
            } else {
                const detailedDiv = document.createElement('div');
                detailedDiv.className = 'detailed-info';
                detailedDiv.style.cssText = 'margin-top: 10px; font-size: 10px; border-top: 1px solid #FFD700; padding-top: 8px;';

                const deviceInfo = this.deviceTier.details;
                detailedDiv.innerHTML = `
                    <div>CPU Cores: ${deviceInfo.cores}</div>
                    <div>Memory: ${deviceInfo.memory}GB</div>
                    <div>WebGL2: ${deviceInfo.webGL2 ? 'Yes' : 'No'}</div>
                    <div>Mobile: ${deviceInfo.isMobile ? 'Yes' : 'No'}</div>
                    <div>GPU: ${deviceInfo.gpuInfo.substring(0, 30)}...</div>
                `;
                overlay.appendChild(detailedDiv);
            }
        });
    }

    // Cleanup and destruction
    destroy() {
        // Stop performance monitoring
        if (this.performanceLoopId) {
            cancelAnimationFrame(this.performanceLoopId);
        }

        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
        }

        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        // Clean up memory pools
        this.memoryManager.cleanup();

        // Remove performance overlay
        const overlay = document.getElementById('performance-overlay');
        if (overlay) overlay.remove();

        console.log('🏆 Championship 60FPS Optimization Engine destroyed');
    }
}

// Global API
window.Championship60FPS = {
    engine: null,

    initialize() {
        if (!this.engine) {
            this.engine = new Championship60FPSOptimizationEngine();
        }
        return this.engine;
    },

    getPerformanceReport() {
        return this.engine ? this.engine.getPerformanceReport() : null;
    },

    showOverlay() {
        if (this.engine) {
            this.engine.createPerformanceOverlay();
        }
    },

    optimizeFor60FPS() {
        if (this.engine) {
            this.engine.autoOptimizationEnabled = true;
            console.log('🏆 60FPS auto-optimization enabled');
        }
    },

    setQualityLevel(level) {
        if (this.engine) {
            this.engine.applyQualityLevel(level);
        }
    },

    destroy() {
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.Championship60FPS.initialize();
    });
} else {
    window.Championship60FPS.initialize();
}

console.log('🚀 CHAMPIONSHIP 60FPS OPTIMIZATION ENGINE LOADED - Peak Performance Ready');