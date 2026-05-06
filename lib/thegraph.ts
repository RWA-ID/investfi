const KEY = process.env.THEGRAPH_API_KEY ?? "";
const UNISWAP_V3_SUBGRAPH = `https://gateway.thegraph.com/api/${KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;

interface PoolDayData {
  date: number;
  volumeUSD: string;
  feesUSD: string;
  tvlUSD: string;
}

interface Pool {
  id: string;
  feeTier: string;
  volumeUSD: string;
  totalValueLockedUSD: string;
  poolDayData: PoolDayData[];
}

interface SubgraphResponse {
  data?: { pools: Pool[] };
  errors?: { message: string }[];
}

export async function fetchUniswapPoolAPY(poolId: string): Promise<number | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(UNISWAP_V3_SUBGRAPH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          pools(where: { id: "${poolId}" }, first: 1) {
            id
            feeTier
            volumeUSD
            totalValueLockedUSD
            poolDayData(orderBy: date, orderDirection: desc, first: 7) {
              date
              volumeUSD
              feesUSD
              tvlUSD
            }
          }
        }`,
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const json: SubgraphResponse = await res.json();
    if (json.errors?.length || !json.data?.pools.length) return null;

    const pool = json.data.pools[0];
    const days = pool.poolDayData;
    if (!days.length) return null;

    const totalFees = days.reduce((s, d) => s + parseFloat(d.feesUSD), 0);
    const avgTVL = days.reduce((s, d) => s + parseFloat(d.tvlUSD), 0) / days.length;

    if (!avgTVL) return null;
    const apy = (totalFees / days.length) * 365 / avgTVL * 100;
    return Math.round(apy * 100) / 100;
  } catch {
    return null;
  }
}
