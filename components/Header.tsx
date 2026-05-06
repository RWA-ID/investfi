"use client";
import { useState } from "react";

export default function Header() {
  const [view, setView] = useState<"institutional" | "retail">("institutional");

  return (
    <header className="border-b border-[#1E2A35] bg-[#0B0F14]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-[#00D4FF] to-[#0099BB] flex items-center justify-center text-[10px] font-bold text-black">
            FI
          </div>
          <span className="text-sm font-semibold tracking-widest text-[#C8D8E8]">
            INVESTFI<span className="text-[#3D5166]">.ETH</span>
          </span>
          <span className="hidden sm:block text-[10px] text-[#3D5166] border border-[#1E2A35] px-1.5 py-0.5 rounded">
            TERMINAL v2.1
          </span>
        </div>

        {/* Center stats */}
        <div className="hidden lg:flex items-center gap-6 text-[11px]">
          <Stat label="TRACKED PROTOCOLS" value="15" />
          <Stat label="AVG APY" value="7.24%" up />
          <Stat label="TOTAL TVL" value="$41.5B" />
          <Stat label="LAST UPDATE" value="LIVE" pulse />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-[#1E2A35] rounded p-0.5 text-[11px]">
            <button
              onClick={() => setView("institutional")}
              className={`px-3 py-1 rounded transition-colors ${
                view === "institutional"
                  ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30"
                  : "text-[#3D5166] hover:text-[#6B8499]"
              }`}
            >
              INSTITUTIONAL
            </button>
            <button
              onClick={() => setView("retail")}
              className={`px-3 py-1 rounded transition-colors ${
                view === "retail"
                  ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30"
                  : "text-[#3D5166] hover:text-[#6B8499]"
              }`}
            >
              RETAIL
            </button>
          </div>

          {/* Upgrade */}
          <button className="hidden sm:block text-[11px] border border-[#FFD700]/30 text-[#FFD700] px-3 py-1.5 rounded hover:bg-[#FFD700]/10 transition-colors">
            PRO ACCESS
          </button>

          {/* Connect */}
          <button className="text-[11px] bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF] px-3 py-1.5 rounded hover:bg-[#00D4FF]/20 transition-colors">
            CONNECT
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, up, pulse }: { label: string; value: string; up?: boolean; pulse?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[#3D5166] text-[9px] tracking-widest">{label}</span>
      <span className={`font-semibold text-[12px] flex items-center gap-1 ${up ? "text-emerald-400" : "text-[#C8D8E8]"}`}>
        {pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        {value}
      </span>
    </div>
  );
}
