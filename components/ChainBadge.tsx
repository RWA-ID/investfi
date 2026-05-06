import type { Chain } from "@/lib/types";

const CHAIN_COLORS: Record<Chain, string> = {
  Ethereum: "text-[#627EEA] border-[#627EEA]/30 bg-[#627EEA]/10",
  Arbitrum: "text-[#12AAFF] border-[#12AAFF]/30 bg-[#12AAFF]/10",
  Base: "text-[#0052FF] border-[#0052FF]/30 bg-[#0052FF]/10",
  Optimism: "text-[#FF0420] border-[#FF0420]/30 bg-[#FF0420]/10",
  Polygon: "text-[#8247E5] border-[#8247E5]/30 bg-[#8247E5]/10",
  Avalanche: "text-[#E84142] border-[#E84142]/30 bg-[#E84142]/10",
  Solana: "text-[#9945FF] border-[#9945FF]/30 bg-[#9945FF]/10",
};

export default function ChainBadge({ chain }: { chain: Chain }) {
  return (
    <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${CHAIN_COLORS[chain]}`}>
      {chain.toUpperCase()}
    </span>
  );
}
