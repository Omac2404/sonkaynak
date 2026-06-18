import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/resources";
import { ResourceListView } from "@/components/ResourceListView";
import { Placeholder } from "@/components/Placeholder";

export const dynamic = "force-dynamic";

const PLACEHOLDER_LABELS: Record<string, string> = {
  manset: "Manşet",
  "sicak-gundem": "Sıcak Gündem",
  vitrin: "Kategori Vitrini",
  ticker: "Kayan Şeritler",
  "ana-menu": "Ana Menü",
  "onay-bekleyenler": "Onay Bekleyenler",
  ayarlar: "Site Ayarları",
  medya: "Medya",
};

export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ q?: string; status?: string; review?: string }>;
}) {
  const { resource } = await params;
  const { q, status, review } = await searchParams;
  if (RESOURCES[resource]) return <ResourceListView resourceKey={resource} search={q} status={status} review={review} />;
  if (PLACEHOLDER_LABELS[resource]) return <Placeholder title={PLACEHOLDER_LABELS[resource]} />;
  notFound();
}
