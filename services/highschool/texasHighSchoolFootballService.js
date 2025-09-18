import MaxPrepsAdapter from './maxprepsAdapter.js';
import TwentyFourSevenSportsAdapter from './twentyFourSevenSportsAdapter.js';
import RivalsAdapter from './rivalsAdapter.js';
import { uniqueBy } from './utils.js';

export default class TexasHighSchoolFootballService {
  constructor(options = {}) {
    const {
      cacheTtl = 15 * 60 * 1000,
      adapters = {},
      sources = {}
    } = options;

    this.adapters = {
      maxpreps: adapters.maxpreps || new MaxPrepsAdapter(sources.maxpreps || {}),
      twentyFourSeven: adapters.twentyFourSeven || new TwentyFourSevenSportsAdapter(sources.twentyFourSeven || {}),
      rivals: adapters.rivals || new RivalsAdapter(sources.rivals || {})
    };

    this.cache = new Map();
    this.cacheTtl = cacheTtl;
  }

  createCacheKey(params) {
    const entries = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, value])
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (cached.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.cacheTtl
    });
  }

  async getProgramData({
    team,
    season,
    maxprepsTeamPath,
    maxprepsTeamId,
    twentyFourSevenTeamPath,
    rivalsTeamPath,
    includeSchedule = true,
    includePlayerStats = true,
    includeRecruiting = true,
    includeRaw = false,
    forceRefresh = false
  }) {
    const cacheKey = this.createCacheKey({
      team,
      season,
      maxprepsTeamPath,
      maxprepsTeamId,
      twentyFourSevenTeamPath,
      rivalsTeamPath,
      includeSchedule,
      includePlayerStats,
      includeRecruiting,
      includeRaw
    });

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { ...cached, metadata: { ...cached.metadata, cache: { hit: true, generatedAt: cached.metadata.generatedAt } } };
      }
    }

    const fetchResults = {};
    const errors = [];

    if (this.adapters.maxpreps && (maxprepsTeamPath || maxprepsTeamId)) {
      try {
        fetchResults.maxpreps = await this.adapters.maxpreps.getTeamData({
          teamPath: maxprepsTeamPath,
          teamId: maxprepsTeamId,
          season,
          includeSchedule,
          includePlayerStats
        });
      } catch (error) {
        errors.push({ source: 'maxpreps', message: error.message });
      }
    }

    if (includeRecruiting && this.adapters.twentyFourSeven && twentyFourSevenTeamPath) {
      try {
        fetchResults.twentyFourSeven = await this.adapters.twentyFourSeven.getRecruitingData({
          teamPath: twentyFourSevenTeamPath,
          season,
          includeTargets: true
        });
      } catch (error) {
        errors.push({ source: '247sports', message: error.message });
      }
    }

    if (includeRecruiting && this.adapters.rivals && rivalsTeamPath) {
      try {
        fetchResults.rivals = await this.adapters.rivals.getRecruitingData({
          teamPath: rivalsTeamPath,
          season,
          includeTargets: true
        });
      } catch (error) {
        errors.push({ source: 'rivals', message: error.message });
      }
    }

    const normalized = this.combineResults({
      team,
      season,
      includeRaw,
      results: fetchResults,
      errors
    });

    this.setCache(cacheKey, normalized);

    return normalized;
  }

  combineResults({ team, season, includeRaw, results, errors }) {
    const maxpreps = results.maxpreps || {};
    const s247 = results.twentyFourSeven || {};
    const rivals = results.rivals || {};

    const programName = maxpreps.team?.name || s247.team?.name || rivals.team?.name || team || null;

    const metadata = {
      team: programName,
      requestedTeam: team || null,
      season: season || null,
      generatedAt: new Date().toISOString(),
      sources: [
        maxpreps.source ? { name: 'maxpreps', fetchedAt: maxpreps.fetchedAt } : null,
        s247.source ? { name: '247sports', fetchedAt: s247.fetchedAt } : null,
        rivals.source ? { name: 'rivals', fetchedAt: rivals.fetchedAt } : null
      ].filter(Boolean)
    };

    const schedule = maxpreps.schedule || [];
    const players = maxpreps.players || [];
    const record = maxpreps.record || {};
    const stats = maxpreps.stats || {};

    const recruiting = this.mergeRecruiting({
      s247: s247.recruiting,
      rivals: rivals.recruiting
    });

    const insights = this.generateInsights({ record, stats, schedule, recruiting });

    const payload = {
      metadata,
      teamProfile: {
        name: programName,
        classification: maxpreps.team?.classification || s247.team?.classification || rivals.team?.classification || null,
        district: maxpreps.team?.district || null,
        location: maxpreps.team?.location || s247.team?.city || rivals.team?.city || null,
        coach: maxpreps.team?.coach || null,
        record,
        rankings: this.mergeRankings(maxpreps.record, recruiting.rankings)
      },
      performance: {
        stats,
        notes: maxpreps.notes || []
      },
      schedule,
      players,
      recruiting,
      insights,
      errors
    };

    if (includeRaw) {
      payload.sources = {
        maxpreps: maxpreps.raw || null,
        twentyFourSeven: s247.raw || null,
        rivals: rivals.raw || null
      };
    }

    return payload;
  }

  mergeRecruiting({ s247, rivals }) {
    const commits = uniqueBy(
      [
        ...(s247?.commits || []),
        ...(rivals?.commits || [])
      ],
      (prospect) => `${prospect.name}-${prospect.classYear || ''}`
    );

    const targets = uniqueBy(
      [
        ...(s247?.targets || []),
        ...(rivals?.targets || [])
      ],
      (prospect) => `${prospect.name}-${prospect.classYear || ''}`
    );

    const rankings = {
      bySource: {
        s247: s247?.rankings || null,
        rivals: rivals?.rankings || null
      },
      consensus: this.calculateConsensusRankings(s247?.rankings, rivals?.rankings)
    };

    const summary = {
      totalCommits: commits.length,
      averageRating: this.calculateAverageRating(commits),
      consensusNationalRank: rankings.consensus?.nationalRank || null,
      consensusStateRank: rankings.consensus?.stateRank || null
    };

    return {
      commits,
      targets,
      rankings,
      summary
    };
  }

  calculateAverageRating(commits) {
    if (!commits?.length) return null;
    const ratings = commits
      .map((prospect) => prospect.rating)
      .filter((rating) => typeof rating === 'number');
    if (!ratings.length) return null;
    const total = ratings.reduce((acc, value) => acc + value, 0);
    return Number((total / ratings.length).toFixed(3));
  }

  calculateConsensusRankings(s247Rankings, rivalsRankings) {
    const ranks = {
      national: [s247Rankings?.nationalRank, rivalsRankings?.nationalRank],
      state: [s247Rankings?.stateRank, rivalsRankings?.stateRank],
      class: [s247Rankings?.classRank, rivalsRankings?.classRank]
    };

    const parse = (values) => {
      const filtered = values.filter((value) => typeof value === 'number');
      if (!filtered.length) return null;
      return Math.min(...filtered);
    };

    const compositeScore = [
      s247Rankings?.compositeScore,
      rivalsRankings?.compositeScore
    ].filter((value) => typeof value === 'number');

    return {
      nationalRank: parse(ranks.national),
      stateRank: parse(ranks.state),
      classRank: parse(ranks.class),
      compositeScore: compositeScore.length ? Number((compositeScore.reduce((acc, value) => acc + value, 0) / compositeScore.length).toFixed(3)) : null
    };
  }

  mergeRankings(record, recruitingRankings) {
    return {
      state: record?.stateRank || recruitingRankings?.consensus?.stateRank || null,
      national: record?.nationalRank || recruitingRankings?.consensus?.nationalRank || null,
      recruiting: recruitingRankings?.consensus || null
    };
  }

  generateInsights({ record, stats, schedule, recruiting }) {
    const quickHits = [];
    const metrics = {};

    if (record?.overall?.wins !== undefined && record?.overall?.losses !== undefined) {
      quickHits.push(`Overall record: ${record.overall.wins}-${record.overall.losses}${record.overall.ties ? `-${record.overall.ties}` : ''}`);
    }

    if (typeof stats.points_per_game === 'number') {
      quickHits.push(`Offense averaging ${stats.points_per_game} points per game.`);
      metrics.pointsPerGame = stats.points_per_game;
    }

    if (typeof stats.points_allowed_per_game === 'number') {
      quickHits.push(`Defense allowing ${stats.points_allowed_per_game} points per game.`);
      metrics.pointsAllowedPerGame = stats.points_allowed_per_game;
    }

    if (schedule?.length) {
      const completed = schedule.filter((game) => game?.score && typeof game.score.team === 'number' && typeof game.score.opponent === 'number');
      if (completed.length >= 2) {
        const lastTwo = completed.slice(-2);
        const diff = lastTwo.reduce((acc, game) => acc + (game.score.team - game.score.opponent), 0);
        if (diff > 0) {
          quickHits.push('Team enters the week on a positive scoring margin over the last two games.');
        }
        metrics.recentPointDifferential = diff;
      }
    }

    if (recruiting?.summary?.totalCommits) {
      quickHits.push(`Recruiting class holds ${recruiting.summary.totalCommits} verbal commitments.`);
      metrics.totalCommits = recruiting.summary.totalCommits;
    }

    if (typeof recruiting?.summary?.consensusNationalRank === 'number') {
      quickHits.push(`Consensus national recruiting rank: ${recruiting.summary.consensusNationalRank}.`);
    }

    return {
      quickHits,
      metrics
    };
  }
}
