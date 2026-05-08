"use client";
import type { StrategyType } from "@/lib/types";

export type SortKey = "raj" | "apy" | "tvl" | "risk";

export interface Filters {
  strategy: StrategyType | null;
  sort: SortKey;
}

const STRATEGIES: StrategyType[] = ["Lending", "Liquid Staking", "LP", "Structured", "RWA"];

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  counts: Record<string, number>;
  total: number;
}

export default function FilterBar({ filters, onChange, counts, total }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <button
          className="strat-chip"
          data-active={!filters.strategy || undefined}
          onClick={() => set({ strategy: null })}
        >
          All <span className="strat-count">{total}</span>
        </button>
        {STRATEGIES.map((s) => (
          <button
            key={s}
            className="strat-chip"
            data-active={filters.strategy === s || undefined}
            onClick={() => set({ strategy: filters.strategy === s ? null : s })}
          >
            {s}
            <span className="strat-count">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="filter-bar__group filter-bar__group--right">
        <div className="filter-bar__sort">
          <span>Sort</span>
          {(
            [
              { k: "apy", l: "APY" },
              { k: "tvl", l: "TVL" },
              { k: "risk", l: "Risk" },
              { k: "raj", l: "Risk-adj" },
            ] as { k: SortKey; l: string }[]
          ).map((s) => (
            <button
              key={s.k}
              data-active={filters.sort === s.k || undefined}
              onClick={() => set({ sort: s.k })}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
