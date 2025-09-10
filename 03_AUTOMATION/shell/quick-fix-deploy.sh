#!/bin/bash
set -euo pipefail

# Quick fix for Blaze Intelligence deployment
echo "🔥 Fixing Blaze Intelligence deployment..."

# Create clean build directory
rm -rf /tmp/blaze-fix
mkdir -p /tmp/blaze-fix

# Copy the correct HTML file
cp "/Users/AustinHumphrey/Downloads/blaze_os_championship_home_index.html" /tmp/blaze-fix/index.html || { echo "❌ Copy failed"; exit 1; }

# Navigate to clean directory
cd /tmp/blaze-fix

echo "📦 Deploying correct Championship page..."

# Deploy with minimal files
wrangler pages deploy . \
  --project-name=blaze-intelligence \
  --branch=main \
  --commit-dirty=true \
  --commit-message="Fix: Deploy correct Championship landing page" \
  || {
    echo "⚠️ Direct deploy failed, trying alternative..."
    
    # Alternative: Create a simple deployment
    cat > deploy.json << 'EOF'
{
  "name": "blaze-intelligence",
  "files": ["index.html"]
}
EOF
    
    # Try again with explicit file
    wrangler pages deploy index.html \
      --project-name=blaze-intelligence \
      --commit-dirty=true
}

echo "✅ Deployment initiated. Check https://blaze-intelligence.pages.dev in 30 seconds."