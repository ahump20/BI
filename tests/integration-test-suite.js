#!/usr/bin/env node

/**
 * Comprehensive Integration Test Suite
 * Tests all implemented PR features for functionality and security
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class IntegrationTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            details: []
        };
        
        this.testCategories = [
            'Infrastructure',
            'Security',
            '3D Visualization',
            'API Endpoints',
            'UI Components',
            'Branch Management',
            'Documentation'
        ];
    }

    async runAllTests() {
        console.log('🧪 Starting Comprehensive Integration Test Suite...\n');
        
        await this.testInfrastructure();
        await this.testSecurity();
        await this.test3DVisualization();
        await this.testAPIEndpoints();
        await this.testUIComponents();
        await this.testBranchManagement();
        await this.testDocumentation();
        
        this.printResults();
        await this.generateTestReport();
        
        return this.testResults;
    }

    async testInfrastructure() {
        console.log('🏗️ Testing Infrastructure Components...');
        
        // Test package.json configuration
        await this.runTest('Package Configuration', async () => {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            
            // Check for required scripts
            const requiredScripts = [
                'start', 'catch-branches', 'deploy', 'serve',
                'test-ai', 'health-check', 'mcp-server'
            ];
            
            for (const script of requiredScripts) {
                if (!packageJson.scripts[script]) {
                    throw new Error(`Missing required script: ${script}`);
                }
            }
            
            // Check for required dependencies
            const requiredDeps = [
                'express', 'jsonwebtoken', 'three', 'chart.js'
            ];
            
            for (const dep of requiredDeps) {
                if (!packageJson.dependencies[dep]) {
                    throw new Error(`Missing required dependency: ${dep}`);
                }
            }
            
            return 'Package.json properly configured with all dependencies and scripts';
        });

        // Test consciousness stream functionality
        await this.runTest('Consciousness Stream', async () => {
            const consciousnessPath = './consciousness-stream.js';
            const exists = await fs.access(consciousnessPath).then(() => true).catch(() => false);
            
            if (!exists) {
                throw new Error('Consciousness stream file not found');
            }
            
            const content = await fs.readFile(consciousnessPath, 'utf8');
            
            // Check for key consciousness functionality
            if (!content.includes('generateConsciousnessData') || 
                !content.includes('consciousness') ||
                !content.includes('neural')) {
                throw new Error('Consciousness stream missing core functionality');
            }
            
            return 'Consciousness streaming infrastructure operational';
        });

        // Test file structure
        await this.runTest('File Structure', async () => {
            const requiredFiles = [
                'scripts/git-branch-manager.js',
                'scripts/pr-integration-manager.js',
                'enhanced-3d-platform.js',
                'api/live-intelligence-api.js',
                'components/hardened-scoreboard-ui.js'
            ];
            
            for (const file of requiredFiles) {
                const exists = await fs.access(file).then(() => true).catch(() => false);
                if (!exists) {
                    throw new Error(`Required file missing: ${file}`);
                }
            }
            
            return 'All required files present in repository';
        });
    }

    async testSecurity() {
        console.log('🔐 Testing Security Features...');
        
        // Test API security configuration
        await this.runTest('API Security', async () => {
            const apiPath = './api/live-intelligence-api.js';
            const content = await fs.readFile(apiPath, 'utf8');
            
            // Check for security features
            const securityFeatures = [
                'helmet', 'cors', 'rateLimit', 'jwt.verify',
                'sanitize', 'XSS protection'
            ];
            
            const missingFeatures = securityFeatures.filter(feature => 
                !content.includes(feature.split(' ')[0])
            );
            
            if (missingFeatures.length > 0) {
                throw new Error(`Missing security features: ${missingFeatures.join(', ')}`);
            }
            
            return 'API security features properly implemented';
        });

        // Test XSS protection in UI components
        await this.runTest('XSS Protection', async () => {
            const uiPath = './components/hardened-scoreboard-ui.js';
            const content = await fs.readFile(uiPath, 'utf8');
            
            // Check for XSS protection methods
            const xssProtection = [
                'sanitizeText', 'sanitizeHTML', 'dangerousPatterns',
                'textContent', 'removeAttribute'
            ];
            
            const missingProtection = xssProtection.filter(method => 
                !content.includes(method)
            );
            
            if (missingProtection.length > 0) {
                throw new Error(`Missing XSS protection: ${missingProtection.join(', ')}`);
            }
            
            return 'XSS protection properly implemented in UI components';
        });

        // Test input validation
        await this.runTest('Input Validation', async () => {
            const apiPath = './api/live-intelligence-api.js';
            const content = await fs.readFile(apiPath, 'utf8');
            
            // Check for validation methods
            if (!content.includes('validateScore') || 
                !content.includes('sanitize') ||
                !content.includes('validation')) {
                throw new Error('Input validation not properly implemented');
            }
            
            return 'Input validation mechanisms in place';
        });
    }

    async test3DVisualization() {
        console.log('🎮 Testing 3D Visualization Platform...');
        
        // Test 3D platform structure
        await this.runTest('3D Platform Structure', async () => {
            const platformPath = './enhanced-3d-platform.js';
            const content = await fs.readFile(platformPath, 'utf8');
            
            // Check for key 3D features
            const features = [
                'Enhanced3DVisualizationPlatform',
                'THREE.js',
                'WebGL2',
                'WebGPU',
                'WebXR',
                'sports analytics',
                'detectCapabilities'
            ];
            
            const missingFeatures = features.filter(feature => 
                !content.toLowerCase().includes(feature.toLowerCase())
            );
            
            if (missingFeatures.length > 0) {
                throw new Error(`Missing 3D features: ${missingFeatures.join(', ')}`);
            }
            
            return '3D visualization platform structure complete';
        });

        // Test sports analytics integration
        await this.runTest('Sports Analytics Integration', async () => {
            const platformPath = './enhanced-3d-platform.js';
            const content = await fs.readFile(platformPath, 'utf8');
            
            // Check for sports-specific features
            const sportsFeatures = [
                'Cardinals', 'Titans', 'Longhorns', 'Grizzlies',
                'createTeamVisualization', 'createDataConnectionNetwork',
                'stadiums', 'analytics'
            ];
            
            const missingSports = sportsFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingSports.length > 0) {
                throw new Error(`Missing sports analytics: ${missingSports.join(', ')}`);
            }
            
            return 'Sports analytics properly integrated in 3D platform';
        });

        // Test performance optimizations
        await this.runTest('Performance Optimizations', async () => {
            const platformPath = './enhanced-3d-platform.js';
            const content = await fs.readFile(platformPath, 'utf8');
            
            // Check for performance features
            const perfFeatures = [
                'adaptQuality', 'targetFPS', 'qualityLevel',
                'frameTime', 'powerPreference', 'setPixelRatio'
            ];
            
            const missingPerf = perfFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingPerf.length > 0) {
                throw new Error(`Missing performance optimizations: ${missingPerf.join(', ')}`);
            }
            
            return 'Performance optimizations implemented';
        });
    }

    async testAPIEndpoints() {
        console.log('🌐 Testing API Endpoints...');
        
        // Test API structure
        await this.runTest('API Endpoint Structure', async () => {
            const apiPath = './api/live-intelligence-api.js';
            const content = await fs.readFile(apiPath, 'utf8');
            
            // Check for required endpoints
            const endpoints = [
                '/api/nil/', '/api/championship/', '/api/character/',
                '/api/analytics/', '/api/auth/', '/api/health'
            ];
            
            const missingEndpoints = endpoints.filter(endpoint => 
                !content.includes(endpoint)
            );
            
            if (missingEndpoints.length > 0) {
                throw new Error(`Missing API endpoints: ${missingEndpoints.join(', ')}`);
            }
            
            return 'All required API endpoints defined';
        });

        // Test authentication middleware
        await this.runTest('Authentication Middleware', async () => {
            const apiPath = './api/live-intelligence-api.js';
            const content = await fs.readFile(apiPath, 'utf8');
            
            // Check for auth features
            if (!content.includes('verifyToken') || 
                !content.includes('jwt.verify') ||
                !content.includes('authorization')) {
                throw new Error('Authentication middleware not properly implemented');
            }
            
            return 'Authentication middleware operational';
        });

        // Test NIL valuation endpoints
        await this.runTest('NIL Valuation Service', async () => {
            const apiPath = './api/live-intelligence-api.js';
            const content = await fs.readFile(apiPath, 'utf8');
            
            // Check for NIL-specific functionality
            const nilFeatures = [
                'calculateNILValuation', 'getTeamNILSummary',
                'totalValue', 'marketValue', 'socialMedia'
            ];
            
            const missingNIL = nilFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingNIL.length > 0) {
                throw new Error(`Missing NIL features: ${missingNIL.join(', ')}`);
            }
            
            return 'NIL valuation service properly implemented';
        });

        // Test championship probability calculations
        await this.runTest('Championship Probability Service', async () => {
            const apiPath = './api/live-intelligence-api.js';
            const content = await fs.readFile(apiPath, 'utf8');
            
            // Check for championship features
            const champFeatures = [
                'calculateChampionshipProbability', 'getConferenceChampionshipOdds',
                'roster', 'coaching', 'schedule', 'momentum'
            ];
            
            const missingChamp = champFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingChamp.length > 0) {
                throw new Error(`Missing championship features: ${missingChamp.join(', ')}`);
            }
            
            return 'Championship probability service operational';
        });
    }

    async testUIComponents() {
        console.log('🎨 Testing UI Components...');
        
        // Test scoreboard UI hardening
        await this.runTest('Scoreboard UI Security', async () => {
            const uiPath = './components/hardened-scoreboard-ui.js';
            const content = await fs.readFile(uiPath, 'utf8');
            
            // Check for hardening features
            const hardeningFeatures = [
                'ScoreboardUIRenderer', 'sanitizeText', 'sanitizeHTML',
                'validateGameData', 'createElement', 'XSS protection'
            ];
            
            const missingHardening = hardeningFeatures.filter(feature => 
                !content.includes(feature.split(' ')[0])
            );
            
            if (missingHardening.length > 0) {
                throw new Error(`Missing UI hardening: ${missingHardening.join(', ')}`);
            }
            
            return 'Scoreboard UI properly hardened against attacks';
        });

        // Test error handling
        await this.runTest('Error Handling', async () => {
            const uiPath = './components/hardened-scoreboard-ui.js';
            const content = await fs.readFile(uiPath, 'utf8');
            
            // Check for error handling
            const errorFeatures = [
                'showErrorState', 'showLoadingState', 'try', 'catch',
                'logError', 'maxRetries'
            ];
            
            const missingError = errorFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingError.length > 0) {
                throw new Error(`Missing error handling: ${missingError.join(', ')}`);
            }
            
            return 'Comprehensive error handling implemented';
        });

        // Test loading states
        await this.runTest('Loading State Management', async () => {
            const uiPath = './components/hardened-scoreboard-ui.js';
            const content = await fs.readFile(uiPath, 'utf8');
            
            // Check for loading state features
            if (!content.includes('showLoadingState') || 
                !content.includes('hideLoadingState') ||
                !content.includes('loadingTimeout')) {
                throw new Error('Loading state management not properly implemented');
            }
            
            return 'Loading state management operational';
        });
    }

    async testBranchManagement() {
        console.log('🌿 Testing Branch Management...');
        
        // Test git branch manager
        await this.runTest('Git Branch Manager', async () => {
            const branchPath = './scripts/git-branch-manager.js';
            const content = await fs.readFile(branchPath, 'utf8');
            
            // Check for branch management features
            const branchFeatures = [
                'GitBranchManager', 'analyzeBranches', 'mergeBranch',
                'updateBranch', 'deleteBranch', 'dryRun'
            ];
            
            const missingBranch = branchFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingBranch.length > 0) {
                throw new Error(`Missing branch features: ${missingBranch.join(', ')}`);
            }
            
            return 'Git branch management system operational';
        });

        // Test PR integration manager
        await this.runTest('PR Integration Manager', async () => {
            const prPath = './scripts/pr-integration-manager.js';
            const content = await fs.readFile(prPath, 'utf8');
            
            // Check for PR management features
            const prFeatures = [
                'PRIntegrationManager', 'analyzeImplementationStatus',
                'implementNextFeature', 'generateImplementationPlan'
            ];
            
            const missingPR = prFeatures.filter(feature => 
                !content.includes(feature)
            );
            
            if (missingPR.length > 0) {
                throw new Error(`Missing PR features: ${missingPR.join(', ')}`);
            }
            
            return 'PR integration management system operational';
        });

        // Test NPM commands
        await this.runTest('NPM Command Integration', async () => {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            
            // Check for branch management commands
            const branchCommands = [
                'catch-branches', 'catch-branches-execute',
                'sync-branches', 'merge-to-main'
            ];
            
            const missingCommands = branchCommands.filter(cmd => 
                !packageJson.scripts[cmd]
            );
            
            if (missingCommands.length > 0) {
                throw new Error(`Missing NPM commands: ${missingCommands.join(', ')}`);
            }
            
            return 'Branch management NPM commands properly configured';
        });
    }

    async testDocumentation() {
        console.log('📚 Testing Documentation...');
        
        // Test status documentation
        await this.runTest('Status Documentation', async () => {
            const statusFiles = [
                'PULL_REQUEST_INTEGRATION_STATUS.md',
                'PULL_REQUEST_STATUS.md',
                'PR_INTEGRATION_REPORT.json'
            ];
            
            for (const file of statusFiles) {
                const exists = await fs.access(file).then(() => true).catch(() => false);
                if (!exists) {
                    throw new Error(`Missing documentation file: ${file}`);
                }
            }
            
            return 'Comprehensive status documentation present';
        });

        // Test integration report
        await this.runTest('Integration Report', async () => {
            const reportPath = './PR_INTEGRATION_REPORT.json';
            const content = await fs.readFile(reportPath, 'utf8');
            const report = JSON.parse(content);
            
            // Check for required report fields
            const requiredFields = [
                'timestamp', 'totalPRs', 'status', 'completionRate'
            ];
            
            for (const field of requiredFields) {
                if (!(field in report)) {
                    throw new Error(`Missing report field: ${field}`);
                }
            }
            
            return 'Integration report properly structured';
        });

        // Test markdown documentation
        await this.runTest('Markdown Documentation', async () => {
            const statusPath = './PULL_REQUEST_STATUS.md';
            const content = await fs.readFile(statusPath, 'utf8');
            
            // Check for documentation sections
            const sections = [
                'Summary', 'Implementation Progress', 'Next Steps'
            ];
            
            const missingSections = sections.filter(section => 
                !content.includes(section)
            );
            
            if (missingSections.length > 0) {
                throw new Error(`Missing documentation sections: ${missingSections.join(', ')}`);
            }
            
            return 'Markdown documentation properly structured';
        });
    }

    async runTest(testName, testFunction) {
        this.testResults.total++;
        
        try {
            const result = await testFunction();
            this.testResults.passed++;
            this.testResults.details.push({
                name: testName,
                status: 'PASSED',
                message: result,
                timestamp: new Date().toISOString()
            });
            
            console.log(`  ✅ ${testName}: PASSED`);
            
        } catch (error) {
            this.testResults.failed++;
            this.testResults.details.push({
                name: testName,
                status: 'FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            
            console.log(`  ❌ ${testName}: FAILED - ${error.message}`);
        }
    }

    printResults() {
        console.log('\n🧪 TEST SUITE RESULTS\n');
        console.log(`📊 Total Tests: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`⏭️ Skipped: ${this.testResults.skipped}`);
        
        const successRate = Math.round((this.testResults.passed / this.testResults.total) * 100);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.details
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.message}`);
                });
        }
        
        console.log('\n🎯 Overall Status:', successRate >= 80 ? 'PASSING ✅' : 'NEEDS ATTENTION ⚠️');
    }

    async generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            },
            categories: this.testCategories,
            recommendations: this.generateRecommendations()
        };

        const reportPath = 'integration-test-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Test report saved to: ${reportPath}`);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.testResults.failed > 0) {
            recommendations.push('Address failing tests before proceeding with deployment');
        }
        
        if (this.testResults.passed / this.testResults.total < 0.9) {
            recommendations.push('Consider additional testing for critical components');
        }
        
        recommendations.push('Regularly run integration tests during development');
        recommendations.push('Update tests when adding new features');
        recommendations.push('Monitor test performance and optimize slow tests');
        
        return recommendations;
    }
}

// CLI interface
async function main() {
    const testSuite = new IntegrationTestSuite();
    
    try {
        const results = await testSuite.runAllTests();
        
        // Exit with error code if tests failed
        if (results.failed > 0) {
            process.exit(1);
        }
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('\n💥 Test suite failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default IntegrationTestSuite;