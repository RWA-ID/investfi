export default function BackedBy() {
  const tiers = [
    { color: "#FFD700", label: "Lead Partner", note: "full slot + featured placement" },
    { color: "var(--accent)", label: "Protocol Partner", note: "slot + logo" },
    { color: "var(--ink-3)", label: "Supporter", note: "slot mention" },
  ];
  return (
    <section className="backed">
      <div className="backed__head">
        <div>
          <h2 className="backed__eyebrow">BACKED BY</h2>
          <p className="backed__sub">
            Partner with the leading DeFi intelligence terminal for institutional allocators.
          </p>
        </div>
        <a className="backed__cta" href="mailto:hello@investfi.eth">
          BECOME A BACKER
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="backed__grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <a key={i} href="mailto:hello@investfi.eth" className="backed__slot">
            <div className="backed__plus">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="backed__slot-label">AVAILABLE</div>
            <div className="backed__slot-mail">hello@investfi.eth</div>
          </a>
        ))}
      </div>

      <div className="backed__pitch">
        <div>
          <div className="backed__pitch-title">Reach institutional DeFi allocators</div>
          <p className="backed__pitch-body">
            InvestFi.eth is used by funds, family offices, and protocol treasuries researching
            yield opportunities. Sponsor a slot to put your protocol in front of capital
            decision-makers.
          </p>
        </div>
        <div className="backed__tiers">
          {tiers.map((t) => (
            <div className="backed__tier" key={t.label}>
              <span
                className="backed__tier-dot"
                style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }}
              />
              <span className="backed__tier-label">{t.label}</span>
              <span className="backed__tier-note">— {t.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
