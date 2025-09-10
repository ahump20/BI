#!/bin/bash

echo "🚀 Blaze Intelligence Dependency Upgrade Script"
echo "=============================================="
echo ""

# Update npm packages to latest versions
echo "📦 Updating npm packages..."
npm update

# Update specific critical packages
echo "🔧 Updating critical packages to latest versions..."

# AI SDKs
npm install @anthropic-ai/sdk@latest
npm install @google/generative-ai@latest
npm install openai@latest

# Cloudflare and Workers
npm install @cloudflare/workers-types@latest
npm install wrangler@latest

# MCP SDK for sports data
npm install @modelcontextprotocol/sdk@latest

# Data processing
npm install axios@latest
npm install cheerio@latest
npm install node-cron@latest

# WebSocket and real-time
npm install socket.io@latest
npm install socket.io-client@latest

# Vision AI dependencies
npm install @tensorflow/tfjs@latest
npm install @tensorflow/tfjs-node@latest
npm install @mediapipe/pose@latest

# Database and caching
npm install ioredis@latest
npm install redis@latest

# React and Three.js for UI
npm install react@latest
npm install react-dom@latest
npm install three@latest

# Development tools
npm install --save-dev @types/node@latest
npm install --save-dev typescript@latest
npm install --save-dev vitest@latest

echo ""
echo "✅ Dependencies updated successfully!"
echo ""
echo "📊 Package summary:"
npm list --depth=0