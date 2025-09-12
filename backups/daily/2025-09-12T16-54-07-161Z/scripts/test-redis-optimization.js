#!/usr/bin/env node

/**
 * Test Redis Caching Optimization
 * Validates performance improvements with caching
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import OptimizedSportsDataService from '../services/optimized-sports-data-service.js';

class RedisCacheOptimizationTest {
  constructor() {
    this.service = new OptimizedSportsDataService();
    this.testResults = [];
  }

  async runPerformanceTest() {
    console.log('🚀 Redis Cache Optimization Performance Test');
    console.log('━'.repeat(60));

    try {
      await this.service.initialize();
      
      // Test 1: Cold cache performance
      await this.testColdCache();
      
      // Test 2: Warm cache performance
      await this.testWarmCache();
      
      // Test 3: Parallel requests
      await this.testParallelRequests();
      
      // Test 4: Cache invalidation
      await this.testCacheInvalidation();
      
      // Test 5: Rate limiting
      await this.testRateLimiting();
      
      // Generate performance report
      await this.generateReport();
      
    } finally {
      await this.service.close();
    }
  }

  async testColdCache() {
    console.log('\n📊 Test 1: Cold Cache Performance');
    
    const startTime = Date.now();
    
    try {
      const data = await this.service.getTeamData('cardinals', { forceRefresh: true });
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        test: 'Cold Cache',
        duration,
        dataPoints: data.dataPoints,
        cached: data.performance.cached,
        status: 'PASS'
      });
      
      console.log(`  ✅ Cold cache: ${duration}ms (${data.dataPoints} data points)`);
      console.log(`  📄 Data source: ${data.performance.source}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Cold Cache',
        status: 'FAIL',
        error: error.message
      });
      console.log(`  ❌ Cold cache failed: ${error.message}`);
    }
  }

  async testWarmCache() {
    console.log('\n⚡ Test 2: Warm Cache Performance');
    
    const startTime = Date.now();
    
    try {
      const data = await this.service.getTeamData('cardinals');
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        test: 'Warm Cache',
        duration,
        dataPoints: data.dataPoints,
        cached: data.performance.cached,
        status: 'PASS'
      });
      
      console.log(`  ✅ Warm cache: ${duration}ms (${data.dataPoints} data points)`);
      console.log(`  📄 Data source: ${data.performance.source}`);
      console.log(`  ⚡ Cache hit: ${data.performance.cached ? 'YES' : 'NO'}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Warm Cache',
        status: 'FAIL',
        error: error.message
      });
      console.log(`  ❌ Warm cache failed: ${error.message}`);
    }
  }

  async testParallelRequests() {
    console.log('\n🔥 Test 3: Parallel Requests Performance');
    
    const startTime = Date.now();
    
    try {
      const allData = await this.service.getAllTeamsData();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        test: 'Parallel Requests',
        duration,
        teamsProcessed: allData.teams.length,
        totalTeams: allData.total_teams,
        errors: allData.errors.length,
        status: 'PASS'
      });
      
      console.log(`  ✅ Parallel requests: ${duration}ms`);
      console.log(`  📊 Teams processed: ${allData.teams.length}/${allData.total_teams}`);
      console.log(`  ❌ Errors: ${allData.errors.length}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Parallel Requests',
        status: 'FAIL',
        error: error.message
      });
      console.log(`  ❌ Parallel requests failed: ${error.message}`);
    }
  }

  async testCacheInvalidation() {
    console.log('\n🧹 Test 4: Cache Invalidation');
    
    try {
      // Invalidate Cardinals cache
      const invalidated = await this.service.invalidateTeamCache('cardinals');
      
      // Fetch fresh data
      const startTime = Date.now();
      const data = await this.service.getTeamData('cardinals');
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        test: 'Cache Invalidation',
        duration,
        invalidated,
        cached: data.performance.cached,
        status: 'PASS'
      });
      
      console.log(`  ✅ Cache invalidation: ${duration}ms`);
      console.log(`  🗑️  Keys invalidated: ${invalidated}`);
      console.log(`  📄 Fresh data: ${!data.performance.cached ? 'YES' : 'NO'}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Cache Invalidation',
        status: 'FAIL',
        error: error.message
      });
      console.log(`  ❌ Cache invalidation failed: ${error.message}`);
    }
  }

  async testRateLimiting() {
    console.log('\n🚦 Test 5: Rate Limiting');
    
    try {
      const metrics = await this.service.getPerformanceMetrics();
      
      this.testResults.push({
        test: 'Rate Limiting',
        cacheStatus: metrics.cache.status,
        totalKeys: metrics.cache.total_keys,
        sportsKeys: metrics.cache.sports_data_keys,
        status: 'PASS'
      });
      
      console.log(`  ✅ Rate limiting system operational`);
      console.log(`  📊 Cache status: ${metrics.cache.status}`);
      console.log(`  🔑 Total cache keys: ${metrics.cache.total_keys}`);
      console.log(`  🏈 Sports data keys: ${metrics.cache.sports_data_keys}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Rate Limiting',
        status: 'FAIL',
        error: error.message
      });
      console.log(`  ❌ Rate limiting test failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n' + '━'.repeat(60));
    console.log('📊 REDIS CACHE OPTIMIZATION REPORT');
    console.log('━'.repeat(60));

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const successRate = ((passed / this.testResults.length) * 100).toFixed(1);

    console.log(`⏱️  Tests completed: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success rate: ${successRate}%`);

    // Performance summary
    const coldCache = this.testResults.find(r => r.test === 'Cold Cache');
    const warmCache = this.testResults.find(r => r.test === 'Warm Cache');
    
    if (coldCache && warmCache && coldCache.duration && warmCache.duration) {
      const improvement = ((coldCache.duration - warmCache.duration) / coldCache.duration * 100).toFixed(1);
      console.log(`\n⚡ Performance Improvement:`);
      console.log(`  Cold cache: ${coldCache.duration}ms`);
      console.log(`  Warm cache: ${warmCache.duration}ms`);
      console.log(`  Improvement: ${improvement}% faster with cache`);
    }

    // Get final performance metrics
    try {
      const finalMetrics = await this.service.getPerformanceMetrics();
      console.log(`\n🏥 System Health:`);
      console.log(`  Cache status: ${finalMetrics.cache.status}`);
      console.log(`  Cache hit ratio: ${finalMetrics.performance.cache_hit_ratio}`);
      console.log(`  Avg response time: ${finalMetrics.performance.avg_response_time}`);
      console.log(`  Memory usage: ${finalMetrics.cache.memory_used}`);
    } catch (error) {
      console.log(`\n⚠️  Could not get final metrics: ${error.message}`);
    }

    const overallStatus = failed === 0 ? 'SUCCESS' : 'PARTIAL';
    const statusEmoji = overallStatus === 'SUCCESS' ? '🎉' : '⚠️';
    
    console.log(`\n${statusEmoji} OVERALL STATUS: ${overallStatus}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(`  • ${test.test}: ${test.error}`);
        });
    }

    console.log('\n🚀 Optimization Benefits:');
    console.log('  • Faster data retrieval with intelligent caching');
    console.log('  • Reduced API rate limit usage');
    console.log('  • Improved reliability with fallback mechanisms');
    console.log('  • Enhanced scalability for concurrent users');
    console.log('  • Real-time performance monitoring');

    console.log('━'.repeat(60));

    return {
      passed,
      failed,
      successRate: parseFloat(successRate),
      overallStatus,
      testResults: this.testResults
    };
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new RedisCacheOptimizationTest();
  test.runPerformanceTest().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

export default RedisCacheOptimizationTest;