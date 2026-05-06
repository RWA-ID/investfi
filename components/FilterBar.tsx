"use client";
import type { Chain, StrategyType } from "@/lib/types";

export interface Filters {
  chain: Chain | "All";
  strategy: StrategyType | "All";
  maxRisk: number;
  sort: "totalAPY" | "riskAdjusted" | "tvl" | "riskScore";
  search: string;
}

const CHAINS: (Chain | "All")[] = ["All", "Ethereum", "Arbitrum", "Base", "Optimism", "Polygon", "Avalanche", "Solana"];
const STRATEGIES: (StrategyType | "All")[] = ["All", "Lending", "Staking", "LP", "Structured", "Liquid Staking", "RWA"];

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  count: number;
  total: number;
}

export default function FilterBar({ filters, onChange, count, total }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-[#0D1318]/80">
      <div className="px-6 py-3 flex flex-wrap items-center gap-4">

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5166] text-[11px]">⌕</span>
          <input
            type="text"
            placeholder="Search protocol..."
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="bg-[#111820] border border-[#1E2A35] rounded-lg pl-8 pr-3 py-2 text-[12px] text-[#C8D8E8] placeholder-[#3D5166] focus:outline-none focus:border-[#00D4FF]/40 w-48 transition-colors"
          />
        </div>

        <div className="w-px h-5 bg-[#1E2A35]" />

        <FilterSelect
          label="Chain"
          value={filters.chain}
          options={CHAINS}
          onChange={(v) => set({ chain: v as Chain | "All" })}
        />

        <FilterSelect
          label="Strategy"
          value={filters.strategy}
          options={STRATEGIES}
          onChange={(v) => set({ strategy: v as StrategyType | "All" })}
        />

        {/* Risk ceiling */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#3D5166] tracking-widest whitespace-nowrap">MAX RISK</span>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={filters.maxRisk}
            onChange={(e) => set({ maxRisk: parseFloat(e.target.value) })}
            className="w-28 accent-sky-400"
          />
          <span className="text-sky-400 text-[13px] font-semibold w-6 tabular-nums">{filters.maxRisk}</span>
        </div>

        <div className="w-px h-5 bg-[#1E2A35]" />

        <FilterSelect
          label="Sort by"
          value={filters.sort}
          options={["totalAPY", "riskAdjusted", "tvl", "riskScore"]}
          labels={["Total APY", "Risk-Adj Yield", "TVL", "Risk Score"]}
          onChange={(v) => set({ sort: v as Filters["sort"] })}
        />

        <div className="flex-1" />

        <span className="text-[10px] text-[#3D5166] whitespace-nowrap">
          <span className="text-[#C8D8E8] font-semibold">{count}</span> / {total} protocols
        </span>
      </div>
    </div>
  );
}

function FilterSelect({
  label, value, options, labels, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#3D5166] tracking-widest hidden sm:block">{label.toUpperCase()}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#111820] border border-[#1E2A35] rounded-lg px-3 py-2 text-[12px] text-[#C8D8E8] focus:outline-none focus:border-[#00D4FF]/40 cursor-pointer transition-colors"
      >
        {options.map((o, i) => (
          <option key={o} value={o}>{labels ? labels[i] : o}</option>
        ))}
      </select>
    </div>
  );
}
