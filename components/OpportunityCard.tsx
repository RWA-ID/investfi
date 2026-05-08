"use client";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import { Ticker, Sparkline, RiskPill, ChainBadge, ProtoMark, fmtUsdShort } from "./atoms";

function deriveSeries(opp: Opportunity): number[] {
  if (opp.historicalAPY && opp.historicalAPY.length > 1) {
    return opp.historicalAPY.slice(-60).map((p) => p.apy);
  }
  let seed = 0;
  for (let i = 0; i < opp.id.length; i++) seed = (seed * 31 + opp.id.charCodeAt(i)) >>> 0;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const out: number[] = [];
  let v = opp.totalAPY;
  for (let i = 0; i < 60; i++) {
    const drift = (rng() - 0.5) * opp.totalAPY * 0.06;
    v = Math.max(
      opp.totalAPY * 0.5,
      Math.min(opp.totalAPY * 1.6, v * 0.85 + (opp.totalAPY + drift) * 0.15)
    );
    out.push(v);
  }
  return out;
}

export default function OpportunityCard({ opp }: { opp: Opportunity }) {
  const series = deriveSeries(opp);
  const change =
    ((series[series.length - 1] - series[0]) / Math.max(0.001, series[0])) * 100;
  const ra = riskAdjustedYield(opp.totalAPY, opp.riskScore);

  return (
    <Link href={`/opportunity/${opp.id}`} className="opp-card">
      <div className="opp-card__glow" aria-hidden />
      <div className="opp-card__head">
        <div className="flex items-center gap-3">
          <ProtoMark logo={opp.protocolLogo} id={opp.id} size={40} alt={opp.protocol} />
          <div>
            <div className="opp-card__name">{opp.protocol}</div>
            <div className="opp-card__sub">
              <ChainBadge chain={opp.chain} compact />
              <span className="opp-card__strat">{opp.strategyType}</span>
            </div>
          </div>
        </div>
        <RiskPill score={opp.riskScore} compact />
      </div>

      <div className="opp-card__apy">
        <div className="opp-card__apy-num">
          <Ticker value={opp.totalAPY} decimals={2} suffix="%" />
        </div>
        <div className="opp-card__apy-meta">
          <span className="opp-card__apy-label">Total APY</span>
          {opp.incentiveAPY > 0 && (
            <span className="opp-card__apy-incentive">
              {opp.baseAPY.toFixed(2)}% base + {opp.incentiveAPY.toFixed(2)}% rewards
            </span>
          )}
        </div>
      </div>

      <div className="opp-card__chart">
        <Sparkline
          data={series}
          width={280}
          height={48}
          stroke="var(--accent)"
          fill="var(--accent)"
        />
        <span className={`opp-card__delta ${change >= 0 ? "is-up" : "is-down"}`}>
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%<span className="opp-card__delta-period"> 30d</span>
        </span>
      </div>

      <div className="opp-card__footer">
        <div>
          <div className="opp-card__foot-label">TVL</div>
          <div className="opp-card__foot-value">{fmtUsdShort(opp.tvl)}</div>
        </div>
        <div>
          <div className="opp-card__foot-label">Risk-adj</div>
          <div className="opp-card__foot-value opp-card__foot-value--accent">
            {ra.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="opp-card__foot-label">Audits</div>
          <div className="opp-card__foot-value">{opp.auditFirms.length}</div>
        </div>
      </div>

      <div className="opp-card__cta">
        <span>View opportunity</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
