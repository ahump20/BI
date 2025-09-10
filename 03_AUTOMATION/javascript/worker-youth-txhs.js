/**
 * Cloudflare Worker for Youth/TXHS Ingestion Pipeline
 * Handles scheduled runs and on-demand API requests
 */

import YouthTXHSIngestionAgent from './youth-txhs-ingestion-agent.js';
import HAVFEvaluationEngine from './havf-evaluation-engine.js';

export default {
  async scheduled(event, env, ctx) {
    // Scheduled cron execution
    const agent = new YouthTXHSIngestionAgent({
      outputDir: 'r2://blaze-youth-data/txhs/',
      cacheDir: 'kv://YOUTH_TXHS_CACHE/'
    });
    
    try {
      // Run ingestion
      const results = await agent.ingest({
        sport: this.getCurrentSport(),
        depth: event.cron === "0 2 * * *" ? 'full' : 'priority'
      });
      
      // Run HAV-F evaluation
      const engine = new HAVFEvaluationEngine({
        dataDir: 'r2://blaze-youth-data/txhs/',
        outputDir: 'r2://blaze-youth-data/evaluations/'
      });
      
      const evaluations = await engine.evaluate();
      
      // Store results
      await this.storeResults(env, results, evaluations);
      
      // Send notification
      await this.notify(env, {
        status: 'success',
        players: results.players.length,
        evaluations: evaluations.evaluations.length
      });
      
    } catch (error) {
      console.error('Pipeline error:', error);
      await this.notify(env, { status: 'error', error: error.message });
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API endpoints
    switch (url.pathname) {
      case '/api/ingest':
        return this.handleIngest(request, env);
      
      case '/api/evaluate':
        return this.handleEvaluate(request, env);
      
      case '/api/prospects':
        return this.getTopProspects(request, env);
      
      case '/api/teams':
        return this.getTeams(request, env);
      
      case '/api/health':
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), { 
          headers: { 'Content-Type': 'application/json' }
        });
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  },

  async handleIngest(request, env) {
    const { sport, teams } = await request.json();
    
    const agent = new YouthTXHSIngestionAgent();
    const results = await agent.ingest({ sport, teams });
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async handleEvaluate(request, env) {
    const engine = new HAVFEvaluationEngine();
    const results = await engine.evaluate();
    
    return new Response(JSON.stringify(results.insights), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async getTopProspects(request, env) {
    const data = await env.R2.get('evaluations/havf-insights.json');
    const insights = JSON.parse(await data.text());
    
    return new Response(JSON.stringify(insights.top_prospects), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  },

  async getTeams(request, env) {
    const data = await env.R2.get('txhs/teams-txhs.json');
    const teams = JSON.parse(await data.text());
    
    return new Response(JSON.stringify(teams), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  },

  getCurrentSport() {
    const month = new Date().getMonth() + 1;
    // Football: Aug-Dec, Baseball: Feb-May
    return (month >= 8 || month <= 1) ? 'football' : 'baseball';
  },

  async storeResults(env, ingestion, evaluations) {
    // Store in R2
    await env.R2.put('txhs/latest-ingestion.json', JSON.stringify(ingestion));
    await env.R2.put('evaluations/latest-evaluations.json', JSON.stringify(evaluations));
    
    // Update KV cache
    await env.KV.put('last_update', new Date().toISOString());
    await env.KV.put('prospect_count', evaluations.evaluations.length.toString());
  },

  async notify(env, data) {
    if (!env.SLACK_WEBHOOK) return;
    
    const message = data.status === 'success' 
      ? `✅ Youth/TXHS Pipeline Complete\n• Players: ${data.players}\n• Evaluations: ${data.evaluations}`
      : `❌ Pipeline Error: ${data.error}`;
    
    await fetch(env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
  }
};
