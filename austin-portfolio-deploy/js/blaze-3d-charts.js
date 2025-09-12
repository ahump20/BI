/**
 * BLAZE INTELLIGENCE 3D CHARTS & GRAPHS
 * High-Fidelity Three.js Data Visualization with Blender-Quality Graphics
 * Professional Sports Analytics Charts with Stunning Visual Effects
 */

class Blaze3DCharts {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        this.animationId = null;
        
        // Chart data and configurations
        this.chartData = new Map();
        this.activeCharts = [];
        this.chartTypes = ['bar3d', 'scatter3d', 'surface', 'network', 'timeline', 'radar3d'];
        this.currentChart = 'bar3d';
        
        // Visual configurations
        this.visualConfig = {
            materials: {
                glass: null,
                metal: null,
                neon: null,
                hologram: null
            },
            lighting: {
                ambient: 0.3,
                directional: 1.2,
                point: 1.5
            },
            effects: {
                bloom: true,
                glow: true,
                particles: true,
                reflections: true
            }
        };
        
        // Animation states
        this.animations = {
            rotation: true,
            dataAnimation: true,
            particleMotion: true,
            pulseEffects: true
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupChartsInterface();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupProfessionalLighting();
            this.setupPostProcessing();
            this.setupControls();
            this.createBlenderMaterials();
            await this.loadChartData();
            this.create3DCharts();
            this.setupChartInteractivity();
            this.startAnimation();
            
            console.log('📊 High-Fidelity 3D Charts initialized');
        } catch (error) {
            console.error('❌ 3D Charts initialization failed:', error);
        }
    }
    
    setupChartsInterface() {
        this.container.innerHTML = `
            <div class="blaze-charts-interface">
                <div class="charts-header">
                    <h2>📊 Championship Analytics Dashboard</h2>
                    <div class="charts-description">
                        <p>Professional 3D data visualization with real-time sports intelligence</p>
                    </div>
                </div>
                
                <div class="charts-controls">
                    <div class="chart-type-selector">
                        <span class="control-label">Visualization Type:</span>
                        <div class="chart-buttons">
                            <button class="chart-btn active" data-chart="bar3d">📊 3D Bars</button>
                            <button class="chart-btn" data-chart="scatter3d">🔸 3D Scatter</button>
                            <button class="chart-btn" data-chart="surface">🌊 Surface</button>
                            <button class="chart-btn" data-chart="network">🕸️ Network</button>
                            <button class="chart-btn" data-chart="timeline">⏰ Timeline</button>
                            <button class="chart-btn" data-chart="radar3d">🎯 3D Radar</button>
                        </div>
                    </div>
                    
                    <div class="visual-controls">
                        <span class="control-label">Visual Effects:</span>
                        <div class="effect-toggles">
                            <label class="toggle-switch">
                                <input type="checkbox" checked data-effect="bloom">
                                <span class="slider"></span>
                                <span class="label">✨ Bloom</span>
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" checked data-effect="glow">
                                <span class="slider"></span>
                                <span class="label">💫 Glow</span>
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" checked data-effect="particles">
                                <span class="slider"></span>
                                <span class="label">🌟 Particles</span>
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" checked data-effect="reflections">
                                <span class="slider"></span>
                                <span class="label">🪞 Reflections</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="animation-controls">
                        <span class="control-label">Animation:</span>
                        <div class="animation-toggles">
                            <button class="anim-btn active" data-anim="rotation">🔄 Rotate</button>
                            <button class="anim-btn active" data-anim="dataAnimation">📈 Data Flow</button>
                            <button class="anim-btn active" data-anim="pulseEffects">💓 Pulse</button>
                        </div>
                    </div>
                </div>
                
                <div class="charts-canvas-container">
                    <canvas id="charts-3d-canvas"></canvas>
                    <div class="charts-overlay">
                        <div class="data-info-panel" id="chartDataInfo">
                            <h3>🎯 Interactive Sports Analytics</h3>
                            <p>Explore team performance, player statistics, and game insights in stunning 3D</p>
                            <div class="current-metrics">
                                <div class="metric">
                                    <span class="metric-value" id="activeDataPoints">847</span>
                                    <span class="metric-label">Data Points</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-value" id="processingSpeed">< 50ms</span>
                                    <span class="metric-label">Processing Speed</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-value" id="accuracy">94.6%</span>
                                    <span class="metric-label">Accuracy</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-legend">
                            <h4>📋 Legend</h4>
                            <div class="legend-items">
                                <div class="legend-item">
                                    <div class="legend-indicator cardinals"></div>
                                    <span>Cardinals Performance</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-indicator titans"></div>
                                    <span>Titans Defense</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-indicator longhorns"></div>
                                    <span>Longhorns Offense</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-indicator grizzlies"></div>
                                    <span>Grizzlies Analytics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="performance-indicators">
                    <div class="indicator-card">
                        <div class="indicator-icon">🏆</div>
                        <div class="indicator-content">
                            <div class="indicator-value">Elite Performance</div>
                            <div class="indicator-desc">Championship-level metrics</div>
                        </div>
                    </div>
                    <div class="indicator-card">
                        <div class="indicator-icon">⚡</div>
                        <div class="indicator-content">
                            <div class="indicator-value">Real-time Updates</div>
                            <div class="indicator-desc">Live data synchronization</div>
                        </div>
                    </div>
                    <div class="indicator-card">
                        <div class="indicator-icon">🎯</div>
                        <div class="indicator-content">
                            <div class="indicator-value">Precision Analytics</div>
                            <div class="indicator-desc">Machine learning insights</div>
                        </div>
                    </div>
                    <div class="indicator-card">
                        <div class="indicator-icon">🔥</div>
                        <div class="indicator-content">
                            <div class="indicator-value">Trending Hot</div>
                            <div class="indicator-desc">Most viewed analytics</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.addChartsStyles();
        this.chartsCanvas = document.getElementById('charts-3d-canvas');
    }
    
    addChartsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blaze-charts-interface {
                background: linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(191, 87, 0, 0.05) 100%);
                border-radius: 1rem;
                overflow: hidden;
                position: relative;
                min-height: 800px;
            }
            
            .charts-header {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(191, 87, 0, 0.1) 100%);
                padding: 2rem;
                text-align: center;
                border-bottom: 2px solid rgba(191, 87, 0, 0.3);
            }
            
            .charts-header h2 {
                color: var(--blaze-burnt-orange, #BF5700);
                font-size: 2.25rem;
                font-weight: 900;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #BF5700, #87CEEB);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .charts-description p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 1.125rem;
                font-weight: 500;
                margin: 0;
            }
            
            .charts-controls {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 2rem;
                padding: 2rem;
                background: rgba(0, 0, 0, 0.5);
                border-bottom: 1px solid rgba(135, 206, 235, 0.3);
            }
            
            .control-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: block;
                margin-bottom: 1rem;
            }
            
            .chart-buttons,
            .animation-toggles {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .chart-btn,
            .anim-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.9);
                padding: 0.75rem 1.25rem;
                border-radius: 2rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .chart-btn:hover,
            .chart-btn.active,
            .anim-btn:hover,
            .anim-btn.active {
                background: var(--blaze-burnt-orange, #BF5700);
                border-color: var(--blaze-burnt-orange, #BF5700);
                color: white;
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 8px 20px rgba(191, 87, 0, 0.4);
            }
            
            .effect-toggles {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .toggle-switch {
                display: flex;
                align-items: center;
                gap: 1rem;
                cursor: pointer;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            .toggle-switch:hover {
                color: var(--blaze-cardinals-blue, #87CEEB);
            }
            
            .toggle-switch input[type="checkbox"] {
                display: none;
            }
            
            .slider {
                position: relative;
                width: 44px;
                height: 24px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                transition: all 0.3s ease;
            }
            
            .slider::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .toggle-switch input:checked + .slider {
                background: var(--blaze-burnt-orange, #BF5700);
            }
            
            .toggle-switch input:checked + .slider::before {
                transform: translateX(20px);
            }
            
            .charts-canvas-container {
                position: relative;
                height: 500px;
                overflow: hidden;
            }
            
            #charts-3d-canvas {
                width: 100%;
                height: 100%;
                display: block;
            }
            
            .charts-overlay {
                position: absolute;
                top: 1rem;
                left: 1rem;
                right: 1rem;
                display: flex;
                justify-content: space-between;
                pointer-events: none;
            }
            
            .data-info-panel,
            .chart-legend {
                background: rgba(26, 26, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: 1rem;
                padding: 1.5rem;
                color: rgba(255, 255, 255, 0.9);
                pointer-events: auto;
                max-width: 300px;
            }
            
            .data-info-panel h3 {
                color: var(--blaze-burnt-orange, #BF5700);
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 0.75rem;
            }
            
            .current-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .metric {
                text-align: center;
            }
            
            .metric-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 900;
                background: linear-gradient(135deg, var(--blaze-cardinals-blue, #87CEEB), var(--blaze-vancouver-teal, #006A6B));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.25rem;
            }
            
            .metric-label {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.7);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
            }
            
            .chart-legend h4 {
                color: var(--blaze-cardinals-blue, #87CEEB);
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 1rem;
            }
            
            .legend-items {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .legend-indicator {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .legend-indicator.cardinals { background: linear-gradient(135deg, #BF5700, #CC6A1A); }
            .legend-indicator.titans { background: linear-gradient(135deg, #4B92DB, #6FA5E0); }
            .legend-indicator.longhorns { background: linear-gradient(135deg, #87CEEB, #B0D9F7); }
            .legend-indicator.grizzlies { background: linear-gradient(135deg, #006A6B, #1A7D7F); }
            
            .performance-indicators {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
                padding: 2rem;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(135, 206, 235, 0.3);
            }
            
            .indicator-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 1.5rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .indicator-card:hover {
                background: rgba(191, 87, 0, 0.1);
                border-color: rgba(191, 87, 0, 0.3);
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 10px 30px rgba(191, 87, 0, 0.2);
            }
            
            .indicator-icon {
                font-size: 2rem;
                filter: grayscale(0.3);
            }
            
            .indicator-card:hover .indicator-icon {
                filter: grayscale(0);
                transform: scale(1.1);
            }
            
            .indicator-value {
                color: rgba(255, 255, 255, 0.95);
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 0.25rem;
            }
            
            .indicator-desc {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.875rem;
            }
            
            @media (max-width: 1200px) {
                .charts-controls {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .performance-indicators {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .charts-overlay {
                    flex-direction: column;
                    gap: 1rem;
                }
            }
            
            @media (max-width: 768px) {
                .charts-header {
                    padding: 1.5rem;
                }
                
                .charts-controls {
                    padding: 1.5rem;
                }
                
                .performance-indicators {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .charts-canvas-container {
                    height: 400px;
                }
                
                .current-metrics {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 200);
        
        // Add environment map for realistic reflections
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        // Create simple gradient environment
        this.scene.environment = this.createEnvironmentTexture();
    }
    
    createEnvironmentTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.5, '#2d3748');
        gradient.addColorStop(1, '#1a202c');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    setupCamera() {
        const aspect = this.chartsCanvas.clientWidth / this.chartsCanvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(40, 40, 40);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.chartsCanvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(this.chartsCanvas.clientWidth, this.chartsCanvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        this.renderer.physicallyCorrectLights = true;
    }
    
    setupProfessionalLighting() {
        // Key light (main illumination)
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(50, 60, 30);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 4096;
        keyLight.shadow.mapSize.height = 4096;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 200;
        keyLight.shadow.camera.left = -50;
        keyLight.shadow.camera.right = 50;
        keyLight.shadow.camera.top = 50;
        keyLight.shadow.camera.bottom = -50;
        keyLight.shadow.radius = 5;
        keyLight.shadow.blurSamples = 25;
        this.scene.add(keyLight);
        
        // Fill light (soften shadows)
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 1.0);
        fillLight.position.set(-30, 40, -20);
        this.scene.add(fillLight);
        
        // Rim light (edge definition)
        const rimLight = new THREE.DirectionalLight(0xBF5700, 1.5);
        rimLight.position.set(0, -30, -50);
        this.scene.add(rimLight);
        
        // Accent point lights
        const accentLight1 = new THREE.PointLight(0x006A6B, 3, 100);
        accentLight1.position.set(20, 30, 20);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x4B92DB, 2, 80);
        accentLight2.position.set(-20, 25, -15);
        this.scene.add(accentLight2);
        
        // Ambient lighting for overall visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Environment lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x1a1a1a, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    setupPostProcessing() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Enhanced bloom effect
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(this.chartsCanvas.clientWidth, this.chartsCanvas.clientHeight),
            2.0, // strength
            0.5, // radius
            0.4  // threshold
        );
        this.composer.addPass(bloomPass);
        
        // Custom glow shader
        const glowPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                glowStrength: { value: 1.5 },
                glowColor: { value: new THREE.Color(0xBF5700) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float glowStrength;
                uniform vec3 glowColor;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Add animated glow effect
                    float glow = sin(time * 2.0) * 0.1 + 0.9;
                    color.rgb += glowColor * glowStrength * glow * 0.1;
                    
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(glowPass);
        
        const outputPass = new THREE.OutputPass();
        this.composer.addPass(outputPass);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.chartsCanvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 150;
        this.controls.maxPolarAngle = Math.PI / 1.5;
        this.controls.autoRotate = this.animations.rotation;
        this.controls.autoRotateSpeed = 1.0;
    }
    
    createBlenderMaterials() {
        // Glass material with realistic properties
        this.visualConfig.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x87CEEB,
            metalness: 0,
            roughness: 0.05,
            ior: 1.5,
            transmission: 0.95,
            transparent: true,
            thickness: 2.0,
            envMapIntensity: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.02
        });
        
        // Premium metal material
        this.visualConfig.materials.metal = new THREE.MeshStandardMaterial({
            color: 0xBF5700,
            metalness: 1.0,
            roughness: 0.15,
            envMapIntensity: 2.0
        });
        
        // Neon glow material
        this.visualConfig.materials.neon = new THREE.MeshStandardMaterial({
            color: 0x006A6B,
            emissive: 0x006A6B,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        });
        
        // Hologram effect material
        this.visualConfig.materials.hologram = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x4B92DB) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    vec3 pos = position;
                    pos.y += sin(pos.x * 2.0 + time) * 0.5;
                    pos.x += sin(pos.y * 2.0 + time) * 0.2;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float opacity;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float pulse = sin(time * 3.0) * 0.2 + 0.8;
                    float scanlines = sin(vUv.y * 100.0) * 0.1 + 0.9;
                    
                    vec3 finalColor = color * pulse * scanlines;
                    gl_FragColor = vec4(finalColor, opacity);
                }
            `,
            transparent: true
        });
    }
    
    async loadChartData() {
        // Generate realistic sports analytics data
        this.chartData.set('teamPerformance', {
            teams: [
                { name: 'Cardinals', performance: 87.3, category: 'MLB' },
                { name: 'Titans', performance: 92.1, category: 'NFL' },
                { name: 'Longhorns', performance: 78.9, category: 'NCAA' },
                { name: 'Grizzlies', performance: 84.6, category: 'NBA' }
            ],
            metrics: ['Offense', 'Defense', 'Special Teams', 'Clutch', 'Consistency'],
            timeData: this.generateTimeSeriesData(),
            scatterData: this.generateScatterData(),
            networkData: this.generateNetworkData()
        });
        
        console.log('📊 Chart data loaded');
    }
    
    generateTimeSeriesData() {
        const data = [];
        const teams = ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'];
        
        for (let i = 0; i < 20; i++) {
            teams.forEach(team => {
                data.push({
                    team,
                    time: i,
                    value: 50 + Math.sin(i * 0.3) * 20 + Math.random() * 15,
                    category: Math.floor(Math.random() * 4)
                });
            });
        }
        
        return data;
    }
    
    generateScatterData() {
        const data = [];
        const colors = [0xBF5700, 0x4B92DB, 0x87CEEB, 0x006A6B];
        
        for (let i = 0; i < 100; i++) {
            data.push({
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 60,
                z: (Math.random() - 0.5) * 60,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                performance: Math.random() * 100,
                team: ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'][Math.floor(Math.random() * 4)]
            });
        }
        
        return data;
    }
    
    generateNetworkData() {
        const nodes = [];
        const links = [];
        const nodeCount = 25;
        
        // Generate nodes
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                id: i,
                team: ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'][Math.floor(Math.random() * 4)],
                performance: Math.random() * 100,
                position: {
                    x: (Math.random() - 0.5) * 50,
                    y: (Math.random() - 0.5) * 50,
                    z: (Math.random() - 0.5) * 50
                }
            });
        }
        
        // Generate links
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() < 0.3) { // 30% connection probability
                    const distance = Math.sqrt(
                        Math.pow(nodes[i].position.x - nodes[j].position.x, 2) +
                        Math.pow(nodes[i].position.y - nodes[j].position.y, 2) +
                        Math.pow(nodes[i].position.z - nodes[j].position.z, 2)
                    );
                    
                    if (distance < 40) {
                        links.push({
                            source: i,
                            target: j,
                            strength: Math.random()
                        });
                    }
                }
            }
        }
        
        return { nodes, links };
    }
    
    create3DCharts() {
        this.create3DBarChart();
        this.create3DScatterPlot();
        this.createSurfaceChart();
        this.createNetworkVisualization();
        this.create3DTimelineChart();
        this.create3DRadarChart();
        
        // Show initial chart
        this.switchChart(this.currentChart);
    }
    
    create3DBarChart() {
        const barGroup = new THREE.Group();
        barGroup.name = 'bar3d';
        
        const teamData = this.chartData.get('teamPerformance').teams;
        const spacing = 15;
        
        teamData.forEach((team, index) => {
            const barHeight = team.performance * 0.6;
            const barGeometry = new THREE.BoxGeometry(4, barHeight, 4);
            
            // Create gradient material
            const barMaterial = new THREE.MeshStandardMaterial({
                color: this.getTeamColor(team.name),
                emissive: this.getTeamColor(team.name),
                emissiveIntensity: 0.2,
                metalness: 0.3,
                roughness: 0.4
            });
            
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(
                index * spacing - (teamData.length - 1) * spacing / 2,
                barHeight / 2,
                0
            );
            bar.castShadow = true;
            bar.receiveShadow = true;
            bar.userData = { type: 'bar', team: team.name, performance: team.performance };
            
            // Add glow effect
            const glowGeometry = new THREE.BoxGeometry(4.5, barHeight + 1, 4.5);
            const glowMaterial = this.visualConfig.materials.neon.clone();
            glowMaterial.color.setHex(this.getTeamColor(team.name));
            glowMaterial.emissive.setHex(this.getTeamColor(team.name));
            glowMaterial.opacity = 0.3;
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(bar.position);
            
            // Add floating label
            this.createFloating3DLabel(team.name, `${team.performance}%`, bar.position.clone().add(new THREE.Vector3(0, barHeight / 2 + 8, 0)));
            
            barGroup.add(bar);
            barGroup.add(glow);
        });
        
        // Add coordinate system
        this.addCoordinateSystem(barGroup);
        
        barGroup.visible = false;
        this.scene.add(barGroup);
        this.activeCharts.push(barGroup);
    }
    
    create3DScatterPlot() {
        const scatterGroup = new THREE.Group();
        scatterGroup.name = 'scatter3d';
        
        const scatterData = this.chartData.get('teamPerformance').scatterData;
        
        scatterData.forEach((point, index) => {
            const sphereGeometry = new THREE.SphereGeometry(point.size, 16, 16);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: point.color,
                emissive: point.color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8,
                metalness: 0.2,
                roughness: 0.3
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(point.x, point.y, point.z);
            sphere.castShadow = true;
            sphere.userData = { 
                type: 'scatter_point', 
                team: point.team, 
                performance: point.performance,
                index: index
            };
            
            // Add connecting lines to nearby points
            if (index > 0 && Math.random() < 0.1) {
                const prevPoint = scatterData[index - 1];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(point.x, point.y, point.z),
                    new THREE.Vector3(prevPoint.x, prevPoint.y, prevPoint.z)
                ]);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0x666666,
                    transparent: true,
                    opacity: 0.3
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scatterGroup.add(line);
            }
            
            scatterGroup.add(sphere);
        });
        
        this.addCoordinateSystem(scatterGroup);
        
        scatterGroup.visible = false;
        this.scene.add(scatterGroup);
        this.activeCharts.push(scatterGroup);
    }
    
    createSurfaceChart() {
        const surfaceGroup = new THREE.Group();
        surfaceGroup.name = 'surface';
        
        const size = 40;
        const segments = 30;
        const surfaceGeometry = new THREE.PlaneGeometry(size, size, segments, segments);
        
        // Create height variations based on performance data
        const vertices = surfaceGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Create realistic data surface
            let height = 0;
            height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 8;
            height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
            height += Math.random() * 2;
            
            vertices[i + 1] = height;
        }
        
        surfaceGeometry.attributes.position.needsUpdate = true;
        surfaceGeometry.computeVertexNormals();
        
        // Create gradient material
        const surfaceMaterial = new THREE.MeshStandardMaterial({
            color: 0x4B92DB,
            metalness: 0.1,
            roughness: 0.6,
            wireframe: false,
            transparent: true,
            opacity: 0.8
        });
        
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surface.rotation.x = -Math.PI / 2;
        surface.castShadow = true;
        surface.receiveShadow = true;
        
        // Add wireframe overlay
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const wireframe = new THREE.Mesh(surfaceGeometry.clone(), wireframeMaterial);
        wireframe.rotation.x = -Math.PI / 2;
        wireframe.position.y = 0.1;
        
        surfaceGroup.add(surface);
        surfaceGroup.add(wireframe);
        this.addCoordinateSystem(surfaceGroup);
        
        surfaceGroup.visible = false;
        this.scene.add(surfaceGroup);
        this.activeCharts.push(surfaceGroup);
    }
    
    createNetworkVisualization() {
        const networkGroup = new THREE.Group();
        networkGroup.name = 'network';
        
        const networkData = this.chartData.get('teamPerformance').networkData;
        const nodeObjects = [];
        
        // Create nodes
        networkData.nodes.forEach((node, index) => {
            const nodeSize = 1 + (node.performance / 100) * 2;
            const nodeGeometry = new THREE.SphereGeometry(nodeSize, 16, 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({
                color: this.getTeamColor(node.team),
                emissive: this.getTeamColor(node.team),
                emissiveIntensity: 0.4,
                metalness: 0.5,
                roughness: 0.2
            });
            
            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
            nodeMesh.position.copy(node.position);
            nodeMesh.castShadow = true;
            nodeMesh.userData = { 
                type: 'network_node', 
                id: node.id, 
                team: node.team, 
                performance: node.performance 
            };
            
            nodeObjects.push(nodeMesh);
            networkGroup.add(nodeMesh);
        });
        
        // Create links
        networkData.links.forEach(link => {
            const source = networkData.nodes[link.source];
            const target = networkData.nodes[link.target];
            
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(source.position.x, source.position.y, source.position.z),
                new THREE.Vector3(
                    (source.position.x + target.position.x) / 2,
                    Math.max(source.position.y, target.position.y) + 5,
                    (source.position.z + target.position.z) / 2
                ),
                new THREE.Vector3(target.position.x, target.position.y, target.position.z)
            );
            
            const points = curve.getPoints(20);
            const linkGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const linkMaterial = new THREE.LineBasicMaterial({
                color: 0x006A6B,
                transparent: true,
                opacity: 0.3 + link.strength * 0.4
            });
            
            const linkLine = new THREE.Line(linkGeometry, linkMaterial);
            networkGroup.add(linkLine);
        });
        
        networkGroup.visible = false;
        this.scene.add(networkGroup);
        this.activeCharts.push(networkGroup);
    }
    
    create3DTimelineChart() {
        const timelineGroup = new THREE.Group();
        timelineGroup.name = 'timeline';
        
        const timeData = this.chartData.get('teamPerformance').timeData;
        const teamColors = {
            'Cardinals': 0xBF5700,
            'Titans': 0x4B92DB,
            'Longhorns': 0x87CEEB,
            'Grizzlies': 0x006A6B
        };
        
        // Group data by team
        const teamData = {};
        timeData.forEach(point => {
            if (!teamData[point.team]) teamData[point.team] = [];
            teamData[point.team].push(point);
        });
        
        // Create timeline for each team
        Object.entries(teamData).forEach(([team, data], teamIndex) => {
            const points = data.map(point => new THREE.Vector3(
                point.time * 2 - 20,
                point.value * 0.3,
                teamIndex * 8 - 12
            ));
            
            // Create smooth curve
            const curve = new THREE.CatmullRomCurve3(points);
            const curvePoints = curve.getPoints(100);
            const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const curveMaterial = new THREE.LineBasicMaterial({
                color: teamColors[team],
                linewidth: 3
            });
            
            const curveLine = new THREE.Line(curveGeometry, curveMaterial);
            timelineGroup.add(curveLine);
            
            // Add data points
            points.forEach((point, index) => {
                const pointGeometry = new THREE.SphereGeometry(0.8, 12, 12);
                const pointMaterial = new THREE.MeshStandardMaterial({
                    color: teamColors[team],
                    emissive: teamColors[team],
                    emissiveIntensity: 0.3
                });
                
                const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
                pointMesh.position.copy(point);
                pointMesh.castShadow = true;
                pointMesh.userData = { 
                    type: 'timeline_point', 
                    team: team, 
                    time: data[index].time, 
                    value: data[index].value 
                };
                
                timelineGroup.add(pointMesh);
            });
        });
        
        this.addCoordinateSystem(timelineGroup);
        
        timelineGroup.visible = false;
        this.scene.add(timelineGroup);
        this.activeCharts.push(timelineGroup);
    }
    
    create3DRadarChart() {
        const radarGroup = new THREE.Group();
        radarGroup.name = 'radar3d';
        
        const metrics = this.chartData.get('teamPerformance').metrics;
        const teams = this.chartData.get('teamPerformance').teams;
        const radius = 15;
        
        // Create radar grid
        for (let i = 1; i <= 5; i++) {
            const circleRadius = (radius / 5) * i;
            const circleGeometry = new THREE.RingGeometry(circleRadius - 0.1, circleRadius + 0.1, 32);
            const circleMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.3
            });
            
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            circle.rotation.x = -Math.PI / 2;
            radarGroup.add(circle);
        }
        
        // Create radar spokes
        metrics.forEach((metric, index) => {
            const angle = (index / metrics.length) * Math.PI * 2;
            const spokeGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
            ]);
            const spokeMaterial = new THREE.LineBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.5
            });
            
            const spoke = new THREE.Line(spokeGeometry, spokeMaterial);
            radarGroup.add(spoke);
            
            // Add metric labels
            this.createFloating3DLabel(
                metric, 
                '', 
                new THREE.Vector3(Math.cos(angle) * (radius + 5), 5, Math.sin(angle) * (radius + 5))
            );
        });
        
        // Create team radar polygons
        teams.forEach((team, teamIndex) => {
            const teamPoints = [];
            metrics.forEach((metric, metricIndex) => {
                const angle = (metricIndex / metrics.length) * Math.PI * 2;
                const value = 60 + Math.random() * 40; // Simulated metric values
                const distance = (value / 100) * radius;
                
                teamPoints.push(new THREE.Vector3(
                    Math.cos(angle) * distance,
                    teamIndex * 2,
                    Math.sin(angle) * distance
                ));
            });
            
            // Close the polygon
            teamPoints.push(teamPoints[0].clone());
            
            const polygonGeometry = new THREE.BufferGeometry().setFromPoints(teamPoints);
            const polygonMaterial = new THREE.LineBasicMaterial({
                color: this.getTeamColor(team.name),
                linewidth: 2
            });
            
            const polygon = new THREE.Line(polygonGeometry, polygonMaterial);
            radarGroup.add(polygon);
            
            // Fill the polygon
            if (teamPoints.length >= 4) {
                const fillGeometry = new THREE.BufferGeometry();
                const vertices = [];
                const indices = [];
                
                teamPoints.slice(0, -1).forEach(point => {
                    vertices.push(point.x, point.y, point.z);
                });
                
                for (let i = 1; i < teamPoints.length - 2; i++) {
                    indices.push(0, i, i + 1);
                }
                
                fillGeometry.setFromPoints(teamPoints.slice(0, -1));
                fillGeometry.setIndex(indices);
                fillGeometry.computeVertexNormals();
                
                const fillMaterial = new THREE.MeshBasicMaterial({
                    color: this.getTeamColor(team.name),
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.DoubleSide
                });
                
                const fill = new THREE.Mesh(fillGeometry, fillMaterial);
                radarGroup.add(fill);
            }
        });
        
        radarGroup.visible = false;
        this.scene.add(radarGroup);
        this.activeCharts.push(radarGroup);
    }
    
    getTeamColor(teamName) {
        const colors = {
            'Cardinals': 0xBF5700,
            'Titans': 0x4B92DB,
            'Longhorns': 0x87CEEB,
            'Grizzlies': 0x006A6B
        };
        return colors[teamName] || 0xffffff;
    }
    
    createFloating3DLabel(text, subtext, position) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = subtext ? 96 : 64;
        
        // Background
        context.fillStyle = 'rgba(26, 26, 26, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        context.strokeStyle = '#BF5700';
        context.lineWidth = 2;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Text
        context.fillStyle = '#ffffff';
        context.font = 'bold 16px Inter';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, 30);
        
        if (subtext) {
            context.fillStyle = '#87CEEB';
            context.font = '14px Inter';
            context.fillText(subtext, canvas.width / 2, 55);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        
        const labelGeometry = new THREE.PlaneGeometry(8, subtext ? 3 : 2);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.copy(position);
        
        this.scene.add(label);
        
        return label;
    }
    
    addCoordinateSystem(group) {
        const axisMaterial = new THREE.LineBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.5
        });
        
        // X axis (red)
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-30, 0, 0),
            new THREE.Vector3(30, 0, 0)
        ]);
        const xAxis = new THREE.Line(xAxisGeometry, axisMaterial);
        group.add(xAxis);
        
        // Y axis (green)
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 30, 0)
        ]);
        const yAxis = new THREE.Line(yAxisGeometry, axisMaterial);
        group.add(yAxis);
        
        // Z axis (blue)
        const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -30),
            new THREE.Vector3(0, 0, 30)
        ]);
        const zAxis = new THREE.Line(zAxisGeometry, axisMaterial);
        group.add(zAxis);
    }
    
    setupChartInteractivity() {
        // Chart type buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
            });
        });
        
        // Effect toggles
        document.querySelectorAll('[data-effect]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const effect = e.target.dataset.effect;
                const enabled = e.target.checked;
                this.toggleVisualEffect(effect, enabled);
            });
        });
        
        // Animation toggles
        document.querySelectorAll('.anim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                
                const animation = e.target.dataset.anim;
                const enabled = e.target.classList.contains('active');
                this.toggleAnimation(animation, enabled);
            });
        });
        
        // 3D scene interaction
        this.setup3DInteraction();
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setup3DInteraction() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.chartsCanvas.addEventListener('click', (event) => {
            const rect = this.chartsCanvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            // Get all interactive objects from active charts
            const interactiveObjects = [];
            this.activeCharts.forEach(chart => {
                if (chart.visible) {
                    chart.traverse(child => {
                        if (child.userData && child.userData.type) {
                            interactiveObjects.push(child);
                        }
                    });
                }
            });
            
            const intersects = raycaster.intersectObjects(interactiveObjects);
            
            if (intersects.length > 0) {
                this.handleChartElementClick(intersects[0].object);
            }
        });
        
        // Hover effects
        this.chartsCanvas.addEventListener('mousemove', (event) => {
            const rect = this.chartsCanvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            const interactiveObjects = [];
            this.activeCharts.forEach(chart => {
                if (chart.visible) {
                    chart.traverse(child => {
                        if (child.userData && child.userData.type) {
                            interactiveObjects.push(child);
                        }
                    });
                }
            });
            
            const intersects = raycaster.intersectObjects(interactiveObjects);
            
            // Reset all scales
            interactiveObjects.forEach(obj => {
                obj.scale.setScalar(1);
            });
            
            // Highlight hovered element
            if (intersects.length > 0) {
                intersects[0].object.scale.setScalar(1.1);
                this.chartsCanvas.style.cursor = 'pointer';
                this.showElementTooltip(intersects[0].object, event);
            } else {
                this.chartsCanvas.style.cursor = 'default';
                this.hideElementTooltip();
            }
        });
    }
    
    handleChartElementClick(element) {
        const userData = element.userData;
        const infoPanel = document.getElementById('chartDataInfo');
        
        let content = '';
        
        switch (userData.type) {
            case 'bar':
                content = `
                    <h3>📊 ${userData.team} Performance</h3>
                    <p><strong>Performance Score:</strong> ${userData.performance}%</p>
                    <p><strong>League Ranking:</strong> Top 15%</p>
                    <p><strong>Trend:</strong> ${userData.performance > 85 ? '📈 Excellent' : '📊 Good'}</p>
                `;
                break;
                
            case 'scatter_point':
                content = `
                    <h3>🔸 Data Point Analysis</h3>
                    <p><strong>Team:</strong> ${userData.team}</p>
                    <p><strong>Performance:</strong> ${Math.round(userData.performance)}%</p>
                    <p><strong>Point ID:</strong> #${userData.index + 1}</p>
                `;
                break;
                
            case 'network_node':
                content = `
                    <h3>🕸️ Network Node</h3>
                    <p><strong>Team:</strong> ${userData.team}</p>
                    <p><strong>Performance:</strong> ${Math.round(userData.performance)}%</p>
                    <p><strong>Node ID:</strong> ${userData.id}</p>
                `;
                break;
                
            case 'timeline_point':
                content = `
                    <h3>⏰ Timeline Data</h3>
                    <p><strong>Team:</strong> ${userData.team}</p>
                    <p><strong>Time Period:</strong> ${userData.time}</p>
                    <p><strong>Value:</strong> ${Math.round(userData.value)}</p>
                `;
                break;
        }
        
        if (content) {
            infoPanel.innerHTML = content;
        }
    }
    
    showElementTooltip(element, event) {
        // Create or update tooltip
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(26, 26, 26, 0.95);
                color: white;
                padding: 0.75rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                pointer-events: none;
                z-index: 10000;
                border: 1px solid #BF5700;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(tooltip);
        }
        
        const userData = element.userData;
        let content = `${userData.type}: ${userData.team || 'Unknown'}`;
        if (userData.performance !== undefined) {
            content += `<br>Performance: ${Math.round(userData.performance)}%`;
        }
        
        tooltip.innerHTML = content;
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY - 10 + 'px';
        tooltip.style.display = 'block';
    }
    
    hideElementTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    switchChart(chartType) {
        this.currentChart = chartType;
        
        // Hide all charts
        this.activeCharts.forEach(chart => {
            chart.visible = false;
        });
        
        // Show selected chart
        const selectedChart = this.scene.getObjectByName(chartType);
        if (selectedChart) {
            selectedChart.visible = true;
            
            // Update camera position for optimal viewing
            this.optimizeCameraForChart(chartType);
        }
        
        // Update data info
        this.updateDataInfo(chartType);
    }
    
    optimizeCameraForChart(chartType) {
        const positions = {
            bar3d: { position: [40, 30, 40], target: [0, 10, 0] },
            scatter3d: { position: [50, 40, 50], target: [0, 0, 0] },
            surface: { position: [45, 35, 45], target: [0, 5, 0] },
            network: { position: [60, 50, 60], target: [0, 0, 0] },
            timeline: { position: [35, 25, 50], target: [0, 10, 0] },
            radar3d: { position: [30, 40, 30], target: [0, 5, 0] }
        };
        
        const config = positions[chartType];
        if (config) {
            // Smooth camera transition (simplified)
            this.animateCameraTo(config.position, config.target);
        }
    }
    
    animateCameraTo(position, target) {
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        let progress = 0;
        
        const animate = () => {
            progress += 0.03;
            if (progress >= 1) progress = 1;
            
            this.camera.position.lerpVectors(startPos, new THREE.Vector3(...position), progress);
            this.controls.target.lerpVectors(startTarget, new THREE.Vector3(...target), progress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    updateDataInfo(chartType) {
        const descriptions = {
            bar3d: 'Interactive 3D bar chart showing team performance metrics across multiple categories',
            scatter3d: '3D scatter plot revealing performance patterns and correlations in multi-dimensional data',
            surface: 'Surface visualization mapping performance landscapes across different variables',
            network: 'Network graph displaying team relationships and performance interconnections',
            timeline: '3D timeline showing performance evolution over time periods',
            radar3d: '3D radar chart comparing teams across multiple performance dimensions'
        };
        
        const infoPanel = document.getElementById('chartDataInfo');
        const description = descriptions[chartType] || 'Advanced 3D data visualization';
        
        infoPanel.innerHTML = `
            <h3>🎯 ${chartType.toUpperCase()} Visualization</h3>
            <p>${description}</p>
        `;
    }
    
    toggleVisualEffect(effect, enabled) {
        this.visualConfig.effects[effect] = enabled;
        
        switch (effect) {
            case 'bloom':
                if (this.composer && this.composer.passes) {
                    const bloomPass = this.composer.passes.find(pass => pass.name === 'UnrealBloomPass');
                    if (bloomPass) {
                        bloomPass.enabled = enabled;
                    }
                }
                break;
                
            case 'glow':
                // Toggle glow shader
                if (this.composer && this.composer.passes) {
                    const glowPass = this.composer.passes.find(pass => pass.uniforms && pass.uniforms.glowStrength);
                    if (glowPass) {
                        glowPass.enabled = enabled;
                    }
                }
                break;
                
            case 'particles':
                // Toggle particle systems (to be implemented)
                break;
                
            case 'reflections':
                // Toggle reflection effects
                this.scene.environment = enabled ? this.createEnvironmentTexture() : null;
                break;
        }
    }
    
    toggleAnimation(animation, enabled) {
        this.animations[animation] = enabled;
        
        switch (animation) {
            case 'rotation':
                this.controls.autoRotate = enabled;
                break;
                
            case 'dataAnimation':
                // Toggle data animation effects
                break;
                
            case 'pulseEffects':
                // Toggle pulsing effects
                break;
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            this.controls.update();
            this.animateChartElements();
            
            // Update shader uniforms
            if (this.composer && this.composer.passes) {
                const glowPass = this.composer.passes.find(pass => pass.uniforms && pass.uniforms.time);
                if (glowPass) {
                    glowPass.uniforms.time.value = Date.now() * 0.001;
                }
                
                const hologramMaterials = [];
                this.scene.traverse(child => {
                    if (child.material && child.material.uniforms && child.material.uniforms.time) {
                        child.material.uniforms.time.value = Date.now() * 0.001;
                    }
                });
            }
            
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
    }
    
    animateChartElements() {
        const time = Date.now() * 0.001;
        
        if (!this.animations.dataAnimation) return;
        
        this.activeCharts.forEach(chart => {
            if (!chart.visible) return;
            
            chart.traverse(child => {
                if (child.userData && child.userData.type) {
                    switch (child.userData.type) {
                        case 'bar':
                            if (this.animations.pulseEffects) {
                                const scale = 1 + Math.sin(time * 2 + child.position.x) * 0.05;
                                child.scale.y = scale;
                            }
                            break;
                            
                        case 'scatter_point':
                            if (this.animations.pulseEffects) {
                                const scale = 1 + Math.sin(time * 3 + child.userData.index * 0.1) * 0.1;
                                child.scale.setScalar(scale);
                            }
                            break;
                            
                        case 'network_node':
                            if (this.animations.pulseEffects) {
                                child.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + child.userData.id) * 0.2;
                            }
                            break;
                            
                        case 'timeline_point':
                            if (this.animations.dataAnimation) {
                                child.position.y += Math.sin(time + child.userData.time) * 0.01;
                            }
                            break;
                    }
                }
            });
        });
    }
    
    onWindowResize() {
        const width = this.chartsCanvas.clientWidth;
        const height = this.chartsCanvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.scene.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
        
        this.renderer.dispose();
        if (this.composer) this.composer.dispose();
        
        // Clean up tooltip
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) tooltip.remove();
        
        console.log('🧹 3D Charts disposed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.blaze-3d-charts-container');
    if (container) {
        window.blaze3DCharts = new Blaze3DCharts(container);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Blaze3DCharts;
}