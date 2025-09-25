export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Auth helpers
    const apiKey = req.headers.get("X-API-Key");
    const runnerKey = req.headers.get("X-Runner-Key");

    // Utilities
    const json = (obj, status=200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
    const bad = (msg, status=400) => json({ ok: false, error: msg }, status);

    // Route: POST /api/render  (site -> enqueue job)
    if (method === "POST" && path === "/api/render") {
      if (!apiKey || apiKey !== (await env.API_KEY)) return bad("unauthorized", 401);
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return bad("invalid JSON body");

      // Enhanced spec validation for sports render types
      const { type, team, text, colors, sport, player, weather, timeOfDay, crowdDensity,
              moment, visualizationType, datasets, outcomes, confidence } = body;

      if (!type) return bad("missing spec.type");

      // Validate sports-specific render types
      const validTypes = [
        'championship-stadium', 'player-spotlight', 'analytics-visualization',
        'game-moment', 'monte-carlo-simulation', 'reel', 'package', 'highlight'
      ];

      if (!validTypes.includes(type)) {
        return bad(`invalid render type: ${type}`);
      }

      // Type-specific validation
      if (type === 'championship-stadium' && !sport) return bad("missing sport for stadium render");
      if (type === 'player-spotlight' && !player) return bad("missing player for spotlight render");
      if (type === 'analytics-visualization' && !datasets) return bad("missing datasets for analytics");
      if (type === 'monte-carlo-simulation' && !outcomes) return bad("missing outcomes for simulation");
      const id = crypto.randomUUID();
      const now = Date.now();
      const spec = JSON.stringify(body);
      await env.BSI_DB.exec(`INSERT INTO jobs (id, status, spec, created_at, updated_at) VALUES (?, 'queued', ?, ?, ?);`, [id, spec, now, now]);
      return json({ ok: true, id });
    }

    // Route: GET /api/render/status?id=...
    if (method === "GET" && path === "/api/render/status") {
      const id = url.searchParams.get("id");
      if (!id) return bad("missing id");
      const { results } = await env.BSI_DB.exec(`SELECT id, status, r2_key, error, created_at, updated_at, duration_s FROM jobs WHERE id = ?;`, [id]);
      if (!results || !results.length) return bad("not found", 404);
      const row = results[0];
      return json({ ok: true, ...row });
    }

    // Route: GET /api/render/next (runner -> claim 1 job)
    if (method === "GET" && path === "/api/render/next") {
      if (!runnerKey || runnerKey !== (await env.RUNNER_KEY)) return bad("unauthorized", 401);
      // Find oldest queued job
      const { results } = await env.BSI_DB.exec(`SELECT id, spec FROM jobs WHERE status='queued' ORDER BY created_at ASC LIMIT 1;`);
      if (!results || !results.length) return new Response("", { status: 204 });
      const row = results[0];
      const now = Date.now();
      await env.BSI_DB.exec(`UPDATE jobs SET status='processing', updated_at=? WHERE id=?;`, [now, row.id]);
      return json({ ok: true, id: row.id, spec: JSON.parse(row.spec) });
    }

    // Route: POST /api/render/:id/complete  (runner -> mark done)
    if (method === "POST" && path.startsWith("/api/render/") && path.endsWith("/complete")) {
      if (!runnerKey || runnerKey !== (await env.RUNNER_KEY)) return bad("unauthorized", 401);
      const id = path.split("/")[3];
      const body = await req.json().catch(() => null);
      if (!body) return bad("invalid JSON body");
      const { r2_key, duration_s } = body;
      const now = Date.now();
      await env.BSI_DB.exec(`UPDATE jobs SET status='done', r2_key=?, duration_s=?, updated_at=? WHERE id=?;`, [r2_key || null, duration_s || null, now, id]);
      return json({ ok: true, id });
    }

    // Route: POST /api/render/:id/fail  (runner -> mark failed)
    if (method === "POST" && path.startsWith("/api/render/") && path.endsWith("/fail")) {
      if (!runnerKey || runnerKey !== (await env.RUNNER_KEY)) return bad("unauthorized", 401);
      const id = path.split("/")[3];
      const body = await req.json().catch(() => null);
      const reason = (body && body.reason) || "error";
      const now = Date.now();
      await env.BSI_DB.exec(`UPDATE jobs SET status='failed', error=?, updated_at=? WHERE id=?;`, [reason, now, id]);
      return json({ ok: true, id });
    }

    return new Response("Not found", { status: 404 });
  }
}