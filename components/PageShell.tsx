"use client";
import { useState } from "react";
import Header, { type ViewMode } from "./Header";
import MarketTicker from "./MarketTicker";
import StatsBar from "./StatsBar";
import OpportunityGrid from "./OpportunityGrid";
import BackedBy from "./BackedBy";
import ChainLeaderboard from "./ChainLeaderboard";
import PortfolioSimulator from "./PortfolioSimulator";
import type { Opportunity } from "@/lib/types";

interface MarketPrices {
  eth: number | null;
  btc: number | null;
  ethChange24h: number | null;
}

interface RevenueItem {
  protocol: string;
  revenue7d: number;
}

interface Props {
  opportunities: Opportunity[];
  marketPrices: MarketPrices | null;
  revenueData: RevenueItem[] | null;
}

export default function PageShell({ opportunities, marketPrices, revenueData }: Props) {
  const [view, setView] = useState<ViewMode>("institutional");

  const displayOpps =
    view === "retail"
      ? opportunities.filter((o) => o.riskScore <= 6)
      : opportunities;

  const prices: MarketPrices = marketPrices ?? { eth: null, btc: null, ethChange24h: null };

  return (
    <div className="flex flex-col min-h-screen">
      <Header view={view} onViewChange={setView} />

      <MarketTicker
        eth={prices.eth}
        btc={prices.btc}
        ethChange24h={prices.ethChange24h}
      />

      <StatsBar opportunities={displayOpps} />

      <ChainLeaderboard opportunities={displayOpps} />

      <div className="max-w-[1600px] mx-auto w-full px-6 flex-1 flex flex-col">
        {/* Page title */}
        <div className="flex items-start justify-between pt-6 pb-5 gap-4 flex-wrap">
          <div>
            <h1 className="text-[10px] tracking-widest text-[#3D5166] mb-1.5 uppercase">
              {view === "institutional" ? "Opportunity Scanner" : "Yield Explorer"}
            </h1>
            <p className="text-[12px] text-[#6B8499] max-w-xl leading-relaxed">
              {view === "institutional"
                ? "Risk-adjusted yield intelligence across live DeFi protocols. Grouped by strategy. Primary metric: Risk-Adjusted Yield."
                : "Curated DeFi yields filtered for lower risk. Best for new allocators and treasury diversification."}
            </p>
          </div>

          {/* Risk legend */}
          <div className="flex items-center gap-4 text-[10px] text-[#3D5166] bg-[#0D1318] border border-[#1E2A35] rounded-lg px-4 py-2.5 shrink-0">
            <span className="font-medium text-[#6B8499] mr-1">RISK</span>
            {[
              { dot: "bg-emerald-400", label: "LOW ≤3.5" },
              { dot: "bg-amber-400", label: "MED ≤5.5" },
              { dot: "bg-orange-400", label: "HIGH ≤7.5" },
              { dot: "bg-red-500", label: "VERY HIGH" },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <OpportunityGrid opportunities={displayOpps} revenueData={revenueData} />

        {/* Portfolio Simulator */}
        <PortfolioSimulator opportunities={displayOpps} />

        {/* Backed by */}
        <BackedBy />
      </div>

      <footer className="border-t border-[#1E2A35] py-5 px-6 mt-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <p className="text-[10px] text-[#3D5166] tracking-widest">
            INVESTFI.ETH · DATA: DEFILLAMA (LIVE) · ALCHEMY · THE GRAPH · DUNE
          </p>
          <p className="text-[10px] text-[#2D4A5E]">
            NOT FINANCIAL ADVICE · FOR INFORMATIONAL PURPOSES ONLY
          </p>
        </div>
      </footer>
    </div>
  );
}
