-- Blaze Intelligence Database Schema
-- D1 Database for production Cloudflare Workers

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT,
    interest TEXT,
    message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    responded_at TEXT,
    response_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Users table for authentication system
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    subscription_tier TEXT DEFAULT 'free',
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TEXT,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- User sessions table for JWT management
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    jwt_token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    last_used_at TEXT DEFAULT (datetime('now')),
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL, -- cents
    price_yearly INTEGER, -- cents
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    features TEXT, -- JSON array
    api_calls_limit INTEGER DEFAULT 1000,
    teams_limit INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TEXT,
    current_period_end TEXT,
    trial_end TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);

-- Teams/Organizations table
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    subscription_id TEXT,
    settings TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users (id),
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions (id)
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    permissions TEXT, -- JSON array
    invited_at TEXT,
    joined_at TEXT,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(team_id, user_id)
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    response_status INTEGER,
    processing_time_ms INTEGER,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    date_key TEXT NOT NULL, -- YYYY-MM-DD for daily aggregation
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Sports data storage (for analytics) - Legacy cache table
CREATE TABLE IF NOT EXISTS sports_data_cache (
    id TEXT PRIMARY KEY,
    league TEXT NOT NULL, -- 'mlb', 'nfl', 'nba', 'ncaa'
    team TEXT,
    data_type TEXT NOT NULL, -- 'roster', 'games', 'stats', etc.
    data TEXT NOT NULL, -- JSON data
    cached_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,
    source TEXT -- data source identifier
);

-- ====================================================================
-- LEAGUESCOPE AGENT TABLES - Comprehensive League-Wide Sports Intelligence
-- R2 Bucket: blaze-intelligence (large snapshots, archives, exports)
-- KV: Hot cached JSON for fast UI reads
-- ====================================================================

-- Core league registry for comprehensive coverage
CREATE TABLE IF NOT EXISTS leagues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    total_teams INTEGER NOT NULL,
    divisions INTEGER NOT NULL,
    season_type TEXT NOT NULL, -- 'regular', 'playoffs', 'offseason'
    current_season INTEGER NOT NULL,
    deep_south_focus BOOLEAN DEFAULT FALSE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Comprehensive team registry - All leagues, all levels
CREATE TABLE IF NOT EXISTS sports_teams (
    id TEXT PRIMARY KEY,
    league_id TEXT NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    abbr TEXT NOT NULL,
    division TEXT NOT NULL,
    conference TEXT,
    canonical_slug TEXT UNIQUE NOT NULL,
    deep_south BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    venue_name TEXT,
    venue_capacity INTEGER,
    founded_year INTEGER,
    colors_primary TEXT,
    colors_secondary TEXT,
    logo_url TEXT,
    website_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (league_id) REFERENCES leagues(id)
);

-- Live standings and records - Real-time competitive data
CREATE TABLE IF NOT EXISTS standings (
    id TEXT PRIMARY KEY,
    league_id TEXT NOT NULL,
    season INTEGER NOT NULL,
    team_id TEXT NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    pct REAL DEFAULT 0.0,
    games_back REAL DEFAULT 0.0,
    pythag_wins REAL,
    pythag_losses REAL,
    pythag_pct REAL,
    streak TEXT,
    home_record TEXT,
    away_record TEXT,
    last_10 TEXT,
    playoff_odds REAL,
    division_rank INTEGER,
    conference_rank INTEGER,
    league_rank INTEGER,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(league_id, season, team_id),
    FOREIGN KEY (league_id) REFERENCES leagues(id),
    FOREIGN KEY (team_id) REFERENCES sports_teams(id)
);

-- Game results and schedules - Complete game tracking
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    league_id TEXT NOT NULL,
    season INTEGER NOT NULL,
    game_date TEXT NOT NULL, -- ISO date string
    home_team_id TEXT NOT NULL,
    away_team_id TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT NOT NULL, -- 'scheduled', 'in_progress', 'final', 'postponed', 'cancelled'
    inning_half TEXT, -- For baseball: 'top', 'bottom', 'final'
    inning_number INTEGER, -- Current inning/quarter/period
    game_type TEXT, -- 'regular', 'playoff', 'exhibition'
    venue_name TEXT,
    weather_conditions TEXT,
    attendance INTEGER,
    duration_minutes INTEGER,
    r2_game_data_key TEXT, -- Reference to detailed game data in R2
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (league_id) REFERENCES leagues(id),
    FOREIGN KEY (home_team_id) REFERENCES sports_teams(id),
    FOREIGN KEY (away_team_id) REFERENCES sports_teams(id)
);

-- Advanced metrics and analytics - Championship-level intelligence
CREATE TABLE IF NOT EXISTS team_metrics (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    season INTEGER NOT NULL,
    metric_date TEXT NOT NULL, -- ISO date string
    elo_rating REAL,
    offensive_rating REAL,
    defensive_rating REAL,
    pace REAL,
    efficiency REAL,
    -- Baseball specific
    pythag_pct REAL,
    runs_scored_per_game REAL,
    runs_allowed_per_game REAL,
    team_era REAL,
    team_ops REAL,
    -- Football specific
    epa_per_play REAL,
    success_rate REAL,
    turnover_margin REAL,
    yards_per_play REAL,
    -- Basketball specific
    offensive_efficiency REAL,
    defensive_efficiency REAL,
    rebounding_rate REAL,
    assist_turnover_ratio REAL,
    -- NIL and recruiting
    nil_value_mid REAL,
    nil_value_low REAL,
    nil_value_high REAL,
    recruiting_rank INTEGER,
    transfer_portal_activity INTEGER,
    -- Performance trends
    form_last_5 TEXT,
    form_last_10 TEXT,
    home_advantage REAL,
    strength_of_schedule REAL,
    -- Metadata
    confidence_score REAL DEFAULT 0.85,
    data_sources TEXT, -- JSON array of sources
    r2_detailed_metrics_key TEXT, -- Reference to detailed metrics in R2
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(team_id, season, metric_date),
    FOREIGN KEY (team_id) REFERENCES sports_teams(id)
);

-- Player roster and basic stats (for key players)
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    league_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    jersey_number INTEGER,
    age INTEGER,
    height_inches INTEGER,
    weight_lbs INTEGER,
    experience_years INTEGER,
    college TEXT,
    hometown TEXT,
    salary INTEGER,
    nil_value REAL, -- For college players
    draft_year INTEGER,
    draft_round INTEGER,
    draft_pick INTEGER,
    status TEXT DEFAULT 'active', -- 'active', 'injured', 'suspended', 'inactive'
    r2_player_data_key TEXT, -- Detailed stats in R2
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (team_id) REFERENCES sports_teams(id),
    FOREIGN KEY (league_id) REFERENCES leagues(id)
);

-- Data ingestion tracking and integrity
CREATE TABLE IF NOT EXISTS ingestion_logs (
    id TEXT PRIMARY KEY,
    league_id TEXT NOT NULL,
    ingestion_type TEXT NOT NULL, -- 'teams', 'standings', 'games', 'metrics', 'players'
    start_time TEXT NOT NULL,
    end_time TEXT,
    status TEXT NOT NULL, -- 'running', 'success', 'failed', 'partial'
    records_processed INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    coverage_check_passed BOOLEAN DEFAULT FALSE,
    schema_validation_passed BOOLEAN DEFAULT FALSE,
    r2_backup_key TEXT, -- Backup of processed data
    error_details TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (league_id) REFERENCES leagues(id)
);

-- System configuration and feature flags
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- User analytics preferences
CREATE TABLE IF NOT EXISTS user_analytics_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    favorite_teams TEXT, -- JSON array
    notification_preferences TEXT, -- JSON
    dashboard_layout TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables TEXT, -- JSON array of template variables
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id_date ON api_usage(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_sports_data_cache_league_team ON sports_data_cache(league, team);
CREATE INDEX IF NOT EXISTS idx_sports_data_cache_expires_at ON sports_data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Insert default subscription plans
INSERT OR IGNORE INTO subscription_plans (
    id, name, price_monthly, price_yearly, features, api_calls_limit, teams_limit
) VALUES 
(
    'starter', 
    'Starter', 
    9900, -- $99/month
    99900, -- $999/year
    '["Basic analytics", "Team performance tracking", "Standard reporting", "Email support"]',
    10000,
    1
),
(
    'professional', 
    'Professional', 
    29900, -- $299/month
    299900, -- $2999/year
    '["Advanced analytics", "Predictive modeling", "Custom dashboards", "API access", "Priority support"]',
    100000,
    5
),
(
    'enterprise', 
    'Enterprise', 
    0, -- Custom pricing
    0,
    '["Full platform access", "Custom integrations", "Dedicated support", "White-label options", "Implementation consulting"]',
    1000000,
    -1 -- unlimited
);

-- Insert default email templates
INSERT OR IGNORE INTO email_templates (id, name, subject, html_content, text_content, variables) VALUES 
(
    'welcome', 
    'Welcome Email',
    'Welcome to Blaze Intelligence!',
    '<h1>Welcome {{name}}!</h1><p>Thank you for joining Blaze Intelligence. Your account is ready to use.</p>',
    'Welcome {{name}}! Thank you for joining Blaze Intelligence. Your account is ready to use.',
    '["name"]'
),
(
    'contact_auto_reply',
    'Contact Form Auto Reply',
    'Thank you for contacting Blaze Intelligence',
    '<h1>Thank you {{name}}!</h1><p>We have received your message and will get back to you within 24 hours.</p>',
    'Thank you {{name}}! We have received your message and will get back to you within 24 hours.',
    '["name"]'
);

-- Trigger to update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_user_subscriptions_updated_at 
    AFTER UPDATE ON user_subscriptions
    BEGIN
        UPDATE user_subscriptions SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_teams_updated_at 
    AFTER UPDATE ON teams
    BEGIN
        UPDATE teams SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_user_analytics_settings_updated_at
    AFTER UPDATE ON user_analytics_settings
    BEGIN
        UPDATE user_analytics_settings SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

-- ====================================================================
-- LEAGUESCOPE AGENT INDEXES AND INITIALIZATION
-- ====================================================================

-- Indexes for LeagueScope performance
CREATE INDEX IF NOT EXISTS idx_sports_teams_league ON sports_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_sports_teams_deep_south ON sports_teams(deep_south);
CREATE INDEX IF NOT EXISTS idx_sports_teams_featured ON sports_teams(featured);
CREATE INDEX IF NOT EXISTS idx_sports_teams_state ON sports_teams(state);
CREATE INDEX IF NOT EXISTS idx_standings_league_season ON standings(league_id, season);
CREATE INDEX IF NOT EXISTS idx_standings_team_season ON standings(team_id, season);
CREATE INDEX IF NOT EXISTS idx_games_league_date ON games(league_id, game_date);
CREATE INDEX IF NOT EXISTS idx_games_team_date ON games(home_team_id, game_date);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_team_metrics_team_date ON team_metrics(team_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_team_metrics_season ON team_metrics(season);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_league_type ON ingestion_logs(league_id, ingestion_type);

-- Initialize core leagues for comprehensive coverage
INSERT OR REPLACE INTO leagues (id, name, sport, total_teams, divisions, season_type, current_season, deep_south_focus) VALUES
('mlb', 'Major League Baseball', 'baseball', 30, 6, 'regular', 2025, 1),
('nfl', 'National Football League', 'football', 32, 8, 'regular', 2024, 1),
('nba', 'National Basketball Association', 'basketball', 30, 6, 'regular', 2024, 1),
('ncaa-fb', 'NCAA Division I Football', 'football', 130, 10, 'regular', 2024, 1),
('ncaa-bb', 'NCAA Division I Baseball', 'baseball', 300, 32, 'regular', 2025, 1),
('texas-hs', 'Texas High School Football', 'football', 1400, 6, 'regular', 2024, 1),
('perfect-game', 'Perfect Game Baseball', 'baseball', 5000, 11, 'tournament', 2025, 1);

-- Initialize LeagueScope system configuration
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('leaguescope_enabled', 'true', 'Master switch for LeagueScope agent'),
('ingestion_enabled', 'true', 'Master switch for data ingestion'),
('cache_ttl_seconds', '300', 'Default cache TTL for KV storage'),
('coverage_check_strict', 'true', 'Fail ingestion if coverage baseline not met'),
('deep_south_priority', 'true', 'Prioritize Deep South teams in rankings'),
('featured_teams', '["STL","TEN","MEM","TEX"]', 'Championship teams to feature'),
('r2_bucket_name', 'blaze-intelligence', 'R2 bucket for large data storage'),
('api_rate_limit', '1000', 'API requests per minute per IP'),
('live_update_interval', '60', 'Seconds between live game updates'),
('mlb_coverage_baseline', '30', 'Expected MLB team count'),
('nfl_coverage_baseline', '32', 'Expected NFL team count'),
('nba_coverage_baseline', '30', 'Expected NBA team count'),
('data_validation_enabled', 'true', 'Enable data validation before KV publish'),
('r2_backup_enabled', 'true', 'Enable R2 backups for ingestion'),
('league_wide_navigation', 'true', 'Enable intelligent navigation system');

-- Views for common LeagueScope queries
CREATE VIEW IF NOT EXISTS v_deep_south_teams AS
SELECT t.*, l.name as league_name, l.sport
FROM sports_teams t
JOIN leagues l ON t.league_id = l.id
WHERE t.deep_south = 1;

CREATE VIEW IF NOT EXISTS v_featured_teams AS
SELECT t.*, l.name as league_name, l.sport, s.wins, s.losses, s.pct
FROM sports_teams t
JOIN leagues l ON t.league_id = l.id
LEFT JOIN standings s ON t.id = s.team_id AND s.season = l.current_season
WHERE t.featured = 1;

CREATE VIEW IF NOT EXISTS v_current_standings AS
SELECT s.*, t.name as team_name, t.city, t.state, t.abbr, t.deep_south, t.featured, l.name as league_name
FROM standings s
JOIN sports_teams t ON s.team_id = t.id
JOIN leagues l ON s.league_id = l.id AND s.season = l.current_season;

CREATE VIEW IF NOT EXISTS v_live_games AS
SELECT g.*,
       ht.name as home_team_name, ht.abbr as home_abbr, ht.city as home_city,
       at.name as away_team_name, at.abbr as away_abbr, at.city as away_city,
       l.name as league_name, l.sport
FROM games g
JOIN sports_teams ht ON g.home_team_id = ht.id
JOIN sports_teams at ON g.away_team_id = at.id
JOIN leagues l ON g.league_id = l.id
WHERE g.status IN ('scheduled', 'in_progress');

CREATE VIEW IF NOT EXISTS v_team_metrics_current AS
SELECT tm.*, t.name as team_name, t.abbr, t.city, t.state, t.deep_south, t.featured, l.name as league_name, l.sport
FROM team_metrics tm
JOIN sports_teams t ON tm.team_id = t.id
JOIN leagues l ON l.id = t.league_id AND tm.season = l.current_season;

-- Triggers for LeagueScope updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_leagues_timestamp
AFTER UPDATE ON leagues
BEGIN
    UPDATE leagues SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sports_teams_timestamp
AFTER UPDATE ON sports_teams
BEGIN
    UPDATE sports_teams SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_standings_timestamp
AFTER UPDATE ON standings
BEGIN
    UPDATE standings SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_games_timestamp
AFTER UPDATE ON games
BEGIN
    UPDATE games SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_team_metrics_timestamp
AFTER UPDATE ON team_metrics
BEGIN
    UPDATE team_metrics SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_players_timestamp
AFTER UPDATE ON players
BEGIN
    UPDATE players SET updated_at = datetime('now') WHERE id = NEW.id;
END;