import { Router } from 'express';
import PerfectGameYouthSelectService from '../services/perfectGameYouthSelectService.mjs';

const router = Router();
const youthService = new PerfectGameYouthSelectService();

function toNumber(value) {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const payload = await youthService.getSummary();
    res.json(payload);
  })
);

router.get(
  '/rankings',
  asyncHandler(async (req, res) => {
    const { provider, ageGroup, limit } = req.query;
    const rankings = await youthService.getRankings({
      provider,
      ageGroup,
      limit: toNumber(limit)
    });
    res.json(rankings);
  })
);

router.get(
  '/players',
  asyncHandler(async (req, res) => {
    const { ageGroup, state, position, minComposite, commitment, limit } = req.query;
    const players = await youthService.getPlayers({
      ageGroup,
      state,
      position,
      commitment,
      limit: toNumber(limit),
      minComposite: minComposite !== undefined ? Number.parseInt(minComposite, 10) : undefined
    });
    res.json(players);
  })
);

router.get(
  '/players/:playerId',
  asyncHandler(async (req, res) => {
    const player = await youthService.getPlayer(req.params.playerId);
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json(player);
  })
);

router.get(
  '/commitments',
  asyncHandler(async (req, res) => {
    const { college, division, status, limit } = req.query;
    const commitments = await youthService.getCommitments({
      college,
      division,
      status,
      limit: toNumber(limit)
    });
    res.json(commitments);
  })
);

router.get(
  '/tournaments',
  asyncHandler(async (req, res) => {
    const { ageGroup, region, sanctioningBody, startAfter, limit } = req.query;
    const tournaments = await youthService.getTournaments({
      ageGroup,
      region,
      sanctioningBody,
      startAfter,
      limit: toNumber(limit)
    });
    res.json(tournaments);
  })
);

router.get(
  '/insights',
  asyncHandler(async (req, res) => {
    const insights = await youthService.getInsights();
    res.json(insights);
  })
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { q, limit } = req.query;
    const results = await youthService.search(q, { limit: toNumber(limit) });
    res.json(results);
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const payload = await youthService.refresh();
    res.json({ refreshed_at: new Date().toISOString(), summary: payload.summary });
  })
);

export default router;
