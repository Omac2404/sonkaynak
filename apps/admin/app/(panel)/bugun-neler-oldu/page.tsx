import { pf } from "@/lib/payload";
import { OrderedPicker } from "@/components/curation/OrderedPicker";

export const dynamic = "force-dynamic";

export default async function BugunNelerOlduPage() {
  const [tagsRes, g] = await Promise.all([
    pf("/tags?limit=300&sort=name&depth=0"),
    pf("/globals/bugun-neler-oldu?depth=1"),
  ]);
  const items = (tagsRes.data?.docs ?? []).map((t: any) => ({ id: t.id, label: t.name }));
  const ids = (g.data?.items ?? [])
    .map((i: any) => (typeof i.tag === "object" ? i.tag?.id : i.tag))
    .filter(Boolean);

  return (
    <div>
      <p className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
        Anasayfanın üstündeki <b>“Bugün Neler Oldu?”</b> şeridinde gösterilecek etiketleri seçin.
        Boş bırakırsanız sistem son haberlerdeki en sık etiketleri otomatik seçer.
      </p>
      <OrderedPicker
        slug="bugun-neler-oldu"
        relKey="tag"
        route="/bugun-neler-oldu"
        title="Bugün Neler Oldu"
        items={items}
        initialIds={ids}
        max={12}
      />
    </div>
  );
}
