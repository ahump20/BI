/**
 * 🎮 BLAZE INTELLIGENCE - HYBRID RENDER ORCHESTRATOR
 * Seamlessly combines Three.js real-time rendering with Unreal Engine cinematic quality
 * Progressive enhancement: Works with Three.js alone, enhanced with Unreal when available
 */

class HybridRenderOrchestrator {
    constructor() {
        this.config = {
            preferredEngine: 'auto', // 'three', 'unreal', or 'auto'
            qualityThreshold: 'production', // When to use Unreal
            fallbackToThree: true,
            cacheRenderedAssets: true
        };

        this.threeEngine = null;
        this.unrealEngine = null;
        this.activeEngine = null;
        this.renderCache = new Map();

        this.init();
    }

    async init() {
        console.log('🎮 Initializing Hybrid Render Orchestrator...');

        // Initialize Three.js (always available)
        await this.initThreeJS();

        // Try to initialize Unreal Engine (optional enhancement)
        await this.initUnrealEngine();

        // Determine active engine based on availability and preference
        this.selectActiveEngine();

        console.log(`✅ Hybrid Renderer Ready! Active: ${this.activeEngine}`);
    }

    /**
     * Initialize Three.js rendering engine
     */
    async initThreeJS() {
        if (typeof THREE !== 'undefined') {
            this.threeEngine = {
                available: true,
                capabilities: {
                    realTime: true,
                    maxResolution: '4K',
                    physics: true,
                    particles: true,
                    postProcessing: true
                },
                renderer: null,
                scene: null,
                camera: null
            };

            // Create Three.js renderer if container exists
            const container = document.getElementById('three-container');
            if (container) {
                this.setupThreeRenderer(container);
            }

            console.log('✅ Three.js engine initialized');
            return true;
        }

        console.warn('⚠️ Three.js not available');
        return false;
    }

    /**
     * Setup Three.js renderer
     */
    setupThreeRenderer(container) {
        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0e27, 100, 1000);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 30);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        scene.add(directionalLight);

        // Store references
        this.threeEngine.renderer = renderer;
        this.threeEngine.scene = scene;
        this.threeEngine.camera = camera;

        // Start render loop
        this.startThreeRenderLoop();
    }

    /**
     * Three.js render loop
     */
    startThreeRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);

            if (this.threeEngine.renderer && this.threeEngine.scene && this.threeEngine.camera) {
                // Update any animations or physics here
                if (this.threeEngine.mixer) {
                    this.threeEngine.mixer.update(0.016);
                }

                // Render
                this.threeEngine.renderer.render(this.threeEngine.scene, this.threeEngine.camera);
            }
        };
        animate();
    }

    /**
     * Initialize Unreal Engine connection
     */
    async initUnrealEngine() {
        if (window.unrealEngine) {
            this.unrealEngine = window.unrealEngine;

            // Check if connected
            if (this.unrealEngine.isConnected) {
                console.log('✅ Unreal Engine connected');
                return true;
            } else {
                console.log('⏳ Waiting for Unreal Engine connection...');
                // Wait a bit for connection
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (this.unrealEngine.isConnected) {
                    console.log('✅ Unreal Engine connected');
                    return true;
                }
            }
        }

        console.log('ℹ️ Unreal Engine not available (optional)');
        return false;
    }

    /**
     * Select the active rendering engine based on preference and availability
     */
    selectActiveEngine() {
        if (this.config.preferredEngine === 'unreal' && this.unrealEngine?.isConnected) {
            this.activeEngine = 'unreal';
        } else if (this.config.preferredEngine === 'three' && this.threeEngine?.available) {
            this.activeEngine = 'three';
        } else if (this.config.preferredEngine === 'auto') {
            // Auto-select based on task and availability
            this.activeEngine = this.unrealEngine?.isConnected ? 'hybrid' : 'three';
        } else {
            // Fallback
            this.activeEngine = this.threeEngine?.available ? 'three' : null;
        }
    }

    /**
     * Render a scene using the appropriate engine
     */
    async render(options = {}) {
        const {
            type = 'scene',
            quality = 'realtime',
            cache = true,
            data = {}
        } = options;

        // Check cache first
        const cacheKey = JSON.stringify(options);
        if (cache && this.renderCache.has(cacheKey)) {
            console.log('📦 Returning cached render');
            return this.renderCache.get(cacheKey);
        }

        let result = null;

        // Determine which engine to use
        if (this.shouldUseUnreal(type, quality)) {
            result = await this.renderWithUnreal(options);
        } else {
            result = await this.renderWithThree(options);
        }

        // Cache result
        if (cache && result) {
            this.renderCache.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Determine if Unreal should be used for this render
     */
    shouldUseUnreal(type, quality) {
        // Use Unreal for high-quality or cinematic renders
        const unrealTypes = ['cinematic', 'title-card', 'highlight-reel', 'stadium-flythrough'];
        const unrealQualities = ['production', 'cinematic', 'ultra'];

        return this.unrealEngine?.isConnected &&
               (unrealTypes.includes(type) || unrealQualities.includes(quality));
    }

    /**
     * Render using Three.js
     */
    async renderWithThree(options) {
        console.log('🎨 Rendering with Three.js:', options.type);

        if (!this.threeEngine?.scene) {
            console.error('Three.js not initialized');
            return null;
        }

        switch(options.type) {
            case 'stadium':
                return this.createThreeStadium(options.data);

            case 'player':
                return this.createThreePlayer(options.data);

            case 'scoreboard':
                return this.createThreeScoreboard(options.data);

            case 'analytics':
                return this.createThreeAnalytics(options.data);

            default:
                return this.createThreeScene(options.data);
        }
    }

    /**
     * Render using Unreal Engine
     */
    async renderWithUnreal(options) {
        console.log('🎬 Rendering with Unreal Engine:', options.type);

        if (!this.unrealEngine?.isConnected) {
            console.warn('Unreal not connected, falling back to Three.js');
            return this.renderWithThree(options);
        }

        try {
            // Map options to Unreal render spec
            const renderSpec = {
                type: options.type,
                quality: options.quality,
                ...options.data
            };

            // Submit render job
            const jobId = await this.unrealEngine.submitRender(renderSpec);

            console.log(`📋 Unreal render job submitted: ${jobId}`);

            return {
                engine: 'unreal',
                jobId: jobId,
                status: 'processing',
                type: options.type
            };

        } catch (error) {
            console.error('Unreal render failed:', error);

            // Fallback to Three.js if enabled
            if (this.config.fallbackToThree) {
                console.log('Falling back to Three.js');
                return this.renderWithThree(options);
            }

            throw error;
        }
    }

    /**
     * Create a Three.js stadium scene
     */
    createThreeStadium(data) {
        const scene = this.threeEngine.scene;

        // Create stadium geometry
        const stadiumGeometry = new THREE.BoxGeometry(100, 30, 80);
        const stadiumMaterial = new THREE.MeshPhongMaterial({
            color: 0x2D5016,
            emissive: 0x1a2a0d,
            emissiveIntensity: 0.2
        });
        const stadium = new THREE.Mesh(stadiumGeometry, stadiumMaterial);
        stadium.position.y = 15;
        scene.add(stadium);

        // Create field
        const fieldGeometry = new THREE.PlaneGeometry(90, 70);
        const fieldMaterial = new THREE.MeshPhongMaterial({
            color: 0x3c8b3c,
            emissive: 0x2a5a2a,
            emissiveIntensity: 0.1
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        field.receiveShadow = true;
        scene.add(field);

        // Add stadium lights
        for (let i = 0; i < 4; i++) {
            const light = new THREE.SpotLight(0xffffff, 1);
            const angle = (i / 4) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 60,
                40,
                Math.sin(angle) * 60
            );
            light.target.position.set(0, 0, 0);
            light.castShadow = true;
            scene.add(light);
            scene.add(light.target);
        }

        return {
            engine: 'three',
            type: 'stadium',
            scene: scene,
            status: 'complete'
        };
    }

    /**
     * Create a Three.js player model
     */
    createThreePlayer(data) {
        const scene = this.threeEngine.scene;

        // Create simple player representation
        const playerGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(1, 3, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: data.teamColor || 0xC41E3A // Cardinals red
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3;
        playerGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0xfdbcb4
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 5.5;
        playerGroup.add(head);

        // Add number
        if (data.number) {
            const loader = new THREE.FontLoader();
            // Would load font and create 3D text here
        }

        scene.add(playerGroup);

        return {
            engine: 'three',
            type: 'player',
            model: playerGroup,
            status: 'complete'
        };
    }

    /**
     * Create a Three.js scoreboard
     */
    createThreeScoreboard(data) {
        const scene = this.threeEngine.scene;

        // Create scoreboard geometry
        const boardGeometry = new THREE.BoxGeometry(20, 10, 1);
        const boardMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            emissive: 0x0a0a0a
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(0, 15, -40);
        scene.add(board);

        // Add LED display effect
        const displayGeometry = new THREE.PlaneGeometry(18, 8);
        const displayMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1
        });
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.set(0, 15, -39.5);
        scene.add(display);

        return {
            engine: 'three',
            type: 'scoreboard',
            model: board,
            status: 'complete'
        };
    }

    /**
     * Create Three.js analytics visualization
     */
    createThreeAnalytics(data) {
        const scene = this.threeEngine.scene;

        // Create 3D data visualization
        const dataPoints = data.points || [];
        const pointsGroup = new THREE.Group();

        dataPoints.forEach((point, index) => {
            const height = point.value || Math.random() * 10;
            const barGeometry = new THREE.BoxGeometry(1, height, 1);
            const barMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(index / dataPoints.length, 0.8, 0.5)
            });
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(
                (index - dataPoints.length / 2) * 2,
                height / 2,
                0
            );
            pointsGroup.add(bar);
        });

        scene.add(pointsGroup);

        return {
            engine: 'three',
            type: 'analytics',
            visualization: pointsGroup,
            status: 'complete'
        };
    }

    /**
     * Create a generic Three.js scene
     */
    createThreeScene(data) {
        return {
            engine: 'three',
            type: 'scene',
            scene: this.threeEngine.scene,
            status: 'complete'
        };
    }

    /**
     * Switch between engines
     */
    switchEngine(engine) {
        if (engine === 'unreal' && !this.unrealEngine?.isConnected) {
            console.warn('Cannot switch to Unreal - not connected');
            return false;
        }

        if (engine === 'three' && !this.threeEngine?.available) {
            console.warn('Cannot switch to Three.js - not available');
            return false;
        }

        this.activeEngine = engine;
        console.log(`🔄 Switched to ${engine} engine`);
        return true;
    }

    /**
     * Get render capabilities for current setup
     */
    getCapabilities() {
        return {
            three: this.threeEngine?.available ? this.threeEngine.capabilities : null,
            unreal: this.unrealEngine?.isConnected ? {
                cinematic: true,
                rayTracing: true,
                maxResolution: '8K',
                physics: true,
                ai: true
            } : null,
            hybrid: this.activeEngine === 'hybrid'
        };
    }

    /**
     * Clear render cache
     */
    clearCache() {
        this.renderCache.clear();
        console.log('🗑️ Render cache cleared');
    }

    /**
     * Cleanup and dispose
     */
    dispose() {
        if (this.threeEngine?.renderer) {
            this.threeEngine.renderer.dispose();
        }

        this.renderCache.clear();

        console.log('🧹 Hybrid renderer disposed');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hybridRenderer = new HybridRenderOrchestrator();
    });
} else {
    window.hybridRenderer = new HybridRenderOrchestrator();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HybridRenderOrchestrator;
}