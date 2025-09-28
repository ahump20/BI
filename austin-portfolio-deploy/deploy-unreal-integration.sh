#!/bin/bash

# Blaze Intelligence - Unreal MCP Integration Deployment Script
# Deploys the complete platform with Unreal Engine 5.5 support

echo "🔥 Blaze Intelligence - Unreal MCP Integration Deployment"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    print_error "Not in austin-portfolio-deploy directory!"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Test the integration locally
print_status "Running integration tests..."
if command -v python3 &> /dev/null; then
    print_status "Testing Python MCP server..."
    python3 -c "import asyncio, websockets" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Python dependencies verified"
    else
        print_warning "WebSocket module not installed. Run: pip install websockets"
    fi
else
    print_warning "Python 3 not found. MCP bridge will not be available."
fi

# Step 2: Check for JavaScript files
print_status "Verifying JavaScript modules..."
FILES=("unreal-engine-module.js" "hybrid-render-orchestrator.js" "test-integration.html" "unreal-integration.html")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file found"
    else
        print_error "$file missing!"
        exit 1
    fi
done

# Step 3: Build the project (if needed)
if [ -f "package.json" ]; then
    print_status "Installing dependencies..."
    npm install --silent
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed"
    else
        print_warning "Some dependencies may have failed to install"
    fi
fi

# Step 4: Deploy to Cloudflare Pages
print_status "Deploying to Cloudflare Pages..."
if command -v wrangler &> /dev/null; then
    print_status "Using Wrangler to deploy..."

    # Create a .gitignore for sensitive files if not exists
    if [ ! -f ".gitignore" ]; then
        echo "node_modules/" > .gitignore
        echo ".env" >> .gitignore
        echo "*.pyc" >> .gitignore
        echo "__pycache__/" >> .gitignore
    fi

    # Deploy to Cloudflare Pages
    wrangler pages deploy . \
        --project-name blaze-intelligence \
        --compatibility-date 2024-01-01 \
        --commit-message "Deploy Unreal MCP Integration"

    if [ $? -eq 0 ]; then
        print_success "Deployment successful!"
        echo ""
        echo "🎉 Deployment Complete!"
        echo "========================"
        echo "📍 Live Site: https://blazesportsintel.com"
        echo "🧪 Test Suite: https://blazesportsintel.com/test-integration.html"
        echo "🎮 Control Panel: https://blazesportsintel.com/unreal-integration.html"
        echo ""
        echo "Next Steps:"
        echo "1. Start MCP bridge: cd unreal-mcp-server && python websocket_bridge.py"
        echo "2. Open Unreal Engine 5.5 with Blaze project"
        echo "3. Visit the test suite to verify integration"
    else
        print_error "Deployment failed!"
        exit 1
    fi
else
    print_error "Wrangler not installed. Run: npm install -g wrangler"
    exit 1
fi

# Step 5: Optional - Start local MCP server
read -p "Start local MCP bridge server? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting MCP bridge..."
    cd unreal-mcp-server
    python3 websocket_bridge.py &
    MCP_PID=$!
    print_success "MCP bridge started (PID: $MCP_PID)"
    echo "To stop: kill $MCP_PID"
    cd ..
fi

# Step 6: Open browser for testing
read -p "Open test suite in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Opening test suite..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://blazesportsintel.com/test-integration.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "https://blazesportsintel.com/test-integration.html"
    else
        print_warning "Please open: https://blazesportsintel.com/test-integration.html"
    fi
fi

print_success "Deployment script complete!"
echo ""
echo "🔥 Blaze Intelligence - Unreal MCP Integration Active"
echo "====================================================="
echo "Championship Data → Cinematic Experiences"