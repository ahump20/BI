# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Scripts
- `npm run start` - Execute multi-AI analysis and integration pipeline
- `npm run update` - Process pending content updates for portfolio
- `npm run watch` - Start continuous monitoring of content changes
- `npm run deploy` - Deploy updates to portfolio system (production)
- `npm run deploy:biometric` - Deploy biometric analysis system
- `npm run mcp-server` - Start Cardinals Analytics MCP server
- `npm run biometric-processor` - Process biometric data for vision AI
- `npm run build` - Build static files (minimal build process)
- `npm run serve` - Start local development server on port 8000

### System Operations
- `npm run status` - Check system status via master automation controller
- `npm run health-check` - Run comprehensive health monitoring
- `npm run security-scan` - Execute security scanning and backup operations
- `npm run backup` - Create system backups
- `npm run ingest-data` - Run priority sports data ingestion
- `npm run test-ai` - Test AI orchestration deployment
- `npm run test-biometric` - Test biometric analysis system
- `npm run generate-reports` - Generate analytics reports pipeline

### GitHub Operations
- `npm run github-analyze` - Analyze GitHub repository structure
- `npm run github-cleanup` - Preview GitHub repository cleanup operations
- `npm run github-cleanup-execute` - Execute GitHub repository cleanup
- `npm run github-plan` - Generate GitHub organization plan

### Git Branch Management
- `npm run catch-branches` - Analyze and preview branch merge/update operations (dry-run)
- `npm run catch-branches-execute` - Execute branch merging, updating, and cleanup operations
- `npm run sync-branches` - Alias for catch-branches (safe preview mode)
- `npm run merge-to-main` - Alias for catch-branches-execute (executes changes)

### MCP Server Commands (via Claude Code)
```bash
# Start MCP server
./start-cardinals-server.sh

# Analyze trajectory from baseball stats to business metrics
/mcp call cardinals-analytics analyzeTrajectory --data path/to/baseball-data.json --comparison path/to/business-metrics.json

# Generate insights from sports data
/mcp call cardinals-analytics generateInsights --gameData '{"team": "Cardinals"}' --playerMetrics '{"performance": "metrics"}'

# Update portfolio sections with new content
/mcp call cardinals-analytics updatePortfolio --content "analysis content" --section "analytics"
```

## Architecture Overview

### Multi-AI Orchestration System
This codebase implements a comprehensive sports intelligence platform that orchestrates multiple AI models (Claude, ChatGPT, Gemini) for analytics and content generation.

**Core Components:**
- **Cardinals Analytics MCP Server** (`cardinals-analytics-server.js`) - Model Context Protocol server providing sports analytics functions
- **Multi-AI Integration** (`scripts/multi_ai_integration.js`) - Orchestrates parallel processing across AI models (Claude, ChatGPT, Gemini)
- **Dynamic Content Updater** (`dynamic-content-updater.js`) - Automated content processing and deployment system
- **Biometric Data Processor** (`biometric-data-processor.js`) - Vision AI and biomechanical analysis processing
- **Deployment Scripts** (`scripts/deployment/`) - Production deployment automation for various environments

### Data Architecture
```
/data/
├── analytics/          # Sports analytics by league (MLB/NFL/NBA/College)
├── live/              # Real-time sports data feeds
├── clients/           # Client-specific data and proposals
└── youth-baseball/    # Perfect Game and youth sports integration
```

### Automation Framework
The automation system is distributed across multiple locations:
- **Content Automation** (`texas-content-automation-test.js`) - Texas football content generation and testing
- **Email Automation** (`austin-portfolio-deploy/email-automation-worker.js`) - Automated email workflows
- **Zapier Integration** (`austin-portfolio-deploy/integrations/zapier-automation-engine.js`) - External automation platform integration
- **Notion Automation** (`austin-portfolio-deploy/notion-automation-setup.js`) - Content management automation
- **Client Reporting** (`reporting/client_report_automation.py`) - Automated client report generation

### Portfolio Integration
The `austin-portfolio-deploy/` directory contains the live portfolio system with:
- **Main Site** (`index.html`) - Primary Blaze Intelligence website with Texas Football Authority branding
- **Texas Football Pages** - Specialized pages for Texas football intelligence, rankings, and community
- **API Endpoints** (`api/`) - Lead capture, NIL calculator, Cardinals readiness data, analytics APIs
- **Interactive Dashboards** - Multiple sport-specific dashboards (Cardinals, Titans, Longhorns, Grizzlies)
- **Analytics Data** (`data/`) - League-specific performance data and real-time insights
- **Deployment Scripts** - Automated deployment to multiple hosting platforms

### Cloudflare Workers Integration
Multiple Wrangler configurations support different deployment environments:
- `wrangler.toml` - Main platform with R2 storage for media and data, KV namespaces for caching
- `wrangler-biometric.toml` - Biometric analysis and vision AI processing
- `wrangler-simple.toml` - Simplified deployment configuration

**Storage Bindings:**
- R2 Buckets: `MEDIA_STORAGE`, `DATA_STORAGE`, `YOUTH_DATA`
- Environment support: production, staging with appropriate variable configurations

### Vision AI Platform
Located in `blaze-vision-ai/` directory with computer vision capabilities:
- **Biomechanical Analysis** - Form assessment and movement pattern recognition using MediaPipe and TensorFlow.js
- **Micro-expression Detection** - Character evaluation through facial expression analysis
- **Real-time Processing** - Live performance feedback with sub-100ms latency
- **AR/VR Integration** - Three.js-powered immersive analytics environments

**Key Technologies:**
- `@mediapipe/pose` for pose detection
- `@tensorflow/tfjs` for machine learning inference
- Custom biometric processing pipeline

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Set up environment variables in `.env` file (see security notes below)
3. Register MCP server: Use Claude Code to register cardinals-analytics server
4. Start development server: `npm run serve` (serves on port 8000)

**Alternative local servers:**
- `python3 -m http.server 8001` - For serving static files on different port
- `wrangler pages dev` - For testing Cloudflare Pages locally

### Content Pipeline
The system automatically processes content updates through:
1. **Multi-AI Analysis** - `scripts/multi_ai_integration.js` orchestrates Claude, ChatGPT, and Gemini
2. **Dynamic Content Updates** - `dynamic-content-updater.js` processes and validates changes
3. **Portfolio Deployment** - Multiple deployment scripts for different platforms (Netlify, Cloudflare, etc.)
4. **Texas Football Authority** - Specialized content pipeline for Dave Campbell model integration

### Data Integration
Sports data flows through multiple pipelines:
- **Real-time APIs** - Live game data through MLB API, Sports Reference
- **Cardinals Analytics** - Specialized MCP server for St. Louis Cardinals data
- **Youth/Perfect Game** - Youth baseball recruitment and analytics
- **NIL Calculator** - College athlete valuation system
- **Texas Football** - High school football data with Friday Night Lights integration
- **Biometric Processing** - Computer vision data for performance analysis

## Key Technologies

- **Node.js/ES Modules** - Core runtime environment (requires Node.js 18+)
- **Model Context Protocol** - AI integration framework via `@modelcontextprotocol/sdk`
- **Cloudflare Workers** - Edge computing and deployment with R2/KV storage
- **TensorFlow.js & MediaPipe** - Machine learning for biometric analysis
- **Three.js** - 3D visualizations and AR/VR interfaces
- **Multi-AI Integration** - Claude, OpenAI, Google AI orchestration
- **Python & JavaScript** - Dual-language automation and processing
- **Wrangler** - Cloudflare deployment and configuration management

## Deployment Architecture

### Production Deployment Options
The system supports multiple deployment targets through specialized scripts:

**Primary Platforms:**
- **Cloudflare Pages** - `wrangler pages deploy` or `npm run deploy`
- **Netlify** - Via deployment scripts in `austin-portfolio-deploy/`
- **Local Development** - `npm run serve` or Python HTTP server

**Specialized Deployments:**
- **Biometric System** - `npm run deploy:biometric` for vision AI components
- **Production Complete** - `scripts/deployment/deploy-production.sh` for full system deployment
- **GitHub Pages** - Automated via GitHub Actions

### Environment Management
- **Production** - Full feature set with live data integrations
- **Staging** - Testing environment with preview data
- **Development** - Local development with mock data

## Mobile App Development

### React Native Mobile App
Located in `mobile-app/` directory with comprehensive sports video analysis capabilities:

**Mobile Commands:**
- `npm run android` - Run Android development build
- `npm run ios` - Run iOS development build  
- `npm run build:android` - Build Android production app
- `npm run build:ios` - Build iOS production app
- `npm run deploy:dev` - Deploy to development environment
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:prod` - Deploy to production environment

**Key Features:**
- **Video Analysis** - Real-time pose detection and biomechanical analysis
- **Camera Integration** - `react-native-vision-camera` for high-performance video capture
- **TensorFlow Mobile** - On-device ML inference with `@tensorflow/tfjs-react-native`
- **Face/Pose Detection** - Advanced computer vision for character assessment
- **Navigation** - React Navigation with stack and tab navigation

**Testing:**
- Jest testing framework with specialized setup for React Native
- Unit tests for API services and video analysis components
- Test files: `__tests__/BlazeAPIService.test.js`, `__tests__/VideoAnalysisService.test.js`

## API Architecture

### Core API Endpoints
The `austin-portfolio-deploy/api/` directory contains comprehensive API services:

**Authentication & User Management:**
- `auth.js` - User authentication and session management
- `client-onboarding.js` - Automated client onboarding workflows
- `automated-onboarding.js` - Enhanced automation for user setup

**Sports Data Integration:**
- `perfect-game-integration.js` - Youth baseball data and recruitment analytics
- `enhanced-live-metrics.js` - Real-time sports performance data
- `live-data-engine.js` - Live game data processing and caching

**Business Operations:**
- `stripe-integration.js` - Payment processing and subscription management
- `hubspot-integration.js` - CRM integration and lead management
- `notion-cms.js` - Content management system integration
- `crm-integration.js` - Multi-platform CRM connectivity

**System Operations:**
- `system-monitor.js` - Health monitoring and performance tracking
- `cloudflare-gateway.js` - Edge computing and CDN management
- `enhanced-gateway.js` - Advanced API gateway with rate limiting

## Testing Framework

### Test Structure
- **Unit Tests** - `austin-portfolio-deploy/tests/unit/` for individual component testing
- **Integration Tests** - API endpoint testing and data flow validation
- **E2E Testing** - Full user journey testing across platforms
- **Mobile Testing** - React Native component and service testing

**Test Commands:**
- `npm run test` - Run all test suites
- `npm run test-ai` - Test AI orchestration systems
- `npm run test-biometric` - Test vision AI and biometric analysis

## Environment Configuration

### Environment Variables
Comprehensive environment setup via `.env.example` covering:

**AI Services:**
- Claude, OpenAI, Google AI API keys and model configurations
- Multi-AI orchestration settings

**Sports Data APIs:**
- MLB Stats API, ESPN API, Perfect Game API
- Team-specific configurations for Cardinals, Titans, Longhorns, Grizzlies

**Infrastructure:**
- Cloudflare (R2, KV, D1, Workers) configuration
- Redis caching and session management
- Database connection pooling

**Security & Monitoring:**
- JWT secrets, session security, CORS configuration
- Sentry error tracking, Google Analytics integration
- Rate limiting and API protection

**Mobile App:**
- React Native app configuration
- Push notifications (Firebase, APNS)
- App store deployment settings

## Blaze Intelligence Brand Standards

- **Company Name**: Always use "Blaze Intelligence" (canonical, exclusive)
- **Example Teams**: Cardinals, Titans, Longhorns, Grizzlies (expand beyond these four as needed)
- **Savings Claims**: 67–80% vs named competitor tiers (factual range only)
- **Performance Claims**: Require "Methods & Definitions" link for benchmarks
- **Style**: Neutral, factual tone - avoid adversarial "vs competitors" language
- **Sports Focus**: MLB, NCAA football/basketball, NFL, NBA, high school sports, Perfect Game baseball data
- **Exclusions**: No soccer/football references in demos or examples

## Security Considerations

- **Environment Files**: Never commit API keys - use `.env.example` as template
- **Secret Management**: All sensitive data in environment variables only
- **Rate Limiting**: Implemented across all API endpoints with configurable limits
- **Audit Logging**: Comprehensive tracking via Winston for all data operations
- **Security Scanning**: Regular automated scans via `npm run security-scan`
- **Backup Systems**: Automated backup processes with 30-day retention

## Development Best Practices

### Code Organization
- **ES Modules**: All JavaScript uses modern ES module syntax (`import`/`export`)
- **TypeScript Support**: Mobile app and key components use TypeScript
- **Modular Architecture**: Clear separation between web, mobile, and API components
- **Environment Separation**: Distinct configurations for development, staging, production

### Common Development Patterns
**MCP Server Integration:**
```bash
# Register MCP server with Claude Code
./start-cardinals-server.sh

# Use MCP functions
/mcp call cardinals-analytics analyzeTrajectory --data <path>
```

**Multi-AI Orchestration:**
```bash
# Run comprehensive AI analysis
npm run start

# Test AI integration
npm run test-ai
```

**Cloudflare Deployment:**
```bash
# Deploy to staging
wrangler pages deploy --env staging

# Deploy to production  
npm run deploy
```

### Troubleshooting

**Common Port Conflicts:**
- Default server: port 8000 (`npm run serve`)
- Alternative: port 8001 (`python3 -m http.server 8001`)
- Check for running processes: `lsof -i :8000`

**ES Module Errors:**
- Ensure `"type": "module"` in package.json
- Use `import` instead of `require()`
- File extensions required for local imports

**MCP Server Issues:**
- Verify server registration in Claude Code
- Check MCP server logs for connection errors
- Restart server: `./start-cardinals-server.sh`

**Mobile Development:**
- iOS: Requires Xcode and iOS simulator
- Android: Requires Android Studio and emulator
- Camera permissions needed for vision AI features

## Monitoring and Maintenance

- **Health Monitoring**: Automated checks via `npm run health-check`
- **Performance Tracking**: JSON logs with Winston logging framework
- **Error Tracking**: Sentry integration for production error monitoring
- **System Status**: Real-time dashboard via `npm run status`
- **Analytics**: Google Analytics integration for user behavior tracking
- **Automated Deployments**: GitHub Actions for continuous deployment
- I want Blaze Intelligence to be branded indirectly the Dave Campbell's Texas High School football of SEC/Texas/"Deep South" sports teams, prospects, and players from youth through professional levels in baseball and football