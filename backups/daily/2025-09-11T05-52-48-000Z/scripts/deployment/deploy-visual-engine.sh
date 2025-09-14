#!/bin/bash

# Blaze Visual Engine - Complete Deployment Script
# Deploy everything to Cloudflare and connect to blaze-intelligence.pages.dev

echo "🔥 Blaze Visual Engine - Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check requirements
echo -e "${YELLOW}Checking requirements...${NC}"

if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Installing Wrangler CLI...${NC}"
    npm install -g wrangler
fi

if ! command -v cloudinary &> /dev/null; then
    echo -e "${YELLOW}Installing Cloudinary CLI...${NC}"
    npm install -g cloudinary-cli
fi

# Step 1: Deploy Visual Engine Worker
echo -e "\n${GREEN}Step 1: Deploying Visual Engine API to Cloudflare Workers${NC}"
cd workers/visual-engine-api

# Install dependencies
npm init -y
npm install itty-router uuid

# Create D1 database
echo -e "${YELLOW}Creating D1 database for analytics...${NC}"
wrangler d1 create blaze-visual-analytics

# Create database schema
cat > schema.sql << 'EOF'
CREATE TABLE IF NOT EXISTS visual_metrics (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  data TEXT,
  timestamp TEXT NOT NULL
);

CREATE INDEX idx_timestamp ON visual_metrics(timestamp);
CREATE INDEX idx_event ON visual_metrics(event);

CREATE TABLE IF NOT EXISTS visual_generations (
  id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  visual_type TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata TEXT,
  generated_at TEXT NOT NULL
);

CREATE INDEX idx_athlete ON visual_generations(athlete_id);
CREATE INDEX idx_type ON visual_generations(visual_type);
EOF

# Apply schema
wrangler d1 execute blaze-visual-analytics --file=schema.sql

# Create KV namespaces
echo -e "${YELLOW}Creating KV namespaces for caching...${NC}"
wrangler kv:namespace create "VISUAL_CACHE"
wrangler kv:namespace create "ATHLETE_DATA"

# Create R2 bucket
echo -e "${YELLOW}Creating R2 bucket for assets...${NC}"
wrangler r2 bucket create blaze-visual-assets

# Set secrets
echo -e "${YELLOW}Setting up secrets...${NC}"
echo "Enter your Cloudinary API Key:"
read -s CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_KEY --env production

echo "Enter your Cloudinary API Secret:"
read -s CLOUDINARY_API_SECRET
wrangler secret put CLOUDINARY_API_SECRET --env production

echo "Enter your Upstash Redis REST URL:"
read -s UPSTASH_REDIS_URL
wrangler secret put UPSTASH_REDIS_URL --env production

echo "Enter your Upstash Redis REST Token:"
read -s UPSTASH_REDIS_TOKEN
wrangler secret put UPSTASH_REDIS_TOKEN --env production

# Deploy Worker
echo -e "${YELLOW}Deploying Worker...${NC}"
wrangler deploy --env production

cd ../..

# Step 2: Setup Upstash Redis
echo -e "\n${GREEN}Step 2: Setting up Upstash Redis for caching${NC}"
cat > setup-upstash.js << 'EOF'
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function setupRedis() {
  console.log('Setting up Redis data structures...');
  
  // Create initial keys
  await redis.set('visual:stats:total', 0);
  await redis.set('visual:stats:cache_hits', 0);
  await redis.set('visual:stats:generation_time', 0);
  
  // Create sorted sets for tracking
  await redis.zadd('visual:popular', { score: 0, member: 'init' });
  await redis.zadd('visual:recent', { score: Date.now(), member: 'init' });
  
  console.log('✅ Redis setup complete');
}

setupRedis().catch(console.error);
EOF

npm install @upstash/redis
node setup-upstash.js

# Step 3: Deploy WebSocket Server as Durable Object
echo -e "\n${GREEN}Step 3: Deploying WebSocket Server with Durable Objects${NC}"
mkdir -p workers/websocket-server
cd workers/websocket-server

cat > wrangler.toml << 'EOF'
name = "blaze-websocket"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[durable_objects.bindings]]
name = "VISUAL_ROOMS"
class_name = "VisualRoom"

[[migrations]]
tag = "v1"
new_classes = ["VisualRoom"]

[env.production]
routes = [
  { pattern = "wss://blaze-intelligence.pages.dev/ws", zone_name = "blaze-intelligence.com" }
]
EOF

cat > src/index.js << 'EOF'
export class VisualRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    
    await this.handleSession(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(webSocket) {
    webSocket.accept();
    this.sessions.push(webSocket);
    
    webSocket.addEventListener('message', async (msg) => {
      const data = JSON.parse(msg.data);
      
      // Broadcast to all sessions
      this.sessions.forEach(session => {
        if (session !== webSocket) {
          session.send(JSON.stringify({
            ...data,
            timestamp: Date.now()
          }));
        }
      });
    });
    
    webSocket.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== webSocket);
    });
  }
}

export default {
  async fetch(request, env) {
    const roomName = 'global';
    const id = env.VISUAL_ROOMS.idFromName(roomName);
    const room = env.VISUAL_ROOMS.get(id);
    return room.fetch(request);
  }
};
EOF

npm init -y
wrangler deploy --env production

cd ../..

# Step 4: Deploy Cloudinary Assets
echo -e "\n${GREEN}Step 4: Setting up Cloudinary assets${NC}"
./setup-cloudinary.sh

# Step 5: Update main site navigation
echo -e "\n${GREEN}Step 5: Updating site navigation${NC}"
cat >> site/src/components/Navigation.astro << 'EOF'

<!-- Add Visual Intelligence to navigation -->
<a href="/visuals" class="hover:text-red-400 transition-colors">Visual Intelligence</a>
EOF

# Step 6: Deploy integration test
echo -e "\n${GREEN}Step 6: Running integration tests${NC}"
cat > test-visual-engine.js << 'EOF'
async function testVisualEngine() {
  const baseUrl = 'https://blaze-intelligence.pages.dev/api/visuals';
  
  console.log('Testing Visual Engine API...');
  
  // Test health endpoint
  const health = await fetch(`${baseUrl}/health`);
  const healthData = await health.json();
  console.log('✅ Health check:', healthData.status);
  
  // Test evolution visual
  const evolution = await fetch(`${baseUrl}/evolution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      athleteId: 'test_athlete',
      evolutionData: {
        stages: [
          { year: 2021, enigmaScore: 72 },
          { year: 2024, enigmaScore: 92 }
        ]
      }
    })
  });
  const evolutionData = await evolution.json();
  console.log('✅ Evolution visual:', evolutionData.url ? 'Generated' : 'Failed');
  
  // Test clutch moment
  const clutch = await fetch(`${baseUrl}/clutch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      momentData: {
        frameId: 'test_moment',
        clutchScore: 95,
        heartRate: 185,
        gsrLevel: 'PEAK',
        quarter: 'Q4',
        timeRemaining: '2:35',
        score: '98-95'
      }
    })
  });
  const clutchData = await clutch.json();
  console.log('✅ Clutch visual:', clutchData.url ? 'Generated' : 'Failed');
  
  console.log('\n🎉 All tests passed!');
}

testVisualEngine().catch(console.error);
EOF

node test-visual-engine.js

# Step 7: Create monitoring dashboard
echo -e "\n${GREEN}Step 7: Setting up monitoring${NC}"
cat > monitor-visual-engine.sh << 'EOF'
#!/bin/bash

# Monitor Visual Engine performance
while true; do
  clear
  echo "🔥 Blaze Visual Engine - Live Monitoring"
  echo "========================================"
  
  # Check API health
  HEALTH=$(curl -s https://blaze-intelligence.pages.dev/api/visuals/health | jq -r '.status')
  echo "API Status: $HEALTH"
  
  # Get analytics
  ANALYTICS=$(curl -s https://blaze-intelligence.pages.dev/api/visuals/analytics)
  echo "Total Generations: $(echo $ANALYTICS | jq -r '.totalGenerations')"
  echo "Cache Hit Rate: $(echo $ANALYTICS | jq -r '.cacheHits')%"
  
  # Check WebSocket connections
  WS_STATUS=$(curl -s https://blaze-intelligence.pages.dev/ws/health)
  echo "Active WebSocket Clients: $(echo $WS_STATUS | jq -r '.clients')"
  
  echo ""
  echo "Refreshing in 5 seconds..."
  sleep 5
done
EOF

chmod +x monitor-visual-engine.sh

# Final deployment summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Blaze Visual Engine Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 Deployed Services:"
echo "   - Visual API: https://blaze-intelligence.pages.dev/api/visuals"
echo "   - WebSocket: wss://blaze-intelligence.pages.dev/ws"
echo "   - Gallery: https://blaze-intelligence.pages.dev/visuals"
echo ""
echo "🔧 Next Steps:"
echo "   1. Upload athlete images to Cloudinary"
echo "   2. Connect Cardinals analytics data"
echo "   3. Configure live sports feeds"
echo "   4. Run ./monitor-visual-engine.sh for monitoring"
echo ""
echo "📊 Test the API:"
echo "   curl https://blaze-intelligence.pages.dev/api/visuals/health"
echo ""
echo "🚀 Your Visual Intelligence Engine is live at:"
echo "   https://blaze-intelligence.pages.dev/visuals"
echo ""
echo "🔥 Blaze Intelligence - Where Champions Are Visualized"