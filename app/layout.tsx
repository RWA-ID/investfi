import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvestFi | DeFi Opportunity Terminal",
  description: "Institutional-grade DeFi yield intelligence — investfi.eth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-[#0B0F14] text-[#C8D8E8] antialiased">
        {children}
      </body>
    </html>
  );
}
