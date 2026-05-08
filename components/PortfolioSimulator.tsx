"use client";
import { useMemo, useState } from "react";
import type { Opportunity } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import { Ticker, fmtUsdShort, ChainBadge, ProtoMark, GlassCard } from "./atoms";

const CHAIN_COLOR_FOR_DONUT: Record<string, string> = {
  Ethereum: "#627EEA",
  Arbitrum: "#28A0F0",
  Base: "#0052FF",
  Optimism: "#FF0420",
  Polygon: "#8247E5",
  Avalanche: "#E84142",
  Solana: "#14F195",
};

function Donut({
  weights,
  colors,
  size = 160,
  thickness = 14,
}: {
  weights: number[];
  colors: string[];
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.05)"
        strokeWidth={thickness}
      />
      {weights.map((w, i) => {
        const len = (w / 100) * c;
        const offset = -acc;
        acc += len;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colors[i]}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray .5s ease, stroke-dashoffset .5s ease" }}
          />
        );
      })}
    </svg>
  );
}

export default function PortfolioSimulator({ opportunities }: { opportunities: Opportunity[] }) {
  const top = useMemo(
    () =>
      [...opportunities]
        .sort(
          (a, b) =>
            riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore)
        )
        .slice(0, 4),
    [opportunities]
  );

  const [amount, setAmount] = useState(100000);
  const [weights, setWeights] = useState<number[]>(() => top.map(() => 25));

  const ids = top.map((o) => o.id).join(",");
  const [lastIds, setLastIds] = useState(ids);
  if (ids !== lastIds) {
    setLastIds(ids);
    setWeights(top.map(() => Math.floor(100 / Math.max(1, top.length))));
  }

  const setWeight = (i: number, v: number) => {
    const next = [...weights];
    next[i] = v;
    const sum = next.reduce((a, b) => a + b, 0) || 1;
    setWeights(next.map((x) => Math.round((x / sum) * 100)));
  };

  if (!top.length) return null;

  const blendedApy = top.reduce((a, o, i) => a + o.totalAPY * (weights[i] / 100), 0);
  const blendedRisk = top.reduce((a, o, i) => a + o.riskScore * (weights[i] / 100), 0);
  const yearly = amount * (blendedApy / 100);
  const monthly = yearly / 12;

  const colors = top.map((o) => CHAIN_COLOR_FOR_DONUT[o.chain] ?? "var(--accent)");

  return (
    <GlassCard className="simulator">
      <div className="section-head">
        <div>
          <h3 className="section-head__title">Portfolio Simulator</h3>
          <p className="section-head__sub">
            Mix the top risk-adjusted yields and project your earnings
          </p>
        </div>
        <div className="simulator__amount">
          <span>$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
          />
        </div>
      </div>

      <div className="simulator__body">
        <div className="simulator__alloc">
          {top.map((o, i) => (
            <div key={o.id}>
              <div className="simulator__head">
                <ProtoMark logo={o.protocolLogo} id={o.id} size={28} alt={o.protocol} />
                <div className="flex-1 min-w-0">
                  <div className="simulator__name">{o.protocol}</div>
                  <div className="simulator__meta">
                    <ChainBadge chain={o.chain} compact />
                    <span className="text-white/40 text-[11px]">
                      {o.totalAPY.toFixed(2)}% APY · {o.strategyType}
                    </span>
                  </div>
                </div>
                <div className="simulator__pct">{weights[i]}%</div>
              </div>
              <div className="simulator__slider">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[i]}
                  onChange={(e) => setWeight(i, +e.target.value)}
                  style={{ ["--p" as string]: `${weights[i]}%` } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="simulator__results">
          <div className="simulator__don">
            <Donut weights={weights} colors={colors} />
            <div className="simulator__don-center">
              <div className="simulator__don-label">Blended APY</div>
              <div className="simulator__don-val">
                <Ticker value={blendedApy} decimals={2} suffix="%" />
              </div>
            </div>
          </div>
          <div className="simulator__nums">
            <div>
              <div className="simulator__num-l">Per year</div>
              <div className="simulator__num-v simulator__num-v--accent">
                <Ticker value={yearly} format={fmtUsdShort} />
              </div>
            </div>
            <div>
              <div className="simulator__num-l">Per month</div>
              <div className="simulator__num-v">
                <Ticker value={monthly} format={fmtUsdShort} />
              </div>
            </div>
            <div>
              <div className="simulator__num-l">Blended risk</div>
              <div className="simulator__num-v">
                <Ticker value={blendedRisk} decimals={2} />{" "}
                <span className="text-white/30 text-[12px]">/ 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
