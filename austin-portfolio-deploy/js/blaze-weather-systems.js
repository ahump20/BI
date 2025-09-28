/**
 * 🔥 BLAZE INTELLIGENCE - ADVANCED WEATHER SYSTEMS
 * Dynamic particle-based weather effects with realistic physics and environmental impact
 * Implements rain, snow, wind, fog, lightning, and interactive weather patterns
 */

class BlazeWeatherSystems {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        // Weather system parameters
        this.params = {
            globalWeatherIntensity: 0.8,
            windSpeed: 5.0,
            windDirection: new THREE.Vector2(1, 0.3).normalize(),
            temperature: 72, // Fahrenheit
            humidity: 0.6,
            pressure: 1013.25, // Millibars
            visibility: 10000, // Meters
            weatherTransitionSpeed: 0.5
        };

        // Weather types and their configurations
        this.weatherTypes = {
            clear: {
                particles: 0,
                visibility: 15000,
                lighting: { r: 1.0, g: 0.98, b: 0.95 },
                fog: { density: 0.0001, color: new THREE.Color(0.8, 0.9, 1.0) }
            },

            light_rain: {
                particles: 5000,
                particleSize: 0.1,
                particleSpeed: 15,
                visibility: 8000,
                lighting: { r: 0.7, g: 0.75, b: 0.8 },
                fog: { density: 0.0008, color: new THREE.Color(0.6, 0.65, 0.7) }
            },

            heavy_rain: {
                particles: 25000,
                particleSize: 0.15,
                particleSpeed: 25,
                visibility: 3000,
                lighting: { r: 0.5, g: 0.55, b: 0.6 },
                fog: { density: 0.002, color: new THREE.Color(0.4, 0.45, 0.5) }
            },

            light_snow: {
                particles: 8000,
                particleSize: 0.3,
                particleSpeed: 3,
                visibility: 5000,
                lighting: { r: 0.9, g: 0.92, b: 0.98 },
                fog: { density: 0.0005, color: new THREE.Color(0.85, 0.88, 0.92) }
            },

            heavy_snow: {
                particles: 20000,
                particleSize: 0.5,
                particleSpeed: 5,
                visibility: 1000,
                lighting: { r: 0.8, g: 0.83, b: 0.9 },
                fog: { density: 0.004, color: new THREE.Color(0.7, 0.75, 0.8) }
            },

            thunderstorm: {
                particles: 15000,
                particleSize: 0.12,
                particleSpeed: 35,
                visibility: 2000,
                lightning: true,
                lighting: { r: 0.4, g: 0.45, b: 0.55 },
                fog: { density: 0.003, color: new THREE.Color(0.3, 0.35, 0.4) }
            },

            fog: {
                particles: 50000,
                particleSize: 2.0,
                particleSpeed: 1,
                visibility: 500,
                lighting: { r: 0.8, g: 0.82, b: 0.85 },
                fog: { density: 0.008, color: new THREE.Color(0.75, 0.78, 0.8) }
            },

            dust_storm: {
                particles: 30000,
                particleSize: 0.8,
                particleSpeed: 20,
                visibility: 200,
                lighting: { r: 0.9, g: 0.7, b: 0.4 },
                fog: { density: 0.01, color: new THREE.Color(0.8, 0.6, 0.3) }
            }
        };

        this.currentWeather = 'clear';
        this.targetWeather = 'clear';
        this.weatherTransition = { active: false, progress: 0, duration: 10 };

        // Weather system components
        this.weatherSystems = new Map();
        this.particleSystems = new Map();
        this.lightningSystem = null;
        this.windSystem = null;
        this.precipitationCollision = null;

        this.initializeWeatherSystems();
    }

    initializeWeatherSystems() {
        this.createParticleWeatherSystems();
        this.createWindSystem();
        this.createLightningSystem();
        this.createPrecipitationPhysics();
        this.setupEnvironmentalEffects();

        console.log('🌦️ Weather systems initialized - Dynamic atmospheric conditions enabled');
    }

    createParticleWeatherSystems() {
        // Rain particle system
        this.createRainSystem();

        // Snow particle system
        this.createSnowSystem();

        // Fog particle system
        this.createFogSystem();

        // Dust/sand particle system
        this.createDustSystem();
    }

    createRainSystem() {
        const maxParticles = 25000;
        const positions = new Float32Array(maxParticles * 3);
        const velocities = new Float32Array(maxParticles * 3);
        const sizes = new Float32Array(maxParticles);
        const ages = new Float32Array(maxParticles);
        const lifetimes = new Float32Array(maxParticles);

        // Initialize rain particles
        for (let i = 0; i < maxParticles; i++) {
            const i3 = i * 3;

            // Start above and around camera
            positions[i3] = (Math.random() - 0.5) * 1000;
            positions[i3 + 1] = 200 + Math.random() * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;

            // Downward velocity with slight horizontal component
            velocities[i3] = this.params.windDirection.x * this.params.windSpeed + (Math.random() - 0.5) * 2;
            velocities[i3 + 1] = -15 - Math.random() * 10; // Falling speed
            velocities[i3 + 2] = this.params.windDirection.y * this.params.windSpeed + (Math.random() - 0.5) * 2;

            sizes[i] = 0.05 + Math.random() * 0.1;
            ages[i] = Math.random() * 10;
            lifetimes[i] = 8 + Math.random() * 4;
        }

        const rainGeometry = new THREE.BufferGeometry();
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        rainGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        rainGeometry.setAttribute('age', new THREE.BufferAttribute(ages, 1));
        rainGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

        const rainMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                rainColor: { value: new THREE.Color(0.7, 0.8, 0.9) },
                windDirection: { value: this.params.windDirection },
                windSpeed: { value: this.params.windSpeed },
                intensity: { value: 0.0 },
                cameraPosition: { value: this.camera.position }
            },
            vertexShader: this.createRainVertexShader(),
            fragmentShader: this.createRainFragmentShader(),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const rainSystem = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(rainSystem);

        this.particleSystems.set('rain', {
            system: rainSystem,
            geometry: rainGeometry,
            material: rainMaterial,
            maxParticles: maxParticles,
            activeParticles: 0
        });
    }

    createSnowSystem() {
        const maxParticles = 20000;
        const positions = new Float32Array(maxParticles * 3);
        const velocities = new Float32Array(maxParticles * 3);
        const sizes = new Float32Array(maxParticles);
        const rotations = new Float32Array(maxParticles);
        const rotationSpeeds = new Float32Array(maxParticles);

        for (let i = 0; i < maxParticles; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 1000;
            positions[i3 + 1] = 200 + Math.random() * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;

            // Gentle falling motion with wind drift
            velocities[i3] = this.params.windDirection.x * this.params.windSpeed * 0.3;
            velocities[i3 + 1] = -2 - Math.random() * 3; // Slower than rain
            velocities[i3 + 2] = this.params.windDirection.y * this.params.windSpeed * 0.3;

            sizes[i] = 0.2 + Math.random() * 0.3;
            rotations[i] = Math.random() * Math.PI * 2;
            rotationSpeeds[i] = (Math.random() - 0.5) * 0.5;
        }

        const snowGeometry = new THREE.BufferGeometry();
        snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        snowGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        snowGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        snowGeometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
        snowGeometry.setAttribute('rotationSpeed', new THREE.BufferAttribute(rotationSpeeds, 1));

        const snowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                snowTexture: { value: this.generateSnowflakeTexture() },
                windDirection: { value: this.params.windDirection },
                windSpeed: { value: this.params.windSpeed },
                intensity: { value: 0.0 }
            },
            vertexShader: this.createSnowVertexShader(),
            fragmentShader: this.createSnowFragmentShader(),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const snowSystem = new THREE.Points(snowGeometry, snowMaterial);
        this.scene.add(snowSystem);

        this.particleSystems.set('snow', {
            system: snowSystem,
            geometry: snowGeometry,
            material: snowMaterial,
            maxParticles: maxParticles,
            activeParticles: 0
        });
    }

    createFogSystem() {
        const maxParticles = 50000;
        const positions = new Float32Array(maxParticles * 3);
        const sizes = new Float32Array(maxParticles);
        const opacities = new Float32Array(maxParticles);
        const driftSpeeds = new Float32Array(maxParticles * 3);

        for (let i = 0; i < maxParticles; i++) {
            const i3 = i * 3;

            // Distribute throughout stadium volume
            positions[i3] = (Math.random() - 0.5) * 800;
            positions[i3 + 1] = Math.random() * 150; // Ground level to mid-height
            positions[i3 + 2] = (Math.random() - 0.5) * 800;

            sizes[i] = 5 + Math.random() * 15; // Large, soft particles
            opacities[i] = 0.05 + Math.random() * 0.1; // Very transparent

            // Slow drift motion
            driftSpeeds[i3] = (Math.random() - 0.5) * 0.5;
            driftSpeeds[i3 + 1] = (Math.random() - 0.5) * 0.2;
            driftSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.5;
        }

        const fogGeometry = new THREE.BufferGeometry();
        fogGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        fogGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        fogGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
        fogGeometry.setAttribute('driftSpeed', new THREE.BufferAttribute(driftSpeeds, 3));

        const fogMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                fogTexture: { value: this.generateFogTexture() },
                fogColor: { value: new THREE.Color(0.8, 0.85, 0.9) },
                intensity: { value: 0.0 },
                cameraPosition: { value: this.camera.position }
            },
            vertexShader: this.createFogVertexShader(),
            fragmentShader: this.createFogFragmentShader(),
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        const fogSystem = new THREE.Points(fogGeometry, fogMaterial);
        this.scene.add(fogSystem);

        this.particleSystems.set('fog', {
            system: fogSystem,
            geometry: fogGeometry,
            material: fogMaterial,
            maxParticles: maxParticles,
            activeParticles: 0
        });
    }

    createDustSystem() {
        const maxParticles = 30000;
        const positions = new Float32Array(maxParticles * 3);
        const velocities = new Float32Array(maxParticles * 3);
        const sizes = new Float32Array(maxParticles);
        const colors = new Float32Array(maxParticles * 3);

        for (let i = 0; i < maxParticles; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 1000;
            positions[i3 + 1] = Math.random() * 100; // Lower altitude
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;

            // Strong horizontal movement, slight vertical
            velocities[i3] = this.params.windDirection.x * this.params.windSpeed * (0.5 + Math.random() * 1.5);
            velocities[i3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i3 + 2] = this.params.windDirection.y * this.params.windSpeed * (0.5 + Math.random() * 1.5);

            sizes[i] = 0.3 + Math.random() * 1.2;

            // Sandy/dusty colors
            const dustColor = new THREE.Color().setHSL(0.1 + Math.random() * 0.05, 0.6, 0.5 + Math.random() * 0.3);
            colors[i3] = dustColor.r;
            colors[i3 + 1] = dustColor.g;
            colors[i3 + 2] = dustColor.b;
        }

        const dustGeometry = new THREE.BufferGeometry();
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        dustGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        dustGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const dustMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                dustTexture: { value: this.generateDustTexture() },
                windDirection: { value: this.params.windDirection },
                windSpeed: { value: this.params.windSpeed },
                intensity: { value: 0.0 }
            },
            vertexShader: this.createDustVertexShader(),
            fragmentShader: this.createDustFragmentShader(),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const dustSystem = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(dustSystem);

        this.particleSystems.set('dust', {
            system: dustSystem,
            geometry: dustGeometry,
            material: dustMaterial,
            maxParticles: maxParticles,
            activeParticles: 0
        });
    }

    createWindSystem() {
        this.windSystem = {
            strength: this.params.windSpeed,
            direction: this.params.windDirection.clone(),
            turbulence: 0.3,
            gustFrequency: 0.1,
            gustStrength: 1.5,

            // Wind field visualization (invisible by default)
            fieldVisualization: null,
            showField: false,

            update: (deltaTime) => {
                const time = performance.now() * 0.001;

                // Add gusts
                const gust = Math.sin(time * this.windSystem.gustFrequency) * this.windSystem.gustStrength;
                const currentStrength = this.windSystem.strength + gust;

                // Add turbulence
                this.windSystem.direction.x += (Math.random() - 0.5) * this.windSystem.turbulence * deltaTime;
                this.windSystem.direction.y += (Math.random() - 0.5) * this.windSystem.turbulence * deltaTime;
                this.windSystem.direction.normalize();

                // Update all particle systems
                this.particleSystems.forEach(system => {
                    if (system.material.uniforms.windDirection) {
                        system.material.uniforms.windDirection.value.copy(this.windSystem.direction);
                        system.material.uniforms.windSpeed.value = currentStrength;
                    }
                });
            },

            setDirection: (x, y) => {
                this.windSystem.direction.set(x, y).normalize();
                this.params.windDirection.copy(this.windSystem.direction);
            },

            setStrength: (strength) => {
                this.windSystem.strength = strength;
                this.params.windSpeed = strength;
            }
        };
    }

    createLightningSystem() {
        this.lightningSystem = {
            active: false,
            flashes: [],
            nextFlash: 0,
            flashDuration: 0.15,
            flickerIntensity: 0.8,

            // Lightning geometry
            bolts: new Map(),
            material: null,

            initialize: () => {
                // Create lightning material
                this.lightningSystem.material = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        flashIntensity: { value: 0.0 },
                        boltColor: { value: new THREE.Color(0.9, 0.95, 1.0) }
                    },
                    vertexShader: `
                        uniform float time;
                        uniform float flashIntensity;
                        varying float vIntensity;

                        void main() {
                            vIntensity = flashIntensity;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform vec3 boltColor;
                        varying float vIntensity;

                        void main() {
                            gl_FragColor = vec4(boltColor * vIntensity, vIntensity);
                        }
                    `,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
            },

            triggerFlash: () => {
                const flash = {
                    intensity: 1.0,
                    duration: this.lightningSystem.flashDuration,
                    elapsed: 0,
                    position: new THREE.Vector3(
                        (Math.random() - 0.5) * 1000,
                        200 + Math.random() * 200,
                        (Math.random() - 0.5) * 1000
                    )
                };

                this.lightningSystem.flashes.push(flash);
                this.createLightningBolt(flash.position);

                // Schedule thunder (sound would go here)
                const thunderDelay = Math.random() * 3000 + 1000; // 1-4 seconds
                setTimeout(() => {
                    console.log('🌩️ Thunder!');
                }, thunderDelay);
            },

            update: (deltaTime) => {
                if (!this.lightningSystem.active) return;

                // Random lightning timing
                this.lightningSystem.nextFlash -= deltaTime;
                if (this.lightningSystem.nextFlash <= 0) {
                    this.lightningSystem.triggerFlash();
                    this.lightningSystem.nextFlash = 5 + Math.random() * 15; // 5-20 seconds
                }

                // Update active flashes
                for (let i = this.lightningSystem.flashes.length - 1; i >= 0; i--) {
                    const flash = this.lightningSystem.flashes[i];
                    flash.elapsed += deltaTime;

                    if (flash.elapsed >= flash.duration) {
                        this.lightningSystem.flashes.splice(i, 1);
                    } else {
                        flash.intensity = 1.0 - (flash.elapsed / flash.duration);
                    }
                }

                // Update lightning material
                const totalIntensity = this.lightningSystem.flashes.reduce((sum, flash) => sum + flash.intensity, 0);
                this.lightningSystem.material.uniforms.flashIntensity.value = Math.min(totalIntensity, 1.0);
            }
        };

        this.lightningSystem.initialize();
    }

    createPrecipitationPhysics() {
        this.precipitationCollision = {
            groundLevel: 0,
            surfaces: [], // Stadium surfaces for collision
            splashEffects: new Map(),

            checkCollisions: (particleSystem, deltaTime) => {
                const positions = particleSystem.geometry.attributes.position.array;
                const velocities = particleSystem.geometry.attributes.velocity.array;

                for (let i = 0; i < particleSystem.activeParticles; i++) {
                    const i3 = i * 3;

                    // Simple ground collision
                    if (positions[i3 + 1] <= this.precipitationCollision.groundLevel) {
                        // Reset particle to top
                        positions[i3] = (Math.random() - 0.5) * 1000;
                        positions[i3 + 1] = 200 + Math.random() * 200;
                        positions[i3 + 2] = (Math.random() - 0.5) * 1000;

                        // Create splash effect if rain
                        if (particleSystem === this.particleSystems.get('rain')) {
                            this.createSplashEffect(positions[i3], this.precipitationCollision.groundLevel, positions[i3 + 2]);
                        }
                    }
                }

                particleSystem.geometry.attributes.position.needsUpdate = true;
            },

            createSplashEffect: (x, y, z) => {
                // Simple splash visualization
                // In a full implementation, this could create small secondary particle systems
            }
        };
    }

    setupEnvironmentalEffects() {
        this.environmentalEffects = {
            lighting: {
                originalAmbient: null,
                originalDirectional: [],
                weatherModified: false
            },

            fog: {
                originalFog: null,
                weatherFog: null
            },

            atmosphere: {
                originalClearColor: this.renderer.getClearColor(new THREE.Color()),
                originalClearAlpha: this.renderer.getClearAlpha()
            }
        };

        // Store original scene properties
        this.storeOriginalEnvironment();
    }

    // Shader creation methods
    createRainVertexShader() {
        return `
            attribute vec3 velocity;
            attribute float size;
            attribute float age;
            attribute float lifetime;

            uniform float time;
            uniform vec2 windDirection;
            uniform float windSpeed;
            uniform float intensity;
            uniform vec3 cameraPosition;

            varying float vAge;
            varying float vLifetime;
            varying float vDistance;

            void main() {
                vAge = age;
                vLifetime = lifetime;

                vec3 pos = position;

                // Update particle position based on velocity and time
                float particleTime = mod(age + time, lifetime);
                pos += velocity * particleTime;

                // Apply wind effect
                pos.x += windDirection.x * windSpeed * particleTime * 0.5;
                pos.z += windDirection.y * windSpeed * particleTime * 0.5;

                // Reset to top when hitting ground
                if (pos.y <= 0.0) {
                    pos.y = 200.0 + mod(pos.x + pos.z, 100.0);
                    particleTime = 0.0;
                }

                // Distance-based sizing
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vDistance = length(mvPosition.xyz);

                gl_PointSize = size * intensity * (100.0 / vDistance);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    createRainFragmentShader() {
        return `
            uniform vec3 rainColor;
            uniform float intensity;

            varying float vAge;
            varying float vLifetime;
            varying float vDistance;

            void main() {
                // Create rain streak
                vec2 coord = gl_PointCoord - vec2(0.5);
                float len = length(coord);

                // Elongated droplet shape
                float alpha = smoothstep(0.5, 0.1, len) * intensity;

                // Distance fade
                alpha *= smoothstep(200.0, 50.0, vDistance);

                gl_FragColor = vec4(rainColor, alpha);
            }
        `;
    }

    createSnowVertexShader() {
        return `
            attribute vec3 velocity;
            attribute float size;
            attribute float rotation;
            attribute float rotationSpeed;

            uniform float time;
            uniform vec2 windDirection;
            uniform float windSpeed;
            uniform float intensity;

            varying float vRotation;
            varying float vIntensity;

            void main() {
                vIntensity = intensity;
                vRotation = rotation + rotationSpeed * time;

                vec3 pos = position;

                // Gentle falling motion with wind
                float particleTime = time * 0.5;
                pos.y -= velocity.y * particleTime;
                pos.x += (windDirection.x * windSpeed * 0.3 + velocity.x) * particleTime;
                pos.z += (windDirection.y * windSpeed * 0.3 + velocity.z) * particleTime;

                // Floating motion
                pos.x += sin(time * 0.5 + pos.z * 0.01) * 2.0;
                pos.z += cos(time * 0.3 + pos.x * 0.01) * 2.0;

                // Reset when hitting ground
                if (pos.y <= 0.0) {
                    pos.y = 200.0 + mod(pos.x + pos.z, 100.0);
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * intensity * (50.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    createSnowFragmentShader() {
        return `
            uniform sampler2D snowTexture;
            uniform float intensity;

            varying float vRotation;
            varying float vIntensity;

            void main() {
                vec2 rotatedUV = gl_PointCoord - vec2(0.5);
                float cosA = cos(vRotation);
                float sinA = sin(vRotation);
                rotatedUV = vec2(
                    cosA * rotatedUV.x - sinA * rotatedUV.y,
                    sinA * rotatedUV.x + cosA * rotatedUV.y
                ) + vec2(0.5);

                vec4 texColor = texture2D(snowTexture, rotatedUV);
                gl_FragColor = vec4(texColor.rgb, texColor.a * vIntensity);
            }
        `;
    }

    createFogVertexShader() {
        return `
            attribute float size;
            attribute float opacity;
            attribute vec3 driftSpeed;

            uniform float time;
            uniform float intensity;
            uniform vec3 cameraPosition;

            varying float vOpacity;
            varying float vIntensity;

            void main() {
                vOpacity = opacity;
                vIntensity = intensity;

                vec3 pos = position;

                // Slow drift motion
                pos += driftSpeed * time;

                // Keep fog particles in bounds
                pos.x = mod(pos.x + 400.0, 800.0) - 400.0;
                pos.z = mod(pos.z + 400.0, 800.0) - 400.0;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * intensity;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    createFogFragmentShader() {
        return `
            uniform sampler2D fogTexture;
            uniform vec3 fogColor;
            uniform float intensity;

            varying float vOpacity;
            varying float vIntensity;

            void main() {
                vec4 texColor = texture2D(fogTexture, gl_PointCoord);
                float alpha = texColor.a * vOpacity * vIntensity;
                gl_FragColor = vec4(fogColor, alpha);
            }
        `;
    }

    createDustVertexShader() {
        return `
            attribute vec3 velocity;
            attribute float size;
            attribute vec3 color;

            uniform float time;
            uniform vec2 windDirection;
            uniform float windSpeed;
            uniform float intensity;

            varying vec3 vColor;
            varying float vIntensity;

            void main() {
                vColor = color;
                vIntensity = intensity;

                vec3 pos = position;

                // Strong wind-driven motion
                float particleTime = time;
                pos += velocity * particleTime;
                pos.x += windDirection.x * windSpeed * particleTime;
                pos.z += windDirection.y * windSpeed * particleTime;

                // Turbulent motion
                pos.y += sin(time + pos.x * 0.01) * 3.0;

                // Wrap around boundaries
                pos.x = mod(pos.x + 500.0, 1000.0) - 500.0;
                pos.z = mod(pos.z + 500.0, 1000.0) - 500.0;

                if (pos.y <= 0.0) {
                    pos.y = 50.0 + mod(pos.x + pos.z, 50.0);
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * intensity * (100.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    createDustFragmentShader() {
        return `
            uniform sampler2D dustTexture;
            uniform float intensity;

            varying vec3 vColor;
            varying float vIntensity;

            void main() {
                vec4 texColor = texture2D(dustTexture, gl_PointCoord);
                vec3 finalColor = vColor * texColor.rgb;
                float alpha = texColor.a * vIntensity * 0.6;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `;
    }

    // Texture generation methods
    generateSnowflakeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Create snowflake pattern
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 64, 64);

        // Draw snowflake arms
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(32, 32);
            ctx.lineTo(32 + Math.cos(angle) * 25, 32 + Math.sin(angle) * 25);
            ctx.stroke();

            // Add smaller branches
            for (let j = 0.3; j < 1; j += 0.3) {
                const x = 32 + Math.cos(angle) * 25 * j;
                const y = 32 + Math.sin(angle) * 25 * j;

                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle + Math.PI/4) * 5, y + Math.sin(angle + Math.PI/4) * 5);
                ctx.lineTo(x + Math.cos(angle - Math.PI/4) * 5, y + Math.sin(angle - Math.PI/4) * 5);
                ctx.stroke();
            }
        }

        return new THREE.CanvasTexture(canvas);
    }

    generateFogTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        return new THREE.CanvasTexture(canvas);
    }

    generateDustTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(180, 140, 80, 1)');
        gradient.addColorStop(0.7, 'rgba(180, 140, 80, 0.6)');
        gradient.addColorStop(1, 'rgba(180, 140, 80, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        return new THREE.CanvasTexture(canvas);
    }

    // Weather control methods
    setWeather(weatherType, transitionDuration = 10) {
        if (!this.weatherTypes[weatherType]) {
            console.warn(`Weather type ${weatherType} not found`);
            return;
        }

        this.targetWeather = weatherType;
        this.weatherTransition.active = true;
        this.weatherTransition.progress = 0;
        this.weatherTransition.duration = transitionDuration;

        console.log(`🌦️ Transitioning to ${weatherType} weather over ${transitionDuration} seconds`);
    }

    updateWeatherTransition(deltaTime) {
        if (!this.weatherTransition.active) return;

        this.weatherTransition.progress += deltaTime / this.weatherTransition.duration;

        if (this.weatherTransition.progress >= 1.0) {
            this.weatherTransition.progress = 1.0;
            this.weatherTransition.active = false;
            this.currentWeather = this.targetWeather;
        }

        // Interpolate weather parameters
        const currentWeatherData = this.weatherTypes[this.currentWeather];
        const targetWeatherData = this.weatherTypes[this.targetWeather];
        const progress = this.weatherTransition.progress;

        // Update particle intensities
        this.particleSystems.forEach((system, type) => {
            let intensity = 0;

            if (this.targetWeather.includes(type) ||
                (type === 'rain' && this.targetWeather.includes('rain')) ||
                (type === 'snow' && this.targetWeather.includes('snow')) ||
                (type === 'fog' && this.targetWeather === 'fog') ||
                (type === 'dust' && this.targetWeather === 'dust_storm')) {

                intensity = progress;
            }

            system.material.uniforms.intensity.value = intensity;
            system.activeParticles = Math.floor(system.maxParticles * intensity);
        });

        // Update lightning
        this.lightningSystem.active = targetWeatherData.lightning && progress > 0.5;

        // Update environmental effects
        this.updateEnvironmentalEffects(currentWeatherData, targetWeatherData, progress);
    }

    updateEnvironmentalEffects(current, target, progress) {
        // Update scene lighting
        const lightColor = {
            r: current.lighting.r + (target.lighting.r - current.lighting.r) * progress,
            g: current.lighting.g + (target.lighting.g - current.lighting.g) * progress,
            b: current.lighting.b + (target.lighting.b - current.lighting.b) * progress
        };

        // Apply to scene lights (would need references to actual lights)
        // this.scene.traverse(child => {
        //     if (child.isAmbientLight) {
        //         child.color.setRGB(lightColor.r, lightColor.g, lightColor.b);
        //     }
        // });

        // Update scene fog
        const fogDensity = current.fog.density + (target.fog.density - current.fog.density) * progress;
        const fogColor = current.fog.color.clone().lerp(target.fog.color, progress);

        if (this.scene.fog) {
            this.scene.fog.density = fogDensity;
            this.scene.fog.color.copy(fogColor);
        } else if (fogDensity > 0.0001) {
            this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);
        }

        // Update renderer clear color for atmosphere
        this.renderer.setClearColor(fogColor, 0.2 + fogDensity * 100);
    }

    storeOriginalEnvironment() {
        // Store original scene properties for restoration
        this.environmentalEffects.atmosphere.originalClearColor = this.renderer.getClearColor(new THREE.Color());
        this.environmentalEffects.atmosphere.originalClearAlpha = this.renderer.getClearAlpha();

        if (this.scene.fog) {
            this.environmentalEffects.fog.originalFog = this.scene.fog.clone();
        }
    }

    // Utility methods
    setWindDirection(x, y) {
        this.windSystem.setDirection(x, y);
    }

    setWindSpeed(speed) {
        this.windSystem.setStrength(speed);
    }

    triggerLightning() {
        if (this.lightningSystem) {
            this.lightningSystem.triggerFlash();
        }
    }

    createLightningBolt(position) {
        // Create a simple lightning bolt geometry
        const points = [];
        const start = position.clone();
        const end = position.clone();
        end.y = 0;

        // Generate jagged path
        let current = start.clone();
        points.push(current.clone());

        while (current.y > end.y + 10) {
            current.y -= 20 + Math.random() * 30;
            current.x += (Math.random() - 0.5) * 40;
            current.z += (Math.random() - 0.5) * 40;
            points.push(current.clone());
        }

        points.push(end);

        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, this.lightningSystem.material);

        this.scene.add(line);

        // Remove after flash
        setTimeout(() => {
            this.scene.remove(line);
            geometry.dispose();
        }, this.lightningSystem.flashDuration * 1000);
    }

    // Main update method
    update(deltaTime) {
        const time = performance.now() * 0.001;

        // Update weather transition
        this.updateWeatherTransition(deltaTime);

        // Update wind system
        this.windSystem.update(deltaTime);

        // Update lightning
        this.lightningSystem.update(deltaTime);

        // Update precipitation physics
        this.particleSystems.forEach(system => {
            if (system.activeParticles > 0) {
                this.precipitationCollision.checkCollisions(system, deltaTime);
            }

            // Update time uniform
            system.material.uniforms.time.value = time;
        });

        // Update camera position for particle systems
        this.particleSystems.forEach(system => {
            if (system.material.uniforms.cameraPosition) {
                system.material.uniforms.cameraPosition.value.copy(this.camera.position);
            }
        });
    }

    // Preset weather scenarios
    clearSkies() { this.setWeather('clear', 5); }
    lightRain() { this.setWeather('light_rain', 8); }
    heavyRain() { this.setWeather('heavy_rain', 6); }
    lightSnow() { this.setWeather('light_snow', 10); }
    blizzard() { this.setWeather('heavy_snow', 12); }
    thunderstorm() { this.setWeather('thunderstorm', 4); }
    foggyConditions() { this.setWeather('fog', 15); }
    dustStorm() { this.setWeather('dust_storm', 6); }

    // Random weather
    randomWeather() {
        const weatherTypes = Object.keys(this.weatherTypes);
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        this.setWeather(randomWeather, 8 + Math.random() * 10);
    }

    // Cleanup
    dispose() {
        this.particleSystems.forEach(system => {
            this.scene.remove(system.system);
            system.geometry.dispose();
            system.material.dispose();
        });

        if (this.lightningSystem.material) {
            this.lightningSystem.material.dispose();
        }

        // Restore original environment
        this.scene.fog = this.environmentalEffects.fog.originalFog;
        this.renderer.setClearColor(
            this.environmentalEffects.atmosphere.originalClearColor,
            this.environmentalEffects.atmosphere.originalClearAlpha
        );
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeWeatherSystems;
}