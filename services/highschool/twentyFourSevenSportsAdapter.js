import BaseAdapter from './baseAdapter.js';
import { deepSearch, uniqueBy, truncate } from './utils.js';

export default class TwentyFourSevenSportsAdapter extends BaseAdapter {
  constructor(options = {}) {
    super({
      name: '247sports',
      baseUrl: 'https://247sports.com',
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

  async getRecruitingData({
    teamPath,
    season,
    includeTargets = true
  }) {
    const normalizedPath = this.normalizeTeamPath(teamPath);
    if (!normalizedPath) {
      throw new Error('[247sports] teamPath is required to fetch recruiting data');
    }

    const html = await this.fetchHtml(normalizedPath, {
      searchParams: season ? { season } : undefined
    });

    const nextData = this.extractScriptJson(html, [{ id: '__NEXT_DATA__' }, '__NEXT_DATA__']);
    const jsonLd = this.extractJsonLd(html);

    const team = this.parseTeam(nextData, jsonLd, html);
    const commits = this.extractProspects(nextData, html, { committedOnly: true });
    const targets = includeTargets ? this.extractProspects(nextData, html, { committedOnly: false }) : [];
    const rankings = this.extractRankings(nextData, html);
    const news = this.extractNews(html);

    const summary = this.buildSummary(commits, rankings);

    return {
      source: '247sports',
      fetchedAt: new Date().toISOString(),
      team,
      recruiting: {
        commits,
        targets,
        rankings: rankings?.metrics || null,
        summary
      },
      notes: news,
      raw: {
        structuredData: jsonLd,
        rankingSource: rankings?.rawSnippet || null
      },
      errors: rankings?.errors || []
    };
  }

  parseTeam(nextData, jsonLd, html) {
    const teamDoc = (jsonLd || []).find((doc) => {
      const types = Array.isArray(doc['@type']) ? doc['@type'] : [doc['@type']];
      return types.includes('SportsTeam') || types.includes('Organization');
    });

    const nameFromHtml = this.extractHeading(html);

    const teamNodeCandidates = deepSearch(nextData, (node) =>
      node && typeof node === 'object' && (node.teamName || node.schoolName || node.fullName)
    );
    const teamNode = teamNodeCandidates[0] || {};

    return {
      name: this.normalizeText(teamDoc?.name || teamNode.teamName || teamNode.schoolName || nameFromHtml),
      mascot: this.normalizeText(teamDoc?.alternateName || teamNode.mascot),
      classification: this.normalizeText(teamNode.classification || teamNode.level),
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
      profileUrl: teamNode.teamUrl || teamNode.url || teamDoc?.url || null
    };
  }

  extractHeading(html) {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return this.normalizeText(match?.[1]);
  }

  extractProspects(nextData, html, { committedOnly }) {
    const nodes = deepSearch(nextData, (node) =>
      node && typeof node === 'object' && (
        'prospectName' in node ||
        'playerName' in node ||
        'fullName' in node ||
        ('name' in node && ('position' in node || 'rating' in node || 'compositeRating' in node))
      )
    );

    const mapped = nodes.map((node) => this.mapProspect(node)).filter(Boolean);
    const filtered = mapped.filter((prospect) => {
      if (!prospect?.name) return false;
      if (!committedOnly) return true;
      return /(commit|signed|enrolled)/i.test(prospect.status || '');
    });

    const unique = uniqueBy(filtered, (prospect) => `${prospect.name}-${prospect.classYear || ''}`);

    if (unique.length > 0) {
      return unique;
    }

    // Fallback to parsing HTML tables when Next.js data is not accessible
    return this.parseProspectsFromHtml(html, { committedOnly });
  }

  mapProspect(node) {
    if (!node || typeof node !== 'object') return null;

    const name = this.normalizeText(
      node.prospectName || node.playerName || node.fullName || node.name
    );

    if (!name) return null;

    const position = this.normalizeText(
      node.position ||
        node.primaryPosition?.abbreviation ||
        node.primaryPosition?.name ||
        node.pos ||
        node.positionGroup
    );

    const height = this.normalizeText(node.height || node.ht || node.playerHeight);
    const weight = this.parseNumber(node.weight || node.wt || node.playerWeight);
    const rating = this.parseNumber(node.compositeRating || node.rating || node.score || node.overallRating);
    const stars = this.parseNumber(node.stars || node.starRating || node.averageStars);

    const hometown = this.normalizeText(
      node.hometown || node.homeTown || node.highSchool || node.school || node.origin
    );

    const commitmentStatus = this.normalizeText(node.status || node.commitmentStatus || node.decisionStatus);
    const commitmentDate = this.toDate(node.commitDate || node.commitmentDate || node.decisionDate);

    const classYear = this.normalizeText(node.class || node.classYear || node.recruitClass);
    const nationalRank = this.parseNumber(node.nationalRank || node.natRank || node.rankNational);
    const stateRank = this.parseNumber(node.stateRank || node.stateRanking || node.rankState);
    const positionRank = this.parseNumber(node.positionRank || node.posRank || node.rankPosition);

    return {
      name,
      position,
      classYear,
      status: commitmentStatus,
      commitmentDate,
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
      profileUrl: node.profileUrl || node.playerProfileUrl || node.url || null
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

      if (committedOnly && !/(?:Commit|Signed|Enrolled)/i.test(status)) {
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

  extractRankings(nextData, html) {
    const rankingNodes = deepSearch(nextData, (node) =>
      node && typeof node === 'object' && (
        ('nationalRank' in node && 'stateRank' in node) ||
        ('teamScore' in node && 'rank' in node) ||
        ('ranking' in node && typeof node.ranking === 'object')
      )
    );

    const metrics = rankingNodes.map((node) => this.mapRanking(node)).filter(Boolean);

    if (metrics.length) {
      const best = metrics.sort((a, b) => (a.timestamp || 0) < (b.timestamp || 0) ? 1 : -1)[0];
      return { metrics: best, rawSnippet: truncate(JSON.stringify(best)) };
    }

    // Fallback to HTML parsing
    const fallback = this.extractRankingsFromHtml(html);
    return {
      metrics: fallback,
      rawSnippet: fallback ? truncate(JSON.stringify(fallback)) : null,
      errors: []
    };
  }

  mapRanking(node) {
    if (!node || typeof node !== 'object') return null;
    const ranking = node.ranking || node;
    const timestamp = ranking.updatedAt || ranking.lastUpdated || node.timestamp || null;

    return {
      nationalRank: this.parseNumber(ranking.nationalRank || ranking.national || ranking.natRank || ranking.rank),
      stateRank: this.parseNumber(ranking.stateRank || ranking.state || ranking.rankState),
      classRank: this.parseNumber(ranking.classRank || ranking.classificationRank || ranking.rankClass),
      compositeScore: this.parseNumber(ranking.teamScore || ranking.points || ranking.score),
      averageRating: this.parseNumber(ranking.avgRating || ranking.averageRating || ranking.averageScore),
      totalCommits: this.parseNumber(ranking.totalCommits || ranking.commitments || ranking.totalRecruits),
      blueChips: this.parseNumber(ranking.blueChips || ranking.fourStarPlus || ranking.blueChipCount),
      timestamp: timestamp ? this.toDate(timestamp) : null
    };
  }

  extractRankingsFromHtml(html) {
    if (!html) return null;
    const nationalMatch = html.match(/National\s*Rank[^0-9]*([0-9]+)/i);
    const stateMatch = html.match(/State\s*Rank[^0-9]*([0-9]+)/i);
    const classMatch = html.match(/Class\s*Rank[^0-9]*([0-9]+)/i);
    const scoreMatch = html.match(/Composite\s*Score[^0-9]*([0-9.]+)/i);

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

  extractNews(html) {
    if (!html) return [];
    const articles = [...html.matchAll(/<article[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<time[^>]*>([^<]*)<\/time>/gi)];
    return articles.slice(0, 5).map(([, href, title, date]) => ({
      title: this.normalizeText(title.replace(/<[^>]+>/g, ' ')),
      url: href.startsWith('http') ? href : `https://247sports.com${href}`,
      publishedAt: this.toDate(date)
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
