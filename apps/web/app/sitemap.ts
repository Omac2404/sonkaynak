import type { MetadataRoute } from "next";
import { getAllNewsForSitemap, getCategories } from "@/lib/cms";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  const [news, cats] = await Promise.all([getAllNewsForSitemap(1000), getCategories()]);

  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/galeri`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/ilanlar`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/firma-rehberi`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const catUrls: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${base}/kategori/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const newsUrls: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${base}/haber/${n.slug}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...catUrls, ...newsUrls];
}
