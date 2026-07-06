import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  // Admin iç araç; görsel optimizasyonu (sharp) gerektirmesin, doğrudan sunulsun
  images: { unoptimized: true },
  experimental: {
    // Server Action gövde limiti (varsayılan 1MB) — görsel yükleme için yükselt
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
