"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAccount, useSendTransaction, useReadContract, useWriteContract } from "wagmi";
import type { Opportunity } from "@/lib/types";

// Protocols where 1inch can route to the receipt token via DEX
const SWAPPABLE_TOKENS: Record<string, { symbol: string; address: string }> = {
  "lido-steth":       { symbol: "stETH",     address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84" },
  "rocketpool-reth":  { symbol: "rETH",       address: "0xae78736Cd615f374D3085123A210448E74Fc6393" },
  "morpho-steakusdc": { symbol: "steakUSDC",  address: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB" },
  "pendle-usdg":      { symbol: "PT-USDG",   address: "0x6b4B077cf9e31a8703f32Aa50C27B95e07c8aa3e" },
  "ondo-usdyc":       { symbol: "USDY",       address: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C" },
  "superstate-ustb":  { symbol: "USTB",       address: "0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e" },
  "openeden-tbill":   { symbol: "TBILL",      address: "0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a" },
};

// Protocols that require direct deposit — no 1inch route to their receipt token
const DIRECT_DEPOSIT: Record<string, { label: string; note: string }> = {
  "aave-v3-eth-usdc":     { label: "Deposit on Aave",     note: "Supply USDC directly on Aave to receive aUSDC." },
  "aave-v3-arb-usdc":     { label: "Deposit on Aave",     note: "Supply USDC directly on Aave (Arbitrum) to receive aUSDC." },
  "compound-v3-eth-usdc": { label: "Supply on Compound",  note: "Supply USDC directly on Compound v3 to earn cUSDCv3." },
  "spark-usds":           { label: "Deposit on Spark",    note: "Deposit USDS directly on Spark Protocol to receive sUSDS." },
  "maple-usdc":           { label: "Deposit on Maple",    note: "Deposit USDC directly via Maple Finance's pool UI." },
};

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ONEINCH_ROUTER = "0x111111125421cA6dc452d289314280a0f8842A65"; // 1inch v6 router
const ERC20_ABI = [
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }] },
] as const;

const API_KEY      = process.env.NEXT_PUBLIC_1INCH_API_KEY ?? "";
const FEE_RECEIVER = process.env.NEXT_PUBLIC_INVESTFI_FEE_RECEIVER ?? "";
const FEE_BPS      = parseInt(process.env.NEXT_PUBLIC_1INCH_FEE_BPS ?? "50", 10);

interface QuoteResult {
  toAmount: string;
  gas: number;
  protocols: string[];
}

interface Props {
  opp: Opportunity;
  onClose: () => void;
}

type Step = "idle" | "approving" | "swapping" | "done";

export default function AllocateModal({ opp, onClose }: Props) {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount]   = useState("1000");
  const [quote, setQuote]     = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [step, setStep]       = useState<Step>("idle");
  const [txHash, setTxHash]   = useState<string | null>(null);

  const swappable    = SWAPPABLE_TOKENS[opp.id];
  const directDeposit = DIRECT_DEPOSIT[opp.id];
  const amountWei    = Math.floor(parseFloat(amount || "0") * 1e6).toString();

  // Read USDC allowance for 1inch router
  const { data: allowance } = useReadContract(
    isConnected && swappable && address
      ? {
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, ONEINCH_ROUTER as `0x${string}`],
        }
      : undefined
  );

  const needsApproval = swappable && isConnected && allowance !== undefined
    ? allowance < BigInt(amountWei)
    : false;

  const fetchQuote = useCallback(async () => {
    if (!swappable?.address || parseFloat(amount) < 1) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        src: USDC_ADDRESS,
        dst: swappable.address,
        amount: amountWei,
        includeProtocols: "true",
        fee: (FEE_BPS / 10000).toString(),
        referrerAddress: FEE_RECEIVER,
      });
      const res = await fetch(`https://api.1inch.dev/swap/v6.0/1/quote?${params}`, {
        headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.description ?? err.error ?? `Quote failed (${res.status})`);
      }
      const data = await res.json();
      setQuote({
        toAmount: data.dstAmount ?? data.toAmount ?? "0",
        gas: data.gas ?? 0,
        protocols: data.protocols?.flat(2).map((p: { name: string }) => p.name).slice(0, 3) ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote unavailable");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [amount, amountWei, swappable?.address]);

  useEffect(() => {
    if (!swappable) return;
    const t = setTimeout(fetchQuote, 600);
    return () => clearTimeout(t);
  }, [fetchQuote, swappable]);

  const handleApprove = async () => {
    if (!swappable) return;
    setStep("approving");
    setError(null);
    try {
      await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ONEINCH_ROUTER as `0x${string}`, BigInt(amountWei)],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setStep("idle");
    }
  };

  const handleSwap = async () => {
    if (!swappable || !address) return;
    setStep("swapping");
    setError(null);
    try {
      const params = new URLSearchParams({
        src: USDC_ADDRESS,
        dst: swappable.address,
        amount: amountWei,
        from: address,
        slippage: "1",
        fee: (FEE_BPS / 10000).toString(),
        referrerAddress: FEE_RECEIVER,
      });
      const res = await fetch(`https://api.1inch.dev/swap/v6.0/1/swap?${params}`, {
        headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.description ?? err.error ?? `Swap failed (${res.status})`);
      }
      const data = await res.json();
      const hash = await sendTransactionAsync({
        to: data.tx.to as `0x${string}`,
        data: data.tx.data as `0x${string}`,
        value: BigInt(data.tx.value ?? 0),
        gas: BigInt(data.tx.gas ?? 300000),
      });
      setTxHash(hash);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Swap failed");
      setStep("idle");
    }
  };

  const outAmount = quote
    ? (parseInt(quote.toAmount) / 1e18).toFixed(6)
    : null;

  const gasEth = quote?.gas ? (quote.gas * 20e9) / 1e18 : 0; // rough estimate at 20 gwei

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md bg-[#0B0F14] border border-[#1E2A35] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-[#1E2A35] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {swappable && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D82122]/20 to-[#E8821C]/20 border border-[#D82122]/30 flex items-center justify-center overflow-hidden shrink-0">
                  <Image src="/icons/1inch.svg" alt="1inch" width={26} height={26} className="object-contain" />
                </div>
              )}
              <div>
                <p className="text-[9px] tracking-widest text-[#3D5166]">
                  {swappable ? "SWAP VIA 1INCH" : "DIRECT DEPOSIT"}
                </p>
                <p className="text-[14px] font-semibold text-white mt-0.5">{opp.protocol}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#3D5166] hover:text-[#C8D8E8] transition-colors text-xl leading-none">×</button>
          </div>

          <div className="p-5 space-y-4">
            {/* Direct deposit protocols */}
            {directDeposit && (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl px-4 py-3">
                <p className="text-amber-400 text-[11px] font-semibold mb-1">Direct Deposit Required</p>
                <p className="text-[#6B8499] text-[11px]">{directDeposit.note}</p>
                <p className="text-[10px] text-[#3D5166] mt-2">
                  Receipt tokens (aUSDC, cUSDCv3) are not DEX-tradeable — they&apos;re minted when you deposit via the protocol.
                </p>
              </div>
            )}

            {/* Swappable: from/to inputs */}
            {swappable && (
              <>
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
                    <div className="shrink-0 bg-[#1E2A35] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#C8D8E8]">USDC</div>
                  </div>
                </div>

                <div className="flex items-center justify-center text-[#3D5166]">
                  <div className="border border-[#1E2A35] rounded-full w-8 h-8 flex items-center justify-center">↓</div>
                </div>

                <div>
                  <p className="text-[9px] tracking-widest text-[#3D5166] mb-2">YOU RECEIVE</p>
                  <div className="flex items-center gap-3 bg-[#111820] border border-[#1E2A35] rounded-xl px-4 py-3">
                    <div className="flex-1">
                      {loading ? (
                        <div className="h-6 bg-[#1E2A35] rounded animate-pulse w-32" />
                      ) : outAmount ? (
                        <p className="text-emerald-400 text-[18px] font-mono font-semibold tabular-nums">{outAmount}</p>
                      ) : (
                        <p className="text-[#3D5166] text-[14px] font-mono">—</p>
                      )}
                      <p className="text-[10px] text-[#3D5166] mt-0.5">
                        {quote?.protocols.length
                          ? `via ${quote.protocols.join(" → ")}`
                          : "Enter amount to get quote"}
                      </p>
                    </div>
                    <div className="shrink-0 bg-[#1E2A35] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#C8D8E8]">
                      {swappable.symbol}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <p className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Done state */}
            {step === "done" && txHash && (
              <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-[12px] font-semibold mb-1">Swap submitted!</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#00D4FF] underline break-all"
                >
                  {txHash.slice(0, 20)}…{txHash.slice(-8)}
                </a>
              </div>
            )}

            {/* Fee / gas info */}
            <div className="border border-[#1E2A35] rounded-xl px-4 py-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#3D5166]">Protocol APY</span>
                <span className="text-emerald-400 font-semibold">{opp.totalAPY.toFixed(2)}%</span>
              </div>
              {swappable && (
                <div className="flex justify-between">
                  <span className="text-[#3D5166]">InvestFi referral fee</span>
                  <span className="text-[#6B8499]">{FEE_BPS / 100}%</span>
                </div>
              )}
              {swappable && quote?.gas ? (
                <div className="flex justify-between">
                  <span className="text-[#3D5166]">Est. gas</span>
                  <span className="text-[#6B8499]">
                    {quote.gas.toLocaleString()} units ≈ {gasEth.toFixed(5)} ETH
                  </span>
                </div>
              ) : swappable ? (
                <div className="flex justify-between">
                  <span className="text-[#3D5166]">Est. gas</span>
                  <span className="text-[#3D5166]">—</span>
                </div>
              ) : null}
              {swappable && isConnected && allowance !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#3D5166]">USDC approved</span>
                  <span className={needsApproval ? "text-amber-400" : "text-emerald-400"}>
                    {needsApproval ? "Needs approval" : "✓ Sufficient"}
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            {swappable ? (
              !isConnected ? (
                <div className="w-full bg-[#111820] border border-[#1E2A35] text-[#3D5166] py-3 rounded-xl text-[12px] font-semibold tracking-wide text-center">
                  Connect wallet to swap
                </div>
              ) : needsApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={step === "approving"}
                  className="w-full bg-amber-400/10 border border-amber-400/40 text-amber-400 py-3 rounded-xl text-[12px] font-semibold tracking-wide hover:bg-amber-400/20 transition-colors disabled:opacity-50"
                >
                  {step === "approving" ? "APPROVING USDC…" : "APPROVE USDC →"}
                </button>
              ) : (
                <button
                  onClick={handleSwap}
                  disabled={!quote || loading || step === "swapping" || step === "done"}
                  className="w-full bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF] py-3 rounded-xl text-[12px] font-semibold tracking-wide hover:bg-[#00D4FF]/20 transition-colors disabled:opacity-40"
                >
                  {step === "swapping" ? "CONFIRMING…" : step === "done" ? "SWAPPED ✓" : "SWAP VIA 1INCH →"}
                </button>
              )
            ) : (
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF] py-3 rounded-xl text-[12px] font-semibold tracking-wide hover:bg-[#00D4FF]/20 transition-colors text-center"
              >
                {directDeposit?.label?.toUpperCase() ?? `OPEN ${opp.protocol.toUpperCase()}`} →
              </a>
            )}

            <p className="text-[9px] text-[#2D4A5E] text-center">
              {swappable
                ? "Swap via 1inch Fusion+ · 0.5% referral fee supports InvestFi · Not financial advice"
                : "Always verify contract addresses on-chain · Not financial advice"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
