import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  images: {
    // Medya MinIO/uzak kaynaklardan gelebilir; geliştirmede serbest bırakıyoruz.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // Optimize edilen görseller uzun süre önbellekte kalsın (yeniden işlemeyi azaltır)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 gün
  },
};

export default nextConfig;
