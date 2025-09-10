/**
 * BLAZE INTELLIGENCE - AR OVERLAY SYSTEM
 * Advanced augmented reality overlay for live game analysis
 * Features: WebXR, player tracking, real-time analytics overlay, performance visualization
 * Supports: Cardinals, Titans, Longhorns, Grizzlies live game enhancement
 */

import * as THREE from 'three';
import { BlazeSportsPipeline } from './blaze-sports-pipeline-enhanced.js';
import { BlazeVisionAI } from './blaze-vision-ai-enhanced.js';

export class BlazeAROverlay {
  constructor(config = {}) {
    this.config = {
      enablePlayerTracking: true,
      enableStatsOverlay: true,
      enablePredictions: true,
      enableBiometrics: true,
      trackingAccuracy: 0.9,
      overlayOpacity: 0.8,
      updateFrequency: 30, // Hz
      maxPlayers: 22, // Football field max
      sport: 'auto', // 'baseball', 'football', 'basketball', 'auto'
      ...config
    };

    // Core systems
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.xrSession = null;
    this.frame = null;

    // AR tracking
    this.playerTrackers = new Map();
    this.ballTracker = null;
    this.fieldGeometry = null;
    this.coordinateSystem = null;

    // Data sources
    this.sportsData = new BlazeSportsPipeline();
    this.visionAI = new BlazeVisionAI();

    // Overlay components
    this.overlayElements = new Map();
    this.playerLabels = new Map();
    this.trajectoryPaths = new Map();
    this.heatmaps = new Map();
    this.statisticsPanels = new Map();

    // Performance tracking
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.performanceMetrics = {
      fps: 0,
      latency: 0,
      trackingAccuracy: 0
    };

    // Event handling
    this.eventHandlers = {
      sessionStart: [],
      sessionEnd: [],
      trackingUpdate: [],
      playerDetected: [],
      playerLost: [],
      statsUpdate: []
    };

    this.init();
  }

  async init() {
    try {
      console.log('🥽 Initializing Blaze AR Overlay System...');
      
      // Check WebXR support
      if (!navigator.xr) {
        throw new Error('WebXR not supported in this browser');
      }

      // Initialize Three.js scene
      this.initThreeJS();
      
      // Setup AR session
      await this.setupARSession();
      
      // Initialize tracking systems
      await this.initTracking();
      
      // Setup overlay components
      this.initOverlayComponents();
      
      console.log('🥽 AR Overlay System initialized successfully');
      
    } catch (error) {
      console.error('AR initialization failed:', error);
      throw error;
    }
  }

  initThreeJS() {
    // Create scene
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );

    // Create renderer with XR support
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Setup lighting for AR
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  async setupARSession() {
    try {
      // Check for immersive AR support
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      
      if (!supported) {
        console.warn('Immersive AR not supported, falling back to inline AR');
      }

      // Request XR session with required features
      const sessionInit = {
        requiredFeatures: ['local'],
        optionalFeatures: [
          'dom-overlay',
          'hit-test',
          'plane-detection',
          'anchors',
          'camera-access'
        ]
      };

      this.xrSession = await navigator.xr.requestSession(
        supported ? 'immersive-ar' : 'inline',
        sessionInit
      );

      // Setup XR reference space
      this.referenceSpace = await this.xrSession.requestReferenceSpace('local');

      // Setup render loop
      this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));

      // Session event handlers
      this.xrSession.addEventListener('end', this.onSessionEnd.bind(this));
      this.xrSession.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));

      console.log('🥽 AR Session established');
      this.dispatchEvent('sessionStart', { session: this.xrSession });

    } catch (error) {
      console.error('Failed to setup AR session:', error);
      throw error;
    }
  }

  async initTracking() {
    try {
      console.log('👁️ Initializing player tracking systems...');

      // Initialize computer vision models
      await this.visionAI.init();

      // Setup coordinate system based on sport
      this.setupCoordinateSystem();

      // Initialize player detection models
      this.playerDetectionModel = await this.loadPlayerDetectionModel();
      
      // Setup ball tracking
      this.ballDetectionModel = await this.loadBallDetectionModel();

      // Initialize pose estimation
      this.poseEstimation = await this.initPoseEstimation();

      console.log('👁️ Tracking systems ready');

    } catch (error) {
      console.error('Tracking initialization failed:', error);
      throw error;
    }
  }

  setupCoordinateSystem() {
    const sportConfig = this.getSportConfiguration();
    
    this.coordinateSystem = {
      fieldWidth: sportConfig.fieldWidth,
      fieldHeight: sportConfig.fieldHeight,
      origin: new THREE.Vector3(0, 0, 0),
      scale: sportConfig.scale,
      markers: sportConfig.markers
    };

    // Create field geometry for reference
    this.createFieldGeometry();
  }

  getSportConfiguration() {
    switch (this.config.sport) {
      case 'football':
        return {
          fieldWidth: 53.33, // yards
          fieldHeight: 120,   // yards (including end zones)
          scale: 1.0,
          markers: ['goalpost', 'yard_line', 'hash_mark']
        };
      
      case 'baseball':
        return {
          fieldWidth: 90,     // feet to bases
          fieldHeight: 90,
          scale: 0.3048,      // feet to meters
          markers: ['home_plate', 'bases', 'pitcher_mound']
        };
      
      case 'basketball':
        return {
          fieldWidth: 94,     // feet
          fieldHeight: 50,
          scale: 0.3048,
          markers: ['hoop', 'free_throw_line', 'three_point_line']
        };
      
      default:
        return {
          fieldWidth: 100,
          fieldHeight: 60,
          scale: 1.0,
          markers: ['center', 'boundary']
        };
    }
  }

  createFieldGeometry() {
    const config = this.coordinateSystem;
    
    // Create field plane
    const fieldGeometry = new THREE.PlaneGeometry(
      config.fieldWidth * config.scale,
      config.fieldHeight * config.scale
    );
    
    const fieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x228B22,
      transparent: true,
      opacity: 0.3
    });

    this.fieldGeometry = new THREE.Mesh(fieldGeometry, fieldMaterial);
    this.fieldGeometry.rotation.x = -Math.PI / 2; // Horizontal plane
    this.scene.add(this.fieldGeometry);

    // Add field markers
    this.addFieldMarkers();
  }

  addFieldMarkers() {
    const markerGroup = new THREE.Group();
    
    // Add sport-specific markers
    if (this.config.sport === 'football') {
      this.addFootballMarkers(markerGroup);
    } else if (this.config.sport === 'baseball') {
      this.addBaseballMarkers(markerGroup);
    } else if (this.config.sport === 'basketball') {
      this.addBasketballMarkers(markerGroup);
    }

    this.scene.add(markerGroup);
  }

  addFootballMarkers(group) {
    const config = this.coordinateSystem;
    
    // Yard lines
    for (let yard = 0; yard <= 100; yard += 10) {
      const lineGeometry = new THREE.PlaneGeometry(config.fieldWidth * config.scale, 0.1);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      
      line.position.z = (yard - 50) * config.scale;
      line.rotation.x = -Math.PI / 2;
      group.add(line);
    }

    // Hash marks
    for (let yard = 1; yard < 100; yard++) {
      if (yard % 10 !== 0) {
        const hashGeometry = new THREE.PlaneGeometry(2, 0.05);
        const hashMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const hash = new THREE.Mesh(hashGeometry, hashMaterial);
        
        hash.position.z = (yard - 50) * config.scale;
        hash.rotation.x = -Math.PI / 2;
        group.add(hash);
      }
    }
  }

  addBaseballMarkers(group) {
    const config = this.coordinateSystem;
    
    // Home plate
    const plateGeometry = new THREE.ConeGeometry(0.2, 0.1, 5);
    const plateMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const homePlate = new THREE.Mesh(plateGeometry, plateMaterial);
    homePlate.position.set(0, 0, 0);
    group.add(homePlate);

    // Bases
    const basePositions = [
      [config.fieldWidth * config.scale, 0, 0], // First base
      [config.fieldWidth * config.scale, 0, config.fieldHeight * config.scale], // Second base
      [0, 0, config.fieldHeight * config.scale] // Third base
    ];

    basePositions.forEach((position, index) => {
      const baseGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
      const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(...position);
      group.add(base);
    });

    // Pitcher's mound
    const moundGeometry = new THREE.CylinderGeometry(2.4, 2.4, 0.3);
    const moundMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const mound = new THREE.Mesh(moundGeometry, moundMaterial);
    mound.position.set(
      config.fieldWidth * config.scale * 0.5,
      0,
      config.fieldHeight * config.scale * 0.6
    );
    group.add(mound);
  }

  addBasketballMarkers(group) {
    // Basketball hoops
    const hoopGeometry = new THREE.TorusGeometry(0.23, 0.02);
    const hoopMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
    
    // Home hoop
    const homeHoop = new THREE.Mesh(hoopGeometry, hoopMaterial);
    homeHoop.position.set(0, 3.05, -this.coordinateSystem.fieldHeight * 0.5);
    group.add(homeHoop);

    // Away hoop
    const awayHoop = new THREE.Mesh(hoopGeometry, hoopMaterial);
    awayHoop.position.set(0, 3.05, this.coordinateSystem.fieldHeight * 0.5);
    group.add(awayHoop);
  }

  async loadPlayerDetectionModel() {
    // Load YOLOv8 or similar model for player detection
    try {
      const modelUrl = '/models/player-detection-yolo.onnx';
      const model = await this.visionAI.loadModel(modelUrl);
      return model;
    } catch (error) {
      console.warn('Could not load player detection model:', error);
      return null;
    }
  }

  async loadBallDetectionModel() {
    // Load specialized ball detection model
    try {
      const modelUrl = '/models/ball-detection.onnx';
      const model = await this.visionAI.loadModel(modelUrl);
      return model;
    } catch (error) {
      console.warn('Could not load ball detection model:', error);
      return null;
    }
  }

  async initPoseEstimation() {
    // Initialize MediaPipe Pose for detailed player analysis
    try {
      await this.visionAI.initPoseDetection();
      return true;
    } catch (error) {
      console.warn('Pose estimation not available:', error);
      return false;
    }
  }

  initOverlayComponents() {
    console.log('🎨 Initializing overlay components...');

    // Player information panels
    this.createPlayerInfoTemplates();
    
    // Statistics overlays
    this.createStatsOverlayTemplates();
    
    // Prediction visualizations
    this.createPredictionTemplates();
    
    // Performance metrics
    this.createPerformanceOverlays();

    console.log('🎨 Overlay components ready');
  }

  createPlayerInfoTemplates() {
    // Create reusable templates for player information
    const playerInfoTemplate = {
      background: new THREE.PlaneGeometry(2, 1),
      backgroundMaterial: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.7
      }),
      textGeometry: null, // Will be created dynamically
      textMaterial: new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    };

    this.playerInfoTemplate = playerInfoTemplate;
  }

  createStatsOverlayTemplates() {
    // Statistics panel template
    const statsTemplate = {
      width: 3,
      height: 2,
      background: new THREE.PlaneGeometry(3, 2),
      backgroundMaterial: new THREE.MeshBasicMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.8
      }),
      borderMaterial: new THREE.MeshBasicMaterial({ color: 0x00FF00 })
    };

    this.statsTemplate = statsTemplate;
  }

  createPredictionTemplates() {
    // Trajectory prediction visualization
    const trajectoryMaterial = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.8
    });

    this.trajectoryMaterial = trajectoryMaterial;

    // Heat map visualization
    const heatmapMaterial = new THREE.ShaderMaterial({
      uniforms: {
        heatData: { value: new THREE.DataTexture() },
        opacity: { value: 0.6 }
      },
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D heatData;
        uniform float opacity;
        varying vec2 vUv;
        
        vec3 heatMapColor(float value) {
          vec3 blue = vec3(0.0, 0.0, 1.0);
          vec3 cyan = vec3(0.0, 1.0, 1.0);
          vec3 green = vec3(0.0, 1.0, 0.0);
          vec3 yellow = vec3(1.0, 1.0, 0.0);
          vec3 red = vec3(1.0, 0.0, 0.0);
          
          if (value < 0.25) return mix(blue, cyan, value * 4.0);
          else if (value < 0.5) return mix(cyan, green, (value - 0.25) * 4.0);
          else if (value < 0.75) return mix(green, yellow, (value - 0.5) * 4.0);
          else return mix(yellow, red, (value - 0.75) * 4.0);
        }
        
        void main() {
          float heat = texture2D(heatData, vUv).r;
          vec3 color = heatMapColor(heat);
          gl_FragColor = vec4(color, heat * opacity);
        }
      `
    });

    this.heatmapMaterial = heatmapMaterial;
  }

  createPerformanceOverlays() {
    // Performance metrics overlay
    const performanceGeometry = new THREE.PlaneGeometry(2, 1);
    const performanceMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.9
    });

    this.performanceOverlay = new THREE.Mesh(performanceGeometry, performanceMaterial);
    this.performanceOverlay.position.set(-4, 3, -2);
    this.scene.add(this.performanceOverlay);
  }

  onXRFrame(time, frame) {
    this.frame = frame;
    const session = frame.session;

    // Update performance metrics
    this.updatePerformanceMetrics(time);

    // Get camera pose
    const pose = frame.getViewerPose(this.referenceSpace);
    
    if (pose) {
      // Update camera position
      const view = pose.views[0];
      this.camera.matrix.fromArray(view.transform.matrix);
      this.camera.projectionMatrix.fromArray(view.projectionMatrix);

      // Process camera feed for tracking
      this.processFrame(frame);

      // Update overlays
      this.updateOverlays();

      // Render scene
      this.renderer.render(this.scene, this.camera);
    }

    // Continue render loop
    session.requestAnimationFrame(this.onXRFrame.bind(this));
  }

  updatePerformanceMetrics(time) {
    this.frameCount++;
    
    if (this.lastFrameTime > 0) {
      const deltaTime = time - this.lastFrameTime;
      this.performanceMetrics.fps = 1000 / deltaTime;
    }
    
    this.lastFrameTime = time;
  }

  async processFrame(frame) {
    try {
      // Get camera image if available
      if (frame.session.renderState.baseLayer) {
        const image = this.getCameraImage(frame);
        
        if (image) {
          // Detect players
          const players = await this.detectPlayers(image);
          this.updatePlayerTracking(players);

          // Detect ball
          const ball = await this.detectBall(image);
          this.updateBallTracking(ball);

          // Analyze poses
          if (this.poseEstimation) {
            for (const player of players) {
              const pose = await this.analyzePose(image, player);
              this.updatePlayerPose(player.id, pose);
            }
          }
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }

  getCameraImage(frame) {
    // Extract camera image from XR frame (implementation depends on browser)
    try {
      const glBinding = frame.session.renderState.baseLayer;
      const canvas = glBinding.canvas;
      const gl = canvas.getContext('webgl2');
      
      // Read pixels from framebuffer
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      
      return {
        width: canvas.width,
        height: canvas.height,
        data: pixels
      };
    } catch (error) {
      console.warn('Could not extract camera image:', error);
      return null;
    }
  }

  async detectPlayers(image) {
    if (!this.playerDetectionModel || !image) return [];

    try {
      const detections = await this.visionAI.detectObjects(image, 'person');
      
      return detections.map((detection, index) => ({
        id: `player_${index}`,
        bbox: detection.bbox,
        confidence: detection.confidence,
        position: this.imageToWorldCoordinates(detection.bbox),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Player detection error:', error);
      return [];
    }
  }

  async detectBall(image) {
    if (!this.ballDetectionModel || !image) return null;

    try {
      const detections = await this.visionAI.detectObjects(image, 'sports_ball');
      
      if (detections.length > 0) {
        const ball = detections[0]; // Take highest confidence detection
        return {
          id: 'ball',
          bbox: ball.bbox,
          confidence: ball.confidence,
          position: this.imageToWorldCoordinates(ball.bbox),
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Ball detection error:', error);
    }
    
    return null;
  }

  async analyzePose(image, player) {
    try {
      const croppedImage = this.cropImageToBBox(image, player.bbox);
      const pose = await this.visionAI.analyzePose(croppedImage);
      
      return {
        keypoints: pose.keypoints,
        confidence: pose.confidence,
        bbox: player.bbox
      };
    } catch (error) {
      console.error('Pose analysis error:', error);
      return null;
    }
  }

  cropImageToBBox(image, bbox) {
    // Extract region of image defined by bounding box
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = bbox.width;
    canvas.height = bbox.height;
    
    // Create ImageData from raw pixels
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height
    );
    
    // Draw full image to temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw cropped region
    ctx.drawImage(
      tempCanvas,
      bbox.x, bbox.y, bbox.width, bbox.height,
      0, 0, bbox.width, bbox.height
    );
    
    return ctx.getImageData(0, 0, bbox.width, bbox.height);
  }

  imageToWorldCoordinates(bbox) {
    // Convert 2D image coordinates to 3D world coordinates
    // This is a simplified projection - real implementation would use camera calibration
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    
    // Normalize to [-1, 1] range
    const normalizedX = (centerX / this.camera.aspect) * 2 - 1;
    const normalizedY = -(centerY / 1) * 2 + 1;
    
    // Project to field coordinates (simplified)
    const worldX = normalizedX * this.coordinateSystem.fieldWidth / 2;
    const worldZ = normalizedY * this.coordinateSystem.fieldHeight / 2;
    
    return new THREE.Vector3(worldX, 0, worldZ);
  }

  updatePlayerTracking(players) {
    const currentTime = Date.now();
    
    // Update existing trackers
    for (const [playerId, tracker] of this.playerTrackers) {
      tracker.age = currentTime - tracker.lastUpdate;
      
      // Remove stale trackers
      if (tracker.age > 5000) { // 5 seconds
        this.removePlayerTracker(playerId);
      }
    }

    // Update or create trackers for detected players
    for (const player of players) {
      this.updatePlayerTracker(player);
    }

    this.dispatchEvent('trackingUpdate', {
      playerCount: this.playerTrackers.size,
      players: Array.from(this.playerTrackers.values())
    });
  }

  updatePlayerTracker(player) {
    let tracker = this.playerTrackers.get(player.id);
    
    if (!tracker) {
      // Create new tracker
      tracker = this.createPlayerTracker(player);
      this.playerTrackers.set(player.id, tracker);
      this.dispatchEvent('playerDetected', { player, tracker });
    } else {
      // Update existing tracker
      tracker.position = player.position;
      tracker.confidence = player.confidence;
      tracker.lastUpdate = player.timestamp;
      tracker.age = 0;
      
      // Update position history
      tracker.positionHistory.push({
        position: player.position.clone(),
        timestamp: player.timestamp
      });
      
      // Limit history size
      if (tracker.positionHistory.length > 30) {
        tracker.positionHistory.shift();
      }
    }

    // Update 3D visualization
    this.updatePlayerVisualization(player.id, tracker);
  }

  createPlayerTracker(player) {
    const tracker = {
      id: player.id,
      position: player.position,
      confidence: player.confidence,
      lastUpdate: player.timestamp,
      age: 0,
      positionHistory: [{
        position: player.position.clone(),
        timestamp: player.timestamp
      }],
      statistics: {},
      biometrics: {},
      predictions: {}
    };

    return tracker;
  }

  updatePlayerVisualization(playerId, tracker) {
    let visualization = this.overlayElements.get(playerId);
    
    if (!visualization) {
      visualization = this.createPlayerVisualization(playerId, tracker);
      this.overlayElements.set(playerId, visualization);
      this.scene.add(visualization.group);
    }

    // Update position
    visualization.group.position.copy(tracker.position);
    
    // Update player info
    this.updatePlayerInfo(playerId, tracker);
    
    // Update trajectory if enabled
    if (this.config.enablePredictions) {
      this.updateTrajectoryVisualization(playerId, tracker);
    }
  }

  createPlayerVisualization(playerId, tracker) {
    const group = new THREE.Group();
    
    // Player marker
    const markerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getPlayerColor(playerId),
      transparent: true,
      opacity: 0.8
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.y = 1;
    group.add(marker);

    // Player label
    const label = this.createPlayerLabel(playerId);
    label.position.set(0, 2.5, 0);
    group.add(label);

    // Statistics panel
    const statsPanel = this.createStatsPanel(playerId);
    statsPanel.position.set(0, 4, 0);
    group.add(statsPanel);

    return {
      group,
      marker,
      label,
      statsPanel
    };
  }

  createPlayerLabel(playerId) {
    // Create text label for player
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(playerId, canvas.width / 2, canvas.height / 2 + 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    const label = new THREE.Mesh(geometry, material);
    
    // Billboard effect - always face camera
    label.lookAt(this.camera.position);
    
    return label;
  }

  createStatsPanel(playerId) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;
    
    // Background
    context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = '#00FF00';
    context.lineWidth = 2;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Title
    context.fillStyle = '#00FF00';
    context.font = 'bold 18px Arial';
    context.fillText('PLAYER STATS', 10, 25);
    
    // Placeholder stats
    context.fillStyle = 'white';
    context.font = '14px Arial';
    context.fillText('Loading statistics...', 10, 50);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(3, 2);
    const panel = new THREE.Mesh(geometry, material);
    
    // Store canvas reference for updates
    panel.userData = { canvas, context, texture };
    
    return panel;
  }

  updatePlayerInfo(playerId, tracker) {
    // Get current player statistics
    this.getPlayerStatistics(playerId).then(stats => {
      const visualization = this.overlayElements.get(playerId);
      
      if (visualization && visualization.statsPanel) {
        this.updateStatsPanel(visualization.statsPanel, stats);
      }
    });
  }

  async getPlayerStatistics(playerId) {
    try {
      // Extract player information from ID or use tracking data
      const playerData = await this.sportsData.getPlayerByTrackingId(playerId);
      
      if (playerData) {
        return {
          name: playerData.name,
          position: playerData.position,
          number: playerData.number,
          stats: playerData.currentStats
        };
      }
    } catch (error) {
      console.error('Failed to get player statistics:', error);
    }
    
    return {
      name: 'Unknown Player',
      position: 'N/A',
      number: '--',
      stats: {}
    };
  }

  updateStatsPanel(panel, stats) {
    const userData = panel.userData;
    if (!userData) return;
    
    const { canvas, context, texture } = userData;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = '#00FF00';
    context.lineWidth = 2;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Player info
    context.fillStyle = '#00FF00';
    context.font = 'bold 16px Arial';
    context.fillText(`#${stats.number} ${stats.name}`, 10, 25);
    
    context.fillStyle = 'white';
    context.font = '14px Arial';
    context.fillText(`Position: ${stats.position}`, 10, 45);
    
    // Statistics
    let yOffset = 70;
    context.fillStyle = '#FFD700';
    context.font = 'bold 14px Arial';
    context.fillText('Current Stats:', 10, yOffset);
    yOffset += 20;
    
    context.fillStyle = 'white';
    context.font = '12px Arial';
    
    for (const [key, value] of Object.entries(stats.stats)) {
      context.fillText(`${key}: ${value}`, 10, yOffset);
      yOffset += 16;
    }
    
    // Update texture
    texture.needsUpdate = true;
  }

  updateTrajectoryVisualization(playerId, tracker) {
    // Create or update trajectory path
    if (tracker.positionHistory.length < 2) return;
    
    const points = tracker.positionHistory.map(item => item.position);
    
    // Remove old trajectory
    const oldTrajectory = this.trajectoryPaths.get(playerId);
    if (oldTrajectory) {
      this.scene.remove(oldTrajectory);
    }
    
    // Create new trajectory
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, this.trajectoryMaterial);
    
    this.trajectoryPaths.set(playerId, line);
    this.scene.add(line);
  }

  updateBallTracking(ball) {
    if (!ball) {
      // Remove ball tracker if no ball detected
      if (this.ballTracker) {
        this.removeBallVisualization();
        this.ballTracker = null;
      }
      return;
    }

    if (!this.ballTracker) {
      this.ballTracker = this.createBallTracker(ball);
    } else {
      this.updateBallTracker(ball);
    }

    this.updateBallVisualization();
  }

  createBallTracker(ball) {
    return {
      position: ball.position,
      confidence: ball.confidence,
      lastUpdate: ball.timestamp,
      positionHistory: [{
        position: ball.position.clone(),
        timestamp: ball.timestamp
      }],
      velocity: new THREE.Vector3(0, 0, 0),
      acceleration: new THREE.Vector3(0, 0, 0)
    };
  }

  updateBallTracker(ball) {
    const previousPosition = this.ballTracker.position.clone();
    const previousTime = this.ballTracker.lastUpdate;
    
    this.ballTracker.position = ball.position;
    this.ballTracker.confidence = ball.confidence;
    this.ballTracker.lastUpdate = ball.timestamp;
    
    // Calculate velocity and acceleration
    const deltaTime = (ball.timestamp - previousTime) / 1000; // Convert to seconds
    
    if (deltaTime > 0) {
      const newVelocity = ball.position.clone().sub(previousPosition).divideScalar(deltaTime);
      const acceleration = newVelocity.clone().sub(this.ballTracker.velocity).divideScalar(deltaTime);
      
      this.ballTracker.velocity = newVelocity;
      this.ballTracker.acceleration = acceleration;
    }
    
    // Update position history
    this.ballTracker.positionHistory.push({
      position: ball.position.clone(),
      timestamp: ball.timestamp
    });
    
    if (this.ballTracker.positionHistory.length > 50) {
      this.ballTracker.positionHistory.shift();
    }
  }

  updateBallVisualization() {
    if (!this.ballTracker) return;
    
    let ballViz = this.overlayElements.get('ball');
    
    if (!ballViz) {
      ballViz = this.createBallVisualization();
      this.overlayElements.set('ball', ballViz);
      this.scene.add(ballViz.group);
    }
    
    // Update position
    ballViz.group.position.copy(this.ballTracker.position);
    
    // Update trajectory prediction
    if (this.config.enablePredictions) {
      this.updateBallTrajectoryPrediction();
    }
  }

  createBallVisualization() {
    const group = new THREE.Group();
    
    // Ball marker
    const ballGeometry = new THREE.SphereGeometry(0.1);
    const ballMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFF4500,
      transparent: true,
      opacity: 0.9
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    group.add(ball);
    
    // Trail effect
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xFF4500,
      transparent: true,
      opacity: 0.6
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    group.add(trail);
    
    return { group, ball, trail };
  }

  updateBallTrajectoryPrediction() {
    if (!this.ballTracker || this.ballTracker.positionHistory.length < 5) return;
    
    // Simple physics-based prediction
    const currentPos = this.ballTracker.position;
    const velocity = this.ballTracker.velocity;
    const gravity = new THREE.Vector3(0, -9.81, 0);
    
    const predictionPoints = [];
    let pos = currentPos.clone();
    let vel = velocity.clone();
    
    // Predict next 2 seconds at 30fps
    for (let t = 0; t < 60; t++) {
      const dt = 1/30;
      
      vel.add(gravity.clone().multiplyScalar(dt));
      pos.add(vel.clone().multiplyScalar(dt));
      
      predictionPoints.push(pos.clone());
      
      // Stop if ball hits ground
      if (pos.y <= 0) break;
    }
    
    // Remove old prediction
    const oldPrediction = this.trajectoryPaths.get('ball_prediction');
    if (oldPrediction) {
      this.scene.remove(oldPrediction);
    }
    
    // Create new prediction visualization
    if (predictionPoints.length > 0) {
      const geometry = new THREE.BufferGeometry().setFromPoints(predictionPoints);
      const material = new THREE.LineDashedMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.7,
        dashSize: 0.1,
        gapSize: 0.05
      });
      const prediction = new THREE.Line(geometry, material);
      prediction.computeLineDistances(); // Required for dashed lines
      
      this.trajectoryPaths.set('ball_prediction', prediction);
      this.scene.add(prediction);
    }
  }

  updateOverlays() {
    // Update overlay opacity based on tracking confidence
    const averageConfidence = this.getAverageTrackingConfidence();
    
    for (const [id, element] of this.overlayElements) {
      if (element.group) {
        element.group.traverse((child) => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity = Math.min(averageConfidence * this.config.overlayOpacity, 1.0);
          }
        });
      }
    }
    
    // Update performance overlay
    this.updatePerformanceOverlay();
  }

  getAverageTrackingConfidence() {
    if (this.playerTrackers.size === 0) return 0.5;
    
    let totalConfidence = 0;
    for (const tracker of this.playerTrackers.values()) {
      totalConfidence += tracker.confidence;
    }
    
    return totalConfidence / this.playerTrackers.size;
  }

  updatePerformanceOverlay() {
    // Update performance metrics display
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 100;
    
    // Background
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Performance text
    context.fillStyle = 'white';
    context.font = '12px Arial';
    context.fillText(`FPS: ${Math.round(this.performanceMetrics.fps)}`, 10, 20);
    context.fillText(`Players: ${this.playerTrackers.size}`, 10, 35);
    context.fillText(`Accuracy: ${Math.round(this.getAverageTrackingConfidence() * 100)}%`, 10, 50);
    
    // Update texture
    if (!this.performanceOverlay.userData.texture) {
      this.performanceOverlay.userData.texture = new THREE.CanvasTexture(canvas);
      this.performanceOverlay.material.map = this.performanceOverlay.userData.texture;
    } else {
      this.performanceOverlay.userData.texture.image = canvas;
      this.performanceOverlay.userData.texture.needsUpdate = true;
    }
  }

  getPlayerColor(playerId) {
    // Assign colors based on team or player ID
    const colors = [
      0xFF0000, // Red
      0x00FF00, // Green
      0x0000FF, // Blue
      0xFFFF00, // Yellow
      0xFF00FF, // Magenta
      0x00FFFF, // Cyan
      0xFFA500, // Orange
      0x800080, // Purple
      0xFFC0CB, // Pink
      0x808080  // Gray
    ];
    
    const hash = playerId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  removePlayerTracker(playerId) {
    const tracker = this.playerTrackers.get(playerId);
    
    if (tracker) {
      this.playerTrackers.delete(playerId);
      
      // Remove visualizations
      const visualization = this.overlayElements.get(playerId);
      if (visualization && visualization.group) {
        this.scene.remove(visualization.group);
      }
      this.overlayElements.delete(playerId);
      
      // Remove trajectory
      const trajectory = this.trajectoryPaths.get(playerId);
      if (trajectory) {
        this.scene.remove(trajectory);
        this.trajectoryPaths.delete(playerId);
      }
      
      this.dispatchEvent('playerLost', { playerId, tracker });
    }
  }

  removeBallVisualization() {
    const ballViz = this.overlayElements.get('ball');
    if (ballViz && ballViz.group) {
      this.scene.remove(ballViz.group);
    }
    this.overlayElements.delete('ball');
    
    const prediction = this.trajectoryPaths.get('ball_prediction');
    if (prediction) {
      this.scene.remove(prediction);
      this.trajectoryPaths.delete('ball_prediction');
    }
  }

  // Event system
  addEventListener(eventType, handler) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
  }

  removeEventListener(eventType, handler) {
    if (this.eventHandlers[eventType]) {
      const index = this.eventHandlers[eventType].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[eventType].splice(index, 1);
      }
    }
  }

  dispatchEvent(eventType, data) {
    if (this.eventHandlers[eventType]) {
      this.eventHandlers[eventType].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Event handler error for ${eventType}:`, error);
        }
      });
    }
  }

  onSessionEnd() {
    console.log('🥽 AR Session ended');
    this.cleanup();
    this.dispatchEvent('sessionEnd', {});
  }

  onVisibilityChange(event) {
    console.log('🥽 AR Session visibility changed:', event.session.visibilityState);
  }

  // Public methods
  startSession() {
    if (!this.xrSession) {
      throw new Error('AR session not initialized');
    }
    
    console.log('🥽 Starting AR overlay session');
    this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));
  }

  stopSession() {
    if (this.xrSession) {
      this.xrSession.end();
    }
  }

  togglePlayerTracking() {
    this.config.enablePlayerTracking = !this.config.enablePlayerTracking;
    console.log(`🎯 Player tracking ${this.config.enablePlayerTracking ? 'enabled' : 'disabled'}`);
  }

  toggleStatsOverlay() {
    this.config.enableStatsOverlay = !this.config.enableStatsOverlay;
    
    for (const [id, element] of this.overlayElements) {
      if (element.statsPanel) {
        element.statsPanel.visible = this.config.enableStatsOverlay;
      }
    }
    
    console.log(`📊 Stats overlay ${this.config.enableStatsOverlay ? 'enabled' : 'disabled'}`);
  }

  togglePredictions() {
    this.config.enablePredictions = !this.config.enablePredictions;
    
    if (!this.config.enablePredictions) {
      // Hide all trajectory predictions
      for (const trajectory of this.trajectoryPaths.values()) {
        trajectory.visible = false;
      }
    }
    
    console.log(`🔮 Predictions ${this.config.enablePredictions ? 'enabled' : 'disabled'}`);
  }

  getTrackingStatus() {
    return {
      playersTracked: this.playerTrackers.size,
      ballTracked: this.ballTracker !== null,
      averageConfidence: this.getAverageTrackingConfidence(),
      performance: this.performanceMetrics
    };
  }

  cleanup() {
    // Stop tracking
    this.playerTrackers.clear();
    this.ballTracker = null;
    
    // Clear overlays
    for (const element of this.overlayElements.values()) {
      if (element.group) {
        this.scene.remove(element.group);
      }
    }
    this.overlayElements.clear();
    
    // Clear trajectories
    for (const trajectory of this.trajectoryPaths.values()) {
      this.scene.remove(trajectory);
    }
    this.trajectoryPaths.clear();
    
    // Cleanup Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    console.log('🧹 AR Overlay cleaned up');
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeAROverlay };
} else if (typeof window !== 'undefined') {
  window.BlazeAROverlay = BlazeAROverlay;
}

/**
 * Usage Examples:
 * 
 * // Initialize AR overlay
 * const arOverlay = new BlazeAROverlay({
 *   sport: 'football',
 *   enablePlayerTracking: true,
 *   enableStatsOverlay: true,
 *   enablePredictions: true
 * });
 * 
 * // Start AR session
 * await arOverlay.init();
 * arOverlay.startSession();
 * 
 * // Handle events
 * arOverlay.addEventListener('playerDetected', (data) => {
 *   console.log('New player detected:', data.player.id);
 * });
 * 
 * arOverlay.addEventListener('trackingUpdate', (data) => {
 *   console.log(`Tracking ${data.playerCount} players`);
 * });
 * 
 * // Toggle features
 * arOverlay.toggleStatsOverlay();
 * arOverlay.togglePredictions();
 * 
 * // Get status
 * const status = arOverlay.getTrackingStatus();
 * console.log('Tracking Status:', status);
 */