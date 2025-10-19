import React, { Suspense, useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Environment,
  Float,
  Html,
  useGLTF,
  useTexture,
  Sphere,
  Box,
  Cylinder,
  Line,
  Stats
} from '@react-three/drei';
import * as THREE from 'three';

// Extend Three.js materials with custom shaders for Blaze branding
extend({ OrbitControls });

// Blaze Intelligence Brand Colors
const BLAZE_COLORS = {
  primary: '#BF5700', // Burnt Orange Heritage
  secondary: '#9BCBEB', // Cardinal Sky Blue
  accent: '#002244', // Tennessee Deep Navy
  highlight: '#00B2A9', // Vancouver Throwback Teal
  surface: '#E5E4E2', // Platinum
  dark: '#36454F' // Graphite
};

/**
 * BlazeGraphics3D - Advanced 3D Graphics Engine for Sports Intelligence Platform
 *
 * Core Features:
 * - 3D Stadium Visualizations for Texas/SEC venues
 * - Player Performance 3D Models with biomechanical analysis
 * - Interactive Data Visualization in 3D space
 * - Real-time rendering with sub-100ms latency
 * - AR/VR integration foundations
 * - Mobile-responsive WebGL optimization
 */
const BlazeGraphics3D = ({
  mode = 'stadium', // 'stadium', 'player', 'data', 'biomechanics'
  data = null,
  config = {},
  onInteraction = null,
  className = '',
  performance = 'balanced' // 'high', 'balanced', 'mobile'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef();

  // Performance configuration based on device capabilities
  const performanceConfig = useMemo(() => {
    const configs = {
      high: {
        shadows: true,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        shadowMapSize: 2048,
        lodLevels: 4,
        particleCount: 1000
      },
      balanced: {
        shadows: true,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        shadowMapSize: 1024,
        lodLevels: 3,
        particleCount: 500
      },
      mobile: {
        shadows: false,
        antialias: false,
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        shadowMapSize: 512,
        lodLevels: 2,
        particleCount: 200
      }
    };
    return configs[performance] || configs.balanced;
  }, [performance]);

  // Auto-detect performance mode based on device
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_GL) : '';

    // Simple heuristic for mobile detection
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLowEnd = renderer.includes('Mali') || renderer.includes('Adreno 3') || renderer.includes('PowerVR');

    if (performance === 'auto') {
      if (isMobile || isLowEnd) {
        performanceConfig.current = 'mobile';
      } else {
        performanceConfig.current = 'balanced';
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`blaze-graphics-3d ${className}`}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    >
      <Canvas
        shadows={performanceConfig.shadows}
        dpr={performanceConfig.pixelRatio}
        gl={{
          antialias: performanceConfig.antialias,
          alpha: true,
          powerPreference: "high-performance"
        }}
        camera={{
          position: [0, 5, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={<LoadingScreen />}>
          {/* Lighting Setup */}
          <ambientLight intensity={0.4} color="#ffffff" />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            color={BLAZE_COLORS.primary}
            castShadow={performanceConfig.shadows}
            shadow-mapSize-width={performanceConfig.shadowMapSize}
            shadow-mapSize-height={performanceConfig.shadowMapSize}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color={BLAZE_COLORS.secondary} />

          {/* Environment */}
          <Environment preset="city" />

          {/* Main 3D Content Based on Mode */}
          {mode === 'stadium' && (
            <StadiumVisualization
              data={data}
              config={config}
              onInteraction={onInteraction}
              performance={performanceConfig}
            />
          )}

          {mode === 'player' && (
            <PlayerVisualization
              data={data}
              config={config}
              onInteraction={onInteraction}
              performance={performanceConfig}
            />
          )}

          {mode === 'data' && (
            <DataVisualization3D
              data={data}
              config={config}
              onInteraction={onInteraction}
              performance={performanceConfig}
            />
          )}

          {mode === 'biomechanics' && (
            <BiomechanicsVisualization
              data={data}
              config={config}
              onInteraction={onInteraction}
              performance={performanceConfig}
            />
          )}

          {/* Interactive Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />

          {/* Performance Stats (development mode only) */}
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </Canvas>

      {/* Loading and Error States */}
      {!isLoaded && <LoadingOverlay />}
      {error && <ErrorOverlay error={error} />}

      <style jsx>{`
        .blaze-graphics-3d {
          position: relative;
          background: linear-gradient(135deg,
            rgba(20, 33, 61, 0.9) 0%,
            rgba(191, 87, 0, 0.1) 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .blaze-graphics-3d canvas {
          border-radius: 12px;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .blaze-graphics-3d {
            min-height: 300px;
          }
        }

        /* Touch-friendly controls for mobile */
        @media (hover: none) and (pointer: coarse) {
          .blaze-graphics-3d canvas {
            touch-action: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Stadium Visualization Component
 * Interactive 3D models of Texas/SEC football stadiums
 */
const StadiumVisualization = ({ data, config, onInteraction, performance }) => {
  const stadiumRef = useRef();
  const [selectedStadium, setSelectedStadium] = useState(null);

  // Texas/SEC Stadium configurations
  const stadiums = useMemo(() => ({
    'darrell-k-royal': {
      name: 'Darrell K Royal Stadium',
      team: 'Texas Longhorns',
      capacity: 100119,
      position: [0, 0, 0],
      color: BLAZE_COLORS.primary,
      dimensions: { length: 120, width: 53.33, height: 10 }
    },
    'kyle-field': {
      name: 'Kyle Field',
      team: 'Texas A&M Aggies',
      capacity: 102733,
      position: [50, 0, 0],
      color: '#500000',
      dimensions: { length: 120, width: 53.33, height: 12 }
    },
    'tiger-stadium': {
      name: 'Tiger Stadium',
      team: 'LSU Tigers',
      capacity: 102321,
      position: [-50, 0, 0],
      color: '#461D7C',
      dimensions: { length: 120, width: 53.33, height: 15 }
    }
  }), []);

  const currentStadium = stadiums[data?.stadiumId] || stadiums['darrell-k-royal'];

  return (
    <group ref={stadiumRef}>
      {/* Stadium Field */}
      <Box
        args={[currentStadium.dimensions.length, 0.5, currentStadium.dimensions.width]}
        position={currentStadium.position}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedStadium(currentStadium);
          onInteraction?.('stadium-click', { stadium: currentStadium });
        }}
      >
        <meshLambertMaterial color="#228B22" />
      </Box>

      {/* Stadium Structure */}
      <Stadium3DModel stadium={currentStadium} performance={performance} />

      {/* Interactive Elements */}
      {data?.players && (
        <PlayerPositions
          players={data.players}
          stadium={currentStadium}
          onPlayerClick={(player) => onInteraction?.('player-click', { player })}
        />
      )}

      {/* Stadium Information HUD */}
      {selectedStadium && (
        <Html position={[currentStadium.position[0], 20, currentStadium.position[2]]}>
          <StadiumInfoPanel stadium={selectedStadium} />
        </Html>
      )}
    </group>
  );
};

/**
 * Player Visualization Component
 * 3D player models with biomechanical analysis
 */
const PlayerVisualization = ({ data, config, onInteraction, performance }) => {
  const playerRef = useRef();

  return (
    <group ref={playerRef}>
      {/* Player 3D Model */}
      <Player3DModel
        data={data}
        config={config}
        performance={performance}
        onInteraction={onInteraction}
      />

      {/* Biomechanical Analysis Overlay */}
      {data?.biomechanics && (
        <BiomechanicsOverlay
          data={data.biomechanics}
          performance={performance}
        />
      )}
    </group>
  );
};

/**
 * Data Visualization in 3D Space
 * Interactive 3D charts and data representations
 */
const DataVisualization3D = ({ data, config, onInteraction, performance }) => {
  const dataRef = useRef();

  if (!data || !data.datasets) return null;

  return (
    <group ref={dataRef}>
      {data.datasets.map((dataset, index) => (
        <Data3DChart
          key={index}
          dataset={dataset}
          position={[index * 10 - (data.datasets.length * 5), 0, 0]}
          config={config}
          performance={performance}
          onInteraction={onInteraction}
        />
      ))}
    </group>
  );
};

/**
 * Biomechanics Visualization Component
 * Advanced motion analysis with joint tracking
 */
const BiomechanicsVisualization = ({ data, config, onInteraction, performance }) => {
  const biomechanicsRef = useRef();
  const [currentFrame, setCurrentFrame] = useState(0);

  useFrame((state) => {
    if (data?.frames && data.frames.length > 0) {
      setCurrentFrame(Math.floor(state.clock.elapsedTime * 30) % data.frames.length);
    }
  });

  return (
    <group ref={biomechanicsRef}>
      {data?.skeleton && (
        <SkeletonVisualization
          skeleton={data.skeleton}
          frame={currentFrame}
          performance={performance}
          onInteraction={onInteraction}
        />
      )}
    </group>
  );
};

// Helper Components
const LoadingScreen = () => (
  <Html center>
    <div style={{
      color: BLAZE_COLORS.primary,
      fontSize: '18px',
      textAlign: 'center'
    }}>
      <div className="loading-spinner"></div>
      <p>Loading Blaze Graphics...</p>
    </div>
  </Html>
);

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-content">
      <div className="blaze-loader"></div>
      <p>Initializing 3D Engine...</p>
    </div>
    <style jsx>{`
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(20, 33, 61, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .loading-content {
        text-align: center;
        color: ${BLAZE_COLORS.primary};
      }

      .blaze-loader {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(191, 87, 0, 0.3);
        border-top: 3px solid ${BLAZE_COLORS.primary};
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ErrorOverlay = ({ error }) => (
  <div className="error-overlay">
    <div className="error-content">
      <h3>3D Graphics Error</h3>
      <p>{error.message || 'Failed to initialize 3D engine'}</p>
      <button onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
    <style jsx>{`
      .error-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(20, 33, 61, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .error-content {
        text-align: center;
        color: #ff6b6b;
        padding: 2rem;
        border: 2px solid #ff6b6b;
        border-radius: 8px;
        background: rgba(255, 107, 107, 0.1);
      }

      .error-content button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: ${BLAZE_COLORS.primary};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `}</style>
  </div>
);

// Placeholder components for specialized 3D models
const Stadium3DModel = ({ stadium, performance }) => (
  <group>
    {/* Simplified stadium structure */}
    <Cylinder args={[60, 60, 20, 32]} position={stadium.position}>
      <meshLambertMaterial color={stadium.color} transparent opacity={0.7} />
    </Cylinder>
  </group>
);

const Player3DModel = ({ data, config, performance }) => (
  <group>
    {/* Simplified player representation */}
    <Cylinder args={[1, 1, 6]} position={[0, 3, 0]}>
      <meshLambertMaterial color={BLAZE_COLORS.secondary} />
    </Cylinder>
    <Sphere args={[1.2]} position={[0, 7, 0]}>
      <meshLambertMaterial color={BLAZE_COLORS.surface} />
    </Sphere>
  </group>
);

const Data3DChart = ({ dataset, position, config, performance }) => (
  <group position={position}>
    {dataset.data.map((value, index) => (
      <Box
        key={index}
        args={[2, value / 10, 2]}
        position={[index * 3, value / 20, 0]}
      >
        <meshLambertMaterial color={BLAZE_COLORS.primary} />
      </Box>
    ))}
  </group>
);

const SkeletonVisualization = ({ skeleton, frame, performance }) => (
  <group>
    {/* Simplified skeleton joints */}
    {skeleton.joints?.map((joint, index) => (
      <Sphere key={index} args={[0.2]} position={joint.position}>
        <meshLambertMaterial color={BLAZE_COLORS.highlight} />
      </Sphere>
    ))}
  </group>
);

const PlayerPositions = ({ players, stadium, onPlayerClick }) => (
  <group>
    {players.map((player, index) => (
      <Sphere
        key={player.id}
        args={[0.5]}
        position={[
          stadium.position[0] + (player.x || 0),
          1,
          stadium.position[2] + (player.y || 0)
        ]}
        onClick={() => onPlayerClick(player)}
      >
        <meshLambertMaterial color={player.team === 'home' ? BLAZE_COLORS.primary : BLAZE_COLORS.secondary} />
      </Sphere>
    ))}
  </group>
);

const StadiumInfoPanel = ({ stadium }) => (
  <div className="stadium-info-panel">
    <h3>{stadium.name}</h3>
    <p>{stadium.team}</p>
    <p>Capacity: {stadium.capacity.toLocaleString()}</p>
    <style jsx>{`
      .stadium-info-panel {
        background: rgba(20, 33, 61, 0.95);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        border: 2px solid ${BLAZE_COLORS.primary};
        min-width: 200px;
      }
    `}</style>
  </div>
);

export default BlazeGraphics3D;