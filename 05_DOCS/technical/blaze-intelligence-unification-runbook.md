# Blaze Intelligence Unified Platform Runbook

This runbook turns the prior integration plan into a concrete deployment recipe for consolidating the Blaze-branded experiences under `blazeintelligence.com`. It documents the target architecture, required configs, and the operational steps needed to ship the cut-over with Cloudflare, Netlify, and the MCP sports-data connectors.

---

## 1. Traffic control & hosting responsibilities

| Layer | Responsibility | Notes |
| ----- | -------------- | ----- |
| **Cloudflare** | DNS, TLS termination, WAF, Zero Trust, Bulk Redirects, Workers/Durable Objects, Queues, R2, KV, Workers AI | All legacy domains must be proxied through Cloudflare for redirects and security. Use Durable Objects for stateful WebSockets and Workers AI for lightweight posture/micro-expression inference. |
| **Netlify** | Next.js app shell (marketing + dashboards), ISR/SSR, Edge Functions (short-lived SSE), Netlify Connect | Ideal for high-performance static + incremental revalidation. Edge functions support SSE but not long-lived WebSockets, so real-time routes terminate on Cloudflare Workers. |

Route layout once the domain is delegated:

```
blazeintelligence.com (proxied via Cloudflare)
├── /                → Netlify Next.js (marketing + nav shell)
├── /nil/*           → Netlify (NIL + recruiting dashboards backed by Netlify Connect)
├── /coach/preview   → Netlify Edge Function (short SSE preview stream)
├── /coach/*         → Cloudflare Worker (Neural Coach live inference + Workers AI)
├── /rt/*            → Cloudflare Worker + Durable Objects (Pressure Terminal websockets)
└── /api/v1/*        → Cloudflare Worker (MCP gateway, caching, rate limits)
```

For future consolidation you can host the Next.js app on Cloudflare Pages (Next-on-Pages) without changing client routes.

---

## 2. Monorepo layout & build orchestration

Organise the unified platform as a pnpm/Turborepo workspace:

```
apps/
  web/            # Next.js front-end deployed on Netlify
  realtime/       # Cloudflare Worker bundle (Durable Objects + API gateway)
packages/
  ui/             # Shared React component library (cards, charts, nav)
  charts/         # Reusable visualisations (radar, donut, NIL boards)
  mcp-sdk/        # Typed wrappers around MCP sports-data connectors
```

Key build expectations:

* Configure Netlify to run `pnpm -r build --filter web` so only the app bundle is produced during web deploys.
* Use Cloudflare `wrangler` with the workspace filter `pnpm -r build --filter realtime` for Worker releases.
* Add a `deploy` pipeline that publishes the Netlify site first, validates, then flips DNS and Workers `routes` via Terraform or Wrangler.

---

## 3. Drop-in configuration templates

Ready-to-upload configs live in `config/infrastructure/`:

1. **Cloudflare Bulk Redirects** → [`config/infrastructure/cloudflare-bulk-redirects.csv`](../../config/infrastructure/cloudflare-bulk-redirects.csv)  
   Import into a Bulk Redirects list and attach a rule once DNS is proxied. Maintains SEO for the legacy Pages/Netlify domains and directs Neural Coach traffic to `/coach/`.

2. **Netlify platform config** → [`config/infrastructure/netlify-blaze-platform.example.toml`](../../config/infrastructure/netlify-blaze-platform.example.toml)  
   Sets the Next.js build command, registers the Edge Function, and enforces admin JWT gating. Copy into the site settings (`netlify.toml`) when migrating.

3. **Cloudflare Workers + Durable Objects** → [`config/infrastructure/wrangler-blaze-realtime.example.toml`](../../config/infrastructure/wrangler-blaze-realtime.example.toml)  
   Provides the Worker bindings for Durable Objects, Queues, KV, R2, and Workers AI. Update IDs/bucket names after resources are created.

4. **Netlify Edge Function (SSE preview)** → [`config/infrastructure/netlify-edge/coach-preview.ts`](../../config/infrastructure/netlify-edge/coach-preview.ts)  
   Returns a heartbeat stream suitable for product previews or demos while the long-lived `/rt/ws` websocket is handled by Cloudflare.

5. **Cloudflare Worker example** → [`config/infrastructure/cloudflare-room-worker.ts`](../../config/infrastructure/cloudflare-room-worker.ts)  
   Durable Object implementation that multiplexes websocket sessions and forwards MCP API calls. Use as the seed for `apps/realtime`.

---

## 4. MCP integration & data flows

* **Gateway Worker** exposes canonical routes: `/api/v1/live-scores`, `/api/v1/championship-dashboard`, `/api/v1/neural-coach/report`. The Worker proxies to your MCP connectors, caches hot responses in Workers KV (`CACHE` binding), and publishes change events to Cloudflare Queues (`EVENTS`).
* **Netlify Connect** aggregates non-real-time content (CMS pages, NIL valuation tables, recruiting bios). It edge-caches the GraphQL API so the Next.js site can prefetch data during static generation or server components.
* **Durable Objects** maintain real-time rooms per game or user session. They persist session state, broadcast updates, and can replay the latest snapshot for reconnecting clients by reading from KV or D1.
* **Workers AI** (via the `AI` binding) hosts lightweight models (pose detection, micro-expression classification). For heavier inference (video streams), offload to a GPU microservice and keep the WS fabric in Workers.

---

## 5. Security, privacy & compliance

* **Biometric processing** (Neural Coach) is subject to Texas CUBI (§503.001) and potentially Illinois BIPA / GDPR Article 9. Build explicit consent flows, purpose limitation notices, and retention jobs that purge biometric artifacts ≤ 1 year after purpose completion.
* Enforce **Zero Trust** on `/coach/*` and `/rt/*` via Cloudflare Access. Marketing pages remain public; admin/ops areas on Netlify use JWT role checks (see Netlify config template).
* Harden headers: HSTS (2 years, preload), CSP, frame-ancestors self.
* Encrypt data at rest in R2/D1, audit queue payloads, and sign MCP webhook events.

---

## 6. Observability & SLOs

* Enable Workers **Logpush → R2** for cost-effective log retention and centralise dashboards (queue lag, websocket concurrency, ISR revalidations).
* Add Netlify **Log Drains** to Datadog/New Relic for consistent monitoring.
* Target SLOs: p95 websocket connect < 250 ms, metric propagation < 120 ms, ISR revalidation < 5 s, MCP gateway success rate ≥ 99.5%.

---

## 7. Cut-over checklist

1. **Domain delegation** – Point `blazeintelligence.com` to Cloudflare, set SSL mode to *Full (strict)*, enable HTTP/3, and pre-warm certificate issuance.
2. **Bulk redirects** – Upload the CSV, test with `https://blaze-io.pages.dev/cdn-cgi/trace` to confirm the host is proxied and the redirect fires.
3. **Bootstrap repositories** – Scaffold `apps/web`, `apps/realtime`, and workspace packages as outlined. Wire pnpm scripts (`build:web`, `deploy:realtime`).
4. **Netlify deploy** – Import the repo, apply the example `netlify.toml`, attach Edge Function, configure environment variables (Connect token, analytics IDs).
5. **Cloudflare Worker deploy** – Configure bindings per `wrangler` template, publish the Worker, and attach routes `/rt/*`, `/coach/*`, `/api/v1/*`.
6. **Data plumbing** – Connect MCP connectors to the gateway, set KV TTLs (e.g., 5 s for scoreboard), and confirm event fan-out to Queues.
7. **Access controls** – Enforce Cloudflare Access policies, verify Netlify JWT-based redirects for `/admin`.
8. **Compliance gating** – Launch consent modals, update privacy policy, schedule retention Lambda/Worker CRON (daily) to purge stale biometrics.
9. **Testing** – Run Cypress for nav/flows, k6 for `/api/v1/live-scores`, chaos test queue consumer failover, and manual SSE/WS reconnection tests.
10. **Launch** – Switch marketing DNS, monitor analytics, and keep a rollback plan (disable Bulk Redirect rule + revert Worker routes) ready.

---

## 8. Immediate next actions

1. Confirm the production domain and update Cloudflare DNS.
2. Commit the Netlify build migration (`netlify.toml`) using the example template.
3. Stand up the Worker skeleton from `cloudflare-room-worker.ts` with logging to R2.
4. Wire MCP connectors into the Worker gateway and validate response schemas against the existing dashboards.
5. Schedule time with compliance counsel to finalise biometric consent + retention language.

Document owners should update this runbook after each major environment change.
