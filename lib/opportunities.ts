// Server-side data fetcher — merges live DeFiLlama data with static enrichment.
// Falls back to mock data if the API is unreachable.

import { fetchPoolsByIds } from "./defillama";
import { POOL_ENRICHMENTS, POOL_IDS, ENRICHMENT_BY_POOL_ID, ENRICHMENT_BY_SLUG } from "./poolMap";
import { transformPool, transformChart } from "./transform";
import { fetchPoolChart } from "./defillama";
import type { Opportunity } from "./types";

export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const liveMap = await fetchPoolsByIds(POOL_IDS);
    const results: Opportunity[] = [];

    for (const enrichment of POOL_ENRICHMENTS) {
      const live = liveMap.get(enrichment.poolId);
      if (!live) continue; // pool not returned by API — skip
      results.push(transformPool(live, enrichment));
    }

    return results;
  } catch (err) {
    console.error("DeFiLlama fetch failed, falling back to mock data:", err);
    // Fallback: return static mock so the page never breaks
    const { opportunities } = await import("./data");
    return opportunities;
  }
}

export async function getOpportunityById(slug: string): Promise<Opportunity | null> {
  const enrichment = ENRICHMENT_BY_SLUG.get(slug);
  if (!enrichment) return null;

  try {
    const liveMap = await fetchPoolsByIds([enrichment.poolId]);
    const live = liveMap.get(enrichment.poolId);
    if (!live) return null;

    const opp = transformPool(live, enrichment);

    // Fetch historical chart for detail page
    const chartPoints = await fetchPoolChart(enrichment.poolId);
    opp.historicalAPY = transformChart(chartPoints);

    // Resolve comparable slugs → pool IDs for display
    opp.comparables = enrichment.comparables;

    return opp;
  } catch (err) {
    console.error(`DeFiLlama detail fetch failed for ${slug}:`, err);
    const { opportunities } = await import("./data");
    return opportunities.find((o) => o.id === slug) ?? null;
  }
}

export async function getComparableOpportunities(poolIds: string[]): Promise<Opportunity[]> {
  try {
    const liveMap = await fetchPoolsByIds(poolIds);
    const results: Opportunity[] = [];
    for (const poolId of poolIds) {
      const live = liveMap.get(poolId);
      const enrichment = ENRICHMENT_BY_POOL_ID.get(poolId);
      if (live && enrichment) results.push(transformPool(live, enrichment));
    }
    return results;
  } catch {
    return [];
  }
}
