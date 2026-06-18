import type { Metadata } from "next";

export const metadata: Metadata = { title: "Künye" };

const ROWS: [string, string][] = [
  ["Yayın Sahibi", "SONKAYNAK"],
  ["Sorumlu Müdür / Yazı İşleri Müdürü", "—"],
  ["Yönetim Yeri", "Gürler Mh. 668. Sk. Yaprak Yapı Koop. A Blok No:10 Merkez / Kırıkkale"],
  ["İletişim / WhatsApp İhbar Hattı", "0538 441 07 71"],
  ["Kurumsal E-Posta", "info@sonkaynak.com"],
];

export default function Kunye() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-sk-ink">Künye</h1>
      <div className="overflow-hidden rounded-xl border border-sk-line">
        {ROWS.map(([k, v], i) => (
          <div key={i} className="flex flex-col gap-1 border-b border-sk-line px-5 py-3 last:border-0 sm:flex-row sm:gap-4">
            <span className="w-64 shrink-0 text-xs font-bold uppercase text-sk-muted">{k}</span>
            <span className="text-sm font-semibold text-sk-ink">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
