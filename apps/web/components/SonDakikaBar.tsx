import { newsUrl, type News } from "@/lib/cms";

/** Son dakika işaretli haberler için yanıp sönen kırmızı flaş bandı (kayan başlıklar). */
export function SonDakikaBar({ items }: { items: News[] }) {
  if (!items?.length) return null;

  const Row = ({ clone = false }: { clone?: boolean }) => (
    <div className="sk-ticker-row" aria-hidden={clone || undefined}>
      {items.map((n, i) => (
        <span key={`${clone ? "c" : "o"}-${i}`} className="sk-ticker-item !font-bold">
          <a href={newsUrl(n)} className="text-white">
            {n.title}
          </a>
          <span className="sk-ticker-sep">◆</span>
        </span>
      ))}
    </div>
  );

  const duration = Math.max(24, items.length * 7);

  return (
    <div className="sk-flash border-b border-red-900/40 text-white">
      <div className="mx-auto flex max-w-[1360px] items-stretch px-3 sm:px-4">
        <span className="flex shrink-0 items-center gap-1.5 pr-3 text-[11px] font-black uppercase tracking-wider">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-white" />
          Son Dakika
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
