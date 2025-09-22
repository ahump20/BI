/**
 * Hardened Scoreboard UI Rendering
 * DOM helpers for safe data rendering with XSS protection
 */

class ScoreboardUIRenderer {
    constructor(options = {}) {
        this.container = options.container;
        this.enableLogging = options.enableLogging !== false;
        this.maxRetries = options.maxRetries || 3;
        this.loadingTimeout = options.loadingTimeout || 10000;
        
        // XSS protection patterns
        this.dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
            /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi
        ];
        
        this.setupErrorHandling();
        this.initializeContainer();
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled promise rejection:', event.reason);
        });
    }

    initializeContainer() {
        if (!this.container) {
            this.container = document.body;
        }

        if (typeof this.container === 'string') {
            this.container = document.querySelector(this.container);
        }

        if (!this.container) {
            throw new Error('Invalid container element');
        }
    }

    // Sanitize text content to prevent XSS
    sanitizeText(text) {
        if (typeof text !== 'string') {
            return String(text);
        }

        // Remove dangerous patterns
        let sanitized = text;
        this.dangerousPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });

        // HTML encode remaining content
        const tempDiv = document.createElement('div');
        tempDiv.textContent = sanitized;
        return tempDiv.innerHTML;
    }

    // Sanitize HTML content more strictly
    sanitizeHTML(html) {
        if (typeof html !== 'string') {
            return this.sanitizeText(html);
        }

        // Create a temporary element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Remove all script tags and dangerous elements
        const dangerousElements = tempDiv.querySelectorAll('script, iframe, object, embed, link[rel="stylesheet"]');
        dangerousElements.forEach(element => element.remove());

        // Remove all event handlers
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(element => {
            // Remove all on* attributes
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    element.removeAttribute(attr.name);
                }
            });

            // Remove href attributes with javascript:
            if (element.hasAttribute('href') && 
                element.getAttribute('href').toLowerCase().includes('javascript:')) {
                element.removeAttribute('href');
            }
        });

        return tempDiv.innerHTML;
    }

    // Create safe DOM element
    createElement(tagName, options = {}) {
        try {
            const element = document.createElement(tagName);
            
            // Set safe attributes
            if (options.className) {
                element.className = this.sanitizeText(options.className);
            }
            
            if (options.id) {
                element.id = this.sanitizeText(options.id);
            }
            
            if (options.textContent) {
                element.textContent = options.textContent;
            }
            
            if (options.innerHTML) {
                element.innerHTML = this.sanitizeHTML(options.innerHTML);
            }
            
            // Set data attributes safely
            if (options.data) {
                Object.keys(options.data).forEach(key => {
                    const safeKey = key.replace(/[^a-zA-Z0-9-]/g, '');
                    const safeValue = this.sanitizeText(options.data[key]);
                    element.setAttribute(`data-${safeKey}`, safeValue);
                });
            }
            
            return element;
            
        } catch (error) {
            this.logError('Error creating element:', error);
            return document.createElement('div'); // Fallback
        }
    }

    // Render scoreboard with loading states
    async renderScoreboard(gameData, retryCount = 0) {
        try {
            this.showLoadingState();
            
            // Validate game data
            const validatedData = this.validateGameData(gameData);
            
            // Clear container safely
            this.clearContainer();
            
            // Create scoreboard structure
            const scoreboard = this.createScoreboardStructure(validatedData);
            
            // Add to container
            this.container.appendChild(scoreboard);
            
            this.hideLoadingState();
            this.logInfo('Scoreboard rendered successfully');
            
        } catch (error) {
            this.logError('Error rendering scoreboard:', error);
            
            if (retryCount < this.maxRetries) {
                this.logInfo(`Retrying scoreboard render (${retryCount + 1}/${this.maxRetries})`);
                setTimeout(() => {
                    this.renderScoreboard(gameData, retryCount + 1);
                }, 1000 * (retryCount + 1));
            } else {
                this.showErrorState('Failed to load scoreboard after multiple attempts');
            }
        }
    }

    validateGameData(gameData) {
        const defaultData = {
            homeTeam: { name: 'Home', score: 0, logo: '' },
            awayTeam: { name: 'Away', score: 0, logo: '' },
            quarter: 1,
            timeRemaining: '15:00',
            status: 'scheduled'
        };

        if (!gameData || typeof gameData !== 'object') {
            this.logWarning('Invalid game data, using defaults');
            return defaultData;
        }

        // Validate and sanitize each field
        const validated = { ...defaultData };
        
        if (gameData.homeTeam && typeof gameData.homeTeam === 'object') {
            validated.homeTeam.name = this.sanitizeText(gameData.homeTeam.name || 'Home');
            validated.homeTeam.score = this.validateScore(gameData.homeTeam.score);
            validated.homeTeam.logo = this.sanitizeURL(gameData.homeTeam.logo);
        }
        
        if (gameData.awayTeam && typeof gameData.awayTeam === 'object') {
            validated.awayTeam.name = this.sanitizeText(gameData.awayTeam.name || 'Away');
            validated.awayTeam.score = this.validateScore(gameData.awayTeam.score);
            validated.awayTeam.logo = this.sanitizeURL(gameData.awayTeam.logo);
        }
        
        validated.quarter = this.validateQuarter(gameData.quarter);
        validated.timeRemaining = this.sanitizeText(gameData.timeRemaining || '15:00');
        validated.status = this.sanitizeText(gameData.status || 'scheduled');
        
        return validated;
    }

    validateScore(score) {
        const numScore = parseInt(score);
        return (isNaN(numScore) || numScore < 0) ? 0 : Math.min(numScore, 999);
    }

    validateQuarter(quarter) {
        const numQuarter = parseInt(quarter);
        return (isNaN(numQuarter) || numQuarter < 1) ? 1 : Math.min(numQuarter, 4);
    }

    sanitizeURL(url) {
        if (!url || typeof url !== 'string') return '';
        
        try {
            const urlObj = new URL(url);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return '';
            }
            return url;
        } catch {
            return '';
        }
    }

    createScoreboardStructure(gameData) {
        const scoreboard = this.createElement('div', {
            className: 'scoreboard-container',
            data: { gameId: gameData.gameId }
        });

        // Header with game status
        const header = this.createElement('div', {
            className: 'scoreboard-header',
            innerHTML: this.createHeaderHTML(gameData)
        });

        // Main score display
        const scoreDisplay = this.createElement('div', {
            className: 'score-display',
            innerHTML: this.createScoreHTML(gameData)
        });

        // Game details
        const details = this.createElement('div', {
            className: 'game-details',
            innerHTML: this.createDetailsHTML(gameData)
        });

        scoreboard.appendChild(header);
        scoreboard.appendChild(scoreDisplay);
        scoreboard.appendChild(details);

        return scoreboard;
    }

    createHeaderHTML(gameData) {
        return `
            <div class="status-indicator status-${gameData.status}">
                <span class="status-text">${gameData.status.toUpperCase()}</span>
                <span class="quarter-info">Q${gameData.quarter}</span>
                <span class="time-remaining">${gameData.timeRemaining}</span>
            </div>
        `;
    }

    createScoreHTML(gameData) {
        return `
            <div class="team-score away-team">
                <div class="team-logo">
                    ${gameData.awayTeam.logo ? `<img src="${gameData.awayTeam.logo}" alt="${gameData.awayTeam.name} logo" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="team-name">${gameData.awayTeam.name}</div>
                <div class="team-score-value">${gameData.awayTeam.score}</div>
            </div>
            <div class="score-separator">VS</div>
            <div class="team-score home-team">
                <div class="team-logo">
                    ${gameData.homeTeam.logo ? `<img src="${gameData.homeTeam.logo}" alt="${gameData.homeTeam.name} logo" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="team-name">${gameData.homeTeam.name}</div>
                <div class="team-score-value">${gameData.homeTeam.score}</div>
            </div>
        `;
    }

    createDetailsHTML(gameData) {
        const details = [];
        
        if (gameData.venue) {
            details.push(`<span class="venue">📍 ${this.sanitizeText(gameData.venue)}</span>`);
        }
        
        if (gameData.temperature) {
            details.push(`<span class="weather">🌡️ ${this.sanitizeText(gameData.temperature)}°F</span>`);
        }
        
        if (gameData.attendance) {
            details.push(`<span class="attendance">👥 ${this.sanitizeText(gameData.attendance)}</span>`);
        }
        
        return `<div class="details-row">${details.join(' • ')}</div>`;
    }

    // Loading state management
    showLoadingState() {
        this.clearContainer();
        
        const loadingElement = this.createElement('div', {
            className: 'scoreboard-loading',
            innerHTML: `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading scoreboard...</div>
            `
        });
        
        this.container.appendChild(loadingElement);
        
        // Timeout for loading state
        this.loadingTimer = setTimeout(() => {
            this.showErrorState('Loading timeout - please try again');
        }, this.loadingTimeout);
    }

    hideLoadingState() {
        if (this.loadingTimer) {
            clearTimeout(this.loadingTimer);
            this.loadingTimer = null;
        }
        
        const loadingElement = this.container.querySelector('.scoreboard-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showErrorState(message) {
        this.clearContainer();
        
        const errorElement = this.createElement('div', {
            className: 'scoreboard-error',
            innerHTML: `
                <div class="error-icon">⚠️</div>
                <div class="error-message">${this.sanitizeText(message)}</div>
                <button class="retry-button" onclick="location.reload()">Retry</button>
            `
        });
        
        this.container.appendChild(errorElement);
    }

    clearContainer() {
        if (this.container) {
            // Safely remove all children
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
    }

    // Update scoreboard data dynamically
    updateScore(teamType, newScore) {
        try {
            const scoreElement = this.container.querySelector(`.${teamType}-team .team-score-value`);
            if (scoreElement) {
                const validatedScore = this.validateScore(newScore);
                scoreElement.textContent = validatedScore;
                
                // Add update animation
                scoreElement.classList.add('score-updated');
                setTimeout(() => {
                    scoreElement.classList.remove('score-updated');
                }, 1000);
            }
        } catch (error) {
            this.logError('Error updating score:', error);
        }
    }

    updateTime(quarter, timeRemaining) {
        try {
            const quarterElement = this.container.querySelector('.quarter-info');
            const timeElement = this.container.querySelector('.time-remaining');
            
            if (quarterElement) {
                quarterElement.textContent = `Q${this.validateQuarter(quarter)}`;
            }
            
            if (timeElement) {
                timeElement.textContent = this.sanitizeText(timeRemaining);
            }
        } catch (error) {
            this.logError('Error updating time:', error);
        }
    }

    updateStatus(newStatus) {
        try {
            const statusElement = this.container.querySelector('.status-text');
            const indicator = this.container.querySelector('.status-indicator');
            
            if (statusElement && indicator) {
                const sanitizedStatus = this.sanitizeText(newStatus);
                statusElement.textContent = sanitizedStatus.toUpperCase();
                
                // Update status class
                indicator.className = `status-indicator status-${sanitizedStatus}`;
            }
        } catch (error) {
            this.logError('Error updating status:', error);
        }
    }

    // Utility methods
    logInfo(message) {
        if (this.enableLogging) {
            console.log(`[ScoreboardUI] ${message}`);
        }
    }

    logWarning(message) {
        if (this.enableLogging) {
            console.warn(`[ScoreboardUI] ${message}`);
        }
    }

    logError(message, error) {
        if (this.enableLogging) {
            console.error(`[ScoreboardUI] ${message}`, error);
        }
    }

    // Cleanup method
    destroy() {
        if (this.loadingTimer) {
            clearTimeout(this.loadingTimer);
        }
        
        this.clearContainer();
        this.logInfo('ScoreboardUI destroyed');
    }
}

// CSS styles for the scoreboard (should be loaded separately)
const scoreboardStyles = `
.scoreboard-container {
    max-width: 600px;
    margin: 0 auto;
    background: linear-gradient(135deg, #000 0%, #1a1a2e 100%);
    border-radius: 15px;
    padding: 20px;
    color: white;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.scoreboard-header {
    text-align: center;
    margin-bottom: 20px;
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 15px;
    padding: 10px 20px;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.status-live {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid #10B981;
}

.status-final {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid #EF4444;
}

.score-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.team-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.team-logo img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
}

.team-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 10px 0;
}

.team-score-value {
    font-size: 3rem;
    font-weight: 900;
    color: #FFD700;
}

.score-separator {
    font-size: 1.5rem;
    font-weight: 600;
    color: #9BCBEB;
}

.game-details {
    text-align: center;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.details-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.scoreboard-loading {
    text-align: center;
    padding: 40px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 215, 0, 0.2);
    border-top: 4px solid #FFD700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.scoreboard-error {
    text-align: center;
    padding: 40px;
    color: #EF4444;
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.retry-button {
    background: #FFD700;
    color: #000;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
}

.score-updated {
    animation: scoreUpdate 1s ease-in-out;
}

@keyframes scoreUpdate {
    0% { transform: scale(1); color: #FFD700; }
    50% { transform: scale(1.2); color: #00E5FF; }
    100% { transform: scale(1); color: #FFD700; }
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = scoreboardStyles;
    document.head.appendChild(styleElement);
}

// Export for use in other modules
export default ScoreboardUIRenderer;

// Global initialization for browser environments
if (typeof window !== 'undefined') {
    window.ScoreboardUIRenderer = ScoreboardUIRenderer;
    console.log('🛡️ Hardened Scoreboard UI Renderer loaded');
}