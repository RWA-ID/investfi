import Link from "next/link";
import Header from "@/components/Header";
import { GlassCard } from "@/components/atoms";
import { WEIGHTS_LABELS, WEIGHTS_PCT } from "@/lib/risk";
import type { RiskBreakdown } from "@/lib/types";

export const metadata = {
  title: "Methodology · InvestFi",
  description: "How InvestFi scores risk-adjusted DeFi yields.",
};

export default function MethodologyPage() {
  const factors = (Object.keys(WEIGHTS_LABELS) as (keyof RiskBreakdown)[]).map((k) => ({
    key: k,
    label: WEIGHTS_LABELS[k],
    weight: WEIGHTS_PCT[k],
  }));

  return (
    <div className="app-root min-h-screen">
      <Header />

      <main className="detail">
        <div className="detail__bg" aria-hidden />
        <div className="container-if">
          <Link href="/" className="detail__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to scanner
          </Link>

          <div className="detail__hero">
            <div className="detail__hero-l">
              <div>
                <div className="detail__crumbs">
                  <span>InvestFi</span>
                  <span>/</span>
                  <span className="detail__crumbs-cur">Methodology</span>
                </div>
                <h1 className="detail__title">How we score yield.</h1>
                <p
                  className="detail__about-text"
                  style={{ maxWidth: 680, marginTop: 14, marginBottom: 0 }}
                >
                  InvestFi ranks DeFi opportunities by{" "}
                  <strong style={{ color: "var(--accent)" }}>risk-adjusted yield</strong> — a
                  single number that lets a treasury or family office compare a Lido validator
                  against an Aave money market against a Pendle PT, on the same axis.
                </p>
              </div>
            </div>
          </div>

          <div className="detail__row detail__row--3">
            <GlassCard>
              <div className="section-head">
                <h3 className="section-head__title">Risk-adjusted yield</h3>
              </div>
              <p className="detail__about-text">
                We define <code style={{ color: "var(--accent)" }}>RAY = Total APY ÷ Risk score</code>.
                A 6% APY at risk 2 (RAY 3.0) ranks higher than a 12% APY at risk 5 (RAY 2.4) — the
                latter has to compensate the holder more per unit of risk to be worth it.
              </p>
              <p className="detail__about-text">
                Total APY is base yield + token incentives. Risk score is a five-factor weighted
                score, 1 (safest) to 10, computed from the breakdown below.
              </p>
            </GlassCard>

            <GlassCard>
              <div className="section-head">
                <h3 className="section-head__title">Risk factors &amp; weights</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
                {factors.map((f) => (
                  <div
                    key={f.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: 10,
                      borderBottom: "1px solid var(--hair)",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--ink-1)" }}>{f.label}</span>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: 13, color: "var(--accent)", fontWeight: 550 }}
                    >
                      {f.weight}%
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="detail__row detail__row--3">
            <GlassCard>
              <div className="section-head">
                <h3 className="section-head__title">Data sources</h3>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                <li>
                  <div style={{ fontSize: 13.5, fontWeight: 550 }}>DeFiLlama Yields</div>
                  <p className="detail__about-text" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    Live APY, base + reward APY, TVL, and 30-day volatility (sigma) for every
                    pool. Refreshed hourly.
                  </p>
                </li>
                <li>
                  <div style={{ fontSize: 13.5, fontWeight: 550 }}>Alchemy Prices</div>
                  <p className="detail__about-text" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    ETH and BTC spot for the stats bar and TVL conversions.
                  </p>
                </li>
                <li>
                  <div style={{ fontSize: 13.5, fontWeight: 550 }}>Dune Analytics</div>
                  <p className="detail__about-text" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    7-day protocol revenue used to verify that yield is real (paying users) vs.
                    purely incentive-driven.
                  </p>
                </li>
                <li>
                  <div style={{ fontSize: 13.5, fontWeight: 550 }}>1inch Fusion+</div>
                  <p className="detail__about-text" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    Live swap quotes when you allocate. We charge 0.50% on the swap (set by
                    InvestFi) — that is how the platform is funded.
                  </p>
                </li>
              </ul>
            </GlassCard>

            <GlassCard>
              <div className="section-head">
                <h3 className="section-head__title">What we don&apos;t do</h3>
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "var(--ink-1)",
                }}
              >
                <li>· Custody assets. You allocate from your own wallet, period.</li>
                <li>· Front-run, MEV-extract, or wholesale your order flow.</li>
                <li>· Promote pools sponsored by their own teams without labeling.</li>
                <li>· Charge subscriptions or paywalls. The data is free.</li>
                <li>
                  · Replace your due diligence. Audit reports and protocol risk are surfaced; the
                  decision is yours.
                </li>
              </ul>
            </GlassCard>
          </div>

          <div className="detail__row" style={{ gridTemplateColumns: "1fr" }}>
            <GlassCard>
              <div className="section-head">
                <h3 className="section-head__title">Scoring example</h3>
              </div>
              <p className="detail__about-text">
                Take Aave V3 USDC: 5.2% total APY, smart-contract risk 1.5, token volatility 2.0,
                impermanent loss 1.0, liquidity depth 2.0, protocol reputation 1.0. Apply the
                weights from the table above:
              </p>
              <pre
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 12.5,
                  fontFamily: "var(--font-geist-mono, monospace)",
                  color: "var(--ink-1)",
                  margin: "10px 0 0",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
{`risk = 1.5·0.30 + 2.0·0.20 + 1.0·0.10 + 2.0·0.15 + 1.0·0.25
     = 0.45 + 0.40 + 0.10 + 0.30 + 0.25 = 1.50

RAY  = 5.20% ÷ 1.50 = 3.47%`}
              </pre>
              <p className="detail__about-text" style={{ marginTop: 14 }}>
                A higher RAY means more yield per unit of risk taken. Sort the dashboard by{" "}
                <strong>Risk-adj</strong> to see the ranking.
              </p>
            </GlassCard>
          </div>

          <footer className="if-footer">
            <div className="if-footer__l">
              <span className="if-footer__brand">
                Invest<span style={{ color: "var(--accent)" }}>Fi</span>
              </span>
              <span>investfi.eth · Methodology v1 · Not financial advice</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
