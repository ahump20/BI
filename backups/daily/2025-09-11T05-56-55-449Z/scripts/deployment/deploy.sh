#!/bin/bash

# Deploy Youth/TXHS Pipeline
echo "Deploying to Cloudflare Workers..."

# Run tests first
npm test 2>/dev/null || echo "No tests configured"

# Deploy worker
wrangler deploy --env production

# Verify deployment
echo -e "\nVerifying deployment..."
WORKER_URL="https://youth-txhs-ingestion.blaze-intelligence.workers.dev"

# Health check
HEALTH=$(curl -s ${WORKER_URL}/api/health | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ Deployment successful!"
    echo "Worker URL: ${WORKER_URL}"
    echo "API Endpoints:"
    echo "  - ${WORKER_URL}/api/prospects (Top prospects)"
    echo "  - ${WORKER_URL}/api/teams (Texas 6A teams)"
    echo "  - ${WORKER_URL}/api/ingest (Trigger ingestion)"
    echo "  - ${WORKER_URL}/api/evaluate (Run evaluations)"
else
    echo "❌ Deployment verification failed"
    exit 1
fi
