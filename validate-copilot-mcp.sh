#!/bin/bash

# Blaze Intelligence Copilot MCP Configuration Validator
# This script validates the MCP setup and configuration

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔥 Validating Blaze Intelligence Copilot MCP Configuration...${NC}"
echo ""

# Check if we're in the right directory
if [[ ! -f "copilot-mcp-server.js" ]]; then
    echo -e "${RED}❌ Copilot MCP server file not found. Please run from the project root.${NC}"
    exit 1
fi

# Validation results
PASSED=0
FAILED=0

# Function to check and report status
check_status() {
    local test_name="$1"
    local status="$2"
    
    if [[ "$status" == "0" ]]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $test_name${NC}"
        ((FAILED++))
    fi
}

echo "🔍 Running validation checks..."
echo ""

# 1. Check Node.js version
echo "1. Node.js Version Check"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if [[ $(echo "$NODE_VERSION" | cut -d'.' -f1) -ge 18 ]]; then
        check_status "Node.js version $NODE_VERSION (≥18.0.0)" 0
    else
        check_status "Node.js version $NODE_VERSION (≥18.0.0 required)" 1
    fi
else
    check_status "Node.js installed" 1
fi

# 2. Check required files
echo ""
echo "2. Required Files Check"
files=("copilot-mcp-server.js" "start-copilot-server.sh" "claude_desktop_config_copilot.json" ".env.copilot.example")
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        check_status "File exists: $file" 0
    else
        check_status "File exists: $file" 1
    fi
done

# 3. Check file permissions
echo ""
echo "3. File Permissions Check"
if [[ -x "start-copilot-server.sh" ]]; then
    check_status "start-copilot-server.sh is executable" 0
else
    check_status "start-copilot-server.sh is executable" 1
fi

# 4. Check dependencies
echo ""
echo "4. Dependencies Check"
if npm list @modelcontextprotocol/sdk &> /dev/null; then
    check_status "MCP SDK installed" 0
else
    check_status "MCP SDK installed" 1
fi

if npm list eslint &> /dev/null; then
    check_status "ESLint installed" 0
else
    check_status "ESLint installed" 1
fi

if npm list prettier &> /dev/null; then
    check_status "Prettier installed" 0
else
    check_status "Prettier installed" 1
fi

# 5. Check server startup
echo ""
echo "5. Server Startup Test"
if timeout 5s node copilot-mcp-server.js 2>&1 | grep -q "started successfully"; then
    check_status "Copilot MCP server starts successfully" 0
else
    check_status "Copilot MCP server starts successfully" 1
fi

# 6. Check configuration file format
echo ""
echo "6. Configuration File Validation"
if python3 -m json.tool claude_desktop_config_copilot.json > /dev/null 2>&1; then
    check_status "Claude Desktop config is valid JSON" 0
else
    check_status "Claude Desktop config is valid JSON" 1
fi

# 7. Check package.json format
echo ""
echo "7. Package Configuration"
if python3 -m json.tool package.json > /dev/null 2>&1; then
    check_status "package.json is valid JSON" 0
else
    check_status "package.json is valid JSON" 1
fi

# 8. Check environment template
echo ""
echo "8. Environment Configuration"
if [[ -f ".env.copilot.example" ]]; then
    if grep -q "BLAZE_PROJECT_ROOT" .env.copilot.example; then
        check_status "Environment template contains required variables" 0
    else
        check_status "Environment template contains required variables" 1
    fi
else
    check_status "Environment template exists" 1
fi

# 9. Check documentation
echo ""
echo "9. Documentation Check"
if [[ -f "docs/README-Copilot-MCP.md" ]]; then
    check_status "Copilot MCP documentation exists" 0
else
    check_status "Copilot MCP documentation exists" 1
fi

# 10. Check logs directory
echo ""
echo "10. Directory Structure"
if mkdir -p logs 2>/dev/null; then
    check_status "Logs directory can be created" 0
else
    check_status "Logs directory can be created" 1
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 VALIDATION SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All validation checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Copy claude_desktop_config_copilot.json to your Claude Desktop config directory"
    echo "2. Copy .env.copilot.example to .env.copilot and customize settings"
    echo "3. Start the server with: npm run mcp-copilot"
    echo "4. Restart Claude Desktop to load the new configuration"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  Some validation checks failed. Please review and fix the issues above.${NC}"
    echo ""
    exit 1
fi