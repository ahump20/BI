/**
 * Session Durable Object - Core Tell Detector Processing
 * Ports our proven Grit Index fusion algorithm to Cloudflare Edge
 * Maintains session state and real-time dual-signal analysis
 */

import { DurableObject } from 'cloudflare:workers';
import type { 
  FeaturePacket, 
  ScorePacket, 
  AUIntensities, 
  BiomechAngles,
  StressLevel,
  PressureContext,
  GritComponents
} from '@blaze/capture-sdk';

import { DatabaseService } from './services/DatabaseService';

interface Environment {
  FEATURE_QUEUE: Queue;
  VISION_CACHE: KVNamespace;
  VISION_STORAGE: R2Bucket;
  DB: D1Database;
}

// Leverage Index calculation (ported from our Python implementation)
interface LeverageIndex {
  inning: number;
  outs: number; 
  bases: string;
  score_diff: number;
}

interface SessionState {
  session_id: string;
  player_id: string;
  sport: string;
  start_time: number;
  baseline_established: boolean;
  baseline_au: Partial<AUIntensities>;
  baseline_bio: Partial<BiomechAngles>;
  feature_history: FeaturePacket[];
  score_history: ScorePacket[];
  current_leverage: LeverageIndex;
  processing_stats: ProcessingStats;
}

interface ProcessingStats {
  frames_processed: number;
  avg_latency_ms: number;
  last_frame_time: number;
  error_count: number;
  fusion_calls: number;
}

export class SessionDurableObject extends DurableObject<Environment> {
  private sessionState: SessionState | null = null;
  private webSocketServer: WebSocketServer | null = null;
  private cleanupTimeout: NodeJS.Timeout | null = null;
  private dbService: DatabaseService | null = null;

  constructor(ctx: DurableObjectState, env: Environment) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.dbService = new DatabaseService(env.DB);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Initialize session state from storage
      if (!this.sessionState) {
        await this.loadSessionState();
      }

      switch (request.method) {
        case 'POST':
          if (path === '/session/start') {
            return await this.handleStartSession(request);
          } else if (path === '/telemetry') {
            return await this.handleTelemetry(request);
          } else if (path === '/event') {
            return await this.handleEvent(request);
          }
          break;

        case 'GET':
          if (path === '/stream') {
            return await this.handleWebSocketUpgrade(request);
          } else if (path === '/scores') {
            return await this.handleGetScores(request);
          } else if (path === '/status') {
            return await this.handleGetStatus();
          }
          break;

        case 'DELETE':
          if (path === '/session') {
            return await this.handleEndSession();
          }
          break;
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('SessionDO error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Start new analysis session
   */
  private async handleStartSession(request: Request): Promise<Response> {
    const body = await request.json() as {
      session_id: string;
      player_id: string;
      sport: string;
      consent_token?: string;
      target_fps?: number;
      enable_face?: boolean;
      enable_pose?: boolean;
      enable_rpg?: boolean;
    };

    const startTime = Date.now();

    this.sessionState = {
      session_id: body.session_id,
      player_id: body.player_id,
      sport: body.sport,
      start_time: startTime,
      baseline_established: false,
      baseline_au: {},
      baseline_bio: {},
      feature_history: [],
      score_history: [],
      current_leverage: { inning: 1, outs: 0, bases: '000', score_diff: 0 },
      processing_stats: {
        frames_processed: 0,
        avg_latency_ms: 0,
        last_frame_time: 0,
        error_count: 0,
        fusion_calls: 0
      }
    };

    // Persist to durable storage
    await this.ctx.storage.put('session_state', this.sessionState);

    // Persist to D1 database for analytics
    try {
      await this.dbService!.createSession({
        session_id: body.session_id,
        player_id: body.player_id,
        sport: body.sport as any,
        start_time: startTime,
        target_fps: body.target_fps || 60,
        enable_face: body.enable_face ?? true,
        enable_pose: body.enable_pose ?? true,
        enable_rpg: body.enable_rpg ?? false,
        consent_token: body.consent_token,
        status: 'active'
      });
    } catch (error) {
      console.error('Database session creation failed:', error);
      // Continue with session - DB failure shouldn't block real-time processing
    }

    // Set cleanup timeout (24 hours)
    this.cleanupTimeout = setTimeout(() => {
      this.handleEndSession();
    }, 24 * 60 * 60 * 1000);

    return new Response(JSON.stringify({ 
      success: true, 
      session_id: body.session_id,
      message: 'Session started successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Process incoming feature telemetry - CORE ALGORITHM
   */
  private async handleTelemetry(request: Request): Promise<Response> {
    if (!this.sessionState) {
      return new Response('No active session', { status: 400 });
    }

    const startTime = performance.now();
    const packets: FeaturePacket[] = await request.json();
    const scorePackets: ScorePacket[] = [];

    try {
      for (const packet of packets) {
        // Validate packet
        if (packet.session_id !== this.sessionState.session_id) {
          continue;
        }

        // Update processing stats
        this.sessionState.processing_stats.frames_processed++;
        this.sessionState.processing_stats.last_frame_time = Date.now();

        // Extract metrics from packet
        const microMetrics = this.extractMicroMetrics(packet);
        const bioMetrics = this.extractBioMetrics(packet);

        // Update baseline if needed
        this.updateBaseline(microMetrics, bioMetrics);

        // Calculate Grit Index using our proven fusion algorithm
        const gritScore = this.calculateGritIndex(
          microMetrics,
          bioMetrics,
          this.sessionState.current_leverage,
          packet.t
        );

        const scorePacket: ScorePacket = {
          session_id: packet.session_id,
          t: packet.t,
          grit: gritScore.grit_index,
          risk: gritScore.breakdown_risk,
          components: gritScore.components,
          explain: gritScore.explanations,
          pressure_context: gritScore.pressure_context,
          stress_level: gritScore.stress_level
        };

        scorePackets.push(scorePacket);

        // Store in history (keep last 300 for 5 minutes at 1Hz)
        this.sessionState.score_history.push(scorePacket);
        if (this.sessionState.score_history.length > 300) {
          this.sessionState.score_history.shift();
        }

        this.sessionState.feature_history.push(packet);
        if (this.sessionState.feature_history.length > 1000) {
          this.sessionState.feature_history.shift();
        }
      }

      // Update processing stats
      const processingTime = performance.now() - startTime;
      const currentAvg = this.sessionState.processing_stats.avg_latency_ms;
      const processedCount = this.sessionState.processing_stats.frames_processed;
      
      this.sessionState.processing_stats.avg_latency_ms = 
        (currentAvg * (processedCount - packets.length) + processingTime) / processedCount;

      // Persist state
      await this.ctx.storage.put('session_state', this.sessionState);

      // Cache latest scores in KV for fast UI access
      if (scorePackets.length > 0) {
        await this.env.VISION_CACHE.put(
          `scores:${this.sessionState.session_id}:latest`,
          JSON.stringify(scorePackets),
          { expirationTtl: 300 } // 5 minute TTL
        );
      }

      // Store scores in D1 database for analytics (async, non-blocking)
      if (scorePackets.length > 0) {
        this.storeScoresAsync(scorePackets, processingTime);
      }

      // Send to queue for downstream processing
      if (scorePackets.length > 0) {
        await this.env.FEATURE_QUEUE.send({
          session_id: this.sessionState.session_id,
          scores: scorePackets,
          timestamp: Date.now()
        });
      }

      // Broadcast to WebSocket clients
      if (this.webSocketServer && scorePackets.length > 0) {
        this.broadcastToClients(scorePackets);
      }

      return new Response(JSON.stringify({
        success: true,
        processed: packets.length,
        scores: scorePackets,
        processing_time_ms: processingTime
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      this.sessionState.processing_stats.error_count++;
      console.error('Telemetry processing error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Processing failed',
        processed: 0
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Extract micro-expression metrics from feature packet
   * Ports our AU intensity calculations from Python
   */
  private extractMicroMetrics(packet: FeaturePacket): AUIntensities | null {
    if (!packet.face) return null;

    // Return the AU intensities calculated by our Web SDK
    return packet.face.au_intensities;
  }

  /**
   * Extract biomechanical metrics from feature packet
   */
  private extractBioMetrics(packet: FeaturePacket): BiomechAngles | null {
    if (!packet.pose) return null;

    // Return the biomechanical angles calculated by our Web SDK
    return packet.pose.angles;
  }

  /**
   * Update baseline measurements for relative calculations
   * Ported from our Python baseline tracking
   */
  private updateBaseline(microMetrics: AUIntensities | null, bioMetrics: BiomechAngles | null): void {
    if (!this.sessionState) return;

    // Establish baseline after 5 seconds of data (150 frames at 30fps)
    if (!this.sessionState.baseline_established && 
        this.sessionState.feature_history.length >= 150) {
      
      // Calculate baseline AU values
      if (microMetrics) {
        this.sessionState.baseline_au = {
          au4: 1.0,      // Typical brow tension baseline
          au5_7: 0.8,    // Typical lid baseline
          au9_10: 0.5,   // Typical upper lip baseline
          au14: 0.3,     // Typical dimpler baseline
          au17_23_24: 1.2 // Typical jaw tension baseline
        };
      }

      // Calculate baseline biomechanical values
      if (bioMetrics) {
        this.sessionState.baseline_bio = {
          arm_slot: bioMetrics.arm_slot || 65.0,
          shoulder_separation: bioMetrics.shoulder_separation || 45.0,
          stride_length: bioMetrics.stride_length || 0.7,
          release_height: bioMetrics.release_height || 0.85,
          balance_score: bioMetrics.balance_score || 0.8,
          consistency_score: bioMetrics.consistency_score || 0.75
        };
      }

      this.sessionState.baseline_established = true;
      console.log('Baseline established for session:', this.sessionState.session_id);
    }
  }

  /**
   * CORE ALGORITHM: Calculate Grit Index - Ported from Python
   * This is our competitive advantage - dual-signal fusion with pressure context
   */
  private calculateGritIndex(
    microMetrics: AUIntensities | null,
    bioMetrics: BiomechAngles | null,
    leverage: LeverageIndex,
    timestamp: number
  ): {
    grit_index: number;
    breakdown_risk: number;
    components: GritComponents;
    explanations: string[];
    pressure_context: PressureContext;
    stress_level: StressLevel;
  } {
    this.sessionState!.processing_stats.fusion_calls++;

    // Calculate micro-expression component (0-100)
    const microScore = this.calculateMicroExpressionScore(microMetrics);
    
    // Calculate biomechanical component (0-100)  
    const bioScore = this.calculateBiomechanicalScore(bioMetrics);

    // Calculate pressure context
    const pressureContext = this.calculatePressureContext(leverage);
    const pressureWeight = this.getPressureWeight(pressureContext);

    // Calculate performance indicators
    const clutchFactor = this.calculateClutchFactor(pressureContext);
    const consistencyTrend = this.calculateConsistencyTrend();
    const fatigueIndicator = this.calculateFatigueIndicator();

    // Adaptive weighting based on signal quality and pressure
    const microWeight = pressureContext === 'critical' || pressureContext === 'high' ? 0.65 : 0.6;
    const bioWeight = 1.0 - microWeight;

    // Base composite calculation
    const baseGrit = (microWeight * microScore + bioWeight * bioScore);

    // Apply contextual factors (same as Python implementation)
    const pressureAdjustment = this.calculatePressureAdjustment(pressureContext);
    const consistencyFactor = this.calculateConsistencyFactor();
    const recoveryFactor = this.calculateRecoveryFactor();

    // Final Grit Index (0-100)
    const finalGrit = Math.max(0, Math.min(100, 
      baseGrit * (1 + pressureAdjustment) * consistencyFactor * recoveryFactor
    ));

    // Calculate breakdown risk (0-1)
    const breakdownRisk = this.calculateBreakdownRisk(finalGrit, pressureContext);

    // Generate explanations
    const explanations = this.generateExplanations(microScore, bioScore, pressureContext);

    // Determine stress level
    const stressLevel = this.determineStressLevel(microScore, finalGrit);

    return {
      grit_index: Math.round(finalGrit * 10) / 10, // Round to 1 decimal
      breakdown_risk: Math.round(breakdownRisk * 1000) / 1000, // Round to 3 decimals
      components: {
        micro_score: Math.round(microScore * 10) / 10,
        bio_score: Math.round(bioScore * 10) / 10,
        pressure_weight: pressureWeight,
        clutch_factor: clutchFactor,
        consistency_trend: consistencyTrend,
        fatigue_indicator: fatigueIndicator
      },
      explanations,
      pressure_context: pressureContext,
      stress_level: stressLevel
    };
  }

  /**
   * Calculate micro-expression component score
   * Uses our proven AU weighting system
   */
  private calculateMicroExpressionScore(metrics: AUIntensities | null): number {
    if (!metrics || !this.sessionState?.baseline_established) {
      return 50.0; // Neutral baseline
    }

    const baseline = this.sessionState.baseline_au;
    
    // Calculate stress components with our proven weights
    const stressComponents = {
      au4: Math.max(0, metrics.au4 - (baseline.au4 || 1.0)) * 2.0,    // Brow lowering (high weight)
      au5_7: Math.max(0, metrics.au5_7 - (baseline.au5_7 || 0.8)) * 1.5,  // Lid tightening
      au9_10: Math.max(0, metrics.au9_10 - (baseline.au9_10 || 0.5)) * 1.8, // Upper lip raiser
      au14: Math.max(0, metrics.au14 - (baseline.au14 || 0.3)) * 1.2,   // Dimpler
      au17_23_24: Math.max(0, metrics.au17_23_24 - (baseline.au17_23_24 || 1.2)) * 2.2  // Jaw tension (highest)
    };

    // Sum weighted stress indicators
    const totalStress = Object.values(stressComponents).reduce((a, b) => a + b, 0);
    const maxPossible = 2.0 + 1.5 + 1.8 + 1.2 + 2.2; // Sum of weights

    // Convert to 0-100 scale (inverted - higher stress = lower score)
    const stressRatio = Math.min(1, totalStress / maxPossible);
    return Math.max(0, 100 - (stressRatio * 100));
  }

  /**
   * Calculate biomechanical component score
   * Based on consistency and efficiency metrics
   */
  private calculateBiomechanicalScore(metrics: BiomechAngles | null): number {
    if (!metrics || !this.sessionState?.baseline_established) {
      return 50.0; // Neutral baseline
    }

    const baseline = this.sessionState.baseline_bio;
    let score = 100; // Start at perfect

    // Deduct for deviations from baseline (same logic as Python)
    if (baseline.arm_slot) {
      const armSlotDrift = Math.abs(metrics.arm_slot - baseline.arm_slot);
      score -= Math.min(20, armSlotDrift * 2); // Max 20 point penalty
    }

    if (baseline.stride_length) {
      const strideDrift = Math.abs(metrics.stride_length - baseline.stride_length);
      score -= Math.min(15, strideDrift * 30); // Max 15 point penalty
    }

    // Add points for good metrics
    score += Math.min(10, (metrics.balance_score || 0.5) * 10);
    score += Math.min(10, (metrics.consistency_score || 0.5) * 10);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate pressure context using baseball Leverage Index
   * Ported from our Python implementation
   */
  private calculatePressureContext(leverage: LeverageIndex): PressureContext {
    const li = this.calculateLeverageValue(leverage);
    
    if (li < 1.0) return 'low';
    if (li < 2.0) return 'medium';  
    if (li < 3.0) return 'high';
    return 'critical';
  }

  private calculateLeverageValue(leverage: LeverageIndex): number {
    // Base pressure by base situation
    const basePressure: Record<string, number> = {
      '000': 1.0, '100': 1.2, '010': 1.4, '001': 1.5,
      '110': 1.6, '101': 1.8, '011': 2.0, '111': 2.2
    };

    const base = basePressure[leverage.bases] || 1.0;
    const inning = Math.min(2.0, 0.8 + (leverage.inning / 9.0));
    const outs = [1.0, 1.3, 1.8][leverage.outs] || 1.0;
    const score = Math.abs(leverage.score_diff) <= 1 ? 1.5 : 
                  Math.abs(leverage.score_diff) <= 3 ? 1.2 : 0.8;

    return Math.min(5.0, base * inning * outs * score);
  }

  // Additional helper methods for completeness...
  private getPressureWeight(context: PressureContext): number {
    const weights = { low: 0.1, medium: 0.2, high: 0.3, critical: 0.4 };
    return weights[context];
  }

  private calculateClutchFactor(context: PressureContext): number {
    // Simplified clutch calculation - would use historical data in production
    return context === 'critical' ? 0.8 : context === 'high' ? 0.7 : 0.6;
  }

  private calculateConsistencyTrend(): number {
    if (!this.sessionState || this.sessionState.score_history.length < 10) return 0;
    
    const recent = this.sessionState.score_history.slice(-10);
    const variance = this.calculateVariance(recent.map(s => s.grit));
    return Math.max(-1, Math.min(1, 1 - variance / 100));
  }

  private calculateFatigueIndicator(): number {
    if (!this.sessionState || this.sessionState.score_history.length < 30) return 0;
    
    const early = this.sessionState.score_history.slice(0, 10);
    const recent = this.sessionState.score_history.slice(-10);
    const earlyAvg = early.reduce((a, b) => a + b.grit, 0) / early.length;
    const recentAvg = recent.reduce((a, b) => a + b.grit, 0) / recent.length;
    
    return Math.max(0, Math.min(1, (earlyAvg - recentAvg) / earlyAvg));
  }

  private calculatePressureAdjustment(context: PressureContext): number {
    const adjustments = { low: 0, medium: -0.02, high: -0.05, critical: -0.1 };
    return adjustments[context];
  }

  private calculateConsistencyFactor(): number {
    if (!this.sessionState || this.sessionState.score_history.length < 5) return 1.0;
    
    const recent = this.sessionState.score_history.slice(-5);
    const variance = this.calculateVariance(recent.map(s => s.grit));
    return Math.max(0.8, Math.min(1.2, 1 - variance / 400));
  }

  private calculateRecoveryFactor(): number {
    // Simplified recovery calculation
    return 1.0; // Would implement bounce-back analysis in production
  }

  private calculateBreakdownRisk(grit: number, context: PressureContext): number {
    const baseRisk = Math.max(0, (70 - grit) / 70); // Risk increases as grit decreases
    const pressureMultiplier = context === 'critical' ? 1.5 : context === 'high' ? 1.2 : 1.0;
    return Math.min(1, baseRisk * pressureMultiplier);
  }

  private generateExplanations(micro: number, bio: number, context: PressureContext): string[] {
    const explanations: string[] = [];
    
    if (micro < 40) explanations.push('high_stress_detected');
    if (bio < 50) explanations.push('mechanics_breaking_down');
    if (context === 'critical') explanations.push('critical_pressure_situation');
    if (micro < 30) explanations.push('micro_expression_spikes');
    
    return explanations;
  }

  private determineStressLevel(microScore: number, grit: number): StressLevel {
    if (microScore < 30 || grit < 30) return 'critical';
    if (microScore < 50 || grit < 50) return 'high';
    if (microScore < 70 || grit < 70) return 'moderate';
    return 'low';
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Handle WebSocket upgrade for real-time streaming
   */
  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[0];
    const server = webSocketPair[1];

    server.accept();
    
    // Initialize WebSocket server if not exists
    if (!this.webSocketServer) {
      this.webSocketServer = new WebSocketServer();
    }

    this.webSocketServer.addClient(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * Get historical scores for UI
   */
  private async handleGetScores(request: Request): Promise<Response> {
    if (!this.sessionState) {
      return new Response('No active session', { status: 400 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const scores = this.sessionState.score_history
      .slice(offset, offset + limit)
      .reverse(); // Most recent first

    return new Response(JSON.stringify({
      success: true,
      scores,
      total: this.sessionState.score_history.length,
      session_id: this.sessionState.session_id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Get session status and stats
   */
  private async handleGetStatus(): Promise<Response> {
    if (!this.sessionState) {
      return new Response(JSON.stringify({ active: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      active: true,
      session_id: this.sessionState.session_id,
      player_id: this.sessionState.player_id,
      uptime_ms: Date.now() - this.sessionState.start_time,
      baseline_established: this.sessionState.baseline_established,
      processing_stats: this.sessionState.processing_stats,
      score_count: this.sessionState.score_history.length,
      latest_score: this.sessionState.score_history[this.sessionState.score_history.length - 1]
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * End session and cleanup
   */
  private async handleEndSession(): Promise<Response> {
    if (!this.sessionState) {
      return new Response('No active session', { status: 400 });
    }

    // Final stats
    const sessionSummary = {
      session_id: this.sessionState.session_id,
      player_id: this.sessionState.player_id,
      duration_ms: Date.now() - this.sessionState.start_time,
      frames_processed: this.sessionState.processing_stats.frames_processed,
      avg_latency_ms: this.sessionState.processing_stats.avg_latency_ms,
      final_grit_avg: this.sessionState.score_history.length > 0 
        ? this.sessionState.score_history.reduce((sum, s) => sum + s.grit, 0) / this.sessionState.score_history.length 
        : 0
    };

    // Store final session data
    await this.env.VISION_STORAGE.put(
      `session-summary/${this.sessionState.session_id}.json`,
      JSON.stringify(sessionSummary)
    );

    // Cleanup
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
    }

    if (this.webSocketServer) {
      this.webSocketServer.closeAll();
    }

    await this.ctx.storage.deleteAll();
    this.sessionState = null;

    return new Response(JSON.stringify({
      success: true,
      message: 'Session ended',
      summary: sessionSummary
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async loadSessionState(): Promise<void> {
    const stored = await this.ctx.storage.get<SessionState>('session_state');
    if (stored) {
      this.sessionState = stored;
    }
  }

  private broadcastToClients(scores: ScorePacket[]): void {
    // WebSocket implementation would go here
    // Simplified for demo
  }

  // Handle update to game situation
  async handleUpdateGameSituation(request: Request): Promise<Response> {
    if (!this.sessionState) {
      return new Response('No active session', { status: 400 });
    }

    const body = await request.json() as LeverageIndex;
    this.sessionState.current_leverage = body;
    
    await this.ctx.storage.put('session_state', this.sessionState);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Store scores in database asynchronously (non-blocking for real-time performance)
   */
  private storeScoresAsync(scores: ScorePacket[], processingTime: number): void {
    // Fire and forget - don't await to avoid blocking real-time processing
    this.dbService!.storeGritScores(
      scores.map(score => ({
        session_id: score.session_id,
        timestamp: score.t,
        grit_index: score.grit,
        breakdown_risk: score.risk,
        micro_score: score.components.micro_score,
        bio_score: score.components.bio_score,
        pressure_weight: score.components.pressure_weight,
        clutch_factor: score.components.clutch_factor,
        consistency_trend: score.components.consistency_trend,
        fatigue_indicator: score.components.fatigue_indicator,
        pressure_context: score.pressure_context,
        stress_level: score.stress_level,
        processing_latency_ms: Math.round(processingTime)
      }))
    ).catch(error => {
      console.error('Async score storage failed:', error);
      // Update error count but don't block processing
      if (this.sessionState) {
        this.sessionState.processing_stats.error_count++;
      }
    });
  }
}

// Simple WebSocket server implementation
class WebSocketServer {
  private clients: WebSocket[] = [];

  addClient(ws: WebSocket): void {
    this.clients.push(ws);
    
    ws.addEventListener('close', () => {
      const index = this.clients.indexOf(ws);
      if (index > -1) {
        this.clients.splice(index, 1);
      }
    });
  }

  broadcast(message: string): void {
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  closeAll(): void {
    this.clients.forEach(ws => ws.close());
    this.clients = [];
  }
}