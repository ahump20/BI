/**
 * BLAZE INTELLIGENCE - VOICE INTERFACE SYSTEM
 * Advanced voice-activated query system for sports analytics
 * Features: Real-time speech recognition, natural language processing, contextual responses
 * Supports: Cardinals, Titans, Longhorns, Grizzlies analytics
 */

import { BlazeAnalyticsEngine } from './blaze-analytics-engine.js';
import { BlazeSportsPipeline } from './blaze-sports-pipeline-enhanced.js';

export class BlazeVoiceInterface {
  constructor(config = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      enableNLP: true,
      responseMode: 'voice', // 'voice', 'text', 'both'
      confidenceThreshold: 0.8,
      contextWindow: 5, // Remember last 5 interactions
      ...config
    };

    this.recognition = null;
    this.synthesis = null;
    this.isListening = false;
    this.conversationContext = [];
    this.analyticsEngine = new BlazeAnalyticsEngine();
    this.sportsData = new BlazeSportsPipeline();
    
    this.intentPatterns = {
      // Player Statistics
      playerStats: [
        /(?:what are|show me|get|find)\s+(.+?)(?:'?s|s)?\s+(?:stats|statistics|numbers)/i,
        /(?:how is|how's)\s+(.+?)\s+(?:doing|performing|playing)/i,
        /(?:tell me about|info on|information about)\s+(.+)/i
      ],
      
      // Team Analysis
      teamAnalysis: [
        /(?:how are|how're)\s+(?:the\s+)?(.+?)\s+(?:doing|playing|performing)/i,
        /(?:analyze|analysis of|breakdown of)\s+(?:the\s+)?(.+)/i,
        /(?:team stats|team statistics)\s+(?:for\s+)?(?:the\s+)?(.+)/i
      ],

      // Game Predictions
      predictions: [
        /(?:predict|prediction for|who will win|odds for)\s+(.+)/i,
        /(?:what's the\s+)?(?:prediction|forecast)\s+(?:for\s+)?(.+)/i,
        /(?:chances|probability)\s+(?:of\s+)?(.+)\s+(?:winning|beating)/i
      ],

      // Injury Reports
      injuries: [
        /(?:injury report|injuries|who's hurt|who's injured)\s+(?:for\s+)?(?:the\s+)?(.+)/i,
        /(?:health status|medical report)\s+(?:for\s+)?(.+)/i,
        /(?:is\s+)?(.+)\s+(?:injured|hurt|healthy)/i
      ],

      // Performance Metrics
      performance: [
        /(?:performance|efficiency|effectiveness)\s+(?:of\s+)?(.+)/i,
        /(?:how effective|how efficient)\s+(?:is\s+)?(.+)/i,
        /(?:rating|grade|score)\s+(?:for\s+)?(.+)/i
      ],

      // Comparisons
      comparisons: [
        /(?:compare|comparison)\s+(.+?)\s+(?:to|with|and|vs)\s+(.+)/i,
        /(?:who's better|who is better)\s+(.+?)\s+(?:or|vs)\s+(.+)/i,
        /(.+?)\s+(?:versus|vs|against)\s+(.+)/i
      ]
    };

    this.responseTemplates = {
      playerStats: [
        "Here's what I found for {player}: {stats}",
        "{player} is currently {performance_summary}",
        "Let me break down {player}'s numbers: {detailed_stats}"
      ],
      teamAnalysis: [
        "The {team} are {current_status}. {analysis}",
        "Based on recent performance, {team} {trend_analysis}",
        "{team} analytics show: {key_metrics}"
      ],
      predictions: [
        "My analysis predicts: {prediction_summary}",
        "The data suggests {prediction} with {confidence}% confidence",
        "Looking at the numbers: {detailed_prediction}"
      ],
      error: [
        "I didn't catch that. Could you rephrase your question?",
        "I'm not sure I understand. Try asking about player stats or team analysis.",
        "Let me know what specific information you're looking for."
      ]
    };

    this.init();
  }

  async init() {
    try {
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new SpeechRecognition();
      } else {
        throw new Error('Speech recognition not supported');
      }

      this.setupSpeechRecognition();

      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }

      console.log('🎤 Blaze Voice Interface initialized successfully');
      
      // Load sports data cache
      await this.preloadSportsData();
      
    } catch (error) {
      console.error('Voice interface initialization failed:', error);
      throw error;
    }
  }

  setupSpeechRecognition() {
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      this.isListening = true;
      this.onListeningStart();
    };

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .map(result => result[0].transcript)
        .join(' ');
      
      const confidence = results[results.length - 1][0].confidence;
      
      if (confidence >= this.config.confidenceThreshold) {
        console.log(`🎤 Recognized: "${transcript}" (${Math.round(confidence * 100)}%)`);
        this.processVoiceCommand(transcript, confidence);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.onError(event.error);
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      this.isListening = false;
      this.onListeningEnd();
    };
  }

  async preloadSportsData() {
    try {
      console.log('📊 Preloading sports data...');
      
      // Cache recent data for primary teams
      const teams = ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'];
      
      for (const team of teams) {
        await this.sportsData.getTeamData(team);
      }

      console.log('📊 Sports data cache loaded');
    } catch (error) {
      console.error('Failed to preload sports data:', error);
    }
  }

  startListening() {
    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    if (this.isListening) {
      console.log('🎤 Already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start listening:', error);
      throw error;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  async processVoiceCommand(transcript, confidence) {
    try {
      console.log(`🧠 Processing command: "${transcript}"`);

      // Add to conversation context
      this.conversationContext.push({
        type: 'user',
        content: transcript,
        confidence,
        timestamp: Date.now()
      });

      // Keep context window size manageable
      if (this.conversationContext.length > this.config.contextWindow * 2) {
        this.conversationContext = this.conversationContext.slice(-this.config.contextWindow * 2);
      }

      // Parse intent and entities
      const intent = this.parseIntent(transcript);
      const entities = this.extractEntities(transcript, intent.type);

      console.log(`🎯 Intent: ${intent.type}, Confidence: ${intent.confidence}`);
      console.log(`📝 Entities:`, entities);

      // Generate response
      const response = await this.generateResponse(intent, entities, transcript);

      // Add response to context
      this.conversationContext.push({
        type: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        intent: intent.type,
        entities
      });

      // Deliver response
      await this.deliverResponse(response);

    } catch (error) {
      console.error('Error processing voice command:', error);
      await this.deliverResponse({
        text: "Sorry, I encountered an error processing your request.",
        speak: true
      });
    }
  }

  parseIntent(text) {
    const normalizedText = text.toLowerCase().trim();
    
    for (const [intentType, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          return {
            type: intentType,
            confidence: 0.9,
            match: match[0],
            groups: match.slice(1)
          };
        }
      }
    }

    // Fallback intent classification
    if (normalizedText.includes('stat') || normalizedText.includes('number')) {
      return { type: 'playerStats', confidence: 0.6, match: normalizedText };
    }
    
    if (normalizedText.includes('team') || normalizedText.includes('cardinals') || 
        normalizedText.includes('titans') || normalizedText.includes('longhorns') || 
        normalizedText.includes('grizzlies')) {
      return { type: 'teamAnalysis', confidence: 0.6, match: normalizedText };
    }

    return { type: 'unknown', confidence: 0.3, match: normalizedText };
  }

  extractEntities(text, intentType) {
    const entities = {
      players: [],
      teams: [],
      metrics: [],
      timeframes: []
    };

    const normalizedText = text.toLowerCase();

    // Extract team names
    const teamPatterns = {
      'Cardinals': /(?:cardinals?|cards|stl|st\.?\s*louis)/i,
      'Titans': /(?:titans?|ten|tennessee)/i,
      'Longhorns': /(?:longhorns?|texas|ut|university of texas)/i,
      'Grizzlies': /(?:grizzlies|griz|memphis|mem)/i
    };

    for (const [team, pattern] of Object.entries(teamPatterns)) {
      if (pattern.test(text)) {
        entities.teams.push(team);
      }
    }

    // Extract common metrics
    const metricPatterns = {
      'batting_average': /(?:batting average|ba|avg)/i,
      'home_runs': /(?:home runs?|hrs?|homers?)/i,
      'rbi': /(?:rbis?|runs? batted in)/i,
      'era': /(?:era|earned run average)/i,
      'wins': /(?:wins?|victories)/i,
      'losses': /(?:losses?|defeats?)/i,
      'points': /(?:points?|pts)/i,
      'rebounds': /(?:rebounds?|reb)/i,
      'assists': /(?:assists?|ast)/i,
      'rushing_yards': /(?:rushing yards?|rush)/i,
      'passing_yards': /(?:passing yards?|pass)/i,
      'touchdowns': /(?:touchdowns?|tds?)/i
    };

    for (const [metric, pattern] of Object.entries(metricPatterns)) {
      if (pattern.test(text)) {
        entities.metrics.push(metric);
      }
    }

    // Extract timeframes
    const timePatterns = {
      'today': /today|this game/i,
      'this_week': /this week|week/i,
      'this_season': /this season|season|year/i,
      'last_game': /last game|previous game/i,
      'career': /career|all time|lifetime/i
    };

    for (const [timeframe, pattern] of Object.entries(timePatterns)) {
      if (pattern.test(text)) {
        entities.timeframes.push(timeframe);
      }
    }

    // Extract player names (basic pattern matching)
    const playerNamePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    const potentialNames = text.match(playerNamePattern) || [];
    entities.players = potentialNames;

    return entities;
  }

  async generateResponse(intent, entities, originalText) {
    try {
      switch (intent.type) {
        case 'playerStats':
          return await this.generatePlayerStatsResponse(entities, originalText);
        
        case 'teamAnalysis':
          return await this.generateTeamAnalysisResponse(entities, originalText);
        
        case 'predictions':
          return await this.generatePredictionResponse(entities, originalText);
        
        case 'injuries':
          return await this.generateInjuryResponse(entities, originalText);
        
        case 'performance':
          return await this.generatePerformanceResponse(entities, originalText);
        
        case 'comparisons':
          return await this.generateComparisonResponse(entities, originalText);
        
        default:
          return this.generateErrorResponse();
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateErrorResponse();
    }
  }

  async generatePlayerStatsResponse(entities, originalText) {
    const playerName = entities.players[0] || 'the player';
    const metrics = entities.metrics.length > 0 ? entities.metrics : ['overall'];
    const timeframe = entities.timeframes[0] || 'this_season';

    try {
      // Get actual player data
      const playerData = await this.sportsData.getPlayerStats(playerName, {
        metrics,
        timeframe
      });

      if (playerData) {
        const statsText = this.formatPlayerStats(playerData);
        return {
          text: `Here are ${playerName}'s ${timeframe.replace('_', ' ')} stats: ${statsText}`,
          speak: true,
          data: playerData
        };
      } else {
        return {
          text: `I couldn't find current stats for ${playerName}. They might not be in our database or the name might be spelled differently.`,
          speak: true
        };
      }
    } catch (error) {
      return {
        text: `I'm having trouble accessing player stats right now. Please try again in a moment.`,
        speak: true
      };
    }
  }

  async generateTeamAnalysisResponse(entities, originalText) {
    const team = entities.teams[0] || 'the team';
    
    try {
      const teamData = await this.sportsData.getTeamData(team);
      
      if (teamData) {
        const analysis = this.formatTeamAnalysis(teamData);
        return {
          text: `The ${team} ${analysis}`,
          speak: true,
          data: teamData
        };
      } else {
        return {
          text: `I don't have current data for the ${team}. Please check the team name.`,
          speak: true
        };
      }
    } catch (error) {
      return {
        text: `I'm having trouble accessing team data right now. Please try again.`,
        speak: true
      };
    }
  }

  async generatePredictionResponse(entities, originalText) {
    const team = entities.teams[0];
    
    if (!team) {
      return {
        text: "I need more information to make a prediction. Which team are you asking about?",
        speak: true
      };
    }

    try {
      const prediction = await this.analyticsEngine.generatePrediction(team);
      
      return {
        text: `Based on current performance data, ${prediction.summary}`,
        speak: true,
        data: prediction
      };
    } catch (error) {
      return {
        text: "I'm unable to generate predictions right now. Please try again later.",
        speak: true
      };
    }
  }

  generateErrorResponse() {
    const templates = this.responseTemplates.error;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      text: randomTemplate,
      speak: true
    };
  }

  formatPlayerStats(playerData) {
    const stats = [];
    
    if (playerData.batting_average) {
      stats.push(`batting ${playerData.batting_average}`);
    }
    if (playerData.home_runs) {
      stats.push(`${playerData.home_runs} home runs`);
    }
    if (playerData.rbi) {
      stats.push(`${playerData.rbi} RBIs`);
    }
    if (playerData.era) {
      stats.push(`${playerData.era} ERA`);
    }
    if (playerData.points) {
      stats.push(`${playerData.points} points per game`);
    }

    return stats.join(', ') || 'standard performance metrics';
  }

  formatTeamAnalysis(teamData) {
    const record = teamData.wins && teamData.losses ? 
      `are ${teamData.wins}-${teamData.losses}` : 
      `are performing at league average`;
    
    const trend = teamData.recent_trend || 'maintaining steady performance';
    
    return `${record} and ${trend}.`;
  }

  async deliverResponse(response) {
    console.log(`💬 Response: ${response.text}`);
    
    // Trigger response handlers
    this.onResponse(response);

    // Speak response if enabled
    if (response.speak && this.config.responseMode !== 'text') {
      await this.speakText(response.text);
    }

    return response;
  }

  async speakText(text) {
    if (!this.synthesis) {
      console.log('Speech synthesis not available');
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Find a suitable voice (prefer English)
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      return new Promise((resolve, reject) => {
        utterance.onend = resolve;
        utterance.onerror = reject;
        this.synthesis.speak(utterance);
      });

    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  }

  // Conversation management
  getConversationHistory(limit = 10) {
    return this.conversationContext.slice(-limit);
  }

  clearConversation() {
    this.conversationContext = [];
  }

  // Context awareness
  addContext(key, value) {
    const contextEntry = {
      type: 'context',
      key,
      value,
      timestamp: Date.now()
    };
    this.conversationContext.push(contextEntry);
  }

  getContext(key) {
    const contexts = this.conversationContext
      .filter(entry => entry.type === 'context' && entry.key === key)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return contexts.length > 0 ? contexts[0].value : null;
  }

  // Event handlers (override in implementation)
  onListeningStart() {
    console.log('🎤 Listening started');
  }

  onListeningEnd() {
    console.log('🎤 Listening ended');
  }

  onResponse(response) {
    console.log('💬 Response delivered:', response);
  }

  onError(error) {
    console.error('Voice interface error:', error);
  }

  // Utility methods
  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  getStatus() {
    return {
      isListening: this.isListening,
      supported: this.isSupported(),
      contextSize: this.conversationContext.length,
      config: this.config
    };
  }

  // Configuration updates
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.lang = this.config.language;
    }
  }

  // Natural language processing helpers
  extractNumbers(text) {
    const numbers = text.match(/\d+(?:\.\d+)?/g);
    return numbers ? numbers.map(n => parseFloat(n)) : [];
  }

  extractDates(text) {
    const datePatterns = [
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:,?\s+\d{4})?\b/i,
      /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/,
      /\b\d{4}-\d{2}-\d{2}\b/
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) return matches;
    }
    
    return [];
  }

  // Performance optimization
  precompilePatterns() {
    // Pre-compile frequently used regex patterns for better performance
    this.compiledPatterns = {};
    
    for (const [intentType, patterns] of Object.entries(this.intentPatterns)) {
      this.compiledPatterns[intentType] = patterns.map(pattern => 
        typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern
      );
    }
  }

  // Cleanup
  destroy() {
    this.stopListening();
    
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    
    this.conversationContext = [];
    this.recognition = null;
    this.synthesis = null;
    
    console.log('🎤 Voice interface destroyed');
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeVoiceInterface };
} else if (typeof window !== 'undefined') {
  window.BlazeVoiceInterface = BlazeVoiceInterface;
}

/**
 * Usage Examples:
 * 
 * // Initialize voice interface
 * const voiceInterface = new BlazeVoiceInterface({
 *   language: 'en-US',
 *   responseMode: 'both',
 *   confidenceThreshold: 0.8
 * });
 * 
 * // Start listening
 * voiceInterface.startListening();
 * 
 * // Handle responses
 * voiceInterface.onResponse = (response) => {
 *   console.log('AI Response:', response.text);
 *   if (response.data) {
 *     updateUI(response.data);
 *   }
 * };
 * 
 * // Example voice commands:
 * // "What are Goldschmidt's stats?"
 * // "How are the Cardinals doing?"
 * // "Compare Mahomes to Brady"
 * // "Predict the next Titans game"
 * // "Show me injury reports for Memphis"
 */