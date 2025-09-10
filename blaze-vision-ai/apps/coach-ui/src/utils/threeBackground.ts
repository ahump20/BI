/**
 * Three.js Background Animation - Preserved from Original Blaze Intelligence OS
 * Creates floating particle system with orange glow effects
 */

import * as THREE from 'three';

export const initThreeJS = (): void => {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle system (matching original design)
  const particleCount = 150;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  // Blaze Intelligence brand colors
  const primaryColor = new THREE.Color('#BF5700'); // Primary orange
  const accentColor = new THREE.Color('#FFB81C');  // Accent yellow
  const lightColor = new THREE.Color('#FF7A00');   // Light orange

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Random positions in 3D space
    positions[i3] = (Math.random() - 0.5) * 20;     // x
    positions[i3 + 1] = (Math.random() - 0.5) * 20; // y
    positions[i3 + 2] = (Math.random() - 0.5) * 20; // z

    // Random colors from brand palette
    const colorChoice = Math.random();
    let color: THREE.Color;
    
    if (colorChoice < 0.4) {
      color = primaryColor;
    } else if (colorChoice < 0.7) {
      color = accentColor;
    } else {
      color = lightColor;
    }

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Random sizes
    sizes[i] = Math.random() * 4 + 1;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Particle material with glow effect
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      
      varying vec3 vColor;
      
      uniform float time;
      uniform float pixelRatio;
      
      void main() {
        vColor = color;
        
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Add floating animation
        modelPosition.y += sin(time + modelPosition.x * 0.5) * 0.5;
        modelPosition.x += cos(time + modelPosition.z * 0.3) * 0.3;
        
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectionPosition;
        gl_PointSize = size * pixelRatio * 10.0;
        gl_PointSize *= (1.0 / -viewPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
        
        // Add glow effect
        strength = pow(strength, 3.0);
        
        // Add subtle flicker
        strength *= 0.8 + 0.2 * sin(gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01);
        
        gl_FragColor = vec4(vColor, strength);
      }
    `,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);

  // Add ambient lighting
  const ambientLight = new THREE.AmbientLight('#BF5700', 0.3);
  scene.add(ambientLight);

  // Add point lights for extra glow
  const pointLight1 = new THREE.PointLight('#FF7A00', 1, 15);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight('#FFB81C', 0.8, 12);
  pointLight2.position.set(-5, -3, 3);
  scene.add(pointLight2);

  // Camera position
  camera.position.z = 8;

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  const handleMouseMove = (event: MouseEvent) => {
    mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    targetRotationX = mouseY * 0.1;
    targetRotationY = mouseX * 0.1;
  };

  window.addEventListener('mousemove', handleMouseMove);

  // Animation loop
  const clock = new THREE.Clock();
  
  const animate = (): void => {
    const elapsedTime = clock.getElapsedTime();
    
    // Update shader uniforms
    particleMaterial.uniforms.time.value = elapsedTime;
    
    // Smooth camera rotation based on mouse
    particleSystem.rotation.x += (targetRotationX - particleSystem.rotation.x) * 0.02;
    particleSystem.rotation.y += (targetRotationY - particleSystem.rotation.y) * 0.02;
    
    // Continuous slow rotation
    particleSystem.rotation.y += 0.001;
    
    // Animate point lights
    pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 6;
    pointLight1.position.z = Math.cos(elapsedTime * 0.3) * 4;
    
    pointLight2.position.x = Math.cos(elapsedTime * 0.4) * 5;
    pointLight2.position.y = Math.sin(elapsedTime * 0.6) * 3;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  // Handle window resize
  const handleResize = (): void => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Update shader uniform
    particleMaterial.uniforms.pixelRatio.value = Math.min(window.devicePixelRatio, 2);
  };

  window.addEventListener('resize', handleResize);

  // Cleanup function
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    particleMaterial.dispose();
    particles.dispose();
  };
};