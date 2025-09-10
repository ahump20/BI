#!/bin/bash

# Quick deployment script for APEX platform
echo "🚀 Quick APEX Platform Deployment"
echo "=================================="

# Create a simple deployment directory
mkdir -p apex-live-deploy
cp blaze-intelligence-enhanced-apex-mobile-complete.html apex-live-deploy/index.html

# Create basic files for the deployment
cat > apex-live-deploy/manifest.json << EOF
{
  "name": "APEX Mobile Platform",
  "short_name": "APEX",
  "description": "Championship-grade sports analytics platform",
  "start_url": "/",
  "display": "fullscreen",
  "background_color": "#0A0A0A",
  "theme_color": "#BF5700",
  "icons": [
    {
      "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23BF5700'/%3E%3Ctext x='50' y='60' text-anchor='middle' fill='white' font-size='30' font-weight='bold'%3EA%3C/text%3E%3C/svg%3E",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ]
}
EOF

echo "✅ Deployment package ready in apex-live-deploy/"
echo ""
echo "📊 Deployment Statistics:"
echo "========================="
du -sh apex-live-deploy/*
echo ""

# Try using GitHub Pages deployment via GitHub CLI
if command -v gh >/dev/null 2>&1; then
    echo "🌐 Attempting GitHub Pages deployment..."
    
    # Check if we're in a git repository
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "✅ Git repository detected"
        
        # Create a gh-pages branch deployment
        git checkout -b apex-deployment-$(date +%Y%m%d-%H%M%S) 2>/dev/null || git checkout main
        
        # Copy files to root for Pages
        cp apex-live-deploy/* ./ 2>/dev/null || true
        
        echo "✅ Files prepared for repository deployment"
        echo ""
        echo "🏆 APEX Platform Deployment Status: READY"
        echo "Files are prepared in the current directory for manual deployment."
        
    else
        echo "ℹ️  Not in a git repository - files prepared for manual upload"
    fi
else
    echo "ℹ️  GitHub CLI not found - files prepared for manual deployment"
fi

echo ""
echo "🌐 Manual Deployment Options:"
echo "============================="
echo "1. Upload apex-live-deploy/ to any static hosting service"
echo "2. Use with Vercel: 'npx vercel apex-live-deploy'"  
echo "3. Use with Netlify: 'npx netlify deploy --dir=apex-live-deploy --prod'"
echo "4. Upload to GitHub Pages, Cloudflare Pages, or similar"
echo ""
echo "🎯 The APEX platform is ready for championship performance!"