/**
 * Blaze Intelligence Enhanced 3D Visualization Engine
 * Unified Three.js + Babylon.js platform with modern UI components
 * Version 2.0 - Championship-Level Implementation
 */

class BlazeEnhanced3DEngine {
    constructor() {
        this.version = "2.0.0";
        this.isInitialized = false;
        
        // Core engines
        this.threeEngine = null;
        this.babylonEngine = null;
        this.scenes = new Map();
        this.renderers = new Map();
        this.cameras = new Map();
        this.animations = new Map();
        
        // Performance tracking
        this.performanceStats = {
            fps: 60,
            renderTime: 0,
            memoryUsage: 0,
            activeObjects: 0
        };
        
        // Enhanced configuration
        this.config = {
            enableThreeJS: true,
            enableBabylonJS: true,
            enableWebXR: true,
            enableSpatialComputing: true,
            performanceMode: 'championship', // youth, professional, championship
            autoOptimize: true,
            debugMode: false
        };
        
        // Blaze Intelligence branding colors
        this.colors = {
            blazeOrange: 0xFF6B35,
            blazeBurnt: 0xCC5500,
            blazeDark: 0x0A0A0A,
            blazeWhite: 0xFFFFFF,
            blazeTeal: 0x00B2A9,
            blazeGold: 0xFFD700,
            blazeSky: 0x9BCBEB,
            blazeNavy: 0x002244
        };
        
        // Sports data integration
        this.sportsData = {
            cardinals: { readiness: 87.3, leverage: 4.2, efficiency: 92.1, winProb: 64.8 },
            titans: { offense: 78.5, defense: 85.2, special: 91.3, morale: 88.7 },
            longhorns: { recruiting: 94.2, performance: 88.7, potential: 92.3 },
            grizzlies: { offensive: 82.1, defensive: 79.8, chemistry: 91.5 }
        };
        
        this.bindEvents();
    }
    
    /**
     * Initialize the enhanced 3D engine
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log(`🚀 Initializing Blaze Enhanced 3D Engine v${this.version}`);
        
        try {
            // Detect capabilities
            await this.detectCapabilities();
            
            // Initialize engines
            if (this.config.enableThreeJS) {
                await this.initializeThreeJS();
            }
            
            if (this.config.enableBabylonJS) {
                await this.initializeBabylonJS();
            }
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Initialize default scenes
            await this.createDefaultScenes();
            
            this.isInitialized = true;
            console.log('🏆 Enhanced 3D Engine: Championship Mode Activated');
            
            return true;
        } catch (error) {
            console.error('3D Engine initialization failed:', error);
            return false;
        }
    }
    
    /**
     * Detect browser and device capabilities
     */
    async detectCapabilities() {
        // WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        this.webglSupported = !!gl;
        
        // WebXR support
        if (navigator.xr) {
            try {
                this.webxrSupported = await navigator.xr.isSessionSupported('immersive-vr');
            } catch (e) {
                this.webxrSupported = false;
            }
        }
        
        // WebGPU support
        this.webgpuSupported = 'gpu' in navigator;
        
        // Performance detection
        this.highPerformance = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
        this.isMobile = window.innerWidth < 768;
        
        console.log('🔍 Capabilities:', {
            webgl: this.webglSupported,
            webxr: this.webxrSupported,
            webgpu: this.webgpuSupported,
            highPerf: this.highPerformance,
            mobile: this.isMobile
        });
    }
    
    /**
     * Initialize Three.js engine with enhanced features
     */
    async initializeThreeJS() {
        if (!window.THREE) {
            console.warn('Three.js not available');
            return;
        }
        
        this.threeEngine = {
            version: THREE.REVISION,
            clock: new THREE.Clock(),
            loader: new THREE.TextureLoader(),
            raycaster: new THREE.Raycaster(),
            mouse: new THREE.Vector2()
        };
        
        console.log(`✅ Three.js v${this.threeEngine.version} initialized`);
    }
    
    /**
     * Initialize Babylon.js engine with WebGPU support
     */
    async initializeBabylonJS() {
        if (!window.BABYLON) {
            console.warn('Babylon.js not available, loading from CDN...');
            await this.loadBabylonJS();
        }
        
        if (window.BABYLON) {
            try {
                const canvas = this.createCanvasElement('babylon-engine');
                
                if (this.webgpuSupported && BABYLON.WebGPUEngine) {
                    this.babylonEngine = new BABYLON.WebGPUEngine(canvas, {
                        adaptToDeviceRatio: true,
                        antialias: true,
                        powerPreference: 'high-performance'
                    });
                    await this.babylonEngine.initAsync();
                } else {
                    this.babylonEngine = new BABYLON.Engine(canvas, true, {
                        adaptToDeviceRatio: true,
                        antialias: true,
                        powerPreference: 'high-performance'
                    });
                }
                
                console.log('✅ Babylon.js engine initialized');
            } catch (error) {
                console.error('Babylon.js initialization failed:', error);
            }
        }
    }
    
    /**
     * Load Babylon.js from CDN if not available
     */
    async loadBabylonJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.babylonjs.com/babylon.js';
            script.onload = () => {
                console.log('📦 Babylon.js loaded from CDN');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Create enhanced sports analytics visualization
     */
    createSportsAnalyticsScene(containerId, team = 'cardinals') {
        const container = document.getElementById(containerId);
        if (!container || !this.threeEngine) return null;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(this.colors.blazeDark, 20, 100);
        
        // Setup camera
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 25);
        
        // Setup renderer with enhanced settings
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(renderer.domElement);
        
        // Create team-specific visualization
        this.createTeamVisualization(scene, team);
        
        // Add enhanced lighting
        this.setupEnhancedLighting(scene);
        
        // Create interactive elements
        this.addInteractiveElements(scene, camera, renderer);
        
        // Store references
        const sceneId = `${containerId}_${team}`;
        this.scenes.set(sceneId, scene);
        this.cameras.set(sceneId, camera);
        this.renderers.set(sceneId, renderer);
        
        // Start animation loop
        this.startAnimationLoop(sceneId);
        
        return { scene, camera, renderer, sceneId };
    }
    
    /**
     * Create team-specific 3D visualization
     */
    createTeamVisualization(scene, team) {
        const teamData = this.sportsData[team] || this.sportsData.cardinals;
        
        // Central data sphere
        const sphereGeometry = new THREE.IcosahedronGeometry(8, 4);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.blazeOrange,
            emissive: this.colors.blazeOrange,
            emissiveIntensity: 0.1,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const mainSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(mainSphere);
        
        // Performance data visualization
        const dataPoints = new THREE.Group();
        Object.entries(teamData).forEach(([metric, value], index) => {
            const angle = (index / Object.keys(teamData).length) * Math.PI * 2;
            const radius = 12 + (value / 100) * 5;
            
            // Data point
            const pointGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const pointMaterial = new THREE.MeshPhongMaterial({
                color: this.getMetricColor(value),
                emissive: this.getMetricColor(value),
                emissiveIntensity: 0.3
            });
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            
            point.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            // Connection line
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                point.position
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: this.getMetricColor(value),
                transparent: true,
                opacity: 0.6
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            
            dataPoints.add(point);
            dataPoints.add(line);
            
            // Store metric data for interaction
            point.userData = { metric, value, team };
        });
        
        scene.add(dataPoints);
        
        // Particle field for atmosphere
        this.createParticleField(scene);
        
        // Store for animation
        mainSphere.userData = { type: 'mainSphere', team };
        dataPoints.userData = { type: 'dataPoints', team };
    }
    
    /**
     * Get color based on metric value
     */
    getMetricColor(value) {
        if (value >= 90) return this.colors.blazeGold;
        if (value >= 80) return this.colors.blazeTeal;
        if (value >= 70) return this.colors.blazeOrange;
        if (value >= 60) return this.colors.blazeSky;
        return this.colors.blazeNavy;
    }
    
    /**
     * Create atmospheric particle field
     */
    createParticleField(scene) {
        const particleCount = this.isMobile ? 500 : 1000;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            // Color
            const color = new THREE.Color(this.colors.blazeOrange);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particleMaterial);
        particles.userData = { type: 'particles' };
        scene.add(particles);
    }
    
    /**
     * Setup enhanced lighting system
     */
    setupEnhancedLighting(scene) {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(this.colors.blazeOrange, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Accent point lights
        const pointLight1 = new THREE.PointLight(this.colors.blazeTeal, 0.6, 50);
        pointLight1.position.set(-20, 10, 0);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(this.colors.blazeGold, 0.4, 30);
        pointLight2.position.set(20, -10, 0);
        scene.add(pointLight2);
    }
    
    /**
     * Add interactive elements and controls
     */
    addInteractiveElements(scene, camera, renderer) {
        // Mouse interaction
        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        
        renderer.domElement.addEventListener('mousemove', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData.metric) {
                    this.showTooltip(object.userData, event);
                }
            }
        });
        
        // Touch interaction for mobile
        if (this.isMobile) {
            renderer.domElement.addEventListener('touchstart', (event) => {
                event.preventDefault();
                // Handle touch interaction
            });
        }
    }
    
    /**
     * Show interactive tooltip
     */
    showTooltip(data, event) {
        let tooltip = document.getElementById('blaze-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'blaze-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(255, 107, 53, 0.95);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                pointer-events: none;
                z-index: 10000;
                backdrop-filter: blur(10px);
                transform: translate(-50%, -100%);
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <strong>${data.metric.toUpperCase()}</strong><br>
            ${data.team.toUpperCase()}: ${data.value.toFixed(1)}%
        `;
        
        tooltip.style.left = event.clientX + 'px';
        tooltip.style.top = event.clientY - 10 + 'px';
        tooltip.style.display = 'block';
        
        setTimeout(() => {
            if (tooltip) tooltip.style.display = 'none';
        }, 2000);
    }
    
    /**
     * Start animation loop for a scene
     */
    startAnimationLoop(sceneId) {
        const scene = this.scenes.get(sceneId);
        const camera = this.cameras.get(sceneId);
        const renderer = this.renderers.get(sceneId);
        
        if (!scene || !camera || !renderer) return;
        
        const animate = () => {
            const animationId = requestAnimationFrame(animate);
            this.animations.set(sceneId, animationId);
            
            // Update animations
            this.updateSceneAnimations(scene);
            
            // Render
            renderer.render(scene, camera);
            
            // Update performance stats
            this.updatePerformanceStats();
        };
        
        animate();
    }
    
    /**
     * Update scene animations
     */
    updateSceneAnimations(scene) {
        const time = this.threeEngine.clock.getElapsedTime();
        
        scene.traverse((object) => {
            if (object.userData.type === 'mainSphere') {
                object.rotation.x = time * 0.2;
                object.rotation.y = time * 0.3;
            } else if (object.userData.type === 'dataPoints') {
                object.rotation.y = time * 0.1;
            } else if (object.userData.type === 'particles') {
                object.rotation.x = time * 0.05;
                object.rotation.y = time * 0.02;
            }
        });
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (this.config.debugMode) {
            this.stats = {
                begin: () => {},
                end: () => {},
                update: () => {}
            };
            
            // Try to load stats.js
            if (window.Stats) {
                this.stats = new Stats();
                this.stats.showPanel(0); // FPS
                document.body.appendChild(this.stats.dom);
            }
        }
    }
    
    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        if (this.stats) {
            this.stats.begin();
            this.stats.end();
        }
        
        // Update internal stats
        this.performanceStats.activeObjects = 0;
        this.scenes.forEach(scene => {
            scene.traverse(() => this.performanceStats.activeObjects++);
        });
    }
    
    /**
     * Create canvas element with proper styling
     */
    createCanvasElement(id) {
        let canvas = document.getElementById(id);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = id;
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                display: block;
                outline: none;
            `;
        }
        return canvas;
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.renderers.forEach((renderer, sceneId) => {
            const camera = this.cameras.get(sceneId);
            const container = renderer.domElement.parentElement;
            
            if (container && camera) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
    }
    
    /**
     * Pause animations for performance
     */
    pauseAnimations() {
        this.animations.forEach((animationId) => {
            cancelAnimationFrame(animationId);
        });
    }
    
    /**
     * Resume animations
     */
    resumeAnimations() {
        this.animations.forEach((_, sceneId) => {
            this.startAnimationLoop(sceneId);
        });
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        this.pauseAnimations();
        
        this.renderers.forEach(renderer => {
            renderer.dispose();
        });
        
        this.scenes.clear();
        this.cameras.clear();
        this.renderers.clear();
        this.animations.clear();
        
        console.log('🧹 Enhanced 3D Engine disposed');
    }
    
    /**
     * Get engine status and capabilities
     */
    getStatus() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            engines: {
                threeJS: !!this.threeEngine,
                babylonJS: !!this.babylonEngine
            },
            capabilities: {
                webgl: this.webglSupported,
                webxr: this.webxrSupported,
                webgpu: this.webgpuSupported,
                highPerformance: this.highPerformance
            },
            performance: this.performanceStats,
            activeScenes: this.scenes.size
        };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.blazeEnhanced3D) {
        window.blazeEnhanced3D = new BlazeEnhanced3DEngine();
        await window.blazeEnhanced3D.initialize();
        
        console.log('🎯 Blaze Enhanced 3D Engine Status:', window.blazeEnhanced3D.getStatus());
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeEnhanced3DEngine;
}