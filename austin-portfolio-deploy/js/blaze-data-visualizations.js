/**
 * BLAZE INTELLIGENCE ADVANCED DATA VISUALIZATIONS
 * Professional Sports Analytics Visualization Components
 * Enhanced D3.js and Chart.js Integration with Three.js Stadium Environment
 */

class BlazeDataVisualizations {
    constructor(container) {
        this.container = container;
        this.initialized = false;
        this.charts = new Map();
        this.animations = new Map();
        this.realTimeFeeds = new Map();
        
        // Brand color system
        this.colors = {
            primary: '#BF5700',           // Burnt Orange Heritage
            secondary: '#87CEEB',         // Cardinals Blue
            accent: '#006A6B',           // Vancouver Teal
            titans: '#4B92DB',           // Titans Columbia
            success: '#28A745',
            warning: '#FFC107',
            danger: '#DC3545',
            dark: '#1A1A1A',
            light: '#FAFAFA'
        };
        
        this.gradients = {
            sunset: ['#BF5700', '#4B92DB'],
            championship: ['#87CEEB', '#006A6B'],
            heritage: ['#A34700', '#1A1A1A']
        };
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadDependencies();
            this.setupContainer();
            this.initializeChartSystems();
            this.startRealTimeUpdates();
            this.initialized = true;
            
            console.log('🏆 Blaze Data Visualizations initialized');
        } catch (error) {
            console.error('❌ Failed to initialize data visualizations:', error);
        }
    }
    
    async loadDependencies() {
        // Load D3.js for advanced visualizations
        if (!window.d3) {
            await this.loadScript('https://d3js.org/d3.v7.min.js');
        }
        
        // Load Chart.js for standard charts
        if (!window.Chart) {
            await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.min.js');
        }
        
        // Load additional Chart.js plugins
        await this.loadScript('https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js');
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    setupContainer() {
        this.container.innerHTML = `
            <div class="blaze-analytics-dashboard">
                <!-- Real-time Metrics Header -->
                <div class="blaze-metrics-header">
                    <div class="blaze-metric-card live-score-card">
                        <div class="metric-value" id="liveScore">0-0</div>
                        <div class="metric-label">LIVE SCORE</div>
                        <div class="live-indicator"></div>
                    </div>
                    <div class="blaze-metric-card readiness-card">
                        <div class="metric-value" id="readinessScore">94.6</div>
                        <div class="metric-label">READINESS INDEX</div>
                    </div>
                    <div class="blaze-metric-card leverage-card">
                        <div class="metric-value" id="leverageIndex">2.8</div>
                        <div class="metric-label">LEVERAGE FACTOR</div>
                    </div>
                    <div class="blaze-metric-card performance-card">
                        <div class="metric-value" id="performanceIndex">87.3</div>
                        <div class="metric-label">PERFORMANCE %</div>
                    </div>
                </div>
                
                <!-- Interactive Charts Grid -->
                <div class="blaze-charts-grid">
                    <div class="chart-section">
                        <h3>Player Performance Trajectory</h3>
                        <canvas id="performanceChart"></canvas>
                    </div>
                    <div class="chart-section">
                        <h3>Team Readiness Heatmap</h3>
                        <div id="readinessHeatmap"></div>
                    </div>
                    <div class="chart-section">
                        <h3>Real-time Game Flow</h3>
                        <canvas id="gameFlowChart"></canvas>
                    </div>
                    <div class="chart-section">
                        <h3>Predictive Analytics</h3>
                        <div id="predictiveChart"></div>
                    </div>
                </div>
                
                <!-- Interactive Control Panel -->
                <div class="blaze-control-panel">
                    <div class="control-group">
                        <label>Sport Focus:</label>
                        <select id="sportSelect">
                            <option value="baseball">⚾ Baseball - Cardinals Focus</option>
                            <option value="football">🏈 Football - Titans/Longhorns</option>
                            <option value="basketball">🏀 Basketball - Grizzlies</option>
                            <option value="multi">📊 Multi-Sport Analysis</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Time Range:</label>
                        <select id="timeRange">
                            <option value="live">🔴 Live</option>
                            <option value="today">📅 Today</option>
                            <option value="week">📊 This Week</option>
                            <option value="month">📈 This Month</option>
                            <option value="season">🏆 Season</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <button id="refreshData" class="blaze-cta-primary">
                            🔄 Refresh Analytics
                        </button>
                    </div>
                </div>
                
                <!-- AI Insights Panel -->
                <div class="blaze-ai-insights">
                    <h3>🤖 AI Performance Insights</h3>
                    <div id="aiInsights" class="insights-content">
                        <div class="loading-insights">Analyzing performance patterns...</div>
                    </div>
                </div>
            </div>
        `;
        
        this.addVisualizationStyles();
    }
    
    addVisualizationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blaze-analytics-dashboard {
                padding: 2rem;
                background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(75, 146, 219, 0.1) 100%);
                border-radius: 1rem;
                margin: 2rem 0;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .blaze-metrics-header {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .blaze-metric-card {
                background: rgba(250, 250, 250, 0.95);
                padding: 1.5rem;
                border-radius: 0.75rem;
                text-align: center;
                border: 2px solid transparent;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            
            .blaze-metric-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--blaze-burnt-orange), var(--blaze-cardinals-blue));
            }
            
            .blaze-metric-card:hover {
                transform: translateY(-5px) scale(1.02);
                border-color: #BF5700;
                box-shadow: 0 10px 30px rgba(191, 87, 0, 0.3);
            }
            
            .metric-value {
                font-size: 2.5rem;
                font-weight: 900;
                background: linear-gradient(135deg, #BF5700, #4B92DB);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
                font-family: 'Inter', sans-serif;
            }
            
            .metric-label {
                font-size: 0.875rem;
                color: #333;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }
            
            .live-indicator {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                width: 0.75rem;
                height: 0.75rem;
                background: #28A745;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }
            
            .blaze-charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .chart-section {
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 1rem;
                border: 1px solid rgba(191, 87, 0, 0.2);
                backdrop-filter: blur(10px);
            }
            
            .chart-section h3 {
                color: #BF5700;
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .chart-section canvas {
                max-height: 300px;
            }
            
            .blaze-control-panel {
                display: flex;
                gap: 2rem;
                align-items: center;
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            
            .control-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .control-group label {
                color: #FAFAFA;
                font-weight: 600;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .control-group select {
                padding: 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid rgba(191, 87, 0, 0.3);
                background: rgba(255, 255, 255, 0.95);
                color: #333;
                font-weight: 500;
            }
            
            .blaze-cta-primary {
                background: linear-gradient(135deg, #BF5700, #4B92DB);
                color: white;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 2rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .blaze-cta-primary:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 5px 20px rgba(191, 87, 0, 0.4);
            }
            
            .blaze-ai-insights {
                background: rgba(0, 106, 107, 0.1);
                border: 1px solid rgba(0, 106, 107, 0.3);
                border-radius: 1rem;
                padding: 2rem;
            }
            
            .blaze-ai-insights h3 {
                color: #006A6B;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .insights-content {
                color: #FAFAFA;
                line-height: 1.6;
            }
            
            .loading-insights {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                opacity: 0.8;
            }
            
            .loading-insights::before {
                content: '';
                width: 1rem;
                height: 1rem;
                border: 2px solid rgba(0, 106, 107, 0.3);
                border-top: 2px solid #006A6B;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .blaze-charts-grid {
                    grid-template-columns: 1fr;
                }
                
                .blaze-control-panel {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .metric-value {
                    font-size: 2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeChartSystems() {
        this.createPerformanceChart();
        this.createReadinessHeatmap();
        this.createGameFlowChart();
        this.createPredictiveChart();
        this.setupControlPanelEvents();
        this.generateAIInsights();
    }
    
    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (!ctx) return;
        
        const performanceData = this.generatePerformanceData();
        
        this.charts.set('performance', new Chart(ctx, {
            type: 'line',
            data: {
                labels: performanceData.labels,
                datasets: [{
                    label: 'Cardinals Performance Index',
                    data: performanceData.cardinals,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Titans Performance Index',
                    data: performanceData.titans,
                    borderColor: this.colors.titans,
                    backgroundColor: this.colors.titans + '20',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        titleColor: '#FAFAFA',
                        bodyColor: '#FAFAFA',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(191, 87, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(191, 87, 0, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutCubic'
                }
            }
        }));
    }
    
    createReadinessHeatmap() {
        const container = document.getElementById('readinessHeatmap');
        if (!container) return;
        
        const data = this.generateReadinessData();
        
        // Create D3.js heatmap
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
            .domain([0, 100]);
        
        const xScale = d3.scaleBand()
            .range([0, width])
            .domain(data.positions)
            .padding(0.1);
        
        const yScale = d3.scaleBand()
            .range([height, 0])
            .domain(data.metrics)
            .padding(0.1);
        
        // Add rectangles for heatmap
        g.selectAll('.cell')
            .data(data.values)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.position))
            .attr('y', d => yScale(d.metric))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.value))
            .attr('stroke', 'rgba(255,255,255,0.3)')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                // Tooltip functionality
                d3.select(this)
                    .attr('stroke', '#BF5700')
                    .attr('stroke-width', 3);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke', 'rgba(255,255,255,0.3)')
                    .attr('stroke-width', 1);
            });
        
        // Add labels
        g.selectAll('.x-label')
            .data(data.positions)
            .enter()
            .append('text')
            .attr('class', 'x-label')
            .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
            .attr('y', height + 20)
            .attr('text-anchor', 'middle')
            .style('fill', '#333')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .text(d => d);
        
        g.selectAll('.y-label')
            .data(data.metrics)
            .enter()
            .append('text')
            .attr('class', 'y-label')
            .attr('x', -10)
            .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#333')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .text(d => d);
    }
    
    createGameFlowChart() {
        const ctx = document.getElementById('gameFlowChart')?.getContext('2d');
        if (!ctx) return;
        
        const gameFlowData = this.generateGameFlowData();
        
        this.charts.set('gameFlow', new Chart(ctx, {
            type: 'radar',
            data: {
                labels: gameFlowData.labels,
                datasets: [{
                    label: 'Current Game State',
                    data: gameFlowData.current,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '40',
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.colors.primary,
                    fill: true
                }, {
                    label: 'Season Average',
                    data: gameFlowData.average,
                    borderColor: this.colors.secondary,
                    backgroundColor: this.colors.secondary + '20',
                    pointBackgroundColor: this.colors.secondary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.colors.secondary,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true,
                            color: 'rgba(191, 87, 0, 0.3)'
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        pointLabels: {
                            color: '#333',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(191, 87, 0, 0.2)'
                        },
                        ticks: {
                            color: '#666',
                            backdropColor: 'transparent'
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        }));
    }
    
    createPredictiveChart() {
        const container = document.getElementById('predictiveChart');
        if (!container) return;
        
        const data = this.generatePredictiveData();
        
        // Create advanced D3.js visualization for predictions
        const margin = { top: 20, right: 80, bottom: 40, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Define scales
        const xScale = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, d => d.date));
        
        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 100]);
        
        // Create line generator
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.winProbability))
            .curve(d3.curveCatmullRom);
        
        // Add confidence interval area
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(d => yScale(d.winProbability - d.confidence))
            .y1(d => yScale(d.winProbability + d.confidence))
            .curve(d3.curveCatmullRom);
        
        // Add confidence area
        g.append('path')
            .datum(data)
            .attr('fill', this.colors.primary + '20')
            .attr('stroke', 'none')
            .attr('d', area);
        
        // Add prediction line
        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', this.colors.primary)
            .attr('stroke-width', 3)
            .attr('d', line);
        
        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')));
        
        g.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d + '%'));
        
        // Add interactive points
        g.selectAll('.prediction-point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'prediction-point')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.winProbability))
            .attr('r', 4)
            .attr('fill', this.colors.primary)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 6);
                // Add tooltip here
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 4);
            });
    }
    
    setupControlPanelEvents() {
        const sportSelect = document.getElementById('sportSelect');
        const timeRange = document.getElementById('timeRange');
        const refreshButton = document.getElementById('refreshData');
        
        sportSelect?.addEventListener('change', (e) => {
            this.updateChartsBySport(e.target.value);
        });
        
        timeRange?.addEventListener('change', (e) => {
            this.updateChartsByTimeRange(e.target.value);
        });
        
        refreshButton?.addEventListener('click', () => {
            this.refreshAllData();
        });
    }
    
    startRealTimeUpdates() {
        // Simulate real-time data updates
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeMetrics();
            this.updateLiveScores();
        }, 5000); // Update every 5 seconds
        
        // Update charts every 30 seconds
        this.chartUpdateInterval = setInterval(() => {
            this.updateChartsWithNewData();
        }, 30000);
    }
    
    updateRealTimeMetrics() {
        const readinessScore = document.getElementById('readinessScore');
        const leverageIndex = document.getElementById('leverageIndex');
        const performanceIndex = document.getElementById('performanceIndex');
        
        if (readinessScore) {
            const newScore = (Math.random() * 15 + 85).toFixed(1);
            this.animateValueChange(readinessScore, newScore);
        }
        
        if (leverageIndex) {
            const newLeverage = (Math.random() * 2 + 2).toFixed(1);
            this.animateValueChange(leverageIndex, newLeverage);
        }
        
        if (performanceIndex) {
            const newPerformance = (Math.random() * 20 + 70).toFixed(1);
            this.animateValueChange(performanceIndex, newPerformance);
        }
    }
    
    updateLiveScores() {
        const liveScore = document.getElementById('liveScore');
        if (liveScore) {
            const scores = ['3-2', '5-4', '7-3', '2-1', '6-5', '4-3'];
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            liveScore.textContent = randomScore;
        }
    }
    
    animateValueChange(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = this.colors.primary;
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 150);
    }
    
    generateAIInsights() {
        const insights = [
            "🎯 Cardinals showing 23% improvement in clutch situations over last 10 games",
            "⚡ Titans defense demonstrates elite pattern recognition - 94.6% pressure rate",
            "🏆 Longhorns offensive line creating +2.3 second pocket time advantage",
            "📊 Grizzlies fast-break efficiency up 31% since roster adjustment",
            "🔥 Current momentum indicators suggest 78% win probability next matchup",
            "⭐ Key player readiness index peaked at optimal competition window"
        ];
        
        const insightsContainer = document.getElementById('aiInsights');
        if (insightsContainer) {
            setTimeout(() => {
                const randomInsights = insights.sort(() => 0.5 - Math.random()).slice(0, 3);
                insightsContainer.innerHTML = randomInsights.map(insight => 
                    `<div class="insight-item">${insight}</div>`
                ).join('');
            }, 2000);
        }
    }
    
    // Data generation methods
    generatePerformanceData() {
        const labels = ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5', 'Game 6', 'Game 7', 'Game 8'];
        const cardinals = labels.map(() => Math.floor(Math.random() * 30 + 70));
        const titans = labels.map(() => Math.floor(Math.random() * 25 + 75));
        
        return { labels, cardinals, titans };
    }
    
    generateReadinessData() {
        const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
        const metrics = ['Power', 'Speed', 'Defense', 'Contact', 'Clutch'];
        const values = [];
        
        positions.forEach(position => {
            metrics.forEach(metric => {
                values.push({
                    position,
                    metric,
                    value: Math.floor(Math.random() * 40 + 60)
                });
            });
        });
        
        return { positions, metrics, values };
    }
    
    generateGameFlowData() {
        return {
            labels: ['Offense', 'Defense', 'Special Teams', 'Momentum', 'Pressure', 'Execution'],
            current: [85, 92, 78, 88, 75, 90],
            average: [80, 85, 82, 79, 82, 85]
        };
    }
    
    generatePredictiveData() {
        const data = [];
        const startDate = new Date();
        
        for (let i = 0; i < 10; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            data.push({
                date,
                winProbability: Math.floor(Math.random() * 30 + 60),
                confidence: Math.floor(Math.random() * 10 + 5)
            });
        }
        
        return data;
    }
    
    updateChartsBySport(sport) {
        console.log(`🏆 Switching to ${sport} analytics`);
        // Update chart data based on sport selection
        this.refreshAllData();
    }
    
    updateChartsByTimeRange(timeRange) {
        console.log(`📊 Updating time range to ${timeRange}`);
        // Update chart data based on time range
        this.refreshAllData();
    }
    
    refreshAllData() {
        console.log('🔄 Refreshing all analytics data');
        
        // Add loading states
        this.charts.forEach(chart => {
            if (chart.update) {
                chart.update('none');
            }
        });
        
        // Simulate data refresh
        setTimeout(() => {
            this.updateChartsWithNewData();
            this.generateAIInsights();
        }, 1000);
    }
    
    updateChartsWithNewData() {
        // Update performance chart
        const performanceChart = this.charts.get('performance');
        if (performanceChart) {
            const newData = this.generatePerformanceData();
            performanceChart.data.datasets[0].data = newData.cardinals;
            performanceChart.data.datasets[1].data = newData.titans;
            performanceChart.update('active');
        }
        
        // Update game flow chart
        const gameFlowChart = this.charts.get('gameFlow');
        if (gameFlowChart) {
            const newData = this.generateGameFlowData();
            gameFlowChart.data.datasets[0].data = newData.current;
            gameFlowChart.data.datasets[1].data = newData.average;
            gameFlowChart.update('active');
        }
    }
    
    destroy() {
        // Clean up intervals and event listeners
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        if (this.chartUpdateInterval) {
            clearInterval(this.chartUpdateInterval);
        }
        
        // Destroy charts
        this.charts.forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });
        
        this.charts.clear();
        console.log('🧹 Blaze Data Visualizations cleaned up');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.blaze-data-visualizations-container');
    if (container) {
        window.blazeDataViz = new BlazeDataVisualizations(container);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeDataVisualizations;
}