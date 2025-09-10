-- Blaze Vision AI Analytics Database Schema
-- Designed for high-performance time-series analytics on player performance

-- Sessions table - Core session metadata
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    sport TEXT CHECK(sport IN ('baseball', 'softball', 'football', 'basketball')) NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    target_fps INTEGER DEFAULT 60,
    enable_face BOOLEAN DEFAULT true,
    enable_pose BOOLEAN DEFAULT true,
    enable_rpg BOOLEAN DEFAULT false,
    consent_token TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'terminated', 'error')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Grit scores table - Time-series performance data
CREATE TABLE IF NOT EXISTS grit_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    grit_index REAL NOT NULL,
    breakdown_risk REAL NOT NULL,
    micro_score REAL NOT NULL,
    bio_score REAL NOT NULL,
    pressure_weight REAL NOT NULL,
    clutch_factor REAL NOT NULL,
    consistency_trend REAL NOT NULL,
    fatigue_indicator REAL NOT NULL,
    pressure_context TEXT CHECK(pressure_context IN ('low', 'medium', 'high', 'critical')),
    stress_level TEXT CHECK(stress_level IN ('low', 'medium', 'high')),
    processing_latency_ms INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- Game situations table - Baseball context data
CREATE TABLE IF NOT EXISTS game_situations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    inning INTEGER NOT NULL CHECK(inning >= 1 AND inning <= 15),
    outs INTEGER NOT NULL CHECK(outs >= 0 AND outs <= 2),
    bases TEXT NOT NULL CHECK(bases GLOB '[01][01][01]'),
    score_diff INTEGER NOT NULL CHECK(score_diff >= -50 AND score_diff <= 50),
    leverage_index REAL NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- Events table - Pitch outcomes and coaching interventions
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'pitch', 'swing', 'outcome', 'coaching_cue', etc.
    event_label TEXT,
    outcome TEXT,
    metadata TEXT, -- JSON blob for flexible data
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- Telemetry raw data table - High-frequency sensor data (optional, for detailed analysis)
CREATE TABLE IF NOT EXISTS telemetry_packets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    packet_type TEXT NOT NULL CHECK(packet_type IN ('face', 'pose', 'device')),
    data TEXT NOT NULL, -- JSON blob with all metrics
    quality_score REAL, -- Overall quality/confidence
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- Player baselines table - Historical performance benchmarks
CREATE TABLE IF NOT EXISTS player_baselines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    sport TEXT NOT NULL,
    baseline_type TEXT NOT NULL, -- 'micro', 'bio', 'composite'
    metric_name TEXT NOT NULL,
    baseline_value REAL NOT NULL,
    confidence_interval REAL,
    sample_size INTEGER,
    last_updated INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    UNIQUE(player_id, sport, baseline_type, metric_name)
);

-- Coaching cues table - AI-generated recommendations
CREATE TABLE IF NOT EXISTS coaching_cues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    cue_type TEXT NOT NULL CHECK(cue_type IN ('reset', 'drill', 'mechanical', 'mental')),
    message TEXT NOT NULL,
    trigger_grit REAL,
    trigger_risk REAL,
    effectiveness_score REAL, -- Post-analysis effectiveness
    metadata TEXT, -- JSON with additional context
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_grit_scores_session_time ON grit_scores(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session_type ON events(session_id, event_type);
CREATE INDEX IF NOT EXISTS idx_sessions_player_sport ON sessions(player_id, sport);
CREATE INDEX IF NOT EXISTS idx_game_situations_session ON game_situations(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_baselines_player ON player_baselines(player_id, sport, baseline_type);

-- Views for common analytics queries
CREATE VIEW IF NOT EXISTS session_summary AS
SELECT 
    s.session_id,
    s.player_id,
    s.sport,
    s.start_time,
    s.end_time,
    (s.end_time - s.start_time) as duration_seconds,
    COUNT(gs.id) as total_scores,
    AVG(gs.grit_index) as avg_grit,
    MAX(gs.grit_index) as peak_grit,
    MIN(gs.grit_index) as lowest_grit,
    AVG(gs.breakdown_risk) as avg_risk,
    COUNT(CASE WHEN gs.pressure_context = 'critical' THEN 1 END) as critical_moments,
    COUNT(e.id) as total_events
FROM sessions s
LEFT JOIN grit_scores gs ON s.session_id = gs.session_id
LEFT JOIN events e ON s.session_id = e.session_id
GROUP BY s.session_id;

CREATE VIEW IF NOT EXISTS player_performance_trends AS
SELECT 
    s.player_id,
    s.sport,
    DATE(s.start_time, 'unixepoch') as session_date,
    COUNT(DISTINCT s.session_id) as sessions_count,
    AVG(gs.grit_index) as daily_avg_grit,
    AVG(gs.breakdown_risk) as daily_avg_risk,
    AVG(gs.consistency_trend) as daily_consistency,
    AVG(gs.fatigue_indicator) as daily_fatigue
FROM sessions s
JOIN grit_scores gs ON s.session_id = gs.session_id
WHERE s.status = 'completed'
GROUP BY s.player_id, s.sport, DATE(s.start_time, 'unixepoch')
ORDER BY s.player_id, session_date;