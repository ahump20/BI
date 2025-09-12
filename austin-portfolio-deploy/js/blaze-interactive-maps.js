/**
 * BLAZE INTELLIGENCE INTERACTIVE MAPS & GEOGRAPHICAL DATA
 * Professional Geographic Visualization with Three.js and Blender-Inspired Graphics
 * Stunning State Maps, Team Distributions, and Performance Heatmaps
 */

class BlazeInteractiveMaps {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        this.animationId = null;
        
        // Map data and states
        this.mapData = new Map();
        this.activeStates = [];
        this.heatmapData = [];
        this.teamMarkers = [];
        this.interactiveElements = [];
        
        // Geographic boundaries (simplified coordinates)
        this.stateGeometries = this.initializeStateGeometries();
        
        // Visual styles
        this.mapStyles = {
            terrain: {
                colors: {
                    water: 0x1e3a8a,
                    land: 0x22543d,
                    borders: 0x6b7280,
                    cities: 0xfbbf24
                }
            },
            performance: {
                colors: {
                    excellent: 0x10b981,
                    good: 0x3b82f6,
                    average: 0xf59e0b,
                    poor: 0xef4444
                }
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupMapInterface();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLighting();
            this.setupPostProcessing();
            this.setupControls();
            await this.loadGeographicData();
            this.createInteractiveMap();
            this.setupMapInteractivity();
            this.startAnimation();
            
            console.log('🗺️ Interactive Maps initialized');
        } catch (error) {
            console.error('❌ Interactive Maps initialization failed:', error);
        }
    }
    
    setupMapInterface() {
        this.container.innerHTML = `
            <div class="blaze-map-interface">
                <div class="map-controls">
                    <h2>🌎 Deep South Sports Geography</h2>
                    <div class="control-panels">
                        <div class="view-controls">
                            <button class="map-btn active" data-view="overview">🗺️ Overview</button>
                            <button class="map-btn" data-view="performance">📊 Performance</button>
                            <button class="map-btn" data-view="recruiting">🎯 Recruiting</button>
                            <button class="map-btn" data-view="facilities">🏟️ Facilities</button>
                        </div>
                        <div class="state-filters">
                            <span class="filter-label">States:</span>
                            <button class="state-btn" data-state="texas">🤠 Texas</button>
                            <button class="state-btn" data-state="louisiana">⚜️ Louisiana</button>
                            <button class="state-btn" data-state="mississippi">🌊 Mississippi</button>
                            <button class="state-btn" data-state="alabama">🌟 Alabama</button>
                            <button class="state-btn" data-state="georgia">🍑 Georgia</button>
                            <button class="state-btn" data-state="florida">🌴 Florida</button>
                        </div>
                        <div class="data-layers">
                            <span class="filter-label">Data Layers:</span>
                            <label class="layer-toggle">
                                <input type="checkbox" checked data-layer="teams">
                                <span>Team Locations</span>
                            </label>
                            <label class="layer-toggle">
                                <input type="checkbox" checked data-layer="performance">
                                <span>Performance Heat</span>
                            </label>
                            <label class="layer-toggle">
                                <input type="checkbox" data-layer="recruiting">
                                <span>Recruiting Density</span>
                            </label>
                            <label class="layer-toggle">
                                <input type="checkbox" data-layer="travel">
                                <span>Travel Routes</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="map-canvas-container">
                    <canvas id="interactive-map-canvas"></canvas>
                    <div class="map-info-overlay">
                        <div class="info-panel" id="mapInfoPanel">
                            <h3>🏆 Select a region to explore</h3>
                            <p>Click on states, cities, or team markers to view detailed analytics</p>
                        </div>
                        <div class="legend-panel">
                            <h4>Legend</h4>
                            <div class="legend-items">
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #10b981;"></div>
                                    <span>Elite Performance</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #3b82f6;"></div>
                                    <span>Strong Performance</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #f59e0b;"></div>
                                    <span>Average Performance</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #ef4444;"></div>
                                    <span>Developing Performance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="map-statistics">
                    <div class="stat-card">
                        <div class="stat-value" id="totalTeams">2,847</div>
                        <div class="stat-label">Teams Tracked</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="totalStates">6</div>
                        <div class="stat-label">States Covered</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="totalCities">156</div>
                        <div class="stat-label">Cities Mapped</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="coveragePercent">94.6%</div>
                        <div class="stat-label">Coverage Rate</div>
                    </div>
                </div>
            </div>
        `;
        
        this.addMapStyles();
        
        // Get canvas reference
        this.mapCanvas = document.getElementById('interactive-map-canvas');
    }
    
    addMapStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blaze-map-interface {
                background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 106, 107, 0.1) 100%);
                border-radius: 1rem;
                overflow: hidden;
                position: relative;
            }
            
            .map-controls {
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(20px);
                padding: 2rem;
                border-bottom: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .map-controls h2 {
                color: var(--blaze-burnt-orange, #BF5700);
                font-size: 1.75rem;
                font-weight: 800;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .control-panels {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 2rem;
                align-items: start;
            }
            
            .view-controls {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .map-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.9);
                padding: 0.75rem 1.5rem;
                border-radius: 2rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .map-btn:hover,
            .map-btn.active {
                background: var(--blaze-burnt-orange, #BF5700);
                border-color: var(--blaze-burnt-orange, #BF5700);
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(191, 87, 0, 0.3);
            }
            
            .state-filters {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .state-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                padding: 0.5rem 1rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }
            
            .state-btn:hover,
            .state-btn.active {
                background: var(--blaze-cardinals-blue, #87CEEB);
                color: var(--blaze-oil-black, #1A1A1A);
                border-color: var(--blaze-cardinals-blue, #87CEEB);
                transform: translateX(5px);
            }
            
            .data-layers {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .layer-toggle {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .layer-toggle:hover {
                color: var(--blaze-burnt-orange, #BF5700);
            }
            
            .layer-toggle input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--blaze-burnt-orange, #BF5700);
            }
            
            .filter-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.5rem;
                display: block;
            }
            
            .map-canvas-container {
                position: relative;
                height: 600px;
                overflow: hidden;
            }
            
            #interactive-map-canvas {
                width: 100%;
                height: 100%;
                display: block;
            }
            
            .map-info-overlay {
                position: absolute;
                top: 1rem;
                right: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                pointer-events: none;
            }
            
            .info-panel,
            .legend-panel {
                background: rgba(26, 26, 26, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: 0.75rem;
                padding: 1.5rem;
                color: rgba(255, 255, 255, 0.9);
                pointer-events: auto;
                min-width: 280px;
            }
            
            .info-panel h3 {
                color: var(--blaze-burnt-orange, #BF5700);
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 0.75rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .legend-panel h4 {
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
            
            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .map-statistics {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
                padding: 2rem;
                background: rgba(0, 0, 0, 0.5);
                border-top: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .stat-card {
                text-align: center;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 1.5rem;
                transition: all 0.3s ease;
            }
            
            .stat-card:hover {
                background: rgba(191, 87, 0, 0.1);
                border-color: rgba(191, 87, 0, 0.3);
                transform: translateY(-2px);
            }
            
            .stat-value {
                font-size: 2rem;
                font-weight: 900;
                background: linear-gradient(135deg, var(--blaze-burnt-orange, #BF5700), var(--blaze-cardinals-blue, #87CEEB));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
                font-family: var(--blaze-font-display, 'Inter');
            }
            
            .stat-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
            }
            
            @media (max-width: 1024px) {
                .control-panels {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .map-statistics {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .map-info-overlay {
                    position: static;
                    margin: 1rem;
                }
                
                .info-panel,
                .legend-panel {
                    min-width: unset;
                }
            }
            
            @media (max-width: 768px) {
                .map-controls {
                    padding: 1rem;
                }
                
                .view-controls {
                    flex-direction: column;
                }
                
                .map-statistics {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .map-canvas-container {
                    height: 400px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeStateGeometries() {
        // Simplified state boundary data (in production, load from GeoJSON)
        return {
            texas: {
                center: [-99.9018, 31.9686],
                bounds: [[-106.6456, 25.8371], [-93.5083, 36.5007]],
                majorCities: [
                    { name: 'Houston', coords: [-95.3698, 29.7604], teams: 15 },
                    { name: 'Dallas', coords: [-96.7970, 32.7767], teams: 18 },
                    { name: 'San Antonio', coords: [-98.4936, 29.4241], teams: 12 },
                    { name: 'Austin', coords: [-97.7431, 30.2672], teams: 8 }
                ],
                performanceScore: 87.3
            },
            louisiana: {
                center: [-91.9623, 30.9843],
                bounds: [[-94.0417, 28.9390], [-88.8584, 33.0197]],
                majorCities: [
                    { name: 'New Orleans', coords: [-90.0715, 29.9511], teams: 8 },
                    { name: 'Baton Rouge', coords: [-91.1871, 30.4515], teams: 6 },
                    { name: 'Shreveport', coords: [-93.7502, 32.5252], teams: 4 }
                ],
                performanceScore: 82.1
            },
            mississippi: {
                center: [-89.6678, 32.3617],
                bounds: [[-91.6550, 30.1730], [-88.0977, 35.0080]],
                majorCities: [
                    { name: 'Jackson', coords: [-90.1848, 32.2988], teams: 5 },
                    { name: 'Gulfport', coords: [-89.0928, 30.3674], teams: 3 },
                    { name: 'Tupelo', coords: [-88.7034, 34.2576], teams: 2 }
                ],
                performanceScore: 78.9
            },
            alabama: {
                center: [-86.7916, 32.3617],
                bounds: [[-88.4731, 30.2181], [-84.8882, 35.0080]],
                majorCities: [
                    { name: 'Birmingham', coords: [-86.8025, 33.5186], teams: 7 },
                    { name: 'Mobile', coords: [-88.0399, 30.6954], teams: 4 },
                    { name: 'Huntsville', coords: [-86.5861, 34.7304], teams: 3 }
                ],
                performanceScore: 91.2
            },
            georgia: {
                center: [-83.2572, 32.1656],
                bounds: [[-85.6051, 30.3557], [-80.8975, 35.0007]],
                majorCities: [
                    { name: 'Atlanta', coords: [-84.3880, 33.7490], teams: 12 },
                    { name: 'Savannah', coords: [-81.0912, 32.0835], teams: 4 },
                    { name: 'Augusta', coords: [-81.9748, 33.4735], teams: 3 }
                ],
                performanceScore: 89.7
            },
            florida: {
                center: [-81.7609, 27.7663],
                bounds: [[-87.6349, 24.5210], [-80.0310, 31.0007]],
                majorCities: [
                    { name: 'Jacksonville', coords: [-81.6557, 30.3322], teams: 6 },
                    { name: 'Tallahassee', coords: [-84.2807, 30.4518], teams: 4 },
                    { name: 'Gainesville', coords: [-82.3248, 29.6516], teams: 3 }
                ],
                performanceScore: 85.4
            }
        };
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f1419);
        this.scene.fog = new THREE.Fog(0x0f1419, 50, 500);
    }
    
    setupCamera() {
        const aspect = this.mapCanvas.clientWidth / this.mapCanvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 120, 80);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.mapCanvas,
            antialias: true, 
            alpha: true 
        });
        
        this.renderer.setSize(this.mapCanvas.clientWidth, this.mapCanvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    setupLighting() {
        // Ambient lighting for overall visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(50, 100, 50);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 300;
        mainLight.shadow.camera.left = -100;
        mainLight.shadow.camera.right = 100;
        mainLight.shadow.camera.top = 100;
        mainLight.shadow.camera.bottom = -100;
        this.scene.add(mainLight);
        
        // Accent lights for regions
        const accentLight1 = new THREE.PointLight(0xBF5700, 2, 100);
        accentLight1.position.set(-30, 20, 20);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x87CEEB, 1.5, 80);
        accentLight2.position.set(30, 25, -20);
        this.scene.add(accentLight2);
    }
    
    setupPostProcessing() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Subtle bloom for glowing elements
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(this.mapCanvas.clientWidth, this.mapCanvas.clientHeight),
            0.8, // strength
            0.3, // radius  
            0.9  // threshold
        );
        this.composer.addPass(bloomPass);
        
        const outputPass = new THREE.OutputPass();
        this.composer.addPass(outputPass);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.mapCanvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 30;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false;
    }
    
    async loadGeographicData() {
        // Load team performance data
        this.heatmapData = this.generatePerformanceHeatmap();
        
        // Generate recruiting data
        this.recruitingData = this.generateRecruitingData();
        
        // Create facility data
        this.facilityData = this.generateFacilityData();
        
        console.log('📊 Geographic data loaded');
    }
    
    generatePerformanceHeatmap() {
        const heatmapPoints = [];
        
        Object.entries(this.stateGeometries).forEach(([stateName, stateData]) => {
            stateData.majorCities.forEach(city => {
                const intensity = (stateData.performanceScore + (Math.random() * 20 - 10)) / 100;
                heatmapPoints.push({
                    lat: city.coords[1],
                    lng: city.coords[0],
                    intensity: Math.max(0.1, Math.min(1.0, intensity)),
                    city: city.name,
                    state: stateName,
                    teams: city.teams,
                    performance: Math.round(intensity * 100)
                });
            });
        });
        
        return heatmapPoints;
    }
    
    generateRecruitingData() {
        const recruitingHotspots = [];
        
        Object.entries(this.stateGeometries).forEach(([stateName, stateData]) => {
            const hotspotCount = Math.floor(Math.random() * 5) + 2;
            
            for (let i = 0; i < hotspotCount; i++) {
                const bounds = stateData.bounds;
                const lat = bounds[0][1] + (bounds[1][1] - bounds[0][1]) * Math.random();
                const lng = bounds[0][0] + (bounds[1][0] - bounds[0][0]) * Math.random();
                
                recruitingHotspots.push({
                    lat,
                    lng,
                    state: stateName,
                    prospects: Math.floor(Math.random() * 50) + 10,
                    avgRating: 3 + Math.random() * 2,
                    commits: Math.floor(Math.random() * 15) + 5
                });
            }
        });
        
        return recruitingHotspots;
    }
    
    generateFacilityData() {
        const facilities = [];
        
        Object.entries(this.stateGeometries).forEach(([stateName, stateData]) => {
            stateData.majorCities.forEach(city => {
                const facilityCount = Math.floor(city.teams / 3) + 1;
                
                for (let i = 0; i < facilityCount; i++) {
                    facilities.push({
                        lat: city.coords[1] + (Math.random() - 0.5) * 0.5,
                        lng: city.coords[0] + (Math.random() - 0.5) * 0.5,
                        city: city.name,
                        state: stateName,
                        type: ['Stadium', 'Training Center', 'Practice Field'][Math.floor(Math.random() * 3)],
                        capacity: Math.floor(Math.random() * 50000) + 5000,
                        rating: 3 + Math.random() * 2
                    });
                }
            });
        });
        
        return facilities;
    }
    
    createInteractiveMap() {
        this.createTerrainBase();
        this.createStateRegions();
        this.createCityMarkers();
        this.createPerformanceVisualization();
        this.createDataConnections();
    }
    
    createTerrainBase() {
        // Create terrain mesh
        const terrainGeometry = new THREE.PlaneGeometry(200, 150, 100, 75);
        const vertices = terrainGeometry.attributes.position.array;
        
        // Add realistic height variations
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            
            // Create realistic terrain features
            let height = 0;
            height += Math.sin(x * 0.02) * Math.cos(y * 0.02) * 3; // Large hills
            height += Math.sin(x * 0.05) * Math.cos(y * 0.05) * 1.5; // Medium hills
            height += Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5; // Small details
            
            vertices[i + 2] = height;
        }
        
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
        
        // Create terrain material with texture
        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a4d32,
            transparent: true,
            opacity: 0.9
        });
        
        // Add water features
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e3a8a,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.1
        });
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);
        
        // Add water plane slightly above terrain
        const waterGeometry = new THREE.PlaneGeometry(200, 150);
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.5;
        this.scene.add(water);
    }
    
    createStateRegions() {
        Object.entries(this.stateGeometries).forEach(([stateName, stateData]) => {
            const regionGroup = new THREE.Group();
            regionGroup.name = `region_${stateName}`;
            
            // Create state boundary (simplified as circular region)
            const regionSize = Math.sqrt(stateData.majorCities.length) * 15;
            const regionGeometry = new THREE.CylinderGeometry(regionSize, regionSize, 2, 32);
            
            // Color based on performance
            const performanceRatio = stateData.performanceScore / 100;
            const color = new THREE.Color().lerpColors(
                new THREE.Color(0xef4444),
                new THREE.Color(0x10b981),
                performanceRatio
            );
            
            const regionMaterial = new THREE.MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: 0.3,
                emissive: color,
                emissiveIntensity: 0.1
            });
            
            const region = new THREE.Mesh(regionGeometry, regionMaterial);
            region.position.set(
                this.coordsToPosition(stateData.center[0]),
                1,
                this.coordsToPosition(stateData.center[1])
            );
            region.userData = { 
                type: 'state_region', 
                stateName, 
                performance: stateData.performanceScore,
                cities: stateData.majorCities.length
            };
            
            regionGroup.add(region);
            this.interactiveElements.push(region);
            this.scene.add(regionGroup);
        });
    }
    
    createCityMarkers() {
        Object.entries(this.stateGeometries).forEach(([stateName, stateData]) => {
            stateData.majorCities.forEach((city, index) => {
                const markerGroup = new THREE.Group();
                markerGroup.name = `city_${city.name}`;
                
                // Create city marker
                const markerSize = Math.log(city.teams + 1) * 2;
                const markerGeometry = new THREE.ConeGeometry(markerSize, markerSize * 2, 8);
                const markerMaterial = new THREE.MeshStandardMaterial({
                    color: 0xBF5700,
                    emissive: 0xBF5700,
                    emissiveIntensity: 0.3,
                    metalness: 0.5,
                    roughness: 0.3
                });
                
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(
                    this.coordsToPosition(city.coords[0]),
                    markerSize + 2,
                    this.coordsToPosition(city.coords[1])
                );
                marker.castShadow = true;
                marker.userData = {
                    type: 'city_marker',
                    cityName: city.name,
                    stateName,
                    teams: city.teams,
                    coords: city.coords
                };
                
                // Add pulsing ring
                const ringGeometry = new THREE.RingGeometry(markerSize * 1.5, markerSize * 2, 16);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x87CEEB,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                });
                
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.copy(marker.position);
                ring.position.y = 0.1;
                ring.rotation.x = -Math.PI / 2;
                
                markerGroup.add(marker);
                markerGroup.add(ring);
                
                this.interactiveElements.push(marker);
                this.teamMarkers.push(marker);
                this.scene.add(markerGroup);
            });
        });
    }
    
    createPerformanceVisualization() {
        this.heatmapData.forEach((point, index) => {
            // Create performance visualization pillars
            const pillarHeight = point.intensity * 20;
            const pillarGeometry = new THREE.CylinderGeometry(1, 2, pillarHeight, 8);
            
            // Color based on performance intensity
            const color = new THREE.Color().lerpColors(
                new THREE.Color(0x3b82f6), // Blue for lower
                new THREE.Color(0x10b981), // Green for higher
                point.intensity
            );
            
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.8
            });
            
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                this.coordsToPosition(point.lng),
                pillarHeight / 2 + 2,
                this.coordsToPosition(point.lat)
            );
            pillar.userData = {
                type: 'performance_pillar',
                city: point.city,
                state: point.state,
                performance: point.performance,
                teams: point.teams
            };
            
            pillar.castShadow = true;
            this.interactiveElements.push(pillar);
            this.scene.add(pillar);
        });
    }
    
    createDataConnections() {
        // Create connections between major cities
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x006A6B,
            transparent: true,
            opacity: 0.4
        });
        
        const majorCities = [];
        Object.entries(this.stateGeometries).forEach(([stateName, stateData]) => {
            stateData.majorCities.forEach(city => {
                if (city.teams > 8) { // Only connect major cities
                    majorCities.push({
                        ...city,
                        state: stateName,
                        position: new THREE.Vector3(
                            this.coordsToPosition(city.coords[0]),
                            10,
                            this.coordsToPosition(city.coords[1])
                        )
                    });
                }
            });
        });
        
        // Create connections between nearby major cities
        for (let i = 0; i < majorCities.length; i++) {
            for (let j = i + 1; j < majorCities.length; j++) {
                const distance = majorCities[i].position.distanceTo(majorCities[j].position);
                
                if (distance < 60) { // Connect nearby cities
                    const curve = new THREE.QuadraticBezierCurve3(
                        majorCities[i].position,
                        new THREE.Vector3(
                            (majorCities[i].position.x + majorCities[j].position.x) / 2,
                            Math.max(majorCities[i].position.y, majorCities[j].position.y) + 8,
                            (majorCities[i].position.z + majorCities[j].position.z) / 2
                        ),
                        majorCities[j].position
                    );
                    
                    const points = curve.getPoints(30);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, connectionMaterial);
                    
                    this.scene.add(line);
                }
            }
        }
    }
    
    coordsToPosition(coord) {
        // Convert lat/lng to 3D position (simplified projection)
        return coord * 0.8;
    }
    
    setupMapInteractivity() {
        // View control buttons
        document.querySelectorAll('.map-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.dataset.view;
                this.switchMapView(view);
            });
        });
        
        // State filter buttons
        document.querySelectorAll('.state-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                
                const state = e.target.dataset.state;
                this.toggleStateVisibility(state);
            });
        });
        
        // Data layer toggles
        document.querySelectorAll('[data-layer]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const layer = e.target.dataset.layer;
                const visible = e.target.checked;
                this.toggleDataLayer(layer, visible);
            });
        });
        
        // 3D scene interaction
        this.setupSceneInteractivity();
        
        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupSceneInteractivity() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.mapCanvas.addEventListener('click', (event) => {
            const rect = this.mapCanvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.interactiveElements);
            
            if (intersects.length > 0) {
                this.handleMapElementClick(intersects[0].object);
            }
        });
        
        // Hover effects
        this.mapCanvas.addEventListener('mousemove', (event) => {
            const rect = this.mapCanvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.interactiveElements);
            
            // Reset all scales
            this.interactiveElements.forEach(element => {
                element.scale.setScalar(1);
            });
            
            // Highlight hovered element
            if (intersects.length > 0) {
                intersects[0].object.scale.setScalar(1.1);
                this.mapCanvas.style.cursor = 'pointer';
                this.showHoverInfo(intersects[0].object);
            } else {
                this.mapCanvas.style.cursor = 'default';
            }
        });
    }
    
    handleMapElementClick(element) {
        const userData = element.userData;
        const infoPanel = document.getElementById('mapInfoPanel');
        
        let content = '';
        
        switch (userData.type) {
            case 'state_region':
                content = `
                    <h3>🏛️ ${userData.stateName.charAt(0).toUpperCase() + userData.stateName.slice(1)}</h3>
                    <p><strong>Performance Score:</strong> ${userData.performance}%</p>
                    <p><strong>Major Cities:</strong> ${userData.cities}</p>
                    <p><strong>Coverage:</strong> Complete regional analytics</p>
                `;
                this.focusOnState(userData.stateName);
                break;
                
            case 'city_marker':
                content = `
                    <h3>🏙️ ${userData.cityName}</h3>
                    <p><strong>State:</strong> ${userData.stateName.charAt(0).toUpperCase() + userData.stateName.slice(1)}</p>
                    <p><strong>Teams Tracked:</strong> ${userData.teams}</p>
                    <p><strong>Coordinates:</strong> ${userData.coords[1].toFixed(2)}°N, ${Math.abs(userData.coords[0]).toFixed(2)}°W</p>
                `;
                this.focusOnCity(userData.coords);
                break;
                
            case 'performance_pillar':
                content = `
                    <h3>📊 Performance Data</h3>
                    <p><strong>Location:</strong> ${userData.city}, ${userData.state}</p>
                    <p><strong>Performance Score:</strong> ${userData.performance}%</p>
                    <p><strong>Teams:</strong> ${userData.teams}</p>
                    <p><strong>Trend:</strong> ${userData.performance > 85 ? '📈 Excellent' : userData.performance > 70 ? '📊 Good' : '📉 Developing'}</p>
                `;
                break;
        }
        
        infoPanel.innerHTML = content;
    }
    
    showHoverInfo(element) {
        // Quick hover info could be shown in a tooltip
    }
    
    switchMapView(view) {
        switch (view) {
            case 'overview':
                this.showOverviewMode();
                break;
            case 'performance':
                this.showPerformanceMode();
                break;
            case 'recruiting':
                this.showRecruitingMode();
                break;
            case 'facilities':
                this.showFacilitiesMode();
                break;
        }
    }
    
    showOverviewMode() {
        // Reset camera and show all elements
        this.camera.position.set(0, 120, 80);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Show all standard elements
        this.toggleDataLayer('teams', true);
        this.toggleDataLayer('performance', false);
        this.toggleDataLayer('recruiting', false);
    }
    
    showPerformanceMode() {
        this.toggleDataLayer('performance', true);
        this.toggleDataLayer('teams', true);
        this.toggleDataLayer('recruiting', false);
    }
    
    showRecruitingMode() {
        this.toggleDataLayer('recruiting', true);
        this.toggleDataLayer('performance', false);
        this.toggleDataLayer('teams', true);
    }
    
    showFacilitiesMode() {
        this.toggleDataLayer('teams', true);
        this.toggleDataLayer('performance', false);
        this.toggleDataLayer('recruiting', false);
    }
    
    toggleStateVisibility(stateName) {
        const regionObject = this.scene.getObjectByName(`region_${stateName}`);
        if (regionObject) {
            regionObject.visible = !regionObject.visible;
        }
        
        // Toggle related city markers
        this.teamMarkers.forEach(marker => {
            if (marker.userData.stateName === stateName) {
                marker.parent.visible = !marker.parent.visible;
            }
        });
    }
    
    toggleDataLayer(layer, visible) {
        const checkbox = document.querySelector(`[data-layer="${layer}"]`);
        if (checkbox && checkbox.checked !== visible) {
            checkbox.checked = visible;
        }
        
        switch (layer) {
            case 'teams':
                this.teamMarkers.forEach(marker => {
                    marker.parent.visible = visible;
                });
                break;
                
            case 'performance':
                this.scene.children.forEach(child => {
                    if (child.userData && child.userData.type === 'performance_pillar') {
                        child.visible = visible;
                    }
                });
                break;
                
            case 'recruiting':
                // Toggle recruiting visualizations
                break;
                
            case 'travel':
                // Toggle travel route lines
                break;
        }
    }
    
    focusOnState(stateName) {
        const stateData = this.stateGeometries[stateName];
        if (stateData) {
            const centerPos = new THREE.Vector3(
                this.coordsToPosition(stateData.center[0]),
                40,
                this.coordsToPosition(stateData.center[1]) + 30
            );
            
            // Animate camera to state
            this.animateCameraTo(centerPos, new THREE.Vector3(
                this.coordsToPosition(stateData.center[0]),
                0,
                this.coordsToPosition(stateData.center[1])
            ));
        }
    }
    
    focusOnCity(coords) {
        const cityPos = new THREE.Vector3(
            this.coordsToPosition(coords[0]),
            25,
            this.coordsToPosition(coords[1]) + 15
        );
        
        this.animateCameraTo(cityPos, new THREE.Vector3(
            this.coordsToPosition(coords[0]),
            0,
            this.coordsToPosition(coords[1])
        ));
    }
    
    animateCameraTo(position, target) {
        // Simplified camera animation (in production use GSAP)
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        let progress = 0;
        
        const animate = () => {
            progress += 0.02;
            if (progress >= 1) progress = 1;
            
            this.camera.position.lerpVectors(startPos, position, progress);
            this.controls.target.lerpVectors(startTarget, target, progress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            this.controls.update();
            this.animateMapElements();
            
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
    }
    
    animateMapElements() {
        const time = Date.now() * 0.001;
        
        // Animate city marker rings
        this.scene.children.forEach(child => {
            if (child.name && child.name.startsWith('city_')) {
                const ring = child.children.find(c => c.geometry.type === 'RingGeometry');
                if (ring) {
                    ring.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
                    ring.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
                }
            }
        });
        
        // Animate performance pillars
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.type === 'performance_pillar') {
                const baseY = child.geometry.parameters.height / 2 + 2;
                child.position.y = baseY + Math.sin(time + child.position.x * 0.1) * 0.5;
            }
        });
    }
    
    onWindowResize() {
        const width = this.mapCanvas.clientWidth;
        const height = this.mapCanvas.clientHeight;
        
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
        
        console.log('🧹 Interactive Maps disposed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.blaze-interactive-maps-container');
    if (container) {
        window.blazeInteractiveMaps = new BlazeInteractiveMaps(container);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeInteractiveMaps;
}