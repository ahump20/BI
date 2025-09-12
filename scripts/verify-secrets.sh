#!/bin/bash
set -euo pipefail

# Blaze Intelligence - Secrets Verification Script
# Verifies that secrets are properly configured across all platforms

echo "🔍 Blaze Intelligence - Secrets Verification"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to check secret exists
check_secret() {
    local platform="$1"
    local check_command="$2"
    local secret_name="${3:-}"
    
    echo -n "  Checking $platform"
    if [ -n "$secret_name" ]; then
        echo -n " - $secret_name"
    fi
    echo -n "... "
    
    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        OVERALL_STATUS=1
        return 1
    fi
}

# Check GitHub CLI authentication
echo "🔐 Checking GitHub Authentication..."
echo "===================================="
if gh auth status >/dev/null 2>&1; then
    echo -e "  GitHub CLI: ${GREEN}✅ Authenticated${NC}"
else
    echo -e "  GitHub CLI: ${RED}❌ Not authenticated${NC}"
    echo "  Run: gh auth login"
    exit 1
fi

# Check GitHub Secrets
echo ""
echo "📦 GitHub Repository Secrets..."
echo "================================"
REPO="ahump20/BI"

# Get list of secrets
SECRETS_JSON=$(gh secret list --repo "$REPO" --json name 2>/dev/null || echo "[]")
SECRETS_COUNT=$(echo "$SECRETS_JSON" | jq length)

if [ "$SECRETS_COUNT" -gt 0 ]; then
    echo -e "  Found ${GREEN}$SECRETS_COUNT${NC} secrets in repository"
    
    # Check for critical secrets
    CRITICAL_SECRETS=(
        "CLOUDFLARE_API_TOKEN"
        "OPENAI_API_KEY"
        "ANTHROPIC_API_KEY"
        "STRIPE_SECRET_KEY"
        "PRODUCTION_API_KEY"
    )
    
    for secret in "${CRITICAL_SECRETS[@]}"; do
        if echo "$SECRETS_JSON" | jq -r '.[].name' | grep -q "^$secret$"; then
            echo -e "  $secret: ${GREEN}✅${NC}"
        else
            echo -e "  $secret: ${YELLOW}⚠️  Missing${NC}"
            OVERALL_STATUS=1
        fi
    done
else
    echo -e "  ${RED}❌ No secrets found${NC}"
    echo "  Run: ./scripts/add-all-secrets.sh"
    OVERALL_STATUS=1
fi

# Check Cloudflare (if wrangler is installed)
echo ""
echo "☁️  Cloudflare Configuration..."
echo "================================"
if command -v wrangler &> /dev/null; then
    # Check if authenticated
    if wrangler whoami >/dev/null 2>&1; then
        echo -e "  Wrangler: ${GREEN}✅ Authenticated${NC}"
        
        # Check Pages project
        PROJECT="blaze-intelligence"
        if npx wrangler pages project list 2>/dev/null | grep -q "$PROJECT"; then
            echo -e "  Pages Project '$PROJECT': ${GREEN}✅ Found${NC}"
            
            # Try to list secrets (may require additional permissions)
            echo "  Checking Pages secrets..."
            if npx wrangler pages secret list --project-name="$PROJECT" >/dev/null 2>&1; then
                echo -e "    Can access secrets: ${GREEN}✅${NC}"
            else
                echo -e "    Can access secrets: ${YELLOW}⚠️  Need permissions${NC}"
            fi
        else
            echo -e "  Pages Project '$PROJECT': ${YELLOW}⚠️  Not found${NC}"
        fi
    else
        echo -e "  Wrangler: ${YELLOW}⚠️  Not authenticated${NC}"
        echo "  Run: npx wrangler login"
    fi
else
    echo -e "  Wrangler: ${YELLOW}⚠️  Not installed${NC}"
    echo "  Run: npm install -g wrangler"
fi

# Check Vercel (if installed)
echo ""
echo "▲ Vercel Configuration..."
echo "=========================="
if command -v vercel &> /dev/null; then
    # Check if authenticated
    if vercel whoami >/dev/null 2>&1; then
        echo -e "  Vercel CLI: ${GREEN}✅ Authenticated${NC}"
        
        # List environment variables
        echo "  Checking environment variables..."
        if vercel env ls >/dev/null 2>&1; then
            echo -e "    Can access env vars: ${GREEN}✅${NC}"
        else
            echo -e "    Can access env vars: ${YELLOW}⚠️  Select a project first${NC}"
        fi
    else
        echo -e "  Vercel CLI: ${YELLOW}⚠️  Not authenticated${NC}"
        echo "  Run: vercel login"
    fi
else
    echo -e "  Vercel CLI: ${YELLOW}⚠️  Not installed${NC}"
    echo "  Run: npm install -g vercel"
fi

# Check Netlify (if installed)
echo ""
echo "🔷 Netlify Configuration..."
echo "============================"
if command -v netlify &> /dev/null; then
    # Check if authenticated
    if netlify status >/dev/null 2>&1; then
        echo -e "  Netlify CLI: ${GREEN}✅ Authenticated${NC}"
        
        # Check for linked site
        if netlify status 2>/dev/null | grep -q "Current site:"; then
            echo -e "  Site linked: ${GREEN}✅${NC}"
            
            # List environment variables
            echo "  Checking environment variables..."
            if netlify env:list >/dev/null 2>&1; then
                echo -e "    Can access env vars: ${GREEN}✅${NC}"
            else
                echo -e "    Can access env vars: ${YELLOW}⚠️  Error accessing${NC}"
            fi
        else
            echo -e "  Site linked: ${YELLOW}⚠️  No site linked${NC}"
            echo "  Run: netlify link"
        fi
    else
        echo -e "  Netlify CLI: ${YELLOW}⚠️  Not authenticated${NC}"
        echo "  Run: netlify login"
    fi
else
    echo -e "  Netlify CLI: ${YELLOW}⚠️  Not installed${NC}"
    echo "  Run: npm install -g netlify-cli"
fi

# Test API Keys (optional - only if safe to do so)
echo ""
echo "🔑 API Key Validation..."
echo "========================="
echo "  Testing key validity (safe endpoints only)..."

# Test OpenAI (models endpoint - safe, read-only)
if [ -n "${OPENAI_API_KEY:-}" ]; then
    if curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models >/dev/null 2>&1; then
        echo -e "  OpenAI API: ${GREEN}✅ Valid${NC}"
    else
        echo -e "  OpenAI API: ${RED}❌ Invalid or expired${NC}"
    fi
else
    echo -e "  OpenAI API: ${YELLOW}⚠️  Not set in environment${NC}"
fi

# Test Stripe (safe endpoint)
if [ -n "${STRIPE_SECRET_KEY:-}" ]; then
    if curl -s -u "$STRIPE_SECRET_KEY:" \
        https://api.stripe.com/v1/balance >/dev/null 2>&1; then
        echo -e "  Stripe API: ${GREEN}✅ Valid${NC}"
    else
        echo -e "  Stripe API: ${RED}❌ Invalid or expired${NC}"
    fi
else
    echo -e "  Stripe API: ${YELLOW}⚠️  Not set in environment${NC}"
fi

# Summary
echo ""
echo "📊 Verification Summary"
echo "======================="
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "Ready to run the sync workflow:"
    echo "  gh workflow run secrets-sync.yml -f environment=production -f platforms=cloudflare"
else
    echo -e "${YELLOW}⚠️  Some checks failed or need attention${NC}"
    echo ""
    echo "Recommended actions:"
    echo "1. Add missing secrets: ./scripts/add-all-secrets.sh"
    echo "2. Authenticate with platforms as needed"
    echo "3. Run this verification again: ./scripts/verify-secrets.sh"
fi

echo ""
echo "📚 Documentation: DEPLOYMENT_SECRETS_SETUP.md"
echo "🔗 GitHub Secrets: https://github.com/ahump20/BI/settings/secrets/actions"

exit $OVERALL_STATUS