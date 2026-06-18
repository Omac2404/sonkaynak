import type { Metadata } from "next";
import { getSettings } from "@/lib/cms";

export const revalidate = 600;
export const metadata: Metadata = { title: "Hakkımızda" };

export default async function Hakkimizda() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <h1 className="mb-4 text-3xl font-black text-sk-ink">Hakkımızda</h1>
      <p className="text-base leading-relaxed text-neutral-700">
        {s.footerAbout ?? "Son Kaynak Haber — yeni nesil haber platformu. Gündem, ekonomi, spor, dünya ve yerel haberleri tarafsız ve hızlı biçimde okurlarına ulaştırır."}
      </p>
    </div>
  );
}
