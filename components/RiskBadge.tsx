"use client";
import { riskColor, riskBg, WEIGHTS_LABELS, WEIGHTS_PCT } from "@/lib/risk";
import type { RiskBreakdown } from "@/lib/types";
import { useState } from "react";

interface Props {
  score: number;
  breakdown: RiskBreakdown;
  compact?: boolean;
}

export default function RiskBadge({ score, breakdown, compact }: Props) {
  const [open, setOpen] = useState(false);
  const color = riskColor(score);
  const bg = riskBg(score);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`inline-flex items-center gap-1.5 border rounded px-2 py-0.5 text-xs font-semibold tabular-nums ${bg} ${color} transition-all`}
      >
        <RiskDot score={score} />
        {score.toFixed(1)}
        {!compact && <span className="text-[9px] opacity-60">/ 10</span>}
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-full mt-1 w-64 bg-[#111820] border border-[#1E2A35] rounded-lg p-3 shadow-2xl text-[11px]">
          <p className="text-[#6B8499] mb-2 text-[10px] tracking-widest">RISK BREAKDOWN</p>
          {(Object.keys(breakdown) as (keyof RiskBreakdown)[]).map((k) => (
            <div key={k} className="mb-1.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-[#C8D8E8]">{WEIGHTS_LABELS[k]}</span>
                <span className={riskColor(breakdown[k])}>{breakdown[k].toFixed(1)}</span>
              </div>
              <div className="h-1 bg-[#1E2A35] rounded overflow-hidden">
                <div
                  className={`h-full rounded ${breakdown[k] <= 3 ? "bg-emerald-400" : breakdown[k] <= 5.5 ? "bg-amber-400" : "bg-red-500"}`}
                  style={{ width: `${(breakdown[k] / 10) * 100}%` }}
                />
              </div>
              <p className="text-[#3D5166] text-[9px] mt-0.5">weight: {WEIGHTS_PCT[k]}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RiskDot({ score }: { score: number }) {
  const cls =
    score <= 3 ? "bg-emerald-400" :
    score <= 5.5 ? "bg-amber-400" :
    score <= 7.5 ? "bg-orange-400" :
    "bg-red-500";
  return <span className={`w-1.5 h-1.5 rounded-full ${cls} animate-pulse`} />;
}
