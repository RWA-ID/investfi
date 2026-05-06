const KEY = process.env.ALCHEMY_API_KEY ?? "";

interface AlchemyPriceItem {
  symbol: string;
  prices: { currency: string; value: string; lastUpdatedAt: string }[];
  error: string | null;
}

interface AlchemyPricesResponse {
  data: AlchemyPriceItem[];
}

export interface MarketPrices {
  eth: number;
  btc: number;
  ethChange24h: number;
}

export async function fetchMarketPrices(): Promise<MarketPrices | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `https://api.g.alchemy.com/prices/v1/${KEY}/tokens/by-symbol?symbols=ETH&symbols=BTC`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json: AlchemyPricesResponse = await res.json();

    const find = (sym: string) => json.data.find((d) => d.symbol === sym);
    const ethItem = find("ETH");
    const btcItem = find("BTC");

    if (!ethItem || !btcItem) return null;

    const eth = parseFloat(ethItem.prices[0]?.value ?? "0");
    const btc = parseFloat(btcItem.prices[0]?.value ?? "0");
    const ethChange24h = 0; // percentChange24h not in by-symbol response; enrich later if needed

    if (!eth || !btc) return null;
    return { eth, btc, ethChange24h };
  } catch {
    return null;
  }
}
