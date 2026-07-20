import type { Metadata } from "next";
import { getFinance } from "@/lib/finance";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Piyasalar — Döviz, Altın, Borsa, Kripto",
  description: "Dolar, Euro, Sterlin, gram ve ONS altın, BİST 100, Bitcoin ve Ethereum güncel fiyatları.",
};

export default async function Piyasalar() {
  const f = await getFinance();
  const rows: { label: string; value: string; sub?: string }[] = [
    { label: "Dolar (USD)", value: f.usd ? `₺${f.usd}` : "—" },
    { label: "Euro (EUR)", value: f.eur ? `₺${f.eur}` : "—" },
    { label: "Sterlin (GBP)", value: f.gbp ? `₺${f.gbp}` : "—" },
    { label: "Gram Altın", value: f.gold ? `₺${f.gold}` : "—" },
    { label: "ONS Altın", value: f.goldOz ?? "—" },
    { label: "BİST 100", value: f.bist ?? "—", sub: f.bistChange ? `%${f.bistChange}` : undefined },
    { label: "Bitcoin (BTC)", value: f.btc ? `₺${f.btc}` : "—" },
    { label: "Ethereum (ETH)", value: f.eth ? `₺${f.eth}` : "—" },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <h1 className="text-3xl font-black text-sk-ink">Piyasalar</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Döviz, altın, borsa ve kripto para güncel değerleri. Veriler yaklaşık 10 dakika gecikmelidir.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const up = r.sub?.includes("+");
          const down = r.sub?.includes("-");
          return (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-lg border border-sk-line bg-white px-4 py-3.5"
            >
              <span className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400">{r.label}</span>
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-black text-sk-ink">{r.value}</span>
                {r.sub && (
                  <span className={`text-[12px] font-bold ${up ? "text-green-600" : down ? "text-sk-red" : "text-neutral-400"}`}>
                    {r.sub}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[12px] text-neutral-400">
        Bilgi amaçlıdır, yatırım tavsiyesi değildir. Kaynaklar: Frankfurter, gold-api, Coinbase, Yahoo Finance.
      </p>
    </div>
  );
}
