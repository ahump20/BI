// Real-Time Narrative Generation Engine
// Pressure-Aware Storytelling & Historical Context Integration

class NarrativeGenerationEngine {
    constructor() {
        this.narrativeState = {
            currentStory: '',
            pressure: 0.5,
            momentum: 0.0,
            context: 'pregame',
            keyMoments: [],
            historicalContext: []
        };

        this.templates = {
            pressure: {
                low: [
                    "The calm before the storm builds as {team} methodically works their system.",
                    "With the pressure off, {player} finds their rhythm in this crucial moment.",
                    "The veteran leadership of {team} shows as they control the tempo."
                ],
                medium: [
                    "You can feel the tension rising as {team} faces a defining moment.",
                    "The crowd senses something special brewing as {player} steps up.",
                    "Championship moments are made in pressure like this - {team} knows it."
                ],
                high: [
                    "This is what separates champions from contenders - {team} under maximum pressure.",
                    "The atmosphere is electric as {player} carries the weight of expectations.",
                    "Legacy-defining moments don't come bigger than this for {team}."
                ],
                critical: [
                    "The entire season comes down to this moment for {team}.",
                    "Championship dreams hang in the balance as {player} faces destiny.",
                    "This is the stuff of Texas football legend - {team} with everything on the line."
                ]
            },
            momentum: {
                building: [
                    "{team} can feel the shift - momentum is swinging their way.",
                    "The tide is turning as {player} makes the play that changes everything.",
                    "You can see the confidence building in every step {team} takes."
                ],
                peak: [
                    "{team} is in that zone where everything clicks and magic happens.",
                    "This is {player} at their absolute best - pure athletic poetry.",
                    "When {team} gets rolling like this, they're nearly unstoppable."
                ],
                shifting: [
                    "The momentum is about to flip - {team} needs to respond now.",
                    "You can feel the energy changing as {player} steps into the spotlight.",
                    "Championship teams find a way to weather storms like this - will {team}?"
                ]
            },
            historical: {
                legacy: [
                    "This echoes the great {year} championship run when {historical_team} faced similar odds.",
                    "Like the legendary {historical_player} before them, {player} carries the torch.",
                    "The ghosts of {venue} have seen moments like this define dynasties."
                ],
                rivalry: [
                    "The rivalry between {team1} and {team2} has produced moments exactly like this.",
                    "For decades, this matchup has been decided by players willing to step up like {player}.",
                    "The tradition and pride of {conference} football is on full display."
                ],
                milestone: [
                    "If {player} delivers here, they join the exclusive company of {achievement} legends.",
                    "This performance puts {team} in rare air with the all-time greats.",
                    "The record books are watching as {player} chases history."
                ]
            }
        };

        this.teams = {
            'Cardinals': {
                location: 'St. Louis',
                colors: ['#C41E3A', '#000000'],
                traditions: ['Rally Cap Magic', 'October Champions'],
                legends: ['Stan Musial', 'Bob Gibson', 'Albert Pujols'],
                venue: 'Busch Stadium'
            },
            'Titans': {
                location: 'Tennessee',
                colors: ['#4B92DB', '#002244'],
                traditions: ['Titan Up', 'Music City Miracles'],
                legends: ['Warren Moon', 'Eddie George', 'Steve McNair'],
                venue: 'Nissan Stadium'
            },
            'Longhorns': {
                location: 'Texas',
                colors: ['#BF5700', '#FFFFFF'],
                traditions: ['Hook \'em Horns', 'Eyes of Texas'],
                legends: ['Earl Campbell', 'Ricky Williams', 'Vince Young'],
                venue: 'Darrell K Royal Stadium'
            },
            'Grizzlies': {
                location: 'Memphis',
                colors: ['#5D76A9', '#12173F'],
                traditions: ['Grit and Grind', 'Grindhouse Defense'],
                legends: ['Marc Gasol', 'Mike Conley', 'Zach Randolph'],
                venue: 'FedExForum'
            }
        };

        this.isActive = false;
        this.updateInterval = null;
    }

    async initialize() {
        if (this.isActive) return;

        try {
            this.createNarrativeInterface();
            this.startRealTimeUpdates();
            this.bindEventListeners();
            this.isActive = true;

            console.log('📖 Real-Time Narrative Engine Activated');
        } catch (error) {
            console.error('Narrative Engine Error:', error);
        }
    }

    createNarrativeInterface() {
        const container = this.findOrCreateContainer();

        container.innerHTML = `
            <div class="narrative-engine-panel">
                <div class="panel-header">
                    <h3 class="narrative-title">
                        <i class="fas fa-feather-alt"></i>
                        Real-Time Narrative Engine
                    </h3>
                    <div class="narrative-controls">
                        <button class="control-btn" id="generate-story">
                            <i class="fas fa-magic"></i> Generate Story
                        </button>
                        <button class="control-btn" id="toggle-auto">
                            <i class="fas fa-play"></i> Auto Mode
                        </button>
                    </div>
                </div>

                <div class="story-display">
                    <div class="current-narrative" id="current-narrative">
                        <div class="narrative-text">
                            Welcome to the Deep South Sports Authority. Our AI storyteller is ready to craft
                            championship narratives from real-time data and historical context.
                        </div>
                        <div class="narrative-metadata">
                            <span class="pressure-indicator">Pressure: <span id="pressure-level">Medium</span></span>
                            <span class="momentum-indicator">Momentum: <span id="momentum-level">Building</span></span>
                            <span class="context-indicator">Context: <span id="context-level">Live</span></span>
                        </div>
                    </div>
                </div>

                <div class="narrative-controls-panel">
                    <div class="control-group">
                        <label>Story Pressure</label>
                        <div class="slider-container">
                            <input type="range" id="pressure-slider" min="0" max="100" value="50" class="narrative-slider">
                            <span class="slider-value" id="pressure-value">50%</span>
                        </div>
                    </div>

                    <div class="control-group">
                        <label>Team Selection</label>
                        <select id="team-selector" class="narrative-select">
                            <option value="Cardinals">St. Louis Cardinals</option>
                            <option value="Titans">Tennessee Titans</option>
                            <option value="Longhorns">Texas Longhorns</option>
                            <option value="Grizzlies">Memphis Grizzlies</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <label>Narrative Context</label>
                        <select id="context-selector" class="narrative-select">
                            <option value="pregame">Pre-Game Buildup</option>
                            <option value="live">Live Action</option>
                            <option value="clutch">Clutch Moments</option>
                            <option value="postgame">Post-Game Analysis</option>
                            <option value="historical">Historical Context</option>
                        </select>
                    </div>
                </div>

                <div class="key-moments-section">
                    <h4>Key Moments</h4>
                    <div class="moments-timeline" id="moments-timeline">
                        <!-- Dynamic moments will be populated here -->
                    </div>
                </div>

                <div class="historical-context-section">
                    <h4>Historical Context</h4>
                    <div class="context-cards" id="context-cards">
                        <!-- Dynamic historical context will be populated here -->
                    </div>
                </div>
            </div>

            <style>
                .narrative-engine-panel {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    border-radius: 16px;
                    padding: 30px;
                    margin: 20px 0;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(191, 87, 0, 0.2);
                    padding-bottom: 15px;
                }

                .narrative-title {
                    color: #BF5700;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .narrative-controls {
                    display: flex;
                    gap: 10px;
                }

                .control-btn {
                    background: linear-gradient(135deg, #BF5700, #E67E22);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .control-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(191, 87, 0, 0.4);
                }

                .story-display {
                    margin-bottom: 30px;
                }

                .current-narrative {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 25px;
                    position: relative;
                    overflow: hidden;
                }

                .current-narrative::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #BF5700, #9BCBEB);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }

                .narrative-text {
                    color: #E2E8F0;
                    font-size: 18px;
                    line-height: 1.8;
                    margin-bottom: 20px;
                    font-style: italic;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                }

                .narrative-metadata {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                }

                .pressure-indicator, .momentum-indicator, .context-indicator {
                    background: rgba(191, 87, 0, 0.2);
                    border: 1px solid rgba(191, 87, 0, 0.4);
                    padding: 6px 12px;
                    border-radius: 6px;
                    color: #BF5700;
                }

                .narrative-controls-panel {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }

                .control-group label {
                    display: block;
                    color: #E2E8F0;
                    font-weight: 600;
                    margin-bottom: 10px;
                    font-size: 14px;
                }

                .slider-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .narrative-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    background: linear-gradient(to right, #4F46E5, #BF5700, #EF4444);
                    border-radius: 3px;
                    outline: none;
                }

                .narrative-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #BF5700;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(191, 87, 0, 0.5);
                }

                .narrative-select {
                    width: 100%;
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    color: #E2E8F0;
                    padding: 12px 15px;
                    border-radius: 8px;
                    outline: none;
                    cursor: pointer;
                }

                .narrative-select option {
                    background: #1E293B;
                    color: #E2E8F0;
                }

                .slider-value {
                    color: #9BCBEB;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 700;
                    min-width: 45px;
                    text-align: right;
                }

                .key-moments-section h4, .historical-context-section h4 {
                    color: #BF5700;
                    margin: 0 0 20px 0;
                    font-size: 18px;
                    border-bottom: 1px solid rgba(191, 87, 0, 0.3);
                    padding-bottom: 10px;
                }

                .moments-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .moment-item {
                    background: rgba(155, 203, 235, 0.1);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    position: relative;
                    transition: transform 0.3s ease;
                }

                .moment-item:hover {
                    transform: translateX(5px);
                }

                .moment-item::before {
                    content: '';
                    position: absolute;
                    left: -1px;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: #9BCBEB;
                }

                .moment-time {
                    color: #9BCBEB;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    margin-bottom: 5px;
                }

                .moment-text {
                    color: #E2E8F0;
                    line-height: 1.6;
                }

                .context-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }

                .context-card {
                    background: rgba(0, 34, 68, 0.6);
                    border: 1px solid rgba(155, 203, 235, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .context-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(155, 203, 235, 0.2);
                }

                .context-card h5 {
                    color: #9BCBEB;
                    margin: 0 0 15px 0;
                    font-size: 16px;
                }

                .context-card p {
                    color: #E2E8F0;
                    margin: 0;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .narrative-controls-panel {
                        grid-template-columns: 1fr;
                    }
                    .panel-header {
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }
                    .narrative-controls {
                        flex-wrap: wrap;
                    }
                }
            </style>
        `;
    }

    findOrCreateContainer() {
        let container = document.getElementById('narrative-engine-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'narrative-engine-container';
            container.className = 'narrative-engine-fallback';

            // Insert after video analysis or AI consciousness
            const videoSection = document.getElementById('video-analysis-container') ||
                                document.getElementById('ai-consciousness-container') ||
                                document.querySelector('main');

            if (videoSection) {
                videoSection.insertAdjacentElement('afterend', container);
            } else {
                document.body.appendChild(container);
            }
        }

        return container;
    }

    bindEventListeners() {
        // Generate story button
        const generateBtn = document.getElementById('generate-story');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateNarrative();
            });
        }

        // Auto mode toggle
        const autoBtn = document.getElementById('toggle-auto');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => {
                this.toggleAutoMode();
            });
        }

        // Pressure slider
        const pressureSlider = document.getElementById('pressure-slider');
        if (pressureSlider) {
            pressureSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.narrativeState.pressure = value / 100;

                document.getElementById('pressure-value').textContent = `${value}%`;
                this.updatePressureLevel(value);

                if (this.updateInterval) {
                    this.generateNarrative();
                }
            });
        }

        // Team selector
        const teamSelector = document.getElementById('team-selector');
        if (teamSelector) {
            teamSelector.addEventListener('change', (e) => {
                this.narrativeState.selectedTeam = e.target.value;
                this.updateHistoricalContext();

                if (this.updateInterval) {
                    this.generateNarrative();
                }
            });
        }

        // Context selector
        const contextSelector = document.getElementById('context-selector');
        if (contextSelector) {
            contextSelector.addEventListener('change', (e) => {
                this.narrativeState.context = e.target.value;
                document.getElementById('context-level').textContent =
                    e.target.options[e.target.selectedIndex].text;

                if (this.updateInterval) {
                    this.generateNarrative();
                }
            });
        }
    }

    startRealTimeUpdates() {
        // Initialize with default values
        this.narrativeState.selectedTeam = 'Cardinals';
        this.updateHistoricalContext();
        this.addKeyMoment('System initialized and ready for storytelling.');
    }

    toggleAutoMode() {
        const autoBtn = document.getElementById('toggle-auto');

        if (this.updateInterval) {
            // Stop auto mode
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            autoBtn.innerHTML = '<i class="fas fa-play"></i> Auto Mode';
            autoBtn.style.background = 'linear-gradient(135deg, #BF5700, #E67E22)';
        } else {
            // Start auto mode
            this.updateInterval = setInterval(() => {
                this.generateNarrative();
                this.simulateLiveData();
            }, 8000);
            autoBtn.innerHTML = '<i class="fas fa-pause"></i> Auto Active';
            autoBtn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
        }
    }

    generateNarrative() {
        const team = this.narrativeState.selectedTeam;
        const pressure = this.narrativeState.pressure;
        const context = this.narrativeState.context;

        // Determine pressure level
        let pressureLevel;
        if (pressure < 0.25) pressureLevel = 'low';
        else if (pressure < 0.5) pressureLevel = 'medium';
        else if (pressure < 0.8) pressureLevel = 'high';
        else pressureLevel = 'critical';

        // Select appropriate template
        const templates = this.templates.pressure[pressureLevel];
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Generate narrative with context
        let narrative = template
            .replace(/{team}/g, team)
            .replace(/{player}/g, this.getRandomPlayer(team))
            .replace(/{venue}/g, this.teams[team]?.venue || 'the stadium');

        // Add historical context if applicable
        if (context === 'historical' || Math.random() > 0.7) {
            const historicalTemplates = this.templates.historical.legacy;
            const historicalTemplate = historicalTemplates[Math.floor(Math.random() * historicalTemplates.length)];

            const historicalNarrative = historicalTemplate
                .replace(/{year}/g, this.getRandomYear())
                .replace(/{historical_team}/g, team)
                .replace(/{historical_player}/g, this.getRandomLegend(team))
                .replace(/{player}/g, this.getRandomPlayer(team))
                .replace(/{venue}/g, this.teams[team]?.venue || 'this historic venue');

            narrative += ' ' + historicalNarrative;
        }

        // Update the display
        this.updateNarrativeDisplay(narrative);

        // Add to key moments
        this.addKeyMoment(narrative);
    }

    updateNarrativeDisplay(narrative) {
        const narrativeText = document.querySelector('.narrative-text');
        if (narrativeText) {
            // Typewriter effect
            narrativeText.style.opacity = '0.5';
            setTimeout(() => {
                narrativeText.textContent = narrative;
                narrativeText.style.opacity = '1';
            }, 300);
        }
    }

    updatePressureLevel(value) {
        const pressureLevel = document.getElementById('pressure-level');
        if (pressureLevel) {
            if (value < 25) pressureLevel.textContent = 'Low';
            else if (value < 50) pressureLevel.textContent = 'Medium';
            else if (value < 80) pressureLevel.textContent = 'High';
            else pressureLevel.textContent = 'Critical';
        }
    }

    addKeyMoment(text) {
        const timeline = document.getElementById('moments-timeline');
        if (!timeline) return;

        const timestamp = new Date().toLocaleTimeString();
        const momentItem = document.createElement('div');
        momentItem.className = 'moment-item';
        momentItem.innerHTML = `
            <div class="moment-time">${timestamp}</div>
            <div class="moment-text">${text}</div>
        `;

        timeline.insertBefore(momentItem, timeline.firstChild);

        // Limit to 5 moments
        while (timeline.children.length > 5) {
            timeline.removeChild(timeline.lastChild);
        }
    }

    updateHistoricalContext() {
        const contextCards = document.getElementById('context-cards');
        if (!contextCards) return;

        const team = this.narrativeState.selectedTeam;
        const teamData = this.teams[team];

        if (!teamData) return;

        contextCards.innerHTML = `
            <div class="context-card">
                <h5>Team Legacy</h5>
                <p>The ${team} represent the heart and soul of ${teamData.location}, carrying forward
                   traditions like ${teamData.traditions.join(' and ')} that define championship culture.</p>
            </div>
            <div class="context-card">
                <h5>Legendary Players</h5>
                <p>Following in the footsteps of legends like ${teamData.legends.join(', ')},
                   today's ${team} understand the weight of wearing these colors.</p>
            </div>
            <div class="context-card">
                <h5>Championship Venue</h5>
                <p>${teamData.venue} has witnessed countless defining moments. The atmosphere here
                   transforms ordinary players into legends and good teams into champions.</p>
            </div>
        `;
    }

    simulateLiveData() {
        // Simulate changing pressure and momentum
        this.narrativeState.pressure += (Math.random() - 0.5) * 0.2;
        this.narrativeState.pressure = Math.max(0, Math.min(1, this.narrativeState.pressure));

        this.narrativeState.momentum += (Math.random() - 0.5) * 0.3;
        this.narrativeState.momentum = Math.max(-1, Math.min(1, this.narrativeState.momentum));

        // Update pressure slider
        const pressureSlider = document.getElementById('pressure-slider');
        const pressureValue = document.getElementById('pressure-value');
        if (pressureSlider && pressureValue) {
            const newValue = Math.round(this.narrativeState.pressure * 100);
            pressureSlider.value = newValue;
            pressureValue.textContent = `${newValue}%`;
            this.updatePressureLevel(newValue);
        }

        // Update momentum indicator
        const momentumLevel = document.getElementById('momentum-level');
        if (momentumLevel) {
            if (this.narrativeState.momentum > 0.3) momentumLevel.textContent = 'Building';
            else if (this.narrativeState.momentum > -0.3) momentumLevel.textContent = 'Stable';
            else momentumLevel.textContent = 'Shifting';
        }
    }

    getRandomPlayer(team) {
        const players = {
            'Cardinals': ['Goldschmidt', 'Arenado', 'Edman', 'O\'Neill'],
            'Titans': ['Henry', 'Hopkins', 'Brown', 'Simmons'],
            'Longhorns': ['Ewers', 'Robinson', 'Worthy', 'Overshown'],
            'Grizzlies': ['Morant', 'Jackson Jr.', 'Bane', 'Brooks']
        };

        const teamPlayers = players[team] || ['the star player'];
        return teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
    }

    getRandomLegend(team) {
        const teamData = this.teams[team];
        if (!teamData || !teamData.legends) return 'the legends';

        return teamData.legends[Math.floor(Math.random() * teamData.legends.length)];
    }

    getRandomYear() {
        const years = [1985, 1992, 1999, 2006, 2011, 2018];
        return years[Math.floor(Math.random() * years.length)];
    }

    // Public API methods
    setTeam(teamName) {
        this.narrativeState.selectedTeam = teamName;
        const teamSelector = document.getElementById('team-selector');
        if (teamSelector) {
            teamSelector.value = teamName;
        }
        this.updateHistoricalContext();
    }

    setPressure(level) {
        this.narrativeState.pressure = Math.max(0, Math.min(1, level));
        const pressureSlider = document.getElementById('pressure-slider');
        const pressureValue = document.getElementById('pressure-value');

        if (pressureSlider && pressureValue) {
            const value = Math.round(level * 100);
            pressureSlider.value = value;
            pressureValue.textContent = `${value}%`;
            this.updatePressureLevel(value);
        }
    }

    getCurrentNarrative() {
        return this.narrativeState.currentStory;
    }

    getKeyMoments() {
        return this.narrativeState.keyMoments;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.narrativeEngine) {
        window.narrativeEngine = new NarrativeGenerationEngine();
        await window.narrativeEngine.initialize();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NarrativeGenerationEngine;
}