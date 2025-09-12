#!/bin/bash

# Cloudflare Pages Environment Setup Script
# This script configures all environment variables for Cloudflare Pages deployment

echo "🔧 Setting up Cloudflare Pages environment variables..."

# Source the environment file
source /Users/AustinHumphrey/Library/CloudStorage/OneDrive-Personal/Documents/.env.master

# Set Cloudflare authentication
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"
export CLOUDFLARE_ACCOUNT_ID="${R2_ACCOUNT_ID}"

PROJECT_NAME="blaze-intelligence"

# Function to set environment variable in Cloudflare Pages
set_cf_env() {
    local KEY=$1
    local VALUE=$2
    local ENV=${3:-"production"}
    
    echo "Setting $KEY for $ENV environment..."
    
    npx wrangler pages secret put "$KEY" \
        --project-name="$PROJECT_NAME" \
        --env="$ENV" <<< "$VALUE"
}

# AI Services
set_cf_env "OPENAI_API_KEY" "$OPENAI_API_KEY"
set_cf_env "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
set_cf_env "GEMINI_API_KEY" "$GEMINI_API_KEY"
set_cf_env "XAI_API_KEY" "$XAI_API_KEY"
set_cf_env "HUGGINGFACE_ACCESS_TOKEN" "$HUGGINGFACE_ACCESS_TOKEN"
set_cf_env "DEEPSEEK_API_KEY" "$DEEPSEEK_API_KEY"

# Cloudflare Services
set_cf_env "R2_ACCESS_KEY_ID" "$R2_ACCESS_KEY_ID"
set_cf_env "R2_SECRET_ACCESS_KEY" "$R2_SECRET_ACCESS_KEY"
set_cf_env "R2_ENDPOINT" "$R2_ENDPOINT"

# Sports Data
set_cf_env "SPORTSRADAR_MASTER_API_KEY" "$SPORTSRADAR_MASTER_API_KEY"
set_cf_env "BLAZE_CLIENT_ID" "$BLAZE_CLIENT_ID"
set_cf_env "BLAZE_CLIENT_SECRET" "$BLAZE_CLIENT_SECRET"
set_cf_env "PRODUCTION_API_KEY" "$PRODUCTION_API_KEY"

# Payment Services
set_cf_env "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
set_cf_env "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"

# Integrations
set_cf_env "NOTION_INTEGRATION_SECRET" "$NOTION_INTEGRATION_SECRET"
set_cf_env "AIRTABLE_API_KEY" "$AIRTABLE_API_KEY"
set_cf_env "HUBSPOT_ACCESS_TOKEN" "$HUBSPOT_ACCESS_TOKEN"
set_cf_env "ZAPIER_API_KEY" "$ZAPIER_API_KEY"

# GitHub
set_cf_env "GITHUB_TOKEN" "$GITHUB_TOKEN"

# Monitoring
set_cf_env "SENTRY_PERSONAL_TOKEN" "$SENTRY_PERSONAL_TOKEN"

# Also set for preview environment
echo "Setting up preview environment..."
for KEY in OPENAI_API_KEY ANTHROPIC_API_KEY GEMINI_API_KEY STRIPE_PUBLISHABLE_KEY; do
    set_cf_env "$KEY" "${!KEY}" "preview"
done

echo "✅ Cloudflare Pages environment setup complete!"
echo "Note: Sensitive secrets are now stored in Cloudflare Pages and will be available during builds."