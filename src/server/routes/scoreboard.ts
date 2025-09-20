import { Router } from 'express';

import {
  InvalidSportError,
  ScoreboardService,
  ScoreboardServiceOptions,
  SportKey,
} from '../services/scoreboardService.js';

export const createScoreboardRouter = (
  options: ScoreboardService | ScoreboardServiceOptions = {},
): Router => {
  const router = Router();
  const service =
    options instanceof ScoreboardService ? options : new ScoreboardService(options);

  router.get('/', (_req, res) => {
    res.json({
      sports: ScoreboardService.supportedSports(),
      cache: service.getCacheSummary(),
    });
  });

  router.get('/:sport', async (req, res, next) => {
    try {
      const sportParam = req.params.sport?.toLowerCase();
      if (!sportParam) {
        res.status(400).json({ error: 'Sport parameter is required' });
        return;
      }

      const sport = ScoreboardService.supportedSports().find(
        (candidate): candidate is SportKey => candidate === sportParam,
      );

      if (!sport) {
        throw new InvalidSportError(sportParam);
      }

      const scoreboard = await service.getScoreboard(sport);
      res.json(scoreboard);
    } catch (error) {
      if (error instanceof InvalidSportError) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  return router;
};
