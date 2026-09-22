import { ResourceListView } from "@/components/ResourceListView";

export const dynamic = "force-dynamic";

export default async function HaberlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; review?: string; sayfa?: string }>;
}) {
  const { q, status, review, sayfa } = await searchParams;
  return <ResourceListView resourceKey="haberler" search={q} status={status} review={review} page={sayfa} />;
}
