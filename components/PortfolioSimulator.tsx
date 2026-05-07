"use client";
import { useState, useMemo } from "react";
import type { Opportunity } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";

interface OutputStatProps {
  label: string;
  value: string;
  accent?: "emerald" | "sky";
  large?: boolean;
}

function OutputStat({ label, value, accent, large }: OutputStatProps) {
  const color =
    accent === "emerald" ? "text-emerald-400" :
    accent === "sky" ? "text-sky-400" :
    "text-[#C8D8E8]";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] tracking-widest text-[#3D5166]">{label}</span>
      <span className={`font-bold tabular-nums ${color} ${large ? "text-2xl" : "text-[15px]"}`}>{value}</span>
    </div>
  );
}

function initAllocations(ids: string[]): Record<string, number> {
  const base = Math.floor(100 / ids.length);
  const remainder = 100 - base * ids.length;
  return Object.fromEntries(ids.map((id, i) => [id, base + (i === 0 ? remainder : 0)]));
}

export default function PortfolioSimulator({ opportunities }: { opportunities: Opportunity[] }) {
  const top6 = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore))
      .slice(0, 6);
  }, [opportunities]);

  const [capital, setCapital] = useState(10_000);
  const [allocations, setAllocations] = useState<Record<string, number>>(() =>
    initAllocations(top6.map((o) => o.id))
  );

  // Re-init allocations when top6 changes (view switch)
  const allocationIds = top6.map((o) => o.id).join(",");
  const [lastIds, setLastIds] = useState(allocationIds);
  if (allocationIds !== lastIds) {
    setLastIds(allocationIds);
    setAllocations(initAllocations(top6.map((o) => o.id)));
  }

  function handleSlider(changedId: string, newValue: number) {
    const others = top6.map((o) => o.id).filter((id) => id !== changedId);
    const remaining = 100 - newValue;
    const currentOtherTotal = others.reduce((s, id) => s + (allocations[id] ?? 0), 0);

    let newAllocations: Record<string, number>;
    if (currentOtherTotal === 0) {
      const share = Math.floor(remaining / others.length);
      const rem = remaining - share * others.length;
      newAllocations = { ...allocations, [changedId]: newValue };
      others.forEach((id, i) => { newAllocations[id] = share + (i === 0 ? rem : 0); });
    } else {
      const scale = remaining / currentOtherTotal;
      newAllocations = { ...allocations, [changedId]: newValue };
      let distributed = 0;
      others.forEach((id, i) => {
        const scaled = i < others.length - 1
          ? Math.round((allocations[id] ?? 0) * scale)
          : remaining - distributed;
        newAllocations[id] = Math.max(0, scaled);
        distributed += newAllocations[id];
      });
    }
    setAllocations(newAllocations);
  }

  const totalAlloc = top6.reduce((s, o) => s + (allocations[o.id] ?? 0), 0);
  const blendedAPY = top6.reduce((s, o) => s + o.totalAPY * ((allocations[o.id] ?? 0) / 100), 0);
  const blendedRisk = top6.reduce((s, o) => s + o.riskScore * ((allocations[o.id] ?? 0) / 100), 0);
  const annualYield = capital * blendedAPY / 100;
  const monthlyYield = annualYield / 12;
  const dailyYield = annualYield / 365;

  if (!top6.length) return null;

  return (
    <section className="mt-8 mb-6">
      <div className="bg-[#111820] border border-[#1E2A35] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#1E2A35] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[9px] tracking-widest text-[#3D5166]">PORTFOLIO SIMULATOR</p>
            <p className="text-[11px] text-[#6B8499] mt-0.5">Risk-adjusted allocation tool · no wallet required</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3D5166] text-[12px]">$</span>
            <input
              type="number"
              value={capital}
              min={0}
              onChange={(e) => setCapital(Math.max(0, Number(e.target.value)))}
              className="bg-[#0D1318] border border-[#1E2A35] rounded-lg px-3 py-1.5 text-[#C8D8E8] text-[13px] font-mono w-36 focus:outline-none focus:border-[#00D4FF]/40 tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1E2A35]">
          {/* Sliders */}
          <div className="lg:col-span-2 p-6 space-y-4">
            {top6.map((opp) => {
              const alloc = allocations[opp.id] ?? 0;
              return (
                <div key={opp.id} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-[11px] text-[#C8D8E8] truncate font-medium">{opp.protocol}</p>
                    <p className="text-[9px] text-emerald-400">{opp.totalAPY.toFixed(2)}% APY</p>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={alloc}
                    onChange={(e) => handleSlider(opp.id, Number(e.target.value))}
                    className="flex-1 accent-sky-400 min-w-0"
                  />
                  <span className="text-sky-400 font-bold text-[13px] w-10 text-right tabular-nums shrink-0">
                    {alloc.toFixed(0)}%
                  </span>
                  <span className="text-[#3D5166] text-[11px] w-20 text-right tabular-nums shrink-0 hidden sm:block">
                    ${((capital * alloc) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
            <div className="pt-2 border-t border-[#1E2A35] flex justify-between text-[10px]">
              <span className="text-[#3D5166]">TOTAL ALLOCATED</span>
              <span className={totalAlloc === 100 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {totalAlloc.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Output panel */}
          <div className="p-6 bg-[#0D1318] flex flex-col gap-4">
            <p className="text-[9px] tracking-widest text-[#3D5166]">PROJECTED RETURNS</p>
            <OutputStat label="Blended APY" value={`${blendedAPY.toFixed(2)}%`} accent="emerald" large />
            <OutputStat label="Blended Risk Score" value={blendedRisk.toFixed(1)} accent="sky" />
            <div className="border-t border-[#1E2A35] pt-3 space-y-3">
              <OutputStat
                label="Annual Yield"
                value={`$${annualYield.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                accent="emerald"
              />
              <OutputStat
                label="Monthly Yield"
                value={`$${monthlyYield.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
              />
              <OutputStat
                label="Daily Yield"
                value={`$${dailyYield.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
              />
            </div>
            <p className="text-[8px] text-[#2D4A5E] mt-auto">
              Projected returns are estimates based on current APY. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
