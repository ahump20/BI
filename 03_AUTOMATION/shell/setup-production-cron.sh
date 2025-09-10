#!/bin/bash

# Setup production cron jobs
CRON_FILE="/tmp/blaze-cron"
PROJECT_DIR="$PWD"

# Get current crontab
crontab -l > "${CRON_FILE}" 2>/dev/null || true

# Add Blaze Intelligence jobs
cat >> "${CRON_FILE}" << EOL

# Blaze Intelligence Production Jobs
0 2 * * * cd ${PROJECT_DIR} && python3 test-blaze-system.py >> logs/daily.log 2>&1
*/10 * * * * cd ${PROJECT_DIR} && node blaze-universal-readiness-board.js >> logs/readiness.log 2>&1
0 */4 * * * cd ${PROJECT_DIR} && ./blaze-continuous-deployment.sh >> logs/deployment.log 2>&1
EOL

# Install new crontab
crontab "${CRON_FILE}"
rm "${CRON_FILE}"

echo "✓ Production cron jobs configured"
echo ""
echo "Scheduled tasks:"
echo "  • System test: Daily at 2 AM"
echo "  • Readiness updates: Every 10 minutes" 
echo "  • Full deployment: Every 4 hours"
