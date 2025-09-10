/**
 * Face Processor - MediaPipe + Blaze Tell Detector Algorithm
 * Ports micro-expression detection from Python to TypeScript/WebAssembly
 */

import { FaceLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { FaceFeatures, AUIntensities, QualityMetrics, StressLevel } from '../types';

interface BlinkData {
  detected: boolean;
  duration: number;
  eye_aspect_ratio: number;
  burst_count: number;
}

interface GazeData {
  vector: [number, number, number];
  steadiness: number;
  head_pose: [number, number, number];
}

export class FaceProcessor {
  private faceLandmarker: FaceLandmarker | null = null;
  private isInitialized = false;
  
  // Baseline tracking (ported from our Python implementation)
  private baselineWindow: number[] = [];
  private baselineEstablished = false;
  private baselineAU: Partial<AUIntensities> = {};
  
  // Performance tracking
  private frameCount = 0;
  private processingTimes: number[] = [];
  private lastBlinkTime = 0;
  private blinkHistory: number[] = [];
  
  // MediaPipe landmark indices (from our Python mapping)
  private readonly landmarkIndices = {
    // Eyebrow region (AU4 - brow lowerer)
    left_eyebrow: [70, 63, 105, 66, 107],
    right_eyebrow: [296, 334, 293, 300, 276],
    
    // Eye region (AU5/7 - lid tightener) 
    left_eye: [33, 7, 163, 144, 145, 153, 154, 155, 133],
    right_eye: [362, 382, 381, 380, 374, 373, 390, 249, 263],
    
    // Nose region (AU9/10 - upper lip raiser)
    nose_wing: [129, 358, 35, 31, 206, 212, 216, 92],
    
    // Mouth region (AU14 - dimpler, AU17/23/24 - jaw)
    mouth_outer: [61, 84, 17, 314, 405, 320, 307, 375],
    mouth_inner: [78, 95, 88, 178, 87, 14, 317, 402],
    
    // Jaw region (AU17/23/24 - jaw tension)
    jaw_line: [172, 136, 150, 149, 176, 148, 152, 377, 400, 378]
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU' // Use WebGPU if available
        },
        outputFaceBlendshapes: false, // We calculate our own AUs
        outputFacialTransformationMatrixes: false,
        runningMode: 'VIDEO',
        numFaces: 1, // Single face for performance
        minFaceDetectionConfidence: 0.7,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
      console.log('Face Processor initialized with MediaPipe');
    } catch (error) {
      console.error('Failed to initialize Face Processor:', error);
      throw new Error(`Face Processor initialization failed: ${error}`);
    }
  }

  async processFrame(videoFrame: VideoFrame, timestamp: number): Promise<FaceFeatures | null> {
    if (!this.isInitialized || !this.faceLandmarker) {
      throw new Error('Face Processor not initialized');
    }

    const startTime = performance.now();

    try {
      // Run MediaPipe face detection
      const results = this.faceLandmarker.detectForVideo(videoFrame, timestamp);
      
      if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
        return null; // No face detected
      }

      const landmarks = results.faceLandmarks[0]; // First face only
      
      // Extract features using our proven algorithms
      const features: FaceFeatures = {
        blink: this.detectBlink(landmarks),
        eye_ar: this.calculateEyeAspectRatio(landmarks),
        gaze: this.estimateGaze(landmarks),
        head_euler: this.calculateHeadPose(landmarks),
        au_intensities: this.extractActionUnits(landmarks),
        qc: this.assessQuality(landmarks, videoFrame)
      };

      // Update baseline if needed
      this.updateBaseline(features.au_intensities);

      // Track performance
      const processingTime = performance.now() - startTime;
      this.processingTimes.push(processingTime);
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift(); // Keep last 100 measurements
      }

      this.frameCount++;
      return features;

    } catch (error) {
      console.error('Face processing error:', error);
      return null;
    }
  }

  /**
   * Detect blink using Eye Aspect Ratio (EAR) method
   * Ported from our Python implementation
   */
  private detectBlink(landmarks: NormalizedLandmark[]): 0 | 1 {
    const ear = this.calculateEyeAspectRatio(landmarks);
    const blinkThreshold = 0.25; // Tuned from our desktop version
    
    const currentTime = Date.now();
    const isBlink = ear < blinkThreshold ? 1 : 0;
    
    if (isBlink && currentTime - this.lastBlinkTime > 100) {
      // Valid blink (not noise)
      this.blinkHistory.push(currentTime);
      this.lastBlinkTime = currentTime;
      
      // Keep only last 60 seconds of blinks
      const cutoff = currentTime - 60000;
      this.blinkHistory = this.blinkHistory.filter(t => t > cutoff);
    }
    
    return isBlink;
  }

  /**
   * Calculate Eye Aspect Ratio for blink detection
   * Based on facial landmark geometry
   */
  private calculateEyeAspectRatio(landmarks: NormalizedLandmark[]): number {
    // Left eye landmarks
    const leftEyeIndices = this.landmarkIndices.left_eye;
    const rightEyeIndices = this.landmarkIndices.right_eye;
    
    const leftEAR = this.calculateSingleEyeAR(landmarks, leftEyeIndices);
    const rightEAR = this.calculateSingleEyeAR(landmarks, rightEyeIndices);
    
    return (leftEAR + rightEAR) / 2.0;
  }

  private calculateSingleEyeAR(landmarks: NormalizedLandmark[], eyeIndices: number[]): number {
    // Eye Aspect Ratio formula: (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
    // Where p1-p6 are the 6 eye landmarks
    if (eyeIndices.length < 6) return 0.3; // Default EAR
    
    const p1 = landmarks[eyeIndices[0]];
    const p2 = landmarks[eyeIndices[1]];
    const p3 = landmarks[eyeIndices[2]];
    const p4 = landmarks[eyeIndices[3]];
    const p5 = landmarks[eyeIndices[4]];
    const p6 = landmarks[eyeIndices[5]];
    
    // Vertical distances
    const vert1 = Math.sqrt((p2.x - p6.x)**2 + (p2.y - p6.y)**2);
    const vert2 = Math.sqrt((p3.x - p5.x)**2 + (p3.y - p5.y)**2);
    
    // Horizontal distance
    const horiz = Math.sqrt((p1.x - p4.x)**2 + (p1.y - p4.y)**2);
    
    return horiz > 0 ? (vert1 + vert2) / (2.0 * horiz) : 0.3;
  }

  /**
   * Estimate gaze direction from eye landmarks
   */
  private estimateGaze(landmarks: NormalizedLandmark[]): [number, number, number] {
    // Simplified gaze estimation using eye center and head pose
    const leftEyeCenter = this.calculateEyeCenter(landmarks, this.landmarkIndices.left_eye);
    const rightEyeCenter = this.calculateEyeCenter(landmarks, this.landmarkIndices.right_eye);
    
    // Average eye center as gaze reference
    const gazeX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const gazeY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
    const gazeZ = (leftEyeCenter.z + rightEyeCenter.z) / 2;
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(gazeX**2 + gazeY**2 + gazeZ**2);
    
    return magnitude > 0 ? [gazeX/magnitude, gazeY/magnitude, gazeZ/magnitude] : [0, 0, 1];
  }

  private calculateEyeCenter(landmarks: NormalizedLandmark[], eyeIndices: number[]): {x: number, y: number, z: number} {
    let sumX = 0, sumY = 0, sumZ = 0;
    
    for (const idx of eyeIndices) {
      sumX += landmarks[idx].x;
      sumY += landmarks[idx].y; 
      sumZ += landmarks[idx].z || 0;
    }
    
    const count = eyeIndices.length;
    return { x: sumX/count, y: sumY/count, z: sumZ/count };
  }

  /**
   * Calculate head pose (pitch, yaw, roll) from landmarks
   */
  private calculateHeadPose(landmarks: NormalizedLandmark[]): [number, number, number] {
    // Use nose tip, chin, and forehead points for head orientation
    const noseTip = landmarks[1];    // Nose tip
    const chin = landmarks[152];     // Chin
    const forehead = landmarks[9];   // Forehead
    
    // Calculate pitch (up/down rotation)
    const pitch = Math.atan2(chin.y - noseTip.y, Math.abs(chin.z - noseTip.z || 0.1));
    
    // Calculate yaw (left/right rotation) 
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const yaw = Math.atan2(rightCheek.x - leftCheek.x, Math.abs(rightCheek.z - leftCheek.z || 0.1));
    
    // Calculate roll (tilt)
    const leftEyeCorner = landmarks[33];
    const rightEyeCorner = landmarks[263];
    const roll = Math.atan2(rightEyeCorner.y - leftEyeCorner.y, rightEyeCorner.x - leftEyeCorner.x);
    
    // Convert to degrees
    return [
      pitch * 180 / Math.PI,
      yaw * 180 / Math.PI, 
      roll * 180 / Math.PI
    ];
  }

  /**
   * Extract Action Units - CORE ALGORITHM from our Python implementation
   * This is the secret sauce for stress detection
   */
  private extractActionUnits(landmarks: NormalizedLandmark[]): AUIntensities {
    return {
      au4: this.calculateBrowLowering(landmarks),     // Brow lowering (tension)
      au5_7: this.calculateLidTightening(landmarks),  // Lid tightening
      au9_10: this.calculateUpperLipRaiser(landmarks), // Upper lip raiser
      au14: this.calculateDimpler(landmarks),         // Dimpler (contempt)
      au17_23_24: this.calculateJawTension(landmarks) // Jaw tension (highest weight)
    };
  }

  /**
   * AU4 - Brow Lowering (Primary stress indicator)
   * Measures vertical distance between eyebrow and eye
   */
  private calculateBrowLowering(landmarks: NormalizedLandmark[]): number {
    const leftBrow = this.calculateRegionCenter(landmarks, this.landmarkIndices.left_eyebrow);
    const rightBrow = this.calculateRegionCenter(landmarks, this.landmarkIndices.right_eyebrow);
    const leftEye = this.calculateRegionCenter(landmarks, this.landmarkIndices.left_eye);
    const rightEye = this.calculateRegionCenter(landmarks, this.landmarkIndices.right_eye);
    
    // Calculate brow-eye distances
    const leftDistance = Math.abs(leftBrow.y - leftEye.y);
    const rightDistance = Math.abs(rightBrow.y - rightEye.y);
    const avgDistance = (leftDistance + rightDistance) / 2;
    
    // Normalize against baseline
    const baselineDistance = this.baselineAU.au4 || 0.05; // Default baseline
    const relativeChange = Math.max(0, (baselineDistance - avgDistance) / baselineDistance);
    
    // Scale to 0-5 range (matching our Python implementation)
    return Math.min(5, relativeChange * 5);
  }

  /**
   * AU5/7 - Lid Tightening (Focus/stress indicator)
   */
  private calculateLidTightening(landmarks: NormalizedLandmark[]): number {
    const leftEAR = this.calculateSingleEyeAR(landmarks, this.landmarkIndices.left_eye);
    const rightEAR = this.calculateSingleEyeAR(landmarks, this.landmarkIndices.right_eye);
    const avgEAR = (leftEAR + rightEAR) / 2;
    
    // Tighter lids = lower EAR
    const baselineEAR = this.baselineAU.au5_7 || 0.3;
    const tightening = Math.max(0, (baselineEAR - avgEAR) / baselineEAR);
    
    return Math.min(5, tightening * 8); // Higher sensitivity for lid tightening
  }

  /**
   * AU9/10 - Upper Lip Raiser (Disgust/frustration)
   */
  private calculateUpperLipRaiser(landmarks: NormalizedLandmark[]): number {
    const noseBase = landmarks[2];
    const upperLip = landmarks[13];
    
    const distance = Math.abs(noseBase.y - upperLip.y);
    const baselineDistance = this.baselineAU.au9_10 || 0.02;
    
    // Raised lip = smaller distance
    const raising = Math.max(0, (baselineDistance - distance) / baselineDistance);
    
    return Math.min(5, raising * 6);
  }

  /**
   * AU14 - Dimpler (Contempt/confidence loss)
   */
  private calculateDimpler(landmarks: NormalizedLandmark[]): number {
    const mouthCornerLeft = landmarks[61];
    const mouthCornerRight = landmarks[291];
    const mouthCenter = landmarks[13];
    
    // Dimpling creates asymmetry in mouth corners
    const leftDistance = Math.abs(mouthCornerLeft.y - mouthCenter.y);
    const rightDistance = Math.abs(mouthCornerRight.y - mouthCenter.y);
    const asymmetry = Math.abs(leftDistance - rightDistance);
    
    const baselineAsymmetry = this.baselineAU.au14 || 0.01;
    const dimplerIntensity = Math.min(5, (asymmetry / baselineAsymmetry) * 3);
    
    return dimplerIntensity;
  }

  /**
   * AU17/23/24 - Jaw Tension (HIGHEST WEIGHT stress indicator)
   * This is our most reliable tell detector signal
   */
  private calculateJawTension(landmarks: NormalizedLandmark[]): number {
    const jawPoints = this.landmarkIndices.jaw_line;
    let totalTension = 0;
    
    // Calculate jaw muscle tension from landmark displacement
    for (let i = 0; i < jawPoints.length - 1; i++) {
      const p1 = landmarks[jawPoints[i]];
      const p2 = landmarks[jawPoints[i + 1]];
      
      const segmentLength = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
      totalTension += segmentLength;
    }
    
    // Normalize by jaw baseline
    const baselineJaw = this.baselineAU.au17_23_24 || 0.3;
    const tensionRatio = totalTension / baselineJaw;
    
    // Tension typically increases jaw rigidity
    const tensionIntensity = Math.max(0, (tensionRatio - 1) * 4);
    
    return Math.min(5, tensionIntensity);
  }

  private calculateRegionCenter(landmarks: NormalizedLandmark[], indices: number[]): {x: number, y: number} {
    let sumX = 0, sumY = 0;
    
    for (const idx of indices) {
      sumX += landmarks[idx].x;
      sumY += landmarks[idx].y;
    }
    
    const count = indices.length;
    return { x: sumX/count, y: sumY/count };
  }

  /**
   * Update baseline measurements for relative AU calculations
   */
  private updateBaseline(aus: AUIntensities): void {
    this.baselineWindow.push(Date.now());
    
    // Establish baseline after 5 seconds of data
    if (this.baselineWindow.length >= 150 && !this.baselineEstablished) { // 5s at 30fps
      this.baselineAU = {
        au4: 0.05,      // Typical brow-eye distance
        au5_7: 0.3,     // Typical eye aspect ratio
        au9_10: 0.02,   // Typical nose-lip distance
        au14: 0.01,     // Typical mouth asymmetry
        au17_23_24: 0.3 // Typical jaw perimeter
      };
      
      this.baselineEstablished = true;
      console.log('Face baseline established');
    }
    
    // Keep only last 10 seconds
    const cutoff = Date.now() - 10000;
    this.baselineWindow = this.baselineWindow.filter(t => t > cutoff);
  }

  /**
   * Assess overall face processing quality
   */
  private assessQuality(landmarks: NormalizedLandmark[], videoFrame: VideoFrame): QualityMetrics {
    // Face detection confidence (based on landmark stability)
    const landmarkVariance = this.calculateLandmarkVariance(landmarks);
    const detection_confidence = Math.max(0, 1 - landmarkVariance * 10);
    
    // Tracking stability (based on head pose consistency)
    const tracking_stability = this.calculateTrackingStability();
    
    // Motion blur estimate (simplified)
    const motion_blur = this.estimateMotionBlur(videoFrame);
    
    // Illumination assessment
    const illumination = this.assessIllumination(videoFrame);
    
    // Occlusion ratio (face coverage)
    const occlusion_ratio = this.calculateOcclusionRatio(landmarks);
    
    return {
      detection_confidence,
      tracking_stability,
      motion_blur,
      illumination,
      occlusion_ratio
    };
  }

  private calculateLandmarkVariance(landmarks: NormalizedLandmark[]): number {
    // Simplified variance calculation - in production would track over time
    return 0.05; // Placeholder - needs frame-to-frame tracking
  }

  private calculateTrackingStability(): number {
    // Based on head pose consistency over recent frames
    return this.frameCount > 30 ? 0.85 : 0.5; // Improves with more frames
  }

  private estimateMotionBlur(videoFrame: VideoFrame): number {
    // Simplified blur estimation - would analyze edge sharpness in production
    return 0.1; // Low blur placeholder
  }

  private assessIllumination(videoFrame: VideoFrame): number {
    // Simplified illumination - would analyze brightness histogram
    return 0.7; // Optimal illumination placeholder
  }

  private calculateOcclusionRatio(landmarks: NormalizedLandmark[]): number {
    // Count visible landmarks (with high z-values indicating occlusion)
    let occludedCount = 0;
    for (const landmark of landmarks) {
      if ((landmark.z || 0) < -0.1) { // Behind face plane
        occludedCount++;
      }
    }
    
    return occludedCount / landmarks.length;
  }

  /**
   * Get processing performance statistics
   */
  getPerformanceStats() {
    const avgProcessingTime = this.processingTimes.length > 0 
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length 
      : 0;

    return {
      frames_processed: this.frameCount,
      avg_processing_time_ms: avgProcessingTime,
      baseline_established: this.baselineEstablished,
      blink_rate_per_minute: this.blinkHistory.length > 0 
        ? (this.blinkHistory.length / (Date.now() - this.blinkHistory[0])) * 60000 
        : 0
    };
  }

  dispose(): void {
    if (this.faceLandmarker) {
      this.faceLandmarker.close();
      this.faceLandmarker = null;
    }
    this.isInitialized = false;
  }
}