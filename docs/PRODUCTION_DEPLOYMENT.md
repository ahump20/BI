# Production Deployment Guide

## Overview
This guide covers the complete production deployment process for Blaze Intelligence to blazesportsintel.com.

## Pre-Deployment Requirements

### 1. Infrastructure Setup
- [ ] Cloudflare account with Workers/Pages enabled
- [ ] Domain blazesportsintel.com added to Cloudflare
- [ ] DNS configured and pointing to Cloudflare
- [ ] SSL/TLS certificates configured (automatic with Cloudflare)

### 2. Environment Variables
Configure the following in Cloudflare Dashboard → Pages → Settings → Environment Variables:

**Required:**
```
NODE_ENV=production
CLOUDFLARE_ACCOUNT_ID=<your_account_id>
```

**Security:**
```
JWT_SECRET=<generate_secure_random_string>
SESSION_SECRET=<generate_secure_random_string>
```

**Optional API Keys:**
```
CLAUDE_API_KEY=<if_using_ai>
OPENAI_API_KEY=<if_using_ai>
MLB_API_KEY=<if_required>
```

### 3. Database Setup
1. Create Neon PostgreSQL database
2. Run migrations (if any)
3. Configure connection string in Cloudflare secrets

### 4. Cloudflare Bindings
Configure in wrangler.toml or Cloudflare Dashboard:
- **KV Namespace**: ANALYTICS_CACHE
- **R2 Buckets**: DATA_STORAGE, MEDIA_STORAGE
- **D1 Database**: BLAZE_DB (if using)

## Deployment Process

### Step 1: Local Verification
```bash
# Run all tests
npm run test-integration

# Security audit
npm audit

# Build locally
npm run build

# Test build
npm run serve
```

### Step 2: Deploy to Staging
```bash
# Deploy to staging branch first
git checkout staging
git merge main
git push origin staging

# Cloudflare will auto-deploy staging environment
# Test at: https://staging.blazesportsintel.com
```

### Step 3: Production Deployment
```bash
# Via GitHub Actions (Recommended)
git checkout main
git push origin main
# GitHub Actions will run security scans, tests, and deploy

# OR manual deployment via Wrangler
wrangler pages deploy . --project-name=blaze-intelligence --branch=main
```

### Step 4: Verify Deployment
```bash
# Check health endpoint
curl https://blazesportsintel.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-02T12:00:00Z",
  "version": "2.0.0",
  "dependencies": {...}
}
```

## Post-Deployment Verification

### Health Checks
```bash
# Liveness probe
curl https://blazesportsintel.com/health/live

# Readiness probe  
curl https://blazesportsintel.com/health/ready

# Full health check
curl https://blazesportsintel.com/health
```

### Load Testing
```bash
# Install k6 or Apache Bench
# Run load test
ab -n 1000 -c 10 https://blazesportsintel.com/

# Monitor Cloudflare Analytics during test
```

### Monitor Logs
```bash
# View Cloudflare Workers logs
wrangler tail --name blaze-intelligence

# Check error rates in Cloudflare Dashboard
```

## Rollback Procedure

### Quick Rollback
```bash
# Rollback to previous deployment
wrangler pages deployments list
wrangler pages deployment rollback <deployment-id>
```

### Git Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
# CI/CD will auto-deploy reverted version
```

## Monitoring and Alerts

### Key Metrics to Monitor
1. **Response Time**: < 200ms p95
2. **Error Rate**: < 0.1%
3. **Availability**: > 99.9%
4. **Memory Usage**: < 128MB per worker

### Cloudflare Analytics
- Monitor in Cloudflare Dashboard → Analytics
- Set up notifications for anomalies
- Review daily/weekly traffic patterns

### Application Logging
- Logs stored in `/logs/` directory (if using persistent storage)
- Error logs: `logs/error-YYYY-MM-DD.log`
- Combined logs: `logs/combined-YYYY-MM-DD.log`
- Audit logs: `logs/audit-YYYY-MM-DD.log`

## Security Checklist

- [ ] All environment variables configured
- [ ] No secrets in code repository
- [ ] JWT secrets are strong (64+ characters)
- [ ] Rate limiting enabled on all endpoints
- [ ] CORS configured for approved domains only
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] npm audit shows 0 vulnerabilities
- [ ] TLS 1.3 enabled
- [ ] Regular security scans scheduled

## Performance Optimization

### Caching Strategy
- Static assets: 1 year cache
- API responses: Configured per endpoint
- CDN: Cloudflare global network

### Database Optimization
- Connection pooling enabled
- Query optimization
- Indexes on frequently queried columns

### Bundle Optimization
- Minification enabled in production
- Tree-shaking for unused code
- Lazy loading for non-critical resources

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify environment variables
3. Check wrangler.toml configuration
4. Verify Cloudflare account permissions

### High Error Rates
1. Check `/health` endpoint
2. Review error logs
3. Verify database connectivity
4. Check external API status

### Slow Response Times
1. Check Cloudflare Analytics
2. Review database query performance
3. Verify cache hit rates
4. Check for N+1 queries

## Maintenance Windows

### Recommended Schedule
- **Minor Updates**: Rolling deployment (zero downtime)
- **Major Updates**: Sunday 2-4 AM CST
- **Database Migrations**: Scheduled maintenance window

### Maintenance Checklist
1. Notify users 24 hours in advance
2. Create database backup
3. Deploy to staging first
4. Run smoke tests
5. Deploy to production
6. Monitor for 1 hour post-deployment

## Support Contacts

- **Technical Issues**: ahump20@outlook.com
- **Emergency Contact**: (210) 273-5538
- **Cloudflare Support**: support.cloudflare.com

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: 2025-11-02
**Version**: 2.0.0
