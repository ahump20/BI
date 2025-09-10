/**
 * Blaze Vision AI - Core Types
 * Type definitions for dual-signal analysis pipeline
 */

// Core Enums
export enum StressLevel {
  LOW = 'low',
  MODERATE = 'moderate', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum PressureContext {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high', 
  CRITICAL = 'critical'
}

// Quality Metrics
export interface QualityMetrics {
  detection_confidence: number;  // 0-1
  tracking_stability: number;    // 0-1
  motion_blur: number;          // 0-1 (lower is better)
  illumination: number;         // 0-1 (optimal around 0.7)
  occlusion_ratio: number;      // 0-1 (lower is better)
}

// Action Unit Intensities (ported from our Python implementation)
export interface AUIntensities {
  au4: number;          // Brow lowering (0-5 scale)
  au5_7: number;        // Lid tightening
  au9_10: number;       // Upper lip raiser
  au14: number;         // Dimpler
  au17_23_24: number;   // Jaw tension (highest weight)
}

// Biomechanical Angles (ported from our Python implementation)
export interface BiomechAngles {
  arm_slot: number;              // Degrees from vertical
  shoulder_separation: number;   // Degrees
  stride_length: number;         // Normalized by height
  release_height: number;        // Normalized by height
  balance_score: number;         // 0-1
  consistency_score: number;     // 0-1
}

// Face Analysis Features
export interface FaceFeatures {
  blink: 0 | 1;                           // Binary blink detection
  eye_ar: number;                         // Eye Aspect Ratio
  gaze: [number, number, number];         // Gaze vector (x, y, z)
  head_euler: [number, number, number];   // Head pose (pitch, yaw, roll)
  au_intensities: AUIntensities;          // Our core stress indicators
  mesh_deltas?: number[];                 // Optional: landmark movement
  qc: QualityMetrics;
}

// Pose Analysis Features  
export interface PoseFeatures {
  kp: Array<[number, number, number, number]>;  // Keypoints [x, y, z, visibility]
  angles: BiomechAngles;                         // Our biomechanical analysis
  phase?: string;                                // Pitch phase detection
  qc: QualityMetrics;
}

// Device Capabilities
export interface DeviceCapabilities {
  fps: number;                    // Actual capture FPS
  resolution: [number, number];   // [width, height]
  has_webgpu: boolean;           // Hardware acceleration available
  has_webgl: boolean;            // Fallback acceleration
  camera_count: number;          // Available cameras
}

// Core Feature Packet (matches Vision AI spec)
export interface FeaturePacket {
  session_id: string;
  t: number;                      // Timestamp (Unix seconds with decimals)
  face?: FaceFeatures;           // Optional if face not detected
  pose?: PoseFeatures;           // Optional if pose not detected
  device: DeviceCapabilities;
}

// Grit Index Components (from our fusion algorithm)
export interface GritComponents {
  micro_score: number;           // Micro-expression component (0-100)
  bio_score: number;             // Biomechanical component (0-100)
  pressure_weight: number;       // Pressure context multiplier
  clutch_factor: number;         // Performance under pressure (0-1)
  consistency_trend: number;     // Recent performance stability (-1 to 1)
  fatigue_indicator: number;     // Energy/focus degradation (0-1)
}

// Score Packet (server → UI)
export interface ScorePacket {
  session_id: string;
  t: number;
  grit: number;                  // Overall Grit Index (0-100)
  risk: number;                  // Breakdown risk probability (0-1)
  components: GritComponents;
  explain: string[];             // Human-readable explanations
  pressure_context: PressureContext;
  stress_level: StressLevel;
}

// Leverage Index (baseball pressure context)
export interface LeverageIndex {
  inning: number;                // 1-9+ 
  outs: number;                  // 0-2
  bases: string;                 // "000" = empty, "111" = loaded
  score_diff: number;            // Positive = leading
  leverage_value: number;        // Calculated LI (0-5+)
}

// Game Context
export interface GameContext {
  sport: 'baseball' | 'softball' | 'football' | 'basketball';
  level: 'youth' | 'high_school' | 'college' | 'professional';
  leverage?: LeverageIndex;      // Baseball-specific
  game_state?: Record<string, any>; // Sport-specific state
}

// Session Configuration
export interface SessionConfig {
  session_id: string;
  player_id: string;
  sport: string;
  consent_token?: string;        // Compliance token
  target_fps: number;           // Desired capture rate
  enable_face: boolean;         // Face analysis enabled
  enable_pose: boolean;         // Pose analysis enabled
  enable_rpg: boolean;          // Heart rate variability (optional)
  baseline_duration_ms: number; // Baseline establishment period
}

// Coaching Cue
export interface CoachingCue {
  type: 'reset' | 'drill' | 'mechanical' | 'mental';
  level: 'green' | 'yellow' | 'red';
  message: string;              // Display message
  action_item: string;          // Specific actionable advice
  priority: number;             // 1-5 (higher = more urgent)
  timestamp: number;
  duration_ms?: number;         // How long to show cue
}

// Processing Statistics
export interface ProcessingStats {
  frames_processed: number;
  avg_latency_ms: number;
  fps_actual: number;
  quality_score: number;        // Overall processing quality
  error_count: number;
  last_frame_age_ms: number;
}

// Event Types (for labeling and training)
export interface EventLabel {
  session_id: string;
  t: number;
  type: 'pitch' | 'hit' | 'strike' | 'ball' | 'error' | 'success';
  label: string;                // Human-readable label
  outcome?: any;                // Structured outcome data
  meta?: Record<string, any>;   // Additional context
}

// Error Types
export interface ProcessingError {
  code: string;
  message: string;
  timestamp: number;
  session_id?: string;
  recoverable: boolean;
}

// WebRTC Configuration
export interface CaptureConstraints {
  video: {
    width: { ideal: number; min: number; max: number };
    height: { ideal: number; min: number; max: number };
    frameRate: { ideal: number; min: number; max: number };
    facingMode?: 'user' | 'environment';
    deviceId?: string;
  };
  audio: false; // We don't need audio for vision analysis
}

// Export all types for easy importing
export * from './index';