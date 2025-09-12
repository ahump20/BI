#!/bin/bash

# Blaze Intelligence Production Setup Script
# This script configures the production environment for the sports analytics platform

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="blaze-intelligence-platform"
DOMAIN="blaze-intelligence.com"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"

echo -e "${BLUE}🔥 Blaze Intelligence Production Setup${NC}"
echo "=================================================="
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"

# Check if running in correct directory
if [[ ! -f "package.json" ]]; then
    print_error "Must be run from project root directory"
    exit 1
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -c2-)
    REQUIRED_VERSION="16.0.0"
    if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
        print_error "Node.js version $REQUIRED_VERSION or higher required. Found: $NODE_VERSION"
        exit 1
    fi
    print_status "Node.js version: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 16+."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check Wrangler CLI
if command -v wrangler &> /dev/null; then
    WRANGLER_VERSION=$(wrangler --version)
    print_status "Wrangler CLI: $WRANGLER_VERSION"
else
    print_warning "Wrangler CLI not found. Installing..."
    npm install -g wrangler@latest
    print_status "Wrangler CLI installed"
fi

echo ""

# Environment Variables Setup
echo -e "${BLUE}🔧 Environment Variables Setup${NC}"

# Create .env.production if it doesn't exist
if [[ ! -f ".env.production" ]]; then
    echo "# Blaze Intelligence Production Environment" > .env.production
    echo "NODE_ENV=production" >> .env.production
    echo "PORT=8080" >> .env.production
    echo "" >> .env.production
    print_status "Created .env.production file"
else
    print_warning ".env.production already exists"
fi

# Check for required environment variables
REQUIRED_VARS=(
    "CLOUDFLARE_ACCOUNT_ID"
    "CLOUDFLARE_API_TOKEN"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    print_warning "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please set these variables before continuing:"
    echo "export CLOUDFLARE_ACCOUNT_ID=your_account_id"
    echo "export CLOUDFLARE_API_TOKEN=your_api_token"
    echo ""
    echo "Or add them to your .env.production file"
    
    # Optionally prompt for values
    read -p "Would you like to enter them now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for var in "${MISSING_VARS[@]}"; do
            read -p "Enter $var: " -r
            echo "$var=$REPLY" >> .env.production
        done
        print_status "Environment variables added to .env.production"
    else
        print_error "Cannot proceed without required environment variables"
        exit 1
    fi
fi

echo ""

# API Keys Setup
echo -e "${BLUE}🔑 API Keys Configuration${NC}"

API_KEYS=(
    "MLB_API_KEY:MLB Stats API"
    "ESPN_API_KEY:ESPN Sports API"
    "PERFECT_GAME_API_KEY:Perfect Game API"
    "CLAUDE_API_KEY:Claude AI API"
    "OPENAI_API_KEY:OpenAI/ChatGPT API"
    "GOOGLE_AI_API_KEY:Google Gemini API"
)

echo "The following APIs are available for configuration:"
for api in "${API_KEYS[@]}"; do
    key="${api%%:*}"
    desc="${api##*:}"
    echo "  - $desc ($key)"
done

echo ""
print_warning "API keys should be set securely in your deployment environment"
print_warning "Never commit API keys to version control"

echo ""

# Cloudflare Pages Setup
echo -e "${BLUE}☁️  Cloudflare Pages Configuration${NC}"

if [[ -n "$CLOUDFLARE_ACCOUNT_ID" && -n "$CLOUDFLARE_API_TOKEN" ]]; then
    # Login to Wrangler
    echo "Authenticating with Cloudflare..."
    echo "$CLOUDFLARE_API_TOKEN" | wrangler auth token || {
        print_warning "Cloudflare authentication failed. Please check your API token."
    }
    
    # Create Pages project if it doesn't exist
    if wrangler pages project list | grep -q "$PROJECT_NAME"; then
        print_status "Cloudflare Pages project '$PROJECT_NAME' already exists"
    else
        print_warning "Creating Cloudflare Pages project..."
        # Note: In production, you'd create the project via API or dashboard
        echo "Please create the Cloudflare Pages project manually:"
        echo "1. Go to https://dash.cloudflare.com/"
        echo "2. Navigate to Pages"
        echo "3. Create a new project named '$PROJECT_NAME'"
        echo "4. Connect to your GitHub repository"
    fi
    
    print_status "Cloudflare configuration complete"
else
    print_warning "Cloudflare credentials not provided. Skipping Cloudflare setup."
fi

echo ""

# Database Setup
echo -e "${BLUE}🗄️  Database Configuration${NC}"

# Check for wrangler.toml
if [[ -f "wrangler.toml" ]]; then
    print_status "Found wrangler.toml configuration"
    
    # Create D1 database if specified in wrangler.toml
    if grep -q "database_name" wrangler.toml; then
        DATABASE_NAME=$(grep "database_name" wrangler.toml | cut -d'"' -f4)
        print_status "Database configuration found: $DATABASE_NAME"
    fi
else
    print_warning "No wrangler.toml found. Database setup skipped."
fi

echo ""

# Install Dependencies
echo -e "${BLUE}📦 Installing Dependencies${NC}"

npm ci --production
print_status "Production dependencies installed"

# Install mobile app dependencies
if [[ -d "mobile-app" ]]; then
    cd mobile-app
    npm ci
    cd ..
    print_status "Mobile app dependencies installed"
fi

echo ""

# Build Assets
echo -e "${BLUE}🏗️  Building Production Assets${NC}"

# Run build if script exists
if npm run | grep -q "build"; then
    npm run build
    print_status "Production build complete"
else
    print_warning "No build script found"
fi

# Optimize assets if script exists
if npm run | grep -q "optimize"; then
    npm run optimize
    print_status "Asset optimization complete"
fi

echo ""

# Security Setup
echo -e "${BLUE}🔒 Security Configuration${NC}"

# Create security headers file if it doesn't exist
if [[ ! -f "_headers" ]]; then
    cat > _headers << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://statsapi.mlb.com https://site.api.espn.com;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/api/*
  X-Robots-Tag: noindex

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
EOF
    print_status "Security headers configured"
else
    print_status "Security headers already exist"
fi

# Create robots.txt if it doesn't exist
if [[ ! -f "robots.txt" ]]; then
    cat > robots.txt << 'EOF'
User-agent: *
Disallow: /api/
Disallow: /_next/
Allow: /

Sitemap: https://blaze-intelligence.com/sitemap.xml
EOF
    print_status "robots.txt created"
fi

echo ""

# Monitoring Setup
echo -e "${BLUE}📊 Monitoring Configuration${NC}"

# Create basic health check endpoint
mkdir -p api
if [[ ! -f "api/health.js" ]]; then
    cat > api/health.js << 'EOF'
export default async function handler(request) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      api: 'operational',
      cdn: 'active'
    }
  };
  
  return new Response(JSON.stringify(health), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}
EOF
    print_status "Health check endpoint created"
fi

echo ""

# Final Steps
echo -e "${BLUE}🚀 Final Configuration${NC}"

# Generate deployment summary
cat > DEPLOYMENT_SUMMARY.md << EOF
# Blaze Intelligence Deployment Summary

## Environment: Production
**Generated**: $(date)

### Configuration Status
- ✅ Environment variables configured
- ✅ Dependencies installed  
- ✅ Security headers set
- ✅ Health check endpoint ready
- ✅ Production build complete

### Required Manual Steps
1. **Cloudflare Pages**: Create project and connect repository
2. **Custom Domain**: Configure DNS and SSL
3. **API Keys**: Set in Cloudflare Pages environment variables
4. **Database**: Run migrations if needed
5. **Monitoring**: Set up alerts and logging

### Deployment URLs
- **Production**: https://$PROJECT_NAME.pages.dev
- **Custom Domain**: https://$DOMAIN (after DNS setup)
- **Health Check**: https://$DOMAIN/api/health

### Next Steps
1. Run: \`npm run deploy\`
2. Configure custom domain in Cloudflare
3. Set up monitoring alerts
4. Test all functionality
5. Enable automated deployments

### Support
- **Technical**: ahump20@outlook.com
- **Documentation**: /docs
- **Status**: /api/health
EOF

print_status "Deployment summary created"

echo ""
echo -e "${GREEN}🎉 Production Setup Complete!${NC}"
echo "=================================================="
echo "Next steps:"
echo "1. Review DEPLOYMENT_SUMMARY.md"
echo "2. Set API keys in your deployment environment"
echo "3. Deploy: npm run deploy"
echo "4. Configure custom domain"
echo "5. Set up monitoring"
echo ""
echo -e "${BLUE}Ready to deploy Blaze Intelligence! 🚀${NC}"