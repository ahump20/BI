#!/bin/bash

# Blaze Intelligence Sovereign Stack Deployment Script
# Deploy to Cloudflare Pages with full framework integration

echo "🔥 BLAZE INTELLIGENCE DEPLOYMENT SYSTEM 🔥"
echo "==========================================="
echo ""

# Configuration
PROJECT_NAME="blaze-intelligence"
DOMAIN="blaze-intelligence.com"
CF_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"
CF_API_TOKEN="${CLOUDFLARE_API_TOKEN}"

# Check for required environment variables
if [ -z "$CF_ACCOUNT_ID" ] || [ -z "$CF_API_TOKEN" ]; then
    echo "❌ Error: Missing Cloudflare credentials"
    echo "Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN"
    exit 1
fi

echo "📦 Phase 1: Preparing deployment package..."

# Create deployment directory
rm -rf dist
mkdir -p dist

# Copy main files
cp blaze-intelligence-sovereign.html dist/index.html
cp sw.js dist/sw.js

# Create framework stubs (in production, these would be WASM modules)
mkdir -p dist/frameworks
cat > dist/frameworks/decision-velocity.js << 'EOF'
// Decision Velocity Framework
export class DecisionVelocity {
    constructor() {
        this.reactionThreshold = 0.23;
        this.marketLag = 1.40;
    }
    
    calculateAdvantage(input) {
        const reaction = this.processInput(input);
        return reaction - this.marketLag;
    }
    
    processInput(input) {
        // Simulated processing
        return this.reactionThreshold;
    }
}
EOF

cat > dist/frameworks/pattern-recognition.js << 'EOF'
// Pattern Recognition Framework
export class PatternRecognition {
    constructor() {
        this.threshold = 0.73;
        this.patterns = new Map();
    }
    
    detectFormation(marketData) {
        // Cover 2 = Bear Market Defense
        // Blitz = Volatility Spike
        // RPO = Merger Arbitrage
        const confidence = Math.random() * 0.3 + 0.7;
        return { pattern: 'Cover 2 Shell', confidence };
    }
}
EOF

cat > dist/frameworks/cognitive-load.js << 'EOF'
// Cognitive Load Distribution Framework
export class CognitiveLoad {
    constructor() {
        this.dimensions = {
            visual: 0.67,
            decision: 0.89,
            pattern: 0.73,
            execution: 0.45,
            memory: 0.52
        };
    }
    
    getCurrentLoad() {
        return this.dimensions;
    }
    
    isOptimal() {
        return Object.values(this.dimensions).every(load => load < 0.8);
    }
}
EOF

cat > dist/frameworks/champion-enigma.js << 'EOF'
// Champion Enigma Engine
export class ChampionEnigma {
    constructor() {
        this.dimensions = [
            'Clutch Gene', 'Killer Instinct', 'Flow State',
            'Mental Fortress', 'Predator Mindset', 'Champion Aura',
            'Winner DNA', 'Beast Mode'
        ];
        this.score = 94.6;
    }
    
    calculateScore(metrics) {
        // Complex calculation in production
        return this.score + (Math.random() - 0.5) * 5;
    }
}
EOF

# Create manifest.json
cat > dist/manifest.json << 'EOF'
{
    "name": "Blaze Intelligence",
    "short_name": "BlazeOS",
    "description": "Sports Intelligence Operating System",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0A1628",
    "theme_color": "#FF6B35",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
EOF

# Create _headers file for security and performance
cat > dist/_headers << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss://api.blaze-intelligence.com https://api.blaze-intelligence.com
  Cache-Control: public, max-age=3600

/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  
/index.html
  Cache-Control: public, max-age=300
EOF

# Create _redirects file
cat > dist/_redirects << 'EOF'
# Domain redirects
https://blaze-intelligence.pages.dev/* https://blaze-intelligence.com/:splat 301!
http://blaze-intelligence.com/* https://blaze-intelligence.com/:splat 301!

# App routes (for SPA)
/dashboard /index.html 200
/enigma /index.html 200
/patterns /index.html 200
/velocity /index.html 200
EOF

echo "✅ Deployment package prepared"
echo ""

echo "🚀 Phase 2: Deploying to Cloudflare Pages..."

# Check if we have npx wrangler
if ! command -v npx &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist \
    --project-name="$PROJECT_NAME" \
    --branch="production" \
    --commit-dirty=true

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "==========================================="
    echo "🌐 Live at: https://${PROJECT_NAME}.pages.dev"
    echo "🔗 Custom domain: https://${DOMAIN}"
    echo ""
    echo "📊 Metrics to monitor:"
    echo "  - Decision Velocity: < 0.8s page load"
    echo "  - Pattern Recognition: 73%+ accuracy"
    echo "  - Cognitive Load: < 80% on all dimensions"
    echo "  - Champion Score: 94.6+ correlation"
    echo ""
    echo "🔥 The Blaze Intelligence OS is LIVE 🔥"
else
    echo ""
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

# Optional: Run performance test
echo ""
echo "📈 Running performance test..."
curl -o /dev/null -s -w "Time to first byte: %{time_starttransfer}s\nTotal time: %{time_total}s\n" https://${PROJECT_NAME}.pages.dev

echo ""
echo "🎯 Next steps:"
echo "  1. Configure custom domain in Cloudflare dashboard"
echo "  2. Set up Workers for API endpoints"
echo "  3. Connect to Cardinals Analytics MCP Server"
echo "  4. Enable real-time WebSocket streams"
echo "  5. Deploy WASM framework modules"
echo ""
echo "The future isn't predicted. It's computed. 🚀"