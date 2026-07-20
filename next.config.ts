import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      "@x402/core": "./src/config/optional-x402.ts",
      "@x402/core/client": "./src/config/optional-x402.ts",
      "@x402/core/server": "./src/config/optional-x402.ts",
      "@x402/evm": "./src/config/optional-x402.ts",
      "@x402/evm/batch-settlement/client": "./src/config/optional-x402.ts",
      "@x402/evm/exact/client": "./src/config/optional-x402.ts",
      "@x402/evm/exact/server": "./src/config/optional-x402.ts",
      "@x402/evm/exact/v1/client": "./src/config/optional-x402.ts",
      "@x402/evm/upto/client": "./src/config/optional-x402.ts",
      "@x402/evm/upto/server": "./src/config/optional-x402.ts",
      "@x402/extensions/bazaar": "./src/config/optional-x402.ts",
      "@x402/fetch": "./src/config/optional-x402.ts",
      "@x402/express": "./src/config/optional-x402.ts",
      "@x402/svm": "./src/config/optional-x402.ts",
      "@x402/svm/exact/client": "./src/config/optional-x402.ts",
      "@x402/svm/exact/server": "./src/config/optional-x402.ts",
      "@x402/svm/exact/v1/client": "./src/config/optional-x402.ts",
    },
  },
};

export default nextConfig;
