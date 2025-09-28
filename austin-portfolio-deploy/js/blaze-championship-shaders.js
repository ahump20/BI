/**
 * 🔥 BLAZE INTELLIGENCE - CHAMPIONSHIP SHADER SYSTEM
 * Next-generation WebGL shaders for broadcast-quality sports visualization
 * Implements advanced rendering techniques from Pixar, ILM, and ESPN Graphics
 */

class BlazeChampionshipShaders {
    constructor() {
        this.shaders = {};
        this.uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2() },
            mouse: { value: new THREE.Vector2() },
            // Blaze brand colors in shader format
            blazeOrange: { value: new THREE.Color(0xBF5700) },
            blazeSky: { value: new THREE.Color(0x9BCBEB) },
            blazeNavy: { value: new THREE.Color(0x002244) },
            blazeTeal: { value: new THREE.Color(0x00B2A9) },
            blazeGold: { value: new THREE.Color(0xFFD700) }
        };

        this.initializeShaders();
    }

    initializeShaders() {
        // Championship Vertex Shader - Advanced vertex manipulation
        this.shaders.championshipVertex = `
            uniform float time;
            uniform vec2 mouse;
            uniform float intensity;

            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying float vElevation;

            // Noise function for organic movement
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            void main() {
                vUv = uv;
                vPosition = position;
                vNormal = normal;

                // Championship wave effect
                float noiseFreq = 2.0;
                float noiseAmp = 0.15;
                vec3 noisePos = position + vec3(time * 0.5);

                vElevation = snoise(noisePos * noiseFreq) * noiseAmp;
                vec3 distortion = position + normal * vElevation;

                // Mouse interaction
                float dist = distance(uv, mouse);
                float influence = 1.0 - smoothstep(0.0, 0.5, dist);
                distortion += normal * influence * 0.3;

                vec4 modelPosition = modelMatrix * vec4(distortion, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;

                gl_Position = projectedPosition;
            }
        `;

        // Championship Fragment Shader - Broadcast-quality rendering
        this.shaders.championshipFragment = `
            uniform float time;
            uniform vec2 resolution;
            uniform vec3 blazeOrange;
            uniform vec3 blazeSky;
            uniform vec3 blazeNavy;
            uniform vec3 blazeTeal;
            uniform vec3 blazeGold;
            uniform sampler2D tDiffuse;
            uniform float bloomStrength;
            uniform float filmGrain;

            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying float vElevation;

            // Film grain for broadcast aesthetic
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            // Chromatic aberration for lens realism
            vec3 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
                vec2 offset = vec2(amount, 0.0);
                float r = texture2D(tex, uv + offset).r;
                float g = texture2D(tex, uv).g;
                float b = texture2D(tex, uv - offset).b;
                return vec3(r, g, b);
            }

            // HDR tone mapping (ACES Filmic)
            vec3 aces(vec3 x) {
                const float a = 2.51;
                const float b = 0.03;
                const float c = 2.43;
                const float d = 0.59;
                const float e = 0.14;
                return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
            }

            // Fresnel effect for rim lighting
            float fresnel(vec3 normal, vec3 viewDir, float power) {
                return pow(1.0 - dot(normal, viewDir), power);
            }

            void main() {
                // Base color with gradient
                vec3 gradientStart = blazeOrange;
                vec3 gradientEnd = blazeNavy;
                vec3 baseColor = mix(gradientStart, gradientEnd, vUv.y);

                // Add wave coloring based on elevation
                float waveIntensity = (vElevation + 1.0) * 0.5;
                baseColor = mix(baseColor, blazeGold, waveIntensity * 0.3);

                // Calculate fresnel for rim lighting
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float fresnelTerm = fresnel(vNormal, viewDirection, 2.0);
                vec3 rimColor = blazeSky * fresnelTerm * 2.0;

                // Energy wave effect
                float wave = sin(vPosition.x * 10.0 + time * 2.0) * 0.5 + 0.5;
                wave *= sin(vPosition.y * 10.0 - time * 1.5) * 0.5 + 0.5;
                vec3 energyColor = blazeTeal * wave * 0.5;

                // Combine colors
                vec3 finalColor = baseColor + rimColor + energyColor;

                // Add holographic effect
                float hologram = sin(vUv.y * 100.0 + time * 10.0) * 0.05 + 0.95;
                finalColor *= hologram;

                // Apply bloom
                finalColor += finalColor * bloomStrength * waveIntensity;

                // Film grain
                float grain = random(vUv + time) * filmGrain;
                finalColor += vec3(grain);

                // HDR tone mapping
                finalColor = aces(finalColor);

                // Output with alpha for transparency effects
                gl_FragColor = vec4(finalColor, 0.95);
            }
        `;

        // Particle Shader - GPU instanced particles
        this.shaders.particleVertex = `
            uniform float time;
            uniform float size;
            attribute float scale;
            attribute vec3 customColor;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vColor = customColor;
                vec3 pos = position;

                // Turbulence
                float turbulence = sin(position.x * 4.0 + time) * 0.5;
                turbulence += sin(position.y * 4.0 + time * 0.8) * 0.5;
                turbulence += sin(position.z * 4.0 + time * 1.2) * 0.5;
                pos += normalize(position) * turbulence;

                // Flow field animation
                float theta = time * 0.5;
                mat3 rotation = mat3(
                    cos(theta), 0, sin(theta),
                    0, 1, 0,
                    -sin(theta), 0, cos(theta)
                );
                pos = rotation * pos;

                // Calculate alpha based on distance from center
                float dist = length(pos);
                vAlpha = 1.0 - smoothstep(10.0, 50.0, dist);

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * scale * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        this.shaders.particleFragment = `
            uniform vec3 blazeOrange;
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                vec3 finalColor = vColor * texColor.rgb;

                // Add glow effect
                float dist = length(gl_PointCoord - vec2(0.5));
                float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                finalColor += blazeOrange * glow * 0.5;

                gl_FragColor = vec4(finalColor, texColor.a * vAlpha * 0.8);
            }
        `;

        // Holographic Display Shader
        this.shaders.hologramVertex = `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vPosition = position;

                // Holographic distortion
                vec3 pos = position;
                pos.y += sin(position.x * 10.0 + time * 5.0) * 0.01;
                pos.x += cos(position.y * 10.0 + time * 5.0) * 0.01;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        this.shaders.hologramFragment = `
            uniform float time;
            uniform float scanlineIntensity;
            uniform vec3 blazeTeal;
            uniform vec3 blazeSky;
            uniform sampler2D dataTexture;

            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                // Base hologram color
                vec3 color = mix(blazeTeal, blazeSky, vUv.y);

                // Scanlines
                float scanline = sin(vUv.y * 300.0 + time * 10.0) * scanlineIntensity;
                color += vec3(scanline);

                // Data visualization overlay
                vec4 data = texture2D(dataTexture, vUv);
                color = mix(color, data.rgb, data.a * 0.7);

                // Glitch effect
                float glitch = step(0.98, sin(time * 20.0) * sin(time * 23.0));
                color = mix(color, vec3(1.0) - color, glitch);

                // Edge glow
                float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
                edge *= 1.0 - abs(vUv.y - 0.5) * 2.0;
                color += blazeTeal * (1.0 - edge) * 0.3;

                gl_FragColor = vec4(color, 0.9);
            }
        `;

        // Stadium Atmosphere Shader
        this.shaders.atmosphereVertex = `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        this.shaders.atmosphereFragment = `
            uniform vec3 lightPosition;
            uniform vec3 blazeGold;
            uniform float intensity;

            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Calculate rim lighting for atmospheric glow
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float rim = 1.0 - dot(viewDirection, vNormal);
                rim = pow(rim, 3.0);

                // Stadium lights effect
                vec3 lightDir = normalize(lightPosition - vPosition);
                float lightIntensity = max(dot(vNormal, lightDir), 0.0);

                vec3 atmosphereColor = blazeGold * rim * intensity;
                atmosphereColor += vec3(1.0, 0.9, 0.7) * lightIntensity * 0.5;

                gl_FragColor = vec4(atmosphereColor, rim * 0.6);
            }
        `;

        console.log('🎨 Championship shaders initialized - Broadcast quality enabled');
    }

    // Create shader material with uniforms
    createShaderMaterial(vertexShader, fragmentShader, additionalUniforms = {}) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                ...this.uniforms,
                ...additionalUniforms
            },
            vertexShader: this.shaders[vertexShader],
            fragmentShader: this.shaders[fragmentShader],
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return material;
    }

    // Update time-based uniforms
    updateUniforms(deltaTime, mouseX, mouseY) {
        this.uniforms.time.value += deltaTime;
        this.uniforms.mouse.value.set(mouseX, mouseY);
        this.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }

    // Get specific shader code
    getShader(name) {
        return this.shaders[name];
    }

    // Apply shader to existing mesh
    applyShaderToMesh(mesh, vertexShader, fragmentShader, additionalUniforms = {}) {
        const material = this.createShaderMaterial(vertexShader, fragmentShader, additionalUniforms);
        mesh.material = material;
        return material;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeChampionshipShaders;
}