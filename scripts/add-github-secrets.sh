#!/bin/bash
# Helper script to add secrets to GitHub repository
# Usage: ./add-github-secrets.sh

set -euo pipefail

echo "📝 GitHub Secrets Configuration Helper"
echo "======================================"
echo ""
echo "This script will help you add secrets to GitHub."
echo "You'll need to manually add each secret through the GitHub UI."
echo ""
echo "Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')/settings/secrets/actions/new"
echo ""
echo "Add the following secrets:"
echo ""

# Platform Credentials
echo "=== PLATFORM CREDENTIALS ==="
echo "CLOUDFLARE_API_TOKEN"
echo "CLOUDFLARE_ACCOUNT_ID: a12cb329d84130460eed99b816e4d0d3"
echo "CF_PAGES_PROJECT: blaze-intelligence"
echo "NETLIFY_AUTH_TOKEN"
echo "NETLIFY_SITE_ID"
echo "VERCEL_TOKEN"
echo "VERCEL_ORG_ID"
echo "VERCEL_PROJECT_ID"
echo ""

# Application Secrets (you'll need to add actual values)
echo "=== APPLICATION SECRETS ==="
echo "Copy these from your secure storage after rotation:"
echo ""
cat << 'SECRETS'
OPENAI_API_KEY
ANTHROPIC_API_KEY
GEMINI_API_KEY
XAI_API_KEY
HUGGINGFACE_ACCESS_TOKEN
DEEPSEEK_API_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
SPORTSRADAR_MASTER_API_KEY
BLAZE_CLIENT_ID
BLAZE_CLIENT_SECRET
PRODUCTION_API_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
NOTION_INTEGRATION_SECRET
AIRTABLE_API_KEY
HUBSPOT_ACCESS_TOKEN
ZAPIER_API_KEY
SENTRY_PERSONAL_TOKEN
GITHUB_TOKEN_FINE
SECRETS

echo ""
echo "After adding all secrets, run the sync workflow from GitHub Actions."
