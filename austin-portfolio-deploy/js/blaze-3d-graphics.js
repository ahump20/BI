/**
 * ============================================
 * BLAZE SPORTS INTEL - 3D GRAPHICS ENGINE
 * Three.js Integration for Championship Visuals
 * ============================================
 */

class Blaze3DGraphics {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.sportMode = 'baseball';
    this.performanceMode = this.detectPerformanceMode();
    this.isWebGLAvailable = this.checkWebGLSupport();

    if (this.isWebGLAvailable) {
      this.init();
    } else {
      this.showFallback();
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  detectPerformanceMode() {
    // Check device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const hasFewCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    if (isMobile || hasLowMemory || hasFewCores) {
      return 'low';
    } else if (navigator.hardwareConcurrency >= 8 && navigator.deviceMemory >= 8) {
      return 'high';
    }
    return 'medium';
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLighting();
    this.setupControls();
    this.setupEventListeners();
    this.loadSportScene();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();

    // Add fog for depth
    this.scene.fog = new THREE.Fog(0x0A0A0F, 100, 1000);

    // Add environment
    const loader = new THREE.CubeTextureLoader();
    const texturePath = '/assets/textures/skybox/';

    // Fallback gradient background if skybox fails to load
    this.scene.background = new THREE.Color(0x0A0A0F);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.performanceMode !== 'low',
      alpha: true,
      powerPreference: this.performanceMode === 'high' ? 'high-performance' : 'default'
    });

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.performanceMode === 'low' ? 1 : 2));

    // Enable shadows based on performance
    if (this.performanceMode !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.lookAt(0, 0, 0);

    if (this.performanceMode !== 'low') {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.left = -100;
      directionalLight.shadow.camera.right = 100;
      directionalLight.shadow.camera.top = 100;
      directionalLight.shadow.camera.bottom = -100;
    }

    this.scene.add(directionalLight);

    // Stadium lights effect
    if (this.performanceMode !== 'low') {
      this.addStadiumLights();
    }
  }

  addStadiumLights() {
    const stadiumLightPositions = [
      [-60, 40, -60],
      [60, 40, -60],
      [-60, 40, 60],
      [60, 40, 60]
    ];

    stadiumLightPositions.forEach(pos => {
      const spotLight = new THREE.SpotLight(0xFFB81C, 0.5);
      spotLight.position.set(...pos);
      spotLight.angle = Math.PI / 6;
      spotLight.penumbra = 0.3;
      spotLight.decay = 2;
      spotLight.distance = 200;
      spotLight.lookAt(0, 0, 0);

      if (this.performanceMode === 'high') {
        spotLight.castShadow = true;
      }

      this.scene.add(spotLight);
    });
  }

  setupControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.rotateSpeed = 0.5;
      this.controls.zoomSpeed = 0.8;
      this.controls.panSpeed = 0.8;
      this.controls.minDistance = 20;
      this.controls.maxDistance = 300;
      this.controls.maxPolarAngle = Math.PI / 2;
    }
  }

  setupEventListeners() {
    // Handle resize
    window.addEventListener('resize', () => this.handleResize());

    // Handle sport mode changes
    window.addEventListener('bsi-sport-change', (e) => {
      this.sportMode = e.detail.sport;
      this.loadSportScene();
    });

    // Handle performance mode toggle
    window.addEventListener('bsi-performance-change', (e) => {
      this.performanceMode = e.detail.mode;
      this.updatePerformanceSettings();
    });
  }

  // ============================================
  // SPORT-SPECIFIC SCENES
  // ============================================

  loadSportScene() {
    // Clear existing sport objects
    this.clearSportObjects();

    switch(this.sportMode) {
      case 'baseball':
        this.createBaseballField();
        break;
      case 'football':
        this.createFootballField();
        break;
      case 'basketball':
        this.createBasketballCourt();
        break;
      case 'track':
        this.createTrackField();
        break;
      default:
        this.createBaseballField();
    }
  }

  clearSportObjects() {
    const objectsToRemove = [];
    this.scene.traverse((child) => {
      if (child.userData.sportObject) {
        objectsToRemove.push(child);
      }
    });

    objectsToRemove.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
      this.scene.remove(obj);
    });
  }

  createBaseballField() {
    const group = new THREE.Group();
    group.userData.sportObject = true;

    // Create diamond shape
    const diamondGeometry = new THREE.PlaneGeometry(80, 80);
    const diamondMaterial = new THREE.MeshStandardMaterial({
      color: 0x6B8E23,
      roughness: 0.8,
      metalness: 0.1
    });
    const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
    diamond.rotation.x = -Math.PI / 2;
    diamond.rotation.z = Math.PI / 4;
    diamond.receiveShadow = true;
    group.add(diamond);

    // Create infield dirt
    const infieldGeometry = new THREE.CircleGeometry(30, 32, 0, Math.PI / 2);
    const infieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.9,
      metalness: 0
    });
    const infield = new THREE.Mesh(infieldGeometry, infieldMaterial);
    infield.rotation.x = -Math.PI / 2;
    infield.position.y = 0.1;
    infield.receiveShadow = true;
    group.add(infield);

    // Create bases
    const basePositions = [
      [20, 0, 0],   // First base
      [0, 0, -20],  // Second base
      [-20, 0, 0],  // Third base
      [0, 0, 20]    // Home plate
    ];

    basePositions.forEach((pos, index) => {
      const baseGeometry = index === 3
        ? new THREE.PlaneGeometry(3, 3, 1, 1)
        : new THREE.BoxGeometry(3, 0.5, 3);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.1
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(...pos);
      if (index === 3) {
        base.rotation.x = -Math.PI / 2;
      }
      base.castShadow = true;
      group.add(base);
    });

    // Add pitcher's mound
    const moundGeometry = new THREE.CylinderGeometry(5, 6, 1, 16);
    const moundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.9
    });
    const mound = new THREE.Mesh(moundGeometry, moundMaterial);
    mound.position.y = 0.5;
    mound.castShadow = true;
    mound.receiveShadow = true;
    group.add(mound);

    this.scene.add(group);

    // Animate a baseball
    if (this.performanceMode !== 'low') {
      this.animateBaseball();
    }
  }

  animateBaseball() {
    const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.4,
      metalness: 0.1
    });
    const baseball = new THREE.Mesh(ballGeometry, ballMaterial);
    baseball.userData.sportObject = true;
    baseball.castShadow = true;

    // Create pitch trajectory
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 2, -20),
      new THREE.Vector3(0, 5, -10),
      new THREE.Vector3(0, 3, 10),
      new THREE.Vector3(0, 1, 20)
    );

    let progress = 0;
    const animatePitch = () => {
      progress += 0.02;
      if (progress > 1) progress = 0;

      const point = curve.getPoint(progress);
      baseball.position.copy(point);

      // Add rotation for realism
      baseball.rotation.x += 0.3;
      baseball.rotation.z += 0.1;
    };

    this.scene.add(baseball);

    // Store animation function for cleanup
    baseball.userData.animate = animatePitch;
  }

  createFootballField() {
    const group = new THREE.Group();
    group.userData.sportObject = true;

    // Create field
    const fieldGeometry = new THREE.PlaneGeometry(120, 53.3);
    const fieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.7,
      metalness: 0
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    group.add(field);

    // Create yard lines
    for (let i = -50; i <= 50; i += 10) {
      const lineGeometry = new THREE.PlaneGeometry(53.3, 0.5);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i, 0.1, 0);
      group.add(line);
    }

    // Create end zones
    [-60, 60].forEach(x => {
      const endZoneGeometry = new THREE.PlaneGeometry(10, 53.3);
      const endZoneMaterial = new THREE.MeshStandardMaterial({
        color: x < 0 ? 0x002244 : 0x4B92DB,
        roughness: 0.7
      });
      const endZone = new THREE.Mesh(endZoneGeometry, endZoneMaterial);
      endZone.rotation.x = -Math.PI / 2;
      endZone.position.set(x + (x < 0 ? 5 : -5), 0.05, 0);
      endZone.receiveShadow = true;
      group.add(endZone);
    });

    // Add goal posts
    [-60, 60].forEach(x => {
      const postGroup = new THREE.Group();

      // Uprights
      [-6, 6].forEach(z => {
        const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 15);
        const postMaterial = new THREE.MeshStandardMaterial({
          color: 0xFFD700,
          metalness: 0.7,
          roughness: 0.3
        });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(0, 7.5, z);
        post.castShadow = true;
        postGroup.add(post);
      });

      // Crossbar
      const crossbarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12);
      const crossbarMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.7,
        roughness: 0.3
      });
      const crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.y = 3;
      crossbar.castShadow = true;
      postGroup.add(crossbar);

      postGroup.position.x = x;
      group.add(postGroup);
    });

    this.scene.add(group);

    // Animate a football
    if (this.performanceMode !== 'low') {
      this.animateFootball();
    }
  }

  animateFootball() {
    const footballGeometry = new THREE.SphereGeometry(1, 8, 4);
    footballGeometry.scale(1.5, 1, 1);
    const footballMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.6,
      metalness: 0.2
    });
    const football = new THREE.Mesh(footballGeometry, footballMaterial);
    football.userData.sportObject = true;
    football.castShadow = true;

    // Create pass trajectory
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-40, 2, 0),
      new THREE.Vector3(-20, 10, 5),
      new THREE.Vector3(0, 12, 0),
      new THREE.Vector3(20, 10, -5),
      new THREE.Vector3(40, 2, 0)
    ]);

    let progress = 0;
    const animatePass = () => {
      progress += 0.01;
      if (progress > 1) progress = 0;

      const point = curve.getPoint(progress);
      football.position.copy(point);

      // Spiral rotation
      football.rotation.x += 0.2;
      football.rotation.y = Math.atan2(
        curve.getTangent(progress).x,
        curve.getTangent(progress).z
      );
    };

    this.scene.add(football);
    football.userData.animate = animatePass;
  }

  createBasketballCourt() {
    const group = new THREE.Group();
    group.userData.sportObject = true;

    // Create court
    const courtGeometry = new THREE.PlaneGeometry(94, 50);
    const courtMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.3,
      metalness: 0.1
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    group.add(court);

    // Create court lines
    this.createCourtLines(group);

    // Create hoops
    [-42, 42].forEach(x => {
      const hoopGroup = this.createBasketballHoop();
      hoopGroup.position.set(x, 10, 0);
      group.add(hoopGroup);
    });

    this.scene.add(group);

    // Animate a basketball
    if (this.performanceMode !== 'low') {
      this.animateBasketball();
    }
  }

  createBasketballHoop() {
    const group = new THREE.Group();

    // Backboard
    const backboardGeometry = new THREE.BoxGeometry(6, 4, 0.5);
    const backboardMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.1
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.castShadow = true;
    group.add(backboard);

    // Rim
    const rimGeometry = new THREE.TorusGeometry(1.5, 0.1, 8, 16);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xE25822,
      metalness: 0.8,
      roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.z = 2;
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    group.add(rim);

    // Net
    const netGeometry = new THREE.ConeGeometry(1.4, 3, 8, 1, true);
    const netMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.z = 2;
    net.position.y = -1.5;
    group.add(net);

    return group;
  }

  createCourtLines(group) {
    // Center line
    const centerLineGeometry = new THREE.PlaneGeometry(0.2, 50);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const centerLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.1;
    group.add(centerLine);

    // Three-point lines
    [-30, 30].forEach(x => {
      const arcGeometry = new THREE.RingGeometry(23, 23.5, 32, 1, 0, Math.PI);
      const arcMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
      });
      const arc = new THREE.Mesh(arcGeometry, arcMaterial);
      arc.rotation.x = -Math.PI / 2;
      arc.rotation.z = x < 0 ? 0 : Math.PI;
      arc.position.set(x, 0.1, 0);
      group.add(arc);
    });

    // Paint areas
    [-35, 35].forEach(x => {
      const paintGeometry = new THREE.PlaneGeometry(12, 19);
      const paintMaterial = new THREE.MeshStandardMaterial({
        color: 0x5D76A9,
        roughness: 0.7,
        transparent: true,
        opacity: 0.5
      });
      const paint = new THREE.Mesh(paintGeometry, paintMaterial);
      paint.rotation.x = -Math.PI / 2;
      paint.position.set(x, 0.05, 0);
      paint.receiveShadow = true;
      group.add(paint);
    });
  }

  animateBasketball() {
    const ballGeometry = new THREE.SphereGeometry(1, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0xE25822,
      roughness: 0.5,
      metalness: 0.1
    });
    const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
    basketball.userData.sportObject = true;
    basketball.castShadow = true;

    // Create shot arc
    let shotProgress = 0;
    let bounceCount = 0;
    const animateShot = () => {
      shotProgress += 0.015;

      if (shotProgress <= 1) {
        // Shot arc
        const x = -20 + (40 * shotProgress);
        const y = 5 + Math.sin(shotProgress * Math.PI) * 15;
        const z = Math.sin(shotProgress * Math.PI * 2) * 2;
        basketball.position.set(x, y, z);
      } else if (bounceCount < 3) {
        // Bounce animation
        const bounceProgress = (shotProgress - 1) * 3;
        const y = Math.abs(Math.sin(bounceProgress * Math.PI)) * (5 - bounceCount * 1.5);
        basketball.position.y = y;

        if (bounceProgress > 1) {
          bounceCount++;
          shotProgress = 1;
        }
      } else {
        // Reset
        shotProgress = 0;
        bounceCount = 0;
      }

      // Rotation
      basketball.rotation.x += 0.1;
      basketball.rotation.y += 0.05;
    };

    this.scene.add(basketball);
    basketball.userData.animate = animateShot;
  }

  createTrackField() {
    const group = new THREE.Group();
    group.userData.sportObject = true;

    // Create track oval
    const trackGeometry = new THREE.RingGeometry(30, 50, 32);
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0xDC143C,
      roughness: 0.8,
      metalness: 0
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.receiveShadow = true;
    group.add(track);

    // Create lanes
    for (let i = 1; i <= 8; i++) {
      const laneRadius = 30 + (i * 2.5);
      const laneGeometry = new THREE.RingGeometry(laneRadius - 0.1, laneRadius, 64);
      const laneMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
      });
      const lane = new THREE.Mesh(laneGeometry, laneMaterial);
      lane.rotation.x = -Math.PI / 2;
      lane.position.y = 0.1;
      group.add(lane);
    }

    // Create inner field
    const fieldGeometry = new THREE.CircleGeometry(30, 32);
    const fieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.7
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.1;
    field.receiveShadow = true;
    group.add(field);

    this.scene.add(group);

    // Animate runners
    if (this.performanceMode !== 'low') {
      this.animateRunners();
    }
  }

  animateRunners() {
    const runners = [];
    const lanes = [32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50];

    lanes.forEach((radius, index) => {
      const runnerGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
      const runnerMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(index / 8, 0.7, 0.5),
        roughness: 0.5,
        metalness: 0.2
      });
      const runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
      runner.userData.sportObject = true;
      runner.userData.angle = index * 0.2;
      runner.userData.speed = 0.01 + (Math.random() * 0.005);
      runner.userData.radius = radius;
      runner.castShadow = true;

      runners.push(runner);
      this.scene.add(runner);
    });

    const animateRunners = () => {
      runners.forEach(runner => {
        runner.userData.angle += runner.userData.speed;
        runner.position.x = Math.cos(runner.userData.angle) * runner.userData.radius;
        runner.position.z = Math.sin(runner.userData.angle) * runner.userData.radius;
        runner.position.y = 1;
        runner.rotation.y = -runner.userData.angle + Math.PI / 2;
      });
    };

    // Store runners for cleanup
    runners.forEach(runner => {
      runner.userData.animate = animateRunners;
    });
  }

  // ============================================
  // PERFORMANCE OPTIMIZATION
  // ============================================

  updatePerformanceSettings() {
    // Update renderer settings
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.performanceMode === 'low' ? 1 : 2));

    // Update shadow settings
    this.renderer.shadowMap.enabled = this.performanceMode !== 'low';

    // Update scene complexity
    this.scene.traverse((child) => {
      if (child.isMesh) {
        // Update material quality
        if (child.material) {
          if (this.performanceMode === 'low') {
            child.material.flatShading = true;
            child.castShadow = false;
            child.receiveShadow = false;
          } else {
            child.material.flatShading = false;
            child.castShadow = child.userData.castShadow !== false;
            child.receiveShadow = child.userData.receiveShadow !== false;
          }
        }
      }

      // Update light quality
      if (child.isLight) {
        if (child.isSpotLight || child.isDirectionalLight) {
          child.castShadow = this.performanceMode === 'high';
        }
      }
    });
  }

  // ============================================
  // ANIMATION & RENDERING
  // ============================================

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Update sport animations
    this.scene.traverse((child) => {
      if (child.userData.animate && typeof child.userData.animate === 'function') {
        child.userData.animate();
      }
    });

    // Render scene
    this.renderer.render(this.scene, this.camera);

    // Update stats if available
    if (this.stats) {
      this.stats.update();
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  showFallback() {
    // Show 2D fallback if WebGL not supported
    this.container.innerHTML = `
      <div class="bsi-3d-fallback">
        <div class="bsi-fallback-message">
          <h3>3D Graphics Not Available</h3>
          <p>Your browser doesn't support WebGL. Please use a modern browser for the full experience.</p>
        </div>
        <img src="/assets/fallback/${this.sportMode}-field.jpg" alt="${this.sportMode} field visualization">
      </div>
    `;
  }

  dispose() {
    // Cancel animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Dispose of Three.js resources
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

    // Dispose renderer
    this.renderer.dispose();

    // Remove DOM element
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  switchSport(sport) {
    this.sportMode = sport;
    this.loadSportScene();
  }

  setPerformanceMode(mode) {
    this.performanceMode = mode;
    this.updatePerformanceSettings();
  }

  takeScreenshot() {
    return this.renderer.domElement.toDataURL('image/png');
  }

  getCameraPosition() {
    return {
      position: this.camera.position.clone(),
      rotation: this.camera.rotation.clone()
    };
  }

  setCameraPosition(position, rotation) {
    if (position) {
      this.camera.position.copy(position);
    }
    if (rotation) {
      this.camera.rotation.copy(rotation);
    }
  }

  addCustomObject(geometry, material, position) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData.customObject = true;
    this.scene.add(mesh);
    return mesh;
  }

  removeCustomObject(mesh) {
    if (mesh.userData.customObject) {
      this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    }
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.Blaze3DGraphics = Blaze3DGraphics;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Blaze3DGraphics;
}