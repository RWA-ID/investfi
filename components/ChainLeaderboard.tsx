"use client";
import type { Opportunity, Chain } from "@/lib/types";

interface ChainStats {
  chain: Chain;
  avgAPY: number;
  bestAPY: number;
  bestProtocol: string;
  count: number;
}

export default function ChainLeaderboard({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities.length) return null;

  const map = new Map<Chain, Opportunity[]>();
  for (const opp of opportunities) {
    const list = map.get(opp.chain) ?? [];
    list.push(opp);
    map.set(opp.chain, list);
  }

  const stats: ChainStats[] = [];
  map.forEach((opps, chain) => {
    const avgAPY = opps.reduce((s, o) => s + o.totalAPY, 0) / opps.length;
    const best = opps.reduce((a, b) => (b.totalAPY > a.totalAPY ? b : a));
    stats.push({ chain, avgAPY, bestAPY: best.totalAPY, bestProtocol: best.protocol, count: opps.length });
  });

  stats.sort((a, b) => b.avgAPY - a.avgAPY);

  return (
    <div className="border-b border-[#1E2A35] bg-[#0D1318]">
      <div className="max-w-[1600px] mx-auto px-6 py-3">
        <p className="text-[9px] tracking-widest text-[#3D5166] mb-2">
          CHAIN LEADERBOARD · AVG YIELD THIS SESSION
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {stats.map((s, i) => {
            const isTop = i === 0;
            return (
              <div
                key={s.chain}
                className={`border rounded-lg px-3 py-2 flex flex-col gap-0.5 shrink-0 transition-colors ${
                  isTop
                    ? "border-[#FFD700]/40 bg-[#FFD700]/5"
                    : "border-[#1E2A35] bg-[#111820]/50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#3D5166]">#{i + 1}</span>
                  <span className="text-[11px] text-[#C8D8E8] font-medium">{s.chain}</span>
                  {isTop && (
                    <span className="text-[7px] bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] px-1 py-0.5 rounded font-medium tracking-wide">
                      BEST
                    </span>
                  )}
                </div>
                <span className="text-emerald-400 font-bold text-[14px] tabular-nums leading-none">
                  {s.avgAPY.toFixed(2)}%
                </span>
                <span className="text-[9px] text-[#3D5166] truncate max-w-[120px]">
                  {s.bestProtocol} · {s.bestAPY.toFixed(1)}% peak
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
