# Blaze Intelligence Platform

Modernized Blaze Intelligence repository with a focused TypeScript API surface, reproducible tooling, and a clean project layout.

## What lives here

| Area | Description |
| --- | --- |
| `src/server` | Express API (TypeScript) with ESPN scoreboard integration, health probes, and caching. |
| `tests/server` | Vitest coverage for the scoreboard service and routing layer. |
| `dist`, `site`, etc. | Legacy static assets preserved for reference. |

## Getting started

```bash
# Install Node dependencies
npm install

# Type-check and compile to build/
npm run build

# Run the API locally on http://localhost:5000
npm run dev

# Execute ESLint + type-aware rules
npm run lint

# Execute Vitest suite (includes coverage)
npm test
```

Environment variables are validated with Zod. Create a `.env.development` file when you need to override defaults.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | HTTP listener port |
| `ESPN_TIMEOUT_MS` | `8000` | Timeout for upstream ESPN requests |
| `SCOREBOARD_TTL_MS` | `900000` (15 minutes) | Cache TTL for scoreboard responses |

## API surface

### `GET /healthz`
Lightweight readiness check returning service metadata.

### `GET /readyz`
Reports cache metadata for every supported sport.

### `GET /api/scoreboard`
Returns supported sport slugs and cache state.

### `GET /api/scoreboard/:sport`
Fetches the current scoreboard for one sport. Supported values:

1. `baseball`
2. `football`
3. `basketball`
4. `track-field`

When ESPN data is unavailable the service transparently returns curated fallback data in the same order (Baseball → Football → Basketball → Track & Field).

## Project conventions

- TypeScript strict mode – no `any`, leverage explicit types.
- Express middleware kept composable; expose `createApp` for tests.
- Runtime validation via Zod for configuration and external payloads.
- Tests live next to the domain (`tests/server`) and exercise both service and routing code paths.
- ESLint (with `@typescript-eslint`) and Vitest run in CI / locally via npm scripts.

## Legacy assets

Historical automation scripts, HTML experiments, and research data are retained but not part of the active build. Future clean-up work should migrate anything still relevant into a dedicated package (for example `apps/web` or `apps/automation`).
