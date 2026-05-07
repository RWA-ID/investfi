import type { Metadata } from "next";
import "./globals.css";
import Web3Provider from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: "InvestFi | DeFi Opportunity Terminal",
  description: "Institutional-grade DeFi yield intelligence — investfi.eth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-[#0B0F14] text-[#C8D8E8] antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
