import type { Opportunity } from "@/lib/types";

interface MarketPrices {
  eth: number | null;
  btc: number | null;
  ethChange24h: number | null;
}

export default function StatsBar({
  opportunities,
  marketPrices,
}: {
  opportunities: Opportunity[];
  marketPrices: MarketPrices | null;
}) {
  const stables = opportunities.filter((o) =>
    o.tags.some((t) => /stable|t-bill|rwa/i.test(t))
  );
  const stableApy =
    stables.length > 0 ? stables.reduce((a, o) => a + o.totalAPY, 0) / stables.length : 0;
  const lst = opportunities.filter((o) => o.strategyType === "Liquid Staking");
  const lstApy = lst.length > 0 ? lst.reduce((a, o) => a + o.totalAPY, 0) / lst.length : 0;
  const lp = opportunities.filter((o) => o.strategyType === "LP");
  const lpApy = lp.length > 0 ? lp.reduce((a, o) => a + o.totalAPY, 0) / lp.length : 0;

  const eth = marketPrices?.eth;
  const btc = marketPrices?.btc;
  const ethChange = marketPrices?.ethChange24h ?? null;

  return (
    <div className="stats-bar">
      {eth !== null && eth !== undefined && (
        <div className="stats-bar__cell">
          <span className="stats-bar__label">ETH</span>
          <span className="stats-bar__value">
            ${eth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {ethChange !== null && (
            <span
              className={`stats-bar__delta stats-bar__delta--${ethChange >= 0 ? "up" : "down"}`}
            >
              {ethChange >= 0 ? "▲" : "▼"} {Math.abs(ethChange).toFixed(2)}%
            </span>
          )}
        </div>
      )}
      {btc !== null && btc !== undefined && (
        <div className="stats-bar__cell">
          <span className="stats-bar__label">BTC</span>
          <span className="stats-bar__value">
            ${btc.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
      <div className="stats-bar__divider" />
      <div className="stats-bar__cell">
        <span className="stats-bar__label">Stable Yield</span>
        <span className="stats-bar__value">{stableApy.toFixed(2)}%</span>
      </div>
      <div className="stats-bar__cell">
        <span className="stats-bar__label">LST Yield</span>
        <span className="stats-bar__value">{lstApy.toFixed(2)}%</span>
      </div>
      <div className="stats-bar__cell">
        <span className="stats-bar__label">LP Yield</span>
        <span className="stats-bar__value">{lpApy.toFixed(2)}%</span>
      </div>
      <div className="stats-bar__divider" />
      <div className="stats-bar__cell">
        <span className="stats-bar__label">Gas</span>
        <span className="stats-bar__value">14 gwei</span>
      </div>
    </div>
  );
}
