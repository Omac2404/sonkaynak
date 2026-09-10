import { pf, requirePagePerm } from "@/lib/payload";
import { fmtDate } from "@/lib/media";
import { saveAgencySource, runIngestNow } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

export default async function AjanslarPage() {
  await requirePagePerm("ajanslar");
  const [srcRes, catRes] = await Promise.all([
    pf("/ajans-kaynaklari?limit=50&depth=0&sort=name"),
    pf("/categories?limit=100&sort=order&depth=0"),
  ]);
  const sources: any[] = srcRes.data?.docs ?? [];
  const categories: { id: number; name: string }[] = (catRes.data?.docs ?? []).map((c: any) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Haber Ajansları (RSS)</h1>
          <p className="mt-0.5 text-sm text-neutral-400">
            İHA / AA / DHA / ANKA otomatik haber çekme. Aboneliğinizi alınca bilgileri girip “Aktif” edin.
          </p>
        </div>
        <form action={runIngestNow}>
          <SubmitButton className="rounded-lg bg-sk-red px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60" pendingText="Çekiliyor…">
            Şimdi Çek
          </SubmitButton>
        </form>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-800">
        <b>Nasıl çalışır?</b> Bilgiler boşken kaynak çalışmaz. Abonelik/izin alınca ilgili ajansın{" "}
        <b>Besleme URL’si</b> ve gerekiyorsa <b>kullanıcı adı/şifre veya API anahtarını</b> girin, <b>Hedef Kategori</b> seçin ve{" "}
        <b>Aktif</b>’i işaretleyin. Sistem 30 dakikada bir otomatik çeker; haberler <b>taslak</b> olarak gelir (siz onaylayıp yayınlarsınız).
      </div>

      {sources.length === 0 ? (
        <div className="sk-card p-8 text-center text-sm text-neutral-400">
          Ajans kaynakları henüz oluşmadı. CMS yeniden başlatıldığında otomatik eklenir.
        </div>
      ) : (
        sources.map((s) => {
          const curCat = s.category && typeof s.category === "object" ? s.category.id : s.category;
          return (
            <form key={s.id} action={saveAgencySource} className="sk-card space-y-4 p-5">
              <input type="hidden" name="id" value={s.id} />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-black text-ink">{s.name}</h2>
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-600">
                  <input type="checkbox" name="active" defaultChecked={Boolean(s.active)} className="h-4 w-4 accent-sk-red" />
                  Aktif
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Besleme (RSS/API) URL’si</span>
                <input name="feedUrl" defaultValue={s.feedUrl ?? ""} placeholder="https://…/rss.xml" className={inputCls} />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Kullanıcı Adı</span>
                  <input name="username" defaultValue={s.username ?? ""} autoComplete="off" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Şifre</span>
                  <input name="password" type="password" defaultValue={s.password ?? ""} autoComplete="new-password" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">API Anahtarı</span>
                  <input name="apiKey" defaultValue={s.apiKey ?? ""} autoComplete="off" className={inputCls} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Hedef Kategori</span>
                  <select name="category" defaultValue={curCat ?? ""} className={inputCls}>
                    <option value="">— Seç —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-end gap-2.5 pb-2.5">
                  <input type="checkbox" name="autoPublish" defaultChecked={Boolean(s.autoPublish)} className="h-4 w-4 accent-sk-red" />
                  <span className="text-sm font-bold text-neutral-600">
                    Otomatik yayınla <span className="font-normal text-neutral-400">(kapalıysa taslak gelir)</span>
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                <span className="text-[12px] text-neutral-400">
                  {s.lastStatus ? `Son durum: ${s.lastStatus}` : "Henüz çekim yapılmadı"}
                  {s.lastFetchedAt ? ` · ${fmtDate(s.lastFetchedAt, true)}` : ""}
                </span>
                <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">
                  Kaydet
                </SubmitButton>
              </div>
            </form>
          );
        })
      )}
    </div>
  );
}
