import { pf, requirePagePerm } from "@/lib/payload";
import { KunyeForm } from "@/components/curation/KunyeForm";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = [
  { baslik: "Yayın Sahibi", metin: "SONKAYNAK" },
  { baslik: "Sorumlu Müdür / Yazı İşleri Müdürü", metin: "" },
  { baslik: "Yönetim Yeri", metin: "Gürler Mh. 668. Sk. Yaprak Yapı Koop. A Blok No:10 Merkez / Kırıkkale" },
  { baslik: "İletişim / WhatsApp İhbar Hattı", metin: "0538 441 07 71" },
  { baslik: "Kurumsal E-Posta", metin: "info@sonkaynak.com" },
];

export default async function KunyePage() {
  await requirePagePerm("kunye");
  const g = await pf("/globals/site-settings?depth=0");
  const s = g.data ?? {};
  const rows = Array.isArray(s.kunyeRows) && s.kunyeRows.length
    ? s.kunyeRows.map((r: any) => ({ baslik: r?.baslik ?? "", metin: r?.metin ?? "" }))
    : DEFAULT_ROWS;
  return <KunyeForm title={s.kunyeTitle ?? "Künye"} rows={rows} />;
}
