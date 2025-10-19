/**
 * Blaze Intelligence Database Configuration
 * Neon PostgreSQL + Cloudflare D1 hybrid setup for optimal performance
 */

import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

class BlazeDatabase {
  constructor() {
    this.neonConnection = null;
    this.localPool = null;
    this.config = {
      neon: {
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: true,
        application_name: 'blaze-intelligence'
      },
      local: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'blaze_intelligence',
        user: process.env.DB_USER || 'blaze',
        password: process.env.DB_PASSWORD || 'blazepass',
        ssl: process.env.NODE_ENV === 'production'
      }
    };
    
    this.initializeConnections();
  }

  async initializeConnections() {
    try {
      // Initialize Neon connection for production
      if (this.config.neon.connectionString) {
        this.neonConnection = neon(this.config.neon.connectionString);
        console.log('✅ Neon database connection initialized');
      }

      // Initialize local PostgreSQL pool for development
      if (process.env.NODE_ENV === 'development' || !this.config.neon.connectionString) {
        this.localPool = new Pool(this.config.local);
        console.log('✅ Local PostgreSQL pool initialized');
      }
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Get appropriate connection based on environment
  getConnection() {
    if (this.neonConnection && process.env.NODE_ENV === 'production') {
      return this.neonConnection;
    }
    return this.localPool;
  }

  // Execute query with automatic connection selection
  async query(text, params = []) {
    const connection = this.getConnection();
    
    try {
      if (this.neonConnection && connection === this.neonConnection) {
        // Neon serverless query
        return await connection(text, params);
      } else {
        // Traditional pool query
        const client = await connection.connect();
        try {
          const result = await client.query(text, params);
          return result;
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  // Transaction support
  async transaction(callback) {
    const connection = this.getConnection();
    
    if (this.neonConnection && connection === this.neonConnection) {
      // Neon transactions
      return await connection.transaction(callback);
    } else {
      // Traditional transactions
      const client = await connection.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      return {
        status: 'healthy',
        connection_type: this.neonConnection ? 'neon' : 'local',
        timestamp: result.rows?.[0]?.current_time || result[0]?.current_time
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Close connections
  async close() {
    if (this.localPool) {
      await this.localPool.end();
    }
    // Neon connections are automatically managed
  }
}

// Models for sports data
export class PlayerModel {
  constructor(db) {
    this.db = db;
  }

  async findById(playerId) {
    const result = await this.db.query(
      'SELECT * FROM players WHERE player_id = $1',
      [playerId]
    );
    return result.rows?.[0] || result[0];
  }

  async findByTeam(teamId, limit = 50) {
    const result = await this.db.query(
      'SELECT * FROM players WHERE team_id = $1 ORDER BY hav_f_composite DESC LIMIT $2',
      [teamId, limit]
    );
    return result.rows || result;
  }

  async updateHAVF(playerId, havfData) {
    const result = await this.db.query(`
      UPDATE players 
      SET hav_f_champion_readiness = $2,
          hav_f_cognitive_leverage = $3,
          hav_f_nil_trust_score = $4,
          hav_f_composite = ($2 + $3 + $4) / 3,
          hav_f_updated_at = NOW()
      WHERE player_id = $1
      RETURNING *
    `, [
      playerId,
      havfData.champion_readiness,
      havfData.cognitive_leverage,
      havfData.nil_trust_score
    ]);
    return result.rows?.[0] || result[0];
  }

  async getTopProspects(sport = null, limit = 25) {
    const whereClause = sport ? 'WHERE sport = $2' : '';
    const params = sport ? [limit, sport] : [limit];
    
    const result = await this.db.query(`
      SELECT player_id, name, sport, team_id, position,
             hav_f_composite, hav_f_champion_readiness,
             hav_f_cognitive_leverage, hav_f_nil_trust_score
      FROM players 
      ${whereClause}
      ORDER BY hav_f_composite DESC 
      LIMIT $1
    `, params);
    
    return result.rows || result;
  }
}

export class TeamModel {
  constructor(db) {
    this.db = db;
  }

  async findById(teamId) {
    const result = await this.db.query(
      'SELECT * FROM teams WHERE team_id = $1',
      [teamId]
    );
    return result.rows?.[0] || result[0];
  }

  async updateReadiness(teamId, readinessScore, components = {}) {
    const result = await this.db.query(`
      UPDATE teams 
      SET readiness_score = $2,
          readiness_components = $3,
          readiness_updated_at = NOW()
      WHERE team_id = $1
      RETURNING *
    `, [teamId, readinessScore, JSON.stringify(components)]);
    
    return result.rows?.[0] || result[0];
  }

  async getAllReadiness() {
    const result = await this.db.query(`
      SELECT team_id, name, sport, readiness_score,
             CASE 
               WHEN readiness_score >= 80 THEN 'green'
               WHEN readiness_score >= 60 THEN 'yellow'
               ELSE 'red'
             END as status
      FROM teams 
      ORDER BY sport, readiness_score DESC
    `);
    
    return result.rows || result;
  }
}

// Singleton instance
let dbInstance = null;

export function createDatabase() {
  if (!dbInstance) {
    dbInstance = new BlazeDatabase();
  }
  return dbInstance;
}

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new BlazeDatabase();
  }
  return dbInstance;
}

// Export models with database instance
export function getModels() {
  const db = getDatabase();
  return {
    Player: new PlayerModel(db),
    Team: new TeamModel(db),
    db
  };
}

export default BlazeDatabase;