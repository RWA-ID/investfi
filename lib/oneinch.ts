// 1inch v6 swap API client.
//
// We route through a Cloudflare Worker proxy when NEXT_PUBLIC_1INCH_PROXY_URL
// is set — required for the browser, since api.1inch.dev does not send CORS
// headers. The legacy direct path with NEXT_PUBLIC_1INCH_API_KEY is kept as a
// fallback for server-side calls (build-time fetches in app/page.tsx, etc.).
//
// See worker/README.md for the proxy deploy steps.

const PROXY = (process.env.NEXT_PUBLIC_1INCH_PROXY_URL ?? "").replace(/\/+$/, "");
const DIRECT_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY ?? "";

export type OneInchEndpoint =
  | "quote"
  | "swap"
  | "approve/allowance"
  | "approve/transaction"
  | "approve/spender";

export function oneInchUrl(
  chainId: number,
  endpoint: OneInchEndpoint,
  params: Record<string, string | number>
): { url: string; headers: Record<string, string> } {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();

  if (PROXY) {
    return { url: `${PROXY}/${chainId}/${endpoint}?${qs}`, headers: { Accept: "application/json" } };
  }
  return {
    url: `https://api.1inch.dev/swap/v6.0/${chainId}/${endpoint}?${qs}`,
    headers: { Accept: "application/json", Authorization: `Bearer ${DIRECT_KEY}` },
  };
}

export function isOneInchConfigured(): boolean {
  return Boolean(PROXY || DIRECT_KEY);
}
