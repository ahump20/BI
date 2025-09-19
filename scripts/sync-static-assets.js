#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fsp = fs.promises;
const projectRoot = path.resolve(__dirname, '..');

const assetsToCopy = [
  { source: 'src/three.min.js', target: 'dist/three.min.js' },
  { source: 'src/blaze-shaders.js', target: 'dist/blaze-shaders.js' },
  { source: 'src/blaze-performance-optimizer.js', target: 'dist/blaze-performance-optimizer.js' },
  { source: 'src/blaze-sports-api.js', target: 'dist/blaze-sports-api.js' },
  { source: '03_AUTOMATION/javascript/blaze-websocket-client.js', target: 'dist/blaze-websocket-client.js' },
  { source: '03_AUTOMATION/javascript/blaze-websocket-integration.js', target: 'dist/blaze-websocket-integration.js' }
];

const generatedFiles = [
  {
    target: 'dist/demo-data.js',
    build() {
      return `(() => {\n  if (typeof window === 'undefined') {\n    return;\n  }\n\n  const now = new Date().toISOString();\n  const teams = [\n    { id: 'cardinals', name: 'St. Louis Cardinals', sport: 'MLB', record: '12-5', streak: 'W3', leverage: 91 },\n    { id: 'titans', name: 'Tennessee Titans', sport: 'NFL', record: '3-1', streak: 'W2', leverage: 87 },\n    { id: 'longhorns', name: 'Texas Longhorns', sport: 'NCAA', record: '5-0', streak: 'W5', leverage: 94 },\n    { id: 'grizzlies', name: 'Memphis Grizzlies', sport: 'NBA', record: '7-3', streak: 'W4', leverage: 89 }\n  ];\n\n  const liveGames = [\n    { id: 'mlb-cardinals', matchup: 'Cardinals vs Cubs', score: '5-3', status: 'Top 7th', winProbability: 0.72 },\n    { id: 'nfl-titans', matchup: 'Titans vs Texans', score: '21-17', status: '3rd Quarter', winProbability: 0.61 },\n    { id: 'ncaa-longhorns', matchup: 'Longhorns vs Sooners', score: '14-10', status: '2nd Quarter', winProbability: 0.54 },\n    { id: 'nba-grizzlies', matchup: 'Grizzlies vs Mavs', score: '88-83', status: '4th Quarter', winProbability: 0.58 }\n  ];\n\n  const pressureMetrics = [\n    { id: 'clutch-index', label: 'Clutch Index', value: 92, trend: 'up' },\n    { id: 'grit-rating', label: 'Grit Rating', value: 89, trend: 'steady' },\n    { id: 'momentum', label: 'Momentum', value: 86, trend: 'up' }\n  ];\n\n  window.BLAZE_DEMO_DATA = {\n    generatedAt: now,\n    teams,\n    liveGames,\n    pressureMetrics\n  };\n\n  window.dispatchEvent(new CustomEvent('blaze:demo-data-ready', {\n    detail: window.BLAZE_DEMO_DATA\n  }));\n\n  console.info('✅ Blaze demo data loaded', window.BLAZE_DEMO_DATA);\n})();\n`;
    }
  },
  {
    target: 'dist/api-integration.js',
    build() {
      return `(() => {\n  if (typeof window === 'undefined') {\n    return;\n  }\n\n  const listeners = new Map();\n  const state = { status: 'idle', lastSync: null };\n\n  const notify = (event, payload) => {\n    const handlers = listeners.get(event) || [];\n    handlers.forEach((handler) => {\n      try {\n        handler(payload);\n      } catch (error) {\n        console.error('Blaze API listener error', error);\n      }\n    });\n  };\n\n  const api = {\n    sync() {\n      state.status = 'syncing';\n      const payload = window.BLAZE_DEMO_DATA || null;\n\n      setTimeout(() => {\n        state.status = 'online';\n        state.lastSync = new Date().toISOString();\n        notify('sync', {\n          timestamp: state.lastSync,\n          data: payload\n        });\n      }, 250);\n    },\n    getState() {\n      return { ...state };\n    },\n    on(event, handler) {\n      const existing = listeners.get(event) || [];\n      existing.push(handler);\n      listeners.set(event, existing);\n      return () => {\n        const updated = (listeners.get(event) || []).filter((fn) => fn !== handler);\n        listeners.set(event, updated);\n      };\n    },\n    emit(event, payload) {\n      notify(event, payload);\n    }\n  };\n\n  if (!window.BlazeAPI) {\n    window.BlazeAPI = api;\n    window.dispatchEvent(new CustomEvent('blaze:api-ready', { detail: api }));\n    console.info('🔌 Blaze API integration ready');\n  }\n\n  api.sync();\n})();\n`;
    }
  }
];

async function copyFileIfChanged(sourceRelative, targetRelative) {
  const sourcePath = path.join(projectRoot, sourceRelative);
  const targetPath = path.join(projectRoot, targetRelative);

  const [sourceExists, targetExists] = await Promise.all([
    fileExists(sourcePath),
    fileExists(targetPath)
  ]);

  if (!sourceExists) {
    throw new Error(`Missing source asset: ${sourceRelative}`);
  }

  const sourceContent = await fsp.readFile(sourcePath);

  let shouldWrite = true;
  if (targetExists) {
    const targetContent = await fsp.readFile(targetPath);
    shouldWrite = !sourceContent.equals(targetContent);
  }

  if (!shouldWrite) {
    return false;
  }

  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  await fsp.writeFile(targetPath, sourceContent);
  return true;
}

async function ensureFileContent(targetRelative, content) {
  const targetPath = path.join(projectRoot, targetRelative);

  let shouldWrite = true;
  if (await fileExists(targetPath)) {
    const existingContent = await fsp.readFile(targetPath, 'utf8');
    shouldWrite = existingContent !== content;
  }

  if (!shouldWrite) {
    return false;
  }

  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  await fsp.writeFile(targetPath, content, 'utf8');
  return true;
}

async function fileExists(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  let copied = 0;
  for (const asset of assetsToCopy) {
    const updated = await copyFileIfChanged(asset.source, asset.target);
    if (updated) {
      console.log(`Copied ${asset.source} -> ${asset.target}`);
      copied++;
    }
  }

  for (const file of generatedFiles) {
    const content = file.build();
    const updated = await ensureFileContent(file.target, content);
    if (updated) {
      console.log(`Updated ${file.target}`);
      copied++;
    }
  }

  if (copied === 0) {
    console.log('Static assets are up to date.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
