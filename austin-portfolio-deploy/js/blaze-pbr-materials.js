/**
 * 🔥 BLAZE INTELLIGENCE - PBR MATERIALS & DYNAMIC LIGHTING
 * Physically-based rendering materials with sports-specific textures
 * Dynamic lighting system for stadium and field visualization
 */

class BlazePBRMaterials {
    constructor() {
        this.materials = {};
        this.textures = {};
        this.lights = {};
        this.environmentMap = null;
        this.pmremGenerator = null;

        // Blaze brand colors
        this.brandColors = {
            blazeOrange: 0xBF5700,
            blazeSky: 0x9BCBEB,
            blazeNavy: 0x002244,
            blazeTeal: 0x00B2A9,
            blazeGold: 0xFFD700
        };

        this.init();
    }

    init() {
        this.createStadiumMaterials();
        this.createFieldMaterials();
        this.createPlayerMaterials();
        this.createDataMaterials();
        this.setupDynamicLighting();

        console.log('🎨 PBR Materials and Dynamic Lighting initialized');
    }

    setupEnvironment(renderer) {
        // Create HDR environment map for reflections
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.pmremGenerator.compileEquirectangularShader();

        // Create procedural environment
        const envScene = new THREE.Scene();
        envScene.background = new THREE.Color(0x001122);

        // Add gradient sky
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077be) },
                bottomColor: { value: new THREE.Color(0x001122) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;

                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        envScene.add(sky);

        // Generate environment map
        this.environmentMap = this.pmremGenerator.fromScene(envScene);
    }

    createStadiumMaterials() {
        // Stadium seating material - plastic/metal hybrid
        this.materials.stadiumSeating = new THREE.MeshPhysicalMaterial({
            color: this.brandColors.blazeNavy,
            metalness: 0.3,
            roughness: 0.7,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2,
            envMapIntensity: 0.5
        });

        // Stadium structure - concrete
        this.materials.concrete = new THREE.MeshPhysicalMaterial({
            color: 0x888888,
            metalness: 0.0,
            roughness: 0.9,
            bumpScale: 0.005,
            envMapIntensity: 0.3
        });

        // Stadium lights - emissive
        this.materials.stadiumLights = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2.0,
            metalness: 0.8,
            roughness: 0.1
        });

        // Glass material for luxury boxes
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.9,
            transparent: true,
            opacity: 0.5,
            envMapIntensity: 1.0,
            ior: 1.5,
            thickness: 0.5
        });

        // Jumbotron screen - emissive with video texture capability
        this.materials.jumbotron = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            emissive: this.brandColors.blazeOrange,
            emissiveIntensity: 0.5,
            metalness: 0.9,
            roughness: 0.1
        });
    }

    createFieldMaterials() {
        // Grass material with custom shader for realistic appearance
        this.materials.grass = new THREE.ShaderMaterial({
            uniforms: {
                grassColor1: { value: new THREE.Color(0x1a5f1a) },
                grassColor2: { value: new THREE.Color(0x2d7a2d) },
                time: { value: 0 },
                windStrength: { value: 0.5 },
                windDirection: { value: new THREE.Vector2(1, 0) }
            },
            vertexShader: `
                uniform float time;
                uniform float windStrength;
                uniform vec2 windDirection;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vUv = uv;
                    vNormal = normal;
                    vPosition = position;

                    // Add wind effect
                    vec3 pos = position;
                    float windEffect = sin(time * 2.0 + position.x * 0.1) * windStrength;
                    pos.x += windEffect * windDirection.x * 0.1;
                    pos.z += windEffect * windDirection.y * 0.1;
                    pos.y += abs(windEffect) * 0.05;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 grassColor1;
                uniform vec3 grassColor2;
                uniform float time;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    // Create grass pattern
                    float pattern = sin(vPosition.x * 50.0) * sin(vPosition.z * 50.0);
                    vec3 color = mix(grassColor1, grassColor2, pattern * 0.5 + 0.5);

                    // Add subtle variation
                    color *= 0.9 + 0.1 * sin(time + vPosition.x * 10.0);

                    // Basic lighting
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
                    float NdotL = max(dot(vNormal, lightDir), 0.0);
                    color *= 0.5 + 0.5 * NdotL;

                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        // Dirt/Clay material for baseball diamond
        this.materials.dirt = new THREE.MeshPhysicalMaterial({
            color: 0x8b6633,
            metalness: 0.0,
            roughness: 0.95,
            bumpScale: 0.003,
            envMapIntensity: 0.2
        });

        // Field lines - bright white
        this.materials.fieldLines = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.1,
            metalness: 0.0,
            roughness: 0.8
        });

        // Artificial turf for modern fields
        this.materials.artificialTurf = new THREE.MeshPhysicalMaterial({
            color: 0x1a5f1a,
            metalness: 0.1,
            roughness: 0.6,
            clearcoat: 0.2,
            clearcoatRoughness: 0.4,
            envMapIntensity: 0.3
        });
    }

    createPlayerMaterials() {
        // Jersey fabric material
        this.materials.jerseyFabric = new THREE.MeshPhysicalMaterial({
            color: this.brandColors.blazeOrange,
            metalness: 0.0,
            roughness: 0.7,
            sheen: 0.5,
            sheenRoughness: 0.2,
            sheenColor: new THREE.Color(0xffffff),
            envMapIntensity: 0.3
        });

        // Helmet material - glossy with team colors
        this.materials.helmet = new THREE.MeshPhysicalMaterial({
            color: this.brandColors.blazeNavy,
            metalness: 0.6,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            envMapIntensity: 1.0
        });

        // Skin material with subsurface scattering
        this.materials.skin = new THREE.MeshPhysicalMaterial({
            color: 0xffdbac,
            metalness: 0.0,
            roughness: 0.5,
            thickness: 0.5,
            transmission: 0.1,
            envMapIntensity: 0.3
        });

        // Equipment materials (gloves, cleats, etc.)
        this.materials.leather = new THREE.MeshPhysicalMaterial({
            color: 0x4a3c28,
            metalness: 0.0,
            roughness: 0.4,
            envMapIntensity: 0.4
        });

        // Baseball bat - wood material
        this.materials.wood = new THREE.MeshPhysicalMaterial({
            color: 0x8b6f47,
            metalness: 0.0,
            roughness: 0.3,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1,
            envMapIntensity: 0.5
        });
    }

    createDataMaterials() {
        // Holographic data visualization material
        this.materials.holographic = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(this.brandColors.blazeTeal) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float opacity;

                varying vec2 vUv;
                varying vec3 vPosition;

                void main() {
                    // Holographic effect
                    float scanline = sin(vUv.y * 100.0 + time * 10.0) * 0.04 + 0.96;
                    float glow = sin(time * 2.0) * 0.1 + 0.9;

                    vec3 finalColor = color * scanline * glow;

                    // Edge glow
                    float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
                    edge *= 1.0 - abs(vUv.y - 0.5) * 2.0;
                    finalColor += color * (1.0 - edge) * 0.5;

                    gl_FragColor = vec4(finalColor, opacity * edge);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Data particle material
        this.materials.dataParticle = new THREE.PointsMaterial({
            color: this.brandColors.blazeGold,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        // Energy field material for special effects
        this.materials.energyField = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 1.0 },
                colorA: { value: new THREE.Color(this.brandColors.blazeOrange) },
                colorB: { value: new THREE.Color(this.brandColors.blazeGold) }
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
                uniform float intensity;
                uniform vec3 colorA;
                uniform vec3 colorB;

                varying vec2 vUv;
                varying vec3 vNormal;

                float noise(vec2 p) {
                    return sin(p.x * 10.0) * sin(p.y * 10.0);
                }

                void main() {
                    // Energy waves
                    float wave = sin(vUv.x * 20.0 + time * 3.0) * 0.5 + 0.5;
                    wave *= sin(vUv.y * 20.0 - time * 2.0) * 0.5 + 0.5;

                    // Color interpolation
                    vec3 color = mix(colorA, colorB, wave);

                    // Fresnel effect
                    vec3 viewDir = normalize(cameraPosition - vNormal);
                    float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

                    color *= intensity * (0.5 + fresnel);

                    gl_FragColor = vec4(color, 0.7 + fresnel * 0.3);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
    }

    setupDynamicLighting() {
        // Sun/Moon directional light
        this.lights.sun = new THREE.DirectionalLight(0xffffff, 1.0);
        this.lights.sun.position.set(100, 100, 50);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 500;
        this.lights.sun.shadow.camera.left = -100;
        this.lights.sun.shadow.camera.right = 100;
        this.lights.sun.shadow.camera.top = 100;
        this.lights.sun.shadow.camera.bottom = -100;

        // Ambient light for general illumination
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.5);

        // Stadium floodlights
        this.lights.stadiumLights = [];
        const floodlightPositions = [
            { x: -50, y: 30, z: -50 },
            { x: 50, y: 30, z: -50 },
            { x: -50, y: 30, z: 50 },
            { x: 50, y: 30, z: 50 }
        ];

        floodlightPositions.forEach((pos, index) => {
            const light = new THREE.SpotLight(0xffffff, 2.0);
            light.position.set(pos.x, pos.y, pos.z);
            light.angle = Math.PI / 4;
            light.penumbra = 0.3;
            light.decay = 2;
            light.distance = 200;
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            this.lights.stadiumLights.push(light);
        });

        // Team color accent lights
        this.lights.teamAccent1 = new THREE.PointLight(this.brandColors.blazeOrange, 0.5, 50);
        this.lights.teamAccent1.position.set(-20, 10, 0);

        this.lights.teamAccent2 = new THREE.PointLight(this.brandColors.blazeSky, 0.5, 50);
        this.lights.teamAccent2.position.set(20, 10, 0);
    }

    // Update time-based effects
    update(deltaTime) {
        // Update grass wind effect
        if (this.materials.grass) {
            this.materials.grass.uniforms.time.value += deltaTime;
        }

        // Update holographic materials
        if (this.materials.holographic) {
            this.materials.holographic.uniforms.time.value += deltaTime;
        }

        // Update energy field
        if (this.materials.energyField) {
            this.materials.energyField.uniforms.time.value += deltaTime;
        }
    }

    // Set time of day for dynamic lighting
    setTimeOfDay(hour) {
        const normalizedHour = hour / 24;

        // Calculate sun position
        const sunAngle = normalizedHour * Math.PI * 2 - Math.PI / 2;
        const sunHeight = Math.sin(sunAngle) * 100;
        const sunDistance = Math.cos(sunAngle) * 100;

        this.lights.sun.position.set(sunDistance, Math.max(sunHeight, 5), 50);

        // Adjust sun color and intensity based on time
        if (hour >= 6 && hour <= 18) {
            // Daytime
            const dayProgress = (hour - 6) / 12;
            const intensity = 0.5 + Math.sin(dayProgress * Math.PI) * 0.5;
            this.lights.sun.intensity = intensity;

            // Golden hour effect
            if (hour <= 8 || hour >= 16) {
                this.lights.sun.color.setHex(0xffaa33);
            } else {
                this.lights.sun.color.setHex(0xffffff);
            }

            // Dim stadium lights during day
            this.lights.stadiumLights.forEach(light => {
                light.intensity = 0.2;
            });
        } else {
            // Nighttime
            this.lights.sun.intensity = 0.1;
            this.lights.sun.color.setHex(0x4444ff); // Moonlight

            // Full stadium lights at night
            this.lights.stadiumLights.forEach(light => {
                light.intensity = 2.0;
            });
        }

        // Adjust ambient light
        const ambientIntensity = hour >= 6 && hour <= 18 ? 0.5 : 0.2;
        this.lights.ambient.intensity = ambientIntensity;
    }

    // Apply weather effects to materials
    setWeatherConditions(weather) {
        switch(weather) {
            case 'rain':
                // Make surfaces wet and reflective
                this.materials.grass.uniforms.grassColor1.value = new THREE.Color(0x0f3f0f);
                this.materials.grass.uniforms.grassColor2.value = new THREE.Color(0x1a5a1a);
                this.materials.dirt.roughness = 0.3;
                this.materials.concrete.roughness = 0.4;
                break;

            case 'snow':
                // Add snow overlay
                this.materials.grass.uniforms.grassColor1.value = new THREE.Color(0xeeeeee);
                this.materials.grass.uniforms.grassColor2.value = new THREE.Color(0xffffff);
                break;

            case 'fog':
                // Reduce visibility with fog
                // This would be handled by the scene's fog property
                break;

            case 'clear':
            default:
                // Reset to normal conditions
                this.materials.grass.uniforms.grassColor1.value = new THREE.Color(0x1a5f1a);
                this.materials.grass.uniforms.grassColor2.value = new THREE.Color(0x2d7a2d);
                this.materials.dirt.roughness = 0.95;
                this.materials.concrete.roughness = 0.9;
                break;
        }
    }

    // Get material by name
    getMaterial(name) {
        return this.materials[name];
    }

    // Add all lights to scene
    addLightsToScene(scene) {
        scene.add(this.lights.sun);
        scene.add(this.lights.ambient);
        this.lights.stadiumLights.forEach(light => scene.add(light));
        scene.add(this.lights.teamAccent1);
        scene.add(this.lights.teamAccent2);
    }

    // Cleanup
    dispose() {
        // Dispose materials
        Object.values(this.materials).forEach(material => {
            if (material.dispose) material.dispose();
        });

        // Dispose textures
        Object.values(this.textures).forEach(texture => {
            if (texture.dispose) texture.dispose();
        });

        // Dispose environment map
        if (this.environmentMap) {
            this.environmentMap.texture.dispose();
        }

        if (this.pmremGenerator) {
            this.pmremGenerator.dispose();
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazePBRMaterials;
}