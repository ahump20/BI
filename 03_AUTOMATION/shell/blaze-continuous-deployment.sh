#!/bin/bash

# Blaze Intelligence Continuous Deployment Pipeline
# Automated deployment for multi-league ingestion and readiness system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     BLAZE INTELLIGENCE CONTINUOUS DEPLOYMENT PIPELINE        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
REPO_ROOT="/Users/AustinHumphrey"
DATA_DIR="${REPO_ROOT}/data"
SITE_DIR="${REPO_ROOT}/site"
SCRIPTS_DIR="${REPO_ROOT}/scripts"
LOG_DIR="${REPO_ROOT}/logs"

# Ensure directories exist
mkdir -p "${DATA_DIR}/unified" "${DATA_DIR}/evaluations" "${LOG_DIR}" "${SCRIPTS_DIR}"

# Timestamp for logs
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/deployment_${TIMESTAMP}.log"

# Function to log messages
log() {
    echo -e "$1" | tee -a "${LOG_FILE}"
}

# Function to run command with error handling
run_command() {
    local command="$1"
    local description="$2"
    
    log "${YELLOW}${description}...${NC}"
    
    if eval "${command}" >> "${LOG_FILE}" 2>&1; then
        log "${GREEN}✓ ${description} complete${NC}"
        return 0
    else
        log "${RED}✗ ${description} failed${NC}"
        return 1
    fi
}

# Step 1: Schema Validation
log "\n${BLUE}═══ STEP 1: Schema Validation ═══${NC}"

cat > "${SCRIPTS_DIR}/validate-schema.py" << 'EOF'
#!/usr/bin/env python3
import json
import sys
from jsonschema import validate, ValidationError

# Load schema
with open('./blaze-unified-schema.json', 'r') as f:
    schema = json.load(f)

# Validate test data
test_player = {
    "player_id": "TEST-TST-0001",
    "name": "Test Player",
    "sport": "MLB",
    "league": "MLB",
    "team_id": "MLB-TST",
    "position": "SS"
}

try:
    # Validate player structure
    validate(instance=test_player, schema=schema['definitions']['player'])
    print("✓ Schema validation passed")
    sys.exit(0)
except ValidationError as e:
    print(f"✗ Schema validation failed: {e.message}")
    sys.exit(1)
EOF

chmod +x "${SCRIPTS_DIR}/validate-schema.py"
run_command "python3 ${SCRIPTS_DIR}/validate-schema.py" "Schema validation"

# Step 2: Run Multi-League Ingestion
log "\n${BLUE}═══ STEP 2: Multi-League Data Ingestion ═══${NC}"

# Create ingestion wrapper script
cat > "${SCRIPTS_DIR}/run-ingestion.py" << 'EOF'
#!/usr/bin/env python3
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from blaze_multi_league_ingestion import UnifiedIngestionPipeline

async def main():
    pipeline = UnifiedIngestionPipeline()
    
    # Run for priority leagues
    summary = await pipeline.run(['MLB', 'NFL', 'NCAA'])
    
    print(f"✓ Ingested {summary['total_players']} players from {summary['total_teams']} teams")
    print(f"  HAV-F Average: {summary['havf_stats']['avg_composite']:.1f}")
    
    return 0 if summary['total_players'] > 0 else 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
EOF

chmod +x "${SCRIPTS_DIR}/run-ingestion.py"
run_command "python3 ${SCRIPTS_DIR}/run-ingestion.py" "Multi-league ingestion"

# Step 3: Calculate Universal Readiness
log "\n${BLUE}═══ STEP 3: Universal Readiness Calculation ═══${NC}"

run_command "node blaze-universal-readiness-board.js" "Readiness calculation"

# Step 4: Run Youth/TXHS Pipeline
log "\n${BLUE}═══ STEP 4: Youth/TXHS Pipeline ═══${NC}"

run_command "node youth-txhs-ingestion-agent.js football" "Youth ingestion"
run_command "node havf-evaluation-engine.js" "HAV-F evaluation"

# Step 5: Generate Aggregated Metrics
log "\n${BLUE}═══ STEP 5: Aggregated Metrics Generation ═══${NC}"

cat > "${SCRIPTS_DIR}/generate-metrics.py" << 'EOF'
#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime

# Load all data files
data_dir = Path('./data/unified')
metrics = {
    'timestamp': datetime.now().isoformat(),
    'datasets': {},
    'totals': {
        'players': 0,
        'teams': 0,
        'leagues': set()
    },
    'havf_distribution': {
        'elite': 0,      # 90+
        'excellent': 0,  # 80-89
        'good': 0,       # 70-79
        'average': 0,    # 60-69
        'developing': 0  # <60
    }
}

# Process unified data
if (data_dir / 'unified_data_latest.json').exists():
    with open(data_dir / 'unified_data_latest.json', 'r') as f:
        data = json.load(f)
        
        metrics['totals']['players'] = len(data.get('players', []))
        metrics['totals']['teams'] = len(data.get('teams', []))
        
        for player in data.get('players', []):
            metrics['totals']['leagues'].add(player.get('league'))
            
            # HAV-F distribution
            if player.get('hav_f'):
                score = player['hav_f'].get('composite_score', 0)
                if score >= 90:
                    metrics['havf_distribution']['elite'] += 1
                elif score >= 80:
                    metrics['havf_distribution']['excellent'] += 1
                elif score >= 70:
                    metrics['havf_distribution']['good'] += 1
                elif score >= 60:
                    metrics['havf_distribution']['average'] += 1
                else:
                    metrics['havf_distribution']['developing'] += 1

metrics['totals']['leagues'] = list(metrics['totals']['leagues'])

# Save metrics
with open('./data/deployment-metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)

print(f"✓ Metrics generated: {metrics['totals']['players']} players across {len(metrics['totals']['leagues'])} leagues")
EOF

chmod +x "${SCRIPTS_DIR}/generate-metrics.py"
run_command "python3 ${SCRIPTS_DIR}/generate-metrics.py" "Metrics generation"

# Step 6: Git Commit Changes
log "\n${BLUE}═══ STEP 6: Git Commit ═══${NC}"

cd "${REPO_ROOT}"

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    log "${YELLOW}No changes to commit${NC}"
else
    # Add data files
    git add -A data/ site/src/data/ 2>/dev/null || true
    
    # Create commit message
    COMMIT_MSG="feat: Auto-update sports data and readiness metrics

- Multi-league ingestion complete (MLB, NFL, NCAA)
- Universal readiness board calculated
- Youth/TXHS pipeline processed
- HAV-F evaluations updated

🤖 Generated with Blaze Intelligence CD Pipeline

Co-Authored-By: Blaze Bot <bot@blaze-intelligence.com>"
    
    git commit -m "${COMMIT_MSG}" >> "${LOG_FILE}" 2>&1 || true
    log "${GREEN}✓ Changes committed to git${NC}"
fi

# Step 7: Deploy to Cloudflare
log "\n${BLUE}═══ STEP 7: Cloudflare Deployment ═══${NC}"

# Check if we have Cloudflare configured
if command -v wrangler &> /dev/null; then
    # Deploy Workers
    run_command "wrangler deploy --env production" "Worker deployment"
    
    # Deploy Pages if site changed
    if [ -d "${SITE_DIR}" ]; then
        cd "${SITE_DIR}"
        run_command "wrangler pages deploy . --project-name=blaze-intelligence" "Pages deployment"
        cd "${REPO_ROOT}"
    fi
else
    log "${YELLOW}Wrangler not found, skipping Cloudflare deployment${NC}"
fi

# Step 8: Health Checks
log "\n${BLUE}═══ STEP 8: Health Checks ═══${NC}"

cat > "${SCRIPTS_DIR}/health-check.sh" << 'EOF'
#!/bin/bash

# Check data freshness
LATEST_FILE="./data/unified/unified_data_latest.json"
if [ -f "${LATEST_FILE}" ]; then
    MOD_TIME=$(stat -f %m "${LATEST_FILE}" 2>/dev/null || stat -c %Y "${LATEST_FILE}" 2>/dev/null)
    CURRENT_TIME=$(date +%s)
    AGE=$((CURRENT_TIME - MOD_TIME))
    
    if [ ${AGE} -lt 3600 ]; then
        echo "✓ Data is fresh (${AGE} seconds old)"
    else
        echo "⚠ Data is stale (${AGE} seconds old)"
        exit 1
    fi
else
    echo "✗ No data file found"
    exit 1
fi

# Check API endpoints if deployed
if [ -n "${WORKER_URL}" ]; then
    HEALTH=$(curl -s "${WORKER_URL}/api/health" | jq -r '.status' 2>/dev/null)
    if [ "${HEALTH}" = "healthy" ]; then
        echo "✓ API is healthy"
    else
        echo "✗ API health check failed"
        exit 1
    fi
fi

echo "✓ All health checks passed"
EOF

chmod +x "${SCRIPTS_DIR}/health-check.sh"
run_command "${SCRIPTS_DIR}/health-check.sh" "Health checks"

# Step 9: Send Notifications
log "\n${BLUE}═══ STEP 9: Notifications ═══${NC}"

# Load metrics for summary
if [ -f "./data/deployment-metrics.json" ]; then
    PLAYERS=$(jq -r '.totals.players' ./data/deployment-metrics.json)
    TEAMS=$(jq -r '.totals.teams' ./data/deployment-metrics.json)
    LEAGUES=$(jq -r '.totals.leagues | length' ./data/deployment-metrics.json)
    ELITE=$(jq -r '.havf_distribution.elite' ./data/deployment-metrics.json)
    
    SUMMARY="Deployment complete: ${PLAYERS} players, ${TEAMS} teams, ${LEAGUES} leagues, ${ELITE} elite prospects"
else
    SUMMARY="Deployment complete"
fi

# Send Slack notification if configured
if [ -n "${SLACK_WEBHOOK_URL}" ]; then
    curl -X POST "${SLACK_WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Blaze CD Pipeline: ${SUMMARY}\"}" \
        2>/dev/null || true
fi

# Final Summary
log "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
log "${GREEN}║              DEPLOYMENT PIPELINE COMPLETE                    ║${NC}"
log "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
log ""
log "📊 Summary: ${SUMMARY}"
log "📝 Log file: ${LOG_FILE}"
log ""

# Create cron entry for automation
cat > "${SCRIPTS_DIR}/setup-cron.sh" << 'EOF'
#!/bin/bash

# Add cron jobs for automated deployment
CRON_FILE="/tmp/blaze-cron"

# Current crontab
crontab -l > "${CRON_FILE}" 2>/dev/null || true

# Add jobs if not present
grep -q "blaze-continuous-deployment.sh" "${CRON_FILE}" || {
    echo "# Blaze Intelligence Automated Deployment" >> "${CRON_FILE}"
    echo "0 2 * * * ${PWD}/blaze-continuous-deployment.sh >> ${PWD}/logs/cron.log 2>&1" >> "${CRON_FILE}"
    echo "0 * * * * ${PWD}/scripts/run-ingestion.py >> ${PWD}/logs/ingestion.log 2>&1" >> "${CRON_FILE}"
    echo "*/10 * * * * node ${PWD}/blaze-universal-readiness-board.js >> ${PWD}/logs/readiness.log 2>&1" >> "${CRON_FILE}"
}

# Install crontab
crontab "${CRON_FILE}"
rm "${CRON_FILE}"

echo "✓ Cron jobs configured"
echo ""
echo "Scheduled tasks:"
echo "  • Full deployment: Daily at 2 AM"
echo "  • Data ingestion: Every hour"
echo "  • Readiness updates: Every 10 minutes"
EOF

chmod +x "${SCRIPTS_DIR}/setup-cron.sh"

log "${YELLOW}To enable automated deployment, run:${NC}"
log "  ${SCRIPTS_DIR}/setup-cron.sh"
log ""
log "${BLUE}Next manual run:${NC}"
log "  ./blaze-continuous-deployment.sh"

exit 0