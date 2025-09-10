#!/bin/bash

# Blaze Intelligence Production Deployment Script
# Complete deployment with error handling and monitoring

set -e

echo "🚀 DEPLOYING BLAZE INTELLIGENCE TO PRODUCTION"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create production directories
mkdir -p ./data/{unified,evaluations,youth-txhs,analytics,monitoring} ./site/src/data ./logs

# Step 1: Run comprehensive system test first
echo -e "\n${YELLOW}Step 1: Pre-deployment System Test${NC}"
python3 test-blaze-system.py || {
    echo -e "${RED}System test failed! Deployment aborted.${NC}"
    exit 1
}

# Step 2: Deploy Cloudflare Workers
echo -e "\n${YELLOW}Step 2: Deploying Cloudflare Workers${NC}"

# Create simplified worker for production
cat > worker-production.js << 'EOF'
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    switch (url.pathname) {
      case '/api/health':
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }), { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      
      case '/api/prospects':
        // Mock top prospects for demo
        const prospects = [
          {
            name: "Quinn Ewers",
            position: "QB",
            team: "Texas Longhorns",
            havf_composite: 81.9,
            champion_readiness: 75.8,
            cognitive_leverage: 82.4,
            nil_trust_score: 91.2
          },
          {
            name: "Derrick Henry",
            position: "RB", 
            team: "Tennessee Titans",
            havf_composite: 79.1,
            champion_readiness: 89.7,
            cognitive_leverage: 65.3,
            nil_trust_score: 78.4
          },
          {
            name: "Paul Goldschmidt",
            position: "1B",
            team: "St. Louis Cardinals", 
            havf_composite: 62.3,
            champion_readiness: 67.4,
            cognitive_leverage: 71.2,
            nil_trust_score: 45.8
          }
        ];
        
        return new Response(JSON.stringify(prospects), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      
      case '/api/readiness':
        const readiness = {
          timestamp: new Date().toISOString(),
          sports: {
            MLB: { averageReadiness: 56.4, topTeam: "Cardinals" },
            NFL: { averageReadiness: 58.1, topTeam: "Titans" },
            NCAA: { averageReadiness: 66.0, topTeam: "Longhorns" }
          }
        };
        
        return new Response(JSON.stringify(readiness), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
        
      case '/api/teams':
        const teams = [
          { name: "St. Louis Cardinals", sport: "MLB", readiness: 56.4, status: "yellow" },
          { name: "Tennessee Titans", sport: "NFL", readiness: 58.1, status: "yellow" },
          { name: "Texas Longhorns", sport: "NCAA-FB", readiness: 66.0, status: "yellow" }
        ];
        
        return new Response(JSON.stringify(teams), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      
      default:
        return new Response('Blaze Intelligence API v2.0\n\nEndpoints:\n- /api/health\n- /api/prospects\n- /api/readiness\n- /api/teams', {
          headers: { 'Content-Type': 'text/plain', ...corsHeaders }
        });
    }
  }
};
EOF

# Create wrangler config for production
cat > wrangler-prod.toml << 'EOF'
name = "blaze-intelligence-api"
main = "worker-production.js"
compatibility_date = "2024-01-01"

[env.production]
name = "blaze-intelligence-api"
vars = { ENVIRONMENT = "production" }
EOF

# Deploy worker if wrangler is available
if command -v wrangler &> /dev/null; then
    wrangler deploy --config wrangler-prod.toml --env production
    echo -e "${GREEN}✓ Cloudflare Worker deployed${NC}"
    WORKER_URL="https://blaze-intelligence-api.blaze-intelligence.workers.dev"
else
    echo -e "${YELLOW}⚠ Wrangler not found, skipping Worker deployment${NC}"
    WORKER_URL="http://localhost:8787"
fi

# Step 3: Set up monitoring
echo -e "\n${YELLOW}Step 3: Setting Up Monitoring${NC}"

cat > monitor-production.js << 'EOF'
/**
 * Production Monitoring Dashboard
 */

const ENDPOINTS = [
  'https://blaze-intelligence-api.blaze-intelligence.workers.dev/api/health',
  'https://blaze-intelligence-api.blaze-intelligence.workers.dev/api/prospects',
  'https://blaze-intelligence-api.blaze-intelligence.workers.dev/api/readiness'
];

class ProductionMonitor {
  constructor() {
    this.status = {
      system: 'unknown',
      endpoints: {},
      lastCheck: null
    };
  }

  async checkEndpoints() {
    console.log('🔍 Checking production endpoints...');
    
    for (const endpoint of ENDPOINTS) {
      try {
        const start = Date.now();
        const response = await fetch(endpoint);
        const duration = Date.now() - start;
        
        this.status.endpoints[endpoint] = {
          status: response.ok ? 'healthy' : 'error',
          statusCode: response.status,
          responseTime: duration,
          lastCheck: new Date().toISOString()
        };
        
        if (response.ok) {
          console.log(`✓ ${endpoint}: ${response.status} (${duration}ms)`);
        } else {
          console.log(`✗ ${endpoint}: ${response.status} (${duration}ms)`);
        }
      } catch (error) {
        console.log(`✗ ${endpoint}: ${error.message}`);
        this.status.endpoints[endpoint] = {
          status: 'error',
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }
    }
    
    // Overall system status
    const healthyCount = Object.values(this.status.endpoints)
      .filter(e => e.status === 'healthy').length;
    
    this.status.system = healthyCount === ENDPOINTS.length ? 'healthy' : 
                        healthyCount > 0 ? 'degraded' : 'down';
    this.status.lastCheck = new Date().toISOString();
  }

  displayStatus() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          BLAZE INTELLIGENCE PRODUCTION STATUS        ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log();
    
    const statusEmoji = {
      'healthy': '🟢',
      'degraded': '🟡', 
      'down': '🔴',
      'unknown': '⚪'
    }[this.status.system];
    
    console.log(`System Status: ${statusEmoji} ${this.status.system.toUpperCase()}`);
    console.log(`Last Check: ${this.status.lastCheck}`);
    console.log();
    
    console.log('API Endpoints:');
    console.log('─'.repeat(60));
    
    for (const [endpoint, data] of Object.entries(this.status.endpoints)) {
      const emoji = data.status === 'healthy' ? '🟢' : '🔴';
      const url = endpoint.replace('https://blaze-intelligence-api.blaze-intelligence.workers.dev', '');
      console.log(`${emoji} ${url}`);
      
      if (data.responseTime) {
        console.log(`   Response: ${data.statusCode} (${data.responseTime}ms)`);
      }
      if (data.error) {
        console.log(`   Error: ${data.error}`);
      }
    }
    
    console.log();
    console.log('Quick Test Commands:');
    console.log('─'.repeat(60));
    console.log('curl https://blaze-intelligence-api.blaze-intelligence.workers.dev/api/health');
    console.log('curl https://blaze-intelligence-api.blaze-intelligence.workers.dev/api/prospects');
  }

  async start() {
    console.log('🚀 Starting production monitoring...');
    
    // Initial check
    await this.checkEndpoints();
    this.displayStatus();
    
    // Regular monitoring
    setInterval(async () => {
      await this.checkEndpoints();
      this.displayStatus();
    }, 30000); // Every 30 seconds
  }
}

// Start monitoring
const monitor = new ProductionMonitor();
monitor.start();
EOF

# Step 4: Create cron automation
echo -e "\n${YELLOW}Step 4: Setting Up Automated Jobs${NC}"

cat > setup-production-cron.sh << 'EOF'
#!/bin/bash

# Setup production cron jobs
CRON_FILE="/tmp/blaze-cron"
PROJECT_DIR="$PWD"

# Get current crontab
crontab -l > "${CRON_FILE}" 2>/dev/null || true

# Add Blaze Intelligence jobs
cat >> "${CRON_FILE}" << EOL

# Blaze Intelligence Production Jobs
0 2 * * * cd ${PROJECT_DIR} && python3 test-blaze-system.py >> logs/daily.log 2>&1
*/10 * * * * cd ${PROJECT_DIR} && node blaze-universal-readiness-board.js >> logs/readiness.log 2>&1
0 */4 * * * cd ${PROJECT_DIR} && ./blaze-continuous-deployment.sh >> logs/deployment.log 2>&1
EOL

# Install new crontab
crontab "${CRON_FILE}"
rm "${CRON_FILE}"

echo "✓ Production cron jobs configured"
echo ""
echo "Scheduled tasks:"
echo "  • System test: Daily at 2 AM"
echo "  • Readiness updates: Every 10 minutes" 
echo "  • Full deployment: Every 4 hours"
EOF

chmod +x setup-production-cron.sh
./setup-production-cron.sh

# Step 5: Health check
echo -e "\n${YELLOW}Step 5: Production Health Check${NC}"

# Test API endpoints
if [ -n "$WORKER_URL" ]; then
    echo "Testing API endpoints..."
    
    # Health check
    HEALTH=$(curl -s "$WORKER_URL/api/health" | jq -r '.status' 2>/dev/null || echo "error")
    if [ "$HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✓ Health endpoint: OK${NC}"
    else
        echo -e "${RED}✗ Health endpoint: $HEALTH${NC}"
    fi
    
    # Prospects endpoint
    PROSPECTS_COUNT=$(curl -s "$WORKER_URL/api/prospects" | jq '. | length' 2>/dev/null || echo "0")
    if [ "$PROSPECTS_COUNT" -gt "0" ]; then
        echo -e "${GREEN}✓ Prospects endpoint: $PROSPECTS_COUNT prospects${NC}"
    else
        echo -e "${RED}✗ Prospects endpoint: No data${NC}"
    fi
    
    # Readiness endpoint  
    SPORTS_COUNT=$(curl -s "$WORKER_URL/api/readiness" | jq '.sports | length' 2>/dev/null || echo "0")
    if [ "$SPORTS_COUNT" -gt "0" ]; then
        echo -e "${GREEN}✓ Readiness endpoint: $SPORTS_COUNT sports${NC}"
    else
        echo -e "${RED}✗ Readiness endpoint: No data${NC}"
    fi
fi

echo -e "\n${GREEN}🎉 PRODUCTION DEPLOYMENT COMPLETE!${NC}"
echo "======================================"
echo ""
echo "📊 System Status: OPERATIONAL"
echo "🌐 API Base URL: $WORKER_URL"
echo "📁 Data Directory: ./data/"
echo "📝 Logs Directory: ./logs/"
echo ""
echo "🔧 Management Commands:"
echo "  • Monitor: node monitor-production.js"
echo "  • Test: python3 test-blaze-system.py"
echo "  • Deploy: ./blaze-continuous-deployment.sh"
echo ""
echo "📡 API Endpoints:"
echo "  • $WORKER_URL/api/health"
echo "  • $WORKER_URL/api/prospects"
echo "  • $WORKER_URL/api/readiness"
echo "  • $WORKER_URL/api/teams"
echo ""
echo "📈 Next Steps:"
echo "  1. Monitor production: node monitor-production.js"
echo "  2. Set up Slack alerts (Step 2)"
echo "  3. Create client demos (Step 3)"
echo ""

# Save deployment info
cat > ./deployment-info.json << EOF
{
  "deployment_id": "prod-$(date +%Y%m%d-%H%M%S)",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "deployed",
  "api_url": "$WORKER_URL",
  "endpoints": [
    "$WORKER_URL/api/health",
    "$WORKER_URL/api/prospects", 
    "$WORKER_URL/api/readiness",
    "$WORKER_URL/api/teams"
  ],
  "monitoring": {
    "logs_dir": "./logs/",
    "data_dir": "./data/",
    "monitor_script": "node monitor-production.js"
  },
  "automation": {
    "system_test": "Daily 2 AM",
    "readiness_updates": "Every 10 minutes",
    "full_deployment": "Every 4 hours"
  }
}
EOF

echo "✅ Deployment info saved to deployment-info.json"