import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(process.cwd(), "../..");
const { combinedEnv } = loadEnvConfig(monorepoRoot);
loadEnvConfig(process.cwd());

const apiOrigin =
  process.env.API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  combinedEnv.API_ORIGIN ??
  combinedEnv.NEXT_PUBLIC_API_ORIGIN ??
  "http://localhost:3014";
const authSecret =
  process.env.AUTH_SECRET ?? combinedEnv.AUTH_SECRET ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    AUTH_SECRET: authSecret,
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.AUTH_SECRET": JSON.stringify(authSecret),
      }),
    );
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
