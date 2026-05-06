export type Chain =
  | "Ethereum"
  | "Arbitrum"
  | "Base"
  | "Optimism"
  | "Polygon"
  | "Avalanche"
  | "Solana";

export type StrategyType =
  | "Lending"
  | "Staking"
  | "LP"
  | "Structured"
  | "Liquid Staking"
  | "RWA";

export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export interface RiskBreakdown {
  smartContract: number; // 0-10
  tokenVolatility: number;
  impermanentLoss: number;
  liquidityDepth: number;
  protocolReputation: number;
}

export interface HistoricalAPY {
  date: string;
  apy: number;
}

export interface Opportunity {
  id: string;
  protocol: string;
  protocolLogo: string;
  chain: Chain;
  strategyType: StrategyType;
  baseAPY: number;
  incentiveAPY: number;
  totalAPY: number;
  tvl: number; // in USD
  riskScore: number; // 1-10
  riskLevel: RiskLevel;
  riskBreakdown: RiskBreakdown;
  liquidityDepth: number; // in USD
  volatility30d: number; // percentage
  yieldSource: string;
  bestUseCase: string;
  audited: boolean;
  auditFirms: string[];
  contractAge: number; // months
  historicalAPY: HistoricalAPY[];
  comparables: string[]; // IDs of comparable opportunities
  tags: string[];
  url: string;
}
