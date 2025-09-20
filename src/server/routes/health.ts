import type { Express, Request, Response } from 'express';

import { ScoreboardService } from '../services/scoreboardService.js';

const respond = (res: Response, body: Record<string, unknown>) => {
  res.json({
    service: 'Blaze Intelligence API',
    timestamp: new Date().toISOString(),
    ...body,
  });
};

export const registerHealthRoutes = (app: Express, scoreboardService: ScoreboardService): void => {
  app.get('/healthz', (_req: Request, res: Response) => {
    respond(res, { status: 'ok' });
  });

  app.get('/readyz', (_req: Request, res: Response) => {
    const cache = scoreboardService.getCacheSummary();
    respond(res, {
      status: 'ready',
      sports: ScoreboardService.supportedSports(),
      cache,
    });
  });
};
