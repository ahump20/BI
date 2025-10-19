/**
 * 🔥 BLAZE INTELLIGENCE - RAY TRACING EFFECTS SYSTEM
 * Advanced ray tracing for realistic reflections, shadows, and global illumination
 * GPU-accelerated screen-space techniques optimized for real-time sports visualization
 */

class BlazeRayTracingEffects {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Ray tracing parameters
        this.params = {
            ssrIntensity: 0.8,
            ssrMaxDistance: 500,
            ssrThickness: 0.1,
            ssrSteps: 32,
            ssrBinarySteps: 8,
            ssaoRadius: 2.0,
            ssaoIntensity: 0.6,
            ssaoSamples: 16,
            giIntensity: 0.4,
            giSamples: 8,
            reflectionQuality: 'high',
            enableDenoise: true
        };

        this.rtRenderTargets = new Map();
        this.rtMaterials = new Map();
        this.rtPasses = [];

        this.initializeRayTracingSystem();
    }

    initializeRayTracingSystem() {
        this.setupRenderTargets();
        this.createSSRShaders();
        this.createSSAOShaders();
        this.createGlobalIlluminationShaders();
        this.setupRayTracingPipeline();

        console.log('🌟 Ray tracing effects initialized - Photorealistic rendering enabled');
    }

    setupRenderTargets() {
        const size = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // G-Buffer for deferred rendering
        this.rtRenderTargets.set('gBuffer', new THREE.WebGLRenderTarget(size.width, size.height, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        }));

        // Depth buffer
        this.rtRenderTargets.set('depth', new THREE.WebGLRenderTarget(size.width, size.height, {
            format: THREE.DepthFormat,
            type: THREE.UnsignedShortType
        }));

        // Normal buffer
        this.rtRenderTargets.set('normal', new THREE.WebGLRenderTarget(size.width, size.height, {
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType
        }));

        // Motion vectors
        this.rtRenderTargets.set('motion', new THREE.WebGLRenderTarget(size.width, size.height, {
            format: THREE.RGFormat,
            type: THREE.HalfFloatType
        }));

        // Screen-space reflections
        this.rtRenderTargets.set('ssr', new THREE.WebGLRenderTarget(size.width, size.height, {
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType
        }));

        // SSAO buffer
        this.rtRenderTargets.set('ssao', new THREE.WebGLRenderTarget(size.width, size.height, {
            format: THREE.RedFormat,
            type: THREE.HalfFloatType
        }));

        // Global illumination
        this.rtRenderTargets.set('gi', new THREE.WebGLRenderTarget(size.width / 2, size.height / 2, {
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType
        }));
    }

    createSSRShaders() {
        // Screen-Space Reflections Vertex Shader
        this.ssrVertexShader = `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        // Screen-Space Reflections Fragment Shader
        this.ssrFragmentShader = `
            uniform sampler2D tColor;
            uniform sampler2D tDepth;
            uniform sampler2D tNormal;
            uniform mat4 cameraProjectionMatrix;
            uniform mat4 cameraInverseProjectionMatrix;
            uniform mat4 viewMatrix;
            uniform float ssrIntensity;
            uniform float ssrMaxDistance;
            uniform float ssrThickness;
            uniform int ssrSteps;
            uniform int ssrBinarySteps;
            uniform vec2 resolution;
            uniform float time;

            varying vec2 vUv;

            vec3 getWorldPosition(vec2 uv, float depth) {
                vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
                vec4 worldPos = cameraInverseProjectionMatrix * ndc;
                return worldPos.xyz / worldPos.w;
            }

            vec2 getScreenPosition(vec3 worldPos) {
                vec4 screenPos = cameraProjectionMatrix * vec4(worldPos, 1.0);
                screenPos.xyz /= screenPos.w;
                return screenPos.xy * 0.5 + 0.5;
            }

            bool rayMarch(vec3 origin, vec3 direction, out vec2 hitUV, out float confidence) {
                float stepSize = ssrMaxDistance / float(ssrSteps);
                vec3 rayPos = origin;
                vec2 screenPos;

                for (int i = 0; i < ssrSteps; i++) {
                    rayPos += direction * stepSize;
                    screenPos = getScreenPosition(rayPos);

                    // Check if ray is outside screen bounds
                    if (screenPos.x < 0.0 || screenPos.x > 1.0 ||
                        screenPos.y < 0.0 || screenPos.y > 1.0) {
                        return false;
                    }

                    float sceneDepth = texture2D(tDepth, screenPos).x;
                    vec3 sceneWorldPos = getWorldPosition(screenPos, sceneDepth);
                    float rayDepth = length(rayPos - origin);
                    float sceneDistance = length(sceneWorldPos - origin);

                    // Check for intersection
                    if (rayDepth > sceneDistance - ssrThickness &&
                        rayDepth < sceneDistance + ssrThickness) {

                        // Binary refinement
                        vec3 binaryStart = rayPos - direction * stepSize;
                        vec3 binaryEnd = rayPos;

                        for (int j = 0; j < ssrBinarySteps; j++) {
                            vec3 binaryMid = (binaryStart + binaryEnd) * 0.5;
                            vec2 binaryScreenPos = getScreenPosition(binaryMid);
                            float binarySceneDepth = texture2D(tDepth, binaryScreenPos).x;
                            vec3 binarySceneWorldPos = getWorldPosition(binaryScreenPos, binarySceneDepth);

                            float binaryRayDepth = length(binaryMid - origin);
                            float binarySceneDistance = length(binarySceneWorldPos - origin);

                            if (binaryRayDepth > binarySceneDistance) {
                                binaryEnd = binaryMid;
                            } else {
                                binaryStart = binaryMid;
                            }
                        }

                        hitUV = getScreenPosition((binaryStart + binaryEnd) * 0.5);

                        // Calculate confidence based on angle and distance
                        float distance = length(rayPos - origin);
                        float angle = dot(direction, vec3(0, 0, -1));
                        confidence = (1.0 - distance / ssrMaxDistance) * max(0.0, angle) * ssrIntensity;

                        return true;
                    }
                }

                return false;
            }

            void main() {
                float depth = texture2D(tDepth, vUv).x;
                if (depth >= 1.0) {
                    gl_FragColor = vec4(0.0);
                    return;
                }

                vec3 worldPos = getWorldPosition(vUv, depth);
                vec3 normal = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);

                // Calculate reflection direction
                vec3 viewDir = normalize(worldPos);
                vec3 reflectionDir = normalize(reflect(viewDir, normal));

                vec2 hitUV;
                float confidence;

                if (rayMarch(worldPos, reflectionDir, hitUV, confidence)) {
                    vec4 reflectionColor = texture2D(tColor, hitUV);

                    // Apply Fresnel effect
                    float fresnel = pow(1.0 - max(0.0, dot(-viewDir, normal)), 5.0);
                    confidence *= fresnel;

                    // Edge fade
                    vec2 edgeDistance = abs(hitUV - vec2(0.5));
                    float edgeFade = smoothstep(0.4, 0.3, max(edgeDistance.x, edgeDistance.y));
                    confidence *= edgeFade;

                    gl_FragColor = vec4(reflectionColor.rgb, confidence);
                } else {
                    gl_FragColor = vec4(0.0);
                }
            }
        `;

        // Create SSR material
        const ssrMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tColor: { value: null },
                tDepth: { value: null },
                tNormal: { value: null },
                cameraProjectionMatrix: { value: this.camera.projectionMatrix },
                cameraInverseProjectionMatrix: { value: this.camera.projectionMatrixInverse },
                viewMatrix: { value: this.camera.matrixWorldInverse },
                ssrIntensity: { value: this.params.ssrIntensity },
                ssrMaxDistance: { value: this.params.ssrMaxDistance },
                ssrThickness: { value: this.params.ssrThickness },
                ssrSteps: { value: this.params.ssrSteps },
                ssrBinarySteps: { value: this.params.ssrBinarySteps },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                time: { value: 0 }
            },
            vertexShader: this.ssrVertexShader,
            fragmentShader: this.ssrFragmentShader
        });

        this.rtMaterials.set('ssr', ssrMaterial);
    }

    createSSAOShaders() {
        // Screen-Space Ambient Occlusion Fragment Shader
        this.ssaoFragmentShader = `
            uniform sampler2D tDepth;
            uniform sampler2D tNormal;
            uniform sampler2D tNoise;
            uniform mat4 cameraProjectionMatrix;
            uniform mat4 cameraInverseProjectionMatrix;
            uniform float ssaoRadius;
            uniform float ssaoIntensity;
            uniform int ssaoSamples;
            uniform vec2 resolution;
            uniform vec2 noiseScale;
            uniform vec3 samples[16];

            varying vec2 vUv;

            vec3 getWorldPosition(vec2 uv, float depth) {
                vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
                vec4 worldPos = cameraInverseProjectionMatrix * ndc;
                return worldPos.xyz / worldPos.w;
            }

            void main() {
                float depth = texture2D(tDepth, vUv).x;
                if (depth >= 1.0) {
                    gl_FragColor = vec4(1.0);
                    return;
                }

                vec3 fragPos = getWorldPosition(vUv, depth);
                vec3 normal = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);
                vec3 randomVec = normalize(texture2D(tNoise, vUv * noiseScale).xyz);

                // Create TBN transformation matrix
                vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
                vec3 bitangent = cross(normal, tangent);
                mat3 TBN = mat3(tangent, bitangent, normal);

                float occlusion = 0.0;
                for (int i = 0; i < ssaoSamples; ++i) {
                    // Get sample position in world space
                    vec3 samplePos = TBN * samples[i];
                    samplePos = fragPos + samplePos * ssaoRadius;

                    // Project sample to screen space
                    vec4 offset = vec4(samplePos, 1.0);
                    offset = cameraProjectionMatrix * offset;
                    offset.xyz /= offset.w;
                    offset.xyz = offset.xyz * 0.5 + 0.5;

                    // Get sample depth
                    float sampleDepth = texture2D(tDepth, offset.xy).x;
                    vec3 sampleWorldPos = getWorldPosition(offset.xy, sampleDepth);

                    // Range check & accumulate
                    float rangeCheck = smoothstep(0.0, 1.0, ssaoRadius / abs(fragPos.z - sampleWorldPos.z));
                    occlusion += (length(sampleWorldPos) >= length(samplePos) ? 1.0 : 0.0) * rangeCheck;
                }

                occlusion = 1.0 - (occlusion / float(ssaoSamples));
                occlusion = pow(occlusion, ssaoIntensity);

                gl_FragColor = vec4(vec3(occlusion), 1.0);
            }
        `;

        // Generate sample kernel
        const samples = [];
        for (let i = 0; i < 16; i++) {
            const sample = new THREE.Vector3(
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random()
            ).normalize();

            // Scale samples to be more aligned to hemisphere
            let scale = i / 16.0;
            scale = 0.1 + scale * scale * 0.9; // More samples closer to origin
            sample.multiplyScalar(scale);
            samples.push(sample);
        }

        // Generate noise texture
        const noiseTexture = this.generateSSAONoiseTexture();

        const ssaoMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDepth: { value: null },
                tNormal: { value: null },
                tNoise: { value: noiseTexture },
                cameraProjectionMatrix: { value: this.camera.projectionMatrix },
                cameraInverseProjectionMatrix: { value: this.camera.projectionMatrixInverse },
                ssaoRadius: { value: this.params.ssaoRadius },
                ssaoIntensity: { value: this.params.ssaoIntensity },
                ssaoSamples: { value: this.params.ssaoSamples },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                noiseScale: { value: new THREE.Vector2(window.innerWidth / 4.0, window.innerHeight / 4.0) },
                samples: { value: samples }
            },
            vertexShader: this.ssrVertexShader, // Reuse simple vertex shader
            fragmentShader: this.ssaoFragmentShader
        });

        this.rtMaterials.set('ssao', ssaoMaterial);
    }

    createGlobalIlluminationShaders() {
        // Global Illumination Fragment Shader
        this.giFragmentShader = `
            uniform sampler2D tColor;
            uniform sampler2D tDepth;
            uniform sampler2D tNormal;
            uniform sampler2D tSSAO;
            uniform mat4 cameraProjectionMatrix;
            uniform mat4 cameraInverseProjectionMatrix;
            uniform float giIntensity;
            uniform int giSamples;
            uniform vec2 resolution;
            uniform float time;

            varying vec2 vUv;

            vec3 getWorldPosition(vec2 uv, float depth) {
                vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
                vec4 worldPos = cameraInverseProjectionMatrix * ndc;
                return worldPos.xyz / worldPos.w;
            }

            // Simple random function for sampling
            float random(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            vec3 hemispherePoint(float u, float v) {
                float phi = v * 2.0 * 3.14159265;
                float cosTheta = 1.0 - u;
                float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
                return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
            }

            void main() {
                float depth = texture2D(tDepth, vUv).x;
                if (depth >= 1.0) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    return;
                }

                vec3 fragPos = getWorldPosition(vUv, depth);
                vec3 normal = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);
                vec3 albedo = texture2D(tColor, vUv).rgb;
                float ssao = texture2D(tSSAO, vUv).r;

                vec3 indirectLighting = vec3(0.0);

                for (int i = 0; i < giSamples; ++i) {
                    float u = random(vUv + float(i) * 0.1 + time * 0.001);
                    float v = random(vUv + float(i) * 0.2 + time * 0.002);

                    vec3 hemisphereVec = hemispherePoint(u, v);

                    // Orient hemisphere along normal
                    vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
                    if (length(tangent) < 0.1) {
                        tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
                    }
                    vec3 bitangent = cross(normal, tangent);
                    mat3 TBN = mat3(tangent, bitangent, normal);

                    vec3 sampleDir = TBN * hemisphereVec;
                    vec3 samplePos = fragPos + sampleDir * 5.0; // Sample distance

                    // Project to screen space
                    vec4 screenPos = cameraProjectionMatrix * vec4(samplePos, 1.0);
                    screenPos.xyz /= screenPos.w;
                    screenPos.xy = screenPos.xy * 0.5 + 0.5;

                    if (screenPos.x >= 0.0 && screenPos.x <= 1.0 &&
                        screenPos.y >= 0.0 && screenPos.y <= 1.0) {
                        vec3 sampleColor = texture2D(tColor, screenPos.xy).rgb;
                        float weight = max(0.0, dot(normal, sampleDir));
                        indirectLighting += sampleColor * weight;
                    }
                }

                indirectLighting /= float(giSamples);
                indirectLighting *= giIntensity * ssao;

                gl_FragColor = vec4(indirectLighting, 1.0);
            }
        `;

        const giMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tColor: { value: null },
                tDepth: { value: null },
                tNormal: { value: null },
                tSSAO: { value: null },
                cameraProjectionMatrix: { value: this.camera.projectionMatrix },
                cameraInverseProjectionMatrix: { value: this.camera.projectionMatrixInverse },
                giIntensity: { value: this.params.giIntensity },
                giSamples: { value: this.params.giSamples },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                time: { value: 0 }
            },
            vertexShader: this.ssrVertexShader, // Reuse simple vertex shader
            fragmentShader: this.giFragmentShader
        });

        this.rtMaterials.set('gi', giMaterial);
    }

    setupRayTracingPipeline() {
        // Create quad for full-screen passes
        this.screenQuad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshBasicMaterial()
        );
        this.screenQuad.frustumCulled = false;

        // Create scene for screen-space passes
        this.rtScene = new THREE.Scene();
        this.rtScene.add(this.screenQuad);

        // Create orthographic camera for screen-space rendering
        this.rtCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    generateSSAONoiseTexture() {
        const size = 4;
        const data = new Float32Array(size * size * 4);

        for (let i = 0; i < size * size; i++) {
            const stride = i * 4;
            data[stride] = Math.random() * 2.0 - 1.0;     // x
            data[stride + 1] = Math.random() * 2.0 - 1.0; // y
            data[stride + 2] = 0.0;                       // z
            data[stride + 3] = 1.0;                       // w
        }

        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;

        return texture;
    }

    // Rendering methods
    renderSSR(colorTexture, depthTexture, normalTexture) {
        const ssrMaterial = this.rtMaterials.get('ssr');
        ssrMaterial.uniforms.tColor.value = colorTexture;
        ssrMaterial.uniforms.tDepth.value = depthTexture;
        ssrMaterial.uniforms.tNormal.value = normalTexture;

        this.screenQuad.material = ssrMaterial;

        const ssrTarget = this.rtRenderTargets.get('ssr');
        this.renderer.setRenderTarget(ssrTarget);
        this.renderer.render(this.rtScene, this.rtCamera);
    }

    renderSSAO(depthTexture, normalTexture) {
        const ssaoMaterial = this.rtMaterials.get('ssao');
        ssaoMaterial.uniforms.tDepth.value = depthTexture;
        ssaoMaterial.uniforms.tNormal.value = normalTexture;

        this.screenQuad.material = ssaoMaterial;

        const ssaoTarget = this.rtRenderTargets.get('ssao');
        this.renderer.setRenderTarget(ssaoTarget);
        this.renderer.render(this.rtScene, this.rtCamera);
    }

    renderGlobalIllumination(colorTexture, depthTexture, normalTexture, ssaoTexture) {
        const giMaterial = this.rtMaterials.get('gi');
        giMaterial.uniforms.tColor.value = colorTexture;
        giMaterial.uniforms.tDepth.value = depthTexture;
        giMaterial.uniforms.tNormal.value = normalTexture;
        giMaterial.uniforms.tSSAO.value = ssaoTexture;

        this.screenQuad.material = giMaterial;

        const giTarget = this.rtRenderTargets.get('gi');
        this.renderer.setRenderTarget(giTarget);
        this.renderer.render(this.rtScene, this.rtCamera);
    }

    // Main render method
    render(colorTexture, depthTexture, normalTexture) {
        const time = performance.now() * 0.001;

        // Update time uniforms
        this.rtMaterials.forEach(material => {
            if (material.uniforms.time) {
                material.uniforms.time.value = time;
            }
        });

        // Render SSAO first (required for GI)
        this.renderSSAO(depthTexture, normalTexture);
        const ssaoTexture = this.rtRenderTargets.get('ssao').texture;

        // Render SSR
        this.renderSSR(colorTexture, depthTexture, normalTexture);
        const ssrTexture = this.rtRenderTargets.get('ssr').texture;

        // Render Global Illumination
        this.renderGlobalIllumination(colorTexture, depthTexture, normalTexture, ssaoTexture);
        const giTexture = this.rtRenderTargets.get('gi').texture;

        return {
            ssr: ssrTexture,
            ssao: ssaoTexture,
            gi: giTexture
        };
    }

    // Parameter controls
    setSSRIntensity(intensity) {
        this.params.ssrIntensity = intensity;
        const ssrMaterial = this.rtMaterials.get('ssr');
        if (ssrMaterial) {
            ssrMaterial.uniforms.ssrIntensity.value = intensity;
        }
    }

    setSSAOIntensity(intensity) {
        this.params.ssaoIntensity = intensity;
        const ssaoMaterial = this.rtMaterials.get('ssao');
        if (ssaoMaterial) {
            ssaoMaterial.uniforms.ssaoIntensity.value = intensity;
        }
    }

    setGIIntensity(intensity) {
        this.params.giIntensity = intensity;
        const giMaterial = this.rtMaterials.get('gi');
        if (giMaterial) {
            giMaterial.uniforms.giIntensity.value = intensity;
        }
    }

    setQualityLevel(quality) {
        switch (quality) {
            case 'low':
                this.params.ssrSteps = 16;
                this.params.ssrBinarySteps = 4;
                this.params.ssaoSamples = 8;
                this.params.giSamples = 4;
                break;
            case 'medium':
                this.params.ssrSteps = 32;
                this.params.ssrBinarySteps = 8;
                this.params.ssaoSamples = 16;
                this.params.giSamples = 8;
                break;
            case 'high':
                this.params.ssrSteps = 64;
                this.params.ssrBinarySteps = 16;
                this.params.ssaoSamples = 32;
                this.params.giSamples = 16;
                break;
            case 'ultra':
                this.params.ssrSteps = 128;
                this.params.ssrBinarySteps = 32;
                this.params.ssaoSamples = 64;
                this.params.giSamples = 32;
                break;
        }

        this.updateQualityUniforms();
    }

    updateQualityUniforms() {
        const ssrMaterial = this.rtMaterials.get('ssr');
        if (ssrMaterial) {
            ssrMaterial.uniforms.ssrSteps.value = this.params.ssrSteps;
            ssrMaterial.uniforms.ssrBinarySteps.value = this.params.ssrBinarySteps;
        }

        const ssaoMaterial = this.rtMaterials.get('ssao');
        if (ssaoMaterial) {
            ssaoMaterial.uniforms.ssaoSamples.value = this.params.ssaoSamples;
        }

        const giMaterial = this.rtMaterials.get('gi');
        if (giMaterial) {
            giMaterial.uniforms.giSamples.value = this.params.giSamples;
        }
    }

    // Stadium-specific presets
    setStadiumPreset(preset) {
        switch (preset) {
            case 'night_game':
                this.setSSRIntensity(1.0);
                this.setSSAOIntensity(0.8);
                this.setGIIntensity(0.6);
                break;
            case 'day_game':
                this.setSSRIntensity(0.6);
                this.setSSAOIntensity(0.4);
                this.setGIIntensity(0.3);
                break;
            case 'dome_stadium':
                this.setSSRIntensity(0.8);
                this.setSSAOIntensity(0.7);
                this.setGIIntensity(0.5);
                break;
            case 'outdoor_stadium':
                this.setSSRIntensity(0.7);
                this.setSSAOIntensity(0.5);
                this.setGIIntensity(0.4);
                break;
        }
    }

    // Cleanup
    dispose() {
        this.rtRenderTargets.forEach(target => {
            target.dispose();
        });

        this.rtMaterials.forEach(material => {
            material.dispose();
        });

        if (this.screenQuad) {
            this.screenQuad.geometry.dispose();
        }
    }

    // Resize handling
    onWindowResize(width, height) {
        this.rtRenderTargets.forEach(target => {
            target.setSize(width, height);
        });

        // Update resolution uniforms
        this.rtMaterials.forEach(material => {
            if (material.uniforms.resolution) {
                material.uniforms.resolution.value.set(width, height);
            }
        });

        // Update noise scale for SSAO
        const ssaoMaterial = this.rtMaterials.get('ssao');
        if (ssaoMaterial) {
            ssaoMaterial.uniforms.noiseScale.value.set(width / 4.0, height / 4.0);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeRayTracingEffects;
}