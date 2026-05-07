"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base, optimism, polygon } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { type ReactNode, useState } from "react";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

import type { AppKitNetwork } from "@reown/appkit/networks";

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, base, optimism, polygon];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata: {
    name: "InvestFi",
    description: "Institutional DeFi Intelligence Terminal",
    url: "https://investfi.eth.limo",
    icons: ["/icons/eth.svg"],
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#00D4FF",
    "--w3m-border-radius-master": "8px",
  },
});

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
