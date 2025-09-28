/**
 * =% BLAZE INTELLIGENCE - 3D DATA VISUALIZATION ENGINE
 * Revolutionary sports data visualization in immersive 3D space
 * Combines broadcast graphics quality with interactive analytics
 */

class Blaze3DDataViz {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.visualizations = new Map();
        this.animationMixer = null;
        this.dataUpdateRate = 16.67; // 60fps update cycle

        // Import shader and material systems
        this.shaderSystem = window.BlazeChampionshipShaders ? new window.BlazeChampionshipShaders() : null;
        this.materialSystem = window.BlazePBRMaterials ? new window.BlazePBRMaterials(scene) : null;

        this.initializeVisualizationEngine();
    }

    initializeVisualizationEngine() {
        // Create visualization container group
        this.vizContainer = new THREE.Group();
        this.vizContainer.name = 'DataVisualizationContainer';
        this.scene.add(this.vizContainer);

        // Initialize data streaming system
        this.dataStreams = new Map();
        this.streamBuffers = new Map();

        console.log('=Ê 3D Data Visualization Engine initialized');
    }

    /**
     * Create 3D Bar Chart with GPU instancing
     */
    create3DBarChart(data, config = {}) {
        const defaults = {
            width: 100,
            height: 50,
            depth: 100,
            barWidth: 2,
            barSpacing: 0.5,
            animationDuration: 2000,
            colors: [0xBF5700, 0x9BCBEB, 0x002244], // Blaze brand colors
            glowEffect: true,
            realTimeUpdate: true
        };

        const settings = { ...defaults, ...config };
        const chartGroup = new THREE.Group();
        chartGroup.name = 'BarChart3D';

        // Create instanced mesh for performance
        const barGeometry = new THREE.BoxGeometry(settings.barWidth, 1, settings.barWidth);
        const barMaterial = new THREE.MeshPhysicalMaterial({
            color: settings.colors[0],
            metalness: 0.3,
            roughness: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: settings.colors[0],
            emissiveIntensity: 0.1
        });

        const instanceCount = data.length;
        const instancedBars = new THREE.InstancedMesh(barGeometry, barMaterial, instanceCount);

        // Position and scale each bar
        const dummy = new THREE.Object3D();
        const colorAttribute = new Float32Array(instanceCount * 3);

        data.forEach((value, index) => {
            const x = (index - data.length / 2) * (settings.barWidth + settings.barSpacing);
            const y = value * settings.height / 2;
            const z = 0;

            dummy.position.set(x, y, z);
            dummy.scale.set(1, value * settings.height, 1);
            dummy.updateMatrix();
            instancedBars.setMatrixAt(index, dummy.matrix);

            // Set color variation
            const color = new THREE.Color(settings.colors[index % settings.colors.length]);
            colorAttribute[index * 3] = color.r;
            colorAttribute[index * 3 + 1] = color.g;
            colorAttribute[index * 3 + 2] = color.b;
        });

        instancedBars.instanceMatrix.needsUpdate = true;
        instancedBars.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colorAttribute, 3));

        // Add glow effect if enabled
        if (settings.glowEffect) {
            this.addGlowEffect(instancedBars);
        }

        // Add value labels using sprites
        this.addValueLabels(data, chartGroup, settings);

        // Add axes
        this.add3DAxes(chartGroup, settings);

        chartGroup.add(instancedBars);

        // Animate bars rising
        this.animateBarChart(instancedBars, data, settings);

        // Store for updates
        this.visualizations.set(chartGroup.uuid, {
            type: 'barChart',
            mesh: instancedBars,
            data: data,
            settings: settings,
            update: (newData) => this.updateBarChart(instancedBars, newData, settings)
        });

        this.vizContainer.add(chartGroup);
        return chartGroup;
    }

    /**
     * Create 3D Scatter Plot with particle system
     */
    create3DScatterPlot(data, config = {}) {
        const defaults = {
            size: 100,
            pointSize: 0.5,
            pointCount: data.length,
            colorMap: 'performance', // performance, team, position
            animated: true,
            trails: true,
            connectionThreshold: 10 // Connect points within this distance
        };

        const settings = { ...defaults, ...config };
        const scatterGroup = new THREE.Group();
        scatterGroup.name = 'ScatterPlot3D';

        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(settings.pointCount * 3);
        const colors = new Float32Array(settings.pointCount * 3);
        const sizes = new Float32Array(settings.pointCount);

        // Fill particle data
        data.forEach((point, i) => {
            positions[i * 3] = (point.x - 0.5) * settings.size;
            positions[i * 3 + 1] = (point.y - 0.5) * settings.size;
            positions[i * 3 + 2] = (point.z - 0.5) * settings.size;

            // Color based on performance metric
            const color = this.getColorForValue(point.value || 0);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = settings.pointSize * (1 + point.importance || 0);
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader material for particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.createPointTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;

                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    // Pulsing effect
                    float pulse = 1.0 + sin(time * 2.0 + position.x * 0.1) * 0.1;
                    gl_PointSize = size * pulse * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;

                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, 1.0) * texColor;

                    // Add glow
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor.rgb += vColor * glow * 0.5;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        const particles = new THREE.Points(geometry, material);
        scatterGroup.add(particles);

        // Add connection lines for clustered points
        if (settings.connectionThreshold > 0) {
            this.addConnectionLines(data, scatterGroup, settings);
        }

        // Add 3D grid
        this.add3DGrid(scatterGroup, settings.size);

        // Store for animation
        this.visualizations.set(scatterGroup.uuid, {
            type: 'scatterPlot',
            mesh: particles,
            material: material,
            data: data,
            settings: settings,
            update: (newData) => this.updateScatterPlot(particles, newData, settings)
        });

        this.vizContainer.add(scatterGroup);
        return scatterGroup;
    }

    /**
     * Create 3D Heatmap Surface
     */
    create3DHeatmapSurface(data, config = {}) {
        const defaults = {
            width: 100,
            height: 100,
            resolution: 50,
            amplitude: 20,
            colorScale: 'thermal', // thermal, performance, field
            animated: true,
            wireframe: false
        };

        const settings = { ...defaults, ...config };
        const heatmapGroup = new THREE.Group();
        heatmapGroup.name = 'HeatmapSurface3D';

        // Create parametric surface geometry
        const geometry = new THREE.PlaneGeometry(
            settings.width,
            settings.height,
            settings.resolution,
            settings.resolution
        );

        // Create color array for vertex colors
        const colors = [];
        const positions = geometry.attributes.position;

        // Modify vertices based on data
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);

            // Sample data value at this position
            const dataIndex = Math.floor((i / positions.count) * data.length);
            const value = data[Math.min(dataIndex, data.length - 1)] || 0;

            // Set height based on value
            positions.setZ(i, value * settings.amplitude);

            // Set color based on value
            const color = this.getHeatmapColor(value, settings.colorScale);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        // Create material with vertex colors
        const material = new THREE.MeshPhysicalMaterial({
            vertexColors: true,
            metalness: 0.2,
            roughness: 0.5,
            clearcoat: 0.8,
            clearcoatRoughness: 0.3,
            side: THREE.DoubleSide,
            wireframe: settings.wireframe,
            emissive: 0xffffff,
            emissiveIntensity: 0.05
        });

        const heatmapMesh = new THREE.Mesh(geometry, material);
        heatmapMesh.rotation.x = -Math.PI / 4; // Tilt for better viewing
        heatmapGroup.add(heatmapMesh);

        // Add contour lines
        this.addContourLines(heatmapMesh, settings);

        // Add legend
        this.addColorLegend(heatmapGroup, settings);

        // Store for updates
        this.visualizations.set(heatmapGroup.uuid, {
            type: 'heatmap',
            mesh: heatmapMesh,
            data: data,
            settings: settings,
            update: (newData) => this.updateHeatmap(heatmapMesh, newData, settings)
        });

        this.vizContainer.add(heatmapGroup);
        return heatmapGroup;
    }

    /**
     * Create 3D Flow Field Visualization
     */
    create3DFlowField(vectorData, config = {}) {
        const defaults = {
            size: 100,
            resolution: 20,
            arrowScale: 2,
            colorByMagnitude: true,
            animated: true,
            particleCount: 1000
        };

        const settings = { ...defaults, ...config };
        const flowGroup = new THREE.Group();
        flowGroup.name = 'FlowField3D';

        // Create arrow field
        const arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            settings.arrowScale,
            0xffffff
        );

        const instanceCount = Math.pow(settings.resolution, 3);
        const instancedArrows = new THREE.InstancedMesh(
            arrowHelper.geometry,
            new THREE.MeshPhysicalMaterial({
                color: 0x9BCBEB,
                metalness: 0.5,
                roughness: 0.3
            }),
            instanceCount
        );

        // Position arrows in 3D grid
        const dummy = new THREE.Object3D();
        let index = 0;

        for (let x = 0; x < settings.resolution; x++) {
            for (let y = 0; y < settings.resolution; y++) {
                for (let z = 0; z < settings.resolution; z++) {
                    const px = (x / settings.resolution - 0.5) * settings.size;
                    const py = (y / settings.resolution - 0.5) * settings.size;
                    const pz = (z / settings.resolution - 0.5) * settings.size;

                    // Get vector data at this position
                    const dataIndex = Math.min(index, vectorData.length - 1);
                    const vector = vectorData[dataIndex] || { x: 0, y: 1, z: 0, magnitude: 1 };

                    dummy.position.set(px, py, pz);
                    dummy.lookAt(px + vector.x, py + vector.y, pz + vector.z);
                    dummy.scale.setScalar(vector.magnitude * settings.arrowScale);
                    dummy.updateMatrix();

                    instancedArrows.setMatrixAt(index, dummy.matrix);
                    index++;
                }
            }
        }

        instancedArrows.instanceMatrix.needsUpdate = true;
        flowGroup.add(instancedArrows);

        // Add flow particles
        if (settings.particleCount > 0) {
            this.addFlowParticles(flowGroup, vectorData, settings);
        }

        // Store for updates
        this.visualizations.set(flowGroup.uuid, {
            type: 'flowField',
            mesh: instancedArrows,
            data: vectorData,
            settings: settings,
            update: (newData) => this.updateFlowField(instancedArrows, newData, settings)
        });

        this.vizContainer.add(flowGroup);
        return flowGroup;
    }

    /**
     * Create Real-Time Line Graph in 3D
     */
    create3DLineGraph(data, config = {}) {
        const defaults = {
            width: 100,
            height: 50,
            depth: 20,
            lineWidth: 2,
            smoothing: true,
            multiLine: false,
            trailEffect: true,
            maxPoints: 100
        };

        const settings = { ...defaults, ...config };
        const lineGroup = new THREE.Group();
        lineGroup.name = 'LineGraph3D';

        // Create line geometry with buffer for real-time updates
        const points = [];
        const lineData = Array.isArray(data[0]) ? data : [data];

        lineData.forEach((series, seriesIndex) => {
            const curve = new THREE.CatmullRomCurve3(
                series.map((value, index) => new THREE.Vector3(
                    (index / series.length - 0.5) * settings.width,
                    value * settings.height,
                    seriesIndex * settings.depth / Math.max(1, lineData.length - 1)
                ))
            );

            // Sample curve for smooth line
            const sampledPoints = settings.smoothing ?
                curve.getPoints(series.length * 2) :
                curve.points;

            // Create tube geometry for 3D line
            const tubeGeometry = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(sampledPoints),
                sampledPoints.length,
                settings.lineWidth / 2,
                8,
                false
            );

            // Create gradient material
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(this.getSeriesColor(seriesIndex)),
                metalness: 0.3,
                roughness: 0.4,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                emissive: this.getSeriesColor(seriesIndex),
                emissiveIntensity: 0.2
            });

            const lineMesh = new THREE.Mesh(tubeGeometry, material);
            lineGroup.add(lineMesh);

            // Add data points as spheres
            this.addDataPoints(sampledPoints, lineGroup, seriesIndex);

            // Add trail effect
            if (settings.trailEffect) {
                this.addTrailEffect(lineMesh, lineGroup);
            }
        });

        // Add grid backdrop
        this.add3DGraphGrid(lineGroup, settings);

        // Add axis labels
        this.add3DAxisLabels(lineGroup, settings);

        // Store for real-time updates
        this.visualizations.set(lineGroup.uuid, {
            type: 'lineGraph',
            group: lineGroup,
            data: data,
            settings: settings,
            update: (newData) => this.updateLineGraph(lineGroup, newData, settings)
        });

        this.vizContainer.add(lineGroup);
        return lineGroup;
    }

    /**
     * Create Stadium Fill Visualization
     */
    createStadiumFillVisualization(fillPercentage, config = {}) {
        const defaults = {
            radius: 50,
            sections: 12,
            tiers: 3,
            seatSize: 0.5,
            animationDuration: 3000,
            waveEffect: true
        };

        const settings = { ...defaults, ...config };
        const stadiumGroup = new THREE.Group();
        stadiumGroup.name = 'StadiumFill';

        // Create stadium bowl geometry
        const bowlGeometry = new THREE.CylinderGeometry(
            settings.radius * 0.8,
            settings.radius,
            settings.radius * 0.5,
            settings.sections,
            settings.tiers
        );

        // Create seats as instanced meshes
        const seatGeometry = new THREE.BoxGeometry(
            settings.seatSize,
            settings.seatSize * 0.8,
            settings.seatSize * 1.2
        );

        const totalSeats = settings.sections * settings.tiers * 20;
        const filledSeats = Math.floor(totalSeats * fillPercentage);

        const seatMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x333333,
            metalness: 0.2,
            roughness: 0.8
        });

        const filledMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xBF5700,
            metalness: 0.3,
            roughness: 0.5,
            emissive: 0xBF5700,
            emissiveIntensity: 0.3
        });

        const instancedSeats = new THREE.InstancedMesh(seatGeometry, seatMaterial, totalSeats);
        const dummy = new THREE.Object3D();

        // Position seats in stadium formation
        let seatIndex = 0;
        for (let tier = 0; tier < settings.tiers; tier++) {
            const tierRadius = settings.radius * (0.8 + tier * 0.15);
            const tierHeight = tier * settings.radius * 0.15;

            for (let section = 0; section < settings.sections; section++) {
                const angle = (section / settings.sections) * Math.PI * 2;

                for (let row = 0; row < 20; row++) {
                    const r = tierRadius + row * settings.seatSize * 1.5;
                    const x = Math.cos(angle) * r;
                    const z = Math.sin(angle) * r;
                    const y = tierHeight + row * settings.seatSize * 0.5;

                    dummy.position.set(x, y, z);
                    dummy.lookAt(0, y, 0);
                    dummy.updateMatrix();

                    instancedSeats.setMatrixAt(seatIndex, dummy.matrix);

                    // Set color for filled seats
                    if (seatIndex < filledSeats) {
                        instancedSeats.setColorAt(seatIndex, new THREE.Color(0xBF5700));
                    }

                    seatIndex++;
                }
            }
        }

        instancedSeats.instanceMatrix.needsUpdate = true;
        if (instancedSeats.instanceColor) {
            instancedSeats.instanceColor.needsUpdate = true;
        }

        stadiumGroup.add(instancedSeats);

        // Add percentage display
        this.addPercentageDisplay(stadiumGroup, fillPercentage);

        // Animate filling with wave effect
        if (settings.waveEffect) {
            this.animateStadiumFill(instancedSeats, fillPercentage, settings);
        }

        this.vizContainer.add(stadiumGroup);
        return stadiumGroup;
    }

    // Helper Methods

    addGlowEffect(mesh) {
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                viewVector: { type: "v3", value: this.camera.position },
                c: { type: "f", value: 0.3 },
                p: { type: "f", value: 3.0 },
                glowColor: { type: "c", value: new THREE.Color(0xBF5700) }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, intensity);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const glowMesh = mesh.clone();
        glowMesh.material = glowMaterial;
        glowMesh.scale.multiplyScalar(1.1);
        mesh.parent.add(glowMesh);
    }

    add3DAxes(group, settings) {
        const axesHelper = new THREE.AxesHelper(Math.max(settings.width, settings.height, settings.depth));
        group.add(axesHelper);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(settings.width, 20, 0x444444, 0x222222);
        group.add(gridHelper);
    }

    addValueLabels(data, group, settings) {
        const loader = new THREE.FontLoader();
        const textMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });

        // For now, use sprites as a fallback
        data.forEach((value, index) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 64;

            context.font = 'Bold 32px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(value.toFixed(1), 64, 40);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);

            const x = (index - data.length / 2) * (settings.barWidth + settings.barSpacing);
            const y = value * settings.height + 5;
            sprite.position.set(x, y, 0);
            sprite.scale.set(10, 5, 1);

            group.add(sprite);
        });
    }

    getColorForValue(value) {
        // Map value (0-1) to color gradient
        const colors = [
            new THREE.Color(0x002244), // Navy (low)
            new THREE.Color(0x00B2A9), // Teal (mid)
            new THREE.Color(0xBF5700)  // Orange (high)
        ];

        const t = Math.max(0, Math.min(1, value));
        const index = t * (colors.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const alpha = index - lower;

        if (lower === upper) return colors[lower];

        return new THREE.Color().lerpColors(colors[lower], colors[upper], alpha);
    }

    getHeatmapColor(value, scale) {
        const scales = {
            thermal: [
                { value: 0, color: new THREE.Color(0x000033) },
                { value: 0.25, color: new THREE.Color(0x0000ff) },
                { value: 0.5, color: new THREE.Color(0x00ff00) },
                { value: 0.75, color: new THREE.Color(0xffff00) },
                { value: 1, color: new THREE.Color(0xff0000) }
            ],
            performance: [
                { value: 0, color: new THREE.Color(0x440000) },
                { value: 0.5, color: new THREE.Color(0x9BCBEB) },
                { value: 1, color: new THREE.Color(0xBF5700) }
            ],
            field: [
                { value: 0, color: new THREE.Color(0x003300) },
                { value: 0.5, color: new THREE.Color(0x00aa00) },
                { value: 1, color: new THREE.Color(0x00ff00) }
            ]
        };

        const selectedScale = scales[scale] || scales.thermal;

        for (let i = 0; i < selectedScale.length - 1; i++) {
            if (value >= selectedScale[i].value && value <= selectedScale[i + 1].value) {
                const t = (value - selectedScale[i].value) /
                         (selectedScale[i + 1].value - selectedScale[i].value);
                return new THREE.Color().lerpColors(
                    selectedScale[i].color,
                    selectedScale[i + 1].color,
                    t
                );
            }
        }

        return selectedScale[selectedScale.length - 1].color;
    }

    getSeriesColor(index) {
        const colors = [0xBF5700, 0x9BCBEB, 0x002244, 0x00B2A9, 0xFFD700];
        return colors[index % colors.length];
    }

    createPointTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        return new THREE.CanvasTexture(canvas);
    }

    // Animation Methods

    animateBarChart(mesh, data, settings) {
        const duration = settings.animationDuration;
        const start = performance.now();
        const dummy = new THREE.Object3D();

        const animate = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutElastic(progress);

            data.forEach((value, index) => {
                const x = (index - data.length / 2) * (settings.barWidth + settings.barSpacing);
                const y = value * settings.height * eased / 2;

                dummy.position.set(x, y, 0);
                dummy.scale.set(1, value * settings.height * eased, 1);
                dummy.updateMatrix();
                mesh.setMatrixAt(index, dummy.matrix);
            });

            mesh.instanceMatrix.needsUpdate = true;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    animateStadiumFill(mesh, fillPercentage, settings) {
        const totalSeats = mesh.count;
        const targetFilled = Math.floor(totalSeats * fillPercentage);
        const duration = settings.animationDuration;
        const start = performance.now();

        const animate = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const currentFilled = Math.floor(targetFilled * progress);

            // Create wave effect
            for (let i = 0; i < currentFilled; i++) {
                const waveOffset = Math.sin(i * 0.1 + elapsed * 0.003) * 0.5 + 0.5;
                const color = new THREE.Color(0xBF5700);
                color.multiplyScalar(0.7 + waveOffset * 0.3);
                mesh.setColorAt(i, color);
            }

            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // Easing Functions

    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 :
            Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    // Update Methods for Real-Time Data

    updateVisualization(uuid, newData) {
        const viz = this.visualizations.get(uuid);
        if (viz && viz.update) {
            viz.update(newData);
        }
    }

    updateAllVisualizations() {
        this.visualizations.forEach((viz, uuid) => {
            if (viz.material && viz.material.uniforms && viz.material.uniforms.time) {
                viz.material.uniforms.time.value = performance.now() * 0.001;
            }
        });
    }

    // Stream real-time data
    connectDataStream(streamId, callback) {
        this.dataStreams.set(streamId, callback);

        // Set up animation loop for this stream
        const updateStream = () => {
            const data = callback();
            if (data) {
                this.updateVisualization(streamId, data);
            }
            requestAnimationFrame(updateStream);
        };

        updateStream();
    }

    // Cleanup
    dispose() {
        this.visualizations.forEach((viz) => {
            if (viz.mesh) {
                viz.mesh.geometry.dispose();
                viz.mesh.material.dispose();
            }
        });

        this.vizContainer.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.scene.remove(this.vizContainer);
        this.visualizations.clear();
        this.dataStreams.clear();

        console.log('>ù 3D Data Visualization Engine disposed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Blaze3DDataViz;
}