import { pf, getMe } from "@/lib/payload";
import { mediaUrl, fmtDate } from "@/lib/media";
import { uploadMediaFiles, deleteMedia } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";

/** "30 Ağustos 2026" biçiminde gün etiketi (gruplama başlığı). */
function dayLabel(d?: string): string {
  if (!d) return "Tarihsiz";
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
  } catch {
    return "Tarihsiz";
  }
}

export default async function MedyaPage() {
  const [res, me] = await Promise.all([pf("/media?limit=300&sort=-createdAt"), getMe()]);
  const rows: any[] = res.data?.docs ?? [];
  const canManage = ["admin", "editor", "editor_limited"].includes(me?.role ?? "");

  // Yükleme gününe göre grupla (sıra korunur: en yeni gün üstte)
  const groups: { label: string; items: any[] }[] = [];
  for (const m of rows) {
    const label = dayLabel(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(m);
    else groups.push({ label, items: [m] });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Medya Kütüphanesi</h1>
          <p className="mt-0.5 text-sm text-neutral-400">{res.data?.totalDocs ?? rows.length} dosya</p>
        </div>
        <form action={uploadMediaFiles} className="flex items-center gap-2">
          <input
            type="file"
            name="files"
            accept="image/*"
            multiple
            required
            className="block max-w-xs text-xs text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-bold hover:file:bg-neutral-200"
          />
          <button className="rounded-lg bg-sk-red px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark">Yükle</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="sk-card grid place-items-center p-16 text-center text-sm text-neutral-400">Henüz görsel yok.</div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.label}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-ink">{g.label}</h2>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-400">
                  {g.items.length} görsel
                </span>
                <span className="h-px flex-1 bg-neutral-100" />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                {g.items.map((m) => {
                  const src = mediaUrl(m, "card");
                  return (
                    <div key={m.id} className="sk-card group relative overflow-hidden">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt={m.alt ?? ""} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="aspect-square w-full bg-neutral-100" />
                      )}
                      <div className="p-2.5">
                        <div className="truncate text-[11px] font-semibold text-ink">{m.filename ?? m.alt ?? `#${m.id}`}</div>
                        <div className="text-[10px] text-neutral-400">{fmtDate(m.createdAt, true)}</div>
                      </div>
                      {canManage && (
                        <form action={deleteMedia} className="absolute right-2 top-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmSubmit message="Bu görseli silmek istediğinize emin misiniz?" className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-sk-red shadow hover:bg-sk-red hover:text-white">
                            ✕
                          </ConfirmSubmit>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
