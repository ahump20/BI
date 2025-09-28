#!/usr/bin/env node
// Blaze Sports Intel - Design System Verification Script
// Version: 1.0.0
// Updated: 2025-09-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKS = {
  tokens: {
    name: 'Design Tokens',
    files: [
      'tokens/colors.js',
      'tokens/typography.js',
      'tokens/spacing.js'
    ]
  },
  components: {
    name: 'Components',
    files: [
      'components/Button.tsx',
      'components/sports/BaseballDashboard.tsx',
      'components/sports/FootballDashboard.tsx'
    ]
  },
  generated: {
    name: 'Generated CSS',
    files: [
      'dist/css/design-tokens.css',
      'dist/css/design-tokens.min.css',
      'dist/json/design-tokens.json'
    ]
  },
  integration: {
    name: 'Site Integration',
    files: [
      'dist/index.html',
      'design-system-test.html'
    ]
  }
};

let allPassed = true;

console.log('🔍 Verifying Blaze Sports Intel Design System Integration...\n');

// Check file existence
for (const [category, config] of Object.entries(CHECKS)) {
  console.log(`📋 Checking ${config.name}:`);

  for (const file of config.files) {
    const filePath = path.resolve(__dirname, '..', file);
    const exists = fs.existsSync(filePath);

    if (exists) {
      const stats = fs.statSync(filePath);
      console.log(`  ✅ ${file} (${stats.size} bytes)`);
    } else {
      console.log(`  ❌ ${file} - NOT FOUND`);
      allPassed = false;
    }
  }
  console.log('');
}

// Check design token CSS integration
console.log('🔗 Checking Design Token CSS Integration:');
const indexPath = path.resolve(__dirname, '../dist/index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Check for design token link
  if (indexContent.includes('design-tokens.min.css')) {
    console.log('  ✅ Design tokens CSS linked in main index.html');
  } else {
    console.log('  ❌ Design tokens CSS NOT linked in main index.html');
    allPassed = false;
  }

  // Check for React libraries
  if (indexContent.includes('react@18') && indexContent.includes('react-dom@18')) {
    console.log('  ✅ React 18 libraries present');
  } else {
    console.log('  ❌ React 18 libraries missing');
    allPassed = false;
  }

  // Check for Three.js
  if (indexContent.includes('three.js')) {
    console.log('  ✅ Three.js library present');
  } else {
    console.log('  ⚠️  Three.js library not found (might be loaded dynamically)');
  }

  // Check for existing brand colors
  const brandColors = ['#BF5700', '#FF8C42', '#FFB81C'];
  const hasAllBrandColors = brandColors.every(color => indexContent.includes(color));
  if (hasAllBrandColors) {
    console.log('  ✅ Brand colors preserved');
  } else {
    console.log('  ❌ Some brand colors missing');
    allPassed = false;
  }

  // Check for Monte Carlo integration
  if (indexContent.includes('Monte Carlo')) {
    console.log('  ✅ Monte Carlo section preserved');
  } else {
    console.log('  ⚠️  Monte Carlo section not found (check if moved)');
  }

  // Check for authentication modals
  if (indexContent.includes('signInModal') && indexContent.includes('getStartedModal')) {
    console.log('  ✅ Authentication modals present');
  } else {
    console.log('  ⚠️  Authentication modals might need verification');
  }
} else {
  console.log('  ❌ Main index.html not found');
  allPassed = false;
}

console.log('\n' + '='.repeat(60));

// Final report
if (allPassed) {
  console.log('✨ SUCCESS: Design System Integration Complete!');
  console.log('\n📌 Next Steps:');
  console.log('  1. Test at http://localhost:8001/design-system-test.html');
  console.log('  2. Deploy to blazesportsintel.com via Cloudflare Pages');
  console.log('  3. Verify all React components render correctly');
  console.log('  4. Test sport-specific components (Baseball, Football, Basketball, Track)');
  console.log('  5. Confirm Monte Carlo visualization still works');
} else {
  console.log('⚠️  WARNING: Some checks failed. Please review and fix issues above.');
  console.log('\n🔧 To fix:');
  console.log('  1. Run: node scripts/build-design-tokens.js');
  console.log('  2. Verify all token files exist in tokens/ directory');
  console.log('  3. Check dist/index.html includes design-tokens.min.css link');
  process.exit(1);
}

console.log('\n🔥 Blaze Sports Intel - Championship Intelligence Platform');