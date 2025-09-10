#!/usr/bin/env node

/**
 * Cardinals Analytics MCP Server
 * Provides sports analytics functions for Austin Humphrey's portfolio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

class CardinalsAnalyticsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cardinals-analytics',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyzeTrajectory',
            description: 'Analyze athletic trajectory from 2008 baseball data to current business metrics',
            inputSchema: {
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                  description: 'Path to baseball statistics JSON file',
                },
                comparison: {
                  type: 'string',
                  description: 'Path to current business metrics JSON file',
                },
              },
              required: ['data', 'comparison'],
            },
          },
          {
            name: 'generateInsights',
            description: 'Generate sports analytics insights for portfolio updates',
            inputSchema: {
              type: 'object',
              properties: {
                gameData: {
                  type: 'object',
                  description: 'Recent game statistics',
                },
                playerMetrics: {
                  type: 'object',
                  description: 'Player performance metrics',
                },
              },
            },
          },
          {
            name: 'updatePortfolio',
            description: 'Update portfolio with new analytics content',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'New content to add to portfolio',
                },
                section: {
                  type: 'string',
                  description: 'Portfolio section to update (analytics, projects, etc.)',
                },
              },
              required: ['content', 'section'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'analyzeTrajectory':
          return this.analyzeTrajectory(request.params.arguments);
        case 'generateInsights':
          return this.generateInsights(request.params.arguments);
        case 'updatePortfolio':
          return this.updatePortfolio(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async analyzeTrajectory(args) {
    try {
      const { data, comparison } = args;
      
      // Load baseball data
      const baseballData = JSON.parse(await fs.readFile(data, 'utf8'));
      const businessData = JSON.parse(await fs.readFile(comparison, 'utf8'));

      // Analyze trajectory
      const analysis = {
        athleticFoundation: {
          discipline: baseballData.gamesPlayed || 0,
          performance: baseballData.battingAverage || 0,
          teamwork: baseballData.rbis || 0,
        },
        businessTranslation: {
          consistency: businessData.projectCompletionRate || 0,
          results: businessData.clientSatisfaction || 0,
          leadership: businessData.teamLeadership || 0,
        },
        trajectory: {
          growth: this.calculateGrowthMetric(baseballData, businessData),
          transferableSkills: this.identifyTransferableSkills(baseballData, businessData),
          competitiveAdvantage: this.assessCompetitiveAdvantage(baseballData, businessData),
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing trajectory: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async generateInsights(args) {
    const { gameData, playerMetrics } = args;
    
    const insights = {
      timestamp: new Date().toISOString(),
      gameAnalysis: gameData ? this.analyzeGameData(gameData) : null,
      playerAnalysis: playerMetrics ? this.analyzePlayerMetrics(playerMetrics) : null,
      portfolioRecommendations: this.generatePortfolioRecommendations(gameData, playerMetrics),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(insights, null, 2),
        },
      ],
    };
  }

  async updatePortfolio(args) {
    const { content, section } = args;
    
    try {
      // Create update payload
      const update = {
        timestamp: new Date().toISOString(),
        section,
        content,
        source: 'cardinals-analytics-mcp',
      };

      // Write to update queue
      const updatePath = '/Users/AustinHumphrey/portfolio-updates.json';
      let updates = [];
      
      try {
        const existingUpdates = await fs.readFile(updatePath, 'utf8');
        updates = JSON.parse(existingUpdates);
      } catch (error) {
        // File doesn't exist, start fresh
      }

      updates.push(update);
      await fs.writeFile(updatePath, JSON.stringify(updates, null, 2));

      return {
        content: [
          {
            type: 'text',
            text: `Portfolio update queued for ${section}: ${content.substring(0, 100)}...`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating portfolio: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Helper methods
  calculateGrowthMetric(baseballData, businessData) {
    const athleticScore = (baseballData.battingAverage || 0) * 100;
    const businessScore = (businessData.projectCompletionRate || 0) * 100;
    return Math.round((businessScore - athleticScore) / athleticScore * 100);
  }

  identifyTransferableSkills(baseballData, businessData) {
    return [
      'Pressure performance',
      'Team coordination',
      'Strategic thinking',
      'Data-driven decision making',
      'Competitive analysis',
    ];
  }

  assessCompetitiveAdvantage(baseballData, businessData) {
    return {
      athleticMindset: 'Systematic approach to performance optimization',
      analyticalRigor: 'Data-driven insights from sports translate to business',
      resilience: 'Experience with high-pressure situations',
    };
  }

  analyzeGameData(gameData) {
    return {
      keyMetrics: gameData,
      trends: 'Upward trajectory in performance metrics',
      insights: 'Strong correlation between preparation and results',
    };
  }

  analyzePlayerMetrics(playerMetrics) {
    return {
      performance: playerMetrics,
      comparisons: 'Above average in key performance indicators',
      recommendations: 'Continue current training regimen',
    };
  }

  generatePortfolioRecommendations(gameData, playerMetrics) {
    return [
      'Update analytics dashboard with latest metrics',
      'Add new case study based on recent performance',
      'Refresh competitive intelligence section',
      'Update team leadership examples',
    ];
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Cardinals Analytics MCP server running on stdio');
  }
}

const server = new CardinalsAnalyticsServer();
server.run().catch(console.error);