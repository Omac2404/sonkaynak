"use client";

type Item = { text: string; url?: string };

/**
 * Son dakika kayan şeridi — CSS animasyonuyla sonsuz akış.
 * İçeriği iki kez basıp -50% kaydırarak kesintisiz döngü sağlar.
 */
export function Ticker({
  label = "SON DAKİKA",
  items,
  speed = 10,
  color = "#d4141c",
  labelColor = "#a50f15",
}: {
  label?: string;
  items: Item[];
  speed?: number;
  color?: string;
  labelColor?: string;
}) {
  if (!items?.length) return null;
  const duration = Math.max(15, items.length * Math.max(4, 22 - speed));
  const row = (extra: string) => (
    <div className="sk-ticker-row" aria-hidden={extra === "clone" ? true : undefined}>
      {items.map((it, i) => (
        <span key={`${extra}-${i}`} className="sk-ticker-item">
          {it.url ? <a href={it.url}>{it.text}</a> : it.text}
          <span className="sk-ticker-sep">◆</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="text-white" style={{ background: color }}>
      <div className="mx-auto flex max-w-[1360px] items-stretch overflow-hidden">
        <span
          className="flex shrink-0 items-center gap-2 px-4 text-[11px] font-extrabold uppercase tracking-wide"
          style={{ background: labelColor }}
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
          {label}
        </span>
        <div className="sk-ticker-viewport">
          <div className="sk-ticker-track" style={{ animationDuration: `${duration}s` }}>
            {row("a")}
            {row("clone")}
          </div>
        </div>
      </div>
    </div>
  );
}
