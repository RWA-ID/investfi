"use client";
import type { Opportunity, Chain } from "@/lib/types";
import { GlassCard, CHAIN_META, fmtUsdShort } from "./atoms";

interface ChainRow {
  name: Chain;
  tvl: number;
  count: number;
  avgApy: number;
}

export default function ChainLeaderboard({ opportunities }: { opportunities: Opportunity[] }) {
  const byChain = new Map<Chain, ChainRow>();
  for (const o of opportunities) {
    const row = byChain.get(o.chain) ?? { name: o.chain, tvl: 0, count: 0, avgApy: 0 };
    row.tvl += o.tvl;
    row.count += 1;
    row.avgApy += o.totalAPY;
    byChain.set(o.chain, row);
  }
  const rows = Array.from(byChain.values())
    .map((r) => ({ ...r, avgApy: r.avgApy / Math.max(1, r.count) }))
    .sort((a, b) => b.tvl - a.tvl);
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.tvl));

  return (
    <GlassCard className="leaderboard">
      <div className="section-head">
        <div>
          <h3 className="section-head__title">Chains</h3>
          <p className="section-head__sub">TVL distribution across networks</p>
        </div>
      </div>
      <div className="leaderboard__rows">
        {rows.map((r, i) => {
          const c = CHAIN_META[r.name] ?? { color: "#64748B", short: "" };
          return (
            <div className="leaderboard__row" key={r.name}>
              <span className="leaderboard__rank">{String(i + 1).padStart(2, "0")}</span>
              <span
                className="leaderboard__dot"
                style={{ background: c.color, boxShadow: `0 0 10px ${c.color}80` }}
              />
              <span className="leaderboard__name">{r.name}</span>
              <span className="leaderboard__tvl">{fmtUsdShort(r.tvl)}</span>
              <span className="leaderboard__apy">{r.avgApy.toFixed(2)}%</span>
              <div className="leaderboard__bar">
                <div
                  className="leaderboard__bar-fill"
                  style={{
                    width: `${(r.tvl / max) * 100}%`,
                    background: `linear-gradient(90deg, ${c.color}, color-mix(in oklab, ${c.color} 50%, var(--accent)))`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
