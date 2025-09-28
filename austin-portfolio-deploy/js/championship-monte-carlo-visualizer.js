/**
 * 🏆 Championship Monte Carlo 3D Visualizer
 * Elite 3D probability visualization for championship analytics
 * Team-specific branding with Deep South sports authority
 *
 * Blaze Sports Intel - Championship Intelligence Platform
 */

class ChampionshipMonteCarloVisualizer {
    constructor(containerId = 'mcProbabilityCloud') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn('Championship visualizer container not found:', containerId);
            return;
        }

        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.animationId = null;

        // Championship-specific particle systems
        this.championshipSystems = new Map();
        this.teamFormations = new Map();
        this.probabilityFields = new Map();
        this.interactiveElements = new Map();

        // Team color schemes with championship metallics
        this.teamColors = {
            cardinals: {
                primary: new THREE.Color(0xC21E26),      // Cardinals red
                secondary: new THREE.Color(0xFFD100),    // Gold
                accent: new THREE.Color(0xFFFFFF),       // White
                championship: new THREE.Color(0xFFD700), // Gold trophy
                confidence: new THREE.Color(0xFFA500)    // Orange confidence
            },
            titans: {
                primary: new THREE.Color(0x0C2340),      // Titans navy
                secondary: new THREE.Color(0x4B92DB),    // Light blue
                accent: new THREE.Color(0xC8102E),       // Red
                championship: new THREE.Color(0xC0C0C0), // Silver trophy
                confidence: new THREE.Color(0x87CEEB)    // Sky blue confidence
            },
            longhorns: {
                primary: new THREE.Color(0xBF5700),      // Burnt orange
                secondary: new THREE.Color(0xFFFFFF),    // White
                accent: new THREE.Color(0x333F48),       // Charcoal
                championship: new THREE.Color(0xFFD700), // Gold trophy
                confidence: new THREE.Color(0xFFA500)    // Orange confidence
            },
            grizzlies: {
                primary: new THREE.Color(0x5D76A9),      // Grizzlies blue
                secondary: new THREE.Color(0xF5B112),    // Gold
                accent: new THREE.Color(0x12264B),       // Navy
                championship: new THREE.Color(0xCD7F32), // Bronze trophy
                confidence: new THREE.Color(0x4169E1)    // Royal blue confidence
            },
            deepSouth: {
                primary: new THREE.Color(0xBF5700),      // Blaze orange
                secondary: new THREE.Color(0x9BCBEB),    // Sky blue
                accent: new THREE.Color(0x002244),       // Deep navy
                championship: new THREE.Color(0xFFD700), // Championship gold
                confidence: new THREE.Color(0xFFB81C)    // Blaze accent
            }
        };

        // Performance and state management
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.currentTeam = 'deepSouth';
        this.championshipMode = 'probability'; // probability, trajectory, scenarios
        this.interactionMode = 'explore'; // explore, select, compare

        // Championship analytics
        this.championshipData = {
            totalProbability: 0,
            teamProbabilities: new Map(),
            confidenceIntervals: new Map(),
            scenarioResults: new Map()
        };

        // Animation and effects
        this.particleCount = 15000;
        this.effects = {
            championship: null,
            probability: null,
            confidence: null
        };

        this.initialize();
    }

    async initialize() {
        if (!window.THREE) {
            console.warn('Three.js not loaded. Championship visualizer disabled.');
            return;
        }

        console.log('🏆 Initializing Championship Monte Carlo Visualizer...');

        try {
            this.setupScene();
            this.setupRenderer();
            this.setupCamera();
            this.setupLighting();
            this.setupPostProcessing();

            await this.createChampionshipVisualization();
            this.setupInteractions();
            this.setupEventListeners();

            this.animate();

            // Connect to championship data engine
            this.connectToDataEngine();

            console.log('✅ Championship Monte Carlo Visualizer initialized');
        } catch (error) {
            console.error('❌ Championship visualizer initialization failed:', error);
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();

        // Championship arena atmosphere with gradient fog
        this.scene.fog = new THREE.FogExp2(0x001122, 0.008);

        // Championship ambient lighting
        const ambientLight = new THREE.AmbientLight(0x2c3e50, 0.4);
        this.scene.add(ambientLight);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 15, 30);
        this.camera.lookAt(0, 0, 0);

        // Add OrbitControls if available
        if (window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
            this.controls.minDistance = 10;
            this.controls.maxDistance = 100;
        }
    }

    setupLighting() {
        // Stadium-style championship lighting
        const positions = [
            { pos: [30, 25, 30], color: 0xFFD700, intensity: 1.5 },
            { pos: [-30, 25, 30], color: 0xFFB81C, intensity: 1.2 },
            { pos: [30, 25, -30], color: 0xC21E26, intensity: 1.0 },
            { pos: [-30, 25, -30], color: 0x5D76A9, intensity: 1.0 }
        ];

        this.stadiumLights = [];

        positions.forEach((config, index) => {
            const light = new THREE.PointLight(config.color, config.intensity, 100);
            light.position.set(...config.pos);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            this.stadiumLights.push(light);
            this.scene.add(light);
        });

        // Championship spotlight
        this.championshipSpot = new THREE.SpotLight(0xFFD700, 2, 60, Math.PI / 8, 0.5);
        this.championshipSpot.position.set(0, 40, 0);
        this.championshipSpot.target.position.set(0, 0, 0);
        this.championshipSpot.castShadow = true;
        this.scene.add(this.championshipSpot);
        this.scene.add(this.championshipSpot.target);
    }

    setupPostProcessing() {
        if (!window.THREE.EffectComposer) return;

        this.composer = new THREE.EffectComposer(this.renderer);

        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom for championship glow effects
        if (window.THREE.UnrealBloomPass) {
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
                1.2,  // strength
                0.6,  // radius
                0.8   // threshold
            );
            this.composer.addPass(this.bloomPass);
        }

        // FXAA for smooth edges
        if (window.THREE.ShaderPass && window.THREE.FXAAShader) {
            const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
            fxaaPass.material.uniforms.resolution.value.x = 1 / this.container.clientWidth;
            fxaaPass.material.uniforms.resolution.value.y = 1 / this.container.clientHeight;
            this.composer.addPass(fxaaPass);
        }
    }

    async createChampionshipVisualization() {
        console.log('🎯 Creating championship probability visualization...');

        // Create championship probability cloud
        await this.createProbabilityCloud();

        // Create team formations
        await this.createTeamFormations();

        // Create confidence visualization
        await this.createConfidenceVisualization();

        // Create interactive championship trophy
        await this.createChampionshipTrophy();

        console.log('✅ Championship visualization created');
    }

    async createProbabilityCloud() {
        const cloudGeometry = new THREE.BufferGeometry();

        // Generate championship probability particles
        const positions = [];
        const colors = [];
        const sizes = [];
        const probabilities = [];
        const teamAssignments = [];

        const teams = ['cardinals', 'titans', 'longhorns', 'grizzlies'];
        const particlesPerTeam = Math.floor(this.particleCount / teams.length);

        teams.forEach((team, teamIndex) => {
            const teamColors = this.teamColors[team];

            for (let i = 0; i < particlesPerTeam; i++) {
                // Generate position based on team's championship probability
                const probability = this.getTeamChampionshipProbability(team);
                const position = this.generateChampionshipPosition(probability, teamIndex);

                positions.push(position.x, position.y, position.z);

                // Color based on championship probability
                const color = this.interpolateChampionshipColor(teamColors, probability);
                colors.push(color.r, color.g, color.b);

                // Size based on probability and confidence
                const size = (probability * 8 + 2) * (0.8 + Math.random() * 0.4);
                sizes.push(size);

                probabilities.push(probability);
                teamAssignments.push(teamIndex);
            }
        });

        cloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        cloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        cloudGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        cloudGeometry.setAttribute('probability', new THREE.Float32BufferAttribute(probabilities, 1));
        cloudGeometry.setAttribute('teamId', new THREE.Float32BufferAttribute(teamAssignments, 1));

        // Championship particle material with advanced shaders
        const cloudMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                championshipGlow: { value: 1.0 },
                probabilityScale: { value: 1.0 },
                teamColors: { value: this.getTeamColorArray() },
                cameraPosition: { value: this.camera.position },
                mousePosition: { value: this.mouse },
                championshipFactor: { value: 0.5 }
            },
            vertexShader: this.getChampionshipVertexShader(),
            fragmentShader: this.getChampionshipFragmentShader(),
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.probabilityCloud = new THREE.Points(cloudGeometry, cloudMaterial);
        this.probabilityCloud.name = 'championshipProbabilityCloud';
        this.scene.add(this.probabilityCloud);

        this.championshipSystems.set('probabilityCloud', this.probabilityCloud);
    }

    generateChampionshipPosition(probability, teamIndex) {
        // Create formation based on championship probability
        const radius = 20 * (1 - probability * 0.7); // Higher probability = closer to center
        const teamAngle = (teamIndex / 4) * Math.PI * 2; // Distribute teams around circle

        // Add some clustering and variance
        const clusterVariance = (Math.random() - 0.5) * 10 * (1 - probability);
        const heightVariance = (Math.random() - 0.5) * 8 * (1 - probability);

        const x = Math.cos(teamAngle) * radius + clusterVariance;
        const z = Math.sin(teamAngle) * radius + clusterVariance;
        const y = (Math.random() - 0.5) * 15 + heightVariance;

        return new THREE.Vector3(x, y, z);
    }

    interpolateChampionshipColor(teamColors, probability) {
        // Interpolate between team color and championship gold based on probability
        const baseColor = teamColors.primary.clone();
        const championshipColor = teamColors.championship.clone();

        return baseColor.lerp(championshipColor, probability * 0.8);
    }

    getTeamChampionshipProbability(team) {
        // Get from championship data engine or use fallback
        if (window.championshipDataEngine) {
            const teamData = window.championshipDataEngine.getTeamData(team);
            return (teamData?.realTime?.championshipProbability || 0.1) * 5; // Scale for visualization
        }

        // Fallback probabilities
        const fallback = {
            cardinals: 0.123,
            titans: 0.037,
            longhorns: 0.189,
            grizzlies: 0.084
        };

        return fallback[team] || 0.1;
    }

    async createTeamFormations() {
        console.log('🏟️ Creating team-specific formations...');

        const formations = {
            cardinals: this.createBaseballDiamondFormation(),
            titans: this.createFootballFieldFormation(),
            longhorns: this.createFootballFieldFormation(),
            grizzlies: this.createBasketballCourtFormation()
        };

        Object.entries(formations).forEach(([team, formation]) => {
            formation.name = `${team}Formation`;
            formation.visible = team === this.currentTeam;
            this.scene.add(formation);
            this.teamFormations.set(team, formation);
        });
    }

    createBaseballDiamondFormation() {
        const group = new THREE.Group();

        // Diamond outline
        const diamondPoints = [
            new THREE.Vector3(0, 0, 0),     // Home plate
            new THREE.Vector3(15, 0, 15),   // First base
            new THREE.Vector3(0, 0, 30),    // Second base
            new THREE.Vector3(-15, 0, 15),  // Third base
            new THREE.Vector3(0, 0, 0)      // Back to home
        ];

        const diamondGeometry = new THREE.BufferGeometry().setFromPoints(diamondPoints);
        const diamondMaterial = new THREE.LineBasicMaterial({
            color: this.teamColors.cardinals.primary,
            transparent: true,
            opacity: 0.3
        });

        const diamond = new THREE.Line(diamondGeometry, diamondMaterial);
        group.add(diamond);

        return group;
    }

    createFootballFieldFormation() {
        const group = new THREE.Group();

        // Field outline
        const fieldGeometry = new THREE.PlaneGeometry(25, 50);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x228B22,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });

        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        group.add(field);

        // Yard lines
        for (let i = -20; i <= 20; i += 5) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-12.5, 0, i),
                new THREE.Vector3(12.5, 0, i)
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.2
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            group.add(line);
        }

        return group;
    }

    createBasketballCourtFormation() {
        const group = new THREE.Group();

        // Court outline
        const courtGeometry = new THREE.PlaneGeometry(15, 28);
        const courtMaterial = new THREE.MeshBasicMaterial({
            color: 0x8B4513,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });

        const court = new THREE.Mesh(courtGeometry, courtMaterial);
        court.rotation.x = -Math.PI / 2;
        group.add(court);

        // Three-point arcs
        const arcGeometry = new THREE.RingGeometry(6, 6.2, 0, Math.PI);
        const arcMaterial = new THREE.MeshBasicMaterial({
            color: this.teamColors.grizzlies.primary,
            transparent: true,
            opacity: 0.3
        });

        const arc1 = new THREE.Mesh(arcGeometry, arcMaterial);
        arc1.rotation.x = -Math.PI / 2;
        arc1.position.z = -10;
        group.add(arc1);

        const arc2 = new THREE.Mesh(arcGeometry, arcMaterial);
        arc2.rotation.x = -Math.PI / 2;
        arc2.rotation.z = Math.PI;
        arc2.position.z = 10;
        group.add(arc2);

        return group;
    }

    async createConfidenceVisualization() {
        // Create confidence interval visualization
        const confidenceGeometry = new THREE.SphereGeometry(25, 32, 32);
        const confidenceMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                confidence: { value: 0.95 },
                teamColor: { value: this.teamColors.deepSouth.confidence }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;

                void main() {
                    vPosition = position;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float confidence;
                uniform vec3 teamColor;

                varying vec3 vPosition;
                varying vec3 vNormal;

                void main() {
                    float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                    float alpha = (1.0 - abs(fresnel)) * confidence * 0.1;

                    float pulse = sin(time * 2.0) * 0.5 + 0.5;
                    alpha *= (0.7 + pulse * 0.3);

                    gl_FragColor = vec4(teamColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.confidenceSphere = new THREE.Mesh(confidenceGeometry, confidenceMaterial);
        this.confidenceSphere.name = 'confidenceVisualization';
        this.scene.add(this.confidenceSphere);
    }

    async createChampionshipTrophy() {
        const trophyGroup = new THREE.Group();

        // Trophy base
        const baseGeometry = new THREE.CylinderGeometry(3, 4, 2, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 100
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        trophyGroup.add(base);

        // Trophy cup
        const cupGeometry = new THREE.CylinderGeometry(2, 1.5, 4, 8);
        const cupMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            shininess: 200,
            emissive: 0x331100
        });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.y = 4;
        trophyGroup.add(cup);

        // Trophy handles
        const handleGeometry = new THREE.TorusGeometry(1, 0.2, 4, 8, Math.PI);
        const handleMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            shininess: 200
        });

        const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
        handle1.position.set(2.2, 4, 0);
        handle1.rotation.z = Math.PI / 2;
        trophyGroup.add(handle1);

        const handle2 = new THREE.Mesh(handleGeometry, handleMaterial);
        handle2.position.set(-2.2, 4, 0);
        handle2.rotation.z = -Math.PI / 2;
        trophyGroup.add(handle2);

        trophyGroup.position.y = 10;
        trophyGroup.name = 'championshipTrophy';
        this.scene.add(trophyGroup);

        this.championshipTrophy = trophyGroup;
        this.interactiveElements.set('trophy', trophyGroup);
    }

    setupInteractions() {
        // Mouse/touch interaction setup
        this.raycaster = new THREE.Raycaster();
        this.selectedObject = null;
        this.hoveredObject = null;
    }

    setupEventListeners() {
        // Mouse events
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });

        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.onKeyDown(event);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update shader uniforms
        this.updateMouseUniforms();

        // Check for hover interactions
        this.checkHoverInteractions();
    }

    onMouseClick(event) {
        this.checkClickInteractions();
    }

    onKeyDown(event) {
        switch (event.key) {
            case '1':
                this.setTeamFocus('cardinals');
                break;
            case '2':
                this.setTeamFocus('titans');
                break;
            case '3':
                this.setTeamFocus('longhorns');
                break;
            case '4':
                this.setTeamFocus('grizzlies');
                break;
            case 'r':
                this.toggleAutoRotate();
                break;
            case 'c':
                this.captureScreenshot();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
        }
    }

    updateMouseUniforms() {
        this.championshipSystems.forEach(system => {
            if (system.material && system.material.uniforms) {
                if (system.material.uniforms.mousePosition) {
                    system.material.uniforms.mousePosition.value.copy(this.mouse);
                }
            }
        });
    }

    checkHoverInteractions() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            Array.from(this.interactiveElements.values()),
            true
        );

        if (intersects.length > 0) {
            this.hoveredObject = intersects[0].object;
            this.showTooltip(intersects[0]);
        } else {
            this.hoveredObject = null;
            this.hideTooltip();
        }
    }

    checkClickInteractions() {
        if (this.hoveredObject) {
            this.selectedObject = this.hoveredObject;
            this.handleObjectSelection(this.selectedObject);
        }
    }

    showTooltip(intersection) {
        // Implementation for showing interactive tooltips
        console.log('Showing tooltip for:', intersection.object.name);
    }

    hideTooltip() {
        // Implementation for hiding tooltips
    }

    handleObjectSelection(object) {
        console.log('Selected object:', object.name);

        if (object.name === 'championshipTrophy') {
            this.animateChampionshipFocus();
        }
    }

    setTeamFocus(team) {
        console.log(`🎯 Focusing on ${team} championship visualization...`);

        this.currentTeam = team;

        // Update team formations visibility
        this.teamFormations.forEach((formation, formationTeam) => {
            formation.visible = formationTeam === team;
        });

        // Update color scheme
        this.updateVisualizationColors(team);

        // Update particle clustering
        this.updateParticleClustering(team);

        // Animate camera to team position
        this.animateCameraToTeam(team);
    }

    updateVisualizationColors(team) {
        const teamColors = this.teamColors[team];

        // Update probability cloud colors
        if (this.probabilityCloud && this.probabilityCloud.material.uniforms) {
            this.probabilityCloud.material.uniforms.teamColors.value = this.getTeamColorArray(team);
        }

        // Update lighting colors
        this.stadiumLights.forEach((light, index) => {
            const colorKeys = ['primary', 'secondary', 'accent', 'championship'];
            const colorKey = colorKeys[index % colorKeys.length];
            light.color = teamColors[colorKey];
        });

        // Update confidence visualization
        if (this.confidenceSphere && this.confidenceSphere.material.uniforms) {
            this.confidenceSphere.material.uniforms.teamColor.value = teamColors.confidence;
        }
    }

    updateParticleClustering(team) {
        // Update particle positions to focus on selected team
        if (this.probabilityCloud) {
            const positions = this.probabilityCloud.geometry.attributes.position.array;
            const teamAssignments = this.probabilityCloud.geometry.attributes.teamId.array;

            const teams = ['cardinals', 'titans', 'longhorns', 'grizzlies'];
            const targetTeamIndex = teams.indexOf(team);

            // Animate particles of selected team toward center
            for (let i = 0; i < positions.length; i += 3) {
                const particleTeamIndex = teamAssignments[i / 3];

                if (particleTeamIndex === targetTeamIndex) {
                    // Move toward center with some variance
                    const centerPull = 0.1;
                    positions[i] *= (1 - centerPull); // x
                    positions[i + 1] *= (1 - centerPull); // y
                    positions[i + 2] *= (1 - centerPull); // z
                }
            }

            this.probabilityCloud.geometry.attributes.position.needsUpdate = true;
        }
    }

    animateCameraToTeam(team) {
        if (!this.controls) return;

        const teamPositions = {
            cardinals: { position: [15, 10, 15], target: [0, 0, 0] },
            titans: { position: [-15, 10, 15], target: [0, 0, 0] },
            longhorns: { position: [15, 10, -15], target: [0, 0, 0] },
            grizzlies: { position: [-15, 10, -15], target: [0, 0, 0] }
        };

        const teamPos = teamPositions[team];
        if (teamPos && window.gsap) {
            gsap.to(this.camera.position, {
                duration: 2,
                x: teamPos.position[0],
                y: teamPos.position[1],
                z: teamPos.position[2],
                ease: 'power2.inOut'
            });

            gsap.to(this.controls.target, {
                duration: 2,
                x: teamPos.target[0],
                y: teamPos.target[1],
                z: teamPos.target[2],
                ease: 'power2.inOut'
            });
        }
    }

    animateChampionshipFocus() {
        console.log('🏆 Animating championship focus...');

        if (this.championshipTrophy && window.gsap) {
            // Animate trophy glow
            gsap.to(this.championshipTrophy.rotation, {
                duration: 3,
                y: this.championshipTrophy.rotation.y + Math.PI * 2,
                ease: 'power2.inOut'
            });

            // Animate championship spotlight
            gsap.to(this.championshipSpot, {
                duration: 2,
                intensity: 4,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            });
        }
    }

    connectToDataEngine() {
        if (window.championshipDataEngine) {
            console.log('🔗 Connecting to championship data engine...');

            // Listen for real-time updates
            window.championshipDataEngine.on('realTimeUpdate', (data) => {
                this.handleRealTimeUpdate(data);
            });

            // Listen for simulation updates
            window.championshipDataEngine.on('simulationUpdate', (data) => {
                this.handleSimulationUpdate(data);
            });

            console.log('✅ Connected to championship data engine');
        }
    }

    handleRealTimeUpdate(data) {
        const { team, data: teamData } = data;

        // Update championship probability in visualization
        this.championshipData.teamProbabilities.set(team, teamData.championshipProbability);

        // Update particle visualization
        this.updateTeamProbabilityVisualization(team, teamData);
    }

    handleSimulationUpdate(data) {
        const { team, type, results } = data;

        console.log(`📊 Simulation update for ${team}: ${type}`);

        // Update visualization with new simulation results
        if (type === 'championship' && results.combined) {
            this.updateChampionshipVisualization(team, results.combined);
        }
    }

    updateTeamProbabilityVisualization(team, teamData) {
        // Update particle colors and positions based on new probability data
        if (this.probabilityCloud) {
            const probability = teamData.championshipProbability || 0;

            // Update championship data
            this.championshipData.teamProbabilities.set(team, probability);

            // Update shader uniforms
            if (this.probabilityCloud.material.uniforms) {
                this.probabilityCloud.material.uniforms.championshipFactor.value = probability * 5;
            }
        }
    }

    updateChampionshipVisualization(team, results) {
        console.log(`🎯 Updating championship visualization for ${team}`, results);

        // Store results for visualization
        this.championshipData.scenarioResults.set(team, results);

        // Update confidence intervals
        if (results.confidenceInterval) {
            this.championshipData.confidenceIntervals.set(team, results.confidenceInterval);
        }

        // Trigger visual update
        this.updateProbabilityDistribution(team, results);
    }

    updateProbabilityDistribution(team, results) {
        // Update particle distribution based on new results
        if (results.winDistribution && this.probabilityCloud) {
            // Use win distribution to update particle positions
            const distribution = results.winDistribution;
            const positions = this.probabilityCloud.geometry.attributes.position.array;
            const teamAssignments = this.probabilityCloud.geometry.attributes.teamId.array;

            const teams = ['cardinals', 'titans', 'longhorns', 'grizzlies'];
            const teamIndex = teams.indexOf(team);

            if (teamIndex !== -1) {
                // Update positions for this team's particles
                let particleIndex = 0;

                for (let i = 0; i < positions.length; i += 3) {
                    if (teamAssignments[i / 3] === teamIndex) {
                        const distributionValue = distribution[particleIndex % distribution.length];
                        const normalizedValue = distributionValue / Math.max(...distribution);

                        // Update position based on distribution value
                        const radius = 25 * (1 - normalizedValue * 0.8);
                        const angle = (particleIndex / (distribution.length / 10)) * Math.PI * 2;

                        positions[i] = Math.cos(angle) * radius;
                        positions[i + 2] = Math.sin(angle) * radius;

                        particleIndex++;
                    }
                }

                this.probabilityCloud.geometry.attributes.position.needsUpdate = true;
            }
        }
    }

    getTeamColorArray(team = this.currentTeam) {
        const colors = this.teamColors[team];
        return [
            colors.primary.r, colors.primary.g, colors.primary.b,
            colors.secondary.r, colors.secondary.g, colors.secondary.b,
            colors.accent.r, colors.accent.g, colors.accent.b,
            colors.championship.r, colors.championship.g, colors.championship.b
        ];
    }

    getChampionshipVertexShader() {
        return `
            attribute float size;
            attribute float probability;
            attribute float teamId;

            uniform float time;
            uniform float championshipGlow;
            uniform float probabilityScale;
            uniform float teamColors[12];
            uniform vec3 cameraPosition;
            uniform vec2 mousePosition;
            uniform float championshipFactor;

            varying vec3 vColor;
            varying float vProbability;
            varying float vTeamId;
            varying float vGlow;

            void main() {
                vColor = color;
                vProbability = probability;
                vTeamId = teamId;

                vec3 pos = position;

                // Championship attraction toward center
                vec3 centerAttraction = -normalize(pos) * championshipFactor * probability * 0.5;
                pos += centerAttraction;

                // Pulsing effect based on championship probability
                float pulse = sin(time * 2.0 + probability * 10.0) * 0.5 + 0.5;
                pos += normalize(pos) * pulse * probability * 2.0;

                // Mouse interaction
                vec3 mouseWorld = vec3(mousePosition.x * 20.0, 0.0, mousePosition.y * 20.0);
                float mouseDistance = length(pos - mouseWorld);
                if (mouseDistance < 10.0) {
                    vec3 mouseAttraction = normalize(mouseWorld - pos) * (10.0 - mouseDistance) * 0.1;
                    pos += mouseAttraction;
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

                // Size based on championship probability and distance
                float finalSize = size * probabilityScale;
                finalSize *= (200.0 / -mvPosition.z);
                finalSize *= (0.8 + pulse * 0.4);
                finalSize *= (1.0 + probability * championshipGlow);

                vGlow = pulse * probability * championshipGlow;

                gl_PointSize = finalSize;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getChampionshipFragmentShader() {
        return `
            uniform float time;
            uniform float championshipGlow;

            varying vec3 vColor;
            varying float vProbability;
            varying float vTeamId;
            varying float vGlow;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                if (dist > 0.5) discard;

                // Core particle
                float core = smoothstep(0.5, 0.1, dist);

                // Championship glow
                float glow = smoothstep(0.5, 0.0, dist);

                // Trophy shimmer effect
                float shimmer = sin(time * 4.0 + vTeamId * 2.0) * 0.5 + 0.5;

                // Final color with championship effects
                vec3 finalColor = vColor;
                finalColor += vec3(1.0, 0.843, 0.0) * vGlow * 0.5; // Gold championship glow
                finalColor += shimmer * 0.2;

                // Alpha based on probability and effects
                float alpha = core * vProbability * (0.8 + vGlow * 0.4);
                alpha += glow * vProbability * 0.3;

                // Championship bloom effect
                float bloom = core * vProbability * championshipGlow;
                finalColor += bloom * vec3(1.0, 0.9, 0.5);

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;
    }

    toggleAutoRotate() {
        if (this.controls) {
            this.controls.autoRotate = !this.controls.autoRotate;
            console.log('Auto-rotate:', this.controls.autoRotate ? 'enabled' : 'disabled');
        }
    }

    captureScreenshot() {
        this.renderer.render(this.scene, this.camera);
        const link = document.createElement('a');
        link.download = `championship-visualization-${Date.now()}.png`;
        link.href = this.renderer.domElement.toDataURL();
        link.click();
        console.log('Championship visualization screenshot captured');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    setupPerformanceMonitoring() {
        this.performanceStats = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60
        };
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Performance monitoring
        this.performanceStats.frameCount++;
        const now = performance.now();
        if (now - this.performanceStats.lastTime > 1000) {
            this.performanceStats.fps = this.performanceStats.frameCount;
            this.performanceStats.frameCount = 0;
            this.performanceStats.lastTime = now;
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update championship systems
        this.updateChampionshipSystems(elapsedTime);

        // Update lighting
        this.updateDynamicLighting(elapsedTime);

        // Render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateChampionshipSystems(elapsedTime) {
        // Update probability cloud
        if (this.probabilityCloud && this.probabilityCloud.material.uniforms) {
            this.probabilityCloud.material.uniforms.time.value = elapsedTime;
            this.probabilityCloud.material.uniforms.cameraPosition.value.copy(this.camera.position);

            // Gentle rotation
            this.probabilityCloud.rotation.y += 0.001;
        }

        // Update confidence sphere
        if (this.confidenceSphere && this.confidenceSphere.material.uniforms) {
            this.confidenceSphere.material.uniforms.time.value = elapsedTime;
        }

        // Update championship trophy
        if (this.championshipTrophy) {
            this.championshipTrophy.rotation.y += 0.005;

            // Gentle floating motion
            this.championshipTrophy.position.y = 10 + Math.sin(elapsedTime * 0.5) * 0.5;
        }
    }

    updateDynamicLighting(elapsedTime) {
        // Update stadium lights with subtle variations
        this.stadiumLights.forEach((light, index) => {
            const baseIntensity = 1.5 - index * 0.1;
            const variation = Math.sin(elapsedTime * 0.5 + index * Math.PI * 0.5) * 0.2;
            light.intensity = baseIntensity + variation;
        });

        // Update championship spotlight
        if (this.championshipSpot) {
            const spotVariation = Math.sin(elapsedTime * 0.8) * 0.3;
            this.championshipSpot.intensity = 2 + spotVariation;
        }
    }

    destroy() {
        console.log('🔥 Destroying Championship Monte Carlo Visualizer...');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Dispose of geometries and materials
        this.championshipSystems.forEach(system => {
            if (system.geometry) system.geometry.dispose();
            if (system.material) {
                if (system.material.map) system.material.map.dispose();
                system.material.dispose();
            }
            this.scene.remove(system);
        });

        this.teamFormations.forEach(formation => {
            this.scene.remove(formation);
        });

        if (this.composer) this.composer.dispose();
        if (this.renderer) this.renderer.dispose();
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }

        this.championshipSystems.clear();
        this.teamFormations.clear();
        this.interactiveElements.clear();

        console.log('✅ Championship Monte Carlo Visualizer destroyed');
    }
}

// Initialize championship visualizer
let championshipVisualizer = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 Initializing Championship Monte Carlo Visualizer...');

    // Wait for Three.js to load
    if (window.THREE) {
        championshipVisualizer = new ChampionshipMonteCarloVisualizer('mcProbabilityCloud');
        window.championshipVisualizer = championshipVisualizer;
    } else {
        console.warn('Three.js not available, championship visualizer disabled');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionshipMonteCarloVisualizer;
}

// Global API
window.ChampionshipMonteCarloVisualizer = ChampionshipMonteCarloVisualizer;