import BaseAdapter from './baseAdapter.js';

function parseRecordString(adapter, value) {
  if (!value) return null;
  const normalized = String(value).replace(/[^0-9\-]/g, '').trim();
  if (!normalized) return null;
  const [wins, losses, ties] = normalized.split('-').map((part) => {
    const parsed = parseInt(part, 10);
    return Number.isFinite(parsed) ? parsed : null;
  });
  const totalGames = [wins, losses, ties].filter((n) => typeof n === 'number').reduce((acc, curr) => acc + curr, 0);
  const winPct = typeof wins === 'number' && totalGames
    ? Number((wins / totalGames).toFixed(3))
    : null;
  return {
    value: normalized,
    wins: typeof wins === 'number' ? wins : null,
    losses: typeof losses === 'number' ? losses : null,
    ties: typeof ties === 'number' ? ties : null,
    games: totalGames || null,
    winPercentage: winPct
  };
}

export default class MaxPrepsAdapter extends BaseAdapter {
  constructor(options = {}) {
    super({
      name: 'maxpreps',
      baseUrl: 'https://www.maxpreps.com',
      minRequestInterval: 750,
      ...options
    });
  }

  normalizeTeamPath(teamPath) {
    if (!teamPath) return null;
    return teamPath
      .replace(/^https?:\/\/[^/]+\//i, '')
      .replace(/^\//, '')
      .replace(/\/$/, '');
  }

  buildSeasonPath(teamPath, season) {
    const normalized = this.normalizeTeamPath(teamPath);
    if (!normalized) return null;
    if (!season) return normalized;
    return `${normalized}/${season}`.replace(/\/+/g, '/');
  }

  async getTeamData({
    teamPath,
    teamId,
    season,
    includeSchedule = true,
    includePlayerStats = true
  }) {
    const relativePath = teamId ? `m/team/${teamId}` : this.buildSeasonPath(teamPath, season);
    if (!relativePath) {
      throw new Error('[maxpreps] teamPath or teamId is required to fetch team data');
    }

    const requests = [
      { key: 'summary', url: `${relativePath}/stats` }
    ];

    if (includeSchedule) {
      requests.push({ key: 'schedule', url: `${relativePath}/schedule` });
    }

    if (includePlayerStats) {
      requests.push({ key: 'roster', url: `${relativePath}/roster` });
    }

    const htmlResponses = {};
    const fetchErrors = [];

    await Promise.all(
      requests.map(async ({ key, url }) => {
        try {
          htmlResponses[key] = await this.fetchHtml(url);
        } catch (error) {
          fetchErrors.push({ key, url, message: error.message });
        }
      })
    );

    const summaryHtml = htmlResponses.summary;
    if (!summaryHtml) {
      return {
        source: 'maxpreps',
        fetchedAt: new Date().toISOString(),
        errors: fetchErrors,
        team: null,
        record: null,
        stats: null,
        schedule: [],
        players: []
      };
    }

    const summary = this.parseSummary(summaryHtml);
    const schedule = includeSchedule
      ? this.parseSchedule(summary.jsonLd, htmlResponses.schedule, summary.team?.name)
      : [];
    const players = includePlayerStats
      ? this.parseRoster(htmlResponses.roster, summary.team?.name)
      : [];

    const stats = this.deriveTeamStats(summary.stats, schedule);

    return {
      source: 'maxpreps',
      fetchedAt: new Date().toISOString(),
      path: relativePath,
      team: summary.team,
      record: summary.record,
      stats,
      schedule,
      players,
      notes: summary.notes,
      raw: {
        structuredData: summary.jsonLd,
        recordText: summary.recordText
      },
      errors: fetchErrors
    };
  }

  parseSummary(html) {
    const jsonLd = this.extractJsonLd(html);
    const teamDoc = jsonLd.find((doc) => {
      const types = Array.isArray(doc['@type']) ? doc['@type'] : [doc['@type']];
      return types.includes('SportsTeam');
    });

    const teamName = this.normalizeText(teamDoc?.name) || this.extractTeamName(html);
    const location = teamDoc?.address?.addressLocality || teamDoc?.location?.name || null;
    const classification = this.extractClassification(html);
    const district = this.extractDistrict(html);

    const record = this.extractRecord(html);
    const notes = this.extractNotes(html);
    const stats = this.extractStatsFromJson(jsonLd, html);

    return {
      jsonLd,
      team: {
        name: teamName,
        mascot: this.normalizeText(teamDoc?.alternateName),
        slug: this.normalizeTeamPath(teamDoc?.url || teamDoc?.sameAs),
        classification,
        district,
        location: this.normalizeText(location),
        coach: this.extractCoach(html),
        website: teamDoc?.url || null
      },
      record,
      recordText: this.extractRecordText(html),
      stats,
      notes
    };
  }

  extractTeamName(html) {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (!match) return null;
    return this.normalizeText(match[1]);
  }

  extractClassification(html) {
    const match = html.match(/Classification[^A-Za-z0-9]*([A-Za-z0-9\s.-]+)/i);
    return this.normalizeText(match?.[1]);
  }

  extractDistrict(html) {
    const match = html.match(/District[^A-Za-z0-9]*([A-Za-z0-9\s.-]+)/i);
    return this.normalizeText(match?.[1]);
  }

  extractCoach(html) {
    const match = html.match(/Head Coach[^A-Za-z0-9]*([A-Za-z\s'.-]+)/i);
    return this.normalizeText(match?.[1]);
  }

  extractRecord(html) {
    const overallMatch = html.match(/Overall\s*(?:Record)?[^0-9]*([0-9]+-?[0-9]*-?[0-9]*)/i);
    const districtMatch = html.match(/District\s*(?:Record)?[^0-9]*([0-9]+-?[0-9]*-?[0-9]*)/i);
    const homeMatch = html.match(/Home\s*(?:Record)?[^0-9]*([0-9]+-?[0-9]*-?[0-9]*)/i);
    const awayMatch = html.match(/Away\s*(?:Record)?[^0-9]*([0-9]+-?[0-9]*-?[0-9]*)/i);
    const pfMatch = html.match(/Points\s*(?:For|Scored)[^0-9]*([0-9]+)/i);
    const paMatch = html.match(/Points\s*(?:Against|Allowed)[^0-9]*([0-9]+)/i);
    const stateRankMatch = html.match(/State\s*Rank[^0-9]*([0-9]+)/i);
    const nationalRankMatch = html.match(/National\s*Rank[^0-9]*([0-9]+)/i);
    const streakMatch = html.match(/Streak[^A-Za-z0-9]*([WL]-?\d+)/i);

    return {
      overall: parseRecordString(this, overallMatch?.[1]),
      district: parseRecordString(this, districtMatch?.[1]),
      home: parseRecordString(this, homeMatch?.[1]),
      away: parseRecordString(this, awayMatch?.[1]),
      stateRank: this.parseNumber(stateRankMatch?.[1]),
      nationalRank: this.parseNumber(nationalRankMatch?.[1]),
      pointsFor: this.parseNumber(pfMatch?.[1]),
      pointsAgainst: this.parseNumber(paMatch?.[1]),
      pointDifferential:
        this.parseNumber(pfMatch?.[1]) !== null && this.parseNumber(paMatch?.[1]) !== null
          ? this.parseNumber(pfMatch?.[1]) - this.parseNumber(paMatch?.[1])
          : null,
      streak: this.normalizeText(streakMatch?.[1])
    };
  }

  extractRecordText(html) {
    const match = html.match(/Overall\s*(?:Record)?[^<]*<[^>]*>[^<]*([0-9]+-?[0-9]*-?[0-9]*)/i);
    return this.normalizeText(match?.[1]);
  }

  extractStatsFromJson(jsonLd, html) {
    const statsDoc = jsonLd.find((doc) => {
      const types = Array.isArray(doc['@type']) ? doc['@type'] : [doc['@type']];
      return types.includes('Statistics');
    });

    const metrics = {};
    if (statsDoc?.propertyID && statsDoc?.value) {
      metrics[statsDoc.propertyID] = statsDoc.value;
    }

    if (Array.isArray(statsDoc?.statistics)) {
      for (const stat of statsDoc.statistics) {
        if (!stat) continue;
        const key = stat.propertyID || stat.name;
        if (!key) continue;
        metrics[this.normalizeText(key).replace(/\s+/g, '_').toLowerCase()] = stat.value ?? stat.statValue ?? null;
      }
    }

    // Attempt to capture additional metrics from HTML summary tables
    const tableMatches = [...html.matchAll(/<th[^>]*>([^<]+)<\/th>\s*<td[^>]*>([^<]+)<\/td>/gi)];
    for (const [, label, value] of tableMatches) {
      const key = this.normalizeText(label).replace(/\s+/g, '_').toLowerCase();
      if (key && !(key in metrics)) {
        metrics[key] = this.parseNumber(value) ?? this.normalizeText(value);
      }
    }

    return metrics;
  }

  extractNotes(html) {
    const noteMatches = [...html.matchAll(/<li[^>]*class="[^"']*(?:note|insight)[^"']*"[^>]*>([\s\S]*?)<\/li>/gi)];
    return noteMatches
      .map(([, note]) => this.normalizeText(note.replace(/<[^>]+>/g, ' ')))
      .filter(Boolean);
  }

  parseSchedule(structuredData = [], scheduleHtml, teamName) {
    const schedule = [];

    const docs = Array.isArray(structuredData) ? structuredData : [];
    for (const doc of docs) {
      if (!doc) continue;
      const types = Array.isArray(doc['@type']) ? doc['@type'] : [doc['@type']];
      if (!types.includes('SportsEvent')) continue;

      const participants = this.resolveParticipants(doc, teamName);
      if (!participants) continue;

      schedule.push(participants);
    }

    if (schedule.length === 0 && scheduleHtml) {
      schedule.push(...this.parseScheduleFromHtml(scheduleHtml, teamName));
    }

    return schedule;
  }

  resolveParticipants(eventDoc, teamName) {
    const participants = [];
    const allParticipants = [];

    if (eventDoc.competitor) {
      const list = Array.isArray(eventDoc.competitor) ? eventDoc.competitor : [eventDoc.competitor];
      allParticipants.push(...list);
    }

    if (eventDoc.homeTeam) {
      allParticipants.push({ ...eventDoc.homeTeam, homeAway: 'home' });
    }

    if (eventDoc.awayTeam) {
      allParticipants.push({ ...eventDoc.awayTeam, homeAway: 'away' });
    }

    const normalizedTeamName = this.normalizeText(teamName);

    let programParticipant = null;
    for (const participant of allParticipants) {
      const normalizedName = this.normalizeText(participant?.name);
      if (normalizedName && normalizedTeamName && normalizedName.includes(normalizedTeamName)) {
        programParticipant = participant;
      } else {
        participants.push({
          name: this.normalizeText(participant?.name),
          record: this.normalizeText(participant?.record),
          classification: this.normalizeText(participant?.description)
        });
      }
    }

    const opponent = participants[0] || null;
    const homeAway = programParticipant?.homeAway || (opponent?.homeAway === 'home' ? 'away' : opponent?.homeAway === 'away' ? 'home' : null);

    return {
      id: eventDoc.identifier || eventDoc['@id'] || null,
      date: this.toDate(eventDoc.startDate || eventDoc.date),
      endDate: this.toDate(eventDoc.endDate),
      opponent: opponent?.name || null,
      opponentDetails: opponent,
      location: this.normalizeText(eventDoc.location?.name || eventDoc.location?.address?.addressLocality),
      isHome: homeAway ? homeAway === 'home' : null,
      venue: this.normalizeText(eventDoc.location?.name),
      result: this.normalizeText(eventDoc.eventStatusText || eventDoc.eventStatus || eventDoc.result),
      score: this.parseScore(eventDoc),
      links: [eventDoc.url, eventDoc.sameAs].filter(Boolean)
    };
  }

  parseScore(eventDoc) {
    const teamScore = this.parseNumber(eventDoc.homeTeam?.score ?? eventDoc.homeScore ?? eventDoc.score);
    const opponentScore = this.parseNumber(eventDoc.awayTeam?.score ?? eventDoc.awayScore ?? eventDoc.opponentScore);
    const finalScore = this.normalizeText(eventDoc.finalScore || eventDoc.scoreSummary);

    if (teamScore === null && opponentScore === null && !finalScore) {
      return null;
    }

    return {
      team: teamScore,
      opponent: opponentScore,
      summary: finalScore
    };
  }

  parseScheduleFromHtml(html, teamName) {
    if (!html) return [];
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const schedule = [];
    const normalizedTeamName = this.normalizeText(teamName);

    for (const [, row] of rows) {
      if (!/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(row)) continue;
      const columns = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(([, value]) =>
        this.normalizeText(value.replace(/<[^>]+>/g, ' '))
      );
      if (columns.length < 3) continue;

      const [dateText, opponentText, resultText, locationText] = columns;
      const opponentName = opponentText?.replace(normalizedTeamName || '', '').trim();

      schedule.push({
        id: null,
        date: this.toDate(dateText),
        opponent: opponentName || opponentText || null,
        location: locationText || null,
        result: resultText || null,
        score: this.parseScoreFromText(resultText)
      });
    }

    return schedule;
  }

  parseScoreFromText(text) {
    if (!text) return null;
    const scoreMatch = text.match(/(\d+)\s*-\s*(\d+)/);
    if (!scoreMatch) return { summary: text };
    return {
      team: this.parseNumber(scoreMatch[1]),
      opponent: this.parseNumber(scoreMatch[2]),
      summary: text
    };
  }

  parseRoster(html, teamName) {
    if (!html) return [];
    const jsonLd = this.extractJsonLd(html);
    const players = [];

    for (const doc of jsonLd) {
      if (!doc) continue;
      const types = Array.isArray(doc['@type']) ? doc['@type'] : [doc['@type']];
      if (!types.includes('Person')) continue;

      players.push({
        name: this.normalizeText(doc.name),
        position: this.normalizeText(doc.memberOf?.roleName || doc.jobTitle || doc.position),
        number: this.normalizeText(doc.memberOf?.identifier || doc.additionalName),
        classYear: this.normalizeText(doc.award) || this.extractClassYear(doc.description),
        height: this.normalizeText(doc.height),
        weight: this.normalizeText(doc.weight),
        hometown: this.normalizeText(doc.address?.addressLocality),
        recruiting: null
      });
    }

    if (players.length === 0) {
      players.push(...this.parseRosterFromHtml(html, teamName));
    }

    return players;
  }

  extractClassYear(text) {
    if (!text) return null;
    const match = String(text).match(/Class\s*of\s*(\d{4})/i);
    return match ? match[1] : null;
  }

  parseRosterFromHtml(html) {
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const players = [];
    for (const [, row] of rows) {
      if (!/class/i.test(row)) continue;
      const columns = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(([, value]) =>
        this.normalizeText(value.replace(/<[^>]+>/g, ' '))
      );
      if (columns.length < 4) continue;
      const [number, name, position, classYear, height, weight] = columns;
      players.push({
        name,
        position,
        number,
        classYear,
        height,
        weight,
        recruiting: null
      });
    }
    return players;
  }

  deriveTeamStats(stats, schedule) {
    const metrics = { ...stats };
    const completedGames = schedule.filter((game) => game?.score && typeof game.score.team === 'number' && typeof game.score.opponent === 'number');

    if (completedGames.length) {
      const totals = completedGames.reduce(
        (acc, game) => {
          acc.pointsFor += game.score.team || 0;
          acc.pointsAgainst += game.score.opponent || 0;
          acc.games += 1;
          return acc;
        },
        { pointsFor: 0, pointsAgainst: 0, games: 0 }
      );

      metrics.points_per_game = totals.games ? Number((totals.pointsFor / totals.games).toFixed(1)) : metrics.points_per_game || null;
      metrics.points_allowed_per_game = totals.games ? Number((totals.pointsAgainst / totals.games).toFixed(1)) : metrics.points_allowed_per_game || null;
      metrics.scoring_margin = totals.games ? Number(((totals.pointsFor - totals.pointsAgainst) / totals.games).toFixed(1)) : metrics.scoring_margin || null;
    }

    return metrics;
  }
}
