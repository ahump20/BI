// Blaze Intelligence Graphics Integration Test
// Tests the integration of advanced graphics systems with the main application

console.log('🧪 Starting Blaze Intelligence Graphics Integration Test');

// Test 1: Verify all graphics modules are loadable
function testModuleAvailability() {
    console.log('\n📦 Testing Module Availability...');

    const requiredModules = [
        'BlazeVolumetricRendering',
        'BlazeRayTracingEffects',
        'BlazeCrowdSimulation',
        'BlazeCinematicCameras',
        'BlazeWeatherSystems',
        'BlazeNeuralAnimation',
        'BlazeGraphicsOrchestrator'
    ];

    const results = {};
    requiredModules.forEach(module => {
        results[module] = typeof window[module] === 'function' ? '✅ Available' : '❌ Missing';
    });

    console.table(results);
    return Object.values(results).every(result => result.includes('✅'));
}

// Test 2: Test orchestrator initialization
function testOrchestratorInitialization() {
    console.log('\n🎭 Testing Graphics Orchestrator Initialization...');

    try {
        // Create minimal Three.js setup for testing
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        // Test orchestrator creation
        const orchestrator = new BlazeGraphicsOrchestrator(scene, renderer, camera);

        console.log('✅ Orchestrator created successfully');
        console.log('✅ Systems object initialized:', Object.keys(orchestrator.systems));
        console.log('✅ Performance tiers available:', orchestrator.performanceTiers);

        return true;
    } catch (error) {
        console.error('❌ Orchestrator initialization failed:', error);
        return false;
    }
}

// Test 3: Test event system
function testEventSystem() {
    console.log('\n⚡ Testing Event System...');

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const orchestrator = new BlazeGraphicsOrchestrator(scene, renderer, camera);

        // Test game event triggering
        orchestrator.triggerGameEvent('TOUCHDOWN', 'home');
        console.log('✅ TOUCHDOWN event triggered successfully');

        orchestrator.triggerGameEvent('CELEBRATION', 'away');
        console.log('✅ CELEBRATION event triggered successfully');

        // Test weather system
        orchestrator.setWeatherCondition('light_rain');
        console.log('✅ Weather condition set successfully');

        return true;
    } catch (error) {
        console.error('❌ Event system test failed:', error);
        return false;
    }
}

// Test 4: Performance monitoring
function testPerformanceMonitoring() {
    console.log('\n📊 Testing Performance Monitoring...');

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const orchestrator = new BlazeGraphicsOrchestrator(scene, renderer, camera);

        // Test performance metrics
        const metrics = orchestrator.getPerformanceMetrics();
        console.log('✅ Performance metrics available:', Object.keys(metrics));

        // Test quality adjustment
        orchestrator.setQualityTier('professional');
        console.log('✅ Quality tier adjustment successful');

        return true;
    } catch (error) {
        console.error('❌ Performance monitoring test failed:', error);
        return false;
    }
}

// Run all tests
function runIntegrationTests() {
    console.log('🔥 Blaze Intelligence Graphics Integration Test Suite\n');
    console.log('Testing championship-quality graphics enhancements...\n');

    const results = {
        'Module Availability': testModuleAvailability(),
        'Orchestrator Initialization': testOrchestratorInitialization(),
        'Event System': testEventSystem(),
        'Performance Monitoring': testPerformanceMonitoring()
    };

    console.log('\n📋 Test Results Summary:');
    console.table(results);

    const allPassed = Object.values(results).every(result => result === true);

    if (allPassed) {
        console.log('\n🏆 ALL TESTS PASSED! Graphics integration is ready for championship performance!');
    } else {
        console.log('\n⚠️  Some tests failed. Review the integration before deployment.');
    }

    return results;
}

// Auto-run if in browser environment
if (typeof window !== 'undefined' && window.THREE) {
    // Wait a moment for all modules to load
    setTimeout(runIntegrationTests, 1000);
} else {
    console.log('ℹ️  Test suite ready. Run runIntegrationTests() when Three.js and graphics modules are loaded.');
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runIntegrationTests };
}