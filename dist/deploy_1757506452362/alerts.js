/**
 * Blaze Intelligence Alerting System
 * Monitors system health and sends alerts
 */

class BlazeAlerts {
  constructor(env) {
    this.env = env;
    this.thresholds = {
      response_time: 5000, // 5 seconds
      error_rate: 5, // 5%
      data_freshness: 60, // 60 minutes
      service_down_count: 2 // Number of critical services
    };
  }

  async checkHealth() {
    try {
      const response = await fetch('/api/health');
      const health = await response.json();
      
      const alerts = [];
      
      // Check response time
      if (health.response_time > this.thresholds.response_time) {
        alerts.push({
          level: 'warning',
          message: `High response time: ${health.response_time}ms`,
          metric: 'response_time',
          value: health.response_time
        });
      }
      
      // Check service status
      if (health.services) {
        const downServices = Object.entries(health.services)
          .filter(([name, status]) => status === 'error')
          .map(([name]) => name);
          
        if (downServices.length >= this.thresholds.service_down_count) {
          alerts.push({
            level: 'critical',
            message: `Critical services down: ${downServices.join(', ')}`,
            metric: 'services',
            value: downServices.length
          });
        }
      }
      
      // Send alerts if any
      if (alerts.length > 0) {
        await this.sendAlerts(alerts);
      }
      
      return alerts;
    } catch (error) {
      await this.sendAlert({
        level: 'critical',
        message: `Health check failed: ${error.message}`,
        metric: 'health_check',
        error: error.message
      });
      throw error;
    }
  }

  async sendAlerts(alerts) {
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  async sendAlert(alert) {
    // Send to Slack if webhook URL is configured
    if (this.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(alert);
    }
    
    // Log alert
    console.error(`[ALERT] ${alert.level.toUpperCase()}: ${alert.message}`);
    
    // Store alert in KV for dashboard
    if (this.env.ANALYTICS_CACHE) {
      const alertKey = `alert_${Date.now()}`;
      await this.env.ANALYTICS_CACHE.put(alertKey, JSON.stringify({
        ...alert,
        timestamp: new Date().toISOString()
      }), { expirationTtl: 86400 }); // 24 hours
    }
  }

  async sendSlackAlert(alert) {
    try {
      const color = alert.level === 'critical' ? '#FF0000' : 
                   alert.level === 'warning' ? '#FFA500' : '#00FF00';
      
      const payload = {
        channel: '#blaze-intelligence',
        username: 'Blaze Monitor',
        icon_emoji: ':fire:',
        attachments: [{
          color,
          title: `🚨 Blaze Intelligence Alert - ${alert.level.toUpperCase()}`,
          text: alert.message,
          fields: [
            {
              title: 'Metric',
              value: alert.metric,
              short: true
            },
            {
              title: 'Value',
              value: alert.value?.toString() || 'N/A',
              short: true
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true
            }
          ],
          footer: 'Blaze Intelligence Monitoring',
          ts: Math.floor(Date.now() / 1000)
        }]
      };
      
      await fetch(this.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

export { BlazeAlerts };
