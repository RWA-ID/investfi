"use client";
import { useState } from "react";
import Header, { type ViewMode } from "./Header";
import Hero from "./Hero";
import StatsBar from "./StatsBar";
import OpportunityGrid from "./OpportunityGrid";
import ChainLeaderboard from "./ChainLeaderboard";
import PortfolioSimulator from "./PortfolioSimulator";
import BackedBy from "./BackedBy";
import TradeOfTheDay from "./TradeOfTheDay";
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

export default function PageShell({ opportunities, marketPrices }: Props) {
  const [view, setView] = useState<ViewMode>("institutional");

  const displayOpps =
    view === "retail" ? opportunities.filter((o) => o.riskScore <= 5.5) : opportunities;

  return (
    <div className="app-root min-h-screen">
      <Header view={view} onViewChange={setView} />

      <main className="dashboard">
        <Hero opportunities={displayOpps} marketPrices={marketPrices} />
        <StatsBar opportunities={displayOpps} marketPrices={marketPrices} />

        <div className="container-if">
          <TradeOfTheDay opportunities={displayOpps} />

          <div className="dashboard__row" id="opportunities">
            <div>
              <OpportunityGrid opportunities={displayOpps} />
            </div>
            <aside>
              <ChainLeaderboard opportunities={displayOpps} />
            </aside>
          </div>

          <PortfolioSimulator opportunities={displayOpps} />

          <BackedBy />

          <footer className="if-footer">
            <div className="if-footer__l">
              <span className="if-footer__brand">
                Invest<span style={{ color: "var(--accent)" }}>Fi</span>
              </span>
              <span className="if-footer__meta">
                investfi.eth · Data: DeFiLlama · Alchemy · The Graph · Dune
              </span>
            </div>
            <span>Not financial advice · For informational purposes only</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
