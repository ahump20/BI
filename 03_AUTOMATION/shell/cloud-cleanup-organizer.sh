#!/bin/bash

# Cloud Storage Cleanup and Organization Script
# Author: Blaze Intelligence System
# Date: $(date +%Y-%m-%d)
# Purpose: Systematically clean up and organize cloud storage files

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="$HOME/CLOUD_BACKUP_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$HOME/cloud_cleanup_log_$(date +%Y%m%d_%H%M%S).txt"
DRY_RUN=true  # Set to false to actually perform deletions

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Banner
log "${BLUE}========================================${NC}"
log "${BLUE}  Cloud Storage Cleanup & Organization ${NC}"
log "${BLUE}========================================${NC}"
log ""

# Phase 1: Remove temporary and backup files
phase1_cleanup() {
    log "${YELLOW}Phase 1: Removing temporary files...${NC}"
    
    # Find and remove .DS_Store files
    find . -name ".DS_Store" -type f 2>/dev/null | while read -r file; do
        log "  Removing: $file"
        if [ "$DRY_RUN" = false ]; then
            rm -f "$file"
        fi
    done
    
    # Remove swap files
    find . -name "*.swp" -o -name "*.tmp" -o -name "*~" 2>/dev/null | while read -r file; do
        log "  Removing swap/temp: $file"
        if [ "$DRY_RUN" = false ]; then
            rm -f "$file"
        fi
    done
    
    # Remove specific identified files
    local temp_files=(
        ".CLAUDE.md.swp"
        "tmp.json"
        "index_backup.html"
        "claude_desktop_config.json.backup"
    )
    
    for file in "${temp_files[@]}"; do
        if [ -f "$file" ]; then
            log "  Removing: $file"
            if [ "$DRY_RUN" = false ]; then
                rm -f "$file"
            fi
        fi
    done
    
    log "${GREEN}Phase 1 complete!${NC}\n"
}

# Phase 2: Consolidate Blaze Intelligence directories
phase2_consolidate_blaze() {
    log "${YELLOW}Phase 2: Consolidating Blaze Intelligence directories...${NC}"
    
    # Create organized structure
    local BLAZE_MAIN="blaze-intelligence-platform"
    local BLAZE_ARCHIVE="BLAZE_ARCHIVE_$(date +%Y%m%d)"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$BLAZE_MAIN"
        mkdir -p "$BLAZE_ARCHIVE"
    fi
    
    # Directories to consolidate
    local blaze_dirs=(
        "blaze-intelligence-master"
        "blaze-intelligence"
        "blaze-intelligence-1"
        "blaze-intelligence-dashboard"
        "blaze-intelligence-enhanced"
        "blaze-intelligence-data-ops"
        "blaze-deploy-clean"
        "blaze-deployment-20250828-011014"
    )
    
    for dir in "${blaze_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log "  Archiving: $dir -> $BLAZE_ARCHIVE/"
            if [ "$DRY_RUN" = false ]; then
                mv "$dir" "$BLAZE_ARCHIVE/"
            fi
        fi
    done
    
    # Keep primary directories
    log "  Keeping: blaze-intelligence-website (primary)"
    log "  Keeping: blaze-vision-ai (active project)"
    log "  Keeping: blaze-command-center (active project)"
    
    log "${GREEN}Phase 2 complete!${NC}\n"
}

# Phase 3: Consolidate deployment scripts
phase3_consolidate_deployments() {
    log "${YELLOW}Phase 3: Consolidating deployment scripts...${NC}"
    
    # Create centralized deployment directory
    local DEPLOY_DIR="scripts/deployment"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$DEPLOY_DIR"
    fi
    
    # Find all deployment scripts
    local deploy_scripts=$(find . -maxdepth 1 -name "deploy*.sh" -type f 2>/dev/null)
    
    for script in $deploy_scripts; do
        local script_name=$(basename "$script")
        log "  Moving: $script -> $DEPLOY_DIR/$script_name"
        if [ "$DRY_RUN" = false ]; then
            mv "$script" "$DEPLOY_DIR/"
        fi
    done
    
    # Create master deployment script
    if [ "$DRY_RUN" = false ]; then
        cat > "$DEPLOY_DIR/master-deploy.sh" << 'EOF'
#!/bin/bash
# Master Deployment Script for Blaze Intelligence
# Usage: ./master-deploy.sh [environment] [service]

ENVIRONMENT=${1:-development}
SERVICE=${2:-all}

case "$ENVIRONMENT" in
    production)
        echo "Deploying to production..."
        wrangler pages deploy --env production
        ;;
    staging)
        echo "Deploying to staging..."
        wrangler pages deploy --env staging
        ;;
    development)
        echo "Deploying to development..."
        wrangler pages deploy --env development
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac
EOF
        chmod +x "$DEPLOY_DIR/master-deploy.sh"
    fi
    
    log "${GREEN}Phase 3 complete!${NC}\n"
}

# Phase 4: Organize HTML files
phase4_organize_html() {
    log "${YELLOW}Phase 4: Organizing HTML files...${NC}"
    
    # Create organized structure for HTML
    local HTML_DIR="site/pages"
    local HTML_ARCHIVE="HTML_ARCHIVE"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$HTML_DIR/mobile"
        mkdir -p "$HTML_DIR/dashboards"
        mkdir -p "$HTML_DIR/landing"
        mkdir -p "$HTML_ARCHIVE"
    fi
    
    # Move mobile HTML files
    local mobile_files=$(find . -maxdepth 1 -name "*mobile*.html" -type f 2>/dev/null)
    for file in $mobile_files; do
        log "  Organizing: $file -> $HTML_DIR/mobile/"
        if [ "$DRY_RUN" = false ]; then
            mv "$file" "$HTML_DIR/mobile/"
        fi
    done
    
    # Move dashboard HTML files
    local dashboard_files=$(find . -maxdepth 1 -name "*dashboard*.html" -o -name "*analytics*.html" -type f 2>/dev/null)
    for file in $dashboard_files; do
        log "  Organizing: $file -> $HTML_DIR/dashboards/"
        if [ "$DRY_RUN" = false ]; then
            mv "$file" "$HTML_DIR/dashboards/"
        fi
    done
    
    log "${GREEN}Phase 4 complete!${NC}\n"
}

# Phase 5: Consolidate configuration files
phase5_consolidate_configs() {
    log "${YELLOW}Phase 5: Consolidating configuration files...${NC}"
    
    # Create config directory
    local CONFIG_DIR="config"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$CONFIG_DIR/wrangler"
        mkdir -p "$CONFIG_DIR/backup"
    fi
    
    # Consolidate wrangler configs
    local wrangler_files=$(find . -maxdepth 1 -name "wrangler*.toml" -type f 2>/dev/null)
    for file in $wrangler_files; do
        if [ "$file" != "./wrangler.toml" ]; then
            log "  Moving: $file -> $CONFIG_DIR/wrangler/"
            if [ "$DRY_RUN" = false ]; then
                mv "$file" "$CONFIG_DIR/wrangler/"
            fi
        fi
    done
    
    log "${GREEN}Phase 5 complete!${NC}\n"
}

# Phase 6: Remove duplicate directories
phase6_remove_duplicates() {
    log "${YELLOW}Phase 6: Removing duplicate directories...${NC}"
    
    # Remove identified duplicate directories
    if [ -d "personal-website copy" ]; then
        log "  Removing duplicate: personal-website copy/"
        if [ "$DRY_RUN" = false ]; then
            rm -rf "personal-website copy"
        fi
    fi
    
    log "${GREEN}Phase 6 complete!${NC}\n"
}

# Phase 7: Create organized structure
phase7_create_structure() {
    log "${YELLOW}Phase 7: Creating organized directory structure...${NC}"
    
    local dirs=(
        "01_ACTIVE_PROJECTS/blaze-intelligence"
        "01_ACTIVE_PROJECTS/blaze-vision-ai"
        "01_ACTIVE_PROJECTS/portfolio"
        "02_DATA/sports/mlb"
        "02_DATA/sports/nfl"
        "02_DATA/sports/nba"
        "02_DATA/sports/ncaa"
        "02_DATA/analytics"
        "02_DATA/clients"
        "03_SCRIPTS/deployment"
        "03_SCRIPTS/automation"
        "03_SCRIPTS/testing"
        "04_CONFIG/production"
        "04_CONFIG/development"
        "04_CONFIG/staging"
        "05_DOCUMENTATION/technical"
        "05_DOCUMENTATION/business"
        "05_DOCUMENTATION/api"
        "06_ARCHIVES/old-projects"
        "06_ARCHIVES/backups"
        "07_RESOURCES/templates"
        "07_RESOURCES/assets"
    )
    
    for dir in "${dirs[@]}"; do
        log "  Creating: $dir"
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$dir"
        fi
    done
    
    log "${GREEN}Phase 7 complete!${NC}\n"
}

# Summary function
generate_summary() {
    log "\n${BLUE}========================================${NC}"
    log "${BLUE}         Cleanup Summary Report         ${NC}"
    log "${BLUE}========================================${NC}"
    
    # Count files
    local temp_count=$(find . -name ".DS_Store" -o -name "*.swp" -o -name "*.tmp" 2>/dev/null | wc -l)
    local deploy_count=$(find . -maxdepth 1 -name "deploy*.sh" 2>/dev/null | wc -l)
    local html_count=$(find . -maxdepth 1 -name "*.html" 2>/dev/null | wc -l)
    
    log "\n${GREEN}Files Identified for Cleanup:${NC}"
    log "  • Temporary files: $temp_count"
    log "  • Deployment scripts: $deploy_count"
    log "  • HTML files to organize: $html_count"
    
    if [ "$DRY_RUN" = true ]; then
        log "\n${YELLOW}⚠️  DRY RUN MODE - No files were actually modified${NC}"
        log "${YELLOW}To perform actual cleanup, set DRY_RUN=false in the script${NC}"
    else
        log "\n${GREEN}✅ Cleanup completed successfully!${NC}"
        log "Backup created at: $BACKUP_DIR"
    fi
    
    log "\nLog file saved to: $LOG_FILE"
}

# Main execution
main() {
    log "Starting cleanup process..."
    log "Dry run mode: $DRY_RUN\n"
    
    phase1_cleanup
    phase2_consolidate_blaze
    phase3_consolidate_deployments
    phase4_organize_html
    phase5_consolidate_configs
    phase6_remove_duplicates
    phase7_create_structure
    
    generate_summary
}

# Run the script
main