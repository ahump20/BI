/**
 * UI Helpers for Safe Data Rendering
 * PR #50: Harden scoreboard UI rendering
 * DOM helpers, XSS protection, loading/error states
 */

import { SecurityUtils } from './security-utils.js';

export class UIHelpers {
    static sanitizeText(text) {
        return SecurityUtils.sanitizeText(text);
    }
    
    static sanitizeHTML(html) {
        return SecurityUtils.sanitizeHTML(html);
    }
    
    static validateGameData(data) {
        return SecurityUtils.validateGameData(data);
    }
    
    static checkDangerousPatterns(input) {
        // Check for dangerous patterns that could indicate XSS attempts
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];
        
        return SecurityUtils.checkDangerousPatterns(input) || 
               dangerousPatterns.some(pattern => pattern.test(input));
    }
    
    static removeAttribute(element, attribute) {
        return SecurityUtils.removeAttribute(element, attribute);
    }
    
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes safely
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'innerHTML') {
                element.innerHTML = SecurityUtils.escapeHtml(value);
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, SecurityUtils.sanitize(value));
            }
        }
        
        // Set content safely
        if (content) {
            element.textContent = content;
        }
        
        return element;
    }
    
    static renderScoreboard(container, scoreboardData) {
        if (!container || !scoreboardData) {
            this.showError(container, 'Invalid scoreboard data');
            return;
        }
        
        try {
            // Show loading state
            this.showLoading(container);
            
            // Sanitize data
            const sanitizedData = SecurityUtils.preventXSS(scoreboardData);
            
            // Create scoreboard elements
            const scoreboardHTML = this.buildScoreboardHTML(sanitizedData);
            
            // Clear loading and render
            container.innerHTML = '';
            container.appendChild(scoreboardHTML);
            
        } catch (error) {
            console.error('Error rendering scoreboard:', error);
            this.showError(container, 'Failed to render scoreboard');
        }
    }
    
    static buildScoreboardHTML(data) {
        const scoreboard = this.createElement('div', {
            class: 'scoreboard',
            'data-game-id': data.gameId
        });
        
        // Header
        const header = this.createElement('div', { class: 'scoreboard-header' });
        const title = this.createElement('h2', {}, `${data.teams.away.name} vs ${data.teams.home.name}`);
        header.appendChild(title);
        
        // Score display
        const scoreContainer = this.createElement('div', { class: 'score-container' });
        
        // Away team
        const awayTeam = this.createElement('div', { class: 'team away' });
        awayTeam.appendChild(this.createElement('div', { class: 'team-name' }, data.teams.away.name));
        awayTeam.appendChild(this.createElement('div', { class: 'team-score' }, data.teams.away.score.toString()));
        awayTeam.appendChild(this.createElement('div', { class: 'team-record' }, data.teams.away.record));
        
        // Home team
        const homeTeam = this.createElement('div', { class: 'team home' });
        homeTeam.appendChild(this.createElement('div', { class: 'team-name' }, data.teams.home.name));
        homeTeam.appendChild(this.createElement('div', { class: 'team-score' }, data.teams.home.score.toString()));
        homeTeam.appendChild(this.createElement('div', { class: 'team-record' }, data.teams.home.record));
        
        scoreContainer.appendChild(awayTeam);
        scoreContainer.appendChild(homeTeam);
        
        // Game info
        const gameInfo = this.createElement('div', { class: 'game-info' });
        gameInfo.appendChild(this.createElement('div', { class: 'inning' }, `Inning: ${data.inning}`));
        gameInfo.appendChild(this.createElement('div', { class: 'status' }, data.status));
        gameInfo.appendChild(this.createElement('div', { class: 'last-updated' }, `Updated: ${new Date(data.lastUpdated).toLocaleTimeString()}`));
        
        // Assemble scoreboard
        scoreboard.appendChild(header);
        scoreboard.appendChild(scoreContainer);
        scoreboard.appendChild(gameInfo);
        
        return scoreboard;
    }
    
    static showLoading(container, message = 'Loading...') {
        if (!container) return;
        
        const loader = this.createElement('div', { class: 'loading-state' });
        const spinner = this.createElement('div', { class: 'spinner' });
        const text = this.createElement('div', { class: 'loading-text' }, message);
        
        loader.appendChild(spinner);
        loader.appendChild(text);
        
        container.innerHTML = '';
        container.appendChild(loader);
    }
    
    static showLoadingState(container, message = 'Loading...') {
        return this.showLoading(container, message);
    }
    
    static hideLoadingState(container) {
        if (!container) return;
        
        const loadingElements = container.querySelectorAll('.loading-state');
        loadingElements.forEach(element => element.remove());
    }
    
    static setLoadingTimeout(container, timeout = 30000) {
        setTimeout(() => {
            if (container && container.querySelector('.loading-state')) {
                this.showError(container, 'Loading timeout - please try again');
            }
        }, timeout);
    }
    
    static get loadingTimeout() {
        return 30000; // 30 seconds default
    }
    
    static showError(container, message = 'An error occurred') {
        if (!container) return;
        
        const errorDiv = this.createElement('div', { class: 'error-state' });
        const icon = this.createElement('div', { class: 'error-icon' }, '⚠️');
        const text = this.createElement('div', { class: 'error-message' }, SecurityUtils.escapeHtml(message));
        const retry = this.createElement('button', { 
            class: 'retry-button',
            onclick: 'window.location.reload()'
        }, 'Retry');
        
        errorDiv.appendChild(icon);
        errorDiv.appendChild(text);
        errorDiv.appendChild(retry);
        
        container.innerHTML = '';
        container.appendChild(errorDiv);
    }
    
    static renderTeamStats(container, teamData) {
        if (!container || !teamData) {
            this.showError(container, 'Invalid team data');
            return;
        }
        
        try {
            this.showLoading(container, 'Loading team stats...');
            
            const sanitizedData = SecurityUtils.preventXSS(teamData);
            const statsHTML = this.buildTeamStatsHTML(sanitizedData);
            
            container.innerHTML = '';
            container.appendChild(statsHTML);
            
        } catch (error) {
            console.error('Error rendering team stats:', error);
            this.showError(container, 'Failed to load team stats');
        }
    }
    
    static buildTeamStatsHTML(data) {
        const container = this.createElement('div', { class: 'team-stats' });
        
        const header = this.createElement('h3', {}, `${data.teamId} Statistics`);
        container.appendChild(header);
        
        const statsGrid = this.createElement('div', { class: 'stats-grid' });
        
        for (const [stat, value] of Object.entries(data.stats)) {
            const statItem = this.createElement('div', { class: 'stat-item' });
            statItem.appendChild(this.createElement('div', { class: 'stat-label' }, this.formatStatLabel(stat)));
            statItem.appendChild(this.createElement('div', { class: 'stat-value' }, value.toString()));
            statsGrid.appendChild(statItem);
        }
        
        container.appendChild(statsGrid);
        return container;
    }
    
    static formatStatLabel(stat) {
        // Convert camelCase to Title Case
        return stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    static renderLiveScores(container, scoresData) {
        if (!container || !scoresData) {
            this.showError(container, 'Invalid scores data');
            return;
        }
        
        try {
            this.showLoading(container, 'Loading live scores...');
            
            const sanitizedData = SecurityUtils.preventXSS(scoresData);
            const scoresHTML = this.buildLiveScoresHTML(sanitizedData);
            
            container.innerHTML = '';
            container.appendChild(scoresHTML);
            
        } catch (error) {
            console.error('Error rendering live scores:', error);
            this.showError(container, 'Failed to load live scores');
        }
    }
    
    static buildLiveScoresHTML(data) {
        const container = this.createElement('div', { class: 'live-scores' });
        
        const header = this.createElement('h3', {}, 'Live Scores');
        const lastUpdated = this.createElement('div', { class: 'last-updated' }, 
            `Last updated: ${new Date(data.lastUpdated).toLocaleTimeString()}`);
        
        container.appendChild(header);
        container.appendChild(lastUpdated);
        
        const scoresGrid = this.createElement('div', { class: 'scores-grid' });
        
        data.liveScores.forEach(game => {
            const gameCard = this.createElement('div', { 
                class: 'game-card',
                'data-game-id': game.gameId
            });
            
            const teams = this.createElement('div', { class: 'game-teams' });
            teams.appendChild(this.createElement('span', { class: 'away-team' }, game.teams.away));
            teams.appendChild(this.createElement('span', { class: 'vs' }, ' vs '));
            teams.appendChild(this.createElement('span', { class: 'home-team' }, game.teams.home));
            
            const score = this.createElement('div', { class: 'game-score' });
            score.appendChild(this.createElement('span', { class: 'away-score' }, game.score.away.toString()));
            score.appendChild(this.createElement('span', { class: 'score-separator' }, ' - '));
            score.appendChild(this.createElement('span', { class: 'home-score' }, game.score.home.toString()));
            
            const status = this.createElement('div', { 
                class: `game-status ${game.status.toLowerCase().replace(' ', '-')}`
            }, game.status);
            
            gameCard.appendChild(teams);
            gameCard.appendChild(score);
            gameCard.appendChild(status);
            
            scoresGrid.appendChild(gameCard);
        });
        
        container.appendChild(scoresGrid);
        return container;
    }
    
    static addStyles() {
        const styles = `
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                text-align: center;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .error-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                text-align: center;
                color: #e74c3c;
            }
            
            .error-icon {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            
            .error-message {
                margin-bottom: 1rem;
            }
            
            .retry-button {
                background: #3498db;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .retry-button:hover {
                background: #2980b9;
            }
            
            .scoreboard {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 1rem;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .score-container {
                display: flex;
                justify-content: space-around;
                margin: 1rem 0;
            }
            
            .team {
                text-align: center;
                padding: 1rem;
            }
            
            .team-name {
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            
            .team-score {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            
            .game-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.9rem;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 0.5rem;
            }
            
            .stats-grid, .scores-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .stat-item, .game-card {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 1rem;
                text-align: center;
            }
            
            .stat-label {
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            
            .stat-value {
                font-size: 1.2rem;
                color: #3498db;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Auto-add styles when loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UIHelpers.addStyles());
    } else {
        UIHelpers.addStyles();
    }
}

export default UIHelpers;