/**
 * Vision AI Service - Gateway Integration
 * Handles all communication with the Blaze Vision AI edge gateway
 */

import { API_CONFIG, buildEndpointUrl } from '../config/api';

export interface SessionConfig {
  session_id: string;
  player_id: string;
  sport: 'baseball' | 'softball' | 'football' | 'basketball';
  consent_token?: string;
  target_fps?: number;
  enable_face?: boolean;
  enable_pose?: boolean;
  enable_rpg?: boolean;
}

export interface TelemetryPacket {
  session_id: string;
  t: number;
  face?: {
    blink: 0 | 1;
    eye_ar: number;
    gaze: [number, number, number];
    head_euler: [number, number, number];
    au_intensities: {
      au4: number;
      au5_7: number;
      au9_10: number;
      au14: number;
      au17_23_24: number;
    };
    qc: {
      detection_confidence: number;
      tracking_stability: number;
      motion_blur: number;
      illumination: number;
      occlusion_ratio: number;
    };
  };
  pose?: {
    kp: number[][];
    angles: {
      arm_slot: number;
      shoulder_separation: number;
      stride_length: number;
      release_height: number;
      balance_score: number;
      consistency_score: number;
    };
    qc: {
      detection_confidence: number;
      tracking_stability: number;
      motion_blur: number;
      illumination: number;
      occlusion_ratio: number;
    };
  };
  device: {
    fps: number;
    resolution: [number, number];
    has_webgpu: boolean;
    has_webgl: boolean;
    camera_count: number;
  };
}

export interface GritScore {
  session_id: string;
  t: number;
  grit: number;
  risk: number;
  components: {
    micro_score: number;
    bio_score: number;
    pressure_weight: number;
    clutch_factor: number;
    consistency_trend: number;
    fatigue_indicator: number;
  };
  explain: string[];
  pressure_context: 'low' | 'medium' | 'high' | 'critical';
  stress_level: 'low' | 'medium' | 'high';
}

export interface SessionResponse {
  success: boolean;
  session_id: string;
  message: string;
}

export interface TelemetryResponse {
  success: boolean;
  processed: number;
  scores: GritScore[];
  processing_time_ms: number;
  gateway_latency_ms: number;
}

export class VisionAIService {
  private sessionId: string | null = null;
  private isConnected = false;

  async createSession(config: SessionConfig): Promise<SessionResponse> {
    const response = await fetch(buildEndpointUrl('SESSION_START'), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Session creation failed: ${error.error}`);
    }

    const result = await response.json();
    this.sessionId = result.session_id;
    this.isConnected = true;
    
    return result;
  }

  async sendTelemetry(packets: TelemetryPacket[]): Promise<TelemetryResponse> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(buildEndpointUrl('TELEMETRY'), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(packets)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telemetry failed: ${error.error}`);
    }

    return response.json();
  }

  async getScores(sessionId?: string): Promise<{ success: boolean; scores: GritScore[] }> {
    const id = sessionId || this.sessionId;
    if (!id) {
      throw new Error('No session ID provided');
    }

    const response = await fetch(buildEndpointUrl('SCORES', { sessionId: id }), {
      headers: API_CONFIG.HEADERS
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Score retrieval failed: ${error.error}`);
    }

    return response.json();
  }

  async getSessionStatus(sessionId?: string): Promise<any> {
    const id = sessionId || this.sessionId;
    if (!id) {
      throw new Error('No session ID provided');
    }

    const response = await fetch(buildEndpointUrl('STATUS', { sessionId: id }), {
      headers: API_CONFIG.HEADERS
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Status retrieval failed: ${error.error}`);
    }

    return response.json();
  }

  async endSession(sessionId?: string): Promise<void> {
    const id = sessionId || this.sessionId;
    if (!id) {
      throw new Error('No session ID provided');
    }

    const response = await fetch(buildEndpointUrl('SCORES', { sessionId: id }), {
      method: 'DELETE',
      headers: API_CONFIG.HEADERS
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Session end failed: ${error.error}`);
    }

    this.sessionId = null;
    this.isConnected = false;
  }

  async logEvent(sessionId: string, type: string, outcome?: any, meta?: any): Promise<void> {
    const response = await fetch(buildEndpointUrl('EVENT'), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        session_id: sessionId,
        type,
        outcome,
        meta
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Event logging failed: ${error.error}`);
    }
  }

  async sendCoachingCue(sessionId: string, type: string, message: string, meta?: any): Promise<void> {
    const response = await fetch(buildEndpointUrl('CUE'), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        session_id: sessionId,
        type,
        message,
        meta
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Coaching cue failed: ${error.error}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(buildEndpointUrl('HEALTH'));
      const health = await response.json();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  isSessionActive(): boolean {
    return this.isConnected && this.sessionId !== null;
  }
}

// Singleton instance
export const visionAI = new VisionAIService();