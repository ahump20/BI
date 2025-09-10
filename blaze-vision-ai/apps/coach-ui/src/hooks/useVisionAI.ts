/**
 * useVisionAI Hook - Real-time integration with edge gateway
 * Manages session state, telemetry streaming, and score updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { visionAI, SessionConfig, TelemetryPacket, GritScore } from '../services/VisionAIService';

interface SystemStats {
  fps: number;
  latency: number;
  packetsProcessed: number;
  errors: number;
  uptime: number;
}

interface VisionAIHook {
  // State
  currentGritScore: GritScore | null;
  isCapturing: boolean;
  systemStats: SystemStats;
  isConnected: boolean;
  error: string | null;
  
  // Actions
  startSession: (config: SessionConfig) => Promise<boolean>;
  stopSession: () => Promise<void>;
  sendTelemetry: (packets: TelemetryPacket[]) => Promise<void>;
  logEvent: (type: string, outcome?: any, meta?: any) => Promise<void>;
  sendCoachingCue: (type: string, message: string, meta?: any) => Promise<void>;
}

export const useVisionAI = (): VisionAIHook => {
  const [currentGritScore, setCurrentGritScore] = useState<GritScore | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    fps: 0,
    latency: 0,
    packetsProcessed: 0,
    errors: 0,
    uptime: 0
  });

  const sessionStartTime = useRef<number>(0);
  const scorePollingInterval = useRef<NodeJS.Timeout>();
  const healthCheckInterval = useRef<NodeJS.Timeout>();

  // Health check monitoring
  const checkHealth = useCallback(async () => {
    try {
      const healthy = await visionAI.checkHealth();
      setIsConnected(healthy);
      if (!healthy && isConnected) {
        setError('Gateway connection lost');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Health check failed');
    }
  }, [isConnected]);

  // Score polling for real-time updates
  const pollScores = useCallback(async () => {
    if (!visionAI.isSessionActive()) return;

    try {
      const result = await visionAI.getScores();
      if (result.success && result.scores.length > 0) {
        const latestScore = result.scores[result.scores.length - 1];
        setCurrentGritScore(latestScore);
        
        // Update system stats
        setSystemStats(prev => ({
          ...prev,
          packetsProcessed: prev.packetsProcessed + 1,
          uptime: Date.now() - sessionStartTime.current
        }));
      }
    } catch (err) {
      console.error('Score polling error:', err);
      setError(err instanceof Error ? err.message : 'Score polling failed');
      setSystemStats(prev => ({ ...prev, errors: prev.errors + 1 }));
    }
  }, []);

  // Start session with gateway
  const startSession = useCallback(async (config: SessionConfig): Promise<boolean> => {
    try {
      setError(null);
      setIsCapturing(true);
      
      const response = await visionAI.createSession(config);
      
      if (response.success) {
        sessionStartTime.current = Date.now();
        setIsConnected(true);
        
        // Start score polling (every 1 second)
        scorePollingInterval.current = setInterval(pollScores, 1000);
        
        console.log('Session started:', response.session_id);
        return true;
      } else {
        throw new Error('Session creation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session start failed');
      setIsCapturing(false);
      console.error('Session start error:', err);
      return false;
    }
  }, [pollScores]);

  // Stop session
  const stopSession = useCallback(async (): Promise<void> => {
    try {
      if (scorePollingInterval.current) {
        clearInterval(scorePollingInterval.current);
      }
      
      if (visionAI.isSessionActive()) {
        await visionAI.endSession();
      }
      
      setIsCapturing(false);
      setCurrentGritScore(null);
      setSystemStats({
        fps: 0,
        latency: 0,
        packetsProcessed: 0,
        errors: 0,
        uptime: 0
      });
      
      console.log('Session stopped');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session stop failed');
      console.error('Session stop error:', err);
    }
  }, []);

  // Send telemetry data
  const sendTelemetry = useCallback(async (packets: TelemetryPacket[]): Promise<void> => {
    if (!visionAI.isSessionActive()) {
      throw new Error('No active session');
    }

    try {
      const startTime = Date.now();
      const response = await visionAI.sendTelemetry(packets);
      const latency = Date.now() - startTime;
      
      if (response.success && response.scores.length > 0) {
        const latestScore = response.scores[response.scores.length - 1];
        setCurrentGritScore(latestScore);
        
        // Update real-time stats
        setSystemStats(prev => ({
          ...prev,
          latency: Math.round((prev.latency + latency) / 2), // Running average
          packetsProcessed: prev.packetsProcessed + packets.length,
          fps: Math.round(1000 / (Date.now() - sessionStartTime.current) * prev.packetsProcessed),
          uptime: Date.now() - sessionStartTime.current
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Telemetry failed');
      setSystemStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      throw err;
    }
  }, []);

  // Log events (pitch outcomes, etc.)
  const logEvent = useCallback(async (type: string, outcome?: any, meta?: any): Promise<void> => {
    const sessionId = visionAI.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    try {
      await visionAI.logEvent(sessionId, type, outcome, meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Event logging failed');
      throw err;
    }
  }, []);

  // Send coaching cues
  const sendCoachingCue = useCallback(async (type: string, message: string, meta?: any): Promise<void> => {
    const sessionId = visionAI.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    try {
      await visionAI.sendCoachingCue(sessionId, type, message, meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coaching cue failed');
      throw err;
    }
  }, []);

  // Initialize health monitoring
  useEffect(() => {
    // Initial health check
    checkHealth();
    
    // Periodic health checks (every 30 seconds)
    healthCheckInterval.current = setInterval(checkHealth, 30000);

    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
      if (scorePollingInterval.current) {
        clearInterval(scorePollingInterval.current);
      }
    };
  }, [checkHealth]);

  return {
    currentGritScore,
    isCapturing,
    systemStats,
    isConnected,
    error,
    startSession,
    stopSession,
    sendTelemetry,
    logEvent,
    sendCoachingCue
  };
};