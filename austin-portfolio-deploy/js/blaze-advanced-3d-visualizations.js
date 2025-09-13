/**
 * BLAZE INTELLIGENCE ADVANCED 3D VISUALIZATIONS
 * Professional Three.js Implementation with Blender-Inspired Graphics
 * Stunning Data Maps, Charts, and Interactive Visualizations
 */

class BlazeAdvanced3DVisualizations {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        this.animationId = null;
        
        // Data visualization objects
        this.dataObjects = new Map();
        this.interactiveElements = [];
        this.visualizationModes = ['map', 'network', 'timeline', 'performance'];
        this.currentMode = 'map';
        
        // Blender-inspired materials and effects
        this.materials = {
            glass: null,
            metal: null,
            emission: null,
            carbon: null
        };
        
        // Performance optimization
        this.performanceConfig = {
            enableShadows: true,
            enablePostProcessing: true,
            particleCount: 5000,
            maxLOD: 3
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLighting();
            this.setupPostProcessing();
            this.setupControls();
            this.createBlenderMaterials();
            await this.loadGeometryResources();
            this.createDataVisualizations();
            this.setupInteractivity();
            this.startAnimation();
            
            console.log('🎨 Advanced 3D Visualizations initialized');
        } catch (error) {
            console.error('❌ 3D Visualization initialization failed:', error);
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 1000);
        
        // Add environment mapping for realistic reflections
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const environmentMap = cubeTextureLoader.load([
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTIzXzQ1NikiLz4KPGV0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTIzXzQ1NiIgeDE9IjUxMiIgeTE9IjAiIHgyPSI1MTIiIHkyPSIxMDI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRjE0MjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxRjI5MzciLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEYxNDIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+', // px
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTIzXzQ1NikiLz4KPGV0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTIzXzQ1NiIgeDE9IjUxMiIgeTE9IjAiIHgyPSI1MTIiIHkyPSIxMDI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRjE0MjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxRjI5MzciLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEYxNDIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+', // nx
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTIzXzQ1NikiLz4KPGV0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTIzXzQ1NiIgeDE9IjUxMiIgeTE9IjAiIHgyPSI1MTIiIHkyPSIxMDI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRjE0MjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxRjI5MzciLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEYxNDIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+', // py
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTIzXzQ1NikiLz4KPGV0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTIzXzQ1NiIgeDE9IjUxMiIgeTE9IjAiIHgyPSI1MTIiIHkyPSIxMDI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRjE0MjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxRjI5MzciLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEYxNDIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+', // ny
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTIzXzQ1NikiLz4KPGV0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTIzXzQ1NiIgeDE9IjUxMiIgeTE9IjAiIHgyPSI1MTIiIHkyPSIxMDI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRjE0MjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxRjI5MzciLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEYxNDIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+', // pz
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTIzXzQ1NikiLz4KPGV0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTIzXzQ1NiIgeDE9IjUxMiIgeTE9IjAiIHgyPSI1MTIiIHkyPSIxMDI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRjE0MjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxRjI5MzciLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEYxNDIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+'  // nz
        ]);
        
        this.scene.environment = environmentMap;
    }
    
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.performanceConfig.enableShadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        
        this.container.appendChild(this.renderer.domElement);
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Key light for data visualization
        const keyLight = new THREE.SpotLight(0xBF5700, 2);
        keyLight.position.set(-50, 80, 50);
        keyLight.angle = Math.PI / 6;
        keyLight.penumbra = 0.2;
        keyLight.decay = 2;
        keyLight.distance = 200;
        keyLight.castShadow = true;
        this.scene.add(keyLight);
        
        // Fill light
        const fillLight = new THREE.SpotLight(0x87CEEB, 1);
        fillLight.position.set(50, 40, -50);
        fillLight.angle = Math.PI / 8;
        fillLight.penumbra = 0.3;
        fillLight.decay = 2;
        fillLight.distance = 150;
        this.scene.add(fillLight);
        
        // Rim light for dramatic effect
        const rimLight = new THREE.DirectionalLight(0x006A6B, 0.8);
        rimLight.position.set(-100, -50, -100);
        this.scene.add(rimLight);
    }
    
    setupPostProcessing() {
        if (!this.performanceConfig.enablePostProcessing) return;
        
        // Create composer for post-processing effects
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom effect for glowing elements
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(bloomPass);
        
        // Film grain effect
        const filmPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                nIntensity: { value: 0.35 },
                sIntensity: { value: 0.05 },
                sCount: { value: 1024 }
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
                uniform float nIntensity;
                uniform float sIntensity;
                uniform float sCount;
                varying vec2 vUv;
                
                float random(vec2 co) {
                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Add noise
                    float noise = random(vUv + time);
                    color.rgb += (noise - 0.5) * nIntensity;
                    
                    // Add scanlines
                    float scanline = sin(vUv.y * sCount) * sIntensity;
                    color.rgb += scanline;
                    
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(filmPass);
        
        // Final output pass
        const outputPass = new THREE.OutputPass();
        this.composer.addPass(outputPass);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 1.8;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }
    
    createBlenderMaterials() {
        // Glass material with Blender-like properties
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x87CEEB,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            transmission: 0.9,
            transparent: true,
            thickness: 0.5,
            envMapIntensity: 1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        
        // Metallic material
        this.materials.metal = new THREE.MeshStandardMaterial({
            color: 0xBF5700,
            metalness: 1.0,
            roughness: 0.1,
            envMapIntensity: 1.0
        });
        
        // Emission material for glowing effects
        this.materials.emission = new THREE.MeshStandardMaterial({
            color: 0x006A6B,
            emissive: 0x006A6B,
            emissiveIntensity: 0.8
        });
        
        // Carbon fiber material
        this.materials.carbon = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2,
            normalScale: new THREE.Vector2(1, 1)
        });
    }
    
    async loadGeometryResources() {
        // Load GLTF loader for complex models
        const loader = new THREE.GLTFLoader();
        
        // Create procedural geometries for data visualization
        this.geometries = {
            sphere: new THREE.SphereGeometry(1, 32, 32),
            cylinder: new THREE.CylinderGeometry(1, 1, 2, 32),
            plane: new THREE.PlaneGeometry(100, 100, 100, 100),
            icosahedron: new THREE.IcosahedronGeometry(1, 2),
            torus: new THREE.TorusGeometry(1, 0.4, 16, 100)
        };
    }
    
    createDataVisualizations() {
        this.create3DGeographicMap();
        this.createPerformanceGraphs();
        this.createNetworkVisualization();
        this.createTimelineVisualization();
        this.createInteractiveElements();
    }
    
    create3DGeographicMap() {
        const mapGroup = new THREE.Group();
        
        // Create terrain-like base
        const terrainGeometry = new THREE.PlaneGeometry(200, 150, 100, 75);
        const vertices = terrainGeometry.attributes.position.array;
        
        // Add height variation for terrain
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            vertices[i + 2] = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 5;
        }
        
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
        
        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x2a4d3a,
            wireframe: false,
            transparent: true,
            opacity: 0.8
        });
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        mapGroup.add(terrain);
        
        // Add state/region markers
        const regions = [
            { name: 'Texas', position: [-30, 5, -20], color: 0xBF5700, size: 8 },
            { name: 'Louisiana', position: [-10, 5, -30], color: 0x4B92DB, size: 6 },
            { name: 'Mississippi', position: [0, 5, -25], color: 0x87CEEB, size: 5 },
            { name: 'Alabama', position: [10, 5, -20], color: 0x006A6B, size: 6 },
            { name: 'Georgia', position: [25, 5, -15], color: 0xC65D00, size: 7 },
            { name: 'Florida', position: [35, 5, -35], color: 0x9B2222, size: 8 }
        ];
        
        regions.forEach(region => {
            // Create glowing markers
            const markerGeometry = new THREE.SphereGeometry(region.size * 0.8, 16, 16);
            const markerMaterial = new THREE.MeshStandardMaterial({
                color: region.color,
                emissive: region.color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(...region.position);
            marker.castShadow = true;
            marker.userData = { type: 'region', name: region.name };
            
            // Add pulsing animation
            const pulseGeometry = new THREE.RingGeometry(region.size * 1.2, region.size * 1.5, 32);
            const pulseMaterial = new THREE.MeshBasicMaterial({
                color: region.color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const pulseRing = new THREE.Mesh(pulseGeometry, pulseMaterial);
            pulseRing.position.set(region.position[0], 0.1, region.position[2]);
            pulseRing.rotation.x = -Math.PI / 2;
            
            mapGroup.add(marker);
            mapGroup.add(pulseRing);
            
            this.interactiveElements.push(marker);
        });
        
        // Add data connections between regions
        this.createDataConnections(regions, mapGroup);
        
        mapGroup.name = 'geographicMap';
        this.scene.add(mapGroup);
        this.dataObjects.set('map', mapGroup);
    }
    
    createDataConnections(regions, mapGroup) {
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        // Create connections between major regions
        const connections = [
            [0, 1], // Texas - Louisiana
            [0, 2], // Texas - Mississippi  
            [1, 2], // Louisiana - Mississippi
            [2, 3], // Mississippi - Alabama
            [3, 4], // Alabama - Georgia
            [4, 5]  // Georgia - Florida
        ];
        
        connections.forEach(([startIdx, endIdx]) => {
            const start = new THREE.Vector3(...regions[startIdx].position);
            const end = new THREE.Vector3(...regions[endIdx].position);
            
            // Create curved line using quadratic bezier
            const curve = new THREE.QuadraticBezierCurve3(
                start,
                new THREE.Vector3(
                    (start.x + end.x) / 2,
                    start.y + 15,
                    (start.z + end.z) / 2
                ),
                end
            );
            
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, connectionMaterial);
            
            mapGroup.add(line);
        });
    }
    
    createPerformanceGraphs() {
        const graphGroup = new THREE.Group();
        graphGroup.position.set(0, 20, 50);
        
        // Create 3D bar chart for team performance
        const teamData = [
            { name: 'Cardinals', performance: 85, color: 0xBF5700 },
            { name: 'Titans', performance: 92, color: 0x4B92DB },
            { name: 'Longhorns', performance: 78, color: 0x87CEEB },
            { name: 'Grizzlies', performance: 88, color: 0x006A6B }
        ];
        
        teamData.forEach((team, index) => {
            const barHeight = team.performance * 0.5;
            const barGeometry = new THREE.BoxGeometry(4, barHeight, 4);
            const barMaterial = new THREE.MeshStandardMaterial({
                color: team.color,
                emissive: team.color,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.9
            });
            
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(index * 8 - 12, barHeight / 2, 0);
            bar.castShadow = true;
            bar.userData = { type: 'performance', team: team.name, value: team.performance };
            
            // Add floating label
            this.createFloatingLabel(team.name, team.performance, bar.position.clone().add(new THREE.Vector3(0, barHeight / 2 + 5, 0)));
            
            graphGroup.add(bar);
            this.interactiveElements.push(bar);
        });
        
        // Add axis lines
        const axisGroup = this.createAxisLines();
        graphGroup.add(axisGroup);
        
        graphGroup.name = 'performanceGraphs';
        this.scene.add(graphGroup);
        this.dataObjects.set('performance', graphGroup);
    }
    
    createFloatingLabel(text, value, position) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#1a1a1a';
        context.font = 'bold 16px Inter';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, 25);
        context.fillText(`${value}%`, canvas.width / 2, 45);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        
        const labelGeometry = new THREE.PlaneGeometry(8, 2);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.copy(position);
        label.lookAt(this.camera.position);
        
        this.scene.add(label);
    }
    
    createAxisLines() {
        const axisGroup = new THREE.Group();
        const axisMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            opacity: 0.3,
            transparent: true
        });
        
        // X axis
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-20, 0, 0),
            new THREE.Vector3(20, 0, 0)
        ]);
        const xAxis = new THREE.Line(xAxisGeometry, axisMaterial);
        axisGroup.add(xAxis);
        
        // Y axis
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-20, 0, 0),
            new THREE.Vector3(-20, 50, 0)
        ]);
        const yAxis = new THREE.Line(yAxisGeometry, axisMaterial);
        axisGroup.add(yAxis);
        
        return axisGroup;
    }
    
    createNetworkVisualization() {
        const networkGroup = new THREE.Group();
        networkGroup.position.set(-80, 30, 0);
        
        // Create nodes and connections
        const nodes = [];
        const nodeCount = 20;
        
        for (let i = 0; i < nodeCount; i++) {
            const nodeGeometry = new THREE.SphereGeometry(1.5, 16, 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0xBF5700 : 0x87CEEB,
                emissive: 0x222222,
                emissiveIntensity: 0.1
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );
            
            node.userData = { type: 'network_node', id: i, connections: [] };
            nodes.push(node);
            networkGroup.add(node);
            this.interactiveElements.push(node);
        }
        
        // Create connections between nearby nodes
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x006A6B,
            transparent: true,
            opacity: 0.4
        });
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = nodes[i].position.distanceTo(nodes[j].position);
                if (distance < 25) {
                    const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
                        nodes[i].position,
                        nodes[j].position
                    ]);
                    const connection = new THREE.Line(connectionGeometry, connectionMaterial);
                    networkGroup.add(connection);
                    
                    nodes[i].userData.connections.push(j);
                    nodes[j].userData.connections.push(i);
                }
            }
        }
        
        networkGroup.name = 'networkVisualization';
        this.scene.add(networkGroup);
        this.dataObjects.set('network', networkGroup);
    }
    
    createTimelineVisualization() {
        const timelineGroup = new THREE.Group();
        timelineGroup.position.set(80, 15, -30);
        
        // Create timeline spine
        const spineGeometry = new THREE.CylinderGeometry(0.5, 0.5, 80, 8);
        const spineMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.rotation.z = Math.PI / 2;
        timelineGroup.add(spine);
        
        // Add timeline events
        const events = [
            { year: 2020, importance: 0.3, color: 0xBF5700 },
            { year: 2021, importance: 0.6, color: 0x4B92DB },
            { year: 2022, importance: 0.8, color: 0x87CEEB },
            { year: 2023, importance: 0.9, color: 0x006A6B },
            { year: 2024, importance: 1.0, color: 0xC65D00 }
        ];
        
        events.forEach((event, index) => {
            const eventSize = 2 + event.importance * 3;
            const eventGeometry = new THREE.SphereGeometry(eventSize, 16, 16);
            const eventMaterial = new THREE.MeshStandardMaterial({
                color: event.color,
                emissive: event.color,
                emissiveIntensity: event.importance * 0.3
            });
            
            const eventMesh = new THREE.Mesh(eventGeometry, eventMaterial);
            eventMesh.position.set(index * 15 - 30, eventSize + 2, 0);
            eventMesh.userData = { type: 'timeline_event', year: event.year, importance: event.importance };
            
            timelineGroup.add(eventMesh);
            this.interactiveElements.push(eventMesh);
        });
        
        timelineGroup.name = 'timelineVisualization';
        this.scene.add(timelineGroup);
        this.dataObjects.set('timeline', timelineGroup);
    }
    
    createInteractiveElements() {
        // Create floating UI panels
        this.createFloatingPanel();
        
        // Add particle systems
        this.createParticleSystem();
        
        // Create dynamic grid
        this.createDynamicGrid();
    }
    
    createFloatingPanel() {
        const panelGeometry = new THREE.PlaneGeometry(20, 12);
        const panelMaterial = this.materials.glass.clone();
        panelMaterial.transparent = true;
        panelMaterial.opacity = 0.3;
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(60, 40, 20);
        panel.lookAt(this.camera.position);
        
        this.scene.add(panel);
    }
    
    createParticleSystem() {
        const particleCount = this.performanceConfig.particleCount;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const color = new THREE.Color();
        const brandColors = [0xBF5700, 0x87CEEB, 0x006A6B, 0x4B92DB];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Positions
            positions[i3] = (Math.random() - 0.5) * 400;
            positions[i3 + 1] = (Math.random() - 0.5) * 400;
            positions[i3 + 2] = (Math.random() - 0.5) * 400;
            
            // Colors
            color.setHex(brandColors[Math.floor(Math.random() * brandColors.length)]);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.name = 'particleSystem';
        this.scene.add(particles);
    }
    
    createDynamicGrid() {
        const gridSize = 100;
        const divisions = 50;
        
        const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x444444, 0x222222);
        gridHelper.position.y = -10;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        
        this.scene.add(gridHelper);
    }
    
    setupInteractivity() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.interactiveElements);
            
            if (intersects.length > 0) {
                this.handleElementClick(intersects[0].object);
            }
        });
        
        // Add hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.interactiveElements);
            
            // Reset all elements
            this.interactiveElements.forEach(element => {
                element.scale.setScalar(1);
            });
            
            // Highlight hovered element
            if (intersects.length > 0) {
                intersects[0].object.scale.setScalar(1.1);
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }
        });
    }
    
    handleElementClick(element) {
        const userData = element.userData;
        
        switch (userData.type) {
            case 'region':
                this.showRegionDetails(userData.name);
                break;
            case 'performance':
                this.showPerformanceDetails(userData.team, userData.value);
                break;
            case 'network_node':
                this.highlightNetworkConnections(userData.id);
                break;
            case 'timeline_event':
                this.showTimelineDetails(userData.year, userData.importance);
                break;
        }
    }
    
    showRegionDetails(regionName) {
        console.log(`🗺️ Region clicked: ${regionName}`);
        // Implement region detail display
    }
    
    showPerformanceDetails(team, value) {
        console.log(`📊 Performance data: ${team} - ${value}%`);
        // Implement performance detail display
    }
    
    highlightNetworkConnections(nodeId) {
        console.log(`🔗 Network node clicked: ${nodeId}`);
        // Implement network connection highlighting
    }
    
    showTimelineDetails(year, importance) {
        console.log(`⏰ Timeline event: ${year} (importance: ${importance})`);
        // Implement timeline detail display
    }
    
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Update controls
            this.controls.update();
            
            // Animate objects
            this.animateObjects();
            
            // Render scene
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
    }
    
    animateObjects() {
        const time = Date.now() * 0.001;
        
        // Animate particles
        const particles = this.scene.getObjectByName('particleSystem');
        if (particles) {
            particles.rotation.y = time * 0.1;
            
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] = Math.sin(time + positions[i] * 0.01) * 5;
            }
            particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate performance graphs
        const performanceGraphs = this.dataObjects.get('performance');
        if (performanceGraphs) {
            performanceGraphs.children.forEach((child, index) => {
                if (child.userData.type === 'performance') {
                    child.rotation.y = time * 0.5 + index * 0.5;
                    child.position.y = Math.abs(Math.sin(time + index)) * 2 + child.geometry.parameters.height / 2;
                }
            });
        }
        
        // Animate network nodes
        const network = this.dataObjects.get('network');
        if (network) {
            network.children.forEach((child) => {
                if (child.userData.type === 'network_node') {
                    child.material.emissiveIntensity = 0.1 + Math.sin(time * 2 + child.userData.id) * 0.1;
                }
            });
        }
        
        // Update post-processing uniforms
        if (this.composer) {
            const filmPass = this.composer.passes.find(pass => pass.uniforms && pass.uniforms.time);
            if (filmPass) {
                filmPass.uniforms.time.value = time;
            }
        }
    }
    
    switchVisualizationMode(mode) {
        if (!this.visualizationModes.includes(mode)) return;
        
        this.currentMode = mode;
        
        // Hide all visualizations
        this.dataObjects.forEach((object, key) => {
            object.visible = false;
        });
        
        // Show selected visualization
        const selectedVisualization = this.dataObjects.get(mode);
        if (selectedVisualization) {
            selectedVisualization.visible = true;
            
            // Animate camera to optimal viewing position
            this.animateCameraToVisualization(mode);
        }
    }
    
    animateCameraToVisualization(mode) {
        const positions = {
            map: { position: [0, 80, 120], target: [0, 0, -20] },
            performance: { position: [0, 50, 100], target: [0, 20, 50] },
            network: { position: [-50, 60, 80], target: [-80, 30, 0] },
            timeline: { position: [120, 40, 30], target: [80, 15, -30] }
        };
        
        const config = positions[mode];
        if (config) {
            // Animate camera position (simplified - in production use GSAP)
            this.camera.position.set(...config.position);
            this.controls.target.set(...config.target);
            this.controls.update();
        }
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    optimizePerformance() {
        // Implement performance optimization based on device capabilities
        const performanceMonitor = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60
        };
        
        const checkPerformance = () => {
            performanceMonitor.frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= performanceMonitor.lastTime + 1000) {
                performanceMonitor.fps = Math.round((performanceMonitor.frameCount * 1000) / (currentTime - performanceMonitor.lastTime));
                performanceMonitor.frameCount = 0;
                performanceMonitor.lastTime = currentTime;
                
                // Adjust quality based on FPS
                if (performanceMonitor.fps < 30) {
                    this.reduceQuality();
                } else if (performanceMonitor.fps > 50) {
                    this.increaseQuality();
                }
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        checkPerformance();
    }
    
    reduceQuality() {
        // Reduce particle count
        this.performanceConfig.particleCount = Math.max(1000, this.performanceConfig.particleCount * 0.8);
        
        // Disable shadows
        this.performanceConfig.enableShadows = false;
        this.renderer.shadowMap.enabled = false;
        
        // Reduce post-processing
        this.performanceConfig.enablePostProcessing = false;
    }
    
    increaseQuality() {
        // Increase quality if performance allows
        this.performanceConfig.particleCount = Math.min(5000, this.performanceConfig.particleCount * 1.1);
        
        if (!this.performanceConfig.enableShadows && this.performanceConfig.particleCount > 3000) {
            this.performanceConfig.enableShadows = true;
            this.renderer.shadowMap.enabled = true;
        }
    }
    
    dispose() {
        // Clean up resources
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
        
        console.log('🧹 3D Visualizations disposed');
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeAdvanced3DVisualizations;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.blaze-3d-visualizations-container');
    if (container) {
        window.blazeAdvanced3D = new BlazeAdvanced3DVisualizations(container);
    }
});