import type { Metadata } from "next";

export const metadata: Metadata = { title: "İletişim" };

export default function Iletisim() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <h1 className="mb-4 text-3xl font-black text-sk-ink">İletişim</h1>
      <div className="space-y-3 text-base text-neutral-700">
        <p>
          <strong className="text-sk-ink">Telefon / WhatsApp İhbar Hattı:</strong>{" "}
          <a href="tel:+905384410771" className="text-sk-red">0538 441 07 71</a>
        </p>
        <p>
          <strong className="text-sk-ink">E-posta:</strong>{" "}
          <a href="mailto:info@sonkaynak.com" className="text-sk-red">info@sonkaynak.com</a>
        </p>
        <p>
          <strong className="text-sk-ink">Adres:</strong> Gürler Mh. 668. Sk. Yaprak Yapı Koop. A Blok No:10 Merkez / Kırıkkale
        </p>
      </div>
    </div>
  );
}
