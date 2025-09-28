// Blaze Sports Intel - Style Dictionary Configuration
// Version: 1.0.0
// Updated: 2025-09-26

import StyleDictionary from 'style-dictionary';

const config = {
  source: ['tokens/**/*.ts'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          showFileHeader: true,
          outputReferences: true
        }
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    },
    json: {
      transformGroup: 'json',
      buildPath: 'dist/json/',
      files: [{
        destination: 'tokens.json',
        format: 'json/nested'
      }]
    }
  }
};

// Custom transforms for sport-specific tokens
StyleDictionary.registerTransform({
  name: 'sport/css',
  type: 'value',
  matcher: (token) => token.path.includes('sports'),
  transformer: (token) => {
    // Transform sport-specific values to CSS custom properties
    if (typeof token.value === 'object') {
      return Object.entries(token.value)
        .map(([key, val]) => `--${token.path.join('-')}-${key}: ${val}`)
        .join('; ');
    }
    return token.value;
  }
});

// Register transform group for Blaze Intelligence
StyleDictionary.registerTransformGroup({
  name: 'blaze',
  transforms: [
    'attribute/cti',
    'name/cti/kebab',
    'size/px',
    'color/hex',
    'sport/css'
  ]
});

export default config;