// Enhanced Three.js Visualization System for Blaze Intelligence
// Advanced neural network, particle systems, and data visualization

class BlazeNeuralVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.particles = null;
        this.connections = [];
        this.dataPoints = [];
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Camera position
        this.camera.position.set(0, 0, 30);
        
        // Create neural network structure
        this.createNeuralNetwork();
        
        // Create data visualization layers
        this.createDataLayers();
        
        // Add interactive elements
        this.setupInteraction();
        
        // Add lighting
        this.setupLighting();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    createNeuralNetwork() {
        // Create layered neural network structure
        const layers = 5;
        const nodesPerLayer = [8, 16, 32, 16, 8];
        const layerColors = [
            new THREE.Color('#BF5700'), // Burnt Orange
            new THREE.Color('#9BCBEB'), // Texas Sky Blue
            new THREE.Color('#9B2222'), // SEC Crimson
            new THREE.Color('#FFD700'), // Friday Lights
            new THREE.Color('#1B4332')  // Louisiana Bayou
        ];
        
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        
        // Create nodes for each layer
        for (let layer = 0; layer < layers; layer++) {
            const z = (layer - layers / 2) * 8;
            const nodeCount = nodesPerLayer[layer];
            const color = layerColors[layer];
            
            for (let i = 0; i < nodeCount; i++) {
                const angle = (i / nodeCount) * Math.PI * 2;
                const radius = 10 - layer * 1.5;
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                positions.push(x, y, z);
                colors.push(color.r, color.g, color.b);
                sizes.push(Math.random() * 3 + 2);
                
                // Store node data for connections
                this.dataPoints.push({ x, y, z, layer, index: i });
            }
        }
        
        // Set attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        // Create shader material for advanced rendering
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mousePosition: { value: new THREE.Vector2(0, 0) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform vec2 mousePosition;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Add wave animation
                    pos.x += sin(time * 0.001 + position.y * 0.1) * 0.5;
                    pos.y += cos(time * 0.001 + position.x * 0.1) * 0.5;
                    
                    // Mouse interaction
                    float dist = distance(mousePosition * 10.0, pos.xy);
                    float influence = 1.0 / (1.0 + dist * 0.1);
                    pos.z += influence * 2.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - distance * 2.0;
                    alpha = pow(alpha, 2.0);
                    
                    vec3 color = vColor;
                    
                    // Add glow effect
                    color += vec3(0.2) * (1.0 - distance);
                    
                    gl_FragColor = vec4(color, alpha * 0.9);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        // Create connections between layers
        this.createConnections();
    }
    
    createConnections() {
        // Create dynamic connections between neural network layers
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x9BCBEB,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        
        // Connect adjacent layers
        for (let i = 0; i < this.dataPoints.length; i++) {
            const node1 = this.dataPoints[i];
            
            for (let j = i + 1; j < this.dataPoints.length; j++) {
                const node2 = this.dataPoints[j];
                
                // Only connect adjacent layers
                if (Math.abs(node2.layer - node1.layer) === 1) {
                    // Random connection probability
                    if (Math.random() > 0.7) {
                        const geometry = new THREE.BufferGeometry();
                        const positions = [
                            node1.x, node1.y, node1.z,
                            node2.x, node2.y, node2.z
                        ];
                        
                        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                        
                        const line = new THREE.Line(geometry, connectionMaterial.clone());
                        this.connections.push(line);
                        this.scene.add(line);
                    }
                }
            }
        }
    }
    
    createDataLayers() {
        // Create floating data visualization elements
        const dataGeometry = new THREE.BufferGeometry();
        const dataPositions = [];
        const dataColors = [];
        
        // Create data points around the neural network
        for (let i = 0; i < 500; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 25 + Math.random() * 15;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            dataPositions.push(x, y, z);
            
            // Random color from theme
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                dataColors.push(0.75, 0.34, 0); // Burnt Orange
            } else if (colorChoice < 0.66) {
                dataColors.push(0.61, 0.80, 0.92); // Texas Sky Blue
            } else {
                dataColors.push(0.61, 0.13, 0.13); // SEC Crimson
            }
        }
        
        dataGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dataPositions, 3));
        dataGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dataColors, 3));
        
        const dataMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const dataCloud = new THREE.Points(dataGeometry, dataMaterial);
        this.scene.add(dataCloud);
        
        // Store reference for animation
        this.dataCloud = dataCloud;
    }
    
    setupLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Add point lights for dramatic effect
        const light1 = new THREE.PointLight(0xBF5700, 1, 100);
        light1.position.set(20, 20, 20);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0x9BCBEB, 1, 100);
        light2.position.set(-20, -20, 20);
        this.scene.add(light2);
    }
    
    setupInteraction() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Touch support for mobile
        document.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                this.mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 1;
        
        // Update shader uniforms
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = this.time;
            this.particles.material.uniforms.mousePosition.value.set(this.mouseX, this.mouseY);
        }
        
        // Rotate main neural network
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x = Math.sin(this.time * 0.0005) * 0.1;
        }
        
        // Animate data cloud
        if (this.dataCloud) {
            this.dataCloud.rotation.y -= 0.0005;
            this.dataCloud.rotation.z += 0.0003;
        }
        
        // Animate connections
        this.connections.forEach((connection, index) => {
            const opacity = 0.1 + Math.sin(this.time * 0.01 + index * 0.5) * 0.1;
            connection.material.opacity = opacity;
        });
        
        // Camera movement based on mouse
        this.camera.position.x += (this.mouseX * 5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (-this.mouseY * 5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    // Public methods for external control
    updateDataIntensity(intensity) {
        if (this.dataCloud && this.dataCloud.material) {
            this.dataCloud.material.opacity = 0.3 + intensity * 0.4;
        }
    }
    
    pulseNetwork() {
        // Create a pulse effect through the network
        this.connections.forEach((connection, index) => {
            setTimeout(() => {
                const originalOpacity = connection.material.opacity;
                connection.material.opacity = 0.8;
                setTimeout(() => {
                    connection.material.opacity = originalOpacity;
                }, 200);
            }, index * 10);
        });
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.BlazeNeuralVisualization = BlazeNeuralVisualization;
}

// Initialize on page load if canvas exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('neural-canvas')) {
        const visualization = new BlazeNeuralVisualization('neural-canvas');
        
        // Expose to global scope for external control
        window.blazeVisualization = visualization;
        
        // Add periodic pulse effect
        setInterval(() => {
            visualization.pulseNetwork();
        }, 8000);
        
        // Update data intensity based on time of day
        const hour = new Date().getHours();
        const intensity = (hour >= 18 || hour <= 6) ? 0.8 : 0.5;
        visualization.updateDataIntensity(intensity);
    }
});