// Advanced Visualization Engine - Blaze Intelligence
// Integrates multiple 2D/3D/4D libraries for enhanced sports analytics

class BlazeVisualizationEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.pressureStreamCanvas = null;
        this.d3Container = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize Three.js Scene (Enhanced)
            await this.initThreeJS();
            
            // Initialize D3.js Data Binding
            await this.initD3Visualizations();
            
            // Initialize Pressure Stream Canvas
            await this.initPressureStream();
            
            // Initialize WebGL Performance Metrics
            await this.initWebGLMetrics();
            
            this.initialized = true;
            console.log('🎨 Blaze Visualization Engine Initialized');
        } catch (error) {
            console.error('Visualization Engine Error:', error);
        }
    }

    async initThreeJS() {
        // Enhanced Three.js setup with advanced shaders
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Add to hero section
        const heroContainer = document.querySelector('.hero-3d-container');
        if (heroContainer) {
            heroContainer.appendChild(this.renderer.domElement);
        }

        // Create dynamic sports data visualization
        await this.createSportsDataMesh();
        
        // Start render loop
        this.animate();
    }

    async createSportsDataMesh() {
        // Sports Field Visualization with Real Data
        const fieldGeometry = new THREE.PlaneGeometry(100, 60);
        
        // Custom shader for dynamic sports data
        const fieldMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pressure: { value: 0.0 },
                winProbability: { value: 0.5 },
                playerPositions: { value: [] }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.z += sin(pos.x * 0.1 + time) * 2.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform float pressure;
                uniform float winProbability;
                
                void main() {
                    vec3 color = mix(
                        vec3(0.75, 0.34, 0.0), // Texas Orange
                        vec3(0.61, 0.80, 0.92), // Cardinal Blue
                        winProbability
                    );
                    
                    float intensity = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
                    color *= intensity * (0.5 + pressure * 0.5);
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true
        });

        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        this.scene.add(field);

        // Add player position indicators
        await this.addPlayerMarkers();
    }

    async addPlayerMarkers() {
        // Cardinals Analytics - Sample player positions
        const playerPositions = [
            { x: 20, z: 10, performance: 0.94 },
            { x: -15, z: 25, performance: 0.87 },
            { x: 30, z: -10, performance: 0.91 },
            { x: -25, z: 15, performance: 0.83 }
        ];

        playerPositions.forEach((player, index) => {
            const markerGeometry = new THREE.SphereGeometry(2, 16, 16);
            const markerMaterial = new THREE.MeshPhongMaterial({
                color: player.performance > 0.9 ? 0x00ff00 : 0xffaa00,
                transparent: true,
                opacity: 0.8
            });

            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(player.x, 3, player.z);
            this.scene.add(marker);

            // Add performance label
            this.addPerformanceLabel(marker, player.performance);
        });

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(50, 50, 50);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        this.camera.position.set(0, 80, 50);
        this.camera.lookAt(0, 0, 0);
    }

    addPerformanceLabel(marker, performance) {
        // Create text sprite for performance metrics
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, 256, 128);
        
        context.font = 'Bold 48px JetBrains Mono';
        context.fillStyle = '#BF5700';
        context.textAlign = 'center';
        context.fillText(`${(performance * 100).toFixed(1)}%`, 128, 80);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(marker.position);
        sprite.position.y += 8;
        sprite.scale.set(8, 4, 1);
        
        this.scene.add(sprite);
    }

    async initD3Visualizations() {
        // D3.js Enhanced Data Visualization
        const container = d3.select('#d3-metrics-container');
        if (container.empty()) {
            console.warn('D3 container not found');
            return;
        }

        // Real-time metrics chart
        const svg = container.append('svg')
            .attr('width', 800)
            .attr('height', 400)
            .attr('class', 'metrics-chart');

        // Performance data simulation
        const performanceData = [
            { metric: 'Accuracy', value: 94.6, target: 95 },
            { metric: 'Latency', value: 87, target: 90 },
            { metric: 'Throughput', value: 92.3, target: 90 },
            { metric: 'Coverage', value: 78.5, target: 80 }
        ];

        // Animated progress bars
        const bars = svg.selectAll('.performance-bar')
            .data(performanceData)
            .enter()
            .append('g')
            .attr('class', 'performance-bar')
            .attr('transform', (d, i) => `translate(50, ${i * 80 + 50})`);

        // Background bars
        bars.append('rect')
            .attr('width', 600)
            .attr('height', 40)
            .attr('fill', 'rgba(30, 41, 59, 0.9)')
            .attr('stroke', '#BF5700')
            .attr('stroke-width', 1);

        // Progress bars with animation
        bars.append('rect')
            .attr('width', 0)
            .attr('height', 40)
            .attr('fill', (d) => d.value >= d.target ? '#22C55E' : '#F59E0B')
            .transition()
            .duration(2000)
            .attr('width', d => (d.value / 100) * 600);

        // Labels
        bars.append('text')
            .attr('x', 10)
            .attr('y', 25)
            .attr('fill', '#E2E8F0')
            .style('font-family', 'JetBrains Mono')
            .style('font-size', '14px')
            .text(d => `${d.metric}: ${d.value}%`);
    }

    async initPressureStream() {
        // Enhanced Pressure Stream Visualization
        this.pressureStreamCanvas = document.getElementById('pressure-stream');
        if (!this.pressureStreamCanvas) {
            console.warn('Pressure stream canvas not found');
            return;
        }

        const ctx = this.pressureStreamCanvas.getContext('2d');
        this.pressureStreamCanvas.width = 800;
        this.pressureStreamCanvas.height = 300;

        // Pressure stream data points
        let pressurePoints = [];
        let winProbability = 0.5;
        let time = 0;

        const animatePressureStream = () => {
            ctx.clearRect(0, 0, this.pressureStreamCanvas.width, this.pressureStreamCanvas.height);
            
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(191, 87, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(155, 203, 235, 0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 300);

            // Generate new pressure point
            pressurePoints.push({
                x: time % 800,
                y: 150 + Math.sin(time * 0.02) * 50 + (Math.random() - 0.5) * 30,
                pressure: Math.random(),
                age: 0
            });

            // Remove old points
            pressurePoints = pressurePoints.filter(p => p.age < 100);

            // Draw pressure stream
            ctx.beginPath();
            ctx.moveTo(pressurePoints[0]?.x || 0, pressurePoints[0]?.y || 150);

            pressurePoints.forEach((point, index) => {
                point.age++;
                const alpha = 1 - (point.age / 100);
                
                ctx.strokeStyle = `rgba(191, 87, 0, ${alpha})`;
                ctx.lineWidth = 3;
                
                if (index > 0) {
                    ctx.lineTo(point.x, point.y);
                }
                
                // Pressure indicators
                ctx.fillStyle = `rgba(155, 203, 235, ${alpha * point.pressure})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.pressure * 8, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.stroke();

            // Win probability indicator
            ctx.fillStyle = '#BF5700';
            ctx.font = 'bold 24px JetBrains Mono';
            ctx.fillText(`Win Probability: ${(winProbability * 100).toFixed(1)}%`, 20, 40);

            time += 2;
            requestAnimationFrame(animatePressureStream);
        };

        animatePressureStream();
    }

    async initWebGLMetrics() {
        // WebGL Performance Monitoring
        const gl = this.renderer.getContext();
        
        const metricsDisplay = document.getElementById('webgl-metrics');
        if (metricsDisplay) {
            setInterval(() => {
                const info = this.renderer.info;
                metricsDisplay.innerHTML = `
                    <div class="metric-item">
                        <span>Triangles:</span> ${info.render.triangles.toLocaleString()}
                    </div>
                    <div class="metric-item">
                        <span>Draw Calls:</span> ${info.render.calls}
                    </div>
                    <div class="metric-item">
                        <span>Frame Rate:</span> ${Math.round(1000 / (performance.now() % 1000))} FPS
                    </div>
                `;
            }, 1000);
        }
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;

        requestAnimationFrame(() => this.animate());

        // Update shader uniforms
        this.scene.traverse((child) => {
            if (child.material && child.material.uniforms) {
                child.material.uniforms.time.value = performance.now() * 0.001;
                
                // Simulate real-time pressure data
                child.material.uniforms.pressure.value = 
                    Math.sin(performance.now() * 0.003) * 0.3 + 0.7;
                    
                child.material.uniforms.winProbability.value = 
                    Math.sin(performance.now() * 0.001) * 0.2 + 0.6;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    // Public methods for real-time data updates
    updatePlayerPositions(positions) {
        // Update player markers with real data
        if (this.scene) {
            positions.forEach((pos, index) => {
                const marker = this.scene.getObjectByName(`player-${index}`);
                if (marker) {
                    marker.position.set(pos.x, 3, pos.z);
                }
            });
        }
    }

    updateMetrics(metrics) {
        // Update D3.js visualizations with real metrics
        if (this.d3Container) {
            // Real-time data binding and transitions
            const bars = d3.selectAll('.performance-bar rect:last-child');
            bars.transition()
                .duration(500)
                .attr('width', (d, i) => (metrics[i] / 100) * 600);
        }
    }

    resize() {
        if (this.renderer && this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    window.blazeViz = new BlazeVisualizationEngine();
    await window.blazeViz.initialize();
    
    // Handle resize
    window.addEventListener('resize', () => {
        if (window.blazeViz) {
            window.blazeViz.resize();
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeVisualizationEngine;
}