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
    <div className="border-b border-[#1E2A35] bg-[#0D1318]">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search protocol..."
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="bg-[#111820] border border-[#1E2A35] rounded px-3 py-1.5 text-xs text-[#C8D8E8] placeholder-[#3D5166] focus:outline-none focus:border-[#00D4FF]/40 w-44"
        />

        {/* Chain filter */}
        <Select
          label="CHAIN"
          value={filters.chain}
          options={CHAINS}
          onChange={(v) => set({ chain: v as Chain | "All" })}
        />

        {/* Strategy filter */}
        <Select
          label="STRATEGY"
          value={filters.strategy}
          options={STRATEGIES}
          onChange={(v) => set({ strategy: v as StrategyType | "All" })}
        />

        {/* Risk ceiling */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#3D5166] tracking-widest">MAX RISK</span>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={filters.maxRisk}
            onChange={(e) => set({ maxRisk: parseFloat(e.target.value) })}
            className="w-24 accent-sky-400"
          />
          <span className="text-sky-400 w-6 tabular-nums">{filters.maxRisk}</span>
        </div>

        {/* Sort */}
        <Select
          label="SORT"
          value={filters.sort}
          options={["totalAPY", "riskAdjusted", "tvl", "riskScore"]}
          labels={["Total APY", "Risk-Adj Yield", "TVL", "Risk Score"]}
          onChange={(v) => set({ sort: v as Filters["sort"] })}
        />

        {/* Result count */}
        <span className="ml-auto text-[10px] text-[#3D5166]">
          SHOWING <span className="text-[#C8D8E8]">{count}</span> / {total}
        </span>
      </div>
    </div>
  );
}

function Select({
  label, value, options, labels, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-[#3D5166] tracking-widest hidden sm:block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#111820] border border-[#1E2A35] rounded px-2 py-1.5 text-[#C8D8E8] text-[11px] focus:outline-none focus:border-[#00D4FF]/40 cursor-pointer"
      >
        {options.map((o, i) => (
          <option key={o} value={o}>{labels ? labels[i] : o}</option>
        ))}
      </select>
    </div>
  );
}
