#!/bin/bash

# Blaze Intelligence Project Cleanup Script
# Organizes files and removes redundant/outdated code

set -e

echo "🧹 Starting Blaze Intelligence Project Cleanup..."

# Create backup directory
BACKUP_DIR="backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Core files to keep (move these to proper locations)
CORE_FILES=(
    "index.html"
    "package.json"
    "netlify.toml"
    "simple-blaze-server.js"
    "api/enhanced-gateway.js"
    "api/enhanced-live-metrics.js"
    "js/enhanced-dynamic-loading.js"
    "css/enhanced-dynamic-ui.css"
    "data/analytics/"
    "src/core/"
    "config/"
)

# Files/directories to remove (redundant or outdated)
CLEANUP_TARGETS=(
    "emergency-kill-switch.js"
    "blaze-ai-coordination-workflows.js"
    "worker-api.js"
    "accessibility-system.js"
    "direct-stats-fix.js"
    "report-worker.js"
    "confidence-ui-components.js"
    "unified-enhancement-script.js"
    "audit-security-system.js"
    "health-monitor.js"
    "comprehensive-test-report.js"
    "dist/"
    "airtable-bases/"
    "mobile-app/"
    "blaze-*-deployment*.js"
    "*-deployment-*.js"
    "*-test-*.json"
    "deployment_*.log"
    "original-*.html"
    "*.save"
    "*.tmp"
    "*~"
)

echo "🗄️ Moving redundant files to backup..."

for target in "${CLEANUP_TARGETS[@]}"; do
    if ls $target 1> /dev/null 2>&1; then
        echo "Moving $target to backup..."
        mv $target "$BACKUP_DIR/" 2>/dev/null || echo "  ⚠️ Could not move $target"
    fi
done

# Remove empty directories
echo "📁 Removing empty directories..."
find . -type d -empty -delete 2>/dev/null || true

# Organize remaining files
echo "📂 Organizing core files..."

# Ensure core directories exist
mkdir -p src/{core,components,utils}
mkdir -p config/{environments,netlify,deployment}
mkdir -p docs/{api,deployment,development}
mkdir -p tools/{build,deploy,monitoring}
mkdir -p assets/{images,icons,fonts}

# Move files to proper locations if they exist
if [ -f "config/environments.js" ]; then
    mv config/environments.js config/environments/
fi

# Copy enhanced files to src if they don't exist there
if [ -f "js/enhanced-dynamic-loading.js" ] && [ ! -f "src/core/dynamic-loader.js" ]; then
    cp js/enhanced-dynamic-loading.js src/core/dynamic-loader.js
fi

if [ -f "css/enhanced-dynamic-ui.css" ] && [ ! -f "src/styles/enhanced-ui.css" ]; then
    mkdir -p src/styles
    cp css/enhanced-dynamic-ui.css src/styles/enhanced-ui.css
fi

# Clean up node_modules if it exists
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning node_modules..."
    rm -rf node_modules
fi

# Clean up package-lock.json to allow fresh install
if [ -f "package-lock.json" ]; then
    echo "🔒 Removing package-lock.json for fresh install..."
    rm package-lock.json
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Deployment
backup-*/
deployment_*.log
*.tmp
*.save

# Cache
.cache/
.netlify/

# Test coverage
coverage/

# Temporary files
*.temp
*.tmp
EOF
fi

# Update package.json with cleaning scripts
echo "📦 Updating package.json..."
if [ -f "package.json" ]; then
    # Create a temporary package.json with cleanup scripts
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts = {
        ...pkg.scripts,
        'clean': 'rm -rf node_modules package-lock.json dist build .cache',
        'clean:cache': 'rm -rf .cache .netlify/cache',
        'clean:logs': 'rm -f *.log deployment_*.log',
        'clean:temp': 'rm -f *.tmp *.temp *~ *.save',
        'clean:all': 'npm run clean && npm run clean:cache && npm run clean:logs && npm run clean:temp',
        'organize': 'tools/cleanup-project.sh'
    };
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
fi

# Create project summary
echo "📊 Creating project summary..."
cat > PROJECT_SUMMARY.md << EOF
# Blaze Intelligence - Project Summary

## Cleanup Completed: $(date)

### 🎯 Core Files Retained
- \`index.html\` - Main application entry point
- \`package.json\` - Dependencies and scripts
- \`netlify.toml\` - Deployment configuration
- \`simple-blaze-server.js\` - Development server
- \`api/\` - Serverless functions
- \`src/\` - Organized source code
- \`config/\` - Environment configurations
- \`data/\` - Analytics data

### 🗑️ Files Cleaned Up
- Redundant deployment scripts
- Temporary test files
- Outdated build artifacts
- Empty directories
- Log files
- Backup files

### 📁 New Project Structure
\`\`\`
blaze-intelligence/
├── src/
│   ├── core/          # Core application logic
│   ├── components/    # UI components
│   ├── utils/         # Utility functions
│   └── styles/        # Stylesheets
├── api/               # Serverless functions
├── config/            # Environment configurations
├── data/              # Static data
├── docs/              # Documentation
├── tools/             # Development tools
└── assets/            # Static assets
\`\`\`

### 🚀 Next Steps
1. Run \`npm install\` to install dependencies
2. Run \`npm run start\` to start development server
3. Run \`npm run deploy\` to deploy to production

### 🧹 Maintenance Scripts
- \`npm run clean\` - Remove build artifacts
- \`npm run clean:all\` - Complete cleanup
- \`npm run organize\` - Re-run organization script
EOF

echo "✅ Project cleanup completed!"
echo ""
echo "📋 Summary:"
echo "  - Backup created: $BACKUP_DIR"
echo "  - Project organized with new structure"
echo "  - Redundant files removed"
echo "  - .gitignore created/updated"
echo "  - Package.json updated with maintenance scripts"
echo ""
echo "🚀 Ready for enhanced deployment!"