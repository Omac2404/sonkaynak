import { pf } from "@/lib/payload";
import { OrderedPicker } from "@/components/curation/OrderedPicker";
import { saveStories } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function StorylerPage() {
  const [newsRes, storiesRes] = await Promise.all([
    pf("/news?where[_status][equals]=published&limit=200&depth=1&sort=-publishedAt"),
    pf("/stories?limit=200&depth=0&sort=order"),
  ]);
  const items = (newsRes.data?.docs ?? []).map((n: any) => ({ id: n.id, label: n.title, sub: n.category?.name }));
  const ids = (storiesRes.data?.docs ?? [])
    .map((s: any) => (typeof s.news === "object" ? s.news?.id : s.news))
    .filter(Boolean);

  return (
    <OrderedPicker
      slug="stories"
      relKey="news"
      route="/storyler"
      title="Storyler"
      items={items}
      initialIds={ids}
      max={15}
      formAction={saveStories}
    />
  );
}
