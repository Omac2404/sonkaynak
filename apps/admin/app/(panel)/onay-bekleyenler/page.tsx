import { pf } from "@/lib/payload";
import { approveNews, rejectNews, bulkApproveNews } from "@/lib/actions";
import { mediaUrl, fmtDate } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function OnayBekleyenler() {
  const res = await pf("/news?where[reviewState][equals]=onaya_gonderildi&depth=1&sort=-createdAt&limit=100");
  const rows: any[] = res.data?.docs ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-black tracking-tight text-ink">Onay Bekleyenler</h1>
        {rows.length > 0 && (
          <span className="rounded-full bg-sk-red px-2.5 py-0.5 text-xs font-bold text-white">{rows.length}</span>
        )}
        {rows.length > 0 && (
          <form id="bulkApprove" action={bulkApproveNews} className="ml-auto">
            <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
              Seçilenleri Onayla
            </button>
          </form>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="sk-card grid place-items-center p-16 text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-3 font-bold text-ink">Bekleyen haber yok</p>
          <p className="mt-1 text-sm text-neutral-500">Yazarların onaya gönderdiği haberler burada listelenir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((n) => {
            const img = mediaUrl(n.coverImage, "thumbnail");
            return (
              <div key={n.id} className="sk-card flex items-center gap-4 p-3.5">
                <input type="checkbox" name="ids" value={n.id} form="bulkApprove" className="h-5 w-5 shrink-0 accent-green-600" />
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-16 w-24 shrink-0 rounded-lg bg-neutral-100" />
                )}
                <div className="min-w-0 flex-1">
                  <a href={`/haberler/${n.id}`} className="line-clamp-1 font-bold text-ink hover:text-sk-red">{n.title}</a>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                    {n.category?.name && <span className="font-bold uppercase text-sk-red">{n.category.name}</span>}
                    <span>{n.author ? `${n.author.name} ${n.author.surname}` : ""}</span>
                    <span>· {fmtDate(n.createdAt, true)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a href={`/haberler/${n.id}`} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50">
                    İncele
                  </a>
                  <form action={rejectNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700">
                      Reddet
                    </button>
                  </form>
                  <form action={approveNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700">
                      Onayla
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
