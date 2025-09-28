/**
 * 🔥 BLAZE INTELLIGENCE - HOLOGRAPHIC DATA VISUALIZATION SYSTEM
 * Transform flat charts into floating 3D holographic displays
 * Interactive data streams with volumetric rendering
 */

class BlazeHolographicData {
    constructor(options = {}) {
        this.container = options.container;
        this.scene = options.scene;
        this.camera = options.camera;
        this.renderer = options.renderer;

        // Data visualization types
        this.visualizations = {
            holographicBars: null,
            dataStreams: null,
            volumetricClouds: null,
            neuralNetwork: null,
            temporalFlow: null,
            quantumField: null
        };

        // Team performance data
        this.teamData = {
            cardinals: { wins: 85, losses: 77, streak: 5, momentum: 0.82 },
            titans: { wins: 10, losses: 6, streak: 3, momentum: 0.75 },
            longhorns: { wins: 11, losses: 1, streak: 8, momentum: 0.95 },
            grizzlies: { wins: 45, losses: 37, streak: -2, momentum: 0.58 }
        };

        // Animation states
        this.animationData = {
            time: 0,
            dataFlowSpeed: 1.0,
            morphProgress: 0,
            activeTransition: false
        };

        this.init();
    }

    /**
     * Initialize holographic data system
     */
    init() {
        this.createHolographicBars();
        this.createDataStreams();
        this.createVolumetricClouds();
        this.createNeuralNetwork();
        this.createTemporalFlow();
        this.createQuantumField();
        this.setupDataInteraction();
    }

    /**
     * Create holographic bar chart
     */
    createHolographicBars() {
        const group = new THREE.Group();

        // Create bars for each team
        Object.entries(this.teamData).forEach(([team, data], index) => {
            const barGeometry = new THREE.BoxGeometry(2, data.wins / 10, 2);
            const barMaterial = this.createHologramMaterial(this.getTeamColor(team));

            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(index * 5 - 7.5, data.wins / 20, 0);

            // Add data label
            const labelSprite = this.createTextSprite(
                `${team.toUpperCase()}\n${data.wins}-${data.losses}`,
                this.getTeamColor(team)
            );
            labelSprite.position.set(0, data.wins / 10 + 2, 0);
            bar.add(labelSprite);

            // Add momentum indicator
            const momentumRing = this.createMomentumRing(data.momentum);
            momentumRing.position.set(0, -1, 0);
            bar.add(momentumRing);

            // Add streak particles
            if (data.streak > 0) {
                const streakParticles = this.createStreakParticles(data.streak);
                bar.add(streakParticles);
            }

            group.add(bar);

            // Animate bar
            this.animateBar(bar, data);
        });

        this.visualizations.holographicBars = group;
        if (this.scene) this.scene.add(group);
    }

    /**
     * Create flowing data streams between nodes
     */
    createDataStreams() {
        const streams = new THREE.Group();

        // Create node positions
        const nodes = [
            { pos: new THREE.Vector3(-20, 10, 0), color: 0xBF5700 },
            { pos: new THREE.Vector3(20, 10, 0), color: 0x9BCBEB },
            { pos: new THREE.Vector3(0, -10, 0), color: 0x002244 },
            { pos: new THREE.Vector3(0, 10, 20), color: 0x00B2A9 }
        ];

        // Create nodes
        nodes.forEach(node => {
            const nodeGeometry = new THREE.IcosahedronGeometry(2, 1);
            const nodeMaterial = this.createEnergyMaterial(node.color);
            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
            nodeMesh.position.copy(node.pos);
            streams.add(nodeMesh);
        });

        // Create data streams between nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const stream = this.createDataStream(nodes[i], nodes[j]);
                streams.add(stream);
            }
        }

        this.visualizations.dataStreams = streams;
        if (this.scene) this.scene.add(streams);
    }

    /**
     * Create volumetric data cloud
     */
    createVolumetricClouds() {
        const cloudGroup = new THREE.Group();

        // Create volumetric shader
        const volumeGeometry = new THREE.BoxGeometry(30, 20, 30);
        const volumeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                dataTexture: { value: this.generateDataTexture() },
                cloudColor: { value: new THREE.Color(0xBF5700) },
                opacity: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vWorldPosition;

                void main() {
                    vPosition = position;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform sampler2D dataTexture;
                uniform vec3 cloudColor;
                uniform float opacity;

                varying vec3 vPosition;
                varying vec3 vWorldPosition;

                // Noise function
                float noise(vec3 p) {
                    return sin(p.x * 0.1) * cos(p.y * 0.1) * sin(p.z * 0.1 + time);
                }

                void main() {
                    // Sample data texture based on position
                    vec2 uv = vec2(
                        (vPosition.x + 15.0) / 30.0,
                        (vPosition.y + 10.0) / 20.0
                    );
                    vec4 data = texture2D(dataTexture, uv);

                    // Create volumetric effect
                    float density = noise(vWorldPosition * 0.2) * 0.5 + 0.5;
                    density *= data.r;

                    // Ray marching for volume
                    vec3 rayDir = normalize(vWorldPosition - cameraPosition);
                    float depth = length(vWorldPosition - cameraPosition);

                    // Accumulate volume
                    float accumulated = 0.0;
                    for(float i = 0.0; i < 10.0; i++) {
                        vec3 samplePos = vWorldPosition + rayDir * i * 0.5;
                        accumulated += noise(samplePos * 0.3) * 0.1;
                    }

                    vec3 color = mix(cloudColor, data.rgb, 0.5);
                    float alpha = opacity * density * accumulated;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const volumeMesh = new THREE.Mesh(volumeGeometry, volumeMaterial);
        volumeMesh.position.set(0, 20, -20);
        cloudGroup.add(volumeMesh);

        // Add particle field inside volume
        const particleCount = 1000;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;

            const color = new THREE.Color(0xBF5700);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        volumeMesh.add(particles);

        this.visualizations.volumetricClouds = cloudGroup;
        if (this.scene) this.scene.add(cloudGroup);
    }

    /**
     * Create neural network visualization
     */
    createNeuralNetwork() {
        const network = new THREE.Group();

        // Define layers
        const layers = [
            { neurons: 5, z: -10 },
            { neurons: 8, z: -5 },
            { neurons: 12, z: 0 },
            { neurons: 8, z: 5 },
            { neurons: 3, z: 10 }
        ];

        const neurons = [];
        const connections = [];

        // Create neurons
        layers.forEach((layer, layerIndex) => {
            const layerNeurons = [];

            for (let i = 0; i < layer.neurons; i++) {
                const y = (i - layer.neurons / 2) * 3;
                const neuronGeometry = new THREE.SphereGeometry(0.8, 16, 16);
                const neuronMaterial = this.createNeuronMaterial();

                const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
                neuron.position.set(0, y, layer.z);

                network.add(neuron);
                layerNeurons.push(neuron);
            }

            neurons.push(layerNeurons);
        });

        // Create connections
        for (let l = 0; l < neurons.length - 1; l++) {
            const currentLayer = neurons[l];
            const nextLayer = neurons[l + 1];

            currentLayer.forEach(neuron1 => {
                nextLayer.forEach(neuron2 => {
                    const connection = this.createNeuralConnection(
                        neuron1.position,
                        neuron2.position
                    );
                    network.add(connection);
                    connections.push(connection);
                });
            });
        }

        // Store for animation
        network.userData = { neurons, connections };

        this.visualizations.neuralNetwork = network;
        if (this.scene) this.scene.add(network);
    }

    /**
     * Create temporal flow visualization
     */
    createTemporalFlow() {
        const flowGroup = new THREE.Group();

        // Create time river
        const riverCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-30, 0, 0),
            new THREE.Vector3(-15, 5, 10),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(15, -5, -10),
            new THREE.Vector3(30, 0, 0)
        ]);

        const tubeGeometry = new THREE.TubeGeometry(riverCurve, 100, 2, 8, false);
        const tubeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                flowSpeed: { value: 1.0 }
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
                uniform float flowSpeed;
                varying vec2 vUv;

                void main() {
                    // Flowing gradient
                    float flow = vUv.x - time * flowSpeed;
                    float pattern = sin(flow * 20.0) * 0.5 + 0.5;

                    vec3 color1 = vec3(0.749, 0.341, 0.0); // Blaze Orange
                    vec3 color2 = vec3(0.0, 0.698, 0.663); // Blaze Teal
                    vec3 color = mix(color1, color2, pattern);

                    // Pulse effect
                    float pulse = sin(time * 2.0) * 0.2 + 0.8;
                    color *= pulse;

                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        const riverMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        flowGroup.add(riverMesh);

        // Add data points along the flow
        const dataPointCount = 20;
        for (let i = 0; i < dataPointCount; i++) {
            const t = i / dataPointCount;
            const position = riverCurve.getPoint(t);

            const dataPoint = this.createDataPoint();
            dataPoint.position.copy(position);
            dataPoint.position.y += 2;
            flowGroup.add(dataPoint);
        }

        this.visualizations.temporalFlow = flowGroup;
        if (this.scene) this.scene.add(flowGroup);
    }

    /**
     * Create quantum field visualization
     */
    createQuantumField() {
        const fieldGroup = new THREE.Group();

        // Create field grid
        const gridSize = 20;
        const spacing = 2;

        for (let x = -gridSize / 2; x <= gridSize / 2; x++) {
            for (let z = -gridSize / 2; z <= gridSize / 2; z++) {
                const quantum = this.createQuantumNode();
                quantum.position.set(x * spacing, 0, z * spacing);

                // Add phase offset for wave pattern
                quantum.userData = {
                    phase: Math.random() * Math.PI * 2,
                    frequency: 0.5 + Math.random() * 0.5,
                    amplitude: 1 + Math.random() * 2
                };

                fieldGroup.add(quantum);
            }
        }

        this.visualizations.quantumField = fieldGroup;
        if (this.scene) this.scene.add(fieldGroup);
    }

    /**
     * Create hologram material
     */
    createHologramMaterial(color) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;

                void main() {
                    vUv = uv;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float opacity;

                varying vec2 vUv;
                varying vec3 vNormal;

                void main() {
                    // Holographic scanlines
                    float scanline = sin(vUv.y * 100.0 + time * 10.0) * 0.1 + 0.9;

                    // Edge glow
                    vec3 viewDirection = normalize(cameraPosition);
                    float fresnel = pow(1.0 - abs(dot(vNormal, viewDirection)), 2.0);

                    vec3 finalColor = color * scanline;
                    finalColor += color * fresnel;

                    // Glitch effect
                    float glitch = step(0.99, sin(time * 20.0) * sin(time * 23.0));
                    finalColor = mix(finalColor, vec3(1.0) - finalColor, glitch * 0.5);

                    gl_FragColor = vec4(finalColor, opacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: Math.random() > 0.7
        });
    }

    /**
     * Create energy material
     */
    createEnergyMaterial(color) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec3 vNormal;

                void main() {
                    float pulse = sin(time * 4.0) * 0.3 + 0.7;
                    vec3 finalColor = color * pulse;

                    // Rim lighting
                    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);
                    finalColor += color * fresnel * 2.0;

                    gl_FragColor = vec4(finalColor, 0.9);
                }
            `,
            transparent: true
        });
    }

    /**
     * Create data stream between nodes
     */
    createDataStream(node1, node2) {
        const curve = new THREE.CatmullRomCurve3([
            node1.pos,
            new THREE.Vector3(
                (node1.pos.x + node2.pos.x) / 2,
                (node1.pos.y + node2.pos.y) / 2 + 5,
                (node1.pos.z + node2.pos.z) / 2
            ),
            node2.pos
        ]);

        const geometry = new THREE.TubeGeometry(curve, 50, 0.2, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: 0xBF5700,
            transparent: true,
            opacity: 0.6
        });

        return new THREE.Mesh(geometry, material);
    }

    /**
     * Create text sprite
     */
    createTextSprite(text, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        context.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
        context.font = 'bold 24px Inter';
        context.textAlign = 'center';
        context.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(4, 2, 1);

        return sprite;
    }

    /**
     * Update all visualizations
     */
    update(deltaTime) {
        this.animationData.time += deltaTime;

        // Update holographic bars
        if (this.visualizations.holographicBars) {
            this.visualizations.holographicBars.rotation.y += deltaTime * 0.1;
            this.visualizations.holographicBars.children.forEach((bar, i) => {
                bar.position.y = Math.sin(this.animationData.time + i) * 0.5;
            });
        }

        // Update data streams
        if (this.visualizations.dataStreams) {
            this.visualizations.dataStreams.children.forEach((child, i) => {
                if (child.material && child.material.uniforms) {
                    child.material.uniforms.time.value = this.animationData.time;
                }
            });
        }

        // Update volumetric clouds
        if (this.visualizations.volumetricClouds) {
            const cloudMesh = this.visualizations.volumetricClouds.children[0];
            if (cloudMesh.material.uniforms) {
                cloudMesh.material.uniforms.time.value = this.animationData.time;
            }
        }

        // Update neural network
        if (this.visualizations.neuralNetwork) {
            this.animateNeuralNetwork();
        }

        // Update temporal flow
        if (this.visualizations.temporalFlow) {
            const riverMesh = this.visualizations.temporalFlow.children[0];
            if (riverMesh.material.uniforms) {
                riverMesh.material.uniforms.time.value = this.animationData.time;
            }
        }

        // Update quantum field
        if (this.visualizations.quantumField) {
            this.animateQuantumField();
        }
    }

    /**
     * Helper methods
     */
    getTeamColor(team) {
        const colors = {
            cardinals: new THREE.Color(0xC41E3A),
            titans: new THREE.Color(0x002244),
            longhorns: new THREE.Color(0xBF5700),
            grizzlies: new THREE.Color(0x5D76A9)
        };
        return colors[team] || new THREE.Color(0xffffff);
    }

    generateDataTexture() {
        const size = 256;
        const data = new Uint8Array(size * size * 4);

        for (let i = 0; i < size * size; i++) {
            const i4 = i * 4;
            data[i4] = Math.random() * 255;
            data[i4 + 1] = Math.random() * 255;
            data[i4 + 2] = Math.random() * 255;
            data[i4 + 3] = 255;
        }

        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        texture.needsUpdate = true;

        return texture;
    }

    // Additional helper methods...
    createMomentumRing(momentum) {
        const geometry = new THREE.TorusGeometry(1, 0.2, 8, 32);
        const material = new THREE.MeshBasicMaterial({
            color: momentum > 0.8 ? 0x00ff00 : momentum > 0.5 ? 0xffff00 : 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        return new THREE.Mesh(geometry, material);
    }

    createStreakParticles(streak) {
        const particles = new THREE.Group();
        // Simplified particle creation
        return particles;
    }

    animateBar(bar, data) {
        // Animation logic for bars
    }

    createNeuronMaterial() {
        return new THREE.MeshPhongMaterial({
            color: 0xBF5700,
            emissive: 0xBF5700,
            emissiveIntensity: 0.5
        });
    }

    createNeuralConnection(start, end) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({
            color: 0x9BCBEB,
            transparent: true,
            opacity: 0.5
        });
        return new THREE.Line(geometry, material);
    }

    createDataPoint() {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        return new THREE.Mesh(geometry, material);
    }

    createQuantumNode() {
        const geometry = new THREE.OctahedronGeometry(0.3, 0);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00B2A9,
            emissive: 0x00B2A9,
            emissiveIntensity: 0.2
        });
        return new THREE.Mesh(geometry, material);
    }

    animateNeuralNetwork() {
        // Neural network animation
    }

    animateQuantumField() {
        this.visualizations.quantumField.children.forEach(node => {
            const data = node.userData;
            const y = Math.sin(this.animationData.time * data.frequency + data.phase) * data.amplitude;
            node.position.y = y;
        });
    }

    setupDataInteraction() {
        // Setup interactive features
    }
}

// Export for use
window.BlazeHolographicData = BlazeHolographicData;

// Auto-initialize if Three.js is available
if (typeof THREE !== 'undefined') {
    console.log('🌌 Holographic Data Visualization System initialized');
}