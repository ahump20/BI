/**
 * 🔥 BLAZE INTELLIGENCE - CHAMPIONSHIP VISUAL EFFECTS SYSTEM
 * Stadium atmosphere, weather effects, fireworks, and broadcast-quality VFX
 * ESPN-level graphics with real-time environmental simulation
 */

class BlazeChampionshipVFX {
    constructor(options = {}) {
        this.scene = options.scene;
        this.camera = options.camera;
        this.renderer = options.renderer;

        // VFX Systems
        this.systems = {
            stadium: null,
            weather: null,
            fireworks: null,
            confetti: null,
            energyWaves: null,
            lensFlares: null,
            crowd: null,
            spotlights: null
        };

        // Stadium configuration
        this.stadiumConfig = {
            capacity: 50000,
            crowdDensity: 0.85,
            waveAmplitude: 2.0,
            cheerIntensity: 1.0,
            lightShowActive: false
        };

        // Weather states
        this.weatherStates = {
            clear: { fog: 0, rain: 0, snow: 0, wind: 0.1 },
            cloudy: { fog: 0.1, rain: 0, snow: 0, wind: 0.3 },
            rain: { fog: 0.2, rain: 1.0, snow: 0, wind: 0.5 },
            snow: { fog: 0.3, rain: 0, snow: 1.0, wind: 0.2 },
            storm: { fog: 0.4, rain: 1.0, snow: 0, wind: 1.0 }
        };
        this.currentWeather = 'clear';

        // Animation timers
        this.timers = {
            global: 0,
            crowd: 0,
            weather: 0,
            celebration: 0
        };

        // Team colors for celebrations
        this.teamColors = {
            cardinals: [0xC41E3A, 0xFFFFFF, 0x000000],
            titans: [0x002244, 0x4B92DB, 0xC60C30],
            longhorns: [0xBF5700, 0xFFFFFF, 0x333F48],
            grizzlies: [0x5D76A9, 0x12173F, 0xF5B112]
        };

        this.init();
    }

    /**
     * Initialize all VFX systems
     */
    init() {
        this.createStadiumAtmosphere();
        this.createWeatherSystem();
        this.createFireworksSystem();
        this.createConfettiSystem();
        this.createEnergyWaveSystem();
        this.createLensFlareSystem();
        this.createCrowdSimulation();
        this.createSpotlightShow();

        console.log('🎆 Championship VFX System initialized - Broadcast quality enabled');
    }

    /**
     * Create stadium atmosphere with animated crowd
     */
    createStadiumAtmosphere() {
        const stadium = new THREE.Group();

        // Stadium lights
        const lightPositions = [
            [-100, 80, -100], [100, 80, -100],
            [-100, 80, 100], [100, 80, 100]
        ];

        lightPositions.forEach(pos => {
            // Light tower
            const towerGeometry = new THREE.CylinderGeometry(2, 3, 100, 8);
            const towerMaterial = new THREE.MeshPhongMaterial({
                color: 0x333333,
                emissive: 0x111111
            });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.set(pos[0], pos[1] / 2, pos[2]);
            stadium.add(tower);

            // Stadium lights
            for (let i = 0; i < 4; i++) {
                const light = new THREE.SpotLight(0xffffff, 2.0);
                light.position.set(pos[0], pos[1], pos[2]);
                light.angle = Math.PI / 6;
                light.penumbra = 0.2;
                light.decay = 2;
                light.distance = 300;
                light.target.position.set(
                    pos[0] * 0.3,
                    0,
                    pos[2] * 0.3
                );
                stadium.add(light);
                stadium.add(light.target);

                // Light cone effect
                const coneGeometry = new THREE.ConeGeometry(20, 50, 8, 1, true);
                const coneMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        color: { value: new THREE.Color(0xffffcc) },
                        opacity: { value: 0.1 }
                    },
                    vertexShader: `
                        varying vec3 vPosition;
                        void main() {
                            vPosition = position;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform vec3 color;
                        uniform float opacity;
                        varying vec3 vPosition;

                        void main() {
                            float alpha = 1.0 - (vPosition.y + 25.0) / 50.0;
                            gl_FragColor = vec4(color, alpha * opacity);
                        }
                    `,
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });

                const cone = new THREE.Mesh(coneGeometry, coneMaterial);
                cone.position.copy(light.position);
                cone.position.y -= 25;
                cone.lookAt(light.target.position);
                stadium.add(cone);
            }
        });

        // Volumetric fog for atmosphere
        const fogMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                fogColor: { value: new THREE.Color(0xcccccc) },
                fogDensity: { value: 0.005 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 fogColor;
                uniform float fogDensity;
                varying vec3 vWorldPosition;

                void main() {
                    float distance = length(vWorldPosition - cameraPosition);
                    float fogAmount = 1.0 - exp(-fogDensity * distance);
                    fogAmount = clamp(fogAmount, 0.0, 0.3);

                    gl_FragColor = vec4(fogColor, fogAmount);
                }
            `,
            transparent: true,
            depthWrite: false
        });

        const fogGeometry = new THREE.BoxGeometry(400, 100, 400);
        const fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
        fogMesh.position.y = 50;
        stadium.add(fogMesh);

        this.systems.stadium = stadium;
        if (this.scene) this.scene.add(stadium);
    }

    /**
     * Create weather effects system
     */
    createWeatherSystem() {
        const weather = new THREE.Group();

        // Rain system
        const rainCount = 5000;
        const rainGeometry = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);

        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3] = Math.random() * 400 - 200;
            rainPositions[i * 3 + 1] = Math.random() * 200;
            rainPositions[i * 3 + 2] = Math.random() * 400 - 200;
            rainVelocities[i] = 0.5 + Math.random() * 0.5;
        }

        rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));

        const rainMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 0 }
            },
            vertexShader: `
                attribute float velocity;
                varying float vOpacity;
                uniform float time;

                void main() {
                    vec3 pos = position;
                    pos.y -= mod(time * velocity * 50.0, 200.0);

                    vOpacity = 1.0 - (pos.y / 200.0);

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = 2.0;
                }
            `,
            fragmentShader: `
                uniform float opacity;
                varying float vOpacity;

                void main() {
                    gl_FragColor = vec4(0.7, 0.8, 1.0, opacity * vOpacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            vertexColors: false
        });

        const rain = new THREE.Points(rainGeometry, rainMaterial);
        weather.add(rain);

        // Snow system
        const snowCount = 3000;
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(snowCount * 3);

        for (let i = 0; i < snowCount; i++) {
            snowPositions[i * 3] = Math.random() * 400 - 200;
            snowPositions[i * 3 + 1] = Math.random() * 200;
            snowPositions[i * 3 + 2] = Math.random() * 400 - 200;
        }

        snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 3,
            map: this.createSnowflakeTexture(),
            transparent: true,
            opacity: 0,
            depthWrite: false
        });

        const snow = new THREE.Points(snowGeometry, snowMaterial);
        weather.add(snow);

        // Lightning effect
        const lightningMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                flash: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float flash;
                varying vec2 vUv;

                void main() {
                    float bolt = step(0.49, abs(vUv.x - 0.5));
                    gl_FragColor = vec4(1.0, 1.0, 1.0, flash * bolt);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const lightningGeometry = new THREE.PlaneGeometry(2, 100, 1, 20);
        const lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
        lightning.position.set(0, 50, -50);
        weather.add(lightning);

        weather.userData = { rain, snow, lightning };
        this.systems.weather = weather;
        if (this.scene) this.scene.add(weather);
    }

    /**
     * Create fireworks system for celebrations
     */
    createFireworksSystem() {
        const fireworks = new THREE.Group();

        this.createFirework = (position, colors) => {
            const firework = new THREE.Group();
            const particleCount = 200;

            // Create burst particles
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            const colors_array = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                // Random spherical distribution
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const radius = 1;

                velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
                velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
                velocities[i * 3 + 2] = Math.cos(phi) * radius;

                positions[i * 3] = position.x;
                positions[i * 3 + 1] = position.y;
                positions[i * 3 + 2] = position.z;

                // Random color from palette
                const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
                colors_array[i * 3] = color.r;
                colors_array[i * 3 + 1] = color.g;
                colors_array[i * 3 + 2] = color.b;

                sizes[i] = Math.random() * 3 + 1;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    gravity: { value: -0.1 }
                },
                vertexShader: `
                    attribute vec3 velocity;
                    attribute float size;
                    varying vec3 vColor;
                    varying float vAlpha;
                    uniform float time;
                    uniform float gravity;

                    void main() {
                        vColor = color;
                        vec3 pos = position;

                        // Physics simulation
                        pos += velocity * time * 20.0;
                        pos.y += gravity * time * time * 100.0;

                        // Fade out
                        vAlpha = 1.0 - time;

                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = size * (100.0 / -mvPosition.z) * (1.0 - time * 0.5);
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    varying float vAlpha;

                    void main() {
                        vec2 center = gl_PointCoord - vec2(0.5);
                        float dist = length(center);
                        if (dist > 0.5) discard;

                        float alpha = (1.0 - dist * 2.0) * vAlpha;
                        gl_FragColor = vec4(vColor, alpha);
                    }
                `,
                transparent: true,
                depthWrite: false,
                vertexColors: true,
                blending: THREE.AdditiveBlending
            });

            const particles = new THREE.Points(geometry, material);
            firework.add(particles);

            // Trail effect
            const trailGeometry = new THREE.BufferGeometry();
            const trailMaterial = new THREE.LineBasicMaterial({
                color: colors[0],
                transparent: true,
                opacity: 0.5
            });

            const trailPoints = [];
            for (let i = 0; i < 10; i++) {
                trailPoints.push(new THREE.Vector3(
                    position.x,
                    position.y - i * 5,
                    position.z
                ));
            }
            trailGeometry.setFromPoints(trailPoints);

            const trail = new THREE.Line(trailGeometry, trailMaterial);
            firework.add(trail);

            firework.userData = {
                startTime: performance.now() / 1000,
                duration: 2.0,
                material: material
            };

            return firework;
        };

        this.systems.fireworks = fireworks;
        if (this.scene) this.scene.add(fireworks);
    }

    /**
     * Create confetti system
     */
    createConfettiSystem() {
        const confettiGroup = new THREE.Group();

        this.createConfettiBurst = (count = 500) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const rotations = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 100;
                positions[i * 3 + 1] = Math.random() * 50 + 50;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

                const color = new THREE.Color(Math.random() * 0xffffff);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;

                rotations[i * 3] = Math.random() * Math.PI;
                rotations[i * 3 + 1] = Math.random() * Math.PI;
                rotations[i * 3 + 2] = Math.random() * Math.PI;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 3));

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 }
                },
                vertexShader: `
                    attribute vec3 rotation;
                    varying vec3 vColor;
                    uniform float time;

                    void main() {
                        vColor = color;
                        vec3 pos = position;

                        // Falling motion with flutter
                        pos.y -= time * 20.0;
                        pos.x += sin(time * 2.0 + rotation.x) * 5.0;
                        pos.z += cos(time * 2.0 + rotation.z) * 5.0;

                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = 5.0 * (1.0 + sin(time * 10.0 + rotation.y));
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;

                    void main() {
                        gl_FragColor = vec4(vColor, 1.0);
                    }
                `,
                vertexColors: true
            });

            const confetti = new THREE.Points(geometry, material);
            confetti.userData = {
                startTime: performance.now() / 1000,
                material: material
            };

            return confetti;
        };

        this.systems.confetti = confettiGroup;
        if (this.scene) this.scene.add(confettiGroup);
    }

    /**
     * Create energy wave system
     */
    createEnergyWaveSystem() {
        const energyGroup = new THREE.Group();

        this.createEnergyWave = (origin, color = 0xBF5700) => {
            const waveGeometry = new THREE.RingGeometry(0.1, 1, 32);
            const waveMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(color) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    uniform float time;

                    void main() {
                        vUv = uv;
                        vec3 pos = position;

                        // Expand ring
                        float scale = 1.0 + time * 50.0;
                        pos *= scale;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    varying vec2 vUv;

                    void main() {
                        float alpha = (1.0 - time) * (1.0 - vUv.y);
                        gl_FragColor = vec4(color, alpha * 0.5);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.position.copy(origin);
            wave.rotation.x = -Math.PI / 2;
            wave.userData = {
                startTime: performance.now() / 1000,
                material: waveMaterial
            };

            return wave;
        };

        this.systems.energyWaves = energyGroup;
        if (this.scene) this.scene.add(energyGroup);
    }

    /**
     * Create lens flare system
     */
    createLensFlareSystem() {
        if (!this.renderer || !this.camera) return;

        const flares = new THREE.Group();

        this.createLensFlare = (light, color = 0xffffff) => {
            const textureLoader = new THREE.TextureLoader();

            // Create flare sprites
            const flareColor = new THREE.Color(color);
            const lensFlare = new THREE.Group();

            // Main flare
            const flareGeometry = new THREE.PlaneGeometry(5, 5);
            const flareMaterial = new THREE.MeshBasicMaterial({
                color: flareColor,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const mainFlare = new THREE.Mesh(flareGeometry, flareMaterial);
            mainFlare.position.copy(light.position);
            lensFlare.add(mainFlare);

            // Secondary flares
            for (let i = 0; i < 5; i++) {
                const size = (5 - i) * 0.5;
                const secondaryGeometry = new THREE.PlaneGeometry(size, size);
                const secondaryMaterial = new THREE.MeshBasicMaterial({
                    color: flareColor,
                    transparent: true,
                    opacity: 0.3 - i * 0.05,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const secondary = new THREE.Mesh(secondaryGeometry, secondaryMaterial);
                secondary.position.lerpVectors(
                    this.camera.position,
                    light.position,
                    0.2 + i * 0.15
                );
                lensFlare.add(secondary);
            }

            return lensFlare;
        };

        this.systems.lensFlares = flares;
        if (this.scene) this.scene.add(flares);
    }

    /**
     * Create crowd simulation
     */
    createCrowdSimulation() {
        const crowd = new THREE.Group();

        // Create crowd texture (animated)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw crowd silhouettes
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 256);

        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const radius = Math.random() * 3 + 2;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
            ctx.fill();
        }

        const crowdTexture = new THREE.CanvasTexture(canvas);

        // Create crowd stands
        const standGeometry = new THREE.PlaneGeometry(100, 30, 32, 16);
        const standMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                crowdTexture: { value: crowdTexture },
                waveAmplitude: { value: this.stadiumConfig.waveAmplitude }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                uniform float waveAmplitude;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // Crowd wave effect
                    float wave = sin(position.x * 0.1 + time * 2.0) * waveAmplitude;
                    pos.z += wave;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D crowdTexture;
                uniform float time;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;

                    // Animate texture
                    uv.x += sin(time * 0.5) * 0.01;

                    vec4 color = texture2D(crowdTexture, uv);
                    gl_FragColor = color;
                }
            `,
            side: THREE.DoubleSide
        });

        // Create stands around stadium
        const standPositions = [
            { pos: [0, 15, -80], rot: [0, 0, 0] },
            { pos: [0, 15, 80], rot: [0, Math.PI, 0] },
            { pos: [-80, 15, 0], rot: [0, Math.PI / 2, 0] },
            { pos: [80, 15, 0], rot: [0, -Math.PI / 2, 0] }
        ];

        standPositions.forEach(config => {
            const stand = new THREE.Mesh(standGeometry, standMaterial.clone());
            stand.position.set(...config.pos);
            stand.rotation.set(...config.rot);
            crowd.add(stand);
        });

        crowd.userData = { material: standMaterial };
        this.systems.crowd = crowd;
        if (this.scene) this.scene.add(crowd);
    }

    /**
     * Create spotlight show
     */
    createSpotlightShow() {
        const spotlights = new THREE.Group();

        // Create moving spotlights
        for (let i = 0; i < 4; i++) {
            const spotlight = new THREE.SpotLight(0xffffff, 2);
            spotlight.angle = Math.PI / 8;
            spotlight.penumbra = 0.2;
            spotlight.decay = 2;
            spotlight.distance = 200;

            const angle = (i / 4) * Math.PI * 2;
            spotlight.position.set(
                Math.cos(angle) * 60,
                50,
                Math.sin(angle) * 60
            );

            spotlight.target.position.set(0, 0, 0);
            spotlights.add(spotlight);
            spotlights.add(spotlight.target);

            // Visible light beam
            const beamGeometry = new THREE.ConeGeometry(10, 60, 8, 1, true);
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });

            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.copy(spotlight.position);
            beam.position.y -= 30;
            beam.lookAt(spotlight.target.position);
            spotlights.add(beam);

            spotlight.userData = { beam, index: i };
        }

        this.systems.spotlights = spotlights;
        if (this.scene) this.scene.add(spotlights);
    }

    /**
     * Create snowflake texture
     */
    createSnowflakeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(16, 16, 8, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    /**
     * Launch firework
     */
    launchFirework(team = 'blazeOrange') {
        const colors = this.teamColors[team] || [0xBF5700, 0xffffff];
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            50 + Math.random() * 30,
            (Math.random() - 0.5) * 100
        );

        const firework = this.createFirework(position, colors);
        this.systems.fireworks.add(firework);

        // Remove after duration
        setTimeout(() => {
            this.systems.fireworks.remove(firework);
        }, 2000);
    }

    /**
     * Trigger celebration
     */
    triggerCelebration(team) {
        // Launch multiple fireworks
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.launchFirework(team);
            }, i * 300);
        }

        // Drop confetti
        const confetti = this.createConfettiBurst(1000);
        this.systems.confetti.add(confetti);

        // Create energy waves
        for (let i = 0; i < 3; i++) {
            const wave = this.createEnergyWave(
                new THREE.Vector3(0, 0, 0),
                this.teamColors[team][0]
            );
            this.systems.energyWaves.add(wave);
        }

        // Activate light show
        this.stadiumConfig.lightShowActive = true;
        setTimeout(() => {
            this.stadiumConfig.lightShowActive = false;
        }, 10000);
    }

    /**
     * Set weather
     */
    setWeather(weatherType) {
        const weather = this.weatherStates[weatherType];
        if (!weather) return;

        this.currentWeather = weatherType;

        // Update rain
        if (this.systems.weather && this.systems.weather.userData.rain) {
            this.systems.weather.userData.rain.material.uniforms.opacity.value = weather.rain;
        }

        // Update snow
        if (this.systems.weather && this.systems.weather.userData.snow) {
            this.systems.weather.userData.snow.material.opacity = weather.snow;
        }

        // Update fog
        if (this.scene && weather.fog > 0) {
            this.scene.fog = new THREE.FogExp2(0xcccccc, weather.fog * 0.01);
        } else if (this.scene) {
            this.scene.fog = null;
        }
    }

    /**
     * Update all VFX systems
     */
    update(deltaTime) {
        this.timers.global += deltaTime;

        // Update weather
        if (this.systems.weather) {
            const rain = this.systems.weather.userData.rain;
            if (rain && rain.material.uniforms) {
                rain.material.uniforms.time.value = this.timers.global;
            }

            // Random lightning
            if (this.currentWeather === 'storm' && Math.random() > 0.995) {
                const lightning = this.systems.weather.userData.lightning;
                if (lightning && lightning.material.uniforms) {
                    lightning.material.uniforms.flash.value = 1.0;
                    setTimeout(() => {
                        lightning.material.uniforms.flash.value = 0;
                    }, 100);
                }
            }
        }

        // Update crowd
        if (this.systems.crowd && this.systems.crowd.userData.material) {
            this.systems.crowd.userData.material.uniforms.time.value = this.timers.global;
        }

        // Update spotlights
        if (this.systems.spotlights && this.stadiumConfig.lightShowActive) {
            this.systems.spotlights.children.forEach(child => {
                if (child.isSpotLight) {
                    const index = child.userData.index;
                    const angle = this.timers.global + index * Math.PI / 2;
                    child.target.position.x = Math.sin(angle) * 30;
                    child.target.position.z = Math.cos(angle) * 30;

                    if (child.userData.beam) {
                        child.userData.beam.lookAt(child.target.position);
                    }
                }
            });
        }

        // Update active fireworks
        if (this.systems.fireworks) {
            this.systems.fireworks.children.forEach(firework => {
                const elapsed = this.timers.global - firework.userData.startTime;
                if (firework.userData.material) {
                    firework.userData.material.uniforms.time.value = elapsed;
                }
            });
        }

        // Update confetti
        if (this.systems.confetti) {
            this.systems.confetti.children.forEach(confetti => {
                const elapsed = this.timers.global - confetti.userData.startTime;
                if (confetti.userData.material) {
                    confetti.userData.material.uniforms.time.value = elapsed;
                }

                // Remove old confetti
                if (elapsed > 5) {
                    this.systems.confetti.remove(confetti);
                }
            });
        }

        // Update energy waves
        if (this.systems.energyWaves) {
            this.systems.energyWaves.children.forEach(wave => {
                const elapsed = this.timers.global - wave.userData.startTime;
                if (wave.userData.material) {
                    wave.userData.material.uniforms.time.value = elapsed;
                }

                // Remove old waves
                if (elapsed > 2) {
                    this.systems.energyWaves.remove(wave);
                }
            });
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        Object.values(this.systems).forEach(system => {
            if (system && system.parent) {
                system.parent.remove(system);
            }
        });
    }
}

// Export for use
window.BlazeChampionshipVFX = BlazeChampionshipVFX;

// Auto-initialize if Three.js is available
if (typeof THREE !== 'undefined') {
    console.log('🎆 Championship VFX System ready - ESPN broadcast quality enabled');
}