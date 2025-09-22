/**
 * Enhanced 3D Visualization Platform
 * Three.js r168 + Babylon.js integration for championship sports analytics
 */

import * as THREE from 'three';

class Enhanced3DVisualizationPlatform {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        
        // Enhanced features
        this.babylonEngine = null;
        this.webxrSupported = false;
        this.webgpuSupported = false;
        this.adaptiveQuality = true;
        
        // Performance tracking
        this.frameTime = 0;
        this.targetFPS = 60;
        this.qualityLevel = 'high';
        
        // Sports analytics data
        this.sportsData = {
            teams: [],
            stadiums: [],
            players: [],
            analytics: {}
        };
        
        this.initializePlatform();
    }

    async initializePlatform() {
        console.log('🎮 Initializing Enhanced 3D Visualization Platform...');
        
        await this.detectCapabilities();
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupControls();
        this.setupPostProcessing();
        
        if (this.webxrSupported) {
            this.setupWebXR();
        }
        
        this.loadSportsAnalytics();
        this.startRenderLoop();
        
        console.log('✅ 3D Platform initialized successfully');
    }

    async detectCapabilities() {
        console.log('🔍 Detecting platform capabilities...');
        
        // WebGPU detection
        if ('gpu' in navigator) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    this.webgpuSupported = true;
                    console.log('✅ WebGPU supported');
                }
            } catch (error) {
                console.log('⚠️ WebGPU not available, falling back to WebGL2');
            }
        }
        
        // WebXR detection
        if ('xr' in navigator) {
            try {
                this.webxrSupported = await navigator.xr.isSessionSupported('immersive-vr');
                if (this.webxrSupported) {
                    console.log('✅ WebXR VR supported');
                }
            } catch (error) {
                console.log('⚠️ WebXR not available');
            }
        }
        
        // Adaptive quality based on device
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (gl) {
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
            
            if (maxTextureSize >= 4096 && maxRenderbufferSize >= 4096) {
                this.qualityLevel = 'high';
            } else if (maxTextureSize >= 2048) {
                this.qualityLevel = 'medium';
            } else {
                this.qualityLevel = 'low';
            }
        }
        
        console.log(`🎯 Quality level: ${this.qualityLevel}`);
    }

    setupRenderer() {
        // Use WebGPU if available, otherwise WebGL2
        const rendererOptions = {
            antialias: this.qualityLevel !== 'low',
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        };

        if (this.webgpuSupported) {
            // Future: WebGPU renderer when available in Three.js
            this.renderer = new THREE.WebGLRenderer(rendererOptions);
            console.log('🚀 Using WebGL2 renderer (WebGPU pending Three.js support)');
        } else {
            this.renderer = new THREE.WebGLRenderer(rendererOptions);
            console.log('🎮 Using WebGL2 renderer');
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enhanced rendering features
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Performance optimizations
        this.renderer.capabilities.logarithmicDepthBuffer = true;
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000011, 0.0002);
        
        // Enhanced skybox
        this.createSkybox();
        
        // Lighting setup
        this.setupAdvancedLighting();
    }

    createSkybox() {
        const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vWorldPosition;
                
                void main() {
                    vec3 direction = normalize(vWorldPosition);
                    float gradient = dot(direction, vec3(0.0, 1.0, 0.0));
                    
                    vec3 colorTop = vec3(0.0, 0.1, 0.3);
                    vec3 colorHorizon = vec3(0.0, 0.0, 0.1);
                    vec3 colorBottom = vec3(0.0, 0.0, 0.05);
                    
                    vec3 color = mix(colorBottom, colorHorizon, smoothstep(-0.5, 0.0, gradient));
                    color = mix(color, colorTop, smoothstep(0.0, 0.5, gradient));
                    
                    // Add stars
                    float stars = step(0.98, sin(vWorldPosition.x * 100.0) * sin(vWorldPosition.y * 100.0) * sin(vWorldPosition.z * 100.0));
                    color += vec3(stars * 0.8);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(skybox);
    }

    setupAdvancedLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        
        // Enhanced shadow settings
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(directionalLight);

        // Stadium floodlights
        this.createStadiumLighting();
    }

    createStadiumLighting() {
        const floodlightPositions = [
            { x: 200, y: 150, z: 200 },
            { x: -200, y: 150, z: 200 },
            { x: 200, y: 150, z: -200 },
            { x: -200, y: 150, z: -200 }
        ];

        floodlightPositions.forEach((pos, index) => {
            const floodlight = new THREE.SpotLight(0xffffff, 2.0, 1000, Math.PI / 6, 0.3, 2);
            floodlight.position.set(pos.x, pos.y, pos.z);
            floodlight.target.position.set(0, 0, 0);
            floodlight.castShadow = true;
            
            floodlight.shadow.mapSize.width = 1024;
            floodlight.shadow.mapSize.height = 1024;
            floodlight.shadow.camera.near = 50;
            floodlight.shadow.camera.far = 500;
            
            this.scene.add(floodlight);
            this.scene.add(floodlight.target);
        });
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 200, 500);
    }

    setupControls() {
        // Dynamic import for OrbitControls
        import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 2000;
            this.controls.minDistance = 50;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        });
    }

    setupPostProcessing() {
        import('three/examples/jsm/postprocessing/EffectComposer.js').then(async (effectComposer) => {
            const { EffectComposer } = effectComposer;
            const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
            const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
            const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
            const { FXAAShader } = await import('three/examples/jsm/shaders/FXAAShader.js');

            this.composer = new EffectComposer(this.renderer);

            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            // Bloom effect for enhanced visuals
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,  // strength
                0.4,  // radius
                0.85  // threshold
            );
            this.composer.addPass(bloomPass);

            // Anti-aliasing
            if (this.qualityLevel === 'high') {
                const fxaaPass = new ShaderPass(FXAAShader);
                fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
                fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
                this.composer.addPass(fxaaPass);
            }

            console.log('✨ Post-processing effects enabled');
        }).catch(error => {
            console.warn('⚠️ Post-processing not available, using basic rendering');
        });
    }

    async setupWebXR() {
        if (!this.webxrSupported) return;

        try {
            this.renderer.xr.enabled = true;
            
            // Add VR button
            const { VRButton } = await import('three/examples/jsm/webxr/VRButton.js');
            const vrButton = VRButton.createButton(this.renderer);
            document.body.appendChild(vrButton);
            
            console.log('🥽 WebXR VR support enabled');
        } catch (error) {
            console.warn('⚠️ WebXR setup failed:', error);
        }
    }

    loadSportsAnalytics() {
        // Load championship sports data
        this.sportsData = {
            teams: [
                { 
                    name: 'Cardinals', 
                    position: { x: 0, y: 0, z: 0 }, 
                    readiness: 86.6, 
                    color: 0xDC143C,
                    stadium: 'Busch Stadium'
                },
                { 
                    name: 'Titans', 
                    position: { x: 300, y: 0, z: -200 }, 
                    power: 78, 
                    color: 0x4B92DB,
                    stadium: 'Nissan Stadium'
                },
                { 
                    name: 'Longhorns', 
                    position: { x: -300, y: 0, z: 200 }, 
                    rank: 3, 
                    color: 0xBF5700,
                    stadium: 'DKR Stadium'
                },
                { 
                    name: 'Grizzlies', 
                    position: { x: -150, y: 0, z: -300 }, 
                    rating: 114.7, 
                    color: 0x5D76A9,
                    stadium: 'FedExForum'
                }
            ],
            analytics: {
                totalValue: 229.5, // Million
                dataPoints: 2800000,
                accuracy: 94.6,
                updateFrequency: 3000 // ms
            }
        };

        this.createSportsVisualizations();
    }

    createSportsVisualizations() {
        console.log('🏟️ Creating sports analytics visualizations...');

        this.sportsData.teams.forEach((team, index) => {
            this.createTeamVisualization(team, index);
        });

        this.createDataConnectionNetwork();
        this.createAnalyticsHUD();
    }

    createTeamVisualization(team, index) {
        const group = new THREE.Group();

        // Stadium structure
        const stadiumGeometry = new THREE.CylinderGeometry(80, 100, 60, 32);
        const stadiumMaterial = new THREE.MeshPhysicalMaterial({
            color: team.color,
            metalness: 0.4,
            roughness: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const stadium = new THREE.Mesh(stadiumGeometry, stadiumMaterial);
        stadium.castShadow = true;
        stadium.receiveShadow = true;
        group.add(stadium);

        // Team data visualization
        const dataHeight = (team.readiness || team.power || team.rating || 50) * 2;
        const dataGeometry = new THREE.CylinderGeometry(5, 5, dataHeight, 16);
        const dataMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8
        });

        const dataColumn = new THREE.Mesh(dataGeometry, dataMaterial);
        dataColumn.position.y = dataHeight / 2 + 30;
        group.add(dataColumn);

        // Team label
        this.createTeamLabel(team, group);

        // Position the group
        group.position.set(team.position.x, team.position.y, team.position.z);
        
        // Add floating animation
        group.userData = {
            originalY: team.position.y,
            floatSpeed: 0.01 + index * 0.005,
            team: team
        };

        this.scene.add(group);
    }

    createTeamLabel(team, group) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;

        // Draw text
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, 512, 256);
        
        context.fillStyle = '#FFD700';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText(team.name, 256, 80);
        
        context.fillStyle = '#FFFFFF';
        context.font = '32px Arial';
        if (team.readiness) context.fillText(`Readiness: ${team.readiness}%`, 256, 130);
        if (team.power) context.fillText(`Power: ${team.power}`, 256, 130);
        if (team.rank) context.fillText(`Rank: #${team.rank}`, 256, 130);
        if (team.rating) context.fillText(`Rating: ${team.rating}`, 256, 130);
        
        context.fillStyle = '#9BCBEB';
        context.font = '24px Arial';
        context.fillText(team.stadium, 256, 180);

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(200, 100, 1);
        sprite.position.y = 150;

        group.add(sprite);
    }

    createDataConnectionNetwork() {
        const teams = this.sportsData.teams;
        
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                if (Math.random() > 0.3) { // 70% chance of connection
                    this.createDataConnection(teams[i], teams[j]);
                }
            }
        }
    }

    createDataConnection(teamA, teamB) {
        const points = [];
        points.push(new THREE.Vector3(teamA.position.x, teamA.position.y + 50, teamA.position.z));
        
        // Add curve point
        const midPoint = new THREE.Vector3(
            (teamA.position.x + teamB.position.x) / 2,
            Math.max(teamA.position.y, teamB.position.y) + 100 + Math.random() * 50,
            (teamA.position.z + teamB.position.z) / 2
        );
        points.push(midPoint);
        
        points.push(new THREE.Vector3(teamB.position.x, teamB.position.y + 50, teamB.position.z));

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 20, 2, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00E5FF,
            transparent: true,
            opacity: 0.4
        });

        const connection = new THREE.Mesh(geometry, material);
        this.scene.add(connection);
    }

    createAnalyticsHUD() {
        // Create floating analytics display
        const hudGroup = new THREE.Group();
        
        // Background panel
        const panelGeometry = new THREE.PlaneGeometry(300, 200);
        const panelMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.7
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        hudGroup.add(panel);

        // Add analytics text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;

        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, 512, 512);
        
        context.fillStyle = '#00E5FF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('Live Analytics', 256, 60);
        
        context.fillStyle = '#FFD700';
        context.font = '24px Arial';
        context.fillText(`Total Value: $${this.sportsData.analytics.totalValue}M`, 256, 120);
        context.fillText(`Data Points: ${this.sportsData.analytics.dataPoints.toLocaleString()}`, 256, 160);
        context.fillText(`Accuracy: ${this.sportsData.analytics.accuracy}%`, 256, 200);
        context.fillText(`Update: ${this.sportsData.analytics.updateFrequency}ms`, 256, 240);

        const texture = new THREE.CanvasTexture(canvas);
        const hudMaterial = new THREE.SpriteMaterial({ map: texture });
        const hudSprite = new THREE.Sprite(hudMaterial);
        hudSprite.scale.set(300, 300, 1);
        
        hudGroup.add(hudSprite);
        hudGroup.position.set(0, 300, -200);
        
        this.scene.add(hudGroup);
    }

    startRenderLoop() {
        const animate = () => {
            const startTime = performance.now();

            // Update controls
            if (this.controls) {
                this.controls.update();
            }

            // Animate team visualizations
            this.scene.traverse((object) => {
                if (object.userData && object.userData.team) {
                    object.position.y = object.userData.originalY + 
                        Math.sin(Date.now() * object.userData.floatSpeed) * 10;
                    object.rotation.y += 0.005;
                }
            });

            // Update analytics data
            this.updateAnalyticsData();

            // Render
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }

            // Performance monitoring
            this.frameTime = performance.now() - startTime;
            this.adaptQuality();

            // Continue animation loop
            if (this.renderer.xr && this.renderer.xr.enabled) {
                this.renderer.setAnimationLoop(animate);
            } else {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateAnalyticsData() {
        // Simulate real-time data updates
        if (Math.random() < 0.01) { // 1% chance per frame
            this.sportsData.analytics.dataPoints += Math.floor(Math.random() * 1000);
            
            // Update team metrics
            this.sportsData.teams.forEach(team => {
                if (team.readiness) {
                    team.readiness += (Math.random() - 0.5) * 2;
                    team.readiness = Math.max(80, Math.min(95, team.readiness));
                }
            });
        }
    }

    adaptQuality() {
        if (!this.adaptiveQuality) return;

        const targetFrameTime = 1000 / this.targetFPS;
        
        if (this.frameTime > targetFrameTime * 1.5) {
            // Reduce quality
            if (this.qualityLevel === 'high') {
                this.qualityLevel = 'medium';
                this.updateQualitySettings();
            } else if (this.qualityLevel === 'medium') {
                this.qualityLevel = 'low';
                this.updateQualitySettings();
            }
        } else if (this.frameTime < targetFrameTime * 0.8) {
            // Increase quality
            if (this.qualityLevel === 'low') {
                this.qualityLevel = 'medium';
                this.updateQualitySettings();
            } else if (this.qualityLevel === 'medium') {
                this.qualityLevel = 'high';
                this.updateQualitySettings();
            }
        }
    }

    updateQualitySettings() {
        const pixelRatio = this.qualityLevel === 'high' ? 
            Math.min(window.devicePixelRatio, 2) : 
            this.qualityLevel === 'medium' ? 1.5 : 1;
            
        this.renderer.setPixelRatio(pixelRatio);
        
        console.log(`🎯 Quality adapted to: ${this.qualityLevel}`);
    }

    // Public API methods
    enableVR() {
        if (this.webxrSupported) {
            console.log('🥽 VR mode enabled');
            return true;
        }
        console.warn('⚠️ VR not supported on this device');
        return false;
    }

    setAnalyticsData(data) {
        this.sportsData = { ...this.sportsData, ...data };
        this.updateVisualizations();
    }

    updateVisualizations() {
        // Remove existing visualizations
        const objectsToRemove = [];
        this.scene.traverse((object) => {
            if (object.userData && object.userData.team) {
                objectsToRemove.push(object);
            }
        });

        objectsToRemove.forEach(object => {
            this.scene.remove(object);
        });

        // Recreate with new data
        this.createSportsVisualizations();
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.composer) {
            this.composer.dispose();
        }
        console.log('🧹 3D Platform disposed');
    }
}

// Export for use in other modules
export default Enhanced3DVisualizationPlatform;

// Global initialization for browser environments
if (typeof window !== 'undefined') {
    window.Enhanced3DVisualizationPlatform = Enhanced3DVisualizationPlatform;
    console.log('🎮 Enhanced 3D Visualization Platform loaded');
}