#!/bin/bash

# Blaze Intelligence MCP Server Setup Script
# Comprehensive setup for MCP server with Zapier integration

set -e

echo "🔥 Setting up Blaze Intelligence MCP Server with Zapier Tools..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+ first."
    exit 1
fi

print_status "Node.js version $NODE_VERSION detected ✓"

# Create MCP server directory if it doesn't exist
cd /Users/AustinHumphrey
if [ ! -d "mcp-server" ]; then
    print_status "Creating mcp-server directory..."
    mkdir -p mcp-server
fi

cd mcp-server

# Install dependencies
print_status "Installing MCP server dependencies..."
npm install

# Create TypeScript config if it doesn't exist
if [ ! -f "tsconfig.json" ]; then
    print_status "Creating TypeScript configuration..."
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
fi

# Build the TypeScript code
print_status "Building TypeScript code..."
npm run build

# Create database directory
print_status "Creating database directory..."
mkdir -p data

# Copy environment file if .env doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your actual API keys and configuration"
    else
        print_warning ".env.example not found. You'll need to create .env manually."
    fi
else
    print_status ".env file already exists ✓"
fi

# Setup Claude Desktop Config
print_status "Setting up Claude Desktop configuration..."

# Try different possible Claude config locations
CLAUDE_CONFIG_LOCATIONS=(
    "$HOME/.config/claude"
    "$HOME/Library/Application Support/Claude"
    "$HOME/.claude"
)

CLAUDE_CONFIG_DIR=""
for dir in "${CLAUDE_CONFIG_LOCATIONS[@]}"; do
    if [ -d "$dir" ] || mkdir -p "$dir" 2>/dev/null; then
        CLAUDE_CONFIG_DIR="$dir"
        break
    fi
done

if [ -n "$CLAUDE_CONFIG_DIR" ]; then
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    if [ -f "/Users/AustinHumphrey/claude_desktop_config.json" ]; then
        print_status "Copying Claude configuration to $CONFIG_FILE"
        cp "/Users/AustinHumphrey/claude_desktop_config.json" "$CONFIG_FILE"
        print_status "Claude Desktop configuration installed ✓"
    else
        print_warning "claude_desktop_config.json not found in home directory"
    fi
else
    print_warning "Could not create Claude config directory. You may need to manually copy the configuration."
fi

# Install MCP CLI tools globally
print_status "Installing MCP CLI tools..."
npm install -g @modelcontextprotocol/inspector

# Install additional MCP servers
print_status "Installing additional MCP servers..."
npm install -g @modelcontextprotocol/server-zapier
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-google-drive

# Start the servers (optional - for testing)
print_status "Testing MCP server startup..."
timeout 5s npm run start 2>/dev/null || true
timeout 5s npm run start:analytics 2>/dev/null || true

print_status "Testing analytics tools server startup..."
timeout 5s node dist/analytics-tools.js 2>/dev/null || true

# Zapier setup instructions
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔗 ZAPIER INTEGRATION SETUP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "To complete Zapier integration:"
echo ""
echo "1. 📧 Email Notifications:"
echo "   - Go to: https://zapier.com/apps/email/integrations/webhook"
echo "   - Create: Webhook → Email trigger"
echo "   - Copy webhook URL to ZAPIER_EMAIL_WEBHOOK in .env"
echo ""
echo "2. 💬 Slack Alerts:"
echo "   - Go to: https://zapier.com/apps/slack/integrations/webhook"
echo "   - Create: Webhook → Slack trigger"
echo "   - Copy webhook URL to ZAPIER_SLACK_WEBHOOK in .env"
echo ""
echo "3. 📊 Google Sheets Sync:"
echo "   - Go to: https://zapier.com/apps/google-sheets/integrations/webhook"
echo "   - Create: Webhook → Google Sheets trigger"
echo "   - Copy webhook URL to ZAPIER_SHEETS_WEBHOOK in .env"
echo ""
echo "4. 🗃️ Airtable Sync:"
echo "   - Go to: https://zapier.com/apps/airtable/integrations/webhook"
echo "   - Create: Webhook → Airtable trigger"
echo "   - Copy webhook URL to ZAPIER_AIRTABLE_WEBHOOK in .env"
echo ""
echo "5. 🔑 Get Zapier NLA API Key:"
echo "   - Visit: https://zapier.com/developer/public-api"
echo "   - Generate API key and add to ZAPIER_NLA_API_KEY in .env"
echo ""

# Analytics setup instructions
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 ANALYTICS INTEGRATION SETUP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "To complete analytics integration:"
echo ""
echo "1. 📈 Google Analytics:"
echo "   - Get API key from Google Cloud Console"
echo "   - Add to GOOGLE_ANALYTICS_API_KEY in .env"
echo ""
echo "2. 🗂️ Airtable:"
echo "   - Get API key from https://airtable.com/developers/web/api/introduction"
echo "   - Add to AIRTABLE_API_KEY in .env"
echo ""
echo "3. 🔧 Replit:"
echo "   - Get token from Replit account settings"
echo "   - Add to REPLIT_TOKEN in .env"
echo ""

# Final instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. 📝 Edit .env file with your API keys:"
echo "   nano .env"
echo ""
echo "2. 🚀 Start the MCP servers:"
echo "   npm run dev          # Main MCP server"
echo "   npm run dev:analytics # Analytics tools server"
echo ""
echo "3. 🔍 Test MCP connection:"
echo "   mcp-inspector blaze-intelligence"
echo ""
echo "4. 🎯 Open Claude Desktop and verify MCP servers are connected"
echo ""
echo "5. 🔧 Configure Zapier webhooks using the URLs above"
echo ""

# Create a quick test script
cat > test-mcp.sh << 'EOF'
#!/bin/bash
echo "Testing MCP server connection..."
echo "Starting main server..."
timeout 10s npm run start &
sleep 2
echo "Starting analytics server..."
timeout 10s npm run start:analytics &
sleep 2
echo "Servers should be running. Check Claude Desktop for connection status."
EOF

chmod +x test-mcp.sh

print_status "Setup complete! 🎉"
print_status "Run './test-mcp.sh' to test the server connections"

echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "   - Edit .env with your actual API keys"
echo "   - Restart Claude Desktop after configuration"
echo "   - Set up Zapier webhooks for full automation"
echo ""