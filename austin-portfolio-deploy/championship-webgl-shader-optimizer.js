/**
 * BLAZE INTELLIGENCE - CHAMPIONSHIP WEBGL SHADER OPTIMIZATION ENGINE
 * Revolutionary High-Performance Shader System for 60FPS 3D Experience
 * Austin Humphrey - blazesportsintel.com - Deep South Sports Authority
 */

class ChampionshipWebGLShaderOptimizer {
    constructor() {
        this.shaderCache = new Map();
        this.compiledShaders = new Map();
        this.uniformCache = new Map();
        this.attributeCache = new Map();
        this.optimizedMaterials = new Map();

        // Performance tiers for shader complexity
        this.performanceTiers = {
            championship: {
                vertexComplexity: 'high',
                fragmentComplexity: 'ultra',
                lightingModel: 'pbr',
                shadows: 'pcf_soft',
                postProcessing: true
            },
            professional: {
                vertexComplexity: 'medium',
                fragmentComplexity: 'high',
                lightingModel: 'blinn_phong',
                shadows: 'pcf',
                postProcessing: true
            },
            competitive: {
                vertexComplexity: 'low',
                fragmentComplexity: 'medium',
                lightingModel: 'lambert',
                shadows: 'basic',
                postProcessing: false
            },
            optimized: {
                vertexComplexity: 'minimal',
                fragmentComplexity: 'low',
                lightingModel: 'basic',
                shadows: 'none',
                postProcessing: false
            }
        };

        // High-performance shader templates
        this.shaderTemplates = this.initializeShaderTemplates();

        this.initialize();
    }

    initialize() {
        console.log('🚀 Championship WebGL Shader Optimizer Initializing...');

        this.detectWebGLCapabilities();
        this.precompileEssentialShaders();
        this.setupUniformOptimization();
        this.createMaterialPool();

        console.log('⚡ High-Performance Shader System ACTIVE');
    }

    detectWebGLCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        this.capabilities = {
            webGL2: gl.constructor.name.includes('2'),
            maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            maxVertexUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxVaryings: gl.getParameter(gl.MAX_VARYING_VECTORS),
            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            extensions: gl.getSupportedExtensions(),
            renderer: gl.getParameter(gl.RENDERER),
            maxAnisotropy: this.getMaxAnisotropy(gl)
        };

        // Optimize based on capabilities
        this.optimizeForCapabilities();
    }

    getMaxAnisotropy(gl) {
        const ext = gl.getExtension('EXT_texture_filter_anisotropic') ||
                   gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                   gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

        return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
    }

    optimizeForCapabilities() {
        const tier = this.determineOptimalTier();
        this.currentTier = tier;

        console.log(`🎯 Optimizing shaders for ${tier} tier performance`);

        // Adjust shader complexity based on capabilities
        this.shaderComplexity = this.performanceTiers[tier];
    }

    determineOptimalTier() {
        let score = 0;

        // WebGL2 support
        if (this.capabilities.webGL2) score += 30;

        // Texture unit availability
        score += Math.min(this.capabilities.maxTextureUnits, 16) * 2;

        // GPU quality indicators
        const renderer = this.capabilities.renderer.toLowerCase();
        if (renderer.includes('rtx') || renderer.includes('rx 6') || renderer.includes('rx 7')) {
            score += 50;
        } else if (renderer.includes('gtx') || renderer.includes('rx 5')) {
            score += 30;
        } else if (renderer.includes('adreno') || renderer.includes('mali')) {
            score += 15;
        }

        // Extension support
        const importantExts = ['OES_texture_float', 'WEBGL_depth_texture', 'EXT_texture_filter_anisotropic'];
        score += this.capabilities.extensions.filter(ext => importantExts.includes(ext)).length * 10;

        // Determine tier
        if (score >= 120) return 'championship';
        if (score >= 80) return 'professional';
        if (score >= 40) return 'competitive';
        return 'optimized';
    }

    initializeShaderTemplates() {
        return {
            // High-performance particle vertex shader
            particleVertex: {
                championship: `
                    precision highp float;
                    attribute vec3 position;
                    attribute vec3 velocity;
                    attribute float size;
                    attribute float alpha;
                    attribute vec3 color;

                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform float time;
                    uniform vec3 cameraPosition;

                    varying vec3 vColor;
                    varying float vAlpha;
                    varying vec2 vUv;
                    varying float vDistance;

                    void main() {
                        vec3 pos = position + velocity * sin(time * 0.001);

                        // Distance-based size scaling
                        float distance = length(cameraPosition - pos);
                        float scaledSize = size * (50.0 / (distance + 1.0));

                        vColor = color;
                        vAlpha = alpha * (1.0 - distance * 0.005);
                        vDistance = distance;

                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = scaledSize;
                    }
                `,
                professional: `
                    precision mediump float;
                    attribute vec3 position;
                    attribute vec3 color;
                    attribute float size;

                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform float time;

                    varying vec3 vColor;
                    varying float vAlpha;

                    void main() {
                        vColor = color;
                        vAlpha = 0.8;

                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = size;
                    }
                `,
                competitive: `
                    attribute vec3 position;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    varying vec3 vColor;

                    void main() {
                        vColor = vec3(1.0, 0.8, 0.0);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = 2.0;
                    }
                `,
                optimized: `
                    attribute vec3 position;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;

                    void main() {
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = 1.0;
                    }
                `
            },

            // Optimized particle fragment shader
            particleFragment: {
                championship: `
                    precision highp float;
                    varying vec3 vColor;
                    varying float vAlpha;
                    varying float vDistance;

                    uniform sampler2D particleTexture;
                    uniform float time;

                    void main() {
                        vec2 center = gl_PointCoord - 0.5;
                        float radius = length(center);

                        if (radius > 0.5) discard;

                        // Soft edge with distance fade
                        float edge = 1.0 - smoothstep(0.3, 0.5, radius);
                        float distanceFade = 1.0 - clamp(vDistance * 0.01, 0.0, 1.0);

                        // Animated glow
                        float glow = sin(time * 0.002) * 0.2 + 0.8;

                        vec3 finalColor = vColor * glow;
                        float finalAlpha = vAlpha * edge * distanceFade;

                        gl_FragColor = vec4(finalColor, finalAlpha);
                    }
                `,
                professional: `
                    precision mediump float;
                    varying vec3 vColor;
                    varying float vAlpha;

                    void main() {
                        vec2 center = gl_PointCoord - 0.5;
                        float radius = length(center);

                        if (radius > 0.5) discard;

                        float edge = 1.0 - smoothstep(0.4, 0.5, radius);
                        gl_FragColor = vec4(vColor, vAlpha * edge);
                    }
                `,
                competitive: `
                    varying vec3 vColor;

                    void main() {
                        vec2 center = gl_PointCoord - 0.5;
                        if (length(center) > 0.5) discard;
                        gl_FragColor = vec4(vColor, 0.6);
                    }
                `,
                optimized: `
                    void main() {
                        gl_FragColor = vec4(1.0, 0.8, 0.0, 0.5);
                    }
                `
            },

            // Stadium surface shader
            stadiumSurface: {
                championship: `
                    precision highp float;
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;

                    uniform sampler2D grassTexture;
                    uniform sampler2D normalMap;
                    uniform vec3 lightPosition;
                    uniform vec3 cameraPosition;
                    uniform float time;

                    void main() {
                        // Wind animation
                        vec2 windUv = vUv + sin(time * 0.001 + vPosition.x * 0.1) * 0.01;

                        vec4 grassColor = texture2D(grassTexture, windUv);
                        vec3 normal = normalize(vNormal);

                        // Lighting calculation
                        vec3 lightDir = normalize(lightPosition - vPosition);
                        float diff = max(dot(normal, lightDir), 0.0);

                        // Specular highlight
                        vec3 viewDir = normalize(cameraPosition - vPosition);
                        vec3 reflectDir = reflect(-lightDir, normal);
                        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

                        vec3 result = grassColor.rgb * (0.3 + diff * 0.7) + spec * 0.2;
                        gl_FragColor = vec4(result, 1.0);
                    }
                `,
                professional: `
                    precision mediump float;
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;

                    uniform sampler2D grassTexture;
                    uniform vec3 lightPosition;

                    void main() {
                        vec4 grassColor = texture2D(grassTexture, vUv);
                        vec3 normal = normalize(vNormal);
                        vec3 lightDir = normalize(lightPosition - vPosition);
                        float diff = max(dot(normal, lightDir), 0.0);

                        vec3 result = grassColor.rgb * (0.4 + diff * 0.6);
                        gl_FragColor = vec4(result, 1.0);
                    }
                `,
                competitive: `
                    varying vec2 vUv;
                    uniform sampler2D grassTexture;

                    void main() {
                        vec4 color = texture2D(grassTexture, vUv);
                        gl_FragColor = vec4(color.rgb * 0.8, 1.0);
                    }
                `,
                optimized: `
                    void main() {
                        gl_FragColor = vec4(0.2, 0.6, 0.2, 1.0);
                    }
                `
            },

            // Championship tower shader with glow
            championshipTower: {
                championship: `
                    precision highp float;
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;

                    uniform float time;
                    uniform vec3 teamColor;
                    uniform float performance;
                    uniform vec3 cameraPosition;

                    void main() {
                        vec3 normal = normalize(vNormal);
                        vec3 viewDir = normalize(cameraPosition - vPosition);

                        // Performance-based glow
                        float glow = performance * 0.01;
                        float pulse = sin(time * 0.003) * 0.3 + 0.7;

                        // Fresnel effect
                        float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);

                        // Height-based intensity
                        float heightFade = vUv.y;

                        vec3 baseColor = teamColor;
                        vec3 glowColor = teamColor * glow * pulse * fresnel;

                        vec3 result = mix(baseColor, glowColor, heightFade);
                        float alpha = 0.8 + fresnel * 0.2;

                        gl_FragColor = vec4(result, alpha);
                    }
                `,
                professional: `
                    precision mediump float;
                    varying vec2 vUv;
                    varying vec3 vNormal;

                    uniform vec3 teamColor;
                    uniform float performance;

                    void main() {
                        float intensity = performance * 0.01 * vUv.y;
                        vec3 color = teamColor * (0.5 + intensity);
                        gl_FragColor = vec4(color, 0.8);
                    }
                `,
                competitive: `
                    varying vec2 vUv;
                    uniform vec3 teamColor;

                    void main() {
                        vec3 color = teamColor * vUv.y;
                        gl_FragColor = vec4(color, 0.7);
                    }
                `,
                optimized: `
                    uniform vec3 teamColor;

                    void main() {
                        gl_FragColor = vec4(teamColor * 0.5, 0.6);
                    }
                `
            }
        };
    }

    precompileEssentialShaders() {
        console.log('🔧 Precompiling essential shaders for optimal performance...');

        const essentialShaders = [
            'particleVertex',
            'particleFragment',
            'stadiumSurface',
            'championshipTower'
        ];

        essentialShaders.forEach(shaderName => {
            const template = this.shaderTemplates[shaderName];
            if (template) {
                Object.keys(template).forEach(tier => {
                    const cacheKey = `${shaderName}_${tier}`;
                    this.shaderCache.set(cacheKey, {
                        source: template[tier],
                        compiled: false,
                        program: null
                    });
                });
            }
        });
    }

    getOptimizedShader(shaderName, customUniforms = {}) {
        const tier = this.currentTier || 'professional';
        const cacheKey = `${shaderName}_${tier}`;

        let shader = this.shaderCache.get(cacheKey);
        if (!shader) {
            console.warn(`Shader ${shaderName} not found for tier ${tier}`);
            return this.getFallbackShader();
        }

        // Customize shader with uniforms if needed
        if (Object.keys(customUniforms).length > 0) {
            const customKey = `${cacheKey}_${JSON.stringify(customUniforms)}`;
            let customShader = this.shaderCache.get(customKey);

            if (!customShader) {
                customShader = {
                    source: this.customizeShaderWithUniforms(shader.source, customUniforms),
                    compiled: false,
                    program: null
                };
                this.shaderCache.set(customKey, customShader);
            }
            shader = customShader;
        }

        return shader.source;
    }

    customizeShaderWithUniforms(shaderSource, uniforms) {
        let customizedSource = shaderSource;

        // Add custom uniforms to shader
        const uniformDeclarations = Object.entries(uniforms)
            .map(([name, type]) => `uniform ${type} ${name};`)
            .join('\n');

        // Insert uniform declarations after precision statements
        customizedSource = customizedSource.replace(
            /(precision\s+\w+\s+float;)/g,
            `$1\n${uniformDeclarations}`
        );

        return customizedSource;
    }

    createOptimizedMaterial(config) {
        const materialKey = this.generateMaterialKey(config);

        if (this.optimizedMaterials.has(materialKey)) {
            return this.optimizedMaterials.get(materialKey);
        }

        const material = this.buildOptimizedMaterial(config);
        this.optimizedMaterials.set(materialKey, material);

        return material;
    }

    generateMaterialKey(config) {
        return JSON.stringify({
            type: config.type,
            tier: this.currentTier,
            features: config.features || []
        });
    }

    buildOptimizedMaterial(config) {
        const vertexShader = this.getOptimizedShader(`${config.type}Vertex`);
        const fragmentShader = this.getOptimizedShader(`${config.type}Fragment`);

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: this.createOptimizedUniforms(config.uniforms || {}),
            transparent: config.transparent !== false,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
            depthWrite: config.depthWrite !== false,
            depthTest: config.depthTest !== false
        });

        // Apply performance optimizations
        this.applyMaterialOptimizations(material, config);

        return material;
    }

    createOptimizedUniforms(uniformConfig) {
        const uniforms = {};

        Object.entries(uniformConfig).forEach(([name, config]) => {
            const cacheKey = `${name}_${config.type}`;

            if (this.uniformCache.has(cacheKey)) {
                uniforms[name] = this.uniformCache.get(cacheKey);
            } else {
                uniforms[name] = {
                    type: config.type,
                    value: config.value
                };
                this.uniformCache.set(cacheKey, uniforms[name]);
            }
        });

        return uniforms;
    }

    applyMaterialOptimizations(material, config) {
        // Disable unnecessary features based on performance tier
        const tier = this.currentTier;

        if (tier === 'optimized' || tier === 'competitive') {
            material.fog = false;
            material.lights = false;
        }

        // Optimize rendering order
        if (config.renderOrder !== undefined) {
            material.renderOrder = config.renderOrder;
        }

        // Set precision hints
        material.precision = this.getOptimalPrecision();

        // Optimize polygon offset for z-fighting
        if (config.polygonOffset) {
            material.polygonOffset = true;
            material.polygonOffsetFactor = config.polygonOffset.factor || 1;
            material.polygonOffsetUnits = config.polygonOffset.units || 1;
        }
    }

    getOptimalPrecision() {
        switch (this.currentTier) {
            case 'championship':
                return 'highp';
            case 'professional':
                return 'mediump';
            default:
                return 'lowp';
        }
    }

    createParticleSystem(config) {
        const maxParticles = this.getOptimalParticleCount(config.maxParticles);

        // Create optimized geometry
        const geometry = new THREE.BufferGeometry();

        // Position attribute
        const positions = new Float32Array(maxParticles * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Add tier-specific attributes
        if (this.currentTier !== 'optimized') {
            const colors = new Float32Array(maxParticles * 3);
            const sizes = new Float32Array(maxParticles);

            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            // Advanced attributes for higher tiers
            if (this.currentTier === 'championship') {
                const velocities = new Float32Array(maxParticles * 3);
                const alphas = new Float32Array(maxParticles);

                geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
                geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
            }
        }

        // Create optimized material
        const material = this.createOptimizedMaterial({
            type: 'particle',
            transparent: true,
            uniforms: {
                time: { type: 'f', value: 0 },
                cameraPosition: { type: 'v3', value: new THREE.Vector3() }
            }
        });

        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData.isOptimized = true;
        particleSystem.userData.maxParticles = maxParticles;

        return particleSystem;
    }

    getOptimalParticleCount(requested) {
        const limits = {
            championship: 3000,
            professional: 1500,
            competitive: 800,
            optimized: 400
        };

        return Math.min(requested, limits[this.currentTier]);
    }

    createChampionshipTower(teamData, height = 100) {
        const geometry = new THREE.CylinderGeometry(5, 8, height, 16);

        const material = this.createOptimizedMaterial({
            type: 'championshipTower',
            uniforms: {
                time: { type: 'f', value: 0 },
                teamColor: { type: 'v3', value: new THREE.Color(teamData.color) },
                performance: { type: 'f', value: teamData.performance },
                cameraPosition: { type: 'v3', value: new THREE.Vector3() }
            },
            transparent: true
        });

        const tower = new THREE.Mesh(geometry, material);
        tower.userData.isChampionshipTower = true;
        tower.userData.teamData = teamData;

        return tower;
    }

    createStadiumSurface(width = 200, height = 120) {
        const geometry = new THREE.PlaneGeometry(width, height, 32, 32);

        // Add vertex displacement for grass detail
        if (this.currentTier === 'championship') {
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 2] += Math.random() * 0.5; // Add height variation
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals();
        }

        const material = this.createOptimizedMaterial({
            type: 'stadiumSurface',
            uniforms: {
                grassTexture: { type: 't', value: this.createGrassTexture() },
                lightPosition: { type: 'v3', value: new THREE.Vector3(100, 100, 50) },
                cameraPosition: { type: 'v3', value: new THREE.Vector3() },
                time: { type: 'f', value: 0 }
            }
        });

        const surface = new THREE.Mesh(geometry, material);
        surface.rotation.x = -Math.PI / 2;
        surface.receiveShadow = true;
        surface.userData.isStadiumSurface = true;

        return surface;
    }

    createGrassTexture() {
        // Create procedural grass texture for better performance
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base grass color
        ctx.fillStyle = '#2D5016';
        ctx.fillRect(0, 0, 256, 256);

        // Add grass detail based on tier
        if (this.currentTier !== 'optimized') {
            const detailCount = this.currentTier === 'championship' ? 1000 : 500;

            for (let i = 0; i < detailCount; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const shade = Math.random() * 0.3 + 0.7;

                ctx.fillStyle = `rgba(45, 80, 22, ${shade})`;
                ctx.fillRect(x, y, 2, 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        texture.generateMipmaps = this.currentTier !== 'optimized';

        return texture;
    }

    updateShaderUniforms(object, camera, time) {
        if (!object.material || !object.material.uniforms) return;

        const uniforms = object.material.uniforms;

        // Update common uniforms
        if (uniforms.time) uniforms.time.value = time;
        if (uniforms.cameraPosition) uniforms.cameraPosition.value.copy(camera.position);

        // Update object-specific uniforms
        if (object.userData.isChampionshipTower && uniforms.performance) {
            // Animate performance value
            const basePerformance = object.userData.teamData.performance;
            const animatedPerformance = basePerformance + Math.sin(time * 0.001) * 10;
            uniforms.performance.value = animatedPerformance;
        }
    }

    optimizeRenderState(renderer, scene, camera) {
        // Batch shader uniform updates for better performance
        const objects = [];
        scene.traverse(child => {
            if (child.material && child.material.uniforms) {
                objects.push(child);
            }
        });

        // Group objects by shader type for batch updates
        const shaderGroups = new Map();
        objects.forEach(obj => {
            const shaderKey = obj.material.uuid;
            if (!shaderGroups.has(shaderKey)) {
                shaderGroups.set(shaderKey, []);
            }
            shaderGroups.get(shaderKey).push(obj);
        });

        // Update uniforms per shader group
        const time = Date.now();
        shaderGroups.forEach((objects, shaderKey) => {
            objects.forEach(obj => {
                this.updateShaderUniforms(obj, camera, time);
            });
        });

        // Optimize WebGL state changes
        renderer.state.reset();
    }

    setupUniformOptimization() {
        // Create reusable uniform objects to reduce garbage collection
        this.reusableUniforms = {
            time: { type: 'f', value: 0 },
            cameraPosition: { type: 'v3', value: new THREE.Vector3() },
            lightPosition: { type: 'v3', value: new THREE.Vector3(100, 100, 50) },
            teamColors: {
                cardinals: { type: 'v3', value: new THREE.Color('#C41E3A') },
                titans: { type: 'v3', value: new THREE.Color('#4B92DB') },
                longhorns: { type: 'v3', value: new THREE.Color('#BF5700') },
                grizzlies: { type: 'v3', value: new THREE.Color('#00B2A9') }
            }
        };
    }

    createMaterialPool() {
        // Pre-create common materials to avoid runtime compilation
        this.materialPool = {
            particle: this.createOptimizedMaterial({
                type: 'particle',
                transparent: true,
                uniforms: {
                    time: this.reusableUniforms.time,
                    cameraPosition: this.reusableUniforms.cameraPosition
                }
            }),
            stadiumSurface: this.createOptimizedMaterial({
                type: 'stadiumSurface',
                uniforms: {
                    grassTexture: { type: 't', value: this.createGrassTexture() },
                    lightPosition: this.reusableUniforms.lightPosition,
                    cameraPosition: this.reusableUniforms.cameraPosition,
                    time: this.reusableUniforms.time
                }
            })
        };

        // Create team-specific tower materials
        Object.entries(this.reusableUniforms.teamColors).forEach(([team, colorUniform]) => {
            this.materialPool[`${team}Tower`] = this.createOptimizedMaterial({
                type: 'championshipTower',
                uniforms: {
                    time: this.reusableUniforms.time,
                    teamColor: colorUniform,
                    performance: { type: 'f', value: 50 },
                    cameraPosition: this.reusableUniforms.cameraPosition
                },
                transparent: true
            });
        });
    }

    getMaterialFromPool(materialType, teamName = null) {
        const key = teamName ? `${teamName}${materialType}` : materialType;
        return this.materialPool[key] || this.materialPool.particle;
    }

    getFallbackShader() {
        return `
            attribute vec3 position;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    // Performance monitoring and adjustment
    monitorShaderPerformance(renderer) {
        const info = renderer.info;

        this.shaderPerformanceMetrics = {
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            shaderCompilations: this.compiledShaders.size,
            cachedMaterials: this.optimizedMaterials.size
        };

        // Adjust quality if performance is poor
        if (info.render.calls > 100 && this.currentTier !== 'optimized') {
            this.downgradeShaderTier();
        }
    }

    downgradeShaderTier() {
        const tiers = ['championship', 'professional', 'competitive', 'optimized'];
        const currentIndex = tiers.indexOf(this.currentTier);

        if (currentIndex < tiers.length - 1) {
            this.currentTier = tiers[currentIndex + 1];
            console.log(`🔧 Shader quality downgraded to ${this.currentTier} for better performance`);

            // Clear cache to force recompilation with new tier
            this.shaderCache.clear();
            this.optimizedMaterials.clear();
            this.precompileEssentialShaders();
            this.createMaterialPool();
        }
    }

    getPerformanceReport() {
        return {
            currentTier: this.currentTier,
            webGLCapabilities: this.capabilities,
            shaderPerformance: this.shaderPerformanceMetrics,
            cacheStats: {
                shadersCached: this.shaderCache.size,
                materialsCached: this.optimizedMaterials.size,
                uniformsCached: this.uniformCache.size
            }
        };
    }

    // Cleanup and disposal
    dispose() {
        // Dispose all cached materials
        this.optimizedMaterials.forEach(material => {
            if (material.dispose) material.dispose();
        });

        // Clear caches
        this.shaderCache.clear();
        this.optimizedMaterials.clear();
        this.uniformCache.clear();

        console.log('🧹 WebGL Shader Optimizer disposed');
    }
}

// Global API
window.ChampionshipShaders = {
    optimizer: null,

    initialize() {
        if (!this.optimizer) {
            this.optimizer = new ChampionshipWebGLShaderOptimizer();
        }
        return this.optimizer;
    },

    createParticleSystem(config) {
        return this.optimizer ? this.optimizer.createParticleSystem(config) : null;
    },

    createChampionshipTower(teamData, height) {
        return this.optimizer ? this.optimizer.createChampionshipTower(teamData, height) : null;
    },

    createStadiumSurface(width, height) {
        return this.optimizer ? this.optimizer.createStadiumSurface(width, height) : null;
    },

    optimizeRenderState(renderer, scene, camera) {
        if (this.optimizer) {
            this.optimizer.optimizeRenderState(renderer, scene, camera);
        }
    },

    getPerformanceReport() {
        return this.optimizer ? this.optimizer.getPerformanceReport() : null;
    },

    dispose() {
        if (this.optimizer) {
            this.optimizer.dispose();
            this.optimizer = null;
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChampionshipShaders.initialize();
    });
} else {
    window.ChampionshipShaders.initialize();
}

console.log('⚡ CHAMPIONSHIP WEBGL SHADER OPTIMIZER LOADED - Ultra-High Performance Shaders Ready');