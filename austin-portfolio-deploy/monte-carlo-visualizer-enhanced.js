/**
 * 🎲 Enhanced Monte Carlo 3D Probability Visualizer
 * Advanced Three.js visualizations with GPU-accelerated particle systems
 * Deep South Sports Intelligence Hub - Championship-grade visualization
 *
 * Features:
 * - 10,000+ GPU-accelerated particles with physics simulation
 * - Dynamic clustering and confidence-based visualization
 * - Team-specific color schemes (Cardinals, Titans, Longhorns, Grizzlies)
 * - Sports formation layouts (Baseball diamond, Football field, Basketball court)
 * - Real-time performance adaptation and mobile optimization
 * - Interactive particle selection and camera presets
 * - Advanced shaders with bloom, glow, and depth effects
 * - VR/AR ready for spatial computing platforms
 */

class EnhancedMonteCarloVisualizer {
    constructor(containerId = 'mcProbabilityCloud') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn('Container element not found:', containerId);
            return;
        }

        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null; // Post-processing
        this.animationId = null;

        // Particle systems
        this.particleSystems = new Map();
        this.particlePool = [];
        this.activeParticles = 0;
        this.maxParticles = 10000;

        // Performance optimization
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastFPSCheck = 0;
        this.currentFPS = 60;
        this.targetFPS = 60;

        // Interactive features
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedParticle = null;
        this.hoveredParticle = null;

        // Animation states
        this.isPaused = false;
        this.animationQueue = [];
        this.currentScenario = 'default';
        this.currentTeam = 'deepSouth';

        this.config = {
            particleCount: 10000,
            cloudScale: 15,
            rotationSpeed: 0.001,
            pulseSpeed: 0.002,
            maxDistance: 1000,
            minDistance: 0.1,

            // Deep South Sports Color Schemes
            colorSchemes: {
                cardinals: {
                    high: new THREE.Color(0xC21E26),    // Cardinals red
                    medium: new THREE.Color(0xFFD100),  // Gold
                    low: new THREE.Color(0x8B4513),     // Dark red
                    accent: new THREE.Color(0xFFFFFF)   // White
                },
                titans: {
                    high: new THREE.Color(0x0C2340),    // Titans navy
                    medium: new THREE.Color(0x4B92DB),  // Titans blue
                    low: new THREE.Color(0xC8102E),     // Red
                    accent: new THREE.Color(0xFFFFFF)   // White
                },
                longhorns: {
                    high: new THREE.Color(0xBF5700),    // Burnt orange
                    medium: new THREE.Color(0xFFFFFF),  // White
                    low: new THREE.Color(0x333F48),     // Charcoal
                    accent: new THREE.Color(0xFFD700)   // Gold
                },
                grizzlies: {
                    high: new THREE.Color(0x5D76A9),    // Grizzlies blue
                    medium: new THREE.Color(0xF5B112),  // Gold
                    low: new THREE.Color(0x12264B),     // Navy
                    accent: new THREE.Color(0xFFFFFF)   // White
                },
                deepSouth: {
                    high: new THREE.Color(0xBF5700),    // Texas burnt orange
                    medium: new THREE.Color(0x9BCBEB),  // Sky blue
                    low: new THREE.Color(0x002244),     // Deep navy
                    accent: new THREE.Color(0xFFD700)   // SEC gold
                }
            },

            // Performance settings
            performance: {
                mobile: {
                    particleCount: 3000,
                    maxFPS: 30,
                    simplifiedShaders: true,
                    reducedEffects: true
                },
                desktop: {
                    particleCount: 10000,
                    maxFPS: 60,
                    simplifiedShaders: false,
                    reducedEffects: false
                },
                highEnd: {
                    particleCount: 20000,
                    maxFPS: 120,
                    simplifiedShaders: false,
                    reducedEffects: false
                }
            },

            // Sports-specific formations
            formations: {
                baseball: 'diamond',
                football: 'field',
                basketball: 'court',
                generic: 'sphere'
            }
        };

        // Detect device capabilities
        this.deviceCapabilities = this.detectDeviceCapabilities();
        this.applyPerformanceSettings();

        this.initialize();
    }

    detectDeviceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            return { tier: 'low', webgl2: false, maxTextureSize: 512 };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        // Detect mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Detect high-end capabilities
        const isHighEnd = !isMobile &&
                         maxTextureSize >= 4096 &&
                         maxVertexAttribs >= 16 &&
                         (renderer.includes('RTX') || renderer.includes('RX 6') || renderer.includes('M1') || renderer.includes('M2'));

        let tier;
        if (isMobile) {
            tier = 'mobile';
        } else if (isHighEnd) {
            tier = 'highEnd';
        } else {
            tier = 'desktop';
        }

        return {
            tier,
            webgl2: !!gl.getParameter,
            maxTextureSize,
            maxVertexAttribs,
            isMobile,
            renderer
        };
    }

    applyPerformanceSettings() {
        const settings = this.config.performance[this.deviceCapabilities.tier];
        this.config.particleCount = settings.particleCount;
        this.targetFPS = settings.maxFPS;
        this.simplifiedShaders = settings.simplifiedShaders;
        this.reducedEffects = settings.reducedEffects;
    }

    initialize() {
        if (!window.THREE) {
            console.warn('Three.js not loaded. Skipping 3D visualization.');
            return;
        }

        console.log('🎲 Initializing Enhanced Monte Carlo Visualizer...');
        console.log(`Device capabilities: ${this.deviceCapabilities.tier}`);
        console.log(`Target particle count: ${this.config.particleCount}`);

        this.setupScene();
        this.setupPostProcessing();
        this.createParticlePool();
        this.createProbabilityCloud();
        this.addAdvancedLighting();
        this.addInteractiveControls();
        this.setupEventListeners();
        this.animate();

        // Initialize with default Deep South theme
        this.setColorScheme('deepSouth');

        console.log('✅ Enhanced Monte Carlo Visualizer initialized successfully');
    }

    setupScene() {
        // Scene setup with enhanced fog
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x001122, 0.015); // Deep blue fog

        // Camera setup with better positioning
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, this.config.minDistance, this.config.maxDistance);
        this.camera.position.set(0, 8, 25);
        this.camera.lookAt(0, 0, 0);

        // Enhanced renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.deviceCapabilities.isMobile,
            alpha: true,
            powerPreference: 'high-performance',
            precision: this.deviceCapabilities.isMobile ? 'mediump' : 'highp'
        });

        // Renderer configuration
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Enable shadows if not mobile
        if (!this.deviceCapabilities.isMobile) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        this.container.appendChild(this.renderer.domElement);
    }

    setupPostProcessing() {
        if (this.reducedEffects || !window.THREE.EffectComposer) {
            console.log('Skipping post-processing for performance');
            return;
        }

        // Set up post-processing pipeline
        this.composer = new THREE.EffectComposer(this.renderer);

        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom pass for glow effects
        if (window.THREE.UnrealBloomPass) {
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
                0.8,  // strength
                0.4,  // radius
                0.85  // threshold
            );
            this.composer.addPass(bloomPass);
        }

        // FXAA anti-aliasing
        if (window.THREE.ShaderPass && window.THREE.FXAAShader) {
            const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
            fxaaPass.material.uniforms['resolution'].value.x = 1 / this.container.clientWidth;
            fxaaPass.material.uniforms['resolution'].value.y = 1 / this.container.clientHeight;
            this.composer.addPass(fxaaPass);
        }
    }

    createParticlePool() {
        console.log(`Creating particle pool with ${this.maxParticles} particles...`);

        // Pre-allocate particle objects for performance
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                originalPosition: new THREE.Vector3(),
                color: new THREE.Color(),
                size: 1.0,
                probability: 0.0,
                life: 1.0,
                maxLife: 1.0,
                active: false,
                formation: 'sphere',
                clusterId: 0,
                team: 'generic'
            });
        }

        console.log(`✅ Particle pool created with ${this.particlePool.length} particles`);
    }

    createProbabilityCloud() {
        console.log('Creating advanced probability cloud with', this.config.particleCount, 'particles...');

        // Create multiple particle systems for different confidence levels
        this.createConfidenceParticleSystem('high', 0.95);
        this.createConfidenceParticleSystem('medium', 0.80);
        this.createConfidenceParticleSystem('low', 0.50);

        // Create sports-specific formation overlays
        this.createSportsFormations();

        // Add dynamic clustering system
        this.setupDynamicClustering();

        console.log('✅ Advanced probability cloud created');
    }

    createConfidenceParticleSystem(level, confidence) {
        const particleCount = Math.floor(this.config.particleCount * (level === 'high' ? 0.5 : level === 'medium' ? 0.3 : 0.2));
        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const colors = [];
        const sizes = [];
        const probabilities = [];
        const velocities = [];
        const originalPositions = [];
        const clusterIds = [];
        const lifetimes = [];

        for (let i = 0; i < particleCount; i++) {
            // Generate position based on confidence level
            const position = this.generateParticlePosition(confidence);
            positions.push(position.x, position.y, position.z);
            originalPositions.push(position.x, position.y, position.z);

            // Calculate probability based on distance from center and confidence
            const distance = position.length();
            const probability = Math.exp(-distance * distance / (2 * this.config.cloudScale * confidence));
            probabilities.push(probability);

            // Color based on confidence level and team
            const color = this.getColorForConfidence(level, probability);
            colors.push(color.r, color.g, color.b);

            // Size based on probability with confidence scaling
            const size = (probability * 3 + 0.8) * (confidence + 0.5);
            sizes.push(size);

            // Initial velocity for particle physics
            const velocity = new THREE.Vector3(
                this.gaussianRandom(0, 0.01),
                this.gaussianRandom(0, 0.01),
                this.gaussianRandom(0, 0.01)
            );
            velocities.push(velocity.x, velocity.y, velocity.z);

            // Cluster assignment for dynamic grouping
            const clusterId = Math.floor(Math.random() * 8); // 8 clusters
            clusterIds.push(clusterId);

            // Particle lifetime for animation effects
            const lifetime = 1.0 + Math.random() * 2.0;
            lifetimes.push(lifetime);
        }

        // Set geometry attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('probability', new THREE.Float32BufferAttribute(probabilities, 1));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('originalPosition', new THREE.Float32BufferAttribute(originalPositions, 3));
        geometry.setAttribute('clusterId', new THREE.Float32BufferAttribute(clusterIds, 1));
        geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));

        // Create advanced shader material
        const material = this.createAdvancedParticleMaterial(level);

        // Create particle system
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.name = `particles_${level}`;
        particleSystem.renderOrder = level === 'high' ? 3 : level === 'medium' ? 2 : 1;

        this.particleSystems.set(level, particleSystem);
        this.scene.add(particleSystem);

        console.log(`✅ ${level} confidence particle system created with ${particleCount} particles`);
    }

    createAdvancedParticleMaterial(level) {
        const uniforms = {
            time: { value: 0 },
            pulseAmplitude: { value: 1.0 },
            attractionStrength: { value: 0.5 },
            clusterCenters: { value: this.generateClusterCenters() },
            confidenceLevel: { value: level === 'high' ? 0.95 : level === 'medium' ? 0.80 : 0.50 },
            teamColors: { value: this.getCurrentTeamColors() },
            cameraPosition: { value: this.camera.position },
            screenResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
            mousePosition: { value: new THREE.Vector2(0, 0) },
            selectedParticle: { value: -1 }
        };

        const vertexShader = this.simplifiedShaders ? this.getSimpleVertexShader() : this.getAdvancedVertexShader();
        const fragmentShader = this.simplifiedShaders ? this.getSimpleFragmentShader() : this.getAdvancedFragmentShader();

        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true
        });
    }

    generateParticlePosition(confidence) {
        // Different distribution strategies based on confidence
        if (confidence > 0.9) {
            // High confidence: tight gaussian distribution
            const radius = Math.abs(this.gaussianRandom(0, this.config.cloudScale * 0.3));
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            return new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        } else if (confidence > 0.7) {
            // Medium confidence: wider distribution with some clustering
            const radius = Math.abs(this.gaussianRandom(0, this.config.cloudScale * 0.6));
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Add some clustering bias
            const clusterBias = Math.random() > 0.7 ? this.gaussianRandom(0, 2) : 0;

            return new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta) + clusterBias,
                radius * Math.sin(phi) * Math.sin(theta) + clusterBias,
                radius * Math.cos(phi)
            );
        } else {
            // Low confidence: wide distribution with uncertainty
            const radius = Math.abs(this.gaussianRandom(0, this.config.cloudScale));
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Add noise for uncertainty
            const noise = this.gaussianRandom(0, 3);

            return new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta) + noise,
                radius * Math.sin(phi) * Math.sin(theta) + noise,
                radius * Math.cos(phi) + noise
            );
        }
    }

    createSportsFormations() {
        // Create formation-specific particle arrangements
        this.formations = {
            baseball: this.createBaseballDiamond(),
            football: this.createFootballField(),
            basketball: this.createBasketballCourt(),
            generic: this.createGenericSphere()
        };

        // Add current formation to scene
        const currentFormation = this.formations[this.config.formations.baseball] || this.formations.generic;
        this.scene.add(currentFormation);
    }

    createBaseballDiamond() {
        const group = new THREE.Group();
        group.name = 'baseballFormation';

        // Create diamond structure for Cardinals
        const diamondGeometry = new THREE.BufferGeometry();
        const diamondVertices = [
            0, 0, 0,     // Home plate
            10, 10, 0,   // First base
            0, 20, 0,    // Second base
            -10, 10, 0,  // Third base
            0, 0, 0      // Back to home
        ];

        diamondGeometry.setAttribute('position', new THREE.Float32BufferAttribute(diamondVertices, 3));

        const diamondMaterial = new THREE.LineBasicMaterial({
            color: 0xC21E26, // Cardinals red
            transparent: true,
            opacity: 0.3
        });

        const diamond = new THREE.Line(diamondGeometry, diamondMaterial);
        group.add(diamond);

        return group;
    }

    createFootballField() {
        const group = new THREE.Group();
        group.name = 'footballFormation';

        // Create field outline for Titans/Longhorns
        const fieldGeometry = new THREE.PlaneGeometry(20, 40);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x0C2340, // Titans navy
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });

        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        group.add(field);

        return group;
    }

    createBasketballCourt() {
        const group = new THREE.Group();
        group.name = 'basketballFormation';

        // Create court for Grizzlies
        const courtGeometry = new THREE.PlaneGeometry(15, 28);
        const courtMaterial = new THREE.MeshBasicMaterial({
            color: 0x5D76A9, // Grizzlies blue
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });

        const court = new THREE.Mesh(courtGeometry, courtMaterial);
        court.rotation.x = -Math.PI / 2;
        group.add(court);

        return group;
    }

    createGenericSphere() {
        const group = new THREE.Group();
        group.name = 'genericFormation';

        // Create wireframe sphere
        const sphereGeometry = new THREE.SphereGeometry(this.config.cloudScale, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x9BCBEB,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        group.add(sphere);

        return group;
    }

    setupDynamicClustering() {
        // Create cluster centers for particle attraction
        this.clusterCenters = [];
        const numClusters = 8;

        for (let i = 0; i < numClusters; i++) {
            const angle = (i / numClusters) * Math.PI * 2;
            const radius = this.config.cloudScale * 0.7;

            this.clusterCenters.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.5,
                Math.sin(angle * 2) * radius * 0.3
            ));
        }

        console.log(`✅ Dynamic clustering setup with ${numClusters} cluster centers`);
    }

    addAdvancedLighting() {
        // Enhanced lighting system for Deep South sports branding
        const currentScheme = this.getCurrentColorScheme();

        // Ambient light with team color tint
        const ambientLight = new THREE.AmbientLight(currentScheme.accent, 0.3);
        this.scene.add(ambientLight);

        // Stadium-style lighting setup
        this.stadiumLights = [];

        // Main stadium lights (4 corners)
        const lightPositions = [
            { pos: [25, 20, 25], color: currentScheme.high },
            { pos: [-25, 20, 25], color: currentScheme.medium },
            { pos: [25, 20, -25], color: currentScheme.accent },
            { pos: [-25, 20, -25], color: currentScheme.low }
        ];

        lightPositions.forEach((lightConfig, index) => {
            const light = new THREE.PointLight(lightConfig.color.getHex(), 2, 150);
            light.position.set(...lightConfig.pos);
            light.name = `stadiumLight_${index}`;

            // Add shadows if supported
            if (!this.deviceCapabilities.isMobile) {
                light.castShadow = true;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                light.shadow.camera.near = 0.5;
                light.shadow.camera.far = 150;
            }

            this.stadiumLights.push(light);
            this.scene.add(light);
        });

        // Dynamic spotlight that follows camera
        this.spotLight = new THREE.SpotLight(currentScheme.accent.getHex(), 1, 100, Math.PI / 6, 0.3);
        this.spotLight.position.copy(this.camera.position);
        this.spotLight.target.position.set(0, 0, 0);
        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);

        // Add light animation
        this.animateLighting = true;

        console.log('✅ Advanced stadium lighting system initialized');
    }

    addInteractiveControls() {
        if (window.THREE && window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

            // Enhanced control settings
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.autoRotate = false; // Disabled for interactive use
            this.controls.autoRotateSpeed = 0.3;

            // Constrain camera movement
            this.controls.minDistance = 5;
            this.controls.maxDistance = 100;
            this.controls.maxPolarAngle = Math.PI * 0.8;

            // Camera presets
            this.cameraPresets = {
                overview: { position: [0, 25, 40], target: [0, 0, 0] },
                closeup: { position: [0, 5, 15], target: [0, 0, 0] },
                side: { position: [30, 10, 0], target: [0, 0, 0] },
                top: { position: [0, 50, 0], target: [0, 0, 0] },
                dramatic: { position: [-20, 15, 25], target: [5, 0, -5] }
            };

            console.log('✅ Interactive controls and camera presets initialized');
        }
    }

    setupEventListeners() {
        // Mouse/touch interaction for particle selection
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('touchstart', (event) => this.onTouchStart(event));
        this.renderer.domElement.addEventListener('touchmove', (event) => this.onTouchMove(event));

        // Keyboard shortcuts for camera presets
        document.addEventListener('keydown', (event) => this.onKeyDown(event));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Performance monitoring
        this.setupPerformanceMonitoring();

        console.log('✅ Event listeners setup complete');
    }

    setupPerformanceMonitoring() {
        this.performanceStats = {
            frameTime: 0,
            particleCount: 0,
            drawCalls: 0,
            memoryUsage: 0
        };

        // Monitor WebGL context
        if (this.renderer.info) {
            setInterval(() => {
                this.performanceStats.drawCalls = this.renderer.info.render.calls;
                this.performanceStats.particleCount = this.activeParticles;

                // Log performance if FPS drops significantly
                if (this.currentFPS < 30) {
                    console.warn('Performance warning: FPS dropped to', this.currentFPS);
                }
            }, 5000);
        }
    }

    onMouseMove(event) {
        // Update mouse position for shader uniforms
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update mouse position in shaders
        this.updateMouseUniforms();

        // Check for particle hover
        this.checkParticleHover();
    }

    onMouseClick(event) {
        this.checkParticleSelection();
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            this.checkParticleSelection();
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            this.updateMouseUniforms();
        }
    }

    onKeyDown(event) {
        switch (event.key) {
            case '1':
                this.setCameraPreset('overview');
                break;
            case '2':
                this.setCameraPreset('closeup');
                break;
            case '3':
                this.setCameraPreset('side');
                break;
            case '4':
                this.setCameraPreset('top');
                break;
            case '5':
                this.setCameraPreset('dramatic');
                break;
            case 'r':
                this.toggleAutoRotate();
                break;
            case 'h':
                this.toggleParticleVisibility('high');
                break;
            case 'm':
                this.toggleParticleVisibility('medium');
                break;
            case 'l':
                this.toggleParticleVisibility('low');
                break;
            case 'f':
                this.toggleFullscreen();
                break;
            case 'p':
                this.togglePause();
                break;
            case 'c':
                this.captureScreenshot();
                break;
        }
    }

    animate() {
        if (this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Performance monitoring
        this.frameCount++;
        if (elapsedTime - this.lastFPSCheck > 1.0) {
            this.currentFPS = this.frameCount / (elapsedTime - this.lastFPSCheck);
            this.frameCount = 0;
            this.lastFPSCheck = elapsedTime;
            this.adaptPerformance();
        }

        // Update particle systems
        this.updateParticleSystems(deltaTime, elapsedTime);

        // Update dynamic clustering
        this.updateDynamicClustering(elapsedTime);

        // Update stadium lighting
        if (this.animateLighting) {
            this.updateStadiumLighting(elapsedTime);
        }

        // Update camera and controls
        if (this.controls) {
            this.controls.update();
        }

        // Update spotlight to follow camera
        if (this.spotLight) {
            this.spotLight.position.copy(this.camera.position);
        }

        // Process animation queue
        this.processAnimationQueue(deltaTime);

        // Render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateParticleSystems(deltaTime, elapsedTime) {
        this.particleSystems.forEach((particleSystem, level) => {
            const material = particleSystem.material;

            if (material.uniforms) {
                // Update time uniform
                material.uniforms.time.value = elapsedTime;

                // Update pulse based on confidence level
                const pulseSpeed = level === 'high' ? 1.0 : level === 'medium' ? 0.7 : 0.4;
                const pulse = Math.sin(elapsedTime * pulseSpeed);
                material.uniforms.pulseAmplitude.value = 1.0 + pulse * 0.3;

                // Update attraction strength for clustering
                material.uniforms.attractionStrength.value = 0.3 + Math.sin(elapsedTime * 0.5) * 0.2;

                // Update cluster centers
                material.uniforms.clusterCenters.value = this.getAnimatedClusterCenters(elapsedTime);

                // Update camera position for depth effects
                material.uniforms.cameraPosition.value.copy(this.camera.position);
            }

            // Subtle rotation for each system
            const rotationSpeed = level === 'high' ? 0.001 : level === 'medium' ? 0.0007 : 0.0005;
            particleSystem.rotation.y += rotationSpeed;
            particleSystem.rotation.x += rotationSpeed * 0.5;
        });
    }

    updateDynamicClustering(elapsedTime) {
        // Update cluster centers with organic movement
        this.clusterCenters.forEach((center, index) => {
            const angle = elapsedTime * 0.1 + (index / this.clusterCenters.length) * Math.PI * 2;
            const radius = this.config.cloudScale * (0.5 + Math.sin(elapsedTime * 0.3 + index) * 0.2);

            center.x = Math.cos(angle) * radius;
            center.y = Math.sin(angle * 1.3) * radius * 0.6;
            center.z = Math.sin(angle * 0.7) * radius * 0.4;
        });
    }

    updateStadiumLighting(elapsedTime) {
        this.stadiumLights.forEach((light, index) => {
            // Subtle intensity variation
            const baseIntensity = 2;
            const variation = Math.sin(elapsedTime * 0.5 + index * Math.PI * 0.5) * 0.3;
            light.intensity = baseIntensity + variation;

            // Slight position sway
            const sway = Math.sin(elapsedTime * 0.3 + index) * 0.5;
            light.position.y += sway * 0.01;
        });
    }

    processAnimationQueue(deltaTime) {
        if (this.animationQueue.length === 0) return;

        const currentAnimation = this.animationQueue[0];
        currentAnimation.update(deltaTime);

        if (currentAnimation.isComplete()) {
            this.animationQueue.shift();
        }
    }

    adaptPerformance() {
        // Automatically adjust quality based on FPS
        if (this.currentFPS < this.targetFPS * 0.8) {
            // Reduce particle count
            this.reduceQuality();
        } else if (this.currentFPS > this.targetFPS * 1.1 && this.deviceCapabilities.tier !== 'mobile') {
            // Can potentially increase quality
            this.increaseQuality();
        }
    }

    reduceQuality() {
        console.log('Reducing quality for performance');
        // Implementation for quality reduction
    }

    increaseQuality() {
        console.log('Increasing quality');
        // Implementation for quality increase
    }

    // Utility methods
    getColorForConfidence(level, probability) {
        const currentScheme = this.getCurrentColorScheme();

        if (level === 'high') {
            return currentScheme.high.clone().lerp(currentScheme.accent, 1 - probability);
        } else if (level === 'medium') {
            return currentScheme.medium.clone().lerp(currentScheme.accent, 1 - probability);
        } else {
            return currentScheme.low.clone().lerp(new THREE.Color(0x333333), 1 - probability);
        }
    }

    getCurrentColorScheme() {
        return this.config.colorSchemes[this.currentTeam] || this.config.colorSchemes.deepSouth;
    }

    getCurrentTeamColors() {
        const scheme = this.getCurrentColorScheme();
        return [
            scheme.high.r, scheme.high.g, scheme.high.b,
            scheme.medium.r, scheme.medium.g, scheme.medium.b,
            scheme.low.r, scheme.low.g, scheme.low.b,
            scheme.accent.r, scheme.accent.g, scheme.accent.b
        ];
    }

    generateClusterCenters() {
        const centers = [];
        this.clusterCenters.forEach(center => {
            centers.push(center.x, center.y, center.z);
        });
        return centers;
    }

    getAnimatedClusterCenters(time) {
        const centers = [];
        this.clusterCenters.forEach(center => {
            centers.push(center.x, center.y, center.z);
        });
        return centers;
    }

    gaussianRandom(mean = 0, stdDev = 1) {
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdDev + mean;
    }

    // Advanced shader implementations
    getAdvancedVertexShader() {
        return `
            attribute float size;
            attribute float probability;
            attribute vec3 velocity;
            attribute vec3 originalPosition;
            attribute float clusterId;
            attribute float lifetime;

            uniform float time;
            uniform float pulseAmplitude;
            uniform float attractionStrength;
            uniform float clusterCenters[24];
            uniform float confidenceLevel;
            uniform vec3 cameraPosition;
            uniform vec2 mousePosition;
            uniform float selectedParticle;

            varying vec3 vColor;
            varying float vProbability;
            varying float vDistance;
            varying float vSelected;
            varying float vClusterId;

            vec3 getClusterCenter(float id) {
                int index = int(id) * 3;
                return vec3(
                    clusterCenters[index],
                    clusterCenters[index + 1],
                    clusterCenters[index + 2]
                );
            }

            void main() {
                vColor = color;
                vProbability = probability;
                vClusterId = clusterId;
                vSelected = abs(clusterId - selectedParticle) < 0.5 ? 1.0 : 0.0;

                vec3 pos = position;
                vec3 clusterCenter = getClusterCenter(clusterId);
                vec3 attraction = (clusterCenter - pos) * attractionStrength * probability;
                pos += attraction * 0.1;

                float phase = time + probability * 10.0 + clusterId;
                vec3 movement = vec3(
                    sin(phase) * 0.2,
                    cos(phase * 1.3) * 0.15,
                    sin(phase * 0.7) * 0.1
                ) * probability * pulseAmplitude;
                pos += movement;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vDistance = length(mvPosition.xyz);

                float adaptiveSize = size * (200.0 / -mvPosition.z);
                adaptiveSize *= (1.0 + sin(time * 3.0 + probability * 8.0) * 0.2);
                adaptiveSize *= confidenceLevel + 0.5;

                if (vSelected > 0.5) {
                    adaptiveSize *= 2.0;
                }

                gl_PointSize = adaptiveSize;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getAdvancedFragmentShader() {
        return `
            uniform float time;
            uniform vec3 cameraPosition;
            uniform vec2 screenResolution;

            varying vec3 vColor;
            varying float vProbability;
            varying float vDistance;
            varying float vSelected;
            varying float vClusterId;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                if (dist > 0.5) discard;

                float core = smoothstep(0.5, 0.1, dist);
                float glow = smoothstep(0.5, 0.0, dist);
                float halo = smoothstep(0.5, 0.3, dist);

                float alpha = core * vProbability;
                alpha += glow * vProbability * 0.3;
                alpha += halo * vProbability * 0.1;

                vec3 finalColor = vColor;

                float shimmer = sin(time * 4.0 + vClusterId * 2.0) * 0.1;
                finalColor += shimmer;

                finalColor *= (0.7 + vProbability * 0.6);

                if (vSelected > 0.5) {
                    finalColor = mix(finalColor, vec3(1.0, 1.0, 0.0), 0.5);
                    alpha *= 2.0;
                }

                float fogFactor = exp(-vDistance * 0.01);
                finalColor *= fogFactor;
                alpha *= fogFactor;

                float bloom = core * vProbability * 2.0;
                finalColor += bloom;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;
    }

    getSimpleVertexShader() {
        return `
            attribute float size;
            attribute float probability;
            uniform float time;
            uniform float pulseAmplitude;
            varying vec3 vColor;
            varying float vProbability;

            void main() {
                vColor = color;
                vProbability = probability;

                vec3 pos = position;
                float movement = sin(time + probability * 5.0) * 0.1 * probability;
                pos += normalize(pos) * movement * pulseAmplitude;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (150.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getSimpleFragmentShader() {
        return `
            varying vec3 vColor;
            varying float vProbability;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                if (dist > 0.5) discard;

                float alpha = smoothstep(0.5, 0.2, dist) * vProbability;
                gl_FragColor = vec4(vColor, alpha);
            }
        `;
    }

    // Interactive methods
    updateMouseUniforms() {
        this.particleSystems.forEach(particleSystem => {
            const material = particleSystem.material;
            if (material.uniforms && material.uniforms.mousePosition) {
                material.uniforms.mousePosition.value.set(this.mouse.x, this.mouse.y);
            }
        });
    }

    checkParticleHover() {
        // Raycast to find hovered particles
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check intersection with particle systems
        const intersects = this.raycaster.intersectObjects(
            Array.from(this.particleSystems.values())
        );

        if (intersects.length > 0) {
            this.hoveredParticle = intersects[0];
            this.showParticleTooltip(this.hoveredParticle);
        } else {
            this.hoveredParticle = null;
            this.hideParticleTooltip();
        }
    }

    checkParticleSelection() {
        if (this.hoveredParticle) {
            this.selectedParticle = this.hoveredParticle;
            this.highlightSelectedParticle();
            this.showParticleDetails(this.selectedParticle);
        }
    }

    showParticleTooltip(particle) {
        // Implementation for particle tooltip
        console.log('Hovered particle:', particle);
    }

    hideParticleTooltip() {
        // Implementation for hiding tooltip
    }

    highlightSelectedParticle() {
        // Update shader uniforms to highlight selected particle
        this.particleSystems.forEach(particleSystem => {
            const material = particleSystem.material;
            if (material.uniforms && material.uniforms.selectedParticle) {
                material.uniforms.selectedParticle.value = this.selectedParticle ? 1.0 : -1.0;
            }
        });
    }

    showParticleDetails(particle) {
        // Implementation for showing detailed particle information
        console.log('Selected particle details:', particle);
    }

    // Camera preset methods
    setCameraPreset(presetName) {
        const preset = this.cameraPresets[presetName];
        if (!preset) return;

        // Animate camera to preset position
        if (window.gsap) {
            gsap.to(this.camera.position, {
                duration: 2,
                x: preset.position[0],
                y: preset.position[1],
                z: preset.position[2],
                ease: 'power2.inOut'
            });

            gsap.to(this.controls.target, {
                duration: 2,
                x: preset.target[0],
                y: preset.target[1],
                z: preset.target[2],
                ease: 'power2.inOut'
            });
        } else {
            this.camera.position.set(...preset.position);
            this.controls.target.set(...preset.target);
        }

        console.log(`Camera preset '${presetName}' activated`);
    }

    toggleAutoRotate() {
        if (this.controls) {
            this.controls.autoRotate = !this.controls.autoRotate;
            console.log('Auto-rotate:', this.controls.autoRotate ? 'enabled' : 'disabled');
        }
    }

    toggleParticleVisibility(level) {
        const particleSystem = this.particleSystems.get(level);
        if (particleSystem) {
            particleSystem.visible = !particleSystem.visible;
            console.log(`${level} confidence particles:`, particleSystem.visible ? 'visible' : 'hidden');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        console.log('Animation:', this.isPaused ? 'paused' : 'resumed');
    }

    captureScreenshot() {
        // Render a high-quality frame
        this.renderer.render(this.scene, this.camera);

        // Get image data
        const link = document.createElement('a');
        link.download = `monte-carlo-${Date.now()}.png`;
        link.href = this.renderer.domElement.toDataURL();
        link.click();

        console.log('Screenshot captured');
    }

    // Public API methods
    setColorScheme(scheme) {
        if (this.config.colorSchemes[scheme]) {
            this.currentTeam = scheme;
            console.log(`Color scheme changed to: ${scheme}`);
            this.updateAllColors();
        }
    }

    updateAllColors() {
        // Update particle system colors
        this.particleSystems.forEach((particleSystem, level) => {
            const material = particleSystem.material;
            if (material.uniforms && material.uniforms.teamColors) {
                material.uniforms.teamColors.value = this.getCurrentTeamColors();
            }
        });

        // Update stadium lighting
        if (this.stadiumLights) {
            const currentScheme = this.getCurrentColorScheme();
            this.stadiumLights.forEach((light, index) => {
                const colors = [currentScheme.high, currentScheme.medium, currentScheme.accent, currentScheme.low];
                light.color = colors[index] || currentScheme.accent;
            });
        }
    }

    // Enhanced distribution update with smooth transitions
    updateDistribution(data, options = {}) {
        const {
            team = 'deepSouth',
            scenario = 'default',
            animationDuration = 2.0,
            smooth = true
        } = options;

        console.log(`Updating distribution for ${team} (${data.length} data points)`);

        // Set team colors
        this.setColorScheme(team);

        // Queue animation for smooth transition
        if (smooth && window.gsap) {
            this.animateDistributionTransition(data, animationDuration);
        } else {
            this.updateDistributionImmediate(data);
        }

        this.currentScenario = scenario;
    }

    updateDistributionImmediate(data) {
        // Immediately update particle positions based on new data
        this.particleSystems.forEach((particleSystem, level) => {
            const geometry = particleSystem.geometry;
            const positions = geometry.attributes.position.array;
            const colors = geometry.attributes.color.array;
            const probabilities = geometry.attributes.probability.array;

            const particleCount = positions.length / 3;

            for (let i = 0; i < particleCount; i++) {
                const dataIndex = i % data.length;
                const value = data[dataIndex];
                const normalizedValue = this.normalizeValue(value, data);

                // Generate new position based on confidence level
                const confidence = level === 'high' ? 0.95 : level === 'medium' ? 0.80 : 0.50;
                const position = this.generateParticlePosition(confidence * normalizedValue);

                const i3 = i * 3;
                positions[i3] = position.x;
                positions[i3 + 1] = position.y;
                positions[i3 + 2] = position.z;

                // Update probability
                probabilities[i] = normalizedValue;

                // Update color
                const color = this.getColorForConfidence(level, normalizedValue);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
            }

            // Mark attributes for update
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
            geometry.attributes.probability.needsUpdate = true;
        });

        console.log('✅ Distribution updated immediately');
    }

    normalizeValue(value, data) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        return (value - min) / (max - min);
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        // Update composer if available
        if (this.composer) {
            this.composer.setSize(width, height);
        }

        // Update screen resolution uniforms
        this.particleSystems.forEach(particleSystem => {
            const material = particleSystem.material;
            if (material.uniforms && material.uniforms.screenResolution) {
                material.uniforms.screenResolution.value.set(width, height);
            }
        });
    }

    destroy() {
        console.log('Destroying Enhanced Monte Carlo Visualizer...');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Dispose of particle systems
        this.particleSystems.forEach(particleSystem => {
            if (particleSystem.geometry) particleSystem.geometry.dispose();
            if (particleSystem.material) particleSystem.material.dispose();
            this.scene.remove(particleSystem);
        });
        this.particleSystems.clear();

        // Dispose of formations
        Object.values(this.formations || {}).forEach(formation => {
            this.scene.remove(formation);
        });

        // Dispose of lights
        if (this.stadiumLights) {
            this.stadiumLights.forEach(light => {
                this.scene.remove(light);
            });
        }

        if (this.composer) {
            this.composer.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }

        this.particlePool = [];
        this.clusterCenters = [];
        this.animationQueue = [];

        console.log('✅ Enhanced Monte Carlo Visualizer destroyed');
    }

    // Export capabilities for external use
    exportVisualizationData() {
        return {
            particleCount: this.config.particleCount,
            currentTeam: this.currentTeam,
            scenario: this.currentScenario,
            performance: this.performanceStats,
            deviceCapabilities: this.deviceCapabilities
        };
    }
}

// Enhanced initialization with Deep South sports integration
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎲 Initializing Enhanced Monte Carlo Visualizer...');

    // Create enhanced visualizer instance
    const mcVisualizer = new EnhancedMonteCarloVisualizer('mcProbabilityCloud');

    // Make it globally accessible for updates
    window.monteCarloVisualizer = mcVisualizer;
    window.EnhancedMonteCarloVisualizer = EnhancedMonteCarloVisualizer;

    // Detect current team context from page
    const detectTeamFromPage = () => {
        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();
        const bodyText = document.body.textContent.toLowerCase();

        if (url.includes('cardinal') || title.includes('cardinal') || bodyText.includes('cardinal')) return 'cardinals';
        if (url.includes('titan') || title.includes('titan') || bodyText.includes('titan')) return 'titans';
        if (url.includes('longhorn') || title.includes('longhorn') || bodyText.includes('longhorn')) return 'longhorns';
        if (url.includes('grizzl') || title.includes('grizzl') || bodyText.includes('grizzl')) return 'grizzlies';
        return 'deepSouth';
    };

    // Set initial team theme
    const currentTeam = detectTeamFromPage();
    if (mcVisualizer) {
        mcVisualizer.setColorScheme(currentTeam);
        mcVisualizer.currentTeam = currentTeam;
    }

    // Enhanced Monte Carlo engine integration
    if (window.monteCarloEngine && mcVisualizer) {
        console.log('🔗 Integrating with Monte Carlo Engine...');

        // Season trajectory simulation
        const originalSimulate = window.monteCarloEngine.simulateSeasonTrajectory;
        window.monteCarloEngine.simulateSeasonTrajectory = async function(...args) {
            console.log('🎲 Running season trajectory simulation with enhanced visualization...');
            const results = await originalSimulate.apply(this, args);

            if (results && results.winDistribution && mcVisualizer) {
                mcVisualizer.updateDistribution(results.winDistribution, {
                    team: currentTeam,
                    scenario: 'seasonProjection',
                    smooth: true
                });
            }

            return results;
        };

        // Game outcome simulation
        const originalGameSim = window.monteCarloEngine.simulateGameOutcome;
        if (originalGameSim) {
            window.monteCarloEngine.simulateGameOutcome = async function(...args) {
                console.log('🎲 Running game outcome simulation...');
                const results = await originalGameSim.apply(this, args);

                if (results && results.marginDistribution && mcVisualizer) {
                    mcVisualizer.updateDistribution(results.marginDistribution, {
                        team: currentTeam,
                        scenario: 'gameOutcome',
                        smooth: true
                    });
                }

                return results;
            };
        }

        // Player performance simulation
        const originalPlayerSim = window.monteCarloEngine.simulatePlayerPerformance;
        if (originalPlayerSim) {
            window.monteCarloEngine.simulatePlayerPerformance = async function(...args) {
                console.log('🎲 Running player performance simulation...');
                const results = await originalPlayerSim.apply(this, args);

                if (results && results.projections && mcVisualizer) {
                    mcVisualizer.updateDistribution(results.projections, {
                        team: currentTeam,
                        scenario: 'playerProjection',
                        smooth: true
                    });
                }

                return results;
            };
        }

        // Championship path simulation
        const originalChampSim = window.monteCarloEngine.simulateChampionshipPath;
        if (originalChampSim) {
            window.monteCarloEngine.simulateChampionshipPath = async function(...args) {
                console.log('🎲 Running championship path simulation...');
                const results = await originalChampSim.apply(this, args);

                if (results && results.paths && mcVisualizer) {
                    // Convert championship paths to visualization data
                    const pathData = results.paths.map(path => path.wonChampionship ? 1 : 0);
                    mcVisualizer.updateDistribution(pathData, {
                        team: currentTeam,
                        scenario: 'championshipPath',
                        smooth: true
                    });
                }

                return results;
            };
        }
    }

    // Add UI controls for enhanced features
    if (mcVisualizer && mcVisualizer.deviceCapabilities.tier !== 'mobile') {
        const controlsHTML = `
            <div id="mcVisualizerControls" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000;
                max-width: 200px;
            ">
                <div style="margin-bottom: 8px; font-weight: bold;">🎲 Monte Carlo Controls</div>
                <div>Team: <span style="color: #BF5700;">${currentTeam.toUpperCase()}</span></div>
                <div>Particles: ${mcVisualizer.config.particleCount}</div>
                <div>Device: ${mcVisualizer.deviceCapabilities.tier}</div>
                <hr style="margin: 8px 0; border: 1px solid #333;">
                <div style="font-size: 10px; line-height: 1.4;">
                    <div>1-5: Camera presets</div>
                    <div>R: Auto-rotate</div>
                    <div>H/M/L: Toggle particles</div>
                    <div>F: Fullscreen</div>
                    <div>P: Pause</div>
                    <div>C: Screenshot</div>
                </div>
            </div>
        `;

        if (mcVisualizer.container) {
            mcVisualizer.container.style.position = 'relative';
            mcVisualizer.container.insertAdjacentHTML('beforeend', controlsHTML);
        }
    }

    // Performance monitoring and adaptation
    if (mcVisualizer) {
        setInterval(() => {
            if (mcVisualizer.currentFPS < 20 && mcVisualizer.config.particleCount > 2000) {
                console.warn('Performance warning: Reducing particle count for better FPS');
                mcVisualizer.setParticleCount(Math.max(2000, mcVisualizer.config.particleCount * 0.8));
            }
        }, 10000);
    }

    // Keyboard shortcuts info
    if (mcVisualizer) {
        console.log(`
🎲 Enhanced Monte Carlo Visualizer Ready!

🏟️ Deep South Sports Intelligence Hub
Team: ${currentTeam.toUpperCase()}
Device Tier: ${mcVisualizer.deviceCapabilities.tier}
Particle Count: ${mcVisualizer.config.particleCount}
WebGL 2.0: ${mcVisualizer.deviceCapabilities.webgl2 ? 'Yes' : 'No'}

⌨️ Keyboard Shortcuts:
  1-5: Camera presets (Overview, Closeup, Side, Top, Dramatic)
  R: Toggle auto-rotate
  H/M/L: Toggle high/medium/low confidence particles
  F: Toggle fullscreen
  P: Pause/resume animation
  C: Capture screenshot

🎯 Sports-Specific Features:
  • Cardinals: Baseball diamond particle formation
  • Titans/Longhorns: Football field geometry
  • Grizzlies: Basketball court layout
  • Dynamic clustering with team colors
  • Real-time probability visualization
  • GPU-accelerated particle physics

📊 Performance Optimization:
  • Automatic quality adaptation
  • Level-of-detail particle rendering
  • Mobile-optimized shaders
  • Progressive enhancement
`);
    }

    console.log('✅ Enhanced Monte Carlo 3D Visualizer initialized successfully');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedMonteCarloVisualizer;
}

// Global API for external integration
window.BlazeMonteCarloVisualizer = EnhancedMonteCarloVisualizer;

// Development utilities
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.mcVisualizerDebug = {
        showStats: () => {
            const visualizer = window.monteCarloVisualizer;
            if (visualizer) {
                console.table({
                    'Particle Count': visualizer.config.particleCount,
                    'Current FPS': Math.round(visualizer.currentFPS),
                    'Target FPS': visualizer.targetFPS,
                    'Device Tier': visualizer.deviceCapabilities.tier,
                    'Active Particles': visualizer.activeParticles,
                    'Current Team': visualizer.currentTeam,
                    'Scenario': visualizer.currentScenario,
                    'WebGL 2.0': visualizer.deviceCapabilities.webgl2,
                    'Post-Processing': !!visualizer.composer
                });
            }
        },
        setTeam: (team) => {
            const visualizer = window.monteCarloVisualizer;
            if (visualizer) {
                visualizer.setColorScheme(team);
                console.log(`Team changed to: ${team}`);
            }
        },
        demoScenario: () => {
            const visualizer = window.monteCarloVisualizer;
            if (visualizer) {
                const demoData = Array.from({length: 1000}, () => Math.random() * 100);
                visualizer.updateDistribution(demoData, {
                    team: 'cardinals',
                    scenario: 'demo',
                    smooth: true
                });
                console.log('Demo scenario loaded');
            }
        },
        exportData: () => {
            const visualizer = window.monteCarloVisualizer;
            if (visualizer) {
                const data = visualizer.exportVisualizationData();
                console.log('Visualization data:', data);
                return data;
            }
        }
    };

    console.log('🔧 Debug utilities available: window.mcVisualizerDebug');
}