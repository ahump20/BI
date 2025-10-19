/**
 * 🎲 Monte Carlo 3D Probability Visualizer
 * Advanced Three.js visualizations for probability distributions
 * Integrated with Championship Stadium Engine
 */

class MonteCarloVisualizer {
    constructor(containerId = 'mcProbabilityCloud') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;

        this.config = {
            particleCount: 5000,
            cloudScale: 10,
            rotationSpeed: 0.001,
            pulseSpeed: 0.002,
            colorScheme: {
                high: new THREE.Color(0x00FF88), // Green - high probability
                medium: new THREE.Color(0xFFAA00), // Orange - medium
                low: new THREE.Color(0xFF4488) // Red - low probability
            }
        };

        this.initialize();
    }

    initialize() {
        if (!window.THREE) {
            console.warn('Three.js not loaded. Skipping 3D visualization.');
            return;
        }

        this.setupScene();
        this.createProbabilityCloud();
        this.addLighting();
        this.addControls();
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000022, 0.02);

        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 20);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
    }

    createProbabilityCloud() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        const probabilities = [];

        // Generate probability distribution points
        for (let i = 0; i < this.config.particleCount; i++) {
            // Use gaussian distribution for realistic probability cloud
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = this.gaussianRandom(0, this.config.cloudScale);

            // Convert spherical to cartesian
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions.push(x, y, z);

            // Calculate probability based on distance from center
            const probability = Math.exp(-radius * radius / (2 * this.config.cloudScale));
            probabilities.push(probability);

            // Color based on probability
            const color = this.getColorForProbability(probability);
            colors.push(color.r, color.g, color.b);

            // Size based on probability
            sizes.push(probability * 2 + 0.5);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('probability', new THREE.Float32BufferAttribute(probabilities, 1));

        // Create particle material with custom shaders
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pulseAmplitude: { value: 1.0 }
            },
            vertexShader: `
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

                    // Add subtle movement based on probability
                    float movement = sin(time + probability * 10.0) * 0.1 * probability;
                    pos += normalize(pos) * movement * pulseAmplitude;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time * 2.0) * 0.1);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vProbability;

                void main() {
                    // Circular particle shape
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);

                    if (dist > 0.5) discard;

                    // Soft edges
                    float alpha = smoothstep(0.5, 0.2, dist) * vProbability;

                    // Glow effect
                    vec3 glowColor = vColor * (1.0 + (1.0 - dist) * 0.5);

                    gl_FragColor = vec4(glowColor, alpha);
                }
            `,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Add probability surface mesh
        this.createProbabilitySurface();
    }

    createProbabilitySurface() {
        // Create a wireframe sphere to represent probability boundaries
        const geometry = new THREE.SphereGeometry(this.config.cloudScale, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x9BCBEB,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });

        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);

        // Add confidence interval rings
        this.addConfidenceRings();
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