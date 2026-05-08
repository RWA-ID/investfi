"use client";
import type { Opportunity } from "@/lib/types";
import { Ticker, fmtUsdShort, LivePulse } from "./atoms";

interface MarketPrices {
  eth: number | null;
  btc: number | null;
  ethChange24h: number | null;
}

export default function Hero({
  opportunities,
  marketPrices,
}: {
  opportunities: Opportunity[];
  marketPrices: MarketPrices | null;
}) {
  const totalTvl = opportunities.reduce((a, o) => a + o.tvl, 0);
  const avgApy =
    opportunities.length > 0
      ? opportunities.reduce((a, o) => a + o.totalAPY, 0) / opportunities.length
      : 0;
  const topApy = opportunities.length > 0 ? Math.max(...opportunities.map((o) => o.totalAPY)) : 0;
  const ethDelta = marketPrices?.ethChange24h ?? 2.4;

  return (
    <section className="hero">
      <div className="hero__mesh" aria-hidden />
      <div className="hero__grid" aria-hidden />

      <div className="hero__inner">
        <div>
          <div className="hero__eyebrow">
            <LivePulse label="LIVE · DEFILLAMA · ALCHEMY · DUNE" />
          </div>
          <h1 className="hero__title">
            On-chain yield,
            <br />
            <span className="hero__title-accent">priced for institutions.</span>
          </h1>
          <p className="hero__sub">
            A unified scanner for risk-adjusted DeFi yield. Built for treasuries, family offices,
            and serious allocators — open to everyone.
          </p>
          <div className="hero__cta">
            <button className="btn btn--primary">
              Browse opportunities
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn btn--ghost">Read methodology</button>
          </div>
        </div>

        <div className="hero__right">
          <div className="hero-stat hero-stat--xl">
            <span className="hero-stat__label">Total Value Tracked</span>
            <span className="hero-stat__value">
              <Ticker value={totalTvl} format={(v) => fmtUsdShort(v)} duration={1600} />
            </span>
            <span className={`hero-stat__delta ${ethDelta >= 0 ? "hero-stat__delta--up" : ""}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d={ethDelta >= 0 ? "M12 4l8 10H4z" : "M12 20l8-10H4z"} />
              </svg>
              {ethDelta >= 0 ? "+" : ""}
              {ethDelta.toFixed(2)}% · 24h
            </span>
          </div>
          <div className="hero-stat__row">
            <div className="hero-stat">
              <span className="hero-stat__label">Avg APY</span>
              <span className="hero-stat__value hero-stat__value--md">
                <Ticker value={avgApy} decimals={2} suffix="%" />
              </span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat__label">Top APY</span>
              <span className="hero-stat__value hero-stat__value--md hero-stat__value--accent">
                <Ticker value={topApy} decimals={2} suffix="%" />
              </span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat__label">Protocols</span>
              <span className="hero-stat__value hero-stat__value--md">
                <Ticker value={opportunities.length} decimals={0} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
