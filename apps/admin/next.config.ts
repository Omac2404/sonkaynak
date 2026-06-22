import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  // Admin iç araç; görsel optimizasyonu (sharp) gerektirmesin, doğrudan sunulsun
  images: { unoptimized: true },
};

export default nextConfig;
