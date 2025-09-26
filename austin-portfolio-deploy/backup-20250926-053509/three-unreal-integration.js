/**
 * Three.js + Unreal Engine Integration Module
 * Seamlessly blends Unreal renders with Three.js 3D scenes
 */

class ThreeUnrealIntegration {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.renderPlanes = new Map();
        this.animationId = null;
        this.unrealEngine = window.unrealEngine || null;
        this.container = null;
    }

    /**
     * Initialize Three.js scene for Unreal render display
     */
    init(containerId = 'three-unreal-container') {
        // Get or create container
        this.container = document.getElementById(containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.style.position = 'fixed';
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            this.container.style.pointerEvents = 'none';
            this.container.style.zIndex = '50';
            document.body.appendChild(this.container);
        }

        // Setup Three.js
        this.setupScene();
        this.setupLighting();
        this.setupPostProcessing();
        this.startAnimation();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x002244, 100, 1000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 30);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);

        // Stadium lights
        const light1 = new THREE.SpotLight(0xffffff, 1.5);
        light1.position.set(50, 50, 50);
        light1.castShadow = true;
        light1.shadow.mapSize.width = 2048;
        light1.shadow.mapSize.height = 2048;
        this.scene.add(light1);

        const light2 = new THREE.SpotLight(0xff7700, 1);
        light2.position.set(-50, 50, -50);
        light2.castShadow = true;
        this.scene.add(light2);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xbf5700, 0.5);
        rimLight.position.set(0, 10, -10);
        this.scene.add(rimLight);
    }

    setupPostProcessing() {
        // Add bloom for enhanced visuals
        if (typeof THREE.EffectComposer !== 'undefined') {
            const composer = new THREE.EffectComposer(this.renderer);
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            composer.addPass(renderPass);

            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.5, 0.4, 0.85
            );
            composer.addPass(bloomPass);

            this.composer = composer;
        }
    }

    /**
     * Display Unreal render as a 3D plane in the scene
     */
    async displayUnrealRender(renderUrl, options = {}) {
        const {
            position = { x: 0, y: 5, z: 0 },
            scale = { x: 16, y: 9, z: 1 },
            rotation = { x: 0, y: 0, z: 0 },
            animated = true
        } = options;

        // Load texture from Unreal render
        const textureLoader = new THREE.TextureLoader();
        const texture = await new Promise((resolve, reject) => {
            textureLoader.load(
                renderUrl,
                resolve,
                undefined,
                reject
            );
        });

        // Create geometry and material
        const geometry = new THREE.PlaneGeometry(scale.x, scale.y);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x111111,
            emissiveMap: texture,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide,
            transparent: true
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Add to scene
        this.scene.add(mesh);
        this.renderPlanes.set(renderUrl, mesh);

        // Animate entrance
        if (animated) {
            this.animateRenderEntrance(mesh);
        }

        return mesh;
    }

    /**
     * Display video render from Unreal
     */
    async displayVideoRender(videoUrl, options = {}) {
        const {
            position = { x: 0, y: 5, z: 0 },
            scale = { x: 16, y: 9, z: 1 },
            rotation = { x: 0, y: 0, z: 0 },
            loop = true
        } = options;

        // Create video element
        const video = document.createElement('video');
        video.src = videoUrl;
        video.loop = loop;
        video.muted = true;
        video.play();

        // Create video texture
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // Create geometry and material
        const geometry = new THREE.PlaneGeometry(scale.x, scale.y);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x111111,
            emissiveMap: texture,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Add to scene
        this.scene.add(mesh);
        this.renderPlanes.set(videoUrl, { mesh, video });

        return mesh;
    }

    /**
     * Create stadium environment around Unreal renders
     */
    createStadiumEnvironment() {
        // Stadium floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Stadium walls (simplified)
        const wallGeometry = new THREE.BoxGeometry(100, 30, 2);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9
        });

        // Back wall
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.z = -50;
        backWall.position.y = 15;
        this.scene.add(backWall);

        // Side walls
        const sideWallGeometry = new THREE.BoxGeometry(2, 30, 100);
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.position.x = -50;
        leftWall.position.y = 15;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        rightWall.position.x = 50;
        rightWall.position.y = 15;
        this.scene.add(rightWall);

        // Add particle effects
        this.addStadiumParticles();
    }

    /**
     * Add particle effects for atmosphere
     */
    addStadiumParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // Orange/gold particles
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = Math.random() * 0.5 + 0.3;
            colors[i * 3 + 2] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particles = particles;
    }

    /**
     * Animate render entrance
     */
    animateRenderEntrance(mesh) {
        mesh.scale.set(0.01, 0.01, 0.01);
        mesh.material.opacity = 0;

        const targetScale = { x: 1, y: 1, z: 1 };
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Scale animation
            mesh.scale.x = 0.01 + (targetScale.x - 0.01) * easeProgress;
            mesh.scale.y = 0.01 + (targetScale.y - 0.01) * easeProgress;
            mesh.scale.z = 0.01 + (targetScale.z - 0.01) * easeProgress;

            // Opacity animation
            mesh.material.opacity = easeProgress;

            // Rotation animation
            mesh.rotation.y = (1 - easeProgress) * Math.PI * 2;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Create floating analytics display
     */
    createAnalyticsDisplay(data) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw analytics
        ctx.fillStyle = 'rgba(0, 34, 68, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#bf5700';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter';
        ctx.fillText('Performance Analytics', 20, 40);

        ctx.font = '18px Inter';
        let y = 80;
        Object.entries(data).forEach(([key, value]) => {
            ctx.fillText(`${key}: ${value}`, 30, y);
            y += 30;
        });

        // Create texture and mesh
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(10, 5);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 10, 10);
        this.scene.add(mesh);

        // Animate floating
        this.floatMesh(mesh);

        return mesh;
    }

    /**
     * Float animation for meshes
     */
    floatMesh(mesh) {
        const startY = mesh.position.y;
        const animate = () => {
            const time = Date.now() * 0.001;
            mesh.position.y = startY + Math.sin(time) * 0.5;
            mesh.rotation.y = Math.sin(time * 0.5) * 0.1;
            requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            // Rotate particles
            if (this.particles) {
                this.particles.rotation.y += 0.0005;
            }

            // Update camera orbit
            const time = Date.now() * 0.0005;
            this.camera.position.x = Math.sin(time) * 30;
            this.camera.position.z = Math.cos(time) * 30;
            this.camera.lookAt(0, 5, 0);

            // Render
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        };
        animate();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.renderPlanes.forEach((mesh) => {
            if (mesh.video) {
                mesh.video.pause();
                mesh.video.src = '';
            }
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            }
            this.scene.remove(mesh);
        });

        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }

        this.renderPlanes.clear();
    }

    /**
     * Integration with Unreal Engine renders
     */
    async integrateUnrealRender(renderData) {
        const { type, url, metadata } = renderData;

        switch (type) {
            case 'championship-stadium':
                this.createStadiumEnvironment();
                await this.displayUnrealRender(url, {
                    position: { x: 0, y: 10, z: -20 },
                    scale: { x: 30, y: 20, z: 1 }
                });
                break;

            case 'player-spotlight':
                await this.displayUnrealRender(url, {
                    position: { x: 0, y: 8, z: 0 },
                    scale: { x: 12, y: 16, z: 1 },
                    animated: true
                });
                if (metadata && metadata.stats) {
                    this.createAnalyticsDisplay(metadata.stats);
                }
                break;

            case 'analytics-visualization':
                await this.displayUnrealRender(url, {
                    position: { x: 0, y: 5, z: 5 },
                    scale: { x: 20, y: 12, z: 1 }
                });
                break;

            case 'game-moment':
                await this.displayVideoRender(url, {
                    position: { x: 0, y: 8, z: -10 },
                    scale: { x: 24, y: 14, z: 1 },
                    loop: true
                });
                break;

            case 'monte-carlo-simulation':
                // Create multiple planes for simulation results
                const positions = [
                    { x: -10, y: 5, z: 0 },
                    { x: 0, y: 5, z: 0 },
                    { x: 10, y: 5, z: 0 }
                ];
                for (let i = 0; i < positions.length; i++) {
                    await this.displayUnrealRender(url, {
                        position: positions[i],
                        scale: { x: 8, y: 6, z: 1 },
                        animated: true
                    });
                }
                break;
        }
    }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.threeUnrealIntegration = new ThreeUnrealIntegration();

    // Auto-initialize if Three.js is loaded
    if (window.THREE) {
        window.addEventListener('DOMContentLoaded', () => {
            window.threeUnrealIntegration.init();
        });
    }
}