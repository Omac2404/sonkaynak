import { pf } from "@/lib/payload";
import { OrderedPicker } from "@/components/curation/OrderedPicker";

export const dynamic = "force-dynamic";

export default async function GozdenKacmasinPage() {
  const [newsRes, g] = await Promise.all([
    pf("/news?where[_status][equals]=published&limit=200&depth=1&sort=-publishedAt"),
    pf("/globals/gozden-kacmasin?depth=1"),
  ]);
  const items = (newsRes.data?.docs ?? []).map((n: any) => ({ id: n.id, label: n.title, sub: n.category?.name }));
  const ids = (g.data?.items ?? [])
    .map((i: any) => (typeof i.news === "object" ? i.news?.id : i.news))
    .filter(Boolean);

  return <OrderedPicker slug="gozden-kacmasin" relKey="news" route="/gozden-kacmasin" title="Gözden Kaçmasın" items={items} initialIds={ids} max={12} />;
}
