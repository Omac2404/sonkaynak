import { pf } from "@/lib/payload";
import { OrderedPicker } from "@/components/curation/OrderedPicker";

export const dynamic = "force-dynamic";

export default async function AnaMenuPage() {
  const [catRes, g] = await Promise.all([
    pf("/categories?limit=100&sort=order"),
    pf("/globals/ana-menu?depth=1"),
  ]);
  const items = (catRes.data?.docs ?? []).map((c: any) => ({ id: c.id, label: c.name }));
  const ids = (g.data?.items ?? [])
    .map((i: any) => (typeof i.category === "object" ? i.category?.id : i.category))
    .filter(Boolean);

  return <OrderedPicker slug="ana-menu" relKey="category" route="/ana-menu" title="Ana Menü" items={items} initialIds={ids} max={12} />;
}
