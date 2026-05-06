import type { Opportunity, StrategyType } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import OpportunityCard from "./OpportunityCard";

const STRATEGY_ACCENT: Record<StrategyType, string> = {
  Lending:          "bg-sky-400",
  LP:               "bg-amber-400",
  Structured:       "bg-rose-400",
  "Liquid Staking": "bg-teal-400",
  RWA:              "bg-lime-400",
  Staking:          "bg-violet-400",
};

interface Props {
  title: StrategyType;
  opportunities: Opportunity[];
  revenueMap: Map<string, number>;
}

export default function StrategySection({ title, opportunities, revenueMap }: Props) {
  const sorted = [...opportunities]
    .sort((a, b) => riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore))
    .slice(0, 6);

  if (!sorted.length) return null;

  const accentClass = STRATEGY_ACCENT[title] ?? "bg-[#3D5166]";
  const topId = sorted[0].id;

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-1 h-5 rounded-full ${accentClass} shrink-0`} />
        <span className="text-[11px] tracking-widest text-[#6B8499] font-medium uppercase">{title}</span>
        <span className="text-[10px] bg-[#1E2A35] text-[#3D5166] px-2 py-0.5 rounded-full">
          {sorted.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((opp, idx) => {
          const revenue7d = revenueMap.get(opp.protocol.toLowerCase()) ?? null;
          return (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              rank={idx + 1}
              isTop={opp.id === topId}
              revenueData={revenue7d !== null ? { revenue7d } : null}
            />
          );
        })}
      </div>
    </section>
  );
}
