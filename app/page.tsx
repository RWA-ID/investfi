import PageShell from "@/components/PageShell";
import { getOpportunities } from "@/lib/opportunities";
import { fetchMarketPrices } from "@/lib/alchemy";
import { fetchProtocolRevenue } from "@/lib/dune";

export const revalidate = 3600;

export default async function Home() {
  const [oppsResult, pricesResult, revenueResult] = await Promise.allSettled([
    getOpportunities(),
    fetchMarketPrices(),
    fetchProtocolRevenue(),
  ]);

  const opportunities = oppsResult.status === "fulfilled" ? oppsResult.value : [];
  const marketPrices = pricesResult.status === "fulfilled" ? pricesResult.value : null;
  const revenueData = revenueResult.status === "fulfilled" ? revenueResult.value : null;

  return (
    <PageShell
      opportunities={opportunities}
      marketPrices={marketPrices}
      revenueData={revenueData}
    />
  );
}
