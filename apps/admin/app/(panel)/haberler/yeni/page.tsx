import { pf, getMe } from "@/lib/payload";
import { NewsForm } from "@/components/editor/NewsForm";

export const dynamic = "force-dynamic";

export default async function YeniHaber({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
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
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          ⚠ {error}
        </div>
      )}
      {categories.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Henüz kategori yok. Yayınlayabilmek için önce <a href="/kategoriler/yeni" className="underline">bir kategori oluştur</a> — kategori zorunlu.
        </div>
      )}
      <NewsForm categories={categories} authors={authors} canPublish={canPublish} />
    </div>
  );
}
