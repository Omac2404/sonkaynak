import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col items-center justify-center px-4 py-16 text-center">
      <Logo className="mb-6 h-11 w-auto" />
      <div className="text-6xl font-black text-sk-red">404</div>
      <h1 className="mt-3 text-2xl font-black text-sk-ink">Sayfa bulunamadı</h1>
      <p className="mt-2 text-neutral-500">Aradığınız sayfa taşınmış, adı değişmiş veya kaldırılmış olabilir.</p>

      <form action="/ara" className="mt-6 flex w-full max-w-sm items-center">
        <input
          name="q"
          placeholder="Haber ara…"
          className="w-full rounded-l-lg border border-r-0 border-sk-line bg-white px-4 py-2.5 text-sm outline-none focus:border-sk-red"
        />
        <button aria-label="Ara" className="rounded-r-lg bg-sk-red px-4 py-2.5 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/" className="rounded-lg bg-sk-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sk-red">
          Anasayfa
        </a>
        <a href="/tum-kategoriler" className="rounded-lg border border-sk-line px-5 py-2.5 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50">
          Tüm Kategoriler
        </a>
      </div>
    </div>
  );
}
