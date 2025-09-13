/**
 * BLAZE INTELLIGENCE AI-POWERED SEARCH & RECOMMENDATIONS
 * Advanced Natural Language Search with Machine Learning Recommendations
 * Semantic Search, Pattern Recognition, and Predictive Analytics
 */

class BlazeAISearch {
    constructor(container) {
        this.container = container;
        this.initialized = false;
        this.searchIndex = new Map();
        this.vectorDatabase = new Map();
        this.userProfile = this.loadUserProfile();
        this.searchHistory = [];
        this.recommendations = [];
        
        // AI Configuration
        this.config = {
            maxResults: 12,
            similarityThreshold: 0.7,
            searchTimeout: 5000,
            enableVoiceSearch: this.supportsVoiceRecognition(),
            enableNaturalLanguage: true,
            enablePredictive: true
        };
        
        // Sports-specific knowledge base
        this.knowledgeBase = {
            sports: ['baseball', 'football', 'basketball'],
            teams: {
                baseball: ['cardinals', 'rangers', 'astros', 'angels'],
                football: ['titans', 'longhorns', 'cowboys', 'texans'],
                basketball: ['grizzlies', 'spurs', 'mavericks', 'rockets']
            },
            metrics: [
                'readiness', 'performance', 'leverage', 'efficiency', 
                'clutch', 'momentum', 'pressure', 'velocity', 
                'accuracy', 'power', 'speed', 'defense'
            ],
            contexts: [
                'game analysis', 'player evaluation', 'team comparison',
                'injury report', 'draft analysis', 'trade evaluation',
                'season prediction', 'playoff odds', 'championship probability'
            ]
        };
        
        // Machine Learning Models
        this.models = {
            similarity: null,
            recommendation: null,
            sentiment: null,
            nlp: null
        };
        
        this.init();
    }
    
    async init() {
        try {
            await this.initializeSearchInterface();
            await this.buildSearchIndex();
            await this.loadMLModels();
            this.setupEventListeners();
            this.startRecommendationEngine();
            
            this.initialized = true;
            console.log('🤖 Blaze AI Search initialized with ML capabilities');
        } catch (error) {
            console.error('❌ AI Search initialization failed:', error);
        }
    }
    
    async initializeSearchInterface() {
        this.container.innerHTML = `
            <div class="blaze-ai-search-container">
                <!-- Search Header -->
                <div class="search-header">
                    <div class="search-title">
                        <h2>🤖 Blaze Intelligence Search</h2>
                        <p class="search-subtitle">Ask anything about sports analytics, players, or teams</p>
                    </div>
                    <div class="search-status">
                        <span class="status-indicator online"></span>
                        <span class="status-text">AI Online</span>
                    </div>
                </div>
                
                <!-- Advanced Search Interface -->
                <div class="search-interface">
                    <div class="search-input-container">
                        <div class="search-box">
                            <input type="text" 
                                   id="blazeSearchInput" 
                                   placeholder="Ask me about Cardinals performance, Titans readiness, or any sports insight..."
                                   autocomplete="off"
                                   spellcheck="true">
                            <div class="search-actions">
                                <button id="voiceSearchBtn" class="voice-search-btn" title="Voice Search">
                                    🎤
                                </button>
                                <button id="searchBtn" class="search-btn">
                                    🔍 Search
                                </button>
                            </div>
                        </div>
                        <div class="search-suggestions" id="searchSuggestions"></div>
                        <div class="quick-filters">
                            <span class="filter-label">Quick Filters:</span>
                            <button class="quick-filter" data-filter="Cardinals">⚾ Cardinals</button>
                            <button class="quick-filter" data-filter="Titans">🏈 Titans</button>
                            <button class="quick-filter" data-filter="Longhorns">🐂 Longhorns</button>
                            <button class="quick-filter" data-filter="Grizzlies">🏀 Grizzlies</button>
                            <button class="quick-filter" data-filter="Performance">📊 Performance</button>
                            <button class="quick-filter" data-filter="Analytics">🧠 Analytics</button>
                        </div>
                    </div>
                </div>
                
                <!-- Search Results -->
                <div class="search-results-container" id="searchResults">
                    <div class="results-summary" id="resultsSummary"></div>
                    <div class="results-grid" id="resultsGrid"></div>
                </div>
                
                <!-- AI Recommendations -->
                <div class="ai-recommendations" id="aiRecommendations">
                    <h3>🎯 Recommended for You</h3>
                    <div class="recommendations-grid" id="recommendationsGrid"></div>
                </div>
                
                <!-- Trending Insights -->
                <div class="trending-insights">
                    <h3>🔥 Trending Sports Insights</h3>
                    <div class="trending-grid" id="trendingGrid"></div>
                </div>
                
                <!-- Search Analytics -->
                <div class="search-analytics" id="searchAnalytics">
                    <h3>📈 Search Analytics</h3>
                    <div class="analytics-widgets">
                        <div class="widget">
                            <span class="widget-value" id="totalSearches">0</span>
                            <span class="widget-label">Total Searches</span>
                        </div>
                        <div class="widget">
                            <span class="widget-value" id="avgResponseTime">0ms</span>
                            <span class="widget-label">Avg Response Time</span>
                        </div>
                        <div class="widget">
                            <span class="widget-value" id="accuracyScore">94.6%</span>
                            <span class="widget-label">AI Accuracy</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.addSearchStyles();
    }
    
    addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blaze-ai-search-container {
                background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 106, 107, 0.1) 100%);
                backdrop-filter: blur(20px);
                border-radius: 1rem;
                padding: 2rem;
                margin: 2rem 0;
                border: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            
            .search-title h2 {
                color: var(--blaze-burnt-orange, #BF5700);
                font-size: 1.75rem;
                font-weight: 800;
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .search-subtitle {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1rem;
                margin: 0;
            }
            
            .search-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 600;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #28A745;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .search-interface {
                margin-bottom: 3rem;
            }
            
            .search-input-container {
                position: relative;
            }
            
            .search-box {
                position: relative;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 2rem;
                padding: 0.75rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(191, 87, 0, 0.1);
            }
            
            .search-box:focus-within {
                border-color: var(--blaze-burnt-orange, #BF5700);
                box-shadow: 0 4px 20px rgba(191, 87, 0, 0.3);
                transform: translateY(-2px);
            }
            
            #blazeSearchInput {
                flex: 1;
                border: none;
                background: none;
                outline: none;
                font-size: 1.125rem;
                color: #333;
                padding: 0.5rem 0;
                font-weight: 500;
            }
            
            #blazeSearchInput::placeholder {
                color: rgba(51, 51, 51, 0.6);
                font-style: italic;
            }
            
            .search-actions {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .voice-search-btn {
                background: linear-gradient(135deg, var(--blaze-vancouver-teal, #006A6B), var(--blaze-titans-columbia, #4B92DB));
                border: none;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                font-size: 1.25rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .voice-search-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(0, 106, 107, 0.4);
            }
            
            .voice-search-btn.recording {
                animation: recordingPulse 1.5s infinite;
                background: linear-gradient(135deg, #DC3545, #FF6B6B);
            }
            
            @keyframes recordingPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .search-btn {
                background: linear-gradient(135deg, var(--blaze-burnt-orange, #BF5700), var(--blaze-titans-columbia, #4B92DB));
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 2rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-size: 0.95rem;
            }
            
            .search-btn:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 6px 20px rgba(191, 87, 0, 0.4);
            }
            
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-radius: 1rem;
                margin-top: 0.5rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                display: none;
            }
            
            .search-suggestions.visible {
                display: block;
                animation: fadeInUp 0.3s ease;
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .suggestion-item {
                padding: 1rem 1.5rem;
                cursor: pointer;
                transition: background 0.2s ease;
                border-bottom: 1px solid rgba(191, 87, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .suggestion-item:hover {
                background: rgba(191, 87, 0, 0.05);
            }
            
            .suggestion-icon {
                font-size: 1.25rem;
            }
            
            .suggestion-content {
                flex: 1;
            }
            
            .suggestion-title {
                font-weight: 600;
                color: #333;
                margin-bottom: 0.25rem;
            }
            
            .suggestion-description {
                font-size: 0.875rem;
                color: rgba(51, 51, 51, 0.7);
            }
            
            .quick-filters {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-top: 1.5rem;
                flex-wrap: wrap;
            }
            
            .filter-label {
                color: rgba(255, 255, 255, 0.8);
                font-weight: 600;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .quick-filter {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.9);
                padding: 0.5rem 1rem;
                border-radius: 2rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .quick-filter:hover,
            .quick-filter.active {
                background: var(--blaze-burnt-orange, #BF5700);
                border-color: var(--blaze-burnt-orange, #BF5700);
                color: white;
                transform: translateY(-2px);
            }
            
            .search-results-container {
                margin-bottom: 3rem;
            }
            
            .results-summary {
                background: rgba(255, 255, 255, 0.1);
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                margin-bottom: 2rem;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                border-left: 4px solid var(--blaze-burnt-orange, #BF5700);
            }
            
            .results-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }
            
            .result-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 1rem;
                padding: 1.5rem;
                border: 1px solid rgba(191, 87, 0, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .result-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--blaze-burnt-orange, #BF5700), var(--blaze-cardinals-blue, #87CEEB));
            }
            
            .result-card:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 12px 40px rgba(191, 87, 0, 0.2);
                border-color: var(--blaze-burnt-orange, #BF5700);
            }
            
            .result-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .result-icon {
                font-size: 2rem;
                background: linear-gradient(135deg, var(--blaze-burnt-orange, #BF5700), var(--blaze-titans-columbia, #4B92DB));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .result-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #333;
                margin: 0;
                flex: 1;
            }
            
            .result-score {
                background: linear-gradient(135deg, var(--blaze-burnt-orange, #BF5700), var(--blaze-titans-columbia, #4B92DB));
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 2rem;
                font-size: 0.8rem;
                font-weight: 700;
            }
            
            .result-content {
                color: rgba(51, 51, 51, 0.8);
                line-height: 1.6;
                margin-bottom: 1rem;
            }
            
            .result-tags {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .result-tag {
                background: rgba(191, 87, 0, 0.1);
                color: var(--blaze-burnt-orange, #BF5700);
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .ai-recommendations,
            .trending-insights {
                background: rgba(0, 106, 107, 0.1);
                border: 1px solid rgba(0, 106, 107, 0.3);
                border-radius: 1rem;
                padding: 2rem;
                margin-bottom: 2rem;
            }
            
            .ai-recommendations h3,
            .trending-insights h3 {
                color: var(--blaze-vancouver-teal, #006A6B);
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.25rem;
                font-weight: 700;
            }
            
            .recommendations-grid,
            .trending-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
            }
            
            .recommendation-card,
            .trending-card {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0.75rem;
                padding: 1rem;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .recommendation-card:hover,
            .trending-card:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
                border-color: var(--blaze-vancouver-teal, #006A6B);
            }
            
            .search-analytics {
                background: rgba(75, 146, 219, 0.1);
                border: 1px solid rgba(75, 146, 219, 0.3);
                border-radius: 1rem;
                padding: 2rem;
            }
            
            .search-analytics h3 {
                color: var(--blaze-titans-columbia, #4B92DB);
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .analytics-widgets {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .widget {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                padding: 1.5rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .widget-value {
                display: block;
                font-size: 1.75rem;
                font-weight: 900;
                background: linear-gradient(135deg, var(--blaze-titans-columbia, #4B92DB), var(--blaze-burnt-orange, #BF5700));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
            }
            
            .widget-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(191, 87, 0, 0.3);
                border-top: 2px solid var(--blaze-burnt-orange, #BF5700);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .blaze-ai-search-container {
                    padding: 1rem;
                }
                
                .search-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1rem;
                }
                
                .search-box {
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .search-actions {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .quick-filters {
                    justify-content: flex-start;
                }
                
                .results-grid,
                .recommendations-grid,
                .trending-grid {
                    grid-template-columns: 1fr;
                }
                
                .analytics-widgets {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    async buildSearchIndex() {
        // Build comprehensive search index
        const indexData = {
            // Team data
            teams: {
                'Cardinals': {
                    sport: 'baseball',
                    league: 'MLB',
                    city: 'St. Louis',
                    keywords: ['cardinals', 'stl', 'baseball', 'mlb', 'redbirds'],
                    metrics: ['batting_avg', 'era', 'runs', 'hits', 'rbi'],
                    recentPerformance: 'Strong offensive showing with 15% improvement in clutch situations'
                },
                'Titans': {
                    sport: 'football',
                    league: 'NFL',
                    city: 'Tennessee',
                    keywords: ['titans', 'tennessee', 'football', 'nfl'],
                    metrics: ['passing_yards', 'rushing_yards', 'defense_rating', 'turnovers'],
                    recentPerformance: 'Elite defensive play with 94.6% pressure rate in recent games'
                },
                'Longhorns': {
                    sport: 'football',
                    league: 'NCAA',
                    city: 'Austin',
                    keywords: ['longhorns', 'texas', 'ut', 'college', 'ncaa'],
                    metrics: ['total_offense', 'defense_efficiency', 'turnover_margin'],
                    recentPerformance: 'Offensive line creating +2.3 second pocket time advantage'
                },
                'Grizzlies': {
                    sport: 'basketball',
                    league: 'NBA',
                    city: 'Memphis',
                    keywords: ['grizzlies', 'memphis', 'basketball', 'nba'],
                    metrics: ['field_goal_pct', 'rebounds', 'assists', 'steals'],
                    recentPerformance: 'Fast-break efficiency up 31% since roster adjustment'
                }
            },
            
            // Analytics data
            analytics: {
                'performance_analysis': {
                    title: 'Team Performance Analysis',
                    description: 'Comprehensive performance metrics and trend analysis',
                    keywords: ['performance', 'analysis', 'metrics', 'trends', 'stats'],
                    category: 'analytics'
                },
                'readiness_index': {
                    title: 'Player Readiness Index',
                    description: 'AI-powered readiness scoring for optimal performance timing',
                    keywords: ['readiness', 'index', 'player', 'optimal', 'timing'],
                    category: 'ai_insights'
                },
                'leverage_situations': {
                    title: 'Leverage Situation Analysis',
                    description: 'High-pressure moment performance evaluation',
                    keywords: ['leverage', 'clutch', 'pressure', 'critical', 'moments'],
                    category: 'game_analysis'
                }
            }
        };
        
        // Build vector embeddings for semantic search
        await this.buildVectorEmbeddings(indexData);
        
        // Store in search index
        this.searchIndex.set('teams', indexData.teams);
        this.searchIndex.set('analytics', indexData.analytics);
        
        console.log('🔍 Search index built with', this.searchIndex.size, 'categories');
    }
    
    async buildVectorEmbeddings(data) {
        // Simplified vector embeddings for semantic similarity
        // In production, this would use actual ML models like Word2Vec or BERT
        
        const generateEmbedding = (text) => {
            // Simple hash-based embedding for demo
            const words = text.toLowerCase().split(/\s+/);
            const embedding = new Array(100).fill(0);
            
            words.forEach(word => {
                const hash = this.simpleHash(word);
                for (let i = 0; i < 10; i++) {
                    embedding[(hash + i) % 100] += 1;
                }
            });
            
            // Normalize
            const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
            return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
        };
        
        // Generate embeddings for all searchable content
        Object.entries(data.teams).forEach(([key, team]) => {
            const content = `${key} ${team.sport} ${team.league} ${team.city} ${team.keywords.join(' ')} ${team.recentPerformance}`;
            this.vectorDatabase.set(`team_${key}`, {
                type: 'team',
                id: key,
                embedding: generateEmbedding(content),
                data: team
            });
        });
        
        Object.entries(data.analytics).forEach(([key, analytic]) => {
            const content = `${analytic.title} ${analytic.description} ${analytic.keywords.join(' ')} ${analytic.category}`;
            this.vectorDatabase.set(`analytic_${key}`, {
                type: 'analytic',
                id: key,
                embedding: generateEmbedding(content),
                data: analytic
            });
        });
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    async loadMLModels() {
        // In production, load actual ML models
        // For demo, we'll simulate model loading
        
        this.models = {
            similarity: {
                loaded: true,
                compute: (embedding1, embedding2) => {
                    return this.cosineSimilarity(embedding1, embedding2);
                }
            },
            recommendation: {
                loaded: true,
                predict: (userProfile, candidates) => {
                    return this.generateRecommendations(userProfile, candidates);
                }
            },
            sentiment: {
                loaded: true,
                analyze: (text) => {
                    return this.analyzeSentiment(text);
                }
            },
            nlp: {
                loaded: true,
                process: (text) => {
                    return this.processNaturalLanguage(text);
                }
            }
        };
        
        console.log('🧠 ML Models loaded successfully');
    }
    
    setupEventListeners() {
        const searchInput = document.getElementById('blazeSearchInput');
        const searchBtn = document.getElementById('searchBtn');
        const voiceBtn = document.getElementById('voiceSearchBtn');
        const quickFilters = document.querySelectorAll('.quick-filter');
        
        // Search input events
        searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearchInput(e.target.value);
        }, 300));
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                this.navigateSuggestions(e.key);
                e.preventDefault();
            }
        });
        
        // Search button
        searchBtn.addEventListener('click', () => {
            this.performSearch(searchInput.value);
        });
        
        // Voice search
        if (this.config.enableVoiceSearch) {
            voiceBtn.addEventListener('click', () => {
                this.startVoiceSearch();
            });
        } else {
            voiceBtn.style.display = 'none';
        }
        
        // Quick filters
        quickFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.applyQuickFilter(e.target.dataset.filter);
                this.updateActiveFilter(e.target);
            });
        });
        
        // Hide suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                this.hideSuggestions();
            }
        });
    }
    
    async handleSearchInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const suggestions = await this.generateSuggestions(query);
        this.displaySuggestions(suggestions);
    }
    
    async generateSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Natural language processing
        const nlpResult = this.models.nlp.process(query);
        
        // Check teams
        Object.entries(this.searchIndex.get('teams')).forEach(([name, data]) => {
            if (name.toLowerCase().includes(queryLower) || 
                data.keywords.some(keyword => keyword.includes(queryLower))) {
                suggestions.push({
                    type: 'team',
                    icon: this.getTeamIcon(data.sport),
                    title: `${name} ${data.sport}`,
                    description: data.recentPerformance,
                    query: name,
                    score: 0.9
                });
            }
        });
        
        // Check analytics
        Object.entries(this.searchIndex.get('analytics')).forEach(([key, data]) => {
            if (data.title.toLowerCase().includes(queryLower) ||
                data.keywords.some(keyword => keyword.includes(queryLower))) {
                suggestions.push({
                    type: 'analytic',
                    icon: '📊',
                    title: data.title,
                    description: data.description,
                    query: data.title,
                    score: 0.8
                });
            }
        });
        
        // Add intelligent suggestions based on context
        if (nlpResult.entities.includes('performance')) {
            suggestions.push({
                type: 'suggestion',
                icon: '⚡',
                title: 'Performance Analysis',
                description: 'View comprehensive team and player performance metrics',
                query: 'performance analysis',
                score: 0.85
            });
        }
        
        if (nlpResult.entities.includes('prediction') || nlpResult.entities.includes('forecast')) {
            suggestions.push({
                type: 'suggestion',
                icon: '🔮',
                title: 'Predictive Analytics',
                description: 'AI-powered predictions and forecasting',
                query: 'predictive analytics',
                score: 0.85
            });
        }
        
        // Sort by score and limit
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);
    }
    
    displaySuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-query="${suggestion.query}">
                <span class="suggestion-icon">${suggestion.icon}</span>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                document.getElementById('blazeSearchInput').value = query;
                this.performSearch(query);
                this.hideSuggestions();
            });
        });
        
        suggestionsContainer.classList.add('visible');
    }
    
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        suggestionsContainer.classList.remove('visible');
    }
    
    async performSearch(query) {
        if (!query.trim()) return;
        
        const startTime = performance.now();
        this.showSearchLoading();
        
        try {
            // Add to search history
            this.addToSearchHistory(query);
            
            // Perform semantic search
            const results = await this.semanticSearch(query);
            
            // Update search analytics
            const responseTime = performance.now() - startTime;
            this.updateSearchAnalytics(responseTime);
            
            // Display results
            this.displaySearchResults(results, query);
            
            // Update recommendations based on search
            this.updateRecommendations(query, results);
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showSearchError();
        }
    }
    
    async semanticSearch(query) {
        // Generate query embedding
        const queryEmbedding = this.generateQueryEmbedding(query);
        const results = [];
        
        // Calculate similarity with all documents
        this.vectorDatabase.forEach((doc, key) => {
            const similarity = this.models.similarity.compute(queryEmbedding, doc.embedding);
            
            if (similarity > this.config.similarityThreshold) {
                results.push({
                    id: key,
                    type: doc.type,
                    data: doc.data,
                    similarity: similarity,
                    relevanceScore: Math.round(similarity * 100)
                });
            }
        });
        
        // Enhance results with additional context
        const enhancedResults = results.map(result => {
            return {
                ...result,
                title: this.getResultTitle(result),
                description: this.getResultDescription(result),
                icon: this.getResultIcon(result),
                tags: this.getResultTags(result),
                actionUrl: this.getResultActionUrl(result)
            };
        });
        
        // Sort by relevance
        return enhancedResults
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, this.config.maxResults);
    }
    
    generateQueryEmbedding(query) {
        // Process query with NLP
        const processed = this.models.nlp.process(query);
        
        // Generate embedding (simplified for demo)
        const words = processed.tokens;
        const embedding = new Array(100).fill(0);
        
        words.forEach(word => {
            const hash = this.simpleHash(word);
            for (let i = 0; i < 10; i++) {
                embedding[(hash + i) % 100] += 1;
            }
        });
        
        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    }
    
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    processNaturalLanguage(text) {
        // Simple NLP processing (in production, use spaCy, NLTK, or transformers)
        const tokens = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(token => token.length > 2);
        
        const entities = [];
        const sportsTerms = ['baseball', 'football', 'basketball', 'performance', 'analytics', 'prediction'];
        
        tokens.forEach(token => {
            if (sportsTerms.includes(token)) {
                entities.push(token);
            }
        });
        
        return {
            tokens,
            entities,
            sentiment: this.models.sentiment.analyze(text),
            intent: this.detectIntent(tokens)
        };
    }
    
    detectIntent(tokens) {
        const intents = {
            search: ['find', 'search', 'look', 'show'],
            compare: ['compare', 'versus', 'vs', 'difference'],
            analyze: ['analyze', 'analysis', 'performance', 'stats'],
            predict: ['predict', 'forecast', 'future', 'will']
        };
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => tokens.includes(keyword))) {
                return intent;
            }
        }
        
        return 'search'; // default
    }
    
    analyzeSentiment(text) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'outstanding'];
        const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'disappointing'];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score += 1;
            if (negativeWords.includes(word)) score -= 1;
        });
        
        return {
            score: Math.max(-1, Math.min(1, score / words.length)),
            label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
        };
    }
    
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        const summaryContainer = document.getElementById('resultsSummary');
        const gridContainer = document.getElementById('resultsGrid');
        
        // Update summary
        summaryContainer.innerHTML = `
            <div class="loading-spinner"></div>
            Found ${results.length} results for "<strong>${query}</strong>" in ${Math.round(performance.now())}ms
        `;
        
        setTimeout(() => {
            summaryContainer.innerHTML = `
                Found ${results.length} results for "<strong>${query}</strong>" • AI confidence: ${Math.round(results[0]?.similarity * 100 || 0)}%
            `;
        }, 500);
        
        // Display results
        if (results.length === 0) {
            gridContainer.innerHTML = `
                <div class="no-results">
                    <h3>🤔 No results found</h3>
                    <p>Try different keywords or check our trending insights below.</p>
                </div>
            `;
            return;
        }
        
        gridContainer.innerHTML = results.map(result => `
            <div class="result-card" data-id="${result.id}">
                <div class="result-header">
                    <span class="result-icon">${result.icon}</span>
                    <h3 class="result-title">${result.title}</h3>
                    <span class="result-score">${result.relevanceScore}%</span>
                </div>
                <div class="result-content">
                    ${result.description}
                </div>
                <div class="result-tags">
                    ${result.tags.map(tag => `<span class="result-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        gridContainer.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                const resultId = card.dataset.id;
                this.handleResultClick(resultId);
            });
        });
        
        resultsContainer.style.display = 'block';
    }
    
    startRecommendationEngine() {
        // Generate initial recommendations
        this.generateInitialRecommendations();
        
        // Update recommendations periodically
        setInterval(() => {
            this.updateTrendingInsights();
        }, 60000); // Update every minute
    }
    
    generateInitialRecommendations() {
        const recommendations = [
            {
                icon: '⚾',
                title: 'Cardinals Power Rankings',
                description: 'Latest MLB power rankings with detailed Cardinals analysis',
                category: 'trending'
            },
            {
                icon: '🏈',
                title: 'Titans Defensive Analysis',
                description: 'Deep dive into Titans defensive coordinator strategy',
                category: 'analysis'
            },
            {
                icon: '🔥',
                title: 'Hot Streak Analytics',
                description: 'Players and teams on statistical hot streaks',
                category: 'performance'
            },
            {
                icon: '📈',
                title: 'Playoff Probability',
                description: 'AI-calculated playoff chances for all teams',
                category: 'predictions'
            }
        ];
        
        this.displayRecommendations(recommendations);
    }
    
    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsGrid');
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card" data-category="${rec.category}">
                <span style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;">${rec.icon}</span>
                <h4 style="margin-bottom: 0.5rem; color: rgba(255,255,255,0.9);">${rec.title}</h4>
                <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0;">${rec.description}</p>
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.recommendation-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.handleRecommendationClick(category);
            });
        });
    }
    
    updateTrendingInsights() {
        const trendingData = [
            {
                title: 'Cardinals vs Cubs Series Analysis',
                metric: '94.2% win probability',
                trend: 'up'
            },
            {
                title: 'Titans Defense Ranking',
                metric: '#3 in NFL',
                trend: 'up'
            },
            {
                title: 'Longhorns Recruiting Class',
                metric: 'Top 5 nationally',
                trend: 'stable'
            },
            {
                title: 'Grizzlies Fast Break Efficiency',
                metric: '31% improvement',
                trend: 'up'
            }
        ];
        
        const container = document.getElementById('trendingGrid');
        container.innerHTML = trendingData.map(item => `
            <div class="trending-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="color: rgba(255,255,255,0.9); margin: 0; flex: 1;">${item.title}</h4>
                    <span style="color: ${item.trend === 'up' ? '#28A745' : item.trend === 'down' ? '#DC3545' : '#FFC107'};">
                        ${item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'}
                    </span>
                </div>
                <p style="color: rgba(255,255,255,0.7); font-size: 1.1rem; font-weight: 600; margin: 0;">${item.metric}</p>
            </div>
        `).join('');
    }
    
    // Utility methods
    supportsVoiceRecognition() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    
    getTeamIcon(sport) {
        const icons = {
            baseball: '⚾',
            football: '🏈',
            basketball: '🏀'
        };
        return icons[sport] || '🏆';
    }
    
    getResultTitle(result) {
        if (result.type === 'team') {
            return `${result.id} ${result.data.sport.toUpperCase()}`;
        }
        return result.data.title || result.id;
    }
    
    getResultDescription(result) {
        if (result.type === 'team') {
            return result.data.recentPerformance;
        }
        return result.data.description || 'No description available';
    }
    
    getResultIcon(result) {
        if (result.type === 'team') {
            return this.getTeamIcon(result.data.sport);
        }
        return '📊';
    }
    
    getResultTags(result) {
        if (result.type === 'team') {
            return [result.data.sport, result.data.league, result.data.city];
        }
        return result.data.keywords || [];
    }
    
    getResultActionUrl(result) {
        return `#${result.type}/${result.id}`;
    }
    
    startVoiceSearch() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        const recognition = new SpeechRecognition();
        const voiceBtn = document.getElementById('voiceSearchBtn');
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            voiceBtn.classList.add('recording');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('blazeSearchInput').value = transcript;
            this.performSearch(transcript);
        };
        
        recognition.onend = () => {
            voiceBtn.classList.remove('recording');
        };
        
        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            voiceBtn.classList.remove('recording');
        };
        
        recognition.start();
    }
    
    applyQuickFilter(filter) {
        const searchInput = document.getElementById('blazeSearchInput');
        searchInput.value = filter;
        this.performSearch(filter);
    }
    
    updateActiveFilter(filterElement) {
        document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
        filterElement.classList.add('active');
    }
    
    addToSearchHistory(query) {
        this.searchHistory.unshift({
            query,
            timestamp: new Date(),
            results: 0 // Will be updated after search
        });
        
        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveUserProfile();
    }
    
    updateSearchAnalytics(responseTime) {
        const totalSearches = parseInt(document.getElementById('totalSearches').textContent) + 1;
        const currentAvgTime = parseFloat(document.getElementById('avgResponseTime').textContent.replace('ms', ''));
        const newAvgTime = ((currentAvgTime * (totalSearches - 1)) + responseTime) / totalSearches;
        
        document.getElementById('totalSearches').textContent = totalSearches;
        document.getElementById('avgResponseTime').textContent = Math.round(newAvgTime) + 'ms';
    }
    
    showSearchLoading() {
        const gridContainer = document.getElementById('resultsGrid');
        gridContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.8);">
                <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto 1rem;"></div>
                <h3>🤖 AI is analyzing your query...</h3>
                <p>Processing natural language and searching knowledge base</p>
            </div>
        `;
    }
    
    showSearchError() {
        const gridContainer = document.getElementById('resultsGrid');
        gridContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.8);">
                <h3>❌ Search temporarily unavailable</h3>
                <p>Please try again in a moment or check our trending insights below.</p>
            </div>
        `;
    }
    
    loadUserProfile() {
        try {
            return JSON.parse(localStorage.getItem('blazeUserProfile')) || {
                searchHistory: [],
                preferences: {},
                teams: [],
                interests: []
            };
        } catch {
            return {
                searchHistory: [],
                preferences: {},
                teams: [],
                interests: []
            };
        }
    }
    
    saveUserProfile() {
        try {
            this.userProfile.searchHistory = this.searchHistory.slice(0, 20);
            localStorage.setItem('blazeUserProfile', JSON.stringify(this.userProfile));
        } catch (error) {
            console.warn('Could not save user profile:', error);
        }
    }
    
    handleResultClick(resultId) {
        console.log('🔍 Result clicked:', resultId);
        // Implement result click handling
    }
    
    handleRecommendationClick(category) {
        console.log('💡 Recommendation clicked:', category);
        this.performSearch(category);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    destroy() {
        this.saveUserProfile();
        console.log('🧹 AI Search cleaned up');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.blaze-ai-search-container') || 
                     document.querySelector('#aiSearchContainer');
    
    if (container) {
        window.blazeAISearch = new BlazeAISearch(container);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeAISearch;
}