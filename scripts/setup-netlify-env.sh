#!/bin/bash

# Setup Netlify Environment Variables
# This script configures environment variables for the Netlify deployment
# Run this with: ./scripts/setup-netlify-env.sh

echo "🔐 Setting up Netlify Environment Variables..."
echo "================================================"
echo ""
echo "IMPORTANT: This script will guide you through setting up environment variables."
echo "You'll need to add these manually in the Netlify UI for security."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please ensure .env.local exists with your API keys."
    exit 1
fi

echo "📋 Required Environment Variables for Netlify:"
echo ""
echo "Go to: https://app.netlify.com/sites/blaze-intelligence/settings/env"
echo ""
echo "Add these environment variables:"
echo "================================"

# Core API Keys
echo "# AI Services"
echo "OPENAI_API_KEY"
echo "ANTHROPIC_API_KEY"
echo "GEMINI_API_KEY"
echo ""

echo "# Cloud Services"
echo "CLOUDFLARE_API_TOKEN"
echo "CLOUDFLARE_ACCOUNT_ID"
echo ""

echo "# Sports Data"
echo "SPORTSRADAR_MASTER_API_KEY"
echo ""

echo "# Payment"
echo "STRIPE_SECRET_KEY"
echo "STRIPE_PUBLISHABLE_KEY"
echo ""

echo "# CRM"
echo "HUBSPOT_ACCESS_TOKEN"
echo ""

echo "# Analytics"
echo "SENTRY_PERSONAL_TOKEN"
echo ""

echo "================================"
echo ""
echo "📝 Steps to add in Netlify:"
echo "1. Go to Site settings → Environment variables"
echo "2. Click 'Add a variable'"
echo "3. Add each key-value pair from your .env.local"
echo "4. Save changes"
echo "5. Trigger a new deployment"
echo ""

# Create a temporary file with commands for easy copying
cat > netlify-env-commands.txt << 'EOF'
# Netlify CLI Commands (if you have netlify-cli installed)
# Install with: npm install -g netlify-cli
# Login with: netlify login

# Set environment variables via CLI (optional)
netlify env:set OPENAI_API_KEY "your-key-here"
netlify env:set ANTHROPIC_API_KEY "your-key-here"
netlify env:set GEMINI_API_KEY "your-key-here"
netlify env:set CLOUDFLARE_API_TOKEN "your-key-here"
netlify env:set SPORTSRADAR_MASTER_API_KEY "your-key-here"
netlify env:set STRIPE_SECRET_KEY "your-key-here"
netlify env:set HUBSPOT_ACCESS_TOKEN "your-key-here"

# Deploy after setting variables
netlify deploy --prod
EOF

echo "💡 Alternative: Use Netlify CLI"
echo "Commands saved to: netlify-env-commands.txt"
echo ""
echo "✅ Setup guide complete!"
echo ""
echo "🔒 Security Notes:"
echo "- Never commit API keys to Git"
echo "- Use different keys for production vs development"
echo "- Rotate keys regularly"
echo "- Monitor API usage for anomalies"