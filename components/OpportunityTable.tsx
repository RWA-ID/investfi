"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Opportunity } from "@/lib/types";
import { formatTVL, formatAPY } from "@/lib/format";
import { riskAdjustedYield } from "@/lib/risk";
import RiskBadge from "./RiskBadge";
import ChainBadge from "./ChainBadge";
import FilterBar, { type Filters } from "./FilterBar";
import { opportunities } from "@/lib/data";

const STRATEGY_COLORS: Record<string, string> = {
  Lending: "text-sky-400",
  Staking: "text-violet-400",
  LP: "text-amber-400",
  Structured: "text-rose-400",
  "Liquid Staking": "text-teal-400",
  RWA: "text-lime-400",
};

const COLS: { key: string; label: string; cls?: string }[] = [
  { key: "protocol", label: "PROTOCOL", cls: "text-left" },
  { key: "chain", label: "CHAIN", cls: "text-left" },
  { key: "strategyType", label: "STRATEGY", cls: "text-left" },
  { key: "baseAPY", label: "BASE APY", cls: "text-right" },
  { key: "incentiveAPY", label: "INCENT.", cls: "text-right" },
  { key: "totalAPY", label: "TOTAL APY", cls: "text-right" },
  { key: "riskAdjusted", label: "RISK-ADJ", cls: "text-right" },
  { key: "tvl", label: "TVL", cls: "text-right" },
  { key: "riskScore", label: "RISK", cls: "text-center" },
  { key: "volatility30d", label: "VOL 30D", cls: "text-right" },
  { key: "yieldSource", label: "YIELD SOURCE", cls: "text-left" },
];

export default function OpportunityTable() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({
    chain: "All",
    strategy: "All",
    maxRisk: 10,
    sort: "totalAPY",
    search: "",
  });

  const filtered = useMemo(() => {
    let list = [...opportunities];
    if (filters.chain !== "All") list = list.filter((o) => o.chain === filters.chain);
    if (filters.strategy !== "All") list = list.filter((o) => o.strategyType === filters.strategy);
    list = list.filter((o) => o.riskScore <= filters.maxRisk);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((o) => o.protocol.toLowerCase().includes(q) || o.yieldSource.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (filters.sort === "totalAPY") return b.totalAPY - a.totalAPY;
      if (filters.sort === "riskAdjusted") return riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore);
      if (filters.sort === "tvl") return b.tvl - a.tvl;
      if (filters.sort === "riskScore") return a.riskScore - b.riskScore;
      return 0;
    });
    return list;
  }, [filters]);

  return (
    <div className="flex-1 flex flex-col">
      <FilterBar filters={filters} onChange={setFilters} count={filtered.length} total={opportunities.length} />

      {/* Scrollable table area */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-[12px] border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-[#1E2A35]">
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[9px] tracking-widest text-[#3D5166] font-medium ${col.cls ?? "text-left"}`}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-[9px] tracking-widest text-[#3D5166] text-center">DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((opp, idx) => (
              <OpportunityRow
                key={opp.id}
                opp={opp}
                rank={idx + 1}
                sortKey={filters.sort}
                onClick={() => router.push(`/opportunity/${opp.id}`)}
              />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 text-[#3D5166] text-sm">
            No opportunities match current filters.
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityRow({
  opp, rank, sortKey, onClick,
}: {
  opp: Opportunity;
  rank: number;
  sortKey: Filters["sort"];
  onClick: () => void;
}) {
  const ra = riskAdjustedYield(opp.totalAPY, opp.riskScore);
  const isTopYield = opp.totalAPY > 10;

  return (
    <tr
      onClick={onClick}
      className="opp-row border-b border-[#1E2A35]/60 transition-colors group"
    >
      {/* Protocol */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#3D5166] w-4 tabular-nums">{rank}</span>
          <div className="w-7 h-7 rounded bg-gradient-to-br from-[#1E2A35] to-[#0D1318] border border-[#1E2A35] flex items-center justify-center text-[9px] font-bold text-[#6B8499]">
            {opp.protocolLogo}
          </div>
          <div className="flex flex-col">
            <span className="text-[#C8D8E8] font-semibold group-hover:text-white transition-colors">
              {opp.protocol}
            </span>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {opp.audited && (
                <span className="text-[8px] text-emerald-400/70 border border-emerald-400/20 px-1 rounded">AUDITED</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Chain */}
      <td className="px-4 py-3"><ChainBadge chain={opp.chain} /></td>

      {/* Strategy */}
      <td className="px-4 py-3">
        <span className={`text-[11px] font-medium ${STRATEGY_COLORS[opp.strategyType] ?? "text-[#C8D8E8]"}`}>
          {opp.strategyType}
        </span>
      </td>

      {/* Base APY */}
      <td className="px-4 py-3 text-right tabular-nums text-[#6B8499]">{formatAPY(opp.baseAPY)}</td>

      {/* Incentive APY */}
      <td className="px-4 py-3 text-right tabular-nums">
        {opp.incentiveAPY > 0 ? (
          <span className="text-amber-400">+{formatAPY(opp.incentiveAPY)}</span>
        ) : (
          <span className="text-[#3D5166]">—</span>
        )}
      </td>

      {/* Total APY */}
      <td className="px-4 py-3 text-right tabular-nums">
        <span className={`font-bold text-emerald-400 text-[13px] ${isTopYield ? "yield-high" : ""}`}>
          {formatAPY(opp.totalAPY)}
        </span>
      </td>

      {/* Risk-adjusted */}
      <td className="px-4 py-3 text-right tabular-nums">
        <span className={`text-sky-400 ${sortKey === "riskAdjusted" ? "font-bold" : ""}`}>
          {formatAPY(ra)}
        </span>
      </td>

      {/* TVL */}
      <td className="px-4 py-3 text-right tabular-nums text-[#C8D8E8]">{formatTVL(opp.tvl)}</td>

      {/* Risk badge */}
      <td className="px-4 py-3 text-center">
        <RiskBadge score={opp.riskScore} breakdown={opp.riskBreakdown} compact />
      </td>

      {/* Volatility */}
      <td className="px-4 py-3 text-right tabular-nums">
        <span className={opp.volatility30d > 20 ? "text-orange-400" : "text-[#6B8499]"}>
          {opp.volatility30d.toFixed(1)}%
        </span>
      </td>

      {/* Yield source */}
      <td className="px-4 py-3 max-w-[260px]">
        <span className="text-[#6B8499] text-[10px] line-clamp-2 leading-relaxed">{opp.yieldSource}</span>
      </td>

      {/* Detail arrow */}
      <td className="px-4 py-3 text-center">
        <span className="text-[#3D5166] group-hover:text-[#00D4FF] transition-colors text-sm">→</span>
      </td>
    </tr>
  );
}
