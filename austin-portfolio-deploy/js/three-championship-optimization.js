/**
 * Championship-Level Three.js Performance Optimization System
 * Optimized for blazesportsintel.com Deep South Sports Authority
 *
 * PERFORMANCE TARGETS:
 * - 60fps sustained on championship-tier devices
 * - 45fps minimum on competitive-tier devices
 * - <16.67ms frame time budget
 * - Adaptive quality scaling
 */

class ChampionshipGraphicsOptimizer {
    constructor() {
        this.performanceMetrics = {
            targetFPS: 60,
            frameBudget: 16.67,
            currentFPS: 60,
            frameTime: 0,
            memoryUsage: 0,
            gpuMemory: 0
        };

        this.qualityPresets = {
            championship: {
                particleCount: 1500,
                shadowQuality: 'high',
                antialiasing: true,
                bloomEnabled: true,
                maxLights: 8,
                textureQuality: 1.0,
                shaderPrecision: 'highp'
            },
            professional: {
                particleCount: 1000,
                shadowQuality: 'medium',
                antialiasing: true,
                bloomEnabled: true,
                maxLights: 6,
                textureQuality: 0.8,
                shaderPrecision: 'mediump'
            },
            competitive: {
                particleCount: 600,
                shadowQuality: 'low',
                antialiasing: false,
                bloomEnabled: false,
                maxLights: 4,
                textureQuality: 0.6,
                shaderPrecision: 'mediump'
            },
            optimized: {
                particleCount: 300,
                shadowQuality: 'off',
                antialiasing: false,
                bloomEnabled: false,
                maxLights: 2,
                textureQuality: 0.4,
                shaderPrecision: 'lowp'
            }
        };

        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.optimizeRendererSettings();
        this.implementGeometryInstancing();
        this.setupTextureOptimization();
        this.implementLevelOfDetail();
        this.setupMemoryOptimization();

        console.log('🏆 Championship Graphics Optimization System Initialized');
    }

    setupPerformanceMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;

        const measurePerformance = (currentTime) => {
            frameCount++;
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= 1000) {
                this.performanceMetrics.currentFPS = Math.round((frameCount * 1000) / deltaTime);
                this.performanceMetrics.frameTime = deltaTime / frameCount;

                // GPU memory estimation (WebGL context dependent)
                if (window.blazeRenderer && window.blazeRenderer.info) {
                    const info = window.blazeRenderer.info;
                    this.performanceMetrics.gpuMemory = info.memory;
                }

                // Auto-adjust quality based on performance
                this.autoAdjustQuality();

                frameCount = 0;
                lastTime = currentTime;

                // Update performance display
                this.updatePerformanceDisplay();
            }

            requestAnimationFrame(measurePerformance);
        };

        requestAnimationFrame(measurePerformance);
    }

    optimizeRendererSettings() {
        if (!window.blazeRenderer) return;

        const renderer = window.blazeRenderer;
        const currentTier = window.blazeGraphicsTier || 'competitive';
        const preset = this.qualityPresets[currentTier];

        // Optimize renderer configuration
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, currentTier === 'championship' ? 2 : 1.5));
        renderer.antialias = preset.antialiasing;

        // Shadow optimization
        if (preset.shadowQuality !== 'off') {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = this.getShadowMapType(preset.shadowQuality);
            renderer.shadowMap.autoUpdate = false; // Manual shadow updates for performance
        } else {
            renderer.shadowMap.enabled = false;
        }

        // Enable GPU instancing for repeated geometries
        renderer.extensions.get('ANGLE_instanced_arrays');

        // Optimize culling
        renderer.sortObjects = true;
        renderer.autoClear = true;
        renderer.autoClearColor = true;
        renderer.autoClearDepth = true;
        renderer.autoClearStencil = false;

        console.log(`📊 Renderer optimized for ${currentTier} tier`);
    }

    getShadowMapType(quality) {
        switch (quality) {
            case 'high': return THREE.PCFSoftShadowMap;
            case 'medium': return THREE.PCFShadowMap;
            case 'low': return THREE.BasicShadowMap;
            default: return THREE.BasicShadowMap;
        }
    }

    implementGeometryInstancing() {
        // Optimize particle systems using instanced geometry
        this.createInstancedParticles = (count, geometry, material) => {
            const instancedGeometry = new THREE.InstancedBufferGeometry();
            instancedGeometry.copy(geometry);

            // Instance attributes for position and color
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const scales = new Float32Array(count);

            for (let i = 0; i < count; i++) {
                // Random sphere distribution
                const radius = 80;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);

                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);

                // Brand colors: Burnt Orange, Cardinal Blue, Championship Gold
                const colorIndex = Math.floor(Math.random() * 3);
                const brandColors = [
                    new THREE.Color(0xBF5700), // Burnt Orange
                    new THREE.Color(0x9BCBEB), // Cardinal Blue
                    new THREE.Color(0xFFD700)  // Championship Gold
                ];

                const color = brandColors[colorIndex];
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;

                scales[i] = 0.5 + Math.random() * 1.5;
            }

            instancedGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(positions, 3));
            instancedGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
            instancedGeometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));

            return new THREE.Mesh(instancedGeometry, material);
        };
    }

    setupTextureOptimization() {
        // Implement texture atlas and compression
        this.optimizeTextures = (texture) => {
            const currentTier = window.blazeGraphicsTier || 'competitive';
            const preset = this.qualityPresets[currentTier];

            // Texture filtering optimization
            texture.minFilter = preset.textureQuality >= 0.8 ? THREE.LinearMipMapLinearFilter : THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;

            // Anisotropic filtering
            const maxAnisotropy = window.blazeRenderer ? window.blazeRenderer.capabilities.getMaxAnisotropy() : 4;
            texture.anisotropy = Math.min(maxAnisotropy, preset.textureQuality * 16);

            // Compress textures on lower tiers
            if (preset.textureQuality < 0.8) {
                texture.format = THREE.RGBFormat;
            }

            return texture;
        };
    }

    implementLevelOfDetail() {
        // LOD system for complex geometries
        this.createLODObject = (highDetail, mediumDetail, lowDetail) => {
            const lod = new THREE.LOD();

            lod.addLevel(highDetail, 0);     // 0-30 units
            lod.addLevel(mediumDetail, 30);  // 30-60 units
            lod.addLevel(lowDetail, 60);     // 60+ units

            return lod;
        };

        // Frustum culling optimization
        this.setupFrustumCulling = (camera, objects) => {
            const frustum = new THREE.Frustum();
            const matrix = new THREE.Matrix4();

            return () => {
                matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                frustum.setFromProjectionMatrix(matrix);

                objects.forEach(obj => {
                    obj.visible = frustum.intersectsObject(obj);
                });
            };
        };
    }

    setupMemoryOptimization() {
        // Advanced memory management
        this.memoryManager = {
            geometryPool: new Map(),
            materialPool: new Map(),
            texturePool: new Map(),

            getGeometry(key, factory) {
                if (!this.geometryPool.has(key)) {
                    this.geometryPool.set(key, factory());
                }
                return this.geometryPool.get(key);
            },

            getMaterial(key, factory) {
                if (!this.materialPool.has(key)) {
                    this.materialPool.set(key, factory());
                }
                return this.materialPool.get(key);
            },

            cleanup() {
                // Dispose unused resources
                const threshold = performance.now() - 300000; // 5 minutes

                [this.geometryPool, this.materialPool, this.texturePool].forEach(pool => {
                    for (const [key, resource] of pool) {
                        if (resource.lastUsed && resource.lastUsed < threshold) {
                            if (resource.dispose) resource.dispose();
                            pool.delete(key);
                        }
                    }
                });
            }
        };

        // Cleanup cycle every 2 minutes
        setInterval(() => {
            this.memoryManager.cleanup();

            // Force garbage collection if available (Chrome DevTools)
            if (window.gc) {
                window.gc();
            }

            console.log('🧹 Memory optimization cycle completed');
        }, 120000);
    }

    autoAdjustQuality() {
        const fps = this.performanceMetrics.currentFPS;
        const currentTier = window.blazeGraphicsTier;
        const tiers = ['championship', 'professional', 'competitive', 'optimized'];
        const currentIndex = tiers.indexOf(currentTier);

        // Downgrade if performance drops
        if (fps < 45 && currentIndex < tiers.length - 1) {
            const newTier = tiers[currentIndex + 1];
            this.switchQualityTier(newTier);

            // Notify user of quality adjustment
            this.showPerformanceNotification(`Graphics quality adjusted to ${newTier} for better performance`);
        }
        // Upgrade if performance is consistently good
        else if (fps > 55 && currentIndex > 0) {
            // Wait 10 seconds before upgrading to ensure stability
            setTimeout(() => {
                if (this.performanceMetrics.currentFPS > 55) {
                    const newTier = tiers[currentIndex - 1];
                    this.switchQualityTier(newTier);

                    this.showPerformanceNotification(`Graphics quality upgraded to ${newTier}`);
                }
            }, 10000);
        }
    }

    switchQualityTier(newTier) {
        window.blazeGraphicsTier = newTier;
        const preset = this.qualityPresets[newTier];

        // Update particle counts
        if (window.blazeHeroViz && window.blazeHeroViz.particleSystem) {
            this.updateParticleCount(window.blazeHeroViz.particleSystem, preset.particleCount);
        }

        // Update renderer settings
        this.optimizeRendererSettings();

        console.log(`🏆 Quality tier switched to: ${newTier}`);
    }

    updateParticleCount(particleSystem, newCount) {
        const geometry = particleSystem.geometry;
        const currentCount = geometry.attributes.position.count;

        if (newCount !== currentCount) {
            // Recreate geometry with new particle count
            const positions = geometry.attributes.position.array;
            const colors = geometry.attributes.color.array;

            const newPositions = new Float32Array(newCount * 3);
            const newColors = new Float32Array(newCount * 3);

            // Copy existing particles or create new ones
            for (let i = 0; i < newCount; i++) {
                const sourceIndex = Math.min(i, currentCount - 1);

                newPositions[i * 3] = positions[sourceIndex * 3] || (Math.random() - 0.5) * 100;
                newPositions[i * 3 + 1] = positions[sourceIndex * 3 + 1] || (Math.random() - 0.5) * 100;
                newPositions[i * 3 + 2] = positions[sourceIndex * 3 + 2] || (Math.random() - 0.5) * 100;

                newColors[i * 3] = colors[sourceIndex * 3] || Math.random();
                newColors[i * 3 + 1] = colors[sourceIndex * 3 + 1] || Math.random();
                newColors[i * 3 + 2] = colors[sourceIndex * 3 + 2] || Math.random();
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
            geometry.setDrawRange(0, newCount);
        }
    }

    updatePerformanceDisplay() {
        // Create or update performance overlay
        let perfDisplay = document.getElementById('performance-display');

        if (!perfDisplay && window.blazeGraphicsTier === 'championship') {
            perfDisplay = document.createElement('div');
            perfDisplay.id = 'performance-display';
            perfDisplay.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(10, 10, 10, 0.9);
                color: #FFD700;
                padding: 12px;
                border-radius: 8px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                z-index: 9999;
                border: 1px solid #BF5700;
                min-width: 150px;
            `;
            document.body.appendChild(perfDisplay);
        }

        if (perfDisplay) {
            const metrics = this.performanceMetrics;
            perfDisplay.innerHTML = `
                <div style="color: #BF5700; font-weight: bold; margin-bottom: 4px;">🏆 Performance</div>
                <div>FPS: <span style="color: ${metrics.currentFPS >= 55 ? '#10b981' : metrics.currentFPS >= 45 ? '#f59e0b' : '#ef4444'}">${metrics.currentFPS}</span></div>
                <div>Frame: ${metrics.frameTime.toFixed(1)}ms</div>
                <div>Tier: <span style="color: #9BCBEB">${window.blazeGraphicsTier}</span></div>
                <div style="font-size: 10px; margin-top: 4px; color: rgba(255,255,255,0.6);">
                    Target: ${metrics.targetFPS}fps
                </div>
            `;
        }
    }

    showPerformanceNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #BF5700 0%, #FFD700 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 10px 40px rgba(191, 87, 0, 0.4);
            z-index: 10000;
            animation: slideIn 0.4s ease;
            max-width: 300px;
        `;

        notification.textContent = `🏆 ${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    // Public API methods
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }

    setQualityTier(tier) {
        if (this.qualityPresets[tier]) {
            this.switchQualityTier(tier);
        }
    }

    enablePerformanceDisplay(enable = true) {
        const display = document.getElementById('performance-display');
        if (display) {
            display.style.display = enable ? 'block' : 'none';
        }
    }

    destroy() {
        const perfDisplay = document.getElementById('performance-display');
        if (perfDisplay) {
            perfDisplay.remove();
        }

        // Clear all pools
        if (this.memoryManager) {
            this.memoryManager.cleanup();
        }

        console.log('🏆 Championship Graphics Optimizer destroyed');
    }
}

// Enhanced shader library for championship-level effects
class ChampionshipShaders {
    static get AdvancedParticleVertex() {
        return `
            attribute float size;
            attribute vec3 color;
            attribute float alpha;

            uniform float time;
            uniform float scale;
            uniform vec3 cameraPosition;

            varying vec3 vColor;
            varying float vAlpha;
            varying float vDistanceToCamera;

            void main() {
                vColor = color;
                vAlpha = alpha;

                vec3 pos = position;

                // Wave animation with Texas-sized amplitude
                float waveAmplitude = 3.0;
                pos.x += sin(time * 0.001 + position.y * 0.01) * waveAmplitude;
                pos.y += cos(time * 0.001 + position.x * 0.01) * waveAmplitude;
                pos.z += sin(time * 0.001 + position.x * 0.01) * (waveAmplitude * 0.5);

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                // Distance-based sizing with championship scaling
                vDistanceToCamera = length(cameraPosition - pos);
                float sizeAttenuation = 300.0 / max(1.0, -mvPosition.z);
                gl_PointSize = size * scale * sizeAttenuation * (1.0 + sin(time * 0.002) * 0.1);
            }
        `;
    }

    static get AdvancedParticleFragment() {
        return `
            varying vec3 vColor;
            varying float vAlpha;
            varying float vDistanceToCamera;

            uniform float time;

            void main() {
                // Circular particle with soft edges
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                if (dist > 0.5) {
                    discard;
                }

                // Championship glow effect
                float innerGlow = smoothstep(0.5, 0.1, dist);
                float outerGlow = smoothstep(0.5, 0.0, dist);
                float pulse = sin(time * 0.003) * 0.5 + 0.5;

                float alpha = (innerGlow * 0.8 + outerGlow * 0.3) * vAlpha * (0.7 + pulse * 0.3);

                // Distance fade for depth
                alpha *= smoothstep(100.0, 50.0, vDistanceToCamera);

                gl_FragColor = vec4(vColor, alpha);
            }
        `;
    }

    static get DeepSouthConnectionLines() {
        return {
            vertex: `
                attribute vec3 color;
                varying vec3 vColor;
                varying float vDistance;

                uniform float time;
                uniform vec3 cameraPosition;

                void main() {
                    vColor = color;

                    vec3 pos = position;

                    // Subtle line animation - like heat waves over Texas plains
                    pos.y += sin(time * 0.001 + position.x * 0.05) * 0.5;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    vDistance = length(cameraPosition - pos);
                }
            `,
            fragment: `
                varying vec3 vColor;
                varying float vDistance;

                uniform float opacity;

                void main() {
                    // Deep South authority fade
                    float alpha = opacity * smoothstep(80.0, 20.0, vDistance);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `
        };
    }
}

// Initialize Championship Graphics Optimization System
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        // Wait for other systems to initialize
        setTimeout(() => {
            window.championshipOptimizer = new ChampionshipGraphicsOptimizer();

            // Enable performance display for championship tier
            if (window.blazeGraphicsTier === 'championship') {
                window.championshipOptimizer.enablePerformanceDisplay(true);
            }
        }, 1000);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChampionshipGraphicsOptimizer, ChampionshipShaders };
}