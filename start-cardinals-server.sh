#!/bin/bash

# Cardinals Analytics MCP Server Startup Script
# This script starts the Cardinals Analytics server with proper configuration

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔥 Starting Cardinals Analytics MCP Server...${NC}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 16+ to run the server.${NC}"
    exit 1
fi

# Check if the server file exists
if [[ ! -f "cardinals-analytics-server.js" ]]; then
    echo -e "${RED}❌ Cardinals Analytics server file not found.${NC}"
    echo "Make sure you're running this from the correct directory."
    exit 1
fi

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
fi

# Set environment variables for development
export NODE_ENV=development
export DEBUG=cardinals:*

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server with logging
echo -e "${GREEN}✅ Starting Cardinals Analytics MCP Server...${NC}"
echo -e "${BLUE}📊 Ready to serve Cardinals analytics data!${NC}"
echo ""
echo "Server capabilities:"
echo "  🏟️  Current roster information"
echo "  📅 Game schedule and results"
echo "  📈 Team and player statistics"
echo "  🎯 Readiness score calculations"
echo "  📊 Performance trajectory analysis"
echo "  🧠 AI-powered insights and recommendations"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server and log output
node cardinals-analytics-server.js 2>&1 | tee "logs/cardinals-server-$(date +%Y%m%d-%H%M%S).log"