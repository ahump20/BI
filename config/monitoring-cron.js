/**
 * Monitoring Cron Job
 * Runs health checks and alerts on schedule
 */

import { BlazeAlerts } from '../monitoring/alerts.js';

export default {
  async scheduled(event, env, ctx) {
    try {
      console.log('Running scheduled health check...');
      
      const alerts = new BlazeAlerts(env);
      const results = await alerts.checkHealth();
      
      console.log(`Health check completed. Found ${results.length} alerts.`);
      
      // Update last check timestamp
      if (env.ANALYTICS_CACHE) {
        await env.ANALYTICS_CACHE.put(
          'last_health_check',
          new Date().toISOString()
        );
      }
      
    } catch (error) {
      console.error('Scheduled health check failed:', error);
    }
  }
};
