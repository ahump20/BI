#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const execAsync = promisify(exec);

// Configuration for cleanup
const config = {
  // Files to definitely remove
  filesToRemove: [
    'accuracy_trend_1757429460210.png',
    'AE138435-C76E-4A94-8BE2-2392E762810D_1757402136485.png',
    'Terminal Saved Output.txt',
    'babel.min.js',
    'sample.py',
    'run_tests.py',
    'api.py',
    'css2',
    'ssl_verification_results.txt',
    // Remove duplicate/test HTML files
    'index-new.html',
    'index-enhanced.html',
    'simple-landing.html',
    'api-test.html',
    'demo.html',
    'app.html',
    // Remove test/temporary files
    'COMPREHENSIVE_SYSTEM_TEST_*.json',
    'PRODUCTION_DEPLOYMENT_*.json',
    'deployment_*.log',
    '*_1757*.ts',
    '*_1757*.tsx',
    '*_1757*.py',
    '*_1757*.png',
    '*_1757*.md',
  ],
  
  // Directories to clean up or remove
  directoriesToClean: [
    'test-data',
    'test-results',
    'dist/deploy_*', // Old deployment directories
  ],
  
  // Files to keep in specific locations
  essentialFiles: [
    'index.html',
    'package.json',
    'README.md',
    'CLAUDE.md',
    '.gitignore',
    'wrangler.toml',
    'cardinals-analytics-server.js',
  ],
  
  // Core directories to organize
  coreDirectories: {
    'src': 'Source code and main application files',
    'public': 'Public static assets and HTML files',
    'scripts': 'Automation and deployment scripts',
    'data': 'Sports data and analytics',
    'config': 'Configuration files',
    'docs': 'Documentation',
  }
};

async function cleanup() {
  console.log('🧹 Starting Blaze Intelligence Repository Cleanup...\n');
  
  const removedFiles = [];
  const errors = [];
  
  // Step 1: Remove unnecessary files
  console.log('📄 Removing unnecessary files...');
  for (const pattern of config.filesToRemove) {
    try {
      if (pattern.includes('*')) {
        // Handle wildcards
        const { stdout } = await execAsync(`find "${projectRoot}" -name "${pattern}" -type f`, { cwd: projectRoot });
        const files = stdout.split('\n').filter(f => f);
        for (const file of files) {
          try {
            await fs.unlink(file);
            removedFiles.push(path.relative(projectRoot, file));
          } catch (err) {
            if (err.code !== 'ENOENT') {
              errors.push(`Failed to remove ${file}: ${err.message}`);
            }
          }
        }
      } else {
        // Direct file removal
        const filePath = path.join(projectRoot, pattern);
        try {
          await fs.unlink(filePath);
          removedFiles.push(pattern);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            errors.push(`Failed to remove ${pattern}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      errors.push(`Error processing ${pattern}: ${err.message}`);
    }
  }
  
  // Step 2: Clean up directories
  console.log('\n📁 Cleaning up directories...');
  for (const dirPattern of config.directoriesToClean) {
    try {
      if (dirPattern.includes('*')) {
        const { stdout } = await execAsync(`find "${projectRoot}" -path "${dirPattern}" -type d`, { cwd: projectRoot });
        const dirs = stdout.split('\n').filter(d => d);
        for (const dir of dirs) {
          try {
            await fs.rm(dir, { recursive: true, force: true });
            console.log(`  ✓ Removed directory: ${path.relative(projectRoot, dir)}`);
          } catch (err) {
            errors.push(`Failed to remove directory ${dir}: ${err.message}`);
          }
        }
      } else {
        const dirPath = path.join(projectRoot, dirPattern);
        try {
          await fs.rm(dirPath, { recursive: true, force: true });
          console.log(`  ✓ Removed directory: ${dirPattern}`);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            errors.push(`Failed to remove directory ${dirPattern}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      errors.push(`Error processing directory ${dirPattern}: ${err.message}`);
    }
  }
  
  // Step 3: Create organized structure
  console.log('\n🏗️ Creating organized directory structure...');
  
  // Create core directories if they don't exist
  for (const [dirName, description] of Object.entries(config.coreDirectories)) {
    const dirPath = path.join(projectRoot, dirName);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`  ✓ Ensured directory: ${dirName}/ - ${description}`);
    } catch (err) {
      errors.push(`Failed to create directory ${dirName}: ${err.message}`);
    }
  }
  
  // Step 4: Move and organize files
  console.log('\n📦 Organizing files into proper directories...');
  
  const moveOperations = [
    // Move all loose HTML files to public directory
    { pattern: '*.html', destination: 'public/', exclude: ['index.html'] },
    // Move CSS files to public/css
    { pattern: '*.css', destination: 'public/css/' },
    // Move JS files (except server files) to src
    { pattern: '*.js', destination: 'src/', exclude: ['cardinals-analytics-server.js', 'server.js', 'index.js', 'service-worker.js', 'sw.js'] },
    // Move documentation to docs
    { pattern: '*.md', destination: 'docs/', exclude: ['README.md', 'CLAUDE.md'] },
  ];
  
  for (const op of moveOperations) {
    try {
      const destPath = path.join(projectRoot, op.destination);
      await fs.mkdir(destPath, { recursive: true });
      
      const files = await fs.readdir(projectRoot);
      const pattern = new RegExp(op.pattern.replace('*', '.*'));
      
      for (const file of files) {
        if (pattern.test(file) && (!op.exclude || !op.exclude.includes(file))) {
          const srcPath = path.join(projectRoot, file);
          const stats = await fs.stat(srcPath);
          
          if (stats.isFile()) {
            const destFile = path.join(destPath, file);
            try {
              await fs.rename(srcPath, destFile);
              console.log(`  ✓ Moved ${file} to ${op.destination}`);
            } catch (err) {
              if (err.code !== 'ENOENT') {
                errors.push(`Failed to move ${file}: ${err.message}`);
              }
            }
          }
        }
      }
    } catch (err) {
      errors.push(`Error in move operation: ${err.message}`);
    }
  }
  
  // Step 5: Summary
  console.log('\n📊 Cleanup Summary:');
  console.log(`  ✓ Removed ${removedFiles.length} unnecessary files`);
  console.log(`  ✓ Organized files into proper directories`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  // Step 6: Generate cleanup report
  const report = {
    timestamp: new Date().toISOString(),
    removedFiles,
    errors,
    newStructure: config.coreDirectories,
  };
  
  await fs.writeFile(
    path.join(projectRoot, 'cleanup-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Cleanup complete! Report saved to cleanup-report.json');
  
  // Show git status
  console.log('\n📝 Current git status:');
  try {
    const { stdout } = await execAsync('git status --short', { cwd: projectRoot });
    console.log(stdout || '  No changes detected');
  } catch (err) {
    console.log('  Could not get git status');
  }
}

// Run cleanup
cleanup().catch(console.error);