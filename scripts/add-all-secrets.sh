#!/bin/bash
set -euo pipefail

# Blaze Intelligence - Automated GitHub Secrets Setup
# This script adds all required secrets to GitHub repository

echo "🔐 Blaze Intelligence - GitHub Secrets Setup"
echo "============================================"
echo ""

# Check if gh CLI is authenticated
if ! gh auth status >/dev/null 2>&1; then
    echo "❌ GitHub CLI not authenticated."
    echo "Please run: gh auth login"
    echo "Or set GITHUB_TOKEN environment variable"
    exit 1
fi

REPO="ahump20/BI"
echo "📦 Repository: $REPO"
echo ""

# Function to add secret
add_secret() {
    local name="$1"
    local value="$2"
    local description="${3:-}"
    
    echo -n "  Adding $name"
    if [ -n "$description" ]; then
        echo -n " ($description)"
    fi
    echo -n "... "
    
    if echo "$value" | gh secret set "$name" --repo "$REPO" 2>/dev/null; then
        echo "✅"
    else
        echo "⚠️  (may already exist)"
    fi
}

# Check if secrets file exists
SECRETS_FILE="${1:-/Users/AustinHumphrey/Library/CloudStorage/OneDrive-Personal/Documents/.env.master}"

if [[ ! -f "$SECRETS_FILE" ]]; then
    echo "❌ Secrets file not found: $SECRETS_FILE"
    echo "Usage: $0 [path-to-secrets-file]"
    echo "Or set environment variables directly"
    exit 1
fi

echo "📄 Loading secrets from: $SECRETS_FILE"
source "$SECRETS_FILE"

echo "🔧 Adding Platform Credentials..."
echo "=================================="

# Platform Credentials - only set if not empty
[[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] && add_secret "CLOUDFLARE_API_TOKEN" "$CLOUDFLARE_API_TOKEN" "Cloudflare API"
[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] && add_secret "CLOUDFLARE_ACCOUNT_ID" "$CLOUDFLARE_ACCOUNT_ID" "Account ID"
[[ -n "${R2_ACCOUNT_ID:-}" ]] && add_secret "R2_ACCOUNT_ID" "$R2_ACCOUNT_ID" "R2 Account"
[[ -n "${CF_PAGES_PROJECT:-}" ]] && add_secret "CF_PAGES_PROJECT" "blaze-intelligence" "Pages Project"

# R2 Storage
[[ -n "${R2_ACCESS_KEY_ID:-}" ]] && add_secret "R2_ACCESS_KEY_ID" "$R2_ACCESS_KEY_ID" "R2 Access Key"
[[ -n "${R2_SECRET_ACCESS_KEY:-}" ]] && add_secret "R2_SECRET_ACCESS_KEY" "$R2_SECRET_ACCESS_KEY" "R2 Secret"
[[ -n "${R2_ENDPOINT:-}" ]] && add_secret "R2_ENDPOINT" "$R2_ENDPOINT" "R2 Endpoint"

# Vercel
[[ -n "${VERCEL_TOKEN:-}" ]] && add_secret "VERCEL_TOKEN" "$VERCEL_TOKEN" "Vercel"

echo ""
echo "🤖 Adding AI Service Keys..."
echo "============================="

# AI Services - Load from environment
[[ -n "${OPENAI_API_KEY:-}" ]] && add_secret "OPENAI_API_KEY" "$OPENAI_API_KEY" "OpenAI"
[[ -n "${OPENAI_WEBHOOK_SECRET:-}" ]] && add_secret "OPENAI_WEBHOOK_SECRET" "$OPENAI_WEBHOOK_SECRET" "OpenAI Webhook"
[[ -n "${OPENAI_PROJECT_ID:-}" ]] && add_secret "OPENAI_PROJECT_ID" "$OPENAI_PROJECT_ID" "OpenAI Project"

[[ -n "${ANTHROPIC_API_KEY:-}" ]] && add_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY" "Anthropic"
[[ -n "${ANTHROPIC_ADMIN_KEY:-}" ]] && add_secret "ANTHROPIC_ADMIN_KEY" "$ANTHROPIC_ADMIN_KEY" "Anthropic Admin"
[[ -n "${ANTHROPIC_ORGANIZATION_ID:-}" ]] && add_secret "ANTHROPIC_ORGANIZATION_ID" "$ANTHROPIC_ORGANIZATION_ID" "Anthropic Org"

[[ -n "${GEMINI_API_KEY:-}" ]] && add_secret "GEMINI_API_KEY" "$GEMINI_API_KEY" "Gemini"
[[ -n "${GEMINI_API_KEY_2:-}" ]] && add_secret "GEMINI_API_KEY_2" "$GEMINI_API_KEY_2" "Gemini 2"
[[ -n "${GEMINI_API_KEY_3:-}" ]] && add_secret "GEMINI_API_KEY_3" "$GEMINI_API_KEY_3" "Gemini 3"

[[ -n "${XAI_API_KEY:-}" ]] && add_secret "XAI_API_KEY" "$XAI_API_KEY" "X.AI"
[[ -n "${HUGGINGFACE_ACCESS_TOKEN:-}" ]] && add_secret "HUGGINGFACE_ACCESS_TOKEN" "$HUGGINGFACE_ACCESS_TOKEN" "HuggingFace"
[[ -n "${DEEPSEEK_API_KEY:-}" ]] && add_secret "DEEPSEEK_API_KEY" "$DEEPSEEK_API_KEY" "DeepSeek"

echo ""
echo "🏈 Adding Sports & Analytics Keys..."
echo "===================================="

[[ -n "${SPORTSRADAR_ID:-}" ]] && add_secret "SPORTSRADAR_ID" "$SPORTSRADAR_ID" "SportsRadar ID"
[[ -n "${SPORTSRADAR_MASTER_API_KEY:-}" ]] && add_secret "SPORTSRADAR_MASTER_API_KEY" "$SPORTSRADAR_MASTER_API_KEY" "SportsRadar"
[[ -n "${BLAZE_CLIENT_ID:-}" ]] && add_secret "BLAZE_CLIENT_ID" "$BLAZE_CLIENT_ID" "Blaze Client"
[[ -n "${BLAZE_CLIENT_SECRET:-}" ]] && add_secret "BLAZE_CLIENT_SECRET" "$BLAZE_CLIENT_SECRET" "Blaze Secret"
[[ -n "${PRODUCTION_API_KEY:-}" ]] && add_secret "PRODUCTION_API_KEY" "$PRODUCTION_API_KEY" "Production API"

echo ""
echo "💳 Adding Payment Services..."
echo "=============================="

[[ -n "${STRIPE_PUBLISHABLE_KEY:-}" ]] && add_secret "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY" "Stripe Public"
[[ -n "${STRIPE_SECRET_KEY:-}" ]] && add_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "Stripe Secret"

echo ""
echo "🔗 Adding Integration Keys..."
echo "=============================="

[[ -n "${NOTION_INTEGRATION_SECRET:-}" ]] && add_secret "NOTION_INTEGRATION_SECRET" "$NOTION_INTEGRATION_SECRET" "Notion"
[[ -n "${AIRTABLE_API_KEY:-}" ]] && add_secret "AIRTABLE_API_KEY" "$AIRTABLE_API_KEY" "Airtable"
[[ -n "${HUBSPOT_ACCESS_TOKEN:-}" ]] && add_secret "HUBSPOT_ACCESS_TOKEN" "$HUBSPOT_ACCESS_TOKEN" "HubSpot"
[[ -n "${ZAPIER_API_KEY:-}" ]] && add_secret "ZAPIER_API_KEY" "$ZAPIER_API_KEY" "Zapier"

echo ""
echo "🛠️ Adding Development Tools..."
echo "==============================="

[[ -n "${GITHUB_TOKEN_FINE:-}" ]] && add_secret "GITHUB_TOKEN_FINE" "$GITHUB_TOKEN_FINE" "GitHub Fine"
[[ -n "${GITHUB_FINE_GRAINED_TOKEN:-}" ]] && add_secret "GITHUB_FINE_GRAINED_TOKEN" "$GITHUB_FINE_GRAINED_TOKEN" "GitHub PAT"
[[ -n "${SENTRY_PERSONAL_TOKEN:-}" ]] && add_secret "SENTRY_PERSONAL_TOKEN" "$SENTRY_PERSONAL_TOKEN" "Sentry"
[[ -n "${CURSOR_API_KEY:-}" ]] && add_secret "CURSOR_API_KEY" "$CURSOR_API_KEY" "Cursor"

echo ""
echo "✅ Secret Setup Complete!"
echo "========================="
echo ""
echo "📋 Next Steps:"
echo "1. Run the sync workflow:"
echo "   gh workflow run secrets-sync.yml -f environment=production -f platforms=cloudflare,netlify,vercel"
echo ""
echo "2. Or visit GitHub Actions:"
echo "   https://github.com/ahump20/BI/actions/workflows/secrets-sync.yml"
echo ""
echo "3. Verify secrets were added:"
echo "   gh secret list --repo $REPO"
echo ""
echo "⚠️  IMPORTANT: Rotate these keys after setup:"
echo "  - OpenAI API Key"
echo "  - Anthropic API Key"
echo "  - Any other sensitive keys"