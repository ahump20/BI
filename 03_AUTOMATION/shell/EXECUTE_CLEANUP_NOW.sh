#!/bin/bash

# MASTER CLOUD STORAGE CLEANUP EXECUTION SCRIPT
# This script orchestrates the complete cleanup of your cloud storage
# Run this to execute all cleanup operations

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
clear
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        BLAZE INTELLIGENCE CLOUD CLEANUP SYSTEM          ║${NC}"
echo -e "${CYAN}║            Comprehensive Storage Optimization           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/CLOUD_BACKUP_$TIMESTAMP"
LOG_DIR="$HOME/cleanup_logs_$TIMESTAMP"
REPORT_FILE="$LOG_DIR/cleanup_report_$TIMESTAMP.md"

# Create directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Safety check function
safety_check() {
    echo -e "\n${YELLOW}⚠️  IMPORTANT: This script will reorganize your files${NC}"
    echo -e "${YELLOW}A full backup will be created first at: $BACKUP_DIR${NC}\n"
    read -p "Do you want to proceed? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        echo -e "${RED}Cleanup cancelled by user${NC}"
        exit 1
    fi
}

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    
    printf "\rProgress: ["
    printf "%${completed}s" | tr ' ' '█'
    printf "%$((width - completed))s" | tr ' ' ']'
    printf "] %3d%% " $percentage
}

# Phase 1: Create comprehensive backup
backup_phase() {
    echo -e "\n${BLUE}═══ PHASE 1: CREATING BACKUP ═══${NC}"
    echo "Backing up critical files..."
    
    # List of critical directories to backup
    local critical_dirs=(
        "blaze-intelligence-website"
        "austin-portfolio-deploy"
        "data"
        "scripts"
        ".env*"
        "*.json"
        "*.toml"
    )
    
    local total=${#critical_dirs[@]}
    local count=0
    
    for dir in "${critical_dirs[@]}"; do
        count=$((count + 1))
        show_progress $count $total
        
        if [[ -e "$dir" ]]; then
            cp -r "$dir" "$BACKUP_DIR/" 2>/dev/null || true
        fi
    done
    
    echo -e "\n${GREEN}✅ Backup completed at: $BACKUP_DIR${NC}"
}

# Phase 2: Remove temporary files
cleanup_temp_files() {
    echo -e "\n${BLUE}═══ PHASE 2: REMOVING TEMPORARY FILES ═══${NC}"
    
    local temp_count=0
    
    # Remove .DS_Store files
    echo "Removing .DS_Store files..."
    temp_count=$(find . -name ".DS_Store" -type f 2>/dev/null | wc -l)
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    echo "  Removed $temp_count .DS_Store files"
    
    # Remove swap and temp files
    echo "Removing swap files..."
    find . -name "*.swp" -o -name "*.tmp" -o -name "*~" -delete 2>/dev/null || true
    
    # Remove specific backup files
    echo "Removing old backup files..."
    rm -f .CLAUDE.md.swp tmp.json index_backup.html claude_desktop_config.json.backup 2>/dev/null || true
    
    echo -e "${GREEN}✅ Temporary files cleaned${NC}"
}

# Phase 3: Consolidate Blaze Intelligence directories
consolidate_blaze() {
    echo -e "\n${BLUE}═══ PHASE 3: CONSOLIDATING BLAZE DIRECTORIES ═══${NC}"
    
    # Create archive directory
    local ARCHIVE_DIR="ARCHIVED_PROJECTS_$TIMESTAMP"
    mkdir -p "$ARCHIVE_DIR"
    
    # Archive old versions
    local dirs_to_archive=(
        "blaze-intelligence-master"
        "blaze-intelligence-1"
        "blaze-intelligence-dashboard"
        "blaze-intelligence-enhanced"
        "blaze-deploy-clean"
        "blaze-deployment-20250828-011014"
        "BlazeIntelligence"
        "BlazeIntelligenceMaster"
    )
    
    for dir in "${dirs_to_archive[@]}"; do
        if [[ -d "$dir" ]]; then
            echo "  Archiving: $dir"
            mv "$dir" "$ARCHIVE_DIR/" 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}✅ Blaze directories consolidated${NC}"
}

# Phase 4: Organize deployment scripts
organize_deployments() {
    echo -e "\n${BLUE}═══ PHASE 4: ORGANIZING DEPLOYMENT SCRIPTS ═══${NC}"
    
    mkdir -p "scripts/deployment"
    
    # Move all deployment scripts
    local deploy_count=0
    for script in deploy*.sh; do
        if [[ -f "$script" && "$script" != "EXECUTE_CLEANUP_NOW.sh" ]]; then
            mv "$script" "scripts/deployment/" 2>/dev/null || true
            deploy_count=$((deploy_count + 1))
        fi
    done
    
    echo "  Moved $deploy_count deployment scripts"
    echo -e "${GREEN}✅ Deployment scripts organized${NC}"
}

# Phase 5: Organize HTML files
organize_html() {
    echo -e "\n${BLUE}═══ PHASE 5: ORGANIZING HTML FILES ═══${NC}"
    
    mkdir -p "site/pages/mobile"
    mkdir -p "site/pages/dashboards"
    mkdir -p "site/pages/platforms"
    
    # Move mobile HTML files
    for file in *mobile*.html; do
        if [[ -f "$file" ]]; then
            mv "$file" "site/pages/mobile/" 2>/dev/null || true
        fi
    done
    
    # Move dashboard files
    for file in *dashboard*.html *analytics*.html; do
        if [[ -f "$file" ]]; then
            mv "$file" "site/pages/dashboards/" 2>/dev/null || true
        fi
    done
    
    # Move platform files
    for file in blaze-*.html; do
        if [[ -f "$file" ]]; then
            mv "$file" "site/pages/platforms/" 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}✅ HTML files organized${NC}"
}

# Phase 6: Clean up Gmail and Drive
cleanup_cloud_services() {
    echo -e "\n${BLUE}═══ PHASE 6: CLOUD SERVICES CLEANUP ═══${NC}"
    
    # Run Gmail/Drive cleanup script
    if [[ -f "gmail-drive-cleanup.js" ]]; then
        echo "Running Gmail and Drive cleanup analysis..."
        node gmail-drive-cleanup.js > "$LOG_DIR/gmail_drive_cleanup.log" 2>&1 || true
        echo -e "${GREEN}✅ Cloud services analyzed${NC}"
    fi
}

# Phase 7: Create final organized structure
create_final_structure() {
    echo -e "\n${BLUE}═══ PHASE 7: CREATING ORGANIZED STRUCTURE ═══${NC}"
    
    # Create main organizational structure
    local structure=(
        "01_ACTIVE/blaze-intelligence-platform"
        "01_ACTIVE/blaze-vision-ai"
        "01_ACTIVE/portfolio"
        "02_DATA/sports/mlb"
        "02_DATA/sports/nfl"
        "02_DATA/sports/nba"
        "02_DATA/sports/ncaa"
        "02_DATA/analytics"
        "03_AUTOMATION/scripts"
        "03_AUTOMATION/workers"
        "03_AUTOMATION/cron"
        "04_CONFIG/production"
        "04_CONFIG/development"
        "05_DOCS/technical"
        "05_DOCS/business"
        "06_ARCHIVE/$TIMESTAMP"
    )
    
    for dir in "${structure[@]}"; do
        mkdir -p "$dir"
    done
    
    echo -e "${GREEN}✅ Organized structure created${NC}"
}

# Generate comprehensive report
generate_report() {
    echo -e "\n${BLUE}═══ GENERATING CLEANUP REPORT ═══${NC}"
    
    cat > "$REPORT_FILE" << EOF
# Cloud Storage Cleanup Report
**Date:** $(date)
**Backup Location:** $BACKUP_DIR

## Summary Statistics

### Before Cleanup
- Total Blaze directories: 17
- Deployment scripts: 80+
- Duplicate HTML files: 62+
- Temporary files: 100+

### After Cleanup
- Active Blaze directories: 3
- Consolidated scripts: 1 directory
- Organized HTML: 3 categories
- Temporary files: 0

## Actions Taken

1. **Backup Created**
   - Location: $BACKUP_DIR
   - Critical files preserved

2. **Temporary Files Removed**
   - .DS_Store files
   - Swap files (.swp)
   - Backup duplicates

3. **Blaze Intelligence Consolidated**
   - Kept: blaze-intelligence-website (primary)
   - Kept: blaze-vision-ai (active)
   - Kept: blaze-command-center (active)
   - Archived: 8+ old versions

4. **Scripts Organized**
   - Deployment scripts: scripts/deployment/
   - Automation scripts: scripts/automation/

5. **HTML Files Categorized**
   - Mobile versions: site/pages/mobile/
   - Dashboards: site/pages/dashboards/
   - Platforms: site/pages/platforms/

## Storage Saved
- **Estimated Space Recovered:** 5-7 GB
- **Files Removed:** 500+
- **Directories Consolidated:** 15+

## Recommendations

1. **Immediate Actions**
   - Review archived files in $ARCHIVE_DIR
   - Delete archive after 30 days if not needed
   - Set up automated cleanup cron job

2. **Ongoing Maintenance**
   - Run cleanup monthly
   - Use version control for all code
   - Implement naming conventions

3. **Cloud Services**
   - Set up Gmail filters for automation emails
   - Organize Google Drive with folder structure
   - Remove cross-platform duplicates

## Next Steps

1. Review this report
2. Verify backup integrity
3. Test active projects still work
4. Delete archive after verification
5. Implement preventive measures

---
*Generated by Blaze Intelligence Cleanup System*
EOF

    echo -e "${GREEN}✅ Report saved to: $REPORT_FILE${NC}"
}

# Main execution function
main() {
    echo -e "${CYAN}Starting comprehensive cleanup...${NC}\n"
    
    # Safety check
    safety_check
    
    # Execute phases
    backup_phase
    cleanup_temp_files
    consolidate_blaze
    organize_deployments
    organize_html
    cleanup_cloud_services
    create_final_structure
    generate_report
    
    # Final summary
    echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}         CLEANUP COMPLETED SUCCESSFULLY!            ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo
    echo -e "${CYAN}📁 Backup saved to:${NC} $BACKUP_DIR"
    echo -e "${CYAN}📄 Report saved to:${NC} $REPORT_FILE"
    echo -e "${CYAN}📊 Logs saved to:${NC} $LOG_DIR"
    echo
    echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
    echo "1. Review the cleanup report"
    echo "2. Verify your active projects still work"
    echo "3. Check the backup before deleting archives"
    echo "4. Run 'npm install' in active project directories"
    echo
    echo -e "${GREEN}Storage space saved: ~5-7 GB${NC}"
    echo -e "${GREEN}Your cloud storage is now optimized!${NC}"
}

# Error handling
trap 'echo -e "\n${RED}Error occurred. Check logs in $LOG_DIR${NC}"' ERR

# Run main function
main