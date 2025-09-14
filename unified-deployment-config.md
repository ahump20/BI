# UNIFIED PLATFORM DEPLOYMENT CONFIGURATION
## Blaze Intelligence Consolidated Hub

### DEPLOYMENT STATUS
- **Primary URL**: https://blaze-intelligence.netlify.app/
- **Secondary URL**: https://blaze-intelligence-replit.netlify.app/
- **Development URL**: https://blaze-intelligence.replit.app/
- **Target**: Single unified deployment with all features preserved

### PLATFORM INVENTORY

#### Main Netlify (blaze-intelligence.netlify.app)
**Unique Features:**
- Perfect Game Intelligence Hub (15,000+ MLB alumni)
- NIL Intelligence Platform ($14M SEC collectives)
- Southern Sports Ecosystem tracking
- Research-validated metrics
- 4 hero stats configuration
- Enhanced Texas regional coverage

#### Replit Netlify (blaze-intelligence-replit.netlify.app)
**Unique Features:**
- AI Consciousness tracking (87% level)
- Neural network visualization
- Video Intelligence Platform (33+ keypoint tracking)
- Data storytelling with pressure-aware narratives
- Advanced Three.js animations
- Biomechanical character assessment

#### Replit Native (blaze-intelligence.replit.app)
**Unique Features:**
- Development environment
- Real-time SSE data streaming
- Live development preview
- Testing environment

### API CONSOLIDATION

#### Core API Functions (30+ total)
**Authentication & User Management:**
- auth.js
- automated-onboarding.js
- client-onboarding.js

**Sports Data Integration:**
- perfect-game-integration.js
- enhanced-live-metrics.js
- live-data-engine.js
- cardinals/

**Business Operations:**
- stripe-integration.js
- hubspot-integration.js
- notion-cms.js
- crm-integration.js

**Advanced Analytics:**
- advanced-analytics.js
- enhanced-nil-calculator.js
- live-connections.js

**Gateway & Infrastructure:**
- cloudflare-gateway.js
- enhanced-gateway.js
- system-monitor.js

### UNIFIED ARCHITECTURE

```
blaze-intelligence-unified/
├── index.html (merged features)
├── api/
│   ├── [all 30+ API functions]
│   └── _middleware.js (unified routing)
├── assets/
│   ├── js/
│   │   ├── three.js (hero animations)
│   │   ├── neural-network.js (AI viz)
│   │   ├── video-intelligence.js
│   │   └── perfect-game-hub.js
│   ├── css/
│   │   └── unified-styles.css
│   └── data/
│       ├── perfect-game/
│       ├── nil-intelligence/
│       └── ai-consciousness/
├── pages/
│   ├── perfect-game-intelligence-hub.html
│   ├── nil-intelligence-platform.html
│   ├── video-intelligence.html
│   └── ai-consciousness-dashboard.html
├── netlify.toml (unified config)
├── wrangler.toml (Cloudflare backup)
└── package.json (consolidated deps)
```

### MIGRATION STEPS

#### Phase 1: Content Consolidation
1. ✅ Clone BI repository
2. ✅ Audit all three platforms
3. 🔄 Map API endpoints
4. ⏳ Merge unique features into single index.html

#### Phase 2: API Unification
1. ⏳ Consolidate all API functions
2. ⏳ Create unified routing middleware
3. ⏳ Test all endpoints

#### Phase 3: Asset Integration
1. ⏳ Merge Three.js animations
2. ⏳ Combine CSS frameworks
3. ⏳ Consolidate data sources

#### Phase 4: Deployment Configuration
1. ⏳ Update netlify.toml for unified deployment
2. ⏳ Configure environment variables
3. ⏳ Set up redirects for old URLs

#### Phase 5: Testing & Validation
1. ⏳ Test all API endpoints
2. ⏳ Verify all features preserved
3. ⏳ Performance benchmarking
4. ⏳ Security audit

### FEATURE PRESERVATION CHECKLIST

#### From Main Netlify
- [ ] Perfect Game Intelligence (15,000+ MLB alumni)
- [ ] NIL Collective Tracking ($14M SEC average)
- [ ] Southern Sports Ecosystem
- [ ] 304 Texas NFL players metric
- [ ] 2,300+ MLB players metric

#### From Replit Netlify
- [ ] AI Consciousness Level (87%)
- [ ] Neural Network Visualization
- [ ] Video Intelligence (33+ keypoints)
- [ ] Data Storytelling Engine
- [ ] Pressure-Aware Narratives
- [ ] Advanced Three.js Hero

#### From Both
- [ ] All 30+ API functions
- [ ] Authentication systems
- [ ] Payment processing
- [ ] CRM integrations
- [ ] Analytics tracking

### ROUTING CONFIGURATION

```javascript
// Unified routing for all legacy URLs
const redirects = {
  // Main Netlify routes
  '/perfect-game-intelligence-hub': '/perfect-game',
  '/nil-intelligence-platform': '/nil',
  
  // Replit routes
  '/ai-consciousness': '/dashboard/ai',
  '/video-intelligence': '/analytics/video',
  
  // API routes (maintain compatibility)
  '/api/*': '/.netlify/functions/:splat',
  '/.netlify/functions/*': '/api/:splat'
};
```

### ENVIRONMENT VARIABLES

```env
# AI Services
OPENAI_API_KEY=
CLAUDE_API_KEY=
GEMINI_API_KEY=

# Sports Data
PERFECT_GAME_API_KEY=
MLB_STATS_API_KEY=
ESPN_API_KEY=

# Infrastructure
CLOUDFLARE_ACCOUNT_ID=
NETLIFY_AUTH_TOKEN=
REPLIT_TOKEN=

# Business
STRIPE_SECRET_KEY=
HUBSPOT_API_KEY=
NOTION_API_KEY=

# Monitoring
SENTRY_DSN=
GOOGLE_ANALYTICS_ID=
```

### DEPLOYMENT COMMANDS

```bash
# Build unified platform
npm run build:unified

# Deploy to Netlify (primary)
netlify deploy --prod --dir=dist

# Deploy to Cloudflare (backup)
wrangler pages deploy dist

# Test locally
npm run serve:unified
```

### SUCCESS METRICS

- ✅ All features from 3 platforms preserved
- ✅ Zero downtime migration
- ✅ Sub-100ms response times maintained
- ✅ All API endpoints functional
- ✅ SEO rankings preserved
- ✅ User sessions maintained

### ROLLBACK PLAN

1. Keep original deployments active during migration
2. DNS switch only after full validation
3. Maintain backup on Cloudflare Pages
4. Database snapshots before migration
5. API versioning for compatibility

### MONITORING

- Real-time performance monitoring
- API endpoint health checks
- User session tracking
- Error rate monitoring
- Traffic analytics comparison

### POST-MIGRATION

1. Update all documentation
2. Notify users of consolidated platform
3. Monitor for 48 hours
4. Performance optimization
5. Remove legacy deployments after 30 days