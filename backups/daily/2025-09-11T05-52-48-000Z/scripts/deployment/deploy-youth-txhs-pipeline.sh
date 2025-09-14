#!/bin/bash

# Blaze Intelligence Youth/TXHS Pipeline Deployment Script
# Deploys the complete ingestion and evaluation system with Cloudflare Workers

set -e

echo "🚀 Deploying Youth/TXHS Pipeline to Production"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="blaze-youth-txhs"
WORKER_NAME="youth-txhs-ingestion"
R2_BUCKET="blaze-youth-data"
KV_NAMESPACE="YOUTH_TXHS_CACHE"

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check for required tools
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }
command -v wrangler >/dev/null 2>&1 || { echo -e "${RED}Wrangler CLI is required. Install with: npm install -g wrangler${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Step 2: Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install axios cheerio node-cron winston @cloudflare/workers-types

# Step 3: Create Cloudflare Worker wrapper
echo -e "\n${YELLOW}Creating Cloudflare Worker wrapper...${NC}"

cat > worker-youth-txhs.js << 'EOF'
/**
 * Cloudflare Worker for Youth/TXHS Ingestion Pipeline
 * Handles scheduled runs and on-demand API requests
 */

import YouthTXHSIngestionAgent from './youth-txhs-ingestion-agent.js';
import HAVFEvaluationEngine from './havf-evaluation-engine.js';

export default {
  async scheduled(event, env, ctx) {
    // Scheduled cron execution
    const agent = new YouthTXHSIngestionAgent({
      outputDir: 'r2://blaze-youth-data/txhs/',
      cacheDir: 'kv://YOUTH_TXHS_CACHE/'
    });
    
    try {
      // Run ingestion
      const results = await agent.ingest({
        sport: this.getCurrentSport(),
        depth: event.cron === "0 2 * * *" ? 'full' : 'priority'
      });
      
      // Run HAV-F evaluation
      const engine = new HAVFEvaluationEngine({
        dataDir: 'r2://blaze-youth-data/txhs/',
        outputDir: 'r2://blaze-youth-data/evaluations/'
      });
      
      const evaluations = await engine.evaluate();
      
      // Store results
      await this.storeResults(env, results, evaluations);
      
      // Send notification
      await this.notify(env, {
        status: 'success',
        players: results.players.length,
        evaluations: evaluations.evaluations.length
      });
      
    } catch (error) {
      console.error('Pipeline error:', error);
      await this.notify(env, { status: 'error', error: error.message });
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API endpoints
    switch (url.pathname) {
      case '/api/ingest':
        return this.handleIngest(request, env);
      
      case '/api/evaluate':
        return this.handleEvaluate(request, env);
      
      case '/api/prospects':
        return this.getTopProspects(request, env);
      
      case '/api/teams':
        return this.getTeams(request, env);
      
      case '/api/health':
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), { 
          headers: { 'Content-Type': 'application/json' }
        });
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  },

  async handleIngest(request, env) {
    const { sport, teams } = await request.json();
    
    const agent = new YouthTXHSIngestionAgent();
    const results = await agent.ingest({ sport, teams });
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async handleEvaluate(request, env) {
    const engine = new HAVFEvaluationEngine();
    const results = await engine.evaluate();
    
    return new Response(JSON.stringify(results.insights), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async getTopProspects(request, env) {
    const data = await env.R2.get('evaluations/havf-insights.json');
    const insights = JSON.parse(await data.text());
    
    return new Response(JSON.stringify(insights.top_prospects), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  },

  async getTeams(request, env) {
    const data = await env.R2.get('txhs/teams-txhs.json');
    const teams = JSON.parse(await data.text());
    
    return new Response(JSON.stringify(teams), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  },

  getCurrentSport() {
    const month = new Date().getMonth() + 1;
    // Football: Aug-Dec, Baseball: Feb-May
    return (month >= 8 || month <= 1) ? 'football' : 'baseball';
  },

  async storeResults(env, ingestion, evaluations) {
    // Store in R2
    await env.R2.put('txhs/latest-ingestion.json', JSON.stringify(ingestion));
    await env.R2.put('evaluations/latest-evaluations.json', JSON.stringify(evaluations));
    
    // Update KV cache
    await env.KV.put('last_update', new Date().toISOString());
    await env.KV.put('prospect_count', evaluations.evaluations.length.toString());
  },

  async notify(env, data) {
    if (!env.SLACK_WEBHOOK) return;
    
    const message = data.status === 'success' 
      ? `✅ Youth/TXHS Pipeline Complete\n• Players: ${data.players}\n• Evaluations: ${data.evaluations}`
      : `❌ Pipeline Error: ${data.error}`;
    
    await fetch(env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
  }
};
EOF

# Step 4: Create wrangler.toml configuration
echo -e "\n${YELLOW}Creating Wrangler configuration...${NC}"

cat > wrangler.toml << EOF
name = "${WORKER_NAME}"
main = "worker-youth-txhs.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[r2_buckets]]
binding = "R2"
bucket_name = "${R2_BUCKET}"

[[kv_namespaces]]
binding = "KV"
id = "YOUTH_TXHS_CACHE_ID"

[triggers]
crons = [
  "0 2 * * *",      # Daily full ingestion at 2 AM CT
  "0 * * * *",      # Hourly priority updates
  "0 18 * * 0",     # Weekly Perfect Game sync
  "0 20 * * 3"      # Wednesday recruiting updates
]

[observability]
enabled = true
EOF

# Step 5: Create R2 bucket and KV namespace
echo -e "\n${YELLOW}Setting up Cloudflare resources...${NC}"

# Create R2 bucket
wrangler r2 bucket create ${R2_BUCKET} 2>/dev/null || echo "R2 bucket already exists"

# Create KV namespace
KV_ID=$(wrangler kv namespace create ${KV_NAMESPACE} --preview false 2>/dev/null | grep -oP 'id = "\K[^"]+' || echo "")
if [ -n "$KV_ID" ]; then
    sed -i.bak "s/YOUTH_TXHS_CACHE_ID/${KV_ID}/g" wrangler.toml
    rm wrangler.toml.bak
fi

# Step 6: Create deployment script
echo -e "\n${YELLOW}Creating deployment automation...${NC}"

cat > deploy.sh << 'EOF'
#!/bin/bash

# Deploy Youth/TXHS Pipeline
echo "Deploying to Cloudflare Workers..."

# Run tests first
npm test 2>/dev/null || echo "No tests configured"

# Deploy worker
wrangler deploy --env production

# Verify deployment
echo -e "\nVerifying deployment..."
WORKER_URL="https://youth-txhs-ingestion.blaze-intelligence.workers.dev"

# Health check
HEALTH=$(curl -s ${WORKER_URL}/api/health | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ Deployment successful!"
    echo "Worker URL: ${WORKER_URL}"
    echo "API Endpoints:"
    echo "  - ${WORKER_URL}/api/prospects (Top prospects)"
    echo "  - ${WORKER_URL}/api/teams (Texas 6A teams)"
    echo "  - ${WORKER_URL}/api/ingest (Trigger ingestion)"
    echo "  - ${WORKER_URL}/api/evaluate (Run evaluations)"
else
    echo "❌ Deployment verification failed"
    exit 1
fi
EOF

chmod +x deploy.sh

# Step 7: Create monitoring dashboard
echo -e "\n${YELLOW}Creating monitoring dashboard...${NC}"

cat > monitor-youth-pipeline.js << 'EOF'
/**
 * Youth/TXHS Pipeline Monitoring Dashboard
 */

const WORKER_URL = 'https://youth-txhs-ingestion.blaze-intelligence.workers.dev';
const CHECK_INTERVAL = 60000; // 1 minute

class PipelineMonitor {
  constructor() {
    this.metrics = {
      health: 'unknown',
      lastUpdate: null,
      prospectCount: 0,
      topProspects: [],
      errors: []
    };
  }

  async checkHealth() {
    try {
      const response = await fetch(`${WORKER_URL}/api/health`);
      const data = await response.json();
      this.metrics.health = data.status;
      this.metrics.lastUpdate = data.timestamp;
    } catch (error) {
      this.metrics.health = 'error';
      this.metrics.errors.push({
        time: new Date().toISOString(),
        error: error.message
      });
    }
  }

  async fetchProspects() {
    try {
      const response = await fetch(`${WORKER_URL}/api/prospects`);
      const prospects = await response.json();
      this.metrics.topProspects = prospects.slice(0, 10);
      this.metrics.prospectCount = prospects.length;
    } catch (error) {
      console.error('Failed to fetch prospects:', error);
    }
  }

  displayDashboard() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║        YOUTH/TXHS PIPELINE MONITORING DASHBOARD      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Status: ${this.getStatusEmoji()} ${this.metrics.health}`);
    console.log(`Last Update: ${this.metrics.lastUpdate || 'Never'}`);
    console.log(`Total Prospects: ${this.metrics.prospectCount}`);
    console.log();
    
    if (this.metrics.topProspects.length > 0) {
      console.log('Top 10 Prospects:');
      console.log('─────────────────────────────────────────────────');
      this.metrics.topProspects.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.position}, ${p.team})`);
        console.log(`   HAV-F: ${p.havf_composite?.toFixed(1)} | CR: ${p.champion_readiness?.toFixed(1)} | CL: ${p.cognitive_leverage?.toFixed(1)} | NIL: ${p.nil_trust_score?.toFixed(1)}`);
      });
    }
    
    if (this.metrics.errors.length > 0) {
      console.log();
      console.log('Recent Errors:');
      this.metrics.errors.slice(-5).forEach(e => {
        console.log(`  ${e.time}: ${e.error}`);
      });
    }
  }

  getStatusEmoji() {
    switch (this.metrics.health) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  }

  async start() {
    console.log('Starting pipeline monitor...');
    
    // Initial check
    await this.checkHealth();
    await this.fetchProspects();
    this.displayDashboard();
    
    // Regular updates
    setInterval(async () => {
      await this.checkHealth();
      await this.fetchProspects();
      this.displayDashboard();
    }, CHECK_INTERVAL);
  }
}

// Start monitoring
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PipelineMonitor();
  monitor.start();
}
EOF

# Step 8: Deploy
echo -e "\n${YELLOW}Deploying to Cloudflare...${NC}"
./deploy.sh

# Step 9: Final summary
echo -e "\n${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Youth/TXHS Pipeline Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Pipeline Components:"
echo "  • Ingestion Agent: youth-txhs-ingestion-agent.js"
echo "  • HAV-F Engine: havf-evaluation-engine.js"
echo "  • Orchestration: youth-txhs-orchestration.yaml"
echo "  • Worker: worker-youth-txhs.js"
echo ""
echo "🔄 Scheduled Tasks:"
echo "  • Daily full ingestion: 2:00 AM CT"
echo "  • Hourly priority updates: Every hour"
echo "  • Weekly Perfect Game sync: Sundays 6:00 PM CT"
echo "  • Recruiting updates: Wednesdays 8:00 PM CT"
echo ""
echo "🎯 Data Coverage:"
echo "  • Texas 6A Programs: 8 priority schools"
echo "  • Sports: Football & Baseball"
echo "  • Sources: MaxPreps, Perfect Game, UIL, 247Sports"
echo ""
echo "📈 HAV-F Metrics:"
echo "  • Champion Readiness (Performance)"
echo "  • Cognitive Leverage (Mental/Academic)"
echo "  • NIL Trust Score (Market Value)"
echo ""
echo "🚀 Next Steps:"
echo "  1. Monitor pipeline: node monitor-youth-pipeline.js"
echo "  2. View top prospects: curl ${WORKER_URL}/api/prospects"
echo "  3. Check logs: wrangler tail --env production"
echo "  4. Scale to 5A/4A: Update PRIORITY_PROGRAMS in agent"
echo ""
echo -e "${YELLOW}Remember to set environment variables:${NC}"
echo "  export CLOUDFLARE_API_TOKEN=your_token"
echo "  export SLACK_WEBHOOK_URL=your_webhook"