export default function BackedBy() {
  return (
    <section className="mt-12 mb-8">
      {/* Section header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-[10px] tracking-widest text-[#3D5166] mb-1">BACKED BY</h2>
          <p className="text-[12px] text-[#6B8499]">
            Partner with the leading DeFi intelligence terminal for institutional allocators.
          </p>
        </div>
        <a
          href="mailto:hello@investfi.eth"
          className="text-[11px] border border-[#00D4FF]/30 text-[#00D4FF] px-5 py-2.5 rounded-lg hover:bg-[#00D4FF]/10 transition-colors tracking-wide shrink-0"
        >
          BECOME A BACKER →
        </a>
      </div>

      {/* 6 available slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <a
            key={i}
            href="mailto:hello@investfi.eth"
            className="group border border-dashed border-[#1E2A35] hover:border-[#00D4FF]/30 rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[130px] transition-all hover:bg-[#00D4FF]/5"
          >
            <div className="w-10 h-10 rounded-xl border border-dashed border-[#1E2A35] group-hover:border-[#00D4FF]/30 flex items-center justify-center transition-colors">
              <span className="text-[#2D4A5E] group-hover:text-[#00D4FF] text-lg transition-colors">+</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium tracking-widest text-[#2D4A5E] group-hover:text-[#00D4FF] transition-colors">
                AVAILABLE
              </p>
              <p className="text-[9px] text-[#1E2A35] group-hover:text-[#3D5166] mt-0.5 transition-colors">
                hello@investfi.eth
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* CTA description */}
      <div className="mt-5 border border-[#1E2A35] rounded-xl p-5 bg-[#0D1318] flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[#C8D8E8] text-[13px] font-semibold">Reach institutional DeFi allocators</p>
          <p className="text-[#3D5166] text-[11px] leading-relaxed max-w-xl">
            InvestFi.eth is used by funds, family offices, and protocol treasuries researching yield opportunities.
            Sponsor a slot to put your protocol in front of capital decision-makers.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px] text-[#3D5166] shrink-0">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" /> Lead Partner — full slot + featured placement</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Protocol Partner — slot + logo</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#3D5166]" /> Supporter — slot mention</span>
        </div>
      </div>
    </section>
  );
}
