import type { RiskBreakdown, RiskLevel } from "./types";

const WEIGHTS = {
  smartContract: 0.30,
  protocolReputation: 0.25,
  tokenVolatility: 0.20,
  liquidityDepth: 0.15,
  impermanentLoss: 0.10,
};

export function computeRiskScore(breakdown: RiskBreakdown): number {
  const score =
    breakdown.smartContract * WEIGHTS.smartContract +
    breakdown.protocolReputation * WEIGHTS.protocolReputation +
    breakdown.tokenVolatility * WEIGHTS.tokenVolatility +
    breakdown.liquidityDepth * WEIGHTS.liquidityDepth +
    breakdown.impermanentLoss * WEIGHTS.impermanentLoss;

  return Math.round(score * 10) / 10;
}

export function riskLevel(score: number): RiskLevel {
  if (score <= 3) return "Low";
  if (score <= 5.5) return "Medium";
  if (score <= 7.5) return "High";
  return "Very High";
}

export function riskColor(score: number): string {
  if (score <= 3) return "text-emerald-400";
  if (score <= 5.5) return "text-amber-400";
  if (score <= 7.5) return "text-orange-400";
  return "text-red-500";
}

export function riskBg(score: number): string {
  if (score <= 3) return "bg-emerald-400/10 border-emerald-400/30";
  if (score <= 5.5) return "bg-amber-400/10 border-amber-400/30";
  if (score <= 7.5) return "bg-orange-400/10 border-orange-400/30";
  return "bg-red-500/10 border-red-500/30";
}

export function riskAdjustedYield(apy: number, riskScore: number): number {
  // Sharpe-inspired: penalize yield by risk factor
  const penalty = 1 + (riskScore - 1) * 0.12;
  return Math.round((apy / penalty) * 100) / 100;
}

export const WEIGHTS_LABELS: Record<keyof RiskBreakdown, string> = {
  smartContract: "Smart Contract Risk",
  protocolReputation: "Protocol Reputation",
  tokenVolatility: "Token Volatility",
  liquidityDepth: "Liquidity Depth",
  impermanentLoss: "Impermanent Loss Exposure",
};

export const WEIGHTS_PCT: Record<keyof RiskBreakdown, number> = {
  smartContract: 30,
  protocolReputation: 25,
  tokenVolatility: 20,
  liquidityDepth: 15,
  impermanentLoss: 10,
};
