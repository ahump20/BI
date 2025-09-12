#!/usr/bin/env node

/**
 * Bulk GitHub Repository Operations
 * Automate repository cleanup, organization, and standardization
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

class BulkRepoOperations {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
    this.username = 'ahump20';
    this.dryRun = true; // Safety first - set to false to execute
  }

  async updateRepositoryDescription(repoName, description) {
    if (this.dryRun) {
      console.log(chalk.blue(`[DRY RUN] Would update ${repoName} description: ${description}`));
      return;
    }

    try {
      await this.octokit.rest.repos.update({
        owner: this.username,
        repo: repoName,
        description: description
      });
      console.log(chalk.green(`✅ Updated description for ${repoName}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to update ${repoName}: ${error.message}`));
    }
  }

  async updateRepositoryTopics(repoName, topics) {
    if (this.dryRun) {
      console.log(chalk.blue(`[DRY RUN] Would update ${repoName} topics: ${topics.join(', ')}`));
      return;
    }

    try {
      await this.octokit.rest.repos.replaceAllTopics({
        owner: this.username,
        repo: repoName,
        names: topics
      });
      console.log(chalk.green(`✅ Updated topics for ${repoName}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to update topics for ${repoName}: ${error.message}`));
    }
  }

  async archiveRepository(repoName, reason) {
    if (this.dryRun) {
      console.log(chalk.yellow(`[DRY RUN] Would archive ${repoName}: ${reason}`));
      return;
    }

    try {
      await this.octokit.rest.repos.update({
        owner: this.username,
        repo: repoName,
        archived: true
      });
      console.log(chalk.yellow(`📦 Archived ${repoName}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to archive ${repoName}: ${error.message}`));
    }
  }

  async createStandardizedREADME(repoName, repoData) {
    const readmeContent = this.generateREADME(repoName, repoData);
    
    if (this.dryRun) {
      console.log(chalk.blue(`[DRY RUN] Would create README for ${repoName}`));
      // Save to local file for review
      await fs.writeFile(`./readme-preview-${repoName}.md`, readmeContent);
      return;
    }

    try {
      // Check if README exists
      let sha;
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner: this.username,
          repo: repoName,
          path: 'README.md'
        });
        sha = data.sha;
      } catch (error) {
        // README doesn't exist, will create new
      }

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.username,
        repo: repoName,
        path: 'README.md',
        message: 'Add/Update standardized README for Blaze Intelligence platform',
        content: Buffer.from(readmeContent).toString('base64'),
        ...(sha && { sha })
      });

      console.log(chalk.green(`📝 Created/Updated README for ${repoName}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to update README for ${repoName}: ${error.message}`));
    }
  }

  generateREADME(repoName, repoData) {
    const category = this.categorizeRepo(repoName, repoData.description);
    const language = repoData.language || 'JavaScript';
    
    return `# ${repoName}

![Blaze Intelligence](https://img.shields.io/badge/Blaze-Intelligence-orange)
![Status](https://img.shields.io/badge/Status-Active-green)
![Language](https://img.shields.io/badge/Language-${language}-yellow)

> Part of the Blaze Intelligence Platform - Where cognitive performance meets quarterly performance.

## 🎯 Overview

${repoData.description || 'Advanced sports analytics and AI-powered systems for competitive intelligence.'}

This repository is part of the comprehensive Blaze Intelligence platform, focusing on ${category.toLowerCase()} solutions.

## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/ahump20/${repoName}.git
cd ${repoName}

# Install dependencies (if applicable)
npm install

# Start development
npm run dev
\`\`\`

## 📋 Features

- 🎯 **Professional Grade**: Enterprise-level sports analytics
- 🚀 **Real-time Processing**: Live data integration and analysis
- 🏆 **Championship Mentality**: Built with winning performance standards
- 🔧 **Scalable Architecture**: Designed for growth and expansion

## 🏗️ Architecture

This system integrates with the broader Blaze Intelligence ecosystem:

- **Multi-AI Orchestration**: Claude, ChatGPT, and Gemini coordination
- **Real-time Data**: Live sports data feeds and processing
- **Automated Workflows**: Continuous integration and deployment
- **Professional Standards**: Enterprise-grade security and monitoring

## 📊 Performance Standards

- Response Time: <100ms for standard operations
- Uptime Target: 99.9% availability
- Data Processing: Real-time with <2 second latency
- Scalability: Designed for enterprise-level loads

## 🔧 Configuration

Create a \`.env\` file with required environment variables:

\`\`\`bash
# Example configuration
API_KEY=your_api_key_here
DATABASE_URL=your_database_url
ENVIRONMENT=development
\`\`\`

## 📚 Documentation

- [Getting Started Guide](./docs/getting-started.md)
- [API Documentation](./docs/api.md)
- [Development Setup](./docs/development.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

This repository is part of the Blaze Intelligence platform. Contributions are welcome following our professional standards:

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 🏆 Blaze Intelligence Ecosystem

This repository connects to our comprehensive platform:

### Core Systems
- **Blaze AI Core**: Multi-model AI orchestration
- **Sports Analytics Engine**: Real-time data processing
- **Vision AI Platform**: Computer vision and biomechanics
- **Automation Suite**: Enterprise deployment tools

### Data Sources
- MLB, NFL, NBA, NCAA official data
- Perfect Game youth baseball integration
- Real-time performance metrics
- Historical trend analysis

### Client Solutions
- Custom analytics dashboards
- Automated reporting systems
- Performance optimization tools
- Strategic consulting frameworks

## 📞 Contact & Support

**Austin Humphrey**  
*Founder & Chief Intelligence Officer*  
Blaze Intelligence Platform

📧 **Email**: ahump20@outlook.com  
📱 **Phone**: (210) 273-5538  
🔗 **LinkedIn**: [john-humphrey-2033](https://linkedin.com/in/john-humphrey-2033)  
🌐 **Portfolio**: [Professional Showcase](https://github.com/ahump20)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Built with championship mentality. Powered by Texas grit. 🏈⚾🏀*

**Blaze Intelligence** - *Where cognitive performance meets quarterly performance.*`;
  }

  categorizeRepo(name, description) {
    const blazeKeywords = ['blaze', 'intelligence'];
    const sportsKeywords = ['sports', 'mlb', 'nfl', 'nba', 'cardinals'];
    const automationKeywords = ['automation', 'deploy', 'script'];
    const portfolioKeywords = ['portfolio', 'website', 'personal'];
    
    const text = `${name} ${description || ''}`.toLowerCase();
    
    if (blazeKeywords.some(k => text.includes(k))) return 'Blaze Intelligence Core';
    if (sportsKeywords.some(k => text.includes(k))) return 'Sports Analytics';
    if (automationKeywords.some(k => text.includes(k))) return 'Automation Tools';
    if (portfolioKeywords.some(k => text.includes(k))) return 'Portfolio';
    return 'Platform Tools';
  }

  async executeCleanupPlan(analysisFile = 'github-repo-analysis.json') {
    try {
      const analysisData = JSON.parse(
        await fs.readFile(analysisFile, 'utf8')
      );

      console.log(chalk.cyan('\n🎯 EXECUTING GITHUB REPOSITORY CLEANUP PLAN\n'));

      // Phase 1: Archive inactive repositories
      const inactiveRepos = analysisData.categories['Archive/Inactive'] || [];
      if (inactiveRepos.length > 0) {
        console.log(chalk.yellow(`📦 Archiving ${inactiveRepos.length} inactive repositories:`));
        for (const repo of inactiveRepos) {
          await this.archiveRepository(repo.name, 'Inactive for 6+ months');
        }
      }

      // Phase 2: Update descriptions for repos without them
      console.log(chalk.cyan('\n📝 Updating repository descriptions:'));
      Object.values(analysisData.categories).flat().forEach(async (repo) => {
        if (!repo.description && !repo.isArchived && !repo.isFork) {
          const newDescription = this.generateDescription(repo.name);
          await this.updateRepositoryDescription(repo.name, newDescription);
        }
      });

      // Phase 3: Add standardized topics
      console.log(chalk.cyan('\n🏷️ Adding repository topics:'));
      Object.entries(analysisData.categories).forEach(([category, repos]) => {
        repos.forEach(async (repo) => {
          if (!repo.isArchived && !repo.isFork) {
            const topics = this.generateTopics(repo.name, category);
            await this.updateRepositoryTopics(repo.name, topics);
          }
        });
      });

      // Phase 4: Create standardized READMEs
      console.log(chalk.cyan('\n📋 Creating standardized README files:'));
      Object.values(analysisData.categories).flat().forEach(async (repo) => {
        if (!repo.isArchived && !repo.isFork) {
          await this.createStandardizedREADME(repo.name, repo);
        }
      });

      console.log(chalk.green('\n✅ Repository cleanup plan execution complete!'));
      
      if (this.dryRun) {
        console.log(chalk.yellow('\n⚠️ DRY RUN MODE - No changes were actually made.'));
        console.log(chalk.blue('Set this.dryRun = false to execute changes.'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error executing cleanup plan:', error.message));
    }
  }

  generateDescription(repoName) {
    const name = repoName.toLowerCase();
    
    if (name.includes('blaze')) return 'Blaze Intelligence platform - Advanced sports analytics and AI systems';
    if (name.includes('cardinals')) return 'St. Louis Cardinals analytics and performance tracking system';
    if (name.includes('sports')) return 'Professional sports data analytics and intelligence tools';
    if (name.includes('automation')) return 'Automated deployment and operational tools for enterprise systems';
    if (name.includes('portfolio')) return 'Professional portfolio and digital showcase platform';
    if (name.includes('vision') || name.includes('ai')) return 'Computer vision and AI-powered coaching systems';
    
    return 'Professional sports analytics and intelligent systems platform';
  }

  generateTopics(repoName, category) {
    const baseTopics = ['blaze-intelligence', 'sports-analytics', 'austin-humphrey'];
    const name = repoName.toLowerCase();
    
    const categoryTopics = {
      'Blaze Intelligence Core': ['ai', 'machine-learning', 'sports-intelligence'],
      'Sports Analytics': ['mlb', 'nfl', 'nba', 'sports-data'],
      'Automation/Tools': ['automation', 'deployment', 'devops'],
      'Portfolio/Personal': ['portfolio', 'website', 'showcase'],
      'Vision AI': ['computer-vision', 'ai-coaching', 'biomechanics']
    };

    let topics = [...baseTopics];
    
    // Add category-specific topics
    if (categoryTopics[category]) {
      topics.push(...categoryTopics[category]);
    }
    
    // Add name-specific topics
    if (name.includes('cardinals')) topics.push('st-louis-cardinals');
    if (name.includes('mlb')) topics.push('baseball');
    if (name.includes('nfl')) topics.push('football');
    if (name.includes('nba')) topics.push('basketball');
    if (name.includes('deploy')) topics.push('continuous-deployment');
    
    return [...new Set(topics)].slice(0, 20); // GitHub limits to 20 topics
  }

  enableExecutionMode() {
    this.dryRun = false;
    console.log(chalk.red('⚠️ EXECUTION MODE ENABLED - Changes will be made to repositories!'));
  }
}

// Main execution
async function main() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.log(chalk.red('❌ GITHUB_TOKEN environment variable not set'));
    console.log('Please set your GitHub personal access token:');
    console.log(chalk.blue('export GITHUB_TOKEN=your_token_here'));
    process.exit(1);
  }

  const operations = new BulkRepoOperations(token);
  
  // Check for execution flag
  if (process.argv.includes('--execute')) {
    operations.enableExecutionMode();
  }
  
  await operations.executeCleanupPlan();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BulkRepoOperations;