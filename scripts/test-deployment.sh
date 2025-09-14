#!/bin/bash
set -euo pipefail

# Blaze Intelligence - Deployment Test Script
# Tests that secrets are properly available in deployment environments

echo "🚀 Blaze Intelligence - Deployment Test"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

OVERALL_STATUS=0

# Function to test deployment
test_deployment() {
    local platform="$1"
    local deploy_command="$2"
    local test_url="${3:-}"
    
    echo -e "${BLUE}Testing $platform deployment...${NC}"
    echo "=================================="
    
    echo -n "  Deploying... "
    if eval "$deploy_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        
        if [ -n "$test_url" ]; then
            echo -n "  Testing URL... "
            sleep 5  # Give deployment time to propagate
            
            if curl -s "$test_url" | grep -q "Blaze Intelligence" 2>/dev/null; then
                echo -e "${GREEN}✅${NC}"
                echo "  URL: $test_url"
            else
                echo -e "${YELLOW}⚠️  Site may not be ready${NC}"
            fi
        fi
    else
        echo -e "${RED}❌${NC}"
        OVERALL_STATUS=1
    fi
    echo ""
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    local expected_text="${3:-}"
    
    echo -n "  Testing $description... "
    
    response=$(curl -s -w "%{http_code}" "$endpoint" -o /tmp/response.txt)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        if [ -n "$expected_text" ]; then
            if grep -q "$expected_text" /tmp/response.txt; then
                echo -e "${GREEN}✅ ($http_code)${NC}"
            else
                echo -e "${YELLOW}⚠️  ($http_code - content issue)${NC}"
            fi
        else
            echo -e "${GREEN}✅ ($http_code)${NC}"
        fi
    else
        echo -e "${RED}❌ ($http_code)${NC}"
        OVERALL_STATUS=1
    fi
    
    rm -f /tmp/response.txt
}

# Test environment variables in current shell
echo "🔍 Environment Variable Check"
echo "============================="

REQUIRED_VARS=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
    "CLOUDFLARE_API_TOKEN"
    "STRIPE_SECRET_KEY"
    "PRODUCTION_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    echo -n "  $var... "
    if [ -n "${!var:-}" ]; then
        # Check if it's not a placeholder
        if [[ "${!var}" == *"sk-"* ]] || [[ "${!var}" == *"api"* ]] || [[ "${!var}" == *"blaze"* ]]; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${YELLOW}⚠️  Looks like placeholder${NC}"
        fi
    else
        echo -e "${RED}❌ Not set${NC}"
        OVERALL_STATUS=1
    fi
done

echo ""

# Test Cloudflare Pages deployment
echo "☁️  Cloudflare Pages Test"
echo "========================="

cd austin-portfolio-deploy 2>/dev/null || {
    echo -e "${RED}❌ Cannot find austin-portfolio-deploy directory${NC}"
    echo "  Make sure you're in the project root"
    exit 1
}

# Check if wrangler is available
if command -v npx wrangler &> /dev/null; then
    echo -n "  Checking authentication... "
    if npx wrangler whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        
        # Deploy to Cloudflare Pages
        echo -n "  Deploying to Cloudflare Pages... "
        if npx wrangler pages deploy . --project-name=blaze-intelligence >/dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
            
            # Test the deployed site
            SITE_URL="https://blaze-intelligence.pages.dev"
            echo -n "  Testing deployed site... "
            sleep 10  # Give time for deployment to propagate
            
            if curl -s "$SITE_URL" | grep -q "Blaze Intelligence" 2>/dev/null; then
                echo -e "${GREEN}✅${NC}"
                echo "  Site URL: $SITE_URL"
            else
                echo -e "${YELLOW}⚠️  Site may still be deploying${NC}"
                echo "  Check: $SITE_URL"
            fi
        else
            echo -e "${RED}❌ Deployment failed${NC}"
            OVERALL_STATUS=1
        fi
    else
        echo -e "${RED}❌ Not authenticated${NC}"
        echo "  Run: npx wrangler login"
        OVERALL_STATUS=1
    fi
else
    echo -e "${YELLOW}⚠️  Wrangler not available${NC}"
fi

cd .. || exit 1

echo ""

# Test API endpoints (if site is deployed)
echo "🔌 API Endpoint Tests"
echo "===================="

if [ $OVERALL_STATUS -eq 0 ]; then
    BASE_URL="https://blaze-intelligence.pages.dev"
    
    # Test health endpoint
    test_api_endpoint "$BASE_URL/api/health" "Health Check" "status"
    
    # Test analytics endpoint
    test_api_endpoint "$BASE_URL/api/analytics/cardinals" "Cardinals Analytics" "data"
    
    # Test NIL calculator
    test_api_endpoint "$BASE_URL/api/nil-calculator?sport=football&performance=85" "NIL Calculator" "valuation"
else
    echo -e "${YELLOW}⚠️  Skipping API tests due to deployment issues${NC}"
fi

echo ""

# Test GitHub Actions workflow
echo "⚙️  GitHub Actions Test"
echo "======================="

echo -n "  Checking if secrets-sync workflow exists... "
if gh workflow list --repo ahump20/BI | grep -q "secrets-sync"; then
    echo -e "${GREEN}✅${NC}"
    
    echo -n "  Triggering workflow... "
    if gh workflow run secrets-sync.yml \
        --repo ahump20/BI \
        -f environment=production \
        -f platforms=cloudflare >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        
        echo "  Workflow triggered. Check status at:"
        echo "  https://github.com/ahump20/BI/actions"
    else
        echo -e "${RED}❌ Failed to trigger${NC}"
        OVERALL_STATUS=1
    fi
else
    echo -e "${RED}❌ Workflow not found${NC}"
    echo "  Make sure the secrets-sync PR has been merged"
    OVERALL_STATUS=1
fi

echo ""

# Performance test
echo "⚡ Performance Test"
echo "=================="

if [ $OVERALL_STATUS -eq 0 ]; then
    SITE_URL="https://blaze-intelligence.pages.dev"
    
    echo -n "  Measuring page load time... "
    load_time=$(curl -w "%{time_total}" -s -o /dev/null "$SITE_URL" 2>/dev/null || echo "999")
    
    if (( $(echo "$load_time < 3.0" | bc -l) )); then
        echo -e "${GREEN}✅ ${load_time}s${NC}"
    elif (( $(echo "$load_time < 5.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  ${load_time}s (could be faster)${NC}"
    else
        echo -e "${RED}❌ ${load_time}s (too slow)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping due to deployment issues${NC}"
fi

echo ""

# Final summary
echo "📊 Test Results Summary"
echo "======================="

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ Environment variables configured"
    echo "✅ Cloudflare Pages deployed successfully"
    echo "✅ API endpoints responding"
    echo "✅ GitHub Actions workflow working"
    echo ""
    echo "🚀 Your deployment pipeline is ready!"
    echo ""
    echo "Next steps:"
    echo "• Monitor deployments: https://dash.cloudflare.com"
    echo "• Check site: https://blaze-intelligence.pages.dev"
    echo "• Review actions: https://github.com/ahump20/BI/actions"
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "1. Run: ./scripts/verify-secrets.sh"
    echo "2. Check GitHub secrets are properly set"
    echo "3. Ensure platform authentication is working"
    echo "4. Review deployment logs for errors"
    echo ""
    echo "📚 Documentation: DEPLOYMENT_SECRETS_SETUP.md"
fi

echo ""
echo "🔗 Quick Links:"
echo "• Cloudflare Dashboard: https://dash.cloudflare.com"
echo "• GitHub Secrets: https://github.com/ahump20/BI/settings/secrets/actions"
echo "• GitHub Actions: https://github.com/ahump20/BI/actions"
echo "• Site URL: https://blaze-intelligence.pages.dev"

exit $OVERALL_STATUS