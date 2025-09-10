# Blaze Intelligence Monitoring

This directory contains monitoring, alerting, and health check components for the Blaze Intelligence platform.

## Components

### Health Checks
- `/api/health` - System health endpoint
- `/api/metrics` - Performance metrics endpoint
- Real-time service status monitoring
- Database connectivity checks
- External API availability

### Monitoring Dashboard
- `dashboard.html` - Real-time monitoring interface
- Visual health indicators
- Performance metrics display
- Service status overview
- Auto-refreshing data

### Alerting System
- `alerts.js` - Alert management and notification
- Slack integration for notifications
- Configurable thresholds
- Multiple alert levels (info, warning, critical)
- Alert history tracking

### Scheduled Monitoring
- Health checks every 5 minutes
- Metrics collection every hour
- Daily maintenance tasks
- Automated alert notifications

## Configuration

### Environment Variables
- `SLACK_WEBHOOK_URL` - Slack notifications
- `SENTRY_DSN` - Error tracking
- `MONITORING_ENABLED` - Enable/disable monitoring

### Alert Thresholds
- Response time: 5000ms
- Error rate: 5%
- Data freshness: 60 minutes
- Service downtime: 2+ critical services

## Usage

### View Dashboard
Open `/monitoring/dashboard.html` in your browser or deploy to see real-time metrics.

### Manual Health Check
```bash
curl https://your-domain.com/api/health
```

### Check Metrics
```bash
curl https://your-domain.com/api/metrics
```

### Test Alerts
Alerts are automatically triggered when thresholds are exceeded. Check logs and Slack for notifications.

## Maintenance

- Review alert thresholds monthly
- Check dashboard functionality weekly
- Update monitoring scripts as needed
- Monitor storage usage for metrics data
