# InvestFi 1inch proxy

Cloudflare Worker that holds the 1inch API key server-side and proxies the
v6 swap API to the browser with CORS headers. Without this proxy, the
in-app Allocate flow and the Trade-of-the-Day live quote both fail
(1inch's `api.1inch.dev` does not allow direct browser calls).

## Deploy

```bash
cd worker
npm i -g wrangler                       # if not installed
wrangler login                          # opens browser
wrangler secret put ONEINCH_API_KEY     # paste the key from portal.1inch.dev
wrangler deploy
```

Wrangler prints the URL, e.g. `https://investfi-1inch-proxy.<account>.workers.dev`.

## Wire to the frontend

Add to `.env.local`:

```
NEXT_PUBLIC_1INCH_PROXY_URL=https://investfi-1inch-proxy.<account>.workers.dev
```

Rebuild the static export (`npm run build`) and the app will route
quote / swap / approve calls through the Worker.

## Endpoints

The Worker mirrors 1inch's path scheme — pass the chain id explicitly:

```
GET /1/quote?src=...&dst=...&amount=...
GET /1/swap?src=...&dst=...&amount=...&from=...&slippage=1
GET /1/approve/allowance?tokenAddress=...&walletAddress=...
GET /1/approve/transaction?tokenAddress=...&amount=...
GET /1/approve/spender
GET /healthz
```

Only the swap-related endpoints are allowed; everything else returns 403.
