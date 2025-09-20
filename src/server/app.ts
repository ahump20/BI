import compression from 'compression';
import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';

import { ENV } from './config/env.js';
import { registerHealthRoutes } from './routes/health.js';
import { createScoreboardRouter } from './routes/scoreboard.js';
import { ScoreboardService } from './services/scoreboardService.js';

export const createApp = (scoreboardService = new ScoreboardService()): Express => {
  const app = express();
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  registerHealthRoutes(app, scoreboardService);
  app.use('/api/scoreboard', createScoreboardRouter(scoreboardService));

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Blaze Intelligence API',
      version: '0.2.0',
      environment: ENV.nodeEnv,
      sports: ScoreboardService.supportedSports(),
    });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled API error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  });

  return app;
};
