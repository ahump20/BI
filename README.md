# Blaze Intelligence

**Production-ready sports analytics platform providing real-time insights and data-driven intelligence for professional sports organizations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Production Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://blazesportsintel.com)

## Overview

Blaze Intelligence is a comprehensive sports analytics platform that delivers actionable insights for MLB, NFL, NBA, and NCAA organizations. The platform combines real-time data integration, advanced analytics, and intuitive visualizations to support data-driven decision-making.

## Core Features

### Multi-Sport Analytics
- **MLB Analytics**: Team performance tracking, player statistics, and game analysis
- **NFL Intelligence**: Game planning support and performance metrics
- **NBA Insights**: Real-time game analytics and player tracking
- **NCAA Coverage**: College sports analytics with recruitment integration

### Real-Time Data Integration
- Live game data processing and analysis
- Integration with MLB Stats API, ESPN API, and sports data providers
- Perfect Game youth baseball analytics
- Texas high school football data integration

### Platform Capabilities
- **REST API**: Comprehensive API for data access and integration
- **Analytics Dashboard**: Real-time performance visualization
- **Automated Reporting**: Scheduled report generation and distribution
- **Mobile Support**: React Native mobile application for iOS and Android
- **Computer Vision**: Biomechanical analysis and performance tracking

## Technical Architecture

### Backend
- **Runtime**: Node.js 20+ with ES modules
- **Framework**: Hono for API routing
- **Database**: Neon PostgreSQL with connection pooling
- **Cache**: Redis for performance optimization
- **Authentication**: JWT-based with bcrypt password hashing

### Frontend
- **Core**: Modern JavaScript (ES2020+), HTML5, CSS3
- **Visualization**: Chart.js, Three.js for 3D graphics
- **Mobile**: React Native with TypeScript

### Infrastructure
- **Hosting**: Cloudflare Workers and Pages
- **Storage**: R2 (object storage), KV (key-value), D1 (SQL database)
- **CDN**: Cloudflare global network
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Winston logging with structured output

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ahump20/BI.git
cd BI

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

```bash
# Start development server
npm run serve

# Run multi-AI integration
npm run start

# Watch for changes
npm run watch

# Run tests
npm run test-integration
```

### Deployment

```bash
# Deploy to Cloudflare Pages
npm run deploy

# Deploy biometric analysis system
npm run deploy:biometric

# Deploy to production (requires authentication)
wrangler pages deploy . --project-name=blaze-intelligence --branch=main
```

## Project Structure

```
blaze-intelligence/
├── api/                        # API endpoints
│   ├── health.js              # Health check endpoint
│   └── analytics.js           # Analytics API
├── austin-portfolio-deploy/   # Production website
│   ├── api/                   # Cloudflare Workers APIs
│   ├── assets/                # Static assets
│   └── data/                  # Analytics data
├── mobile-app/                # React Native mobile app
│   ├── src/                   # Source code
│   ├── __tests__/            # Mobile tests
│   └── android/               # Android build config
├── scripts/                   # Automation scripts
│   ├── multi_ai_integration.js
│   └── deployment/           # Deployment scripts
├── utils/                     # Shared utilities
│   └── logger.js             # Winston logger
├── data/                      # Sports data
│   ├── analytics/            # Processed analytics
│   └── live/                 # Real-time data feeds
├── .github/workflows/        # CI/CD pipelines
├── tests/                    # Test suites
└── wrangler.toml            # Cloudflare configuration
```

## Environment Configuration

See `.env.example` for complete configuration options. Key variables:

```bash
# Required
NODE_ENV=production
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Optional AI Services
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Sports Data APIs
MLB_API_BASE_URL=https://statsapi.mlb.com/api/v1
ESPN_API_BASE_URL=https://site.api.espn.com/apis/site/v2/sports

# Security
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
```

## API Documentation

### Health Check
```bash
GET /health
GET /health/live  # Liveness probe
GET /health/ready # Readiness probe
```

### Analytics Endpoints
```bash
GET  /api/analytics/teams/:teamId
GET  /api/analytics/players/:playerId
POST /api/analytics/reports
GET  /api/live/games/:gameId
```

See full API documentation in `/docs/api/` (coming soon).

## Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test-integration

# Run AI orchestration tests
npm run test-ai

# Run biometric system tests
npm run test-biometric
```

## Monitoring and Operations

### Health Monitoring
- Health check endpoints at `/health`, `/health/live`, `/health/ready`
- Structured logging with Winston to `/logs/` directory
- Error tracking and performance monitoring

### Logging
```javascript
import logger from './utils/logger.js';

logger.info('Operation completed', { metadata });
logger.error('Error occurred', error);
logger.logAPIError('/api/endpoint', error, sanitizedData);
```

### System Status
```bash
npm run status        # Check system status
npm run health-check  # Comprehensive health check
npm run security-scan # Security audit
```

## Security

- JWT-based authentication for API access
- bcrypt password hashing with salt rounds
- Rate limiting on all API endpoints
- CORS configuration for approved domains
- Environment variable protection
- Regular dependency audits (`npm audit`)
- Security scanning in CI/CD pipeline

## Performance

- Redis caching for frequently accessed data
- Cloudflare CDN for global content delivery
- Database connection pooling
- Optimized bundle sizes
- Lazy loading for non-critical resources

## Contributing

This is a private repository. For access or questions, contact:
- **Email**: ahump20@outlook.com
- **Phone**: (210) 273-5538

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

For technical support or deployment assistance:
- Email: ahump20@outlook.com
- Location: Boerne, TX 78015

## Deployment Target

This platform is production-ready for deployment to **blazesportsintel.com**.

### Pre-Deployment Checklist
- [x] Security vulnerabilities resolved
- [x] Structured logging implemented
- [x] Health check endpoints configured
- [x] Repository optimized (backups removed)
- [x] Environment configuration documented
- [x] CI/CD pipeline with security scanning
- [x] Error tracking and monitoring
- [ ] DNS configuration for blazesportsintel.com
- [ ] SSL/TLS certificates configured
- [ ] Production environment variables set in Cloudflare
- [ ] Database migrations completed
- [ ] Final load testing

## Changelog

### Version 2.0.0 (Production Ready)
- Comprehensive security audit and fixes
- Production-grade logging with Winston
- Health check endpoints for monitoring
- CI/CD pipeline improvements
- Repository optimization
- Documentation updates
- Performance enhancements

---

**Blaze Intelligence** - Data-driven sports analytics for championship organizations.
