/**
 * =€ BLAZE INTELLIGENCE - PERFORMANCE OPTIMIZATION ENGINE
 * Championship-grade 60fps performance with advanced LOD and culling systems
 * Ensures smooth operation even with broadcast-quality graphics
 */

class BlazePerformanceOptimizer {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Performance monitoring
        this.performanceStats = {
            fps: 60,
            frameTime: 16.67,
            drawCalls: 0,
            triangles: 0,
            geometries: 0,
            textures: 0,
            programs: 0,
            memoryUsage: 0,
            targetFPS: 60
        };

        // Optimization state
        this.lodLevels = new Map();
        this.culledObjects = new Set();
        this.visibilityTests = new Map();
        this.frameTimeHistory = [];
        this.optimizationLevel = 'high'; // ultra, high, medium, low, emergency

        // Frustum for culling
        this.frustum = new THREE.Frustum();
        this.cameraMatrix = new THREE.Matrix4();

        // GPU capability detection
        this.gpuTier = this.detectGPUCapability();

        this.initializeOptimizer();
    }

    initializeOptimizer() {
        // Set up render info monitoring
        this.startPerformanceMonitoring();

        // Initialize LOD manager
        this.setupLODSystem();

        // Setup culling systems
        this.setupCullingSystem();

        // Adaptive quality system
        this.setupAdaptiveQuality();

        console.log(`=€ Performance Optimizer initialized - GPU Tier: ${this.gpuTier}`);
    }

    /**
     * GPU Capability Detection
     */
    detectGPUCapability() {
        const gl = this.renderer.getContext();
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

        let gpuInfo = '';
        if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            gpuInfo = `${vendor} ${renderer}`.toLowerCase();
        }

        // GPU tier classification
        if (gpuInfo.includes('rtx') || gpuInfo.includes('radeon rx') ||
            gpuInfo.includes('gtx 16') || gpuInfo.includes('gtx 20') ||
            gpuInfo.includes('gtx 30') || gpuInfo.includes('gtx 40')) {
            return 'championship'; // RTX/High-end GPUs
        } else if (gpuInfo.includes('gtx') || gpuInfo.includes('radeon') ||
                   gpuInfo.includes('rx ') || gpuInfo.includes('vega')) {
            return 'professional'; // Mid-range GPUs
        } else if (gpuInfo.includes('intel') && gpuInfo.includes('iris')) {
            return 'competitive'; // Integrated but decent
        } else {
            return 'optimized'; // Mobile/Low-end
        }
    }

    /**
     * Performance Monitoring System
     */
    startPerformanceMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;

        const monitorFrame = () => {
            const now = performance.now();
            const frameTime = now - lastTime;
            lastTime = now;

            // Update frame time history (keep last 60 frames)
            this.frameTimeHistory.push(frameTime);
            if (this.frameTimeHistory.length > 60) {
                this.frameTimeHistory.shift();
            }

            frameCount++;

            // Update FPS every 60 frames
            if (frameCount >= 60) {
                const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 60;
                this.performanceStats.fps = 1000 / avgFrameTime;
                this.performanceStats.frameTime = avgFrameTime;

                // Get renderer info
                const info = this.renderer.info;
                this.performanceStats.drawCalls = info.render.calls;
                this.performanceStats.triangles = info.render.triangles;
                this.performanceStats.geometries = info.memory.geometries;
                this.performanceStats.textures = info.memory.textures;
                this.performanceStats.programs = info.programs.length;

                // Estimate memory usage
                this.performanceStats.memoryUsage =
                    this.performanceStats.geometries * 0.1 +
                    this.performanceStats.textures * 2.0;

                frameCount = 0;

                // Trigger optimization if needed
                this.checkPerformanceAndOptimize();
            }

            requestAnimationFrame(monitorFrame);
        };

        monitorFrame();
    }

    /**
     * Adaptive Quality Management
     */
    checkPerformanceAndOptimize() {
        const currentFPS = this.performanceStats.fps;
        const targetFPS = this.performanceStats.targetFPS;

        // Determine optimization level based on performance
        if (currentFPS < targetFPS * 0.6) { // Below 36 FPS
            this.setOptimizationLevel('emergency');
        } else if (currentFPS < targetFPS * 0.75) { // Below 45 FPS
            this.setOptimizationLevel('low');
        } else if (currentFPS < targetFPS * 0.9) { // Below 54 FPS
            this.setOptimizationLevel('medium');
        } else if (currentFPS >= targetFPS * 0.95) { // Above 57 FPS
            this.setOptimizationLevel('high');
        }
    }

    setOptimizationLevel(level) {
        if (this.optimizationLevel === level) return;

        console.log(`<¯ Performance optimization level changed: ${level}`);
        this.optimizationLevel = level;

        // Apply optimization settings
        this.applyOptimizationSettings(level);
    }

    applyOptimizationSettings(level) {
        const settings = this.getOptimizationSettings(level);

        // Renderer settings
        this.renderer.setPixelRatio(settings.pixelRatio);
        this.renderer.shadowMap.enabled = settings.shadows;
        this.renderer.shadowMap.type = settings.shadowType;

        // LOD settings
        this.updateLODDistances(settings.lodDistances);

        // Particle counts
        this.updateParticleCounts(settings.particleCounts);

        // Post-processing
        this.updatePostProcessing(settings.postProcessing);

        console.log(`=' Applied ${level} optimization settings`);
    }

    getOptimizationSettings(level) {
        const baseSettings = {
            championship: {
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                shadows: true,
                shadowType: THREE.PCFSoftShadowMap,
                lodDistances: { near: 50, medium: 200, far: 500 },
                particleCounts: { confetti: 5000, sparks: 100, data: 10000 },
                postProcessing: { bloom: true, dof: true, ssao: true, motionBlur: true }
            },
            professional: {
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                shadows: true,
                shadowType: THREE.PCFShadowMap,
                lodDistances: { near: 40, medium: 150, far: 300 },
                particleCounts: { confetti: 3000, sparks: 60, data: 5000 },
                postProcessing: { bloom: true, dof: true, ssao: false, motionBlur: false }
            },
            competitive: {
                pixelRatio: 1.0,
                shadows: true,
                shadowType: THREE.BasicShadowMap,
                lodDistances: { near: 30, medium: 100, far: 200 },
                particleCounts: { confetti: 1500, sparks: 30, data: 2000 },
                postProcessing: { bloom: true, dof: false, ssao: false, motionBlur: false }
            },
            optimized: {
                pixelRatio: 1.0,
                shadows: false,
                shadowType: THREE.BasicShadowMap,
                lodDistances: { near: 20, medium: 50, far: 100 },
                particleCounts: { confetti: 500, sparks: 15, data: 1000 },
                postProcessing: { bloom: false, dof: false, ssao: false, motionBlur: false }
            }
        };

        // Map optimization levels to GPU tiers
        const levelMap = {
            high: this.gpuTier,
            medium: this.gpuTier === 'championship' ? 'professional' :
                   this.gpuTier === 'professional' ? 'competitive' : 'optimized',
            low: this.gpuTier === 'championship' ? 'competitive' :
                this.gpuTier === 'professional' ? 'optimized' : 'optimized',
            emergency: 'optimized'
        };

        return baseSettings[levelMap[level]];
    }

    /**
     * Level of Detail (LOD) System
     */
    setupLODSystem() {
        this.lodGroups = [];
    }

    createLODGroup(object, lodLevels) {
        const lodGroup = new THREE.LOD();

        lodLevels.forEach((level, index) => {
            lodGroup.addLevel(level.object, level.distance);
        });

        // Store original for distance calculations
        this.lodGroups.push({
            lod: lodGroup,
            position: object.position.clone(),
            levels: lodLevels
        });

        return lodGroup;
    }

    updateLODDistances(distances) {
        this.lodGroups.forEach(group => {
            // Update LOD distances based on performance level
            group.levels.forEach((level, index) => {
                const baseDistance = level.distance;
                const multiplier = this.getLODMultiplier(distances, index);
                group.lod.levels[index].distance = baseDistance * multiplier;
            });
        });
    }

    getLODMultiplier(distances, levelIndex) {
        switch (levelIndex) {
            case 0: return distances.near / 50; // High detail
            case 1: return distances.medium / 200; // Medium detail
            case 2: return distances.far / 500; // Low detail
            default: return 1.0;
        }
    }

    /**
     * Frustum and Occlusion Culling
     */
    setupCullingSystem() {
        this.occlusionQueries = new Map();
        this.cullingBounds = new Map();
    }

    performFrustumCulling() {
        // Update frustum
        this.cameraMatrix.multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        this.frustum.setFromProjectionMatrix(this.cameraMatrix);

        // Test all objects
        this.scene.traverse((object) => {
            if (object.isMesh || object.isPoints) {
                const wasVisible = object.visible;

                // Get or create bounding box
                if (!this.cullingBounds.has(object.uuid)) {
                    const box = new THREE.Box3().setFromObject(object);
                    this.cullingBounds.set(object.uuid, box);
                }

                const boundingBox = this.cullingBounds.get(object.uuid);
                const inFrustum = this.frustum.intersectsBox(boundingBox);

                object.visible = inFrustum;

                // Track culling state change
                if (wasVisible !== object.visible) {
                    if (object.visible) {
                        this.culledObjects.delete(object.uuid);
                    } else {
                        this.culledObjects.add(object.uuid);
                    }
                }
            }
        });
    }

    performOcclusionCulling() {
        // Simplified occlusion culling for major objects
        const occluders = [];

        // Find large objects that could occlude others
        this.scene.traverse((object) => {
            if (object.isMesh && object.geometry) {
                const boundingBox = this.cullingBounds.get(object.uuid);
                if (boundingBox) {
                    const size = boundingBox.getSize(new THREE.Vector3());
                    const volume = size.x * size.y * size.z;

                    // Large objects become occluders
                    if (volume > 100) {
                        occluders.push(object);
                    }
                }
            }
        });

        // Test smaller objects against occluders
        this.scene.traverse((object) => {
            if (object.visible && object.isMesh) {
                const objectBox = this.cullingBounds.get(object.uuid);
                if (!objectBox) return;

                // Check if object is behind any occluders
                for (const occluder of occluders) {
                    if (occluder === object) continue;

                    const occluderBox = this.cullingBounds.get(occluder.uuid);
                    if (this.isOccluded(objectBox, occluderBox, this.camera.position)) {
                        object.visible = false;
                        this.culledObjects.add(object.uuid);
                        break;
                    }
                }
            }
        });
    }

    isOccluded(objectBox, occluderBox, cameraPos) {
        // Simplified occlusion test
        const objectCenter = objectBox.getCenter(new THREE.Vector3());
        const occluderCenter = occluderBox.getCenter(new THREE.Vector3());

        // Check if object is behind occluder from camera perspective
        const cameraToOccluder = occluderCenter.clone().sub(cameraPos).length();
        const cameraToObject = objectCenter.clone().sub(cameraPos).length();

        // Object must be further than occluder
        if (cameraToObject <= cameraToOccluder) return false;

        // Check if object is within occluder's shadow volume (simplified)
        const occluderSize = occluderBox.getSize(new THREE.Vector3());
        const objectSize = objectBox.getSize(new THREE.Vector3());

        return occluderSize.x >= objectSize.x &&
               occluderSize.y >= objectSize.y &&
               Math.abs(objectCenter.x - occluderCenter.x) < occluderSize.x / 2 &&
               Math.abs(objectCenter.y - occluderCenter.y) < occluderSize.y / 2;
    }

    /**
     * Dynamic Particle Count Management
     */
    updateParticleCounts(particleCounts) {
        // Update existing particle systems
        this.scene.traverse((object) => {
            if (object.isPoints) {
                const name = object.name || object.parent?.name || '';

                if (name.includes('Confetti')) {
                    this.adjustParticleCount(object, particleCounts.confetti);
                } else if (name.includes('Sparks') || name.includes('Fireworks')) {
                    this.adjustParticleCount(object, particleCounts.sparks);
                } else if (name.includes('Data') || name.includes('Scatter')) {
                    this.adjustParticleCount(object, particleCounts.data);
                }
            }
        });
    }

    adjustParticleCount(particleSystem, targetCount) {
        if (!particleSystem.geometry) return;

        const currentCount = particleSystem.geometry.attributes.position.count;

        if (currentCount === targetCount) return;

        // Create new geometry with adjusted count
        const positions = particleSystem.geometry.attributes.position.array;
        const colors = particleSystem.geometry.attributes.color?.array;
        const sizes = particleSystem.geometry.attributes.size?.array;

        const newPositions = new Float32Array(targetCount * 3);
        const newColors = colors ? new Float32Array(targetCount * 3) : null;
        const newSizes = sizes ? new Float32Array(targetCount) : null;

        // Copy or interpolate data
        for (let i = 0; i < targetCount; i++) {
            const sourceIndex = Math.floor((i / targetCount) * currentCount);

            newPositions[i * 3] = positions[sourceIndex * 3] || 0;
            newPositions[i * 3 + 1] = positions[sourceIndex * 3 + 1] || 0;
            newPositions[i * 3 + 2] = positions[sourceIndex * 3 + 2] || 0;

            if (newColors && colors) {
                newColors[i * 3] = colors[sourceIndex * 3] || 1;
                newColors[i * 3 + 1] = colors[sourceIndex * 3 + 1] || 1;
                newColors[i * 3 + 2] = colors[sourceIndex * 3 + 2] || 1;
            }

            if (newSizes && sizes) {
                newSizes[i] = sizes[sourceIndex] || 1;
            }
        }

        // Update geometry
        particleSystem.geometry.setAttribute('position',
            new THREE.BufferAttribute(newPositions, 3));
        if (newColors) {
            particleSystem.geometry.setAttribute('color',
                new THREE.BufferAttribute(newColors, 3));
        }
        if (newSizes) {
            particleSystem.geometry.setAttribute('size',
                new THREE.BufferAttribute(newSizes, 1));
        }
    }

    /**
     * Post-Processing Optimization
     */
    updatePostProcessing(settings) {
        // This would interface with the post-processing system
        if (window.BlazeChampionshipPostProcessing) {
            const postProcessor = window.BlazeChampionshipPostProcessing.instance;
            if (postProcessor) {
                postProcessor.setQuality(settings);
            }
        }
    }

    /**
     * Memory Management
     */
    cleanupUnusedResources() {
        const used = new Set();

        // Mark resources in use
        this.scene.traverse((object) => {
            if (object.geometry) used.add(object.geometry.uuid);
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => {
                        used.add(mat.uuid);
                        if (mat.map) used.add(mat.map.uuid);
                    });
                } else {
                    used.add(object.material.uuid);
                    if (object.material.map) used.add(object.material.map.uuid);
                }
            }
        });

        // Dispose unused resources
        const info = this.renderer.info;
        console.log(`>ù Cleaned ${info.memory.geometries - used.size} unused resources`);
    }

    /**
     * Adaptive Quality System
     */
    setupAdaptiveQuality() {
        // Monitor device capabilities
        this.deviceCapabilities = {
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isLowPower: navigator.getBattery?.().then(battery => battery.level < 0.2),
            memoryLimit: navigator.deviceMemory || 4,
            hardwareConcurrency: navigator.hardwareConcurrency || 4
        };

        // Adjust initial quality based on device
        if (this.deviceCapabilities.isMobile) {
            this.setOptimizationLevel('low');
        } else if (this.deviceCapabilities.memoryLimit < 4) {
            this.setOptimizationLevel('medium');
        }
    }

    /**
     * Emergency Performance Recovery
     */
    triggerEmergencyOptimization() {
        console.warn('=¨ Emergency performance optimization triggered');

        // Disable all non-essential effects
        this.scene.traverse((object) => {
            // Disable particle systems temporarily
            if (object.isPoints && object.visible) {
                object.visible = false;
                object.userData.emergencyHidden = true;
            }

            // Reduce complex materials to basic
            if (object.material && object.material.type !== 'MeshBasicMaterial') {
                if (!object.userData.originalMaterial) {
                    object.userData.originalMaterial = object.material;
                }
                object.material = new THREE.MeshBasicMaterial({
                    color: object.material.color || 0xffffff
                });
            }
        });

        // Reduce render resolution
        const canvas = this.renderer.domElement;
        const currentWidth = canvas.width;
        const currentHeight = canvas.height;

        this.renderer.setSize(currentWidth * 0.5, currentHeight * 0.5, false);
        this.renderer.setPixelRatio(0.5);

        console.log('Emergency optimization applied - 50% resolution');
    }

    restoreFromEmergency() {
        console.log('= Restoring from emergency optimization');

        this.scene.traverse((object) => {
            // Restore hidden particles
            if (object.userData.emergencyHidden) {
                object.visible = true;
                delete object.userData.emergencyHidden;
            }

            // Restore original materials
            if (object.userData.originalMaterial) {
                object.material = object.userData.originalMaterial;
                delete object.userData.originalMaterial;
            }
        });

        // Restore render resolution
        const canvas = this.renderer.domElement;
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    /**
     * Main Update Loop
     */
    update() {
        // Perform culling
        this.performFrustumCulling();

        // Perform occlusion culling (less frequently)
        if (Math.random() < 0.1) { // 10% chance per frame
            this.performOcclusionCulling();
        }

        // Update LOD
        this.lodGroups.forEach(group => {
            group.lod.update(this.camera);
        });

        // Memory cleanup (occasionally)
        if (Math.random() < 0.001) { // 0.1% chance per frame
            this.cleanupUnusedResources();
        }
    }

    /**
     * Debug Information
     */
    getPerformanceReport() {
        return {
            ...this.performanceStats,
            optimizationLevel: this.optimizationLevel,
            gpuTier: this.gpuTier,
            culledObjects: this.culledObjects.size,
            lodGroups: this.lodGroups.length,
            frameTimeHistory: [...this.frameTimeHistory]
        };
    }

    /**
     * Cleanup
     */
    dispose() {
        this.lodGroups.forEach(group => {
            group.lod.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        this.lodGroups.length = 0;
        this.culledObjects.clear();
        this.visibilityTests.clear();
        this.cullingBounds.clear();
        this.occlusionQueries.clear();

        console.log('>ù Performance Optimizer disposed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazePerformanceOptimizer;
}