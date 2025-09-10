/**
 * Live Gateway Test Component
 * Tests real-time connection to production edge gateway
 */

import React, { useState, useEffect } from 'react';
import { visionAI } from '../services/VisionAIService';
import type { SessionConfig, TelemetryPacket } from '../services/VisionAIService';

const LiveGatewayTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [latestScore, setLatestScore] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    // Test gateway health on mount
    const testHealth = async () => {
      try {
        const healthy = await visionAI.checkHealth();
        setIsConnected(healthy);
        addLog(healthy ? '✅ Gateway healthy' : '❌ Gateway unhealthy');
      } catch (error) {
        addLog(`❌ Health check failed: ${error}`);
      }
    };

    testHealth();
    const interval = setInterval(testHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const testSession = async () => {
    try {
      const config: SessionConfig = {
        session_id: crypto.randomUUID(),
        player_id: 'test_pitcher_' + Date.now(),
        sport: 'baseball',
        target_fps: 60,
        enable_face: true,
        enable_pose: true
      };

      addLog('🚀 Creating test session...');
      const response = await visionAI.createSession(config);
      
      setSessionId(response.session_id);
      addLog(`✅ Session created: ${response.session_id.substring(0, 8)}...`);
    } catch (error) {
      addLog(`❌ Session failed: ${error}`);
    }
  };

  const testTelemetry = async () => {
    if (!sessionId) {
      addLog('❌ No active session');
      return;
    }

    try {
      const packet: TelemetryPacket = {
        session_id: sessionId,
        t: Date.now(),
        face: {
          blink: 0,
          eye_ar: 0.28,
          gaze: [0.1, -0.05, 0.95],
          head_euler: [2.1, -1.4, 0.3],
          au_intensities: {
            au4: 0.15 + Math.random() * 0.1,
            au5_7: 0.08 + Math.random() * 0.05,
            au9_10: 0.12 + Math.random() * 0.08,
            au14: 0.05 + Math.random() * 0.03,
            au17_23_24: 0.22 + Math.random() * 0.1
          },
          qc: {
            detection_confidence: 0.94,
            tracking_stability: 0.88,
            motion_blur: 0.15,
            illumination: 0.75,
            occlusion_ratio: 0.02
          }
        },
        pose: {
          kp: [[100, 200, 0.9, 0.85], [110, 205, 0.91, 0.87]],
          angles: {
            arm_slot: 85.2 + (Math.random() - 0.5) * 5,
            shoulder_separation: 42.1 + (Math.random() - 0.5) * 3,
            stride_length: 0.68 + (Math.random() - 0.5) * 0.1,
            release_height: 6.2 + (Math.random() - 0.5) * 0.3,
            balance_score: 0.82 + (Math.random() - 0.5) * 0.2,
            consistency_score: 0.76 + (Math.random() - 0.5) * 0.15
          },
          qc: {
            detection_confidence: 0.92,
            tracking_stability: 0.85,
            motion_blur: 0.12,
            illumination: 0.78,
            occlusion_ratio: 0.03
          }
        },
        device: {
          fps: 60,
          resolution: [1920, 1080],
          has_webgpu: true,
          has_webgl: true,
          camera_count: 2
        }
      };

      addLog('📊 Sending telemetry packet...');
      const response = await visionAI.sendTelemetry([packet]);
      
      if (response.success && response.scores.length > 0) {
        const score = response.scores[0];
        setLatestScore(score);
        addLog(`✅ Grit: ${score.grit} | Risk: ${score.risk} | Latency: ${response.gateway_latency_ms}ms`);
      }
    } catch (error) {
      addLog(`❌ Telemetry failed: ${error}`);
    }
  };

  const testScores = async () => {
    if (!sessionId) {
      addLog('❌ No active session');
      return;
    }

    try {
      addLog('📈 Fetching scores...');
      const response = await visionAI.getScores(sessionId);
      
      if (response.success && response.scores.length > 0) {
        const latest = response.scores[response.scores.length - 1];
        setLatestScore(latest);
        addLog(`✅ Retrieved ${response.scores.length} scores`);
      } else {
        addLog('⚠️ No scores available');
      }
    } catch (error) {
      addLog(`❌ Score fetch failed: ${error}`);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      addLog('🛑 Ending session...');
      await visionAI.endSession(sessionId);
      setSessionId(null);
      setLatestScore(null);
      addLog('✅ Session ended');
    } catch (error) {
      addLog(`❌ End session failed: ${error}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid #BF5700',
      borderRadius: '8px',
      padding: '20px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000,
      maxHeight: '600px',
      overflow: 'auto'
    }}>
      <h3 style={{ color: '#BF5700', margin: '0 0 15px 0' }}>🔥 Live Gateway Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        <br />
        <strong>Session:</strong> {sessionId ? `🟢 Active (${sessionId.substring(0, 8)}...)` : '🔴 None'}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
        <button
          onClick={testSession}
          disabled={sessionId !== null}
          style={{
            background: sessionId ? '#666' : '#BF5700',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: sessionId ? 'not-allowed' : 'pointer',
            fontSize: '11px'
          }}
        >
          Create Session
        </button>
        
        <button
          onClick={testTelemetry}
          disabled={!sessionId}
          style={{
            background: !sessionId ? '#666' : '#FFB81C',
            border: 'none',
            color: 'black',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: !sessionId ? 'not-allowed' : 'pointer',
            fontSize: '11px'
          }}
        >
          Send Data
        </button>
        
        <button
          onClick={testScores}
          disabled={!sessionId}
          style={{
            background: !sessionId ? '#666' : '#FF7A00',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: !sessionId ? 'not-allowed' : 'pointer',
            fontSize: '11px'
          }}
        >
          Get Scores
        </button>
        
        <button
          onClick={endSession}
          disabled={!sessionId}
          style={{
            background: !sessionId ? '#666' : '#dc3545',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: !sessionId ? 'not-allowed' : 'pointer',
            fontSize: '11px'
          }}
        >
          End Session
        </button>
      </div>

      {latestScore && (
        <div style={{ 
          background: 'rgba(191, 87, 0, 0.1)', 
          border: '1px solid #BF5700', 
          borderRadius: '4px', 
          padding: '10px', 
          marginBottom: '15px' 
        }}>
          <strong style={{ color: '#BF5700' }}>Latest Score:</strong><br />
          Grit: <span style={{ color: '#FFB81C' }}>{latestScore.grit}</span><br />
          Risk: <span style={{ color: latestScore.risk > 0.5 ? '#dc3545' : '#28a745' }}>{latestScore.risk}</span><br />
          Context: <span style={{ color: '#FF7A00' }}>{latestScore.pressure_context}</span><br />
          Stress: <span style={{ color: '#FFB81C' }}>{latestScore.stress_level}</span>
        </div>
      )}

      <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '4px', padding: '8px', maxHeight: '200px', overflow: 'auto' }}>
        <strong style={{ color: '#BF5700' }}>Console:</strong>
        {logs.map((log, i) => (
          <div key={i} style={{ margin: '2px 0', fontSize: '10px' }}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default LiveGatewayTest;