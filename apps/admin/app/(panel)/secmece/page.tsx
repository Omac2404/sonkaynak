import { pf } from "@/lib/payload";
import { OrderedPicker } from "@/components/curation/OrderedPicker";

export const dynamic = "force-dynamic";

export default async function SecmecePage() {
  const [newsRes, g] = await Promise.all([
    pf("/news?where[_status][equals]=published&limit=200&depth=1&sort=-publishedAt"),
    pf("/globals/secmece?depth=1"),
  ]);
  const items = (newsRes.data?.docs ?? []).map((n: any) => ({ id: n.id, label: n.title, sub: n.category?.name }));
  const ids = (g.data?.items ?? [])
    .map((i: any) => (typeof i.news === "object" ? i.news?.id : i.news))
    .filter(Boolean);

  return <OrderedPicker slug="secmece" relKey="news" route="/secmece" title="Seçmece Haberler" items={items} initialIds={ids} max={12} />;
}
