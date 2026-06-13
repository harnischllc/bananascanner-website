/**
 * Cloudflare Worker for bananascanner.com.
 *
 * The site itself is static Astro served from ./dist. This Worker exists only
 * to add the Go Bananas anonymous corrections endpoint. `run_worker_first` in
 * wrangler.jsonc scopes it to /api/*, so every other path is served straight
 * from the static assets and never reaches this code. The ASSETS delegate at
 * the bottom is a defensive fallback only.
 *
 * POST /api/corrections stores one row in D1. No photo, no account, no device
 * id. The sender is lib/corrections.ts in the mobile app.
 */
interface D1Like {
  prepare(query: string): {
    bind(...values: unknown[]): { run(): Promise<unknown> };
  };
}

interface Env {
  DB: D1Like;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const STAGES = new Set([1, 2, 3, 4, 5, 6, 7]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/corrections') {
      if (request.method !== 'POST') {
        return json({ error: 'method not allowed' }, 405);
      }

      // Reject non-JSON or oversized bodies before parsing. A real correction
      // is a few hundred bytes; this caps wasted work on a hostile body hitting
      // an unauthenticated endpoint.
      const contentType = request.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return json({ error: 'expected application/json' }, 415);
      }
      if (Number(request.headers.get('content-length') ?? 0) > 2048) {
        return json({ error: 'too large' }, 413);
      }

      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return json({ error: 'bad json' }, 400);
      }

      const predicted = Number(body.predictedStage);
      const corrected = Number(body.correctedStage);
      const hue = Number(body.hue);

      if (!STAGES.has(predicted) || !STAGES.has(corrected)) {
        return json({ error: 'invalid stage' }, 400);
      }
      if (!Number.isFinite(hue) || hue < 0 || hue > 360) {
        return json({ error: 'invalid hue' }, 400);
      }

      const confidenceRaw = Number(body.confidence);
      const confidence = Number.isFinite(confidenceRaw)
        ? Math.max(0, Math.min(100, Math.round(confidenceRaw)))
        : null;
      const demo = body.demo === true ? 1 : 0;
      const appVersion =
        typeof body.appVersion === 'string'
          ? body.appVersion.slice(0, 24)
          : 'unknown';
      const clientTs =
        typeof body.ts === 'string' ? body.ts.slice(0, 40) : null;

      try {
        await env.DB.prepare(
          `INSERT INTO corrections
             (predicted_stage, corrected_stage, hue, confidence, demo, app_version, client_ts)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(predicted, corrected, Math.round(hue), confidence, demo, appVersion, clientTs)
          .run();
      } catch {
        return json({ error: 'store failed' }, 500);
      }

      return json({ ok: true }, 200);
    }

    // Not an API route. Normally unreachable because run_worker_first scopes
    // this Worker to /api/*; kept as a safety net.
    return env.ASSETS.fetch(request);
  },
};

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
