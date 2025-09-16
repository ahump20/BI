# Hawk-Eye API/MCP Deployment Enhancement Guide

## Purpose of the Hawk-Eye API/MCP Server
- Provides a central API layer for the Blaze Intelligence "Hawk-Eye" tracking system.
- Exposes Machine Control Protocol (MCP) endpoints that orchestrate analytics, biometrics, and real-time data collection.
- Acts as the backend for Netlify-hosted functions and supports integrations with external sports data and AI providers.

## Required Environment Variables
| Variable | Description |
|----------|-------------|
| `CLAUDE_API_KEY` | Access key for Claude-based analysis. |
| `OPENAI_API_KEY` | Access key for OpenAI models. |
| `GOOGLE_AI_API_KEY` | Enables Gemini/Google AI features. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier for Worker resources. |
| `CLOUDFLARE_API_TOKEN` | Token used to manage Cloudflare deployments. |
| `CLOUDFLARE_ZONE_ID` | Zone identifier for DNS configuration. |
| `NODE_ENV` | Runtime environment (`development`, `production`, etc.). |
| `PORT` | Port used when running the MCP server locally. |

## Netlify Deployment
- **Domain:** `https://blaze-intelligence.netlify.app`
- **Deployment:**
  - CLI: `netlify deploy`
  - or through the GitHub → Netlify integration on push to `main`.

## Endpoint Testing Steps
| Endpoint | Test Command |
|---------|---------------|
| `/health` | `curl https://blaze-intelligence.netlify.app/.netlify/functions/health` |
| `/metrics` | `curl https://blaze-intelligence.netlify.app/.netlify/functions/metrics` |
| `/analytics` | `curl https://blaze-intelligence.netlify.app/.netlify/functions/analytics` |
| `/biometrics` | `curl -X POST -H "Content-Type: application/json" -d '{}' https://blaze-intelligence.netlify.app/.netlify/functions/biometrics` |
| `/live-data-engine` | `curl https://blaze-intelligence.netlify.app/.netlify/functions/live-data-engine` |
| `/video-analysis` | `curl -X POST --data-binary @sample.mp4 https://blaze-intelligence.netlify.app/.netlify/functions/video-analysis` |
| `/ar-coaching-engine` | `curl https://blaze-intelligence.netlify.app/.netlify/functions/ar-coaching-engine` |

Each command should return a JSON payload confirming the endpoint is operational. Replace test data as necessary for real-world validation.
