// InvestFi 1inch proxy
//
// Holds the 1inch API key server-side and adds CORS so the browser can call it.
// Path scheme mirrors 1inch directly:
//
//   GET  /<chainId>/quote?src=...&dst=...&amount=...
//   GET  /<chainId>/swap?src=...&dst=...&amount=...&from=...
//   GET  /<chainId>/approve/transaction?tokenAddress=...&amount=...
//   GET  /<chainId>/approve/allowance?tokenAddress=...&walletAddress=...
//   GET  /<chainId>/approve/spender
//
// Deploy with:
//   wrangler secret put ONEINCH_API_KEY   # paste the 1inch portal key
//   wrangler deploy

const ALLOWED = new Set([
  "quote",
  "swap",
  "approve/transaction",
  "approve/allowance",
  "approve/spender",
]);

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "*";

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (req.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: cors(origin),
      });
    }

    const url = new URL(req.url);

    // Health check
    if (url.pathname === "/" || url.pathname === "/healthz") {
      return new Response(JSON.stringify({ ok: true, service: "investfi-1inch-proxy" }), {
        headers: { ...cors(origin), "Content-Type": "application/json" },
      });
    }

    // Path: /<chainId>/<endpoint>
    const m = url.pathname.match(/^\/(\d+)\/(.+)$/);
    if (!m) {
      return new Response(JSON.stringify({ error: "bad path" }), {
        status: 400,
        headers: { ...cors(origin), "Content-Type": "application/json" },
      });
    }
    const chainId = m[1];
    const endpoint = m[2].replace(/^\/+|\/+$/g, "");

    if (!ALLOWED.has(endpoint)) {
      return new Response(JSON.stringify({ error: "endpoint not allowed" }), {
        status: 403,
        headers: { ...cors(origin), "Content-Type": "application/json" },
      });
    }

    if (!env.ONEINCH_API_KEY) {
      return new Response(JSON.stringify({ error: "ONEINCH_API_KEY not configured" }), {
        status: 500,
        headers: { ...cors(origin), "Content-Type": "application/json" },
      });
    }

    const target = `https://api.1inch.dev/swap/v6.0/${chainId}/${endpoint}${url.search}`;

    const upstream = await fetch(target, {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
        Accept: "application/json",
      },
      // 1inch responses are small; quotes change second-to-second so we don't cache.
      cf: { cacheTtl: 0 },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...cors(origin),
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  },
};
