#!/bin/bash

# 🚀 Blaze Sports Intel - Unreal Engine MCP Bridge Deployment Script
# This deploys the Cloudflare Worker for queuing Unreal Engine render jobs

set -e

echo "🎬 ==============================================="
echo "🎬 BLAZE SPORTS INTEL - UNREAL ENGINE DEPLOYMENT"
echo "🎬 Cinema-Quality Rendering Pipeline"
echo "🎬 ==============================================="
echo ""

# Navigate to worker directory
cd unreal-mcp-bridge/worker

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Create D1 database
echo "🗄️  Creating D1 database for render queue..."
npx wrangler d1 create bsi_unreal_mcp 2>/dev/null || echo "Database already exists"

# Execute schema
echo "📊 Setting up database schema..."
npx wrangler d1 execute bsi_unreal_mcp --file=./schema.sql --local

# Deploy worker
echo "🚀 Deploying Cloudflare Worker..."
npx wrangler deploy

# Set up secrets
echo "🔐 Setting up API secrets..."
echo ""
echo "Please enter the API key for site authentication:"
read -s API_KEY
npx wrangler secret put API_KEY <<< "$API_KEY"

echo ""
echo "Please enter the Runner key for render node authentication:"
read -s RUNNER_KEY
npx wrangler secret put RUNNER_KEY <<< "$RUNNER_KEY"

# Create runner config
echo "⚙️  Creating runner configuration..."
cd ../runner

cat > config.yaml << EOF
# Blaze Sports Intel - Unreal Engine Runner Configuration
api_base: "https://bsi-unreal-mcp-bridge.blazesportsintel.workers.dev"
runner_key: "$RUNNER_KEY"
poll_interval_sec: 3

r2:
  account_id: "a12cb329d84130460eed99b816e4d0d3"
  access_key_id: "dafe9d6e5448406759631b8d101c3901"
  secret_access_key: "d82d1ab05af875d9a6da33f06e0a8d4efb43e72119ff500f35badff4afe811b9"
  bucket: "blaze-renders"
  public_base: "https://media.blazesportsintel.com"

unreal_mcp:
  host: "127.0.0.1"
  port: 55557
EOF

echo ""
echo "✅ ==============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "✅ ==============================================="
echo ""
echo "📍 Worker URL: https://bsi-unreal-mcp-bridge.blazesportsintel.workers.dev"
echo ""
echo "🎮 Next Steps:"
echo "1. Install Unreal Engine 5.5+ on your Windows machine"
echo "2. Clone https://github.com/chongdashu/unreal-mcp"
echo "3. Run the Python MCP server: python unreal_mcp_server.py"
echo "4. Start the runner: python runner.py"
echo "5. Open unreal-integration.html to submit render jobs"
echo ""
echo "🏆 Championship-quality renders are now available!"