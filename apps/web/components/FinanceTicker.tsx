import type { Finance } from "@/lib/finance";

type Item = { label: string; value: string; trend?: "up" | "down" | null };

/** Tepe kayan finans bandı (Dolar/Euro/Altın/BİST/Kripto) — Hürriyet tepe bandı tarzı. */
export function FinanceTicker({ finance }: { finance: Finance }) {
  const items: Item[] = [];
  const add = (label: string, value?: string, trend?: "up" | "down" | null) => {
    if (value) items.push({ label, value, trend });
  };
  const bistTrend: "up" | "down" | null = finance.bistChange
    ? finance.bistChange.startsWith("-")
      ? "down"
      : "up"
    : null;

  add("DOLAR", finance.usd ? `₺${finance.usd}` : undefined);
  add("EURO", finance.eur ? `₺${finance.eur}` : undefined);
  add("STERLİN", finance.gbp ? `₺${finance.gbp}` : undefined);
  add("GRAM ALTIN", finance.gold ? `₺${finance.gold}` : undefined);
  add("ONS ALTIN", finance.goldOz);
  add(
    "BİST 100",
    finance.bist ? `${finance.bist}${finance.bistChange ? ` %${finance.bistChange}` : ""}` : undefined,
    bistTrend,
  );
  add("BITCOIN", finance.btc ? `₺${finance.btc}` : undefined);
  add("ETHEREUM", finance.eth ? `₺${finance.eth}` : undefined);

  if (items.length === 0) return null;

  const Row = ({ clone = false }: { clone?: boolean }) => (
    <div className="sk-ticker-row" aria-hidden={clone || undefined}>
      {items.map((it, i) => (
        <span key={`${clone ? "c" : "o"}-${i}`} className="sk-ticker-item inline-flex items-center gap-1.5">
          <span className="text-white/55">{it.label}</span>
          <span
            className={
              it.trend === "up" ? "text-green-400" : it.trend === "down" ? "text-red-400" : "text-white"
            }
          >
            {it.value}
            {it.trend === "up" && " ▲"}
            {it.trend === "down" && " ▼"}
          </span>
          <span className="sk-ticker-sep">•</span>
        </span>
      ))}
    </div>
  );

  const duration = Math.max(30, items.length * 6);

  return (
    <div className="border-b border-white/10 bg-sk-ink text-white">
      <div className="mx-auto flex max-w-[1360px] items-stretch px-3 sm:px-4">
        <span className="flex shrink-0 items-center gap-1.5 pr-3 text-[11px] font-black uppercase tracking-wide text-sk-red">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sk-red" />
          Piyasa
        </span>
        <div className="sk-ticker-viewport">
          <div className="sk-ticker-track" style={{ animationDuration: `${duration}s` }}>
            <Row />
            <Row clone />
          </div>
        </div>
      </div>
    </div>
  );
}
