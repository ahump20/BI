#!/bin/bash

# Quick Deploy Script for Blaze Intelligence OS V2
# This script helps you deploy the components step by step

set -e

echo "🚀 Blaze Intelligence OS V2 - Quick Deployment Guide"
echo "=================================================="
echo ""

# Function to print instructions
print_step() {
    echo "📋 STEP $1: $2"
    echo "----------------------------------------"
}

# Check current status
echo "✅ Current Status:"
echo "   - Build completed: $([ -d "dist" ] && echo "YES" || echo "NO")"
echo "   - Environment file: $([ -f ".env" ] && echo "YES" || echo "NO")"
echo "   - Wrangler config: $([ -f "wrangler.toml" ] && echo "YES" || echo "NO")"
echo ""

print_step "1" "Deploy Frontend to Cloudflare Pages"
echo "Run this command when ready:"
echo "  npx wrangler pages deploy dist --project-name=blaze-intelligence-os-v2"
echo ""

print_step "2" "Deploy API Worker to Cloudflare"
echo "Run this command when ready:"
echo "  npx wrangler deploy"
echo ""

print_step "3" "Start WebSocket Server"
echo "For development:"
echo "  node websocket-server.js"
echo ""
echo "For production, deploy to a service like:"
echo "  - Railway: railway up"
echo "  - Fly.io: fly deploy"
echo "  - Heroku: git push heroku main"
echo ""

print_step "4" "Update Environment Variables"
echo "You'll need to configure these in .env:"
echo "  - API keys for sports data sources"
echo "  - Cloudflare credentials"
echo "  - Database connections"
echo ""

print_step "5" "Test the Deployment"
echo "Visit your deployed URLs and test:"
echo "  - Frontend UI and dashboard functionality"
echo "  - API endpoints (health check, data)"
echo "  - WebSocket real-time connections"
echo ""

echo "🎯 Ready to Deploy!"
echo "==================="
echo "The build files are ready in the 'dist' directory."
echo "Follow the steps above to deploy each component."
echo ""
echo "Need help? Check the deployment documentation or run:"
echo "  ./deploy.sh --help"