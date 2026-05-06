// DeFiLlama free API — https://yields.llama.fi
// All endpoints: no auth, no API key needed

const BASE = "https://yields.llama.fi";

export interface LlamaPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  apyMean30d: number | null;
  sigma: number | null;   // volatility proxy
  mu: number | null;      // mean APY
  ilRisk: "yes" | "no" | "null" | null;
  exposure: "single" | "multi" | null;
  rewardTokens: string[] | null;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  } | null;
  count: number | null;   // data point count — proxy for protocol age
  il7d: number | null;
  outlier: boolean;
}

export interface LlamaChartPoint {
  timestamp: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
}

export async function fetchPoolsByIds(poolIds: string[]): Promise<Map<string, LlamaPool>> {
  // Fetch without Next.js cache (payload is 18MB — too large for the data cache).
  // Revalidation is handled at the page level via `export const revalidate`.
  const res = await fetch(`${BASE}/pools`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`DeFiLlama pools fetch failed: ${res.status}`);
  const json = await res.json();
  const all = json.data as LlamaPool[];

  // Filter immediately — never hold the full 18MB payload in memory longer than needed
  const set = new Set(poolIds);
  const map = new Map<string, LlamaPool>();
  for (const p of all) {
    if (set.has(p.pool)) map.set(p.pool, p);
  }
  return map;
}

export async function fetchPoolChart(poolId: string): Promise<LlamaChartPoint[]> {
  const res = await fetch(`${BASE}/chart/${poolId}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`DeFiLlama chart fetch failed for ${poolId}: ${res.status}`);
  const json = await res.json();
  return (json.data as LlamaChartPoint[]).filter((p) => !isNaN(p.apy));
}
