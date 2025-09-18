import BaseAdapter from './baseAdapter.js';
import { deepSearch, uniqueBy, truncate } from './utils.js';

const COMMIT_STATUS_REGEX = /(commit|signed|enrolled|signee)/i;

export default class RivalsAdapter extends BaseAdapter {
  constructor(options = {}) {
    super({
      name: 'rivals',
      baseUrl: 'https://n.rivals.com',
      minRequestInterval: 750,
      defaultHeaders: {
        ...options.defaultHeaders,
        'Accept-Language': 'en-US,en;q=0.9'
      },
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

  async getRecruitingData({
    teamPath,
    includeTargets = true,
    season
  }) {
    const normalizedPath = this.normalizeTeamPath(teamPath);
    if (!normalizedPath) {
      throw new Error('[rivals] teamPath is required to fetch recruiting data');
    }

    const html = await this.fetchHtml(normalizedPath, {
      searchParams: season ? { season } : undefined
    });

    const nuxtData = this.extractScriptJson(html, [
      { pattern: 'window\\.__NUXT__\\s*=\\s*([\\s\\S]*?);', flags: 'i' },
      '__NUXT__'
    ]);
    const jsonLd = this.extractJsonLd(html);

    const team = this.parseTeam(nuxtData, jsonLd, html);
    const commits = this.extractProspects(nuxtData, html, { committedOnly: true });
    const targets = includeTargets ? this.extractProspects(nuxtData, html, { committedOnly: false }) : [];
    const rankings = this.extractRankings(nuxtData, html);
    const headlines = this.extractHeadlines(html);

    return {
      source: 'rivals',
      fetchedAt: new Date().toISOString(),
      team,
      recruiting: {
        commits,
        targets,
        rankings: rankings?.metrics || null,
        summary: this.buildSummary(commits, rankings)
      },
      notes: headlines,
      raw: {
        structuredData: jsonLd,
        rankingSource: rankings?.rawSnippet || null
      },
      errors: rankings?.errors || []
    };
  }

  parseTeam(nuxtData, jsonLd, html) {
    const teamDoc = (jsonLd || []).find((doc) => {
      const types = Array.isArray(doc['@type']) ? doc['@type'] : [doc['@type']];
      return types.includes('SportsTeam') || types.includes('Organization');
    });

    const teamNodes = deepSearch(nuxtData, (node) =>
      node && typeof node === 'object' && (
        node.teamName || node.schoolName || node.programName || node.nickname
      )
    );
    const teamNode = teamNodes[0] || {};

    return {
      name: this.normalizeText(teamDoc?.name || teamNode.teamName || teamNode.programName || this.extractHeading(html)),
      mascot: this.normalizeText(teamNode.nickname || teamDoc?.alternateName),
      classification: this.normalizeText(teamNode.level || teamNode.classification),
      state: this.normalizeText(teamNode.state || teamDoc?.address?.addressRegion),
      city: this.normalizeText(teamNode.city || teamDoc?.address?.addressLocality),
      record: {
        overall: this.normalizeText(teamNode.overallRecord || teamNode.record),
        district: this.normalizeText(teamNode.districtRecord)
      },
      rankings: {
        national: this.parseNumber(teamNode.nationalRank),
        state: this.parseNumber(teamNode.stateRank)
      },
      profileUrl: teamNode.url || teamDoc?.url || null
    };
  }

  extractHeading(html) {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return this.normalizeText(match?.[1]);
  }

  extractProspects(nuxtData, html, { committedOnly }) {
    const nodes = deepSearch(nuxtData, (node) =>
      node && typeof node === 'object' && (
        'athleteName' in node ||
        'prospectName' in node ||
        'playerName' in node ||
        ('name' in node && ('rating' in node || 'rivalsRating' in node || 'position' in node))
      )
    );

    const prospects = nodes
      .map((node) => this.mapProspect(node))
      .filter(Boolean)
      .filter((prospect) => {
        if (!prospect?.name) return false;
        if (!committedOnly) return true;
        return COMMIT_STATUS_REGEX.test(prospect.status || '');
      });

    const unique = uniqueBy(prospects, (prospect) => `${prospect.name}-${prospect.classYear || ''}`);

    if (unique.length) {
      return unique;
    }

    return this.parseProspectsFromHtml(html, { committedOnly });
  }

  mapProspect(node) {
    if (!node || typeof node !== 'object') return null;

    const name = this.normalizeText(
      node.athleteName || node.prospectName || node.playerName || node.name
    );

    if (!name) return null;

    const position = this.normalizeText(
      node.position || node.primaryPosition || node.positionAbbr || node.positionShort
    );
    const height = this.normalizeText(node.height || node.playerHeight);
    const weight = this.parseNumber(node.weight || node.playerWeight);
    const rating = this.parseNumber(node.rivalsRating || node.rating || node.rankingPoints);
    const stars = this.parseNumber(node.stars || node.starRating);

    const status = this.normalizeText(node.commitmentStatus || node.status || node.commitStatus);
    const commitDate = this.toDate(node.commitDate || node.updatedAt || node.decisionDate);
    const classYear = this.normalizeText(node.class || node.classYear || node.gradYear);

    const nationalRank = this.parseNumber(node.nationalRank || node.nationalRanking);
    const stateRank = this.parseNumber(node.stateRank || node.stateRanking);
    const positionRank = this.parseNumber(node.positionRank || node.positionRanking);

    const hometown = this.normalizeText(node.hometown || node.cityState || node.highSchool);

    return {
      name,
      position,
      classYear,
      status,
      commitmentDate: commitDate,
      measurables: {
        height,
        weight
      },
      hometown,
      ranking: {
        national: nationalRank,
        state: stateRank,
        position: positionRank
      },
      rating,
      stars,
      profileUrl: node.profileUrl || node.url || null
    };
  }

  parseProspectsFromHtml(html, { committedOnly }) {
    if (!html) return [];
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const prospects = [];

    for (const [, row] of rows) {
      if (!/(?:Commit|Target|Interest)/i.test(row)) continue;
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(([, value]) =>
        this.normalizeText(value.replace(/<[^>]+>/g, ' '))
      );
      if (cells.length < 5) continue;

      const [name, position, measurables, hometown, status] = cells;
      if (!name) continue;

      if (committedOnly && !COMMIT_STATUS_REGEX.test(status || '')) {
        continue;
      }

      const ratingMatch = row.match(/data-rating="([0-9.]+)"/i);
      const starsMatch = row.match(/data-stars="([0-9.]+)"/i);

      prospects.push({
        name,
        position,
        classYear: null,
        status,
        commitmentDate: null,
        measurables: {
          height: measurables?.split('/')[0]?.trim() || null,
          weight: this.parseNumber(measurables?.split('/')[1])
        },
        hometown,
        ranking: {
          national: null,
          state: null,
          position: null
        },
        rating: this.parseNumber(ratingMatch?.[1]),
        stars: this.parseNumber(starsMatch?.[1]),
        profileUrl: null
      });
    }

    return prospects;
  }

  extractRankings(nuxtData, html) {
    const rankingNodes = deepSearch(nuxtData, (node) =>
      node && typeof node === 'object' && (
        ('teamRank' in node && 'rankingPoints' in node) ||
        ('teamRanking' in node && typeof node.teamRanking === 'object') ||
        ('teamScore' in node && 'nationalRank' in node)
      )
    );

    const metrics = rankingNodes.map((node) => this.mapRanking(node)).filter(Boolean);

    if (metrics.length) {
      const best = metrics.sort((a, b) => (a.timestamp || 0) < (b.timestamp || 0) ? 1 : -1)[0];
      return { metrics: best, rawSnippet: truncate(JSON.stringify(best)) };
    }

    const fallback = this.extractRankingsFromHtml(html);
    return {
      metrics: fallback,
      rawSnippet: fallback ? truncate(JSON.stringify(fallback)) : null,
      errors: []
    };
  }

  mapRanking(node) {
    if (!node || typeof node !== 'object') return null;
    const ranking = node.teamRanking || node.ranking || node;
    const timestamp = ranking.updatedAt || node.timestamp || null;

    return {
      nationalRank: this.parseNumber(ranking.nationalRank || ranking.teamRank || ranking.rank),
      stateRank: this.parseNumber(ranking.stateRank || ranking.rankState),
      classRank: this.parseNumber(ranking.classRank || ranking.rankClass),
      compositeScore: this.parseNumber(ranking.teamScore || ranking.rankingPoints || ranking.points),
      averageRating: this.parseNumber(ranking.averageRating || ranking.avgStars || ranking.avgRating),
      totalCommits: this.parseNumber(ranking.totalCommits || ranking.commitments || ranking.pledges),
      blueChips: this.parseNumber(ranking.blueChips || ranking.fourStarPlus || ranking.topPlayers),
      timestamp: timestamp ? this.toDate(timestamp) : null
    };
  }

  extractRankingsFromHtml(html) {
    if (!html) return null;
    const nationalMatch = html.match(/National\s*Rank[^0-9]*([0-9]+)/i);
    const stateMatch = html.match(/State\s*Rank[^0-9]*([0-9]+)/i);
    const classMatch = html.match(/Class\s*Rank[^0-9]*([0-9]+)/i);
    const scoreMatch = html.match(/Points[^0-9]*([0-9.]+)/i);

    if (!nationalMatch && !stateMatch && !classMatch && !scoreMatch) {
      return null;
    }

    return {
      nationalRank: this.parseNumber(nationalMatch?.[1]),
      stateRank: this.parseNumber(stateMatch?.[1]),
      classRank: this.parseNumber(classMatch?.[1]),
      compositeScore: this.parseNumber(scoreMatch?.[1]),
      averageRating: null,
      totalCommits: null,
      blueChips: null,
      timestamp: new Date().toISOString()
    };
  }

  extractHeadlines(html) {
    if (!html) return [];
    const items = [...html.matchAll(/<a[^>]*class="[^"]*(?:headline|title)[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    return items.slice(0, 5).map(([, href, title]) => ({
      title: this.normalizeText(title.replace(/<[^>]+>/g, ' ')),
      url: href.startsWith('http') ? href : `https://n.rivals.com${href}`
    }));
  }

  buildSummary(commits, rankings) {
    const totalCommits = commits.length;
    const averageRating = commits.length
      ? Number(
          (
            commits
              .map((prospect) => prospect.rating || 0)
              .filter((rating) => typeof rating === 'number')
              .reduce((acc, curr) => acc + curr, 0) / commits.length
          ).toFixed(3)
        )
      : null;

    return {
      totalCommits,
      averageRating,
      nationalRank: rankings?.metrics?.nationalRank || null,
      stateRank: rankings?.metrics?.stateRank || null,
      classRank: rankings?.metrics?.classRank || null,
      compositeScore: rankings?.metrics?.compositeScore || null
    };
  }
}
