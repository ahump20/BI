/**
 * 🔥 BLAZE INTELLIGENCE - CINEMATIC CAMERA SYSTEM
 * Broadcast-quality camera work with smooth transitions and professional angles
 * Implements multiple camera modes, automated switching, and cinematic movements
 */

class BlazeCinematicCameras {
    constructor(scene, renderer, mainCamera) {
        this.scene = scene;
        this.renderer = renderer;
        this.mainCamera = mainCamera;

        // Camera system parameters
        this.params = {
            transitionDuration: 2.5,
            cameraShakeIntensity: 0.02,
            focusPullSpeed: 0.8,
            cinematicFOV: 45,
            broadcastFOV: 60,
            handheldIntensity: 0.003,
            smoothingFactor: 0.95,
            motionBlurStrength: 0.4
        };

        // Camera modes and presets
        this.cameraPresets = new Map();
        this.cameraSequences = new Map();
        this.currentCameraMode = 'stadium_overview';
        this.isTransitioning = false;
        this.transitionProgress = 0;

        // Camera system state
        this.cameraSystem = {
            primary: null,
            secondary: null,
            virtualCameras: new Map(),
            currentSequence: null,
            autoSwitchEnabled: false,
            followTarget: null
        };

        // Motion systems
        this.motionSystem = {
            dollyTrack: null,
            craneArmPosition: new THREE.Vector3(),
            steadicamOffset: new THREE.Vector3(),
            handheldNoise: { x: 0, y: 0, z: 0 },
            focusPuller: { current: 0, target: 0 }
        };

        this.initializeCameraSystem();
    }

    initializeCameraSystem() {
        this.setupVirtualCameras();
        this.createCameraPresets();
        this.createCinematicSequences();
        this.setupMotionControls();
        this.initializeTransitionSystem();

        console.log('🎬 Cinematic camera system initialized - Broadcast quality enabled');
    }

    setupVirtualCameras() {
        // Stadium overview cameras
        this.createVirtualCamera('stadium_wide', {
            position: new THREE.Vector3(0, 200, 300),
            target: new THREE.Vector3(0, 0, 0),
            fov: 65,
            type: 'static'
        });

        this.createVirtualCamera('stadium_aerial', {
            position: new THREE.Vector3(0, 400, 0),
            target: new THREE.Vector3(0, 0, 0),
            fov: 80,
            type: 'static'
        });

        // Field-level cameras
        this.createVirtualCamera('sideline_50', {
            position: new THREE.Vector3(120, 8, 0),
            target: new THREE.Vector3(0, 5, 0),
            fov: 45,
            type: 'follow'
        });

        this.createVirtualCamera('endzone_low', {
            position: new THREE.Vector3(0, 5, 80),
            target: new THREE.Vector3(0, 5, 0),
            fov: 50,
            type: 'tracking'
        });

        // Elevated broadcast cameras
        this.createVirtualCamera('broadcast_main', {
            position: new THREE.Vector3(150, 60, 0),
            target: new THREE.Vector3(0, 0, 0),
            fov: 55,
            type: 'broadcast'
        });

        this.createVirtualCamera('broadcast_reverse', {
            position: new THREE.Vector3(-150, 60, 0),
            target: new THREE.Vector3(0, 0, 0),
            fov: 55,
            type: 'broadcast'
        });

        // Specialty cameras
        this.createVirtualCamera('skycam', {
            position: new THREE.Vector3(0, 100, 0),
            target: new THREE.Vector3(0, 0, 0),
            fov: 40,
            type: 'cable'
        });

        this.createVirtualCamera('dugout_angle', {
            position: new THREE.Vector3(-60, 12, 30),
            target: new THREE.Vector3(0, 0, 0),
            fov: 35,
            type: 'cinematic'
        });

        // Close-up detail cameras
        this.createVirtualCamera('player_closeup', {
            position: new THREE.Vector3(20, 8, 0),
            target: new THREE.Vector3(0, 6, 0),
            fov: 25,
            type: 'portrait'
        });

        this.createVirtualCamera('coach_cam', {
            position: new THREE.Vector3(80, 6, 0),
            target: new THREE.Vector3(0, 6, 0),
            fov: 30,
            type: 'handheld'
        });

        console.log(`📹 ${this.cameraSystem.virtualCameras.size} virtual cameras created`);
    }

    createVirtualCamera(name, config) {
        const camera = new THREE.PerspectiveCamera(config.fov, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.copy(config.position);
        camera.lookAt(config.target);

        const cameraData = {
            camera: camera,
            name: name,
            type: config.type,
            targetPosition: config.position.clone(),
            targetLookAt: config.target.clone(),
            currentLookAt: config.target.clone(),
            lastPosition: config.position.clone(),
            smoothPosition: config.position.clone(),
            smoothTarget: config.target.clone(),
            fov: config.fov,

            // Motion properties
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            jitter: { strength: 0, frequency: 1 },

            // Broadcast properties
            isActive: false,
            priority: 1,
            transitionInTime: 2.0,
            transitionOutTime: 1.5
        };

        this.cameraSystem.virtualCameras.set(name, cameraData);
        return cameraData;
    }

    createCameraPresets() {
        // Touchdown celebration sequence
        this.cameraPresets.set('touchdown_celebration', {
            sequence: [
                { camera: 'endzone_low', duration: 3, transition: 'smooth' },
                { camera: 'player_closeup', duration: 2, transition: 'quick_cut' },
                { camera: 'stadium_wide', duration: 4, transition: 'slow_push' },
                { camera: 'broadcast_main', duration: 3, transition: 'smooth' }
            ],
            totalDuration: 12,
            repeatable: false
        });

        // Field goal attempt
        this.cameraPresets.set('field_goal_attempt', {
            sequence: [
                { camera: 'sideline_50', duration: 5, transition: 'smooth' },
                { camera: 'endzone_low', duration: 3, transition: 'quick_pan' },
                { camera: 'stadium_aerial', duration: 2, transition: 'dramatic_reveal' }
            ],
            totalDuration: 10,
            repeatable: false
        });

        // Stadium introduction
        this.cameraPresets.set('stadium_intro', {
            sequence: [
                { camera: 'stadium_aerial', duration: 4, transition: 'fade_in' },
                { camera: 'stadium_wide', duration: 6, transition: 'slow_descent' },
                { camera: 'broadcast_main', duration: 4, transition: 'smooth' },
                { camera: 'dugout_angle', duration: 3, transition: 'cinematic' }
            ],
            totalDuration: 17,
            repeatable: true
        });

        // Dramatic moment
        this.cameraPresets.set('dramatic_moment', {
            sequence: [
                { camera: 'player_closeup', duration: 2, transition: 'snap_zoom' },
                { camera: 'coach_cam', duration: 3, transition: 'handheld_quick' },
                { camera: 'stadium_wide', duration: 4, transition: 'dramatic_pull' },
                { camera: 'skycam', duration: 3, transition: 'cable_sweep' }
            ],
            totalDuration: 12,
            repeatable: false
        });
    }

    createCinematicSequences() {
        // Pre-game flyover sequence
        this.cameraSequences.set('pregame_flyover', {
            keyframes: [
                { time: 0, position: new THREE.Vector3(0, 1000, 1000), target: new THREE.Vector3(0, 0, 0), fov: 70 },
                { time: 5, position: new THREE.Vector3(0, 300, 500), target: new THREE.Vector3(0, 0, 0), fov: 60 },
                { time: 10, position: new THREE.Vector3(0, 150, 200), target: new THREE.Vector3(0, 0, 0), fov: 55 },
                { time: 15, position: new THREE.Vector3(150, 60, 0), target: new THREE.Vector3(0, 0, 0), fov: 50 }
            ],
            duration: 15,
            easing: 'easeInOutQuart'
        });

        // 360-degree stadium reveal
        this.cameraSequences.set('stadium_reveal', {
            keyframes: this.generateCircularPath(new THREE.Vector3(0, 100, 200), new THREE.Vector3(0, 0, 0), 20, Math.PI * 2),
            duration: 20,
            easing: 'linear'
        });

        // Dramatic crane shot
        this.cameraSequences.set('crane_shot', {
            keyframes: [
                { time: 0, position: new THREE.Vector3(50, 5, 0), target: new THREE.Vector3(0, 5, 0), fov: 35 },
                { time: 8, position: new THREE.Vector3(100, 80, 100), target: new THREE.Vector3(0, 0, 0), fov: 65 }
            ],
            duration: 8,
            easing: 'easeInOutCubic'
        });

        // Victory lap follow
        this.cameraSequences.set('victory_lap', {
            keyframes: this.generateTrackingPath(30),
            duration: 30,
            easing: 'easeInOutSine'
        });
    }

    setupMotionControls() {
        // Dolly track system
        this.motionSystem.dollyTrack = {
            points: [
                new THREE.Vector3(-200, 60, 0),
                new THREE.Vector3(-100, 60, 0),
                new THREE.Vector3(0, 60, 0),
                new THREE.Vector3(100, 60, 0),
                new THREE.Vector3(200, 60, 0)
            ],
            currentPosition: 0, // 0 to 1 along track
            speed: 0.1
        };

        // Crane arm system
        this.motionSystem.craneArm = {
            basePosition: new THREE.Vector3(100, 0, 0),
            armLength: 80,
            armAngle: 0, // Horizontal angle
            elevationAngle: Math.PI / 6, // Elevation angle
            panSpeed: 0.02,
            tiltSpeed: 0.015
        };

        // Focus pulling system
        this.motionSystem.focusPuller = {
            current: 0,
            target: 0,
            speed: 0.8,

            setTarget: (target) => {
                this.motionSystem.focusPuller.target = target;
            },

            update: (deltaTime) => {
                const diff = this.motionSystem.focusPuller.target - this.motionSystem.focusPuller.current;
                this.motionSystem.focusPuller.current += diff * this.motionSystem.focusPuller.speed * deltaTime;
            }
        };
    }

    initializeTransitionSystem() {
        this.transitionSystem = {
            currentTransition: null,
            fromCamera: null,
            toCamera: null,
            progress: 0,
            duration: 0,
            type: 'smooth',

            // Transition types
            transitions: {
                'smooth': this.smoothTransition.bind(this),
                'quick_cut': this.quickCutTransition.bind(this),
                'fade': this.fadeTransition.bind(this),
                'push': this.pushTransition.bind(this),
                'slide': this.slideTransition.bind(this),
                'zoom': this.zoomTransition.bind(this),
                'dramatic_reveal': this.dramaticRevealTransition.bind(this),
                'handheld_quick': this.handheldQuickTransition.bind(this),
                'cable_sweep': this.cableSweepTransition.bind(this)
            }
        };
    }

    // Transition methods
    smoothTransition(progress, fromCam, toCam, mainCamera) {
        const eased = this.easeInOutCubic(progress);

        // Interpolate position
        mainCamera.position.lerpVectors(fromCam.camera.position, toCam.camera.position, eased);

        // Interpolate look-at target
        const fromTarget = new THREE.Vector3().copy(fromCam.currentLookAt);
        const toTarget = new THREE.Vector3().copy(toCam.currentLookAt);
        const lerpedTarget = fromTarget.lerp(toTarget, eased);
        mainCamera.lookAt(lerpedTarget);

        // Interpolate FOV
        mainCamera.fov = fromCam.fov + (toCam.fov - fromCam.fov) * eased;
        mainCamera.updateProjectionMatrix();
    }

    quickCutTransition(progress, fromCam, toCam, mainCamera) {
        if (progress >= 1.0) {
            mainCamera.position.copy(toCam.camera.position);
            mainCamera.lookAt(toCam.currentLookAt);
            mainCamera.fov = toCam.fov;
            mainCamera.updateProjectionMatrix();
        }
    }

    fadeTransition(progress, fromCam, toCam, mainCamera) {
        // This would require render target blending - simplified here
        const eased = this.easeInOutQuad(progress);

        if (progress < 0.5) {
            // Fade out from camera
            const alpha = 1.0 - (progress * 2);
            this.renderer.setClearColor(0x000000, 1.0 - alpha);
        } else {
            // Fade in to camera
            const alpha = (progress - 0.5) * 2;
            mainCamera.position.copy(toCam.camera.position);
            mainCamera.lookAt(toCam.currentLookAt);
            mainCamera.fov = toCam.fov;
            mainCamera.updateProjectionMatrix();
            this.renderer.setClearColor(0x000000, alpha);
        }
    }

    dramaticRevealTransition(progress, fromCam, toCam, mainCamera) {
        // Slow start, fast middle, slow end with slight overshoot
        const eased = this.easeInOutBack(progress);

        // Wide arc movement
        const fromPos = fromCam.camera.position.clone();
        const toPos = toCam.camera.position.clone();
        const midPoint = fromPos.clone().add(toPos).multiplyScalar(0.5);
        midPoint.y += 50; // Arc upward

        if (progress < 0.5) {
            mainCamera.position.lerpVectors(fromPos, midPoint, progress * 2);
        } else {
            mainCamera.position.lerpVectors(midPoint, toPos, (progress - 0.5) * 2);
        }

        // Look at target
        const fromTarget = fromCam.currentLookAt.clone();
        const toTarget = toCam.currentLookAt.clone();
        mainCamera.lookAt(fromTarget.lerp(toTarget, eased));

        // FOV zoom for drama
        const fovCurve = Math.sin(progress * Math.PI) * 10; // +10 FOV at peak
        mainCamera.fov = fromCam.fov + (toCam.fov - fromCam.fov) * eased + fovCurve;
        mainCamera.updateProjectionMatrix();
    }

    cableSweepTransition(progress, fromCam, toCam, mainCamera) {
        // Simulate cable camera sweep
        const eased = this.easeInOutSine(progress);

        // Create swooping path
        const fromPos = fromCam.camera.position.clone();
        const toPos = toCam.camera.position.clone();

        // Add some swing motion
        const swingAmp = 15;
        const swingOffset = Math.sin(progress * Math.PI * 2) * swingAmp * (1 - progress);

        mainCamera.position.lerpVectors(fromPos, toPos, eased);
        mainCamera.position.x += swingOffset;
        mainCamera.position.y += Math.sin(progress * Math.PI) * 20; // Arc motion

        mainCamera.lookAt(toCam.currentLookAt);
        mainCamera.fov = toCam.fov;
        mainCamera.updateProjectionMatrix();
    }

    // Camera control methods
    switchToCamera(cameraName, transitionType = 'smooth', duration = null) {
        const targetCamera = this.cameraSystem.virtualCameras.get(cameraName);
        if (!targetCamera) {
            console.warn(`Camera ${cameraName} not found`);
            return;
        }

        const currentCamera = this.cameraSystem.virtualCameras.get(this.currentCameraMode);

        this.transitionSystem.fromCamera = currentCamera;
        this.transitionSystem.toCamera = targetCamera;
        this.transitionSystem.type = transitionType;
        this.transitionSystem.duration = duration || this.params.transitionDuration;
        this.transitionSystem.progress = 0;
        this.transitionSystem.currentTransition = this.transitionSystem.transitions[transitionType];

        this.isTransitioning = true;
        this.currentCameraMode = cameraName;

        console.log(`🎬 Switching to ${cameraName} with ${transitionType} transition`);
    }

    playSequence(sequenceName) {
        const sequence = this.cameraPresets.get(sequenceName);
        if (!sequence) {
            console.warn(`Sequence ${sequenceName} not found`);
            return;
        }

        this.cameraSystem.currentSequence = {
            name: sequenceName,
            sequence: sequence,
            currentStep: 0,
            elapsedTime: 0,
            totalTime: 0
        };

        console.log(`🎬 Playing sequence: ${sequenceName}`);
        this.playSequenceStep();
    }

    playSequenceStep() {
        const seq = this.cameraSystem.currentSequence;
        if (!seq || seq.currentStep >= seq.sequence.sequence.length) {
            this.cameraSystem.currentSequence = null;
            return;
        }

        const step = seq.sequence.sequence[seq.currentStep];
        this.switchToCamera(step.camera, step.transition, step.duration);

        // Schedule next step
        setTimeout(() => {
            seq.currentStep++;
            this.playSequenceStep();
        }, step.duration * 1000);
    }

    // Automated camera behaviors
    enableAutomaticSwitching(gameEvents = true) {
        this.cameraSystem.autoSwitchEnabled = true;

        if (gameEvents) {
            // Set up game event listeners
            this.setupGameEventHandlers();
        }

        // Random interesting shots every 15-30 seconds
        this.scheduleRandomShots();

        console.log('📹 Automatic camera switching enabled');
    }

    setupGameEventHandlers() {
        // These would be connected to actual game events
        this.gameEventHandlers = {
            onTouchdown: () => this.playSequence('touchdown_celebration'),
            onFieldGoal: () => this.playSequence('field_goal_attempt'),
            onInterception: () => this.switchToCamera('player_closeup', 'quick_cut'),
            onSack: () => this.switchToCamera('coach_cam', 'handheld_quick'),
            onTimeout: () => this.switchToCamera('stadium_wide', 'smooth'),
            onQuarterEnd: () => this.playSequence('stadium_intro')
        };
    }

    scheduleRandomShots() {
        if (!this.cameraSystem.autoSwitchEnabled) return;

        const delay = 15000 + Math.random() * 15000; // 15-30 seconds

        setTimeout(() => {
            if (!this.isTransitioning && !this.cameraSystem.currentSequence) {
                const cameras = ['stadium_wide', 'broadcast_main', 'dugout_angle', 'skycam'];
                const randomCamera = cameras[Math.floor(Math.random() * cameras.length)];

                if (randomCamera !== this.currentCameraMode) {
                    this.switchToCamera(randomCamera, 'smooth');
                }
            }

            this.scheduleRandomShots(); // Schedule next
        }, delay);
    }

    // Motion and effects
    addCameraShake(intensity = 1.0, duration = 1.0) {
        this.cameraSystem.shake = {
            intensity: intensity * this.params.cameraShakeIntensity,
            duration: duration,
            elapsed: 0,
            frequency: 8 + Math.random() * 4 // 8-12 Hz
        };
    }

    addHandheldJitter(camera, intensity = 1.0) {
        const cam = this.cameraSystem.virtualCameras.get(camera);
        if (cam) {
            cam.jitter.strength = intensity * this.params.handheldIntensity;
            cam.jitter.frequency = 0.5 + Math.random() * 1.5; // 0.5-2 Hz
        }
    }

    // Utility methods
    generateCircularPath(center, lookAt, steps, totalAngle) {
        const keyframes = [];
        const radius = center.distanceTo(lookAt);

        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * totalAngle;
            const position = new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                center.y,
                center.z + Math.sin(angle) * radius
            );

            keyframes.push({
                time: (i / steps) * 100, // Percentage
                position: position,
                target: lookAt.clone(),
                fov: 55
            });
        }

        return keyframes;
    }

    generateTrackingPath(duration) {
        // Generate a path that follows around the field perimeter
        const keyframes = [];
        const steps = duration * 2; // 2 keyframes per second

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const angle = progress * Math.PI * 2;

            const position = new THREE.Vector3(
                Math.cos(angle) * 120,
                15 + Math.sin(progress * Math.PI * 4) * 10, // Varying height
                Math.sin(angle) * 120
            );

            keyframes.push({
                time: progress * 100,
                position: position,
                target: new THREE.Vector3(0, 5, 0),
                fov: 45 + Math.sin(progress * Math.PI * 8) * 5 // Varying FOV
            });
        }

        return keyframes;
    }

    // Easing functions
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    easeInOutBack(t) {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;

        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    }

    // Main update loop
    update(deltaTime) {
        this.updateTransitions(deltaTime);
        this.updateCameraMotion(deltaTime);
        this.updateEffects(deltaTime);
    }

    updateTransitions(deltaTime) {
        if (!this.isTransitioning || !this.transitionSystem.currentTransition) return;

        this.transitionSystem.progress += deltaTime / this.transitionSystem.duration;

        if (this.transitionSystem.progress >= 1.0) {
            // Transition complete
            this.transitionSystem.progress = 1.0;
            this.transitionSystem.currentTransition(
                1.0,
                this.transitionSystem.fromCamera,
                this.transitionSystem.toCamera,
                this.mainCamera
            );

            this.isTransitioning = false;
            this.transitionSystem.currentTransition = null;
        } else {
            // Continue transition
            this.transitionSystem.currentTransition(
                this.transitionSystem.progress,
                this.transitionSystem.fromCamera,
                this.transitionSystem.toCamera,
                this.mainCamera
            );
        }
    }

    updateCameraMotion(deltaTime) {
        // Update virtual camera positions and targets
        this.cameraSystem.virtualCameras.forEach((cam, name) => {
            // Smooth movement towards target position
            cam.smoothPosition.lerp(cam.targetPosition, 0.05);
            cam.smoothTarget.lerp(cam.targetLookAt, 0.05);

            cam.camera.position.copy(cam.smoothPosition);
            cam.camera.lookAt(cam.smoothTarget);

            // Apply jitter for handheld effect
            if (cam.jitter.strength > 0) {
                const jitterX = (Math.random() - 0.5) * cam.jitter.strength;
                const jitterY = (Math.random() - 0.5) * cam.jitter.strength;
                const jitterZ = (Math.random() - 0.5) * cam.jitter.strength;

                cam.camera.position.x += jitterX;
                cam.camera.position.y += jitterY;
                cam.camera.position.z += jitterZ;
            }
        });

        // Update focus puller
        this.motionSystem.focusPuller.update(deltaTime);
    }

    updateEffects(deltaTime) {
        // Update camera shake
        if (this.cameraSystem.shake) {
            this.cameraSystem.shake.elapsed += deltaTime;

            if (this.cameraSystem.shake.elapsed < this.cameraSystem.shake.duration) {
                const intensity = this.cameraSystem.shake.intensity *
                                (1 - this.cameraSystem.shake.elapsed / this.cameraSystem.shake.duration);
                const frequency = this.cameraSystem.shake.frequency;

                const shakeX = Math.sin(this.cameraSystem.shake.elapsed * frequency * 2.1) * intensity;
                const shakeY = Math.sin(this.cameraSystem.shake.elapsed * frequency * 1.9) * intensity;
                const shakeZ = Math.sin(this.cameraSystem.shake.elapsed * frequency * 2.3) * intensity;

                this.mainCamera.position.x += shakeX;
                this.mainCamera.position.y += shakeY;
                this.mainCamera.position.z += shakeZ;
            } else {
                this.cameraSystem.shake = null;
            }
        }
    }

    // Control interface methods
    setCameraTarget(target) {
        this.cameraSystem.followTarget = target;

        // Update all tracking cameras to follow target
        this.cameraSystem.virtualCameras.forEach((cam, name) => {
            if (cam.type === 'follow' || cam.type === 'tracking') {
                cam.targetLookAt.copy(target);
            }
        });
    }

    setFocusTarget(distance) {
        this.motionSystem.focusPuller.setTarget(distance);
    }

    // Preset controls
    quickCutToOverview() {
        this.switchToCamera('stadium_wide', 'quick_cut', 0.1);
    }

    dramaticReveal() {
        this.switchToCamera('stadium_aerial', 'dramatic_reveal', 4.0);
    }

    goHandheld() {
        this.switchToCamera('coach_cam', 'handheld_quick', 1.0);
        this.addHandheldJitter('coach_cam', 1.5);
    }

    // Cleanup
    dispose() {
        this.cameraSystem.autoSwitchEnabled = false;

        this.cameraSystem.virtualCameras.forEach(cam => {
            // Cameras are automatically cleaned up by Three.js
        });

        this.cameraSystem.virtualCameras.clear();
    }

    // Debug information
    getDebugInfo() {
        return {
            currentCamera: this.currentCameraMode,
            isTransitioning: this.isTransitioning,
            transitionProgress: this.transitionSystem.progress,
            autoSwitchEnabled: this.cameraSystem.autoSwitchEnabled,
            activeSequence: this.cameraSystem.currentSequence?.name || 'none',
            virtualCameraCount: this.cameraSystem.virtualCameras.size
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeCinematicCameras;
}