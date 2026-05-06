import { notFound } from "next/navigation";
import Link from "next/link";
import { getOpportunity, getComparables } from "@/lib/data";
import { formatTVL, formatAPY, formatPct } from "@/lib/format";
import { riskAdjustedYield, riskColor, riskBg, WEIGHTS_LABELS, WEIGHTS_PCT } from "@/lib/risk";
import Header from "@/components/Header";
import RiskBadge from "@/components/RiskBadge";
import ChainBadge from "@/components/ChainBadge";
import APYChart from "@/components/APYChart";
import type { RiskBreakdown } from "@/lib/types";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = getOpportunity(id);
  if (!opp) notFound();

  const comparables = getComparables(opp.comparables);
  const ra = riskAdjustedYield(opp.totalAPY, opp.riskScore);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Back + breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-[#3D5166]">
          <Link href="/" className="hover:text-[#00D4FF] transition-colors">← SCANNER</Link>
          <span>/</span>
          <span className="text-[#6B8499]">{opp.protocol}</span>
        </div>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Identity */}
          <div className="lg:col-span-2 bg-[#111820] border border-[#1E2A35] rounded-xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E2A35] to-[#0D1318] border border-[#1E2A35] flex items-center justify-center text-lg font-bold text-[#6B8499]">
                  {opp.protocolLogo}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{opp.protocol}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <ChainBadge chain={opp.chain} />
                    <span className="text-[11px] text-[#6B8499] border border-[#1E2A35] px-2 py-0.5 rounded">
                      {opp.strategyType}
                    </span>
                    {opp.audited && (
                      <span className="text-[10px] text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 rounded">
                        AUDITED
                      </span>
                    )}
                    {opp.tags.map((t) => (
                      <span key={t} className="text-[9px] text-[#3D5166] border border-[#1E2A35] px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] border border-[#00D4FF]/30 text-[#00D4FF] px-4 py-2 rounded hover:bg-[#00D4FF]/10 transition-colors"
              >
                OPEN PROTOCOL →
              </a>
            </div>

            <p className="mt-5 text-[#6B8499] text-sm leading-relaxed border-l-2 border-[#1E2A35] pl-4">
              {opp.yieldSource}
            </p>

            <div className="mt-4 bg-[#0D1318] border border-[#1E2A35] rounded-lg p-4">
              <p className="text-[9px] tracking-widest text-[#3D5166] mb-1">BEST USE CASE</p>
              <p className="text-[#C8D8E8] text-sm">{opp.bestUseCase}</p>
            </div>
          </div>

          {/* Right: Key metrics */}
          <div className="flex flex-col gap-3">
            <MetricCard label="TOTAL APY" value={formatAPY(opp.totalAPY)} accent="emerald" size="xl" />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="BASE APY" value={formatAPY(opp.baseAPY)} accent="sky" />
              <MetricCard label="INCENTIVES" value={`+${formatAPY(opp.incentiveAPY)}`} accent="amber" />
              <MetricCard label="RISK-ADJ YIELD" value={formatAPY(ra)} accent="sky" />
              <MetricCard label="RISK SCORE" value={opp.riskScore.toFixed(1)} accent={opp.riskScore <= 3.5 ? "emerald" : opp.riskScore <= 5.5 ? "amber" : "red"} />
              <MetricCard label="TVL" value={formatTVL(opp.tvl)} />
              <MetricCard label="30D VOLATILITY" value={formatPct(opp.volatility30d)} />
            </div>
          </div>
        </div>

        {/* APY History + Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* APY Chart */}
          <div className="bg-[#111820] border border-[#1E2A35] rounded-xl p-6">
            <p className="text-[9px] tracking-widest text-[#3D5166] mb-4">HISTORICAL APY (24 MONTHS)</p>
            <APYChart data={opp.historicalAPY} />
          </div>

          {/* Risk breakdown */}
          <div className="bg-[#111820] border border-[#1E2A35] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] tracking-widest text-[#3D5166]">RISK ANALYSIS</p>
              <RiskBadge score={opp.riskScore} breakdown={opp.riskBreakdown} />
            </div>
            <RiskBreakdownChart breakdown={opp.riskBreakdown} />

            <div className="mt-4 pt-4 border-t border-[#1E2A35] grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="text-[#3D5166] text-[9px]">CONTRACT AGE</p>
                <p className="text-[#C8D8E8] mt-0.5">{opp.contractAge} months</p>
              </div>
              <div>
                <p className="text-[#3D5166] text-[9px]">AUDITED BY</p>
                <p className="text-[#C8D8E8] mt-0.5">{opp.auditFirms.join(", ")}</p>
              </div>
              <div>
                <p className="text-[#3D5166] text-[9px]">LIQUIDITY DEPTH</p>
                <p className="text-[#C8D8E8] mt-0.5">{formatTVL(opp.liquidityDepth)}</p>
              </div>
              <div>
                <p className="text-[#3D5166] text-[9px]">RISK-ADJ YIELD</p>
                <p className="text-sky-400 mt-0.5 font-semibold">{formatAPY(ra)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparables */}
        {comparables.length > 0 && (
          <div className="bg-[#111820] border border-[#1E2A35] rounded-xl p-6">
            <p className="text-[9px] tracking-widest text-[#3D5166] mb-4">COMPARABLE ALTERNATIVES</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comparables.map((c) => {
                const cra = riskAdjustedYield(c.totalAPY, c.riskScore);
                return (
                  <Link
                    key={c.id}
                    href={`/opportunity/${c.id}`}
                    className="border border-[#1E2A35] rounded-lg p-4 hover:border-[#00D4FF]/30 hover:bg-[#0D1318] transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-[#0D1318] border border-[#1E2A35] flex items-center justify-center text-[9px] font-bold text-[#6B8499]">
                          {c.protocolLogo}
                        </div>
                        <div>
                          <p className="text-[#C8D8E8] text-[12px] font-semibold group-hover:text-white">{c.protocol}</p>
                          <ChainBadge chain={c.chain} />
                        </div>
                      </div>
                      <RiskBadge score={c.riskScore} breakdown={c.riskBreakdown} compact />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[9px] text-[#3D5166]">APY</p>
                        <p className="text-emerald-400 font-bold text-sm">{formatAPY(c.totalAPY)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#3D5166]">RISK-ADJ</p>
                        <p className="text-sky-400 text-sm">{formatAPY(cra)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#3D5166]">TVL</p>
                        <p className="text-[#C8D8E8] text-[11px]">{formatTVL(c.tvl)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Institutional access CTA */}
        <div className="border border-[#FFD700]/20 bg-[#FFD700]/5 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#FFD700] font-semibold text-sm">Institutional Access</p>
            <p className="text-[#6B8499] text-xs mt-1">
              Get real-time yield data, allocation analytics, and direct protocol integrations for your fund.
            </p>
          </div>
          <button className="text-[11px] bg-[#FFD700]/10 border border-[#FFD700]/40 text-[#FFD700] px-6 py-2.5 rounded hover:bg-[#FFD700]/20 transition-colors">
            REQUEST ACCESS →
          </button>
        </div>
      </div>

      <footer className="border-t border-[#1E2A35] py-4 px-4 text-center mt-auto">
        <p className="text-[10px] text-[#3D5166] tracking-widest">
          INVESTFI.ETH — NOT FINANCIAL ADVICE
        </p>
      </footer>
    </div>
  );
}

function MetricCard({
  label, value, accent, size,
}: {
  label: string; value: string; accent?: string; size?: "xl";
}) {
  const color =
    accent === "emerald" ? "text-emerald-400" :
    accent === "sky" ? "text-sky-400" :
    accent === "amber" ? "text-amber-400" :
    accent === "red" ? "text-red-400" :
    "text-[#C8D8E8]";

  return (
    <div className="bg-[#111820] border border-[#1E2A35] rounded-xl p-4 flex flex-col gap-1">
      <p className="text-[9px] tracking-widest text-[#3D5166]">{label}</p>
      <p className={`font-bold tabular-nums ${color} ${size === "xl" ? "text-4xl" : "text-xl"}`}>{value}</p>
    </div>
  );
}

function RiskBreakdownChart({ breakdown }: { breakdown: RiskBreakdown }) {
  return (
    <div className="flex flex-col gap-3">
      {(Object.keys(breakdown) as (keyof RiskBreakdown)[]).map((k) => {
        const v = breakdown[k];
        const color = v <= 3 ? "bg-emerald-400" : v <= 5.5 ? "bg-amber-400" : "bg-red-500";
        const textColor = riskColor(v);
        return (
          <div key={k}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#C8D8E8]">{WEIGHTS_LABELS[k]}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#3D5166] text-[9px]">{WEIGHTS_PCT[k]}% weight</span>
                <span className={`font-semibold tabular-nums ${textColor}`}>{v.toFixed(1)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-[#1E2A35] rounded overflow-hidden">
              <div className={`h-full rounded ${color} transition-all`} style={{ width: `${(v / 10) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
