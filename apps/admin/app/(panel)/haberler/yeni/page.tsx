import { pf, getMe } from "@/lib/payload";
import { NewsForm } from "@/components/editor/NewsForm";

export const dynamic = "force-dynamic";

export default async function YeniHaber() {
  const [cats, auths, me] = await Promise.all([
    pf("/categories?limit=100&sort=order&depth=0"),
    pf("/authors?limit=100&depth=0"),
    getMe(),
  ]);
  const categories = (cats.data?.docs ?? []).map((c: any) => ({ id: c.id, label: c.name }));
  const authors = (auths.data?.docs ?? []).map((a: any) => ({ id: a.id, label: `${a.name} ${a.surname}` }));
  const canPublish = ["admin", "editor", "editor_limited"].includes(me?.role);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-black tracking-tight text-ink">Yeni Haber</h1>
      <NewsForm categories={categories} authors={authors} canPublish={canPublish} />
    </div>
  );
}
