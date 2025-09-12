/* ================================
   BLAZE INTELLIGENCE HERO ANIMATION
   Three.js Baseball Diamond Background
   ================================ */

// Initialize Three.js Hero Animation
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('hero');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // Baseball Diamond Geometry
    function createBaseballDiamond() {
        const diamondGroup = new THREE.Group();
        
        // Diamond shape
        const diamondGeometry = new THREE.RingGeometry(20, 22, 4, 1, Math.PI/4);
        const diamondMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6B35, 
            transparent: true, 
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
        diamond.rotation.z = Math.PI/4;
        diamondGroup.add(diamond);

        // Bases
        const baseGeometry = new THREE.BoxGeometry(2, 2, 0.5);
        const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        const positions = [
            [15, 0, 0],     // First base
            [0, 15, 0],     // Second base
            [-15, 0, 0],    // Third base
            [0, -15, 0]     // Home plate
        ];
        
        positions.forEach(pos => {
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(pos[0], pos[1], pos[2]);
            diamondGroup.add(base);
        });

        return diamondGroup;
    }

    // Create multiple diamonds at different depths
    const diamonds = [];
    for (let i = 0; i < 3; i++) {
        const diamond = createBaseballDiamond();
        diamond.position.z = -50 - (i * 30);
        diamond.scale.set(1 - (i * 0.2), 1 - (i * 0.2), 1);
        diamond.rotation.y = (i * 0.3);
        diamonds.push(diamond);
        scene.add(diamond);
    }

    // Particle Field (Stadium Lights Effect)
    function createParticleField() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            // Colors (orange to gold gradient)
            const colorIntensity = Math.random();
            colors[i3] = 1;     // Red
            colors[i3 + 1] = 0.4 + colorIntensity * 0.6; // Green
            colors[i3 + 2] = 0.2; // Blue
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        return new THREE.Points(particleGeometry, particleMaterial);
    }

    const particles = createParticleField();
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFF6B35, 1, 100);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    // Camera positioning
    camera.position.set(0, 20, 60);
    camera.lookAt(0, 0, 0);

    // Animation variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Mouse interaction
    function onMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    canvas.addEventListener('mousemove', onMouseMove);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth camera movement based on mouse
        targetX = mouseX * 10;
        targetY = mouseY * 5;
        
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY + 20 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        // Rotate diamonds
        diamonds.forEach((diamond, index) => {
            diamond.rotation.y += 0.002 * (index + 1);
            diamond.rotation.z += 0.001;
        });

        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i] * 0.01) * 0.02;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0005;

        // Pulsing light effect
        pointLight.intensity = 1 + Math.sin(Date.now() * 0.002) * 0.3;

        renderer.render(scene, camera);
    }

    // Handle resize
    function onWindowResize() {
        if (!canvas.parentElement) return;
        
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onWindowResize);

    // Performance optimization
    const isLowPowerDevice = () => {
        const canvas2d = document.createElement('canvas');
        const gl = canvas2d.getContext('webgl') || canvas2d.getContext('experimental-webgl');
        if (!gl) return true;
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer.includes('Mali') || renderer.includes('PowerVR') || renderer.includes('Adreno');
        }
        return navigator.hardwareConcurrency < 4;
    };

    // Reduce quality for low-power devices
    if (isLowPowerDevice()) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        particles.material.opacity = 0.4;
        diamonds.forEach(diamond => {
            diamond.material.opacity *= 0.7;
        });
    } else {
        renderer.setPixelRatio(window.devicePixelRatio);
    }

    // Start animation
    animate();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        renderer.dispose();
        diamonds.forEach(diamond => {
            diamond.geometry.dispose();
            diamond.material.dispose();
        });
        particles.geometry.dispose();
        particles.material.dispose();
    });

    // Perfect Game branding integration
    function addPerfectGameElements() {
        // Add floating "PG" text elements
        const loader = new THREE.FontLoader();
        
        // Create text geometry without loading external fonts for performance
        const textGeometry = new THREE.RingGeometry(3, 5, 6, 1);
        const textMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, 
            transparent: true, 
            opacity: 0.3 
        });
        
        for (let i = 0; i < 5; i++) {
            const text = new THREE.Mesh(textGeometry, textMaterial);
            text.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50,
                -100 - Math.random() * 50
            );
            text.rotation.z = Math.random() * Math.PI;
            scene.add(text);
            
            // Add to animation
            const originalAnimate = animate;
            animate = function() {
                text.rotation.x += 0.005;
                text.rotation.y += 0.003;
                originalAnimate();
            };
        }
    }

    // Add Perfect Game elements after a short delay
    setTimeout(addPerfectGameElements, 1000);

    console.log('🔥 Blaze Intelligence Hero Animation Loaded - Perfect Game Edition');
});