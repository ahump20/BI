#!/bin/bash
set -euo pipefail

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }
warn() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $*" >&2; }

log "🚀 Blaze Intelligence multi-platform deployment starting"

tasks=()

if command -v netlify >/dev/null 2>&1; then
  if [[ -n "${NETLIFY_AUTH_TOKEN:-}" && -n "${NETLIFY_SITE_ID:-}" ]]; then
    log "Deploying static site to Netlify"
    netlify deploy --prod --dir dist --message "Automated multi-target release" && tasks+=("Netlify ✅")
  else
    warn "Netlify CLI configured but NETLIFY_AUTH_TOKEN or NETLIFY_SITE_ID missing; skipping"
    tasks+=("Netlify ⚠️")
  fi
else
  warn "Netlify CLI not available; skipping"
  tasks+=("Netlify ⚠️")
fi

if command -v wrangler >/dev/null 2>&1; then
  log "Deploying Cloudflare Worker APIs"
  wrangler deploy --env production && tasks+=("Cloudflare Workers ✅")
else
  warn "Wrangler CLI not available; skipping Cloudflare deployment"
  tasks+=("Cloudflare Workers ⚠️")
fi

if command -v vercel >/dev/null 2>&1; then
  if [[ -n "${VERCEL_TOKEN:-}" ]]; then
    log "Deploying landing pages to Vercel"
    vercel deploy --prod --yes && tasks+=("Vercel ✅")
  else
    warn "Vercel CLI configured but VERCEL_TOKEN missing; skipping"
    tasks+=("Vercel ⚠️")
  fi
else
  warn "Vercel CLI not available; skipping"
  tasks+=("Vercel ⚠️")
fi

if command -v render >/dev/null 2>&1; then
  if [[ -n "${RENDER_API_KEY:-}" && -n "${RENDER_SERVICE_ID:-}" ]]; then
    log "Triggering Render backend deploy"
    render deploy service "${RENDER_SERVICE_ID}" --api-key "${RENDER_API_KEY}" && tasks+=("Render ✅")
  else
    warn "Render CLI configured but RENDER_API_KEY or RENDER_SERVICE_ID missing; skipping"
    tasks+=("Render ⚠️")
  fi
else
  warn "Render CLI not available; skipping"
  tasks+=("Render ⚠️")
fi

log "Deployment summary: ${tasks[*]}"
log "✅ Multi-platform pipeline finished"
