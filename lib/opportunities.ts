// Server-side data fetcher — merges live DeFiLlama data with static enrichment.
// Falls back to mock data if the API is unreachable.

import { fetchPoolsByIds } from "./defillama";
import { POOL_ENRICHMENTS, POOL_IDS, ENRICHMENT_BY_POOL_ID, ENRICHMENT_BY_SLUG } from "./poolMap";
import { transformPool, transformChart } from "./transform";
import { fetchPoolChart } from "./defillama";
import { computeRiskScore, riskLevel } from "./risk";
import type { Opportunity } from "./types";

// Static RWA protocols not tracked by DeFiLlama
const STATIC_OPPORTUNITIES: Opportunity[] = [
  {
    id: "backed-ibta",
    poolId: "static-backed-ibta",
    protocol: "Backed Finance",
    protocolLogo: "BK",
    chain: "Ethereum",
    strategyType: "RWA",
    baseAPY: 4.8,
    incentiveAPY: 0,
    totalAPY: 4.8,
    tvl: 85_000_000,
    riskScore: computeRiskScore({ smartContract: 2, tokenVolatility: 1.5, impermanentLoss: 1, liquidityDepth: 3.5, protocolReputation: 2 }),
    riskLevel: riskLevel(computeRiskScore({ smartContract: 2, tokenVolatility: 1.5, impermanentLoss: 1, liquidityDepth: 3.5, protocolReputation: 2 })),
    riskBreakdown: { smartContract: 2, tokenVolatility: 1.5, impermanentLoss: 1, liquidityDepth: 3.5, protocolReputation: 2 },
    liquidityDepth: 42_500_000,
    volatility30d: 0.05,
    yieldSource: "bIBTA token tracks iShares $ Treasury Bond ETF — tokenized BlackRock ETF giving on-chain T-bill exposure",
    bestUseCase: "ETF-wrapped T-bill exposure on-chain — no KYC required for secondary market, tracks iShares Treasury ETF",
    audited: true,
    auditFirms: ["Chainsecurity"],
    contractAge: 24,
    historicalAPY: [],
    comparables: ["ee457473-3b5f-4b53-8c8a-fde6b2e16c8a", "1910847a-f8b5-40ce-a1ab-1dafdded5fbb"],
    tags: ["ETF", "T-Bills", "No KYC", "BlackRock"],
    url: "https://backed.fi",
  },
  {
    id: "truefi-usdc",
    poolId: "static-truefi-usdc",
    protocol: "TrueFi",
    protocolLogo: "TF",
    chain: "Ethereum",
    strategyType: "RWA",
    baseAPY: 7.5,
    incentiveAPY: 0,
    totalAPY: 7.5,
    tvl: 120_000_000,
    riskScore: computeRiskScore({ smartContract: 3.5, tokenVolatility: 4, impermanentLoss: 1, liquidityDepth: 5, protocolReputation: 3.5 }),
    riskLevel: riskLevel(computeRiskScore({ smartContract: 3.5, tokenVolatility: 4, impermanentLoss: 1, liquidityDepth: 5, protocolReputation: 3.5 })),
    riskBreakdown: { smartContract: 3.5, tokenVolatility: 4, impermanentLoss: 1, liquidityDepth: 5, protocolReputation: 3.5 },
    liquidityDepth: 60_000_000,
    volatility30d: 0.5,
    yieldSource: "Uncollateralized USDC lending to vetted institutional borrowers — credit scoring via on-chain reputation and off-chain due diligence",
    bestUseCase: "Higher-yield institutional credit — uncollateralized lending with TRU staker backstop for risk management",
    audited: true,
    auditFirms: ["Certik", "Slowmist"],
    contractAge: 48,
    historicalAPY: [],
    comparables: ["43641cf5-a92e-416b-bce9-27113d3c0db6", "ee457473-3b5f-4b53-8c8a-fde6b2e16c8a"],
    tags: ["Credit", "Uncollateralized", "Institutional"],
    url: "https://app.truefi.io",
  },
];

// Live pool IDs (exclude static-* sentinel entries)
const LIVE_POOL_IDS = POOL_IDS.filter((id) => !id.startsWith("static-"));

export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const liveMap = await fetchPoolsByIds(LIVE_POOL_IDS);
    const results: Opportunity[] = [];

    for (const enrichment of POOL_ENRICHMENTS) {
      if (enrichment.poolId.startsWith("static-")) continue;
      const live = liveMap.get(enrichment.poolId);
      if (!live) continue;
      results.push(transformPool(live, enrichment));
    }

    // Append static protocols
    results.push(...STATIC_OPPORTUNITIES);

    return results;
  } catch (err) {
    console.error("DeFiLlama fetch failed, falling back to mock data:", err);
    const { opportunities } = await import("./data");
    return opportunities;
  }
}

export async function getOpportunityById(slug: string): Promise<Opportunity | null> {
  // Handle static entries
  const staticOpp = STATIC_OPPORTUNITIES.find((o) => o.id === slug);
  if (staticOpp) return staticOpp;

  const enrichment = ENRICHMENT_BY_SLUG.get(slug);
  if (!enrichment) return null;

  try {
    const liveMap = await fetchPoolsByIds([enrichment.poolId]);
    const live = liveMap.get(enrichment.poolId);
    if (!live) return null;

    const opp = transformPool(live, enrichment);

    const chartPoints = await fetchPoolChart(enrichment.poolId);
    opp.historicalAPY = transformChart(chartPoints);
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
    const livePoolIds = poolIds.filter((id) => !id.startsWith("static-"));
    const liveMap = await fetchPoolsByIds(livePoolIds);
    const results: Opportunity[] = [];

    for (const poolId of poolIds) {
      const staticOpp = STATIC_OPPORTUNITIES.find((o) => o.poolId === poolId);
      if (staticOpp) { results.push(staticOpp); continue; }
      const live = liveMap.get(poolId);
      const enrichment = ENRICHMENT_BY_POOL_ID.get(poolId);
      if (live && enrichment) results.push(transformPool(live, enrichment));
    }

    return results;
  } catch {
    return [];
  }
}
