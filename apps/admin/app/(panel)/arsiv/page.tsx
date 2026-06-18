import { pf } from "@/lib/payload";
import { fmtDate } from "@/lib/media";
import { restoreResource, purgeResource } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";

const GROUPS: { slug: string; title: string; field: string }[] = [
  { slug: "news", title: "Haberler", field: "title" },
  { slug: "ilanlar", title: "İlanlar", field: "title" },
  { slug: "firmalar", title: "Firmalar", field: "name" },
  { slug: "galeriler", title: "Galeriler", field: "title" },
  { slug: "vefat", title: "Vefat İlanları", field: "isim" },
];

export default async function ArsivPage() {
  const results = await Promise.all(
    GROUPS.map(async (g) => {
      const r = await pf(`/${g.slug}?trash=true&where[deletedAt][exists]=true&limit=100&depth=0&sort=-deletedAt`);
      return { ...g, rows: (r.data?.docs ?? []) as any[] };
    }),
  );
  const total = results.reduce((s, g) => s + g.rows.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-black tracking-tight text-ink">Arşiv / Çöp Kutusu</h1>
        {total > 0 && <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-600">{total}</span>}
      </div>

      {total === 0 ? (
        <div className="sk-card grid place-items-center p-16 text-center">
          <div className="text-4xl">🗑️</div>
          <p className="mt-3 font-bold text-ink">Çöp kutusu boş</p>
          <p className="mt-1 text-sm text-neutral-500">Silinen içerikler 30 gün burada saklanır; geri yüklenebilir.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {results
            .filter((g) => g.rows.length > 0)
            .map((g) => (
              <section key={g.slug}>
                <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-neutral-400">
                  {g.title} ({g.rows.length})
                </h2>
                <div className="space-y-2">
                  {g.rows.map((row) => (
                    <div key={row.id} className="sk-card flex items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-bold text-ink">{row[g.field] ?? `#${row.id}`}</div>
                        <div className="text-[11px] text-neutral-400">Silinme: {fmtDate(row.deletedAt, true)}</div>
                      </div>
                      <form action={restoreResource}>
                        <input type="hidden" name="slug" value={g.slug} />
                        <input type="hidden" name="id" value={row.id} />
                        <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50">
                          Geri Yükle
                        </button>
                      </form>
                      <form action={purgeResource}>
                        <input type="hidden" name="slug" value={g.slug} />
                        <input type="hidden" name="id" value={row.id} />
                        <ConfirmSubmit
                          message="Bu kayıt KALICI olarak silinecek. Emin misiniz?"
                          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-sk-red hover:bg-red-50"
                        >
                          Kalıcı Sil
                        </ConfirmSubmit>
                      </form>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
