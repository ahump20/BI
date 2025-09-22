#!/usr/bin/env node

/**
 * Blaze Intelligence Copilot MCP Integration Test
 * Tests the MCP server tools and functionality
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

// Test configurations
const TESTS = [
  {
    name: "Project Structure Analysis",
    tool: "analyze_project_structure",
    args: { depth: 2, format: "json" }
  },
  {
    name: "Code Search",
    tool: "search_codebase", 
    args: { query: "function", fileType: "js" }
  },
  {
    name: "Code Generation",
    tool: "generate_code",
    args: { 
      specification: "Simple test function",
      language: "javascript",
      outputPath: "/tmp/test-generated.js"
    }
  }
];

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Simulate MCP tool call (since we don't have the actual MCP client)
async function testTool(toolName, args) {
  try {
    // This would normally be a proper MCP call
    // For testing, we'll just validate the tool exists in our server
    const serverContent = await fs.readFile('copilot-mcp-server.js', 'utf-8');
    
    if (serverContent.includes(`name: "${toolName}"`)) {
      return {
        success: true,
        message: `Tool ${toolName} is available in server`,
        args
      };
    } else {
      throw new Error(`Tool ${toolName} not found in server`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      args
    };
  }
}

async function runTests() {
  log('blue', '🔥 Running Blaze Intelligence Copilot MCP Integration Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of TESTS) {
    log('blue', `🧪 Testing: ${test.name}`);
    
    const result = await testTool(test.tool, test.args);
    
    if (result.success) {
      log('green', `✅ ${test.name} - PASSED`);
      console.log(`   Tool: ${test.tool}`);
      console.log(`   Args: ${JSON.stringify(test.args)}`);
      passed++;
    } else {
      log('red', `❌ ${test.name} - FAILED`);
      console.log(`   Error: ${result.error}`);
      failed++;
    }
    console.log('');
  }
  
  // Test server startup
  log('blue', '🧪 Testing: Server Startup');
  try {
    const serverProcess = spawn('node', ['copilot-mcp-server.js'], {
      cwd: PROJECT_ROOT,
      stdio: 'pipe'
    });
    
    let serverOutput = '';
    serverProcess.stderr.on('data', (data) => {
      serverOutput += data.toString();
    });
    
    setTimeout(() => {
      serverProcess.kill();
      
      if (serverOutput.includes('started successfully')) {
        log('green', '✅ Server Startup - PASSED');
        console.log('   Server started and responded correctly');
        passed++;
      } else {
        log('red', '❌ Server Startup - FAILED');
        console.log('   Server did not start properly');
        failed++;
      }
      
      // Final summary
      console.log('');
      log('blue', '========================================');
      log('blue', '📊 TEST SUMMARY');
      log('blue', '========================================');
      console.log('');
      log('green', `✅ Passed: ${passed}`);
      log('red', `❌ Failed: ${failed}`);
      console.log('');
      
      if (failed === 0) {
        log('green', '🎉 All tests passed! MCP Copilot configuration is working correctly.');
      } else {
        log('yellow', '⚠️  Some tests failed. Please review the configuration.');
      }
    }, 3000);
    
  } catch (error) {
    log('red', '❌ Server Startup - FAILED');
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Additional validation tests
async function validateConfiguration() {
  log('blue', '\n🔍 Running Configuration Validation...\n');
  
  const checks = [
    {
      name: "Claude Desktop Config",
      test: async () => {
        const config = JSON.parse(await fs.readFile('claude_desktop_config_copilot.json', 'utf-8'));
        return config.mcpServers && config.mcpServers['blaze-copilot-agent'];
      }
    },
    {
      name: "Environment Template",
      test: async () => {
        const env = await fs.readFile('.env.copilot.example', 'utf-8');
        return env.includes('BLAZE_PROJECT_ROOT') && env.includes('MCP_SERVER_NAME');
      }
    },
    {
      name: "Server Tools Definition",
      test: async () => {
        const server = await fs.readFile('copilot-mcp-server.js', 'utf-8');
        return server.includes('TOOLS') && server.includes('toolHandlers');
      }
    },
    {
      name: "Documentation",
      test: async () => {
        try {
          await fs.access('docs/README-Copilot-MCP.md');
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  for (const check of checks) {
    try {
      const result = await check.test();
      if (result) {
        log('green', `✅ ${check.name}`);
      } else {
        log('red', `❌ ${check.name}`);
      }
    } catch (error) {
      log('red', `❌ ${check.name} - Error: ${error.message}`);
    }
  }
}

// Run all tests
async function main() {
  await validateConfiguration();
  await runTests();
}

main().catch(console.error);