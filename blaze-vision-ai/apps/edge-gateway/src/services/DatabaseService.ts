/**
 * Database Service - D1 Analytics Storage
 * Handles persistent storage of session data, scores, and player analytics
 */

export interface SessionRecord {
  session_id: string;
  player_id: string;
  sport: 'baseball' | 'softball' | 'football' | 'basketball';
  start_time: number;
  end_time?: number;
  target_fps: number;
  enable_face: boolean;
  enable_pose: boolean;
  enable_rpg: boolean;
  consent_token?: string;
  status: 'active' | 'completed' | 'terminated' | 'error';
}

export interface GritScoreRecord {
  session_id: string;
  timestamp: number;
  grit_index: number;
  breakdown_risk: number;
  micro_score: number;
  bio_score: number;
  pressure_weight: number;
  clutch_factor: number;
  consistency_trend: number;
  fatigue_indicator: number;
  pressure_context: 'low' | 'medium' | 'high' | 'critical';
  stress_level: 'low' | 'medium' | 'high';
  processing_latency_ms?: number;
}

export interface GameSituationRecord {
  session_id: string;
  timestamp: number;
  inning: number;
  outs: number;
  bases: string;
  score_diff: number;
  leverage_index: number;
}

export interface EventRecord {
  session_id: string;
  timestamp: number;
  event_type: string;
  event_label?: string;
  outcome?: string;
  metadata?: string;
}

export class DatabaseService {
  private db: D1Database;

  constructor(database: D1Database) {
    this.db = database;
  }

  // Session management
  async createSession(session: SessionRecord): Promise<void> {
    await this.db.prepare(`
      INSERT INTO sessions (
        session_id, player_id, sport, start_time, target_fps,
        enable_face, enable_pose, enable_rpg, consent_token, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.session_id,
      session.player_id,
      session.sport,
      session.start_time,
      session.target_fps,
      session.enable_face ? 1 : 0,
      session.enable_pose ? 1 : 0,
      session.enable_rpg ? 1 : 0,
      session.consent_token,
      session.status
    ).run();
  }

  async updateSessionStatus(sessionId: string, status: string, endTime?: number): Promise<void> {
    if (endTime) {
      await this.db.prepare(`
        UPDATE sessions SET status = ?, end_time = ? WHERE session_id = ?
      `).bind(status, endTime, sessionId).run();
    } else {
      await this.db.prepare(`
        UPDATE sessions SET status = ? WHERE session_id = ?
      `).bind(status, sessionId).run();
    }
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const result = await this.db.prepare(`
      SELECT * FROM sessions WHERE session_id = ?
    `).bind(sessionId).first();

    if (!result) return null;

    return {
      session_id: result.session_id as string,
      player_id: result.player_id as string,
      sport: result.sport as any,
      start_time: result.start_time as number,
      end_time: result.end_time as number,
      target_fps: result.target_fps as number,
      enable_face: Boolean(result.enable_face),
      enable_pose: Boolean(result.enable_pose),
      enable_rpg: Boolean(result.enable_rpg),
      consent_token: result.consent_token as string,
      status: result.status as any
    };
  }

  // Grit score storage
  async storeGritScores(scores: GritScoreRecord[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO grit_scores (
        session_id, timestamp, grit_index, breakdown_risk,
        micro_score, bio_score, pressure_weight, clutch_factor,
        consistency_trend, fatigue_indicator, pressure_context,
        stress_level, processing_latency_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const batch = scores.map(score => 
      stmt.bind(
        score.session_id,
        score.timestamp,
        score.grit_index,
        score.breakdown_risk,
        score.micro_score,
        score.bio_score,
        score.pressure_weight,
        score.clutch_factor,
        score.consistency_trend,
        score.fatigue_indicator,
        score.pressure_context,
        score.stress_level,
        score.processing_latency_ms
      )
    );

    await this.db.batch(batch);
  }

  async getGritScores(sessionId: string, limit: number = 100): Promise<GritScoreRecord[]> {
    const results = await this.db.prepare(`
      SELECT * FROM grit_scores 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).bind(sessionId, limit).all();

    return results.results.map(row => ({
      session_id: row.session_id as string,
      timestamp: row.timestamp as number,
      grit_index: row.grit_index as number,
      breakdown_risk: row.breakdown_risk as number,
      micro_score: row.micro_score as number,
      bio_score: row.bio_score as number,
      pressure_weight: row.pressure_weight as number,
      clutch_factor: row.clutch_factor as number,
      consistency_trend: row.consistency_trend as number,
      fatigue_indicator: row.fatigue_indicator as number,
      pressure_context: row.pressure_context as any,
      stress_level: row.stress_level as any,
      processing_latency_ms: row.processing_latency_ms as number
    }));
  }

  // Game situation tracking
  async storeGameSituation(situation: GameSituationRecord): Promise<void> {
    await this.db.prepare(`
      INSERT INTO game_situations (
        session_id, timestamp, inning, outs, bases, score_diff, leverage_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      situation.session_id,
      situation.timestamp,
      situation.inning,
      situation.outs,
      situation.bases,
      situation.score_diff,
      situation.leverage_index
    ).run();
  }

  // Event logging
  async storeEvent(event: EventRecord): Promise<void> {
    await this.db.prepare(`
      INSERT INTO events (session_id, timestamp, event_type, event_label, outcome, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      event.session_id,
      event.timestamp,
      event.event_type,
      event.event_label,
      event.outcome,
      event.metadata
    ).run();
  }

  // Analytics queries
  async getPlayerSessionSummary(playerId: string, sport?: string): Promise<any[]> {
    const query = sport
      ? `SELECT * FROM session_summary WHERE player_id = ? AND sport = ? ORDER BY start_time DESC LIMIT 10`
      : `SELECT * FROM session_summary WHERE player_id = ? ORDER BY start_time DESC LIMIT 10`;

    const params = sport ? [playerId, sport] : [playerId];
    const result = await this.db.prepare(query).bind(...params).all();
    
    return result.results;
  }

  async getPlayerPerformanceTrends(playerId: string, days: number = 30): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM player_performance_trends 
      WHERE player_id = ? 
      AND session_date >= date('now', '-' || ? || ' days')
      ORDER BY session_date DESC
    `).bind(playerId, days).all();

    return result.results;
  }

  // Player baselines
  async updatePlayerBaseline(
    playerId: string,
    sport: string,
    baselineType: string,
    metricName: string,
    value: number,
    confidence?: number,
    sampleSize?: number
  ): Promise<void> {
    await this.db.prepare(`
      INSERT OR REPLACE INTO player_baselines (
        player_id, sport, baseline_type, metric_name, baseline_value,
        confidence_interval, sample_size, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      playerId,
      sport,
      baselineType,
      metricName,
      value,
      confidence,
      sampleSize,
      Date.now()
    ).run();
  }

  async getPlayerBaselines(playerId: string, sport: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM player_baselines 
      WHERE player_id = ? AND sport = ?
      ORDER BY baseline_type, metric_name
    `).bind(playerId, sport).all();

    return result.results;
  }

  // Coaching cues
  async storeCoachingCue(
    sessionId: string,
    timestamp: number,
    cueType: string,
    message: string,
    triggerGrit?: number,
    triggerRisk?: number,
    metadata?: string
  ): Promise<void> {
    await this.db.prepare(`
      INSERT INTO coaching_cues (
        session_id, timestamp, cue_type, message, trigger_grit, trigger_risk, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      timestamp,
      cueType,
      message,
      triggerGrit,
      triggerRisk,
      metadata
    ).run();
  }

  // System analytics
  async getSystemStats(): Promise<any> {
    const [sessionsToday, totalScores, avgLatency] = await Promise.all([
      this.db.prepare(`
        SELECT COUNT(*) as count FROM sessions 
        WHERE start_time > strftime('%s', 'now', 'start of day')
      `).first(),
      
      this.db.prepare(`
        SELECT COUNT(*) as count FROM grit_scores
      `).first(),
      
      this.db.prepare(`
        SELECT AVG(processing_latency_ms) as avg_latency 
        FROM grit_scores 
        WHERE processing_latency_ms IS NOT NULL
        AND timestamp > strftime('%s', 'now', '-1 hour')
      `).first()
    ]);

    return {
      sessions_today: sessionsToday?.count || 0,
      total_scores: totalScores?.count || 0,
      avg_latency_ms: Math.round((avgLatency?.avg_latency as number) || 0)
    };
  }
}