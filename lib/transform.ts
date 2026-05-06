// Merges live DeFiLlama data with our static enrichment → Opportunity
import type { LlamaPool, LlamaChartPoint } from "./defillama";
import type { Opportunity, HistoricalAPY } from "./types";
import type { PoolEnrichment } from "./poolMap";
import { computeRiskScore, riskLevel } from "./risk";

export function transformPool(live: LlamaPool, enrichment: PoolEnrichment): Opportunity {
  const riskBreakdown = enrichment.riskBreakdown;

  // Use sigma as volatility proxy (annualized %) — fallback to 0
  const volatility30d = live.sigma != null ? Math.round(live.sigma * 100 * 100) / 100 : 0;

  // Liquidity depth: approximate as 50% of TVL (conservative)
  const liquidityDepth = live.tvlUsd * 0.5;

  // Contract age: estimate from `count` data points (each ~= 1 day)
  const contractAge = live.count != null ? Math.round(live.count / 30) : 12;

  const baseAPY = live.apyBase ?? 0;
  const incentiveAPY = live.apyReward ?? 0;
  const totalAPY = live.apy ?? baseAPY + incentiveAPY;

  const riskScore = computeRiskScore(riskBreakdown);

  return {
    id: enrichment.id,
    protocol: enrichment.protocol,
    protocolLogo: enrichment.protocolLogo,
    chain: enrichment.chain,
    strategyType: enrichment.strategyType,
    baseAPY: Math.round(baseAPY * 100) / 100,
    incentiveAPY: Math.round(incentiveAPY * 100) / 100,
    totalAPY: Math.round(totalAPY * 100) / 100,
    tvl: live.tvlUsd,
    riskScore,
    riskLevel: riskLevel(riskScore),
    riskBreakdown,
    liquidityDepth,
    volatility30d,
    yieldSource: enrichment.yieldSource,
    bestUseCase: enrichment.bestUseCase,
    audited: enrichment.audited,
    auditFirms: enrichment.auditFirms,
    contractAge,
    historicalAPY: [], // loaded separately per-pool on detail page
    comparables: enrichment.comparables,
    tags: enrichment.tags,
    url: enrichment.url,
  };
}

export function transformChart(points: LlamaChartPoint[]): HistoricalAPY[] {
  // Downsample to ~30 points (weekly) for clean chart rendering
  const step = Math.max(1, Math.floor(points.length / 30));
  return points
    .filter((_, i) => i % step === 0 || i === points.length - 1)
    .map((p) => ({
      date: p.timestamp.slice(0, 10),
      apy: Math.round(p.apy * 100) / 100,
    }));
}
