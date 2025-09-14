#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';

class GitHubRepoAnalyzer {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
    this.username = 'ahump20';
  }

  async getAllRepos() {
    try {
      console.log('🔍 Fetching all repositories...');
      
      const repos = await this.octokit.paginate(this.octokit.rest.repos.listForUser, {
        username: this.username,
        type: 'all',
        sort: 'updated',
        per_page: 100
      });

      return repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        visibility: repo.private ? 'private' : 'public',
        language: repo.language,
        size: repo.size,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        isArchived: repo.archived,
        isFork: repo.fork,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        topics: repo.topics || []
      }));
    } catch (error) {
      console.error('❌ Error fetching repositories:', error.message);
      return [];
    }
  }

  async analyzeRepos() {
    const repos = await this.getAllRepos();
    
    if (repos.length === 0) {
      console.log('⚠️ No repositories found or authentication failed');
      return;
    }

    console.log(`📊 Found ${repos.length} repositories\n`);

    // Categorize repositories
    const categories = {
      'Blaze Intelligence Core': [],
      'Sports Analytics': [],
      'Portfolio/Personal': [],
      'Automation/Tools': [],
      'Archive/Inactive': [],
      'Forks': [],
      'Other': []
    };

    repos.forEach(repo => {
      if (repo.isFork) {
        categories['Forks'].push(repo);
      } else if (repo.isArchived || this.isInactive(repo)) {
        categories['Archive/Inactive'].push(repo);
      } else if (this.isBlazeIntelligence(repo)) {
        categories['Blaze Intelligence Core'].push(repo);
      } else if (this.isSportsAnalytics(repo)) {
        categories['Sports Analytics'].push(repo);
      } else if (this.isPortfolioPersonal(repo)) {
        categories['Portfolio/Personal'].push(repo);
      } else if (this.isAutomationTool(repo)) {
        categories['Automation/Tools'].push(repo);
      } else {
        categories['Other'].push(repo);
      }
    });

    // Generate analysis report
    const analysis = {
      totalRepos: repos.length,
      categories,
      recommendations: this.generateRecommendations(categories),
      createdAt: new Date().toISOString()
    };

    // Save analysis
    await fs.writeFile(
      path.join(process.cwd(), 'github-repo-analysis.json'),
      JSON.stringify(analysis, null, 2)
    );

    // Display summary
    this.displaySummary(categories);
    
    return analysis;
  }

  isBlazeIntelligence(repo) {
    const blazeKeywords = ['blaze', 'intelligence', 'analytics', 'sports-ai'];
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    
    return blazeKeywords.some(keyword => 
      name.includes(keyword) || desc.includes(keyword)
    );
  }

  isSportsAnalytics(repo) {
    const sportsKeywords = ['cardinals', 'mlb', 'nfl', 'nba', 'sports', 'analytics', 'baseball', 'football'];
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    
    return sportsKeywords.some(keyword => 
      name.includes(keyword) || desc.includes(keyword)
    );
  }

  isPortfolioPersonal(repo) {
    const portfolioKeywords = ['portfolio', 'personal', 'website', 'resume', 'austin'];
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    
    return portfolioKeywords.some(keyword => 
      name.includes(keyword) || desc.includes(keyword)
    );
  }

  isAutomationTool(repo) {
    const automationKeywords = ['automation', 'bot', 'script', 'tool', 'deploy', 'ci', 'workflow'];
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    
    return automationKeywords.some(keyword => 
      name.includes(keyword) || desc.includes(keyword)
    );
  }

  isInactive(repo) {
    const lastUpdate = new Date(repo.updatedAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return lastUpdate < sixMonthsAgo && repo.size < 100;
  }

  generateRecommendations(categories) {
    const recommendations = [];

    // Archive inactive repos
    if (categories['Archive/Inactive'].length > 0) {
      recommendations.push({
        type: 'archive',
        priority: 'medium',
        action: `Archive ${categories['Archive/Inactive'].length} inactive repositories`,
        repos: categories['Archive/Inactive'].map(r => r.name)
      });
    }

    // Consolidate similar repos
    if (categories['Blaze Intelligence Core'].length > 5) {
      recommendations.push({
        type: 'consolidate',
        priority: 'high',
        action: 'Consider consolidating Blaze Intelligence repositories into a monorepo',
        repos: categories['Blaze Intelligence Core'].map(r => r.name)
      });
    }

    // Update descriptions
    const reposWithoutDesc = Object.values(categories)
      .flat()
      .filter(repo => !repo.description && !repo.isFork && !repo.isArchived);
    
    if (reposWithoutDesc.length > 0) {
      recommendations.push({
        type: 'documentation',
        priority: 'medium',
        action: 'Add descriptions to repositories without them',
        repos: reposWithoutDesc.map(r => r.name)
      });
    }

    return recommendations;
  }

  displaySummary(categories) {
    console.log('📋 Repository Analysis Summary\n');
    
    Object.entries(categories).forEach(([category, repos]) => {
      if (repos.length > 0) {
        console.log(`📁 ${category} (${repos.length} repos):`);
        repos.forEach(repo => {
          const status = repo.isArchived ? '📦' : repo.visibility === 'private' ? '🔒' : '🌐';
          const stars = repo.stars > 0 ? `⭐${repo.stars}` : '';
          console.log(`  ${status} ${repo.name} ${stars}`);
          if (repo.description) {
            console.log(`      ${repo.description}`);
          }
        });
        console.log('');
      }
    });
  }
}

// Main execution
async function main() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.log('❌ GITHUB_TOKEN environment variable not set');
    console.log('Please set your GitHub personal access token:');
    console.log('export GITHUB_TOKEN=your_token_here');
    process.exit(1);
  }

  const analyzer = new GitHubRepoAnalyzer(token);
  await analyzer.analyzeRepos();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default GitHubRepoAnalyzer;