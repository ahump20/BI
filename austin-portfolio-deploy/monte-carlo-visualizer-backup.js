/**
 * 🎲 Monte Carlo 3D Probability Visualizer
 * Advanced Three.js visualizations for probability distributions
 * Enhanced with GPU-accelerated particle systems and Deep South sports branding
 * Integrated with Championship Stadium Engine
 */

class MonteCarloVisualizer {
    constructor(containerId = 'mcProbabilityCloud') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

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
        this.isAnimating = false;
        this.animationQueue = [];
        this.currentScenario = 'default';

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

    createProbabilitySurface() {
        // Create multiple confidence surfaces with team-specific styling
        this.createConfidenceSurfaces();

        // Add dynamic confidence rings
        this.addDynamicConfidenceRings();

        // Create uncertainty visualization
        this.createUncertaintyField();
    }

    createConfidenceSurfaces() {
        const surfaces = [
            { confidence: 0.95, radius: this.config.cloudScale * 0.5, opacity: 0.15 },
            { confidence: 0.80, radius: this.config.cloudScale * 0.7, opacity: 0.10 },
            { confidence: 0.50, radius: this.config.cloudScale * 1.0, opacity: 0.05 }
        ];

        surfaces.forEach((surface, index) => {
            const geometry = new THREE.SphereGeometry(surface.radius, 64, 32);

            // Use current team colors
            const currentScheme = this.getCurrentColorScheme();
            const color = index === 0 ? currentScheme.high :
                         index === 1 ? currentScheme.medium : currentScheme.low;

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: surface.opacity,
                wireframe: true,
                wireframeLinewidth: 2
            });

            const sphere = new THREE.Mesh(geometry, material);
            sphere.name = `confidenceSurface_${surface.confidence}`;
            this.scene.add(sphere);
        });
    }

    createUncertaintyField() {
        // Create a subtle background field to represent uncertainty
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            // Random positions throughout the space
            const x = (Math.random() - 0.5) * this.config.cloudScale * 3;
            const y = (Math.random() - 0.5) * this.config.cloudScale * 3;
            const z = (Math.random() - 0.5) * this.config.cloudScale * 3;

            positions.push(x, y, z);

            // Subtle gray colors
            colors.push(0.2, 0.2, 0.3);
            sizes.push(0.5 + Math.random() * 0.5);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });

        const uncertaintyField = new THREE.Points(geometry, material);
        uncertaintyField.name = 'uncertaintyField';
        this.scene.add(uncertaintyField);
    }

    addConfidenceRings() {
        const ringConfigs = [
            { radius: this.config.cloudScale * 0.5, opacity: 0.3, label: '50%' },
            { radius: this.config.cloudScale * 0.8, opacity: 0.2, label: '80%' },
            { radius: this.config.cloudScale * 0.95, opacity: 0.1, label: '95%' }
        ];

        ringConfigs.forEach(config => {
            const geometry = new THREE.TorusGeometry(config.radius, 0.05, 8, 64);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFD700,
                transparent: true,
                opacity: config.opacity
            });

            // XY plane ring
            const ringXY = new THREE.Mesh(geometry, material);
            this.scene.add(ringXY);

            // XZ plane ring
            const ringXZ = new THREE.Mesh(geometry, material);
            ringXZ.rotation.x = Math.PI / 2;
            this.scene.add(ringXZ);

            // YZ plane ring
            const ringYZ = new THREE.Mesh(geometry, material);
            ringYZ.rotation.y = Math.PI / 2;
            this.scene.add(ringYZ);
        });
    }

    addLighting() {
        // Ambient light for base visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0xBF5700, 1, 100); // Burnt orange
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x9BCBEB, 1, 100); // Cardinal blue
        pointLight2.position.set(-20, -20, -20);
        this.scene.add(pointLight2);
    }

    addControls() {
        if (window.THREE && window.THREE.OrbitControls) {
            const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = true;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
            this.controls = controls;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update time uniform for shader animation
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value += 0.01;

            // Pulse effect
            const pulse = Math.sin(Date.now() * this.config.pulseSpeed);
            this.particles.material.uniforms.pulseAmplitude.value = 1.0 + pulse * 0.2;
        }

        // Rotate the entire cloud slowly
        if (this.particles) {
            this.particles.rotation.y += this.config.rotationSpeed;
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateDistribution(data) {
        if (!this.particles) return;

        const geometry = this.particles.geometry;
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;
        const sizes = geometry.attributes.size.array;

        // Update particle positions based on new distribution data
        for (let i = 0; i < this.config.particleCount; i++) {
            const i3 = i * 3;

            // Generate new position based on data
            const value = data[i % data.length];
            const normalizedValue = (value - Math.min(...data)) / (Math.max(...data) - Math.min(...data));

            // Update position with some randomness
            const radius = normalizedValue * this.config.cloudScale + this.gaussianRandom(0, 1);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Update color based on new probability
            const color = this.getColorForProbability(normalizedValue);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Update size
            sizes[i] = normalizedValue * 2 + 0.5;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;

        // Animate the transition
        this.animateTransition();
    }

    animateTransition() {
        // Use GSAP for smooth transition if available
        if (window.gsap) {
            gsap.to(this.camera.position, {
                duration: 2,
                z: 25,
                ease: 'power2.inOut',
                onComplete: () => {
                    gsap.to(this.camera.position, {
                        duration: 1,
                        z: 20,
                        ease: 'power2.out'
                    });
                }
            });
        }
    }

    getColorForProbability(probability) {
        if (probability > 0.7) {
            return this.config.colorScheme.high;
        } else if (probability > 0.3) {
            return this.config.colorScheme.medium;
        } else {
            return this.config.colorScheme.low;
        }
    }

    gaussianRandom(mean = 0, stdDev = 1) {
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdDev + mean;
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }

    // Public API for integration
    setParticleCount(count) {
        this.config.particleCount = count;
        // Rebuild cloud with new count
        this.scene.remove(this.particles);
        this.createProbabilityCloud();
    }

    setColorScheme(high, medium, low) {
        this.config.colorScheme = {
            high: new THREE.Color(high),
            medium: new THREE.Color(medium),
            low: new THREE.Color(low)
        };
        // Update existing particles
        this.updateColors();
    }

    updateColors() {
        if (!this.particles) return;

        const colors = this.particles.geometry.attributes.color.array;
        const probabilities = this.particles.geometry.attributes.probability.array;

        for (let i = 0; i < probabilities.length; i++) {
            const color = this.getColorForProbability(probabilities[i]);
            const i3 = i * 3;
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        this.particles.geometry.attributes.color.needsUpdate = true;
    }
}

// Initialize visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create visualizer instance
    const mcVisualizer = new MonteCarloVisualizer('mcProbabilityCloud');

    // Make it globally accessible for updates
    window.monteCarloVisualizer = mcVisualizer;

    // Update visualization when Monte Carlo runs
    if (window.monteCarloEngine) {
        const originalSimulate = window.monteCarloEngine.simulateSeasonTrajectory;
        window.monteCarloEngine.simulateSeasonTrajectory = async function(...args) {
            const results = await originalSimulate.apply(this, args);

            // Update 3D visualization with results
            if (results && results.winDistribution && mcVisualizer) {
                mcVisualizer.updateDistribution(results.winDistribution);
            }

            return results;
        };
    }

    console.log('🎲 Monte Carlo 3D Visualizer initialized');
});