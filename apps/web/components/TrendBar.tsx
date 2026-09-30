/** "Bugün neler oldu?" — habere eklenen metinlerden oluşan tam genişlik kayan şerit. */
export function TrendBar({ items }: { items: { text: string; url: string }[] }) {
  if (!items.length) return null;
  const duration = Math.max(24, items.length * 7);

  const row = (key: string) => (
    <div className="sk-ticker-row" aria-hidden={key === "clone" ? true : undefined}>
      {items.map((it, i) => (
        <span key={`${key}-${i}`} className="inline-flex items-center">
          <a
            href={it.url}
            className="whitespace-nowrap px-1 text-[13px] font-bold tracking-tight text-sk-red hover:underline"
          >
            {it.text}
          </a>
          <span className="px-7 text-neutral-300">•</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="border-b border-sk-line bg-white">
      <div className="flex items-stretch overflow-hidden">
        <span className="flex shrink-0 items-center bg-sk-ink px-4 text-[12px] font-black uppercase tracking-tight text-white">
          Bugün neler oldu?
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
