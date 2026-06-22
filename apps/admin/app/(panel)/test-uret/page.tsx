import { pf, getMe } from "@/lib/payload";
import { redirect } from "next/navigation";
import { generateTestContent } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "haber", label: "Haber" },
  { value: "galeri", label: "Galeri" },
  { value: "ilan", label: "İlan" },
  { value: "firma", label: "Firma" },
  { value: "vefat", label: "Vefat" },
  { value: "story", label: "Story" },
  { value: "hepsi", label: "Hepsi (her türden)" },
];

export default async function TestUret({ searchParams }: { searchParams: Promise<{ m?: string; ozet?: string }> }) {
  const me = await getMe();
  if (!me || me.role !== "admin") redirect("/");
  const { m, ozet } = await searchParams;

  const mediaRes = await pf("/media?limit=1&depth=0");
  const mediaCount = mediaRes.data?.totalDocs ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black tracking-tight text-ink">Test İçeriği Üret</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Tasarımı görmek için havuzdaki görsellerle rastgele içerik üretip yayınlar. Sadece test amaçlıdır.
      </p>

      {m === "generated" && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          ✓ Üretildi: {ozet ?? ""}
        </div>
      )}

      {mediaCount === 0 && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Medya havuzu boş. Galeri/görselli içerik için önce <a href="/medya" className="underline">birkaç görsel yükle</a>.
          (Haber/ilan/firma görselsiz de üretilir.)
        </div>
      )}

      <form action={generateTestContent} className="mt-6 space-y-5 rounded-xl border border-line bg-white p-6">
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-neutral-700">Tür</label>
          <select
            name="type"
            defaultValue="haber"
            className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-neutral-700">Adet (1–10)</label>
          <input
            type="number"
            name="count"
            min={1}
            max={10}
            defaultValue={3}
            className="w-32 rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10"
          />
          <p className="mt-1.5 text-[12px] text-neutral-400">"Hepsi" seçilirse her türden bu kadar üretilir.</p>
        </div>

        <SubmitButton
          pendingText="Üretiliyor…"
          className="rounded-lg bg-sk-red px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sk-red-dark disabled:opacity-60"
        >
          İçerik Üret
        </SubmitButton>
      </form>
    </div>
  );
}
