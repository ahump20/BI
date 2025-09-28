#!/usr/bin/env node
// Blaze Sports Intel - Design Token Build Script
// Version: 1.0.0
// Updated: 2025-09-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { colors } from '../tokens/colors.js';
import { typography } from '../tokens/typography.js';
import { spacing } from '../tokens/spacing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert nested object to CSS variables
function objectToCSSVariables(obj, prefix = '') {
  let css = '';

  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      css += objectToCSSVariables(value, varName);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        css += `  --${varName}-${index}: ${item};\n`;
      });
    } else {
      css += `  --${varName}: ${value};\n`;
    }
  }

  return css;
}

// Generate CSS file with all design tokens
function generateCSS() {
  let css = `/* Blaze Sports Intel - Design System Tokens
 * Auto-generated from tokens/*.ts
 * Version: 1.0.0
 * Updated: ${new Date().toISOString()}
 */

:root {
  /* Color Tokens */
${objectToCSSVariables(colors, 'color')}

  /* Typography Tokens */
${objectToCSSVariables(typography, 'type')}

  /* Spacing Tokens */
${objectToCSSVariables(spacing, 'space')}

  /* Sport-Specific Composite Variables */
  /* Baseball */
  --sport-baseball-bg: var(--color-sports-baseball-diamond);
  --sport-baseball-fg: var(--color-sports-baseball-grass);
  --sport-baseball-accent: var(--color-sports-baseball-warning);
  --sport-baseball-font: var(--type-sportStyles-baseball-scoreFont);

  /* Football */
  --sport-football-bg: var(--color-sports-football-field);
  --sport-football-fg: var(--color-sports-football-endzone);
  --sport-football-accent: var(--color-sports-football-hash);
  --sport-football-font: var(--type-sportStyles-football-scoreFont);

  /* Basketball */
  --sport-basketball-bg: var(--color-sports-basketball-court);
  --sport-basketball-fg: var(--color-sports-basketball-paint);
  --sport-basketball-accent: var(--color-sports-basketball-line);
  --sport-basketball-font: var(--type-sportStyles-basketball-scoreFont);

  /* Track */
  --sport-track-bg: var(--color-sports-track-track);
  --sport-track-fg: var(--color-sports-track-field);
  --sport-track-accent: var(--color-sports-track-starting);
  --sport-track-font: var(--type-sportStyles-track-scoreFont);
}

/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-primary-900);
    --color-foreground: var(--color-primary-50);
    --color-card: var(--color-primary-800);
    --color-card-foreground: var(--color-primary-100);
    --color-border: var(--color-primary-700);
  }
}

/* Light Mode Overrides */
@media (prefers-color-scheme: light) {
  :root {
    --color-background: var(--color-primary-50);
    --color-foreground: var(--color-primary-900);
    --color-card: var(--color-primary-100);
    --color-card-foreground: var(--color-primary-800);
    --color-border: var(--color-primary-200);
  }
}

/* Utility Classes */
.blaze-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.blaze-section {
  padding: var(--space-16) 0;
}

.blaze-card {
  background: var(--color-card);
  color: var(--color-card-foreground);
  border-radius: var(--space-3);
  padding: var(--space-6);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Sport-Specific Classes */
.sport-baseball {
  --current-sport-bg: var(--sport-baseball-bg);
  --current-sport-fg: var(--sport-baseball-fg);
  --current-sport-accent: var(--sport-baseball-accent);
  font-family: var(--sport-baseball-font);
}

.sport-football {
  --current-sport-bg: var(--sport-football-bg);
  --current-sport-fg: var(--sport-football-fg);
  --current-sport-accent: var(--sport-football-accent);
  font-family: var(--sport-football-font);
}

.sport-basketball {
  --current-sport-bg: var(--sport-basketball-bg);
  --current-sport-fg: var(--sport-basketball-fg);
  --current-sport-accent: var(--sport-basketball-accent);
  font-family: var(--sport-basketball-font);
}

.sport-track {
  --current-sport-bg: var(--sport-track-bg);
  --current-sport-fg: var(--sport-track-fg);
  --current-sport-accent: var(--sport-track-accent);
  font-family: var(--sport-track-font);
}

/* Animation Classes */
.blaze-fade-in {
  animation: blazeFadeIn 0.5s ease-in-out;
}

@keyframes blazeFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.blaze-slide-in {
  animation: blazeSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes blazeSlideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Button Base Styles (for non-React usage) */
.blaze-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--space-2);
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  outline: none;
  border: none;
  padding: var(--space-3) var(--space-6);
  font-size: var(--type-scale-base);
}

.blaze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.blaze-btn:active {
  transform: translateY(0);
}

.blaze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Button Variants */
.blaze-btn-primary {
  background: var(--color-blaze-primary);
  color: white;
}

.blaze-btn-primary:hover {
  background: var(--color-blaze-primaryDark);
}

.blaze-btn-baseball {
  background: var(--sport-baseball-bg);
  color: white;
}

.blaze-btn-baseball:hover {
  background: var(--sport-baseball-accent);
}

.blaze-btn-football {
  background: var(--sport-football-bg);
  color: white;
}

.blaze-btn-football:hover {
  background: var(--sport-football-accent);
}

.blaze-btn-basketball {
  background: var(--sport-basketball-bg);
  color: white;
}

.blaze-btn-basketball:hover {
  background: var(--sport-basketball-accent);
}

.blaze-btn-track {
  background: var(--sport-track-bg);
  color: white;
}

.blaze-btn-track:hover {
  background: var(--sport-track-accent);
}
`;

  return css;
}

// Write CSS file
function writeCSSFile() {
  const css = generateCSS();
  const outputDir = path.resolve(__dirname, '../dist/css');
  const outputFile = path.join(outputDir, 'design-tokens.css');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(outputFile, css);
  console.log('✅ Design tokens compiled to:', outputFile);

  // Also create a minified version
  const minified = css
    .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
    .replace(/\s*{\s*/g, '{') // Remove spaces around braces
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .trim();

  fs.writeFileSync(path.join(outputDir, 'design-tokens.min.css'), minified);
  console.log('✅ Minified tokens compiled to:', path.join(outputDir, 'design-tokens.min.css'));
}

// Generate JSON for JavaScript usage
function writeJSONFile() {
  const tokens = {
    colors,
    typography,
    spacing
  };

  const outputDir = path.resolve(__dirname, '../dist/json');
  const outputFile = path.join(outputDir, 'design-tokens.json');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(tokens, null, 2));
  console.log('✅ Design tokens exported to:', outputFile);
}

// Main execution
console.log('🎨 Building Blaze Sports Intel Design Tokens...');
writeCSSFile();
writeJSONFile();
console.log('✨ Design token build complete!');