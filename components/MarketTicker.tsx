"use client";

interface Props {
  eth: number | null;
  btc: number | null;
  ethChange24h: number | null;
}

export default function MarketTicker({ eth, btc, ethChange24h }: Props) {
  if (eth === null) {
    return (
      <div className="border-b border-[#1E2A35] bg-[#080C10] px-6 py-1.5 text-[10px] text-[#3D5166] flex items-center gap-4">
        <span>MARKET DATA UNAVAILABLE</span>
      </div>
    );
  }

  const changePositive = (ethChange24h ?? 0) >= 0;
  const changeStr =
    ethChange24h !== null
      ? `${changePositive ? "▲" : "▼"}${Math.abs(ethChange24h).toFixed(2)}%`
      : null;

  return (
    <div className="border-b border-[#1E2A35] bg-[#080C10] px-6 py-1.5 text-[10px] text-[#3D5166] flex items-center gap-4">
      <span className="flex items-center gap-1.5">
        ETH
        <span className="text-[#C8D8E8]">${eth.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
        {changeStr && (
          <span className={changePositive ? "text-emerald-400" : "text-red-400"}>
            {changeStr}
          </span>
        )}
      </span>
      <span className="text-[#1E2A35]">|</span>
      <span className="flex items-center gap-1.5">
        BTC
        <span className="text-[#C8D8E8]">${btc?.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
      </span>
      <span className="text-[#1E2A35]">|</span>
      <span className="flex items-center gap-1.5">
        GAS <span className="text-[#C8D8E8]">12 gwei</span>
      </span>
      <span className="ml-auto text-[9px] tracking-widest">PRICES · ALCHEMY</span>
    </div>
  );
}
