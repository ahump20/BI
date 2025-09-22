#!/bin/bash

# Blaze Intelligence Copilot MCP Server Startup Script
# This script starts the Copilot MCP server with proper configuration

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔥 Starting Blaze Intelligence Copilot MCP Server...${NC}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ to run the server.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

# Simple version check (basic comparison)
if [[ $(echo "$NODE_VERSION" | cut -d'.' -f1) -lt 18 ]]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version $NODE_VERSION detected${NC}"

# Check if the server file exists
if [[ ! -f "copilot-mcp-server.js" ]]; then
    echo -e "${RED}❌ Copilot MCP server file not found.${NC}"
    echo "Make sure you're running this from the correct directory."
    exit 1
fi

# Install MCP dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
fi

# Check for required MCP packages
echo -e "${BLUE}📦 Checking MCP dependencies...${NC}"
if ! npm list @modelcontextprotocol/sdk >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Installing MCP SDK...${NC}"
    npm install @modelcontextprotocol/sdk
fi

# Set environment variables for development
export NODE_ENV=development
export DEBUG=copilot:*
export BLAZE_PROJECT_ROOT=$(pwd)
export MCP_SERVER_NAME=blaze-copilot-agent

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server with logging
echo -e "${GREEN}✅ Starting Blaze Intelligence Copilot MCP Server...${NC}"
echo -e "${BLUE}🛠️  Ready to assist with coding tasks!${NC}"
echo ""
echo "Server capabilities:"
echo "  📊 Code analysis and structure review"
echo "  🔧 Code generation and templates"
echo "  ♻️  Code refactoring assistance"
echo "  🧪 Test execution and management"
echo "  📐 Linting and formatting"
echo "  📦 Dependency management"
echo "  🏗️  Project building and deployment"
echo "  🔍 Codebase search and navigation"
echo "  📁 Project structure analysis"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server and log output
node copilot-mcp-server.js 2>&1 | tee "logs/copilot-server-$(date +%Y%m%d-%H%M%S).log"