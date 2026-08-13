/** "Google News'te takip et" kutusu. */
export function GoogleNewsBox() {
  return (
    <a
      href="https://news.google.com/search?q=Son%20Kaynak&hl=tr&gl=TR"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-sk-line bg-white p-4 transition hover:border-sk-red hover:shadow-md"
    >
      <svg width="34" height="34" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
        <path fill="#4285F4" d="M12 4v4l4 1-4 1v9h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-6z" />
        <path fill="#1A73E8" d="M12 4H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6V4z" />
        <path fill="#fff" d="M6.5 8h5v1.3h-5zM6.5 10.5h5v1.3h-5zM6.5 13h3.4v1.3H6.5z" />
      </svg>
      <div className="min-w-0">
        <div className="text-[13px] font-black text-sk-ink transition group-hover:text-sk-red">Google News'te takip et</div>
        <div className="text-xs text-neutral-400">Son Kaynak haberlerini akışınıza ekleyin ›</div>
      </div>
    </a>
  );
}
