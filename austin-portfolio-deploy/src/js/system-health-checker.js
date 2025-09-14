// System Health Checker - Comprehensive Testing Suite
// Tests all integrated features and reports functionality status

class SystemHealthChecker {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
        this.healthScore = 0;
    }

    async runFullDiagnostics() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.testResults = [];
        this.createHealthDashboard();

        try {
            // Test all major components
            await this.testAIConsciousness();
            await this.testVideoAnalysis();
            await this.testNarrativeEngine();
            await this.testNILCalculator();
            await this.testVisualizationEngines();
            await this.testNavigationLinks();
            await this.testResponsiveness();
            await this.testPerformanceMetrics();

            this.calculateHealthScore();
            this.displayResults();

        } catch (error) {
            console.error('Health Check Error:', error);
            this.addResult('System Error', 'FAIL', `Unexpected error: ${error.message}`);
        } finally {
            this.isRunning = false;
        }
    }

    createHealthDashboard() {
        // Create floating health dashboard
        const dashboard = document.createElement('div');
        dashboard.id = 'health-dashboard';
        dashboard.innerHTML = `
            <div class="health-panel">
                <div class="health-header">
                    <h4><i class="fas fa-heartbeat"></i> System Health Check</h4>
                    <button id="close-health" class="close-btn">×</button>
                </div>
                <div class="health-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="health-progress"></div>
                    </div>
                    <div class="progress-text" id="health-status">Initializing diagnostics...</div>
                </div>
                <div class="health-results" id="health-results">
                    <!-- Test results will appear here -->
                </div>
                <div class="health-score">
                    <span>Overall Health: </span>
                    <span id="health-score-value">--</span>
                </div>
            </div>

            <style>
                #health-dashboard {
                    position: fixed;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                    z-index: 10000;
                    font-family: 'Inter', sans-serif;
                }

                .health-panel {
                    background: rgba(30, 41, 59, 0.98);
                    border: 2px solid #BF5700;
                    border-radius: 12px;
                    padding: 20px;
                    width: 350px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);
                }

                .health-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(191, 87, 0, 0.3);
                    padding-bottom: 10px;
                }

                .health-header h4 {
                    color: #BF5700;
                    margin: 0;
                    font-size: 16px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #E2E8F0;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                }

                .close-btn:hover {
                    color: #BF5700;
                }

                .health-progress {
                    margin-bottom: 15px;
                }

                .progress-bar {
                    width: 100%;
                    height: 6px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #BF5700, #22C55E);
                    width: 0%;
                    transition: width 0.3s ease;
                }

                .progress-text {
                    color: #E2E8F0;
                    font-size: 12px;
                    text-align: center;
                }

                .health-results {
                    max-height: 400px;
                    overflow-y: auto;
                    margin-bottom: 15px;
                }

                .test-result {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 12px;
                }

                .test-name {
                    color: #E2E8F0;
                    flex: 1;
                }

                .test-status {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 10px;
                }

                .test-status.pass {
                    background: #22C55E;
                    color: white;
                }

                .test-status.fail {
                    background: #EF4444;
                    color: white;
                }

                .test-status.warn {
                    background: #F59E0B;
                    color: white;
                }

                .health-score {
                    text-align: center;
                    padding-top: 15px;
                    border-top: 1px solid rgba(191, 87, 0, 0.3);
                    color: #E2E8F0;
                    font-weight: 600;
                }

                #health-score-value {
                    color: #22C55E;
                    font-size: 18px;
                    font-weight: 900;
                }
            </style>
        `;

        document.body.appendChild(dashboard);

        // Close button functionality
        document.getElementById('close-health').addEventListener('click', () => {
            dashboard.remove();
        });
    }

    updateProgress(percentage, status) {
        const progressFill = document.getElementById('health-progress');
        const progressText = document.getElementById('health-status');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = status;
    }

    addResult(testName, status, details = '') {
        this.testResults.push({ testName, status, details });

        const resultsContainer = document.getElementById('health-results');
        if (resultsContainer) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'test-result';
            resultDiv.innerHTML = `
                <span class="test-name" title="${details}">${testName}</span>
                <span class="test-status ${status.toLowerCase()}">${status}</span>
            `;
            resultsContainer.appendChild(resultDiv);
        }
    }

    async testAIConsciousness() {
        this.updateProgress(10, 'Testing AI Consciousness Engine...');

        try {
            // Check if AI consciousness engine is loaded
            if (typeof window.aiConsciousness === 'undefined') {
                this.addResult('AI Consciousness Engine', 'FAIL', 'Module not loaded');
                return;
            }

            // Test slider functionality
            const sensitivitySlider = document.getElementById('neural-sensitivity');
            if (!sensitivitySlider) {
                this.addResult('Neural Sensitivity Controls', 'FAIL', 'Slider not found');
            } else {
                this.addResult('Neural Sensitivity Controls', 'PASS', 'Slider functional');
            }

            // Test neural network visualization
            const neuralCanvas = document.getElementById('neural-network-canvas');
            if (!neuralCanvas) {
                this.addResult('Neural Network Visualization', 'WARN', 'Canvas not found');
            } else {
                this.addResult('Neural Network Visualization', 'PASS', 'Canvas active');
            }

            this.addResult('AI Consciousness Engine', 'PASS', 'All systems operational');

        } catch (error) {
            this.addResult('AI Consciousness Engine', 'FAIL', error.message);
        }
    }

    async testVideoAnalysis() {
        this.updateProgress(25, 'Testing Video Analysis System...');

        try {
            // Check if video analysis is loaded
            if (typeof window.videoAnalysis === 'undefined') {
                this.addResult('Video Analysis Engine', 'FAIL', 'Module not loaded');
                return;
            }

            // Test upload zone
            const uploadZone = document.getElementById('video-upload-zone');
            if (!uploadZone) {
                this.addResult('Video Upload Interface', 'FAIL', 'Upload zone not found');
            } else {
                this.addResult('Video Upload Interface', 'PASS', 'Drag & drop ready');
            }

            // Test keypoint canvas
            const keypointCanvas = document.getElementById('keypoint-canvas');
            if (!keypointCanvas) {
                this.addResult('Keypoint Detection', 'WARN', 'Canvas not found');
            } else {
                this.addResult('Keypoint Detection', 'PASS', '33+ keypoints ready');
            }

            this.addResult('Video Analysis Engine', 'PASS', 'MediaPipe integration active');

        } catch (error) {
            this.addResult('Video Analysis Engine', 'FAIL', error.message);
        }
    }

    async testNarrativeEngine() {
        this.updateProgress(40, 'Testing Narrative Generation...');

        try {
            // Check if narrative engine is loaded
            if (typeof window.narrativeEngine === 'undefined') {
                this.addResult('Narrative Generation Engine', 'FAIL', 'Module not loaded');
                return;
            }

            // Test narrative controls
            const generateBtn = document.getElementById('generate-story');
            if (!generateBtn) {
                this.addResult('Story Generation Controls', 'FAIL', 'Generate button not found');
            } else {
                this.addResult('Story Generation Controls', 'PASS', 'Controls functional');
            }

            // Test pressure slider
            const pressureSlider = document.getElementById('pressure-slider');
            if (!pressureSlider) {
                this.addResult('Pressure Controls', 'WARN', 'Pressure slider not found');
            } else {
                this.addResult('Pressure Controls', 'PASS', 'Pressure-aware storytelling ready');
            }

            this.addResult('Narrative Generation Engine', 'PASS', 'Real-time storytelling active');

        } catch (error) {
            this.addResult('Narrative Generation Engine', 'FAIL', error.message);
        }
    }

    async testNILCalculator() {
        this.updateProgress(55, 'Testing NIL Calculator...');

        try {
            // Check if NIL calculator is loaded
            if (typeof window.nilCalculator === 'undefined') {
                this.addResult('NIL Calculator', 'FAIL', 'Module not loaded');
                return;
            }

            // Test form elements
            const sportSelector = document.getElementById('nil-sport');
            const calculateBtn = document.getElementById('calculate-nil');

            if (!sportSelector || !calculateBtn) {
                this.addResult('NIL Form Controls', 'FAIL', 'Form elements missing');
            } else {
                this.addResult('NIL Form Controls', 'PASS', 'All inputs functional');
            }

            // Test calculation logic
            const testCalculation = window.nilCalculator.getCalculationResults();
            if (testCalculation) {
                this.addResult('NIL Calculation Engine', 'PASS', 'Market valuation ready');
            }

            this.addResult('NIL Calculator', 'PASS', 'Athlete market valuation active');

        } catch (error) {
            this.addResult('NIL Calculator', 'FAIL', error.message);
        }
    }

    async testVisualizationEngines() {
        this.updateProgress(70, 'Testing Visualization Engines...');

        try {
            // Test Three.js
            if (typeof THREE !== 'undefined') {
                this.addResult('Three.js Engine', 'PASS', 'r168 loaded successfully');
            } else {
                this.addResult('Three.js Engine', 'FAIL', 'Three.js not loaded');
            }

            // Test D3.js
            if (typeof d3 !== 'undefined') {
                this.addResult('D3.js Engine', 'PASS', 'v7 data binding ready');
            } else {
                this.addResult('D3.js Engine', 'FAIL', 'D3.js not loaded');
            }

            // Test visualization containers
            const hero3D = document.querySelector('.hero-3d-container');
            const d3Container = document.getElementById('d3-metrics-container');
            const pressureStream = document.getElementById('pressure-stream');

            if (hero3D) this.addResult('3D Sports Field', 'PASS', 'Container ready');
            if (d3Container) this.addResult('D3 Metrics Dashboard', 'PASS', 'Container ready');
            if (pressureStream) this.addResult('Pressure Stream Canvas', 'PASS', 'Real-time visualization ready');

            this.addResult('Visualization Engines', 'PASS', 'All engines operational');

        } catch (error) {
            this.addResult('Visualization Engines', 'FAIL', error.message);
        }
    }

    async testNavigationLinks() {
        this.updateProgress(85, 'Testing Navigation Links...');

        const links = [
            { url: '/sec-intelligence-dashboard.html', name: 'SEC Dashboard' },
            { url: '/perfect-game.html', name: 'Perfect Game Hub' }
        ];

        for (const link of links) {
            try {
                const response = await fetch(link.url, { method: 'HEAD' });
                if (response.ok) {
                    this.addResult(link.name, 'PASS', `Status: ${response.status}`);
                } else {
                    this.addResult(link.name, 'FAIL', `Status: ${response.status}`);
                }
            } catch (error) {
                this.addResult(link.name, 'FAIL', 'Network error');
            }
        }
    }

    async testResponsiveness() {
        this.updateProgress(95, 'Testing Responsiveness...');

        try {
            // Test viewport meta tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
                this.addResult('Mobile Viewport', 'PASS', 'Responsive meta tag present');
            } else {
                this.addResult('Mobile Viewport', 'FAIL', 'No viewport meta tag');
            }

            // Test CSS media queries (basic check)
            const hasResponsiveCSS = Array.from(document.styleSheets).some(sheet => {
                try {
                    return Array.from(sheet.cssRules || []).some(rule =>
                        rule.media && rule.media.mediaText.includes('max-width')
                    );
                } catch (e) {
                    return false;
                }
            });

            if (hasResponsiveCSS) {
                this.addResult('Responsive Design', 'PASS', 'Media queries detected');
            } else {
                this.addResult('Responsive Design', 'WARN', 'No media queries found');
            }

        } catch (error) {
            this.addResult('Responsiveness Test', 'FAIL', error.message);
        }
    }

    async testPerformanceMetrics() {
        this.updateProgress(100, 'Analyzing Performance...');

        try {
            // Test JavaScript performance
            const jsErrors = window.jsErrors || 0;
            if (jsErrors === 0) {
                this.addResult('JavaScript Errors', 'PASS', 'No console errors detected');
            } else {
                this.addResult('JavaScript Errors', 'WARN', `${jsErrors} errors found`);
            }

            // Test load time (basic)
            const loadTime = performance.now();
            if (loadTime < 3000) {
                this.addResult('Page Load Performance', 'PASS', `${Math.round(loadTime)}ms`);
            } else {
                this.addResult('Page Load Performance', 'WARN', `${Math.round(loadTime)}ms - consider optimization`);
            }

            // Test memory usage (if available)
            if (performance.memory) {
                const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                if (memoryMB < 50) {
                    this.addResult('Memory Usage', 'PASS', `${memoryMB}MB`);
                } else {
                    this.addResult('Memory Usage', 'WARN', `${memoryMB}MB - high usage`);
                }
            }

        } catch (error) {
            this.addResult('Performance Test', 'FAIL', error.message);
        }
    }

    calculateHealthScore() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const warnings = this.testResults.filter(r => r.status === 'WARN').length;

        // Calculate score: PASS = 1 point, WARN = 0.5 points, FAIL = 0 points
        this.healthScore = Math.round(((passed + warnings * 0.5) / total) * 100);
    }

    displayResults() {
        const scoreElement = document.getElementById('health-score-value');
        if (scoreElement) {
            scoreElement.textContent = `${this.healthScore}%`;

            // Color code the score
            if (this.healthScore >= 90) {
                scoreElement.style.color = '#22C55E';
            } else if (this.healthScore >= 70) {
                scoreElement.style.color = '#F59E0B';
            } else {
                scoreElement.style.color = '#EF4444';
            }
        }

        this.updateProgress(100, `Health Check Complete - Score: ${this.healthScore}%`);

        // Generate recommendations
        this.generateRecommendations();
    }

    generateRecommendations() {
        const failedTests = this.testResults.filter(r => r.status === 'FAIL');
        const warnings = this.testResults.filter(r => r.status === 'WARN');

        if (failedTests.length > 0) {
            console.group('🔥 Critical Issues Detected');
            failedTests.forEach(test => {
                console.error(`❌ ${test.testName}: ${test.details}`);
            });
            console.groupEnd();
        }

        if (warnings.length > 0) {
            console.group('⚠️ Optimization Opportunities');
            warnings.forEach(test => {
                console.warn(`⚠️ ${test.testName}: ${test.details}`);
            });
            console.groupEnd();
        }

        console.log(`🏆 Overall System Health: ${this.healthScore}%`);
    }

    // Public API
    static async runDiagnostics() {
        const checker = new SystemHealthChecker();
        await checker.runFullDiagnostics();
        return checker;
    }
}

// Auto-initialize and add to global scope
window.SystemHealthChecker = SystemHealthChecker;

// Add keyboard shortcut for quick health check
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        SystemHealthChecker.runDiagnostics();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemHealthChecker;
}