import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reklam Ver" };

export default function Reklam() {
  const email = "reklam@sonkaynak.com";
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <h1 className="mb-3 text-3xl font-black text-sk-ink">Reklam Ver</h1>
      <p className="text-[15px] leading-relaxed text-neutral-700">
        Son Kaynak&apos;ta markanızı geniş bir okuyucu kitlesine ulaştırın. Ana sayfa manşet alanları, kategori sayfaları,
        haber içi ve kenar çubuğu reklam alanları için özel paketler sunuyoruz.
      </p>
      <div className="mt-6 rounded-xl border border-sk-line bg-white p-6">
        <h2 className="text-lg font-black text-sk-ink">İletişim</h2>
        <p className="mt-2 text-[15px] text-neutral-700">Reklam ve iş birlikleri için bize ulaşın:</p>
        <a href={`mailto:${email}`} className="mt-2 inline-block text-lg font-bold text-sk-red hover:underline">
          {email}
        </a>
        <div className="mt-4">
          <a href="/iletisim" className="rounded-lg bg-sk-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sk-red">
            İletişim Sayfası
          </a>
        </div>
      </div>
    </div>
  );
}
