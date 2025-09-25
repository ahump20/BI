/**
 * <Æ BLAZE INTELLIGENCE - CHAMPIONSHIP VISUAL EFFECTS
 * Broadcast-quality championship celebration and presentation effects
 * ESPN/Fox Sports caliber visual systems for victorious moments
 */

class BlazeChampionshipEffects {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.activeEffects = new Map();
        this.effectPool = new Map(); // Object pooling for performance

        // Championship colors
        this.colors = {
            gold: 0xFFD700,
            silver: 0xC0C0C0,
            bronze: 0xCD7F32,
            blazeOrange: 0xBF5700,
            blazeSky: 0x9BCBEB,
            blazeNavy: 0x002244,
            confettiColors: [0xBF5700, 0x9BCBEB, 0xFFD700, 0xFF0000, 0x00FF00, 0x0000FF]
        };

        this.initializeEffectSystems();
    }

    initializeEffectSystems() {
        // Pre-create effect pools for instant triggering
        this.createConfettiPool();
        this.createFireworksPool();
        this.createLightBeamPool();

        console.log('<Æ Championship Effects System initialized');
    }

    /**
     * Championship Confetti Cannon System
     */
    triggerConfettiCelebration(config = {}) {
        const defaults = {
            particleCount: 5000,
            spread: 100,
            duration: 10000,
            gravity: -9.8,
            wind: { x: 2, z: 1 },
            sources: [
                { x: -50, y: 0, z: 0 },
                { x: 50, y: 0, z: 0 },
                { x: 0, y: 0, z: -50 },
                { x: 0, y: 0, z: 50 }
            ],
            colors: this.colors.confettiColors,
            shapes: ['square', 'circle', 'strip'],
            sparkle: true
        };

        const settings = { ...defaults, ...config };
        const confettiGroup = new THREE.Group();
        confettiGroup.name = 'ConfettiCelebration';

        // Create instanced mesh for confetti pieces
        const geometries = {
            square: new THREE.PlaneGeometry(1, 1),
            circle: new THREE.CircleGeometry(0.5, 8),
            strip: new THREE.PlaneGeometry(0.3, 2)
        };

        settings.sources.forEach((source, sourceIndex) => {
            const particlesPerSource = Math.floor(settings.particleCount / settings.sources.length);

            // Create instanced mesh for this source
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particlesPerSource * 3);
            const colors = new Float32Array(particlesPerSource * 3);
            const sizes = new Float32Array(particlesPerSource);
            const velocities = new Float32Array(particlesPerSource * 3);
            const rotations = new Float32Array(particlesPerSource * 3);

            for (let i = 0; i < particlesPerSource; i++) {
                // Initial position at source
                positions[i * 3] = source.x;
                positions[i * 3 + 1] = source.y;
                positions[i * 3 + 2] = source.z;

                // Random color
                const color = new THREE.Color(settings.colors[Math.floor(Math.random() * settings.colors.length)]);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;

                // Random size
                sizes[i] = Math.random() * 2 + 0.5;

                // Burst velocity
                const angle = Math.random() * Math.PI * 2;
                const power = Math.random() * settings.spread + settings.spread / 2;
                velocities[i * 3] = Math.cos(angle) * power;
                velocities[i * 3 + 1] = Math.random() * power + power; // Upward bias
                velocities[i * 3 + 2] = Math.sin(angle) * power;

                // Random rotation speeds
                rotations[i * 3] = Math.random() * 10 - 5;
                rotations[i * 3 + 1] = Math.random() * 10 - 5;
                rotations[i * 3 + 2] = Math.random() * 10 - 5;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
            geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 3));

            // Custom shader for confetti
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    gravity: { value: settings.gravity },
                    wind: { value: new THREE.Vector3(settings.wind.x, 0, settings.wind.z) },
                    sparkle: { value: settings.sparkle ? 1.0 : 0.0 }
                },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    attribute vec3 velocity;
                    attribute vec3 rotation;

                    uniform float time;
                    uniform float gravity;
                    uniform vec3 wind;

                    varying vec3 vColor;
                    varying vec3 vRotation;

                    void main() {
                        vColor = color;
                        vRotation = rotation * time;

                        vec3 pos = position;

                        // Physics simulation
                        pos += velocity * time;
                        pos.y += 0.5 * gravity * time * time;
                        pos += wind * time * 0.5;

                        // Fluttering effect
                        pos.x += sin(time * rotation.x) * 2.0;
                        pos.z += cos(time * rotation.z) * 2.0;

                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform float sparkle;
                    uniform float time;

                    varying vec3 vColor;
                    varying vec3 vRotation;

                    void main() {
                        // Create shape with rotation
                        vec2 coord = gl_PointCoord - vec2(0.5);

                        // Apply rotation
                        float angle = vRotation.y;
                        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
                        coord = rot * coord;

                        // Square shape
                        float alpha = 1.0 - step(0.5, max(abs(coord.x), abs(coord.y)));

                        // Sparkle effect
                        float sparkleAmount = sparkle * (sin(time * 20.0 + vRotation.x * 10.0) * 0.3 + 0.7);

                        vec3 finalColor = vColor * (1.0 + sparkleAmount * 0.5);
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                blending: THREE.AdditiveBlending,
                depthTest: true,
                depthWrite: false,
                transparent: true,
                vertexColors: true
            });

            const particles = new THREE.Points(geometry, material);
            confettiGroup.add(particles);

            // Store for animation
            this.activeEffects.set(particles.uuid, {
                type: 'confetti',
                mesh: particles,
                material: material,
                startTime: performance.now(),
                duration: settings.duration,
                settings: settings
            });
        });

        this.scene.add(confettiGroup);
        return confettiGroup;
    }

    /**
     * Trophy Reveal Animation
     */
    createTrophyReveal(config = {}) {
        const defaults = {
            trophyType: 'championship', // championship, mvp, achievement
            scale: 10,
            rotationSpeed: 0.01,
            glowIntensity: 2,
            pedestalHeight: 5,
            spotlightCount: 4,
            animationDuration: 3000
        };

        const settings = { ...defaults, ...config };
        const trophyGroup = new THREE.Group();
        trophyGroup.name = 'TrophyReveal';

        // Create trophy geometry (complex multi-part)
        const trophyParts = this.createTrophyGeometry(settings.trophyType);

        // Gold material with high metalness
        const goldMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors.gold,
            metalness: 1.0,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 1.0,
            envMapIntensity: 2.0
        });

        // Assemble trophy
        const trophy = new THREE.Group();
        trophyParts.forEach(part => {
            const mesh = new THREE.Mesh(part.geometry, goldMaterial);
            mesh.position.copy(part.position);
            trophy.add(mesh);
        });
        trophy.scale.setScalar(settings.scale);

        // Create pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(
            settings.scale * 0.8,
            settings.scale * 1.0,
            settings.pedestalHeight,
            32
        );
        const pedestalMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 0.8
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.y = -settings.pedestalHeight / 2;

        // Create spotlights
        const spotlights = [];
        for (let i = 0; i < settings.spotlightCount; i++) {
            const angle = (i / settings.spotlightCount) * Math.PI * 2;
            const distance = settings.scale * 3;

            const spotlight = new THREE.SpotLight(0xffffff, settings.glowIntensity, distance * 2);
            spotlight.position.set(
                Math.cos(angle) * distance,
                settings.scale * 2,
                Math.sin(angle) * distance
            );
            spotlight.target = trophy;
            spotlight.angle = Math.PI / 6;
            spotlight.penumbra = 0.3;
            spotlight.decay = 2;
            spotlight.castShadow = true;

            spotlights.push(spotlight);
            trophyGroup.add(spotlight);
        }

        // Create god rays
        this.createGodRays(trophyGroup, trophy.position, settings);

        // Add components to group
        trophyGroup.add(pedestal);
        trophyGroup.add(trophy);

        // Initial state for animation
        trophy.scale.setScalar(0);
        trophy.rotation.y = 0;
        pedestal.scale.y = 0;

        // Animate reveal
        const startTime = performance.now();
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / settings.animationDuration, 1);

            // Scale up with elastic easing
            const scale = this.easeOutElastic(progress) * settings.scale;
            trophy.scale.setScalar(scale);

            // Pedestal rises
            pedestal.scale.y = this.easeOutCubic(progress);

            // Trophy rotation
            trophy.rotation.y = progress * Math.PI * 2;

            // Spotlight intensity pulse
            spotlights.forEach((light, i) => {
                light.intensity = settings.glowIntensity *
                    (1 + Math.sin(elapsed * 0.002 + i) * 0.3);
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Continue rotation after reveal
                this.activeEffects.set(trophy.uuid, {
                    type: 'trophy',
                    mesh: trophy,
                    settings: settings,
                    update: () => {
                        trophy.rotation.y += settings.rotationSpeed;
                    }
                });
            }
        };

        animate();
        this.scene.add(trophyGroup);
        return trophyGroup;
    }

    /**
     * Stadium Wave Effect
     */
    createStadiumWave(config = {}) {
        const defaults = {
            radius: 100,
            segments: 60,
            waveSpeed: 2,
            waveHeight: 10,
            waveColor: this.colors.blazeOrange,
            particleCount: 1000,
            duration: 5000
        };

        const settings = { ...defaults, ...config };
        const waveGroup = new THREE.Group();
        waveGroup.name = 'StadiumWave';

        // Create ring geometry for wave path
        const waveGeometry = new THREE.TorusGeometry(
            settings.radius,
            settings.waveHeight,
            16,
            settings.segments
        );

        // Wave shader material
        const waveMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveSpeed: { value: settings.waveSpeed },
                waveColor: { value: new THREE.Color(settings.waveColor) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                uniform float time;
                uniform float waveSpeed;

                varying float vWave;
                varying vec3 vPosition;

                void main() {
                    vPosition = position;

                    // Calculate wave position
                    float angle = atan(position.z, position.x);
                    vWave = sin(angle - time * waveSpeed) * 0.5 + 0.5;

                    // Displace vertices based on wave
                    vec3 pos = position;
                    pos.y += vWave * 10.0;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 waveColor;
                uniform float opacity;

                varying float vWave;
                varying vec3 vPosition;

                void main() {
                    // Color based on wave height
                    vec3 color = waveColor * (0.5 + vWave * 0.5);

                    // Fade edges
                    float edgeFade = 1.0 - abs(vPosition.y) / 10.0;

                    gl_FragColor = vec4(color, opacity * vWave * edgeFade);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
        waveGroup.add(waveMesh);

        // Add particle trail
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(settings.particleCount * 3);
        const particleVelocities = new Float32Array(settings.particleCount * 3);

        for (let i = 0; i < settings.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = settings.radius + (Math.random() - 0.5) * settings.waveHeight;

            particlePositions[i * 3] = Math.cos(angle) * r;
            particlePositions[i * 3 + 1] = Math.random() * settings.waveHeight;
            particlePositions[i * 3 + 2] = Math.sin(angle) * r;

            particleVelocities[i * 3] = Math.random() * 0.2 - 0.1;
            particleVelocities[i * 3 + 1] = Math.random() * 0.5 + 0.5;
            particleVelocities[i * 3 + 2] = Math.random() * 0.2 - 0.1;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: settings.waveColor,
            size: 2,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        waveGroup.add(particles);

        // Store for animation
        this.activeEffects.set(waveGroup.uuid, {
            type: 'stadiumWave',
            mesh: waveMesh,
            particles: particles,
            material: waveMaterial,
            startTime: performance.now(),
            duration: settings.duration,
            settings: settings
        });

        this.scene.add(waveGroup);
        return waveGroup;
    }

    /**
     * Fireworks Display System
     */
    launchFireworks(config = {}) {
        const defaults = {
            count: 10,
            minHeight: 50,
            maxHeight: 100,
            spread: 100,
            colors: this.colors.confettiColors,
            trails: true,
            sparkCount: 100,
            staggerDelay: 500
        };

        const settings = { ...defaults, ...config };
        const fireworksGroup = new THREE.Group();
        fireworksGroup.name = 'FireworksDisplay';

        // Launch fireworks with staggered timing
        for (let i = 0; i < settings.count; i++) {
            setTimeout(() => {
                this.createSingleFirework(fireworksGroup, settings);
            }, i * settings.staggerDelay);
        }

        this.scene.add(fireworksGroup);
        return fireworksGroup;
    }

    createSingleFirework(group, settings) {
        const launchPosition = new THREE.Vector3(
            (Math.random() - 0.5) * settings.spread,
            0,
            (Math.random() - 0.5) * settings.spread
        );

        const targetHeight = settings.minHeight +
            Math.random() * (settings.maxHeight - settings.minHeight);

        const color = new THREE.Color(
            settings.colors[Math.floor(Math.random() * settings.colors.length)]
        );

        // Create trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = [];
        const trailColors = [];

        for (let i = 0; i < 20; i++) {
            const t = i / 19;
            trailPositions.push(
                launchPosition.x,
                launchPosition.y + t * targetHeight,
                launchPosition.z
            );
            trailColors.push(color.r, color.g * t, color.b * t); // Fade to dark
        }

        trailGeometry.setAttribute('position',
            new THREE.Float32BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color',
            new THREE.Float32BufferAttribute(trailColors, 3));

        const trailMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });

        const trail = new THREE.Line(trailGeometry, trailMaterial);
        group.add(trail);

        // Animate trail
        const trailStartTime = performance.now();
        const trailDuration = 1000;

        const animateTrail = () => {
            const elapsed = performance.now() - trailStartTime;
            const progress = Math.min(elapsed / trailDuration, 1);

            trail.material.opacity = 0.8 * (1 - progress);

            if (progress < 1) {
                requestAnimationFrame(animateTrail);
            } else {
                // Explode at peak
                this.createFireworkExplosion(
                    group,
                    new THREE.Vector3(launchPosition.x, targetHeight, launchPosition.z),
                    color,
                    settings
                );

                // Remove trail
                setTimeout(() => {
                    group.remove(trail);
                    trail.geometry.dispose();
                    trail.material.dispose();
                }, 500);
            }
        };

        animateTrail();
    }

    createFireworkExplosion(group, position, color, settings) {
        const sparkGeometry = new THREE.BufferGeometry();
        const sparkPositions = new Float32Array(settings.sparkCount * 3);
        const sparkVelocities = new Float32Array(settings.sparkCount * 3);
        const sparkColors = new Float32Array(settings.sparkCount * 3);

        for (let i = 0; i < settings.sparkCount; i++) {
            // Explosion pattern
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = Math.random() * 20 + 10;

            sparkPositions[i * 3] = position.x;
            sparkPositions[i * 3 + 1] = position.y;
            sparkPositions[i * 3 + 2] = position.z;

            sparkVelocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
            sparkVelocities[i * 3 + 1] = Math.cos(phi) * speed;
            sparkVelocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

            // Color variation
            const colorVariation = 1 - Math.random() * 0.3;
            sparkColors[i * 3] = color.r * colorVariation;
            sparkColors[i * 3 + 1] = color.g * colorVariation;
            sparkColors[i * 3 + 2] = color.b * colorVariation;
        }

        sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
        sparkGeometry.setAttribute('velocity', new THREE.BufferAttribute(sparkVelocities, 3));
        sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

        const sparkMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                gravity: { value: -9.8 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;

                uniform float time;
                uniform float gravity;

                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vColor = color;
                    vAlpha = 1.0 - time / 3.0; // Fade over 3 seconds

                    vec3 pos = position + velocity * time;
                    pos.y += 0.5 * gravity * time * time;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 4.0 * (300.0 / -mvPosition.z) * (1.0 - time / 3.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);

                    if (dist > 0.5) discard;

                    float alpha = (1.0 - dist * 2.0) * vAlpha;
                    gl_FragColor = vec4(vColor * 2.0, alpha); // Brighten color
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
        group.add(sparks);

        // Animate explosion
        const explosionStartTime = performance.now();
        const explosionDuration = 3000;

        const animateExplosion = () => {
            const elapsed = performance.now() - explosionStartTime;
            const time = elapsed * 0.001;

            sparkMaterial.uniforms.time.value = time;

            if (elapsed < explosionDuration) {
                requestAnimationFrame(animateExplosion);
            } else {
                group.remove(sparks);
                sparks.geometry.dispose();
                sparks.material.dispose();
            }
        };

        animateExplosion();
    }

    /**
     * Victory Light Show
     */
    createVictoryLightShow(config = {}) {
        const defaults = {
            beamCount: 8,
            rotationSpeed: 0.01,
            colorCycle: true,
            intensity: 5,
            range: 200,
            scanPattern: 'rotation' // rotation, random, sweep
        };

        const settings = { ...defaults, ...config };
        const lightShowGroup = new THREE.Group();
        lightShowGroup.name = 'VictoryLightShow';

        const beams = [];

        for (let i = 0; i < settings.beamCount; i++) {
            const angle = (i / settings.beamCount) * Math.PI * 2;

            // Create spotlight
            const light = new THREE.SpotLight(0xffffff, settings.intensity, settings.range);
            light.angle = Math.PI / 12;
            light.penumbra = 0.2;
            light.decay = 2;

            // Position in circle
            const radius = 50;
            light.position.set(
                Math.cos(angle) * radius,
                80,
                Math.sin(angle) * radius
            );

            // Create visible beam using cone geometry
            const beamGeometry = new THREE.ConeGeometry(5, settings.range, 8, 1, true);
            const beamMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(0xffffff) },
                    intensity: { value: settings.intensity }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    uniform float intensity;

                    varying vec3 vPosition;

                    void main() {
                        // Fade from top to bottom
                        float fade = 1.0 - (vPosition.y + 100.0) / 200.0;
                        fade = clamp(fade, 0.0, 1.0);

                        // Add shimmer
                        float shimmer = sin(time * 10.0 + vPosition.y * 0.1) * 0.1 + 0.9;

                        vec3 beamColor = color * intensity * shimmer;
                        gl_FragColor = vec4(beamColor, fade * 0.3);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
            beamMesh.position.copy(light.position);
            beamMesh.rotation.x = Math.PI;

            beams.push({
                light: light,
                mesh: beamMesh,
                material: beamMaterial,
                angle: angle,
                targetAngle: Math.random() * Math.PI * 2
            });

            lightShowGroup.add(light);
            lightShowGroup.add(beamMesh);

            // Add light target
            const target = new THREE.Object3D();
            target.position.set(0, 0, 0);
            lightShowGroup.add(target);
            light.target = target;
        }

        // Store for animation
        this.activeEffects.set(lightShowGroup.uuid, {
            type: 'lightShow',
            beams: beams,
            settings: settings,
            startTime: performance.now()
        });

        this.scene.add(lightShowGroup);
        return lightShowGroup;
    }

    /**
     * Helper Methods
     */

    createTrophyGeometry(type) {
        const parts = [];

        if (type === 'championship') {
            // Cup
            const cupGeometry = new THREE.LatheGeometry([
                new THREE.Vector2(0, 0),
                new THREE.Vector2(3, 0),
                new THREE.Vector2(4, 2),
                new THREE.Vector2(4, 5),
                new THREE.Vector2(3.5, 7),
                new THREE.Vector2(2, 8),
                new THREE.Vector2(0, 8)
            ], 32);
            parts.push({ geometry: cupGeometry, position: new THREE.Vector3(0, 2, 0) });

            // Handles
            const handleGeometry = new THREE.TorusGeometry(2, 0.3, 8, 16, Math.PI);
            parts.push({
                geometry: handleGeometry,
                position: new THREE.Vector3(4, 5, 0)
            });
            parts.push({
                geometry: handleGeometry.clone(),
                position: new THREE.Vector3(-4, 5, 0)
            });

            // Base
            const baseGeometry = new THREE.CylinderGeometry(2, 3, 1, 32);
            parts.push({ geometry: baseGeometry, position: new THREE.Vector3(0, 0, 0) });
        }

        return parts;
    }

    createGodRays(group, position, settings) {
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;

            const rayGeometry = new THREE.PlaneGeometry(2, 100);
            const rayMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    opacity: { value: 0.1 }
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
                    uniform float opacity;
                    varying vec2 vUv;

                    void main() {
                        float fade = 1.0 - vUv.y;
                        float pulse = sin(time * 2.0) * 0.2 + 0.8;
                        gl_FragColor = vec4(1.0, 0.95, 0.7, fade * opacity * pulse);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.copy(position);
            ray.position.y += 20;
            ray.rotation.y = angle;

            group.add(ray);

            // Animate
            this.activeEffects.set(ray.uuid, {
                type: 'godRay',
                mesh: ray,
                material: rayMaterial
            });
        }
    }

    // Object Pooling for Performance

    createConfettiPool() {
        const poolSize = 10000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(poolSize * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.effectPool.set('confetti', {
            geometry: geometry,
            available: poolSize,
            inUse: 0
        });
    }

    createFireworksPool() {
        const poolSize = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(poolSize * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.effectPool.set('fireworks', {
            geometry: geometry,
            available: poolSize,
            inUse: 0
        });
    }

    createLightBeamPool() {
        const poolSize = 20;
        const beams = [];

        for (let i = 0; i < poolSize; i++) {
            const light = new THREE.SpotLight(0xffffff, 0, 100);
            light.visible = false;
            this.scene.add(light);
            beams.push(light);
        }

        this.effectPool.set('lightBeams', {
            beams: beams,
            available: poolSize,
            inUse: 0
        });
    }

    // Easing Functions

    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 :
            Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    // Update Loop

    update(deltaTime) {
        const currentTime = performance.now();

        this.activeEffects.forEach((effect, uuid) => {
            if (effect.type === 'confetti' || effect.type === 'stadiumWave') {
                const elapsed = (currentTime - effect.startTime) * 0.001;
                effect.material.uniforms.time.value = elapsed;

                // Remove after duration
                if (elapsed > effect.duration / 1000) {
                    this.removeEffect(uuid);
                }
            } else if (effect.type === 'lightShow') {
                effect.beams.forEach(beam => {
                    beam.material.uniforms.time.value = currentTime * 0.001;

                    // Rotate beams
                    if (effect.settings.scanPattern === 'rotation') {
                        beam.angle += effect.settings.rotationSpeed;
                        beam.light.position.x = Math.cos(beam.angle) * 50;
                        beam.light.position.z = Math.sin(beam.angle) * 50;
                        beam.mesh.position.copy(beam.light.position);
                    }

                    // Color cycle
                    if (effect.settings.colorCycle) {
                        const hue = (currentTime * 0.0001) % 1;
                        const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
                        beam.light.color = color;
                        beam.material.uniforms.color.value = color;
                    }
                });
            } else if (effect.type === 'trophy' && effect.update) {
                effect.update();
            } else if (effect.type === 'godRay') {
                effect.material.uniforms.time.value = currentTime * 0.001;
            }
        });
    }

    removeEffect(uuid) {
        const effect = this.activeEffects.get(uuid);
        if (effect) {
            if (effect.mesh) {
                if (effect.mesh.parent) {
                    effect.mesh.parent.remove(effect.mesh);
                }
                if (effect.mesh.geometry) effect.mesh.geometry.dispose();
                if (effect.mesh.material) {
                    if (Array.isArray(effect.mesh.material)) {
                        effect.mesh.material.forEach(m => m.dispose());
                    } else {
                        effect.mesh.material.dispose();
                    }
                }
            }
            this.activeEffects.delete(uuid);
        }
    }

    // Cleanup

    dispose() {
        this.activeEffects.forEach((effect, uuid) => {
            this.removeEffect(uuid);
        });

        this.effectPool.forEach(pool => {
            if (pool.geometry) pool.geometry.dispose();
            if (pool.beams) {
                pool.beams.forEach(beam => {
                    this.scene.remove(beam);
                    beam.dispose();
                });
            }
        });

        this.activeEffects.clear();
        this.effectPool.clear();

        console.log('>ù Championship Effects disposed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeChampionshipEffects;
}