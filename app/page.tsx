import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import OpportunityTable from "@/components/OpportunityTable";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <StatsBar />

      {/* Page title */}
      <div className="max-w-[1600px] mx-auto w-full px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs tracking-widest text-[#3D5166] mb-0.5">OPPORTUNITY SCANNER</h1>
            <p className="text-[11px] text-[#6B8499]">
              Institutional-grade yield intelligence — risk-adjusted, real-time comparable
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#3D5166]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> LOW ≤3.5
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-3" /> MED ≤5.5
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block ml-3" /> HIGH ≤7.5
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block ml-3" /> VERY HIGH
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-4 flex-1 flex flex-col pb-8">
        <div className="border border-[#1E2A35] rounded-lg overflow-hidden flex flex-col flex-1">
          <OpportunityTable />
        </div>
      </div>

      <footer className="border-t border-[#1E2A35] py-4 px-4 text-center">
        <p className="text-[10px] text-[#3D5166] tracking-widest">
          INVESTFI.ETH — INSTITUTIONAL DEFI INTELLIGENCE · DATA: DEFILLAMA / COINGECKO / ONCHAIN ·{" "}
          <span className="text-[#6B8499]">NOT FINANCIAL ADVICE</span>
        </p>
      </footer>
    </div>
  );
}
