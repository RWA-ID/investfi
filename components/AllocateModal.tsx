"use client";

import { useState, useEffect, useCallback } from "react";
import type { Opportunity } from "@/lib/types";

// Token info per protocol — what the user receives when they allocate
const DEPOSIT_TOKEN: Record<string, { symbol: string; address: string }> = {
  "aave-v3-eth-usdc":    { symbol: "aUSDC",  address: "0xBcca60bB61934080951369a648Fb03DF4F96263C" },
  "aave-v3-arb-usdc":    { symbol: "aUSDC",  address: "0x625E7708f30cA75bfd92586e17077590C60eb4cD" },
  "compound-v3-eth-usdc":{ symbol: "cUSDCv3",address: "0xc3d688B66703497DAA19211EEdff47f25384cdc3" },
  "spark-usds":          { symbol: "sUSDS",  address: "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD" },
  "lido-steth":          { symbol: "stETH",  address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84" },
  "rocketpool-reth":     { symbol: "rETH",   address: "0xae78736Cd615f374D3085123A210448E74Fc6393" },
  "morpho-steakusdc":    { symbol: "steakUSDC", address: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB" },
  "pendle-usdg":         { symbol: "PT-USDG", address: "0x6b4B077cf9e31a8703f32Aa50C27B95e07c8aa3e" },
  "ondo-usdyc":          { symbol: "USDY",   address: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C" },
  "maple-usdc":          { symbol: "USDC",   address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  "superstate-ustb":     { symbol: "USTB",   address: "0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e" },
  "openeden-tbill":      { symbol: "TBILL",  address: "0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a" },
};

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY ?? "";
const FEE_RECEIVER = process.env.NEXT_PUBLIC_INVESTFI_FEE_RECEIVER ?? "";
const FEE_BPS = parseInt(process.env.NEXT_PUBLIC_1INCH_FEE_BPS ?? "50", 10);

interface QuoteResult {
  toAmount: string;
  estimatedGas: string;
  protocols: string[][];
}

interface Props {
  opp: Opportunity;
  onClose: () => void;
}

export default function AllocateModal({ opp, onClose }: Props) {
  const [amount, setAmount] = useState("1000");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositToken = DEPOSIT_TOKEN[opp.id] ?? { symbol: "Protocol Token", address: "" };
  const amountWei = Math.floor(parseFloat(amount || "0") * 1e6).toString(); // USDC = 6 decimals

  const fetchQuote = useCallback(async () => {
    if (!depositToken.address || parseFloat(amount) < 1) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        src: USDC_ADDRESS,
        dst: depositToken.address,
        amount: amountWei,
        includeProtocols: "true",
        fee: (FEE_BPS / 10000).toString(),
        referrerAddress: FEE_RECEIVER,
      });
      const res = await fetch(
        `https://api.1inch.dev/swap/v6.0/1/quote?${params}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
      const data = await res.json();
      setQuote({
        toAmount: data.dstAmount ?? data.toAmount ?? "0",
        estimatedGas: data.gas ?? data.estimatedGas ?? "0",
        protocols: data.protocols?.flat(2).map((p: { name: string }) => p.name).slice(0, 3) ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote unavailable");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [amount, amountWei, depositToken.address]);

  // Debounce quote fetch
  useEffect(() => {
    const t = setTimeout(fetchQuote, 600);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  const outAmount = quote
    ? (parseInt(quote.toAmount) / 1e18).toFixed(6)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md bg-[#0B0F14] border border-[#1E2A35] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-[#1E2A35] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] tracking-widest text-[#3D5166]">ALLOCATE VIA 1INCH</p>
              <p className="text-[14px] font-semibold text-white mt-0.5">{opp.protocol}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#3D5166] hover:text-[#C8D8E8] transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* From */}
            <div>
              <p className="text-[9px] tracking-widest text-[#3D5166] mb-2">YOU PAY</p>
              <div className="flex items-center gap-3 bg-[#111820] border border-[#1E2A35] rounded-xl px-4 py-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-white text-[18px] font-mono w-full focus:outline-none tabular-nums"
                  />
                  <p className="text-[10px] text-[#3D5166] mt-0.5">
                    ≈ ${parseFloat(amount || "0").toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0 bg-[#1E2A35] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#C8D8E8]">
                  USDC
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center text-[#3D5166]">
              <div className="border border-[#1E2A35] rounded-full w-8 h-8 flex items-center justify-center">
                ↓
              </div>
            </div>

            {/* To */}
            <div>
              <p className="text-[9px] tracking-widest text-[#3D5166] mb-2">YOU RECEIVE</p>
              <div className="flex items-center gap-3 bg-[#111820] border border-[#1E2A35] rounded-xl px-4 py-3">
                <div className="flex-1">
                  {loading ? (
                    <div className="h-6 bg-[#1E2A35] rounded animate-pulse w-32" />
                  ) : outAmount ? (
                    <p className="text-emerald-400 text-[18px] font-mono font-semibold tabular-nums">
                      {outAmount}
                    </p>
                  ) : (
                    <p className="text-[#3D5166] text-[14px] font-mono">—</p>
                  )}
                  <p className="text-[10px] text-[#3D5166] mt-0.5">
                    {quote ? `via ${quote.protocols.join(" → ")}` : "Enter amount to get quote"}
                  </p>
                </div>
                <div className="shrink-0 bg-[#1E2A35] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#C8D8E8]">
                  {depositToken.symbol}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Fee info */}
            <div className="border border-[#1E2A35] rounded-xl px-4 py-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#3D5166]">Protocol APY</span>
                <span className="text-emerald-400 font-semibold">{opp.totalAPY.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D5166]">InvestFi referral fee</span>
                <span className="text-[#6B8499]">{FEE_BPS / 100}%</span>
              </div>
              {quote?.estimatedGas && (
                <div className="flex justify-between">
                  <span className="text-[#3D5166]">Est. gas</span>
                  <span className="text-[#6B8499]">{parseInt(quote.estimatedGas).toLocaleString()} gas units</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => window.open(opp.url, "_blank")}
              className="w-full bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF] py-3 rounded-xl text-[12px] font-semibold tracking-wide hover:bg-[#00D4FF]/20 transition-colors"
            >
              OPEN {opp.protocol.toUpperCase()} →
            </button>

            <p className="text-[9px] text-[#2D4A5E] text-center">
              Swap quotes via 1inch Fusion+ · 0.5% referral fee supports InvestFi · Not financial advice
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
