/**
 * 🔥 BLAZE INTELLIGENCE - CHAMPIONSHIP POST-PROCESSING PIPELINE
 * Broadcast-quality visual effects for sports analytics visualization
 * Implements advanced post-processing with Three.js
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

class BlazeChampionshipPostProcessing {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.passes = {};
        this.params = {
            // Bloom parameters
            bloomStrength: 1.2,
            bloomRadius: 0.8,
            bloomThreshold: 0.6,
            // DOF parameters
            focus: 500.0,
            aperture: 5,
            maxblur: 0.01,
            // Motion blur
            motionBlurAmount: 0.4,
            // Film effects
            filmGrain: 0.03,
            scanlines: 0.1,
            vignette: 0.4,
            // Performance
            enableSSAO: true,
            enableMotionBlur: true,
            enableFilmEffects: true
        };

        this.initializeComposer();
    }

    initializeComposer() {
        // Create composer with WebGL 2.0 support
        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
                samples: 4 // Multisampling for smoother edges
            }
        );

        this.composer = new EffectComposer(this.renderer, renderTarget);

        // Add passes in optimal order
        this.setupRenderPass();
        this.setupSSAOPass();
        this.setupBloomPass();
        this.setupDepthOfField();
        this.setupMotionBlur();
        this.setupFilmEffects();
        this.setupColorCorrection();
        this.setupAntialiasing();
        this.setupOutputPass();

        console.log('🎬 Championship post-processing pipeline initialized');
    }

    setupRenderPass() {
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.passes.render = renderPass;
    }

    setupSSAOPass() {
        if (!this.params.enableSSAO) return;

        // Screen Space Ambient Occlusion for depth
        const ssaoPass = new SSAOPass(
            this.scene,
            this.camera,
            window.innerWidth,
            window.innerHeight
        );
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        ssaoPass.output = SSAOPass.OUTPUT.Default;

        this.composer.addPass(ssaoPass);
        this.passes.ssao = ssaoPass;
    }

    setupBloomPass() {
        // Unreal Engine style bloom
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.params.bloomStrength,
            this.params.bloomRadius,
            this.params.bloomThreshold
        );

        this.composer.addPass(bloomPass);
        this.passes.bloom = bloomPass;
    }

    setupDepthOfField() {
        // Custom depth of field shader
        const dofShader = {
            uniforms: {
                tDiffuse: { value: null },
                tDepth: { value: null },
                focus: { value: this.params.focus },
                aperture: { value: this.params.aperture },
                maxblur: { value: this.params.maxblur },
                nearClip: { value: this.camera.near },
                farClip: { value: this.camera.far }
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
                uniform sampler2D tDepth;
                uniform float focus;
                uniform float aperture;
                uniform float maxblur;
                uniform float nearClip;
                uniform float farClip;

                varying vec2 vUv;

                float getDepth(vec2 coord) {
                    float depth = texture2D(tDepth, coord).r;
                    return -nearClip * farClip / (depth * (farClip - nearClip) - farClip);
                }

                void main() {
                    vec2 aspectCorrect = vec2(1.0, 1.0);
                    float depth = getDepth(vUv);

                    float factor = depth - focus;
                    vec2 dofBlur = vec2(clamp(factor * aperture, -maxblur, maxblur));

                    vec2 dofblur9 = dofBlur * 0.9;
                    vec2 dofblur7 = dofBlur * 0.7;
                    vec2 dofblur4 = dofBlur * 0.4;

                    vec4 col = vec4(0.0);

                    col += texture2D(tDiffuse, vUv);
                    col += texture2D(tDiffuse, vUv + (vec2(0.0, 0.4) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(0.15, 0.37) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(0.29, 0.29) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(-0.37, 0.15) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(0.40, 0.0) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(0.37, -0.15) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(0.29, -0.29) * aspectCorrect) * dofBlur);
                    col += texture2D(tDiffuse, vUv + (vec2(-0.15, -0.37) * aspectCorrect) * dofBlur);

                    gl_FragColor = col / 9.0;
                    gl_FragColor.a = 1.0;
                }
            `
        };

        const dofPass = new ShaderPass(dofShader);
        dofPass.uniforms.tDepth.value = this.createDepthTexture();
        dofPass.enabled = true;

        this.composer.addPass(dofPass);
        this.passes.dof = dofPass;
    }

    setupMotionBlur() {
        if (!this.params.enableMotionBlur) return;

        // Motion blur shader
        const motionBlurShader = {
            uniforms: {
                tDiffuse: { value: null },
                tPrevious: { value: null },
                velocityFactor: { value: this.params.motionBlurAmount },
                delta: { value: new THREE.Vector2(0.016, 0.016) }
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
                uniform sampler2D tPrevious;
                uniform float velocityFactor;
                uniform vec2 delta;
                varying vec2 vUv;

                void main() {
                    vec4 current = texture2D(tDiffuse, vUv);
                    vec4 previous = texture2D(tPrevious, vUv);

                    // Simple frame blending for motion blur
                    vec2 velocity = (current.xy - previous.xy) * velocityFactor;

                    vec4 color = current;
                    for(float i = 1.0; i < 8.0; i++) {
                        vec2 offset = velocity * (i / 8.0);
                        color += texture2D(tDiffuse, vUv + offset * delta);
                    }

                    gl_FragColor = color / 8.0;
                    gl_FragColor.a = 1.0;
                }
            `
        };

        const motionBlurPass = new ShaderPass(motionBlurShader);
        motionBlurPass.uniforms.tPrevious.value = this.createPreviousFrameTexture();

        this.composer.addPass(motionBlurPass);
        this.passes.motionBlur = motionBlurPass;
    }

    setupFilmEffects() {
        if (!this.params.enableFilmEffects) return;

        // Film grain, scanlines, and vignette
        const filmShader = {
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                nIntensity: { value: this.params.filmGrain },
                sIntensity: { value: this.params.scanlines },
                sCount: { value: 800 },
                vignette: { value: this.params.vignette },
                blazeOrange: { value: new THREE.Color(0xBF5700) }
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
                uniform float vignette;
                uniform vec3 blazeOrange;

                varying vec2 vUv;

                float random(vec2 co) {
                    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
                }

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);

                    // Film grain
                    float grain = random(vUv + time) * nIntensity;
                    color.rgb += vec3(grain);

                    // Scanlines
                    float scanline = sin(vUv.y * sCount) * sIntensity;
                    color.rgb -= vec3(scanline);

                    // Vignette with subtle orange tint at edges
                    float dist = distance(vUv, vec2(0.5));
                    float vig = smoothstep(0.8, 0.4, dist) * vignette;
                    color.rgb = mix(color.rgb * (1.0 - vig), blazeOrange * 0.1, vig * 0.3);

                    // Subtle chromatic aberration
                    vec2 caOffset = (vUv - 0.5) * 0.003;
                    color.r = texture2D(tDiffuse, vUv + caOffset).r;
                    color.b = texture2D(tDiffuse, vUv - caOffset).b;

                    gl_FragColor = color;
                    gl_FragColor.a = 1.0;
                }
            `
        };

        const filmPass = new ShaderPass(filmShader);
        this.composer.addPass(filmPass);
        this.passes.film = filmPass;
    }

    setupColorCorrection() {
        // Advanced color grading
        const colorCorrectionShader = {
            uniforms: {
                tDiffuse: { value: null },
                brightness: { value: 1.05 },
                contrast: { value: 1.1 },
                saturation: { value: 1.15 },
                temperature: { value: 0.02 }, // Warm shift
                tint: { value: -0.01 }, // Slight magenta
                exposure: { value: 0.95 }
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
                uniform float brightness;
                uniform float contrast;
                uniform float saturation;
                uniform float temperature;
                uniform float tint;
                uniform float exposure;

                varying vec2 vUv;

                // ACES Filmic Tone Mapping
                vec3 ACESFilm(vec3 x) {
                    float a = 2.51;
                    float b = 0.03;
                    float c = 2.43;
                    float d = 0.59;
                    float e = 0.14;
                    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
                }

                vec3 adjustSaturation(vec3 color, float sat) {
                    float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
                    return mix(vec3(gray), color, sat);
                }

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);

                    // Exposure
                    color.rgb *= exposure;

                    // Temperature and tint
                    color.r *= 1.0 + temperature;
                    color.b *= 1.0 - temperature;
                    color.g *= 1.0 + tint;

                    // Brightness and contrast
                    color.rgb = (color.rgb - 0.5) * contrast + 0.5;
                    color.rgb *= brightness;

                    // Saturation
                    color.rgb = adjustSaturation(color.rgb, saturation);

                    // Tone mapping
                    color.rgb = ACESFilm(color.rgb);

                    gl_FragColor = color;
                    gl_FragColor.a = 1.0;
                }
            `
        };

        const colorPass = new ShaderPass(colorCorrectionShader);
        this.composer.addPass(colorPass);
        this.passes.colorCorrection = colorPass;
    }

    setupAntialiasing() {
        // SMAA for better edge smoothing
        const smaaPass = new SMAAPass(
            window.innerWidth * this.renderer.getPixelRatio(),
            window.innerHeight * this.renderer.getPixelRatio()
        );

        this.composer.addPass(smaaPass);
        this.passes.smaa = smaaPass;
    }

    setupOutputPass() {
        // Final output with proper color space
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
        this.passes.output = outputPass;
    }

    createDepthTexture() {
        const depthTexture = new THREE.DepthTexture();
        depthTexture.type = THREE.UnsignedShortType;
        depthTexture.minFilter = THREE.NearestFilter;
        depthTexture.magFilter = THREE.NearestFilter;
        return depthTexture;
    }

    createPreviousFrameTexture() {
        return new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }
        );
    }

    // Update loop
    update(deltaTime) {
        // Update time-based uniforms
        if (this.passes.film) {
            this.passes.film.uniforms.time.value += deltaTime;
        }

        // Update motion blur previous frame
        if (this.passes.motionBlur && this.passes.motionBlur.uniforms.tPrevious.value) {
            // Store current frame for next motion blur calculation
            this.renderer.setRenderTarget(this.passes.motionBlur.uniforms.tPrevious.value);
            this.renderer.render(this.scene, this.camera);
            this.renderer.setRenderTarget(null);
        }

        // Render with post-processing
        this.composer.render(deltaTime);
    }

    // Resize handler
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.composer.setSize(width, height);

        // Update pass sizes
        if (this.passes.ssao) {
            this.passes.ssao.setSize(width, height);
        }
        if (this.passes.smaa) {
            this.passes.smaa.setSize(
                width * this.renderer.getPixelRatio(),
                height * this.renderer.getPixelRatio()
            );
        }
    }

    // Update parameters at runtime
    updateParams(params) {
        Object.assign(this.params, params);

        // Update bloom
        if (this.passes.bloom) {
            this.passes.bloom.strength = this.params.bloomStrength;
            this.passes.bloom.radius = this.params.bloomRadius;
            this.passes.bloom.threshold = this.params.bloomThreshold;
        }

        // Update DOF
        if (this.passes.dof) {
            this.passes.dof.uniforms.focus.value = this.params.focus;
            this.passes.dof.uniforms.aperture.value = this.params.aperture;
            this.passes.dof.uniforms.maxblur.value = this.params.maxblur;
        }

        // Update film effects
        if (this.passes.film) {
            this.passes.film.uniforms.nIntensity.value = this.params.filmGrain;
            this.passes.film.uniforms.sIntensity.value = this.params.scanlines;
            this.passes.film.uniforms.vignette.value = this.params.vignette;
        }
    }

    // Toggle passes for performance
    toggleSSAO(enabled) {
        if (this.passes.ssao) {
            this.passes.ssao.enabled = enabled;
        }
    }

    toggleMotionBlur(enabled) {
        if (this.passes.motionBlur) {
            this.passes.motionBlur.enabled = enabled;
        }
    }

    toggleFilmEffects(enabled) {
        if (this.passes.film) {
            this.passes.film.enabled = enabled;
        }
    }

    // Quality presets
    setQualityPreset(preset) {
        switch(preset) {
            case 'ultra':
                this.updateParams({
                    bloomStrength: 1.5,
                    bloomRadius: 1.0,
                    filmGrain: 0.02,
                    enableSSAO: true,
                    enableMotionBlur: true,
                    enableFilmEffects: true
                });
                break;
            case 'high':
                this.updateParams({
                    bloomStrength: 1.2,
                    bloomRadius: 0.8,
                    filmGrain: 0.03,
                    enableSSAO: true,
                    enableMotionBlur: true,
                    enableFilmEffects: true
                });
                break;
            case 'medium':
                this.updateParams({
                    bloomStrength: 0.8,
                    bloomRadius: 0.6,
                    filmGrain: 0.04,
                    enableSSAO: false,
                    enableMotionBlur: true,
                    enableFilmEffects: false
                });
                break;
            case 'low':
                this.updateParams({
                    bloomStrength: 0.5,
                    bloomRadius: 0.4,
                    filmGrain: 0,
                    enableSSAO: false,
                    enableMotionBlur: false,
                    enableFilmEffects: false
                });
                break;
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeChampionshipPostProcessing;
}