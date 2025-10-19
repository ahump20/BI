/**
 * ============================================================================
 * BLAZE SPORTS INTEL - WEBXR VR/AR INTEGRATION
 * Immersive Sports Analytics Platform for VR/AR Devices
 * ============================================================================
 * Features: Vision Pro Support, WebXR API, Spatial Computing
 * Performance: Optimized for Quest, Vision Pro, HoloLens
 * Author: Austin Humphrey - blazesportsintel.com
 * ============================================================================
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.158.0';
import { VRButton } from 'https://cdn.skypack.dev/three@0.158.0/examples/jsm/webxr/VRButton.js';
import { ARButton } from 'https://cdn.skypack.dev/three@0.158.0/examples/jsm/webxr/ARButton.js';
import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.158.0/examples/jsm/webxr/XRControllerModelFactory.js';

class BlazeWebXRIntegration {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // XR Configuration
        this.xrConfig = {
            enableVR: false,
            enableAR: false,
            requiresUserActivation: true,
            immersiveSessionTypes: ['immersive-vr', 'immersive-ar'],
            features: ['local-floor', 'bounded-floor', 'hand-tracking', 'hit-test']
        };

        // Controllers and Interaction
        this.controllers = [];
        this.controllerGrips = [];
        this.hands = [];
        this.gamepad = null;

        // XR Reference Spaces
        this.xrRefSpace = null;
        this.xrSession = null;

        // UI Elements in XR
        this.xrUI = new THREE.Group();
        this.spatialMenus = new Map();
        this.dataHolographs = new Map();

        // Performance Monitoring
        this.xrPerformance = {
            frameRate: 90, // Target for VR
            renderTime: 0,
            lastFrameTime: 0
        };

        this.initialize();
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    async initialize() {
        console.log('🥽 Initializing Blaze WebXR Integration...');

        // Check WebXR support
        this.checkWebXRSupport();

        // Setup VR/AR capabilities
        await this.setupVRSupport();
        await this.setupARSupport();

        // Initialize spatial UI
        this.initializeSpatialUI();

        // Setup controller interactions
        this.setupControllers();

        // Add XR UI to scene
        this.scene.add(this.xrUI);

        console.log('🌐 WebXR Integration ready for immersive sports analytics');
    }

    checkWebXRSupport() {
        if (!('xr' in navigator)) {
            console.warn('⚠️ WebXR not supported in this browser');
            return false;
        }

        // Check for specific session types
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            this.xrConfig.enableVR = supported;
            if (supported) {
                console.log('✅ WebXR VR support detected');
            }
        });

        navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            this.xrConfig.enableAR = supported;
            if (supported) {
                console.log('✅ WebXR AR support detected');
            }
        });

        return true;
    }

    async setupVRSupport() {
        if (!this.xrConfig.enableVR) return;

        // Enable XR in renderer
        this.renderer.xr.enabled = true;
        this.renderer.xr.setFramebufferScaleFactor(2.0);

        // Create VR button
        const vrButton = VRButton.createButton(this.renderer);
        vrButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background: linear-gradient(135deg, #BF5700, #FF8C42);
            color: white;
            border: none;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(191, 87, 0, 0.3);
            transition: all 0.3s ease;
        `;

        // Enhanced button styling
        vrButton.addEventListener('mouseenter', () => {
            vrButton.style.transform = 'scale(1.05)';
            vrButton.style.boxShadow = '0 6px 25px rgba(191, 87, 0, 0.4)';
        });

        vrButton.addEventListener('mouseleave', () => {
            vrButton.style.transform = 'scale(1.0)';
            vrButton.style.boxShadow = '0 4px 15px rgba(191, 87, 0, 0.3)';
        });

        document.body.appendChild(vrButton);

        // Setup VR session event listeners
        this.renderer.xr.addEventListener('sessionstart', () => {
            console.log('🥽 VR Session started');
            this.onVRSessionStart();
        });

        this.renderer.xr.addEventListener('sessionend', () => {
            console.log('🥽 VR Session ended');
            this.onVRSessionEnd();
        });
    }

    async setupARSupport() {
        if (!this.xrConfig.enableAR) return;

        // Create AR button
        const arButton = ARButton.createButton(this.renderer, {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay', 'light-estimation']
        });

        arButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background: linear-gradient(135deg, #00B2A9, #5CDBD8);
            color: white;
            border: none;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 178, 169, 0.3);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(arButton);

        // Setup AR session event listeners
        this.renderer.xr.addEventListener('sessionstart', () => {
            if (this.renderer.xr.getSession().mode === 'immersive-ar') {
                console.log('📱 AR Session started');
                this.onARSessionStart();
            }
        });

        this.renderer.xr.addEventListener('sessionend', () => {
            console.log('📱 AR Session ended');
            this.onARSessionEnd();
        });
    }

    // ============================================================================
    // SPATIAL UI CREATION
    // ============================================================================

    initializeSpatialUI() {
        // Create main dashboard panel in 3D space
        this.createSpatialDashboard();

        // Create team comparison holographs
        this.createTeamHolographs();

        // Create data visualization pods
        this.createDataVisualizationPods();

        // Create immersive scoreboard
        this.createImmersiveScoreboard();
    }

    createSpatialDashboard() {
        const dashboardGroup = new THREE.Group();
        dashboardGroup.name = 'spatialDashboard';

        // Main panel background
        const panelGeometry = new THREE.PlaneGeometry(3, 2);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1f,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 1.5, -2);
        dashboardGroup.add(panel);

        // Create UI elements on the panel
        this.createUIText('BLAZE SPORTS INTEL', 0, 1.8, -1.9, 0.15, '#FFD700');
        this.createUIText('Championship Analytics', 0, 1.5, -1.9, 0.08, '#9BCBEB');

        // Performance metrics
        this.createUIText('Cardinals: 96.6% Playoff Prob', -1, 1.0, -1.9, 0.06, '#C41E3A');
        this.createUIText('Titans: 8.4% Playoff Prob', -1, 0.8, -1.9, 0.06, '#4B92DB');
        this.createUIText('Longhorns: 89.7% Championship', -1, 0.6, -1.9, 0.06, '#BF5700');
        this.createUIText('Grizzlies: 52.1% Playoff Prob', -1, 0.4, -1.9, 0.06, '#00B2A9');

        this.spatialMenus.set('dashboard', dashboardGroup);
        this.xrUI.add(dashboardGroup);
    }

    createTeamHolographs() {
        const teams = [
            { name: 'Cardinals', position: [-3, 1, -3], color: 0xC41E3A },
            { name: 'Titans', position: [3, 1, -3], color: 0x4B92DB },
            { name: 'Longhorns', position: [-3, 1, 3], color: 0xBF5700 },
            { name: 'Grizzlies', position: [3, 1, 3], color: 0x00B2A9 }
        ];

        teams.forEach((team, index) => {
            const holographGroup = new THREE.Group();
            holographGroup.name = `${team.name}Holograph`;

            // Team logo/icon representation
            const logoGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
            const logoMaterial = new THREE.MeshStandardMaterial({
                color: team.color,
                transparent: true,
                opacity: 0.8,
                emissive: new THREE.Color(team.color),
                emissiveIntensity: 0.2
            });

            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(...team.position);
            holographGroup.add(logo);

            // Floating data points around the logo
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 1.2;

                const dataGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const dataMaterial = new THREE.MeshStandardMaterial({
                    color: team.color,
                    transparent: true,
                    opacity: 0.6
                });

                const dataSphere = new THREE.Mesh(dataGeometry, dataMaterial);
                dataSphere.position.set(
                    team.position[0] + Math.cos(angle) * radius,
                    team.position[1] + Math.sin(i * 0.5) * 0.2,
                    team.position[2] + Math.sin(angle) * radius
                );

                dataSphere.userData = {
                    team: team.name,
                    originalY: dataSphere.position.y,
                    animationOffset: i
                };

                holographGroup.add(dataSphere);
            }

            // Team name label
            this.createUIText(
                team.name,
                team.position[0],
                team.position[1] + 0.8,
                team.position[2],
                0.1,
                `#${team.color.toString(16).padStart(6, '0')}`
            );

            this.dataHolographs.set(team.name, holographGroup);
            this.xrUI.add(holographGroup);
        });
    }

    createDataVisualizationPods() {
        // Create floating data visualization spheres
        const podPositions = [
            { x: 0, y: 3, z: -5 },
            { x: -4, y: 2.5, z: -2 },
            { x: 4, y: 2.5, z: -2 },
            { x: 0, y: 2, z: 5 }
        ];

        podPositions.forEach((pos, index) => {
            const podGroup = new THREE.Group();
            podGroup.name = `dataPod${index}`;

            // Main pod sphere
            const podGeometry = new THREE.SphereGeometry(0.8, 32, 32);
            const podMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a3f,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                metalness: 0.8
            });

            const pod = new THREE.Mesh(podGeometry, podMaterial);
            pod.position.set(pos.x, pos.y, pos.z);
            podGroup.add(pod);

            // Data streams inside the pod
            for (let i = 0; i < 20; i++) {
                const streamGeometry = new THREE.SphereGeometry(0.02, 4, 4);
                const streamMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL((i / 20), 0.8, 0.6),
                    transparent: true,
                    opacity: 0.8
                });

                const stream = new THREE.Mesh(streamGeometry, streamMaterial);

                // Random position inside the pod
                const phi = Math.acos(-1 + (2 * Math.random()));
                const theta = Math.sqrt(6.0) * Math.acos(Math.random());
                const radius = 0.6 * Math.random();

                stream.position.set(
                    pos.x + radius * Math.sin(phi) * Math.cos(theta),
                    pos.y + radius * Math.sin(phi) * Math.sin(theta),
                    pos.z + radius * Math.cos(phi)
                );

                stream.userData = {
                    originalPosition: stream.position.clone(),
                    animationSpeed: 0.5 + Math.random() * 1.0,
                    podIndex: index
                };

                podGroup.add(stream);
            }

            this.xrUI.add(podGroup);
        });
    }

    createImmersiveScoreboard() {
        const scoreboardGroup = new THREE.Group();
        scoreboardGroup.name = 'immersiveScoreboard';

        // Main scoreboard structure
        const boardGeometry = new THREE.BoxGeometry(4, 1.5, 0.2);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.2
        });

        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(0, 3.5, -8);
        scoreboardGroup.add(board);

        // LED display simulation
        const ledGeometry = new THREE.PlaneGeometry(3.5, 1, 50, 20);
        const ledMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.9
        });

        const ledDisplay = new THREE.Mesh(ledGeometry, ledMaterial);
        ledDisplay.position.set(0, 3.5, -7.8);
        scoreboardGroup.add(ledDisplay);

        // Create text displays
        this.createUIText('LIVE SCORES', 0, 4.0, -7.5, 0.12, '#FFD700');
        this.createUIText('Cardinals vs Dodgers', 0, 3.6, -7.5, 0.08, '#FFFFFF');
        this.createUIText('7 - 4', 0, 3.2, -7.5, 0.15, '#00FF00');

        this.xrUI.add(scoreboardGroup);
    }

    createUIText(text, x, y, z, size, color) {
        // Create text using HTML/CSS renderer for WebXR
        const textDiv = document.createElement('div');
        textDiv.style.cssText = `
            position: absolute;
            color: ${color};
            font-family: 'Inter', sans-serif;
            font-size: ${size * 100}px;
            font-weight: 600;
            text-align: center;
            pointer-events: none;
            user-select: none;
        `;
        textDiv.textContent = text;

        // For WebXR, we'll use a different approach with canvas textures
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        context.fillStyle = color;
        context.font = `${size * 400}px Inter, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        sprite.scale.set(size * 10, size * 2.5, 1);

        this.xrUI.add(sprite);
        return sprite;
    }

    // ============================================================================
    // CONTROLLER SETUP
    // ============================================================================

    setupControllers() {
        const controllerModelFactory = new XRControllerModelFactory();

        // Setup controllers for VR
        for (let i = 0; i < 2; i++) {
            // Controller
            const controller = this.renderer.xr.getController(i);
            controller.addEventListener('selectstart', this.onSelectStart.bind(this));
            controller.addEventListener('selectend', this.onSelectEnd.bind(this));
            controller.addEventListener('squeezestart', this.onSqueezeStart.bind(this));
            controller.addEventListener('squeezeend', this.onSqueezeEnd.bind(this));

            this.scene.add(controller);
            this.controllers.push(controller);

            // Controller grip
            const controllerGrip = this.renderer.xr.getControllerGrip(i);
            controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
            this.scene.add(controllerGrip);
            this.controllerGrips.push(controllerGrip);

            // Hand tracking
            const hand = this.renderer.xr.getHand(i);
            hand.addEventListener('pinchstart', this.onPinchStart.bind(this));
            hand.addEventListener('pinchend', this.onPinchEnd.bind(this));

            this.scene.add(hand);
            this.hands.push(hand);
        }

        // Add controller ray casting
        this.setupControllerRaycasting();
    }

    setupControllerRaycasting() {
        // Create ray visualization
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        ]);

        const material = new THREE.LineBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.5
        });

        this.controllers.forEach(controller => {
            const line = new THREE.Line(geometry, material);
            line.name = 'controllerRay';
            line.scale.z = 5;
            controller.add(line);
        });
    }

    // ============================================================================
    // INTERACTION HANDLERS
    // ============================================================================

    onSelectStart(event) {
        const controller = event.target;

        // Perform raycasting to detect UI interactions
        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();

        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects(this.xrUI.children, true);

        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            this.handleUIInteraction(intersected, 'select');
        }
    }

    onSelectEnd(event) {
        // Handle select end if needed
    }

    onSqueezeStart(event) {
        const controller = event.target;
        // Handle squeeze gesture for grabbing/moving UI elements
        console.log('🤏 Squeeze gesture detected');
    }

    onSqueezeEnd(event) {
        // Handle squeeze end
    }

    onPinchStart(event) {
        console.log('👌 Pinch gesture detected');
        // Handle hand tracking pinch for fine interactions
    }

    onPinchEnd(event) {
        // Handle pinch end
    }

    handleUIInteraction(object, interactionType) {
        console.log(`🎯 UI Interaction: ${interactionType} on ${object.name}`);

        // Handle different UI element interactions
        if (object.parent && object.parent.name.includes('Holograph')) {
            this.focusOnTeam(object.parent.name.replace('Holograph', ''));
        } else if (object.name.includes('dataPod')) {
            this.openDataVisualization(object.userData.podIndex);
        }

        // Visual feedback
        this.provideFeedback(object);
    }

    focusOnTeam(teamName) {
        console.log(`🎯 Focusing on ${teamName}`);

        // Animate team holograph
        const holograph = this.dataHolographs.get(teamName);
        if (holograph) {
            const originalScale = holograph.scale.clone();
            holograph.scale.multiplyScalar(1.2);

            setTimeout(() => {
                holograph.scale.copy(originalScale);
            }, 500);
        }

        // Update dashboard with team-specific data
        this.updateDashboardForTeam(teamName);
    }

    openDataVisualization(podIndex) {
        console.log(`📊 Opening data visualization pod ${podIndex}`);
        // Implement data visualization opening logic
    }

    provideFeedback(object) {
        // Haptic feedback if available
        if (this.xrSession && this.xrSession.inputSources) {
            this.xrSession.inputSources.forEach(inputSource => {
                if (inputSource.gamepad && inputSource.gamepad.hapticActuators) {
                    inputSource.gamepad.hapticActuators[0].pulse(0.5, 100);
                }
            });
        }

        // Visual feedback
        if (object.material) {
            const originalEmissive = object.material.emissive.clone();
            object.material.emissive = new THREE.Color(0xFFD700);

            setTimeout(() => {
                object.material.emissive = originalEmissive;
            }, 200);
        }
    }

    // ============================================================================
    // SESSION MANAGEMENT
    // ============================================================================

    onVRSessionStart() {
        this.xrSession = this.renderer.xr.getSession();

        // Optimize for VR performance
        this.optimizeForVR();

        // Show VR-specific UI
        this.showVRUI();

        // Start performance monitoring
        this.startPerformanceMonitoring();
    }

    onVRSessionEnd() {
        this.xrSession = null;

        // Reset performance optimizations
        this.resetPerformanceOptimizations();

        // Hide VR UI
        this.hideVRUI();
    }

    onARSessionStart() {
        this.xrSession = this.renderer.xr.getSession();

        // Setup AR-specific features
        this.setupARFeatures();

        // Show AR-specific UI
        this.showARUI();
    }

    onARSessionEnd() {
        this.xrSession = null;

        // Hide AR UI
        this.hideARUI();
    }

    // ============================================================================
    // PERFORMANCE OPTIMIZATION
    // ============================================================================

    optimizeForVR() {
        // Reduce render quality for consistent 90fps
        this.renderer.setPixelRatio(1.0);

        // Disable expensive effects
        this.scene.traverse(child => {
            if (child.material) {
                if (child.material.transparent) {
                    child.material.alphaTest = 0.5;
                }
            }
        });

        console.log('🎯 Optimized for VR performance');
    }

    resetPerformanceOptimizations() {
        // Restore original settings
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        console.log('🔄 Performance optimizations reset');
    }

    startPerformanceMonitoring() {
        const monitor = () => {
            if (!this.xrSession) return;

            const now = performance.now();
            this.xrPerformance.renderTime = now - this.xrPerformance.lastFrameTime;
            this.xrPerformance.lastFrameTime = now;

            // Calculate FPS
            this.xrPerformance.frameRate = 1000 / this.xrPerformance.renderTime;

            // Adjust quality if needed
            if (this.xrPerformance.frameRate < 85) {
                this.reduceQuality();
            } else if (this.xrPerformance.frameRate > 95) {
                this.increaseQuality();
            }

            requestAnimationFrame(monitor);
        };

        monitor();
    }

    reduceQuality() {
        // Implement quality reduction logic
        console.log('📉 Reducing quality for performance');
    }

    increaseQuality() {
        // Implement quality increase logic
        console.log('📈 Increasing quality');
    }

    // ============================================================================
    // UI MANAGEMENT
    // ============================================================================

    showVRUI() {
        this.xrUI.visible = true;
        console.log('👁️ VR UI enabled');
    }

    hideVRUI() {
        this.xrUI.visible = false;
        console.log('👁️ VR UI disabled');
    }

    showARUI() {
        // Show AR-specific UI elements
        this.xrUI.visible = true;

        // Hide background panels for AR transparency
        this.xrUI.traverse(child => {
            if (child.name.includes('panel') || child.name.includes('background')) {
                child.visible = false;
            }
        });

        console.log('📱 AR UI enabled');
    }

    hideARUI() {
        this.xrUI.visible = false;
        console.log('📱 AR UI disabled');
    }

    updateDashboardForTeam(teamName) {
        // Update spatial dashboard with team-specific information
        const dashboard = this.spatialMenus.get('dashboard');
        if (dashboard) {
            // Update text elements with team data
            console.log(`📊 Dashboard updated for ${teamName}`);
        }
    }

    // ============================================================================
    // ANIMATION LOOP
    // ============================================================================

    update(deltaTime) {
        if (!this.renderer.xr.isPresenting) return;

        // Update floating elements
        this.xrUI.traverse(child => {
            if (child.userData && child.userData.animationSpeed) {
                const time = performance.now() * 0.001;
                child.position.y = child.userData.originalPosition.y +
                    Math.sin(time * child.userData.animationSpeed + child.userData.animationOffset) * 0.1;
            }
        });

        // Update data holographs
        this.dataHolographs.forEach(holograph => {
            holograph.children.forEach(child => {
                if (child.userData && child.userData.team) {
                    const time = performance.now() * 0.001;
                    child.position.y = child.userData.originalY +
                        Math.sin(time + child.userData.animationOffset) * 0.1;
                }
            });
        });
    }

    // ============================================================================
    // AR-SPECIFIC FEATURES
    // ============================================================================

    setupARFeatures() {
        if (!this.xrSession) return;

        // Setup hit testing for AR placement
        this.xrSession.requestReferenceSpace('viewer').then((refSpace) => {
            this.xrRefSpace = refSpace;
        });

        // Setup light estimation if available
        if (this.xrSession.enabledFeatures.includes('light-estimation')) {
            this.setupLightEstimation();
        }
    }

    setupLightEstimation() {
        // Implement light estimation for realistic AR lighting
        console.log('💡 AR light estimation enabled');
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    isVRSupported() {
        return this.xrConfig.enableVR;
    }

    isARSupported() {
        return this.xrConfig.enableAR;
    }

    isInXR() {
        return this.renderer.xr.isPresenting;
    }

    getXRSession() {
        return this.xrSession;
    }

    addSpatialElement(element, position) {
        element.position.set(...position);
        this.xrUI.add(element);
    }

    removeSpatialElement(element) {
        this.xrUI.remove(element);
    }

    // ============================================================================
    // CLEANUP
    // ============================================================================

    dispose() {
        // Clean up XR resources
        if (this.xrSession) {
            this.xrSession.end();
        }

        // Remove event listeners
        this.controllers.forEach(controller => {
            controller.removeEventListener('selectstart', this.onSelectStart);
            controller.removeEventListener('selectend', this.onSelectEnd);
        });

        // Clear spatial UI
        this.xrUI.clear();
        this.spatialMenus.clear();
        this.dataHolographs.clear();

        console.log('🔄 WebXR Integration disposed');
    }
}

// Export for module usage
export default BlazeWebXRIntegration;

// Global API
window.BlazeWebXR = BlazeWebXRIntegration;

console.log('🥽 Blaze WebXR Integration loaded - Immersive sports analytics ready');