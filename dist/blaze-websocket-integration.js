/**
 * Blaze Intelligence WebSocket Integration
 * Integrates real-time WebSocket functionality into the deployed platform
 * 
 * Features:
 * - Real-time data streaming for Cardinals, Titans, Longhorns, Grizzlies
 * - Live biometric monitoring and visualization
 * - Champion Enigma Engine 8-dimensional analysis
 * - Visual overlay system integration
 * - Performance monitoring and health checks
 */

// Import WebSocket client
import('./blaze-websocket-client.js').then(module => {
  window.BlazeWebSocketClient = module.BlazeWebSocketClient || window.BlazeWebSocketClient;
  window.TeamWebSocketClient = module.TeamWebSocketClient || window.TeamWebSocketClient;
});

// WebSocket Integration Manager
class BlazeWebSocketIntegration {
  constructor() {
    this.clients = new Map();
    this.overlayCanvas = null;
    this.overlaySystem = null;
    this.isInitialized = false;
    this.config = {
      serverUrl: 'ws://localhost:8080',
      authToken: null,
      enabledTeams: ['CARDINALS', 'TITANS', 'LONGHORNS', 'GRIZZLIES'],
      defaultChannels: ['live-game', 'player-stats', 'biometrics', 'analysis']
    };
    
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      messagesReceived: 0,
      dataUpdates: 0,
      errors: 0
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Blaze WebSocket Integration...');

    try {
      // Setup overlay canvas
      await this.setupOverlayCanvas();
      
      // Initialize team clients
      await this.initializeTeamClients();
      
      // Setup UI integration
      this.setupUIIntegration();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Blaze WebSocket Integration initialized successfully');
      
      // Update UI to show WebSocket status
      this.updateWebSocketStatus('connected');
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket integration:', error);
      this.updateWebSocketStatus('error', error.message);
    }
  }

  async setupOverlayCanvas() {
    // Create overlay canvas
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.id = 'websocket-overlay-canvas';
    this.overlayCanvas.style.position = 'fixed';
    this.overlayCanvas.style.top = '0';
    this.overlayCanvas.style.left = '0';
    this.overlayCanvas.style.width = '100%';
    this.overlayCanvas.style.height = '100%';
    this.overlayCanvas.style.pointerEvents = 'none';
    this.overlayCanvas.style.zIndex = '9999';
    
    document.body.appendChild(this.overlayCanvas);

    // Initialize overlay system (will be loaded dynamically)
    if (window.VisualOverlaySystem) {
      this.overlaySystem = new window.VisualOverlaySystem(
        this.overlayCanvas,
        { colors: { primary: '#ff6b6b', secondary: '#ff8e53' } }
      );
    }
  }

  async initializeTeamClients() {
    const authResponse = await this.authenticate();
    this.config.authToken = authResponse.token;

    for (const team of this.config.enabledTeams) {
      try {
        const client = new TeamWebSocketClient(team, {
          url: this.config.serverUrl,
          authToken: this.config.authToken
        });

        // Set up event listeners
        this.setupClientEventListeners(client, team);
        
        // Connect and subscribe
        await client.connectAndSubscribe(this.config.defaultChannels);
        
        this.clients.set(team, client);
        this.metrics.totalConnections++;
        this.metrics.activeConnections++;
        
        console.log(`✅ ${team} WebSocket client connected`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${team} client:`, error);
        this.metrics.errors++;
      }
    }
  }

  async authenticate() {
    try {
      const response = await fetch(`${this.config.serverUrl.replace('ws:', 'http:')}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'blaze-dashboard-client',
          permissions: ['read', 'subscribe']
        })
      });

      return await response.json();
    } catch (error) {
      console.warn('⚠️ Authentication failed, using no-auth mode:', error);
      return { token: null };
    }
  }

  setupClientEventListeners(client, team) {
    // Connection events
    client.on('connected', () => {
      console.log(`🔗 ${team} connected`);
      this.updateTeamStatus(team, 'connected');
    });

    client.on('disconnected', () => {
      console.log(`🔌 ${team} disconnected`);
      this.updateTeamStatus(team, 'disconnected');
      this.metrics.activeConnections--;
    });

    client.on('error', (error) => {
      console.error(`❌ ${team} error:`, error);
      this.metrics.errors++;
    });

    // Data events
    client.on('teamLiveUpdate', (data) => {
      this.handleLiveUpdate(team, data);
    });

    client.on('teamBiometrics', (data) => {
      this.handleBiometricUpdate(team, data);
    });

    client.on('teamAnalysis', (data) => {
      this.handleAnalysisUpdate(team, data);
    });

    // Set overlay system
    if (this.overlaySystem) {
      client.setOverlaySystem(this.overlaySystem);
    }
  }

  handleLiveUpdate(team, data) {
    this.metrics.messagesReceived++;
    this.metrics.dataUpdates++;
    
    console.log(`🔴 Live update from ${team}:`, data.updateType);
    
    // Update dashboard elements
    this.updateDashboardLiveData(team, data);
    
    // Trigger visual effects
    this.triggerLiveUpdateEffect(team, data);
    
    // Update team-specific displays
    this.updateTeamDisplay(team, data);
  }

  handleBiometricUpdate(team, data) {
    this.metrics.messagesReceived++;
    
    console.log(`💓 Biometric update from ${team}:`, data.playerId);
    
    // Update biometric displays
    this.updateBiometricDisplay(team, data);
    
    // Check for alerts
    if (data.analysis && data.analysis.injury_risk > 0.7) {
      this.showInjuryAlert(team, data);
    }
  }

  handleAnalysisUpdate(team, data) {
    this.metrics.messagesReceived++;
    
    console.log(`🧠 Analysis update from ${team}:`, data.analysisType);
    
    // Update analysis displays
    this.updateAnalysisDisplay(team, data);
    
    // Update Champion Enigma displays
    if (data.analysisType === 'champion_enigma') {
      this.updateChampionEnigmaDisplay(team, data);
    }
  }

  updateDashboardLiveData(team, data) {
    // Update existing dashboard elements with real-time data
    const teamElements = document.querySelectorAll(`[data-team="${team}"]`);
    
    teamElements.forEach(element => {
      const dataType = element.getAttribute('data-type');
      
      switch (dataType) {
        case 'score':
          if (data.data.score) {
            element.textContent = `${data.data.score.home} - ${data.data.score.away}`;
          }
          break;
          
        case 'player-stats':
          if (data.data.players) {
            this.updatePlayerStatsDisplay(element, data.data.players);
          }
          break;
          
        case 'game-status':
          if (data.data.status) {
            element.textContent = data.data.status;
          }
          break;
      }
    });
  }

  updatePlayerStatsDisplay(element, players) {
    // Update player statistics in the UI
    players.forEach(player => {
      const playerElement = element.querySelector(`[data-player="${player.id}"]`);
      if (playerElement) {
        const statElements = playerElement.querySelectorAll('[data-stat]');
        statElements.forEach(statEl => {
          const statType = statEl.getAttribute('data-stat');
          if (player[statType] !== undefined) {
            statEl.textContent = player[statType];
          }
        });
      }
    });
  }

  updateBiometricDisplay(team, data) {
    // Find biometric display elements
    const biometricSection = document.querySelector(`#${team.toLowerCase()}-biometrics`) ||
                           document.querySelector('.biometric-display');
    
    if (biometricSection) {
      // Update heart rate
      const hrElement = biometricSection.querySelector('.heart-rate');
      if (hrElement && data.data.heartRate) {
        hrElement.textContent = `${data.data.heartRate} BPM`;
        
        // Add visual feedback based on heart rate
        hrElement.className = `heart-rate ${this.getHeartRateClass(data.data.heartRate)}`;
      }
      
      // Update HRV
      const hrvElement = biometricSection.querySelector('.hrv');
      if (hrvElement && data.data.hrv) {
        hrvElement.textContent = `${data.data.hrv}ms`;
      }
      
      // Update stress level
      const stressElement = biometricSection.querySelector('.stress-level');
      if (stressElement && data.analysis) {
        const stressPercent = Math.round(data.analysis.stress_indicator * 100);
        stressElement.textContent = `${stressPercent}%`;
        stressElement.style.color = this.getStressColor(stressPercent);
      }
    }
  }

  updateAnalysisDisplay(team, data) {
    const analysisSection = document.querySelector(`#${team.toLowerCase()}-analysis`) ||
                           document.querySelector('.analysis-display');
    
    if (analysisSection) {
      // Update analysis results based on type
      switch (data.analysisType) {
        case 'performance_prediction':
          this.updatePerformancePrediction(analysisSection, data.result);
          break;
          
        case 'injury_assessment':
          this.updateInjuryAssessment(analysisSection, data.result);
          break;
          
        case 'champion_enigma':
          this.updateChampionEnigmaAnalysis(analysisSection, data.result);
          break;
      }
    }
  }

  updateChampionEnigmaDisplay(team, data) {
    const championSection = document.querySelector('.champion-enigma-display') ||
                           document.querySelector('#champion-analysis');
    
    if (championSection && data.result) {
      // Update champion score
      const scoreElement = championSection.querySelector('.champion-score');
      if (scoreElement) {
        const score = Math.round(data.result.championScore * 100);
        scoreElement.textContent = `${score}%`;
        scoreElement.className = `champion-score ${this.getScoreClass(score)}`;
      }
      
      // Update dimension radar chart
      this.updateRadarChart(championSection, data.result.dimensions);
      
      // Update recommendations
      this.updateRecommendations(championSection, data.result.recommendations);
    }
  }

  updateRadarChart(container, dimensions) {
    const canvas = container.querySelector('.radar-chart');
    if (!canvas || !dimensions) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw radar chart
    const dims = Object.entries(dimensions);
    const angleStep = (2 * Math.PI) / dims.length;
    
    // Draw dimension lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    dims.forEach((_, index) => {
      const angle = -Math.PI / 2 + (index * angleStep);
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
    
    // Draw data polygon
    ctx.strokeStyle = '#ff6b6b';
    ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    dims.forEach(([dim, value], index) => {
      const angle = -Math.PI / 2 + (index * angleStep);
      const pointRadius = radius * (value || 0);
      const pointX = centerX + Math.cos(angle) * pointRadius;
      const pointY = centerY + Math.sin(angle) * pointRadius;
      
      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  updateRecommendations(container, recommendations) {
    const recList = container.querySelector('.recommendations-list');
    if (!recList || !recommendations) return;
    
    recList.innerHTML = '';
    recommendations.forEach(rec => {
      const item = document.createElement('div');
      item.className = `recommendation ${rec.priority}`;
      item.innerHTML = `
        <span class="priority">${rec.priority.toUpperCase()}</span>
        <span class="dimension">${rec.dimension}</span>
        <span class="action">${rec.action}</span>
      `;
      recList.appendChild(item);
    });
  }

  triggerLiveUpdateEffect(team, data) {
    // Add visual effects for live updates
    const teamSection = document.querySelector(`#${team.toLowerCase()}-section`) ||
                       document.querySelector(`[data-team="${team}"]`);
    
    if (teamSection) {
      teamSection.classList.add('live-update-flash');
      setTimeout(() => {
        teamSection.classList.remove('live-update-flash');
      }, 500);
    }
  }

  showInjuryAlert(team, data) {
    // Create injury alert notification
    const alert = document.createElement('div');
    alert.className = 'injury-alert';
    alert.innerHTML = `
      <div class="alert-icon">⚠️</div>
      <div class="alert-content">
        <h4>Injury Risk Alert</h4>
        <p>Player ${data.playerId} - ${team}</p>
        <p>Risk Level: ${Math.round(data.analysis.injury_risk * 100)}%</p>
      </div>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to alerts container or create one
    let alertsContainer = document.querySelector('.injury-alerts');
    if (!alertsContainer) {
      alertsContainer = document.createElement('div');
      alertsContainer.className = 'injury-alerts';
      alertsContainer.style.position = 'fixed';
      alertsContainer.style.top = '20px';
      alertsContainer.style.right = '20px';
      alertsContainer.style.zIndex = '10000';
      document.body.appendChild(alertsContainer);
    }
    
    alertsContainer.appendChild(alert);
    
    // Auto-remove after 10 seconds
    setTimeout(() => alert.remove(), 10000);
  }

  setupUIIntegration() {
    // Add WebSocket status indicator
    this.createWebSocketStatusIndicator();
    
    // Add team connection indicators
    this.createTeamStatusIndicators();
    
    // Add real-time metrics panel
    this.createMetricsPanel();
    
    // Integrate with existing dashboard elements
    this.integrateWithDashboard();
  }

  createWebSocketStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'websocket-status';
    indicator.className = 'websocket-status';
    indicator.innerHTML = `
      <div class="status-icon"></div>
      <span class="status-text">Connecting...</span>
    `;
    
    // Style the indicator
    const style = document.createElement('style');
    style.textContent = `
      .websocket-status {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        backdrop-filter: blur(10px);
      }
      
      .status-icon {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffa500;
      }
      
      .websocket-status.connected .status-icon { background: #00ff00; }
      .websocket-status.disconnected .status-icon { background: #ff0000; }
      .websocket-status.error .status-icon { background: #ff0000; }
      
      .live-update-flash {
        animation: flashUpdate 0.5s ease-in-out;
      }
      
      @keyframes flashUpdate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(255, 107, 107, 0.5); }
      }
      
      .injury-alert {
        background: linear-gradient(135deg, #ff4444, #cc0000);
        color: white;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: alertSlide 0.3s ease-out;
      }
      
      @keyframes alertSlide {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .heart-rate.normal { color: #00ff00; }
      .heart-rate.elevated { color: #ffa500; }
      .heart-rate.high { color: #ff0000; }
      
      .champion-score.excellent { color: #00ff00; }
      .champion-score.good { color: #88ff00; }
      .champion-score.average { color: #ffaa00; }
      .champion-score.poor { color: #ff4400; }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(indicator);
  }

  createTeamStatusIndicators() {
    // Add team status indicators to existing team sections
    this.config.enabledTeams.forEach(team => {
      const teamSection = document.querySelector(`#${team.toLowerCase()}-section`) ||
                         document.querySelector(`[data-team="${team}"]`);
      
      if (teamSection) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'team-websocket-status';
        statusDiv.innerHTML = `
          <span class="team-status-dot"></span>
          <span class="team-status-text">Connecting...</span>
        `;
        
        teamSection.appendChild(statusDiv);
      }
    });
  }

  createMetricsPanel() {
    const panel = document.createElement('div');
    panel.id = 'websocket-metrics';
    panel.className = 'metrics-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-size: 12px;
      min-width: 200px;
      z-index: 9999;
      backdrop-filter: blur(10px);
    `;
    
    panel.innerHTML = `
      <h4>Real-Time Metrics</h4>
      <div>Connections: <span id="metric-connections">0</span></div>
      <div>Messages: <span id="metric-messages">0</span></div>
      <div>Updates: <span id="metric-updates">0</span></div>
      <div>Errors: <span id="metric-errors">0</span></div>
    `;
    
    document.body.appendChild(panel);
  }

  integrateWithDashboard() {
    // Replace simulated data with real WebSocket data
    const existingWebSocketCode = document.querySelector('script[data-websocket]');
    if (existingWebSocketCode) {
      existingWebSocketCode.remove();
    }
    
    // Override global data cache with WebSocket data
    if (window.dataCache) {
      window.dataCache.websocketConnected = true;
      window.dataCache.liveDataEnabled = true;
    }
  }

  updateWebSocketStatus(status, message = '') {
    const indicator = document.querySelector('#websocket-status');
    if (indicator) {
      indicator.className = `websocket-status ${status}`;
      const statusText = indicator.querySelector('.status-text');
      
      switch (status) {
        case 'connected':
          statusText.textContent = `Connected (${this.metrics.activeConnections} teams)`;
          break;
        case 'disconnected':
          statusText.textContent = 'Disconnected';
          break;
        case 'error':
          statusText.textContent = `Error: ${message}`;
          break;
        default:
          statusText.textContent = 'Connecting...';
      }
    }
  }

  updateTeamStatus(team, status) {
    const teamSection = document.querySelector(`#${team.toLowerCase()}-section`) ||
                       document.querySelector(`[data-team="${team}"]`);
    
    if (teamSection) {
      const statusElement = teamSection.querySelector('.team-websocket-status');
      if (statusElement) {
        statusElement.className = `team-websocket-status ${status}`;
        const statusText = statusElement.querySelector('.team-status-text');
        statusText.textContent = status === 'connected' ? 'Live' : 'Offline';
      }
    }
  }

  startHealthMonitoring() {
    setInterval(() => {
      this.updateMetricsDisplay();
      this.checkConnectionHealth();
    }, 5000);
  }

  updateMetricsDisplay() {
    document.getElementById('metric-connections').textContent = this.metrics.activeConnections;
    document.getElementById('metric-messages').textContent = this.metrics.messagesReceived;
    document.getElementById('metric-updates').textContent = this.metrics.dataUpdates;
    document.getElementById('metric-errors').textContent = this.metrics.errors;
  }

  checkConnectionHealth() {
    this.clients.forEach((client, team) => {
      const state = client.getConnectionState();
      if (!state.connected) {
        console.warn(`⚠️ ${team} client disconnected, attempting reconnection...`);
        client.connect().catch(error => {
          console.error(`❌ Failed to reconnect ${team}:`, error);
        });
      }
    });
  }

  // Utility methods
  getHeartRateClass(hr) {
    if (hr > 180) return 'high';
    if (hr > 160) return 'elevated';
    return 'normal';
  }

  getStressColor(stress) {
    if (stress > 70) return '#ff4444';
    if (stress > 40) return '#ffa500';
    return '#44ff44';
  }

  getScoreClass(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  }

  // Public API
  getMetrics() {
    return { ...this.metrics };
  }

  getConnectionStatus() {
    const status = {};
    this.clients.forEach((client, team) => {
      status[team] = client.getConnectionState();
    });
    return status;
  }

  async restart() {
    console.log('🔄 Restarting WebSocket integration...');
    
    // Disconnect all clients
    this.clients.forEach(client => client.disconnect());
    this.clients.clear();
    
    // Reset metrics
    this.metrics.activeConnections = 0;
    this.metrics.errors = 0;
    
    // Reinitialize
    await this.initializeTeamClients();
    
    console.log('✅ WebSocket integration restarted');
  }
}

// Initialize WebSocket integration when page loads
let blazeWebSocketIntegration;

document.addEventListener('DOMContentLoaded', async () => {
  // Wait a bit for other scripts to load
  setTimeout(async () => {
    blazeWebSocketIntegration = new BlazeWebSocketIntegration();
    await blazeWebSocketIntegration.initialize();
    
    // Make available globally
    window.blazeWebSocketIntegration = blazeWebSocketIntegration;
  }, 2000);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlazeWebSocketIntegration;
} else {
  window.BlazeWebSocketIntegration = BlazeWebSocketIntegration;
}