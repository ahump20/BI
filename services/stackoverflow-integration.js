/**
 * Blaze Intelligence Stack Overflow Integration Service
 * Provides developer support through automated Q&A monitoring and expert responses
 */

import axios from 'axios';
import { getDatabase } from '../config/database.js';

class StackOverflowIntegration {
  constructor() {
    this.baseURL = 'https://api.stackexchange.com/2.3';
    this.site = 'stackoverflow';
    this.apiKey = process.env.STACKOVERFLOW_API_KEY;
    this.tags = [
      'blaze-intelligence',
      'sports-analytics',
      'hav-f-scoring',
      'perfect-game-api',
      'sports-data-api',
      'neon-database',
      'cloudflare-workers'
    ];
    this.db = getDatabase();
    
    // Rate limiting: 300 requests per day for unregistered apps
    this.requestCount = 0;
    this.dailyLimit = this.apiKey ? 10000 : 300;
    this.lastReset = new Date().toDateString();
    
    this.init();
  }

  async init() {
    console.log('🔧 Stack Overflow Integration initialized');
    
    // Create tags if they don't exist (requires moderator privileges)
    if (this.apiKey) {
      await this.ensureTagsExist();
    }
    
    // Start monitoring for new questions
    this.startMonitoring();
  }

  // Check rate limit
  checkRateLimit() {
    const today = new Date().toDateString();
    if (this.lastReset !== today) {
      this.requestCount = 0;
      this.lastReset = today;
    }
    
    if (this.requestCount >= this.dailyLimit) {
      throw new Error('Stack Overflow API rate limit exceeded');
    }
  }

  // Make API request with rate limiting
  async makeRequest(endpoint, params = {}) {
    this.checkRateLimit();
    
    const config = {
      method: 'GET',
      url: `${this.baseURL}${endpoint}`,
      params: {
        site: this.site,
        key: this.apiKey,
        ...params
      },
      headers: {
        'User-Agent': 'Blaze Intelligence Support Bot 1.0'
      }
    };

    try {
      const response = await axios(config);
      this.requestCount++;
      
      // Handle API quotas and backoff
      if (response.data.backoff) {
        console.warn(`⏳ Stack Overflow API backoff: ${response.data.backoff} seconds`);
        await new Promise(resolve => setTimeout(resolve, response.data.backoff * 1000));
      }
      
      return response.data;
    } catch (error) {
      console.error('Stack Overflow API error:', error.message);
      throw error;
    }
  }

  // Monitor for new questions with Blaze Intelligence tags
  async getRecentQuestions(days = 7) {
    const fromDate = Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000);
    
    try {
      const response = await this.makeRequest('/questions', {
        tagged: this.tags.join(';'),
        fromdate: fromDate,
        order: 'desc',
        sort: 'creation',
        filter: 'withbody'
      });

      return response.items || [];
    } catch (error) {
      console.error('Failed to fetch recent questions:', error);
      return [];
    }
  }

  // Search for questions related to specific topics
  async searchQuestions(query, tags = null) {
    try {
      const params = {
        intitle: query,
        order: 'desc',
        sort: 'relevance',
        filter: 'withbody'
      };
      
      if (tags) {
        params.tagged = Array.isArray(tags) ? tags.join(';') : tags;
      }

      const response = await this.makeRequest('/search', params);
      return response.items || [];
    } catch (error) {
      console.error('Question search failed:', error);
      return [];
    }
  }

  // Get question details with answers
  async getQuestionDetails(questionId) {
    try {
      const [questionResponse, answersResponse] = await Promise.all([
        this.makeRequest(`/questions/${questionId}`, {
          filter: 'withbody'
        }),
        this.makeRequest(`/questions/${questionId}/answers`, {
          filter: 'withbody',
          order: 'desc',
          sort: 'votes'
        })
      ]);

      const question = questionResponse.items?.[0];
      const answers = answersResponse.items || [];

      return {
        question,
        answers,
        hasAcceptedAnswer: answers.some(a => a.is_accepted),
        topAnswer: answers[0] || null
      };
    } catch (error) {
      console.error('Failed to get question details:', error);
      return null;
    }
  }

  // Generate automated response for common Blaze Intelligence questions
  generateAutomatedResponse(question) {
    const title = question.title.toLowerCase();
    const body = question.body.toLowerCase();
    
    // Common patterns and responses
    const patterns = [
      {
        keywords: ['hav-f', 'havf', 'champion readiness', 'cognitive leverage'],
        response: this.getHAVFResponse()
      },
      {
        keywords: ['api', 'endpoint', 'rest', 'documentation'],
        response: this.getAPIResponse()
      },
      {
        keywords: ['neon', 'database', 'postgresql', 'connection'],
        response: this.getDatabaseResponse()
      },
      {
        keywords: ['docker', 'deployment', 'container', 'cloudflare'],
        response: this.getDeploymentResponse()
      },
      {
        keywords: ['perfect game', 'youth baseball', 'recruitment'],
        response: this.getPerfectGameResponse()
      },
      {
        keywords: ['sports data', 'mlb', 'nfl', 'nba', 'ncaa'],
        response: this.getSportsDataResponse()
      }
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
        return pattern.response;
      }
    }

    return this.getGenericResponse();
  }

  getHAVFResponse() {
    return `
## HAV-F Scoring System

The HAV-F (Human Athletic Value-Function) scoring system is Blaze Intelligence's proprietary framework for evaluating athlete potential:

**Components:**
- **Champion Readiness** (0-100): Performance under pressure
- **Cognitive Leverage** (0-100): Decision-making ability
- **NIL Trust Score** (0-100): Market value potential

**Usage:**
\`\`\`javascript
const { getModels } = require('./config/database');
const { Player } = getModels();

// Update HAV-F scores
await Player.updateHAVF('NCAA-TEX-0001', {
  champion_readiness: 75.8,
  cognitive_leverage: 82.4,
  nil_trust_score: 91.2
});
\`\`\`

**API Endpoint:**
\`GET /api/players/{player_id}\` - Returns full HAV-F breakdown

**Documentation:** [Blaze Intelligence API Docs](https://github.com/ahump20/BI/blob/main/05_DOCS/technical/blaze-api-documentation.md)
    `.trim();
  }

  getAPIResponse() {
    return `
## Blaze Intelligence API

**Base URL:** \`https://blaze-intelligence-api.humphrey-austin20.workers.dev\`

**Key Endpoints:**
- \`GET /api/health\` - System status
- \`GET /api/prospects\` - Top-ranked players
- \`GET /api/players/{id}\` - Player details with HAV-F
- \`GET /api/teams\` - Team readiness scores
- \`GET /api/readiness\` - Current readiness data

**Example:**
\`\`\`bash
curl "https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/prospects?sport=NCAA-FB&limit=10"
\`\`\`

**Authentication:** API keys coming in v2.1.0

**Rate Limits:** 1000 requests/hour (public beta)

**Full Documentation:** [API Guide](https://github.com/ahump20/BI/blob/main/05_DOCS/technical/blaze-api-documentation.md)
    `.trim();
  }

  getDatabaseResponse() {
    return `
## Database Integration (Neon PostgreSQL)

**Setup:**
\`\`\`javascript
import { getDatabase, getModels } from './config/database.js';

const db = getDatabase();
const { Player, Team } = getModels();
\`\`\`

**Environment Variables:**
\`\`\`
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
\`\`\`

**Docker Setup:**
\`\`\`yaml
services:
  blaze-app:
    environment:
      - DATABASE_URL=\${NEON_DATABASE_URL}
\`\`\`

**Schema:** See [init.sql](https://github.com/ahump20/BI/blob/main/schemas/init.sql) for complete database schema.

**Models:** Players, Teams, Games, HAV-F scoring tables included.
    `.trim();
  }

  getDeploymentResponse() {
    return `
## Deployment Options

**Docker (Recommended):**
\`\`\`bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker-compose up -d
\`\`\`

**Cloudflare Workers:**
\`\`\`bash
npm run deploy
# or
wrangler pages deploy
\`\`\`

**Local Development:**
\`\`\`bash
npm install
npm run serve
\`\`\`

**Configuration:** See [wrangler.toml](https://github.com/ahump20/BI/blob/main/wrangler.toml) for Cloudflare setup.

**Environment:** Copy \`.env.example\` to \`.env\` and configure your API keys.
    `.trim();
  }

  getPerfectGameResponse() {
    return `
## Perfect Game Integration

Perfect Game provides youth baseball data for recruitment analytics.

**API Endpoint:** \`GET /api/perfect-game-integration\`

**Data Includes:**
- Player profiles and rankings  
- Tournament results
- Showcase performances
- College commitment tracking

**Youth Baseball Analytics:**
- HAV-F scoring for prospects
- Performance trending
- Recruitment recommendations

**Configuration:** Set \`PERFECT_GAME_API_KEY\` in environment variables.

**Documentation:** [Youth Baseball Guide](https://github.com/ahump20/BI/tree/main/data/youth-baseball)
    `.trim();
  }

  getSportsDataResponse() {
    return `
## Sports Data Integration

Blaze Intelligence integrates multiple sports data sources:

**Supported Leagues:**
- **MLB:** Cardinals-focused + league coverage
- **NFL:** Titans + comprehensive data  
- **NBA:** Grizzlies + league analytics
- **NCAA:** Longhorns + college sports

**Data Sources:**
- MLB Stats API
- ESPN API  
- SportsDataIO
- Perfect Game (youth)

**Real-time Updates:**
- Live game analysis
- Performance tracking
- Injury status monitoring

**API Examples:**
\`\`\`bash
# Get Cardinals analytics
curl "/api/cardinals/analytics"

# Get team readiness
curl "/api/readiness/MLB-STL"
\`\`\`
    `.trim();
  }

  getGenericResponse() {
    return `
## Blaze Intelligence Support

Thanks for your question about Blaze Intelligence! 

**Resources:**
- **Documentation:** [GitHub Repository](https://github.com/ahump20/BI)
- **API Docs:** [Technical Guide](https://github.com/ahump20/BI/blob/main/05_DOCS/technical/blaze-api-documentation.md)
- **Architecture:** [System Diagrams](https://github.com/ahump20/BI/blob/main/docs/architecture-diagrams.md)

**Quick Start:**
\`\`\`bash
git clone https://github.com/ahump20/BI.git
cd BI
npm install
npm run serve
\`\`\`

**Support:**
- **Email:** api-support@blaze-intelligence.com
- **GitHub Issues:** [Report Issues](https://github.com/ahump20/BI/issues)
- **Developer Discord:** Join our community

Please provide more specific details about your use case for a more targeted answer!
    `.trim();
  }

  // Monitor for questions and provide automated responses
  async monitorAndRespond() {
    try {
      const questions = await this.getRecentQuestions(1); // Check last 24 hours
      
      for (const question of questions) {
        // Check if we've already responded
        const hasResponse = await this.checkExistingResponse(question.question_id);
        if (hasResponse) continue;

        // Generate automated response
        const response = this.generateAutomatedResponse(question);
        
        // Log the potential response (actual posting requires authentication)
        console.log(`📝 Generated response for question ${question.question_id}:`);
        console.log(`Title: ${question.title}`);
        console.log(`Response: ${response.substring(0, 200)}...`);
        
        // Store in database for manual review
        await this.storeResponseForReview(question, response);
      }
    } catch (error) {
      console.error('Monitoring failed:', error);
    }
  }

  // Check if we've already responded to a question
  async checkExistingResponse(questionId) {
    try {
      const result = await this.db.query(
        'SELECT 1 FROM stackoverflow_responses WHERE question_id = $1',
        [questionId]
      );
      return (result.rows?.length || result.length) > 0;
    } catch (error) {
      // Table might not exist yet
      return false;
    }
  }

  // Store response for manual review and posting
  async storeResponseForReview(question, response) {
    try {
      await this.db.query(`
        INSERT INTO stackoverflow_responses 
        (question_id, title, body, generated_response, status, created_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW())
        ON CONFLICT (question_id) DO NOTHING
      `, [
        question.question_id,
        question.title,
        question.body,
        response
      ]);
    } catch (error) {
      console.error('Failed to store response:', error);
    }
  }

  // Get questions that need expert review
  async getPendingResponses() {
    try {
      const result = await this.db.query(`
        SELECT * FROM stackoverflow_responses 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `);
      return result.rows || result;
    } catch (error) {
      console.error('Failed to get pending responses:', error);
      return [];
    }
  }

  // Start background monitoring
  startMonitoring() {
    // Check every 4 hours to stay within rate limits
    const interval = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    setInterval(async () => {
      console.log('🔍 Monitoring Stack Overflow for new questions...');
      await this.monitorAndRespond();
    }, interval);

    // Initial check
    setTimeout(() => this.monitorAndRespond(), 5000);
  }

  // Ensure tags exist (requires high reputation or moderator privileges)
  async ensureTagsExist() {
    try {
      for (const tag of this.tags) {
        const response = await this.makeRequest('/tags', {
          inname: tag,
          order: 'desc',
          sort: 'popular'
        });
        
        const tagExists = response.items?.some(t => t.name === tag);
        if (!tagExists) {
          console.log(`⚠️ Tag '${tag}' doesn't exist on Stack Overflow`);
          console.log('Tags need to be created through community moderation or sufficient reputation');
        }
      }
    } catch (error) {
      console.error('Tag verification failed:', error);
    }
  }

  // Get community statistics
  async getCommunityStats() {
    try {
      const questions = await this.getRecentQuestions(30); // Last 30 days
      const answered = questions.filter(q => q.is_answered).length;
      const accepted = questions.filter(q => q.accepted_answer_id).length;
      
      return {
        total_questions: questions.length,
        answered_questions: answered,
        accepted_answers: accepted,
        answer_rate: questions.length > 0 ? (answered / questions.length * 100).toFixed(1) : 0,
        acceptance_rate: answered > 0 ? (accepted / answered * 100).toFixed(1) : 0,
        avg_score: questions.reduce((sum, q) => sum + q.score, 0) / questions.length || 0
      };
    } catch (error) {
      console.error('Failed to get community stats:', error);
      return {};
    }
  }
}

// Create database table for response tracking
async function createResponseTable() {
  const db = getDatabase();
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS stackoverflow_responses (
        id SERIAL PRIMARY KEY,
        question_id INTEGER UNIQUE NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        generated_response TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        posted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_stackoverflow_status 
      ON stackoverflow_responses(status)
    `);
  } catch (error) {
    console.error('Failed to create response table:', error);
  }
}

// Initialize table on module load
createResponseTable();

export default StackOverflowIntegration;
export { StackOverflowIntegration };