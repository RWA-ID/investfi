import Link from "next/link";
import Image from "next/image";
import type { Opportunity, StrategyType } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import { formatTVL, formatAPY } from "@/lib/format";
import RiskBadge from "./RiskBadge";
import ChainBadge from "./ChainBadge";

// Map protocol id → public icon path. Drop SVGs in /public/icons/ and add a line here.
const PROTOCOL_ICONS: Record<string, string> = {
  "aave-v3-eth-usdc":  "/icons/aave.svg",
  "aave-v3-arb-usdc":  "/icons/aave.svg",
  "compound-v3-eth-usdc": "/icons/comp.svg",
  "spark-usds":        "/icons/spark.svg",
  "lido-steth":        "/icons/lido.svg",
  "rocketpool-reth":   "/icons/rpl.svg",
  "uniswap-v3-usdc-eth": "/icons/uniswap.svg",
  "curve-3pool":         "/icons/curve.svg",
  "pendle-usdg":       "/icons/pendle.svg",
  "gmx-v2-arb":        "/icons/gmx.svg",
  "morpho-steakusdc":  "/icons/morpho.svg",
  "meth-protocol":     "/icons/meth.svg",
  "ondo-usdyc":        "/icons/ondo.svg",
  "balancer-wsteth":   "/icons/balancer.svg",
  "yearn-v3-usdc":     "/icons/eth.svg",
};

const STRATEGY_BADGE: Record<StrategyType, string> = {
  Lending:          "text-sky-400/80 border-sky-400/25",
  LP:               "text-amber-400/80 border-amber-400/25",
  Structured:       "text-rose-400/80 border-rose-400/25",
  "Liquid Staking": "text-teal-400/80 border-teal-400/25",
  RWA:              "text-lime-400/80 border-lime-400/25",
  Staking:          "text-violet-400/80 border-violet-400/25",
};

interface Props {
  opp: Opportunity;
  rank: number;
  isTop?: boolean;
  revenueData?: { revenue7d: number } | null;
}

export default function OpportunityCard({ opp, rank, isTop, revenueData }: Props) {
  const ra = riskAdjustedYield(opp.totalAPY, opp.riskScore);
  const isHighYield = opp.totalAPY > 10;
  const iconPath = PROTOCOL_ICONS[opp.id];

  return (
    <Link href={`/opportunity/${opp.id}`} className="block group">
      <div className="bg-[#111820] border border-[#1E2A35] rounded-xl hover:border-[#2D4A5E] hover:shadow-lg hover:shadow-black/30 transition-all duration-200 cursor-pointer h-full flex flex-col">

        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              {/* Logo: SVG icon if available, fallback to initials */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A2736] to-[#0D1318] border border-[#1E2A35] flex items-center justify-center shrink-0 group-hover:border-[#2D4A5E] transition-colors overflow-hidden">
                {iconPath ? (
                  <Image
                    src={iconPath}
                    alt={opp.protocol}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-[#5A7A95]">{opp.protocolLogo}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[#C8D8E8] font-semibold text-[14px] leading-tight group-hover:text-white transition-colors truncate">
                  {opp.protocol}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <ChainBadge chain={opp.chain} />
                  <span className={`text-[9px] border rounded px-1.5 py-0.5 ${STRATEGY_BADGE[opp.strategyType]}`}>
                    {opp.strategyType.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[9px] text-[#3D5166]">#{rank}</span>
              {isTop && (
                <span className="text-[8px] bg-sky-400/10 border border-sky-400/30 text-sky-400 px-1.5 py-0.5 rounded font-medium tracking-wide whitespace-nowrap">
                  BEST
                </span>
              )}
              {revenueData && (
                <span className="text-[8px] bg-amber-400/10 border border-amber-400/30 text-amber-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                  7D REV: ${(revenueData.revenue7d / 1000).toFixed(0)}K
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E2A35]/60" />

        {/* Primary metrics */}
        <div className="px-4 py-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] tracking-widest text-[#3D5166] mb-0.5">RISK-ADJ YIELD</p>
            <p className="text-sky-400 font-bold text-3xl tabular-nums leading-none">
              {formatAPY(ra)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-widest text-[#3D5166] mb-0.5">TOTAL APY</p>
            <p className={`font-semibold text-xl tabular-nums leading-none ${isHighYield ? "text-emerald-400" : "text-emerald-400/80"}`}>
              {formatAPY(opp.totalAPY)}
            </p>
            {opp.incentiveAPY > 0 && (
              <p className="text-[9px] text-amber-400/70 mt-0.5">+{formatAPY(opp.incentiveAPY)} incentives</p>
            )}
          </div>
        </div>

        <div className="border-t border-[#1E2A35]/60" />

        {/* Risk + TVL */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#3D5166]">RISK</span>
            <RiskBadge score={opp.riskScore} breakdown={opp.riskBreakdown} compact />
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[#3D5166]">TVL </span>
            <span className="text-[12px] text-[#C8D8E8] font-medium">{formatTVL(opp.tvl)}</span>
          </div>
        </div>

        <div className="border-t border-[#1E2A35]/60" />

        {/* Yield source */}
        <div className="px-4 py-3 flex-1">
          <p className="text-[#6B8499] text-xs leading-relaxed line-clamp-2">{opp.yieldSource}</p>
        </div>

        {/* Tags + CTA */}
        <div className="border-t border-[#1E2A35]/60 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex gap-1 flex-wrap min-w-0">
            {opp.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[8px] text-[#3D5166] border border-[#1E2A35] px-1.5 py-0.5 rounded-md truncate">
                {t}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-[#3D5166] group-hover:text-[#00D4FF] transition-colors shrink-0 font-medium tracking-wide">
            ANALYSIS →
          </span>
        </div>
      </div>
    </Link>
  );
}
