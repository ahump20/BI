#!/usr/bin/env node

/**
 * Blaze Intelligence Daily Sports Data Updater
 * ============================================
 * Automated agent system that updates all sports data daily
 * for blazesportsintel.com
 *
 * Author: Austin Humphrey / Blaze Intelligence
 * Last Updated: September 24, 2025
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    updateTime: '03:00', // 3 AM CT daily update
    dataSourcesP {
        mlb: {
            standings: 'https://statsapi.mlb.com/api/v1/standings',
            teams: 'https://statsapi.mlb.com/api/v1/teams',
            cardinals: 'https://statsapi.mlb.com/api/v1/teams/138'
        },
        nfl: {
            standings: 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
            titans: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/10'
        },
        ncaa: {
            rankings: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings',
            texas: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/251'
        },
        perfectGame: {
            tournaments: 'https://www.perfectgame.org/Schedule/GroupedEvents.aspx?gid=18175',
            texas: 'https://www.perfectgame.org/Schedule/FeaturedGroups.aspx?PrtID=270'
        },
        texasHS: {
            rankings: 'https://www.texasfootball.com/rankings/',
            daveCampbell: 'https://www.texasfootball.com/api/rankings/6a'
        }
    },
    outputPath: path.join(__dirname, 'data', 'live'),
    logPath: path.join(__dirname, 'logs', 'daily-updates.log')
};

// Logger utility
class Logger {
    constructor(logPath) {
        this.logPath = logPath;
        this.ensureLogDir();
    }

    ensureLogDir() {
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(this.logPath, logLine);

        // Also log to console
        console.log(`[${timestamp}] [${level}] ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }

    info(message, data) { this.log('INFO', message, data); }
    warn(message, data) { this.log('WARN', message, data); }
    error(message, data) { this.log('ERROR', message, data); }
    success(message, data) { this.log('SUCCESS', message, data); }
}

// Data Fetcher
class DataFetcher {
    constructor(logger) {
        this.logger = logger;
    }

    async fetchWithRetry(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return await response.json();
                }
                this.logger.warn(`HTTP ${response.status} for ${url}, attempt ${i + 1}`);
            } catch (error) {
                this.logger.error(`Fetch error for ${url}, attempt ${i + 1}`, error.message);
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
            }
        }
    }

    async fetchMLBData() {
        this.logger.info('Fetching MLB data...');
        try {
            const standings = await this.fetchWithRetry(CONFIG.dataSources.mlb.standings);
            const cardinals = await this.fetchWithRetry(CONFIG.dataSources.mlb.cardinals);
            return { standings, cardinals, timestamp: new Date().toISOString() };
        } catch (error) {
            this.logger.error('Failed to fetch MLB data', error);
            return null;
        }
    }

    async fetchNFLData() {
        this.logger.info('Fetching NFL data...');
        try {
            const standings = await this.fetchWithRetry(CONFIG.dataSources.nfl.standings);
            const titans = await this.fetchWithRetry(CONFIG.dataSources.nfl.titans);
            return { standings, titans, timestamp: new Date().toISOString() };
        } catch (error) {
            this.logger.error('Failed to fetch NFL data', error);
            return null;
        }
    }

    async fetchNCAAData() {
        this.logger.info('Fetching NCAA data...');
        try {
            const rankings = await this.fetchWithRetry(CONFIG.dataSources.ncaa.rankings);
            const texas = await this.fetchWithRetry(CONFIG.dataSources.ncaa.texas);
            return { rankings, texas, timestamp: new Date().toISOString() };
        } catch (error) {
            this.logger.error('Failed to fetch NCAA data', error);
            return null;
        }
    }
}

// HTML Updater
class HTMLUpdater {
    constructor(logger) {
        this.logger = logger;
        this.htmlPath = path.join(__dirname, 'index.html');
    }

    updateTeamStats(html, teamData) {
        this.logger.info('Updating team statistics in HTML...');

        // Update Cardinals stats
        if (teamData.mlb?.cardinals) {
            const { wins, losses } = teamData.mlb.cardinals;
            const record = `${wins}-${losses}`;
            html = html.replace(
                /<div style="color: white; font-size: 32px; font-weight: bold; margin: 10px 0;">[\d]+-[\d]+<\/div>(\s*<div[^>]*>.*?Cardinals.*?<\/div>)?/,
                `<div style="color: white; font-size: 32px; font-weight: bold; margin: 10px 0;">${record}</div>`
            );
        }

        // Update Titans stats
        if (teamData.nfl?.titans) {
            const { wins, losses } = teamData.nfl.titans;
            const record = `${wins}-${losses}`;
            html = html.replace(
                /<div style="color: white; font-size: 32px; font-weight: bold; margin: 10px 0;">[\d]+-[\d]+<\/div>(\s*<div[^>]*>.*?Titans.*?<\/div>)?/,
                `<div style="color: white; font-size: 32px; font-weight: bold; margin: 10px 0;">${record}</div>`
            );
        }

        // Update timestamp
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
            timeZone: 'America/Chicago'
        });

        html = html.replace(
            /Last Updated: .*? • Verified Data Sources:/,
            `Last Updated: ${timestamp} • Verified Data Sources:`
        );

        return html;
    }

    async updateHTML(data) {
        try {
            let html = fs.readFileSync(this.htmlPath, 'utf-8');
            html = this.updateTeamStats(html, data);
            fs.writeFileSync(this.htmlPath, html);
            this.logger.success('HTML updated successfully');
            return true;
        } catch (error) {
            this.logger.error('Failed to update HTML', error);
            return false;
        }
    }
}

// Main Data Update Orchestrator
class DailyDataUpdater {
    constructor() {
        this.logger = new Logger(CONFIG.logPath);
        this.fetcher = new DataFetcher(this.logger);
        this.updater = new HTMLUpdater(this.logger);
    }

    async saveDataToFile(data, filename) {
        const outputDir = CONFIG.outputPath;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        this.logger.info(`Data saved to ${filepath}`);
    }

    async runUpdate() {
        this.logger.info('='.repeat(60));
        this.logger.info('Starting Blaze Intelligence Daily Data Update');
        this.logger.info('='.repeat(60));

        const startTime = Date.now();
        const results = {
            mlb: null,
            nfl: null,
            ncaa: null,
            success: false,
            duration: 0
        };

        try {
            // Fetch all data in parallel
            const [mlbData, nflData, ncaaData] = await Promise.all([
                this.fetcher.fetchMLBData(),
                this.fetcher.fetchNFLData(),
                this.fetcher.fetchNCAAData()
            ]);

            results.mlb = mlbData;
            results.nfl = nflData;
            results.ncaa = ncaaData;

            // Save data to files
            if (mlbData) await this.saveDataToFile(mlbData, 'mlb-latest.json');
            if (nflData) await this.saveDataToFile(nflData, 'nfl-latest.json');
            if (ncaaData) await this.saveDataToFile(ncaaData, 'ncaa-latest.json');

            // Update HTML
            const htmlUpdated = await this.updater.updateHTML(results);

            results.success = htmlUpdated;
            results.duration = Date.now() - startTime;

            // Save summary
            await this.saveDataToFile(results, 'update-summary.json');

            this.logger.success(`Update completed in ${results.duration}ms`, {
                mlb: !!mlbData,
                nfl: !!nflData,
                ncaa: !!ncaaData,
                htmlUpdated
            });

            // Deploy if successful
            if (htmlUpdated) {
                await this.deployUpdates();
            }

        } catch (error) {
            this.logger.error('Update failed', error);
            results.error = error.message;
        }

        return results;
    }

    async deployUpdates() {
        this.logger.info('Deploying updates to blazesportsintel.com...');

        try {
            // Git commit changes
            const { execSync } = await import('child_process');
            execSync('git add -A', { cwd: __dirname });
            execSync(`git commit -m "🤖 Daily data update - ${new Date().toISOString()}"`, { cwd: __dirname });

            // Deploy to Netlify
            execSync('netlify deploy --prod', { cwd: __dirname });

            this.logger.success('Deployment successful');
        } catch (error) {
            this.logger.warn('Deployment skipped or failed', error.message);
        }
    }

    scheduleDaily() {
        const [hour, minute] = CONFIG.updateTime.split(':').map(Number);

        const scheduleNext = () => {
            const now = new Date();
            const scheduled = new Date();
            scheduled.setHours(hour, minute, 0, 0);

            if (scheduled <= now) {
                scheduled.setDate(scheduled.getDate() + 1);
            }

            const delay = scheduled - now;
            this.logger.info(`Next update scheduled for ${scheduled.toLocaleString()}`);

            setTimeout(async () => {
                await this.runUpdate();
                scheduleNext(); // Schedule next run
            }, delay);
        };

        scheduleNext();
    }
}

// Main execution
async function main() {
    const updater = new DailyDataUpdater();

    // Check for command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--now')) {
        // Run update immediately
        await updater.runUpdate();
    } else if (args.includes('--schedule')) {
        // Schedule daily updates
        updater.scheduleDaily();
        console.log('Daily updater scheduled. Press Ctrl+C to stop.');
    } else {
        console.log(`
Blaze Intelligence Daily Sports Data Updater
============================================

Usage:
  node daily-sports-data-updater.js --now       Run update immediately
  node daily-sports-data-updater.js --schedule  Schedule daily updates at ${CONFIG.updateTime} CT

Configuration:
  Update Time: ${CONFIG.updateTime} CT
  Output Path: ${CONFIG.outputPath}
  Log Path: ${CONFIG.logPath}
        `);
    }
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run main
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { DailyDataUpdater, DataFetcher, HTMLUpdater, Logger };