import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CMS standalone KULLANMIYOR — Payload'ın çalışma anındaki dinamik
  // bağımlılıkları (drizzle-kit ile şema push vb.) için tam node_modules
  // ile `next start` olarak çalışır (bkz. apps/cms/Dockerfile).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default withPayload(nextConfig);
