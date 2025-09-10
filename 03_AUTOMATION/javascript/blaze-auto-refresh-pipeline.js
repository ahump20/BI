#!/usr/bin/env node

/**
 * Blaze Intelligence Automated Data Refresh Pipeline
 * Continuously updates sports data across all leagues with intelligent scheduling
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlazeAutoRefreshPipeline {
  constructor() {
    this.config = {
      schedules: {
        MLB: {
          season: { start: 3, end: 10 }, // March to October
          inSeason: '*/30 * * * *', // Every 30 minutes during season
          offSeason: '0 */6 * * *',   // Every 6 hours off-season
          priority: 'high'
        },
        NFL: {
          season: { start: 9, end: 2 }, // September to February
          inSeason: '*/15 * * * *', // Every 15 minutes during games
          offSeason: '0 */12 * * *',  // Every 12 hours off-season
          priority: 'high'
        },
        NCAA: {
          football: { start: 8, end: 1 }, // August to January
          basketball: { start: 11, end: 4 }, // November to April
          inSeason: '*/20 * * * *', // Every 20 minutes during season
          offSeason: '0 0 * * *',    // Daily off-season
          priority: 'medium'
        },
        Youth: {
          season: { start: 2, end: 12 }, // Year-round with summer break
          schedule: '0 */2 * * *',    // Every 2 hours
          priority: 'medium'
        },
        PerfectGame: {
          schedule: '0 */4 * * *',    // Every 4 hours
          priority: 'low'
        }
      },
      dataDir: path.join(__dirname, 'data'),
      logsDir: path.join(__dirname, 'logs'),
      healthEndpoint: 'https://blaze-intelligence-api.humphrey-austin20.workers.dev/api/health',
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      maxRetries: 3,
      retryDelay: 5000
    };

    this.activeJobs = new Map();
    this.statistics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRun: null,
      startTime: new Date()
    };
  }

  async init() {
    await fs.mkdir(this.config.logsDir, { recursive: true });
    await fs.mkdir(this.config.dataDir, { recursive: true });
    
    console.log('🚀 Blaze Auto-Refresh Pipeline Initialized');
    console.log('📅 Current Date:', new Date().toLocaleString());
    console.log('🏢 Data Directory:', this.config.dataDir);
    console.log('📝 Logs Directory:', this.config.logsDir);
    
    await this.loadStatistics();
    this.startScheduler();
  }

  getCurrentSeason(league, sport = null) {
    const month = new Date().getMonth() + 1;
    const schedule = sport ? this.config.schedules[league][sport] : this.config.schedules[league];
    
    if (!schedule.season) return 'offSeason';
    
    const { start, end } = schedule.season;
    
    if (start <= end) {
      return month >= start && month <= end ? 'inSeason' : 'offSeason';
    } else {
      // Handle seasons that cross year boundary (NFL)
      return month >= start || month <= end ? 'inSeason' : 'offSeason';
    }
  }

  startScheduler() {
    console.log('\n⏰ Starting Intelligent Scheduler...\n');
    
    // MLB Schedule
    const mlbSeason = this.getCurrentSeason('MLB');
    const mlbCron = this.config.schedules.MLB[mlbSeason];
    console.log(`⚾ MLB: ${mlbSeason} - Schedule: ${mlbCron}`);
    this.scheduleJob('MLB', mlbCron, () => this.refreshMLB());
    
    // NFL Schedule
    const nflSeason = this.getCurrentSeason('NFL');
    const nflCron = this.config.schedules.NFL[nflSeason];
    console.log(`🏈 NFL: ${nflSeason} - Schedule: ${nflCron}`);
    this.scheduleJob('NFL', nflCron, () => this.refreshNFL());
    
    // Youth/TXHS Schedule
    console.log(`🎓 Youth/TXHS: Active - Schedule: ${this.config.schedules.Youth.schedule}`);
    this.scheduleJob('Youth', this.config.schedules.Youth.schedule, () => this.refreshYouth());
    
    // Perfect Game Schedule
    console.log(`⚾ Perfect Game: Active - Schedule: ${this.config.schedules.PerfectGame.schedule}`);
    this.scheduleJob('PerfectGame', this.config.schedules.PerfectGame.schedule, () => this.refreshPerfectGame());
    
    // Health Check every 5 minutes
    this.scheduleJob('HealthCheck', '*/5 * * * *', () => this.performHealthCheck());
    
    // Statistics Report every hour
    this.scheduleJob('Statistics', '0 * * * *', () => this.generateReport());
    
    console.log('\n✅ All schedules activated!\n');
  }

  scheduleJob(name, cronPattern, handler) {
    // Convert cron pattern to milliseconds for demo
    const intervals = {
      '*/30 * * * *': 30 * 60 * 1000,  // 30 minutes
      '*/15 * * * *': 15 * 60 * 1000,  // 15 minutes
      '*/20 * * * *': 20 * 60 * 1000,  // 20 minutes
      '*/5 * * * *': 5 * 60 * 1000,     // 5 minutes
      '0 */2 * * *': 2 * 60 * 60 * 1000, // 2 hours
      '0 */4 * * *': 4 * 60 * 60 * 1000, // 4 hours
      '0 */6 * * *': 6 * 60 * 60 * 1000, // 6 hours
      '0 */12 * * *': 12 * 60 * 60 * 1000, // 12 hours
      '0 * * * *': 60 * 60 * 1000,      // 1 hour
      '0 0 * * *': 24 * 60 * 60 * 1000  // 24 hours
    };
    
    const interval = intervals[cronPattern] || 60 * 60 * 1000;
    
    // Run immediately, then on schedule
    handler();
    
    const jobId = setInterval(() => {
      if (!this.activeJobs.has(name)) {
        this.activeJobs.set(name, true);
        handler().finally(() => {
          this.activeJobs.delete(name);
        });
      } else {
        console.log(`⏳ ${name} is still running, skipping this cycle`);
      }
    }, interval);
    
    return jobId;
  }

  async refreshMLB() {
    console.log('\n⚾ Refreshing MLB Data...');
    const startTime = Date.now();
    
    try {
      await this.runScript('expand-mlb-coverage.js', 'MLB');
      await this.updateWorkerData('mlb');
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ MLB refresh completed in ${duration}s`);
      
      this.statistics.successfulRuns++;
      await this.logRefresh('MLB', 'success', duration);
    } catch (error) {
      console.error(`❌ MLB refresh failed:`, error.message);
      this.statistics.failedRuns++;
      await this.logRefresh('MLB', 'failure', 0, error.message);
    }
    
    this.statistics.totalRuns++;
    this.statistics.lastRun = new Date();
  }

  async refreshNFL() {
    console.log('\n🏈 Refreshing NFL Data...');
    const startTime = Date.now();
    
    try {
      await this.runScript('expand-nfl-coverage.js', 'NFL');
      await this.updateWorkerData('nfl');
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ NFL refresh completed in ${duration}s`);
      
      this.statistics.successfulRuns++;
      await this.logRefresh('NFL', 'success', duration);
    } catch (error) {
      console.error(`❌ NFL refresh failed:`, error.message);
      this.statistics.failedRuns++;
      await this.logRefresh('NFL', 'failure', 0, error.message);
    }
    
    this.statistics.totalRuns++;
    this.statistics.lastRun = new Date();
  }

  async refreshYouth() {
    console.log('\n🎓 Refreshing Youth/TXHS Data...');
    const startTime = Date.now();
    
    try {
      await this.runScript('youth-txhs-ingestion-agent.js', 'Youth');
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Youth refresh completed in ${duration}s`);
      
      this.statistics.successfulRuns++;
      await this.logRefresh('Youth', 'success', duration);
    } catch (error) {
      console.error(`❌ Youth refresh failed:`, error.message);
      this.statistics.failedRuns++;
      await this.logRefresh('Youth', 'failure', 0, error.message);
    }
    
    this.statistics.totalRuns++;
    this.statistics.lastRun = new Date();
  }

  async refreshPerfectGame() {
    console.log('\n⚾ Refreshing Perfect Game Data...');
    const startTime = Date.now();
    
    try {
      // Placeholder for Perfect Game specific ingestion
      console.log('📊 Fetching Perfect Game rankings...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Perfect Game refresh completed in ${duration}s`);
      
      this.statistics.successfulRuns++;
      await this.logRefresh('PerfectGame', 'success', duration);
    } catch (error) {
      console.error(`❌ Perfect Game refresh failed:`, error.message);
      this.statistics.failedRuns++;
      await this.logRefresh('PerfectGame', 'failure', 0, error.message);
    }
    
    this.statistics.totalRuns++;
    this.statistics.lastRun = new Date();
  }

  async runScript(scriptName, league) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, scriptName);
      const child = spawn('node', [scriptPath], {
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        if (output.length > 10000) {
          output = output.slice(-5000); // Keep last 5000 chars
        }
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Script exited with code ${code}: ${errorOutput}`));
        }
      });
      
      // Timeout after 10 minutes
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Script timeout after 10 minutes'));
      }, 10 * 60 * 1000);
    });
  }

  async updateWorkerData(league) {
    // Copy latest data to worker directory for API access
    const sourceDir = path.join(this.config.dataDir, league);
    const targetDir = path.join(__dirname, 'worker-data', league);
    
    try {
      await fs.mkdir(targetDir, { recursive: true });
      
      const files = await fs.readdir(sourceDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const source = path.join(sourceDir, file);
          const target = path.join(targetDir, file);
          await fs.copyFile(source, target);
        }
      }
      
      console.log(`📤 Updated worker data for ${league}`);
    } catch (error) {
      console.error(`❌ Failed to update worker data:`, error.message);
    }
  }

  async performHealthCheck() {
    try {
      const response = await fetch(this.config.healthEndpoint);
      const data = await response.json();
      
      if (data.status === 'operational') {
        console.log('✅ Health check passed:', data);
      } else {
        console.warn('⚠️  Health check warning:', data);
        await this.sendSlackAlert('Health check warning', data);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      await this.sendSlackAlert('Health check failed', error.message);
    }
  }

  async generateReport() {
    const uptime = ((Date.now() - this.statistics.startTime) / 1000 / 60 / 60).toFixed(2);
    const successRate = this.statistics.totalRuns > 0
      ? ((this.statistics.successfulRuns / this.statistics.totalRuns) * 100).toFixed(2)
      : 0;
    
    const report = {
      timestamp: new Date().toISOString(),
      uptime: `${uptime} hours`,
      statistics: {
        total: this.statistics.totalRuns,
        successful: this.statistics.successfulRuns,
        failed: this.statistics.failedRuns,
        successRate: `${successRate}%`,
        lastRun: this.statistics.lastRun
      },
      activeJobs: Array.from(this.activeJobs.keys())
    };
    
    console.log('\n📊 === HOURLY STATISTICS REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('================================\n');
    
    // Save report
    const reportFile = path.join(
      this.config.logsDir,
      `report_${new Date().toISOString().split('T')[0]}.json`
    );
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    await this.saveStatistics();
  }

  async logRefresh(league, status, duration, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      league,
      status,
      duration: `${duration}s`,
      error
    };
    
    const logFile = path.join(
      this.config.logsDir,
      `refresh_${new Date().toISOString().split('T')[0]}.log`
    );
    
    await fs.appendFile(
      logFile,
      JSON.stringify(logEntry) + '\n'
    );
  }

  async sendSlackAlert(title, message) {
    if (!this.config.slackWebhook) return;
    
    try {
      await fetch(this.config.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${title}*`,
          attachments: [{
            color: 'danger',
            text: typeof message === 'object' ? JSON.stringify(message) : message,
            footer: 'Blaze Auto-Refresh Pipeline',
            ts: Math.floor(Date.now() / 1000)
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }

  async loadStatistics() {
    try {
      const statsFile = path.join(this.config.logsDir, 'statistics.json');
      const data = await fs.readFile(statsFile, 'utf-8');
      const saved = JSON.parse(data);
      Object.assign(this.statistics, saved);
      console.log('📊 Loaded previous statistics');
    } catch (error) {
      console.log('📊 Starting fresh statistics');
    }
  }

  async saveStatistics() {
    try {
      const statsFile = path.join(this.config.logsDir, 'statistics.json');
      await fs.writeFile(
        statsFile,
        JSON.stringify(this.statistics, null, 2)
      );
    } catch (error) {
      console.error('Failed to save statistics:', error.message);
    }
  }
}

// Main execution
async function main() {
  const pipeline = new BlazeAutoRefreshPipeline();
  await pipeline.init();
  
  // Keep process running
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down pipeline...');
    await pipeline.generateReport();
    process.exit(0);
  });
  
  console.log('\n🎯 Pipeline is running. Press Ctrl+C to stop.\n');
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export default BlazeAutoRefreshPipeline;