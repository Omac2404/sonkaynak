import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hata Bildirimi" };

export default function HataBildir() {
  const email = "editor@sonkaynak.com";
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <h1 className="mb-3 text-3xl font-black text-sk-ink">Hata Bildirimi</h1>
      <p className="text-[15px] leading-relaxed text-neutral-700">
        Bir haberde yanlış bilgi, yazım hatası veya teknik bir sorun mu fark ettiniz? Doğru ve güvenilir habercilik için
        geri bildiriminiz bizim için değerli. Lütfen hatayı ve mümkünse haberin bağlantısını bize iletin.
      </p>
      <div className="mt-6 rounded-xl border border-sk-line bg-white p-6">
        <h2 className="text-lg font-black text-sk-ink">Nasıl bildirebilirim?</h2>
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
