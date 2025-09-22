import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DATA_PATH = path.join(__dirname, '..', 'data', 'youth-baseball', 'perfect-game-youth-select.json');

export default class PerfectGameYouthSelectService {
  constructor({ dataPath = DEFAULT_DATA_PATH, cacheTtlMs = 1000 * 60 * 10 } = {}) {
    this.dataPath = dataPath;
    this.cacheTtlMs = cacheTtlMs;
    this.cache = null;
    this.cacheExpiresAt = 0;
  }

  async loadData(force = false) {
    const now = Date.now();
    if (!force && this.cache && now < this.cacheExpiresAt) {
      return this.cache;
    }

    const file = await fs.readFile(this.dataPath, 'utf-8');
    this.cache = JSON.parse(file);
    this.cacheExpiresAt = now + this.cacheTtlMs;
    return this.cache;
  }

  async refresh() {
    this.cache = null;
    return this.loadData(true);
  }

  async getSummary() {
    const data = await this.loadData();
    return {
      summary: data.summary,
      sources: data.sources
    };
  }

  async getRankings({ provider, ageGroup, limit } = {}) {
    const data = await this.loadData();
    const providers = provider ? [provider] : ['perfect_game', 'usssa', 'composite'];
    const result = {};

    providers.forEach((key) => {
      const rankingsForProvider = data.rankings[key];
      if (!rankingsForProvider) return;

      if (ageGroup) {
        const entries = rankingsForProvider[ageGroup];
        if (entries) {
          result[key] = Array.isArray(entries)
            ? entries.slice(0, limit || entries.length)
            : entries;
        }
        return;
      }

      result[key] = limit && Array.isArray(rankingsForProvider)
        ? rankingsForProvider.slice(0, limit)
        : rankingsForProvider;
    });

    return result;
  }

  async getPlayers({ ageGroup, state, position, minComposite, commitment, limit } = {}) {
    const data = await this.loadData();
    let players = data.players.slice();

    if (ageGroup) {
      const normalizedAge = ageGroup.toLowerCase();
      players = players.filter((player) => player.age_group?.toLowerCase() === normalizedAge);
    }

    if (state) {
      const normalizedState = state.toUpperCase();
      players = players.filter((player) => player.state?.toUpperCase() === normalizedState);
    }

    if (position) {
      const normalizedPosition = position.toUpperCase();
      players = players.filter((player) =>
        player.primary_position?.toUpperCase() === normalizedPosition ||
        player.secondary_position?.toUpperCase() === normalizedPosition
      );
    }

    if (typeof minComposite === 'number') {
      players = players.filter((player) => (player.composite_score || 0) >= minComposite);
    }

    if (commitment) {
      const normalizedCommitment = commitment.toLowerCase();
      players = players.filter((player) =>
        player.commitment?.college?.toLowerCase() === normalizedCommitment ||
        player.commitment?.division?.toLowerCase() === normalizedCommitment
      );
    }

    players.sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0));

    return limit ? players.slice(0, limit) : players;
  }

  async getPlayer(playerId) {
    const data = await this.loadData();
    const id = playerId.toLowerCase();
    return data.players.find((player) => player.id.toLowerCase() === id);
  }

  async getCommitments({ college, division, status, limit } = {}) {
    const data = await this.loadData();
    let commitments = data.commitments.slice();

    if (college) {
      const normalizedCollege = college.toLowerCase();
      commitments = commitments.filter((entry) => entry.college?.toLowerCase() === normalizedCollege);
    }

    if (division) {
      const normalizedDivision = division.toLowerCase();
      commitments = commitments.filter((entry) => entry.division?.toLowerCase() === normalizedDivision);
    }

    if (status) {
      const normalizedStatus = status.toLowerCase();
      commitments = commitments.filter((entry) => entry.status?.toLowerCase() === normalizedStatus);
    }

    commitments.sort((a, b) => new Date(b.commit_date || 0) - new Date(a.commit_date || 0));

    return limit ? commitments.slice(0, limit) : commitments;
  }

  async getTournaments({ ageGroup, region, sanctioningBody, startAfter, limit } = {}) {
    const data = await this.loadData();
    let tournaments = data.tournaments.slice();

    if (ageGroup) {
      const normalizedAge = ageGroup.toLowerCase();
      tournaments = tournaments.filter((event) => event.age_groups?.some((group) => group.toLowerCase() === normalizedAge));
    }

    if (region) {
      const normalizedRegion = region.toLowerCase();
      tournaments = tournaments.filter((event) => event.location?.region?.toLowerCase() === normalizedRegion);
    }

    if (sanctioningBody) {
      const normalizedBody = sanctioningBody.toLowerCase();
      tournaments = tournaments.filter((event) => event.sanctioning_body?.toLowerCase() === normalizedBody);
    }

    if (startAfter) {
      const cutoff = new Date(startAfter);
      if (!Number.isNaN(cutoff.getTime())) {
        tournaments = tournaments.filter((event) => new Date(event.start_date) >= cutoff);
      }
    }

    tournaments.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    return limit ? tournaments.slice(0, limit) : tournaments;
  }

  async getInsights() {
    const data = await this.loadData();
    return data.insights;
  }

  async search(term, { limit = 10 } = {}) {
    if (!term) {
      return { players: [], tournaments: [], colleges: [] };
    }

    const data = await this.loadData();
    const normalized = term.toLowerCase();

    const players = data.players
      .filter((player) =>
        player.name.toLowerCase().includes(normalized) ||
        player.travel_team?.toLowerCase().includes(normalized) ||
        player.state?.toLowerCase() === normalized
      )
      .slice(0, limit);

    const tournaments = data.tournaments
      .filter((event) =>
        event.name.toLowerCase().includes(normalized) ||
        event.location?.city?.toLowerCase().includes(normalized) ||
        event.location?.state?.toLowerCase() === normalized
      )
      .slice(0, limit);

    const colleges = data.commitments
      .filter((commit) => commit.college?.toLowerCase().includes(normalized))
      .map((commit) => commit.college)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .slice(0, limit);

    return { players, tournaments, colleges };
  }
}
