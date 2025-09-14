// Blaze Intelligence - Advanced Stadium Environment
// Enhanced Three.js with Weather, AI Interactions, and Dynamic Lighting
// Version 2.0 - Professional Sports Intelligence Platform

class BlazeAdvancedStadiumEnvironment {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.particles = [];
        this.lights = [];
        this.interactiveObjects = [];
        this.time = 0;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isMobile = window.innerWidth < 768;
        
        // Weather and lighting system
        this.weatherSystem = {
            condition: 'clear', // clear, overcast, rain, fog
            timeOfDay: 'night', // dawn, day, dusk, night
            intensity: 1.0,
            temperature: 75
        };
        
        // AI interaction system
        this.aiInteractions = {
            hotspots: [],
            activeQuery: null,
            suggestions: []
        };
        
        // Performance monitoring
        this.performance = {
            fps: 60,
            lastTime: performance.now(),
            frameCount: 0
        };
        
        if (window.THREE) {
            this.init();
        }
    }
    
    init() {
        this.createScene();
        this.createAdvancedRenderer();
        this.createDynamicCamera();
        this.createWeatherSystem();
        this.createAdvancedLighting();
        this.createIntelligentParticles();
        this.createInteractiveHotspots();
        this.createAtmosphericEffects();
        this.setupAIInteractions();
        this.setupAdvancedEventListeners();
        this.initPerformanceMonitoring();
        this.animate();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Dynamic fog based on weather
        this.updateSceneFog();
        
        // Environment mapping
        const envGeometry = new THREE.SphereGeometry(200, 32, 32);
        const envMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                weatherIntensity: { value: this.weatherSystem.intensity },
                skyColor1: { value: new THREE.Color(0x141d3d) },
                skyColor2: { value: new THREE.Color(0x000511) },
                cloudCover: { value: 0.3 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                
                void main() {
                    vUv = uv;
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float weatherIntensity;
                uniform float cloudCover;
                uniform vec3 skyColor1;
                uniform vec3 skyColor2;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                
                float noise(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }
                
                float fbm(vec2 st) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    vec2 shift = vec2(100.0);
                    
                    for(int i = 0; i < 4; i++) {
                        value += amplitude * noise(st);
                        st = st * 2.0 + shift;
                        amplitude *= 0.5;
                    }
                    return value;
                }
                
                void main() {
                    vec2 st = vUv * 3.0 + time * 0.1;
                    float clouds = fbm(st) * cloudCover;
                    
                    // Sky gradient
                    float gradient = smoothstep(-1.0, 1.0, vWorldPosition.y / 200.0);
                    vec3 skyColor = mix(skyColor2, skyColor1, gradient);
                    
                    // Add clouds
                    skyColor = mix(skyColor, vec3(0.7, 0.7, 0.8), clouds * 0.5);
                    
                    // Weather effects
                    skyColor *= (0.8 + 0.2 * weatherIntensity);
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide,
            transparent: false
        });
        
        const envSphere = new THREE.Mesh(envGeometry, envMaterial);
        this.scene.add(envSphere);
        this.particles.push(envSphere);
    }
    
    createAdvancedRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: !this.isMobile,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        
        // Advanced rendering settings
        this.renderer.shadowMap.enabled = !this.isMobile;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Enable advanced features
        this.renderer.physicallyCorrectLights = true;
        
        // Canvas setup
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        this.renderer.domElement.style.pointerEvents = 'auto'; // Enable interaction
        document.body.appendChild(this.renderer.domElement);
    }
    
    createDynamicCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 25, 70);
        this.camera.lookAt(0, 0, 0);
        
        // Camera animation paths for cinematic effects
        this.cameraPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 25, 70),
            new THREE.Vector3(-30, 30, 50),
            new THREE.Vector3(0, 40, 30),
            new THREE.Vector3(30, 30, 50),
            new THREE.Vector3(0, 25, 70)
        ]);
        this.cameraPathT = 0;
    }
    
    createWeatherSystem() {
        // Dynamic weather based on time and conditions
        this.updateWeatherConditions();
        
        // Create weather particles
        if (this.weatherSystem.condition === 'rain') {
            this.createRainEffect();
        } else if (this.weatherSystem.condition === 'fog') {
            this.createFogEffect();
        }
    }
    
    createAdvancedLighting() {
        // Stadium floodlights with dynamic intensity
        const stadiumLights = [
            { pos: [-35, 30, -30], color: 0xFFE4B5, intensity: 2.5, angle: Math.PI / 6 },
            { pos: [35, 30, -30], color: 0xFFE4B5, intensity: 2.5, angle: Math.PI / 6 },
            { pos: [-35, 30, 30], color: 0xFFE4B5, intensity: 2.5, angle: Math.PI / 6 },
            { pos: [35, 30, 30], color: 0xFFE4B5, intensity: 2.5, angle: Math.PI / 6 },
            { pos: [0, 50, -45], color: 0xFFFFFF, intensity: 3.0, angle: Math.PI / 5 },
            { pos: [0, 50, 45], color: 0xFFFFFF, intensity: 3.0, angle: Math.PI / 5 },
            // End zone lights
            { pos: [-20, 35, 0], color: 0xBF5700, intensity: 1.5, angle: Math.PI / 8 },
            { pos: [20, 35, 0], color: 0xBF5700, intensity: 1.5, angle: Math.PI / 8 }
        ];
        
        stadiumLights.forEach((lightData, i) => {
            const light = new THREE.SpotLight(
                lightData.color, 
                lightData.intensity, 
                100, 
                lightData.angle, 
                0.3, 
                1.8
            );
            
            light.position.set(...lightData.pos);
            light.target.position.set(0, 0, 0);
            
            if (!this.isMobile) {
                light.castShadow = true;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                light.shadow.camera.near = 0.5;
                light.shadow.camera.far = 100;
            }
            
            // Add light fixture model
            const fixtureGeometry = new THREE.CylinderGeometry(0.5, 1.2, 2.5, 8);
            const fixtureMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                metalness: 0.9,
                roughness: 0.1
            });
            
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.copy(light.position);
            fixture.position.y -= 2;
            
            this.scene.add(light);
            this.scene.add(light.target);
            this.scene.add(fixture);
            this.lights.push(light);
        });
        
        // Ambient lighting with weather adjustment
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4 * this.weatherSystem.intensity);
        this.scene.add(ambientLight);
        
        // Directional lighting (moon/sun)
        const directionalLight = new THREE.DirectionalLight(0x9BB5FF, 0.6 * this.weatherSystem.intensity);
        directionalLight.position.set(-10, 50, 10);
        if (!this.isMobile) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
        }
        this.scene.add(directionalLight);
    }
    
    createIntelligentParticles() {
        // Advanced particle system with AI-driven behavior
        const particleCount = this.isMobile ? 1000 : 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        const behaviors = new Float32Array(particleCount); // AI behavior type
        
        // Enhanced brand color palette
        const brandColors = [
            new THREE.Color(0xBF5700), // Burnt Orange (Texas Heritage)
            new THREE.Color(0x9BCBEB), // Cardinal Blue  
            new THREE.Color(0x9B2222), // SEC Crimson
            new THREE.Color(0x00B2A9), // Deep Teal
            new THREE.Color(0xFFD700), // Friday Night Lights Gold
            new THREE.Color(0xF8F8FF), // Mississippi White
            new THREE.Color(0x8B0000), // Dark Red (Playoff intensity)
            new THREE.Color(0xFF6347)  // Championship glow
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Intelligent positioning - stadium zones
            const zone = Math.floor(Math.random() * 4);
            switch(zone) {
                case 0: // Field level
                    positions[i3] = (Math.random() - 0.5) * 80;
                    positions[i3 + 1] = Math.random() * 15 + 2;
                    positions[i3 + 2] = (Math.random() - 0.5) * 120;
                    break;
                case 1: // Stadium bowl
                    positions[i3] = (Math.random() - 0.5) * 120;
                    positions[i3 + 1] = Math.random() * 30 + 15;
                    positions[i3 + 2] = (Math.random() - 0.5) * 140;
                    break;
                case 2: // Upper deck
                    positions[i3] = (Math.random() - 0.5) * 100;
                    positions[i3 + 1] = Math.random() * 20 + 45;
                    positions[i3 + 2] = (Math.random() - 0.5) * 100;
                    break;
                case 3: // Sky box level
                    positions[i3] = (Math.random() - 0.5) * 60;
                    positions[i3 + 1] = Math.random() * 10 + 65;
                    positions[i3 + 2] = (Math.random() - 0.5) * 80;
                    break;
            }
            
            // Color based on zone and team affiliation
            const colorIndex = zone < 2 ? 
                Math.floor(Math.random() * 4) : // Field/bowl uses primary colors
                4 + Math.floor(Math.random() * 4); // Upper areas use accent colors
            const color = brandColors[colorIndex];
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Size based on importance and distance
            sizes[i] = Math.random() * 2 + 0.5 + (zone === 0 ? 1 : 0);
            
            // Intelligent velocity patterns
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = Math.random() * 0.01 + 0.005;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // AI behavior types
            behaviors[i] = Math.random(); // 0-1 range for different behaviors
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Advanced shader for intelligent particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: window.devicePixelRatio },
                weatherIntensity: { value: this.weatherSystem.intensity },
                mousePosition: { value: new THREE.Vector2() }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                uniform float pixelRatio;
                uniform float weatherIntensity;
                uniform vec2 mousePosition;
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Distance to mouse for interaction
                    vec2 screenPos = (mvPosition.xy / mvPosition.z + 1.0) * 0.5;
                    float mouseDistance = distance(screenPos, mousePosition);
                    float mouseEffect = 1.0 + smoothstep(0.1, 0.0, mouseDistance) * 0.5;
                    
                    // Pulsing based on time and weather
                    float pulse = 1.0 + sin(time * 2.0 + position.x * 0.1 + position.z * 0.1) * 0.3;
                    
                    // Weather intensity affects visibility
                    vOpacity = 0.7 + 0.3 * weatherIntensity * pulse;
                    
                    gl_PointSize = size * pixelRatio * mouseEffect * pulse * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    float distance = length(gl_PointCoord - 0.5);
                    float alpha = 1.0 - smoothstep(0.2, 0.5, distance);
                    
                    // Enhanced glow effect
                    float glow = 1.0 - smoothstep(0.0, 0.4, distance);
                    vec3 finalColor = vColor + (vColor * glow * 0.8);
                    
                    gl_FragColor = vec4(finalColor, alpha * vOpacity);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const points = new THREE.Points(geometry, material);
        points.userData = { 
            velocities, 
            behaviors, 
            material,
            originalPositions: positions.slice()
        };
        
        this.scene.add(points);
        this.particles.push(points);
    }
    
    createInteractiveHotspots() {
        // Create AI interaction hotspots
        const hotspotData = [
            { 
                pos: [0, 5, 0], 
                type: 'field-center', 
                info: 'Game Statistics Hub',
                color: 0xBF5700
            },
            { 
                pos: [-25, 10, -40], 
                type: 'end-zone', 
                info: 'Recruiting Zone - Texas',
                color: 0x9B2222
            },
            { 
                pos: [25, 10, 40], 
                type: 'end-zone', 
                info: 'Recruiting Zone - SEC',
                color: 0x00B2A9
            },
            { 
                pos: [0, 15, -45], 
                type: 'press-box', 
                info: 'Analytics Command Center',
                color: 0xFFD700
            },
            { 
                pos: [-30, 8, 0], 
                type: 'sideline', 
                info: 'Coaching Intelligence',
                color: 0x9BCBEB
            },
            { 
                pos: [30, 8, 0], 
                type: 'sideline', 
                info: 'Player Development',
                color: 0xF8F8FF
            }
        ];
        
        hotspotData.forEach((hotspot, i) => {
            const geometry = new THREE.SphereGeometry(1.5, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: hotspot.color,
                emissive: new THREE.Color(hotspot.color).multiplyScalar(0.2),
                metalness: 0.3,
                roughness: 0.4,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...hotspot.pos);
            mesh.userData = {
                type: hotspot.type,
                info: hotspot.info,
                originalY: hotspot.pos[1],
                pulsePhase: Math.random() * Math.PI * 2,
                isHotspot: true,
                id: i
            };
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
            const glowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(hotspot.color) }
                },
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    varying vec3 vNormal;
                    
                    void main() {
                        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                        intensity *= 0.5 + 0.5 * sin(time * 3.0);
                        gl_FragColor = vec4(color, intensity * 0.3);
                    }
                `,
                transparent: true,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(mesh.position);
            
            this.scene.add(mesh);
            this.scene.add(glow);
            this.interactiveObjects.push(mesh);
            this.particles.push(mesh);
            this.particles.push(glow);
            
            // Store hotspot data for AI interactions
            this.aiInteractions.hotspots.push({
                object: mesh,
                data: hotspot,
                glow: glow
            });
        });
    }
    
    createAtmosphericEffects() {
        // Enhanced atmospheric effects based on weather and time
        this.createVolumetricLighting();
        this.createStadiumSmoke();
        if (this.weatherSystem.condition !== 'clear') {
            this.createWeatherParticles();
        }
    }
    
    createVolumetricLighting() {
        // Volumetric lighting cones for stadium lights
        this.lights.forEach((light, i) => {
            const coneGeometry = new THREE.ConeGeometry(12, 25, 8, 1, true);
            const coneMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    intensity: { value: 0.3 },
                    color: { value: new THREE.Color(light.color) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    varying float vDistance;
                    
                    void main() {
                        vUv = uv;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        vDistance = -mvPosition.z;
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform float intensity;
                    uniform vec3 color;
                    varying vec2 vUv;
                    varying float vDistance;
                    
                    void main() {
                        float alpha = intensity * (1.0 - vUv.y) * (1.0 - vUv.y);
                        alpha *= 0.8 + 0.2 * sin(time * 2.0 + vUv.x * 10.0);
                        alpha *= (100.0 / vDistance); // Distance falloff
                        
                        gl_FragColor = vec4(color, alpha * 0.1);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.copy(light.position);
            cone.position.y -= 15;
            cone.lookAt(light.target.position);
            cone.rotateX(Math.PI);
            
            this.scene.add(cone);
            this.particles.push(cone);
        });
    }
    
    createStadiumSmoke() {
        // Stadium atmosphere smoke/mist
        const smokeCount = this.isMobile ? 50 : 100;
        const smokeGeometry = new THREE.BufferGeometry();
        const smokePositions = new Float32Array(smokeCount * 3);
        const smokeSizes = new Float32Array(smokeCount);
        const smokeVelocities = new Float32Array(smokeCount * 3);
        
        for (let i = 0; i < smokeCount; i++) {
            const i3 = i * 3;
            smokePositions[i3] = (Math.random() - 0.5) * 200;
            smokePositions[i3 + 1] = Math.random() * 10 + 2;
            smokePositions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            smokeSizes[i] = Math.random() * 8 + 4;
            
            smokeVelocities[i3] = (Math.random() - 0.5) * 0.005;
            smokeVelocities[i3 + 1] = Math.random() * 0.003 + 0.001;
            smokeVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
        }
        
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
        
        const smokeMaterial = new THREE.PointsMaterial({
            color: 0x666666,
            size: 5,
            transparent: true,
            opacity: 0.1,
            map: this.createSmokeTexture(),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData = { velocities: smokeVelocities };
        this.scene.add(smoke);
        this.particles.push(smoke);
    }
    
    createSmokeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    updateWeatherConditions() {
        // Simulate weather changes based on time
        const conditions = ['clear', 'overcast', 'fog'];
        const timeOfDay = ['dawn', 'day', 'dusk', 'night'];
        
        // Update weather periodically
        if (Math.random() < 0.001) {
            this.weatherSystem.condition = conditions[Math.floor(Math.random() * conditions.length)];
            this.weatherSystem.timeOfDay = timeOfDay[Math.floor(Math.random() * timeOfDay.length)];
            this.weatherSystem.intensity = 0.6 + Math.random() * 0.4;
            
            this.updateSceneFog();
        }
    }
    
    updateSceneFog() {
        let fogColor, fogNear, fogFar;
        
        switch(this.weatherSystem.condition) {
            case 'clear':
                fogColor = new THREE.Color(0x141d3d);
                fogNear = 60;
                fogFar = 200;
                break;
            case 'overcast':
                fogColor = new THREE.Color(0x2a2a3d);
                fogNear = 40;
                fogFar = 150;
                break;
            case 'fog':
                fogColor = new THREE.Color(0x3a3a4d);
                fogNear = 20;
                fogFar = 100;
                break;
        }
        
        this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    }
    
    setupAIInteractions() {
        // Initialize AI-powered interaction system
        this.aiInteractions.suggestions = [
            "Click on the field center to see live game statistics",
            "Explore recruiting zones to discover top prospects",
            "Visit the analytics center for predictive insights",
            "Check sideline areas for coaching intelligence"
        ];
        
        // Create floating UI hints
        this.createAIHints();
    }
    
    createAIHints() {
        // Create floating hints that appear near interactive elements
        const hintStyle = `
            position: fixed;
            background: rgba(191, 87, 0, 0.95);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: 'Inter', sans-serif;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 200px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        this.aiHintElement = document.createElement('div');
        this.aiHintElement.style.cssText = hintStyle;
        document.body.appendChild(this.aiHintElement);
    }
    
    setupAdvancedEventListeners() {
        // Enhanced mouse interaction
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update shader uniforms with mouse position
            this.particles.forEach(particle => {
                if (particle.userData.material && particle.userData.material.uniforms.mousePosition) {
                    particle.userData.material.uniforms.mousePosition.value.set(this.mouse.x, this.mouse.y);
                }
            });
            
            this.handleMouseInteraction(event);
        });
        
        // Click interaction for AI hotspots
        this.renderer.domElement.addEventListener('click', (event) => {
            this.handleClickInteraction(event);
        });
        
        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
                this.handleClickInteraction(touch);
            }
        });
        
        // Responsive resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 768;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        });
        
        // Keyboard shortcuts for AI features
        window.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }
    
    handleMouseInteraction(event) {
        // Raycast for hotspot detection
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const hotspot = intersects[0].object;
            if (hotspot.userData.isHotspot) {
                // Show AI hint
                this.showAIHint(event, hotspot.userData.info);
                
                // Enhance hotspot visual
                hotspot.material.emissiveIntensity = 0.5;
                
                // Change cursor
                document.body.style.cursor = 'pointer';
            }
        } else {
            this.hideAIHint();
            
            // Reset hotspot visuals
            this.interactiveObjects.forEach(obj => {
                if (obj.userData.isHotspot) {
                    obj.material.emissiveIntensity = 0.2;
                }
            });
            
            document.body.style.cursor = 'auto';
        }
    }
    
    handleClickInteraction(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const hotspot = intersects[0].object;
            if (hotspot.userData.isHotspot) {
                this.triggerAIInteraction(hotspot.userData);
            }
        }
    }
    
    triggerAIInteraction(hotspotData) {
        // Trigger AI-powered content based on hotspot
        const interactionEvent = new CustomEvent('blazeAIInteraction', {
            detail: {
                type: hotspotData.type,
                info: hotspotData.info,
                id: hotspotData.id,
                suggestions: this.generateContextualSuggestions(hotspotData.type)
            }
        });
        
        window.dispatchEvent(interactionEvent);
        
        // Visual feedback
        this.createInteractionEffect(hotspotData);
    }
    
    generateContextualSuggestions(type) {
        const suggestions = {
            'field-center': [
                "Show current game statistics",
                "Display team performance metrics",
                "View player positioning data",
                "Access real-time analytics"
            ],
            'end-zone': [
                "Explore recruiting prospects",
                "View commitment tracker",
                "Check transfer portal activity",
                "Analyze regional talent"
            ],
            'press-box': [
                "Open analytics dashboard",
                "View predictive models",
                "Access coaching insights",
                "Generate custom reports"
            ],
            'sideline': [
                "Player development metrics",
                "Coaching strategy analysis",
                "Training recommendations",
                "Performance comparisons"
            ]
        };
        
        return suggestions[type] || ["Explore more features"];
    }
    
    createInteractionEffect(hotspotData) {
        // Create ripple effect at interaction point
        const rippleGeometry = new THREE.RingGeometry(0, 5, 16);
        const rippleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                maxRadius: { value: 5 },
                color: { value: new THREE.Color(0xBF5700) }
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float maxRadius;
                uniform vec3 color;
                varying vec2 vUv;
                
                void main() {
                    float dist = distance(vUv, vec2(0.5));
                    float wave = sin(dist * 10.0 - time * 8.0) * 0.5 + 0.5;
                    float alpha = (1.0 - dist * 2.0) * wave * (1.0 - time * 0.5);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.copy(this.interactiveObjects[hotspotData.id].position);
        ripple.position.y += 0.1;
        
        this.scene.add(ripple);
        
        // Animate ripple
        const startTime = this.time;
        const animateRipple = () => {
            const elapsed = this.time - startTime;
            rippleMaterial.uniforms.time.value = elapsed;
            
            if (elapsed < 2.0) {
                requestAnimationFrame(animateRipple);
            } else {
                this.scene.remove(ripple);
            }
        };
        animateRipple();
    }
    
    showAIHint(event, text) {
        this.aiHintElement.textContent = text;
        this.aiHintElement.style.left = event.clientX + 10 + 'px';
        this.aiHintElement.style.top = event.clientY - 30 + 'px';
        this.aiHintElement.style.opacity = '1';
    }
    
    hideAIHint() {
        this.aiHintElement.style.opacity = '0';
    }
    
    handleKeyboardShortcuts(event) {
        switch(event.code) {
            case 'KeyC':
                if (event.ctrlKey) {
                    this.cycleCameraView();
                }
                break;
            case 'KeyW':
                if (event.ctrlKey) {
                    this.cycleWeatherCondition();
                }
                break;
            case 'KeyL':
                if (event.ctrlKey) {
                    this.toggleLightingIntensity();
                }
                break;
        }
    }
    
    cycleCameraView() {
        // Cycle through different camera perspectives
        this.cameraPathT = (this.cameraPathT + 0.25) % 1.0;
        const newPosition = this.cameraPath.getPoint(this.cameraPathT);
        
        // Smooth camera transition
        const duration = 2000;
        const startPos = this.camera.position.clone();
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(t);
            
            this.camera.position.lerpVectors(startPos, newPosition, eased);
            this.camera.lookAt(0, 0, 0);
            
            if (t < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        animateCamera();
    }
    
    cycleWeatherCondition() {
        const conditions = ['clear', 'overcast', 'fog'];
        const currentIndex = conditions.indexOf(this.weatherSystem.condition);
        this.weatherSystem.condition = conditions[(currentIndex + 1) % conditions.length];
        this.updateSceneFog();
    }
    
    toggleLightingIntensity() {
        const newIntensity = this.weatherSystem.intensity > 0.8 ? 0.5 : 1.2;
        this.weatherSystem.intensity = newIntensity;
        
        this.lights.forEach(light => {
            light.intensity = light.intensity * (newIntensity / this.weatherSystem.intensity);
        });
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    initPerformanceMonitoring() {
        setInterval(() => {
            const currentTime = performance.now();
            const fps = Math.round(1000 * this.performance.frameCount / (currentTime - this.performance.lastTime));
            
            if (fps < 20) {
                this.optimizeForLowPerformance();
            } else if (fps > 45 && this.isMobile) {
                this.enhanceForHighPerformance();
            }
            
            this.performance.lastTime = currentTime;
            this.performance.frameCount = 0;
            this.performance.fps = fps;
        }, 2000);
    }
    
    optimizeForLowPerformance() {
        // Reduce particle counts
        this.particles.forEach(particle => {
            if (particle.geometry && particle.geometry.attributes.position) {
                const positions = particle.geometry.attributes.position.array;
                if (positions.length > 1800) {
                    particle.geometry.setDrawRange(0, Math.floor(positions.length / 3 / 1.5));
                }
            }
        });
        
        // Reduce shadow quality
        this.lights.forEach(light => {
            if (light.shadow) {
                light.shadow.mapSize.width = 256;
                light.shadow.mapSize.height = 256;
            }
        });
        
        // Reduce pixel ratio
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    }
    
    enhanceForHighPerformance() {
        // Increase visual quality on capable devices
        if (this.isMobile && this.performance.fps > 45) {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.008;
        this.performance.frameCount++;
        
        this.updateParticles();
        this.updateLighting();
        this.updateCamera();
        this.updateWeatherSystem();
        this.updateInteractiveElements();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            if (particle.userData.velocities) {
                // Update intelligent particles
                const positions = particle.geometry.attributes.position.array;
                const velocities = particle.userData.velocities;
                const behaviors = particle.userData.behaviors;
                
                for (let i = 0; i < positions.length; i += 3) {
                    const behavior = behaviors[i / 3];
                    
                    // AI-driven movement patterns
                    if (behavior < 0.3) {
                        // Circular motion
                        const radius = 20 + Math.sin(this.time + i) * 10;
                        positions[i] = Math.cos(this.time * 0.5 + i * 0.1) * radius;
                        positions[i + 2] = Math.sin(this.time * 0.5 + i * 0.1) * radius;
                    } else if (behavior < 0.6) {
                        // Wave motion
                        positions[i] += velocities[i];
                        positions[i + 1] = particle.userData.originalPositions[i + 1] + 
                            Math.sin(this.time * 2 + positions[i] * 0.1) * 3;
                        positions[i + 2] += velocities[i + 2];
                    } else {
                        // Standard drift
                        positions[i] += velocities[i];
                        positions[i + 1] += velocities[i + 1];
                        positions[i + 2] += velocities[i + 2];
                    }
                    
                    // Boundary management
                    if (Math.abs(positions[i]) > 60) velocities[i] *= -1;
                    if (positions[i + 1] > 75 || positions[i + 1] < 2) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 60) velocities[i + 2] *= -1;
                }
                
                particle.geometry.attributes.position.needsUpdate = true;
                
                // Update shader uniforms
                if (particle.userData.material && particle.userData.material.uniforms) {
                    particle.userData.material.uniforms.time.value = this.time;
                    particle.userData.material.uniforms.weatherIntensity.value = this.weatherSystem.intensity;
                }
            } else if (particle.material && particle.material.uniforms) {
                // Update shader-based effects
                if (particle.material.uniforms.time) {
                    particle.material.uniforms.time.value = this.time;
                }
                if (particle.material.uniforms.weatherIntensity) {
                    particle.material.uniforms.weatherIntensity.value = this.weatherSystem.intensity;
                }
            }
            
            // Global rotation for atmospheric elements
            if (particle.rotation && index > 2) {
                particle.rotation.y += 0.0005;
            }
        });
    }
    
    updateLighting() {
        // Dynamic stadium lighting with weather effects
        this.lights.forEach((light, i) => {
            const baseIntensity = 2.0;
            const weatherMultiplier = 0.7 + 0.3 * this.weatherSystem.intensity;
            const timeVariation = 0.8 + 0.2 * Math.sin(this.time * 1.2 + i * 0.8);
            
            light.intensity = baseIntensity * weatherMultiplier * timeVariation;
            
            // Subtle movement for atmospheric effect
            const originalPos = light.userData?.originalPosition;
            if (!originalPos) {
                light.userData = { originalPosition: light.position.clone() };
            } else {
                light.position.x = originalPos.x + Math.sin(this.time * 0.5 + i) * 0.5;
                light.position.y = originalPos.y + Math.sin(this.time * 0.3 + i) * 0.3;
                light.position.z = originalPos.z + Math.cos(this.time * 0.4 + i) * 0.4;
            }
        });
    }
    
    updateCamera() {
        // Smooth camera movement with AI-driven cinematics
        const targetX = this.mouse.x * 6;
        const targetY = 25 + this.mouse.y * 2;
        
        this.camera.position.x += (targetX - this.camera.position.x) * 0.01;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.01;
        
        // Cinematic breathing motion
        this.camera.position.y += Math.sin(this.time * 0.2) * 0.5;
        this.camera.position.z = 70 + Math.sin(this.time * 0.15) * 3;
        
        // Weather-based camera shake
        if (this.weatherSystem.condition === 'rain') {
            this.camera.position.x += (Math.random() - 0.5) * 0.1;
            this.camera.position.y += (Math.random() - 0.5) * 0.1;
        }
        
        this.camera.lookAt(0, 5, 0);
    }
    
    updateWeatherSystem() {
        // Dynamic weather updates
        this.updateWeatherConditions();
        
        // Update weather-affected materials
        this.particles.forEach(particle => {
            if (particle.material && particle.material.uniforms && particle.material.uniforms.weatherIntensity) {
                particle.material.uniforms.weatherIntensity.value = this.weatherSystem.intensity;
            }
        });
    }
    
    updateInteractiveElements() {
        // Update hotspots with pulsing animations
        this.aiInteractions.hotspots.forEach(hotspot => {
            const mesh = hotspot.object;
            const glow = hotspot.glow;
            
            // Pulsing animation
            mesh.position.y = mesh.userData.originalY + 
                Math.sin(this.time * 2 + mesh.userData.pulsePhase) * 1.5;
            
            mesh.rotation.y += 0.005;
            
            // Update glow effect
            if (glow.material.uniforms.time) {
                glow.material.uniforms.time.value = this.time;
            }
        });
    }
}

// Initialize Enhanced Stadium Environment
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js and other dependencies
    setTimeout(() => {
        if (window.THREE) {
            window.blazeStadium = new BlazeAdvancedStadiumEnvironment();
            
            // Add AI interaction event listener
            window.addEventListener('blazeAIInteraction', (event) => {
                console.log('AI Interaction triggered:', event.detail);
                
                // Trigger custom event for main application
                const mainEvent = new CustomEvent('blazeAnalyticsRequest', {
                    detail: event.detail
                });
                window.dispatchEvent(mainEvent);
            });
            
            console.log('Blaze Advanced Stadium Environment initialized');
        }
    }, 300);
});