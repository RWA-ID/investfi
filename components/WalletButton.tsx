"use client";

import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useState } from "react";

export default function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);

  const truncated = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  if (isConnected && truncated) {
    const seed = parseInt(address!.slice(2, 8), 16) || 0;
    const hue1 = seed % 360;
    const hue2 = (seed * 7) % 360;
    const gradient = `linear-gradient(135deg, hsl(${hue1} 80% 60%), hsl(${hue2} 80% 55%))`;
    return (
      <div className="relative">
        <button className="wallet-btn wallet-btn--connected" onClick={() => setShowMenu((v) => !v)}>
          <span className="wallet-btn__avatar" style={{ background: gradient }} />
          <div className="wallet-btn__meta">
            <span className="wallet-btn__addr">{truncated}</span>
            <span className="wallet-btn__bal">connected</span>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div
              className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden w-48"
              style={{
                background: "rgba(10,13,17,.95)",
                border: "1px solid var(--line-2)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 12px 40px -10px rgba(0,0,0,.6)",
              }}
            >
              <button
                onClick={() => {
                  open({ view: "Account" });
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-[12px] text-[var(--ink-1)] hover:bg-white/5 transition-colors"
              >
                View Account
              </button>
              <div style={{ borderTop: "1px solid var(--hair)" }} />
              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-[12px] text-red-400 hover:bg-white/5 transition-colors"
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
    <button className="wallet-btn wallet-btn--connect" onClick={() => open()}>
      <span className="wallet-btn__pulse" />
      Connect Wallet
    </button>
  );
}
