"use client";

import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useState } from "react";

export default function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  if (isConnected && truncated) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="flex items-center gap-2 text-[11px] bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-400/20 transition-colors font-mono tracking-wide"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {truncated}
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 bg-[#111820] border border-[#1E2A35] rounded-xl shadow-2xl shadow-black/50 overflow-hidden w-48">
              <button
                onClick={() => { open({ view: "Account" }); setShowMenu(false); }}
                className="w-full text-left px-4 py-3 text-[11px] text-[#C8D8E8] hover:bg-[#1E2A35] transition-colors"
              >
                View Account
              </button>
              <div className="border-t border-[#1E2A35]" />
              <button
                onClick={() => { disconnect(); setShowMenu(false); }}
                className="w-full text-left px-4 py-3 text-[11px] text-red-400 hover:bg-[#1E2A35] transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="text-[11px] bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF] px-3 py-1.5 rounded-lg hover:bg-[#00D4FF]/20 transition-colors tracking-wide"
    >
      CONNECT WALLET
    </button>
  );
}
