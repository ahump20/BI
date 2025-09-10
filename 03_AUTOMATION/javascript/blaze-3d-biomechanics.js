/**
 * Blaze Intelligence 3D Biomechanical Visualization
 * Advanced 3D visualization for biomechanical analysis and coaching
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class Blaze3DBiomechanics {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      width: config.width || container.clientWidth || 800,
      height: config.height || container.clientHeight || 600,
      backgroundColor: config.backgroundColor || 0x1a1a1a,
      showGrid: config.showGrid !== false,
      showAxes: config.showAxes !== false,
      enableControls: config.enableControls !== false,
      enableLabels: config.enableLabels !== false,
      animationSpeed: config.animationSpeed || 1.0,
      ...config
    };

    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();

    // Biomechanics components
    this.skeleton = null;
    this.joints = new Map();
    this.bones = new Map();
    this.muscles = new Map();
    this.forceVectors = new Map();
    this.trajectoryLines = new Map();

    // Analysis visualization
    this.heatmaps = new Map();
    this.angleIndicators = new Map();
    this.pressurePoints = new Map();
    this.movementTrails = new Map();

    // Animation and timeline
    this.animationMixer = null;
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.animationData = null;
    this.isPlaying = false;

    // UI and interaction
    this.labels = new Map();
    this.annotations = new Map();
    this.measurementTools = [];
    this.viewPresets = new Map();

    // Performance monitoring
    this.stats = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0
    };
  }

  async initialize() {
    console.log('🎨 Initializing 3D Biomechanics Visualization...');

    try {
      // Create scene
      this.createScene();
      
      // Create camera
      this.createCamera();
      
      // Create renderer
      this.createRenderer();
      
      // Create controls
      this.createControls();
      
      // Create lighting
      this.createLighting();
      
      // Create coordinate system
      this.createCoordinateSystem();
      
      // Load 3D models
      await this.loadModels();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start render loop
      this.startRenderLoop();

      console.log('✅ 3D Biomechanics Visualization initialized');
      
    } catch (error) {
      console.error('Failed to initialize 3D visualization:', error);
      throw error;
    }
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
    this.scene.fog = new THREE.Fog(this.config.backgroundColor, 10, 50);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 1, 0);
  }

  createRenderer() {
    // Main WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    this.container.appendChild(this.renderer.domElement);

    // CSS2D renderer for labels
    if (this.config.enableLabels) {
      this.labelRenderer = new CSS2DRenderer();
      this.labelRenderer.setSize(this.config.width, this.config.height);
      this.labelRenderer.domElement.style.position = 'absolute';
      this.labelRenderer.domElement.style.top = '0px';
      this.labelRenderer.domElement.style.pointerEvents = 'none';
      this.container.appendChild(this.labelRenderer.domElement);
    }
  }

  createControls() {
    if (this.config.enableControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 2;
      this.controls.maxDistance = 20;
      this.controls.target.set(0, 1, 0);
    }
  }

  createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8bb6ff, 0.2);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffaa88, 0.3);
    rimLight.position.set(-5, 10, -10);
    this.scene.add(rimLight);
  }

  createCoordinateSystem() {
    if (this.config.showAxes) {
      const axesHelper = new THREE.AxesHelper(2);
      this.scene.add(axesHelper);
    }

    if (this.config.showGrid) {
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      gridHelper.position.y = 0;
      this.scene.add(gridHelper);
    }
  }

  async loadModels() {
    const loader = new GLTFLoader();
    
    try {
      // Load human skeleton model
      const skeletonModel = await this.loadModel(loader, '/models/human-skeleton.glb');
      this.setupSkeletonModel(skeletonModel);
      
      // Load muscle groups
      const muscleModels = await Promise.all([
        this.loadModel(loader, '/models/leg-muscles.glb'),
        this.loadModel(loader, '/models/arm-muscles.glb'),
        this.loadModel(loader, '/models/core-muscles.glb')
      ]);
      this.setupMuscleModels(muscleModels);
      
    } catch (error) {
      console.warn('Could not load 3D models, using procedural generation');
      this.createProceduralSkeleton();
    }
  }

  async loadModel(loader, url) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        (progress) => console.log('Loading progress:', progress.loaded / progress.total * 100 + '%'),
        (error) => reject(error)
      );
    });
  }

  setupSkeletonModel(gltf) {
    this.skeleton = gltf.scene;
    this.skeleton.scale.setScalar(1.8); // Scale to human size
    this.skeleton.position.y = 0;
    
    // Setup materials
    this.skeleton.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Bone material
        if (child.name.includes('bone')) {
          child.material = new THREE.MeshPhongMaterial({
            color: 0xf0f0f0,
            shininess: 30,
            transparent: true,
            opacity: 0.8
          });
        }
      }
    });

    this.scene.add(this.skeleton);
    this.setupJoints();
  }

  setupMuscleModels(muscleModels) {
    muscleModels.forEach((gltf, index) => {
      const muscle = gltf.scene;
      muscle.scale.setScalar(1.8);
      muscle.position.y = 0;
      
      muscle.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.02, 0.8, 0.5), // Muscle red
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
          });
        }
      });
      
      muscle.visible = false; // Hidden by default
      this.muscles.set(`muscle_group_${index}`, muscle);
      this.scene.add(muscle);
    });
  }

  createProceduralSkeleton() {
    // Create a basic stick figure skeleton
    const skeleton = new THREE.Group();
    
    // Define joint positions (simplified human skeleton)
    const joints = {
      head: [0, 1.7, 0],
      neck: [0, 1.55, 0],
      shoulderLeft: [-0.2, 1.4, 0],
      shoulderRight: [0.2, 1.4, 0],
      elbowLeft: [-0.4, 1.1, 0],
      elbowRight: [0.4, 1.1, 0],
      wristLeft: [-0.6, 0.8, 0],
      wristRight: [0.6, 0.8, 0],
      spine: [0, 1.2, 0],
      hipLeft: [-0.1, 1.0, 0],
      hipRight: [0.1, 1.0, 0],
      kneeLeft: [-0.1, 0.5, 0],
      kneeRight: [0.1, 0.5, 0],
      ankleLeft: [-0.1, 0.1, 0],
      ankleRight: [0.1, 0.1, 0]
    };

    // Create joint spheres
    const jointGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const jointMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });

    Object.entries(joints).forEach(([name, position]) => {
      const joint = new THREE.Mesh(jointGeometry, jointMaterial);
      joint.position.fromArray(position);
      joint.name = name;
      skeleton.add(joint);
      this.joints.set(name, joint);
    });

    // Create bones (connections between joints)
    const boneConnections = [
      ['head', 'neck'],
      ['neck', 'shoulderLeft'],
      ['neck', 'shoulderRight'],
      ['shoulderLeft', 'elbowLeft'],
      ['shoulderRight', 'elbowRight'],
      ['elbowLeft', 'wristLeft'],
      ['elbowRight', 'wristRight'],
      ['neck', 'spine'],
      ['spine', 'hipLeft'],
      ['spine', 'hipRight'],
      ['hipLeft', 'kneeLeft'],
      ['hipRight', 'kneeRight'],
      ['kneeLeft', 'ankleLeft'],
      ['kneeRight', 'ankleRight']
    ];

    boneConnections.forEach(([joint1, joint2]) => {
      const bone = this.createBone(joints[joint1], joints[joint2]);
      bone.name = `${joint1}_${joint2}`;
      skeleton.add(bone);
      this.bones.set(bone.name, bone);
    });

    this.skeleton = skeleton;
    this.scene.add(skeleton);
  }

  createBone(pos1, pos2) {
    const start = new THREE.Vector3().fromArray(pos1);
    const end = new THREE.Vector3().fromArray(pos2);
    const length = start.distanceTo(end);
    
    const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      transparent: true,
      opacity: 0.9
    });
    
    const bone = new THREE.Mesh(geometry, material);
    
    // Position and orient the bone
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    bone.position.copy(midpoint);
    
    const direction = new THREE.Vector3().subVectors(end, start);
    bone.lookAt(bone.position.clone().add(direction));
    bone.rotateX(Math.PI / 2);
    
    return bone;
  }

  setupJoints() {
    // Create interactive joint markers
    if (this.skeleton) {
      this.skeleton.traverse((child) => {
        if (child.name.includes('joint') || child.name.includes('Joint')) {
          const marker = this.createJointMarker(child.position);
          marker.userData = { jointName: child.name };
          this.joints.set(child.name, marker);
          this.scene.add(marker);
        }
      });
    }
  }

  createJointMarker(position) {
    const geometry = new THREE.SphereGeometry(0.02, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7
    });
    
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(position);
    marker.visible = false; // Hidden by default
    
    return marker;
  }

  // Biomechanical analysis visualization
  visualizeBiomechanicalAnalysis(analysisData) {
    this.clearAnalysisVisuals();
    
    if (analysisData.biomechanics) {
      this.visualizePosture(analysisData.biomechanics.posture);
      this.visualizeBalance(analysisData.biomechanics.balance);
      this.visualizeJointAngles(analysisData.biomechanics.jointAngles);
      this.visualizeForces(analysisData.biomechanics.forces);
    }
    
    if (analysisData.performanceMetrics) {
      this.visualizePerformanceMetrics(analysisData.performanceMetrics);
    }
  }

  visualizePosture(postureData) {
    if (!postureData) return;
    
    // Create posture alignment indicators
    const alignment = postureData.alignment || 0.8;
    const color = this.getPerformanceColor(alignment);
    
    // Spine alignment visualization
    const spinePoints = [
      new THREE.Vector3(0, 1.7, 0), // Head
      new THREE.Vector3(0, 1.55, 0), // Neck
      new THREE.Vector3(0, 1.2, 0),  // Upper spine
      new THREE.Vector3(0, 1.0, 0)   // Lower spine
    ];
    
    const splineGeometry = new THREE.BufferGeometry().setFromPoints(spinePoints);
    const splineMaterial = new THREE.LineBasicMaterial({ 
      color: color,
      linewidth: 4,
      transparent: true,
      opacity: 0.8
    });
    
    const splineLine = new THREE.Line(splineGeometry, splineMaterial);
    splineLine.name = 'posture_alignment';
    this.scene.add(splineLine);
    
    // Add posture score label
    if (this.config.enableLabels) {
      this.createLabel(
        new THREE.Vector3(0.5, 1.5, 0),
        `Posture: ${(alignment * 100).toFixed(1)}%`,
        color
      );
    }
  }

  visualizeBalance(balanceData) {
    if (!balanceData) return;
    
    // Center of mass indicator
    const centerOfMass = balanceData.centerOfMass || { x: 0, y: 1, z: 0 };
    
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: this.getPerformanceColor(balanceData.stability || 0.8),
      emissive: 0x332222,
      transparent: true,
      opacity: 0.8
    });
    
    const comSphere = new THREE.Mesh(geometry, material);
    comSphere.position.set(centerOfMass.x, centerOfMass.y, centerOfMass.z);
    comSphere.name = 'center_of_mass';
    this.scene.add(comSphere);
    
    // Balance stability visualization (ground projection)
    const projectionGeometry = new THREE.CircleGeometry(0.2, 32);
    const projectionMaterial = new THREE.MeshBasicMaterial({
      color: this.getPerformanceColor(balanceData.stability || 0.8),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const projection = new THREE.Mesh(projectionGeometry, projectionMaterial);
    projection.position.set(centerOfMass.x, 0.01, centerOfMass.z);
    projection.rotation.x = -Math.PI / 2;
    projection.name = 'balance_projection';
    this.scene.add(projection);
  }

  visualizeJointAngles(jointAngles) {
    if (!jointAngles) return;
    
    Object.entries(jointAngles).forEach(([jointName, angle]) => {
      const joint = this.joints.get(jointName);
      if (!joint) return;
      
      // Create angle indicator
      const angleIndicator = this.createAngleIndicator(joint.position, angle);
      angleIndicator.name = `angle_${jointName}`;
      this.scene.add(angleIndicator);
      
      // Color joint based on angle optimality
      const optimal = this.getOptimalAngle(jointName);
      const deviation = Math.abs(angle - optimal);
      const performance = Math.max(0, 1 - deviation / 45); // Normalize to 0-1
      
      joint.material = joint.material.clone();
      joint.material.color = this.getPerformanceColor(performance);
    });
  }

  createAngleIndicator(position, angle) {
    const group = new THREE.Group();
    
    // Arc to show angle
    const arcGeometry = new THREE.RingGeometry(0.08, 0.1, 0, Math.PI * 2 * (angle / 360));
    const arcMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.position.copy(position);
    group.add(arc);
    
    // Angle text
    if (this.config.enableLabels) {
      const label = this.createLabel(
        position.clone().add(new THREE.Vector3(0.15, 0, 0)),
        `${angle.toFixed(1)}°`,
        0xffffff
      );
      group.add(label);
    }
    
    return group;
  }

  visualizeForces(forces) {
    if (!forces) return;
    
    forces.forEach((force, index) => {
      const vector = this.createForceVector(
        new THREE.Vector3(force.x, force.y, force.z),
        new THREE.Vector3(force.fx, force.fy, force.fz),
        force.magnitude
      );
      vector.name = `force_${index}`;
      this.scene.add(vector);
    });
  }

  createForceVector(position, direction, magnitude) {
    const group = new THREE.Group();
    
    // Normalize and scale direction
    const normalizedDirection = direction.clone().normalize();
    const scaledDirection = normalizedDirection.multiplyScalar(magnitude * 0.5);
    
    // Arrow shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.01, 0.01, magnitude * 0.5, 8);
    const shaftMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getMagnitudeColor(magnitude) 
    });
    
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.copy(position);
    shaft.lookAt(position.clone().add(scaledDirection));
    shaft.rotateX(Math.PI / 2);
    group.add(shaft);
    
    // Arrow head
    const headGeometry = new THREE.ConeGeometry(0.03, 0.1, 8);
    const head = new THREE.Mesh(headGeometry, shaftMaterial);
    head.position.copy(position.clone().add(scaledDirection));
    head.lookAt(position.clone().add(scaledDirection.multiplyScalar(1.1)));
    group.add(head);
    
    return group;
  }

  visualizePerformanceMetrics(metrics) {
    if (!metrics) return;
    
    // Create performance dashboard in 3D space
    const dashboard = this.createPerformanceDashboard(metrics);
    dashboard.position.set(2, 2, 0);
    dashboard.name = 'performance_dashboard';
    this.scene.add(dashboard);
  }

  createPerformanceDashboard(metrics) {
    const group = new THREE.Group();
    
    // Background panel
    const panelGeometry = new THREE.PlaneGeometry(1, 1.5);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    group.add(panel);
    
    // Performance bars
    const metricsToShow = [
      { name: 'Overall', value: metrics.overall || 0.8 },
      { name: 'Biomech', value: metrics.biomechanicalEfficiency || 0.75 },
      { name: 'Mental', value: metrics.mentalState || 0.85 },
      { name: 'Character', value: metrics.characterStrength || 0.9 }
    ];
    
    metricsToShow.forEach((metric, index) => {
      const bar = this.createPerformanceBar(metric.name, metric.value);
      bar.position.set(-0.3, 0.5 - index * 0.25, 0.01);
      group.add(bar);
    });
    
    return group;
  }

  createPerformanceBar(name, value) {
    const group = new THREE.Group();
    
    // Background bar
    const bgGeometry = new THREE.PlaneGeometry(0.5, 0.08);
    const bgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    });
    const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
    group.add(bgBar);
    
    // Value bar
    const valueGeometry = new THREE.PlaneGeometry(0.5 * value, 0.08);
    const valueMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getPerformanceColor(value)
    });
    const valueBar = new THREE.Mesh(valueGeometry, valueMaterial);
    valueBar.position.x = -0.25 + (0.25 * value);
    valueBar.position.z = 0.001;
    group.add(valueBar);
    
    // Label
    if (this.config.enableLabels) {
      const label = this.createLabel(
        new THREE.Vector3(-0.3, 0, 0.01),
        `${name}: ${(value * 100).toFixed(0)}%`,
        0xffffff
      );
      group.add(label);
    }
    
    return group;
  }

  // Animation and timeline control
  loadAnimationData(animationData) {
    this.animationData = animationData;
    this.totalFrames = animationData.frames.length;
    this.currentFrame = 0;
    
    // Create timeline scrubber UI
    this.createTimelineScrubber();
  }

  playAnimation() {
    this.isPlaying = true;
  }

  pauseAnimation() {
    this.isPlaying = false;
  }

  setFrame(frameNumber) {
    if (!this.animationData || frameNumber >= this.totalFrames) return;
    
    this.currentFrame = frameNumber;
    const frameData = this.animationData.frames[frameNumber];
    
    // Update skeleton pose
    if (frameData.pose) {
      this.updateSkeletonPose(frameData.pose);
    }
    
    // Update analysis visuals
    if (frameData.analysis) {
      this.visualizeBiomechanicalAnalysis(frameData.analysis);
    }
  }

  updateSkeletonPose(poseData) {
    // Update joint positions based on pose data
    Object.entries(poseData).forEach(([jointName, transform]) => {
      const joint = this.joints.get(jointName);
      if (joint && transform) {
        if (transform.position) {
          joint.position.fromArray(transform.position);
        }
        if (transform.rotation) {
          joint.rotation.fromArray(transform.rotation);
        }
      }
    });
    
    // Update bone connections
    this.updateBoneConnections();
  }

  updateBoneConnections() {
    // Recalculate bone positions and orientations based on joint positions
    this.bones.forEach((bone, boneName) => {
      const [joint1Name, joint2Name] = boneName.split('_');
      const joint1 = this.joints.get(joint1Name);
      const joint2 = this.joints.get(joint2Name);
      
      if (joint1 && joint2) {
        const midpoint = new THREE.Vector3()
          .addVectors(joint1.position, joint2.position)
          .multiplyScalar(0.5);
        
        bone.position.copy(midpoint);
        bone.lookAt(joint2.position);
        bone.rotateX(Math.PI / 2);
        
        // Update bone length
        const length = joint1.position.distanceTo(joint2.position);
        bone.scale.y = length / 0.1; // Assuming original bone length of 0.1
      }
    });
  }

  createTimelineScrubber() {
    // This would create a UI element for timeline control
    // Implementation would depend on the UI framework being used
  }

  // Utility methods
  getPerformanceColor(performance) {
    // Color scale from red (poor) to green (excellent)
    const hue = performance * 120 / 360; // 0 = red, 120 = green
    return new THREE.Color().setHSL(hue, 0.8, 0.5);
  }

  getMagnitudeColor(magnitude) {
    // Color based on force magnitude
    const normalizedMag = Math.min(magnitude / 100, 1); // Normalize to 0-1
    return new THREE.Color().setHSL((1 - normalizedMag) * 240 / 360, 0.8, 0.5);
  }

  getOptimalAngle(jointName) {
    // Return optimal angles for different joints
    const optimalAngles = {
      leftElbow: 90,
      rightElbow: 90,
      leftKnee: 150,
      rightKnee: 150,
      spineAngle: 180
    };
    
    return optimalAngles[jointName] || 0;
  }

  createLabel(position, text, color = 0xffffff) {
    if (!this.config.enableLabels) return null;
    
    const div = document.createElement('div');
    div.className = 'biomech-label';
    div.textContent = text;
    div.style.color = `#${color.toString(16).padStart(6, '0')}`;
    div.style.fontSize = '12px';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.padding = '2px 6px';
    div.style.background = 'rgba(0,0,0,0.6)';
    div.style.borderRadius = '3px';
    div.style.border = '1px solid rgba(255,255,255,0.2)';
    
    const label = new CSS2DObject(div);
    label.position.copy(position);
    
    this.labels.set(text, label);
    return label;
  }

  clearAnalysisVisuals() {
    // Remove existing analysis visualizations
    const toRemove = [];
    
    this.scene.traverse((child) => {
      if (child.name && (
        child.name.includes('posture_') ||
        child.name.includes('balance_') ||
        child.name.includes('angle_') ||
        child.name.includes('force_') ||
        child.name.includes('performance_')
      )) {
        toRemove.push(child);
      }
    });
    
    toRemove.forEach(child => {
      this.scene.remove(child);
    });
  }

  // View control methods
  setView(viewName) {
    const views = {
      front: { position: [0, 1.5, 5], target: [0, 1, 0] },
      side: { position: [5, 1.5, 0], target: [0, 1, 0] },
      back: { position: [0, 1.5, -5], target: [0, 1, 0] },
      top: { position: [0, 8, 0], target: [0, 1, 0] },
      isometric: { position: [5, 5, 5], target: [0, 1, 0] }
    };
    
    const view = views[viewName];
    if (view && this.controls) {
      this.camera.position.fromArray(view.position);
      this.controls.target.fromArray(view.target);
      this.controls.update();
    }
  }

  toggleVisualization(type) {
    switch (type) {
      case 'skeleton':
        if (this.skeleton) {
          this.skeleton.visible = !this.skeleton.visible;
        }
        break;
      case 'joints':
        this.joints.forEach(joint => {
          joint.visible = !joint.visible;
        });
        break;
      case 'muscles':
        this.muscles.forEach(muscle => {
          muscle.visible = !muscle.visible;
        });
        break;
      case 'forces':
        this.forceVectors.forEach(vector => {
          vector.visible = !vector.visible;
        });
        break;
    }
  }

  // Event handling
  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Mouse interaction
    this.renderer.domElement.addEventListener('click', (event) => {
      this.handleClick(event);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
  }

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    if (this.labelRenderer) {
      this.labelRenderer.setSize(width, height);
    }
  }

  handleClick(event) {
    // Raycasting for object interaction
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.onObjectClick(object, intersects[0].point);
    }
  }

  onObjectClick(object, point) {
    // Handle object selection and interaction
    if (object.userData && object.userData.jointName) {
      console.log(`Clicked joint: ${object.userData.jointName}`);
      // Could show detailed joint information
    }
  }

  handleKeyDown(event) {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        if (this.isPlaying) {
          this.pauseAnimation();
        } else {
          this.playAnimation();
        }
        break;
      case 'KeyR':
        this.setView('front');
        break;
      case 'Digit1':
        this.setView('front');
        break;
      case 'Digit2':
        this.setView('side');
        break;
      case 'Digit3':
        this.setView('top');
        break;
    }
  }

  // Main render loop
  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      
      const deltaTime = this.clock.getDelta();
      
      // Update controls
      if (this.controls) {
        this.controls.update();
      }
      
      // Update animation
      if (this.isPlaying && this.animationData) {
        this.updateAnimation(deltaTime);
      }
      
      // Update statistics
      this.updateStats();
      
      // Render scene
      this.renderer.render(this.scene, this.camera);
      
      // Render labels
      if (this.labelRenderer) {
        this.labelRenderer.render(this.scene, this.camera);
      }
    };
    
    animate();
  }

  updateAnimation(deltaTime) {
    if (!this.animationData || this.totalFrames === 0) return;
    
    // Simple frame-based animation
    const frameRate = 30; // FPS
    const frameTime = 1 / frameRate * this.config.animationSpeed;
    
    if (this.clock.getElapsedTime() % frameTime < deltaTime) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.setFrame(this.currentFrame);
    }
  }

  updateStats() {
    // Update performance statistics
    this.stats.fps = Math.round(1 / this.clock.getDelta());
    this.stats.frameTime = this.clock.getDelta() * 1000;
    
    // Update renderer info
    const info = this.renderer.info;
    this.stats.drawCalls = info.render.calls;
    this.stats.triangles = info.render.triangles;
  }

  // Public API methods
  getStats() {
    return { ...this.stats };
  }

  exportFrame() {
    return this.renderer.domElement.toDataURL();
  }

  dispose() {
    // Clean up resources
    if (this.controls) {
      this.controls.dispose();
    }
    
    // Dispose geometries and materials
    this.scene.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    
    if (this.labelRenderer) {
      this.labelRenderer.domElement.remove();
    }
  }
}

export default Blaze3DBiomechanics;