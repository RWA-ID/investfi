import type { Opportunity } from "@/lib/types";
import { formatTVL, formatAPY } from "@/lib/format";
import { riskAdjustedYield } from "@/lib/risk";

export default function StatsBar({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities.length) return null;

  const totalTVL = opportunities.reduce((s, o) => s + o.tvl, 0);
  const avgAPY = opportunities.reduce((s, o) => s + o.totalAPY, 0) / opportunities.length;
  const avgRA = opportunities.reduce((s, o) => s + riskAdjustedYield(o.totalAPY, o.riskScore), 0) / opportunities.length;
  const lowRisk = opportunities.filter((o) => o.riskScore <= 3.5).length;
  const best = [...opportunities].sort((a, b) => b.totalAPY - a.totalAPY)[0];
  const bestRA = [...opportunities].sort((a, b) =>
    riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore)
  )[0];

  return (
    <div className="border-b border-[#1E2A35] bg-[#0D1318]">
      <div className="max-w-[1600px] mx-auto px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <StatCard
            label="Tracked TVL"
            value={formatTVL(totalTVL)}
            sub={`${opportunities.length} protocols`}
          />
          <StatCard
            label="Avg Total APY"
            value={formatAPY(avgAPY)}
            sub="base + incentives"
            accent="emerald"
          />
          <StatCard
            label="Avg Risk-Adj Yield"
            value={formatAPY(avgRA)}
            sub="our signature metric"
            accent="sky"
            highlight
          />
          <StatCard
            label="Safe Allocations"
            value={`${lowRisk}`}
            sub={`of ${opportunities.length} score ≤ 3.5`}
          />
          <StatCard
            label="Highest Yield"
            value={formatAPY(best.totalAPY)}
            sub={best.protocol}
            accent="amber"
          />
          <StatCard
            label="Best Risk-Adj"
            value={formatAPY(riskAdjustedYield(bestRA.totalAPY, bestRA.riskScore))}
            sub={bestRA.protocol}
            accent="sky"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, accent, highlight,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "emerald" | "sky" | "amber";
  highlight?: boolean;
}) {
  const valueColor =
    accent === "emerald" ? "text-emerald-400" :
    accent === "sky" ? "text-sky-400" :
    accent === "amber" ? "text-amber-400" :
    "text-[#C8D8E8]";

  return (
    <div className={`flex flex-col gap-1.5 ${highlight ? "pl-4 border-l border-sky-400/30" : ""}`}>
      <span className="text-[9px] tracking-widest text-[#3D5166] uppercase">{label}</span>
      <span className={`text-2xl font-bold tabular-nums leading-none ${valueColor}`}>{value}</span>
      <span className="text-[10px] text-[#3D5166] leading-snug">{sub}</span>
    </div>
  );
}
