import type { Metadata } from "next";
import { getSettings } from "@/lib/cms";

export const revalidate = 300;
export const metadata: Metadata = { title: "Künye" };

// Panelde henüz düzenlenmediyse gösterilecek varsayılan satırlar
const DEFAULT_ROWS: { baslik: string; metin: string }[] = [
  { baslik: "Yayın Sahibi", metin: "SONKAYNAK" },
  { baslik: "Sorumlu Müdür / Yazı İşleri Müdürü", metin: "" },
  { baslik: "Yönetim Yeri", metin: "Gürler Mh. 668. Sk. Yaprak Yapı Koop. A Blok No:10 Merkez / Kırıkkale" },
  { baslik: "İletişim / WhatsApp İhbar Hattı", metin: "0538 441 07 71" },
  { baslik: "Kurumsal E-Posta", metin: "info@sonkaynak.com" },
];

export default async function Kunye() {
  const s = await getSettings();
  const title = s.kunyeTitle?.trim() || "Künye";
  const source = s.kunyeRows && s.kunyeRows.length ? s.kunyeRows : DEFAULT_ROWS;
  // Metni boş olan satırlar gizlenir (ör. Sorumlu Müdür boşsa görünmez)
  const rows = source
    .map((r) => ({ baslik: (r.baslik ?? "").trim(), metin: (r.metin ?? "").trim() }))
    .filter((r) => r.baslik && r.metin);

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-sk-ink">{title}</h1>
      <div className="overflow-hidden rounded-xl border border-sk-line">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-1 border-b border-sk-line px-5 py-3 last:border-0 sm:flex-row sm:gap-4">
            <span className="w-64 shrink-0 text-xs font-bold uppercase text-sk-muted">{r.baslik}</span>
            <span className="whitespace-pre-line text-sm font-semibold text-sk-ink">{r.metin}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
