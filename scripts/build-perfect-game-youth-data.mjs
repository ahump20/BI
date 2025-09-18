#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data', 'youth-baseball');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const OUTPUT_FILE = path.join(DATA_DIR, 'perfect-game-youth-select.json');

const RAW_FILES = {
  perfectGame: 'perfect-game-rankings-2025.json',
  usssa: 'usssa-power-ratings-2025.json',
  commitments: 'd1baseball-commitments-2025.json',
  metrics: 'player-metrics-2025.json',
  events: 'showcase-tracker-2025.json'
};

function normalizeKey(value) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || null;
}

async function readJson(filename) {
  const filePath = path.join(RAW_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

function computeTeamCompositeScore(perfectGameData, usssaData) {
  const rankScore = perfectGameData?.rank ? (60 - perfectGameData.rank) * 8 : 0;
  const pgRating = perfectGameData?.rating ? perfectGameData.rating * 5 : 0;
  const powerScore = usssaData?.power_rating ? usssaData.power_rating : 0;
  return Math.round(rankScore + pgRating + powerScore);
}

function computePlayerCompositeScore({ metrics, perfectGameRank, usssaPower, commitmentGrade }) {
  let score = 0;
  if (typeof perfectGameRank === 'number') {
    score += (60 - perfectGameRank) * 4;
  }
  if (typeof usssaPower === 'number') {
    score += usssaPower / 2;
  }
  if (metrics?.pitching?.fastball_velocity) {
    score += metrics.pitching.fastball_velocity;
  }
  if (metrics?.hitting?.exit_velocity) {
    score += metrics.hitting.exit_velocity / 2;
  }
  if (metrics?.athletic?.sixty_yard) {
    score += Math.max(0, 70 - metrics.athletic.sixty_yard * 10);
  }
  if (commitmentGrade) {
    score += commitmentGrade * 2;
  }
  return Math.round(score);
}

function buildCompositeRankings(perfectGame, usssa) {
  const composite = new Map();

  for (const [ageGroup, teams] of Object.entries(perfectGame.age_groups)) {
    for (const team of teams) {
      const key = `${ageGroup}:${normalizeKey(team.team)}`;
      composite.set(key, {
        age_group: ageGroup,
        team: team.team,
        state: team.state,
        perfect_game_rank: team.rank,
        perfect_game_rating: team.rating,
        perfect_game_id: team.pg_id,
        sources: ['perfect_game']
      });
    }
  }

  for (const [ageGroup, teams] of Object.entries(usssa.age_groups)) {
    for (const team of teams) {
      const key = `${ageGroup}:${normalizeKey(team.team)}`;
      if (!composite.has(key)) {
        composite.set(key, {
          age_group: ageGroup,
          team: team.team,
          state: team.state,
          sources: ['usssa']
        });
      }
      const entry = composite.get(key);
      entry.usssa_power_rating = team.power_rating;
      entry.usssa_games = team.games;
      entry.usssa_id = team.usssa_id;
      entry.sources = Array.from(new Set([...(entry.sources || []), 'usssa']));
    }
  }

  const grouped = {};
  for (const entry of composite.values()) {
    const ageGroup = entry.age_group;
    if (!grouped[ageGroup]) grouped[ageGroup] = [];
    entry.composite_score = computeTeamCompositeScore(
      entry.perfect_game_rank
        ? { rank: entry.perfect_game_rank, rating: entry.perfect_game_rating }
        : null,
      entry.usssa_power_rating ? { power_rating: entry.usssa_power_rating } : null
    );
    grouped[ageGroup].push(entry);
  }

  for (const teams of Object.values(grouped)) {
    teams.sort((a, b) => b.composite_score - a.composite_score);
    teams.forEach((team, index) => {
      team.composite_rank = index + 1;
    });
  }

  return grouped;
}

function buildPlayerDataset({ metrics, perfectGame, usssa, commitments }) {
  const perfectGameLookup = new Map();
  for (const [ageGroup, teams] of Object.entries(perfectGame.age_groups)) {
    for (const team of teams) {
      const normalizedTeam = normalizeKey(team.team);
      team.notable_players?.forEach((player) => {
        const key = normalizeKey(player);
        const existing = perfectGameLookup.get(key);
        if (!existing || (existing.rank ?? Infinity) > team.rank) {
          perfectGameLookup.set(key, {
            team: team.team,
            team_id: team.pg_id,
            age_group: ageGroup,
            rank: team.rank,
            rating: team.rating,
            state: team.state,
            team_slug: normalizedTeam
          });
        }
      });
    }
  }

  const usssaLookup = new Map();
  for (const [ageGroup, teams] of Object.entries(usssa.age_groups)) {
    for (const team of teams) {
      team.notable_players?.forEach((player) => {
        const key = normalizeKey(player);
        const existing = usssaLookup.get(key);
        if (!existing || (existing.power_rating ?? 0) < team.power_rating) {
          usssaLookup.set(key, {
            team: team.team,
            team_id: team.usssa_id,
            age_group: ageGroup,
            power_rating: team.power_rating,
            games: team.games,
            state: team.state
          });
        }
      });
    }
  }

  const commitmentLookup = new Map();
  commitments.commitments.forEach((commit) => {
    commitmentLookup.set(normalizeKey(commit.player), commit);
  });

  return metrics.players.map((player) => {
    const key = normalizeKey(player.name);
    const perfectGameInfo = perfectGameLookup.get(key) || null;
    const usssaInfo = usssaLookup.get(key) || null;
    const commitmentInfo = commitmentLookup.get(key) || null;

    const compositeScore = computePlayerCompositeScore({
      metrics: player.metrics,
      perfectGameRank: perfectGameInfo?.rank,
      usssaPower: usssaInfo?.power_rating,
      commitmentGrade: commitmentInfo?.scouting_grade
    });

    const consolidated = {
      id: player.player_id || `${key}-${player.grad_year}`,
      name: player.name,
      age_group: player.age_group,
      grad_year: player.grad_year,
      state: player.state,
      bats: player.bats,
      throws: player.throws,
      primary_position: player.primary_position,
      secondary_position: player.secondary_position,
      travel_team: player.travel_team,
      last_event: player.last_event,
      metrics: player.metrics,
      evaluations: player.evaluations,
      composite_score: compositeScore,
      perfect_game: perfectGameInfo,
      usssa: usssaInfo,
      commitment: commitmentInfo,
      sources: buildPlayerSourceList({ perfectGameInfo, usssaInfo, commitmentInfo })
    };

    return consolidated;
  });
}

function buildPlayerSourceList({ perfectGameInfo, usssaInfo, commitmentInfo }) {
  const sources = [];
  if (perfectGameInfo) {
    sources.push({ provider: 'Perfect Game USA', detail: perfectGameInfo.team_id });
  }
  if (usssaInfo) {
    sources.push({ provider: 'USSSA', detail: usssaInfo.team_id });
  }
  if (commitmentInfo) {
    sources.push({ provider: 'D1Baseball', detail: commitmentInfo.college });
  }
  return sources;
}

function buildSummary(players, compositeRankings, commitments) {
  const totalPlayers = players.length;
  const states = new Map();
  players.forEach((player) => {
    if (!player.state) return;
    states.set(player.state, (states.get(player.state) || 0) + 1);
  });

  const topStates = Array.from(states.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([state, count]) => ({
      state,
      count,
      share: Number((count / totalPlayers).toFixed(2))
    }));

  const programs = new Map();
  for (const teams of Object.values(compositeRankings)) {
    teams.slice(0, 10).forEach((team) => {
      const key = `${team.team}|${team.state}`;
      const existing = programs.get(key) || { team: team.team, state: team.state, appearances: 0 };
      existing.appearances += 1;
      programs.set(key, existing);
    });
  }

  const topPrograms = Array.from(programs.values())
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 8);

  const collegeTargets = commitments.commitments.reduce((acc, commit) => {
    acc[commit.college] = (acc[commit.college] || 0) + 1;
    return acc;
  }, {});

  const topColleges = Object.entries(collegeTargets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([college, count]) => ({ college, count }));

  return {
    total_players: totalPlayers,
    age_group_coverage: Array.from(new Set(players.map((p) => p.age_group))).sort(),
    states_tracked: states.size,
    top_states: topStates,
    top_programs: topPrograms,
    top_colleges: topColleges
  };
}

function buildInsights(players, compositeRankings, events) {
  const averageFastball = averageMetric(players, (player) => player.metrics?.pitching?.fastball_velocity);
  const averageExitVelocity = averageMetric(players, (player) => player.metrics?.hitting?.exit_velocity);

  const upcomingEvents = events.events
    .map((event) => ({
      id: event.id,
      name: event.name,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      broadcast: event.broadcast,
      scouting_coverage: event.scouting_coverage,
      ranking_impact: event.ranking_impact
    }))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  return {
    player_averages: {
      fastball_velocity: averageFastball,
      exit_velocity: averageExitVelocity
    },
    composite_trends: Object.entries(compositeRankings).map(([ageGroup, teams]) => ({
      age_group: ageGroup,
      median_composite_score: median(teams.map((team) => team.composite_score)),
      programs: teams.slice(0, 5).map((team) => ({
        team: team.team,
        composite_score: team.composite_score,
        state: team.state
      }))
    })),
    upcoming_events: upcomingEvents
  };
}

function averageMetric(players, selector) {
  const values = players
    .map(selector)
    .filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (!values.length) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Number((sum / values.length).toFixed(2));
}

function median(values) {
  const numeric = values.filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (!numeric.length) return null;
  const sorted = numeric.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return Number(sorted[mid].toFixed(2));
}

async function buildDataset() {
  const [perfectGame, usssa, commitments, metrics, events] = await Promise.all([
    readJson(RAW_FILES.perfectGame),
    readJson(RAW_FILES.usssa),
    readJson(RAW_FILES.commitments),
    readJson(RAW_FILES.metrics),
    readJson(RAW_FILES.events)
  ]);

  const compositeRankings = buildCompositeRankings(perfectGame, usssa);
  const players = buildPlayerDataset({ metrics, perfectGame, usssa, commitments });
  const summary = buildSummary(players, compositeRankings, commitments);
  const insights = buildInsights(players, compositeRankings, events);

  const dataset = {
    version: '2025.02.18',
    generated_at: new Date().toISOString(),
    generated_by: 'scripts/build-perfect-game-youth-data.mjs',
    sources: [
      {
        provider: perfectGame.provider,
        key: perfectGame.provider_key,
        last_updated: perfectGame.last_updated,
        url: perfectGame.source_url,
        notes: perfectGame.notes
      },
      {
        provider: usssa.provider,
        key: usssa.provider_key,
        last_updated: usssa.last_updated,
        url: usssa.source_url,
        notes: usssa.notes
      },
      {
        provider: commitments.provider,
        key: commitments.provider_key,
        last_updated: commitments.last_updated,
        url: commitments.source_url,
        notes: commitments.notes
      },
      {
        provider: events.provider,
        key: events.provider_key,
        last_updated: events.last_updated,
        url: events.source_url
      }
    ],
    summary,
    rankings: {
      perfect_game: perfectGame.age_groups,
      usssa: usssa.age_groups,
      composite: compositeRankings
    },
    players,
    commitments: commitments.commitments,
    tournaments: events.events,
    insights
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(dataset, null, 2));

  console.log(`✅ Perfect Game youth select dataset generated: ${OUTPUT_FILE}`);
}

buildDataset().catch((error) => {
  console.error('❌ Failed to build Perfect Game youth dataset:', error);
  process.exitCode = 1;
});
