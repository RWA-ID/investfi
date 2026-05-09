import { notFound } from "next/navigation";
import Link from "next/link";
import { getOpportunityById, getComparableOpportunities } from "@/lib/opportunities";
import { ENRICHMENT_BY_SLUG } from "@/lib/poolMap";
import { riskAdjustedYield, WEIGHTS_LABELS, WEIGHTS_PCT } from "@/lib/risk";
import Header from "@/components/Header";
import APYChart from "@/components/APYChart";
import OpportunityCard from "@/components/OpportunityCard";
import AllocatePanel from "@/components/AllocatePanel";
import { ProtoMark, ChainBadge, RiskPill, RiskBar, GlassCard, Ticker } from "@/components/atoms";
import { fmtUsdShort } from "@/lib/format";
import type { RiskBreakdown } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { POOL_ENRICHMENTS } = await import("@/lib/poolMap");
  return POOL_ENRICHMENTS.map((e) => ({ id: e.id }));
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = await getOpportunityById(id);
  if (!opp) notFound();

  const enrichment = ENRICHMENT_BY_SLUG.get(id);
  const comparables = enrichment
    ? await getComparableOpportunities(enrichment.comparables)
    : [];

  const ra = riskAdjustedYield(opp.totalAPY, opp.riskScore);

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

          {/* Hero */}
          <div className="detail__hero">
            <div className="detail__hero-l">
              <ProtoMark logo={opp.protocolLogo} id={opp.id} size={64} alt={opp.protocol} />
              <div>
                <div className="detail__crumbs">
                  <span>Scanner</span>
                  <span>/</span>
                  <span>{opp.strategyType}</span>
                  <span>/</span>
                  <span className="detail__crumbs-cur">{opp.protocol}</span>
                </div>
                <h1 className="detail__title">{opp.protocol}</h1>
                <div className="detail__chips">
                  <ChainBadge chain={opp.chain} />
                  <span className="detail__chip">{opp.strategyType}</span>
                  {opp.audited && (
                    <span className="detail__chip detail__chip--ok">
                      Audited · {opp.auditFirms.length}
                    </span>
                  )}
                  {opp.tags.map((t) => (
                    <span key={t} className="detail__chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="detail__hero-r">
              <a href={opp.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--lg">
                Open protocol
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </div>

          {/* Big metrics */}
          <div className="detail__metrics">
            <div className="metric metric--xl">
              <div className="metric__label">Total APY</div>
              <div className="metric__value metric__value--accent">
                <Ticker value={opp.totalAPY} decimals={2} suffix="%" />
              </div>
              <div className="metric__sub">
                {opp.baseAPY.toFixed(2)}% base
                {opp.incentiveAPY > 0 && ` + ${opp.incentiveAPY.toFixed(2)}% rewards`}
              </div>
            </div>
            <div className="metric">
              <div className="metric__label">Risk-adj yield</div>
              <div className="metric__value">
                <Ticker value={ra} decimals={2} suffix="%" />
              </div>
              <div className="metric__sub">APY ÷ risk score</div>
            </div>
            <div className="metric">
              <div className="metric__label">TVL</div>
              <div className="metric__value">{fmtUsdShort(opp.tvl)}</div>
              <div className="metric__sub">Liquidity {fmtUsdShort(opp.liquidityDepth)}</div>
            </div>
            <div className="metric">
              <div className="metric__label">Risk score</div>
              <div className="metric__value">
                <Ticker value={opp.riskScore} decimals={1} />
                <span className="metric__suf">/10</span>
              </div>
              <div className="metric__sub">
                <RiskPill score={opp.riskScore} compact />
              </div>
            </div>
            <div className="metric">
              <div className="metric__label">Volatility 30d</div>
              <div className="metric__value">
                <Ticker value={opp.volatility30d} decimals={2} suffix="%" />
              </div>
              <div className="metric__sub">{opp.contractAge} mo contract age</div>
            </div>
          </div>

          {/* Chart + Allocate */}
          <div className="detail__row">
            <GlassCard>
              <div className="section-head">
                <div>
                  <h3 className="section-head__title">Historical APY</h3>
                  <p className="section-head__sub">
                    {opp.historicalAPY.length} day series · DeFiLlama
                  </p>
                </div>
                <div className="detail__range">
                  {["7D", "30D", "90D", "1Y", "All"].map((r, i) => (
                    <button key={r} data-active={i === 2 || undefined}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {opp.historicalAPY.length > 0 ? (
                <APYChart data={opp.historicalAPY} />
              ) : (
                <div className="flex items-center justify-center h-28 text-[var(--ink-3)] text-[12px]">
                  No historical data available
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <div className="section-head">
                <div>
                  <h3 className="section-head__title">Allocate</h3>
                  <p className="section-head__sub">Project earnings at current APY</p>
                </div>
              </div>
              <AllocatePanel opp={opp} />
            </GlassCard>
          </div>

          {/* Source + Risk */}
          <div className="detail__row detail__row--3">
            <GlassCard>
              <div className="section-head">
                <div>
                  <h3 className="section-head__title">How it earns</h3>
                </div>
              </div>
              <p className="detail__about-text">{opp.yieldSource}</p>
              <div className="detail__use-case">
                <div className="detail__use-case-label">Best use case</div>
                <p>{opp.bestUseCase}</p>
              </div>
              {opp.auditFirms.length > 0 && (
                <div className="detail__audits">
                  <div className="detail__use-case-label">Audited by</div>
                  <div className="detail__audit-list">
                    {opp.auditFirms.map((a) => (
                      <span key={a} className="detail__audit">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <div className="section-head">
                <div>
                  <h3 className="section-head__title">Risk analysis</h3>
                  <p className="section-head__sub">Five-factor weighted score</p>
                </div>
                <RiskPill score={opp.riskScore} />
              </div>
              <div className="detail__risk-bars">
                {(Object.keys(opp.riskBreakdown) as (keyof RiskBreakdown)[]).map((k) => (
                  <RiskBar
                    key={k}
                    label={WEIGHTS_LABELS[k]}
                    value={opp.riskBreakdown[k]}
                    weight={WEIGHTS_PCT[k]}
                  />
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Comparables */}
          {comparables.length > 0 && (
            <div className="detail__comps">
              <div className="section-head section-head--inline">
                <div>
                  <h3 className="section-head__title section-head__title--lg">
                    Comparable opportunities
                  </h3>
                  <p className="section-head__sub">Same strategy, ranked by closeness</p>
                </div>
              </div>
              <div className="opp-grid">
                {comparables.map((c) => (
                  <OpportunityCard key={c.id} opp={c} />
                ))}
              </div>
            </div>
          )}

          <footer className="if-footer">
            <div className="if-footer__l">
              <span className="if-footer__brand">
                Invest<span style={{ color: "var(--accent)" }}>Fi</span>
              </span>
              <span>investfi.eth · Not financial advice</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
