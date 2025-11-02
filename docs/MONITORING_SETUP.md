# Monitoring and Observability Setup

## Overview
Comprehensive monitoring strategy for production deployment of Blaze Intelligence.

## Logging Strategy

### Winston Logger Configuration

All application logs use Winston with structured JSON output:

```javascript
import logger from './utils/logger.js';

// Info logging
logger.info('Operation completed', { userId: 123, duration: 250 });

// Error logging
logger.logError(error, { context: 'additional info' });

// API error logging (sanitizes sensitive data)
logger.logAPIError('/api/endpoint', error, { requestId: 'abc123' });

// Security events
logger.logSecurityEvent('Failed login attempt', { ip: '1.2.3.4' });

// Performance tracking
logger.logPerformance('database-query', 125, { query: 'SELECT...' });
```

### Log Locations

Production logs are written to:
- `/logs/error-YYYY-MM-DD.log` - Error logs only
- `/logs/combined-YYYY-MM-DD.log` - All logs
- `/logs/audit-YYYY-MM-DD.log` - Audit trail (90-day retention)

Log rotation:
- Error logs: 30-day retention, max 20MB per file
- Combined logs: 14-day retention, max 20MB per file
- Audit logs: 90-day retention, max 20MB per file

## Cloudflare Analytics

### Built-in Metrics

Monitor in Cloudflare Dashboard → Analytics:

1. **Traffic Metrics**
   - Requests per second
   - Bandwidth usage
   - Geographic distribution
   - Status code distribution

2. **Performance Metrics**
   - Response time (p50, p95, p99)
   - Cache hit rate
   - Worker CPU time
   - Worker duration

3. **Security Metrics**
   - Bot traffic
   - Threat detection
   - WAF events
   - DDoS attacks

### Cloudflare Logpush

Configure Logpush to send logs to external service:

```bash
# Configure via CLI
wrangler logpush create \
  --destination-conf "s3://bucket-name/logs" \
  --dataset "http_requests" \
  --frequency 300
```

## Application Performance Monitoring (APM)

### Recommended APM Solutions

1. **Sentry** (Error Tracking)
   ```javascript
   // Initialize Sentry
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

2. **New Relic** (Full APM)
   - Transaction tracing
   - Database monitoring
   - External service monitoring

3. **Datadog** (Infrastructure + APM)
   - Real-time dashboards
   - Custom metrics
   - Alerting

### Custom Metrics

Track application-specific metrics:

```javascript
// Track API endpoint performance
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;
logger.logPerformance('api-call', duration, {
  endpoint: '/api/analytics',
  status: 200
});
```

## Health Check Monitoring

### Uptime Monitoring Services

Configure external uptime monitoring:

1. **UptimeRobot** (Free tier available)
   - Monitor: https://blazesportsintel.com/health/ready
   - Interval: 5 minutes
   - Alert on: 2 consecutive failures

2. **Pingdom** (Premium)
   - Global checks from multiple locations
   - Transaction monitoring
   - Real user monitoring

### Health Check Endpoints

Monitor these endpoints:

```bash
# Liveness (basic availability)
GET https://blazesportsintel.com/health/live
Expected: 200 OK

# Readiness (full system health)
GET https://blazesportsintel.com/health/ready
Expected: 200 OK, all dependencies healthy

# Detailed health
GET https://blazesportsintel.com/health
Expected: 200 OK with full metrics
```

## Alert Configuration

### Critical Alerts (Immediate Response)

Configure alerts for:
- Service down (2 consecutive health check failures)
- Error rate > 5%
- Response time p95 > 1000ms
- Database connection failures
- Security events (rate limit violations, auth failures)

### Warning Alerts (Monitor)

Configure alerts for:
- Error rate > 1%
- Response time p95 > 500ms
- Cache miss rate > 50%
- Disk usage > 80%
- Memory usage > 80%

### Alert Channels

Configure multiple channels:
1. **Email**: ahump20@outlook.com
2. **SMS**: (210) 273-5538 (critical only)
3. **Slack**: #blaze-intelligence-alerts
4. **PagerDuty**: For on-call rotation

## Performance Monitoring

### Key Performance Indicators (KPIs)

Monitor these metrics:

1. **Response Time**
   - p50: < 100ms
   - p95: < 200ms
   - p99: < 500ms

2. **Availability**
   - Target: 99.9% (8.76 hours downtime/year)
   - Measured: Monthly rolling window

3. **Error Rate**
   - Target: < 0.1%
   - 4xx errors: < 1%
   - 5xx errors: < 0.1%

4. **Throughput**
   - Requests per second
   - Data transfer (GB/day)

### Database Performance

Monitor:
- Query execution time
- Connection pool usage
- Slow query log (> 100ms)
- Lock waits
- Index usage

### Cache Performance

Monitor:
- Hit rate (target: > 80%)
- Eviction rate
- Memory usage
- Key count

## Dashboard Setup

### Cloudflare Dashboard

Default dashboard shows:
- Request volume (24h, 7d, 30d)
- Bandwidth usage
- Response codes
- Geographic distribution
- Top endpoints

### Custom Grafana Dashboard

Create custom dashboard with:
- Real-time request rate
- Error rate by endpoint
- Response time percentiles
- Database query performance
- Cache hit/miss rates
- Worker metrics

Example Grafana JSON config available in `/docs/grafana/`.

## Log Analysis

### Cloudflare Logs Analytics

Use Workers Analytics Engine for custom queries:

```javascript
// Query error rates
SELECT
  toStartOfInterval(timestamp, INTERVAL '1' MINUTE) as time,
  countIf(status >= 500) as errors,
  count() as total
FROM analytics_dataset
WHERE timestamp > now() - INTERVAL '1' HOUR
GROUP BY time
```

### Structured Log Queries

With Winston JSON logs, query efficiently:

```bash
# Find all errors in last hour
cat logs/error-$(date +%Y-%m-%d).log | \
  jq 'select(.timestamp > "2025-11-02T11:00:00Z")'

# Count errors by type
cat logs/error-$(date +%Y-%m-%d).log | \
  jq -r '.error.name' | sort | uniq -c
```

## Incident Response

### Response Procedure

1. **Detection** (< 5 minutes)
   - Alert triggered
   - Verify issue in health check
   - Check Cloudflare status

2. **Assessment** (< 10 minutes)
   - Review recent deployments
   - Check error logs
   - Identify affected components

3. **Mitigation** (< 30 minutes)
   - Rollback if needed
   - Scale resources if performance issue
   - Patch if security issue

4. **Resolution** (< 2 hours)
   - Apply permanent fix
   - Verify health checks
   - Monitor for recurrence

5. **Post-Mortem** (< 48 hours)
   - Root cause analysis
   - Document timeline
   - Implement preventive measures

### Incident Communication

- **Status page**: status.blazesportsintel.com
- **User notification**: Email to subscribers
- **Internal**: Slack #incidents channel

## Regular Maintenance

### Daily Checks
- Review error logs
- Check health endpoint
- Monitor performance metrics
- Verify backup completion

### Weekly Checks
- Review slow query log
- Analyze traffic patterns
- Check security events
- Update dependencies

### Monthly Checks
- Review and rotate logs
- Capacity planning review
- Security audit
- Performance optimization review

## Cost Monitoring

### Cloudflare Costs
- Track billable requests
- Monitor bandwidth usage
- Review Workers KV/R2 usage
- Optimize cache to reduce origin requests

### Third-party Service Costs
- Monitor API call volumes
- Review database query counts
- Track data transfer costs

## Compliance and Audit

### Audit Logging

All sensitive operations logged to audit trail:
- User authentication
- Data access
- Configuration changes
- Security events

### Compliance Requirements

Maintain logs for:
- GDPR compliance: User data access logs
- Security compliance: Auth/access logs
- Financial compliance: Transaction logs (if applicable)

## Tools and Resources

### Required Tools
- Cloudflare Dashboard (included)
- Winston Logger (implemented)
- Health check endpoint (implemented)

### Recommended Tools
- Sentry for error tracking
- UptimeRobot for uptime monitoring
- Grafana for custom dashboards
- PagerDuty for incident management

### Documentation
- [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Grafana Cloudflare Integration](https://grafana.com/grafana/plugins/cloudflare-cloudflare/)

---

**Last Updated**: 2025-11-02  
**Version**: 2.0.0
