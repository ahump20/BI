-- Blaze Intelligence Database Schema
-- PostgreSQL/Neon compatible initialization script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enable Row Level Security
ALTER SYSTEM SET row_security = on;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    team_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(20) NOT NULL,
    league VARCHAR(50),
    division VARCHAR(50),
    readiness_score DECIMAL(5,2) DEFAULT 0,
    readiness_components JSONB,
    readiness_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table with HAV-F integration
CREATE TABLE IF NOT EXISTS players (
    player_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(20) NOT NULL,
    league VARCHAR(50),
    team_id VARCHAR(20) REFERENCES teams(team_id),
    position VARCHAR(10) NOT NULL,
    
    -- Biographical data
    date_of_birth DATE,
    height_cm INTEGER,
    weight_kg INTEGER,
    class_year VARCHAR(20),
    
    -- HAV-F Scores
    hav_f_champion_readiness DECIMAL(5,2),
    hav_f_cognitive_leverage DECIMAL(5,2),
    hav_f_nil_trust_score DECIMAL(5,2),
    hav_f_composite DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN hav_f_champion_readiness IS NOT NULL 
                 AND hav_f_cognitive_leverage IS NOT NULL 
                 AND hav_f_nil_trust_score IS NOT NULL
            THEN (hav_f_champion_readiness + hav_f_cognitive_leverage + hav_f_nil_trust_score) / 3
            ELSE NULL
        END
    ) STORED,
    hav_f_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Current season stats (JSONB for flexibility)
    stats_current JSONB,
    projections_next JSONB,
    
    -- NIL Profile
    nil_valuation_usd INTEGER,
    nil_engagement_rate DECIMAL(5,2),
    nil_followers_total INTEGER,
    nil_deals_90d INTEGER,
    nil_deal_value_90d INTEGER,
    
    -- Biometric data
    biometric_hrv_rmssd DECIMAL(6,2),
    biometric_reaction_ms INTEGER,
    biometric_gsr_microsiemens DECIMAL(8,3),
    biometric_sleep_hours DECIMAL(4,2),
    
    -- Injury status
    injury_status VARCHAR(20) DEFAULT 'healthy',
    injury_details JSONB,
    
    -- Metadata
    data_sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games/Matches table
CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(30) PRIMARY KEY,
    sport VARCHAR(20) NOT NULL,
    league VARCHAR(50),
    home_team_id VARCHAR(20) REFERENCES teams(team_id),
    away_team_id VARCHAR(20) REFERENCES teams(team_id),
    game_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled',
    
    -- Scores
    home_score INTEGER,
    away_score INTEGER,
    
    -- Game context
    game_type VARCHAR(30), -- regular, playoff, championship
    venue VARCHAR(100),
    attendance INTEGER,
    
    -- Weather (for outdoor sports)
    weather_conditions JSONB,
    
    -- Advanced analytics
    win_probability_data JSONB,
    key_moments JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player performance in games
CREATE TABLE IF NOT EXISTS player_game_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id VARCHAR(30) REFERENCES players(player_id),
    game_id VARCHAR(30) REFERENCES games(game_id),
    
    -- Universal stats
    minutes_played DECIMAL(5,2),
    performance_score DECIMAL(5,2),
    
    -- Sport-specific stats (JSONB for flexibility)
    stats JSONB NOT NULL,
    
    -- Biometric data during game
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    stress_score DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(player_id, game_id)
);

-- Analytics cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User accounts (for API access)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(64) UNIQUE,
    plan VARCHAR(20) DEFAULT 'free',
    rate_limit_per_hour INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_code INTEGER,
    response_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_team_sport ON players(team_id, sport);
CREATE INDEX IF NOT EXISTS idx_players_havf_composite ON players(hav_f_composite DESC) WHERE hav_f_composite IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_sport_position ON players(sport, position);
CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport);
CREATE INDEX IF NOT EXISTS idx_teams_readiness ON teams(readiness_score DESC);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_player ON player_game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_game ON player_game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_timestamp ON api_usage(user_id, timestamp);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_players_name_gin ON players USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_teams_name_gin ON teams USING gin(name gin_trgm_ops);

-- Create views for common queries
CREATE OR REPLACE VIEW team_readiness_summary AS
SELECT 
    t.team_id,
    t.name,
    t.sport,
    t.readiness_score,
    CASE 
        WHEN t.readiness_score >= 80 THEN 'green'
        WHEN t.readiness_score >= 60 THEN 'yellow'
        ELSE 'red'
    END as status,
    COUNT(p.player_id) as player_count,
    AVG(p.hav_f_composite) as avg_havf,
    COUNT(CASE WHEN p.injury_status != 'healthy' THEN 1 END) as injured_count
FROM teams t
LEFT JOIN players p ON t.team_id = p.team_id
GROUP BY t.team_id, t.name, t.sport, t.readiness_score;

CREATE OR REPLACE VIEW top_prospects_view AS
SELECT 
    p.player_id,
    p.name,
    p.sport,
    p.team_id,
    t.name as team_name,
    p.position,
    p.hav_f_composite,
    p.hav_f_champion_readiness,
    p.hav_f_cognitive_leverage,
    p.hav_f_nil_trust_score,
    p.nil_valuation_usd,
    PERCENT_RANK() OVER (
        PARTITION BY p.sport, p.position 
        ORDER BY p.hav_f_composite
    ) * 100 as percentile_rank
FROM players p
JOIN teams t ON p.team_id = t.team_id
WHERE p.hav_f_composite IS NOT NULL
ORDER BY p.hav_f_composite DESC;

-- Insert sample teams
INSERT INTO teams (team_id, name, sport, league, readiness_score) VALUES
    ('MLB-STL', 'St. Louis Cardinals', 'MLB', 'National League', 67.4),
    ('NFL-TEN', 'Tennessee Titans', 'NFL', 'AFC South', 58.1),
    ('NBA-MEM', 'Memphis Grizzlies', 'NBA', 'Western Conference', 74.2),
    ('NCAA-TEX', 'Texas Longhorns', 'NCAA-FB', 'Big 12', 82.5)
ON CONFLICT (team_id) DO NOTHING;

-- Insert sample players
INSERT INTO players (player_id, name, sport, team_id, position, hav_f_champion_readiness, hav_f_cognitive_leverage, hav_f_nil_trust_score, nil_valuation_usd) VALUES
    ('NCAA-TEX-0001', 'Quinn Ewers', 'NCAA-FB', 'NCAA-TEX', 'QB', 75.8, 82.4, 91.2, 1200000),
    ('MLB-STL-0001', 'Paul Goldschmidt', 'MLB', 'MLB-STL', '1B', 62.3, 78.9, 45.2, 0),
    ('NFL-TEN-0001', 'Derrick Henry', 'NFL', 'NFL-TEN', 'RB', 89.1, 71.5, 67.8, 0),
    ('NBA-MEM-0001', 'Ja Morant', 'NBA', 'NBA-MEM', 'PG', 91.2, 88.7, 94.3, 0)
ON CONFLICT (player_id) DO NOTHING;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_player_havf(
    p_player_id VARCHAR(30),
    p_champion_readiness DECIMAL(5,2),
    p_cognitive_leverage DECIMAL(5,2),
    p_nil_trust_score DECIMAL(5,2)
) RETURNS TABLE(player_id VARCHAR(30), composite_score DECIMAL(5,2)) AS $$
BEGIN
    UPDATE players 
    SET hav_f_champion_readiness = p_champion_readiness,
        hav_f_cognitive_leverage = p_cognitive_leverage,
        hav_f_nil_trust_score = p_nil_trust_score,
        hav_f_updated_at = NOW(),
        updated_at = NOW()
    WHERE players.player_id = p_player_id;
    
    RETURN QUERY
    SELECT players.player_id, players.hav_f_composite
    FROM players
    WHERE players.player_id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Set up automatic updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies (basic setup)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Allow read access to public sports data
CREATE POLICY public_read_teams ON teams FOR SELECT USING (true);
CREATE POLICY public_read_players ON players FOR SELECT USING (true);
CREATE POLICY public_read_games ON games FOR SELECT USING (true);

-- Restrict user data access
CREATE POLICY user_own_data ON users FOR ALL USING (user_id = current_setting('blaze.current_user_id')::uuid);
CREATE POLICY user_own_usage ON api_usage FOR ALL USING (user_id = current_setting('blaze.current_user_id')::uuid);

COMMIT;