"use client";
import { useState } from "react";
import type { Opportunity } from "@/lib/types";
import { Ticker, fmtUsdShort } from "./atoms";
import AllocateModal from "./AllocateModal";

const PRESETS = [1000, 10000, 100000, 1_000_000];

export default function AllocatePanel({ opp }: { opp: Opportunity }) {
  const [amount, setAmount] = useState(10000);
  const [open, setOpen] = useState(false);
  const projectedYear = amount * (opp.totalAPY / 100);

  return (
    <>
      <div className="alloc__amount">
        <span>$</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
        />
        <div className="alloc__chips">
          {PRESETS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              data-active={a === amount || undefined}
            >
              {a >= 1e6 ? "$1M" : a >= 1e3 ? `$${a / 1e3}K` : `$${a}`}
            </button>
          ))}
        </div>
      </div>

      <div className="alloc__projection">
        <div className="alloc__row">
          <span>Per day</span>
          <span>
            <Ticker value={projectedYear / 365} format={fmtUsdShort} />
          </span>
        </div>
        <div className="alloc__row">
          <span>Per month</span>
          <span>
            <Ticker value={projectedYear / 12} format={fmtUsdShort} />
          </span>
        </div>
        <div className="alloc__row alloc__row--big">
          <span>Per year</span>
          <span>
            <Ticker value={projectedYear} format={fmtUsdShort} />
          </span>
        </div>
      </div>

      <button className="btn btn--primary btn--block" onClick={() => setOpen(true)}>
        Continue to allocate
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
      {open && <AllocateModal opp={opp} onClose={() => setOpen(false)} />}
    </>
  );
}
