import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true, // required for static export
  },
  turbopack: {
    resolveAlias: {
      accounts: "./lib/stub-accounts.js",
    },
  },
};

export default nextConfig;
