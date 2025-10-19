/**
 * 🎬 BLAZE SPORTS INTEL - UNREAL ENGINE RENDER CONTROLS UI
 * Advanced control panel for requesting cinema-quality renders
 */

class UnrealRenderControls {
    constructor(unrealEngine) {
        this.engine = unrealEngine || window.unrealEngine;
        this.isVisible = false;
        this.currentTab = 'stadium';

        this.init();
    }

    init() {
        this.createControlPanel();
        this.attachEventListeners();
        this.createToggleButton();
    }

    createControlPanel() {
        // Create main panel container
        const panel = document.createElement('div');
        panel.id = 'unrealRenderPanel';
        panel.className = 'unreal-render-panel hidden';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🎬 Unreal Engine Render Controls</h3>
                <button id="closeRenderPanel" class="close-btn">×</button>
            </div>

            <div class="panel-tabs">
                <button class="tab-btn active" data-tab="stadium">Stadium</button>
                <button class="tab-btn" data-tab="player">Player</button>
                <button class="tab-btn" data-tab="analytics">Analytics</button>
                <button class="tab-btn" data-tab="moment">Game Moment</button>
                <button class="tab-btn" data-tab="monte-carlo">Monte Carlo</button>
            </div>

            <div class="panel-content">
                <!-- Stadium Tab -->
                <div class="tab-content active" id="stadiumTab">
                    <h4>Championship Stadium Render</h4>
                    <div class="control-group">
                        <label>Sport:</label>
                        <select id="stadiumSport">
                            <option value="baseball">Baseball</option>
                            <option value="football">Football</option>
                            <option value="basketball">Basketball</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Team:</label>
                        <select id="stadiumTeam">
                            <option value="cardinals">Cardinals</option>
                            <option value="titans">Titans</option>
                            <option value="longhorns">Longhorns</option>
                            <option value="grizzlies">Grizzlies</option>
                            <option value="yankees">Yankees</option>
                            <option value="dodgers">Dodgers</option>
                            <option value="cowboys">Cowboys</option>
                            <option value="chiefs">Chiefs</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Weather:</label>
                        <select id="stadiumWeather">
                            <option value="clear">Clear</option>
                            <option value="rain">Rain</option>
                            <option value="snow">Snow</option>
                            <option value="fog">Fog</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Time:</label>
                        <select id="stadiumTime">
                            <option value="day">Day</option>
                            <option value="dusk">Dusk</option>
                            <option value="night">Night</option>
                            <option value="golden_hour">Golden Hour</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Crowd: <span id="crowdValue">85%</span></label>
                        <input type="range" id="stadiumCrowd" min="0" max="100" value="85">
                    </div>
                    <button class="render-btn" onclick="renderControls.renderStadium()">
                        🎬 Render Stadium
                    </button>
                </div>

                <!-- Player Tab -->
                <div class="tab-content" id="playerTab">
                    <h4>Player Spotlight Render</h4>
                    <div class="control-group">
                        <label>Player Name:</label>
                        <input type="text" id="playerName" placeholder="Enter player name">
                    </div>
                    <div class="control-group">
                        <label>Team:</label>
                        <select id="playerTeam">
                            <option value="cardinals">Cardinals</option>
                            <option value="titans">Titans</option>
                            <option value="longhorns">Longhorns</option>
                            <option value="grizzlies">Grizzlies</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Sport:</label>
                        <select id="playerSport">
                            <option value="baseball">Baseball</option>
                            <option value="football">Football</option>
                            <option value="basketball">Basketball</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Action:</label>
                        <select id="playerAction">
                            <option value="hero_pose">Hero Pose</option>
                            <option value="batting">Batting</option>
                            <option value="pitching">Pitching</option>
                            <option value="throwing">Throwing</option>
                            <option value="shooting">Shooting</option>
                            <option value="celebration">Celebration</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="playerStats" checked>
                            Include Stats Overlay
                        </label>
                    </div>
                    <button class="render-btn" onclick="renderControls.renderPlayer()">
                        🎬 Render Player
                    </button>
                </div>

                <!-- Analytics Tab -->
                <div class="tab-content" id="analyticsTab">
                    <h4>Analytics Visualization</h4>
                    <div class="control-group">
                        <label>Visualization Type:</label>
                        <select id="analyticsType">
                            <option value="heatmap">Heatmap</option>
                            <option value="trajectory">Trajectory</option>
                            <option value="spray_chart">Spray Chart</option>
                            <option value="shot_chart">Shot Chart</option>
                            <option value="pressure_map">Pressure Map</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Sport:</label>
                        <select id="analyticsSport">
                            <option value="baseball">Baseball</option>
                            <option value="football">Football</option>
                            <option value="basketball">Basketball</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Style:</label>
                        <select id="analyticsStyle">
                            <option value="holographic">Holographic</option>
                            <option value="realistic">Realistic</option>
                            <option value="neon">Neon</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Data Source:</label>
                        <select id="analyticsData">
                            <option value="live">Live Data</option>
                            <option value="season">Season Stats</option>
                            <option value="career">Career Stats</option>
                            <option value="custom">Custom Data</option>
                        </select>
                    </div>
                    <button class="render-btn" onclick="renderControls.renderAnalytics()">
                        🎬 Render Analytics
                    </button>
                </div>

                <!-- Game Moment Tab -->
                <div class="tab-content" id="momentTab">
                    <h4>Game Moment Recreation</h4>
                    <div class="control-group">
                        <label>Moment Type:</label>
                        <select id="momentType">
                            <option value="home_run">Home Run</option>
                            <option value="touchdown">Touchdown</option>
                            <option value="three_pointer">Three Pointer</option>
                            <option value="grand_slam">Grand Slam</option>
                            <option value="game_winner">Game Winner</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Teams:</label>
                        <input type="text" id="momentTeams" placeholder="e.g., Cardinals vs Dodgers">
                    </div>
                    <div class="control-group">
                        <label>Description:</label>
                        <textarea id="momentDescription" rows="3" placeholder="Describe the moment..."></textarea>
                    </div>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="momentCinematic" checked>
                            Cinematic Mode
                        </label>
                    </div>
                    <button class="render-btn" onclick="renderControls.renderMoment()">
                        🎬 Render Moment
                    </button>
                </div>

                <!-- Monte Carlo Tab -->
                <div class="tab-content" id="monte-carloTab">
                    <h4>Monte Carlo Visualization</h4>
                    <div class="control-group">
                        <label>Visualization Style:</label>
                        <select id="monteCarloStyle">
                            <option value="probability_cloud">Probability Cloud</option>
                            <option value="outcome_tree">Outcome Tree</option>
                            <option value="confidence_bands">Confidence Bands</option>
                            <option value="distribution_surface">Distribution Surface</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Team (Optional):</label>
                        <select id="monteCarloTeam">
                            <option value="">None</option>
                            <option value="cardinals">Cardinals</option>
                            <option value="titans">Titans</option>
                            <option value="longhorns">Longhorns</option>
                            <option value="grizzlies">Grizzlies</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Data Source:</label>
                        <select id="monteCarloData">
                            <option value="current">Current Simulation</option>
                            <option value="championship">Championship Odds</option>
                            <option value="playoffs">Playoff Probability</option>
                            <option value="roi">ROI Analysis</option>
                        </select>
                    </div>
                    <button class="render-btn" onclick="renderControls.renderMonteCarlo()">
                        🎬 Render Monte Carlo
                    </button>
                </div>
            </div>

            <div class="panel-footer">
                <div class="connection-status" id="renderConnectionStatus">
                    <span class="status-dot"></span>
                    <span class="status-text">Checking connection...</span>
                </div>
                <div class="render-queue">
                    Active Jobs: <span id="activeJobCount">0</span>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .unreal-render-panel {
                position: fixed;
                right: 20px;
                top: 80px;
                width: 400px;
                max-height: 80vh;
                background: linear-gradient(135deg, rgba(13, 27, 42, 0.98), rgba(27, 38, 59, 0.98));
                border: 1px solid rgba(191, 87, 0, 0.5);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                z-index: 10000;
                color: white;
                font-family: 'Inter', sans-serif;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .unreal-render-panel.hidden {
                transform: translateX(450px);
                opacity: 0;
            }

            .panel-header {
                padding: 15px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .panel-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .close-btn:hover {
                opacity: 1;
            }

            .panel-tabs {
                display: flex;
                padding: 0 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                overflow-x: auto;
            }

            .tab-btn {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                padding: 12px 16px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                border-bottom: 2px solid transparent;
                white-space: nowrap;
            }

            .tab-btn:hover {
                color: rgba(255, 255, 255, 0.9);
            }

            .tab-btn.active {
                color: #BF5700;
                border-bottom-color: #BF5700;
            }

            .panel-content {
                padding: 20px;
                max-height: 50vh;
                overflow-y: auto;
            }

            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            .tab-content h4 {
                margin: 0 0 20px 0;
                color: #BF5700;
                font-size: 16px;
            }

            .control-group {
                margin-bottom: 15px;
            }

            .control-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
            }

            .control-group input[type="text"],
            .control-group input[type="number"],
            .control-group textarea,
            .control-group select {
                width: 100%;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: white;
                font-size: 14px;
            }

            .control-group input[type="range"] {
                width: 100%;
            }

            .control-group input[type="checkbox"] {
                margin-right: 8px;
            }

            .render-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #BF5700, #E67E00);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 20px;
            }

            .render-btn:hover {
                background: linear-gradient(135deg, #E67E00, #BF5700);
                box-shadow: 0 5px 20px rgba(191, 87, 0, 0.3);
            }

            .panel-footer {
                padding: 15px 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
            }

            .connection-status {
                display: flex;
                align-items: center;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ffa500;
                margin-right: 8px;
                animation: pulse 2s infinite;
            }

            .status-dot.connected {
                background: #00ff00;
            }

            .status-dot.disconnected {
                background: #ff0000;
                animation: none;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            .unreal-toggle-btn {
                position: fixed;
                right: 20px;
                top: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #BF5700, #E67E00);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                z-index: 9999;
                transition: all 0.3s;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            }

            .unreal-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 30px rgba(191, 87, 0, 0.5);
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(panel);
    }

    createToggleButton() {
        const btn = document.createElement('button');
        btn.className = 'unreal-toggle-btn';
        btn.innerHTML = '🎬';
        btn.title = 'Unreal Render Controls';
        btn.onclick = () => this.togglePanel();
        document.body.appendChild(btn);
    }

    togglePanel() {
        const panel = document.getElementById('unrealRenderPanel');
        this.isVisible = !this.isVisible;

        if (this.isVisible) {
            panel.classList.remove('hidden');
            this.updateConnectionStatus();
        } else {
            panel.classList.add('hidden');
        }
    }

    attachEventListeners() {
        // Close button
        document.getElementById('closeRenderPanel').onclick = () => this.togglePanel();

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            };
        });

        // Crowd slider
        const crowdSlider = document.getElementById('stadiumCrowd');
        const crowdValue = document.getElementById('crowdValue');
        crowdSlider.oninput = () => {
            crowdValue.textContent = crowdSlider.value + '%';
        };
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');

        this.currentTab = tabName;
    }

    async updateConnectionStatus() {
        const statusEl = document.querySelector('.connection-status');
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');

        if (this.engine && await this.engine.checkConnection()) {
            dot.classList.add('connected');
            dot.classList.remove('disconnected');
            text.textContent = 'Connected to Unreal Engine';
        } else {
            dot.classList.remove('connected');
            dot.classList.add('disconnected');
            text.textContent = 'Unreal Engine Offline';
        }
    }

    updateJobCount() {
        const count = this.engine ? this.engine.activeJobs.size : 0;
        document.getElementById('activeJobCount').textContent = count;
    }

    // Render methods
    async renderStadium() {
        const options = {
            sport: document.getElementById('stadiumSport').value,
            team: document.getElementById('stadiumTeam').value,
            weather: document.getElementById('stadiumWeather').value,
            timeOfDay: document.getElementById('stadiumTime').value,
            crowdDensity: document.getElementById('stadiumCrowd').value / 100
        };

        const jobId = await this.engine.renderChampionshipStadium(options);
        this.updateJobCount();
        this.showNotification('Stadium render job submitted!');
    }

    async renderPlayer() {
        const playerName = document.getElementById('playerName').value;
        if (!playerName) {
            this.showNotification('Please enter a player name', 'error');
            return;
        }

        const options = {
            team: document.getElementById('playerTeam').value,
            sport: document.getElementById('playerSport').value,
            action: document.getElementById('playerAction').value,
            statsOverlay: document.getElementById('playerStats').checked
        };

        const jobId = await this.engine.renderPlayerSpotlight(playerName, options);
        this.updateJobCount();
        this.showNotification('Player spotlight render submitted!');
    }

    async renderAnalytics() {
        // Get sample data based on selection
        const dataSource = document.getElementById('analyticsData').value;
        let data = {};

        if (dataSource === 'live') {
            // Use live data from championship dashboard
            data = window.championshipDashboard?.getCurrentData() || {};
        } else {
            // Use sample data
            data = { values: Array.from({length: 20}, () => Math.random() * 100) };
        }

        const options = {
            type: document.getElementById('analyticsType').value,
            sport: document.getElementById('analyticsSport').value,
            style: document.getElementById('analyticsStyle').value
        };

        const jobId = await this.engine.renderAnalytics(data, options);
        this.updateJobCount();
        this.showNotification('Analytics visualization render submitted!');
    }

    async renderMoment() {
        const teams = document.getElementById('momentTeams').value;
        const description = document.getElementById('momentDescription').value;

        if (!teams || !description) {
            this.showNotification('Please fill in teams and description', 'error');
            return;
        }

        const momentType = document.getElementById('momentType').value;
        const options = {
            sport: momentType.includes('touchdown') ? 'football' :
                  momentType.includes('pointer') ? 'basketball' : 'baseball',
            cinematicMode: document.getElementById('momentCinematic').checked
        };

        const jobId = await this.engine.renderGameMoment(
            momentType,
            teams.split('vs').map(t => t.trim()),
            description,
            options
        );
        this.updateJobCount();
        this.showNotification('Game moment render submitted!');
    }

    async renderMonteCarlo() {
        // Get Monte Carlo simulation data
        const dataSource = document.getElementById('monteCarloData').value;
        let simulationData = {};

        if (window.monteCarloEngine) {
            // Use actual Monte Carlo data if available
            simulationData = window.monteCarloEngine.getLatestResults();
        } else {
            // Use sample data
            simulationData = {
                iterations: 10000,
                mean: 0.65,
                stdDev: 0.15,
                outcomes: Array.from({length: 100}, () => Math.random())
            };
        }

        const options = {
            style: document.getElementById('monteCarloStyle').value,
            team: document.getElementById('monteCarloTeam').value || undefined
        };

        const jobId = await this.engine.renderMonteCarlo(simulationData, options);
        this.updateJobCount();
        this.showNotification('Monte Carlo visualization render submitted!');
    }

    showNotification(message, type = 'success') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.renderControls = new UnrealRenderControls(window.unrealEngine);
    });
} else {
    window.renderControls = new UnrealRenderControls(window.unrealEngine);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnrealRenderControls;
}