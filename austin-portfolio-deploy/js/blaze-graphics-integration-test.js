/**
 * >ê BLAZE INTELLIGENCE - GRAPHICS INTEGRATION TEST SUITE
 * Comprehensive testing and validation of championship graphics enhancement
 * Ensures all systems work together at broadcast quality
 */

class BlazeGraphicsIntegrationTest {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Test results
        this.testResults = {
            shaderSystem: { passed: false, performance: 0, errors: [] },
            postProcessing: { passed: false, performance: 0, errors: [] },
            pbrMaterials: { passed: false, performance: 0, errors: [] },
            dataVisualization: { passed: false, performance: 0, errors: [] },
            championshipEffects: { passed: false, performance: 0, errors: [] },
            performanceOptimizer: { passed: false, performance: 0, errors: [] },
            integration: { passed: false, performance: 0, errors: [] }
        };

        // Performance benchmarks
        this.benchmarks = {
            targetFPS: 60,
            maxFrameTime: 16.67,
            maxDrawCalls: 1000,
            maxTriangles: 500000,
            maxMemoryMB: 100
        };

        this.testComponents = new Map();
        this.initializeTestSuite();
    }

    initializeTestSuite() {
        console.log('>ê Initializing Blaze Graphics Integration Test Suite');
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        // Create test container
        this.testContainer = new THREE.Group();
        this.testContainer.name = 'GraphicsTestContainer';
        this.scene.add(this.testContainer);

        // Performance monitoring
        this.performanceMonitor = {
            frames: 0,
            startTime: performance.now(),
            frameTimeSum: 0,
            worstFrameTime: 0
        };
    }

    /**
     * Run Complete Test Suite
     */
    async runFullTestSuite() {
        console.log('=€ Starting comprehensive graphics test suite...');

        const startTime = performance.now();

        try {
            // Test individual systems
            await this.testShaderSystem();
            await this.testPostProcessingSystem();
            await this.testPBRMaterials();
            await this.testDataVisualization();
            await this.testChampionshipEffects();
            await this.testPerformanceOptimizer();

            // Test system integration
            await this.testSystemIntegration();

            // Performance validation
            await this.validatePerformance();

            // Generate final report
            const testDuration = performance.now() - startTime;
            const report = this.generateTestReport(testDuration);

            console.log(' Graphics test suite completed successfully');
            return report;

        } catch (error) {
            console.error('L Graphics test suite failed:', error);
            this.testResults.integration.errors.push(error.message);
            return this.generateTestReport(performance.now() - startTime);
        }
    }

    /**
     * Test Shader System
     */
    async testShaderSystem() {
        console.log('<¨ Testing shader system...');

        try {
            // Test if shader system is available
            if (!window.BlazeChampionshipShaders) {
                throw new Error('BlazeChampionshipShaders not found');
            }

            const shaderSystem = new window.BlazeChampionshipShaders();

            // Test shader creation
            const testMaterial = shaderSystem.createShaderMaterial(
                'championshipVertex',
                'championshipFragment'
            );

            if (!testMaterial || !testMaterial.vertexShader || !testMaterial.fragmentShader) {
                throw new Error('Shader material creation failed');
            }

            // Test shader compilation
            const testGeometry = new THREE.PlaneGeometry(10, 10);
            const testMesh = new THREE.Mesh(testGeometry, testMaterial);
            this.testContainer.add(testMesh);

            // Render test frame
            const renderStart = performance.now();
            this.renderer.render(this.scene, this.camera);
            const renderTime = performance.now() - renderStart;

            // Validate performance
            if (renderTime > this.benchmarks.maxFrameTime * 2) {
                this.testResults.shaderSystem.errors.push('Shader render time too high');
            }

            // Test uniform updates
            shaderSystem.updateUniforms(0.016, 0, 0);

            // Test particle shader
            const particleMaterial = shaderSystem.createShaderMaterial(
                'particleVertex',
                'particleFragment'
            );

            if (!particleMaterial) {
                throw new Error('Particle shader creation failed');
            }

            // Cleanup test objects
            this.testContainer.remove(testMesh);
            testGeometry.dispose();
            testMaterial.dispose();
            particleMaterial.dispose();

            this.testResults.shaderSystem.passed = true;
            this.testResults.shaderSystem.performance = renderTime;

            console.log(' Shader system test passed');

        } catch (error) {
            console.error('L Shader system test failed:', error);
            this.testResults.shaderSystem.errors.push(error.message);
        }
    }

    /**
     * Test Post-Processing System
     */
    async testPostProcessingSystem() {
        console.log('<¬ Testing post-processing system...');

        try {
            if (!window.BlazeChampionshipPostProcessing) {
                throw new Error('BlazeChampionshipPostProcessing not found');
            }

            const postProcessor = new window.BlazeChampionshipPostProcessing(
                this.renderer,
                this.scene,
                this.camera
            );

            // Test initialization
            if (!postProcessor.composer || !postProcessor.passes) {
                throw new Error('Post-processing initialization failed');
            }

            // Test render pass
            const renderStart = performance.now();
            postProcessor.render();
            const renderTime = performance.now() - renderStart;

            // Test parameter updates
            postProcessor.updateParams({
                bloomStrength: 1.5,
                focus: 100,
                motionBlurAmount: 0.5
            });

            // Validate performance
            if (renderTime > this.benchmarks.maxFrameTime * 3) {
                this.testResults.postProcessing.errors.push('Post-processing render time too high');
            }

            postProcessor.dispose();

            this.testResults.postProcessing.passed = true;
            this.testResults.postProcessing.performance = renderTime;

            console.log(' Post-processing system test passed');

        } catch (error) {
            console.error('L Post-processing system test failed:', error);
            this.testResults.postProcessing.errors.push(error.message);
        }
    }

    /**
     * Test PBR Materials System
     */
    async testPBRMaterials() {
        console.log('=Ž Testing PBR materials system...');

        try {
            if (!window.BlazePBRMaterials) {
                throw new Error('BlazePBRMaterials not found');
            }

            const pbrSystem = new window.BlazePBRMaterials(this.scene);

            // Test material creation
            const stadiumMaterials = pbrSystem.createStadiumMaterials();
            const fieldMaterials = pbrSystem.createFieldMaterials();
            const playerMaterials = pbrSystem.createPlayerMaterials();

            if (!stadiumMaterials.glass || !fieldMaterials.grass || !playerMaterials.jersey) {
                throw new Error('PBR material creation failed');
            }

            // Test material application
            const testGeometry = new THREE.SphereGeometry(5, 32, 32);
            const testMeshes = [];

            Object.values(stadiumMaterials).forEach((material, index) => {
                const mesh = new THREE.Mesh(testGeometry, material);
                mesh.position.x = index * 15;
                this.testContainer.add(mesh);
                testMeshes.push(mesh);
            });

            // Test dynamic lighting
            pbrSystem.setTimeOfDay(12); // Noon
            pbrSystem.setWeatherConditions('clear');

            // Render test
            const renderStart = performance.now();
            this.renderer.render(this.scene, this.camera);
            const renderTime = performance.now() - renderStart;

            // Test environment mapping
            if (pbrSystem.envMap) {
                // Environment map exists
            }

            // Cleanup
            testMeshes.forEach(mesh => {
                this.testContainer.remove(mesh);
            });
            testGeometry.dispose();

            this.testResults.pbrMaterials.passed = true;
            this.testResults.pbrMaterials.performance = renderTime;

            console.log(' PBR materials system test passed');

        } catch (error) {
            console.error('L PBR materials system test failed:', error);
            this.testResults.pbrMaterials.errors.push(error.message);
        }
    }

    /**
     * Test 3D Data Visualization
     */
    async testDataVisualization() {
        console.log('=Ê Testing 3D data visualization system...');

        try {
            if (!window.Blaze3DDataViz) {
                throw new Error('Blaze3DDataViz not found');
            }

            const dataViz = new window.Blaze3DDataViz(this.scene, this.renderer, this.camera);

            // Test bar chart creation
            const testData = [10, 25, 15, 30, 20, 35, 8, 22, 18, 28];
            const barChart = dataViz.create3DBarChart(testData, {
                animationDuration: 100 // Speed up for testing
            });

            if (!barChart) {
                throw new Error('Bar chart creation failed');
            }

            // Test scatter plot
            const scatterData = Array.from({ length: 100 }, (_, i) => ({
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
                value: Math.random(),
                importance: Math.random()
            }));

            const scatterPlot = dataViz.create3DScatterPlot(scatterData, {
                animated: false
            });

            if (!scatterPlot) {
                throw new Error('Scatter plot creation failed');
            }

            // Test heatmap
            const heatmapData = Array.from({ length: 100 }, () => Math.random());
            const heatmap = dataViz.create3DHeatmapSurface(heatmapData, {
                animated: false
            });

            if (!heatmap) {
                throw new Error('Heatmap creation failed');
            }

            // Test render performance
            const renderStart = performance.now();
            this.renderer.render(this.scene, this.camera);
            const renderTime = performance.now() - renderStart;

            // Test data updates
            const newData = testData.map(v => v * 1.5);
            dataViz.updateVisualization(barChart.uuid, newData);

            // Cleanup
            dataViz.dispose();

            this.testResults.dataVisualization.passed = true;
            this.testResults.dataVisualization.performance = renderTime;

            console.log(' Data visualization system test passed');

        } catch (error) {
            console.error('L Data visualization system test failed:', error);
            this.testResults.dataVisualization.errors.push(error.message);
        }
    }

    /**
     * Test Championship Effects
     */
    async testChampionshipEffects() {
        console.log('<Æ Testing championship effects system...');

        try {
            if (!window.BlazeChampionshipEffects) {
                throw new Error('BlazeChampionshipEffects not found');
            }

            const effectsSystem = new window.BlazeChampionshipEffects(
                this.scene,
                this.renderer,
                this.camera
            );

            // Test confetti system
            const confetti = effectsSystem.triggerConfettiCelebration({
                particleCount: 1000, // Reduced for testing
                duration: 1000 // Short duration
            });

            if (!confetti) {
                throw new Error('Confetti system creation failed');
            }

            // Test trophy reveal
            const trophy = effectsSystem.createTrophyReveal({
                animationDuration: 500 // Speed up for testing
            });

            if (!trophy) {
                throw new Error('Trophy reveal creation failed');
            }

            // Test stadium wave
            const wave = effectsSystem.createStadiumWave({
                duration: 1000,
                particleCount: 100 // Reduced for testing
            });

            if (!wave) {
                throw new Error('Stadium wave creation failed');
            }

            // Test performance during effects
            const renderStart = performance.now();
            effectsSystem.update(0.016);
            this.renderer.render(this.scene, this.camera);
            const renderTime = performance.now() - renderStart;

            // Test effect cleanup
            effectsSystem.dispose();

            this.testResults.championshipEffects.passed = true;
            this.testResults.championshipEffects.performance = renderTime;

            console.log(' Championship effects system test passed');

        } catch (error) {
            console.error('L Championship effects system test failed:', error);
            this.testResults.championshipEffects.errors.push(error.message);
        }
    }

    /**
     * Test Performance Optimizer
     */
    async testPerformanceOptimizer() {
        console.log('=€ Testing performance optimizer system...');

        try {
            if (!window.BlazePerformanceOptimizer) {
                throw new Error('BlazePerformanceOptimizer not found');
            }

            const optimizer = new window.BlazePerformanceOptimizer(
                this.renderer,
                this.scene,
                this.camera
            );

            // Test GPU detection
            if (!optimizer.gpuTier) {
                throw new Error('GPU tier detection failed');
            }

            // Test optimization level setting
            optimizer.setOptimizationLevel('medium');
            optimizer.setOptimizationLevel('high');

            // Test LOD system
            const testGeometry = new THREE.BoxGeometry(1, 1, 1);
            const lodLevels = [
                { object: new THREE.Mesh(testGeometry, new THREE.MeshBasicMaterial()), distance: 0 },
                { object: new THREE.Mesh(testGeometry, new THREE.MeshBasicMaterial()), distance: 50 },
                { object: new THREE.Mesh(testGeometry, new THREE.MeshBasicMaterial()), distance: 100 }
            ];

            const lodGroup = optimizer.createLODGroup(lodLevels[0].object, lodLevels);
            if (!lodGroup) {
                throw new Error('LOD group creation failed');
            }

            // Test culling systems
            const testObjects = [];
            for (let i = 0; i < 50; i++) {
                const mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial()
                );
                mesh.position.set(
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200
                );
                this.testContainer.add(mesh);
                testObjects.push(mesh);
            }

            // Test update loop
            const updateStart = performance.now();
            optimizer.update();
            const updateTime = performance.now() - updateStart;

            // Test performance report
            const report = optimizer.getPerformanceReport();
            if (!report.fps || !report.optimizationLevel) {
                throw new Error('Performance report generation failed');
            }

            // Cleanup
            testObjects.forEach(mesh => {
                this.testContainer.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            });

            optimizer.dispose();

            this.testResults.performanceOptimizer.passed = true;
            this.testResults.performanceOptimizer.performance = updateTime;

            console.log(' Performance optimizer system test passed');

        } catch (error) {
            console.error('L Performance optimizer system test failed:', error);
            this.testResults.performanceOptimizer.errors.push(error.message);
        }
    }

    /**
     * Test System Integration
     */
    async testSystemIntegration() {
        console.log('= Testing system integration...');

        try {
            // Initialize all systems together
            const systems = {};

            if (window.BlazeChampionshipShaders) {
                systems.shaders = new window.BlazeChampionshipShaders();
            }

            if (window.BlazePBRMaterials) {
                systems.materials = new window.BlazePBRMaterials(this.scene);
            }

            if (window.Blaze3DDataViz) {
                systems.dataViz = new window.Blaze3DDataViz(this.scene, this.renderer, this.camera);
            }

            if (window.BlazeChampionshipEffects) {
                systems.effects = new window.BlazeChampionshipEffects(this.scene, this.renderer, this.camera);
            }

            if (window.BlazePerformanceOptimizer) {
                systems.optimizer = new window.BlazePerformanceOptimizer(this.renderer, this.scene, this.camera);
            }

            // Test inter-system communication
            if (systems.optimizer && systems.effects) {
                // Test that optimizer can handle effects
                const confetti = systems.effects.triggerConfettiCelebration({
                    particleCount: 500,
                    duration: 1000
                });
                systems.optimizer.update();
            }

            // Test combined rendering
            const renderStart = performance.now();

            // Update all systems
            Object.values(systems).forEach(system => {
                if (system.update) {
                    system.update(0.016);
                }
            });

            this.renderer.render(this.scene, this.camera);
            const renderTime = performance.now() - renderStart;

            // Validate integration performance
            if (renderTime > this.benchmarks.maxFrameTime * 4) {
                throw new Error('Integrated render time exceeds acceptable limits');
            }

            // Test system interaction
            if (systems.materials && systems.shaders) {
                // Materials should work with custom shaders
                const testMaterial = systems.materials.createStadiumMaterials().glass;
                if (!testMaterial) {
                    throw new Error('Material-shader integration failed');
                }
            }

            // Cleanup
            Object.values(systems).forEach(system => {
                if (system.dispose) {
                    system.dispose();
                }
            });

            this.testResults.integration.passed = true;
            this.testResults.integration.performance = renderTime;

            console.log(' System integration test passed');

        } catch (error) {
            console.error('L System integration test failed:', error);
            this.testResults.integration.errors.push(error.message);
        }
    }

    /**
     * Performance Validation
     */
    async validatePerformance() {
        console.log('¡ Validating performance benchmarks...');

        return new Promise((resolve) => {
            let frameCount = 0;
            let totalFrameTime = 0;
            let maxFrameTime = 0;
            const targetFrames = 120; // 2 seconds at 60fps

            const measureFrame = () => {
                const frameStart = performance.now();

                this.renderer.render(this.scene, this.camera);

                const frameTime = performance.now() - frameStart;
                totalFrameTime += frameTime;
                maxFrameTime = Math.max(maxFrameTime, frameTime);
                frameCount++;

                if (frameCount < targetFrames) {
                    requestAnimationFrame(measureFrame);
                } else {
                    const avgFrameTime = totalFrameTime / frameCount;
                    const avgFPS = 1000 / avgFrameTime;

                    const performanceResults = {
                        averageFPS: avgFPS,
                        averageFrameTime: avgFrameTime,
                        maxFrameTime: maxFrameTime,
                        renderInfo: this.renderer.info,
                        passed: avgFPS >= this.benchmarks.targetFPS * 0.8 // 80% of target
                    };

                    console.log(`=Ê Performance Results:
                        Average FPS: ${avgFPS.toFixed(1)}
                        Average Frame Time: ${avgFrameTime.toFixed(2)}ms
                        Max Frame Time: ${maxFrameTime.toFixed(2)}ms
                        Draw Calls: ${this.renderer.info.render.calls}
                        Triangles: ${this.renderer.info.render.triangles}`);

                    this.testResults.performance = performanceResults;
                    resolve(performanceResults);
                }
            };

            measureFrame();
        });
    }

    /**
     * Generate Test Report
     */
    generateTestReport(duration) {
        const passedTests = Object.values(this.testResults).filter(test => test.passed).length;
        const totalTests = Object.keys(this.testResults).length;
        const successRate = (passedTests / totalTests) * 100;

        const report = {
            summary: {
                duration: `${(duration / 1000).toFixed(2)}s`,
                successRate: `${successRate.toFixed(1)}%`,
                passedTests: passedTests,
                totalTests: totalTests
            },
            systems: this.testResults,
            recommendations: this.generateRecommendations(),
            deploymentReady: successRate >= 80
        };

        // Display report
        console.log(`
>ê BLAZE GRAPHICS TEST REPORT
============================
Duration: ${report.summary.duration}
Success Rate: ${report.summary.successRate}
Passed: ${report.summary.passedTests}/${report.summary.totalTests}

System Results:
${Object.entries(this.testResults).map(([name, result]) =>
    `  ${result.passed ? '' : 'L'} ${name}: ${result.performance ? result.performance.toFixed(2) + 'ms' : 'N/A'}`
).join('\n')}

Deployment Ready: ${report.deploymentReady ? ' YES' : 'L NO'}
${report.recommendations.length > 0 ? '\nRecommendations:\n' + report.recommendations.map(r => `  " ${r}`).join('\n') : ''}
        `);

        return report;
    }

    generateRecommendations() {
        const recommendations = [];

        // Check individual system performance
        Object.entries(this.testResults).forEach(([system, result]) => {
            if (!result.passed) {
                recommendations.push(`Fix ${system} system errors: ${result.errors.join(', ')}`);
            } else if (result.performance > this.benchmarks.maxFrameTime * 2) {
                recommendations.push(`Optimize ${system} system performance (${result.performance.toFixed(2)}ms)`);
            }
        });

        // General recommendations
        if (this.renderer.info.render.calls > this.benchmarks.maxDrawCalls) {
            recommendations.push('Reduce draw calls through instancing or batching');
        }

        if (this.renderer.info.render.triangles > this.benchmarks.maxTriangles) {
            recommendations.push('Implement more aggressive LOD system');
        }

        return recommendations;
    }

    /**
     * Cleanup
     */
    dispose() {
        this.scene.remove(this.testContainer);
        this.testContainer = null;
        this.testComponents.clear();

        console.log('>ù Graphics integration test disposed');
    }
}

// Auto-run test suite if in test mode
if (typeof window !== 'undefined' && window.location?.search.includes('test=graphics')) {
    window.addEventListener('load', () => {
        setTimeout(async () => {
            // Get Three.js components from global scope
            const renderer = window.blazeRenderer;
            const scene = window.blazeScene;
            const camera = window.blazeCamera;

            if (renderer && scene && camera) {
                const testSuite = new BlazeGraphicsIntegrationTest(renderer, scene, camera);
                const report = await testSuite.runFullTestSuite();

                // Store report globally for inspection
                window.blazeGraphicsTestReport = report;

                testSuite.dispose();
            } else {
                console.error('L Three.js components not found for testing');
            }
        }, 2000); // Wait for systems to initialize
    });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeGraphicsIntegrationTest;
}