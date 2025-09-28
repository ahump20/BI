# bsi-unreal-mcp-bridge (Bootstrap)

Secure bridge that lets BlazeSportsIntel.com request **Unreal Engine** renders via the experimental
[unreal-mcp](https://github.com/chongdashu/unreal-mcp) server, while keeping the public site on Cloudflare (Workers + D1 + R2).

> **Status:** Production-minded scaffold with a conservative isolation model. The upstream unreal-mcp is **experimental**;
> treat the Runner as an internal tool, not internet-facing.

## Topology

- **Cloudflare Worker**: `/api/render` to enqueue jobs into **D1**, status endpoints, and runner control endpoints.
- **Runner (Windows VM)**: Polls `GET /api/render/next`, drives Unreal via **unreal_mcp_server.py** (localhost only),
  uploads results to **R2** (S3-compatible), and marks jobs complete.
- **Site**: Calls `/api/render` from authenticated admin UI; reads assets by canonical, extensionless URLs from CDN.

## Quick start

### 1) Cloudflare Worker

```bash
cd worker
# Create D1 locally and push schema
npx wrangler d1 create bsi_unreal_mcp
npx wrangler d1 execute bsi_unreal_mcp --file=./schema.sql --local
# Deploy
npx wrangler deploy
# Secrets
npx wrangler secret put API_KEY       # used by site/admin to POST jobs
npx wrangler secret put RUNNER_KEY    # used by Runner to poll/complete
```

**Endpoints**
- `POST /api/render` (Auth: `X-API-Key`) – body: `{{ type, team, text, colors, ... }}` → `{{ id }}`
- `GET /api/render/status?id=...` – returns job status & `r2_key` when `done`
- `GET /api/render/next` (Auth: `X-Runner-Key`) – claims oldest queued job
- `POST /api/render/:id/complete` (Auth: `X-Runner-Key`) – `{{ r2_key, duration_s }}`
- `POST /api/render/:id/fail` (Auth: `X-Runner-Key`) – `{{ reason }}`

### 2) Runner (Windows render node)

Requirements:
- **Unreal Engine 5.5+**
- **Python 3.12+**
- The upstream repo checked out to `C:\\unreal-mcp` (or similar) and its **Python server** running:
  ```bash
  uv --directory C:\\unreal-mcp\\Python run unreal_mcp_server.py
  ```

Install and configure Runner:
```bash
cd runner
python -m venv .venv && .venv\\Scripts\\activate
pip install -r requirements.txt
copy config.yaml.example config.yaml   # or edit config.yaml directly
# Fill: api_base, runner_key, r2 credentials, bucket, public_base
python runner.py
```

The current `call_unreal_mcp()` function is a placeholder; replace with a client call to the tools exposed by
`unreal_mcp_server.py` (fastMCP) to drive deterministic sequences (create stage, place assets, set cameras, render pipeline).

### 3) Site integration

- Admin-only modal calls the Worker:
  - `POST /api/render` with your API key.
  - Poll `GET /api/render/status?id=...` until `done`; read `r2_key` and construct public URL as `{{public_base}}/{{r2_key}}`.
- Respect display order: **Baseball, Football, Basketball, Track & Field**.

## Security notes

- Runner uses **outbound-only** calls to the Worker (no inbound ports open).
- MCP server bound to **localhost**; never exposed publicly.
- Separate `API_KEY` and `RUNNER_KEY`. Rotate regularly.
- D1 acts as a durable queue; only one job is “claimed” at a time by each runner.

## Next steps

- Swap placeholder MCP call with a proper client from the unreal-mcp repo (JSON-RPC or tool wrapper).
- Add scene “recipes” (versioned) for title cards, recruiting spotlights, and spray charts.
- Expand Worker with CF Queues if you prefer true queue semantics.