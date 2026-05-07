"use client";
import { useState } from "react";
import WalletButton from "./WalletButton";

export type ViewMode = "institutional" | "retail";

interface Props {
  onViewChange?: (v: ViewMode) => void;
  view?: ViewMode;
}

export default function Header({ onViewChange, view = "institutional" }: Props) {
  return (
    <header className="border-b border-[#1E2A35] bg-[#0B0F14]/98 backdrop-blur sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0077AA] flex items-center justify-center text-[11px] font-bold text-black tracking-wide">
            FI
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest text-[#C8D8E8] leading-none">
              INVESTFI<span className="text-[#2D4A5E]">.ETH</span>
            </span>
            <span className="text-[9px] text-[#3D5166] tracking-widest mt-0.5">DeFi Intelligence Terminal</span>
          </div>
        </div>

        {/* Center live indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-[#3D5166]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE · DeFiLlama</span>
          <span className="mx-3 text-[#1E2A35]">|</span>
          <span>Revalidates every hour</span>
        </div>

        {/* Right: view toggle + wallet */}
        <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 border border-[#1E2A35] rounded-lg p-1 text-[11px] bg-[#0D1318]">
          {(["institutional", "retail"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange?.(v)}
              className={`px-4 py-1.5 rounded-md transition-all font-medium tracking-wide ${
                view === v
                  ? "bg-[#00D4FF]/15 text-[#00D4FF] shadow-sm"
                  : "text-[#3D5166] hover:text-[#6B8499]"
              }`}
            >
              {v === "institutional" ? "INSTITUTIONAL" : "RETAIL"}
            </button>
          ))}
        </div>
        <WalletButton />
        </div>
      </div>
    </header>
  );
}
