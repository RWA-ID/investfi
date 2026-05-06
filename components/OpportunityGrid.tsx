"use client";
import { useState, useMemo } from "react";
import type { Opportunity, StrategyType } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import FilterBar, { type Filters } from "./FilterBar";
import StrategySection from "./StrategySection";

interface RevenueItem {
  protocol: string;
  revenue7d: number;
}

interface Props {
  opportunities: Opportunity[];
  revenueData: RevenueItem[] | null;
}

const STRATEGY_ORDER: StrategyType[] = [
  "Lending",
  "Liquid Staking",
  "RWA",
  "Structured",
  "LP",
  "Staking",
];

export default function OpportunityGrid({ opportunities, revenueData }: Props) {
  const [filters, setFilters] = useState<Filters>({
    chain: "All",
    strategy: "All",
    maxRisk: 10,
    sort: "riskAdjusted",
    search: "",
  });

  const revenueMap = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const r of revenueData ?? []) {
      map.set(r.protocol.toLowerCase(), r.revenue7d);
    }
    return map;
  }, [revenueData]);

  const filtered = useMemo(() => {
    let list = [...opportunities];
    if (filters.chain !== "All") list = list.filter((o) => o.chain === filters.chain);
    if (filters.strategy !== "All") list = list.filter((o) => o.strategyType === filters.strategy);
    list = list.filter((o) => o.riskScore <= filters.maxRisk);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) => o.protocol.toLowerCase().includes(q) || o.yieldSource.toLowerCase().includes(q)
      );
    }
    // Secondary sort for display within groups
    list.sort((a, b) =>
      riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore)
    );
    return list;
  }, [filters, opportunities]);

  // Group by strategy in defined order
  const groups = useMemo(() => {
    const map = new Map<StrategyType, Opportunity[]>();
    for (const opp of filtered) {
      const existing = map.get(opp.strategyType) ?? [];
      map.set(opp.strategyType, [...existing, opp]);
    }
    return STRATEGY_ORDER.filter((s) => map.has(s)).map((s) => ({
      strategy: s,
      items: map.get(s)!,
    }));
  }, [filtered]);

  return (
    <div>
      <div className="border border-[#1E2A35] rounded-xl overflow-hidden mb-8 bg-[#0B0F14]">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          count={filtered.length}
          total={opportunities.length}
        />
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3D5166]">
          <span className="text-4xl opacity-20">⊘</span>
          <span className="text-[13px]">No opportunities match current filters.</span>
        </div>
      ) : (
        groups.map(({ strategy, items }) => (
          <StrategySection
            key={strategy}
            title={strategy}
            opportunities={items}
            revenueMap={revenueMap}
          />
        ))
      )}
    </div>
  );
}
