"use client";

import { useState } from "react";
import AllocateModal from "@/components/AllocateModal";
import type { Opportunity } from "@/lib/types";

export default function AllocateButton({ opp, large = false }: { opp: Opportunity; large?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={`btn btn--primary${large ? " btn--lg" : ""}`}>
        Allocate
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
      {open && <AllocateModal opp={opp} onClose={() => setOpen(false)} />}
    </>
  );
}
