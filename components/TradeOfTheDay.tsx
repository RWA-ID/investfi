"use client";
import { useEffect, useMemo, useState } from "react";
import type { Opportunity } from "@/lib/types";
import { riskAdjustedYield } from "@/lib/risk";
import AllocateModal from "./AllocateModal";
import { ProtoMark, ChainBadge, Ticker } from "./atoms";
import { fmtUsdShort } from "@/lib/format";
import { oneInchUrl, isOneInchConfigured } from "@/lib/oneinch";

// 1inch v6 reliably routes USDC → these. PT/wrapper tokens (Pendle PT,
// steakUSDC, etc.) require their protocol's router and are excluded here so
// the live quote always works.
const SWAPPABLE: Record<string, { symbol: string; address: string; decimals: number }> = {
  "lido-steth":      { symbol: "stETH", address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", decimals: 18 },
  "rocketpool-reth": { symbol: "rETH",  address: "0xae78736Cd615f374D3085123A210448E74Fc6393", decimals: 18 },
  "ondo-usdyc":      { symbol: "USDY",  address: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C", decimals: 18 },
};

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const FEE_RECEIVER = process.env.NEXT_PUBLIC_INVESTFI_FEE_RECEIVER ?? "";
const FEE_BPS = parseInt(process.env.NEXT_PUBLIC_1INCH_FEE_BPS ?? "50", 10);
const SAMPLE_USDC = 1000;

interface QuoteState {
  toAmount: string | null;
  protocols: string[];
  error: string | null;
  loading: boolean;
}

export default function TradeOfTheDay({ opportunities }: { opportunities: Opportunity[] }) {
  const ranked = useMemo(() => {
    return opportunities
      .filter((o) => SWAPPABLE[o.id])
      .sort(
        (a, b) =>
          riskAdjustedYield(b.totalAPY, b.riskScore) - riskAdjustedYield(a.totalAPY, a.riskScore)
      );
  }, [opportunities]);

  const [pickIdx, setPickIdx] = useState(0);
  const pick = ranked[pickIdx] ?? null;

  const [quote, setQuote] = useState<QuoteState>({
    toAmount: null,
    protocols: [],
    error: null,
    loading: true,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!pick) return;
    const tok = SWAPPABLE[pick.id];
    if (!tok || !isOneInchConfigured()) {
      setQuote({
        toAmount: null,
        protocols: [],
        error: isOneInchConfigured() ? "no token" : null,
        loading: false,
      });
      return;
    }
    let cancelled = false;
    setQuote((q) => ({ ...q, loading: true, error: null }));
    const { url, headers } = oneInchUrl(1, "quote", {
      src: USDC,
      dst: tok.address,
      amount: SAMPLE_USDC * 1e6,
      includeProtocols: "true",
      fee: FEE_BPS / 10000,
      referrerAddress: FEE_RECEIVER,
    });
    fetch(url, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        const raw = data.dstAmount ?? data.toAmount ?? "0";
        const decimals = tok.decimals;
        const out = (Number(raw) / 10 ** decimals).toFixed(decimals === 18 ? 6 : 2);
        const protos =
          data.protocols?.flat(2).map((p: { name: string }) => p.name).slice(0, 3) ?? [];
        setQuote({ toAmount: out, protocols: protos, error: null, loading: false });
      })
      .catch((e) => {
        if (cancelled) return;
        // 1inch can refuse routes for some receipt tokens (PT, wrappers, etc.).
        // Fall back to the next opportunity by RAY rank.
        if (pickIdx < ranked.length - 1) {
          setPickIdx((i) => i + 1);
          return;
        }
        setQuote({ toAmount: null, protocols: [], error: e.message, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [pick]);

  if (!pick) return null;
  const tok = SWAPPABLE[pick.id];
  const ra = riskAdjustedYield(pick.totalAPY, pick.riskScore);
  const projectedYearly = SAMPLE_USDC * (pick.totalAPY / 100);

  return (
    <>
      <section
        className="glass-card"
        style={{
          padding: 24,
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--accent) 6%, transparent), rgba(255,255,255,.012))",
          borderColor: "color-mix(in oklab, var(--accent) 22%, var(--line))",
          marginTop: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 10.5,
                letterSpacing: ".22em",
                color: "var(--accent)",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--accent)",
                  boxShadow: "0 0 8px var(--accent)",
                }}
              />
              Trade of the day
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ProtoMark logo={pick.protocolLogo} id={pick.id} size={48} alt={pick.protocol} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.015em" }}>
                  Swap USDC → {tok.symbol}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                    fontSize: 12.5,
                    color: "var(--ink-2)",
                  }}
                >
                  <ChainBadge chain={pick.chain} compact />
                  <span>{pick.protocol}</span>
                  <span style={{ color: "var(--ink-3)" }}>· {pick.strategyType}</span>
                </div>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                color: "var(--ink-2)",
                fontSize: 13.5,
                lineHeight: 1.55,
                maxWidth: 540,
                textWrap: "pretty" as React.CSSProperties["textWrap"],
              }}
            >
              Highest risk-adjusted yield routable through 1inch right now. Live quote refreshes
              when you open the swap.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
              <button className="btn btn--primary" onClick={() => setOpen(true)}>
                Allocate ${SAMPLE_USDC.toLocaleString()}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
              <a
                href={`https://app.1inch.io/#/1/simple/swap/${USDC}/${tok.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                Open in 1inch
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              alignContent: "start",
              minWidth: 280,
            }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.025)",
                gridColumn: "1 / -1",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 10,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 8,
                }}
              >
                $1,000 USDC quote · 1inch
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 550,
                  letterSpacing: "-.02em",
                  color: "var(--accent)",
                  textShadow: "0 0 16px var(--accent-glow)",
                }}
                className="tabular-nums"
              >
                {quote.loading
                  ? "…"
                  : quote.toAmount
                  ? `${Number(quote.toAmount).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${tok.symbol}`
                  : "—"}
              </div>
              {quote.protocols.length > 0 && (
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono, monospace)",
                    fontSize: 10,
                    letterSpacing: ".06em",
                    color: "var(--ink-3)",
                    marginTop: 6,
                  }}
                >
                  via {quote.protocols.join(" · ")}
                </div>
              )}
              {quote.error && !quote.loading && (
                <div style={{ fontSize: 11, color: "var(--down)", marginTop: 4 }}>
                  Quote unavailable — open in 1inch to get live pricing.
                </div>
              )}
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.018)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 9.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 4,
                }}
              >
                Total APY
              </div>
              <div
                className="tabular-nums"
                style={{ fontSize: 18, fontWeight: 550, color: "var(--accent)" }}
              >
                <Ticker value={pick.totalAPY} decimals={2} suffix="%" />
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.018)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 9.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 4,
                }}
              >
                Risk-adj
              </div>
              <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 550 }}>
                {ra.toFixed(2)}%
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.018)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 9.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 4,
                }}
              >
                Yearly on $1k
              </div>
              <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 550 }}>
                <Ticker value={projectedYearly} format={fmtUsdShort} />
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.018)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 9.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 4,
                }}
              >
                TVL
              </div>
              <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 550 }}>
                {fmtUsdShort(pick.tvl)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {open && <AllocateModal opp={pick} onClose={() => setOpen(false)} />}
    </>
  );
}
