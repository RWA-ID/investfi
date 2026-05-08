"use client";
import { useMemo, useState } from "react";
import type { Opportunity, StrategyType } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import FilterBar, { type Filters } from "./FilterBar";
import OpportunityCard from "./OpportunityCard";

interface Props {
  opportunities: Opportunity[];
}

export default function OpportunityGrid({ opportunities }: Props) {
  const [filters, setFilters] = useState<Filters>({ strategy: null, sort: "raj" });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of opportunities) {
      map[o.strategyType] = (map[o.strategyType] ?? 0) + 1;
    }
    return map;
  }, [opportunities]);

  const filtered = useMemo(() => {
    let list = [...opportunities];
    if (filters.strategy) list = list.filter((o) => o.strategyType === filters.strategy);
    list.sort((a, b) => {
      if (filters.sort === "apy") return b.totalAPY - a.totalAPY;
      if (filters.sort === "tvl") return b.tvl - a.tvl;
      if (filters.sort === "risk") return a.riskScore - b.riskScore;
      return riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore);
    });
    return list;
  }, [filters, opportunities]);

  return (
    <div>
      <div className="section-head section-head--inline">
        <div>
          <h2 className="section-head__title section-head__title--lg">Opportunities</h2>
          <p className="section-head__sub">
            {filtered.length} live pools · ranked by{" "}
            {filters.sort === "raj"
              ? "risk-adjusted yield"
              : filters.sort === "apy"
              ? "APY"
              : filters.sort === "tvl"
              ? "TVL"
              : "risk"}
          </p>
        </div>
      </div>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        counts={counts}
        total={opportunities.length}
      />
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--ink-3)]">
          <span className="text-4xl opacity-20">⊘</span>
          <span className="text-[13px]">No opportunities match current filters.</span>
        </div>
      ) : (
        <div className="opp-grid">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opp={o} />
          ))}
        </div>
      )}
    </div>
  );
}

// Keep StrategyType import resolution
export type { StrategyType };
