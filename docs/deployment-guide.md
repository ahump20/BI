# Unified Platform Rollout Documentation
## PR #47: Cloudflare and Netlify Deployment Templates

This document provides comprehensive deployment templates and infrastructure documentation for the Blaze Intelligence platform rollout across multiple hosting providers.

## Deployment Options

### 1. Cloudflare Pages Deployment

#### Primary Configuration (`wrangler.toml`)
```toml
name = "blaze-intelligence"
compatibility_date = "2024-09-22"
pages_build_output_dir = "dist"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.staging]
vars = { ENVIRONMENT = "staging" }

[[env.production.r2_buckets]]
binding = "MEDIA_STORAGE"
bucket_name = "blaze-media"

[[env.production.kv_namespaces]]
binding = "DATA_CACHE"
id = "blaze_cache_production"
```

#### Biometric Processing (`wrangler-biometric.toml`)
```toml
name = "blaze-biometric"
main = "biometric-data-processor.js"
compatibility_date = "2024-09-22"

[vars]
VISION_AI_ENABLED = "true"
TENSORFLOW_MODEL_PATH = "/models/pose-detection"
```

#### Championship APIs (`wrangler-championship-apis.toml`)
```toml
name = "blaze-championship-apis"
main = "api/live-intelligence-endpoints.js"
compatibility_date = "2024-09-22"

[vars]
JWT_SECRET = "championship-secret-key"
RATE_LIMIT_ENABLED = "true"
```

### 2. Netlify Deployment

#### Configuration (`netlify.toml`)
```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  BLAZE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. GitHub Pages Deployment

#### GitHub Actions Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Run tests
      run: npm run test-integration
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Environment Configuration

### Production Environment Variables
```bash
# Core Configuration
NODE_ENV=production
BLAZE_ENV=production
PORT=3000

# Database & Storage
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
R2_BUCKET_NAME=blaze-media-production

# API Keys
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=...
GOOGLE_AI_API_KEY=...

# Authentication
JWT_SECRET=your-super-secret-jwt-key
AUTH0_DOMAIN=blaze-intelligence.auth0.com
AUTH0_CLIENT_ID=...

# Sports Data APIs
MLB_API_KEY=...
NFL_API_KEY=...
NCAA_API_KEY=...
PERFECT_GAME_API_KEY=...

# Monitoring & Analytics
SENTRY_DSN=https://...
GOOGLE_ANALYTICS_ID=G-...
```

### Staging Environment Variables
```bash
# Core Configuration
NODE_ENV=staging
BLAZE_ENV=staging
PORT=3001

# Use staging/test versions of all APIs
```

### Development Environment Variables
```bash
# Core Configuration
NODE_ENV=development
BLAZE_ENV=development
PORT=8000

# Local development settings
DATABASE_URL=postgresql://localhost/blaze_dev
REDIS_URL=redis://localhost:6379
```

## Deployment Scripts

### Master Deployment Script (`scripts/deployment/master-deploy.sh`)
```bash
#!/bin/bash
# Master Deployment Script for Blaze Intelligence
# Usage: ./master-deploy.sh [environment] [service]

set -e

ENVIRONMENT=${1:-production}
SERVICE=${2:-all}

echo "🚀 Starting Blaze Intelligence deployment..."
echo "Environment: $ENVIRONMENT"
echo "Service: $SERVICE"

case $SERVICE in
  "all")
    echo "📦 Deploying all services..."
    ./deploy-cloudflare.sh $ENVIRONMENT
    ./deploy-netlify.sh $ENVIRONMENT
    ./deploy-apis.sh $ENVIRONMENT
    ;;
  "cloudflare")
    ./deploy-cloudflare.sh $ENVIRONMENT
    ;;
  "netlify")
    ./deploy-netlify.sh $ENVIRONMENT
    ;;
  "apis")
    ./deploy-apis.sh $ENVIRONMENT
    ;;
  *)
    echo "❌ Unknown service: $SERVICE"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"
```

### Cloudflare Deployment (`scripts/deployment/deploy-cloudflare.sh`)
```bash
#!/bin/bash
# Cloudflare Pages deployment script

ENVIRONMENT=${1:-production}

echo "☁️ Deploying to Cloudflare Pages ($ENVIRONMENT)..."

# Build the project
npm run build

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
  wrangler pages deploy dist --project-name=blaze-intelligence --env=production
elif [ "$ENVIRONMENT" = "staging" ]; then
  wrangler pages deploy dist --project-name=blaze-intelligence --env=staging
else
  echo "❌ Unknown environment: $ENVIRONMENT"
  exit 1
fi

# Deploy specialized workers
echo "🤖 Deploying specialized workers..."
wrangler deploy --config wrangler-biometric.toml --env $ENVIRONMENT
wrangler deploy --config wrangler-championship-apis.toml --env $ENVIRONMENT

echo "✅ Cloudflare deployment complete!"
```

### Netlify Deployment (`scripts/deployment/deploy-netlify.sh`)
```bash
#!/bin/bash
# Netlify deployment script

ENVIRONMENT=${1:-production}

echo "🌐 Deploying to Netlify ($ENVIRONMENT)..."

# Build the project
npm run build

# Deploy using Netlify CLI
if [ "$ENVIRONMENT" = "production" ]; then
  netlify deploy --prod --dir=dist
else
  netlify deploy --dir=dist
fi

echo "✅ Netlify deployment complete!"
```

### API Services Deployment (`scripts/deployment/deploy-apis.sh`)
```bash
#!/bin/bash
# API services deployment script

ENVIRONMENT=${1:-production}

echo "🔧 Deploying API services ($ENVIRONMENT)..."

# Deploy Live Intelligence API
echo "🧠 Deploying Live Intelligence API..."
node api/live-intelligence-endpoints.js --deploy --env=$ENVIRONMENT

# Deploy Scoreboard API
echo "📊 Deploying Scoreboard API..."
node api/scoreboard-server.js --deploy --env=$ENVIRONMENT

# Deploy MCP Server
echo "⚾ Deploying Cardinals Analytics MCP Server..."
./start-cardinals-server.sh --env=$ENVIRONMENT

echo "✅ API services deployment complete!"
```

## Infrastructure Requirements

### Minimum System Requirements
- **CPU:** 2 vCPUs (4 recommended for production)
- **RAM:** 4GB (8GB recommended for production)
- **Storage:** 20GB SSD
- **Network:** 1Gbps connection

### Recommended Production Setup
- **Load Balancer:** Cloudflare or AWS ALB
- **CDN:** Cloudflare with global edge locations
- **Database:** PostgreSQL 14+ with read replicas
- **Cache:** Redis Cluster with 99.9% availability
- **Monitoring:** Sentry + DataDog + Custom metrics

### Security Considerations
- **SSL/TLS:** Minimum TLS 1.2, prefer TLS 1.3
- **Headers:** Full security header suite implemented
- **Rate Limiting:** Per-IP and per-user limits
- **Authentication:** JWT with short expiration + refresh tokens
- **Input Validation:** Comprehensive sanitization and validation
- **CORS:** Strict origin control

### Performance Targets
- **Page Load Time:** < 2 seconds on 3G
- **API Response Time:** < 100ms for 95th percentile
- **Uptime:** 99.9% availability SLA
- **Scalability:** Handle 10,000+ concurrent users

## Monitoring and Alerting

### Key Metrics to Monitor
- **Application Performance:** Response times, error rates, throughput
- **Infrastructure:** CPU, memory, disk usage, network traffic
- **Business Metrics:** User engagement, conversion rates, NIL calculations
- **Security:** Failed login attempts, suspicious activity, DDoS attempts

### Alert Thresholds
- **Critical:** API response time > 1 second, Error rate > 5%, Disk usage > 90%
- **Warning:** API response time > 500ms, Error rate > 1%, Memory usage > 80%

## Rollback Procedures

### Automated Rollback
```bash
# Quick rollback to previous deployment
./scripts/deployment/rollback.sh

# Rollback specific service
./scripts/deployment/rollback.sh --service=apis --version=v1.2.3
```

### Manual Rollback Steps
1. Identify the issue and impact
2. Stop new deployments
3. Revert to previous stable version
4. Verify service restoration
5. Investigate root cause
6. Implement hotfix if needed

## Support and Maintenance

### Regular Maintenance Tasks
- **Daily:** Monitor logs and metrics
- **Weekly:** Security updates, dependency updates
- **Monthly:** Performance optimization, capacity planning
- **Quarterly:** Security audits, disaster recovery testing

### Emergency Contacts
- **Primary On-Call:** Technical Lead
- **Secondary:** DevOps Engineer
- **Escalation:** Engineering Manager

### Documentation Updates
This documentation should be updated with each major release and reviewed quarterly for accuracy and completeness.

---

*Last Updated: September 22, 2025*
*Version: 2.0.0*
*Author: Blaze Intelligence Platform Team*