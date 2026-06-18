import { pf } from "@/lib/payload";
import { VitrinForm } from "@/components/curation/VitrinForm";

export const dynamic = "force-dynamic";

export default async function VitrinPage() {
  const [catRes, newsRes, g] = await Promise.all([
    pf("/categories?limit=100&sort=order"),
    pf("/news?where[_status][equals]=published&limit=200&depth=0&sort=-publishedAt"),
    pf("/globals/vitrin?depth=1"),
  ]);
  const categories = (catRes.data?.docs ?? []).map((c: any) => ({ id: c.id, label: c.name }));
  const news = (newsRes.data?.docs ?? []).map((n: any) => ({ id: n.id, label: n.title }));
  const slots = g.data?.slots ?? [];

  return <VitrinForm categories={categories} news={news} slots={slots} />;
}
