// Blaze Intelligence Site Integration Script
// Inject into existing site to enable live data

(function() {
  'use strict';
  
  const BLAZE_CONFIG = {
    api: 'https://blaze-intelligence-api.humphrey-austin20.workers.dev',
    ws: 'wss://blaze-vision.workers.dev',
    refreshInterval: 30000,
    features: {
      liveData: true,
      visionAI: true,
      alerts: true,
      havfCalculator: true
    }
  };

  class BlazeIntegration {
    constructor() {
      this.api = BLAZE_CONFIG.api;
      this.ws = null;
      this.data = {
        teams: {},
        athletes: {},
        metrics: {}
      };
      this.listeners = new Map();
    }

    async init() {
      console.log('🔥 Blaze Intelligence Integration Initializing...');
      
      // Check if we're on the Blaze site
      if (!window.location.hostname.includes('blaze-intelligence')) {
        console.warn('Not on Blaze Intelligence domain');
        return;
      }

      // Initialize components
      await this.loadInitialData();
      this.initWebSocket();
      this.enhanceExistingElements();
      this.startAutoRefresh();
      this.injectStyles();
      
      // Make API available globally
      window.BlazeAPI = this;
      
      console.log('✅ Blaze Integration Ready');
    }

    async loadInitialData() {
      try {
        // Load system status
        const status = await this.fetch('/api/status');
        this.data.status = status;
        
        // Load initial metrics
        const metrics = await this.fetch('/api/stats/summary');
        this.data.metrics = metrics;
        
        console.log('📊 Initial data loaded:', this.data);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    }

    async fetch(endpoint, options = {}) {
      const url = `${this.api}${endpoint}`;
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
      }
    }

    initWebSocket() {
      if (!BLAZE_CONFIG.features.liveData) return;
      
      console.log('📡 Connecting to WebSocket...');
      
      this.ws = new WebSocket(BLAZE_CONFIG.ws);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['live-feed', 'alerts', 'vision-ai']
        }));
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealtimeUpdate(data);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(() => this.initWebSocket(), 5000);
      };
    }

    handleRealtimeUpdate(data) {
      console.log('📨 Realtime update:', data);
      
      // Emit to listeners
      if (this.listeners.has(data.type)) {
        this.listeners.get(data.type).forEach(callback => callback(data));
      }
      
      // Update UI elements
      this.updateUIWithData(data);
    }

    enhanceExistingElements() {
      // Find and enhance dashboard elements
      const dashboardElements = document.querySelectorAll('[data-blaze-enhance]');
      
      dashboardElements.forEach(element => {
        const enhancement = element.dataset.blazeEnhance;
        
        switch(enhancement) {
          case 'live-metrics':
            this.enhanceLiveMetrics(element);
            break;
          case 'team-grid':
            this.enhanceTeamGrid(element);
            break;
          case 'vision-player':
            this.enhanceVisionPlayer(element);
            break;
          case 'havf-calculator':
            this.enhanceHAVFCalculator(element);
            break;
        }
      });
      
      // Add live indicators
      this.addLiveIndicators();
      
      // Enhance navigation
      this.enhanceNavigation();
    }

    enhanceLiveMetrics(element) {
      const metricsHTML = `
        <div class="blaze-metrics-grid">
          <div class="blaze-metric">
            <span class="blaze-metric-label">Teams Live</span>
            <span class="blaze-metric-value" id="blaze-teams-count">68</span>
          </div>
          <div class="blaze-metric">
            <span class="blaze-metric-label">Athletes</span>
            <span class="blaze-metric-value" id="blaze-athletes-count">5.2K</span>
          </div>
          <div class="blaze-metric">
            <span class="blaze-metric-label">HAV-F/min</span>
            <span class="blaze-metric-value" id="blaze-havf-rate">127</span>
          </div>
          <div class="blaze-metric">
            <span class="blaze-metric-label">Vision AI</span>
            <span class="blaze-metric-value" id="blaze-vision-active">
              <span class="blaze-live-dot"></span> Active
            </span>
          </div>
        </div>
      `;
      
      element.innerHTML = metricsHTML;
      
      // Start updating metrics
      this.on('metrics-update', (data) => {
        document.getElementById('blaze-teams-count').textContent = data.teams || '68';
        document.getElementById('blaze-athletes-count').textContent = data.athletes || '5.2K';
        document.getElementById('blaze-havf-rate').textContent = data.havfRate || '127';
      });
    }

    enhanceTeamGrid(element) {
      // Load and display team data
      this.fetch('/api/mlb/teams').then(data => {
        if (!data.teams) return;
        
        const gridHTML = data.teams.slice(0, 12).map(team => `
          <div class="blaze-team-card" onclick="BlazeAPI.viewTeam('${team.id}')">
            <div class="blaze-team-logo">${this.getTeamEmoji(team.id)}</div>
            <div class="blaze-team-name">${team.name || team.id}</div>
            <div class="blaze-team-havf">HAV-F: ${team.havf || '0.750'}</div>
            <div class="blaze-team-status blaze-status-${team.readiness || 'yellow'}"></div>
          </div>
        `).join('');
        
        element.innerHTML = `
          <div class="blaze-team-grid">
            ${gridHTML}
          </div>
        `;
      });
    }

    enhanceVisionPlayer(element) {
      if (!BLAZE_CONFIG.features.visionAI) return;
      
      element.innerHTML = `
        <div class="blaze-vision-container">
          <video id="blaze-vision-video" controls></video>
          <div class="blaze-vision-overlay">
            <div class="blaze-vision-status">
              <span class="blaze-live-dot"></span>
              Vision AI Ready
            </div>
            <button class="blaze-vision-start" onclick="BlazeAPI.startVisionAnalysis()">
              Start Analysis
            </button>
          </div>
        </div>
      `;
    }

    enhanceHAVFCalculator(element) {
      if (!BLAZE_CONFIG.features.havfCalculator) return;
      
      element.innerHTML = `
        <div class="blaze-havf-calculator">
          <h3>Quick HAV-F Calculator</h3>
          <form id="blaze-havf-form">
            <input type="text" placeholder="Athlete Name" id="havf-name">
            <select id="havf-sport">
              <option value="baseball">Baseball</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
            </select>
            <input type="number" placeholder="Age" id="havf-age" min="14" max="40">
            <button type="submit">Calculate HAV-F</button>
          </form>
          <div id="blaze-havf-result"></div>
        </div>
      `;
      
      document.getElementById('blaze-havf-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.calculateHAVF();
      });
    }

    addLiveIndicators() {
      // Add live indicator to header
      const header = document.querySelector('header, nav, .header, .navigation');
      if (header && !document.querySelector('.blaze-live-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'blaze-live-indicator';
        indicator.innerHTML = `
          <span class="blaze-live-dot"></span>
          <span>LIVE DATA</span>
        `;
        header.appendChild(indicator);
      }
    }

    enhanceNavigation() {
      // Add dashboard link if not present
      const nav = document.querySelector('nav ul, .nav-menu, .navigation-menu');
      if (nav && !document.querySelector('[href*="dashboard"]')) {
        const dashboardLink = document.createElement('li');
        dashboardLink.innerHTML = `
          <a href="/dashboard" class="blaze-nav-link">
            📊 Live Dashboard
          </a>
        `;
        nav.appendChild(dashboardLink);
      }
    }

    updateUIWithData(data) {
      // Update any elements with data attributes
      document.querySelectorAll('[data-blaze-value]').forEach(element => {
        const key = element.dataset.blazeValue;
        if (data[key] !== undefined) {
          element.textContent = data[key];
        }
      });
      
      // Update status indicators
      if (data.type === 'status-update') {
        document.querySelectorAll('.blaze-status').forEach(element => {
          element.className = `blaze-status blaze-status-${data.status}`;
        });
      }
    }

    startAutoRefresh() {
      setInterval(async () => {
        try {
          const metrics = await this.fetch('/api/stats/summary');
          this.handleRealtimeUpdate({
            type: 'metrics-update',
            ...metrics
          });
        } catch (error) {
          console.error('Auto-refresh error:', error);
        }
      }, BLAZE_CONFIG.refreshInterval);
    }

    injectStyles() {
      const styles = `
        <style>
          .blaze-metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }

          .blaze-metric {
            text-align: center;
          }

          .blaze-metric-label {
            display: block;
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 0.5rem;
          }

          .blaze-metric-value {
            display: block;
            font-size: 1.5rem;
            font-weight: bold;
            color: #FF7A00;
          }

          .blaze-live-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #00FF88;
            border-radius: 50%;
            animation: blaze-pulse 2s infinite;
          }

          @keyframes blaze-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .blaze-team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1rem;
          }

          .blaze-team-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
          }

          .blaze-team-card:hover {
            background: rgba(191, 87, 0, 0.2);
            transform: translateY(-3px);
          }

          .blaze-team-logo {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .blaze-team-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .blaze-team-havf {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .blaze-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin: 0.5rem auto 0;
          }

          .blaze-status-green { background: #00FF88; }
          .blaze-status-yellow { background: #FFB81C; }
          .blaze-status-red { background: #FF3366; }

          .blaze-live-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00FF88;
            border-radius: 20px;
            font-size: 0.875rem;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
          }

          .blaze-vision-container {
            position: relative;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
          }

          .blaze-vision-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 1rem;
            background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .blaze-vision-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: white;
          }

          .blaze-vision-start {
            padding: 0.5rem 1rem;
            background: #BF5700;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          .blaze-havf-calculator {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 8px;
          }

          .blaze-havf-calculator h3 {
            margin-bottom: 1rem;
          }

          #blaze-havf-form {
            display: grid;
            gap: 0.5rem;
          }

          #blaze-havf-form input,
          #blaze-havf-form select {
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
          }

          #blaze-havf-form button {
            padding: 0.75rem;
            background: #BF5700;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          #blaze-havf-result {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            display: none;
          }

          #blaze-havf-result.show {
            display: block;
          }
        </style>
      `;
      
      document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Public API Methods
    
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }

    off(event, callback) {
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }

    async viewTeam(teamId) {
      console.log(`Loading team: ${teamId}`);
      const data = await this.fetch(`/api/mlb/team/${teamId}`);
      
      // Open modal or navigate
      if (window.showTeamModal) {
        window.showTeamModal(data);
      } else {
        window.location.href = `/team/${teamId}`;
      }
    }

    async startVisionAnalysis() {
      console.log('Starting Vision AI analysis...');
      
      const videoElement = document.getElementById('blaze-vision-video');
      
      // Request camera access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        
        // Send to Vision AI
        const response = await this.fetch('/api/vision/analyze', {
          method: 'POST',
          body: JSON.stringify({
            type: 'live-stream',
            athleteId: 'demo-athlete'
          })
        });
        
        console.log('Vision AI response:', response);
        
        // Connect to WebSocket for real-time updates
        if (response.websocket) {
          this.connectVisionWebSocket(response.analysisId);
        }
      } catch (error) {
        console.error('Failed to start vision analysis:', error);
        alert('Please allow camera access to use Vision AI');
      }
    }

    connectVisionWebSocket(analysisId) {
      const visionWS = new WebSocket(BLAZE_CONFIG.ws);
      
      visionWS.onopen = () => {
        visionWS.send(JSON.stringify({
          type: 'subscribe',
          analysisId: analysisId
        }));
      };
      
      visionWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Vision AI update:', data);
        
        // Update UI with analysis results
        this.updateVisionResults(data);
      };
    }

    updateVisionResults(data) {
      // Update any vision result displays
      document.querySelectorAll('[data-vision-metric]').forEach(element => {
        const metric = element.dataset.visionMetric;
        if (data[metric]) {
          element.textContent = data[metric];
        }
      });
    }

    async calculateHAVF() {
      const name = document.getElementById('havf-name').value;
      const sport = document.getElementById('havf-sport').value;
      const age = document.getElementById('havf-age').value;
      
      const response = await this.fetch('/api/havf/calculate', {
        method: 'POST',
        body: JSON.stringify({
          athleteId: `quick_${Date.now()}`,
          name,
          sport,
          age: parseInt(age)
        })
      });
      
      const resultDiv = document.getElementById('blaze-havf-result');
      resultDiv.innerHTML = `
        <h4>HAV-F Results for ${name}</h4>
        <p>Champion Readiness: ${response.scores.championReadiness.toFixed(3)}</p>
        <p>Cognitive Leverage: ${response.scores.cognitiveLeverage.toFixed(3)}</p>
        <p>NIL Trust Score: ${response.scores.nilTrustScore.toFixed(3)}</p>
        <p><strong>Composite: ${response.composite.adjusted.toFixed(3)}</strong></p>
        <p>Percentile: ${response.composite.percentile}%</p>
      `;
      resultDiv.classList.add('show');
    }

    getTeamEmoji(teamId) {
      const emojis = {
        'STL': '🔴', 'LAD': '🔵', 'NYY': '⚾', 'HOU': '🟠',
        'ATL': '🔴', 'BOS': '🔴', 'TB': '⚡', 'CHC': '🐻'
      };
      return emojis[teamId] || '⚾';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const blaze = new BlazeIntegration();
      blaze.init();
    });
  } else {
    const blaze = new BlazeIntegration();
    blaze.init();
  }
})();