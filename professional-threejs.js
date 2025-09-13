// Professional Three.js Stadium Environment for Blaze Intelligence
// Enhanced version using latest Three.js features and professional practices

class BlazeStadiumEnvironment {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.particles = [];
        this.lights = [];
        this.time = 0;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isMobile = window.innerWidth < 768;
        
        if (window.THREE) {
            this.init();
        }
    }
    
    init() {
        // Scene setup with atmospheric fog
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x141d3d, 50, 200);
        
        // Camera with dynamic positioning
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 60);
        this.camera.lookAt(0, 0, 0);
        
        // High-performance renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: !this.isMobile,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1 : 2));
        this.renderer.shadowMap.enabled = !this.isMobile;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Canvas setup
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        this.renderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(this.renderer.domElement);
        
        // Create stadium atmosphere
        this.createStadiumLights();
        this.createBrandedParticles();
        this.createAtmosphericEffects();
        this.createInteractiveNodes();
        
        this.setupEventListeners();
        this.animate();
    }
    
    createStadiumLights() {
        // Professional stadium lighting setup
        const lightPositions = [
            { x: -30, y: 25, z: -25 },
            { x: 30, y: 25, z: -25 },
            { x: -30, y: 25, z: 25 },
            { x: 30, y: 25, z: 25 },
            { x: 0, y: 40, z: -40 },
            { x: 0, y: 40, z: 40 }
        ];
        
        lightPositions.forEach((pos, i) => {
            const light = new THREE.SpotLight(0xFFE4B5, 1.8, 80, Math.PI / 7, 0.2, 1.5);
            light.position.set(pos.x, pos.y, pos.z);
            light.target.position.set(0, 0, 0);
            
            if (!this.isMobile) {
                light.castShadow = true;
                light.shadow.mapSize.width = 512;
                light.shadow.mapSize.height = 512;
            }
            
            this.scene.add(light);
            this.scene.add(light.target);
            this.lights.push(light);
        });
        
        // Ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambientLight);
        
        // Directional moonlight
        const directionalLight = new THREE.DirectionalLight(0x9BB5FF, 0.6);
        directionalLight.position.set(-10, 40, 10);
        this.scene.add(directionalLight);
    }
    
    createBrandedParticles() {
        // Blaze Intelligence branded particle system
        const particleCount = this.isMobile ? 800 : 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        // Brand color palette
        const brandColors = [
            new THREE.Color(0xBF5700), // Burnt Orange (Texas Heritage)
            new THREE.Color(0x9BCBEB), // Cardinal Blue  
            new THREE.Color(0x9B2222), // SEC Crimson
            new THREE.Color(0x00B2A9), // Deep Teal
            new THREE.Color(0xFFD700), // Friday Night Lights Gold
            new THREE.Color(0xF8F8FF)  // Mississippi White
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Stadium formation positioning
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = Math.random() * 50 + 5;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            // Brand colors
            const color = brandColors[Math.floor(Math.random() * brandColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Varying sizes
            sizes[i] = Math.random() * 1.5 + 0.3;
            
            // Gentle drift velocities
            velocities[i3] = (Math.random() - 0.5) * 0.015;
            velocities[i3 + 1] = Math.random() * 0.008;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.015;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Custom shader for enhanced particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: window.devicePixelRatio }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                uniform float pixelRatio;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float pulseFactor = 1.0 + sin(time * 3.0 + position.x * 0.1) * 0.2;
                    gl_PointSize = size * pixelRatio * pulseFactor * (250.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - 0.5);
                    float alpha = 1.0 - smoothstep(0.2, 0.5, distance);
                    float glow = 1.0 - smoothstep(0.0, 0.3, distance);
                    vec3 finalColor = vColor + (vColor * glow * 0.5);
                    gl_FragColor = vec4(finalColor, alpha * 0.9);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const points = new THREE.Points(geometry, material);
        points.userData = { velocities, material };
        this.scene.add(points);
        this.particles.push(points);
    }
    
    createAtmosphericEffects() {
        // Atmospheric glow sphere
        const glowGeometry = new THREE.SphereGeometry(80, 16, 16);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x141d3d) },
                color2: { value: new THREE.Color(0x000511) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                
                void main() {
                    float noise = sin(vUv.x * 8.0 + time * 0.5) * sin(vUv.y * 8.0 + time * 0.3) * 0.1;
                    vec3 color = mix(color1, color2, vUv.y + noise);
                    gl_FragColor = vec4(color, 0.15);
                }
            `,
            transparent: true,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glow);
        this.particles.push(glow);
        
        // Data stream lines
        if (!this.isMobile) {
            this.createDataStreams();
        }
    }
    
    createDataStreams() {
        // Animated data visualization streams
        for (let i = 0; i < 8; i++) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-40 + Math.random() * 80, 5 + Math.random() * 15, -40 + Math.random() * 80),
                new THREE.Vector3(-20 + Math.random() * 40, 15 + Math.random() * 10, -20 + Math.random() * 40),
                new THREE.Vector3(20 + Math.random() * 40, 25 + Math.random() * 5, 20 + Math.random() * 40),
                new THREE.Vector3(40 + Math.random() * 80, 30 + Math.random() * 5, 40 + Math.random() * 80)
            ]);
            
            const geometry = new THREE.TubeGeometry(curve, 16, 0.08, 6, false);
            const hue = Math.random() * 0.6; // Warmer hues
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(hue, 0.8, 0.6),
                transparent: true,
                opacity: 0.4
            });
            
            const stream = new THREE.Mesh(geometry, material);
            stream.userData = { 
                originalOpacity: material.opacity,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.0
            };
            this.scene.add(stream);
            this.particles.push(stream);
        }
    }
    
    createInteractiveNodes() {
        // Interactive data nodes representing sports analytics
        const nodeGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        
        for (let i = 0; i < 6; i++) {
            const material = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0xBF5700 : 0x00B2A9,
                emissive: i % 2 === 0 ? 0x331100 : 0x003330,
                metalness: 0.7,
                roughness: 0.3
            });
            
            const node = new THREE.Mesh(nodeGeometry, material);
            node.position.set(
                (Math.random() - 0.5) * 50,
                8 + Math.random() * 15,
                (Math.random() - 0.5) * 50
            );
            node.userData = {
                originalY: node.position.y,
                pulsePhase: Math.random() * Math.PI * 2,
                rotationSpeed: 0.005 + Math.random() * 0.01
            };
            this.scene.add(node);
            this.particles.push(node);
        }
    }
    
    setupEventListeners() {
        // Mouse tracking for subtle camera movement
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Responsive resize handling
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 768;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1 : 2));
        });
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }
    
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        setInterval(() => {
            const currentTime = performance.now();
            const fps = Math.round(1000 * frameCount / (currentTime - lastTime));
            
            if (fps < 25) {
                this.optimizeForPerformance();
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }, 2000);
    }
    
    optimizeForPerformance() {
        // Dynamic performance optimization
        this.particles.forEach(particle => {
            if (particle.geometry && particle.geometry.attributes.position) {
                const positions = particle.geometry.attributes.position.array;
                if (positions.length > 2400) {
                    particle.geometry.setDrawRange(0, Math.floor(positions.length / 3 / 1.5));
                }
            }
        });
        
        // Reduce lighting quality
        this.lights.forEach(light => {
            if (light.shadow) {
                light.shadow.mapSize.width = 256;
                light.shadow.mapSize.height = 256;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.008;
        
        this.updateParticles();
        this.updateLighting();
        this.updateCamera();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            if (particle.userData.velocities) {
                // Update floating particles
                const positions = particle.geometry.attributes.position.array;
                const velocities = particle.userData.velocities;
                
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];
                    
                    // Boundary management
                    if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
                    if (positions[i + 1] > 55 || positions[i + 1] < 5) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 50) velocities[i + 2] *= -1;
                }
                
                particle.geometry.attributes.position.needsUpdate = true;
                particle.userData.material.uniforms.time.value = this.time;
                
            } else if (particle.userData.originalOpacity !== undefined) {
                // Data streams animation
                const opacity = particle.userData.originalOpacity * 
                    (0.3 + 0.7 * Math.sin(this.time * particle.userData.speed + particle.userData.phase));
                particle.material.opacity = opacity;
                
            } else if (particle.userData.originalY !== undefined) {
                // Interactive nodes
                particle.position.y = particle.userData.originalY + 
                    Math.sin(this.time * 2 + particle.userData.pulsePhase) * 1.5;
                particle.rotation.y += particle.userData.rotationSpeed;
                particle.material.emissiveIntensity = 0.1 + 0.1 * Math.sin(this.time * 3);
                
            } else if (particle.material && particle.material.uniforms) {
                // Atmospheric effects
                if (particle.material.uniforms.time) {
                    particle.material.uniforms.time.value = this.time;
                }
                particle.rotation.y += 0.0008;
            }
        });
    }
    
    updateLighting() {
        // Dynamic stadium lighting
        this.lights.forEach((light, i) => {
            const baseIntensity = 1.5;
            const pulseIntensity = 0.3 * Math.sin(this.time * 1.5 + i * 0.7);
            light.intensity = baseIntensity + pulseIntensity;
            
            // Subtle movement
            light.position.y += Math.sin(this.time * 0.8 + i) * 0.05;
        });
    }
    
    updateCamera() {
        // Smooth mouse-responsive camera movement
        const targetX = this.mouse.x * 8;
        const targetY = 20 + this.mouse.y * 3;
        
        this.camera.position.x += (targetX - this.camera.position.x) * 0.015;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.015;
        
        // Subtle breathing motion
        this.camera.position.y += Math.sin(this.time * 0.3) * 0.3;
        this.camera.position.z = 60 + Math.sin(this.time * 0.2) * 2;
        
        this.camera.lookAt(0, 0, 0);
    }
}

// Initialize Professional Stadium Environment
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.THREE) {
            new BlazeStadiumEnvironment();
        }
    }, 500);
});