#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Analyzes and optimizes the site for production deployment
 */

import { readFileSync, writeFileSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';

console.log('🔥 Blaze Sports Intel - Performance Optimization\n');

const results = {
    filesAnalyzed: 0,
    totalSize: 0,
    recommendations: []
};

// Analyze HTML files
function analyzeHTML(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const size = statSync(filePath).size;
    
    results.filesAnalyzed++;
    results.totalSize += size;
    
    console.log(`📄 Analyzing: ${filePath} (${(size / 1024).toFixed(2)} KB)`);
    
    // Check for common performance issues
    const checks = [
        {
            pattern: /<img[^>]*(?!loading=)/gi,
            message: 'Images without lazy loading attribute',
            fix: 'Add loading="lazy" to images'
        },
        {
            pattern: /<script[^>]*(?!defer|async)/gi,
            message: 'Blocking scripts detected',
            fix: 'Add defer or async to script tags'
        },
        {
            pattern: /<link[^>]*stylesheet[^>]*(?!media)/gi,
            message: 'Blocking stylesheets',
            fix: 'Consider async loading for non-critical CSS'
        },
        {
            pattern: /<!--[\s\S]*?-->/g,
            message: 'HTML comments in production',
            fix: 'Remove comments to reduce file size'
        }
    ];
    
    checks.forEach(check => {
        const matches = content.match(check.pattern);
        if (matches && matches.length > 0) {
            results.recommendations.push({
                file: filePath,
                issue: check.message,
                count: matches.length,
                fix: check.fix
            });
        }
    });
}

// Analyze JavaScript files
function analyzeJS(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const size = statSync(filePath).size;
    
    results.filesAnalyzed++;
    results.totalSize += size;
    
    console.log(`📜 Analyzing: ${filePath} (${(size / 1024).toFixed(2)} KB)`);
    
    // Check for console.log statements
    const consoleLogs = content.match(/console\.(log|debug|info)/g);
    if (consoleLogs && consoleLogs.length > 0) {
        results.recommendations.push({
            file: filePath,
            issue: 'Console statements in production',
            count: consoleLogs.length,
            fix: 'Remove console.log statements for production'
        });
    }
    
    // Check for large file size
    if (size > 100 * 1024) {
        results.recommendations.push({
            file: filePath,
            issue: 'Large JavaScript file',
            count: 1,
            fix: `Consider code splitting or minification (${(size / 1024).toFixed(2)} KB)`
        });
    }
}

// Analyze CSS files
function analyzeCSS(filePath) {
    const size = statSync(filePath).size;
    
    results.filesAnalyzed++;
    results.totalSize += size;
    
    console.log(`🎨 Analyzing: ${filePath} (${(size / 1024).toFixed(2)} KB)`);
    
    if (size > 50 * 1024) {
        results.recommendations.push({
            file: filePath,
            issue: 'Large CSS file',
            count: 1,
            fix: `Consider CSS minification and critical CSS extraction (${(size / 1024).toFixed(2)} KB)`
        });
    }
}

// Scan directory recursively
function scanDirectory(dir, extensions) {
    try {
        const files = readdirSync(dir);
        
        files.forEach(file => {
            const filePath = join(dir, file);
            
            try {
                const stat = statSync(filePath);
                
                if (stat.isDirectory()) {
                    // Skip node_modules and other build directories
                    if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
                        scanDirectory(filePath, extensions);
                    }
                } else if (stat.isFile()) {
                    const ext = extname(file).toLowerCase();
                    
                    if (ext === '.html' || ext === '.htm') {
                        analyzeHTML(filePath);
                    } else if (ext === '.js') {
                        analyzeJS(filePath);
                    } else if (ext === '.css') {
                        analyzeCSS(filePath);
                    }
                }
            } catch (err) {
                // Skip files we can't access
            }
        });
    } catch (err) {
        console.error(`Error scanning directory ${dir}:`, err.message);
    }
}

// Main execution
console.log('Starting performance analysis...\n');
scanDirectory('.', ['.html', '.js', '.css']);

// Print results
console.log('\n' + '='.repeat(70));
console.log('📊 Performance Analysis Results');
console.log('='.repeat(70));
console.log(`\nFiles analyzed: ${results.filesAnalyzed}`);
console.log(`Total size: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`\nRecommendations: ${results.recommendations.length}`);

if (results.recommendations.length > 0) {
    console.log('\n⚠️  Issues Found:\n');
    
    // Group by issue type
    const grouped = results.recommendations.reduce((acc, rec) => {
        if (!acc[rec.issue]) {
            acc[rec.issue] = [];
        }
        acc[rec.issue].push(rec);
        return acc;
    }, {});
    
    Object.entries(grouped).forEach(([issue, recs]) => {
        console.log(`  ${issue} (${recs.length} file${recs.length > 1 ? 's' : ''})`);
        console.log(`  └─ Fix: ${recs[0].fix}`);
        recs.slice(0, 3).forEach(rec => {
            console.log(`     • ${rec.file}${rec.count > 1 ? ` (${rec.count} instances)` : ''}`);
        });
        if (recs.length > 3) {
            console.log(`     ... and ${recs.length - 3} more`);
        }
        console.log('');
    });
} else {
    console.log('\n✅ No performance issues detected!');
}

// Performance score
const score = Math.max(0, 100 - (results.recommendations.length * 5));
console.log(`\n🎯 Performance Score: ${score}/100`);

if (score >= 90) {
    console.log('✅ Excellent! Site is well optimized.');
} else if (score >= 70) {
    console.log('⚠️  Good, but some improvements recommended.');
} else {
    console.log('❌ Needs optimization before production deployment.');
}

console.log('\n' + '='.repeat(70));
console.log('Run "npm run build" to prepare optimized files for production');
console.log('='.repeat(70) + '\n');

// Exit with appropriate code
process.exit(score < 70 ? 1 : 0);
