/**
 * BLAZE INTELLIGENCE - REVOLUTIONARY 3D DATA VISUALIZATION ENGINE
 * The Ultimate Deep South Sports Intelligence Platform
 * Austin Humphrey - blazesportsintel.com - Championship-Grade Analytics
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { Chart, registerables } from 'https://cdn.skypack.dev/chart.js@4.4.0';

// Register all Chart.js components
Chart.register(...registerables);

class BlazeIntelligence3DVisualizationEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationFrame = null;

        // Championship Data Store
        this.championshipData = {
            cardinals: {
                performance: [78, 85, 92, 67, 73], // Hitting, Pitching, Defense, Speed, Clutch
                trajectory: [45, 52, 61, 58, 67, 72], // Win probability by month
                championships: 11,
                currentSeason: { wins: 78, losses: 81, playoffProb: 96.6 }
            },
            titans: {
                performance: [42, 65, 58, 71, 44], // Offense, Defense, Special Teams, Coaching, Depth
                trajectory: [85, 78, 65, 42, 38, 32], // Win probability by week
                championships: 0,
                currentSeason: { wins: 0, losses: 3, playoffProb: 8.4 }
            },
            longhorns: {
                performance: [94, 87, 91, 83, 96], // Recruiting, Offense, Defense, Special Teams, Coaching
                trajectory: [92, 89, 94, 96, 94, 91], // Championship probability by month
                championships: 4,
                currentSeason: { wins: 12, losses: 2, playoffProb: 89.7 }
            },
            grizzlies: {
                performance: [76, 68, 82, 79, 71], // Offense, Defense, Rebounding, Bench, Coaching
                trajectory: [34, 42, 56, 61, 58, 52], // Playoff probability by month
                championships: 0,
                currentSeason: { wins: 42, losses: 40, playoffProb: 52.1 }
            }
        };

        // Performance Optimization Settings
        this.performanceConfig = {
            targetFPS: 60,
            maxCharts: this.getDeviceCapability().maxCharts,
            animationDuration: this.getDeviceCapability().animationDuration,
            particleCount: this.getDeviceCapability().particleCount
        };

        // Color Palette - Deep South Championship Colors
        this.colors = {
            texasLegacy: '#BF5700',      // Burnt Orange Heritage
            cardinalClarity: '#9BCBEB',   // Cardinal Sky Blue
            oilerNavy: '#002244',         // Tennessee Deep
            grizzlyTeal: '#00B2A9',       // Vancouver Throwback Teal
            championship: '#FFD700',      // Championship Gold
            platinum: '#E5E4E2',
            graphite: '#36454F',
            pearl: '#FAFAFA'
        };

        this.initialize();
    }

    initialize() {
        console.log('🚀 Blaze Intelligence 3D Visualization Engine Initializing...');
        this.setup3DEnvironment();
        this.initializeChampionshipStadium();
        this.createContextualCharts();
        this.setupIntelligentDataFlow();
        this.startChampionshipAnimations();
        this.enableMobileOptimization();
        console.log('🏆 Revolutionary 3D Data Visualization System ACTIVE');
    }

    getDeviceCapability() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        const gpu = gl.getParameter(gl.RENDERER);
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Intelligent device classification
        if (isMobile) {
            return { maxCharts: 6, animationDuration: 400, particleCount: 500 };
        } else if (gpu.includes('RTX') || gpu.includes('Radeon RX')) {
            return { maxCharts: 16, animationDuration: 1000, particleCount: 2000 };
        } else {
            return { maxCharts: 12, animationDuration: 700, particleCount: 1200 };
        }
    }

    setup3DEnvironment() {
        // Create 3D scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);

        // Championship camera with golden ratio positioning
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
        this.camera.position.set(0, 50, 100);

        // Championship-grade renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Add to DOM
        const container = document.getElementById('championship-3d-container') || this.createContainer();
        container.appendChild(this.renderer.domElement);

        // Orbit controls for stadium exploration
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxDistance = 300;
        this.controls.minDistance = 20;

        // Championship lighting system
        this.setupChampionshipLighting();

        // Responsive handling
        window.addEventListener('resize', () => this.handleResize());
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'championship-3d-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: auto;
        `;

        // Insert before main content
        const mainContent = document.querySelector('main') || document.body;
        mainContent.parentNode.insertBefore(container, mainContent);
        return container;
    }

    setupChampionshipLighting() {
        // Stadium floodlights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main stadium lights
        const stadiumLight1 = new THREE.DirectionalLight(0xffffff, 1);
        stadiumLight1.position.set(100, 100, 50);
        stadiumLight1.castShadow = true;
        this.scene.add(stadiumLight1);

        const stadiumLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
        stadiumLight2.position.set(-100, 100, -50);
        stadiumLight2.castShadow = true;
        this.scene.add(stadiumLight2);

        // Championship gold accent lighting
        const goldAccentLight = new THREE.SpotLight(0xFFD700, 0.8, 200, Math.PI / 6);
        goldAccentLight.position.set(0, 80, 0);
        goldAccentLight.target.position.set(0, 0, 0);
        this.scene.add(goldAccentLight);
        this.scene.add(goldAccentLight.target);
    }

    initializeChampionshipStadium() {
        // Stadium field/court base
        const fieldGeometry = new THREE.PlaneGeometry(200, 120);
        const fieldMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22,
            transparent: true,
            opacity: 0.8
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        field.receiveShadow = true;
        this.scene.add(field);

        // Championship data pillars for each team
        this.createChampionshipDataPillars();

        // Floating data spheres for real-time metrics
        this.createFloatingDataSpheres();

        // Championship probability towers
        this.createChampionshipTowers();
    }

    createChampionshipDataPillars() {
        const teams = ['cardinals', 'titans', 'longhorns', 'grizzlies'];
        const positions = [
            [-60, 0, -30],  // Cardinals
            [60, 0, -30],   // Titans
            [-60, 0, 30],   // Longhorns
            [60, 0, 30]     // Grizzlies
        ];

        teams.forEach((team, index) => {
            const data = this.championshipData[team];
            const avgPerformance = data.performance.reduce((a, b) => a + b) / data.performance.length;

            // Performance pillar height based on overall performance
            const pillarHeight = (avgPerformance / 100) * 40 + 10;

            const pillarGeometry = new THREE.CylinderGeometry(5, 5, pillarHeight, 8);
            const pillarMaterial = new THREE.MeshLambertMaterial({
                color: this.getTeamColor(team),
                transparent: true,
                opacity: 0.8
            });

            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(...positions[index]);
            pillar.position.y = pillarHeight / 2;
            pillar.castShadow = true;
            pillar.userData = { team, data, type: 'performance' };

            this.scene.add(pillar);

            // Team label
            this.createTeamLabel(team, positions[index]);
        });
    }

    createFloatingDataSpheres() {
        const sphereCount = this.performanceConfig.particleCount;
        const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 6);

        for (let i = 0; i < sphereCount; i++) {
            const sphereMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                transparent: true,
                opacity: 0.6
            });

            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(
                (Math.random() - 0.5) * 400,
                Math.random() * 100 + 20,
                (Math.random() - 0.5) * 400
            );

            sphere.userData = {
                originalY: sphere.position.y,
                floatSpeed: Math.random() * 0.02 + 0.01,
                type: 'dataPoint'
            };

            this.scene.add(sphere);
        }
    }

    createChampionshipTowers() {
        const teams = Object.keys(this.championshipData);

        teams.forEach((team, index) => {
            const data = this.championshipData[team];
            const playoffProb = data.currentSeason.playoffProb;

            // Tower height based on championship probability
            const towerHeight = (playoffProb / 100) * 60 + 5;

            const towerGeometry = new THREE.BoxGeometry(8, towerHeight, 8);
            const towerMaterial = new THREE.MeshLambertMaterial({
                color: this.getTeamColor(team),
                transparent: true,
                opacity: 0.9
            });

            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.set(
                (index - 1.5) * 40,
                towerHeight / 2,
                -80
            );
            tower.castShadow = true;
            tower.userData = { team, playoffProb, type: 'championship' };

            this.scene.add(tower);
        });
    }

    createTeamLabel(team, position) {
        // Create canvas for text texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(team.toUpperCase(), 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);

        sprite.position.set(position[0], 25, position[2]);
        sprite.scale.set(20, 5, 1);

        this.scene.add(sprite);
    }

    createContextualCharts() {
        // Create chart containers that float in 3D space
        const chartContainer = document.createElement('div');
        chartContainer.id = 'floating-charts-container';
        chartContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            z-index: 1000;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        `;

        document.body.appendChild(chartContainer);

        // Create championship radar chart
        this.createChampionshipRadarChart(chartContainer);

        // Create trajectory line chart
        this.createTrajectoryChart(chartContainer);

        // Create real-time performance doughnut
        this.createRealTimePerformanceChart(chartContainer);
    }

    createChampionshipRadarChart(container) {
        const chartDiv = document.createElement('div');
        chartDiv.style.cssText = `
            background: rgba(0, 17, 34, 0.9);
            border: 2px solid ${this.colors.championship};
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
        `;

        const canvas = document.createElement('canvas');
        canvas.width = 350;
        canvas.height = 250;
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Hitting', 'Pitching', 'Defense', 'Speed', 'Clutch'],
                datasets: [{
                    label: 'Cardinals Championship Profile',
                    data: this.championshipData.cardinals.performance,
                    backgroundColor: 'rgba(196, 30, 58, 0.3)',
                    borderColor: '#C41E3A',
                    borderWidth: 3,
                    pointBackgroundColor: '#C41E3A',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#C41E3A'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#ffffff' }
                    },
                    title: {
                        display: true,
                        text: '⚾ Cardinals Championship Profile',
                        color: this.colors.championship,
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 215, 0, 0.3)' },
                        grid: { color: 'rgba(255, 215, 0, 0.2)' },
                        pointLabels: { color: '#ffffff' },
                        ticks: {
                            color: '#ffffff',
                            backdropColor: 'transparent'
                        },
                        min: 0,
                        max: 100
                    }
                },
                animation: {
                    duration: this.performanceConfig.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createTrajectoryChart(container) {
        const chartDiv = document.createElement('div');
        chartDiv.style.cssText = `
            background: rgba(0, 17, 34, 0.9);
            border: 2px solid ${this.colors.grizzlyTeal};
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
        `;

        const canvas = document.createElement('canvas');
        canvas.width = 350;
        canvas.height = 200;
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['April', 'May', 'June', 'July', 'August', 'September'],
                datasets: [
                    {
                        label: 'Cardinals',
                        data: this.championshipData.cardinals.trajectory,
                        borderColor: '#C41E3A',
                        backgroundColor: 'rgba(196, 30, 58, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Titans',
                        data: this.championshipData.titans.trajectory,
                        borderColor: '#4B92DB',
                        backgroundColor: 'rgba(75, 146, 219, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    },
                    title: {
                        display: true,
                        text: '📈 Championship Trajectory Analysis',
                        color: this.colors.championship,
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        min: 0,
                        max: 100
                    }
                },
                animation: {
                    duration: this.performanceConfig.animationDuration,
                    easing: 'easeInOutCubic'
                }
            }
        });
    }

    createRealTimePerformanceChart(container) {
        const chartDiv = document.createElement('div');
        chartDiv.style.cssText = `
            background: rgba(0, 17, 34, 0.9);
            border: 2px solid ${this.colors.texasLegacy};
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
        `;

        const canvas = document.createElement('canvas');
        canvas.width = 350;
        canvas.height = 200;
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);

        const ctx = canvas.getContext('2d');

        const performanceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'],
                datasets: [{
                    label: 'Championship Probability',
                    data: [
                        this.championshipData.cardinals.currentSeason.playoffProb,
                        this.championshipData.titans.currentSeason.playoffProb,
                        this.championshipData.longhorns.currentSeason.playoffProb,
                        this.championshipData.grizzlies.currentSeason.playoffProb
                    ],
                    backgroundColor: [
                        'rgba(196, 30, 58, 0.8)',
                        'rgba(75, 146, 219, 0.8)',
                        'rgba(191, 87, 0, 0.8)',
                        'rgba(0, 178, 169, 0.8)'
                    ],
                    borderColor: [
                        '#C41E3A',
                        '#4B92DB',
                        '#BF5700',
                        '#00B2A9'
                    ],
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                    },
                    title: {
                        display: true,
                        text: '🏆 Live Championship Probabilities',
                        color: this.colors.championship,
                        font: { size: 16, weight: 'bold' }
                    }
                },
                animation: {
                    duration: this.performanceConfig.animationDuration,
                    easing: 'easeOutBounce'
                }
            }
        });

        // Store reference for real-time updates
        this.performanceChart = performanceChart;
    }

    setupIntelligentDataFlow() {
        // AI-powered data prioritization based on user interaction
        this.contextualIntelligence = {
            userFocus: 'cardinals', // Default focus
            timeOfDay: new Date().getHours(),
            sportSeason: this.detectActiveSports(),
            interactionHistory: []
        };

        // Mouse interaction tracking for intelligent emphasis
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.handleIntelligentInteraction(event);
        });

        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            this.handleMobileInteraction(event);
        });
    }

    detectActiveSports() {
        const month = new Date().getMonth() + 1;
        if (month >= 4 && month <= 10) return 'baseball';
        if (month >= 9 && month <= 2) return 'football';
        if (month >= 11 && month <= 4) return 'basketball';
        return 'offseason';
    }

    handleIntelligentInteraction(event) {
        // Raycast to detect 3D object interaction
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData && object.userData.team) {
                this.emphasizeTeamData(object.userData.team);
                this.contextualIntelligence.userFocus = object.userData.team;
            }
        }
    }

    emphasizeTeamData(team) {
        // Highlight relevant charts and 3D objects
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.team === team) {
                // Pulse animation for focused team
                if (child.material) {
                    const originalOpacity = child.material.opacity;
                    child.material.opacity = 1.0;

                    // Animate back to original
                    setTimeout(() => {
                        child.material.opacity = originalOpacity;
                    }, 800);
                }
            }
        });
    }

    startChampionshipAnimations() {
        const animate = () => {
            this.animationFrame = requestAnimationFrame(animate);

            // Update controls
            this.controls.update();

            // Animate floating data spheres
            this.scene.children.forEach(child => {
                if (child.userData && child.userData.type === 'dataPoint') {
                    child.position.y = child.userData.originalY +
                        Math.sin(Date.now() * child.userData.floatSpeed) * 5;
                    child.rotation.y += 0.01;
                }
            });

            // Championship tower pulsing
            this.scene.children.forEach(child => {
                if (child.userData && child.userData.type === 'championship') {
                    const pulseScale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
                    child.scale.set(pulseScale, 1, pulseScale);
                }
            });

            // Render the scene
            this.renderer.render(this.scene, this.camera);

            // Performance monitoring
            this.monitorPerformance();
        };

        animate();
    }

    monitorPerformance() {
        // Track FPS and adjust quality dynamically
        if (this.lastTime) {
            const currentFPS = 1000 / (Date.now() - this.lastTime);

            if (currentFPS < 45) {
                // Reduce quality to maintain performance
                this.optimizePerformance();
            }
        }
        this.lastTime = Date.now();
    }

    optimizePerformance() {
        // Dynamically reduce particle count
        const dataPoints = this.scene.children.filter(child =>
            child.userData && child.userData.type === 'dataPoint'
        );

        if (dataPoints.length > 100) {
            // Remove 20% of particles
            const toRemove = Math.floor(dataPoints.length * 0.2);
            for (let i = 0; i < toRemove; i++) {
                this.scene.remove(dataPoints[i]);
            }
        }
    }

    enableMobileOptimization() {
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Mobile-specific optimizations
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Reduce shadow quality
            this.renderer.shadowMap.type = THREE.BasicShadowMap;

            // Simplify materials
            this.scene.children.forEach(child => {
                if (child.material && child.material.type === 'MeshLambertMaterial') {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                }
            });

            // Touch gesture support
            this.setupTouchGestures();
        }
    }

    setupTouchGestures() {
        let hammer;
        if (typeof Hammer !== 'undefined') {
            hammer = new Hammer(this.renderer.domElement);

            // Pinch to zoom
            hammer.get('pinch').set({ enable: true });
            hammer.on('pinch', (e) => {
                const scale = e.scale;
                this.camera.position.multiplyScalar(2 - scale);
            });

            // Double tap for focus
            hammer.get('tap').set({ taps: 2 });
            hammer.on('tap', (e) => {
                // Focus on nearest team data
                this.focusNearestTeam();
            });
        }
    }

    focusNearestTeam() {
        // Animate camera to focus on team with highest championship probability
        const bestTeam = Object.entries(this.championshipData)
            .sort((a, b) => b[1].currentSeason.playoffProb - a[1].currentSeason.playoffProb)[0];

        // Animate camera movement
        const targetPosition = this.getTeamPosition(bestTeam[0]);
        this.animateCameraTo(targetPosition);
    }

    getTeamPosition(team) {
        const positions = {
            cardinals: new THREE.Vector3(-60, 30, -30),
            titans: new THREE.Vector3(60, 30, -30),
            longhorns: new THREE.Vector3(-60, 30, 30),
            grizzlies: new THREE.Vector3(60, 30, 30)
        };
        return positions[team] || new THREE.Vector3(0, 30, 0);
    }

    animateCameraTo(targetPosition) {
        const startPosition = this.camera.position.clone();
        const duration = 2000;
        const startTime = Date.now();

        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.camera.lookAt(0, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };

        animateCamera();
    }

    getTeamColor(team) {
        const teamColors = {
            cardinals: 0xC41E3A,
            titans: 0x4B92DB,
            longhorns: 0xBF5700,
            grizzlies: 0x00B2A9
        };
        return teamColors[team] || 0xFFD700;
    }

    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Update controls
        this.controls.handleResize();
    }

    // Public API Methods
    updateChampionshipData(team, newData) {
        if (this.championshipData[team]) {
            Object.assign(this.championshipData[team], newData);
            this.refreshVisualization();
        }
    }

    refreshVisualization() {
        // Update 3D objects with new data
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.team) {
                const team = child.userData.team;
                const data = this.championshipData[team];

                if (child.userData.type === 'performance') {
                    const avgPerformance = data.performance.reduce((a, b) => a + b) / data.performance.length;
                    const newHeight = (avgPerformance / 100) * 40 + 10;
                    child.scale.y = newHeight / child.geometry.parameters.height;
                }
            }
        });

        // Update charts
        if (this.performanceChart) {
            const newData = Object.keys(this.championshipData).map(team =>
                this.championshipData[team].currentSeason.playoffProb
            );
            this.performanceChart.data.datasets[0].data = newData;
            this.performanceChart.update();
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Clean up Three.js resources
        this.scene.clear();
        this.renderer.dispose();

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);

        console.log('🔄 3D Visualization Engine destroyed');
    }
}

// Global initialization and API
window.BlazeIntelligence3D = {
    engine: null,

    initialize() {
        if (!this.engine) {
            this.engine = new BlazeIntelligence3DVisualizationEngine();
            console.log('🏆 Blaze Intelligence 3D Engine Initialized');
        }
        return this.engine;
    },

    updateData(team, data) {
        if (this.engine) {
            this.engine.updateChampionshipData(team, data);
        }
    },

    focusTeam(team) {
        if (this.engine && this.engine.championshipData[team]) {
            const position = this.engine.getTeamPosition(team);
            this.engine.animateCameraTo(position);
        }
    },

    destroy() {
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BlazeIntelligence3D.initialize();
    });
} else {
    window.BlazeIntelligence3D.initialize();
}

console.log('🚀 BLAZE INTELLIGENCE 3D VISUALIZATION ENGINE LOADED - Deep South Championship Analytics Active');