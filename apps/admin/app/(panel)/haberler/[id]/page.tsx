import { notFound } from "next/navigation";
import { pf, getMe } from "@/lib/payload";
import { NewsForm } from "@/components/editor/NewsForm";
import { mediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function HaberDuzenle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [newsRes, cats, auths, me] = await Promise.all([
    pf(`/news/${id}?depth=2&draft=true`),
    pf("/categories?limit=100&sort=order&depth=0"),
    pf("/authors?limit=100&depth=0"),
    getMe(),
  ]);
  if (!newsRes.ok || !newsRes.data?.id) notFound();

  const news = newsRes.data;
  const categories = (cats.data?.docs ?? []).map((c: any) => ({ id: c.id, label: c.name }));
  const authors = (auths.data?.docs ?? []).map((a: any) => ({ id: a.id, label: `${a.name} ${a.surname}` }));
  const canPublish = ["admin", "editor", "editor_limited"].includes(me?.role);
  const cover = mediaUrl(news.coverImage, "card");

  return (
    <div>
      <h1 className="mb-5 text-2xl font-black tracking-tight text-ink">Haber Düzenle</h1>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          ⚠ {error}
        </div>
      )}
      <NewsForm news={news} categories={categories} authors={authors} canPublish={canPublish} mediaUrl={cover} />
    </div>
  );
}
