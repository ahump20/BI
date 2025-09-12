/**
 * Blaze Intelligence - Professional Three.js Background
 * Enhanced, sleek background animation for championship-level presentations
 */

class BlazeProfessionalBackground {
    constructor(options = {}) {
        this.config = {
            containerId: options.containerId || 'three-canvas',
            particleCount: options.particleCount || 2500,
            waveAmplitude: options.waveAmplitude || 0.5,
            animationSpeed: options.animationSpeed || 0.001,
            colors: {
                primary: options.primaryColor || 0x0066CC,      // Professional blue
                secondary: options.secondaryColor || 0x00A8CC,   // Cyan accent
                accent: options.accentColor || 0xFFFFFF,         // Clean white
                background: options.backgroundColor || 0x000814  // Deep navy
            },
            opacity: {
                particles: 0.6,
                waves: 0.3,
                grid: 0.15
            }
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isInitialized = false;

        // Animation objects
        this.particleSystem = null;
        this.waveGeometry = null;
        this.gridLines = null;
        this.floatingElements = [];
        
        this.init();
    }

    init() {
        try {
            this.setupScene();
            this.createParticleField();
            this.createWaveSystem();
            this.createGridSystem();
            this.createFloatingElements();
            this.setupLighting();
            this.startAnimation();
            this.setupResponsive();
            
            this.isInitialized = true;
            console.log('🎯 Blaze Professional Background initialized');
        } catch (error) {
            console.error('❌ Failed to initialize professional background:', error);
        }
    }

    setupScene() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            throw new Error(`Container ${this.config.containerId} not found`);
        }

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.colors.background);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: container,
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    createParticleField() {
        // Professional particle system - clean dots, no camo patterns
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.config.particleCount * 3);
        const colors = new Float32Array(this.config.particleCount * 3);
        const sizes = new Float32Array(this.config.particleCount);
        
        const color = new THREE.Color();
        
        for (let i = 0; i < this.config.particleCount; i++) {
            // Position - scattered but organized
            positions[i * 3] = (Math.random() - 0.5) * 20;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
            
            // Color - professional blue gradient
            const mixRatio = Math.random();
            color.lerpColors(
                new THREE.Color(this.config.colors.primary), 
                new THREE.Color(this.config.colors.secondary), 
                mixRatio
            );
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Size variation
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Professional particle material
        const material = new THREE.PointsMaterial({
            size: 0.05,
            transparent: true,
            opacity: this.config.opacity.particles,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    createWaveSystem() {
        // Elegant wave geometry - flowing, not chaotic
        const waveGeometry = new THREE.PlaneGeometry(15, 15, 50, 50);
        const waveMaterial = new THREE.MeshPhongMaterial({
            color: this.config.colors.primary,
            transparent: true,
            opacity: this.config.opacity.waves,
            wireframe: true,
            side: THREE.DoubleSide
        });
        
        this.waveGeometry = waveGeometry;
        const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
        waveMesh.rotation.x = -Math.PI / 2;
        waveMesh.position.y = -3;
        
        this.scene.add(waveMesh);
    }

    createGridSystem() {
        // Subtle grid lines for structure
        const gridHelper = new THREE.GridHelper(20, 20, 
            this.config.colors.accent, 
            this.config.colors.secondary
        );
        gridHelper.position.y = -4;
        gridHelper.material.opacity = this.config.opacity.grid;
        gridHelper.material.transparent = true;
        
        this.gridLines = gridHelper;
        this.scene.add(gridHelper);
    }

    createFloatingElements() {
        // Clean geometric elements - professional, not random
        const geometries = [
            new THREE.IcosahedronGeometry(0.3, 1),
            new THREE.OctahedronGeometry(0.25, 0),
            new THREE.TetrahedronGeometry(0.35, 0)
        ];
        
        for (let i = 0; i < 6; i++) {
            const geometry = geometries[i % geometries.length];
            const material = new THREE.MeshPhongMaterial({
                color: i % 2 ? this.config.colors.primary : this.config.colors.secondary,
                transparent: true,
                opacity: 0.4,
                wireframe: true
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            // Organized positioning
            mesh.position.x = (Math.random() - 0.5) * 10;
            mesh.position.y = (Math.random() - 0.5) * 6;
            mesh.position.z = (Math.random() - 0.5) * 8;
            
            // Rotation for subtle animation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            
            this.floatingElements.push(mesh);
            this.scene.add(mesh);
        }
    }

    setupLighting() {
        // Professional lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Accent lighting
        const pointLight = new THREE.PointLight(this.config.colors.secondary, 0.5, 50);
        pointLight.position.set(-5, 3, -5);
        this.scene.add(pointLight);
    }

    startAnimation() {
        const animate = (time) => {
            this.animationId = requestAnimationFrame(animate);
            
            if (!this.isInitialized) return;
            
            const t = time * this.config.animationSpeed;
            
            // Animate particles - gentle floating motion
            if (this.particleSystem) {
                this.particleSystem.rotation.y = t * 0.1;
                const positions = this.particleSystem.geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += Math.sin(t + positions[i]) * 0.001; // Subtle vertical movement
                }
                this.particleSystem.geometry.attributes.position.needsUpdate = true;
            }
            
            // Animate wave - smooth undulation
            if (this.waveGeometry) {
                const positions = this.waveGeometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const y = positions[i + 1];
                    positions[i + 2] = Math.sin(x * 0.3 + t) * Math.cos(y * 0.3 + t) * this.config.waveAmplitude;
                }
                this.waveGeometry.attributes.position.needsUpdate = true;
            }
            
            // Animate floating elements - gentle rotation
            this.floatingElements.forEach((element, index) => {
                element.rotation.x += 0.005;
                element.rotation.y += 0.003;
                element.position.y += Math.sin(t + index) * 0.002;
            });
            
            // Animate grid - subtle breathing effect
            if (this.gridLines) {
                this.gridLines.material.opacity = this.config.opacity.grid + 
                    Math.sin(t * 0.5) * 0.05;
            }
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate(0);
    }

    setupResponsive() {
        const handleResize = () => {
            if (!this.camera || !this.renderer) return;
            
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Store reference for cleanup
        this.resizeHandler = handleResize;
    }

    // Professional color schemes
    static colorSchemes = {
        corporate: {
            primaryColor: 0x1a365d,    // Corporate navy
            secondaryColor: 0x2d7dd2,  // Professional blue
            accentColor: 0xffffff,     // Clean white
            backgroundColor: 0x0f1419  // Deep background
        },
        tech: {
            primaryColor: 0x00d4aa,    // Tech teal
            secondaryColor: 0x0099cc,  // Cool blue
            accentColor: 0x00ff88,     // Bright accent
            backgroundColor: 0x0a0e1a  // Tech dark
        },
        elegant: {
            primaryColor: 0x6366f1,    // Elegant purple
            secondaryColor: 0x8b5cf6,  // Royal purple
            accentColor: 0xf8fafc,     // Soft white
            backgroundColor: 0x0f0f23  // Elegant dark
        },
        blaze: {
            primaryColor: 0xBF5700,    // Blaze orange
            secondaryColor: 0xFF8C42,  // Bright orange
            accentColor: 0x00A8CC,     // Contrasting blue
            backgroundColor: 0x000814  // Deep navy
        }
    };

    updateColorScheme(schemeName) {
        if (!BlazeProfessionalBackground.colorSchemes[schemeName]) {
            console.warn(`Color scheme "${schemeName}" not found`);
            return;
        }
        
        const scheme = BlazeProfessionalBackground.colorSchemes[schemeName];
        this.config.colors = { ...this.config.colors, ...scheme };
        
        // Update scene colors
        if (this.scene) {
            this.scene.background = new THREE.Color(this.config.colors.background);
        }
        
        console.log(`🎨 Updated to ${schemeName} color scheme`);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        if (this.scene) {
            while (this.scene.children.length > 0) {
                const object = this.scene.children[0];
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
                this.scene.remove(object);
            }
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.isInitialized = false;
        console.log('🧹 Professional background destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeProfessionalBackground;
} else if (typeof window !== 'undefined') {
    window.BlazeProfessionalBackground = BlazeProfessionalBackground;
}