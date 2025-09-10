/**
 * Blaze Intelligence Vision AI Enhanced Platform
 * Advanced biomechanical analysis with micro-expression and character detection
 */

import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Holistic } from '@mediapipe/holistic';

export class BlazeVisionAI {
  constructor(config = {}) {
    this.config = {
      enableMicroExpressions: true,
      enableCharacterAnalysis: true,
      enableBiomechanics: true,
      confidenceThreshold: 0.7,
      ...config
    };
    
    this.models = {};
    this.analysisHistory = [];
    this.characterTraits = new Map();
  }

  async initialize() {
    console.log('🚀 Initializing Blaze Vision AI Enhanced Platform...');
    
    // Load pose detection model
    this.models.pose = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox
      }
    );
    
    // Initialize MediaPipe Holistic for comprehensive analysis
    this.models.holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });
    
    this.models.holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    // Initialize face mesh for micro-expression analysis
    this.models.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    
    this.models.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    // Load custom models for character traits
    await this.loadCharacterModels();
    
    console.log('✅ Vision AI Platform initialized successfully');
  }

  async loadCharacterModels() {
    // Custom neural network for character trait detection
    this.models.character = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [468], units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'softmax' }) // 10 character traits
      ]
    });
    
    // Character traits we analyze
    this.characterLabels = [
      'determination',
      'focus',
      'resilience',
      'confidence',
      'composure',
      'intensity',
      'leadership',
      'coachability',
      'competitiveness',
      'mental_toughness'
    ];
  }

  async analyzeAthlete(videoFrame) {
    const results = {
      timestamp: Date.now(),
      biomechanics: {},
      microExpressions: {},
      characterTraits: {},
      performanceMetrics: {},
      recommendations: []
    };
    
    try {
      // Run holistic detection
      await this.models.holistic.send({ image: videoFrame });
      const holisticResults = await this.models.holistic.onResults((res) => res);
      
      // Biomechanical Analysis
      if (this.config.enableBiomechanics && holisticResults.poseLandmarks) {
        results.biomechanics = this.analyzeBiomechanics(holisticResults.poseLandmarks);
      }
      
      // Micro-Expression Analysis
      if (this.config.enableMicroExpressions && holisticResults.faceLandmarks) {
        results.microExpressions = this.analyzeMicroExpressions(holisticResults.faceLandmarks);
      }
      
      // Character Trait Analysis
      if (this.config.enableCharacterAnalysis && holisticResults.faceLandmarks) {
        results.characterTraits = await this.analyzeCharacterTraits(holisticResults.faceLandmarks);
      }
      
      // Calculate Performance Metrics
      results.performanceMetrics = this.calculatePerformanceMetrics(results);
      
      // Generate Recommendations
      results.recommendations = this.generateRecommendations(results);
      
      // Store in history for pattern analysis
      this.analysisHistory.push(results);
      if (this.analysisHistory.length > 1000) {
        this.analysisHistory.shift(); // Keep only last 1000 frames
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      results.error = error.message;
    }
    
    return results;
  }

  analyzeBiomechanics(poseLandmarks) {
    const analysis = {
      posture: {},
      jointAngles: {},
      balance: {},
      efficiency: 0
    };
    
    // Calculate key joint angles
    const joints = {
      leftElbow: this.calculateAngle(
        poseLandmarks[11], // left shoulder
        poseLandmarks[13], // left elbow
        poseLandmarks[15]  // left wrist
      ),
      rightElbow: this.calculateAngle(
        poseLandmarks[12], // right shoulder
        poseLandmarks[14], // right elbow
        poseLandmarks[16]  // right wrist
      ),
      leftKnee: this.calculateAngle(
        poseLandmarks[23], // left hip
        poseLandmarks[25], // left knee
        poseLandmarks[27]  // left ankle
      ),
      rightKnee: this.calculateAngle(
        poseLandmarks[24], // right hip
        poseLandmarks[26], // right knee
        poseLandmarks[28]  // right ankle
      ),
      hipAngle: this.calculateAngle(
        poseLandmarks[11], // left shoulder
        poseLandmarks[23], // left hip
        poseLandmarks[25]  // left knee
      ),
      spineAngle: this.calculateSpineAngle(poseLandmarks)
    };
    
    analysis.jointAngles = joints;
    
    // Analyze posture
    analysis.posture = {
      alignment: this.calculatePostureAlignment(poseLandmarks),
      stability: this.calculateStability(poseLandmarks),
      symmetry: this.calculateSymmetry(poseLandmarks)
    };
    
    // Calculate balance
    const centerOfMass = this.calculateCenterOfMass(poseLandmarks);
    analysis.balance = {
      centerOfMass,
      stability: this.calculateBalanceStability(centerOfMass, poseLandmarks),
      distribution: this.calculateWeightDistribution(poseLandmarks)
    };
    
    // Calculate movement efficiency
    analysis.efficiency = this.calculateMovementEfficiency(analysis);
    
    return analysis;
  }

  analyzeMicroExpressions(faceLandmarks) {
    const expressions = {
      emotions: {},
      intensity: 0,
      authenticity: 0,
      microMovements: []
    };
    
    // Key facial regions for micro-expression analysis
    const regions = {
      eyebrows: faceLandmarks.slice(17, 27),
      eyes: [...faceLandmarks.slice(36, 48), ...faceLandmarks.slice(68, 78)],
      nose: faceLandmarks.slice(27, 36),
      mouth: faceLandmarks.slice(48, 68),
      jaw: faceLandmarks.slice(0, 17)
    };
    
    // Detect micro-movements
    const microMovements = [];
    
    // Eyebrow movements (concentration, surprise)
    const eyebrowRaise = this.calculateEyebrowRaise(regions.eyebrows);
    if (Math.abs(eyebrowRaise) > 0.02) {
      microMovements.push({
        type: 'eyebrow',
        movement: eyebrowRaise > 0 ? 'raise' : 'furrow',
        intensity: Math.abs(eyebrowRaise)
      });
    }
    
    // Eye movements (focus, fatigue)
    const eyeOpenness = this.calculateEyeOpenness(regions.eyes);
    const eyeMovement = this.calculateEyeMovement(regions.eyes);
    
    if (eyeOpenness < 0.3) {
      microMovements.push({
        type: 'eyes',
        movement: 'squint',
        intensity: 1 - eyeOpenness
      });
    }
    
    // Mouth movements (determination, stress)
    const mouthTension = this.calculateMouthTension(regions.mouth);
    const lipCompression = this.calculateLipCompression(regions.mouth);
    
    if (lipCompression > 0.7) {
      microMovements.push({
        type: 'mouth',
        movement: 'compressed',
        intensity: lipCompression
      });
    }
    
    // Jaw tension (stress, determination)
    const jawTension = this.calculateJawTension(regions.jaw);
    if (jawTension > 0.6) {
      microMovements.push({
        type: 'jaw',
        movement: 'clenched',
        intensity: jawTension
      });
    }
    
    expressions.microMovements = microMovements;
    
    // Analyze emotional state based on micro-expressions
    expressions.emotions = {
      focused: this.calculateFocusLevel(microMovements),
      determined: this.calculateDetermination(microMovements),
      stressed: this.calculateStressLevel(microMovements),
      confident: this.calculateConfidence(microMovements),
      fatigued: this.calculateFatigue(microMovements)
    };
    
    // Calculate overall intensity
    expressions.intensity = microMovements.reduce((sum, m) => sum + m.intensity, 0) / 
                           Math.max(microMovements.length, 1);
    
    // Assess authenticity (genuine vs forced expressions)
    expressions.authenticity = this.calculateExpressionAuthenticity(microMovements, regions);
    
    return expressions;
  }

  async analyzeCharacterTraits(faceLandmarks) {
    // Convert landmarks to tensor
    const landmarksTensor = tf.tensor2d([faceLandmarks.flat()]);
    
    // Run through character model
    const predictions = await this.models.character.predict(landmarksTensor).data();
    
    // Map predictions to character traits
    const traits = {};
    this.characterLabels.forEach((label, index) => {
      traits[label] = predictions[index];
    });
    
    // Analyze patterns over time for more accurate assessment
    const historicalTraits = this.analyzeHistoricalPatterns();
    
    // Combine current and historical analysis
    const combinedTraits = {};
    for (const trait in traits) {
      combinedTraits[trait] = {
        current: traits[trait],
        average: historicalTraits[trait] || traits[trait],
        trend: this.calculateTraitTrend(trait),
        consistency: this.calculateTraitConsistency(trait)
      };
    }
    
    // Identify dominant traits
    const dominantTraits = Object.entries(combinedTraits)
      .sort((a, b) => b[1].average - a[1].average)
      .slice(0, 3)
      .map(([trait]) => trait);
    
    // Clean up tensor
    landmarksTensor.dispose();
    
    return {
      traits: combinedTraits,
      dominant: dominantTraits,
      profile: this.generateCharacterProfile(combinedTraits)
    };
  }

  calculatePerformanceMetrics(analysis) {
    const metrics = {
      overall: 0,
      biomechanicalEfficiency: 0,
      mentalState: 0,
      characterStrength: 0,
      consistency: 0,
      improvement: 0
    };
    
    // Biomechanical efficiency
    if (analysis.biomechanics.efficiency) {
      metrics.biomechanicalEfficiency = analysis.biomechanics.efficiency;
    }
    
    // Mental state score
    if (analysis.microExpressions.emotions) {
      const positive = (analysis.microExpressions.emotions.focused || 0) +
                      (analysis.microExpressions.emotions.determined || 0) +
                      (analysis.microExpressions.emotions.confident || 0);
      const negative = (analysis.microExpressions.emotions.stressed || 0) +
                      (analysis.microExpressions.emotions.fatigued || 0);
      metrics.mentalState = Math.max(0, (positive - negative) / 3);
    }
    
    // Character strength
    if (analysis.characterTraits.traits) {
      const strengthTraits = ['determination', 'resilience', 'mental_toughness'];
      metrics.characterStrength = strengthTraits.reduce((sum, trait) => 
        sum + (analysis.characterTraits.traits[trait]?.average || 0), 0) / strengthTraits.length;
    }
    
    // Consistency (based on historical data)
    metrics.consistency = this.calculateOverallConsistency();
    
    // Improvement trend
    metrics.improvement = this.calculateImprovementTrend();
    
    // Calculate overall score
    metrics.overall = (
      metrics.biomechanicalEfficiency * 0.3 +
      metrics.mentalState * 0.2 +
      metrics.characterStrength * 0.25 +
      metrics.consistency * 0.15 +
      metrics.improvement * 0.1
    );
    
    return metrics;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Biomechanical recommendations
    if (analysis.biomechanics.posture?.alignment < 0.7) {
      recommendations.push({
        category: 'biomechanics',
        priority: 'high',
        message: 'Focus on improving posture alignment. Consider core strengthening exercises.',
        metrics: ['posture.alignment']
      });
    }
    
    if (analysis.biomechanics.balance?.stability < 0.6) {
      recommendations.push({
        category: 'biomechanics',
        priority: 'medium',
        message: 'Work on balance and stability. Incorporate single-leg exercises.',
        metrics: ['balance.stability']
      });
    }
    
    // Mental state recommendations
    if (analysis.microExpressions.emotions?.stressed > 0.7) {
      recommendations.push({
        category: 'mental',
        priority: 'high',
        message: 'High stress detected. Consider breathing exercises and mental recovery techniques.',
        metrics: ['emotions.stressed']
      });
    }
    
    if (analysis.microExpressions.emotions?.fatigued > 0.6) {
      recommendations.push({
        category: 'recovery',
        priority: 'high',
        message: 'Fatigue indicators present. Ensure adequate rest and recovery.',
        metrics: ['emotions.fatigued']
      });
    }
    
    // Character development recommendations
    if (analysis.characterTraits.traits?.coachability?.average < 0.5) {
      recommendations.push({
        category: 'character',
        priority: 'medium',
        message: 'Focus on improving receptiveness to coaching and feedback.',
        metrics: ['traits.coachability']
      });
    }
    
    if (analysis.characterTraits.traits?.mental_toughness?.average < 0.6) {
      recommendations.push({
        category: 'character',
        priority: 'medium',
        message: 'Build mental toughness through progressive challenge training.',
        metrics: ['traits.mental_toughness']
      });
    }
    
    // Performance optimization
    if (analysis.performanceMetrics.consistency < 0.7) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        message: 'Work on consistency. Focus on routine and repeatability.',
        metrics: ['performanceMetrics.consistency']
      });
    }
    
    return recommendations;
  }

  // Helper functions
  calculateAngle(p1, p2, p3) {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                   Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }

  calculateSpineAngle(landmarks) {
    const neck = landmarks[0];
    const midSpine = {
      x: (landmarks[11].x + landmarks[12].x) / 2,
      y: (landmarks[11].y + landmarks[12].y) / 2
    };
    const lowerSpine = {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2
    };
    return this.calculateAngle(neck, midSpine, lowerSpine);
  }

  calculatePostureAlignment(landmarks) {
    // Calculate deviation from ideal alignment
    const head = landmarks[0];
    const shoulders = {
      x: (landmarks[11].x + landmarks[12].x) / 2,
      y: (landmarks[11].y + landmarks[12].y) / 2
    };
    const hips = {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2
    };
    
    const deviation = Math.abs(head.x - shoulders.x) + Math.abs(shoulders.x - hips.x);
    return Math.max(0, 1 - deviation);
  }

  calculateStability(landmarks) {
    // Analyze stability based on landmark positions over time
    if (this.analysisHistory.length < 10) return 0.5;
    
    const recentFrames = this.analysisHistory.slice(-10);
    let totalMovement = 0;
    
    for (let i = 1; i < recentFrames.length; i++) {
      if (recentFrames[i].biomechanics?.posture) {
        const prev = recentFrames[i-1].biomechanics.posture;
        const curr = recentFrames[i].biomechanics.posture;
        totalMovement += Math.abs(curr.alignment - prev.alignment);
      }
    }
    
    return Math.max(0, 1 - totalMovement / 10);
  }

  calculateSymmetry(landmarks) {
    // Compare left and right side landmarks
    let symmetryScore = 0;
    const pairs = [
      [11, 12], // shoulders
      [13, 14], // elbows
      [15, 16], // wrists
      [23, 24], // hips
      [25, 26], // knees
      [27, 28]  // ankles
    ];
    
    pairs.forEach(([left, right]) => {
      const diff = Math.abs(landmarks[left].y - landmarks[right].y);
      symmetryScore += Math.max(0, 1 - diff * 10);
    });
    
    return symmetryScore / pairs.length;
  }

  calculateCenterOfMass(landmarks) {
    // Simplified center of mass calculation
    const keyPoints = [0, 11, 12, 23, 24]; // head, shoulders, hips
    let sumX = 0, sumY = 0;
    
    keyPoints.forEach(index => {
      sumX += landmarks[index].x;
      sumY += landmarks[index].y;
    });
    
    return {
      x: sumX / keyPoints.length,
      y: sumY / keyPoints.length
    };
  }

  calculateBalanceStability(centerOfMass, landmarks) {
    // Check if center of mass is within base of support
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    
    const baseWidth = Math.abs(leftFoot.x - rightFoot.x);
    const centerOffset = Math.abs(centerOfMass.x - (leftFoot.x + rightFoot.x) / 2);
    
    return Math.max(0, 1 - (centerOffset / baseWidth));
  }

  calculateWeightDistribution(landmarks) {
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    const centerX = (leftFoot.x + rightFoot.x) / 2;
    
    const leftWeight = 0.5 + (centerX - leftFoot.x) / (rightFoot.x - leftFoot.x);
    const rightWeight = 1 - leftWeight;
    
    return {
      left: leftWeight,
      right: rightWeight,
      balance: 1 - Math.abs(leftWeight - rightWeight)
    };
  }

  calculateMovementEfficiency(analysis) {
    let efficiency = 0;
    let factors = 0;
    
    if (analysis.posture?.alignment) {
      efficiency += analysis.posture.alignment;
      factors++;
    }
    
    if (analysis.posture?.symmetry) {
      efficiency += analysis.posture.symmetry;
      factors++;
    }
    
    if (analysis.balance?.stability) {
      efficiency += analysis.balance.stability;
      factors++;
    }
    
    if (analysis.balance?.distribution?.balance) {
      efficiency += analysis.balance.distribution.balance;
      factors++;
    }
    
    return factors > 0 ? efficiency / factors : 0;
  }

  // Micro-expression analysis helpers
  calculateEyebrowRaise(eyebrows) {
    // Calculate vertical movement of eyebrows
    const avgY = eyebrows.reduce((sum, p) => sum + p.y, 0) / eyebrows.length;
    const baseline = 0.3; // Expected neutral position
    return baseline - avgY;
  }

  calculateEyeOpenness(eyes) {
    // Calculate eye aperture
    const upperLid = eyes.slice(0, 6);
    const lowerLid = eyes.slice(6, 12);
    
    let totalOpenness = 0;
    for (let i = 0; i < 6; i++) {
      totalOpenness += Math.abs(upperLid[i].y - lowerLid[i].y);
    }
    
    return totalOpenness / 6;
  }

  calculateEyeMovement(eyes) {
    // Track eye movement patterns
    if (this.analysisHistory.length < 5) return { x: 0, y: 0 };
    
    const recent = this.analysisHistory.slice(-5);
    let movementX = 0, movementY = 0;
    
    for (let i = 1; i < recent.length; i++) {
      // Compare eye positions between frames
      // Implementation would track actual eye landmarks
    }
    
    return { x: movementX / 4, y: movementY / 4 };
  }

  calculateMouthTension(mouth) {
    // Analyze mouth corner positions
    const leftCorner = mouth[0];
    const rightCorner = mouth[6];
    const upperLip = mouth[13];
    const lowerLip = mouth[18];
    
    const width = Math.abs(rightCorner.x - leftCorner.x);
    const height = Math.abs(lowerLip.y - upperLip.y);
    
    // Tension indicated by compressed mouth
    const aspectRatio = height / width;
    return Math.max(0, 1 - aspectRatio * 3);
  }

  calculateLipCompression(mouth) {
    const upperLip = mouth.slice(12, 17);
    const lowerLip = mouth.slice(17, 22);
    
    let compression = 0;
    for (let i = 0; i < 5; i++) {
      compression += 1 - Math.abs(upperLip[i].y - lowerLip[i].y) * 10;
    }
    
    return Math.max(0, Math.min(1, compression / 5));
  }

  calculateJawTension(jaw) {
    // Analyze jaw line for clenching
    let variance = 0;
    for (let i = 1; i < jaw.length; i++) {
      variance += Math.abs(jaw[i].y - jaw[i-1].y);
    }
    
    // Less variance indicates more tension
    return Math.max(0, 1 - variance * 5);
  }

  // Emotion calculation helpers
  calculateFocusLevel(microMovements) {
    const focusIndicators = microMovements.filter(m => 
      (m.type === 'eyes' && m.movement === 'squint') ||
      (m.type === 'eyebrow' && m.movement === 'furrow')
    );
    
    return Math.min(1, focusIndicators.reduce((sum, m) => sum + m.intensity, 0));
  }

  calculateDetermination(microMovements) {
    const determinationIndicators = microMovements.filter(m =>
      (m.type === 'mouth' && m.movement === 'compressed') ||
      (m.type === 'jaw' && m.movement === 'clenched')
    );
    
    return Math.min(1, determinationIndicators.reduce((sum, m) => sum + m.intensity, 0));
  }

  calculateStressLevel(microMovements) {
    const stressIndicators = microMovements.filter(m =>
      m.type === 'jaw' && m.movement === 'clenched' && m.intensity > 0.7
    );
    
    return Math.min(1, stressIndicators.reduce((sum, m) => sum + m.intensity, 0));
  }

  calculateConfidence(microMovements) {
    // Confidence shown through relaxed features
    const tensionLevel = microMovements.reduce((sum, m) => sum + m.intensity, 0) / 
                        Math.max(microMovements.length, 1);
    
    return Math.max(0, 1 - tensionLevel);
  }

  calculateFatigue(microMovements) {
    // Fatigue indicators
    const fatigueIndicators = microMovements.filter(m =>
      m.type === 'eyes' && m.intensity < 0.3
    );
    
    return Math.min(1, fatigueIndicators.length * 0.3);
  }

  calculateExpressionAuthenticity(microMovements, regions) {
    // Genuine expressions involve multiple facial regions
    const involvedRegions = new Set(microMovements.map(m => m.type));
    const regionCoherence = involvedRegions.size / 5; // 5 main regions
    
    // Check for timing consistency
    const timingConsistency = this.checkTimingConsistency(microMovements);
    
    return (regionCoherence + timingConsistency) / 2;
  }

  checkTimingConsistency(microMovements) {
    // Genuine expressions have consistent timing
    if (microMovements.length < 2) return 1;
    
    const intensities = microMovements.map(m => m.intensity);
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
    
    return Math.max(0, 1 - variance);
  }

  // Historical analysis helpers
  analyzeHistoricalPatterns() {
    if (this.analysisHistory.length < 10) return {};
    
    const traits = {};
    this.characterLabels.forEach(label => {
      const values = this.analysisHistory
        .filter(h => h.characterTraits?.traits?.[label])
        .map(h => h.characterTraits.traits[label]);
      
      if (values.length > 0) {
        traits[label] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });
    
    return traits;
  }

  calculateTraitTrend(trait) {
    if (this.analysisHistory.length < 20) return 0;
    
    const recent = this.analysisHistory.slice(-20);
    const values = recent
      .filter(h => h.characterTraits?.traits?.[trait])
      .map(h => h.characterTraits.traits[trait].current);
    
    if (values.length < 10) return 0;
    
    // Simple linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return slope;
  }

  calculateTraitConsistency(trait) {
    if (this.analysisHistory.length < 10) return 0.5;
    
    const recent = this.analysisHistory.slice(-10);
    const values = recent
      .filter(h => h.characterTraits?.traits?.[trait])
      .map(h => h.characterTraits.traits[trait].current);
    
    if (values.length < 5) return 0.5;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.max(0, 1 - Math.sqrt(variance));
  }

  generateCharacterProfile(traits) {
    const profile = {
      type: '',
      strengths: [],
      areasForGrowth: [],
      coachingStyle: ''
    };
    
    // Determine athlete type based on dominant traits
    const dominant = Object.entries(traits)
      .sort((a, b) => b[1].average - a[1].average);
    
    if (dominant[0][0] === 'determination' && dominant[1][0] === 'mental_toughness') {
      profile.type = 'Warrior';
      profile.coachingStyle = 'Challenge-based with high expectations';
    } else if (dominant[0][0] === 'focus' && dominant[1][0] === 'composure') {
      profile.type = 'Technician';
      profile.coachingStyle = 'Detail-oriented with technical feedback';
    } else if (dominant[0][0] === 'leadership' && dominant[1][0] === 'confidence') {
      profile.type = 'Captain';
      profile.coachingStyle = 'Empowerment with leadership opportunities';
    } else if (dominant[0][0] === 'coachability' && dominant[1][0] === 'resilience') {
      profile.type = 'Student';
      profile.coachingStyle = 'Progressive skill-building with positive reinforcement';
    } else {
      profile.type = 'Balanced';
      profile.coachingStyle = 'Adaptive based on situation';
    }
    
    // Identify strengths (top 3 traits above 0.7)
    profile.strengths = dominant
      .filter(([_, data]) => data.average > 0.7)
      .slice(0, 3)
      .map(([trait]) => trait);
    
    // Identify areas for growth (bottom 3 traits below 0.5)
    profile.areasForGrowth = dominant
      .reverse()
      .filter(([_, data]) => data.average < 0.5)
      .slice(0, 3)
      .map(([trait]) => trait);
    
    return profile;
  }

  calculateOverallConsistency() {
    if (this.analysisHistory.length < 50) return 0.5;
    
    const recent = this.analysisHistory.slice(-50);
    const metrics = recent
      .filter(h => h.performanceMetrics?.overall)
      .map(h => h.performanceMetrics.overall);
    
    if (metrics.length < 20) return 0.5;
    
    const mean = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    const variance = metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metrics.length;
    
    return Math.max(0, 1 - Math.sqrt(variance) * 2);
  }

  calculateImprovementTrend() {
    if (this.analysisHistory.length < 100) return 0;
    
    const oldMetrics = this.analysisHistory.slice(0, 50)
      .filter(h => h.performanceMetrics?.overall)
      .map(h => h.performanceMetrics.overall);
    
    const newMetrics = this.analysisHistory.slice(-50)
      .filter(h => h.performanceMetrics?.overall)
      .map(h => h.performanceMetrics.overall);
    
    if (oldMetrics.length < 20 || newMetrics.length < 20) return 0;
    
    const oldAvg = oldMetrics.reduce((a, b) => a + b, 0) / oldMetrics.length;
    const newAvg = newMetrics.reduce((a, b) => a + b, 0) / newMetrics.length;
    
    return Math.max(-1, Math.min(1, (newAvg - oldAvg) * 10));
  }

  // Export analysis results
  exportAnalysis() {
    const summary = {
      sessionDate: new Date().toISOString(),
      framesAnalyzed: this.analysisHistory.length,
      averageMetrics: this.calculateAverageMetrics(),
      characterProfile: this.generateOverallCharacterProfile(),
      keyInsights: this.generateKeyInsights(),
      recommendations: this.generateSessionRecommendations()
    };
    
    return summary;
  }

  calculateAverageMetrics() {
    const metrics = {
      biomechanicalEfficiency: 0,
      mentalState: 0,
      characterStrength: 0,
      consistency: 0,
      improvement: 0,
      overall: 0
    };
    
    const validFrames = this.analysisHistory.filter(h => h.performanceMetrics);
    if (validFrames.length === 0) return metrics;
    
    Object.keys(metrics).forEach(key => {
      const values = validFrames.map(h => h.performanceMetrics[key] || 0);
      metrics[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    return metrics;
  }

  generateOverallCharacterProfile() {
    const allTraits = {};
    
    this.characterLabels.forEach(label => {
      const values = this.analysisHistory
        .filter(h => h.characterTraits?.traits?.[label])
        .map(h => h.characterTraits.traits[label].average || h.characterTraits.traits[label]);
      
      if (values.length > 0) {
        allTraits[label] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          consistency: this.calculateTraitConsistency(label),
          trend: this.calculateTraitTrend(label)
        };
      }
    });
    
    return this.generateCharacterProfile(allTraits);
  }

  generateKeyInsights() {
    const insights = [];
    const avgMetrics = this.calculateAverageMetrics();
    
    if (avgMetrics.biomechanicalEfficiency > 0.8) {
      insights.push('Excellent biomechanical efficiency - movement patterns are optimized');
    } else if (avgMetrics.biomechanicalEfficiency < 0.5) {
      insights.push('Biomechanical inefficiencies detected - focus on form correction');
    }
    
    if (avgMetrics.characterStrength > 0.75) {
      insights.push('Strong character traits evident - mental game is a key asset');
    }
    
    if (avgMetrics.improvement > 0.1) {
      insights.push('Positive improvement trend detected across session');
    } else if (avgMetrics.improvement < -0.1) {
      insights.push('Performance decline detected - consider fatigue or technical issues');
    }
    
    if (avgMetrics.consistency > 0.8) {
      insights.push('Highly consistent performance - excellent repeatability');
    } else if (avgMetrics.consistency < 0.5) {
      insights.push('Inconsistent performance - work on routine and focus');
    }
    
    return insights;
  }

  generateSessionRecommendations() {
    const recommendations = [];
    const avgMetrics = this.calculateAverageMetrics();
    const profile = this.generateOverallCharacterProfile();
    
    // Primary focus area
    const weakestArea = Object.entries(avgMetrics)
      .filter(([key]) => key !== 'overall')
      .sort((a, b) => a[1] - b[1])[0];
    
    recommendations.push({
      priority: 'primary',
      area: weakestArea[0],
      message: `Primary focus: Improve ${weakestArea[0].replace(/([A-Z])/g, ' $1').toLowerCase()}`,
      targetImprovement: Math.max(0.7, weakestArea[1] + 0.2)
    });
    
    // Character-specific recommendations
    if (profile.areasForGrowth.length > 0) {
      recommendations.push({
        priority: 'secondary',
        area: 'character',
        message: `Character development: Focus on ${profile.areasForGrowth[0]}`,
        exercises: this.getCharacterExercises(profile.areasForGrowth[0])
      });
    }
    
    // Coaching style recommendation
    recommendations.push({
      priority: 'coaching',
      area: 'approach',
      message: `Recommended coaching approach: ${profile.coachingStyle}`,
      athleteType: profile.type
    });
    
    return recommendations;
  }

  getCharacterExercises(trait) {
    const exercises = {
      determination: [
        'Set increasingly challenging goals',
        'Practice finishing strong in fatigue',
        'Visualization of overcoming obstacles'
      ],
      focus: [
        'Mindfulness meditation',
        'Single-point concentration drills',
        'Distraction training'
      ],
      resilience: [
        'Failure recovery drills',
        'Adversity simulation training',
        'Mental reset techniques'
      ],
      confidence: [
        'Success journaling',
        'Power posing exercises',
        'Positive self-talk routines'
      ],
      mental_toughness: [
        'Cold exposure training',
        'Extended focus sessions',
        'Pressure situation simulation'
      ]
    };
    
    return exercises[trait] || ['General mental training exercises'];
  }
}

// Export for use in worker or browser
export default BlazeVisionAI;