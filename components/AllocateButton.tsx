"use client";

import { useState } from "react";
import AllocateModal from "@/components/AllocateModal";
import type { Opportunity } from "@/lib/types";

export default function AllocateButton({ opp }: { opp: Opportunity }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF] px-4 py-2 rounded hover:bg-[#00D4FF]/20 transition-colors font-semibold tracking-wide"
      >
        ALLOCATE →
      </button>
      {open && <AllocateModal opp={opp} onClose={() => setOpen(false)} />}
    </>
  );
}
