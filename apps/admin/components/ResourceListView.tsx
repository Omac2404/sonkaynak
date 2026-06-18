import { RESOURCES } from "@/lib/resources";
import { pf } from "@/lib/payload";
import { mediaUrl, fmtDate } from "@/lib/media";
import { deleteResource, bulkDeleteResource } from "@/lib/actions";
import { ConfirmSubmit } from "./ConfirmSubmit";

const SEARCH_FIELD: Record<string, string> = {
  news: "title",
  ilanlar: "title",
  galeriler: "title",
  categories: "name",
  tags: "name",
  firmalar: "name",
  authors: "fullName",
  vefat: "isim",
  users: "name",
};

const BADGE_STYLES: Record<string, string> = {
  onaya_gonderildi: "bg-red-50 text-sk-red-dark",
  hazirlaniyor: "bg-neutral-100 text-neutral-500",
  reddedildi: "bg-orange-50 text-orange-700",
  admin: "bg-violet-50 text-violet-700",
  editor: "bg-blue-50 text-blue-700",
  editor_limited: "bg-sky-50 text-sky-700",
  yazar: "bg-neutral-100 text-neutral-600",
};
const BADGE_LABELS: Record<string, string> = {
  onaya_gonderildi: "Onay Bekliyor",
  hazirlaniyor: "Hazırlanıyor",
  reddedildi: "Reddedildi",
  editor_limited: "Sınırlı Editör",
};

function Cell({ col, row }: { col: any; row: any }) {
  const v = row[col.key];
  switch (col.type) {
    case "image": {
      const src = mediaUrl(v, "thumbnail");
      return src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-10 w-14 rounded-md object-cover" />
      ) : (
        <div className="grid h-10 w-14 place-items-center rounded-md bg-neutral-100 text-neutral-300">—</div>
      );
    }
    case "status":
      return v === "published" ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Yayında
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Taslak
        </span>
      );
    case "badge": {
      if (typeof v === "boolean")
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${v ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
            {v ? "Aktif" : "Pasif"}
          </span>
        );
      const key = String(v ?? "");
      return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${BADGE_STYLES[key] ?? "bg-neutral-100 text-neutral-600"}`}>
          {BADGE_LABELS[key] ?? key ?? "—"}
        </span>
      );
    }
    case "date":
      return <span className="text-sm text-neutral-500">{fmtDate(v)}</span>;
    case "rel":
      return <span className="text-sm text-neutral-600">{v && typeof v === "object" ? v[col.relField] : "—"}</span>;
    default:
      return <span className="text-sm font-medium text-ink">{v ?? "—"}</span>;
  }
}

const STATUS_SLUGS = new Set(["news", "ilanlar", "firmalar", "galeriler"]);

export async function ResourceListView({
  resourceKey,
  search,
  status,
  review,
}: {
  resourceKey: string;
  search?: string;
  status?: string;
  review?: string;
}) {
  const cfg = RESOURCES[resourceKey];
  if (!cfg) return null;

  const sf = SEARCH_FIELD[cfg.slug];
  const term = (search ?? "").trim();
  const hasStatus = STATUS_SLUGS.has(cfg.slug);
  const isNews = cfg.slug === "news";

  let q = `/${cfg.slug}?limit=100&depth=${cfg.depth ?? 0}${cfg.sort ? `&sort=${cfg.sort}` : ""}`;
  if (term && sf) q += `&where[${sf}][like]=${encodeURIComponent(term)}`;
  if (hasStatus && status && status !== "all") q += `&where[_status][equals]=${status}`;
  if (isNews && review && review !== "all") q += `&where[reviewState][equals]=${review}`;
  const res = await pf(q);
  const rows: any[] = res.data?.docs ?? [];

  const selCls = "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-sk-red";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">{cfg.title}</h1>
          <p className="mt-0.5 text-sm text-neutral-400">{res.data?.totalDocs ?? rows.length} kayıt</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(sf || hasStatus) && (
            <form action={`/${resourceKey}`} className="flex flex-wrap items-center gap-1.5">
              {sf && (
                <input
                  name="q"
                  defaultValue={term}
                  placeholder="Ara…"
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-sk-red focus:ring-2 focus:ring-sk-red/10"
                />
              )}
              {hasStatus && (
                <select name="status" defaultValue={status ?? "all"} className={selCls}>
                  <option value="all">Tüm durumlar</option>
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak</option>
                </select>
              )}
              {isNews && (
                <select name="review" defaultValue={review ?? "all"} className={selCls}>
                  <option value="all">Tüm onaylar</option>
                  <option value="onaya_gonderildi">Onay Bekliyor</option>
                  <option value="hazirlaniyor">Hazırlanıyor</option>
                  <option value="reddedildi">Reddedildi</option>
                </select>
              )}
              <button className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-50">
                Uygula
              </button>
            </form>
          )}
          <form id="bulkDel" action={bulkDeleteResource}>
            <input type="hidden" name="slug" value={cfg.slug} />
            <input type="hidden" name="back" value={`/${resourceKey}`} />
            <ConfirmSubmit
              message="Seçili kayıtları silmek istediğinize emin misiniz?"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-sk-red"
            >
              Seçilenleri Sil
            </ConfirmSubmit>
          </form>
          <a
            href={`/${resourceKey}/yeni`}
            className="rounded-lg bg-sk-red px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sk-red-dark"
          >
            + Yeni {cfg.singular}
          </a>
        </div>
      </div>

      <div className="sk-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-neutral-50/60">
              <th className="w-9 px-4 py-3.5"></th>
              {cfg.columns.map((c) => (
                <th key={c.key} className="px-4 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3.5 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-400">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cfg.columns.length + 2} className="px-4 py-12 text-center text-sm text-neutral-400">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60">
                  <td className="px-4 py-2.5">
                    <input type="checkbox" name="ids" value={row.id} form="bulkDel" className="h-4 w-4 accent-sk-red" />
                  </td>
                  {cfg.columns.map((c) => (
                    <td key={c.key} className="px-4 py-2.5">
                      <Cell col={c} row={row} />
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={`/${resourceKey}/${row.id}`} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-600 hover:border-sk-red hover:text-sk-red">
                        Düzenle
                      </a>
                      <form action={deleteResource}>
                        <input type="hidden" name="slug" value={cfg.slug} />
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="back" value={`/${resourceKey}`} />
                        <ConfirmSubmit
                          message="Bu kaydı silmek istediğinize emin misiniz?"
                          className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-sk-red"
                        >
                          Sil
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
