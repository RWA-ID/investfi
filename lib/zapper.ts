const KEY = process.env.ZAPPER_API_KEY ?? "";
const BASE = "https://api.zapper.xyz/v2";

function authHeader(): string {
  return "Basic " + Buffer.from(KEY + ":").toString("base64");
}

interface ZapperPriceItem {
  address: string;
  price: number;
}

export async function fetchZapperPrices(
  tokenAddresses: string[]
): Promise<Map<string, number>> {
  if (!KEY || !tokenAddresses.length) return new Map();
  try {
    const params = tokenAddresses
      .map((a) => `addresses[]=${encodeURIComponent(a)}`)
      .join("&");
    const res = await fetch(`${BASE}/prices?network=ethereum&${params}`, {
      headers: { Authorization: authHeader() },
      next: { revalidate: 300 },
    });
    if (!res.ok) return new Map();
    const json: ZapperPriceItem[] = await res.json();
    const map = new Map<string, number>();
    for (const item of json) {
      map.set(item.address.toLowerCase(), item.price);
    }
    return map;
  } catch {
    return new Map();
  }
}
