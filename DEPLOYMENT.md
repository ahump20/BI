# Blaze Sports Intel - Deployment Guide

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start local server
npm run serve

# Open browser to http://localhost:8000
```

### Build for Production
```bash
# Build static files
npm run build

# Files will be in ./dist directory
```

## Deployment Options

### 1. Cloudflare Pages (Recommended)
```bash
# Deploy to Cloudflare Pages
npm run deploy

# Deploy biometric system
npm run deploy:biometric
```

**Settings:**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 18.x

### 2. Netlify
```bash
# Using Netlify CLI
netlify deploy --prod

# Or drag and drop dist/ folder to netlify.com
```

**Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18.x

### 3. GitHub Pages
GitHub Pages deployment is automated via GitHub Actions.

**Manual deployment:**
```bash
# Deploy to gh-pages branch
npm run deploy:gh-pages
```

### 4. Docker
```bash
# Build container
docker-compose build

# Run in production
docker-compose up -d

# With monitoring
docker-compose --profile monitoring up -d
```

## Environment Variables

### Required Variables
```bash
# Database
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Caching
REDIS_URL=redis://localhost:6379

# Cloudflare
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### Optional Variables
```bash
# AI Services
CLAUDE_API_KEY=your_key
OPENAI_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key

# Sports Data APIs
MLB_API_KEY=your_key
ESPN_API_KEY=your_key
PERFECT_GAME_API_KEY=your_key

# Monitoring
SENTRY_DSN=your_dsn
GOOGLE_ANALYTICS_ID=your_id
```

## Performance Optimization

### Asset Optimization
- All external libraries use `defer` or `async` loading
- Fonts load with media query trick for non-blocking
- Images should use `loading="lazy"` attribute
- Service worker caches static assets

### Caching Strategy
- Static assets: 1 year cache
- HTML: No cache (always fresh)
- API responses: 5 minute cache
- Media files: 30 day cache

### CDN Configuration
Add these headers via `_headers` file:
```
/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: no-cache

/api/*
  Cache-Control: public, max-age=300
```

## Monitoring

### Health Checks
```bash
# Check system status
npm run health-check

# Monitor system
npm run status
```

### Performance Monitoring
- Sentry for error tracking
- Google Analytics for user behavior
- Custom metrics via `/api/metrics`

### Uptime Monitoring
Set up monitoring for:
- Main site: https://blazesportsintel.com
- API: https://blazesportsintel.com/api/health
- Status page: https://status.blazesportsintel.com

## Security

### SSL/TLS
- Always use HTTPS in production
- Enable HSTS headers
- Use TLS 1.3 minimum

### Content Security Policy
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

### Rate Limiting
- API endpoints: 100 requests per minute
- Form submissions: 10 per hour
- Authentication: 5 attempts per 15 minutes

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Service Worker Issues
```bash
# Clear service worker cache
# In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})
```

### External Dependencies Not Loading
- Check if CDN URLs are accessible
- Verify error handlers are working
- Review console warnings for specific failures

## Rollback Procedure

### Quick Rollback
```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Redeploy
npm run deploy
```

### Full Rollback
```bash
# Find previous working commit
git log --oneline

# Reset to that commit
git reset --hard <commit-hash>
git push -f origin main
```

## Support

For deployment issues:
- Email: austin@blazesportsintel.com
- Phone: (210) 273-5538
- GitHub Issues: https://github.com/ahump20/BI/issues

## Changelog

### v4.0.0 (Current)
- Added PWA manifest and icons
- Improved accessibility (WCAG 2.1 AA)
- Enhanced mobile touch targets
- Better error handling for external dependencies
- Updated service worker caching strategy

### v3.0.0
- Multi-AI integration system
- Championship analytics platform
- Enhanced 3D visualizations
- Real-time sports data feeds
