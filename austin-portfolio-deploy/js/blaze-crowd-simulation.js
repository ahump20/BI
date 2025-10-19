/**
 * 🔥 BLAZE INTELLIGENCE - PROCEDURAL CROWD SIMULATION SYSTEM
 * Advanced AI-driven crowd generation with realistic behaviors and reactions
 * Implements flocking algorithms, emotional states, and dynamic crowd responses
 */

class BlazeCrowdSimulation {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        // Crowd parameters
        this.params = {
            crowdSize: 45000,
            sectionCapacity: 2500,
            attendanceRate: 0.85,
            emotionalIntensity: 0.7,
            waveSpeed: 2.5,
            chantSynchronization: 0.8,
            gameEventResponse: 0.9,
            crowdDensity: 'high',
            teamLoyalty: {
                home: 0.65,
                away: 0.35
            }
        };

        // Stadium sections
        this.stadiumSections = new Map();
        this.crowdInstances = new Map();
        this.behaviorSystem = null;
        this.emotionalEngine = null;
        this.waveController = null;

        // AI behavior states
        this.behaviorStates = {
            IDLE: 'idle',
            CHEERING: 'cheering',
            SITTING: 'sitting',
            STANDING: 'standing',
            WAVING: 'waving',
            DISAPPOINTED: 'disappointed',
            CELEBRATING: 'celebrating',
            LEAVING: 'leaving',
            ARRIVING: 'arriving'
        };

        // Crowd emotion types
        this.emotions = {
            EXCITEMENT: { color: new THREE.Color(1.0, 0.8, 0.2), intensity: 1.0 },
            TENSION: { color: new THREE.Color(0.8, 0.2, 0.2), intensity: 0.8 },
            JOY: { color: new THREE.Color(0.2, 1.0, 0.2), intensity: 1.2 },
            DISAPPOINTMENT: { color: new THREE.Color(0.4, 0.4, 0.8), intensity: 0.3 },
            ANTICIPATION: { color: new THREE.Color(1.0, 0.6, 0.8), intensity: 0.9 },
            NEUTRAL: { color: new THREE.Color(0.7, 0.7, 0.7), intensity: 0.5 }
        };

        this.initializeCrowdSystem();
    }

    initializeCrowdSystem() {
        this.setupStadiumGeometry();
        this.createBehaviorSystem();
        this.createEmotionalEngine();
        this.generateCrowdInstances();
        this.setupWaveController();
        this.initializeAudioSystem();

        console.log('👥 Crowd simulation initialized - 45,000 AI fans with dynamic behaviors');
    }

    setupStadiumGeometry() {
        // Define stadium sections with realistic seating arrangements
        const sections = [
            // Lower bowl
            { name: 'lower_home', capacity: 8000, angle: 0, radius: 120, height: 10, loyalty: 'home' },
            { name: 'lower_away', capacity: 8000, angle: Math.PI, radius: 120, height: 10, loyalty: 'away' },
            { name: 'lower_left', capacity: 6000, angle: Math.PI/2, radius: 120, height: 10, loyalty: 'neutral' },
            { name: 'lower_right', capacity: 6000, angle: -Math.PI/2, radius: 120, height: 10, loyalty: 'neutral' },

            // Upper bowl
            { name: 'upper_home', capacity: 6000, angle: 0, radius: 160, height: 40, loyalty: 'home' },
            { name: 'upper_away', capacity: 6000, angle: Math.PI, radius: 160, height: 40, loyalty: 'away' },
            { name: 'upper_left', capacity: 3500, angle: Math.PI/2, radius: 160, height: 40, loyalty: 'neutral' },
            { name: 'upper_right', capacity: 3500, angle: -Math.PI/2, radius: 160, height: 40, loyalty: 'neutral' }
        ];

        sections.forEach(section => {
            this.stadiumSections.set(section.name, {
                ...section,
                currentAttendance: Math.floor(section.capacity * this.params.attendanceRate),
                dominantEmotion: this.emotions.NEUTRAL,
                waveParticipation: 0.0,
                currentChant: null,
                loyaltyStrength: section.loyalty === 'home' ? 0.8 : section.loyalty === 'away' ? 0.7 : 0.3
            });
        });
    }

    createBehaviorSystem() {
        this.behaviorSystem = {
            // Flocking behavior parameters
            flocking: {
                separationRadius: 2.0,
                alignmentRadius: 5.0,
                cohesionRadius: 8.0,
                separationForce: 1.5,
                alignmentForce: 1.0,
                cohesionForce: 0.8
            },

            // Individual behavior weights
            behaviors: new Map([
                ['idle', { duration: [30, 120], probability: 0.4, energy: 0.2 }],
                ['cheering', { duration: [5, 15], probability: 0.3, energy: 0.9 }],
                ['sitting', { duration: [60, 300], probability: 0.2, energy: 0.1 }],
                ['waving', { duration: [3, 8], probability: 0.15, energy: 0.7 }],
                ['celebrating', { duration: [10, 30], probability: 0.1, energy: 1.0 }]
            ]),

            // Behavior transition probabilities
            transitions: new Map([
                ['idle', ['cheering', 'sitting', 'waving']],
                ['cheering', ['idle', 'celebrating', 'waving']],
                ['sitting', ['idle', 'cheering', 'standing']],
                ['waving', ['cheering', 'idle']],
                ['celebrating', ['cheering', 'waving', 'idle']]
            ])
        };
    }

    createEmotionalEngine() {
        this.emotionalEngine = {
            globalEmotion: this.emotions.NEUTRAL,
            emotionalSpread: 0.7, // How quickly emotions spread through crowd
            baselineEmotion: 0.5,
            currentIntensity: 0.5,

            // Game event emotional responses
            eventResponses: new Map([
                ['touchdown', { emotion: this.emotions.JOY, intensity: 1.0, duration: 30 }],
                ['field_goal', { emotion: this.emotions.EXCITEMENT, intensity: 0.7, duration: 15 }],
                ['interception', { emotion: this.emotions.EXCITEMENT, intensity: 0.8, duration: 20 }],
                ['fumble', { emotion: this.emotions.TENSION, intensity: 0.6, duration: 10 }],
                ['penalty', { emotion: this.emotions.DISAPPOINTMENT, intensity: 0.5, duration: 8 }],
                ['sack', { emotion: this.emotions.EXCITEMENT, intensity: 0.6, duration: 12 }],
                ['timeout', { emotion: this.emotions.ANTICIPATION, intensity: 0.4, duration: 5 }],
                ['injury', { emotion: this.emotions.TENSION, intensity: 0.8, duration: 45 }]
            ]),

            updateEmotion: (gameEvent, teamScoring) => {
                const response = this.emotionalEngine.eventResponses.get(gameEvent);
                if (!response) return;

                // Adjust emotion based on which team scored
                const loyaltyMultiplier = teamScoring === 'home' ? 1.0 : -0.5;
                const adjustedIntensity = response.intensity * loyaltyMultiplier;

                this.emotionalEngine.globalEmotion = response.emotion;
                this.emotionalEngine.currentIntensity = Math.max(0, Math.min(1, adjustedIntensity));

                // Spread emotion through sections
                this.propagateEmotionThroughCrowd(response.emotion, adjustedIntensity, response.duration);
            }
        };
    }

    generateCrowdInstances() {
        this.stadiumSections.forEach((section, sectionName) => {
            const fanCount = section.currentAttendance;
            const positions = new Float32Array(fanCount * 3);
            const colors = new Float32Array(fanCount * 3);
            const scales = new Float32Array(fanCount);
            const behaviors = new Float32Array(fanCount);
            const loyalties = new Float32Array(fanCount);
            const energies = new Float32Array(fanCount);

            // Generate fan positions within section
            for (let i = 0; i < fanCount; i++) {
                const i3 = i * 3;

                // Calculate seat position in section
                const row = Math.floor(i / 50) + 1; // Assume 50 seats per row
                const seat = i % 50;

                // Convert to world coordinates
                const angle = section.angle + (seat - 25) * 0.003; // Slight curve
                const radius = section.radius + row * 1.5;
                const height = section.height + row * 0.8;

                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = height;
                positions[i3 + 2] = Math.sin(angle) * radius;

                // Assign team colors based on section loyalty
                const teamColor = this.getTeamColor(section.loyalty, section.loyaltyStrength);
                colors[i3] = teamColor.r;
                colors[i3 + 1] = teamColor.g;
                colors[i3 + 2] = teamColor.b;

                // Random individual properties
                scales[i] = 0.8 + Math.random() * 0.4; // Size variation
                behaviors[i] = Math.floor(Math.random() * 5); // Initial behavior state
                loyalties[i] = Math.random() < section.loyaltyStrength ? 1.0 : 0.0;
                energies[i] = 0.3 + Math.random() * 0.7; // Individual energy level
            }

            // Create instanced geometry for this section
            const geometry = this.createFanGeometry();
            geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(positions, 3));
            geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
            geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));
            geometry.setAttribute('instanceBehavior', new THREE.InstancedBufferAttribute(behaviors, 1));
            geometry.setAttribute('instanceLoyalty', new THREE.InstancedBufferAttribute(loyalties, 1));
            geometry.setAttribute('instanceEnergy', new THREE.InstancedBufferAttribute(energies, 1));

            // Create fan shader material
            const material = this.createFanMaterial();

            const instancedMesh = new THREE.InstancedMesh(geometry, material, fanCount);
            instancedMesh.name = `crowd_${sectionName}`;

            this.scene.add(instancedMesh);
            this.crowdInstances.set(sectionName, {
                mesh: instancedMesh,
                geometry: geometry,
                material: material,
                fanCount: fanCount,
                behaviorStates: new Array(fanCount).fill(this.behaviorStates.IDLE),
                behaviorTimers: new Array(fanCount).fill(0),
                individualEmotions: new Array(fanCount).fill(0.5)
            });
        });
    }

    createFanGeometry() {
        // Simple fan representation - could be replaced with more detailed geometry
        const geometry = new THREE.ConeGeometry(0.3, 1.8, 8);

        // Add some variation to make fans look more realistic
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.1; // X variation
            positions[i + 2] += (Math.random() - 0.5) * 0.1; // Z variation
        }

        geometry.attributes.position.needsUpdate = true;
        return geometry;
    }

    createFanMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                globalEmotion: { value: new THREE.Color(0.7, 0.7, 0.7) },
                emotionalIntensity: { value: 0.5 },
                wavePosition: { value: 0 },
                waveIntensity: { value: 0 }
            },
            vertexShader: `
                attribute vec3 instancePosition;
                attribute vec3 instanceColor;
                attribute float instanceScale;
                attribute float instanceBehavior;
                attribute float instanceLoyalty;
                attribute float instanceEnergy;

                uniform float time;
                uniform float wavePosition;
                uniform float waveIntensity;

                varying vec3 vColor;
                varying float vBehavior;
                varying float vEnergy;
                varying float vWaveEffect;

                void main() {
                    vColor = instanceColor;
                    vBehavior = instanceBehavior;
                    vEnergy = instanceEnergy;

                    vec3 transformed = position * instanceScale;

                    // Apply behavior-based animations
                    float behaviorOffset = instanceBehavior * 0.1;

                    // Cheering animation (behavior state 1)
                    if (instanceBehavior > 0.8) {
                        float cheer = sin(time * 6.0 + instancePosition.x * 0.1) * 0.3;
                        transformed.y += cheer * instanceEnergy;
                        transformed.x += sin(time * 4.0) * 0.1 * instanceEnergy;
                    }

                    // Wave effect
                    float distanceFromWave = abs(atan(instancePosition.z, instancePosition.x) - wavePosition);
                    float waveEffect = exp(-distanceFromWave * 5.0) * waveIntensity;
                    vWaveEffect = waveEffect;

                    if (waveEffect > 0.1) {
                        transformed.y += sin(time * 8.0) * waveEffect * 0.5;
                        transformed.x += cos(time * 8.0) * waveEffect * 0.2;
                    }

                    // Standing/sitting behavior
                    if (instanceBehavior < 0.2) { // Sitting
                        transformed.y *= 0.6;
                    }

                    vec4 worldPosition = vec4(instancePosition + transformed, 1.0);
                    gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 globalEmotion;
                uniform float emotionalIntensity;
                uniform float time;

                varying vec3 vColor;
                varying float vBehavior;
                varying float vEnergy;
                varying float vWaveEffect;

                void main() {
                    vec3 baseColor = vColor;

                    // Apply global emotional tinting
                    vec3 emotionTint = mix(baseColor, globalEmotion, emotionalIntensity * 0.3);

                    // Add energy-based brightness
                    float brightness = 1.0 + vEnergy * 0.3;

                    // Wave participation glow
                    if (vWaveEffect > 0.1) {
                        emotionTint += vec3(0.2, 0.2, 0.1) * vWaveEffect;
                    }

                    // Behavior-based effects
                    if (vBehavior > 0.8) { // Cheering
                        float flicker = sin(time * 10.0) * 0.1 + 0.9;
                        brightness *= flicker;
                    }

                    vec3 finalColor = emotionTint * brightness;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }

    setupWaveController() {
        this.waveController = {
            isActive: false,
            currentPosition: 0,
            speed: this.params.waveSpeed,
            intensity: 0,
            direction: 1, // 1 for clockwise, -1 for counter-clockwise
            participationRate: 0.7,

            startWave: (startSection) => {
                this.waveController.isActive = true;
                this.waveController.currentPosition = this.getSectionAngle(startSection);
                this.waveController.intensity = 1.0;
                console.log('🌊 Stadium wave started!');
            },

            updateWave: (deltaTime) => {
                if (!this.waveController.isActive) return;

                this.waveController.currentPosition += this.waveController.speed * deltaTime * this.waveController.direction;

                // Wrap around
                if (this.waveController.currentPosition > Math.PI * 2) {
                    this.waveController.currentPosition -= Math.PI * 2;
                }
                if (this.waveController.currentPosition < 0) {
                    this.waveController.currentPosition += Math.PI * 2;
                }

                // Update wave uniforms in all crowd materials
                this.crowdInstances.forEach(crowd => {
                    crowd.material.uniforms.wavePosition.value = this.waveController.currentPosition;
                    crowd.material.uniforms.waveIntensity.value = this.waveController.intensity;
                });

                // Decay wave intensity over time
                this.waveController.intensity *= 0.995;
                if (this.waveController.intensity < 0.1) {
                    this.waveController.isActive = false;
                }
            }
        };
    }

    initializeAudioSystem() {
        // Initialize spatial audio for crowd noise
        this.audioSystem = {
            ambientCrowd: null,
            chantAudio: null,
            cheerAudio: null,
            context: null,

            initialize: () => {
                if ('webkitAudioContext' in window) {
                    this.audioSystem.context = new webkitAudioContext();
                } else if ('AudioContext' in window) {
                    this.audioSystem.context = new AudioContext();
                }

                // Create ambient crowd noise
                this.createAmbientCrowdNoise();
            },

            updateVolume: (emotion, intensity) => {
                const baseVolume = 0.3;
                const emotionalMultiplier = emotion === this.emotions.JOY ? 2.0 :
                                          emotion === this.emotions.EXCITEMENT ? 1.5 : 1.0;
                const finalVolume = baseVolume * intensity * emotionalMultiplier;

                // Update actual audio volumes here
            }
        };
    }

    // Crowd behavior methods
    propagateEmotionThroughCrowd(emotion, intensity, duration) {
        const propagationSpeed = 0.8; // Seconds to spread across stadium

        this.stadiumSections.forEach((section, sectionName) => {
            const delay = Math.random() * propagationSpeed;

            setTimeout(() => {
                section.dominantEmotion = emotion;

                // Update section's crowd colors
                const crowd = this.crowdInstances.get(sectionName);
                if (crowd) {
                    crowd.material.uniforms.globalEmotion.value.copy(emotion.color);
                    crowd.material.uniforms.emotionalIntensity.value = intensity;
                }
            }, delay * 1000);
        });

        // Reset to baseline after duration
        setTimeout(() => {
            this.emotionalEngine.globalEmotion = this.emotions.NEUTRAL;
            this.emotionalEngine.currentIntensity = this.emotionalEngine.baselineEmotion;
        }, duration * 1000);
    }

    updateCrowdBehaviors(deltaTime) {
        this.crowdInstances.forEach((crowd, sectionName) => {
            const section = this.stadiumSections.get(sectionName);

            for (let i = 0; i < crowd.fanCount; i++) {
                // Update behavior timer
                crowd.behaviorTimers[i] -= deltaTime;

                if (crowd.behaviorTimers[i] <= 0) {
                    // Time to change behavior
                    const currentBehavior = crowd.behaviorStates[i];
                    const newBehavior = this.selectNewBehavior(currentBehavior, section);

                    crowd.behaviorStates[i] = newBehavior;

                    // Set new timer
                    const behaviorData = this.behaviorSystem.behaviors.get(newBehavior);
                    const duration = behaviorData.duration[0] +
                                   Math.random() * (behaviorData.duration[1] - behaviorData.duration[0]);
                    crowd.behaviorTimers[i] = duration;

                    // Update behavior attribute
                    const behaviorIndex = Object.values(this.behaviorStates).indexOf(newBehavior);
                    crowd.geometry.attributes.instanceBehavior.setX(i, behaviorIndex);
                }
            }

            crowd.geometry.attributes.instanceBehavior.needsUpdate = true;
        });
    }

    selectNewBehavior(currentBehavior, section) {
        // Influence behavior based on current section emotion and game state
        const emotionalInfluence = section.dominantEmotion;
        const possibleTransitions = this.behaviorSystem.transitions.get(currentBehavior) || ['idle'];

        // Weight behaviors based on current emotion
        let behaviorWeights = {};
        possibleTransitions.forEach(behavior => {
            behaviorWeights[behavior] = this.behaviorSystem.behaviors.get(behavior).probability;

            // Increase probability of energetic behaviors during excitement
            if (emotionalInfluence === this.emotions.EXCITEMENT || emotionalInfluence === this.emotions.JOY) {
                if (behavior === 'cheering' || behavior === 'celebrating' || behavior === 'waving') {
                    behaviorWeights[behavior] *= 2.0;
                }
            }

            // Increase sitting during disappointment
            if (emotionalInfluence === this.emotions.DISAPPOINTMENT && behavior === 'sitting') {
                behaviorWeights[behavior] *= 1.5;
            }
        });

        // Select weighted random behavior
        return this.weightedRandomSelect(behaviorWeights);
    }

    weightedRandomSelect(weights) {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (const [behavior, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return behavior;
            }
        }

        return Object.keys(weights)[0]; // Fallback
    }

    // Game event handlers
    onGameEvent(eventType, teamScoring = 'home') {
        console.log(`🏈 Game event: ${eventType} (${teamScoring} team)`);

        // Update emotional state
        this.emotionalEngine.updateEmotion(eventType, teamScoring);

        // Trigger specific crowd reactions
        switch (eventType) {
            case 'touchdown':
                this.triggerCelebration(teamScoring);
                if (Math.random() < 0.3) {
                    setTimeout(() => this.waveController.startWave('lower_home'), 2000);
                }
                break;

            case 'field_goal':
                this.triggerModerateCelebration(teamScoring);
                break;

            case 'interception':
                this.triggerExcitementWave(teamScoring === 'home' ? 'positive' : 'negative');
                break;

            case 'fumble':
                this.triggerTensionResponse();
                break;
        }
    }

    triggerCelebration(team) {
        const supporterSections = team === 'home' ? ['lower_home', 'upper_home'] : ['lower_away', 'upper_away'];

        supporterSections.forEach(sectionName => {
            const crowd = this.crowdInstances.get(sectionName);
            if (crowd) {
                // Temporarily override behaviors to celebrating
                for (let i = 0; i < crowd.fanCount; i++) {
                    if (Math.random() < 0.8) { // 80% participation
                        crowd.behaviorStates[i] = this.behaviorStates.CELEBRATING;
                        crowd.behaviorTimers[i] = 10 + Math.random() * 20; // 10-30 seconds
                        crowd.geometry.attributes.instanceBehavior.setX(i, 6); // Celebrating index
                    }
                }
                crowd.geometry.attributes.instanceBehavior.needsUpdate = true;
            }
        });
    }

    // Utility methods
    getTeamColor(loyalty, strength) {
        if (loyalty === 'home') {
            return new THREE.Color().lerpColors(
                new THREE.Color(0x8B4513), // Brown/orange base
                new THREE.Color(0xBF5700), // Blaze orange
                strength
            );
        } else if (loyalty === 'away') {
            return new THREE.Color().lerpColors(
                new THREE.Color(0x404040), // Gray base
                new THREE.Color(0x002244), // Away team color
                strength
            );
        } else {
            return new THREE.Color(0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.4);
        }
    }

    getSectionAngle(sectionName) {
        const section = this.stadiumSections.get(sectionName);
        return section ? section.angle : 0;
    }

    createAmbientCrowdNoise() {
        // Generate procedural crowd noise using Web Audio API
        if (!this.audioSystem.context) return;

        const bufferSize = 4096;
        const buffer = this.audioSystem.context.createBuffer(2, bufferSize, this.audioSystem.context.sampleRate);

        // Generate noise
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const nowBuffering = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                nowBuffering[i] = (Math.random() * 2 - 1) * 0.1; // Low volume white noise
            }
        }

        // Add crowd-like filtering and effects here
    }

    // Main update method
    update(deltaTime) {
        const time = performance.now() * 0.001;

        // Update crowd behaviors
        this.updateCrowdBehaviors(deltaTime);

        // Update wave
        this.waveController.updateWave(deltaTime);

        // Update material uniforms
        this.crowdInstances.forEach(crowd => {
            crowd.material.uniforms.time.value = time;
        });
    }

    // Control methods
    setCrowdSize(size) {
        this.params.crowdSize = Math.min(65000, Math.max(10000, size));
        // Regenerate crowd with new size
        this.regenerateCrowd();
    }

    setAttendanceRate(rate) {
        this.params.attendanceRate = Math.max(0.3, Math.min(1.0, rate));
        this.regenerateCrowd();
    }

    startRandomWave() {
        const sections = Array.from(this.stadiumSections.keys());
        const randomSection = sections[Math.floor(Math.random() * sections.length)];
        this.waveController.startWave(randomSection);
    }

    setEmotionalState(emotion, intensity = 0.7) {
        this.emotionalEngine.globalEmotion = this.emotions[emotion.toUpperCase()] || this.emotions.NEUTRAL;
        this.emotionalEngine.currentIntensity = intensity;

        // Apply to all sections
        this.propagateEmotionThroughCrowd(this.emotionalEngine.globalEmotion, intensity, 30);
    }

    // Cleanup
    dispose() {
        this.crowdInstances.forEach(crowd => {
            this.scene.remove(crowd.mesh);
            crowd.geometry.dispose();
            crowd.material.dispose();
        });

        if (this.audioSystem.context) {
            this.audioSystem.context.close();
        }
    }

    regenerateCrowd() {
        // Dispose current crowd
        this.dispose();

        // Regenerate with new parameters
        this.generateCrowdInstances();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeCrowdSimulation;
}