import { opportunities } from "@/lib/data";
import { formatTVL, formatAPY } from "@/lib/format";
import { riskAdjustedYield } from "@/lib/risk";

export default function StatsBar() {
  const totalTVL = opportunities.reduce((s, o) => s + o.tvl, 0);
  const avgAPY = opportunities.reduce((s, o) => s + o.totalAPY, 0) / opportunities.length;
  const avgRA = opportunities.reduce((s, o) => s + riskAdjustedYield(o.totalAPY, o.riskScore), 0) / opportunities.length;
  const lowRisk = opportunities.filter((o) => o.riskScore <= 3.5).length;
  const best = [...opportunities].sort((a, b) => b.totalAPY - a.totalAPY)[0];

  return (
    <div className="border-b border-[#1E2A35] bg-[#0D1318]">
      <div className="max-w-[1600px] mx-auto px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="TRACKED TVL" value={formatTVL(totalTVL)} sub="across all protocols" />
        <StatCard label="AVG TOTAL APY" value={formatAPY(avgAPY)} sub="base + incentives" accent="emerald" />
        <StatCard label="RISK-ADJ YIELD" value={formatAPY(avgRA)} sub="penalized by risk score" accent="sky" />
        <StatCard label="LOW-RISK OPS" value={`${lowRisk} / ${opportunities.length}`} sub="score ≤ 3.5" />
        <StatCard label="TOP YIELD" value={formatAPY(best.totalAPY)} sub={best.protocol} accent="amber" />
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string; sub: string; accent?: "emerald" | "sky" | "amber";
}) {
  const color =
    accent === "emerald" ? "text-emerald-400" :
    accent === "sky" ? "text-sky-400" :
    accent === "amber" ? "text-amber-400" :
    "text-[#C8D8E8]";

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] tracking-widest text-[#3D5166]">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] text-[#3D5166]">{sub}</span>
    </div>
  );
}
