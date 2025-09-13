#!/bin/bash
set -euo pipefail

# Blaze Intelligence - Complete Deployment Status Check
# Shows current status of all deployment components

echo "🚀 Blaze Intelligence - Deployment Status"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

OVERALL_STATUS=0

# Check Git Repository Status
echo -e "${BLUE}📦 Repository Status${NC}"
echo "===================="
echo -n "  Current branch: "
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${GREEN}$CURRENT_BRANCH ✅${NC}"
else
    echo -e "${YELLOW}$CURRENT_BRANCH ⚠️${NC}"
fi

echo -n "  Repository clean: "
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️ Uncommitted changes${NC}"
fi

echo -n "  Remote sync: "
git fetch origin >/dev/null 2>&1
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✅ Up to date${NC}"
else
    echo -e "${YELLOW}⚠️ Behind/ahead of remote${NC}"
fi

echo ""

# Check Site Files
echo -e "${BLUE}📄 Site Files Status${NC}"
echo "==================="
echo -n "  Main index.html: "
if [ -f "index.html" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    OVERALL_STATUS=1
fi

echo -n "  Site content: "
if [ -f "index.html" ] && grep -q "Blaze Intelligence" index.html; then
    echo -e "${GREEN}✅ Contains brand${NC}"
else
    echo -e "${YELLOW}⚠️ Check content${NC}"
fi

echo ""

# Check GitHub Workflows
echo -e "${BLUE}⚙️ GitHub Actions Status${NC}"
echo "========================"
echo -n "  Secrets sync workflow: "
if [ -f ".github/workflows/secrets-sync.yml" ]; then
    echo -e "${GREEN}✅ Available${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    OVERALL_STATUS=1
fi

echo -n "  Auto deploy workflow: "
if [ -f ".github/workflows/auto-deploy.yml" ]; then
    echo -e "${GREEN}✅ Available${NC}"
else
    echo -e "${YELLOW}⚠️ Optional${NC}"
fi

# Check GitHub Secrets (via API)
echo -n "  GitHub secrets: "
if command -v curl >/dev/null 2>&1 && [ -n "${GITHUB_TOKEN:-}" ]; then
    SECRET_COUNT=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/ahump20/BI/actions/secrets" | \
        jq -r '.secrets | length' 2>/dev/null || echo "0")
    if [ "$SECRET_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ $SECRET_COUNT secrets configured${NC}"
    else
        echo -e "${RED}❌ No secrets found${NC}"
        OVERALL_STATUS=1
    fi
else
    echo -e "${YELLOW}⚠️ Cannot verify (need GITHUB_TOKEN)${NC}"
fi

echo ""

# Check Available Scripts
echo -e "${BLUE}🔧 Automation Scripts${NC}"
echo "===================="
SCRIPTS=(
    "scripts/add-all-secrets.sh"
    "scripts/verify-secrets.sh" 
    "scripts/test-deployment.sh"
)

for script in "${SCRIPTS[@]}"; do
    echo -n "  $(basename "$script"): "
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo -e "${GREEN}✅ Executable${NC}"
    elif [ -f "$script" ]; then
        echo -e "${YELLOW}⚠️ Not executable${NC}"
        chmod +x "$script"
        echo -e "    Fixed permissions${NC}"
    else
        echo -e "${RED}❌ Missing${NC}"
        OVERALL_STATUS=1
    fi
done

echo ""

# Check Configuration Files
echo -e "${BLUE}📋 Configuration Files${NC}"
echo "======================"
CONFIG_FILES=(
    ".gitignore"
    "package.json"
    "wrangler.toml"
    "DEPLOYMENT_SECRETS_SETUP.md"
    "NEXT_STEPS_COMPLETE.md"
)

for file in "${CONFIG_FILES[@]}"; do
    echo -n "  $file: "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️ Missing${NC}"
    fi
done

echo ""

# Test Essential Commands
echo -e "${BLUE}🛠️ Command Availability${NC}"
echo "======================="
COMMANDS=("git" "node" "npm" "curl" "jq")

for cmd in "${COMMANDS[@]}"; do
    echo -n "  $cmd: "
    if command -v "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}✅$(NC)"
    else
        echo -e "${RED}❌ Not installed${NC}"
        OVERALL_STATUS=1
    fi
done

echo ""

# Environment Variables Check
echo -e "${BLUE}🔑 Environment Variables${NC}"
echo "========================="
ENV_VARS=("GITHUB_TOKEN" "CLOUDFLARE_API_TOKEN")

for var in "${ENV_VARS[@]}"; do
    echo -n "  $var: "
    if [ -n "${!var:-}" ]; then
        # Mask the value for security
        VALUE="${!var}"
        MASKED="${VALUE:0:4}...${VALUE: -4}"
        echo -e "${GREEN}✅ Set ($MASKED)${NC}"
    else
        echo -e "${YELLOW}⚠️ Not set${NC}"
    fi
done

echo ""

# Quick Connectivity Test
echo -e "${BLUE}🌐 Connectivity Test${NC}"
echo "==================="
echo -n "  GitHub API: "
if curl -s --max-time 5 https://api.github.com >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Reachable${NC}"
else
    echo -e "${RED}❌ Cannot reach${NC}"
    OVERALL_STATUS=1
fi

echo -n "  Cloudflare API: "
if curl -s --max-time 5 https://api.cloudflare.com/client/v4 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Reachable${NC}"
else
    echo -e "${RED}❌ Cannot reach${NC}"
    OVERALL_STATUS=1
fi

echo ""

# Final Status Summary
echo -e "${BLUE}📊 Overall Status${NC}"
echo "================="
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 All systems ready for deployment!${NC}"
    echo ""
    echo -e "${GREEN}✅ Next Steps:${NC}"
    echo "1. Run: ./scripts/verify-secrets.sh"
    echo "2. Trigger GitHub Actions workflow"  
    echo "3. Monitor deployment at: https://github.com/ahump20/BI/actions"
else
    echo -e "${YELLOW}⚠️ Some issues need attention${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Recommended actions:${NC}"
    echo "1. Fix any missing files or permissions"
    echo "2. Set required environment variables"
    echo "3. Run this script again to verify"
fi

echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo "• GitHub Repository: https://github.com/ahump20/BI"
echo "• GitHub Actions: https://github.com/ahump20/BI/actions"
echo "• GitHub Secrets: https://github.com/ahump20/BI/settings/secrets/actions"
echo "• Cloudflare Dashboard: https://dash.cloudflare.com"

exit $OVERALL_STATUS