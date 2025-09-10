/**
 * Baseline Tracker Durable Object
 * Manages player baseline performance metrics and trend analysis
 */

export class BaselineTracker {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/baseline/update' && request.method === 'POST') {
      return this.updateBaseline(request);
    }
    
    if (url.pathname === '/baseline/get' && request.method === 'GET') {
      return this.getBaseline(request);
    }

    return new Response('Not found', { status: 404 });
  }

  private async updateBaseline(request: Request): Promise<Response> {
    try {
      const data = await request.json() as any;
      const { player_id, metrics, timestamp } = data;

      // Store baseline metrics
      await this.state.storage.put(`baseline:${player_id}:latest`, {
        metrics,
        timestamp,
        updated_at: Date.now()
      });

      return Response.json({ success: true });
    } catch (error) {
      return Response.json({ error: 'Update failed' }, { status: 500 });
    }
  }

  private async getBaseline(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const playerId = url.searchParams.get('player_id');
      
      if (!playerId) {
        return Response.json({ error: 'player_id required' }, { status: 400 });
      }

      const baseline = await this.state.storage.get(`baseline:${playerId}:latest`);
      
      return Response.json({ 
        baseline: baseline || null,
        found: !!baseline 
      });
    } catch (error) {
      return Response.json({ error: 'Fetch failed' }, { status: 500 });
    }
  }
}