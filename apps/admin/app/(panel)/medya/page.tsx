import { pf } from "@/lib/payload";
import { mediaUrl, fmtDate } from "@/lib/media";
import { uploadMediaFiles, deleteMedia } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";

export default async function MedyaPage() {
  const res = await pf("/media?limit=100&sort=-createdAt");
  const rows: any[] = res.data?.docs ?? [];

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {rows.map((m) => {
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
                  <div className="text-[10px] text-neutral-400">{fmtDate(m.createdAt)}</div>
                </div>
                <form action={deleteMedia} className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmSubmit message="Bu görseli silmek istediğinize emin misiniz?" className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-sk-red shadow hover:bg-sk-red hover:text-white">
                    ✕
                  </ConfirmSubmit>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
