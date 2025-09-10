#!/bin/bash

# Blaze Intelligence OS v2 - Quick Start Script
# Get championship analytics running in seconds

echo "
╔══════════════════════════════════════════════════════════════╗
║   BLAZE INTELLIGENCE OS v2 - QUICK START                    ║
║   Championship Sports Analytics Platform                     ║
╚══════════════════════════════════════════════════════════════╝
"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your API keys"
fi

# Start services
echo "🚀 Starting Blaze Intelligence OS v2..."
echo ""
echo "Available services:"
echo "  1. Development Server (http://localhost:5173)"
echo "  2. WebSocket Server (ws://localhost:8787)"
echo "  3. API Documentation (http://localhost:5173/api-docs)"
echo ""

# Run in development mode
npm run start

# Instructions
echo "
╔══════════════════════════════════════════════════════════════╗
║   SERVICES RUNNING                                          ║
╠══════════════════════════════════════════════════════════════╣
║   Web UI:     http://localhost:5173                         ║
║   WebSocket:  ws://localhost:8787                           ║
║   API Docs:   http://localhost:5173/api-docs                ║
╠══════════════════════════════════════════════════════════════╣
║   Press Ctrl+C to stop all services                         ║
╚══════════════════════════════════════════════════════════════╝
"